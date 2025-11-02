# Calendar 日历选择器

## 介绍

Calendar 日历选择器是一个功能全面的日期选择组件，提供多种选择模式和灵活的配置选项。组件支持单日选择、多日选择、范围选择、周选择、月选择等九种不同的日期选择类型，能够满足各种复杂的日期选择场景需求。组件基于 CalendarView 日历视图组件封装，内置了单元格样式、弹窗管理、类型切换、快捷选项等实用功能，是构建日期选择功能的理想解决方案。

**核心特性：**

- **九种选择类型** - 支持 date（单日）、dates（多日）、datetime（日期时间）、week（周）、month（月）、daterange（日期范围）、datetimerange（日期时间范围）、weekrange（周范围）、monthrange（月范围）九种类型
- **类型切换功能** - 支持在日/周/月三种类型之间动态切换，提升用户体验
- **快捷选项** - 支持自定义快捷选项，快速选择常用日期（今天、昨天、最近7天等）
- **范围选择支持** - 完整的范围选择功能，支持最大范围限制和同一天选择控制
- **自定义格式化** - 支持自定义显示格式化和范围内部显示格式化
- **确认前校验** - 提供 beforeConfirm 钩子函数，支持自定义校验逻辑
- **默认时间设置** - 范围选择时可设置默认时间，精确控制时分秒
- **时间过滤器** - datetime 类型支持时间过滤器，灵活控制可选时间
- **表单集成** - 完整支持表单验证，可与 Form 组件无缝配合
- **内置/独立模式** - 支持内置单元格模式和独立使用模式
- **秒级控制** - datetime 类型可隐藏秒选择，简化时间选择
- **暗黑模式** - 完整支持暗黑主题，自动适配系统主题切换

参考: src/wd/components/wd-calendar/wd-calendar.vue:1-123

## 基本用法

### 单日选择

设置 `type="date"` 选择单个日期，返回13位时间戳。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="单日选择">
      <wd-calendar
        v-model="date1"
        label="选择日期"
        placeholder="请选择"
        title="选择日期"
        @confirm="handleConfirm"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 13位时间戳
const date1 = ref<number>(Date.now())

const handleConfirm = ({ value, type }: any) => {
  console.log('选中日期:', new Date(value))
  console.log('类型:', type)
}
</script>
```

**使用说明：**
- `type="date"` 设置为单日选择模式（默认值）
- `modelValue` 为13位时间戳格式
- 默认显示格式为 `YYYY-MM-DD`
- 可选范围默认为当前月份前后各6个月

参考: src/wd/components/wd-calendar/wd-calendar.vue:206-207, 324-335, 408-411

### 多日选择

设置 `type="dates"` 选择多个日期，返回时间戳数组。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="多日选择">
      <wd-calendar
        v-model="dates1"
        label="选择日期"
        placeholder="请选择"
        title="选择多个日期"
        type="dates"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 时间戳数组
const dates1 = ref<number[]>([])
</script>
```

**使用说明：**
- `type="dates"` 设置为多日选择模式
- `modelValue` 为时间戳数组
- 默认显示格式为多个日期用逗号分隔：`YYYY-MM-DD, YYYY-MM-DD`
- 可以选择任意数量的日期

参考: src/wd/components/wd-calendar/wd-calendar.vue:206-207, 412-417

### 日期时间选择

设置 `type="datetime"` 选择日期和时间，返回13位时间戳。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="日期时间选择">
      <wd-calendar
        v-model="datetime1"
        label="选择日期时间"
        placeholder="请选择"
        title="选择日期时间"
        type="datetime"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const datetime1 = ref<number>(Date.now())
</script>
```

**使用说明：**
- `type="datetime"` 设置为日期时间选择模式
- `modelValue` 为13位时间戳格式
- 默认显示格式为 `YYYY-MM-DD HH:mm:ss`
- 选择日期后会弹出时间选择器

参考: src/wd/components/wd-calendar/wd-calendar.vue:206-207, 424-425

### 周选择

设置 `type="week"` 选择周，返回该周任意一天的时间戳。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="周选择">
      <wd-calendar
        v-model="week1"
        label="选择周"
        placeholder="请选择"
        title="选择周"
        type="week"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const week1 = ref<number>(Date.now())
</script>
```

**使用说明：**
- `type="week"` 设置为周选择模式
- `modelValue` 为该周任意一天的13位时间戳
- 默认显示格式为 `第XX周（YYYY年）`
- 点击任意一天会选中整周

参考: src/wd/components/wd-calendar/wd-calendar.vue:206-207, 430-439

### 月选择

设置 `type="month"` 选择月份，返回该月第一天的时间戳。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="月选择">
      <wd-calendar
        v-model="month1"
        label="选择月份"
        placeholder="请选择"
        title="选择月份"
        type="month"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const month1 = ref<number>(Date.now())
</script>
```

**使用说明：**
- `type="month"` 设置为月选择模式
- `modelValue` 为该月第一天的13位时间戳
- 默认显示格式为 `YYYY / MM`
- 点击任意月份会选中该月

参考: src/wd/components/wd-calendar/wd-calendar.vue:206-207, 464-465

### 日期范围选择

设置 `type="daterange"` 选择日期范围，返回包含开始和结束时间戳的数组。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="日期范围选择">
      <wd-calendar
        v-model="dateRange1"
        label="日期范围"
        placeholder="请选择"
        title="选择日期范围"
        type="daterange"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// [开始时间戳, 结束时间戳]
const dateRange1 = ref<number[]>([])
</script>
```

