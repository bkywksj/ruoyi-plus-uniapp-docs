# 日期工具 Date

## 介绍

日期工具(date)是RuoYi-Plus-UniApp移动端应用的核心工具库之一,提供了全面的日期处理功能。它封装了日期格式化、解析、计算、范围获取等常用操作,大幅简化了日期相关的开发工作,提高了代码的可读性和可维护性。

移动端应用中经常需要处理各种日期场景:显示文章发布时间、筛选日期范围、计算时间差、显示相对时间(如"3分钟前")等。date工具提供了统一、易用的API接口,自动处理时区、格式转换、边界情况等复杂问题,让开发者专注于业务逻辑。

**核心特性**:

- **丰富的格式化选项** - 支持多种日期格式,自动兼容 yyyy-MM-dd 和 YYYY-MM-DD 两种语法
- **相对时间显示** - 智能显示"刚刚"、"3分钟前"、"2小时前"等人性化时间
- **日期范围处理** - 快速获取本周、本月、本年等预设范围,支持自定义范围
- **时间戳转换** - 灵活处理秒级和毫秒级时间戳,自动识别和转换
- **日期计算** - 计算日期差值、加减天数、判断是否同一天等
- **类型安全** - 完整的TypeScript类型定义,提供智能提示
- **参数灵活** - 支持Date对象、时间戳、日期字符串多种输入格式
- **边界处理** - 自动处理null/undefined、非法日期等边界情况
- **表格友好** - 专门提供表格时间格式化函数
- **路由集成** - 支持从路由参数初始化日期范围

## 基本用法

### 1. 格式化日期

最常用的功能是将日期格式化为字符串,支持多种格式模式。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">日期格式化</text>

      <view class="demo-item">
        <text class="label">标准格式:</text>
        <text>{{ standardFormat }}</text>
      </view>

      <view class="demo-item">
        <text class="label">仅日期:</text>
        <text>{{ dateOnly }}</text>
      </view>

      <view class="demo-item">
        <text class="label">仅时间:</text>
        <text>{{ timeOnly }}</text>
      </view>

      <view class="demo-item">
        <text class="label">中文格式:</text>
        <text>{{ chineseFormat }}</text>
      </view>

      <view class="demo-item">
        <text class="label">带星期:</text>
        <text>{{ withWeek }}</text>
      </view>

      <button @click="updateTime">更新时间</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { formatDate } from '@/utils/date'

const now = ref(new Date())
const standardFormat = ref('')
const dateOnly = ref('')
const timeOnly = ref('')
const chineseFormat = ref('')
const withWeek = ref('')

// 格式化时间
const formatAllTimes = () => {
  const currentTime = now.value

  // 标准格式: 2024-01-15 14:30:45
  standardFormat.value = formatDate(currentTime, 'yyyy-MM-dd HH:mm:ss')

  // 仅日期: 2024-01-15
  dateOnly.value = formatDate(currentTime, 'yyyy-MM-dd')

  // 仅时间: 14:30:45
  timeOnly.value = formatDate(currentTime, 'HH:mm:ss')

  // 中文格式: 2024年01月15日 14时30分45秒
  chineseFormat.value = formatDate(currentTime, 'yyyy年MM月dd日 HH时mm分ss秒')

  // 带星期: 2024-01-15 星期一
  withWeek.value = formatDate(currentTime, 'yyyy-MM-dd 星期w')
}

// 更新时间
const updateTime = () => {
  now.value = new Date()
  formatAllTimes()
  uni.showToast({
    title: '时间已更新',
    icon: 'success',
  })
}

// 初始化
formatAllTimes()
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.demo-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #e4e7ed;
}

.label {
  color: #606266;
  font-weight: bold;
}

button {
  margin-top: 20rpx;
}
</style>
```

**格式说明**:
- `yyyy` 或 `YYYY`: 四位年份
- `MM`: 两位月份 (01-12)
- `M`: 月份不补零 (1-12)
- `dd` 或 `DD`: 两位日期 (01-31)
- `d` 或 `D`: 日期不补零 (1-31)
- `HH`: 两位小时 (00-23)
- `H`: 小时不补零 (0-23)
- `mm`: 两位分钟 (00-59)
- `m`: 分钟不补零 (0-59)
- `ss`: 两位秒 (00-59)
- `s`: 秒不补零 (0-59)
- `SSS`: 三位毫秒 (000-999)
- `w`: 星期 (日/一/二/三/四/五/六)

### 2. 相对时间显示

显示人性化的相对时间,如"刚刚"、"3分钟前"、"2小时前"等。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">相对时间显示</text>

      <view class="timeline">
        <view v-for="item in timelineItems" :key="item.id" class="timeline-item">
          <view class="timeline-dot"></view>
          <view class="timeline-content">
            <text class="timeline-title">{{ item.title }}</text>
            <text class="timeline-time">{{ item.relativeTime }}</text>
          </view>
        </view>
      </view>

      <button @click="refreshTimeline">刷新时间</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { formatRelativeTime } from '@/utils/date'

interface TimelineItem {
  id: number
  title: string
  timestamp: number
  relativeTime: string
}

const timelineItems = ref<TimelineItem[]>([])

// 创建时间线数据
const createTimelineData = () => {
  const now = Date.now()
  return [
    {
      id: 1,
      title: '系统更新完成',
      timestamp: now - 10 * 1000, // 10秒前
      relativeTime: '',
    },
    {
      id: 2,
      title: '收到新消息',
      timestamp: now - 5 * 60 * 1000, // 5分钟前
      relativeTime: '',
    },
    {
      id: 3,
      title: '任务已完成',
      timestamp: now - 2 * 3600 * 1000, // 2小时前
      relativeTime: '',
    },
    {
      id: 4,
      title: '文件上传成功',
      timestamp: now - 25 * 3600 * 1000, // 1天多前
      relativeTime: '',
    },
    {
      id: 5,
      title: '账号登录',
      timestamp: now - 3 * 24 * 3600 * 1000, // 3天前
      relativeTime: '',
    },
  ]
}

// 更新相对时间
const updateRelativeTimes = () => {
  timelineItems.value = createTimelineData().map((item) => ({
    ...item,
    relativeTime: formatRelativeTime(item.timestamp),
  }))
}

// 刷新时间线
const refreshTimeline = () => {
  updateRelativeTimes()
  uni.showToast({
    title: '已刷新',
    icon: 'success',
  })
}

// 定时更新
let timer: number | null = null

onMounted(() => {
  updateRelativeTimes()
  // 每30秒更新一次
  timer = setInterval(updateRelativeTimes, 30000) as unknown as number
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.timeline {
  position: relative;
  padding-left: 40rpx;
}

.timeline-item {
  position: relative;
  padding-bottom: 40rpx;

  &::before {
    content: '';
    position: absolute;
    left: -32rpx;
    top: 12rpx;
    bottom: -28rpx;
    width: 2rpx;
    background-color: #e4e7ed;
  }

  &:last-child::before {
    display: none;
  }
}

.timeline-dot {
  position: absolute;
  left: -40rpx;
  top: 8rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #409eff;
  border: 2rpx solid #fff;
  box-shadow: 0 0 0 2rpx #e4e7ed;
}

.timeline-content {
  display: flex;
  flex-direction: column;
}

.timeline-title {
  font-size: 28rpx;
  color: #303133;
  margin-bottom: 8rpx;
}

.timeline-time {
  font-size: 24rpx;
  color: #909399;
}

button {
  margin-top: 20rpx;
}
</style>
```

