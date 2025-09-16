# 日期工具 (date.ts)

日期工具类，提供日期格式化、转换、计算的通用工具函数。自动兼容两种格式语法：`yyyy-MM-dd HH:mm:ss` 和 `YYYY-MM-DD HH:mm:ss`。

## 📖 概述

日期工具库包含以下功能类别：
- **日期格式化**：将日期转换为特定格式的字符串
- **日期解析**：将字符串解析为日期对象
- **当前时间获取**：获取当前时间的各种格式
- **日期范围获取**：获取特定时间范围
- **日期计算**：计算日期之间的关系和差值
- **辅助函数**：数字补零等辅助功能

## 🎨 日期格式化

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

**支持的格式化字符：**
- `yyyy/YYYY` - 四位年份
- `MM` - 两位月份（01-12）
- `M` - 月份（1-12）
- `dd/DD` - 两位日期（01-31）
- `d/D` - 日期（1-31）
- `HH` - 两位小时（00-23）
- `H` - 小时（0-23）
- `mm` - 两位分钟（00-59）
- `m` - 分钟（0-59）
- `ss` - 两位秒数（00-59）
- `s` - 秒数（0-59）
- `w` - 星期（日-六）

**返回值：**
- `string` - 格式化后的日期字符串

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

**示例：**
```typescript
// 表格数据格式化
formatTableDate('2023-01-15T14:30:45.000Z')           // "2023-01-15 14:30:45"
formatTableDate('2023-01-15T14:30:45.000Z', 'MM/dd')  // "01/15"
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

**示例：**
```typescript
formatDay(new Date())              // "2023-01-15"
formatDay('2023-01-15 14:30:45')   // "2023-01-15"
formatDay(1673766645000)           // "2023-01-15"
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

**示例：**
```typescript
const now = Date.now()

formatRelativeTime(now / 1000)           // "刚刚"
formatRelativeTime(now / 1000 - 30)      // "刚刚"
formatRelativeTime(now / 1000 - 1800)    // "30分钟前"
formatRelativeTime(now / 1000 - 7200)    // "2小时前"
formatRelativeTime(now / 1000 - 86400)   // "1天前"
formatRelativeTime(now / 1000 - 172800)  // "1月15日14时30分"（超过2天显示具体时间）

// 使用自定义格式
formatRelativeTime(now / 1000 - 172800, 'yyyy-MM-dd') // "2023-01-13"
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

**示例：**
```typescript
const start = new Date('2023-01-01')
const end = new Date('2023-01-31')

formatDateRange([start, end])                    // "2023-01-01 ~ 2023-01-31"
formatDateRange([start, end], ' 至 ')           // "2023-01-01 至 2023-01-31"
formatDateRange([start, end], '-', 'MM/dd')     // "01/01-01/31"
```

## ⏰ 当前时间获取

### getCurrentTime

获取当前时间。

```typescript
getCurrentTime(pattern: string = 'HH:mm:ss'): string
```

**参数：**
- `pattern` - 格式化模式，默认为 'HH:mm:ss'

**返回值：**
- `string` - 格式化后的当前时间字符串

**示例：**
```typescript
getCurrentTime()                           // "14:30:45"
getCurrentTime('yyyy-MM-dd HH:mm:ss')      // "2023-01-15 14:30:45"
getCurrentTime('yyyy年MM月dd日')           // "2023年01月15日"
```

### getCurrentDate

获取当前年月日。

```typescript
getCurrentDate(): string
```

**返回值：**
- `string` - 当前年月日字符串（yyyy-MM-dd）

**示例：**
```typescript
getCurrentDate()  // "2023-01-15"
```

### getCurrentDateTime

获取当前完整日期时间。

```typescript
getCurrentDateTime(): string
```

**返回值：**
- `string` - 当前完整日期时间字符串（yyyy-MM-dd HH:mm:ss）

**示例：**
```typescript
getCurrentDateTime()  // "2023-01-15 14:30:45"
```

## 🔍 日期解析

### parseDate

解析日期字符串为Date对象。

```typescript
parseDate(dateStr: string): Date | null
```

**参数：**
- `dateStr` - 日期字符串

**返回值：**
- `Date | null` - Date对象，解析失败返回null

**示例：**
```typescript
parseDate('2023-01-15')           // Date对象
parseDate('2023-01-15 14:30:45')  // Date对象
parseDate('invalid date')         // null
```

## 📅 日期范围获取

### getTimeStamp

获取时间戳。

```typescript
getTimeStamp(type: 'ms' | 's' = 'ms'): number
```

**参数：**
- `type` - 时间戳类型，'ms'（毫秒）或 's'（秒）

**返回值：**
- `number` - 当前时间的时间戳

**示例：**
```typescript
getTimeStamp()      // 1673766645123 (毫秒)
getTimeStamp('s')   // 1673766645 (秒)
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

