# DatetimePicker 日期时间选择器

## 介绍

DatetimePicker 日期时间选择器是一个功能全面的日期时间选择组件，基于 DatetimePickerView 组件封装，内部自动构建日期时间选项列表。组件支持年、年月、日期、时间、日期时间五种选择类型，并提供区域选择（范围选择）模式，能够满足各种复杂的日期时间选择需求。组件集成了丰富的配置选项，包括自定义过滤、格式化、确认前校验等高级特性，是构建日期时间选择功能的理想解决方案。

**核心特性：**

- **五种选择类型** - 支持 date（日期）、year-month（年月）、time（时间）、datetime（日期时间）、year（年份）五种类型
- **区域选择模式** - 支持日期时间范围选择，通过传入数组类型的 modelValue 自动启用
- **智能边界控制** - 区域选择时自动处理开始和结束时间的边界关系，防止选择无效范围
- **自定义过滤器** - 通过 filter 函数自定义可选日期时间范围，灵活控制选项
- **自定义格式化** - 支持 formatter（选项格式化）和 displayFormat（显示格式化）两种格式化方式
- **确认前校验** - 提供 beforeConfirm 钩子函数，支持异步校验和自定义处理逻辑
- **秒级精度** - 支持启用秒选择，满足高精度时间选择需求
- **加载状态** - 支持异步数据加载场景，内置加载状态管理
- **表单集成** - 完整支持表单验证，可与 Form 组件无缝配合
- **默认值支持** - 支持设置默认日期，打开面板时自动定位到指定日期
- **即时响应** - 支持手指松开时立即触发 change 事件，提升交互体验
- **暗黑模式** - 完整支持暗黑主题，自动适配系统主题切换

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:1-165

## 基本用法

### 日期选择

设置 `type="date"` 选择年月日，返回时间戳格式。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="日期选择">
      <wd-datetime-picker
        v-model="date1"
        label="选择日期"
        placeholder="请选择"
        title="选择日期"
        type="date"
        @confirm="handleConfirm"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 时间戳格式
const date1 = ref<number>(Date.now())

const handleConfirm = ({ value }: { value: number }) => {
  console.log('选中日期:', new Date(value))
}
</script>
```

**使用说明：**
- `type="date"` 设置为日期选择模式，只显示年、月、日三列
- `modelValue` 为时间戳格式（毫秒级）
- 默认显示格式为 `YYYY-MM-DD`
- 可选范围默认为当前年份前后各10年

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:268, 365-367, 682-686

### 年月选择

设置 `type="year-month"` 选择年月，返回时间戳格式。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="年月选择">
      <wd-datetime-picker
        v-model="date2"
        label="选择年月"
        placeholder="请选择"
        title="选择年月"
        type="year-month"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const date2 = ref<number>(Date.now())
</script>
```

**使用说明：**
- `type="year-month"` 设置为年月选择模式，只显示年、月两列
- `modelValue` 为时间戳格式
- 默认显示格式为 `YYYY-MM`
- 选中日期为该月的第一天

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:268, 687-688

### 时间选择

设置 `type="time"` 选择时分，返回字符串格式 `HH:mm`。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="时间选择">
      <wd-datetime-picker
        v-model="time1"
        label="选择时间"
        placeholder="请选择"
        title="选择时间"
        type="time"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 字符串格式 HH:mm
const time1 = ref('12:30')
</script>
```

**使用说明：**
- `type="time"` 设置为时间选择模式，显示时、分两列
- `modelValue` 为字符串格式 `HH:mm`
- 默认显示格式为 `HH:mm`
- 小时范围默认 0-23，分钟范围默认 0-59

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:268, 368-371, 689-692

### 日期时间选择

设置 `type="datetime"` 选择完整的日期时间，返回时间戳格式。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="日期时间选择">
      <wd-datetime-picker
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
- `type="datetime"` 设置为日期时间选择模式，显示年、月、日、时、分五列
- `modelValue` 为时间戳格式
- 默认显示格式为 `YYYY-MM-DD HH:mm`
- 综合了日期和时间选择功能

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:268, 365, 693-696

### 年份选择

设置 `type="year"` 仅选择年份，返回时间戳格式。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="年份选择">
      <wd-datetime-picker
        v-model="year1"
        label="选择年份"
        placeholder="请选择"
        title="选择年份"
        type="year"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const year1 = ref<number>(Date.now())
</script>
```

**使用说明：**
- `type="year"` 设置为年份选择模式，只显示年份一列
- `modelValue` 为时间戳格式
- 默认显示格式为年份数字
- 选中日期为该年的1月1日

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:268, 683-684

### 日期范围限制

通过 `min-date` 和 `max-date` 设置可选日期范围。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="日期范围限制">
      <wd-datetime-picker
        v-model="date3"
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

const date3 = ref<number>(Date.now())

// 当前时间
const now = new Date()

// 最小日期：今天
const minDate = computed(() => now.getTime())

// 最大日期：30天后
const maxDate = computed(() => {
  const future = new Date(now)
  future.setDate(future.getDate() + 30)
  return future.getTime()
})
</script>
```

**使用说明：**
- `min-date` 设置最小可选日期（时间戳）
- `max-date` 设置最大可选日期（时间戳）
- 默认范围为当前年份前后各10年
- 超出范围的日期会被禁用

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:269-272, 366-367

### 时间范围限制

时间类型支持通过 `min-hour`、`max-hour`、`min-minute`、`max-minute` 限制时间范围。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="时间范围限制">
      <wd-datetime-picker
        v-model="time2"
        label="选择时间"
        placeholder="请选择"
        title="选择时间（工作时间）"
        type="time"
        :min-hour="9"
        :max-hour="18"
        :min-minute="0"
        :max-minute="59"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const time2 = ref('09:00')
</script>
```

