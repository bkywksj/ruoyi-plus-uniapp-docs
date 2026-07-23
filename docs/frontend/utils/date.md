# 日期工具 (date.ts)

日期工具类，提供日期格式化、转换、计算的通用工具函数。自动兼容两种格式语法：`yyyy-MM-dd HH:mm:ss` 和 `YYYY-MM-DD HH:mm:ss`。

## 概述

日期工具库包含以下功能类别：
- **日期格式化**：将日期转换为特定格式的字符串
- **日期解析**：将字符串解析为日期对象
- **当前时间获取**：获取当前时间的各种格式
- **日期范围获取**：获取特定时间范围
- **日期范围预设**：根据预设类型快速获取日期范围
- **日期计算**：计算日期之间的关系和差值
- **辅助函数**：数字补零等辅助功能

## JavaScript 日期基础

### Date对象原理

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     JavaScript Date 对象                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Date 对象内部存储:                                                     │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │  时间戳 (毫秒)                                               │       │
│   │  1673766645000                                               │       │
│   │  ↓                                                           │       │
│   │  自 1970-01-01 00:00:00 UTC 以来的毫秒数                     │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
│   Date 对象方法:                                                         │
│   ┌─────────────────┬────────────────────────────────────────┐          │
│   │ 获取方法         │ 说明                                   │          │
│   ├─────────────────┼────────────────────────────────────────┤          │
│   │ getFullYear()   │ 获取年份 (4位)                         │          │
│   │ getMonth()      │ 获取月份 (0-11，需要+1)                │          │
│   │ getDate()       │ 获取日期 (1-31)                        │          │
│   │ getDay()        │ 获取星期 (0-6，0=周日)                 │          │
│   │ getHours()      │ 获取小时 (0-23)                        │          │
│   │ getMinutes()    │ 获取分钟 (0-59)                        │          │
│   │ getSeconds()    │ 获取秒数 (0-59)                        │          │
│   │ getTime()       │ 获取时间戳 (毫秒)                      │          │
│   └─────────────────┴────────────────────────────────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 时区处理

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        时区概念                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   UTC (协调世界时):                                                      │
│   ├── 格林威治时间，无时区偏移                                           │
│   ├── 例: 2023-01-15T14:30:45.000Z                                      │
│   └── Z 表示 UTC 时间                                                   │
│                                                                          │
│   本地时间:                                                              │
│   ├── 受系统时区影响                                                     │
│   ├── 中国时区 (UTC+8)                                                  │
│   └── 例: 2023-01-15 22:30:45 (北京时间)                                │
│                                                                          │
│   时间戳:                                                                │
│   ├── 与时区无关                                                         │
│   ├── 10位 = 秒级时间戳                                                 │
│   └── 13位 = 毫秒级时间戳                                               │
│                                                                          │
│   本工具特点:                                                            │
│   ├── 自动识别10位/13位时间戳                                           │
│   ├── 自动处理ISO格式日期字符串                                         │
│   └── 所有操作基于本地时区                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 日期格式化

### 格式化字符对照表

| 字符 | 说明 | 示例 |
|------|------|------|
| `yyyy`/`YYYY` | 四位年份 | 2023 |
| `MM` | 两位月份 | 01-12 |
| `M` | 月份 | 1-12 |
| `dd`/`DD` | 两位日期 | 01-31 |
| `d`/`D` | 日期 | 1-31 |
| `HH` | 两位小时 | 00-23 |
| `H` | 小时 | 0-23 |
| `mm` | 两位分钟 | 00-59 |
| `m` | 分钟 | 0-59 |
| `ss` | 两位秒数 | 00-59 |
| `s` | 秒数 | 0-59 |
| `SSS` | 毫秒 | 000-999 |
| `w` | 星期 | 日-六 |

### formatDate

日期格式化，自动兼容两种格式语法。

```typescript
formatDate(
  time: Date | string | number,
  pattern: string = 'yyyy-MM-dd HH:mm:ss'
): string
```

**参数：**
- `time` - 日期对象、字符串或时间戳
- `pattern` - 格式化模式，默认为 'yyyy-MM-dd HH:mm:ss'

**返回值：**
- `string` - 格式化后的日期字符串

**实现原理：**

```typescript
export const formatDate = (time: Date | string | number, pattern: string = 'yyyy-MM-dd HH:mm:ss'): string => {
  if (!time) {
    return ''
  }

  let date: Date
  if (typeof time === 'object') {
    date = time as Date
  } else {
    if (typeof time === 'string') {
      if (/^\d+$/.test(time)) {
        time = Number.parseInt(time)
      } else {
        // 处理 ISO 日期字符串
        time = time.replace(/-/g, '/').replace('T', ' ').replace(/\.\d+/, '')
      }
    }

    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const milliseconds = date.getMilliseconds()
  const week = date.getDay()

  // 同时支持两种格式语法
  const formatObj: { [key: string]: number | string } = {
    yyyy: year,
    YYYY: year,
    MM: padZero(month),
    M: month,
    dd: padZero(day),
    DD: padZero(day),
    d: day,
    D: day,
    HH: padZero(hours),
    H: hours,
    mm: padZero(minutes),
    m: minutes,
    ss: padZero(seconds),
    s: seconds,
    SSS: padZero(milliseconds, 3),
    w: week
  }

  return pattern.replace(/(yyyy|YYYY|MM|M|dd|DD|[dD]|HH|H|mm|m|SSS|ss|[sw])/g, (match) => {
    const value = formatObj[match]
    if (match === 'w') {
      return ['日', '一', '二', '三', '四', '五', '六'][value as number]
    }
    return value.toString()
  })
}
```

**示例：**

