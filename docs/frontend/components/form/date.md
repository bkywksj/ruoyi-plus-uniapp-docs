# AFormDate 日期选择组件

AFormDate 是一个功能完善的日期选择组件，基于 Element Plus 的 ElDatePicker 封装，支持日期、时间、日期范围等多种选择模式，提供丰富的配置选项和快捷选择功能。

## 基础用法

### 基本日期选择

```vue
<template>
  <!-- 搜索栏中使用 -->
  <AFormDate 
    v-model="queryParams.createTime" 
    label="创建时间" 
    prop="createTime" 
    @change="handleQuery" 
  />
  
  <!-- 表单中使用 -->
  <AFormDate 
    v-model="form.birthday" 
    label="出生日期" 
    prop="birthday" 
    type="date"
    :span="12" 
  />
</template>

<script lang="ts" setup>
const queryParams = reactive({
  createTime: ''
})

const form = reactive({
  birthday: ''
})
</script>
```

### 不同日期类型

```vue
<template>
  <!-- 日期选择 -->
  <AFormDate 
    v-model="form.date" 
    label="日期" 
    type="date" 
    :span="12" 
  />
  
  <!-- 日期时间选择 -->
  <AFormDate 
    v-model="form.datetime" 
    label="日期时间" 
    type="datetime" 
    :span="12" 
  />
  
  <!-- 年份选择 -->
  <AFormDate 
    v-model="form.year" 
    label="年份" 
    type="year" 
    :span="12" 
  />
  
  <!-- 月份选择 -->
  <AFormDate 
    v-model="form.month" 
    label="月份" 
    type="month" 
    :span="12" 
  />
</template>
```

### 日期范围选择

```vue
<template>
  <AFormDate 
    v-model="queryParams.dateRange" 
    label="时间范围" 
    type="daterange" 
    :span="12" 
  />
  
  <AFormDate 
    v-model="form.activityPeriod" 
    label="活动周期" 
    type="datetimerange" 
    :span="12" 
  />
</template>
```

## 组件属性

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number \| Array` | - | 绑定值 |
| `type` | `ElDatePickerType` | `'datetime'` | 选择器类型 |
| `label` | `string` | `''` | 表单标签 |
| `prop` | `string` | `''` | 表单字段名 |
| `span` | `number` | - | 栅格占比 |
| `showFormItem` | `boolean` | `true` | 是否显示表单项包装 |

### 日期选择器属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placeholder` | `string` | - | 占位符（自动生成） |
| `format` | `string` | - | 显示格式 |
| `valueFormat` | `string` | - | 绑定值格式 |
| `clearable` | `boolean` | `true` | 是否可清空 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `editable` | `boolean` | `true` | 是否可编辑 |
| `size` | `ElSize` | `''` | 组件尺寸 |

### 范围选择属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `rangeSeparator` | `string` | `'-'` | 范围分隔符 |
| `startPlaceholder` | `string` | - | 开始日期占位符 |
| `endPlaceholder` | `string` | - | 结束日期占位符 |
| `unlinkPanels` | `boolean` | `false` | 取消面板联动 |

### 时间选择属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `timeArrowControl` | `boolean` | `false` | 是否使用箭头选择时间 |
| `defaultTime` | `Date \| [Date, Date]` | - | 默认时刻 |

### 高级属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `disabledDate` | `Function` | - | 禁用日期判断函数 |
| `shortcuts` | `DateShortcut[]` | `[]` | 快捷选项 |
| `defaultValue` | `Date \| [Date, Date]` | - | 默认显示日期 |
| `validateEvent` | `boolean` | `true` | 是否触发表单验证 |
| `prefixIcon` | `string` | `''` | 自定义头部图标 |

### 样式属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `string \| number` | `240` | 组件宽度 |
| `labelWidth` | `string \| number` | - | 标签宽度 |
| `tooltip` | `string` | `''` | 提示信息 |

## 使用示例

### 带提示信息的日期选择

```vue
<template>
  <AFormDate 
    v-model="form.deadline" 
    label="截止日期" 
    prop="deadline"
    type="datetime"
    tooltip="请选择任务的截止时间" 
    :span="12" 
  />
</template>
```

### 自定义格式化

```vue
<template>
  <AFormDate 
    v-model="form.publishTime" 
    label="发布时间" 
    prop="publishTime"
    type="datetime"
    format="YYYY年MM月DD日 HH:mm:ss"
    value-format="YYYY-MM-DD HH:mm:ss"
    :span="12" 
  />
</template>
```