**使用说明：**
- `type="daterange"` 设置为日期范围选择模式
- `modelValue` 为包含两个时间戳的数组 `[start, end]`
- 默认显示格式为 `开始时间 至 结束时间`
- 点击第一次选择开始日期，第二次选择结束日期

参考: src/wd/components/wd-calendar/wd-calendar.vue:206-207, 418-423

### 日期时间范围选择

设置 `type="datetimerange"` 选择日期时间范围，返回包含开始和结束时间戳的数组。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="日期时间范围选择">
      <wd-calendar
        v-model="datetimeRange1"
        label="日期时间范围"
        placeholder="请选择"
        title="选择日期时间范围"
        type="datetimerange"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const datetimeRange1 = ref<number[]>([])
</script>
```

**使用说明：**
- `type="datetimerange"` 设置为日期时间范围选择模式
- `modelValue` 为包含两个时间戳的数组
- 默认显示格式为两行：开始时间和结束时间分别显示
- 选择日期后会分别为开始和结束时间选择具体时刻

参考: src/wd/components/wd-calendar/wd-calendar.vue:206-207, 426-429

### 周范围选择

设置 `type="weekrange"` 选择周范围，返回包含开始周和结束周的时间戳数组。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="周范围选择">
      <wd-calendar
        v-model="weekRange1"
        label="周范围"
        placeholder="请选择"
        title="选择周范围"
        type="weekrange"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const weekRange1 = ref<number[]>([])
</script>
```

**使用说明：**
- `type="weekrange"` 设置为周范围选择模式
- `modelValue` 为包含两个时间戳的数组
- 默认显示格式为 `第XX周（YYYY年） - 第XX周（YYYY年）`
- 点击任意一天会选中整周

参考: src/wd/components/wd-calendar/wd-calendar.vue:206-207, 441-462

### 月范围选择

设置 `type="monthrange"` 选择月份范围，返回包含开始月和结束月的时间戳数组。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="月范围选择">
      <wd-calendar
        v-model="monthRange1"
        label="月份范围"
        placeholder="请选择"
        title="选择月份范围"
        type="monthrange"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const monthRange1 = ref<number[]>([])
</script>
```

**使用说明：**
- `type="monthrange"` 设置为月范围选择模式
- `modelValue` 为包含两个时间戳的数组
- 默认显示格式为 `YYYY / MM 至 YYYY / MM`
- 点击第一次选择开始月份，第二次选择结束月份

参考: src/wd/components/wd-calendar/wd-calendar.vue:206-207, 466-471

## 高级用法

### 日期范围限制

通过 `min-date` 和 `max-date` 限制可选日期范围。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="日期范围限制">
      <wd-calendar
        v-model="date2"
        label="选择日期"
        placeholder="请选择"
        title="选择日期（未来30天）"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const date2 = ref<number>()

// 最小日期：今天
const minDate = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.getTime()
})

// 最大日期：30天后
const maxDate = computed(() => {
  const future = new Date()
  future.setDate(future.getDate() + 30)
  future.setHours(23, 59, 59, 999)
  return future.getTime()
})
</script>
```

**使用说明：**
- `min-date` 设置最小可选日期（13位时间戳）
- `max-date` 设置最大可选日期（13位时间戳）
- 默认范围为当前月份前后各6个月
- 超出范围的日期会被禁用

参考: src/wd/components/wd-calendar/wd-calendar.vue:208-210, 325-335

### 最大范围限制

范围选择类型支持通过 `max-range` 限制最大可选天数。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="最大范围限制">
      <wd-calendar
        v-model="dateRange2"
        label="日期范围"
        placeholder="请选择"
        title="选择日期范围（最多7天）"
        type="daterange"
        :max-range="7"
        range-prompt="最多选择7天"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dateRange2 = ref<number[]>([])
</script>
```

**使用说明：**
- `max-range` 设置最大可选天数/周数/月数
- `range-prompt` 设置超出范围时的提示文案
- 仅在范围选择类型（daterange/weekrange/monthrange）下生效
- 选择超出范围会显示错误提示

参考: src/wd/components/wd-calendar/wd-calendar.vue:216-218

### 允许选择同一天

范围选择时，通过 `allow-same-day` 允许开始和结束日期为同一天。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="允许选择同一天">
      <wd-calendar
        v-model="dateRange3"
        label="日期范围"
        placeholder="请选择"
        title="选择日期范围"
        type="daterange"
        :allow-same-day="true"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dateRange3 = ref<number[]>([])
</script>
```

**使用说明：**
- `allow-same-day` 为 `true` 时允许选择同一天
- 默认值为 `false`，不允许同一天
- 仅在范围选择类型下生效

参考: src/wd/components/wd-calendar/wd-calendar.vue:220, 337

### 默认时间设置

范围选择时，通过 `default-time` 设置选中日期的具体时刻。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="默认时间设置">
      <wd-calendar
        v-model="dateRange4"
        label="日期范围"
        placeholder="请选择"
        title="选择日期范围"
        type="daterange"
        :default-time="['00:00:00', '23:59:59']"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dateRange4 = ref<number[]>([])