```typescript
const now = new Date('2023-01-15 14:30:45')

// 基本格式化
formatDate(now)                    // "2023-01-15 14:30:45"
formatDate(now, 'yyyy-MM-dd')      // "2023-01-15"
formatDate(now, 'YYYY-MM-DD')      // "2023-01-15" (兼容语法)
formatDate(now, 'MM/dd/yyyy')      // "01/15/2023"
formatDate(now, 'yyyy年MM月dd日')   // "2023年01月15日"

// 时间格式化
formatDate(now, 'HH:mm:ss')        // "14:30:45"
formatDate(now, 'H:m:s')           // "14:30:45"

// 星期格式化
formatDate(now, 'yyyy-MM-dd w')    // "2023-01-15 日"

// 时间戳格式化
formatDate(1673766645000)          // "2023-01-15 14:30:45"
formatDate('1673766645')           // "2023-01-15 14:30:45" (10位时间戳)

// ISO格式字符串
formatDate('2023-01-15T14:30:45.000Z')  // "2023-01-15 22:30:45" (转为本地时间)

// 毫秒格式化
formatDate(now, 'HH:mm:ss.SSS')    // "14:30:45.000"
```

### formatTableDate

表格时间格式化，专门用于表格单元格的时间显示。

```typescript
formatTableDate(
  cellValue: string,
  pattern: string = 'yyyy-MM-dd HH:mm:ss'
): string
```

**参数：**
- `cellValue` - 单元格时间值
- `pattern` - 日期格式

**返回值：**
- `string` - 格式化后的时间字符串

**实现原理：**

```typescript
export const formatTableDate = (cellValue: string, pattern: string = 'yyyy-MM-dd HH:mm:ss'): string => {
  if (!cellValue) return ''
  return formatDate(new Date(cellValue), pattern)
}
```

**示例：**

```typescript
// 表格数据格式化
formatTableDate('2023-01-15T14:30:45.000Z')           // "2023-01-15 22:30:45"
formatTableDate('2023-01-15T14:30:45.000Z', 'MM/dd')  // "01/15"

// 在 Element Plus 表格中使用
const columns = [
  {
    prop: 'createTime',
    label: '创建时间',
    formatter: (row) => formatTableDate(row.createTime)
  }
]
```

### formatDay

日期格式化简化版，只返回年月日。

```typescript
formatDay(time: Date | string | number): string
```

**参数：**
- `time` - 日期

**返回值：**
- `string` - 格式化后的年月日字符串（yyyy-MM-dd）

**实现原理：**

```typescript
export const formatDay = (time: Date | string | number): string => {
  return formatDate(time, 'yyyy-MM-dd')
}
```

**示例：**

```typescript
formatDay(new Date())              // "2023-01-15"
formatDay('2023-01-15 14:30:45')   // "2023-01-15"
formatDay(1673766645000)           // "2023-01-15"

// 常用于日期范围查询
const [start, end] = getCurrentMonthRange()
console.log(formatDay(start), formatDay(end))  // "2023-01-01" "2023-01-31"
```

### formatRelativeTime

相对时间格式化，显示相对于当前时间的描述。

```typescript
formatRelativeTime(time: string | number, option?: string): string
```

**参数：**
- `time` - 时间戳（秒或毫秒）
- `option` - 可选格式化模式（当时间超过2天时使用）

**返回值：**
- `string` - 相对时间字符串

**实现原理：**

```typescript
export const formatRelativeTime = (time: string | number, option?: string): string => {
  let t: number
  if (`${time}`.length === 10) {
    t = Number.parseInt(time as string) * 1000
  } else {
    t = +time
  }
  const date = new Date(t)
  const now = Date.now()

  const diff = (now - date.getTime()) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    return `${Math.ceil(diff / 60)}分钟前`
  } else if (diff < 3600 * 24) {
    return `${Math.ceil(diff / 3600)}小时前`
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }

  if (option) {
    return formatDate(date, option)
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日${date.getHours()}时${date.getMinutes()}分`
  }
}
```

**时间阈值说明：**

| 时间差 | 显示 |
|--------|------|
| < 30秒 | "刚刚" |
| < 1小时 | "X分钟前" |
| < 24小时 | "X小时前" |
| < 48小时 | "1天前" |
| ≥ 48小时 | 具体日期时间 |

**示例：**

```typescript
const now = Date.now()

formatRelativeTime(now / 1000)           // "刚刚"
formatRelativeTime(now / 1000 - 30)      // "刚刚"
formatRelativeTime(now / 1000 - 1800)    // "30分钟前"
formatRelativeTime(now / 1000 - 7200)    // "2小时前"
formatRelativeTime(now / 1000 - 86400)   // "1天前"
formatRelativeTime(now / 1000 - 172800)  // "1月15日14时30分"

// 使用自定义格式（超过2天时生效）
formatRelativeTime(now / 1000 - 172800, 'yyyy-MM-dd') // "2023-01-13"
formatRelativeTime(now / 1000 - 604800, 'MM-dd HH:mm') // "01-08 14:30"
```

### formatDateRange

格式化日期范围为字符串。

```typescript
formatDateRange(
  dateRange: [Date, Date],
  separator: string = '~',
  format: string = 'yyyy-MM-dd'
): string
```

**参数：**
- `dateRange` - 日期范围数组
- `separator` - 分隔符，默认为 '~'
- `format` - 日期格式，默认为 'yyyy-MM-dd'

**返回值：**
- `string` - 格式化后的日期范围字符串

**实现原理：**

```typescript
export const formatDateRange = (dateRange: [Date, Date], separator: string = '~', format: string = 'yyyy-MM-dd'): string => {
  if (!dateRange || dateRange.length !== 2) {
    return ''
  }
  return `${formatDate(dateRange[0], format)} ${separator} ${formatDate(dateRange[1], format)}`
}
```

**示例：**

```typescript
const start = new Date('2023-01-01')
const end = new Date('2023-01-31')