### 带快捷选项的日期选择

```vue
<template>
  <AFormDate 
    v-model="form.reportDate" 
    label="报告日期" 
    prop="reportDate"
    type="daterange"
    :shortcuts="dateShortcuts" 
    :span="12" 
  />
</template>

<script lang="ts" setup>
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]
</script>
```

### 禁用特定日期

```vue
<template>
  <AFormDate 
    v-model="form.appointmentDate" 
    label="预约日期" 
    prop="appointmentDate"
    type="date"
    :disabled-date="disabledDate" 
    :span="12" 
  />
</template>

<script lang="ts" setup>
const disabledDate = (time) => {
  // 禁用过去的日期和周末
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const day = time.getDay()
  const isPastDate = time.getTime() < today.getTime()
  const isWeekend = day === 0 || day === 6
  
  return isPastDate || isWeekend
}
</script>
```

### 限制日期范围

```vue
<template>
  <AFormDate 
    v-model="form.eventDate" 
    label="活动日期" 
    prop="eventDate"
    type="date"
    :disabled-date="limitDateRange" 
    :span="12" 
  />
</template>

<script lang="ts" setup>
const limitDateRange = (time) => {
  // 只允许选择未来30天内的日期
  const today = new Date()
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 30)
  
  return time.getTime() < today.getTime() || time.getTime() > maxDate.getTime()
}
</script>
```

### 默认时间设置

```vue
<template>
  <AFormDate 
    v-model="form.meetingTime" 
    label="会议时间" 
    prop="meetingTime"
    type="datetimerange"
    :default-time="[new Date(2000, 1, 1, 9, 0, 0), new Date(2000, 1, 1, 17, 0, 0)]"
    :span="12" 
  />
</template>
```

### 不含表单项的纯日期选择器

```vue
<template>
  <AFormDate 
    v-model="selectedDate" 
    placeholder="选择日期" 
    :show-form-item="false" 
    type="date"
    @change="handleDateChange"
  />
</template>
```

## 事件处理

### 基础事件

```vue
<template>
  <AFormDate 
    v-model="form.eventDate"
    label="活动日期"
    @change="handleDateChange"
    @blur="handleBlur"
    @focus="handleFocus"
    @calendar-change="handleCalendarChange"
    @panel-change="handlePanelChange"
    @visible-change="handleVisibleChange"
  />
</template>

<script lang="ts" setup>
const handleDateChange = (value) => {
  console.log('日期变化:', value)
  // 可以根据日期更新其他相关字段
}

const handleBlur = (event) => {
  console.log('失去焦点')
}

const handleFocus = (event) => {
  console.log('获得焦点')
}

const handleCalendarChange = (value) => {
  console.log('日历变化:', value)
}

const handlePanelChange = (date, mode, view) => {
  console.log('面板变化:', date, mode, view)
}

const handleVisibleChange = (visible) => {
  console.log('显示状态变化:', visible)
}
</script>
```

### 联动日期选择

```vue
<template>
  <el-row :gutter="20">
    <AFormDate 
      v-model="form.startDate" 
      label="开始日期" 
      prop="startDate"
      type="date"
      :disabled-date="disableStartDate"
      @change="handleStartDateChange"
      :span="12" 
    />
    
    <AFormDate 
      v-model="form.endDate" 
      label="结束日期" 
      prop="endDate"
      type="date"
      :disabled-date="disableEndDate"
      @change="handleEndDateChange"
      :span="12" 
    />
  </el-row>
</template>

<script lang="ts" setup>
const form = reactive({
  startDate: '',
  endDate: ''
})

const disableStartDate = (time) => {
  if (form.endDate) {
    return time.getTime() > new Date(form.endDate).getTime()
  }
  return time.getTime() < Date.now() - 8.64e7 // 不能选择昨天之前的日期
}

const disableEndDate = (time) => {
  if (form.startDate) {
    return time.getTime() < new Date(form.startDate).getTime()
  }
  return time.getTime() < Date.now() - 8.64e7
}

const handleStartDateChange = (value) => {
  if (form.endDate && value && new Date(value) > new Date(form.endDate)) {
    form.endDate = ''
  }
}

const handleEndDateChange = (value) => {
  if (form.startDate && value && new Date(value) < new Date(form.startDate)) {
    form.startDate = ''
  }
}
</script>
```