</script>
```

**使用说明：**
- `default-time` 设置选中日期使用的时分秒
- 单值类型为字符串 `HH:mm:ss`，范围类型为包含两个字符串的数组
- 常用于设置开始时间为 `00:00:00`，结束时间为 `23:59:59`
- 仅影响选中后的时间戳，不影响日期选择

参考: src/wd/components/wd-calendar/wd-calendar.vue:222

### 时间过滤器

datetime 类型支持通过 `time-filter` 过滤可选时间。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="时间过滤器">
      <wd-calendar
        v-model="datetime2"
        label="选择日期时间"
        placeholder="请选择"
        title="选择日期时间（工作时间）"
        type="datetime"
        :time-filter="timeFilter"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const datetime2 = ref<number>()

// 时间过滤器：只允许工作时间
const timeFilter = (type: string, values: number[]) => {
  if (type === 'hour') {
    // 只允许9-18点
    return values.filter(value => value >= 9 && value <= 18)
  }
  return values
}
</script>
```

**函数签名：**
```typescript
type CalendarTimeFilter = (
  type: 'hour' | 'minute' | 'second',
  values: number[]
) => number[]
```

**使用说明：**
- 函数接收类型（hour/minute/second）和可选值数组
- 返回过滤后的值数组
- 仅在 `type="datetime"` 或 `type="datetimerange"` 时生效

参考: src/wd/components/wd-calendar/wd-calendar.vue:129-131, 224

### 隐藏秒选择

datetime 类型可以通过 `hide-second` 隐藏秒选择，简化时间选择。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="隐藏秒选择">
      <wd-calendar
        v-model="datetime3"
        label="选择日期时间"
        placeholder="请选择"
        title="选择日期时间"
        type="datetime"
        :hide-second="true"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const datetime3 = ref<number>()
</script>
```

**使用说明：**
- `hide-second` 为 `true` 时隐藏秒选择
- 默认值为 `false`，显示秒选择
- 仅在 `type="datetime"` 或 `type="datetimerange"` 时生效

参考: src/wd/components/wd-calendar/wd-calendar.vue:226, 338

### 类型切换功能

设置 `show-type-switch` 启用类型切换功能，允许在日/周/月之间切换。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="类型切换">
      <wd-calendar
        v-model="switchValue"
        label="选择日期"
        placeholder="请选择"
        title="选择日期"
        type="date"
        :show-type-switch="true"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const switchValue = ref<number>()
</script>
```

**技术实现：**
- 在弹窗顶部显示日/周/月三个 Tab 切换
- 单值类型可在 date/week/month 之间切换
- 范围类型可在 daterange/weekrange/monthrange 之间切换
- 切换时会自动调整选择模式和显示格式

参考: src/wd/components/wd-calendar/wd-calendar.vue:53-58, 266, 349, 620-635, 702-708

### 快捷选项

通过 `shortcuts` 和 `on-shortcuts-click` 提供快捷选项功能。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="快捷选项">
      <wd-calendar
        v-model="date3"
        label="选择日期"
        placeholder="请选择"
        title="选择日期"
        type="date"
        :shortcuts="shortcuts"
        :on-shortcuts-click="handleShortcutClick"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const date3 = ref<number>()

// 快捷选项配置
const shortcuts = [
  { text: '今天' },
  { text: '昨天' },
  { text: '一周前' }
]

// 快捷选项点击处理
const handleShortcutClick = ({ item, index }: any) => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  switch (index) {
    case 0: // 今天
      return now.getTime()
    case 1: // 昨天
      return now.getTime() - 24 * 3600 * 1000
    case 2: // 一周前
      return now.getTime() - 7 * 24 * 3600 * 1000
    default:
      return now.getTime()
  }
}
</script>
```

**函数签名：**
```typescript
type CalendarOnShortcutsClick = (option: {
  item: Record<string, any>
  index: number
}) => number | number[]
```

**使用说明：**
- `shortcuts` 为对象数组，每个对象必须包含 `text` 字段
- `on-shortcuts-click` 函数接收 `{ item, index }` 参数
- 函数返回值为选中的日期（时间戳或时间戳数组）
- 快捷选项显示在弹窗顶部标题下方

参考: src/wd/components/wd-calendar/wd-calendar.vue:60-72, 185-193, 268-271, 350, 759-773

### 自定义显示格式化

通过 `display-format` 自定义顶部显示的日期格式。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="自定义显示格式">
      <wd-calendar
        v-model="date4"
        label="选择日期"
        placeholder="请选择"
        title="选择日期"
        type="date"
        :display-format="formatDisplay"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const date4 = ref<number>()

// 自定义显示格式
const formatDisplay = (value: number, type: string) => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}
</script>
```

**函数签名：**
```typescript
type CalendarDisplayFormat = (
  value: number | number[],
  type: CalendarType
) => string
```

**使用说明：**
- 函数接收选中值（时间戳或时间戳数组）和日历类型
- 返回格式化后的显示字符串
- 只影响顶部显示值，不影响内部逻辑

参考: src/wd/components/wd-calendar/wd-calendar.vue:158, 260-261, 408-473, 527-539

