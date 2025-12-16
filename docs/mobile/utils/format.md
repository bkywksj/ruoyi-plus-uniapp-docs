# 格式化工具

## 概述

RuoYi-Plus-UniApp 移动端提供了完整的格式化工具集，涵盖日期格式化、字符串处理、布尔值转换、数据验证等常用功能。这些工具函数基于业务场景深度封装，支持多种格式和国际化需求，是移动端开发中不可或缺的基础设施。

### 核心特性

- **日期格式化** - 支持多种日期格式、相对时间、日期范围等场景
- **字符串处理** - 截断、转义、大小写转换、字节长度计算等
- **布尔值转换** - 多格式布尔值识别和转换（'1'/'0'、'true'/'false'、'yes'/'no'）
- **URL 处理** - 查询参数解析、路径规范化、通配符匹配等
- **数据验证** - 手机号、身份证、邮箱、银行卡等中国特色验证
- **类型检查** - 严格的类型判断和空值检测
- **TypeScript 支持** - 完整的类型定义，提供开发时类型检查

### 技术栈

| 依赖 | 版本 | 说明 |
|------|------|------|
| UniApp | 3.0.0+ | 跨平台框架 |
| Vue 3 | 3.4.21 | 组合式 API |
| TypeScript | 5.7.2 | 类型支持 |

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                       应用层 (业务代码)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    格式化工具层                       │  │
│   │  ┌───────────────┬───────────────┬───────────────┐  │  │
│   │  │   date.ts     │   string.ts   │  boolean.ts   │  │  │
│   │  │ ┌───────────┐ │ ┌───────────┐ │ ┌───────────┐ │  │  │
│   │  │ │ 日期格式化 │ │ │ 字符串处理 │ │ │ 布尔转换  │ │  │  │
│   │  │ │ 相对时间  │ │ │ URL处理   │ │ │ 状态切换  │ │  │  │
│   │  │ │ 日期计算  │ │ │ HTML转义  │ │ │ 格式识别  │ │  │  │
│   │  │ └───────────┘ │ └───────────┘ │ └───────────┘ │  │  │
│   │  └───────────────┴───────────────┴───────────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    验证工具层                         │  │
│   │  ┌─────────────────────────────────────────────────┐  │  │
│   │  │               validators.ts                      │  │  │
│   │  │ ┌─────────┬─────────┬─────────┬─────────────┐  │  │  │
│   │  │ │ 文件验证 │ 字符串  │ 数值验证 │ 中国特色验证 │  │  │  │
│   │  │ │ URL验证 │ 类型判断 │ 日期验证 │ 金融验证   │  │  │  │
│   │  │ └─────────┴─────────┴─────────┴─────────────┘  │  │  │
│   │  └─────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 核心文件结构

```
plus-uniapp/src/utils/
├── date.ts           # 日期格式化和计算工具
├── string.ts         # 字符串处理和URL工具
├── boolean.ts        # 布尔值转换工具
└── validators.ts     # 数据验证工具
```

## 日期格式化

### 基础日期格式化

```typescript
import { formatDate } from '@/utils/date'

// 格式化当前时间
const now = new Date()
const formatted = formatDate(now)
console.log('完整日期时间:', formatted)
// 输出: "2025-12-14 15:30:45"

// 指定格式
const dateOnly = formatDate(now, 'yyyy-MM-dd')
console.log('仅日期:', dateOnly)
// 输出: "2025-12-14"

const timeOnly = formatDate(now, 'HH:mm:ss')
console.log('仅时间:', timeOnly)
// 输出: "15:30:45"

// 中文格式
const chineseDate = formatDate(now, 'yyyy年MM月dd日')
console.log('中文日期:', chineseDate)
// 输出: "2025年12月14日"

// 支持时间戳
const timestamp = 1734159045000
const fromTimestamp = formatDate(timestamp, 'yyyy-MM-dd HH:mm')
console.log('从时间戳:', fromTimestamp)
// 输出: "2025-12-14 15:30"

// 支持日期字符串
const dateStr = '2025-12-14T15:30:45.000Z'
const fromString = formatDate(dateStr, 'MM/dd/yyyy')
console.log('从字符串:', fromString)
// 输出: "12/14/2025"
```

**函数说明:**
- 支持 Date 对象、时间戳、日期字符串三种输入类型
- 默认格式为 `yyyy-MM-dd HH:mm:ss`
- 支持自定义格式模式
- 同时支持 `yyyy` 和 `YYYY` 格式（自动转换）

### 格式模式说明

| 模式 | 说明 | 示例 |
|------|------|------|
| `yyyy` | 四位年份 | 2025 |
| `MM` | 两位月份 | 01-12 |
| `dd` | 两位日期 | 01-31 |
| `HH` | 24小时制小时 | 00-23 |
| `mm` | 分钟 | 00-59 |
| `ss` | 秒 | 00-59 |
| `S` | 毫秒 | 0-999 |

### 表格日期格式化

```typescript
import { formatTableDate } from '@/utils/date'

// 用于表格列的日期格式化
const cellValue = '2025-12-14T15:30:45.000Z'
const formatted = formatTableDate(cellValue)
console.log('表格日期:', formatted)
// 输出: "2025-12-14 15:30:45"

// 自定义格式
const shortDate = formatTableDate(cellValue, 'yyyy-MM-dd')
console.log('短日期:', shortDate)
// 输出: "2025-12-14"

// 空值处理
const empty = formatTableDate('')
console.log('空值:', empty)
// 输出: ""
```

**使用场景:**
- 专门用于表格组件的日期列格式化
- 自动处理空值和无效值
- 返回空字符串而不是报错

### 仅日期格式化

```typescript
import { formatDay } from '@/utils/date'

// 只获取日期部分
const now = new Date()
const day = formatDay(now)
console.log('仅日期:', day)
// 输出: "2025-12-14"

// 从时间戳
const timestamp = 1734159045000
const dayFromTs = formatDay(timestamp)
console.log('从时间戳:', dayFromTs)
// 输出: "2025-12-14"

// 从字符串
const dateStr = '2025-12-14 15:30:45'
const dayFromStr = formatDay(dateStr)
console.log('从字符串:', dayFromStr)
// 输出: "2025-12-14"
```

**函数说明:**
- `formatDay` 是 `formatDate(time, 'yyyy-MM-dd')` 的快捷方式
- 适用于只需要显示日期而不需要时间的场景

### 相对时间格式化

```typescript
import { formatRelativeTime } from '@/utils/date'

// 刚刚发生（30秒内）
const justNow = Date.now() - 10000  // 10秒前
console.log(formatRelativeTime(justNow))
// 输出: "刚刚"

// 几分钟前
const minutesAgo = Date.now() - 5 * 60 * 1000  // 5分钟前
console.log(formatRelativeTime(minutesAgo))
// 输出: "5分钟前"

// 几小时前
const hoursAgo = Date.now() - 3 * 60 * 60 * 1000  // 3小时前
console.log(formatRelativeTime(hoursAgo))
// 输出: "3小时前"

// 几天前
const daysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000  // 2天前
console.log(formatRelativeTime(daysAgo))
// 输出: "2天前"

// 几个月前
const monthsAgo = Date.now() - 45 * 24 * 60 * 60 * 1000  // 45天前
console.log(formatRelativeTime(monthsAgo))
// 输出: "1个月前"

// 几年前
const yearsAgo = Date.now() - 400 * 24 * 60 * 60 * 1000  // 400天前
console.log(formatRelativeTime(yearsAgo))
// 输出: "1年前"

// 使用自定义格式（超过阈值时显示完整日期）
const oldDate = Date.now() - 100 * 24 * 60 * 60 * 1000
console.log(formatRelativeTime(oldDate, '{y}-{m}-{d}'))
// 输出: "2025-09-05"
```

**时间阈值:**
- 30秒内: "刚刚"
- 30秒 - 30分钟: "X分钟前"
- 30分钟 - 1天: "X小时前"
- 1天 - 31天: "X天前"
- 31天 - 365天: "X个月前"
- 超过365天: "X年前"

### 日期范围格式化

```typescript
import { formatDateRange } from '@/utils/date'

// 基本用法
const startDate = new Date('2025-12-01')
const endDate = new Date('2025-12-31')
const range = formatDateRange([startDate, endDate])
console.log('日期范围:', range)
// 输出: "2025-12-01~2025-12-31"

// 自定义分隔符
const rangeWithSeparator = formatDateRange([startDate, endDate], ' 至 ')
console.log('自定义分隔符:', rangeWithSeparator)
// 输出: "2025-12-01 至 2025-12-31"

// 自定义格式
const rangeWithFormat = formatDateRange([startDate, endDate], '~', 'MM/dd')
console.log('自定义格式:', rangeWithFormat)
// 输出: "12/01~12/31"

// 在搜索表单中使用
const searchParams = {
  dateRange: formatDateRange([startDate, endDate], ',')
}
console.log('搜索参数:', searchParams)
// 输出: { dateRange: "2025-12-01,2025-12-31" }
```