**使用说明：**
- `min-hour` / `max-hour` 限制小时范围，默认 0-23
- `min-minute` / `max-minute` 限制分钟范围，默认 0-59
- 仅在 `type="time"` 或 `type="datetime"` 时生效
- 可以灵活组合使用

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:273-280, 368-371

### 秒级精度

设置 `use-second` 启用秒选择，支持更高精度的时间选择。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="秒级精度">
      <!-- 时间选择（精确到秒） -->
      <wd-datetime-picker
        v-model="time3"
        label="选择时间"
        placeholder="请选择"
        title="选择时间（精确到秒）"
        type="time"
        :use-second="true"
        :min-second="0"
        :max-second="59"
      />

      <!-- 日期时间选择（精确到秒） -->
      <wd-datetime-picker
        v-model="datetime2"
        label="选择日期时间"
        placeholder="请选择"
        title="选择日期时间（精确到秒）"
        type="datetime"
        :use-second="true"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 时间格式变为 HH:mm:ss
const time3 = ref('12:30:45')

const datetime2 = ref<number>(Date.now())
</script>
```

**使用说明：**
- `use-second` 为 `true` 时启用秒选择
- 仅在 `type="time"` 和 `type="datetime"` 时生效
- 时间类型的 modelValue 格式变为 `HH:mm:ss`
- 可通过 `min-second` 和 `max-second` 限制秒数范围

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:281-286, 372-374, 690-696

### 禁用和只读

设置 `disabled` 或 `readonly` 禁止用户操作。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="禁用和只读">
      <!-- 禁用状态 -->
      <wd-datetime-picker
        v-model="date4"
        label="禁用状态"
        type="date"
        disabled
      />

      <!-- 只读状态 -->
      <wd-datetime-picker
        v-model="date5"
        label="只读状态"
        type="date"
        readonly
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const date4 = ref<number>(Date.now())
const date5 = ref<number>(Date.now())
</script>
```

**使用说明：**
- `disabled` 为 `true` 时禁用选择器，值显示为灰色
- `readonly` 为 `true` 时只读，值显示为正常颜色
- 两种状态都无法打开选择面板
- 在 `showPopup` 方法中会检查这两个状态

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:229-232, 779

## 高级用法

### 区域选择

传入数组类型的 `modelValue` 自动启用区域选择模式，用于选择日期或时间范围。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="区域选择">
      <!-- 日期范围 -->
      <wd-datetime-picker
        v-model="dateRange"
        label="日期范围"
        placeholder="请选择"
        title="选择日期范围"
        type="date"
        @confirm="handleRangeConfirm"
      />

      <!-- 时间范围 -->
      <wd-datetime-picker
        v-model="timeRange"
        label="时间范围"
        placeholder="请选择"
        title="选择时间范围"
        type="time"
      />

      <!-- 日期时间范围 -->
      <wd-datetime-picker
        v-model="datetimeRange"
        label="日期时间范围"
        placeholder="请选择"
        title="选择日期时间范围"
        type="datetime"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 数组格式自动启用区域选择
const dateRange = ref<number[]>([Date.now(), Date.now() + 7 * 24 * 3600 * 1000])
const timeRange = ref<string[]>(['09:00', '18:00'])
const datetimeRange = ref<number[]>([Date.now(), Date.now() + 3 * 3600 * 1000])

const handleRangeConfirm = ({ value }: { value: number[] }) => {
  console.log('开始日期:', new Date(value[0]))
  console.log('结束日期:', new Date(value[1]))
}
</script>
```

**技术实现：**
- 组件通过 `isArray(modelValue)` 判断是否启用区域选择模式
- 区域选择模式下显示开始/结束两个 Tab 切换选择
- 开始时间和结束时间分别由两个 DatetimePickerView 实例管理
- 自动处理边界关系，防止选择无效范围（开始时间 > 结束时间）
- 通过 `customColumnFormatter` 为超出边界的选项添加禁用状态

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:28-44, 91-100, 1018-1021, 615-645

### 自定义过滤器

通过 `filter` 函数自定义可选日期时间范围，实现复杂的过滤逻辑。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="自定义过滤器">
      <!-- 只允许选择工作日 -->
      <wd-datetime-picker
        v-model="date6"
        label="选择工作日"
        placeholder="请选择"
        title="选择工作日（周一至周五）"
        type="date"
        :filter="filterWeekday"
      />

      <!-- 只允许选择每月10号、20号、30号 -->
      <wd-datetime-picker
        v-model="date7"
        label="选择发薪日"
        placeholder="请选择"
        title="选择发薪日"
        type="date"
        :filter="filterPayday"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerViewColumnType } from '@/wd/components/wd-datetime-picker-view/wd-datetime-picker-view.vue'

const date6 = ref<number>(Date.now())
const date7 = ref<number>(Date.now())

// 过滤器：只允许工作日
const filterWeekday = (type: DatetimePickerViewColumnType, values: number[]) => {
  if (type === 'date') {
    return values.filter(value => {
      // 计算是星期几（0=周日, 1-6=周一至周六）
      const date = new Date(2024, 0, value) // 使用任意年月
      const day = date.getDay()
      return day >= 1 && day <= 5 // 周一至周五
    })
  }
  return values
}

// 过滤器：只允许10号、20号、30号
const filterPayday = (type: DatetimePickerViewColumnType, values: number[]) => {
  if (type === 'date') {
    return values.filter(value => [10, 20, 30].includes(value))
  }
  return values
}
</script>
```