**相对时间规则**:
- 30秒内: "刚刚"
- 1小时内: "X分钟前"
- 24小时内: "X小时前"
- 48小时内: "1天前"
- 更早: 显示月日时分或自定义格式

### 3. 获取当前时间

快速获取当前时间的各种格式。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">当前时间</text>

      <view class="time-display">
        <view class="time-card">
          <text class="time-label">完整时间</text>
          <text class="time-value">{{ currentDateTime }}</text>
        </view>

        <view class="time-card">
          <text class="time-label">当前日期</text>
          <text class="time-value">{{ currentDate }}</text>
        </view>

        <view class="time-card">
          <text class="time-label">当前时刻</text>
          <text class="time-value">{{ currentTime }}</text>
        </view>

        <view class="time-card">
          <text class="time-label">时间戳(秒)</text>
          <text class="time-value">{{ timestamp }}</text>
        </view>

        <view class="time-card">
          <text class="time-label">时间戳(毫秒)</text>
          <text class="time-value">{{ timestampMs }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getCurrentTime, getCurrentDate, getCurrentDateTime, getTimeStamp } from '@/utils/date'

const currentDateTime = ref('')
const currentDate = ref('')
const currentTime = ref('')
const timestamp = ref(0)
const timestampMs = ref(0)

// 更新所有时间
const updateAllTimes = () => {
  currentDateTime.value = getCurrentDateTime() // 2024-01-15 14:30:45
  currentDate.value = getCurrentDate() // 2024-01-15
  currentTime.value = getCurrentTime() // 14:30:45
  timestamp.value = getTimeStamp('s') // 1705299045
  timestampMs.value = getTimeStamp('ms') // 1705299045000
}

// 定时更新
let timer: number | null = null