**使用场景:**
- 日期区间选择器的值显示
- 报表查询条件格式化
- API 参数序列化

### 获取当前时间

```typescript
import { getCurrentTime, getCurrentDate, getCurrentDateTime } from '@/utils/date'

// 获取当前时间（仅时间部分）
const time = getCurrentTime()
console.log('当前时间:', time)
// 输出: "15:30:45"

// 自定义时间格式
const shortTime = getCurrentTime('HH:mm')
console.log('短时间:', shortTime)
// 输出: "15:30"

// 获取当前日期（仅日期部分）
const date = getCurrentDate()
console.log('当前日期:', date)
// 输出: "2025-12-14"

// 获取完整日期时间
const dateTime = getCurrentDateTime()
console.log('完整日期时间:', dateTime)
// 输出: "2025-12-14 15:30:45"
```

### 日期解析

```typescript
import { parseDate } from '@/utils/date'

// 解析标准日期字符串
const date1 = parseDate('2025-12-14')
console.log('解析结果:', date1)
// 输出: Date 对象

// 解析带时间的字符串
const date2 = parseDate('2025-12-14 15:30:45')
console.log('带时间:', date2)
// 输出: Date 对象

// 解析 ISO 格式
const date3 = parseDate('2025-12-14T15:30:45.000Z')
console.log('ISO格式:', date3)
// 输出: Date 对象

// 无效日期返回 null
const invalid = parseDate('invalid-date')
console.log('无效日期:', invalid)
// 输出: null

// 使用场景：安全地解析用户输入
const userInput = '2025-12-14'
const parsed = parseDate(userInput)
if (parsed) {
  console.log('解析成功:', formatDate(parsed))
} else {
  console.log('日期格式错误')
}
```

### 获取时间戳

```typescript
import { getTimeStamp } from '@/utils/date'

// 获取毫秒时间戳（默认）
const msTimestamp = getTimeStamp()
console.log('毫秒时间戳:', msTimestamp)
// 输出: 1734159045123

// 获取秒时间戳
const sTimestamp = getTimeStamp('s')
console.log('秒时间戳:', sTimestamp)
// 输出: 1734159045

// 使用场景：生成唯一ID
const uniqueId = `order_${getTimeStamp()}`
console.log('订单ID:', uniqueId)
// 输出: "order_1734159045123"
```

### 日期范围计算

```typescript
import { getDateRange, getCurrentWeekRange, getCurrentMonthRange } from '@/utils/date'

// 获取最近7天的日期范围
const last7Days = getDateRange(7)
console.log('最近7天:', last7Days)
// 输出: [Date(2025-12-07), Date(2025-12-14)]

// 获取最近30天
const last30Days = getDateRange(30)
console.log('最近30天:', last30Days)
// 输出: [Date(2025-11-14), Date(2025-12-14)]

// 获取本周范围（周一到周日）
const thisWeek = getCurrentWeekRange()
console.log('本周:', thisWeek)
// 输出: [Date(2025-12-09), Date(2025-12-15)]

// 获取本月范围
const thisMonth = getCurrentMonthRange()
console.log('本月:', thisMonth)
// 输出: [Date(2025-12-01), Date(2025-12-31)]

// 在查询参数中使用
import { addDateRange } from '@/utils/date'

const queryParams = { status: 'active' }
const dateRange = getDateRange(7)
const paramsWithDate = addDateRange(queryParams, dateRange)
console.log('带日期的参数:', paramsWithDate)
// 输出: { status: 'active', params: { beginTime: '2025-12-07', endTime: '2025-12-14' } }

// 自定义字段名
const customParams = addDateRange(queryParams, dateRange, 'createTime')
console.log('自定义字段:', customParams)
// 输出: { status: 'active', params: { beginCreateTime: '2025-12-07', endCreateTime: '2025-12-14' } }
```

### 日期计算

```typescript
import { getDaysBetween, isSameDay, getWeekOfYear, dateAdd } from '@/utils/date'

// 计算两个日期之间的天数
const start = new Date('2025-12-01')
const end = new Date('2025-12-14')
const days = getDaysBetween(start, end)
console.log('相隔天数:', days)
// 输出: 13

// 判断是否同一天
const date1 = new Date('2025-12-14 10:00:00')
const date2 = new Date('2025-12-14 20:00:00')
const same = isSameDay(date1, date2)
console.log('是否同一天:', same)
// 输出: true

// 获取年中的第几周
const date = new Date('2025-12-14')
const week = getWeekOfYear(date)
console.log('第几周:', week)
// 输出: 50

// 日期加减运算
const baseDate = new Date('2025-12-14')

// 加7天
const after7Days = dateAdd(baseDate, 'day', 7)
console.log('7天后:', formatDate(after7Days, 'yyyy-MM-dd'))
// 输出: "2025-12-21"

// 减3个月
const before3Months = dateAdd(baseDate, 'month', -3)
console.log('3个月前:', formatDate(before3Months, 'yyyy-MM-dd'))
// 输出: "2025-09-14"

// 加1年
const after1Year = dateAdd(baseDate, 'year', 1)
console.log('1年后:', formatDate(after1Year, 'yyyy-MM-dd'))
// 输出: "2026-12-14"
```

### 日期格式化实际应用

```vue
<template>
  <view class="time-display">
    <!-- 消息列表 -->
    <view v-for="msg in messages" :key="msg.id" class="message-item">
      <view class="content">{{ msg.content }}</view>
      <view class="time">{{ formatMessageTime(msg.createTime) }}</view>
    </view>

    <!-- 日期选择器 -->
    <view class="date-picker">
      <wd-picker
        v-model="dateRange"
        type="daterange"
        @confirm="handleDateChange"
      />
      <view class="range-display">
        {{ formatDateRange(dateRange) }}
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats">
      <text>注册时间: {{ formatDate(userInfo.createTime, 'yyyy年MM月dd日') }}</text>
      <text>已注册 {{ getDaysSinceRegister() }} 天</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import {
  formatDate,
  formatRelativeTime,
  formatDateRange,
  getDaysBetween
} from '@/utils/date'

interface Message {
  id: number
  content: string
  createTime: string
}

interface UserInfo {
  createTime: string
}

const messages = ref<Message[]>([])
const dateRange = ref<[Date, Date]>([new Date(), new Date()])
const userInfo = ref<UserInfo>({ createTime: '2024-01-15' })

// 格式化消息时间（智能显示）
const formatMessageTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays === 0) {
    // 今天：显示相对时间或具体时间
    return formatRelativeTime(time)
  } else if (diffDays === 1) {
    // 昨天
    return '昨天 ' + formatDate(date, 'HH:mm')
  } else if (diffDays < 7) {
    // 本周内：显示星期几
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekDays[date.getDay()] + ' ' + formatDate(date, 'HH:mm')
  } else {
    // 更早：显示完整日期
    return formatDate(date, 'MM-dd HH:mm')
  }
}

// 计算注册天数
const getDaysSinceRegister = () => {
  const registerDate = new Date(userInfo.value.createTime)
  const now = new Date()
  return getDaysBetween(registerDate, now)
}

// 处理日期范围变化
const handleDateChange = (value: [Date, Date]) => {
  console.log('选择的日期范围:', formatDateRange(value))
}
</script>

```

## 字符串处理

### 空值处理

```typescript
import { parseStrEmpty, isEmpty } from '@/utils/string'

// 解析空字符串
console.log(parseStrEmpty(null))        // ''
console.log(parseStrEmpty(undefined))   // ''
console.log(parseStrEmpty(''))          // ''
console.log(parseStrEmpty('hello'))     // 'hello'
console.log(parseStrEmpty(123))         // '123'

// 判断是否为空
console.log(isEmpty(null))              // true
console.log(isEmpty(undefined))         // true
console.log(isEmpty(''))                // true
console.log(isEmpty('  '))              // true (纯空白也视为空)
console.log(isEmpty('hello'))           // false
console.log(isEmpty(0))                 // false (数字0不为空)

// 使用场景：表单验证
const validateField = (value: any, fieldName: string) => {
  if (isEmpty(value)) {
    return `${fieldName}不能为空`
  }
  return ''
}

// 使用场景：安全取值
const displayValue = (value: any, defaultText = '-') => {
  return isEmpty(value) ? defaultText : parseStrEmpty(value)
}
```

### 字符串截断