**函数签名：**
```typescript
type DatetimePickerViewFilter = (
  type: DatetimePickerViewColumnType,
  values: number[]
) => number[]
```

**使用说明：**
- 函数接收列类型（year/month/date/hour/minute/second）和可选值数组
- 返回过滤后的值数组
- 可以基于当前已选值进行动态过滤
- 组件会在初始化时验证函数类型

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:172-173, 287-288, 1048-1055

### 自定义选项格式化

通过 `formatter` 函数自定义选择器内部选项的显示文本。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="自定义选项格式化">
      <wd-datetime-picker
        v-model="date8"
        label="选择日期"
        placeholder="请选择"
        title="选择日期"
        type="date"
        :formatter="formatOption"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerViewColumnType } from '@/wd/components/wd-datetime-picker-view/wd-datetime-picker-view.vue'

const date8 = ref<number>(Date.now())

// 格式化选项文本
const formatOption = (type: DatetimePickerViewColumnType, value: number) => {
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
      return String(value)
  }
}
</script>
```

**函数签名：**
```typescript
type DatetimePickerViewFormatter = (
  type: DatetimePickerViewColumnType,
  value: number
) => string
```

**使用说明：**
- 函数接收列类型和值，返回格式化后的字符串
- 只影响选择器内部选项的显示，不影响顶部显示值
- 使用 `formatter` 后，`displayFormat` 需要手动处理格式化逻辑
- 组件会在初始化时验证函数类型

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:173, 289-290, 639, 1057-1065

### 自定义显示格式化

通过 `display-format` 函数自定义顶部显示的日期时间格式。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="自定义显示格式化">
      <!-- 中文格式 -->
      <wd-datetime-picker
        v-model="date9"
        label="选择日期"
        placeholder="请选择"
        title="选择日期"
        type="date"
        :display-format="displayChinese"
      />

      <!-- 斜杠分隔 -->
      <wd-datetime-picker
        v-model="datetime3"
        label="选择时间"
        placeholder="请选择"
        title="选择时间"
        type="datetime"
        :display-format="displaySlash"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const date9 = ref<number>(Date.now())
const datetime3 = ref<number>(Date.now())

// 中文格式
const displayChinese = (items: Record<string, any>[]) => {
  if (!items || items.length === 0) return ''
  return `${items[0].label}年${items[1].label}月${items[2].label}日`
}

// 斜杠分隔格式
const displaySlash = (items: Record<string, any>[]) => {
  if (!items || items.length === 0) return ''
  const [year, month, day, hour, minute] = items
  return `${year.label}/${month.label}/${day.label} ${hour.label}:${minute.label}`
}
</script>
```

**函数签名：**
```typescript
type DatetimePickerDisplayFormat = (
  items: Record<string, any>[]
) => string
```

**使用说明：**
- 函数接收选中项数组，每项包含 `{ value, label }` 结构
- 返回格式化后的显示字符串
- 只影响顶部显示值，不影响选择器内部选项
- 使用 `formatter` 后，默认 `displayFormat` 会失效，需要手动提供

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:200, 292, 653-698, 1037-1045

### 区域选择 Tab 标签格式化

区域选择模式下，通过 `display-format-tab-label` 自定义 Tab 标签的显示格式。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="Tab 标签格式化">
      <wd-datetime-picker
        v-model="dateRange2"
        label="日期范围"
        placeholder="请选择"
        title="选择日期范围"
        type="date"
        :display-format-tab-label="formatTabLabel"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dateRange2 = ref<number[]>([Date.now(), Date.now() + 7 * 24 * 3600 * 1000])

// 格式化 Tab 标签
const formatTabLabel = (items: Record<string, any>[]) => {
  if (!items || items.length === 0) return ''
  return `${items[1].label}/${items[2].label}`
}
</script>
```

**函数签名：**
```typescript
type DatetimePickerDisplayFormatTabLabel = (
  items: Record<string, any>[]
) => string
```

**使用说明：**
- 仅在区域选择模式下生效
- 函数接收选中项数组，返回格式化后的字符串
- Tab 标签显示在面板顶部的"开始"和"结束"区域
- 组件会在初始化时验证函数类型

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:214, 295-296, 656-658, 1077-1085

### 确认前校验

通过 `before-confirm` 函数在确认前执行自定义校验逻辑。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="确认前校验">
      <!-- 限制只能选择未来日期 -->
      <wd-datetime-picker
        v-model="date10"
        label="选择日期"
        placeholder="请选择"
        title="选择日期（只能选未来）"
        type="date"
        :before-confirm="validateFutureDate"
      />

      <!-- 异步校验 -->
      <wd-datetime-picker
        v-model="date11"
        label="预约日期"
        placeholder="请选择"
        title="选择预约日期"
        type="date"
        :before-confirm="validateAppointment"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerInstance } from '@/wd/components/wd-datetime-picker/wd-datetime-picker.vue'

const date10 = ref<number>()
const date11 = ref<number>()

// 校验必须选择未来日期
const validateFutureDate = (
  value: number,
  resolve: (isPass: boolean) => void,
  picker: DatetimePickerInstance
) => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  if (value < now.getTime()) {
    uni.showToast({
      title: '请选择未来日期',
      icon: 'none'
    })
    resolve(false)
  } else {
    resolve(true)
  }
}

// 异步校验预约日期
const validateAppointment = async (
  value: number,
  resolve: (isPass: boolean) => void,
  picker: DatetimePickerInstance
) => {
  // 设置加载状态
  picker.setLoading(true)

  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 假设检查该日期是否可预约
    const isAvailable = Math.random() > 0.3

    if (isAvailable) {
      resolve(true)
    } else {
      uni.showToast({
        title: '该日期已约满',
        icon: 'none'
      })
      resolve(false)
    }
  } finally {
    picker.setLoading(false)
  }
}
</script>
```