formatDateRange([start, end])                    // "2023-01-01 ~ 2023-01-31"
formatDateRange([start, end], ' 至 ')           // "2023-01-01 至 2023-01-31"
formatDateRange([start, end], '-', 'MM/dd')     // "01/01 - 01/31"
formatDateRange([start, end], ' - ', 'yyyy年MM月dd日')  // "2023年01月01日 - 2023年01月31日"

// 处理无效输入
formatDateRange(null)            // ""
formatDateRange([start])         // ""
```

## 当前时间获取

### getCurrentTime

获取当前时间。

```typescript
getCurrentTime(pattern: string = 'HH:mm:ss'): string
```

**参数：**
- `pattern` - 格式化模式，默认为 'HH:mm:ss'

**返回值：**
- `string` - 格式化后的当前时间字符串

**实现原理：**

```typescript
export const getCurrentTime = (pattern: string = 'HH:mm:ss'): string => {
  return formatDate(new Date(), pattern)
}
```

**示例：**

```typescript
getCurrentTime()                           // "14:30:45"
getCurrentTime('yyyy-MM-dd HH:mm:ss')      // "2023-01-15 14:30:45"
getCurrentTime('yyyy年MM月dd日')           // "2023年01月15日"
getCurrentTime('HH:mm')                    // "14:30"

// 实时时钟组件
setInterval(() => {
  clock.value = getCurrentTime('HH:mm:ss')
}, 1000)
```

### getCurrentDate

获取当前年月日。

```typescript
getCurrentDate(): string
```

**返回值：**
- `string` - 当前年月日字符串（yyyy-MM-dd）

**实现原理：**

```typescript
export const getCurrentDate = (): string => {
  return formatDate(new Date(), 'yyyy-MM-dd')
}
```

**示例：**

```typescript
getCurrentDate()  // "2023-01-15"

// 用于默认日期
const defaultDate = ref(getCurrentDate())

// 用于文件命名
const fileName = `report_${getCurrentDate()}.xlsx`
```

### getCurrentDateTime

获取当前完整日期时间。

```typescript
getCurrentDateTime(): string
```

**返回值：**
- `string` - 当前完整日期时间字符串（yyyy-MM-dd HH:mm:ss）

**实现原理：**

```typescript
export const getCurrentDateTime = (): string => {
  return formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')
}
```

**示例：**

```typescript
getCurrentDateTime()  // "2023-01-15 14:30:45"

// 用于日志记录
console.log(`[${getCurrentDateTime()}] 操作完成`)

// 用于创建时间字段
const record = {
  id: 1,
  createdAt: getCurrentDateTime()
}
```

## 日期解析

### parseDate

解析日期字符串为Date对象。

```typescript
parseDate(dateStr: string): Date | null
```

**参数：**
- `dateStr` - 日期字符串

**返回值：**
- `Date | null` - Date对象，解析失败返回null

**实现原理：**

```typescript
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) {
    return null
  }

  const date = new Date(dateStr)
  return Number.isNaN(date.getTime()) ? null : date
}
```

**示例：**

```typescript
parseDate('2023-01-15')           // Date对象
parseDate('2023-01-15 14:30:45')  // Date对象
parseDate('2023/01/15')           // Date对象
parseDate('Jan 15, 2023')         // Date对象
parseDate('invalid date')         // null
parseDate('')                     // null
parseDate(null)                   // null

// 安全的日期解析
const safeParse = (dateStr: string): Date => {
  return parseDate(dateStr) || new Date()
}
```

## 日期范围获取

### getTimeStamp

获取时间戳。

```typescript
getTimeStamp(type: 'ms' | 's' = 'ms'): number
```

**参数：**
- `type` - 时间戳类型，'ms'（毫秒）或 's'（秒）

**返回值：**
- `number` - 当前时间的时间戳

**实现原理：**

```typescript
export const getTimeStamp = (type: 'ms' | 's' = 'ms'): number => {
  const now = new Date().getTime()
  return type === 'ms' ? now : Math.floor(now / 1000)
}
```

**示例：**

```typescript
getTimeStamp()      // 1673766645123 (毫秒)
getTimeStamp('s')   // 1673766645 (秒)

// 用于生成唯一ID
const uniqueId = `${getTimeStamp()}_${Math.random().toString(36).substr(2, 9)}`

// 用于API请求签名
const timestamp = getTimeStamp('s')
const signature = computeSignature(params, timestamp)
```

### getDateRange

获取日期范围。

```typescript
getDateRange(days: number): [Date, Date]
```

**参数：**
- `days` - 天数，负数表示过去，正数表示未来

**返回值：**
- `[Date, Date]` - [开始日期, 结束日期]

**实现原理：**

```typescript
export const getDateRange = (days: number): [Date, Date] => {
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() + 3600 * 1000 * 24 * days)
  return [start, end]
}
```

**示例：**

```typescript
// 获取过去7天的日期范围
const [start7, end7] = getDateRange(-7)
console.log(formatDay(start7), formatDay(end7))  // "2023-01-08" "2023-01-15"

// 获取过去30天的日期范围
const [start30, end30] = getDateRange(-30)