```typescript
import { truncate } from '@/utils/string'

// 基本截断
const longText = '这是一段很长的文本内容，需要进行截断处理以适应有限的显示空间'
const truncated = truncate(longText, 20)
console.log('截断结果:', truncated)
// 输出: "这是一段很长的文本内容，需要..."

// 自定义省略符
const customEllipsis = truncate(longText, 15, '……')
console.log('自定义省略符:', customEllipsis)
// 输出: "这是一段很长的文本内容……"

// 不需要截断时原样返回
const shortText = '短文本'
const notTruncated = truncate(shortText, 20)
console.log('短文本:', notTruncated)
// 输出: "短文本"

// 在列表中使用
const items = [
  { title: '这是一个很长的标题需要截断显示' },
  { title: '短标题' }
]

items.forEach(item => {
  console.log(truncate(item.title, 10))
})
// 输出:
// "这是一个很长的标..."
// "短标题"
```

### 首字母大写

```typescript
import { capitalize } from '@/utils/string'

// 首字母大写
console.log(capitalize('hello'))        // 'Hello'
console.log(capitalize('hello world'))  // 'Hello world'
console.log(capitalize('HELLO'))        // 'HELLO' (只处理首字母)
console.log(capitalize(''))             // ''
console.log(capitalize('123abc'))       // '123abc' (非字母开头不变)

// 使用场景：姓名格式化
const formatName = (name: string) => {
  return name.split(' ').map(word => capitalize(word.toLowerCase())).join(' ')
}
console.log(formatName('john doe'))     // 'John Doe'
console.log(formatName('JANE SMITH'))   // 'Jane Smith'
```

### 字节长度计算

```typescript
import { byteLength } from '@/utils/string'

// 计算字符串的UTF-8字节长度
console.log(byteLength('hello'))        // 5 (纯英文，每个字符1字节)
console.log(byteLength('你好'))         // 6 (中文，每个字符3字节)
console.log(byteLength('hello你好'))    // 11 (5 + 6)
console.log(byteLength(''))             // 0

// 使用场景：限制输入长度（按字节）
const MAX_BYTES = 100

const validateByteLength = (text: string): boolean => {
  const bytes = byteLength(text)
  if (bytes > MAX_BYTES) {
    console.log(`超出限制: ${bytes}/${MAX_BYTES} 字节`)
    return false
  }
  return true
}

// 使用场景：显示剩余可输入字节数
const getRemainingBytes = (text: string, maxBytes: number): number => {
  return Math.max(0, maxBytes - byteLength(text))
}
```

### 生成唯一字符串

```typescript
import { createUniqueString } from '@/utils/string'

// 生成唯一字符串
const uniqueStr1 = createUniqueString()
const uniqueStr2 = createUniqueString()

console.log('唯一字符串1:', uniqueStr1)
// 输出: "6f7g8h9i0j1k2l3m" (示例)
console.log('唯一字符串2:', uniqueStr2)
// 输出: "a1b2c3d4e5f6g7h8" (示例)
console.log('是否不同:', uniqueStr1 !== uniqueStr2)
// 输出: true

// 使用场景：生成临时ID
const generateTempId = () => `temp_${createUniqueString()}`

// 使用场景：生成文件名
const generateFileName = (ext: string) => {
  return `${createUniqueString()}.${ext}`
}
console.log('临时文件名:', generateFileName('jpg'))
// 输出: "a1b2c3d4e5f6g7h8.jpg"
```

### 字符串格式化（sprintf）

```typescript
import { sprintf } from '@/utils/string'

// 基本占位符替换
const template = '用户 %s 在 %s 购买了商品'
const result = sprintf(template, '张三', '2025-12-14')
console.log(result)
// 输出: "用户 张三 在 2025-12-14 购买了商品"

// 数字格式化
const priceTemplate = '商品价格: ¥%s，数量: %s'
const priceResult = sprintf(priceTemplate, 99.99, 3)
console.log(priceResult)
// 输出: "商品价格: ¥99.99，数量: 3"

// 多参数替换
const logTemplate = '[%s] %s - %s: %s'
const logResult = sprintf(logTemplate, 'INFO', '2025-12-14 15:30:45', 'UserModule', '用户登录成功')
console.log(logResult)
// 输出: "[INFO] 2025-12-14 15:30:45 - UserModule: 用户登录成功"

// 参数不足时保留占位符
const partial = sprintf('Hello %s, welcome to %s', 'World')
console.log(partial)
// 输出: "Hello World, welcome to %s"
```

### HTML 处理

```typescript
import { html2Text, getTextExcerpt, escapeHtml } from '@/utils/string'

// HTML转纯文本
const html = '<p>这是<strong>加粗</strong>文本</p><br><div>换行内容</div>'
const text = html2Text(html)
console.log('纯文本:', text)
// 输出: "这是加粗文本 换行内容"

// 获取文本摘要
const longHtml = '<p>这是一段很长的HTML内容，包含各种标签和格式...</p>'
const excerpt = getTextExcerpt(longHtml, 20)
console.log('摘要:', excerpt)
// 输出: "这是一段很长的HTML内容..."

// 自定义省略符
const customExcerpt = getTextExcerpt(longHtml, 15, '【更多】')
console.log('自定义摘要:', customExcerpt)
// 输出: "这是一段很长的HTML【更多】"

// HTML转义（防止XSS）
const userInput = '<script>alert("xss")</script>'
const escaped = escapeHtml(userInput)
console.log('转义结果:', escaped)
// 输出: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"

// 使用场景：安全渲染用户输入
const renderUserComment = (comment: string) => {
  return escapeHtml(comment)
}
```

### 大小写转换

```typescript
import { camelToKebab, kebabToCamel } from '@/utils/string'

// 驼峰转连字符（kebab-case）
console.log(camelToKebab('userName'))       // 'user-name'
console.log(camelToKebab('backgroundColor'))// 'background-color'
console.log(camelToKebab('isActive'))       // 'is-active'
console.log(camelToKebab('XMLParser'))      // 'x-m-l-parser'

// 连字符转驼峰（camelCase）
console.log(kebabToCamel('user-name'))          // 'userName'
console.log(kebabToCamel('background-color'))   // 'backgroundColor'
console.log(kebabToCamel('is-active'))          // 'isActive'
console.log(kebabToCamel('my-component-name'))  // 'myComponentName'

// 使用场景：CSS属性转换
const cssToJs = (cssProperty: string) => kebabToCamel(cssProperty)
const jsToCss = (jsProperty: string) => camelToKebab(jsProperty)

console.log(cssToJs('font-size'))       // 'fontSize'
console.log(jsToCss('marginTop'))       // 'margin-top'

// 使用场景：组件名转换
const componentToCss = (componentName: string) => {
  return camelToKebab(componentName).replace(/^-/, '')
}
console.log(componentToCss('MyButton'))  // 'my-button'
```

### JSON 验证

```typescript
import { isValidJSON } from '@/utils/string'

// 验证JSON字符串
console.log(isValidJSON('{"name": "张三"}'))     // true
console.log(isValidJSON('[1, 2, 3]'))            // true
console.log(isValidJSON('null'))                 // true
console.log(isValidJSON('"hello"'))              // true

// 无效JSON
console.log(isValidJSON('{name: "张三"}'))       // false (缺少引号)
console.log(isValidJSON("{'name': '张三'}"))     // false (单引号)
console.log(isValidJSON('undefined'))            // false
console.log(isValidJSON(''))                     // false

// 使用场景：安全解析JSON
const safeParseJSON = <T>(str: string, defaultValue: T): T => {
  if (!isValidJSON(str)) {
    return defaultValue
  }
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

const config = safeParseJSON('{"theme": "dark"}', { theme: 'light' })
console.log(config)  // { theme: 'dark' }

const invalid = safeParseJSON('invalid', { theme: 'light' })
console.log(invalid)  // { theme: 'light' }
```

## URL 处理

### 外部链接检测

```typescript
import { isExternal, isHttp } from '@/utils/string'

// 检测是否为外部链接
console.log(isExternal('https://example.com'))   // true
console.log(isExternal('http://example.com'))    // true
console.log(isExternal('//example.com'))         // true
console.log(isExternal('mailto:test@test.com'))  // true
console.log(isExternal('tel:12345678'))          // true
console.log(isExternal('/page/index'))           // false
console.log(isExternal('page/index'))            // false

// 检测是否为HTTP/HTTPS链接
console.log(isHttp('https://example.com'))       // true
console.log(isHttp('http://example.com'))        // true
console.log(isHttp('//example.com'))             // false
console.log(isHttp('/api/users'))                // false

// 使用场景：导航处理
const handleNavigation = (url: string) => {
  if (isExternal(url)) {
    // 外部链接：使用系统浏览器打开
    // #ifdef H5
    window.open(url, '_blank')
    // #endif
    // #ifndef H5
    plus.runtime.openURL(url)
    // #endif
  } else {
    // 内部链接：使用 uni.navigateTo
    uni.navigateTo({ url })
  }
}
```

### URL 参数解析