onMounted(() => {
  updateAllTimes()
  // 每秒更新一次
  timer = setInterval(updateAllTimes, 1000) as unknown as number
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.time-display {
  display: grid;
  gap: 20rpx;
}

.time-card {
  background-color: #f5f7fa;
  border-radius: 8rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-label {
  font-size: 24rpx;
  color: #909399;
  margin-bottom: 10rpx;
}

.time-value {
  font-size: 28rpx;
  color: #303133;
  font-weight: bold;
  font-family: monospace;
}
</style>
```

**使用说明**:
- getCurrentDateTime(): 获取完整日期时间 (yyyy-MM-dd HH:mm:ss)
- getCurrentDate(): 获取当前日期 (yyyy-MM-dd)
- getCurrentTime(): 获取当前时刻 (HH:mm:ss)
- getTimeStamp('s'): 获取秒级时间戳
- getTimeStamp('ms'): 获取毫秒级时间戳

### 4. 日期范围选择

获取预设的日期范围,如今天、本周、本月等。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">日期范围选择</text>

      <view class="range-selector">
        <button
          v-for="type in rangeTypes"
          :key="type.value"
          :class="['range-btn', { active: selectedType === type.value }]"
          @click="selectRange(type.value)"
        >
          {{ type.label }}
        </button>
      </view>

      <view v-if="dateRange" class="range-display">
        <text class="range-label">选中范围:</text>
        <view class="range-value">
          <text>{{ dateRange[0] }}</text>
          <text class="separator">至</text>
          <text>{{ dateRange[1] }}</text>
        </view>
      </view>

      <view class="range-info">
        <text>天数: {{ dayCount }} 天</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { getDateRangeByType, getDaysBetween } from '@/utils/date'

interface RangeType {
  label: string
  value: string
}

const rangeTypes: RangeType[] = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' },
]

const selectedType = ref('today')
const dateRange = ref<[string, string] | null>(null)

// 计算天数
const dayCount = computed(() => {
  if (!dateRange.value) return 0
  const start = new Date(dateRange.value[0])
  const end = new Date(dateRange.value[1])
  return getDaysBetween(start, end) + 1 // 包含开始和结束当天
})

// 选择范围
const selectRange = (type: string) => {
  selectedType.value = type
  dateRange.value = getDateRangeByType(type)

  if (dateRange.value) {
    uni.showToast({
      title: `已选择${rangeTypes.find((t) => t.value === type)?.label}`,
      icon: 'success',
    })
  }
}

// 初始化
selectRange('today')
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.range-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.range-btn {
  flex: 0 0 calc(33.333% - 14rpx);
  height: 70rpx;
  line-height: 70rpx;
  background-color: #f5f7fa;
  color: #606266;
  border: 1rpx solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 28rpx;

  &.active {
    background-color: #409eff;
    color: #fff;
    border-color: #409eff;
  }

  &::after {
    border: none;
  }
}

.range-display {
  background-color: #ecf5ff;
  border: 1rpx solid #b3d8ff;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.range-label {
  display: block;
  font-size: 24rpx;
  color: #409eff;
  margin-bottom: 10rpx;
}

.range-value {
  display: flex;
  flex-direction: column;
  font-size: 28rpx;
  color: #303133;

  text {
    margin-bottom: 5rpx;
  }
}

.separator {
  color: #909399;
  font-size: 24rpx;
}

.range-info {
  padding: 15rpx 20rpx;
  background-color: #f5f7fa;
  border-radius: 8rpx;

  text {
    font-size: 28rpx;
    color: #606266;
  }
}
</style>
```

**预设范围类型**:
- `today`: 今天 (00:00:00 - 23:59:59)
- `yesterday`: 昨天
- `week`: 本周 (周一到周日)
- `month`: 本月 (第一天到最后一天)
- `year`: 本年 (1月1日到12月31日)

### 5. 多种输入格式支持

formatDate函数支持多种输入格式:Date对象、时间戳(秒/毫秒)、日期字符串。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">多种输入格式</text>

      <view class="demo-list">
        <view class="demo-item">
          <text class="demo-label">Date对象:</text>
          <text class="demo-value">{{ fromDateObject }}</text>
        </view>

        <view class="demo-item">
          <text class="demo-label">毫秒时间戳:</text>
          <text class="demo-value">{{ fromTimestampMs }}</text>
        </view>

        <view class="demo-item">
          <text class="demo-label">秒时间戳:</text>
          <text class="demo-value">{{ fromTimestampS }}</text>
        </view>

        <view class="demo-item">
          <text class="demo-label">ISO字符串:</text>
          <text class="demo-value">{{ fromISOString }}</text>
        </view>

        <view class="demo-item">
          <text class="demo-label">数字字符串:</text>
          <text class="demo-value">{{ fromNumberString }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { formatDate } from '@/utils/date'

const fromDateObject = ref('')
const fromTimestampMs = ref('')
const fromTimestampS = ref('')
const fromISOString = ref('')
const fromNumberString = ref('')

onMounted(() => {
  const now = new Date()
  const timestampMs = now.getTime()
  const timestampS = Math.floor(timestampMs / 1000)

  // 1. Date对象
  fromDateObject.value = formatDate(now, 'yyyy-MM-dd HH:mm:ss')

  // 2. 毫秒时间戳 (13位)
  fromTimestampMs.value = formatDate(timestampMs, 'yyyy-MM-dd HH:mm:ss')

  // 3. 秒时间戳 (10位,自动识别并转换)
  fromTimestampS.value = formatDate(timestampS, 'yyyy-MM-dd HH:mm:ss')

  // 4. ISO 8601 字符串
  const isoString = now.toISOString()
  fromISOString.value = formatDate(isoString, 'yyyy-MM-dd HH:mm:ss')

  // 5. 数字字符串
  fromNumberString.value = formatDate(timestampMs.toString(), 'yyyy-MM-dd HH:mm:ss')
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.demo-list {
  background-color: #f5f7fa;
  border-radius: 8rpx;
  overflow: hidden;
}

.demo-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #e4e7ed;

  &:last-child {
    border-bottom: none;
  }
}

.demo-label {
  display: block;
  font-size: 24rpx;
  color: #909399;
  margin-bottom: 8rpx;
}

.demo-value {
  display: block;
  font-size: 28rpx;
  color: #303133;
  font-family: monospace;
}
</style>
```

**输入格式自动识别**:
- Date对象: 直接使用
- 13位数字: 识别为毫秒时间戳
- 10位数字: 识别为秒时间戳,自动转换为毫秒
- ISO字符串: 自动处理T和-符号
- 数字字符串: 转换为数字后处理

### 6. 日期简化函数

使用formatDay快速获取年月日格式。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">日期列表</text>

      <view class="date-list">
        <view v-for="item in dateItems" :key="item.id" class="date-item">
          <view class="date-info">
            <text class="date-title">{{ item.title }}</text>
            <text class="date-day">{{ item.day }}</text>
          </view>
          <view class="date-badge">{{ item.status }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { formatDay } from '@/utils/date'

interface DateItem {
  id: number
  title: string
  date: Date
  day: string
  status: string
}

const dateItems = ref<DateItem[]>([])

onMounted(() => {
  const today = new Date()

  dateItems.value = [
    {
      id: 1,
      title: '今日任务',
      date: today,
      day: formatDay(today),
      status: '进行中',
    },
    {
      id: 2,
      title: '明日计划',
      date: new Date(today.getTime() + 24 * 3600 * 1000),
      day: formatDay(new Date(today.getTime() + 24 * 3600 * 1000)),
      status: '未开始',
    },
    {
      id: 3,
      title: '昨日回顾',
      date: new Date(today.getTime() - 24 * 3600 * 1000),
      day: formatDay(new Date(today.getTime() - 24 * 3600 * 1000)),
      status: '已完成',
    },
  ]
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.date-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.date-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.date-info {
  flex: 1;
}

.date-title {
  display: block;
  font-size: 28rpx;
  color: #303133;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.date-day {
  display: block;
  font-size: 24rpx;
  color: #909399;
  font-family: monospace;
}

.date-badge {
  padding: 8rpx 16rpx;
  background-color: #409eff;
  color: #fff;
  border-radius: 4rpx;
  font-size: 24rpx;
}
</style>
```

**使用说明**:
- formatDay(date) 等价于 formatDate(date, 'yyyy-MM-dd')
- 适用于只需要年月日,不需要时分秒的场景

### 7. 表格时间显示

在表格中显示格式化的时间。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">订单列表</text>

      <view class="table">
        <view class="table-header">
          <text class="col-order">订单号</text>
          <text class="col-time">创建时间</text>
          <text class="col-status">状态</text>
        </view>

        <view v-for="order in orders" :key="order.id" class="table-row">
          <text class="col-order">{{ order.orderNo }}</text>
          <text class="col-time">{{ order.formattedTime }}</text>
          <text class="col-status">{{ order.status }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { formatTableDate } from '@/utils/date'

interface Order {
  id: number
  orderNo: string
  createTime: string
  formattedTime: string
  status: string
}

const orders = ref<Order[]>([])

onMounted(() => {
  // 模拟从API获取的数据(ISO格式字符串)
  const apiData = [
    {
      id: 1,
      orderNo: 'ORD20240115001',
      createTime: '2024-01-15T14:30:45.000Z',
      status: '已完成',
    },
    {
      id: 2,
      orderNo: 'ORD20240115002',
      createTime: '2024-01-15T15:20:30.000Z',
      status: '进行中',
    },
    {
      id: 3,
      orderNo: 'ORD20240115003',
      createTime: '2024-01-15T16:45:12.000Z',
      status: '待付款',
    },
  ]

  // 格式化时间
  orders.value = apiData.map((item) => ({
    ...item,
    formattedTime: formatTableDate(item.createTime, 'yyyy-MM-dd HH:mm'),
  }))
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.table {
  background-color: #fff;
  border-radius: 8rpx;
  overflow: hidden;
}

.table-header,
.table-row {
  display: flex;
  padding: 20rpx 16rpx;
  border-bottom: 1rpx solid #e4e7ed;
}

.table-header {
  background-color: #f5f7fa;
  font-weight: bold;
}

.table-row:last-child {
  border-bottom: none;
}

.col-order {
  flex: 0 0 180rpx;
  font-size: 24rpx;
}

.col-time {
  flex: 1;
  font-size: 24rpx;
}

.col-status {
  flex: 0 0 120rpx;
  text-align: right;
  font-size: 24rpx;
}
</style>
```

**使用场景**:
- 表格数据展示
- 列表时间显示
- API返回的ISO格式时间处理

## 高级用法

### 1. 日期计算

计算日期之间的天数差,判断是否同一天,日期加减等。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">日期计算</text>

      <view class="calc-section">
        <text class="section-title">计算两个日期之间的天数</text>
        <view class="date-inputs">
          <picker mode="date" :value="date1" @change="onDate1Change">
            <view class="picker-input">{{ date1 || '选择日期1' }}</view>
          </picker>
          <text class="separator">→</text>
          <picker mode="date" :value="date2" @change="onDate2Change">
            <view class="picker-input">{{ date2 || '选择日期2' }}</view>
          </picker>
        </view>
        <view v-if="date1 && date2" class="result">
          <text>相差 {{ daysBetween }} 天</text>
        </view>
      </view>

      <view class="calc-section">
        <text class="section-title">日期加减</text>
        <view class="date-add">
          <picker mode="date" :value="baseDate" @change="onBaseDateChange">
            <view class="picker-input">{{ baseDate || '选择基准日期' }}</view>
          </picker>

          <view class="add-controls">
            <button @click="addDays(-7)">-7天</button>
            <button @click="addDays(-1)">-1天</button>
            <button @click="addDays(1)">+1天</button>
            <button @click="addDays(7)">+7天</button>
          </view>

          <view class="add-controls">
            <button @click="addMonths(-1)">-1月</button>
            <button @click="addMonths(1)">+1月</button>
            <button @click="addYears(-1)">-1年</button>
            <button @click="addYears(1)">+1年</button>
          </view>

          <view v-if="resultDate" class="result">
            <text>结果: {{ resultDate }}</text>
          </view>
        </view>
      </view>

      <view class="calc-section">
        <text class="section-title">判断是否同一天</text>
        <view class="same-day-check">
          <picker mode="date" :value="checkDate1" @change="onCheckDate1Change">
            <view class="picker-input">{{ checkDate1 || '日期1' }}</view>
          </picker>
          <picker mode="date" :value="checkDate2" @change="onCheckDate2Change">
            <view class="picker-input">{{ checkDate2 || '日期2' }}</view>
          </picker>
          <view v-if="checkDate1 && checkDate2" class="result">
            <text :class="isSame ? 'same' : 'different'">
              {{ isSame ? '✓ 是同一天' : '✗ 不是同一天' }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { getDaysBetween, isSameDay, dateAdd, formatDay } from '@/utils/date'

// 计算天数差
const date1 = ref('')
const date2 = ref('')

const daysBetween = computed(() => {
  if (!date1.value || !date2.value) return 0
  return getDaysBetween(new Date(date1.value), new Date(date2.value))
})

const onDate1Change = (e: any) => {
  date1.value = e.detail.value
}

const onDate2Change = (e: any) => {
  date2.value = e.detail.value
}

// 日期加减
const baseDate = ref('')
const resultDate = ref('')

const onBaseDateChange = (e: any) => {
  baseDate.value = e.detail.value
  resultDate.value = baseDate.value
}

const addDays = (days: number) => {
  if (!baseDate.value) {
    uni.showToast({
      title: '请先选择基准日期',
      icon: 'none',
    })
    return
  }
  const result = dateAdd(new Date(baseDate.value), 'day', days)
  resultDate.value = formatDay(result)
}

const addMonths = (months: number) => {
  if (!baseDate.value) {
    uni.showToast({
      title: '请先选择基准日期',
      icon: 'none',
    })
    return
  }
  const result = dateAdd(new Date(baseDate.value), 'month', months)
  resultDate.value = formatDay(result)
}

const addYears = (years: number) => {
  if (!baseDate.value) {
    uni.showToast({
      title: '请先选择基准日期',
      icon: 'none',
    })
    return
  }
  const result = dateAdd(new Date(baseDate.value), 'year', years)
  resultDate.value = formatDay(result)
}

// 判断是否同一天
const checkDate1 = ref('')
const checkDate2 = ref('')

const isSame = computed(() => {
  if (!checkDate1.value || !checkDate2.value) return false
  return isSameDay(new Date(checkDate1.value), new Date(checkDate2.value))
})

const onCheckDate1Change = (e: any) => {
  checkDate1.value = e.detail.value
}

const onCheckDate2Change = (e: any) => {
  checkDate2.value = e.detail.value
}
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.calc-section {
  margin-bottom: 40rpx;
  padding: 24rpx;
  background-color: #f5f7fa;
  border-radius: 8rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #606266;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.picker-input {
  flex: 1;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  background-color: #fff;
  border: 1rpx solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.separator {
  color: #909399;
}

.date-add {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.add-controls {
  display: flex;
  gap: 10rpx;

  button {
    flex: 1;
    height: 60rpx;
    line-height: 60rpx;
    padding: 0;
    font-size: 24rpx;

    &::after {
      border: none;
    }
  }
}

.same-day-check {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.result {
  padding: 20rpx;
  background-color: #ecf5ff;
  border: 1rpx solid #b3d8ff;
  border-radius: 8rpx;
  text-align: center;

  text {
    font-size: 28rpx;
    color: #409eff;
    font-weight: bold;

    &.same {
      color: #67c23a;
    }

    &.different {
      color: #f56c6c;
    }
  }
}
</style>
```

**日期计算函数**:
- `getDaysBetween(start, end)`: 计算两个日期之间的天数
- `isSameDay(date1, date2)`: 判断两个日期是否是同一天
- `dateAdd(date, type, value)`: 日期加减,type可为'day'/'month'/'year'

### 2. 获取周数和本周范围

获取日期是一年中的第几周,以及获取本周的开始和结束日期。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">周历信息</text>

      <view class="week-info">
        <view class="info-card">
          <text class="info-label">今天是本年第几周</text>
          <text class="info-value">第 {{ weekOfYear }} 周</text>
        </view>

        <view class="info-card">
          <text class="info-label">本周范围</text>
          <view class="week-range">
            <text>{{ weekStart }}</text>
            <text class="separator">~</text>
            <text>{{ weekEnd }}</text>
          </view>
        </view>

        <view class="info-card">
          <text class="info-label">本周已过天数</text>
          <text class="info-value">{{ daysPassedInWeek }} 天</text>
        </view>

        <view class="info-card">
          <text class="info-label">本周剩余天数</text>
          <text class="info-value">{{ daysLeftInWeek }} 天</text>
        </view>
      </view>

      <button @click="refreshWeekInfo">刷新信息</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { getWeekOfYear, getCurrentWeekRange, formatDay, getDaysBetween } from '@/utils/date'

const weekOfYear = ref(0)
const weekStart = ref('')
const weekEnd = ref('')
const daysPassedInWeek = ref(0)
const daysLeftInWeek = ref(0)

// 刷新周信息
const refreshWeekInfo = () => {
  const today = new Date()

  // 获取周数
  weekOfYear.value = getWeekOfYear(today)

  // 获取本周范围
  const range = getCurrentWeekRange()
  weekStart.value = formatDay(range[0])
  weekEnd.value = formatDay(range[1])

  // 计算天数
  daysPassedInWeek.value = getDaysBetween(range[0], today)
  daysLeftInWeek.value = getDaysBetween(today, range[1])

  uni.showToast({
    title: '已刷新',
    icon: 'success',
  })
}

// 初始化
refreshWeekInfo()
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.week-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.info-card {
  padding: 24rpx;
  background-color: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.info-label {
  display: block;
  font-size: 24rpx;
  color: #909399;
  margin-bottom: 10rpx;
}

.info-value {
  display: block;
  font-size: 36rpx;
  color: #409eff;
  font-weight: bold;
}

.week-range {
  display: flex;
  flex-direction: column;
  font-size: 24rpx;
  color: #303133;

  text {
    margin-bottom: 5rpx;
  }

  .separator {
    color: #909399;
  }
}

button {
  width: 100%;
}
</style>
```

**周相关函数**:
- `getWeekOfYear(date)`: 获取日期是一年中的第几周
- `getCurrentWeekRange()`: 获取本周范围,返回 [周一日期, 周日日期]

### 3. 本月范围和日历视图

获取本月的开始和结束日期,可用于实现日历视图。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">月历信息</text>

      <view class="month-header">
        <button class="nav-btn" @click="prevMonth">‹</button>
        <text class="month-title">{{ currentYearMonth }}</text>
        <button class="nav-btn" @click="nextMonth">›</button>
      </view>

      <view class="month-info">
        <view class="info-item">
          <text class="label">本月第一天:</text>
          <text class="value">{{ monthStart }}</text>
        </view>
        <view class="info-item">
          <text class="label">本月最后一天:</text>
          <text class="value">{{ monthEnd }}</text>
        </view>
        <view class="info-item">
          <text class="label">本月天数:</text>
          <text class="value">{{ monthDays }} 天</text>
        </view>
        <view class="info-item">
          <text class="label">已过天数:</text>
          <text class="value">{{ daysPassedInMonth }} 天</text>
        </view>
      </view>

      <button @click="goToday">回到今天</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { getCurrentMonthRange, formatDay, formatDate, getDaysBetween, dateAdd } from '@/utils/date'

const viewDate = ref(new Date())
const monthStart = ref('')
const monthEnd = ref('')

const currentYearMonth = computed(() => {
  return formatDate(viewDate.value, 'yyyy年MM月')
})

const monthDays = computed(() => {
  if (!monthStart.value || !monthEnd.value) return 0
  return getDaysBetween(new Date(monthStart.value), new Date(monthEnd.value)) + 1
})

const daysPassedInMonth = computed(() => {
  const today = new Date()
  const startDate = new Date(monthStart.value)

  // 只在当前月份时计算
  if (
    today.getFullYear() === viewDate.value.getFullYear() &&
    today.getMonth() === viewDate.value.getMonth()
  ) {
    return getDaysBetween(startDate, today)
  }

  return 0
})

// 更新月份信息
const updateMonthInfo = () => {
  // 临时设置Date为查看的月份
  const temp = new Date()
  temp.setFullYear(viewDate.value.getFullYear())
  temp.setMonth(viewDate.value.getMonth())

  const range = getCurrentMonthRange()
  monthStart.value = formatDay(range[0])
  monthEnd.value = formatDay(range[1])
}

// 上一月
const prevMonth = () => {
  viewDate.value = dateAdd(viewDate.value, 'month', -1)
  updateMonthInfo()
}

// 下一月
const nextMonth = () => {
  viewDate.value = dateAdd(viewDate.value, 'month', 1)
  updateMonthInfo()
}

// 回到今天
const goToday = () => {
  viewDate.value = new Date()
  updateMonthInfo()
  uni.showToast({
    title: '已回到今天',
    icon: 'success',
  })
}

// 初始化
updateMonthInfo()
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.nav-btn {
  width: 80rpx;
  height: 60rpx;
  line-height: 60rpx;
  padding: 0;
  font-size: 36rpx;
  background-color: #f5f7fa;

  &::after {
    border: none;
  }
}

.month-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
}

.month-info {
  background-color: #f5f7fa;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #e4e7ed;

  &:last-child {
    border-bottom: none;
  }
}

.label {
  color: #606266;
  font-size: 28rpx;
}

.value {
  color: #303133;
  font-size: 28rpx;
  font-weight: bold;
}

button {
  width: 100%;
}
</style>
```

**月份相关函数**:
- `getCurrentMonthRange()`: 获取本月范围,返回 [第一天, 最后一天]

### 4. API查询参数日期范围

在API请求中添加日期范围参数。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">数据筛选</text>

      <view class="filter-form">
        <view class="form-item">
          <text class="label">日期范围:</text>
          <view class="date-range-picker">
            <picker mode="date" :value="dateRange[0]" @change="onStartDateChange">
              <view class="picker-input">{{ dateRange[0] || '开始日期' }}</view>
            </picker>
            <text class="separator">~</text>
            <picker mode="date" :value="dateRange[1]" @change="onEndDateChange">
              <view class="picker-input">{{ dateRange[1] || '结束日期' }}</view>
            </picker>
          </view>
        </view>

        <button @click="fetchData">查询数据</button>
      </view>

      <view v-if="queryParams" class="query-result">
        <text class="result-title">请求参数:</text>
        <text class="result-content">{{ JSON.stringify(queryParams, null, 2) }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { addDateRange } from '@/utils/date'

const dateRange = ref<[string, string]>(['', ''])
const queryParams = ref<any>(null)

const onStartDateChange = (e: any) => {
  dateRange.value[0] = e.detail.value
}

const onEndDateChange = (e: any) => {
  dateRange.value[1] = e.detail.value
}

// 查询数据
const fetchData = () => {
  // 构建基础参数
  let params: any = {
    params: {
      keyword: '测试',
      status: 1,
    },
  }

  // 添加日期范围参数
  // 会自动添加 beginTime 和 endTime 字段
  params = addDateRange(params, dateRange.value)

  queryParams.value = params

  // 实际项目中这里会调用API
  console.log('查询参数:', params)

  uni.showToast({
    title: '参数已生成',
    icon: 'success',
  })
}
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.filter-form {
  background-color: #f5f7fa;
  border-radius: 8rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #606266;
  margin-bottom: 10rpx;
}

.date-range-picker {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.picker-input {
  flex: 1;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  background-color: #fff;
  border: 1rpx solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.separator {
  color: #909399;
}

.query-result {
  padding: 20rpx;
  background-color: #f5f7fa;
  border-radius: 8rpx;
}

.result-title {
  display: block;
  font-size: 28rpx;
  color: #606266;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.result-content {
  display: block;
  font-size: 24rpx;
  color: #303133;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

button {
  width: 100%;
}
</style>
```

**addDateRange函数说明**:
- 自动添加 beginTime 和 endTime 参数
- 支持自定义字段名前缀
- 自动处理空值情况

## API

### formatDate

格式化日期为指定格式字符串。

```typescript
function formatDate(
  time: Date | string | number,
  pattern?: string
): string
```

**参数**:
- `time`: 日期,可以是Date对象、时间戳(秒/毫秒)或日期字符串
- `pattern`: 格式模式,默认 `'yyyy-MM-dd HH:mm:ss'`

**返回值**: 格式化后的日期字符串

**格式模式**:
- `yyyy` 或 `YYYY`: 四位年份 (2024)
- `yy` 或 `YY`: 两位年份 (24)
- `MM`: 两位月份,补零 (01-12)
- `M`: 月份,不补零 (1-12)
- `dd` 或 `DD`: 两位日期,补零 (01-31)
- `d` 或 `D`: 日期,不补零 (1-31)
- `HH`: 两位小时,24小时制,补零 (00-23)
- `H`: 小时,24小时制,不补零 (0-23)
- `hh`: 两位小时,12小时制,补零 (01-12)
- `h`: 小时,12小时制,不补零 (1-12)
- `mm`: 两位分钟,补零 (00-59)
- `m`: 分钟,不补零 (0-59)
- `ss`: 两位秒,补零 (00-59)
- `s`: 秒,不补零 (0-59)
- `SSS`: 三位毫秒 (000-999)
- `w`: 星期 (日/一/二/三/四/五/六)

**示例**:
```typescript
formatDate(new Date(), 'yyyy-MM-dd') // '2024-01-15'
formatDate(1705299045000, 'HH:mm:ss') // '14:30:45'
formatDate('2024-01-15', 'yyyy年MM月dd日') // '2024年01月15日'
```

### formatTableDate

格式化表格中的日期字段,专门用于处理后端返回的日期字符串。

```typescript
function formatTableDate(
  cellValue: string,
  pattern?: string
): string
```

**参数**:
- `cellValue`: 表格单元格的日期值(通常是ISO格式字符串)
- `pattern`: 格式模式,默认 `'yyyy-MM-dd HH:mm:ss'`

**返回值**: 格式化后的日期字符串,如果输入为空则返回空字符串

**示例**:
```typescript
formatTableDate('2024-01-15T14:30:45.000Z') // '2024-01-15 14:30:45'
formatTableDate('2024-01-15T14:30:45.000Z', 'yyyy-MM-dd') // '2024-01-15'
formatTableDate('', 'yyyy-MM-dd') // ''
```

### formatDay

快速格式化日期为年月日格式(yyyy-MM-dd)。

```typescript
function formatDay(
  time: Date | string | number
): string
```

**参数**:
- `time`: 日期,可以是Date对象、时间戳或日期字符串

**返回值**: 年月日格式的日期字符串

**示例**:
```typescript
formatDay(new Date()) // '2024-01-15'
formatDay(1705299045000) // '2024-01-15'
```

### formatRelativeTime

格式化相对时间,显示人性化的时间描述。

```typescript
function formatRelativeTime(
  time: string | number,
  option?: string
): string
```

**参数**:
- `time`: 时间戳(秒或毫秒)或ISO字符串
- `option`: 可选格式,当时间超过48小时时使用此格式

**返回值**: 相对时间字符串

**规则**:
- 30秒内: "刚刚"
- 1小时内: "X分钟前"
- 24小时内: "X小时前"
- 48小时内: "1天前"
- 更早: 显示为 "MM-dd HH:mm" 或自定义格式

**示例**:
```typescript
formatRelativeTime(Date.now() - 10000) // '刚刚'
formatRelativeTime(Date.now() - 5 * 60 * 1000) // '5分钟前'
formatRelativeTime(Date.now() - 2 * 3600 * 1000) // '2小时前'
formatRelativeTime(Date.now() - 25 * 3600 * 1000) // '1天前'
formatRelativeTime(Date.now() - 3 * 24 * 3600 * 1000) // '01-12 14:30'
```

### formatDateRange

格式化日期范围为字符串。

```typescript
function formatDateRange(
  dateRange: [Date, Date],
  separator?: string,
  format?: string
): string
```

**参数**:
- `dateRange`: 日期范围数组 [开始日期, 结束日期]
- `separator`: 分隔符,默认 `' ~ '`
- `format`: 日期格式,默认 `'yyyy-MM-dd'`

**返回值**: 格式化后的日期范围字符串

**示例**:
```typescript
const range: [Date, Date] = [new Date('2024-01-01'), new Date('2024-01-15')]
formatDateRange(range) // '2024-01-01 ~ 2024-01-15'
formatDateRange(range, ' 至 ', 'yyyy年MM月dd日') // '2024年01月01日 至 2024年01月15日'
```

### getCurrentTime

获取当前时间的格式化字符串。

```typescript
function getCurrentTime(
  pattern?: string
): string
```

**参数**:
- `pattern`: 格式模式,默认 `'HH:mm:ss'`

**返回值**: 格式化后的当前时间字符串

**示例**:
```typescript
getCurrentTime() // '14:30:45'
getCurrentTime('HH:mm') // '14:30'
```

### getCurrentDate

获取当前日期(yyyy-MM-dd格式)。

```typescript
function getCurrentDate(): string
```

**返回值**: 当前日期字符串

**示例**:
```typescript
getCurrentDate() // '2024-01-15'
```

### getCurrentDateTime

获取当前完整日期时间(yyyy-MM-dd HH:mm:ss格式)。

```typescript
function getCurrentDateTime(): string
```

**返回值**: 当前完整日期时间字符串

**示例**:
```typescript
getCurrentDateTime() // '2024-01-15 14:30:45'
```

### getTimeStamp

获取当前时间戳。

```typescript
function getTimeStamp(
  type: 'ms' | 's'
): number
```

**参数**:
- `type`: 时间戳类型,'ms'表示毫秒,'s'表示秒

**返回值**: 当前时间戳

**示例**:
```typescript
getTimeStamp('ms') // 1705299045000 (13位)
getTimeStamp('s') // 1705299045 (10位)
```

### parseDate

解析日期字符串为Date对象。

```typescript
function parseDate(
  dateStr: string
): Date | null
```

**参数**:
- `dateStr`: 日期字符串,支持多种格式

**返回值**: Date对象,解析失败返回null

**支持的格式**:
- ISO 8601: `'2024-01-15T14:30:45.000Z'`
- 标准格式: `'2024-01-15'`, `'2024/01/15'`
- 带时间: `'2024-01-15 14:30:45'`

**示例**:
```typescript
parseDate('2024-01-15') // Date对象
parseDate('2024-01-15T14:30:45.000Z') // Date对象
parseDate('invalid') // null
```

### getDateRange

获取指定天数的日期范围。

```typescript
function getDateRange(
  days: number
): [Date, Date]
```

**参数**:
- `days`: 天数,正数表示未来,负数表示过去

**返回值**: 日期范围 [开始日期, 结束日期]

**示例**:
```typescript
getDateRange(7) // 今天到7天后
getDateRange(-7) // 7天前到今天
```

### getCurrentWeekRange

获取本周的日期范围(周一到周日)。

```typescript
function getCurrentWeekRange(): [Date, Date]
```

**返回值**: 本周范围 [周一, 周日]

**示例**:
```typescript
getCurrentWeekRange() // [2024-01-15 00:00:00, 2024-01-21 23:59:59]
```

### getCurrentMonthRange

获取本月的日期范围(第一天到最后一天)。

```typescript
function getCurrentMonthRange(): [Date, Date]
```

**返回值**: 本月范围 [第一天, 最后一天]

**示例**:
```typescript
getCurrentMonthRange() // [2024-01-01 00:00:00, 2024-01-31 23:59:59]
```

### getDateRangeByType

根据类型获取预设的日期范围字符串。

```typescript
function getDateRangeByType(
  dateType: string
): [string, string] | null
```

**参数**:
- `dateType`: 范围类型
  - `'today'`: 今天
  - `'yesterday'`: 昨天
  - `'week'`: 本周
  - `'month'`: 本月
  - `'year'`: 本年

**返回值**: 日期范围字符串 [开始, 结束],无效类型返回null

**示例**:
```typescript
getDateRangeByType('today') // ['2024-01-15 00:00:00', '2024-01-15 23:59:59']
getDateRangeByType('week') // ['2024-01-15 00:00:00', '2024-01-21 23:59:59']
getDateRangeByType('month') // ['2024-01-01 00:00:00', '2024-01-31 23:59:59']
```

### initDateRangeFromQuery

从URL查询参数初始化日期范围。

```typescript
function initDateRangeFromQuery(
  query: Record<string, any>,
  dateParamName?: string
): [string, string] | ['', '']
```

**参数**:
- `query`: 路由查询对象
- `dateParamName`: 日期范围参数名,默认 `'dateRange'`

**返回值**: 日期范围数组,未找到返回空数组

**示例**:
```typescript
const query = { dateRange: 'today', keyword: 'test' }
initDateRangeFromQuery(query) // ['2024-01-15 00:00:00', '2024-01-15 23:59:59']
initDateRangeFromQuery({}, 'dateRange') // ['', '']
```

### addDateRange

为API请求参数添加日期范围字段。

```typescript
function addDateRange(
  params: any,
  dateRange: any[],
  propName?: string
): any
```

**参数**:
- `params`: 请求参数对象
- `dateRange`: 日期范围数组 [开始, 结束]
- `propName`: 字段名前缀,默认为空

**返回值**: 添加了日期范围的参数对象

**添加的字段**:
- 无前缀: `beginTime`, `endTime`
- 有前缀: `{propName}BeginTime`, `{propName}EndTime`

**示例**:
```typescript
const params = { keyword: 'test' }
addDateRange(params, ['2024-01-01', '2024-01-15'])
// { keyword: 'test', params: { beginTime: '2024-01-01', endTime: '2024-01-15' } }

addDateRange(params, ['2024-01-01', '2024-01-15'], 'create')
// { keyword: 'test', params: { createBeginTime: '2024-01-01', createEndTime: '2024-01-15' } }
```

### getDaysBetween

计算两个日期之间的天数差。

```typescript
function getDaysBetween(
  start: Date,
  end: Date
): number
```

**参数**:
- `start`: 开始日期
- `end`: 结束日期

**返回值**: 天数差(整数)

**示例**:
```typescript
const start = new Date('2024-01-01')
const end = new Date('2024-01-15')
getDaysBetween(start, end) // 14
```

### isSameDay

判断两个日期是否是同一天。

```typescript
function isSameDay(
  date1: Date,
  date2: Date
): boolean
```

**参数**:
- `date1`: 第一个日期
- `date2`: 第二个日期

**返回值**: 是否是同一天

**示例**:
```typescript
const date1 = new Date('2024-01-15 10:00:00')
const date2 = new Date('2024-01-15 18:00:00')
isSameDay(date1, date2) // true

const date3 = new Date('2024-01-16')
isSameDay(date1, date3) // false
```

### getWeekOfYear

获取日期是一年中的第几周。

```typescript
function getWeekOfYear(
  date: Date
): number
```

**参数**:
- `date`: 日期对象

**返回值**: 周数 (1-53)

**示例**:
```typescript
getWeekOfYear(new Date('2024-01-15')) // 3
getWeekOfYear(new Date('2024-12-31')) // 53
```

### dateAdd

日期加减运算。

```typescript
function dateAdd(
  date: Date,
  type: 'day' | 'month' | 'year',
  value: number
): Date
```

**参数**:
- `date`: 基准日期
- `type`: 加减类型
  - `'day'`: 天
  - `'month'`: 月
  - `'year'`: 年
- `value`: 加减的数值,正数为加,负数为减

**返回值**: 计算后的新Date对象

**示例**:
```typescript
const date = new Date('2024-01-15')

dateAdd(date, 'day', 7) // 2024-01-22
dateAdd(date, 'day', -7) // 2024-01-08
dateAdd(date, 'month', 1) // 2024-02-15
dateAdd(date, 'year', 1) // 2025-01-15
```

### padZero

数字补零工具函数。

```typescript
function padZero(
  num: number,
  targetLength?: number
): string
```

**参数**:
- `num`: 要补零的数字
- `targetLength`: 目标长度,默认 2

**返回值**: 补零后的字符串

**示例**:
```typescript
padZero(5) // '05'
padZero(15) // '15'
padZero(5, 3) // '005'
```

## 类型定义

```typescript
/**
 * 日期范围元组类型
 */
type DateRange = [Date, Date]

/**
 * 日期范围字符串元组类型
 */
type DateRangeString = [string, string]

/**
 * 时间戳类型
 */
type TimeStampType = 'ms' | 's'

/**
 * 日期输入类型
 */
type DateInput = Date | string | number

/**
 * 日期加减类型
 */
type DateAddType = 'day' | 'month' | 'year'

/**
 * 预设日期范围类型
 */
type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'year'

/**
 * 格式化模式类型
 */
type FormatPattern = string

/**
 * API参数扩展接口
 */
interface ApiParams {
  params?: {
    [key: string]: any
    beginTime?: string
    endTime?: string
  }
}
```

## 最佳实践

### 1. 统一使用date工具,避免直接操作Date

✅ **推荐**:
```typescript
import { formatDate, getCurrentDate } from '@/utils/date'

const today = getCurrentDate()
const formatted = formatDate(new Date(), 'yyyy-MM-dd')
```

❌ **不推荐**:
```typescript
const today = new Date().toISOString().split('T')[0]
const year = new Date().getFullYear()
const month = String(new Date().getMonth() + 1).padStart(2, '0')
const day = String(new Date().getDate()).padStart(2, '0')
const formatted = `${year}-${month}-${day}`
```

**原因**: date工具已处理各种边界情况和格式兼容问题,直接使用更安全可靠。

### 2. 相对时间显示需要定时更新

✅ **推荐**:
```vue
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { formatRelativeTime } from '@/utils/date'

const relativeTime = ref('')
let timer: number | null = null

const updateTime = () => {
  relativeTime.value = formatRelativeTime(publishTime)
}

onMounted(() => {
  updateTime()
  // 每30秒更新一次
  timer = setInterval(updateTime, 30000) as unknown as number
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
```

❌ **不推荐**:
```vue
<script lang="ts" setup>
import { formatRelativeTime } from '@/utils/date'

// 只计算一次,不会更新
const relativeTime = formatRelativeTime(publishTime)
</script>
```

**原因**: 相对时间是动态的,"3分钟前"会变成"4分钟前",需要定时刷新。

### 3. 时间戳统一使用毫秒,formatDate会自动转换

✅ **推荐**:
```typescript
import { formatDate } from '@/utils/date'

// 后端返回秒级时间戳
const timestamp = 1705299045 // 10位

// formatDate会自动识别并转换
const formatted = formatDate(timestamp, 'yyyy-MM-dd HH:mm:ss')
```

❌ **不推荐**:
```typescript
// 手动转换
const timestamp = 1705299045
const timestampMs = timestamp * 1000
const formatted = formatDate(timestampMs, 'yyyy-MM-dd HH:mm:ss')
```

**原因**: formatDate内部已实现自动识别10位和13位时间戳,无需手动转换。

### 4. 表格日期使用formatTableDate

✅ **推荐**:
```typescript
import { formatTableDate } from '@/utils/date'

interface TableRow {
  createTime: string // 后端返回的ISO字符串
}

const formatRow = (row: TableRow) => ({
  ...row,
  createTimeFormatted: formatTableDate(row.createTime, 'yyyy-MM-dd HH:mm')
})
```

❌ **不推荐**:
```typescript
import { formatDate } from '@/utils/date'

const formatRow = (row: TableRow) => ({
  ...row,
  createTimeFormatted: row.createTime
    ? formatDate(row.createTime, 'yyyy-MM-dd HH:mm')
    : ''
})
```

**原因**: formatTableDate专门处理表格场景,自动处理空值情况。

### 5. 日期范围查询使用addDateRange

✅ **推荐**:
```typescript
import { addDateRange } from '@/utils/date'

const fetchList = (params: any, dateRange: [string, string]) => {
  const queryParams = addDateRange(params, dateRange)
  return api.get('/list', queryParams)
}
```

❌ **不推荐**:
```typescript
const fetchList = (params: any, dateRange: [string, string]) => {
  const queryParams = {
    ...params,
    beginTime: dateRange[0],
    endTime: dateRange[1]
  }
  return api.get('/list', { params: queryParams })
}
```

**原因**: addDateRange统一处理参数结构,支持自定义前缀,更灵活。

### 6. 计算日期差使用getDaysBetween而非手动计算

✅ **推荐**:
```typescript
import { getDaysBetween } from '@/utils/date'

const start = new Date('2024-01-01')
const end = new Date('2024-01-15')
const days = getDaysBetween(start, end) // 14
```

❌ **不推荐**:
```typescript
const start = new Date('2024-01-01')
const end = new Date('2024-01-15')
const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 3600 * 24))
```

**原因**: getDaysBetween考虑了时区和夏令时等问题,结果更准确。

### 7. 日期加减使用dateAdd而非手动计算

✅ **推荐**:
```typescript
import { dateAdd } from '@/utils/date'

const tomorrow = dateAdd(new Date(), 'day', 1)
const nextMonth = dateAdd(new Date(), 'month', 1)
const lastYear = dateAdd(new Date(), 'year', -1)
```

❌ **不推荐**:
```typescript
const tomorrow = new Date(Date.now() + 24 * 3600 * 1000)

const now = new Date()
const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
```

**原因**: dateAdd处理了月末、闰年等边界情况,避免出错。

### 8. 组合使用多个工具函数实现复杂逻辑

✅ **推荐**:
```typescript
import { getDateRangeByType, addDateRange, formatDate } from '@/utils/date'

// 获取本周数据
const fetchWeekData = () => {
  const weekRange = getDateRangeByType('week')
  if (weekRange) {
    const params = addDateRange({}, weekRange)
    return api.get('/data', params)
  }
}

// 格式化并计算
const displayDateInfo = (date: Date) => {
  const formatted = formatDate(date, 'yyyy-MM-dd 星期w')
  const today = new Date()
  const days = getDaysBetween(date, today)

  return {
    formatted,
    daysFromNow: days
  }
}
```

**原因**: 工具函数设计为可组合,通过组合实现复杂业务逻辑更清晰。

## 常见问题

### 1. 为什么formatDate支持yyyy和YYYY两种写法?

**问题原因**:
- 不同日期库使用不同的格式标记
- moment.js 使用 YYYY-MM-DD
- date-fns 等使用 yyyy-MM-dd
- 为了兼容开发者习惯,date工具同时支持两种写法

**解决方案**:
```typescript
// 两种写法都支持,结果相同
formatDate(new Date(), 'yyyy-MM-dd') // '2024-01-15'
formatDate(new Date(), 'YYYY-MM-DD') // '2024-01-15'

// 推荐使用小写(与TypeScript、ISO 8601一致)
formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')
```

### 2. formatRelativeTime什么时候显示"刚刚",什么时候显示具体时间?

**规则说明**:
- 30秒内: "刚刚"
- 1分钟-59分钟: "X分钟前"
- 1小时-23小时: "X小时前"
- 24小时-48小时: "1天前"
- 超过48小时: 显示 "MM-dd HH:mm" 或自定义格式

**示例**:
```typescript
const now = Date.now()

formatRelativeTime(now) // '刚刚'
formatRelativeTime(now - 10000) // '刚刚' (10秒前)
formatRelativeTime(now - 5 * 60 * 1000) // '5分钟前'
formatRelativeTime(now - 2 * 3600 * 1000) // '2小时前'
formatRelativeTime(now - 25 * 3600 * 1000) // '1天前'
formatRelativeTime(now - 3 * 24 * 3600 * 1000) // '01-12 14:30'

// 自定义超过48小时后的格式
formatRelativeTime(now - 3 * 24 * 3600 * 1000, 'yyyy-MM-dd') // '2024-01-12'
```

### 3. 后端返回的时间戳是10位还是13位?如何处理?

**问题原因**:
- JavaScript时间戳是13位(毫秒)
- 部分后端(如Java、PHP)返回10位(秒)
- 需要统一处理避免错误

**解决方案**:
```typescript
// formatDate会自动识别并转换
const timestamp10 = 1705299045 // 10位秒级
const timestamp13 = 1705299045000 // 13位毫秒级

formatDate(timestamp10, 'yyyy-MM-dd') // 自动转换为毫秒
formatDate(timestamp13, 'yyyy-MM-dd') // 直接使用

// 判断逻辑:
// 如果数字小于10000000000(10位数最大值),则认为是秒级,乘以1000转换
```

### 4. getDateRangeByType返回的时间包含时分秒吗?

**是的,包含完整的时分秒**:

```typescript
// 今天: 00:00:00 到 23:59:59
getDateRangeByType('today')
// ['2024-01-15 00:00:00', '2024-01-15 23:59:59']

// 本周: 周一00:00:00 到 周日23:59:59
getDateRangeByType('week')
// ['2024-01-15 00:00:00', '2024-01-21 23:59:59']

// 本月: 第一天00:00:00 到 最后一天23:59:59
getDateRangeByType('month')
// ['2024-01-01 00:00:00', '2024-01-31 23:59:59']
```

**原因**: 用于查询时需要覆盖整天,所以开始时间是00:00:00,结束时间是23:59:59。

### 5. getCurrentWeekRange的周一是如何计算的?

**计算规则**:
- 使用ISO 8601标准: 周一作为一周的第一天
- 周日作为一周的最后一天
- 自动处理跨年情况

**示例**:
```typescript
// 假设今天是2024-01-15(周一)
getCurrentWeekRange()
// [2024-01-15 00:00:00, 2024-01-21 23:59:59]

// 假设今天是2024-01-17(周三)
getCurrentWeekRange()
// [2024-01-15 00:00:00, 2024-01-21 23:59:59]

// 假设今天是2024-01-21(周日)
getCurrentWeekRange()
// [2024-01-15 00:00:00, 2024-01-21 23:59:59]
```

### 6. dateAdd加减月份时,如何处理月末日期?

**处理规则**:
- 使用JavaScript原生Date逻辑
- 如果目标月份没有该日期,自动调整到该月最后一天

**示例**:
```typescript
// 1月31日 + 1个月
const jan31 = new Date('2024-01-31')
dateAdd(jan31, 'month', 1)
// 2024-02-29 (2024年是闰年,2月有29天)

// 1月31日 + 2个月
dateAdd(jan31, 'month', 2)
// 2024-03-31

// 8月31日 + 1个月
const aug31 = new Date('2024-08-31')
dateAdd(aug31, 'month', 1)
// 2024-09-30 (9月只有30天)
```

### 7. 如何从路由参数自动初始化日期范围?

**使用initDateRangeFromQuery**:

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { initDateRangeFromQuery } from '@/utils/date'
import { onLoad } from '@dcloudio/uni-app'

const dateRange = ref<[string, string]>(['', ''])

// uni-app页面加载
onLoad((options) => {
  // URL: /pages/list?dateRange=week
  dateRange.value = initDateRangeFromQuery(options)
  // 自动设置为本周范围
})
</script>
```

**路由参数示例**:
```typescript
// 路由: /pages/list?dateRange=today
initDateRangeFromQuery({ dateRange: 'today' })
// ['2024-01-15 00:00:00', '2024-01-15 23:59:59']

// 路由: /pages/list?dateRange=week
initDateRangeFromQuery({ dateRange: 'week' })
// ['2024-01-15 00:00:00', '2024-01-21 23:59:59']

// 无参数
initDateRangeFromQuery({})
// ['', '']
```

### 8. formatTableDate和formatDate有什么区别?

**主要区别**:

1. **空值处理**:
```typescript
// formatTableDate自动处理空值
formatTableDate('') // ''
formatTableDate(null as any) // ''
formatTableDate(undefined as any) // ''

// formatDate会报错或返回Invalid Date
formatDate('') // 可能出错
```

2. **使用场景**:
```typescript
// formatTableDate: 表格数据展示
const tableData = apiData.map(row => ({
  ...row,
  createTime: formatTableDate(row.createTime)
}))

// formatDate: 通用日期格式化
const displayDate = formatDate(new Date(), 'yyyy-MM-dd')
```

3. **默认格式**:
```typescript
// 两者默认格式相同
formatTableDate(time) // 默认 'yyyy-MM-dd HH:mm:ss'
formatDate(time) // 默认 'yyyy-MM-dd HH:mm:ss'
```

**推荐**: 表格场景使用formatTableDate,其他场景使用formatDate。