**函数签名：**
```typescript
type DatetimePickerBeforeConfirm = (
  value: number | string | (number | string)[],
  resolve: (isPass: boolean) => void,
  picker: DatetimePickerInstance
) => void
```

**使用说明：**
- 函数接收三个参数：选中值、resolve 回调、picker 实例
- 必须调用 `resolve(true)` 才能继续确认操作
- 调用 `resolve(false)` 会阻止确认
- 可以通过 picker 实例的 `setLoading` 方法控制加载状态
- 组件会在初始化时验证函数类型

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:205-209, 293-294, 936-946, 1067-1075

### 默认值

通过 `default-value` 设置默认日期，打开面板时自动定位到指定日期。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="默认值">
      <!-- 未选择时，默认定位到明天 -->
      <wd-datetime-picker
        v-model="date12"
        label="选择日期"
        placeholder="请选择"
        title="选择日期"
        type="date"
        :default-value="defaultDate"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const date12 = ref<number>()

// 默认值：明天
const defaultDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.getTime()
})
</script>
```

**使用说明：**
- `default-value` 类型与 `modelValue` 保持一致
- 当 `modelValue` 为空时，使用默认值初始化面板
- 默认值不会自动赋值给 `modelValue`，仅用于面板初始定位
- 在 `getDefaultInnerValue` 方法中处理默认值逻辑

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:297-298, 468-480

### 加载状态

支持异步数据加载场景，显示加载状态。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="加载状态">
      <wd-datetime-picker
        v-model="date13"
        label="选择日期"
        placeholder="请选择"
        title="选择日期"
        type="date"
        :loading="isLoading"
        loading-color="#ff6b6b"
        @open="handleOpen"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const date13 = ref<number>(Date.now())
const isLoading = ref(false)

// 打开时模拟加载
const handleOpen = async () => {
  isLoading.value = true

  // 模拟异步数据加载
  await new Promise(resolve => setTimeout(resolve, 1500))

  isLoading.value = false
}
</script>
```

**使用说明：**
- `loading` 为 `true` 时显示加载动画
- 通过 `loading-color` 自定义加载颜色（完整十六进制格式）
- 加载状态下点击确认按钮会直接关闭面板
- 可以通过 `setLoading` 方法动态设置加载状态

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:233-236, 910-913, 968-970

### 表单验证

配合 Form 组件使用，支持表单验证功能。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-datetime-picker
        v-model="formData.birthday"
        label="出生日期"
        placeholder="请选择"
        title="选择出生日期"
        type="date"
        prop="birthday"
      />

      <wd-datetime-picker
        v-model="formData.appointmentTime"
        label="预约时间"
        placeholder="请选择"
        title="选择预约时间"
        type="datetime"
        prop="appointmentTime"
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
  birthday: undefined,
  appointmentTime: undefined
})