```typescript
import { getQueryObject, objectToQuery } from '@/utils/string'

// 从URL中解析查询参数
const url1 = 'https://example.com?name=张三&age=25&city=北京'
const params1 = getQueryObject(url1)
console.log('解析结果:', params1)
// 输出: { name: '张三', age: '25', city: '北京' }

// 只有路径部分
const url2 = '/api/users?status=active&page=1'
const params2 = getQueryObject(url2)
console.log('路径参数:', params2)
// 输出: { status: 'active', page: '1' }

// 无参数
const url3 = 'https://example.com/path'
const params3 = getQueryObject(url3)
console.log('无参数:', params3)
// 输出: {}

// 对象转查询字符串
const paramsObj = {
  name: '张三',
  age: 25,
  tags: ['vue', 'react']
}
const queryString = objectToQuery(paramsObj)
console.log('查询字符串:', queryString)
// 输出: "name=张三&age=25&tags=vue&tags=react"

// 空值过滤
const paramsWithEmpty = {
  name: '张三',
  age: null,
  city: undefined,
  status: ''
}
const filteredQuery = objectToQuery(paramsWithEmpty)
console.log('过滤空值:', filteredQuery)
// 输出: "name=张三"

// 使用场景：构建请求URL
const buildRequestUrl = (baseUrl: string, params: Record<string, any>) => {
  const query = objectToQuery(params)
  return query ? `${baseUrl}?${query}` : baseUrl
}

const apiUrl = buildRequestUrl('/api/users', { status: 'active', page: 1 })
console.log('请求URL:', apiUrl)
// 输出: "/api/users?status=active&page=1"
```

### 路径处理

```typescript
import { normalizePath, isPathMatch } from '@/utils/string'

// 路径规范化
console.log(normalizePath('/api//users/'))      // '/api/users'
console.log(normalizePath('api/users'))         // '/api/users'
console.log(normalizePath('//api///users//'))   // '/api/users'
console.log(normalizePath('/'))                 // '/'
console.log(normalizePath(''))                  // '/'

// 路径匹配（支持通配符）
// 精确匹配
console.log(isPathMatch('/api/users', '/api/users'))     // true
console.log(isPathMatch('/api/users', '/api/posts'))     // false

// 单层通配符 *
console.log(isPathMatch('/api/*', '/api/users'))         // true
console.log(isPathMatch('/api/*', '/api/users/123'))     // false (不匹配多层)

// 多层通配符 **
console.log(isPathMatch('/api/**', '/api/users'))        // true
console.log(isPathMatch('/api/**', '/api/users/123'))    // true
console.log(isPathMatch('/api/**', '/api/users/123/edit'))// true

// 组合使用
console.log(isPathMatch('/api/*/detail', '/api/users/detail'))  // true
console.log(isPathMatch('/api/*/detail', '/api/posts/detail'))  // true

// 使用场景：路由权限检查
const checkPermission = (userPaths: string[], targetPath: string): boolean => {
  return userPaths.some(pattern => isPathMatch(pattern, targetPath))
}

const userPermissions = ['/api/users/**', '/api/posts/*']
console.log(checkPermission(userPermissions, '/api/users/123'))      // true
console.log(checkPermission(userPermissions, '/api/users/123/edit')) // true
console.log(checkPermission(userPermissions, '/api/posts/list'))     // true
console.log(checkPermission(userPermissions, '/api/admin/config'))   // false
```

## 布尔值转换

### 多格式布尔值识别

```typescript
import { isTrue, isFalse, toBool, toBoolString, toggleStatus } from '@/utils/boolean'

// 判断是否为真值
console.log(isTrue(true))        // true
console.log(isTrue(1))           // true
console.log(isTrue('1'))         // true
console.log(isTrue('true'))      // true
console.log(isTrue('yes'))       // true
console.log(isTrue('on'))        // true
console.log(isTrue('TRUE'))      // true (不区分大小写)
console.log(isTrue('Yes'))       // true
console.log(isTrue(false))       // false
console.log(isTrue(0))           // false
console.log(isTrue(''))          // false
console.log(isTrue(null))        // false

// 判断是否为假值
console.log(isFalse(false))      // true
console.log(isFalse(0))          // true
console.log(isFalse('0'))        // true
console.log(isFalse('false'))    // true
console.log(isFalse('no'))       // true
console.log(isFalse('off'))      // true
console.log(isFalse(null))       // true
console.log(isFalse(undefined))  // true
console.log(isFalse(''))         // true
console.log(isFalse(true))       // false
console.log(isFalse(1))          // false
```

### 布尔值转换

```typescript
import { toBool, toBoolString } from '@/utils/boolean'

// 转换为布尔值
console.log(toBool('1'))         // true
console.log(toBool('true'))      // true
console.log(toBool('yes'))       // true
console.log(toBool(1))           // true
console.log(toBool('0'))         // false
console.log(toBool('false'))     // false
console.log(toBool(''))          // false

// 转换为布尔字符串（'1' 或 '0'）
console.log(toBoolString(true))      // '1'
console.log(toBoolString(false))     // '0'
console.log(toBoolString('yes'))     // '1'
console.log(toBoolString('no'))      // '0'
console.log(toBoolString(1))         // '1'
console.log(toBoolString(0))         // '0'
console.log(toBoolString(null))      // '0'

// 使用场景：与后端接口对接
interface ApiResponse {
  isEnabled: string  // 后端返回 '1' 或 '0'
}

const response: ApiResponse = { isEnabled: '1' }
const enabled = toBool(response.isEnabled)
console.log('是否启用:', enabled)  // true

// 使用场景：表单提交
const submitForm = (form: { status: boolean }) => {
  return {
    status: toBoolString(form.status)  // 转为 '1' 或 '0' 发送给后端
  }
}
```

### 状态切换

```typescript
import { toggleStatus } from '@/utils/boolean'

// 切换状态并返回新值
let status = '1'
status = toggleStatus(status)
console.log('切换后:', status)  // '0'

status = toggleStatus(status)
console.log('再次切换:', status)  // '1'

// 支持多种输入格式
console.log(toggleStatus(true))     // '0'
console.log(toggleStatus(false))    // '1'
console.log(toggleStatus('yes'))    // '0'
console.log(toggleStatus('no'))     // '1'

// 使用场景：开关组件
const handleSwitchChange = (currentValue: string) => {
  const newValue = toggleStatus(currentValue)
  // 发送请求更新状态
  updateStatus(newValue)
  return newValue
}

// 使用场景：批量状态切换
const items = [
  { id: 1, status: '1' },
  { id: 2, status: '0' },
  { id: 3, status: '1' }
]

const toggledItems = items.map(item => ({
  ...item,
  status: toggleStatus(item.status)
}))
console.log(toggledItems)
// 输出: [{ id: 1, status: '0' }, { id: 2, status: '1' }, { id: 3, status: '0' }]
```

### 布尔值处理实际应用

```vue
<template>
  <view class="settings">
    <!-- 开关设置 -->
    <view class="setting-item">
      <text class="label">推送通知</text>
      <wd-switch
        :model-value="toBool(settings.pushEnabled)"
        @change="handlePushChange"
      />
    </view>

    <view class="setting-item">
      <text class="label">深色模式</text>
      <wd-switch
        :model-value="toBool(settings.darkMode)"
        @change="handleDarkModeChange"
      />
    </view>

    <!-- 状态标签 -->
    <view class="status-tag" :class="{ active: isTrue(userStatus) }">
      {{ isTrue(userStatus) ? '在线' : '离线' }}
    </view>

    <!-- 条件渲染 -->
    <view v-if="isTrue(settings.showAdvanced)" class="advanced-settings">
      高级设置内容...
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { isTrue, toBool, toBoolString, toggleStatus } from '@/utils/boolean'

interface Settings {
  pushEnabled: string
  darkMode: string
  showAdvanced: string
}

const settings = ref<Settings>({
  pushEnabled: '1',
  darkMode: '0',
  showAdvanced: '0'
})

const userStatus = ref('1')

// 处理推送开关变化
const handlePushChange = (value: boolean) => {
  settings.value.pushEnabled = toBoolString(value)
  // 发送到后端
  updateSettings({ pushEnabled: settings.value.pushEnabled })
}

// 处理深色模式变化
const handleDarkModeChange = (value: boolean) => {
  settings.value.darkMode = toBoolString(value)
  // 应用主题
  applyTheme(value ? 'dark' : 'light')
}

// 模拟API调用
const updateSettings = async (data: Partial<Settings>) => {
  console.log('更新设置:', data)
}

const applyTheme = (theme: string) => {
  console.log('应用主题:', theme)
}
</script>

```

## 数据验证

### 文件验证