### 范围内部显示格式化

范围选择类型支持通过 `inner-display-format` 自定义内部显示格式。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="范围内部显示格式">
      <wd-calendar
        v-model="dateRange5"
        label="日期范围"
        placeholder="请选择"
        title="选择日期范围"
        type="daterange"
        :inner-display-format="formatInner"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dateRange5 = ref<number[]>([])

// 自定义内部显示格式
const formatInner = (value: number, rangeType: 'start' | 'end', type: string) => {
  if (!value) {
    return rangeType === 'start' ? '请选择开始日期' : '请选择结束日期'
  }

  const date = new Date(value)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}
</script>
```

**函数签名：**
```typescript
type CalendarInnerDisplayFormat = (
  value: number,
  rangeType: 'start' | 'end',
  type: CalendarType
) => string
```

**使用说明：**
- 函数接收单个时间戳、范围类型（start/end）和日历类型
- 返回格式化后的字符串
- 仅在范围选择类型下生效
- 用于格式化面板内部的开始/结束时间显示

参考: src/wd/components/wd-calendar/wd-calendar.vue:163-167, 262-263, 479-506, 512-521

### 确认前校验

通过 `before-confirm` 函数在确认前执行自定义校验逻辑。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="确认前校验">
      <wd-calendar
        v-model="date5"
        label="选择日期"
        placeholder="请选择"
        title="选择日期（只能选择工作日）"
        type="date"
        :before-confirm="validateWorkday"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const date5 = ref<number>()

// 校验是否为工作日
const validateWorkday = ({ value, resolve }: any) => {
  if (!value) {
    resolve(false)
    return
  }

  const date = new Date(value)
  const day = date.getDay()

  if (day === 0 || day === 6) {
    uni.showToast({
      title: '请选择工作日',
      icon: 'none'
    })
    resolve(false)
  } else {
    resolve(true)
  }
}
</script>
```

**函数签名：**
```typescript
type CalendarBeforeConfirm = (option: {
  value: number | number[] | null
  resolve: (isPass: boolean) => void
}) => void
```

**使用说明：**
- 函数接收 `{ value, resolve }` 参数
- 必须调用 `resolve(true)` 才能继续确认
- 调用 `resolve(false)` 会阻止确认
- 可以在函数中执行异步操作

参考: src/wd/components/wd-calendar/wd-calendar.vue:172-180, 274-275, 728-738

### 表单验证

配合 Form 组件使用，支持表单验证功能。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-calendar
        v-model="formData.date"
        label="选择日期"
        placeholder="请选择"
        title="选择日期"
        type="date"
        prop="date"
      />

      <view class="button-group">
        <wd-button type="primary" @click="handleSubmit">
          提交
        </wd-button>
        <wd-button @click="handleReset">
          重置
        </wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd/components/wd-form/wd-form.vue'

const formRef = ref<FormInstance>()

const formData = ref({
  date: undefined
})

const rules = {
  date: [
    { required: true, message: '请选择日期' }
  ]
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('表单验证通过:', formData.value)
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>
```

**使用说明：**
- 必须设置 `prop` 属性，对应 form 的 model 字段名
- 可以通过 `rules` 属性设置组件级验证规则
- 也可以在 form 的 `rules` 中统一配置
- 验证失败时会自动显示错误信息

参考: src/wd/components/wd-calendar/wd-calendar.vue:277-280, 545-572

### 独立使用

设置 `with-cell="false"` 独立使用日历组件，不显示内置单元格。

```vue
<template>
  <view class="demo">
    <!-- 独立使用 -->
    <wd-button @click="openCalendar">
      选择日期
    </wd-button>

    <wd-calendar
      ref="calendarRef"
      v-model="date6"
      title="选择日期"
      type="date"
      :with-cell="false"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CalendarInstance } from '@/wd/components/wd-calendar/wd-calendar.vue'

const calendarRef = ref<CalendarInstance>()
const date6 = ref<number>()

const openCalendar = () => {
  calendarRef.value?.open()
}