const rules = {
  birthday: [
    { required: true, message: '请选择出生日期' }
  ],
  appointmentTime: [
    { required: true, message: '请选择预约时间' }
  ]
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('表单验证通过:', formData.value)
    } else {
      console.log('表单验证失败')
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

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:301-304, 987-1010

### 自定义插槽

通过插槽自定义标签区域和整体内容。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="自定义插槽">
      <!-- 自定义标签 -->
      <wd-datetime-picker
        v-model="date14"
        placeholder="请选择"
        title="选择日期"
        type="date"
      >
        <template #label>
          <view class="custom-label">
            <wd-icon name="calendar" size="32rpx" />
            <text>日期</text>
          </view>
        </template>
      </wd-datetime-picker>

      <!-- 完全自定义 -->
      <wd-datetime-picker
        v-model="date15"
        title="选择日期"
        type="date"
      >
        <view class="custom-field" @click="openPicker">
          <text class="label">自定义日期</text>
          <text class="value">{{ formatDate(date15) || '请选择' }}</text>
          <wd-icon name="arrow-right" />
        </view>
      </wd-datetime-picker>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const date14 = ref<number>(Date.now())
const date15 = ref<number>(Date.now())

const formatDate = (timestamp: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const openPicker = () => {
  // 通过 ref 调用 open 方法
}
</script>

<style lang="scss" scoped>
.custom-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.custom-field {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #fff;

  .label {
    margin-right: 24rpx;
  }

  .value {
    flex: 1;
    color: #666;
  }
}
</style>
```

**使用说明：**
- `label` 插槽替换左侧标签区域
- 默认插槽完全自定义显示内容
- 使用默认插槽时需要手动触发打开（通过 ref 调用 `open` 方法）

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:11, 14-24

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model-value / v-model | 选中值，时间类型为字符串，日期类型为时间戳，区域选择为数组 | `string \| number \| (string \| number)[]` | - |
| type | 选择器类型 | `DateTimeType` | `'datetime'` |
| label | 选择器左侧文案 | `string` | - |
| placeholder | 选择器占位符 | `string` | `'请选择'` |
| title | 弹出层标题 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| loading | 是否显示加载状态 | `boolean` | `false` |
| loading-color | 加载颜色（完整十六进制格式） | `string` | `'#4D80F0'` |
| required | 是否显示必填标识 | `boolean` | `false` |
| error | 是否为错误状态 | `boolean` | `false` |
| size | 选择器大小 | `string` | - |
| label-width | 设置左侧标题宽度 | `string` | `'33%'` |
| align-right | 选择器的值靠右展示 | `boolean` | `false` |
| ellipsis | 是否超出隐藏 | `boolean` | `false` |
| min-date | 最小日期（时间戳） | `number` | 当前年-10年 |
| max-date | 最大日期（时间戳） | `number` | 当前年+10年 |
| min-hour | 最小小时（time 类型） | `number` | `0` |
| max-hour | 最大小时（time 类型） | `number` | `23` |
| min-minute | 最小分钟（time 类型） | `number` | `0` |
| max-minute | 最大分钟（time 类型） | `number` | `59` |
| use-second | 是否启用秒选择 | `boolean` | `false` |
| min-second | 最小秒数 | `number` | `0` |
| max-second | 最大秒数 | `number` | `59` |
| filter | 自定义过滤选项的函数 | `DatetimePickerViewFilter` | - |
| formatter | 自定义弹出层选项文案的格式化函数 | `DatetimePickerViewFormatter` | - |
| display-format | 自定义展示文案的格式化函数 | `DatetimePickerDisplayFormat` | - |
| display-format-tab-label | 自定义区域选择 Tab 标签文案的格式化函数 | `DatetimePickerDisplayFormatTabLabel` | - |
| before-confirm | 确认前校验函数 | `DatetimePickerBeforeConfirm` | - |
| default-value | 默认日期，类型与 modelValue 一致 | `string \| number \| (string \| number)[]` | - |
| columns-height | picker 内部滚筒高度 | `number` | `217` |
| value-key | 选项的 key | `string` | `'value'` |
| label-key | 选项的 label | `string` | `'label'` |
| cancel-button-text | 取消按钮文案 | `string` | `'取消'` |
| confirm-button-text | 确认按钮文案 | `string` | `'确认'` |
| close-on-click-modal | 点击遮罩是否关闭 | `boolean` | `true` |
| safe-area-inset-bottom | 是否设置底部安全距离 | `boolean` | `true` |
| z-index | 弹窗层级 | `number` | `100` |
| immediate-change | 是否在手指松开时立即触发 change 事件 | `boolean` | `false` |
| prop | 表单域 model 字段名 | `string` | - |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| custom-style | 自定义根节点样式 | `string` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-cell-class | 自定义 cell 样式类 | `string` | - |
| custom-view-class | 自定义 pickerView 样式类 | `string` | - |
| custom-label-class | 自定义 label 样式类 | `string` | - |
| custom-value-class | 自定义 value 样式类 | `string` | - |

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:219-315, 348-382

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 选中值变化时触发 | `value: string \| number \| (string \| number)[]` |
| change | 选择器值改变时触发（滑动过程中） | `{ value: string \| number \| (string \| number)[] }` |
| confirm | 确认选择时触发 | `{ value: string \| number \| (string \| number)[] }` |
| cancel | 取消选择时触发 | - |
| open | 打开选择器时触发 | - |
| toggle | 区域选择时切换 Tab 触发 | `value: string \| number` |

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:320-333

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 完全自定义选择器内容 |
| label | 自定义标签内容 |

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:11, 14-24

### Methods

组件通过 ref 暴露以下方法：

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开选择器弹框 | - | `void` |
| close | 关闭选择器弹框 | - | `void` |
| setLoading | 设置加载状态 | `loading: boolean` | `void` |

**使用示例：**

```vue
<template>
  <view>
    <wd-datetime-picker ref="pickerRef" v-model="date" type="date" />
    <wd-button @click="openPicker">打开选择器</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerInstance } from '@/wd/components/wd-datetime-picker/wd-datetime-picker.vue'

const pickerRef = ref<DatetimePickerInstance>()
const date = ref<number>(Date.now())

const openPicker = () => {
  pickerRef.value?.open()
}
</script>
```

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:338-345, 975-984, 1120-1124

### 类型定义

```typescript
/**
 * 日期时间类型
 */
export type DateTimeType = 'date' | 'year-month' | 'time' | 'datetime' | 'year'

/**
 * 列类型
 */
export type DatetimePickerViewColumnType = 'year' | 'month' | 'date' | 'hour' | 'minute' | 'second'

/**
 * 过滤器函数类型
 */
export type DatetimePickerViewFilter = (
  type: DatetimePickerViewColumnType,
  values: number[]
) => number[]

/**
 * 选项格式化函数类型
 */
export type DatetimePickerViewFormatter = (
  type: DatetimePickerViewColumnType,
  value: number
) => string

/**
 * 显示格式化函数类型
 */
export type DatetimePickerDisplayFormat = (
  items: Record<string, any>[]
) => string

/**
 * Tab 标签格式化函数类型
 */
export type DatetimePickerDisplayFormatTabLabel = (
  items: Record<string, any>[]
) => string

/**
 * 确认前校验函数类型
 */
type DatetimePickerBeforeConfirm = (
  value: number | string | (number | string)[],
  resolve: (isPass: boolean) => void,
  picker: DatetimePickerInstance
) => void

/**
 * 日期时间选择器实例类型
 */
export type DatetimePickerInstance = ComponentPublicInstance<
  WdDatetimePickerProps,
  WdDatetimePickerExpose
>
```

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:169-176, 197-215, 1127-1130

## 主题定制

### CSS 变量

DatetimePicker 组件使用了以下 CSS 变量，可以通过覆盖这些变量来定制样式：

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

// 选择器相关变量
$-picker-toolbar-fs: 32rpx;
$-picker-toolbar-height: 112rpx;
$-picker-action-height: 112rpx;
$-picker-toolbar-finish-color: #4D80F0;
$-picker-toolbar-cancel-color: #909399;
$-picker-toolbar-title-color: #262626;
$-picker-loading-button-color: #c5c5c5;
$-picker-column-disabled-color: #c5c5c5;

// 区域选择相关变量
$-picker-region-color: #909399;
$-picker-region-fs: 28rpx;
$-picker-region-bg-active-color: #4D80F0;

// 表单相关变量
$-form-item-error-message-color: #fa4350;
$-form-item-error-message-font-size: 24rpx;
$-form-item-error-message-line-height: 1.2;

// 其他变量
$-color-white: #fff;
```

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:1134-1137

### 暗黑模式

DatetimePicker 组件完整支持暗黑模式，在 `wot-theme-dark` 类下会自动应用暗黑主题样式：

```scss
.wot-theme-dark {
  .wd-picker {
    // 单元格背景和文字
    .wd-picker__cell {
      background-color: $-dark-background2;
      color: $-dark-color;
    }

    // 标题和标签
    .wd-picker__title,
    .wd-picker__label {
      color: $-dark-color;
    }

    // 值和占位符
    .wd-picker__value {
      color: $-dark-color;
    }

    .wd-picker__placeholder {
      color: $-dark-color-gray;
    }

    // 边框
    &.is-border .wd-picker__cell {
      border-color: $-dark-border-color;
    }

    // 箭头
    .wd-picker__arrow {
      color: $-dark-color;
    }

    // 取消按钮
    .wd-picker__action--cancel {
      color: $-dark-color;
    }

    // 区域选择 Tab
    .wd-picker__region {
      color: $-dark-color;

      &.is-active {
        background: $-picker-region-bg-active-color;
        color: $-dark-color;
      }
    }
  }
}
```

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:1139-1186

### 自定义样式类

组件提供多个自定义样式类属性，便于精细化样式控制：

```vue
<template>
  <wd-datetime-picker
    v-model="date"
    type="date"
    custom-class="my-picker"
    custom-cell-class="my-cell"
    custom-view-class="my-view"
    custom-label-class="my-label"
    custom-value-class="my-value"
  />
</template>

<style lang="scss">
.my-picker {
  // 自定义选择器根节点样式
}

.my-cell {
  // 自定义单元格样式
}

.my-view {
  // 自定义 pickerView 样式
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

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:221-224, 305-312

## 最佳实践

### 1. 合理选择日期时间类型

根据业务场景选择合适的类型，避免提供过多不必要的选项。

```vue
<!-- ✅ 推荐：只需要日期时使用 date 类型 -->
<wd-datetime-picker
  v-model="birthday"
  label="出生日期"
  type="date"
/>

<!-- ✅ 推荐：只需要时间时使用 time 类型 -->
<wd-datetime-picker
  v-model="alarmTime"
  label="闹钟时间"
  type="time"
/>

<!-- ✅ 推荐：需要精确到分钟时使用 datetime 类型 -->
<wd-datetime-picker
  v-model="appointmentTime"
  label="预约时间"
  type="datetime"
/>

<!-- ❌ 不推荐：只需要日期却使用 datetime 类型 -->
<wd-datetime-picker
  v-model="birthday"
  label="出生日期"
  type="datetime"
/>
```

**原因：**
- 使用合适的类型可以减少用户操作步骤
- 避免显示不必要的选项列，提升用户体验
- 不同类型的 modelValue 格式不同，需要注意数据类型匹配

### 2. 设置合理的日期范围

通过 min-date 和 max-date 限制可选范围，引导用户做出合理选择。

```vue
<!-- ✅ 推荐：限制出生日期不能超过今天 -->
<wd-datetime-picker
  v-model="birthday"
  label="出生日期"
  type="date"
  :max-date="Date.now()"
  :min-date="new Date(1900, 0, 1).getTime()"
/>

<!-- ✅ 推荐：预约时间只能选择未来7天 -->
<wd-datetime-picker
  v-model="appointmentDate"
  label="预约日期"
  type="date"
  :min-date="Date.now()"
  :max-date="Date.now() + 7 * 24 * 3600 * 1000"
/>

<!-- ❌ 不推荐：无限制范围，用户需要滚动很久 -->
<wd-datetime-picker
  v-model="birthday"
  label="出生日期"
  type="date"
/>
```

**原因：**
- 合理的范围限制可以减少用户滚动次数
- 防止用户选择无效或不合理的日期
- 符合业务逻辑，提供更好的用户体验

### 3. 区域选择模式的边界处理

使用区域选择时，要注意开始和结束时间的逻辑关系。

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐：提供清晰的说明 -->
    <wd-datetime-picker
      v-model="dateRange"
      label="日期范围"
      title="选择日期范围"
      type="date"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// ✅ 推荐：初始化时保证开始时间 <= 结束时间
const dateRange = ref<number[]>([
  Date.now(),
  Date.now() + 7 * 24 * 3600 * 1000
])

const handleConfirm = ({ value }: { value: number[] }) => {
  const [start, end] = value

  // ✅ 推荐：确认时再次验证
  if (start > end) {
    console.error('开始时间不能大于结束时间')
    return
  }

  console.log('日期范围:', {
    start: new Date(start),
    end: new Date(end)
  })
}
</script>
```

**原因：**
- 组件内部会自动处理边界关系，但初始化时仍需保证数据合法
- 确认时再次验证可以防止异常情况
- 为用户提供清晰的提示和说明

### 4. 格式化函数的使用

合理使用 formatter 和 displayFormat，避免过度复杂化。

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐：使用 displayFormat 自定义显示格式 -->
    <wd-datetime-picker
      v-model="date1"
      label="选择日期"
      type="date"
      :display-format="formatDisplay"
    />

    <!-- ✅ 推荐：使用 formatter 时同时提供 displayFormat -->
    <wd-datetime-picker
      v-model="date2"
      label="选择日期"
      type="date"
      :formatter="formatOption"
      :display-format="formatDisplay"
    />

    <!-- ❌ 不推荐：只使用 formatter，displayFormat 失效 -->
    <wd-datetime-picker
      v-model="date3"
      label="选择日期"
      type="date"
      :formatter="formatOption"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const date1 = ref<number>(Date.now())
const date2 = ref<number>(Date.now())
const date3 = ref<number>(Date.now())

// 格式化选项文本
const formatOption = (type: string, value: number) => {
  if (type === 'year') return `${value}年`
  if (type === 'month') return `${value}月`
  if (type === 'date') return `${value}日`
  return String(value)
}

// 格式化显示值
const formatDisplay = (items: any[]) => {
  if (!items || items.length === 0) return ''
  return `${items[0].label}-${items[1].label}-${items[2].label}`
}
</script>
```

**原因：**
- `formatter` 只影响选择器内部选项，不影响顶部显示
- 使用 `formatter` 后，默认 `displayFormat` 会失效，需要手动提供
- 避免用户看到格式不一致的显示效果

### 5. 异步校验的最佳实践

使用 beforeConfirm 进行异步校验时，合理管理加载状态。

```vue
<template>
  <wd-datetime-picker
    ref="pickerRef"
    v-model="appointmentDate"
    label="预约日期"
    type="date"
    :before-confirm="validateDate"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerInstance } from '@/wd/components/wd-datetime-picker/wd-datetime-picker.vue'