```typescript
import {
  isImage,
  isVideo,
  isAudio,
  isDocument,
  getFileExtension,
  isFileSizeValid
} from '@/utils/validators'

// 图片验证
console.log(isImage('photo.jpg'))    // true
console.log(isImage('image.png'))    // true
console.log(isImage('pic.gif'))      // true
console.log(isImage('doc.pdf'))      // false

// 视频验证
console.log(isVideo('movie.mp4'))    // true
console.log(isVideo('clip.avi'))     // true
console.log(isVideo('video.mov'))    // true
console.log(isVideo('audio.mp3'))    // false

// 音频验证
console.log(isAudio('song.mp3'))     // true
console.log(isAudio('music.wav'))    // true
console.log(isAudio('voice.aac'))    // true
console.log(isAudio('video.mp4'))    // false

// 文档验证
console.log(isDocument('report.pdf'))    // true
console.log(isDocument('data.xlsx'))     // true
console.log(isDocument('document.docx')) // true
console.log(isDocument('image.jpg'))     // false

// 获取文件扩展名
console.log(getFileExtension('photo.jpg'))       // 'jpg'
console.log(getFileExtension('archive.tar.gz'))  // 'gz'
console.log(getFileExtension('noextension'))     // ''

// 验证文件大小
const maxSize = 5 * 1024 * 1024  // 5MB
console.log(isFileSizeValid(1024 * 1024, maxSize))      // true (1MB < 5MB)
console.log(isFileSizeValid(10 * 1024 * 1024, maxSize)) // false (10MB > 5MB)

// 使用场景：文件上传验证
const validateUploadFile = (file: { name: string; size: number }) => {
  const errors: string[] = []

  // 验证文件类型
  if (!isImage(file.name) && !isDocument(file.name)) {
    errors.push('只支持图片和文档格式')
  }

  // 验证文件大小（最大10MB）
  if (!isFileSizeValid(file.size, 10 * 1024 * 1024)) {
    errors.push('文件大小不能超过10MB')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### 字符串验证

```typescript
import {
  isEmptyString,
  isNotEmptyString,
  hasMinLength,
  hasMaxLength,
  isLengthBetween,
  containsOnlyLetters,
  containsOnlyNumbers,
  containsOnlyAlphanumeric,
  startsWithLetter,
  isLowerCase,
  isUpperCase
} from '@/utils/validators'

// 空字符串验证
console.log(isEmptyString(''))           // true
console.log(isEmptyString('  '))         // true
console.log(isEmptyString(null))         // true
console.log(isEmptyString('hello'))      // false

console.log(isNotEmptyString('hello'))   // true
console.log(isNotEmptyString(''))        // false

// 长度验证
console.log(hasMinLength('hello', 3))    // true
console.log(hasMinLength('hi', 3))       // false

console.log(hasMaxLength('hello', 10))   // true
console.log(hasMaxLength('hello world', 5)) // false

console.log(isLengthBetween('hello', 3, 10))  // true
console.log(isLengthBetween('hi', 3, 10))     // false

// 字符类型验证
console.log(containsOnlyLetters('Hello'))        // true
console.log(containsOnlyLetters('Hello123'))     // false

console.log(containsOnlyNumbers('12345'))        // true
console.log(containsOnlyNumbers('123abc'))       // false

console.log(containsOnlyAlphanumeric('Hello123')) // true
console.log(containsOnlyAlphanumeric('Hello@123'))// false

console.log(startsWithLetter('hello123'))        // true
console.log(startsWithLetter('123hello'))        // false

console.log(isLowerCase('hello'))                // true
console.log(isLowerCase('Hello'))                // false

console.log(isUpperCase('HELLO'))                // true
console.log(isUpperCase('Hello'))                // false

// 使用场景：用户名验证
const validateUsername = (username: string) => {
  if (!isNotEmptyString(username)) {
    return '用户名不能为空'
  }
  if (!isLengthBetween(username, 4, 20)) {
    return '用户名长度需要在4-20个字符之间'
  }
  if (!startsWithLetter(username)) {
    return '用户名必须以字母开头'
  }
  if (!containsOnlyAlphanumeric(username)) {
    return '用户名只能包含字母和数字'
  }
  return ''
}
```

### 类型检查

```typescript
import {
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isFunction,
  isDate,
  isNull,
  isUndefined,
  isNullOrUndefined,
  isPrimitive
} from '@/utils/validators'

// 基础类型检查
console.log(isString('hello'))       // true
console.log(isString(123))           // false

console.log(isNumber(123))           // true
console.log(isNumber('123'))         // false
console.log(isNumber(NaN))           // false (NaN不是有效数字)

console.log(isBoolean(true))         // true
console.log(isBoolean('true'))       // false

console.log(isArray([1, 2, 3]))      // true
console.log(isArray('123'))          // false

console.log(isObject({ a: 1 }))      // true
console.log(isObject([1, 2, 3]))     // false (数组不算对象)
console.log(isObject(null))          // false

console.log(isFunction(() => {}))    // true
console.log(isFunction('function'))  // false

console.log(isDate(new Date()))      // true
console.log(isDate('2025-12-14'))    // false

// 空值检查
console.log(isNull(null))            // true
console.log(isNull(undefined))       // false

console.log(isUndefined(undefined))  // true
console.log(isUndefined(null))       // false

console.log(isNullOrUndefined(null))      // true
console.log(isNullOrUndefined(undefined)) // true
console.log(isNullOrUndefined(''))        // false

// 原始类型检查
console.log(isPrimitive('hello'))    // true
console.log(isPrimitive(123))        // true
console.log(isPrimitive(true))       // true
console.log(isPrimitive(null))       // true
console.log(isPrimitive({ a: 1 }))   // false

// 使用场景：安全类型转换
const safeToNumber = (value: any, defaultValue: number = 0): number => {
  if (isNumber(value)) return value
  if (isString(value)) {
    const num = Number(value)
    return isNumber(num) ? num : defaultValue
  }
  return defaultValue
}

console.log(safeToNumber('123'))     // 123
console.log(safeToNumber('abc'))     // 0
console.log(safeToNumber(null))      // 0
```

### 数值验证

```typescript
import {
  isPositiveNumber,
  isNegativeNumber,
  isInteger,
  isPositiveInteger,
  isNonNegativeInteger,
  isInRange,
  isDecimal,
  hasMaxDecimalPlaces
} from '@/utils/validators'

// 正负数验证
console.log(isPositiveNumber(10))    // true
console.log(isPositiveNumber(-5))    // false
console.log(isPositiveNumber(0))     // false

console.log(isNegativeNumber(-5))    // true
console.log(isNegativeNumber(10))    // false

// 整数验证
console.log(isInteger(10))           // true
console.log(isInteger(10.5))         // false
console.log(isInteger(-5))           // true

console.log(isPositiveInteger(10))   // true
console.log(isPositiveInteger(-5))   // false
console.log(isPositiveInteger(0))    // false

console.log(isNonNegativeInteger(0)) // true
console.log(isNonNegativeInteger(10))// true
console.log(isNonNegativeInteger(-1))// false

// 范围验证
console.log(isInRange(5, 1, 10))     // true
console.log(isInRange(0, 1, 10))     // false
console.log(isInRange(10, 1, 10))    // true (包含边界)

// 小数验证
console.log(isDecimal(10.5))         // true
console.log(isDecimal(10))           // false

console.log(hasMaxDecimalPlaces(10.12, 2))   // true
console.log(hasMaxDecimalPlaces(10.123, 2))  // false

// 使用场景：价格验证
const validatePrice = (price: any) => {
  if (!isNumber(price)) {
    return '价格必须是数字'
  }
  if (!isPositiveNumber(price)) {
    return '价格必须大于0'
  }
  if (!hasMaxDecimalPlaces(price, 2)) {
    return '价格最多保留2位小数'
  }
  return ''
}

console.log(validatePrice(99.99))   // ''
console.log(validatePrice(-10))     // '价格必须大于0'
console.log(validatePrice(9.999))   // '价格最多保留2位小数'
```

### 日期验证

```typescript
import {
  isValidDate,
  isValidDateString,
  isDateInFuture,
  isDateInPast,
  isDateBefore,
  isDateAfter,
  isDateBetween,
  isWeekday,
  isWeekend
} from '@/utils/validators'

// 日期有效性验证
console.log(isValidDate(new Date()))              // true
console.log(isValidDate(new Date('invalid')))     // false

console.log(isValidDateString('2025-12-14'))      // true
console.log(isValidDateString('2025-13-14'))      // false (月份无效)
console.log(isValidDateString('invalid'))         // false

// 日期比较
const today = new Date()
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

console.log(isDateInFuture(tomorrow))             // true
console.log(isDateInFuture(yesterday))            // false

console.log(isDateInPast(yesterday))              // true
console.log(isDateInPast(tomorrow))               // false

console.log(isDateBefore(yesterday, today))       // true
console.log(isDateAfter(tomorrow, today))         // true

// 日期范围验证
const startDate = new Date('2025-12-01')
const endDate = new Date('2025-12-31')
const testDate = new Date('2025-12-14')

console.log(isDateBetween(testDate, startDate, endDate))  // true

// 工作日/周末验证
const monday = new Date('2025-12-15')  // 周一
const saturday = new Date('2025-12-13') // 周六

console.log(isWeekday(monday))         // true
console.log(isWeekend(saturday))       // true