// 获取未来7天的日期范围
const [startFuture, endFuture] = getDateRange(7)
console.log(formatDay(startFuture), formatDay(endFuture))  // "2023-01-22" "2023-01-15"
```

### getCurrentWeekRange

获取本周的开始和结束日期。

```typescript
getCurrentWeekRange(): [Date, Date]
```

**返回值：**
- `[Date, Date]` - [周一日期, 周日日期]

**实现原理：**

```typescript
export const getCurrentWeekRange = (): [Date, Date] => {
  const now = new Date()
  const currentDay = now.getDay() || 7 // 周日是0，转为7
  const monday = new Date(now)
  monday.setDate(now.getDate() - (currentDay - 1))
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(now)
  sunday.setDate(now.getDate() + (7 - currentDay))
  sunday.setHours(23, 59, 59, 999)

  return [monday, sunday]
}
```

**示例：**

```typescript
const [monday, sunday] = getCurrentWeekRange()
console.log(formatDay(monday))   // "2023-01-09" (本周一)
console.log(formatDay(sunday))   // "2023-01-15" (本周日)

// 本周数据统计
const weeklyStats = await api.getStats({
  startDate: formatDay(monday),
  endDate: formatDay(sunday)
})
```

### getCurrentMonthRange

获取本月的开始和结束日期。

```typescript
getCurrentMonthRange(): [Date, Date]
```

**返回值：**
- `[Date, Date]` - [本月第一天, 本月最后一天]

**实现原理：**

```typescript
export const getCurrentMonthRange = (): [Date, Date] => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  lastDay.setHours(23, 59, 59, 999)

  return [firstDay, lastDay]
}
```

**示例：**

```typescript
const [firstDay, lastDay] = getCurrentMonthRange()
console.log(formatDay(firstDay))  // "2023-01-01"
console.log(formatDay(lastDay))   // "2023-01-31"

// 本月数据查询
const monthlyData = await api.getData({
  beginTime: formatDay(firstDay),
  endTime: formatDay(lastDay)
})
```

### addDateRange

添加日期范围到参数对象中，常用于API请求参数构建。

```typescript
addDateRange(params: any, dateRange: any[], propName?: string): any
```

**参数：**
- `params` - 参数对象
- `dateRange` - 日期范围数组
- `propName` - 属性名称（可选）

**返回值：**
- `any` - 添加了日期范围的参数对象

**实现原理：**

```typescript
export const addDateRange = (params: any, dateRange: any[], propName?: string): any => {
  // 确保 params 属性是一个对象
  if (!params.params || typeof params.params !== 'object' || Array.isArray(params.params)) {
    params.params = {}
  }

  // 设置字段名，propName 首字母转大写
  const beginFieldName = propName ? `begin${propName.charAt(0).toUpperCase() + propName.slice(1)}` : 'beginTime'
  const endFieldName = propName ? `end${propName.charAt(0).toUpperCase() + propName.slice(1)}` : 'endTime'

  // 检查日期范围是否有效
  const isValidRange =
    Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1] && dateRange[0] !== '' && dateRange[1] !== ''

  // 如果日期范围有效，添加到参数对象
  if (isValidRange) {
    params.params[beginFieldName] = dateRange[0]
    params.params[endFieldName] = dateRange[1]
  } else {
    // 如果日期范围无效，删除相关属性
    delete params.params[beginFieldName]
    delete params.params[endFieldName]
  }

  return params
}
```

**示例：**

```typescript
const params = { name: 'test' }
const dateRange = ['2023-01-01', '2023-01-31']

// 使用默认属性名
const result = addDateRange(params, dateRange)
// 结果：{ name: 'test', params: { beginTime: '2023-01-01', endTime: '2023-01-31' } }

// 使用自定义属性名
const result2 = addDateRange(params, dateRange, 'create')
// 结果：{ name: 'test', params: { beginCreate: '2023-01-01', endCreate: '2023-01-31' } }