const pickerRef = ref<DatetimePickerInstance>()
const appointmentDate = ref<number>()

// ✅ 推荐：异步校验时管理加载状态
const validateDate = async (
  value: number,
  resolve: (isPass: boolean) => void,
  picker: DatetimePickerInstance
) => {
  // 1. 开启加载状态
  picker.setLoading(true)

  try {
    // 2. 执行异步校验
    const response = await checkAppointmentAvailability(value)

    if (response.available) {
      resolve(true)
    } else {
      // 3. 校验失败，显示提示
      uni.showToast({
        title: response.message,
        icon: 'none'
      })
      resolve(false)
    }
  } catch (error) {
    // 4. 异常处理
    console.error('校验失败:', error)
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
    resolve(false)
  } finally {
    // 5. 关闭加载状态
    picker.setLoading(false)
  }
}

// 模拟 API 请求
const checkAppointmentAvailability = async (date: number) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return {
    available: Math.random() > 0.3,
    message: '该日期已约满'
  }
}
</script>
```

**原因：**
- 使用 `setLoading` 显示加载状态，提供良好的用户反馈
- try-catch-finally 确保加载状态正确关闭
- 异常情况下也要调用 `resolve(false)` 阻止确认
- 提供清晰的错误提示信息

## 常见问题

### 1. 时间类型值格式不正确

**问题描述：**

时间类型的 modelValue 格式设置错误，导致选择器显示异常或值无法更新。

```vue
<!-- 问题代码 -->
<wd-datetime-picker
  v-model="time"
  type="time"