// 使用场景：预约日期验证
const validateAppointmentDate = (date: Date) => {
  if (!isValidDate(date)) {
    return '请选择有效日期'
  }
  if (!isDateInFuture(date)) {
    return '预约日期必须是未来日期'
  }
  if (isWeekend(date)) {
    return '周末不可预约'
  }
  return ''
}
```

### 中国特色验证

```typescript
import {
  isChineseIdCard,
  isChinesePhone,
  isChineseName,
  isPostalCode,
  isCarPlate,
  isUnifiedSocialCreditCode
} from '@/utils/validators'

// 身份证号验证（18位，含校验位验证）
console.log(isChineseIdCard('110101199003076534'))   // true (校验位正确)
console.log(isChineseIdCard('110101199003076535'))   // false (校验位错误)
console.log(isChineseIdCard('11010119900307653'))    // false (长度错误)

// 手机号验证
console.log(isChinesePhone('13812345678'))          // true
console.log(isChinesePhone('19912345678'))          // true
console.log(isChinesePhone('12345678901'))          // false (号段错误)
console.log(isChinesePhone('1381234567'))           // false (长度错误)

// 中文姓名验证
console.log(isChineseName('张三'))                  // true
console.log(isChineseName('欧阳修'))                // true
console.log(isChineseName('阿凡提·艾买提'))        // true (支持·分隔)
console.log(isChineseName('John'))                  // false

// 邮政编码验证
console.log(isPostalCode('100000'))                 // true
console.log(isPostalCode('12345'))                  // false (长度错误)

// 车牌号验证
console.log(isCarPlate('京A12345'))                 // true
console.log(isCarPlate('粤B12345D'))                // true (新能源)
console.log(isCarPlate('ABC12345'))                 // false

// 统一社会信用代码验证
console.log(isUnifiedSocialCreditCode('91110000717825393G'))  // true