// 日期范围无效时自动清理
const result3 = addDateRange(params, [])
// 结果：{ name: 'test', params: {} }
```

## 日期范围预设

### getDateRangeByType

根据日期类型获取日期范围。

```typescript
getDateRangeByType(dateType: string): [string, string] | null
```

**参数：**
- `dateType` - 日期类型: 'today' | 'yesterday' | 'week' | 'month' | 'year'

**返回值：**
- `[string, string] | null` - 日期范围 [开始时间, 结束时间]，如果类型无效返回 null

**支持的类型：**

| 类型 | 说明 |
|------|------|
| `today` | 今天 (00:00:00 - 23:59:59) |
| `yesterday` | 昨天 (00:00:00 - 23:59:59) |
| `week` | 本周 (周一00:00:00 - 今天23:59:59) |
| `month` | 本月 (1号00:00:00 - 今天23:59:59) |
| `year` | 本年 (1月1日00:00:00 - 今天23:59:59) |

**实现原理：**

```typescript
export const getDateRangeByType = (dateType: string): [string, string] | null => {
  if (!dateType) return null

  const today = new Date()
  const endDate = new Date(today)
  endDate.setHours(23, 59, 59, 999)

  let startDate: Date

  switch (dateType) {
    case 'today':
      startDate = new Date(today)
      startDate.setHours(0, 0, 0, 0)
      break

    case 'yesterday':
      startDate = new Date(today)
      startDate.setDate(startDate.getDate() - 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setDate(endDate.getDate() - 1)
      endDate.setHours(23, 59, 59, 999)
      break

    case 'week':
      startDate = new Date(today)
      const dayOfWeek = startDate.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      startDate.setDate(startDate.getDate() - daysToMonday)
      startDate.setHours(0, 0, 0, 0)
      break

    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      break

    case 'year':
      startDate = new Date(today.getFullYear(), 0, 1)
      break

    default:
      return null
  }

  return [formatDate(startDate, 'yyyy-MM-dd HH:mm:ss'), formatDate(endDate, 'yyyy-MM-dd HH:mm:ss')]
}
```

**示例：**

```typescript
getDateRangeByType('today')
// => ['2023-01-15 00:00:00', '2023-01-15 23:59:59']

getDateRangeByType('yesterday')
// => ['2023-01-14 00:00:00', '2023-01-14 23:59:59']

getDateRangeByType('week')
// => ['2023-01-09 00:00:00', '2023-01-15 23:59:59']

getDateRangeByType('month')
// => ['2023-01-01 00:00:00', '2023-01-15 23:59:59']

getDateRangeByType('year')
// => ['2023-01-01 00:00:00', '2023-01-15 23:59:59']

getDateRangeByType('invalid')
// => null
```

### initDateRangeFromQuery

从路由查询参数初始化日期范围。

```typescript
initDateRangeFromQuery(query: Record<string, any>, dateParamName: string = 'dateType'): [string, string] | ['', '']
```

**参数：**
- `query` - 路由查询对象
- `dateParamName` - 日期参数名称，默认为 'dateType'

**返回值：**
- `[string, string] | ['', '']` - 日期范围数组或空数组

**示例：**

```typescript
// 在组件中使用
import { useRoute } from 'vue-router'

const route = useRoute()

// 当 route.query.dateType = 'today' 时
const dateRange = ref(initDateRangeFromQuery(route.query))
// 返回: ['2023-01-15 00:00:00', '2023-01-15 23:59:59']

// 当 route.query 没有 dateType 时
const dateRange2 = ref(initDateRangeFromQuery(route.query))
// 返回: ['', '']

// 使用自定义参数名
const dateRange3 = ref(initDateRangeFromQuery(route.query, 'range'))
// 从 route.query.range 获取日期类型
```

## 日期计算

### getDaysBetween

计算两个日期之间的天数。

```typescript
getDaysBetween(start: Date, end: Date): number
```

**参数：**
- `start` - 开始日期
- `end` - 结束日期

**返回值：**
- `number` - 天数（绝对值）

**实现原理：**

```typescript
export const getDaysBetween = (start: Date, end: Date): number => {
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  const days = (endTime - startTime) / (1000 * 60 * 60 * 24)
  return Math.abs(Math.round(days))
}
```

**示例：**

```typescript
const start = new Date('2023-01-01')
const end = new Date('2023-01-15')

getDaysBetween(start, end)  // 14
getDaysBetween(end, start)  // 14 (返回绝对值)

// 计算剩余天数
const deadline = new Date('2023-12-31')
const remaining = getDaysBetween(new Date(), deadline)
console.log(`还剩 ${remaining} 天`)
```

### isSameDay

判断是否为同一天。

```typescript
isSameDay(date1: Date, date2: Date): boolean
```

**参数：**
- `date1` - 日期1
- `date2` - 日期2

**返回值：**
- `boolean` - 是否为同一天

**实现原理：**

```typescript
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}
```

**示例：**

```typescript
const date1 = new Date('2023-01-15 10:00:00')
const date2 = new Date('2023-01-15 20:00:00')
const date3 = new Date('2023-01-16 10:00:00')

isSameDay(date1, date2)  // true
isSameDay(date1, date3)  // false

// 判断是否是今天
const isToday = isSameDay(someDate, new Date())
```

### getWeekOfYear

获取日期是一年中的第几周。

```typescript
getWeekOfYear(date: Date): number
```

**参数：**
- `date` - 日期

**返回值：**
- `number` - 周数

**实现原理：**

```typescript
export const getWeekOfYear = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}
```

**示例：**

```typescript
getWeekOfYear(new Date('2023-01-15'))  // 3 (第3周)
getWeekOfYear(new Date('2023-12-31'))  // 53 (第53周)
getWeekOfYear(new Date('2023-01-01'))  // 1 (第1周)

// 周报统计
const currentWeek = getWeekOfYear(new Date())
console.log(`本周是第 ${currentWeek} 周`)
```

### dateAdd

日期加减操作。

```typescript
dateAdd(date: Date, type: 'day' | 'month' | 'year', value: number): Date
```

**参数：**
- `date` - 基准日期
- `type` - 类型：'day'、'month'、'year'
- `value` - 增量值，可为负数

**返回值：**
- `Date` - 计算后的新日期

**实现原理：**

```typescript
export const dateAdd = (date: Date, type: 'day' | 'month' | 'year', value: number): Date => {
  const result = new Date(date)

  switch (type) {
    case 'day':
      result.setDate(result.getDate() + value)
      break
    case 'month':
      result.setMonth(result.getMonth() + value)
      break
    case 'year':
      result.setFullYear(result.getFullYear() + value)
      break
  }

  return result
}
```

**示例：**

```typescript
const baseDate = new Date('2023-01-15')

// 加减天数
dateAdd(baseDate, 'day', 7)    // 2023-01-22
dateAdd(baseDate, 'day', -7)   // 2023-01-08

// 加减月份
dateAdd(baseDate, 'month', 1)  // 2023-02-15
dateAdd(baseDate, 'month', -1) // 2022-12-15

// 加减年份
dateAdd(baseDate, 'year', 1)   // 2024-01-15
dateAdd(baseDate, 'year', -1)  // 2022-01-15