## 高级用法

### 工作日选择器

```vue
<template>
  <AFormDate 
    v-model="form.workDay" 
    label="工作日" 
    prop="workDay"
    type="date"
    :disabled-date="disableWeekends" 
    :span="12" 
  />
</template>

<script lang="ts" setup>
const disableWeekends = (time) => {
  const day = time.getDay()
  return day === 0 || day === 6 // 禁用周末
}
</script>
```

### 节假日禁用

```vue
<template>
  <AFormDate 
    v-model="form.businessDate" 
    label="营业日期" 
    prop="businessDate"
    type="date"
    :disabled-date="disableHolidays" 
    :span="12" 
  />
</template>

<script lang="ts" setup>
const holidays = [
  '2024-01-01', // 元旦
  '2024-02-10', // 春节
  '2024-02-11',
  '2024-02-12',
  // 更多节假日...
]

const disableHolidays = (time) => {
  const dateStr = time.toISOString().split('T')[0]
  return holidays.includes(dateStr)
}
</script>
```

### 分阶段时间选择

```vue
<template>
  <div>
    <AFormDate 
      v-model="phases.phase1" 
      label="第一阶段" 
      type="daterange"
      @change="updatePhaseConstraints"
    />
    
    <AFormDate 
      v-model="phases.phase2" 
      label="第二阶段" 
      type="daterange"
      :disabled-date="disablePhase2"
    />
    
    <AFormDate 
      v-model="phases.phase3" 
      label="第三阶段" 
      type="daterange"
      :disabled-date="disablePhase3"
    />
  </div>
</template>

<script lang="ts" setup>
const phases = reactive({
  phase1: [],
  phase2: [],
  phase3: []
})

const disablePhase2 = (time) => {
  if (!phases.phase1 || phases.phase1.length !== 2) return false
  return time.getTime() <= new Date(phases.phase1[1]).getTime()
}

const disablePhase3 = (time) => {
  if (!phases.phase2 || phases.phase2.length !== 2) return false
  return time.getTime() <= new Date(phases.phase2[1]).getTime()
}

const updatePhaseConstraints = () => {
  // 当第一阶段改变时，清空后续阶段
  phases.phase2 = []
  phases.phase3 = []
}
</script>
```

## 表单验证

### 基础验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormDate 
      v-model="form.startDate" 
      label="开始日期" 
      prop="startDate" 
      type="datetime"
    />
    
    <AFormDate 
      v-model="form.endDate" 
      label="结束日期" 
      prop="endDate" 
      type="datetime"
    />
  </el-form>
</template>