/>

<script lang="ts" setup>
// ❌ 时间类型应该是字符串，不是时间戳
const time = ref<number>(Date.now())
</script>
```

**问题原因：**
- `type="time"` 时，modelValue 必须是字符串格式 `HH:mm` 或 `HH:mm:ss`
- 使用时间戳会导致组件无法正确解析和显示
- 在 `getPickerValue` 方法中会尝试解析字符串格式

**解决方案：**

```vue
<wd-datetime-picker
  v-model="time"
  type="time"
/>

<script lang="ts" setup>
// ✅ 时间类型使用字符串格式
const time = ref('12:30')

// 如果启用秒选择
const timeWithSecond = ref('12:30:45')
</script>
```

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:434-455

### 2. 区域选择开始时间大于结束时间

**问题描述：**

区域选择时，初始值设置不当，导致开始时间大于结束时间。

```vue
<!-- 问题代码 -->
<script lang="ts" setup>
// ❌ 结束时间小于开始时间
const dateRange = ref<number[]>([
  Date.now(),
  Date.now() - 7 * 24 * 3600 * 1000 // 7天前
])
</script>
```

**问题原因：**
- 虽然组件内部会处理边界关系，但初始值不合法会导致显示异常
- 用户打开选择器时可能看到不合理的默认值
- 可能触发边界检查逻辑，自动调整为相同值

**解决方案：**

```vue
<script lang="ts" setup>
// ✅ 确保开始时间 <= 结束时间
const now = Date.now()
const dateRange = ref<number[]>([
  now,
  now + 7 * 24 * 3600 * 1000 // 7天后
])

// 或者使用计算属性确保顺序
const dateRange = computed({
  get: () => internalRange.value,
  set: (value: number[]) => {
    // 自动排序，确保顺序正确
    internalRange.value = value.sort((a, b) => a - b)
  }
})
</script>
```

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:512-613, 809-880

### 3. 使用 formatter 后显示格式异常

**问题描述：**

使用了 `formatter` 后，顶部显示的日期时间格式不符合预期。

```vue
<!-- 问题代码 -->
<wd-datetime-picker
  v-model="date"
  type="date"
  :formatter="formatOption"