const handleConfirm = ({ value }: any) => {
  console.log('选中日期:', new Date(value))
}
</script>
```

**使用说明：**
- `with-cell="false"` 时不显示内置单元格
- 通过 ref 调用 `open` 方法手动打开
- 适用于自定义触发元素的场景

参考: src/wd/components/wd-calendar/wd-calendar.vue:4-37, 289-290, 357, 661-681

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model-value / v-model | 选中值，13位时间戳或时间戳数组 | `number \| number[] \| null` | - |
| type | 日历类型 | `CalendarType` | `'date'` |
| min-date | 最小日期（13位时间戳） | `number` | 当前月-6月 |
| max-date | 最大日期（13位时间戳） | `number` | 当前月+6月 |
| first-day-of-week | 周起始天（0-6，0为周日） | `number` | `0` |
| formatter | 日期格式化函数 | `CalendarFormatter` | - |
| max-range | 最大日期范围（范围选择类型） | `number` | - |
| range-prompt | 超出范围提示文案 | `string` | - |
| allow-same-day | 是否允许选择同一天（范围选择） | `boolean` | `false` |
| default-time | 选中日期的默认时间 | `string \| string[]` | - |
| time-filter | 时间过滤器（datetime类型） | `CalendarTimeFilter` | - |
| hide-second | 是否隐藏秒选择（datetime类型） | `boolean` | `false` |
| label | 选择器左侧文案 | `string` | - |
| label-width | 设置左侧标题宽度 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| placeholder | 选择器占位符 | `string` | `'请选择'` |
| title | 弹出层标题 | `string` | - |
| align-right | 选择器的值靠右展示 | `boolean` | `false` |
| error | 是否为错误状态 | `boolean` | `false` |
| required | 是否显示必填标识 | `boolean` | `false` |
| size | 选择器大小 | `string` | - |
| center | 是否垂直居中 | `boolean` | `false` |
| ellipsis | 是否超出隐藏 | `boolean` | `false` |
| close-on-click-modal | 点击遮罩是否关闭 | `boolean` | `true` |
| z-index | 弹窗层级 | `number` | `100` |
| show-confirm | 是否显示确定按钮 | `boolean` | `true` |
| confirm-text | 确定按钮文字 | `string` | `'确定'` |
| display-format | 自定义展示文案的格式化函数 | `CalendarDisplayFormat` | - |
| inner-display-format | 自定义范围内部显示格式化函数 | `CalendarInnerDisplayFormat` | - |
| show-type-switch | 是否显示类型切换功能 | `boolean` | `false` |
| shortcuts | 快捷选项数组 | `Record<string, any>[]` | `[]` |
| on-shortcuts-click | 快捷操作点击回调 | `CalendarOnShortcutsClick` | - |
| safe-area-inset-bottom | 是否设置底部安全距离 | `boolean` | `true` |
| before-confirm | 确认前校验函数 | `CalendarBeforeConfirm` | - |
| immediate-change | 是否立即触发change事件 | `boolean` | `false` |
| with-cell | 是否使用内置单元格 | `boolean` | `true` |
| prop | 表单域 model 字段名 | `string` | - |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| custom-style | 自定义根节点样式 | `string` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-view-class | 自定义视图样式类 | `string` | - |
| custom-label-class | 自定义label样式类 | `string` | - |
| custom-value-class | 自定义value样式类 | `string` | - |

参考: src/wd/components/wd-calendar/wd-calendar.vue:198-291, 321-359

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 选中值变化时触发 | `value: number \| number[] \| null` |
| change | 选中值改变时触发 | `{ value: number \| number[] \| null }` |
| confirm | 确认选择时触发 | `{ value: number \| number[] \| null, type: CalendarType }` |
| cancel | 取消选择时触发 | - |
| open | 打开选择器时触发 | - |

参考: src/wd/components/wd-calendar/wd-calendar.vue:296-308

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 完全自定义选择器内容 |
| label | 自定义标签内容 |

参考: src/wd/components/wd-calendar/wd-calendar.vue:5, 19

### Methods

组件通过 ref 暴露以下方法：

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开日历选择器弹窗 | - | `void` |
| close | 关闭日历选择器弹窗 | - | `void` |

**使用示例：**

```vue
<template>
  <view>
    <wd-calendar ref="calendarRef" v-model="date" :with-cell="false" />
    <wd-button @click="openCalendar">打开日历</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CalendarInstance } from '@/wd/components/wd-calendar/wd-calendar.vue'

const calendarRef = ref<CalendarInstance>()
const date = ref<number>()

const openCalendar = () => {
  calendarRef.value?.open()
}
</script>
```

参考: src/wd/components/wd-calendar/wd-calendar.vue:313-318, 661-696, 776-779

### 类型定义

```typescript
/**
 * 日历类型
 */
export type CalendarType =
  | 'date'           // 单日选择
  | 'dates'          // 多日选择
  | 'datetime'       // 日期时间选择
  | 'week'           // 周选择
  | 'month'          // 月选择
  | 'daterange'      // 日期范围
  | 'datetimerange'  // 日期时间范围
  | 'weekrange'      // 周范围
  | 'monthrange'     // 月范围

/**
 * 日期格式化函数类型
 */
export type CalendarFormatter = (
  day: CalendarDayItem
) => CalendarDayItem

/**
 * 时间过滤器函数类型
 */
export type CalendarTimeFilter = (
  type: 'hour' | 'minute' | 'second',
  values: number[]
) => number[]

/**
 * 显示格式化函数类型
 */
type CalendarDisplayFormat = (
  value: number | number[],
  type: CalendarType
) => string

/**
 * 范围内部显示格式化函数类型
 */
type CalendarInnerDisplayFormat = (
  value: number,
  rangeType: 'start' | 'end',
  type: CalendarType
) => string

/**
 * 确认前校验函数类型
 */
type CalendarBeforeConfirm = (option: {
  value: number | number[] | null
  resolve: (isPass: boolean) => void
}) => void

/**
 * 快捷操作点击函数类型
 */
type CalendarOnShortcutsClick = (option: {
  item: Record<string, any>
  index: number
}) => number | number[]

/**
 * 日历组件实例类型
 */
export type CalendarInstance = ComponentPublicInstance<
  WdCalendarProps,
  WdCalendarExpose