**示例：**
```typescript
// 获取过去7天的日期范围
getDateRange(-7)  // [7天前的日期, 今天]

// 获取未来7天的日期范围
getDateRange(7)   // [7天后的日期, 今天]
```

### getCurrentWeekRange

获取本周的开始和结束日期。

```typescript
getCurrentWeekRange(): [Date, Date]
```

**返回值：**
- `[Date, Date]` - [周一日期, 周日日期]

**示例：**
```typescript
const [monday, sunday] = getCurrentWeekRange()
console.log(formatDay(monday))   // "2023-01-09" (本周一)
console.log(formatDay(sunday))   // "2023-01-15" (本周日)
```

### getCurrentMonthRange

获取本月的开始和结束日期。

```typescript
getCurrentMonthRange(): [Date, Date]
```

**返回值：**
- `[Date, Date]` - [本月第一天, 本月最后一天]

**示例：**
```typescript
const [firstDay, lastDay] = getCurrentMonthRange()
console.log(formatDay(firstDay))  // "2023-01-01"
console.log(formatDay(lastDay))   // "2023-01-31"
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

## 🧮 日期计算

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

**示例：**
```typescript
const start = new Date('2023-01-01')
const end = new Date('2023-01-15')

getDaysBetween(start, end)  // 14
getDaysBetween(end, start)  // 14 (返回绝对值)
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

**示例：**
```typescript
const date1 = new Date('2023-01-15 10:00:00')
const date2 = new Date('2023-01-15 20:00:00')
const date3 = new Date('2023-01-16 10:00:00')

isSameDay(date1, date2)  // true
isSameDay(date1, date3)  // false
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

**示例：**
```typescript
getWeekOfYear(new Date('2023-01-15'))  // 3 (第3周)
getWeekOfYear(new Date('2023-12-31'))  // 53 (第53周)
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
```

## 💡 使用技巧

### 1. 智能时间戳处理
`formatDate` 能够自动识别10位和13位时间戳：

```typescript
formatDate('1673766645')     // 10位时间戳（秒）
formatDate(1673766645000)    // 13位时间戳（毫秒）
formatDate('1673766645000')  // 字符串形式的毫秒时间戳
```

### 2. 灵活的格式化模式
支持多种日期格式，适应不同的业务需求：

```typescript
const date = new Date('2023-01-15 14:30:45')

// 中文格式
formatDate(date, 'yyyy年MM月dd日 HH时mm分ss秒')

// 欧洲格式
formatDate(date, 'dd/MM/yyyy')

// 美国格式
formatDate(date, 'MM/dd/yyyy')

// 简短格式
formatDate(date, 'MM-dd HH:mm')
```

### 3. API参数构建
结合 `addDateRange` 简化API请求参数：

```typescript
// 构建查询参数
const queryParams = {
  page: 1,
  size: 10,
  keyword: 'test'
}

// 添加时间范围
const [startDate, endDate] = getCurrentMonthRange()
const finalParams = addDateRange(queryParams, [
  formatDay(startDate),
  formatDay(endDate)
], 'order')

// 发送请求
api.getOrders(finalParams)
// 实际参数：{ page: 1, size: 10, keyword: 'test', params: { beginOrder: '2023-01-01', endOrder: '2023-01-31' } }
```

### 4. 表格数据格式化
在表格中统一处理时间显示：

```typescript
// Vue表格配置
const columns = [
  {
    prop: 'createTime',
    label: '创建时间',
    formatter: (row) => formatTableDate(row.createTime, 'yyyy-MM-dd HH:mm')
  },
  {
    prop: 'updateTime',
    label: '更新时间',
    formatter: (row) => formatTableDate(row.updateTime, 'MM-dd HH:mm')
  }
]
```

### 5. 相对时间显示
在消息列表、评论等场景使用相对时间：

```typescript
// 消息列表组件
const formatMessageTime = (timestamp) => {
  const timeInSeconds = Math.floor(timestamp / 1000)
  return formatRelativeTime(timeInSeconds)
}

// 显示效果：
// "刚刚"、"5分钟前"、"2小时前"、"1天前"、"3月15日10时30分"
```

## ⚠️ 注意事项

1. **时间戳格式**：函数会自动判断10位（秒）和13位（毫秒）时间戳
2. **时区处理**：所有操作基于本地时区，跨时区应用需要额外处理
3. **日期有效性**：输入无效日期时可能返回 `"Invalid Date"`
4. **性能考虑**：频繁的日期格式化可能影响性能，考虑缓存结果
5. **兼容性**：某些格式化模式在不同浏览器中可能表现不同