// 组合使用
const futureDate = dateAdd(dateAdd(baseDate, 'month', 6), 'day', 15)
```

## 实际应用场景

### 1. 表格时间列格式化

```vue
<template>
  <el-table :data="tableData">
    <el-table-column prop="name" label="名称" />
    <el-table-column prop="createTime" label="创建时间">
      <template #default="{ row }">
        {{ formatTableDate(row.createTime, 'yyyy-MM-dd HH:mm') }}
      </template>
    </el-table-column>
    <el-table-column prop="updateTime" label="更新时间">
      <template #default="{ row }">
        {{ formatRelativeTime(row.updateTime) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { formatTableDate, formatRelativeTime } from '@/utils/date'

const tableData = ref([])
</script>
```

### 2. 日期范围查询组件

```vue
<template>
  <div class="date-query">
    <!-- 快捷按钮 -->
    <el-radio-group v-model="dateType" @change="handleDateTypeChange">
      <el-radio-button value="today">今日</el-radio-button>
      <el-radio-button value="week">本周</el-radio-button>
      <el-radio-button value="month">本月</el-radio-button>
      <el-radio-button value="custom">自定义</el-radio-button>
    </el-radio-group>

    <!-- 自定义日期选择 -->
    <el-date-picker
      v-if="dateType === 'custom'"
      v-model="dateRange"
      type="daterange"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      @change="handleDateRangeChange"
    />

    <!-- 显示当前选择 -->
    <div class="current-range">
      当前选择: {{ formatDateRange(dateRange, ' 至 ') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import {
  getDateRangeByType,
  formatDateRange,
  formatDay,
  getCurrentMonthRange
} from '@/utils/date'

const dateType = ref('month')
const dateRange = ref<[Date, Date]>(getCurrentMonthRange())

const handleDateTypeChange = (type: string) => {
  if (type !== 'custom') {
    const range = getDateRangeByType(type)
    if (range) {
      dateRange.value = [new Date(range[0]), new Date(range[1])]
    }
  }
}

const handleDateRangeChange = (range: [Date, Date]) => {
  if (range) {
    // 触发查询
    emit('search', {
      beginTime: formatDay(range[0]),
      endTime: formatDay(range[1])
    })
  }
}

const emit = defineEmits(['search'])
</script>
```

### 3. 消息时间显示

```vue
<template>
  <div class="message-list">
    <div v-for="msg in messages" :key="msg.id" class="message-item">
      <div class="message-content">{{ msg.content }}</div>
      <div class="message-time">{{ formatMessageTime(msg.createdAt) }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatRelativeTime, formatDate, isSameDay } from '@/utils/date'

const messages = ref([])

const formatMessageTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const today = new Date()

  // 今天的消息显示相对时间
  if (isSameDay(date, today)) {
    return formatRelativeTime(timestamp)
  }

  // 昨天的消息
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, yesterday)) {
    return `昨天 ${formatDate(date, 'HH:mm')}`
  }

  // 更早的消息显示具体日期
  return formatDate(date, 'MM-dd HH:mm')
}
</script>
```

### 4. 倒计时组件

```vue
<template>
  <div class="countdown">
    <template v-if="remaining > 0">
      <span class="days">{{ days }}</span>天
      <span class="hours">{{ hours }}</span>时
      <span class="minutes">{{ minutes }}</span>分
      <span class="seconds">{{ seconds }}</span>秒
    </template>
    <span v-else class="expired">已结束</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getDaysBetween } from '@/utils/date'

const props = defineProps<{
  deadline: Date | string | number
}>()

const remaining = ref(0)
let timer: number | null = null

const days = computed(() => Math.floor(remaining.value / 86400))
const hours = computed(() => Math.floor((remaining.value % 86400) / 3600))
const minutes = computed(() => Math.floor((remaining.value % 3600) / 60))
const seconds = computed(() => remaining.value % 60)

const updateRemaining = () => {
  const target = new Date(props.deadline).getTime()
  const now = Date.now()
  remaining.value = Math.max(0, Math.floor((target - now) / 1000))
}