>
```

参考: src/wd/components/wd-calendar/wd-calendar.vue:127-193, 781-782

## 主题定制

### CSS 变量

Calendar 组件使用了以下 CSS 变量，可以通过覆盖这些变量来定制样式：

```scss
// 单元格相关变量
$-cell-padding: 32rpx;
$-cell-wrapper-padding: 24rpx 0;
$-cell-title-color: #262626;
$-cell-title-fs: 28rpx;
$-cell-title-fs-large: 32rpx;
$-cell-line-height: 40rpx;
$-cell-value-color: #909399;
$-cell-icon-size: 32rpx;
$-cell-icon-size-large: 36rpx;
$-cell-arrow-color: #c5c5c5;
$-cell-required-size: 28rpx;
$-cell-required-color: #fa4350;

// 输入框相关变量
$-input-cell-label-width: 160rpx;
$-input-placeholder-color: #c5c5c5;
$-input-disabled-color: #c5c5c5;
$-input-error-color: #fa4350;

// ActionSheet 相关变量
$-action-sheet-color: #323233;
$-action-sheet-title-height: 112rpx;
$-action-sheet-title-fs: 32rpx;
$-action-sheet-weight: 500;
$-action-sheet-close-top: 40rpx;
$-action-sheet-close-right: 40rpx;
$-action-sheet-close-color: #909399;
$-action-sheet-close-fs: 48rpx;

// 表单相关变量
$-form-item-error-message-color: #fa4350;
$-form-item-error-message-font-size: 24rpx;
$-form-item-error-message-line-height: 1.2;

// 其他变量
$-color-white: #fff;
```

参考: src/wd/components/wd-calendar/wd-calendar.vue:786-788

### 暗黑模式

Calendar 组件完整支持暗黑模式，在 `wot-theme-dark` 类下会自动应用暗黑主题样式：

```scss
.wot-theme-dark {
  .wd-calendar {
    // 单元格背景和文字
    .wd-calendar__cell {
      background-color: $-dark-background2;
      color: $-dark-color;
    }

    // 标签和值
    .wd-calendar__label,
    .wd-calendar__value,
    .wd-calendar__title {
      color: $-dark-color;
    }

    // 图标
    .wd-calendar__arrow,
    .wd-calendar__close {
      color: $-dark-color;
    }

    // 边框
    &.is-border .wd-calendar__cell {
      border-color: $-dark-border-color;
    }

    // 范围标签
    .wd-calendar__range-label-item {
      color: $-dark-color;

      &.is-placeholder {
        color: $-dark-color-gray;
      }
    }

    .wd-calendar__range-sperator {
      color: $-dark-color-gray;
    }
  }
}
```

参考: src/wd/components/wd-calendar/wd-calendar.vue:791-833

### 自定义样式类

组件提供多个自定义样式类属性：

```vue
<template>
  <wd-calendar
    v-model="date"
    type="date"
    custom-class="my-calendar"
    custom-view-class="my-view"
    custom-label-class="my-label"
    custom-value-class="my-value"
  />
</template>

<style lang="scss">
.my-calendar {
  // 自定义根节点样式
}

.my-view {
  // 自定义视图样式
}

.my-label {
  // 自定义标签样式
  color: #4D80F0;
}

.my-value {
  // 自定义值样式
  font-weight: 500;
}
</style>
```

参考: src/wd/components/wd-calendar/wd-calendar.vue:200-202, 281-286

## 最佳实践

### 1. 合理选择日历类型

根据业务场景选择合适的日历类型，避免类型滥用。

```vue
<!-- ✅ 推荐：只需选择一天使用 date -->
<wd-calendar
  v-model="birthday"
  label="出生日期"
  type="date"
/>

<!-- ✅ 推荐：需要选择多个不连续日期使用 dates -->
<wd-calendar
  v-model="holidays"
  label="假期日期"
  type="dates"
/>

<!-- ✅ 推荐：需要选择时间段使用 daterange -->
<wd-calendar
  v-model="tripDate"
  label="出行日期"
  type="daterange"
/>

<!-- ❌ 不推荐：只需要日期却使用 datetime -->
<wd-calendar
  v-model="birthday"
  label="出生日期"
  type="datetime"
/>
```

**原因：**
- 使用合适的类型可以减少用户操作步骤
- 不同类型的 modelValue 格式和显示方式不同
- 避免提供不必要的选择选项

### 2. 设置合理的日期范围

通过 min-date 和 max-date 限制可选范围，防止无效选择。

```vue
<!-- ✅ 推荐：出生日期限制不能超过今天 -->
<wd-calendar
  v-model="birthday"
  label="出生日期"
  type="date"
  :max-date="Date.now()"
  :min-date="new Date(1900, 0, 1).getTime()"
/>

<!-- ✅ 推荐：预约日期只能选择未来 -->
<wd-calendar
  v-model="appointmentDate"
  label="预约日期"
  type="date"
  :min-date="Date.now()"
  :max-date="Date.now() + 90 * 24 * 3600 * 1000"
/>

<!-- ❌ 不推荐：无限制范围 -->
<wd-calendar
  v-model="birthday"
  label="出生日期"
  type="date"
/>
```

**原因：**
- 合理的范围限制可以引导用户做出正确选择
- 防止用户选择过早或过晚的日期
- 提升用户体验，减少滚动查找时间

### 3. 范围选择的默认时间设置

范围选择时合理设置 default-time，确保时间范围准确。

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐：设置开始时间为00:00:00，结束时间为23:59:59 -->
    <wd-calendar
      v-model="dateRange"
      label="日期范围"
      type="daterange"
      :default-time="['00:00:00', '23:59:59']"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dateRange = ref<number[]>([])
</script>
```