/>

<script lang="ts" setup>
// 只提供了 formatter，没有提供 displayFormat
const formatOption = (type: string, value: number) => {
  if (type === 'year') return `${value}年`
  if (type === 'month') return `${value}月`
  if (type === 'date') return `${value}日`
  return String(value)
}
</script>
```

**问题原因：**
- 使用 `formatter` 后，默认的 `displayFormat` 逻辑会尝试使用 `formatter` 格式化显示值
- 但如果 `formatter` 返回的格式不符合预期，显示效果会异常
- `defaultDisplayFormat` 方法中有特殊处理逻辑

**解决方案：**

```vue
<wd-datetime-picker
  v-model="date"
  type="date"
  :formatter="formatOption"
  :display-format="formatDisplay"
/>

<script lang="ts" setup>
// ✅ 同时提供 formatter 和 displayFormat
const formatOption = (type: string, value: number) => {
  if (type === 'year') return `${value}年`
  if (type === 'month') return `${value}月`
  if (type === 'date') return `${value}日`
  return String(value)
}

const formatDisplay = (items: any[]) => {
  if (!items || items.length === 0) return ''
  // 手动拼接格式化后的文本
  return items.map(item => item.label).join('')
}
</script>
```

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:653-698

### 4. 默认值不生效

**问题描述：**

设置了 `default-value` 但打开选择器时没有定位到指定日期。

```vue
<!-- 问题代码 -->
<wd-datetime-picker
  v-model="date"
  type="date"
  :default-value="defaultDate"
/>

<script lang="ts" setup>
// ❌ 已经有初始值，defaultValue 不会生效
const date = ref<number>(Date.now())
const defaultDate = ref<number>(Date.now() + 7 * 24 * 3600 * 1000)
</script>
```

**问题原因：**
- `default-value` 只在 `modelValue` 为空时生效
- 如果 `modelValue` 已有值，会优先使用 `modelValue`
- `getDefaultInnerValue` 方法中的优先级：`value > defaultValue > minDate/maxDate`

**解决方案：**

```vue
<script lang="ts" setup>
// ✅ modelValue 为空时，defaultValue 才会生效
const date = ref<number>()
const defaultDate = ref<number>(Date.now() + 7 * 24 * 3600 * 1000)

// 或者直接使用 modelValue
const date = ref<number>(Date.now() + 7 * 24 * 3600 * 1000)
</script>
```

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:468-480

### 5. 表单验证时机不正确

**问题描述：**

与 Form 组件配合使用时，验证时机不符合预期或验证消息不显示。

```vue
<!-- 问题代码 -->
<wd-form :model="formData" :rules="rules">
  <!-- ❌ 缺少 prop 属性 -->
  <wd-datetime-picker
    v-model="formData.date"
    label="选择日期"
    type="date"
  />
</wd-form>

<script lang="ts" setup>
const formData = ref({
  date: undefined
})

const rules = {
  date: [
    { required: true, message: '请选择日期' }
  ]
}
</script>
```

**问题原因：**
- 缺少 `prop` 属性，组件无法与表单字段关联
- `errorMessage` 计算属性通过 `prop` 查找错误信息
- `isRequired` 计算属性也依赖 `prop` 判断是否必填

**解决方案：**

```vue
<wd-form ref="formRef" :model="formData" :rules="rules">
  <!-- ✅ 添加 prop 属性 -->
  <wd-datetime-picker
    v-model="formData.date"
    label="选择日期"
    type="date"
    prop="date"
  />
</wd-form>

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

// 提交时验证
const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('验证通过:', formData.value)
    }
  })
}
</script>
```

参考: src/wd/components/wd-datetime-picker/wd-datetime-picker.vue:301-304, 987-1010

## 注意事项

1. **类型与值的匹配**：`type="time"` 时 modelValue 为字符串格式，其他类型为时间戳格式，区域选择为数组格式

2. **日期范围默认值**：minDate 和 maxDate 默认为当前年份前后各10年，根据需要自行设置

3. **区域选择触发**：传入数组类型的 modelValue 自动启用区域选择，单值与数组不能混用

4. **秒选择限制**：`use-second` 仅在 `type="time"` 和 `type="datetime"` 时生效，其他类型无效

5. **格式化函数协同**：使用 `formatter` 后，需要同时提供 `display-format`，否则显示格式可能异常

6. **边界自动处理**：区域选择时组件会自动处理边界关系，但初始值仍需保证合法

7. **加载状态管理**：异步校验时使用 `setLoading` 管理加载状态，确保在 finally 中关闭

8. **表单验证关联**：与 Form 组件配合时必须设置 `prop` 属性，否则验证功能无效

9. **默认值优先级**：`modelValue > defaultValue > minDate/maxDate`，defaultValue 仅在 modelValue 为空时生效

10. **即时响应选项**：`immediate-change` 为 `true` 时，手指松开立即触发 change 事件，默认为 `false`

11. **filter 函数性能**：filter 函数会频繁调用，避免在函数内执行复杂计算

12. **时间戳精度**：组件使用毫秒级时间戳，注意与秒级时间戳的转换

---

DatetimePicker 日期时间选择器组件提供了全面的日期时间选择功能，支持五种选择类型和区域选择模式。合理使用组件的各项配置和高级特性，能够构建出功能强大、用户体验优秀的日期时间选择功能。