onMounted(() => {
  updateRemaining()
  timer = setInterval(updateRemaining, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
```

### 5. API请求参数构建

```typescript
import { addDateRange, formatDay, getCurrentMonthRange } from '@/utils/date'

// 列表查询
const getList = async () => {
  const params = {
    pageNum: 1,
    pageSize: 10,
    keyword: searchKeyword.value
  }

  // 添加日期范围
  addDateRange(params, [
    formatDay(dateRange.value[0]),
    formatDay(dateRange.value[1])
  ], 'create')

  const res = await api.getList(params)
  // params 会变成:
  // {
  //   pageNum: 1,
  //   pageSize: 10,
  //   keyword: 'xxx',
  //   params: {
  //     beginCreate: '2023-01-01',
  //     endCreate: '2023-01-31'
  //   }
  // }
}
```

### 6. 实时时钟组件

```vue
<template>
  <div class="clock">
    <div class="date">{{ currentDate }}</div>
    <div class="time">{{ currentTime }}</div>
    <div class="week">星期{{ weekDay }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getCurrentDate, getCurrentTime, formatDate } from '@/utils/date'

const currentDate = ref(getCurrentDate())
const currentTime = ref(getCurrentTime())
const weekDay = ref(formatDate(new Date(), 'w'))

let timer: number | null = null

onMounted(() => {
  timer = setInterval(() => {
    const now = new Date()
    currentDate.value = getCurrentDate()
    currentTime.value = getCurrentTime()
    weekDay.value = formatDate(now, 'w')
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
```

## 单元测试

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDate,
  formatDay,
  formatRelativeTime,
  formatDateRange,
  formatTableDate,
  getCurrentTime,
  getCurrentDate,
  getCurrentDateTime,
  parseDate,
  getTimeStamp,
  getDateRange,
  getCurrentWeekRange,
  getCurrentMonthRange,
  addDateRange,
  getDateRangeByType,
  getDaysBetween,
  isSameDay,
  getWeekOfYear,
  dateAdd
} from '@/utils/date'

describe('date 工具', () => {
  // 固定时间用于测试
  const fixedDate = new Date('2023-01-15 14:30:45')

  describe('formatDate', () => {
    it('应该正确格式化Date对象', () => {
      expect(formatDate(fixedDate)).toBe('2023-01-15 14:30:45')
      expect(formatDate(fixedDate, 'yyyy-MM-dd')).toBe('2023-01-15')
      expect(formatDate(fixedDate, 'HH:mm:ss')).toBe('14:30:45')
    })

    it('应该支持两种格式语法', () => {
      expect(formatDate(fixedDate, 'yyyy-MM-dd')).toBe('2023-01-15')
      expect(formatDate(fixedDate, 'YYYY-MM-DD')).toBe('2023-01-15')
    })

    it('应该正确处理时间戳', () => {
      const timestamp = fixedDate.getTime()
      expect(formatDate(timestamp)).toBe('2023-01-15 14:30:45')
    })

    it('应该正确处理10位时间戳', () => {
      const timestamp10 = Math.floor(fixedDate.getTime() / 1000)
      expect(formatDate(timestamp10)).toBe('2023-01-15 14:30:45')
    })

    it('应该正确格式化星期', () => {
      expect(formatDate(fixedDate, 'w')).toBe('日')
    })

    it('空输入应该返回空字符串', () => {
      expect(formatDate('')).toBe('')
      expect(formatDate(null as any)).toBe('')
      expect(formatDate(undefined as any)).toBe('')
    })
  })

  describe('formatDay', () => {
    it('应该只返回年月日', () => {
      expect(formatDay(fixedDate)).toBe('2023-01-15')
      expect(formatDay('2023-01-15 14:30:45')).toBe('2023-01-15')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(fixedDate)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('30秒内应该显示"刚刚"', () => {
      const time = fixedDate.getTime() / 1000 - 10
      expect(formatRelativeTime(time)).toBe('刚刚')
    })

    it('应该正确显示分钟前', () => {
      const time = fixedDate.getTime() / 1000 - 1800
      expect(formatRelativeTime(time)).toBe('30分钟前')
    })

    it('应该正确显示小时前', () => {
      const time = fixedDate.getTime() / 1000 - 7200
      expect(formatRelativeTime(time)).toBe('2小时前')
    })
  })

  describe('formatDateRange', () => {
    it('应该正确格式化日期范围', () => {
      const start = new Date('2023-01-01')
      const end = new Date('2023-01-31')
      expect(formatDateRange([start, end])).toBe('2023-01-01 ~ 2023-01-31')
    })

    it('应该支持自定义分隔符', () => {
      const start = new Date('2023-01-01')
      const end = new Date('2023-01-31')
      expect(formatDateRange([start, end], ' 至 ')).toBe('2023-01-01 至 2023-01-31')
    })

    it('无效输入应该返回空字符串', () => {
      expect(formatDateRange(null as any)).toBe('')
      expect(formatDateRange([new Date()] as any)).toBe('')
    })
  })

  describe('parseDate', () => {
    it('应该正确解析日期字符串', () => {
      const result = parseDate('2023-01-15')
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2023)
    })

    it('无效日期应该返回null', () => {
      expect(parseDate('invalid')).toBeNull()
      expect(parseDate('')).toBeNull()
    })
  })

  describe('getDaysBetween', () => {
    it('应该正确计算天数', () => {
      const start = new Date('2023-01-01')
      const end = new Date('2023-01-15')
      expect(getDaysBetween(start, end)).toBe(14)
    })

    it('应该返回绝对值', () => {
      const start = new Date('2023-01-15')
      const end = new Date('2023-01-01')
      expect(getDaysBetween(start, end)).toBe(14)
    })
  })

  describe('isSameDay', () => {
    it('同一天应该返回true', () => {
      const date1 = new Date('2023-01-15 10:00:00')
      const date2 = new Date('2023-01-15 20:00:00')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('不同天应该返回false', () => {
      const date1 = new Date('2023-01-15')
      const date2 = new Date('2023-01-16')
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('dateAdd', () => {
    it('应该正确加减天数', () => {
      const base = new Date('2023-01-15')
      expect(formatDay(dateAdd(base, 'day', 7))).toBe('2023-01-22')
      expect(formatDay(dateAdd(base, 'day', -7))).toBe('2023-01-08')
    })

    it('应该正确加减月份', () => {
      const base = new Date('2023-01-15')
      expect(formatDay(dateAdd(base, 'month', 1))).toBe('2023-02-15')
      expect(formatDay(dateAdd(base, 'month', -1))).toBe('2022-12-15')
    })

    it('应该正确加减年份', () => {
      const base = new Date('2023-01-15')
      expect(formatDay(dateAdd(base, 'year', 1))).toBe('2024-01-15')
      expect(formatDay(dateAdd(base, 'year', -1))).toBe('2022-01-15')
    })
  })

  describe('getWeekOfYear', () => {
    it('应该正确计算周数', () => {
      expect(getWeekOfYear(new Date('2023-01-01'))).toBe(1)
      expect(getWeekOfYear(new Date('2023-01-15'))).toBeGreaterThanOrEqual(2)
    })
  })

  describe('addDateRange', () => {
    it('应该正确添加日期范围', () => {
      const params = { name: 'test' }
      const range = ['2023-01-01', '2023-01-31']
      const result = addDateRange(params, range)
      expect(result.params.beginTime).toBe('2023-01-01')
      expect(result.params.endTime).toBe('2023-01-31')
    })

    it('应该支持自定义属性名', () => {
      const params = { name: 'test' }
      const range = ['2023-01-01', '2023-01-31']
      const result = addDateRange(params, range, 'create')
      expect(result.params.beginCreate).toBe('2023-01-01')
      expect(result.params.endCreate).toBe('2023-01-31')
    })

    it('无效范围应该清理属性', () => {
      const params = { name: 'test', params: { beginTime: 'old', endTime: 'old' } }
      const result = addDateRange(params, [])
      expect(result.params.beginTime).toBeUndefined()
      expect(result.params.endTime).toBeUndefined()
    })
  })
})
```

## 性能优化

### 1. 格式化结果缓存

```typescript
// 缓存格式化结果
const formatCache = new Map<string, string>()
const MAX_CACHE_SIZE = 1000

const cachedFormatDate = (time: Date | string | number, pattern: string = 'yyyy-MM-dd HH:mm:ss'): string => {
  const key = `${time}_${pattern}`

  if (formatCache.has(key)) {
    return formatCache.get(key)!
  }

  const result = formatDate(time, pattern)

  if (formatCache.size >= MAX_CACHE_SIZE) {
    const firstKey = formatCache.keys().next().value
    formatCache.delete(firstKey)
  }

  formatCache.set(key, result)
  return result
}
```

### 2. 批量格式化优化

```typescript
// 批量格式化
const batchFormatDate = (
  dates: (Date | string | number)[],
  pattern: string = 'yyyy-MM-dd HH:mm:ss'
): string[] => {
  return dates.map(date => formatDate(date, pattern))
}

// 使用示例
const formattedDates = batchFormatDate([
  '2023-01-01',
  '2023-01-15',
  '2023-01-31'
], 'MM/dd')
```

### 3. 防抖处理实时更新

```typescript
import { useDebounceFn } from '@vueuse/core'

// 实时时钟防抖更新
const updateClock = useDebounceFn(() => {
  currentTime.value = getCurrentTime()
}, 100)
```

## 类型定义

```typescript
/**
 * 日期类型
 */
export type DateType = 'today' | 'yesterday' | 'week' | 'month' | 'year'

/**
 * 日期加减类型
 */
export type DateAddType = 'day' | 'month' | 'year'

/**
 * 时间戳类型
 */
export type TimestampType = 'ms' | 's'

/**
 * 日期范围
 */
export type DateRange = [Date, Date]

/**
 * 日期字符串范围
 */
export type DateStringRange = [string, string]

/**
 * 格式化选项
 */
export interface FormatOptions {
  pattern?: string
  locale?: string
}

/**
 * 日期范围参数
 */
export interface DateRangeParams {
  beginTime?: string
  endTime?: string
  [key: string]: any
}

/**
 * 相对时间配置
 */
export interface RelativeTimeConfig {
  justNow: number      // "刚刚"的阈值（秒）
  minute: number       // 分钟阈值
  hour: number         // 小时阈值
  day: number          // 天阈值
}
```

## 常见问题

### 1. 日期解析失败

**问题原因：**
- 日期字符串格式不正确
- Safari 浏览器对 `yyyy-MM-dd` 格式支持不完整

**解决方案：**

```typescript
// 兼容 Safari 的日期解析
const safeParse = (dateStr: string): Date | null => {
  if (!dateStr) return null

  // 将 yyyy-MM-dd 格式转换为 yyyy/MM/dd
  const normalized = dateStr.replace(/-/g, '/')
  const date = new Date(normalized)

  return Number.isNaN(date.getTime()) ? null : date
}
```

### 2. 时区问题

**问题原因：**
- ISO格式日期字符串带有时区信息
- 服务器和客户端时区不一致

**解决方案：**

```typescript
// 强制使用本地时区解析
const parseLocalDate = (isoString: string): Date => {
  // 移除时区标识，按本地时间解析
  const localString = isoString.replace('T', ' ').replace('Z', '').replace(/\.\d+/, '')
  return new Date(localString.replace(/-/g, '/'))
}

// 或者保持UTC时间
const parseUTCDate = (isoString: string): Date => {
  return new Date(isoString)
}
```

### 3. 相对时间不更新

**问题原因：**
- 计算结果没有响应式更新

**解决方案：**

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

const useRelativeTime = (timestamp: number) => {
  const relativeTime = ref(formatRelativeTime(timestamp))
  let timer: number | null = null

  const update = () => {
    relativeTime.value = formatRelativeTime(timestamp)
  }

  onMounted(() => {
    timer = setInterval(update, 60000) // 每分钟更新
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return relativeTime
}
```

### 4. 日期范围选择后查询无结果

**问题原因：**
- 结束日期没有包含当天的全部时间

**解决方案：**

```typescript
// 确保结束日期包含当天全部时间
const getFullDayRange = (start: Date, end: Date): [string, string] => {
  const startDate = new Date(start)
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(end)
  endDate.setHours(23, 59, 59, 999)

  return [
    formatDate(startDate, 'yyyy-MM-dd HH:mm:ss'),
    formatDate(endDate, 'yyyy-MM-dd HH:mm:ss')
  ]
}
```

## 注意事项

### 1. 时间戳格式

函数会自动判断10位（秒）和13位（毫秒）时间戳：

```typescript
// 自动识别
formatDate(1673766645)       // 10位秒级时间戳
formatDate(1673766645000)    // 13位毫秒级时间戳
formatDate('1673766645')     // 字符串形式的时间戳
```

### 2. 时区处理

所有操作基于本地时区，跨时区应用需要额外处理：

```typescript
// 获取UTC时间
const utcTime = new Date().toISOString()

// 转换时区
const convertTimeZone = (date: Date, offset: number): Date => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  return new Date(utc + 3600000 * offset)
}
```

### 3. 日期有效性

输入无效日期时可能返回 "Invalid Date"：

```typescript
// 安全的日期格式化
const safeFormatDate = (time: any, pattern?: string): string => {
  const result = formatDate(time, pattern)
  return result === 'Invalid Date' ? '' : result
}
```

### 4. 性能考虑

频繁的日期格式化可能影响性能，建议：

```typescript
// 1. 缓存结果
const cachedDate = computed(() => formatDate(props.date))

// 2. 使用 v-once 指令
<span v-once>{{ formatDate(item.createTime) }}</span>

// 3. 虚拟滚动处理大量数据
```

### 5. 兼容性

某些格式化模式在不同浏览器中可能表现不同，建议使用标准格式。