**原因：**
- 不设置 default-time 时，开始和结束时间默认都是 00:00:00
- 设置结束时间为 23:59:59 可以包含整天的数据
- 常用于数据查询、统计等需要精确时间范围的场景

### 4. 快捷选项的合理使用

提供常用的快捷选项，提升用户选择效率。

```vue
<template>
  <wd-calendar
    v-model="dateRange"
    label="日期范围"
    type="daterange"
    :shortcuts="shortcuts"
    :on-shortcuts-click="handleShortcutClick"
    :default-time="['00:00:00', '23:59:59']"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dateRange = ref<number[]>([])

// ✅ 推荐：提供常用的快捷选项
const shortcuts = [
  { text: '今天' },
  { text: '昨天' },
  { text: '最近7天' },
  { text: '最近30天' },
  { text: '本月' },
  { text: '上月' }
]

const handleShortcutClick = ({ item, index }: any) => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const today = now.getTime()

  switch (index) {
    case 0: // 今天
      return [today, today + 24 * 3600 * 1000 - 1]
    case 1: // 昨天
      return [today - 24 * 3600 * 1000, today - 1]
    case 2: // 最近7天
      return [today - 6 * 24 * 3600 * 1000, today + 24 * 3600 * 1000 - 1]
    case 3: // 最近30天
      return [today - 29 * 24 * 3600 * 1000, today + 24 * 3600 * 1000 - 1]
    case 4: // 本月
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      return [monthStart, today + 24 * 3600 * 1000 - 1]
    case 5: // 上月
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime()
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime()
      return [lastMonthStart, lastMonthEnd]
    default:
      return [today, today]
  }
}
</script>
```

**原因：**
- 快捷选项可以显著提升常用日期的选择效率
- 提供符合业务场景的快捷选项
- 注意快捷选项的时间计算要准确

### 5. 确认前校验的最佳实践

使用 beforeConfirm 进行业务逻辑校验。

```vue
<template>
  <wd-calendar
    v-model="leaveDate"
    label="请假日期"
    type="daterange"
    :before-confirm="validateLeave"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const leaveDate = ref<number[]>([])

// ✅ 推荐：校验业务逻辑
const validateLeave = ({ value, resolve }: any) => {
  if (!value || !value[0] || !value[1]) {
    resolve(false)
    return
  }

  const [start, end] = value
  const days = Math.ceil((end - start) / (24 * 3600 * 1000))

  // 检查请假天数
  if (days > 30) {
    uni.showToast({
      title: '请假天数不能超过30天',
      icon: 'none'
    })
    resolve(false)
    return
  }

  // 检查是否跨年
  const startYear = new Date(start).getFullYear()
  const endYear = new Date(end).getFullYear()

  if (startYear !== endYear) {
    uni.showModal({
      title: '提示',
      content: '请假跨年需要分开申请',
      success: (res) => {
        resolve(res.confirm)
      }
    })
  } else {
    resolve(true)
  }
}
</script>
```

**原因：**
- beforeConfirm 可以执行复杂的业务逻辑校验
- 支持异步操作（如弹窗确认）
- 校验失败时给用户明确的提示信息

## 常见问题

### 1. 范围选择时开始时间大于结束时间

**问题描述：**

范围选择类型初始值设置不当，导致开始时间大于结束时间。

```vue
<!-- 问题代码 -->
<script lang="ts" setup>
// ❌ 结束时间小于开始时间
const dateRange = ref<number[]>([
  Date.now(),
  Date.now() - 7 * 24 * 3600 * 1000
])
</script>
```

**问题原因：**
- 初始值不合法会导致显示异常
- 组件内部有边界检查逻辑，但初始值仍需保证合法

**解决方案：**

```vue
<script lang="ts" setup>
// ✅ 确保开始时间 <= 结束时间
const dateRange = ref<number[]>([
  Date.now() - 7 * 24 * 3600 * 1000,
  Date.now()
])

// 或者使用计算属性自动排序
const dateRange = computed({
  get: () => internalRange.value,
  set: (value: number[]) => {
    internalRange.value = value.sort((a, b) => a - b)
  }
})
</script>
```

参考: src/wd/components/wd-calendar/wd-calendar.vue:606-614

### 2. 类型切换后值格式不匹配

**问题描述：**

使用类型切换功能时，切换后的类型与 modelValue 格式不匹配。

```vue
<!-- 问题代码 -->
<wd-calendar
  v-model="value"
  type="date"
  :show-type-switch="true"
/>

<script lang="ts" setup>
// ❌ 单值格式，切换到范围类型后会异常
const value = ref<number>(Date.now())
</script>
```

**问题原因：**
- 单值类型（date/week/month）的 modelValue 为 number
- 范围类型（daterange/weekrange/monthrange）的 modelValue 为 number[]
- 类型切换后格式不匹配会导致显示异常

**解决方案：**