<script lang="ts" setup>
const rules = {
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value && form.startDate && new Date(value) <= new Date(form.startDate)) {
          callback(new Error('结束日期必须晚于开始日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}
</script>
```

### 日期范围验证

```vue
<template>
  <el-form :model="form" :rules="rules">
    <AFormDate 
      v-model="form.dateRange" 
      label="活动周期" 
      prop="dateRange"
      type="datetimerange"
    />
  </el-form>
</template>

<script lang="ts" setup>
const rules = {
  dateRange: [
    { required: true, message: '请选择活动周期', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value && value.length === 2) {
          const start = new Date(value[0])
          const end = new Date(value[1])
          const diffDays = (end - start) / (24 * 60 * 60 * 1000)
          
          if (diffDays < 1) {
            callback(new Error('活动周期至少需要1天'))
          } else if (diffDays > 30) {
            callback(new Error('活动周期不能超过30天'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}
</script>
```

## 样式定制

### 自定义样式

```vue
<template>
  <AFormDate 
    v-model="form.date"
    label="日期"
    class="custom-date-picker"
    :width="300"
  />
</template>

<style scoped>
.custom-date-picker :deep(.el-date-editor) {
  border-radius: 8px;
  border: 2px solid #409eff;
}

.custom-date-picker :deep(.el-date-editor:hover) {
  border-color: #66b1ff;
}

.custom-date-picker :deep(.el-date-editor.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>
```

### 响应式布局

```vue
<template>
  <AFormDate 
    v-model="form.date"
    label="日期"
    :span="isMobile ? 24 : 12"
    :width="isMobile ? '100%' : 240"
  />
</template>

<script lang="ts" setup>
import { useBreakpoint } from '@/composables/useBreakpoint'
const { isMobile } = useBreakpoint()
</script>
```

## 实际应用场景

### 任务管理

```vue
<template>
  <el-card header="任务设置">
    <el-row :gutter="20">
      <AFormDate 
        v-model="task.startDate" 
        label="开始时间" 
        prop="startDate"
        type="datetime"
        :span="12" 
      />
      
      <AFormDate 
        v-model="task.dueDate" 
        label="截止时间" 
        prop="dueDate"
        type="datetime"
        :disabled-date="disablePastDates"
        :span="12" 
      />
      
      <AFormDate 
        v-model="task.reminderTime" 
        label="提醒时间" 
        prop="reminderTime"
        type="datetime"
        :disabled-date="disableAfterDue"
        :span="12" 
      />
    </el-row>
  </el-card>
</template>

<script lang="ts" setup>
const task = reactive({
  startDate: '',
  dueDate: '',
  reminderTime: ''
})

const disablePastDates = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

const disableAfterDue = (time) => {
  if (task.dueDate) {
    return time.getTime() > new Date(task.dueDate).getTime()
  }
  return false
}
</script>
```

### 报表查询

```vue
<template>
  <el-card header="数据查询">
    <el-row :gutter="20">
      <AFormDate 
        v-model="queryParams.dateRange" 
        label="查询时间" 
        type="datetimerange"
        :shortcuts="reportShortcuts"
        @change="handleDateRangeChange"
        :span="16" 
      />
      
      <el-col :span="8">
        <el-button type="primary" @click="generateReport" :loading="generating">
          生成报表
        </el-button>
      </el-col>
    </el-row>
  </el-card>
</template>

<script lang="ts" setup>
const queryParams = reactive({
  dateRange: []
})

const generating = ref(false)

const reportShortcuts = [
  {
    text: '今天',
    value: () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return [start, end]
    }
  },
  {
    text: '昨天',
    value: () => {
      const start = new Date()
      start.setDate(start.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setDate(end.getDate() - 1)
      end.setHours(23, 59, 59, 999)
      return [start, end]
    }
  },
  {
    text: '本周',
    value: () => {
      const start = new Date()
      start.setDate(start.getDate() - start.getDay())
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const start = new Date()
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      return [start, end]
    }
  }
]

const handleDateRangeChange = (dateRange) => {
  if (dateRange && dateRange.length === 2) {
    console.log('时间范围:', dateRange)
    // 可以自动触发数据加载
  }
}

const generateReport = async () => {
  if (!queryParams.dateRange || queryParams.dateRange.length !== 2) {
    showMsgError('请选择查询时间范围')
    return
  }
  
  generating.value = true
  try {
    await fetchReportData(queryParams.dateRange)
    showMsgSuccess('报表生成成功')
  } catch (error) {
    showMsgError('报表生成失败')
  } finally {
    generating.value = false
  }
}
</script>
```

### 预约系统

```vue
<template>
  <el-card header="预约设置">
    <el-row :gutter="20">
      <AFormDate 
        v-model="appointment.date" 
        label="预约日期" 
        prop="date"
        type="date"
        :disabled-date="disableUnavailableDates"
        @change="loadAvailableSlots"
        :span="12" 
      />
      
      <AFormSelect 
        v-model="appointment.timeSlot" 
        :options="availableSlots" 
        label="时间段" 
        prop="timeSlot"
        :disabled="!appointment.date"
        :loading="loadingSlots"
        :span="12" 
      />
    </el-row>
  </el-card>
</template>

<script lang="ts" setup>
const appointment = reactive({
  date: '',
  timeSlot: ''
})

const availableSlots = ref([])
const loadingSlots = ref(false)

const disableUnavailableDates = (time) => {
  // 禁用过去的日期、周末和节假日
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const day = time.getDay()
  const isPastDate = time.getTime() < today.getTime()
  const isWeekend = day === 0 || day === 6
  
  return isPastDate || isWeekend
}

const loadAvailableSlots = async (date) => {
  if (!date) {
    availableSlots.value = []
    return
  }
  
  loadingSlots.value = true
  try {
    const slots = await getAvailableTimeSlots(date)
    availableSlots.value = slots.map(slot => ({
      label: `${slot.startTime} - ${slot.endTime}`,
      value: slot.id
    }))
  } catch (error) {
    showMsgError('获取可用时间段失败')
    availableSlots.value = []
  } finally {
    loadingSlots.value = false
  }
}
</script>
```

### 活动发布

```vue
<template>
  <el-form :model="eventForm" :rules="eventRules">
    <el-row :gutter="20">
      <AFormDate 
        v-model="eventForm.registrationPeriod" 
        label="报名时间" 
        prop="registrationPeriod"
        type="datetimerange"
        :shortcuts="periodShortcuts"
        :span="24" 
      />
      
      <AFormDate 
        v-model="eventForm.eventPeriod" 
        label="活动时间" 
        prop="eventPeriod"
        type="datetimerange"
        :disabled-date="disableEventDates"
        :span="24" 
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
const eventForm = reactive({
  registrationPeriod: [],
  eventPeriod: []
})

const periodShortcuts = [
  {
    text: '未来一周报名',
    value: () => {
      const start = new Date()
      const end = new Date()
      end.setDate(start.getDate() + 7)
      return [start, end]
    }
  },
  {
    text: '未来两周报名',
    value: () => {
      const start = new Date()
      const end = new Date()
      end.setDate(start.getDate() + 14)
      return [start, end]
    }
  }
]

const disableEventDates = (time) => {
  // 活动时间不能早于报名结束时间
  if (eventForm.registrationPeriod && eventForm.registrationPeriod.length === 2) {
    const registrationEnd = new Date(eventForm.registrationPeriod[1])
    return time.getTime() <= registrationEnd.getTime()
  }
  return time.getTime() < Date.now()
}

const eventRules = {
  registrationPeriod: [
    { required: true, message: '请选择报名时间', trigger: 'change' }
  ],
  eventPeriod: [
    { required: true, message: '请选择活动时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value && eventForm.registrationPeriod && value.length === 2 && eventForm.registrationPeriod.length === 2) {
          const eventStart = new Date(value[0])
          const registrationEnd = new Date(eventForm.registrationPeriod[1])
          
          if (eventStart.getTime() <= registrationEnd.getTime()) {
            callback(new Error('活动开始时间必须晚于报名结束时间'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}
</script>
```

## 最佳实践

### 1. 合理的默认值

```vue
<template>
  <!-- 合理设置默认时间 -->
  <AFormDate 
    v-model="form.meetingTime"
    label="会议时间"
    type="datetime"
    :default-time="new Date(2000, 1, 1, 14, 0, 0)" // 默认下午2点
  />
</template>
```

### 2. 清晰的时间格式

```vue
<template>
  <!-- 使用用户友好的显示格式 -->
  <AFormDate 
    v-model="form.eventDate"
    label="活动日期"
    format="YYYY年MM月DD日 dddd"
    value-format="YYYY-MM-DD"
  />
</template>
```

### 3. 提供快捷选择

```vue
<template>
  <!-- 为常用场景提供快捷选项 -->
  <AFormDate 
    v-model="queryParams.timeRange"
    label="查询时间"
    type="datetimerange"
    :shortcuts="commonShortcuts"
  />
</template>

<script lang="ts" setup>
const commonShortcuts = [
  { text: '最近7天', value: () => getLastDays(7) },
  { text: '最近30天', value: () => getLastDays(30) },
  { text: '本月', value: () => getCurrentMonth() },
  { text: '上月', value: () => getLastMonth() }
]
</script>
```

### 4. 适当的限制条件

```vue
<template>
  <!-- 设置合理的日期限制 -->
  <AFormDate 
    v-model="form.birthDate"
    label="出生日期"
    type="date"
    :disabled-date="disableFutureDates"
  />
</template>

<script lang="ts" setup>
const disableFutureDates = (time) => {
  return time.getTime() > Date.now()
}
</script>
```

### 5. 考虑时区问题

```vue
<template>
  <AFormDate 
    v-model="form.scheduleTime"
    label="计划时间"
    type="datetime"
    value-format="YYYY-MM-DD HH:mm:ss"
    @change="handleTimeZoneConversion"
  />
</template>

<script lang="ts" setup>
const handleTimeZoneConversion = (localTime) => {
  // 处理时区转换逻辑
  const utcTime = convertToUTC(localTime)
  console.log('本地时间:', localTime, 'UTC时间:', utcTime)
}
</script>
```

## 注意事项

1. **时区处理**：注意本地时间与服务器时间的时区差异
2. **格式一致性**：确保 `format` 和 `valueFormat` 符合需求
3. **用户体验**：为常用操作提供快捷选项
4. **验证逻辑**：日期范围验证时注意边界条件