// 使用场景：实名认证表单验证
const validateRealNameForm = (form: {
  name: string
  idCard: string
  phone: string
}) => {
  const errors: Record<string, string> = {}

  if (!isChineseName(form.name)) {
    errors.name = '请输入有效的中文姓名'
  }

  if (!isChineseIdCard(form.idCard)) {
    errors.idCard = '请输入有效的身份证号'
  }

  if (!isChinesePhone(form.phone)) {
    errors.phone = '请输入有效的手机号'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
```

### 表单验证

```typescript
import {
  isEmail,
  isUrl,
  isStrongPassword,
  isMediumPassword,
  isWeakPassword,
  getPasswordStrength
} from '@/utils/validators'

// 邮箱验证
console.log(isEmail('test@example.com'))     // true
console.log(isEmail('test@example'))         // false
console.log(isEmail('invalid-email'))        // false

// URL验证
console.log(isUrl('https://example.com'))    // true
console.log(isUrl('http://localhost:3000'))  // true
console.log(isUrl('ftp://files.example.com'))// true
console.log(isUrl('invalid-url'))            // false

// 密码强度验证
// 强密码：8位以上，包含大小写字母、数字和特殊字符
console.log(isStrongPassword('Abc123!@#'))   // true
console.log(isStrongPassword('abc123'))      // false

// 中等密码：8位以上，包含大小写字母和数字
console.log(isMediumPassword('Abc12345'))    // true
console.log(isMediumPassword('abc123'))      // false

// 弱密码：6位以上
console.log(isWeakPassword('123456'))        // true
console.log(isWeakPassword('12345'))         // false

// 获取密码强度等级
console.log(getPasswordStrength('123456'))       // 'weak'
console.log(getPasswordStrength('Abc12345'))     // 'medium'
console.log(getPasswordStrength('Abc123!@#'))    // 'strong'
console.log(getPasswordStrength(''))             // 'none'

// 使用场景：注册表单验证
const validateRegistration = (form: {
  email: string
  password: string
  confirmPassword: string
}) => {
  const errors: Record<string, string> = {}

  if (!isEmail(form.email)) {
    errors.email = '请输入有效的邮箱地址'
  }

  const strength = getPasswordStrength(form.password)
  if (strength === 'none' || strength === 'weak') {
    errors.password = '密码强度不足，请使用更复杂的密码'
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
```

### 网络标识验证

```typescript
import {
  isIPv4,
  isIPv6,
  isIP,
  isMacAddress,
  isPort,
  isDomain
} from '@/utils/validators'

// IPv4地址验证
console.log(isIPv4('192.168.1.1'))        // true
console.log(isIPv4('192.168.1.256'))      // false (超出范围)
console.log(isIPv4('192.168.1'))          // false (格式错误)

// IPv6地址验证
console.log(isIPv6('::1'))                            // true
console.log(isIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334'))  // true
console.log(isIPv6('invalid'))                        // false

// IP地址验证（IPv4或IPv6）
console.log(isIP('192.168.1.1'))          // true
console.log(isIP('::1'))                  // true

// MAC地址验证
console.log(isMacAddress('00:1A:2B:3C:4D:5E'))  // true
console.log(isMacAddress('00-1A-2B-3C-4D-5E'))  // true
console.log(isMacAddress('invalid'))            // false

// 端口号验证
console.log(isPort(80))                   // true
console.log(isPort(443))                  // true
console.log(isPort(0))                    // false
console.log(isPort(65536))                // false (超出范围)

// 域名验证
console.log(isDomain('example.com'))      // true
console.log(isDomain('sub.example.com'))  // true
console.log(isDomain('localhost'))        // false
console.log(isDomain('192.168.1.1'))      // false (IP不是域名)

// 使用场景：服务器配置验证
const validateServerConfig = (config: {
  host: string
  port: number
}) => {
  const errors: Record<string, string> = {}

  if (!isIP(config.host) && !isDomain(config.host)) {
    errors.host = '请输入有效的IP地址或域名'
  }

  if (!isPort(config.port)) {
    errors.port = '端口号必须在1-65535之间'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
```

### 金融验证

```typescript
import {
  isBankCard,
  isCreditCard,
  isAmount
} from '@/utils/validators'

// 银行卡号验证（Luhn算法）
console.log(isBankCard('6222021234567890123'))   // true
console.log(isBankCard('1234567890123456'))      // false (校验失败)
console.log(isBankCard('123'))                   // false (长度错误)

// 信用卡号验证（Luhn算法）
console.log(isCreditCard('4111111111111111'))    // true (Visa测试卡)
console.log(isCreditCard('5500000000000004'))    // true (MasterCard测试卡)
console.log(isCreditCard('1234567890123456'))    // false (校验失败)

// 金额验证
console.log(isAmount('100.00'))              // true
console.log(isAmount('100'))                 // true
console.log(isAmount('100.123'))             // false (超过2位小数)
console.log(isAmount('-100'))                // false (负数)
console.log(isAmount('abc'))                 // false

// 使用场景：支付表单验证
const validatePaymentForm = (form: {
  cardNumber: string
  amount: string
}) => {
  const errors: Record<string, string> = {}

  if (!isBankCard(form.cardNumber) && !isCreditCard(form.cardNumber)) {
    errors.cardNumber = '请输入有效的银行卡号'
  }

  if (!isAmount(form.amount)) {
    errors.amount = '请输入有效的金额'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
```

## 类型定义

### 日期工具类型

```typescript
/**
 * 日期输入类型
 */
type DateInput = Date | string | number

/**
 * 日期格式模式
 */
type DatePattern =
  | 'yyyy-MM-dd'
  | 'yyyy-MM-dd HH:mm:ss'
  | 'yyyy年MM月dd日'
  | 'MM/dd/yyyy'
  | 'HH:mm:ss'
  | 'HH:mm'
  | string

/**
 * 时间戳类型
 */
type TimestampType = 'ms' | 's'

/**
 * 日期加减类型
 */
type DateAddType = 'day' | 'month' | 'year'

// ============== 日期工具函数类型 ==============

/**
 * 格式化日期
 */
declare function formatDate(
  time: DateInput,
  pattern?: DatePattern
): string

/**
 * 格式化表格日期
 */
declare function formatTableDate(
  cellValue: string,
  pattern?: DatePattern
): string

/**
 * 仅格式化日期部分
 */
declare function formatDay(time: DateInput): string

/**
 * 格式化相对时间
 */
declare function formatRelativeTime(
  time: string | number,
  option?: string
): string

/**
 * 格式化日期范围
 */
declare function formatDateRange(
  dateRange: [Date, Date],
  separator?: string,
  format?: string
): string

/**
 * 获取当前时间
 */
declare function getCurrentTime(pattern?: string): string

/**
 * 获取当前日期
 */
declare function getCurrentDate(): string

/**
 * 获取当前日期时间
 */
declare function getCurrentDateTime(): string

/**
 * 解析日期字符串
 */
declare function parseDate(dateStr: string): Date | null

/**
 * 获取时间戳
 */
declare function getTimeStamp(type?: TimestampType): number

/**
 * 获取日期范围
 */
declare function getDateRange(days: number): [Date, Date]

/**
 * 获取本周范围
 */
declare function getCurrentWeekRange(): [Date, Date]

/**
 * 获取本月范围
 */
declare function getCurrentMonthRange(): [Date, Date]

/**
 * 添加日期范围到参数
 */
declare function addDateRange(
  params: any,
  dateRange: any[],
  propName?: string
): any

/**
 * 计算两个日期之间的天数
 */
declare function getDaysBetween(start: Date, end: Date): number

/**
 * 判断是否同一天
 */
declare function isSameDay(date1: Date, date2: Date): boolean

/**
 * 获取年中的第几周
 */
declare function getWeekOfYear(date: Date): number

/**
 * 日期加减运算
 */
declare function dateAdd(
  date: Date,
  type: DateAddType,
  value: number
): Date
```

### 字符串工具类型

```typescript
// ============== 字符串工具函数类型 ==============

/**
 * 解析空字符串
 */
declare function parseStrEmpty(str: any): string

/**
 * 判断字符串是否为空
 */
declare function isEmpty(str: any): boolean

/**
 * 首字母大写
 */
declare function capitalize(str: string): string

/**
 * 字符串截断
 */
declare function truncate(
  str: string,
  maxLength: number,
  ellipsis?: string
): string

/**
 * 计算字符串字节长度
 */
declare function byteLength(str: string): number

/**
 * 生成唯一字符串
 */
declare function createUniqueString(): string

/**
 * 字符串格式化（sprintf风格）
 */
declare function sprintf(str: string, ...args: any[]): string

/**
 * HTML转纯文本
 */
declare function html2Text(html: string): string

/**
 * 获取文本摘要
 */
declare function getTextExcerpt(
  html: string,
  length: number,
  ellipsis?: string
): string

/**
 * HTML转义
 */
declare function escapeHtml(html: string): string

/**
 * 判断是否为外部链接
 */
declare function isExternal(path: string): boolean

/**
 * 判断是否为HTTP链接
 */
declare function isHttp(url: string): boolean

/**
 * 解析URL查询参数
 */
declare function getQueryObject(url: string): Record<string, string>

/**
 * 对象转查询字符串
 */
declare function objectToQuery(params: Record<string, any>): string

/**
 * 路径规范化
 */
declare function normalizePath(path: string): string

/**
 * 路径匹配
 */
declare function isPathMatch(pattern: string, path: string): boolean

/**
 * 驼峰转连字符
 */
declare function camelToKebab(str: string): string

/**
 * 连字符转驼峰
 */
declare function kebabToCamel(str: string): string

/**
 * 判断是否为有效JSON
 */
declare function isValidJSON(str: string): boolean
```

### 布尔值工具类型

```typescript
/**
 * 真值表示
 */
type TrueValue = true | 1 | '1' | 'true' | 'yes' | 'on'

/**
 * 假值表示
 */
type FalseValue = false | 0 | '0' | 'false' | 'no' | 'off' | null | undefined | ''

// ============== 布尔值工具函数类型 ==============

/**
 * 判断是否为真值
 */
declare function isTrue(value: any): boolean

/**
 * 判断是否为假值
 */
declare function isFalse(value: any): boolean

/**
 * 转换为布尔字符串
 */
declare function toBoolString(value: any): '1' | '0'

/**
 * 转换为布尔值
 */
declare function toBool(value: any): boolean

/**
 * 切换状态
 */
declare function toggleStatus(value: any): '1' | '0'
```

### 验证工具类型

```typescript
/**
 * 密码强度等级
 */
type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong'

/**
 * 验证结果
 */
interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

// ============== 验证工具函数类型 ==============

// 文件验证
declare function isImage(filename: string): boolean
declare function isVideo(filename: string): boolean
declare function isAudio(filename: string): boolean
declare function isDocument(filename: string): boolean
declare function getFileExtension(filename: string): string
declare function isFileSizeValid(size: number, maxSize: number): boolean

// 字符串验证
declare function isEmptyString(str: any): boolean
declare function isNotEmptyString(str: any): boolean
declare function hasMinLength(str: string, min: number): boolean
declare function hasMaxLength(str: string, max: number): boolean
declare function isLengthBetween(str: string, min: number, max: number): boolean
declare function containsOnlyLetters(str: string): boolean
declare function containsOnlyNumbers(str: string): boolean
declare function containsOnlyAlphanumeric(str: string): boolean
declare function startsWithLetter(str: string): boolean
declare function isLowerCase(str: string): boolean
declare function isUpperCase(str: string): boolean

// 类型检查
declare function isString(value: any): value is string
declare function isNumber(value: any): value is number
declare function isBoolean(value: any): value is boolean
declare function isArray(value: any): value is any[]
declare function isObject(value: any): value is Record<string, any>
declare function isFunction(value: any): value is Function
declare function isDate(value: any): value is Date
declare function isNull(value: any): value is null
declare function isUndefined(value: any): value is undefined
declare function isNullOrUndefined(value: any): value is null | undefined
declare function isPrimitive(value: any): boolean

// 数值验证
declare function isPositiveNumber(value: number): boolean
declare function isNegativeNumber(value: number): boolean
declare function isInteger(value: number): boolean
declare function isPositiveInteger(value: number): boolean
declare function isNonNegativeInteger(value: number): boolean
declare function isInRange(value: number, min: number, max: number): boolean
declare function isDecimal(value: number): boolean
declare function hasMaxDecimalPlaces(value: number, places: number): boolean

// 日期验证
declare function isValidDate(date: any): boolean
declare function isValidDateString(str: string): boolean
declare function isDateInFuture(date: Date): boolean
declare function isDateInPast(date: Date): boolean
declare function isDateBefore(date: Date, target: Date): boolean
declare function isDateAfter(date: Date, target: Date): boolean
declare function isDateBetween(date: Date, start: Date, end: Date): boolean
declare function isWeekday(date: Date): boolean
declare function isWeekend(date: Date): boolean

// 中国特色验证
declare function isChineseIdCard(idCard: string): boolean
declare function isChinesePhone(phone: string): boolean
declare function isChineseName(name: string): boolean
declare function isPostalCode(code: string): boolean
declare function isCarPlate(plate: string): boolean
declare function isUnifiedSocialCreditCode(code: string): boolean

// 表单验证
declare function isEmail(email: string): boolean
declare function isUrl(url: string): boolean
declare function isStrongPassword(password: string): boolean
declare function isMediumPassword(password: string): boolean
declare function isWeakPassword(password: string): boolean
declare function getPasswordStrength(password: string): PasswordStrength

// 网络标识验证
declare function isIPv4(ip: string): boolean
declare function isIPv6(ip: string): boolean
declare function isIP(ip: string): boolean
declare function isMacAddress(mac: string): boolean
declare function isPort(port: number): boolean
declare function isDomain(domain: string): boolean

// 金融验证
declare function isBankCard(cardNumber: string): boolean
declare function isCreditCard(cardNumber: string): boolean
declare function isAmount(amount: string): boolean
```

## 最佳实践

### 1. 日期处理最佳实践

```typescript
// ✅ 正确: 使用工具函数处理日期
import { formatDate, parseDate, isValidDateString } from '@/utils/date'

const handleDateInput = (input: string) => {
  // 先验证格式
  if (!isValidDateString(input)) {
    return { error: '日期格式错误' }
  }

  // 安全解析
  const date = parseDate(input)
  if (!date) {
    return { error: '日期解析失败' }
  }

  // 格式化输出
  return { date: formatDate(date, 'yyyy-MM-dd') }
}

// ❌ 错误: 直接使用字符串操作
const handleDateInput = (input: string) => {
  // 不安全的字符串分割
  const [year, month, day] = input.split('-')
  return `${year}年${month}月${day}日`
}
```

### 2. 字符串处理最佳实践

```typescript
// ✅ 正确: 使用工具函数安全处理
import { isEmpty, truncate, escapeHtml } from '@/utils/string'

const displayUserContent = (content: any) => {
  if (isEmpty(content)) {
    return '暂无内容'
  }

  // 转义防止XSS
  const safeContent = escapeHtml(content)

  // 截断过长内容
  return truncate(safeContent, 200)
}

// ❌ 错误: 直接操作未验证的输入
const displayUserContent = (content: string) => {
  return content.substring(0, 200)  // 可能为null/undefined导致报错
}
```

### 3. 验证函数最佳实践

```typescript
// ✅ 正确: 组合验证函数创建表单验证器
import {
  isNotEmptyString,
  isEmail,
  getPasswordStrength,
  isChinesePhone
} from '@/utils/validators'

interface FormData {
  email: string
  password: string
  phone: string
}

const validateForm = (form: FormData): ValidationResult => {
  const errors: Record<string, string> = {}

  if (!isNotEmptyString(form.email)) {
    errors.email = '邮箱不能为空'
  } else if (!isEmail(form.email)) {
    errors.email = '邮箱格式不正确'
  }

  const strength = getPasswordStrength(form.password)
  if (strength === 'none') {
    errors.password = '密码不能为空'
  } else if (strength === 'weak') {
    errors.password = '密码强度不足'
  }

  if (!isNotEmptyString(form.phone)) {
    errors.phone = '手机号不能为空'
  } else if (!isChinesePhone(form.phone)) {
    errors.phone = '手机号格式不正确'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// ❌ 错误: 使用简单的正则硬编码
const validateForm = (form: FormData) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^1[3-9]\d{9}$/

  return {
    emailValid: emailRegex.test(form.email),
    phoneValid: phoneRegex.test(form.phone)
  }
}
```

### 4. 布尔值处理最佳实践

```typescript
// ✅ 正确: 使用工具函数处理多格式布尔值
import { isTrue, toBoolString } from '@/utils/boolean'

// API响应处理
const processApiResponse = (response: { enabled: string }) => {
  const enabled = isTrue(response.enabled)
  console.log('是否启用:', enabled)
}

// 表单提交处理
const submitForm = (form: { isActive: boolean }) => {
  return {
    isActive: toBoolString(form.isActive)  // 转为 '1' 或 '0'
  }
}

// ❌ 错误: 硬编码字符串比较
const processApiResponse = (response: { enabled: string }) => {
  const enabled = response.enabled === '1' || response.enabled === 'true'
}
```

### 5. URL处理最佳实践

```typescript
// ✅ 正确: 使用工具函数处理URL
import {
  isExternal,
  getQueryObject,
  objectToQuery,
  normalizePath
} from '@/utils/string'

const handleNavigation = (url: string) => {
  // 规范化路径
  const normalizedUrl = normalizePath(url)

  if (isExternal(normalizedUrl)) {
    // 外部链接处理
    // #ifdef H5
    window.open(normalizedUrl, '_blank')
    // #endif
  } else {
    // 内部导航
    uni.navigateTo({ url: normalizedUrl })
  }
}

const buildApiUrl = (baseUrl: string, params: Record<string, any>) => {
  const query = objectToQuery(params)
  return query ? `${baseUrl}?${query}` : baseUrl
}

// ❌ 错误: 手动拼接URL
const buildApiUrl = (baseUrl: string, params: Record<string, any>) => {
  let query = ''
  for (const key in params) {
    if (params[key] != null) {
      query += `${key}=${params[key]}&`
    }
  }
  return `${baseUrl}?${query.slice(0, -1)}`
}
```

## 常见问题

### 1. 日期格式化结果不正确

**问题原因:**
- 时区问题导致日期偏移
- 日期字符串格式不符合预期
- 使用了无效的格式模式

**解决方案:**

```typescript
import { formatDate, parseDate } from '@/utils/date'

// 处理时区问题
const formatWithTimezone = (dateStr: string) => {
  // 确保使用本地时区
  const date = new Date(dateStr)
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss')
}

// 安全解析日期
const safeFormatDate = (dateStr: string, pattern: string = 'yyyy-MM-dd') => {
  const date = parseDate(dateStr)
  if (!date) {
    console.warn('无效的日期字符串:', dateStr)
    return ''
  }
  return formatDate(date, pattern)
}

// 处理UTC时间
const formatUTCDate = (utcStr: string) => {
  // ISO格式自动处理时区
  const date = new Date(utcStr)
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss')
}
```

### 2. 验证函数返回意外结果

**问题原因:**
- 输入值类型与预期不符
- 未处理边界情况
- 正则表达式匹配规则理解错误

**解决方案:**

```typescript
import { isChinesePhone, isEmail } from '@/utils/validators'

// 预处理输入
const validatePhone = (phone: any) => {
  // 转为字符串并去除空格
  const cleaned = String(phone || '').trim()
  return isChinesePhone(cleaned)
}

// 处理边界情况
const validateEmail = (email: any) => {
  if (email === null || email === undefined) {
    return false
  }
  const cleaned = String(email).trim().toLowerCase()
  return isEmail(cleaned)
}

// 调试验证结果
const debugValidation = (value: string, validator: (v: string) => boolean) => {
  const result = validator(value)
  console.log(`验证 "${value}": ${result}`)
  return result
}
```

### 3. 字符串截断后显示异常

**问题原因:**
- 中英文混合时长度计算不准确
- 省略符被意外截断
- 特殊字符处理不当

**解决方案:**

```typescript
import { truncate, byteLength } from '@/utils/string'

// 按字节长度截断（更适合中英文混合）
const truncateByBytes = (str: string, maxBytes: number, ellipsis: string = '...') => {
  if (byteLength(str) <= maxBytes) {
    return str
  }

  let result = ''
  let currentBytes = 0
  const ellipsisBytes = byteLength(ellipsis)

  for (const char of str) {
    const charBytes = byteLength(char)
    if (currentBytes + charBytes + ellipsisBytes > maxBytes) {
      break
    }
    result += char
    currentBytes += charBytes
  }

  return result + ellipsis
}

// 安全截断（处理特殊字符）
const safeTruncate = (str: string, maxLength: number) => {
  // 先移除特殊字符
  const cleaned = str.replace(/[\x00-\x1F\x7F]/g, '')
  return truncate(cleaned, maxLength)
}
```

### 4. 布尔值转换结果不一致

**问题原因:**
- 后端返回的布尔值格式不统一
- 数据库存储格式与前端期望不匹配
- 类型强制转换问题

**解决方案:**

```typescript
import { isTrue, toBool, toBoolString } from '@/utils/boolean'

// 统一处理后端返回的布尔值
const normalizeBooleanField = <T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T => {
  const result = { ...obj }
  fields.forEach(field => {
    result[field] = toBool(obj[field]) as any
  })
  return result
}

// 使用示例
const apiResponse = {
  id: 1,
  isEnabled: '1',
  isVisible: 'true',
  isDefault: 1
}

const normalized = normalizeBooleanField(apiResponse, ['isEnabled', 'isVisible', 'isDefault'])
console.log(normalized)
// { id: 1, isEnabled: true, isVisible: true, isDefault: true }

// 准备提交数据时转回字符串
const prepareSubmitData = <T extends Record<string, any>>(
  obj: T,
  booleanFields: (keyof T)[]
): T => {
  const result = { ...obj }
  booleanFields.forEach(field => {
    result[field] = toBoolString(obj[field]) as any
  })
  return result
}
```

### 5. URL参数解析不完整

**问题原因:**
- URL编码/解码问题
- 特殊字符未正确处理
- 数组参数解析不正确

**解决方案:**

```typescript
import { getQueryObject, objectToQuery } from '@/utils/string'

// 处理特殊字符
const parseUrlWithSpecialChars = (url: string) => {
  try {
    // 确保URL已正确编码
    const encodedUrl = encodeURI(url)
    return getQueryObject(encodedUrl)
  } catch (e) {
    console.error('URL解析失败:', e)
    return {}
  }
}

// 处理数组参数
const parseArrayParams = (url: string, arrayKeys: string[]) => {
  const params = getQueryObject(url)
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(params)) {
    if (arrayKeys.includes(key)) {
      // 将重复的key合并为数组
      result[key] = result[key] || []
      result[key].push(value)
    } else {
      result[key] = value
    }
  }

  return result
}

// 安全构建URL
const buildSafeUrl = (baseUrl: string, params: Record<string, any>) => {
  // 过滤掉undefined和null
  const filteredParams: Record<string, any> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      filteredParams[key] = value
    }
  }

  const query = objectToQuery(filteredParams)
  return query ? `${baseUrl}?${query}` : baseUrl
}
```

### 6. 身份证验证通过但实际无效

**问题原因:**
- 只验证了格式未验证校验位
- 地区码不在有效范围内
- 出生日期不合理

**解决方案:**

```typescript
import { isChineseIdCard } from '@/utils/validators'

// 增强的身份证验证（包含业务规则）
const validateIdCardWithRules = (idCard: string) => {
  // 基础格式和校验位验证
  if (!isChineseIdCard(idCard)) {
    return { valid: false, error: '身份证格式不正确' }
  }

  // 提取出生日期
  const birthYear = parseInt(idCard.substring(6, 10))
  const birthMonth = parseInt(idCard.substring(10, 12))
  const birthDay = parseInt(idCard.substring(12, 14))
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay)

  // 验证年龄合理性（例如：18-120岁）
  const now = new Date()
  const age = now.getFullYear() - birthYear
  if (age < 18) {
    return { valid: false, error: '未满18周岁' }
  }
  if (age > 120) {
    return { valid: false, error: '年龄信息异常' }
  }

  // 验证出生日期不在未来
  if (birthDate > now) {
    return { valid: false, error: '出生日期不能是未来日期' }
  }

  return { valid: true, error: '' }
}
```