```vue
<script lang="ts" setup>
// ✅ 使用 null 或兼容两种格式的类型
const value = ref<number | number[] | null>(null)

// 或者监听类型变化，动态调整值格式
const handleConfirm = ({ value, type }: any) => {
  // 根据 type 判断值的格式
  if (type.includes('range')) {
    // 范围类型
    console.log('范围:', value)
  } else {
    // 单值类型
    console.log('单值:', value)
  }
}
</script>
```

参考: src/wd/components/wd-calendar/wd-calendar.vue:204-205, 620-635

### 3. 快捷选项返回值格式错误

**问题描述：**

快捷选项回调函数返回的值格式与当前日历类型不匹配。

```vue
<!-- 问题代码 -->
<wd-calendar
  v-model="dateRange"
  type="daterange"
  :shortcuts="shortcuts"
  :on-shortcuts-click="handleShortcutClick"
/>

<script lang="ts" setup>
const dateRange = ref<number[]>([])

// ❌ 范围类型应该返回数组，但只返回单个值
const handleShortcutClick = ({ item, index }: any) => {
  return Date.now() // 错误：应该返回数组
}
</script>
```

**问题原因：**
- 单值类型需要返回 number
- 范围类型需要返回 number[]
- 返回格式错误会导致确认按钮禁用或显示异常

**解决方案：**

```vue
<script lang="ts" setup>
// ✅ 根据类型返回正确格式
const handleShortcutClick = ({ item, index }: any) => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const today = now.getTime()

  // 范围类型返回数组
  switch (index) {
    case 0: // 今天
      return [today, today + 24 * 3600 * 1000 - 1]
    case 1: // 最近7天
      return [today - 6 * 24 * 3600 * 1000, today + 24 * 3600 * 1000 - 1]
    default:
      return [today, today]
  }
}
</script>
```

参考: src/wd/components/wd-calendar/wd-calendar.vue:759-773

### 4. 确认按钮一直禁用

**问题描述：**

范围选择或多日选择时，确认按钮一直处于禁用状态。

**问题原因：**
- 范围类型必须选择完整的开始和结束日期
- dates 类型必须至少选择一个日期
- `getConfirmBtnStatus` 方法会检查值的完整性

**解决方案：**

```vue
<template>
  <!-- ✅ 确保用户选择完整 -->
  <wd-calendar
    v-model="dateRange"
    type="daterange"
    title="请选择开始和结束日期"
  />
</template>

<script lang="ts" setup>
const dateRange = ref<number[]>([])

// 监听值变化，检查是否完整
watch(dateRange, (value) => {
  if (value && value[0] && value[1]) {
    console.log('选择完整')
  } else {
    console.log('选择未完整')
  }
})
</script>
```

参考: src/wd/components/wd-calendar/wd-calendar.vue:588-600

### 5. 表单验证不生效

**问题描述：**

与 Form 组件配合使用时，验证规则不生效。

```vue
<!-- 问题代码 -->
<wd-form :model="formData" :rules="rules">
  <!-- ❌ 缺少 prop 属性 -->
  <wd-calendar
    v-model="formData.date"
    label="选择日期"
    type="date"
  />
</wd-form>
```

**问题原因：**
- 缺少 `prop` 属性，无法关联表单字段
- `errorMessage` 和 `isRequired` 计算属性依赖 `prop`

**解决方案：**

```vue
<wd-form ref="formRef" :model="formData" :rules="rules">
  <!-- ✅ 添加 prop 属性 -->
  <wd-calendar
    v-model="formData.date"
    label="选择日期"
    type="date"
    prop="date"
  />
</wd-form>

<script lang="ts" setup>
const formData = ref({
  date: null
})

const rules = {
  date: [
    { required: true, message: '请选择日期' }
  ]
}
</script>
```

参考: src/wd/components/wd-calendar/wd-calendar.vue:277-280, 545-572

## 注意事项

1. **值格式要求**：modelValue 必须为13位时间戳或时间戳数组，10位时间戳会导致日期计算错误

2. **类型与值的匹配**：单值类型使用 number，范围类型使用 number[]，多日选择使用 number[]

3. **日期范围默认值**：minDate 和 maxDate 默认为当前月份前后各6个月，根据需要自行设置

4. **范围选择顺序**：范围类型点击第一次选择开始，第二次选择结束，顺序固定

5. **快捷选项返回值**：必须与当前日历类型的值格式匹配（单值或数组）

6. **类型切换限制**：showTypeSwitch 只能在 date/week/month 或 daterange/weekrange/monthrange 之间切换

7. **默认时间格式**：defaultTime 必须是 `HH:mm:ss` 格式的字符串或字符串数组

8. **确认按钮状态**：范围类型必须选择完整才能确认，通过 `getConfirmBtnStatus` 方法判断

9. **表单验证关联**：与 Form 配合时必须设置 `prop` 属性

10. **时间过滤器限制**：timeFilter 仅在 datetime 和 datetimerange 类型下生效

11. **独立使用模式**：withCell 为 false 时需要通过 ref 手动调用 open 方法

12. **formatter 函数**：接收的是日期对象，不是时间戳，注意参数类型

---

Calendar 日历选择器组件提供了全面的日期选择功能，支持九种选择类型和丰富的配置选项。合理使用组件的各项功能和高级特性，能够构建出功能强大、用户体验优秀的日期选择功能。
