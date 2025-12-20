# 格式化工具

## 概述

移动端格式化工具集，提供完整的数据处理能力，涵盖日期格式化、字符串处理、布尔值转换、数据验证等常用功能。工具集采用模块化设计，分布在 `date.ts`、`string.ts`、`boolean.ts`、`validators.ts` 四个核心文件中。

**核心特性:**

- **日期格式化** - 多种日期格式、相对时间、日期范围、日期计算
- **字符串处理** - 截断、转义、大小写转换、字节长度计算、HTML处理
- **布尔值转换** - 多格式识别（'1'/'0'、'true'/'false'、'yes'/'no'）
- **URL 处理** - 查询参数解析、路径规范化、通配符匹配
- **数据验证** - 手机号、身份证、邮箱、银行卡等验证
- **类型检查** - 字符串、数组、对象、数值的类型判断

## 系统架构

### 工具模块结构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           格式化工具系统架构                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          应用层 Application                          │   │
│  │                                                                     │   │
│  │    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌─────────┐  │   │
│  │    │  表单处理  │    │  列表展示  │    │  数据校验  │    │ API交互 │  │   │
│  │    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘    └────┬────┘  │   │
│  │          │                │                │               │       │   │
│  └──────────┼────────────────┼────────────────┼───────────────┼───────┘   │
│             │                │                │               │           │
│  ┌──────────┴────────────────┴────────────────┴───────────────┴───────┐   │
│  │                         工具层 Utils                                │   │
│  │                                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │   date.ts    │  │  string.ts   │  │  boolean.ts  │              │   │
│  │  │              │  │              │  │              │              │   │
│  │  │ • formatDate │  │ • truncate   │  │ • isTrue     │              │   │
│  │  │ • parseDate  │  │ • escapeHtml │  │ • isFalse    │              │   │
│  │  │ • dateAdd    │  │ • byteLength │  │ • toBool     │              │   │
│  │  │ • 日期范围   │  │ • URL处理    │  │ • 状态切换  │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │                      validators.ts                            │  │   │
│  │  │                                                               │  │   │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │  │   │
│  │  │  │文件验证 │  │URL验证  │  │类型检查 │  │ 中国特色验证    │  │  │   │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘  │  │   │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │  │   │
│  │  │  │数值验证 │  │日期验证 │  │表单验证 │  │ 网络/金融验证   │  │  │   │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘  │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 日期格式化流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          formatDate 处理流程                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    输入参数                                                                  │
│    ┌────────────────────────────────────────────────────────────────┐       │
│    │  time: Date | string | number                                  │       │
│    │  pattern: string = 'yyyy-MM-dd HH:mm:ss'                       │       │
│    └────────────────────────────────────────────────────────────────┘       │
│                              │                                              │
│                              ▼                                              │
│    ┌────────────────────────────────────────────────────────────────┐       │
│    │                     空值检查                                    │       │
│    │                                                                │       │
│    │    if (!time) return ''                                        │       │
│    └────────────────────────────────────────────────────────────────┘       │
│                              │                                              │
│                              ▼                                              │
│    ┌────────────────────────────────────────────────────────────────┐       │
│    │                     类型判断与转换                               │       │
│    │                                                                │       │
│    │    ┌──────────────────────────────────────────────────────┐    │       │
│    │    │  typeof time === 'object'                            │    │       │
│    │    │    → 直接使用 Date 对象                               │    │       │
│    │    ├──────────────────────────────────────────────────────┤    │       │
│    │    │  typeof time === 'string'                            │    │       │
│    │    │    → 纯数字字符串: parseInt                          │    │       │
│    │    │    → ISO格式: 替换 - 为 /，去除 T 和毫秒部分          │    │       │
│    │    ├──────────────────────────────────────────────────────┤    │       │
│    │    │  typeof time === 'number'                            │    │       │
│    │    │    → 10位: 秒级时间戳，乘以 1000                      │    │       │
│    │    │    → 13位: 毫秒级时间戳，直接使用                     │    │       │
│    │    └──────────────────────────────────────────────────────┘    │       │
│    └────────────────────────────────────────────────────────────────┘       │
│                              │                                              │
│                              ▼                                              │
│    ┌────────────────────────────────────────────────────────────────┐       │
│    │                     提取日期组件                                │       │
│    │                                                                │       │
│    │    year      = date.getFullYear()      // 2025                 │       │
│    │    month     = date.getMonth() + 1     // 1-12                 │       │
│    │    day       = date.getDate()          // 1-31                 │       │
│    │    hours     = date.getHours()         // 0-23                 │       │
│    │    minutes   = date.getMinutes()       // 0-59                 │       │
│    │    seconds   = date.getSeconds()       // 0-59                 │       │
│    │    week      = date.getDay()           // 0-6 (周日-周六)      │       │
│    └────────────────────────────────────────────────────────────────┘       │
│                              │                                              │
│                              ▼                                              │
│    ┌────────────────────────────────────────────────────────────────┐       │
│    │                     模式替换                                    │       │
│    │                                                                │       │
│    │    支持的格式模式 (同时兼容大小写):                             │       │
│    │    ┌─────────────────────────────────────────────────────┐     │       │
│    │    │ yyyy/YYYY → 四位年份        │ MM/M → 月份           │     │       │
│    │    │ dd/DD/d/D → 日期            │ HH/H → 小时           │     │       │
│    │    │ mm/m      → 分钟            │ ss/s → 秒             │     │       │
│    │    │ SSS       → 毫秒(3位)       │ w    → 星期(中文)     │     │       │
│    │    └─────────────────────────────────────────────────────┘     │       │
│    └────────────────────────────────────────────────────────────────┘       │
│                              │                                              │
│                              ▼                                              │
│    ┌────────────────────────────────────────────────────────────────┐       │
│    │  输出: "2025-12-14 15:30:45"                                   │       │
│    └────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 验证器分类体系

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          validators.ts 功能分类                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                           文件验证                                     │  │
│  │  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────────────┐   │  │
│  │  │   isBlob    │  │ isAllowedFileType│  │     isImageFile         │   │  │
│  │  │ Blob格式检测│  │   文件类型验证   │  │     图片文件检测         │   │  │
│  │  └─────────────┘  └─────────────────┘  └──────────────────────────┘   │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                       isWithinFileSize                          │  │  │
│  │  │                       文件大小验证                               │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                           URL和路径验证                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ isPathMatch │  │   isHttp    │  │ isExternal  │  │ isValidURL  │  │  │
│  │  │  路径匹配   │  │ HTTP协议    │  │  外部链接   │  │  URL格式    │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                         isDomain                                 │  │  │
│  │  │                         域名验证                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                           类型检查                                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │  isString   │  │  isArray    │  │  isObject   │  │isEmptyObject│  │  │
│  │  │  字符串     │  │   数组      │  │   对象      │  │  空对象     │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                       isValidJSON                                │  │  │
│  │  │                       JSON格式验证                               │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          中国特色验证                                 │  │
│  │  ┌─────────────────┐  ┌────────────────────┐  ┌──────────────────┐   │  │
│  │  │ isChineseIdCard │  │ isChinesePhoneNumber│  │   isPostalCode   │   │  │
│  │  │  身份证验证     │  │     手机号验证      │  │    邮编验证      │   │  │
│  │  │  (含校验位算法) │  │    (1[3-9]开头)     │  │   (6位数字)      │   │  │
│  │  └─────────────────┘  └────────────────────┘  └──────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          数值验证                                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │  isNumber   │  │  isInteger  │  │isPositiveNum│  │  isInRange  │  │  │
│  │  │  有效数字   │  │   整数      │  │   正数      │  │  范围内     │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          金融验证                                     │  │
│  │  ┌─────────────────────────┐  ┌──────────────────────────────────┐   │  │
│  │  │    isBankCardNumber     │  │       isCreditCardNumber         │   │  │
│  │  │      银行卡号验证       │  │     信用卡号验证(Luhn算法)       │   │  │
│  │  │      (13-19位数字)      │  │                                  │   │  │
│  │  └─────────────────────────┘  └──────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 日期格式化

### 基础格式化

```typescript
import { formatDate, formatDay, formatTableDate } from '@/utils/date'

// 格式化当前时间
formatDate(new Date())                    // "2025-12-14 15:30:45"
formatDate(new Date(), 'yyyy-MM-dd')      // "2025-12-14"
formatDate(new Date(), 'yyyy年MM月dd日')   // "2025年12月14日"

// 支持时间戳和字符串
formatDate(1734159045000, 'MM/dd/yyyy')   // "12/14/2025"
formatDate('2025-12-14T15:30:45.000Z')    // "2025-12-14 15:30:45"

// 仅日期部分
formatDay(new Date())                     // "2025-12-14"

// 表格日期（自动处理空值）
formatTableDate('2025-12-14T15:30:45.000Z')  // "2025-12-14 15:30:45"
formatTableDate('')                          // ""
```

**技术实现要点:**

- 自动兼容两种格式语法：`yyyy-MM-dd` 和 `YYYY-MM-DD`
- 支持10位秒级时间戳自动乘以1000转换为毫秒
- ISO日期字符串自动处理，替换 `-` 为 `/`，移除 `T` 和毫秒部分
- 数字前补零采用 `padStart` 方法实现

### 格式模式详解

| 模式 | 说明 | 示例 | 补零 |
|------|------|------|------|
| `yyyy`/`YYYY` | 四位年份 | 2025 | 否 |
| `MM` | 两位月份 | 01-12 | 是 |
| `M` | 月份 | 1-12 | 否 |
| `dd`/`DD` | 两位日期 | 01-31 | 是 |
| `d`/`D` | 日期 | 1-31 | 否 |
| `HH` | 24小时制(补零) | 00-23 | 是 |
| `H` | 24小时制 | 0-23 | 否 |
| `mm` | 分钟(补零) | 00-59 | 是 |
| `m` | 分钟 | 0-59 | 否 |
| `ss` | 秒(补零) | 00-59 | 是 |
| `s` | 秒 | 0-59 | 否 |
| `SSS` | 毫秒(3位) | 000-999 | 是 |
| `w` | 星期(中文) | 日/一/二/三/四/五/六 | 否 |

### 相对时间

```typescript
import { formatRelativeTime } from '@/utils/date'

formatRelativeTime(Date.now() - 10000)              // "刚刚"
formatRelativeTime(Date.now() - 5 * 60 * 1000)      // "5分钟前"
formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000) // "3小时前"
formatRelativeTime(Date.now() - 2 * 24 * 60 * 60 * 1000) // "1天前"
```

**时间阈值算法:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      相对时间阈值判断流程                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    diff = (当前时间 - 目标时间) / 1000   (秒)                               │
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │ diff < 30秒         →  "刚刚"                                   │      │
│    ├─────────────────────────────────────────────────────────────────┤      │
│    │ diff < 3600秒(1h)   →  "{Math.ceil(diff/60)}分钟前"             │      │
│    ├─────────────────────────────────────────────────────────────────┤      │
│    │ diff < 86400秒(24h) →  "{Math.ceil(diff/3600)}小时前"           │      │
│    ├─────────────────────────────────────────────────────────────────┤      │
│    │ diff < 172800秒(2d) →  "1天前"                                  │      │
│    ├─────────────────────────────────────────────────────────────────┤      │
│    │ 有自定义pattern     →  formatDate(date, pattern)                │      │
│    ├─────────────────────────────────────────────────────────────────┤      │
│    │ 默认               →  "{月}月{日}日{时}时{分}分"                │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 日期范围与计算

```typescript
import {
  formatDateRange, getDateRange, getCurrentWeekRange,
  getCurrentMonthRange, getDaysBetween, dateAdd, addDateRange
} from '@/utils/date'

// 日期范围格式化
formatDateRange([startDate, endDate])           // "2025-12-01 ~ 2025-12-31"
formatDateRange([startDate, endDate], ' 至 ')   // "2025-12-01 至 2025-12-31"

// 获取日期范围
getDateRange(7)           // 最近7天 [Date, Date]
getDateRange(-30)         // 过去30天 [Date, Date]
getCurrentWeekRange()     // 本周范围 [周一00:00:00, 周日23:59:59]
getCurrentMonthRange()    // 本月范围 [月初00:00:00, 月末23:59:59]

// 日期计算
getDaysBetween(start, end)        // 相隔天数(绝对值)
dateAdd(baseDate, 'day', 7)       // 7天后
dateAdd(baseDate, 'month', -3)    // 3个月前
dateAdd(baseDate, 'year', 1)      // 1年后

// 添加日期范围到查询参数
const params = { pageNum: 1, pageSize: 10 }
const dateRange = ['2025-01-01', '2025-12-31']
addDateRange(params, dateRange)
// { pageNum: 1, pageSize: 10, params: { beginTime: '2025-01-01', endTime: '2025-12-31' } }

addDateRange(params, dateRange, 'create')
// { ..., params: { beginCreateTime: '2025-01-01', endCreateTime: '2025-12-31' } }
```

### 当前时间与解析

```typescript
import { getCurrentTime, getCurrentDate, getCurrentDateTime, parseDate, getTimeStamp } from '@/utils/date'

getCurrentTime()              // "15:30:45"
getCurrentTime('HH:mm')       // "15:30"
getCurrentDate()              // "2025-12-14"
getCurrentDateTime()          // "2025-12-14 15:30:45"

parseDate('2025-12-14')       // Date 对象
parseDate('invalid-date')     // null

getTimeStamp()                // 毫秒时间戳 1734159045000
getTimeStamp('s')             // 秒时间戳 1734159045
```

### 日期计算与判断

```typescript
import { isSameDay, getWeekOfYear } from '@/utils/date'

// 判断是否同一天
isSameDay(new Date('2025-12-14'), new Date('2025-12-14'))  // true
isSameDay(new Date('2025-12-14'), new Date('2025-12-15'))  // false

// 获取一年中的第几周
getWeekOfYear(new Date('2025-12-14'))  // 50
```

## 字符串处理

### 空值与截断

```typescript
import { parseStrEmpty, isEmpty, truncate } from '@/utils/string'

// 空值处理
parseStrEmpty(null)       // ''
parseStrEmpty(undefined)  // ''
parseStrEmpty('undefined')// ''  (字符串 'undefined' 也转为空)
parseStrEmpty('null')     // ''  (字符串 'null' 也转为空)
parseStrEmpty('hello')    // 'hello'

isEmpty(null)             // true
isEmpty('')               // true
isEmpty('  ')             // true (纯空白)
isEmpty('hello')          // false

// 字符串截断
truncate('这是一段很长的文本内容', 10)        // "这是一段很长的文..."
truncate('短文本', 20)                        // "短文本"
truncate('长文本内容', 5, '……')               // "长文本……"
```

**truncate 实现分析:**

```typescript
export const truncate = (str: string, maxLength: number, ellipsis: string = '...'): string => {
  if (!str) return ''
  if (str.length <= maxLength) return str
  // 截取长度 = maxLength - 省略号长度
  return str.substr(0, maxLength - ellipsis.length) + ellipsis
}
```

### 字节长度计算

```typescript
import { byteLength } from '@/utils/string'

// UTF-8 编码规则:
// - ASCII字符 (0-127): 1字节
// - 双字节字符 (128-2047): 2字节
// - 三字节字符 (2048-65535): 3字节，包括中日韩文字
// - 四字节字符 (代理对): 4字节，包括Emoji

byteLength('hello')       // 5  (5个ASCII字符)
byteLength('你好')        // 6  (2个中文字符，每个3字节)
byteLength('😊')          // 4  (Emoji占4字节)
byteLength('Hello世界!')  // 12 (5+6+1)
```

**UTF-8 编码字节长度算法:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UTF-8 字节长度计算                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    for (每个字符的 Unicode 码点) {                                          │
│                                                                             │
│        ┌──────────────────────────────────────────────────────────────┐     │
│        │  码点 <= 0x7F (127)                                          │     │
│        │    → 单字节字符 (ASCII)                                      │     │
│        │    → byteSize += 1                                           │     │
│        ├──────────────────────────────────────────────────────────────┤     │
│        │  码点 <= 0x7FF (2047)                                        │     │
│        │    → 双字节字符                                              │     │
│        │    → byteSize += 2                                           │     │
│        ├──────────────────────────────────────────────────────────────┤     │
│        │  码点 >= 0xD800 && <= 0xDFFF                                 │     │
│        │    → 代理对 (Surrogate Pair)                                 │     │
│        │    → 用于表示 Unicode 辅助平面字符 (如 Emoji)                │     │
│        │    → byteSize += 4                                           │     │
│        │    → 跳过下一个代码单元 (i++)                                │     │
│        ├──────────────────────────────────────────────────────────────┤     │
│        │  其他 (码点 > 0x7FF)                                         │     │
│        │    → 三字节字符 (中日韩文字)                                 │     │
│        │    → byteSize += 3                                           │     │
│        └──────────────────────────────────────────────────────────────┘     │
│    }                                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 字符串工具

```typescript
import { capitalize, createUniqueString, sprintf } from '@/utils/string'

// 首字母大写
capitalize('hello')       // 'Hello'
capitalize('hello world') // 'Hello world'
capitalize('')            // ''

// 唯一字符串 (基于时间戳+随机数)
createUniqueString()      // "a1b21734159045000" (16进制随机数 + 时间戳)

// 格式化 (类似 printf 的 %s)
sprintf('用户 %s 购买了 %s', '张三', '商品')
// "用户 张三 购买了 商品"

sprintf('Hello, %s! Score: %s', 'World', 95)
// "Hello, World! Score: 95"

sprintf('File not found', 'extra')  // "File not found" (忽略额外参数)
sprintf('Welcome %s', undefined)    // "Welcome " (undefined 替换为空)
```

### HTML 处理

```typescript
import { html2Text, getTextExcerpt, escapeHtml } from '@/utils/string'

// HTML 转纯文本
html2Text('<p>这是<strong>加粗</strong>文本</p>')
// "这是加粗文本"

html2Text('<div><h1>Hello</h1> <b>World</b></div>')
// "Hello World"

// 获取文本摘要 (先转纯文本再截断)
getTextExcerpt('<p>这是一段很长的HTML内容...</p>', 10)
// "这是一段很长的文..."

// HTML 转义 (防 XSS)
escapeHtml('<script>alert("xss")</script>')
// "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
```

**escapeHtml 转义规则:**

| 原字符 | 转义后 |
|--------|--------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#039;` |

### 大小写转换

```typescript
import { camelToKebab, kebabToCamel } from '@/utils/string'

// 驼峰转短横线 (kebab-case)
camelToKebab('userName')          // 'user-name'
camelToKebab('backgroundColor')   // 'background-color'
camelToKebab('myVariableName')    // 'my-variable-name'

// 短横线转驼峰 (camelCase)
kebabToCamel('user-name')         // 'userName'
kebabToCamel('background-color')  // 'backgroundColor'
kebabToCamel('my-variable-name')  // 'myVariableName'
```

## URL 处理

### 链接检测

```typescript
import { isExternal, isHttp } from '@/utils/string'

// 外部链接检测 (http/https/mailto/tel)
isExternal('https://example.com')  // true
isExternal('http://example.com')   // true
isExternal('mailto:test@test.com') // true
isExternal('tel:13800138000')      // true
isExternal('/page/index')          // false
isExternal('./relative/path')      // false

// HTTP/HTTPS 协议检测
isHttp('https://example.com')      // true
isHttp('http://example.com')       // true
isHttp('//example.com')            // false
isHttp('ftp://example.com')        // false
```

### 参数解析与构建

```typescript
import { getQueryObject, objectToQuery, normalizePath, isPathMatch } from '@/utils/string'

// 解析 URL 参数
getQueryObject('https://example.com?name=张三&age=25')
// { name: '张三', age: '25' }

getQueryObject('https://example.com/search?q=test%20search&page=1')
// { q: 'test search', page: '1' }

// 对象转查询字符串
objectToQuery({ name: '张三', age: 25 })
// "name=%E5%BC%A0%E4%B8%89&age=25"

// 支持嵌套对象
objectToQuery({ name: 'test', filter: { status: 1, type: 2 } })
// "name=test&filter[status]=1&filter[type]=2"

// 路径规范化 (去除多余斜杠)
normalizePath('/api//users/')     // '/api/users'
normalizePath('/api/users//////') // '/api/users'

// 路径匹配 (支持通配符)
isPathMatch('/api/*', '/api/users')        // true (单段匹配)
isPathMatch('/api/*', '/api/users/123')    // false
isPathMatch('/api/**', '/api/users/123')   // true (多段匹配)
isPathMatch('/api/users/*', '/api/orders') // false
```

**路径匹配通配符规则:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         路径匹配通配符规则                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    通配符转正则表达式:                                                       │
│                                                                             │
│    ┌──────────────────────────────────────────────────────────────────┐     │
│    │  *   →  [^\/]*   (匹配单个路径段，不包含斜杠)                    │     │
│    │  **  →  .*       (匹配任意字符，包括斜杠，可跨路径段)            │     │
│    │  /   →  \/       (斜杠转义)                                      │     │
│    └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│    示例转换:                                                                 │
│    ┌──────────────────────────────────────────────────────────────────┐     │
│    │  Pattern: /api/*                                                 │     │
│    │  Regex:   ^\/api\/[^\/]*$                                        │     │
│    │  匹配:    /api/users ✓                                           │     │
│    │  不匹配:  /api/users/123 ✗                                       │     │
│    ├──────────────────────────────────────────────────────────────────┤     │
│    │  Pattern: /api/**                                                │     │
│    │  Regex:   ^\/api\/.*$                                            │     │
│    │  匹配:    /api/users ✓                                           │     │
│    │  匹配:    /api/users/123/details ✓                               │     │
│    └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 布尔值转换

### 多格式识别

```typescript
import { isTrue, isFalse, toBool, toBoolString, toggleStatus } from '@/utils/boolean'

// 真值判断（支持多种格式）
isTrue(true)      // true
isTrue(1)         // true
isTrue('1')       // true
isTrue('true')    // true
isTrue('TRUE')    // true (大小写不敏感)
isTrue('yes')     // true
isTrue('YES')     // true
isTrue('on')      // true
isTrue('ON')      // true

// 假值判断
isFalse(false)    // true
isFalse(0)        // true
isFalse('0')      // true
isFalse('false')  // true
isFalse('FALSE')  // true
isFalse('no')     // true
isFalse('off')    // true
isFalse(null)     // true
isFalse(undefined)// true
isFalse('')       // true

// 转换为布尔值
toBool('1')           // true
toBool('yes')         // true
toBool('false')       // false
toBool(null)          // false

// 转换为布尔字符串 ('1' 或 '0')
toBoolString(true)    // '1'
toBoolString('yes')   // '1'
toBoolString(false)   // '0'
toBoolString(null)    // '0'

// 状态切换
toggleStatus('1')     // '0'
toggleStatus('0')     // '1'
toggleStatus(true)    // '0'
toggleStatus(false)   // '1'
toggleStatus(null)    // '1' (假值切换为真)
```

**布尔值识别机制:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          布尔值识别流程                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    isTrue(value) 判断流程:                                                  │
│                                                                             │
│    ┌──────────────────────────────────────────────────────────────────┐     │
│    │  1. null 或 undefined → return false                            │     │
│    ├──────────────────────────────────────────────────────────────────┤     │
│    │  2. typeof boolean → return value                               │     │
│    ├──────────────────────────────────────────────────────────────────┤     │
│    │  3. typeof number → return value === 1                          │     │
│    ├──────────────────────────────────────────────────────────────────┤     │
│    │  4. typeof string:                                              │     │
│    │     → toLowerCase().trim()                                      │     │
│    │     → 检查是否在 ['1', 'true', 'yes', 'on'] 中                  │     │
│    ├──────────────────────────────────────────────────────────────────┤     │
│    │  5. 其他类型 → return false                                     │     │
│    └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│    支持的真值格式:                                                           │
│    ┌──────────────────────────────────────────────────────────────────┐     │
│    │  字符串: '1', 'true', 'TRUE', 'True', 'yes', 'YES', 'on', 'ON'  │     │
│    │  布尔值: true                                                    │     │
│    │  数字:   1                                                       │     │
│    └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│    支持的假值格式:                                                           │
│    ┌──────────────────────────────────────────────────────────────────┐     │
│    │  字符串: '0', 'false', 'FALSE', 'False', 'no', 'NO', 'off'      │     │
│    │  布尔值: false                                                   │     │
│    │  数字:   0                                                       │     │
│    │  空值:   null, undefined, ''                                     │     │
│    └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 数据验证

### 文件验证

```typescript
import { isBlob, isAllowedFileType, isImageFile, isWithinFileSize } from '@/utils/validators'

// Blob 格式检测
isBlob({ type: 'application/octet-stream' })  // true
isBlob({ type: 'application/json' })          // false

// 文件类型验证
const file = new File([''], 'photo.jpg')
isAllowedFileType(file, ['jpg', 'png', 'gif'])  // true
isAllowedFileType(file, ['pdf', 'doc'])         // false

// 图片文件检测
isImageFile(file)  // true (基于 file.type 判断)

// 文件大小验证 (单位: MB)
isWithinFileSize(file, 5)  // true (小于5MB)
```

### 类型检查

```typescript
import { isString, isNumber, isArray, isObject, isEmptyObject, isValidJSON } from '@/utils/validators'

// 字符串检查
isString('hello')       // true
isString(123)           // false

// 数字检查 (排除 NaN 和 Infinity)
isNumber(123)           // true
isNumber(12.5)          // true
isNumber(NaN)           // false
isNumber(Infinity)      // false

// 数组检查
isArray([1, 2, 3])      // true
isArray({ 0: 'a' })     // false

// 对象检查 (纯对象，不包括数组)
isObject({ a: 1 })      // true
isObject([1, 2])        // false
isObject(null)          // false

// 空对象检查
isEmptyObject({})       // true
isEmptyObject({ a: 1 }) // false

// JSON 格式验证
isValidJSON('{"name":"John"}')  // true
isValidJSON('[1,2,3]')          // true
isValidJSON('{name:"John"}')    // false (属性名需要引号)
```

### 数值验证

```typescript
import { isInteger, isPositiveNumber, isInRange } from '@/utils/validators'

// 整数检查
isInteger(10)             // true
isInteger(10.5)           // false
isInteger(-5)             // true

// 正数检查
isPositiveNumber(10)      // true
isPositiveNumber(-5)      // false
isPositiveNumber(0)       // false

// 范围检查
isInRange(5, 1, 10)       // true
isInRange(15, 1, 10)      // false
isInRange(1, 1, 10)       // true (包含边界)
```

### 日期验证

```typescript
import { isValidDate, isDateFormat, isBeforeDate, isAfterDate } from '@/utils/validators'

// Date 对象有效性
isValidDate(new Date())           // true
isValidDate(new Date('invalid'))  // false

// 日期格式验证
isDateFormat('2025-12-14', 'YYYY-MM-DD')   // true
isDateFormat('12/14/2025', 'MM/DD/YYYY')   // true
isDateFormat('2025-13-14', 'YYYY-MM-DD')   // false (13月无效)

// 日期比较
const today = new Date()
const tomorrow = new Date(Date.now() + 86400000)
const yesterday = new Date(Date.now() - 86400000)

isBeforeDate(yesterday, today)    // true
isAfterDate(tomorrow, today)      // true
```

### 中国特色验证

```typescript
import { isChineseIdCard, isChinesePhoneNumber, isPostalCode } from '@/utils/validators'

// 身份证验证（18位，含校验位算法）
isChineseIdCard('110101199003076534')  // true (校验位正确)
isChineseIdCard('110101199003076535')  // false (校验位错误)
isChineseIdCard('11010119900307653X')  // true (X作为校验位)

// 手机号验证
isChinesePhoneNumber('13812345678')    // true
isChinesePhoneNumber('12812345678')    // false (12开头无效)
isChinesePhoneNumber('1381234567')     // false (位数不足)

// 邮政编码
isPostalCode('100000')                 // true
isPostalCode('000000')                 // false (不能以0开头)
```

**身份证校验位算法:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       18位身份证校验位算法                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    身份证号: X1 X2 X3 X4 X5 X6 X7 X8 X9 X10 X11 X12 X13 X14 X15 X16 X17 X18│
│                                                                             │
│    加权因子: 7  9  10 5  8  4  2  1  6  3   7   9   10  5   8   4   2       │
│                                                                             │
│    校验位对照表:                                                             │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │  余数:  0   1   2   3   4   5   6   7   8   9   10              │      │
│    │  校验:  1   0   X   9   8   7   6   5   4   3   2               │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│    算法步骤:                                                                 │
│    1. 计算加权和: sum = Σ(Xi × Wi) (i = 1 to 17)                            │
│    2. 计算余数: index = sum % 11                                            │
│    3. 查表获取校验位: checkCode = parity[index]                             │
│    4. 比较: checkCode.toLowerCase() === X18.toLowerCase()                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 表单验证

```typescript
import { isEmail, isPassword, isRequired, hasMinLength, hasMaxLength, isName } from '@/utils/validators'

// 邮箱验证
isEmail('test@example.com')      // true
isEmail('test@example')          // false (缺少顶级域名)

// 密码强度验证
isPassword('Abc123!@#', {
  minLength: 8,
  requireLowercase: true,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true
})  // true

isPassword('abc123', { minLength: 8 })  // false (长度不足)

// 必填验证
isRequired('hello')       // true
isRequired('')            // false
isRequired([1, 2])        // true
isRequired([])            // false
isRequired({ a: 1 })      // true
isRequired({})            // false

// 长度验证
hasMinLength('hello', 3)  // true
hasMaxLength('hello', 10) // true

// 姓名验证 (字母、中文、空格)
isName('张三')            // true
isName('John Doe')        // true
isName('张三123')         // false (包含数字)
```

### 网络与金融验证

```typescript
import { isIPAddress, isMACAddress, isPort, isUUID, isBankCardNumber, isCreditCardNumber } from '@/utils/validators'

// IPv4 地址
isIPAddress('192.168.1.1')     // true
isIPAddress('256.1.1.1')       // false (超出范围)

// MAC 地址
isMACAddress('00:1A:2B:3C:4D:5E')  // true
isMACAddress('00-1A-2B-3C-4D-5E')  // true

// 端口号 (0-65535)
isPort(80)                // true
isPort(65536)             // false

// UUID
isUUID('550e8400-e29b-41d4-a716-446655440000')  // true

// 银行卡号 (13-19位数字)
isBankCardNumber('6222020111122220000')  // true

// 信用卡号 (Luhn算法)
isCreditCardNumber('4111111111111111')  // true (Visa测试卡号)
```

**Luhn 算法 (信用卡校验):**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Luhn 算法流程                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    卡号示例: 4111 1111 1111 1111                                            │
│                                                                             │
│    步骤 1: 从右向左遍历，奇数位置数字翻倍                                    │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │  原始:  4  1  1  1  1  1  1  1  1  1  1  1  1  1  1  1          │      │
│    │  位置:  16 15 14 13 12 11 10 9  8  7  6  5  4  3  2  1          │      │
│    │  翻倍:  8  1  2  1  2  1  2  1  2  1  2  1  2  1  2  1          │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│    步骤 2: 翻倍后大于9的数字减9                                              │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │  处理:  8  1  2  1  2  1  2  1  2  1  2  1  2  1  2  1          │      │
│    │  (无需处理，所有翻倍结果都 <= 9)                                 │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│    步骤 3: 求和                                                              │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │  sum = 8+1+2+1+2+1+2+1+2+1+2+1+2+1+2+1 = 30                     │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│    步骤 4: 验证                                                              │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │  sum % 10 === 0 → 有效                                          │      │
│    │  30 % 10 = 0 → 验证通过 ✓                                       │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 其他验证

```typescript
import {
  isEqual, containsSubstring, onlyContains, isOneOf,
  isHexColor, isURLParam, isValidFilename, isSocialMediaUserName
} from '@/utils/validators'

// 值相等比较 (支持对象深比较)
isEqual('hello', 'hello')           // true
isEqual({ a: 1 }, { a: 1 })         // true
isEqual([1, 2], [1, 2])             // true

// 子串包含检查
containsSubstring('Hello World', 'world', false)  // true (不区分大小写)
containsSubstring('Hello World', 'world', true)   // false (区分大小写)

// 字符白名单检查
onlyContains('abc123', 'abcdefghijklmnopqrstuvwxyz0123456789')  // true
onlyContains('abc@123', 'abcdefghijklmnopqrstuvwxyz0123456789') // false

// 值在列表中
isOneOf('admin', ['admin', 'editor', 'user'])  // true

// 十六进制颜色
isHexColor('#FF5733')   // true
isHexColor('#FFF')      // true (简写格式)
isHexColor('red')       // false

// URL 参数格式
isURLParam('user_id=123&type=admin')  // true

// 文件名有效性 (不含禁止字符)
isValidFilename('my-document.pdf')    // true
isValidFilename('my:document.pdf')    // false (包含冒号)

// 社交媒体用户名
isSocialMediaUserName('@example_user', 'twitter')   // true
isSocialMediaUserName('example.user', 'instagram')  // true
```

## API 参考

### 日期工具函数

| 函数 | 说明 | 类型签名 |
|------|------|----------|
| `formatDate` | 格式化日期 | `(time: Date \| string \| number, pattern?: string) => string` |
| `formatDay` | 仅日期部分 | `(time: Date \| string \| number) => string` |
| `formatTableDate` | 表格日期格式化 | `(cellValue: string, pattern?: string) => string` |
| `formatRelativeTime` | 相对时间 | `(time: string \| number, option?: string) => string` |
| `formatDateRange` | 日期范围格式化 | `(range: [Date, Date], separator?: string, format?: string) => string` |
| `getCurrentTime` | 当前时间 | `(pattern?: string) => string` |
| `getCurrentDate` | 当前日期 | `() => string` |
| `getCurrentDateTime` | 当前日期时间 | `() => string` |
| `parseDate` | 解析日期 | `(dateStr: string) => Date \| null` |
| `getTimeStamp` | 获取时间戳 | `(type?: 'ms' \| 's') => number` |
| `getDateRange` | 获取日期范围 | `(days: number) => [Date, Date]` |
| `getCurrentWeekRange` | 本周范围 | `() => [Date, Date]` |
| `getCurrentMonthRange` | 本月范围 | `() => [Date, Date]` |
| `addDateRange` | 添加日期范围参数 | `(params: any, dateRange: any[], propName?: string) => any` |
| `getDaysBetween` | 日期间隔天数 | `(start: Date, end: Date) => number` |
| `isSameDay` | 是否同一天 | `(date1: Date, date2: Date) => boolean` |
| `getWeekOfYear` | 年中第几周 | `(date: Date) => number` |
| `dateAdd` | 日期加减 | `(date: Date, type: 'day' \| 'month' \| 'year', value: number) => Date` |

### 字符串工具函数

| 函数 | 说明 | 类型签名 |
|------|------|----------|
| `parseStrEmpty` | 解析空字符串 | `(str: any) => string` |
| `isEmpty` | 判断是否为空 | `(str: any) => boolean` |
| `capitalize` | 首字母大写 | `(str: string) => string` |
| `truncate` | 字符串截断 | `(str: string, maxLength: number, ellipsis?: string) => string` |
| `byteLength` | 字节长度 | `(str: string) => number` |
| `createUniqueString` | 生成唯一字符串 | `() => string` |
| `sprintf` | 字符串格式化 | `(str: string, ...args: any[]) => string` |
| `html2Text` | HTML转纯文本 | `(html: string) => string` |
| `getTextExcerpt` | 获取文本摘要 | `(html: string, length: number, ellipsis?: string) => string` |
| `escapeHtml` | HTML转义 | `(html: string) => string` |
| `isExternal` | 是否外部链接 | `(path: string) => boolean` |
| `isHttp` | 是否HTTP链接 | `(url: string) => boolean` |
| `getQueryObject` | 解析URL参数 | `(url: string) => Record<string, string>` |
| `objectToQuery` | 对象转查询字符串 | `(params: Record<string, any>) => string` |
| `normalizePath` | 路径标准化 | `(path: string) => string` |
| `isPathMatch` | 路径匹配 | `(pattern: string, path: string) => boolean` |
| `camelToKebab` | 驼峰转连字符 | `(str: string) => string` |
| `kebabToCamel` | 连字符转驼峰 | `(str: string) => string` |
| `isValidJSON` | JSON格式验证 | `(str: string) => boolean` |

### 布尔值工具函数

| 函数 | 说明 | 类型签名 |
|------|------|----------|
| `isTrue` | 判断是否为真值 | `(value: any) => boolean` |
| `isFalse` | 判断是否为假值 | `(value: any) => boolean` |
| `toBool` | 转换为布尔值 | `(value: any) => boolean` |
| `toBoolString` | 转换为布尔字符串 | `(value: any) => '1' \| '0'` |
| `toggleStatus` | 切换状态 | `(value: any) => '1' \| '0'` |

### 验证工具函数

| 函数 | 说明 | 类型签名 |
|------|------|----------|
| `isBlob` | Blob格式检测 | `(data: { type: string }) => boolean` |
| `isAllowedFileType` | 文件类型验证 | `(file: File, allowedTypes: string[]) => boolean` |
| `isImageFile` | 图片文件检测 | `(file: File) => boolean` |
| `isWithinFileSize` | 文件大小验证 | `(file: File, maxSizeInMB: number) => boolean` |
| `isString` | 字符串类型 | `(value: any) => boolean` |
| `isNumber` | 有效数字 | `(value: any) => boolean` |
| `isInteger` | 整数 | `(value: any) => boolean` |
| `isPositiveNumber` | 正数 | `(value: any) => boolean` |
| `isInRange` | 范围内 | `(value: number, min: number, max: number) => boolean` |
| `isArray` | 数组类型 | `(value: any) => boolean` |
| `isObject` | 对象类型 | `(value: any) => boolean` |
| `isEmptyObject` | 空对象 | `(obj: object) => boolean` |
| `isValidJSON` | JSON格式 | `(str: string) => boolean` |
| `isValidDate` | 有效日期 | `(date: Date) => boolean` |
| `isDateFormat` | 日期格式 | `(dateStr: string, format: string) => boolean` |
| `isBeforeDate` | 日期在前 | `(date: Date, beforeDate: Date) => boolean` |
| `isAfterDate` | 日期在后 | `(date: Date, afterDate: Date) => boolean` |
| `isEmail` | 邮箱格式 | `(email: string) => boolean` |
| `isLowerCase` | 全小写 | `(str: string) => boolean` |
| `isUpperCase` | 全大写 | `(str: string) => boolean` |
| `isAlphabets` | 纯字母 | `(str: string) => boolean` |
| `isChineseIdCard` | 身份证号 | `(id: string) => boolean` |
| `isChinesePhoneNumber` | 手机号 | `(phone: string) => boolean` |
| `isPostalCode` | 邮政编码 | `(code: string) => boolean` |
| `isPassword` | 密码强度 | `(password: string, options?: PasswordOptions) => boolean` |
| `isRequired` | 非空验证 | `(value: any) => boolean` |
| `hasMinLength` | 最小长度 | `(str: string, length: number) => boolean` |
| `hasMaxLength` | 最大长度 | `(str: string, length: number) => boolean` |
| `isName` | 姓名格式 | `(name: string) => boolean` |
| `isIPAddress` | IPv4地址 | `(ip: string) => boolean` |
| `isMACAddress` | MAC地址 | `(mac: string) => boolean` |
| `isPort` | 端口号 | `(port: number) => boolean` |
| `isUUID` | UUID格式 | `(uuid: string) => boolean` |
| `isBankCardNumber` | 银行卡号 | `(cardNumber: string) => boolean` |
| `isCreditCardNumber` | 信用卡号(Luhn) | `(cardNumber: string) => boolean` |
| `isEqual` | 值相等 | `(value1: any, value2: any) => boolean` |
| `containsSubstring` | 包含子串 | `(str: string, substring: string, caseSensitive?: boolean) => boolean` |
| `onlyContains` | 字符白名单 | `(str: string, allowedChars: string) => boolean` |
| `isOneOf` | 值在列表中 | `(value: any, allowedValues: any[]) => boolean` |
| `isHexColor` | 十六进制颜色 | `(color: string) => boolean` |
| `isURLParam` | URL参数格式 | `(param: string) => boolean` |
| `isValidFilename` | 有效文件名 | `(filename: string) => boolean` |
| `isSocialMediaUserName` | 社交媒体用户名 | `(userName: string, platform: string) => boolean` |

### 类型定义

```typescript
// 日期输入类型
type DateInput = Date | string | number

// 密码验证选项
interface PasswordOptions {
  minLength?: number           // 最小长度，默认8
  requireLowercase?: boolean   // 要求小写字母，默认true
  requireUppercase?: boolean   // 要求大写字母，默认true
  requireNumbers?: boolean     // 要求数字，默认true
  requireSpecialChars?: boolean // 要求特殊字符，默认true
}

// 社交媒体平台类型
type SocialMediaPlatform = 'twitter' | 'instagram' | 'facebook' | 'linkedin'

// 日期格式类型
type DateFormatType = 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY'

// 时间戳类型
type TimestampType = 'ms' | 's'

// 日期加减类型
type DateAddType = 'day' | 'month' | 'year'
```

## 最佳实践

### 1. 日期处理

```typescript
// ✅ 使用工具函数安全处理
import { formatDate, parseDate, isValidDate } from '@/utils/date'
import { isDateFormat } from '@/utils/validators'

const handleDateInput = (input: string) => {
  // 先验证格式
  if (!isDateFormat(input, 'YYYY-MM-DD')) {
    return { error: '日期格式错误，请使用 YYYY-MM-DD 格式' }
  }

  // 再解析日期
  const date = parseDate(input)
  if (!date || !isValidDate(date)) {
    return { error: '无效的日期' }
  }

  return { date: formatDate(date, 'yyyy-MM-dd') }
}

// ❌ 直接字符串操作，不安全
const unsafeHandle = (input: string) => {
  const [year, month, day] = input.split('-')  // 可能返回 undefined
  return `${year}/${month}/${day}`  // 可能输出 undefined/undefined/undefined
}
```

### 2. 字符串处理

```typescript
// ✅ 使用工具函数
import { isEmpty, truncate, escapeHtml } from '@/utils/string'

const displayContent = (content: any) => {
  // 空值检查
  if (isEmpty(content)) return '暂无内容'

  // 转义 HTML 防止 XSS
  const safeContent = escapeHtml(String(content))

  // 截断长文本
  return truncate(safeContent, 200)
}

// ❌ 直接操作，可能报错
const unsafeDisplay = (content: any) => {
  return content.substring(0, 200)  // content 为 null 时报错
}
```

### 3. 表单验证组合

```typescript
import { isRequired, isEmail, hasMinLength, hasMaxLength } from '@/utils/validators'
import { isChinesePhoneNumber, isPassword } from '@/utils/validators'

interface FormData {
  username: string
  email: string
  phone: string
  password: string
}

const validateForm = (form: FormData) => {
  const errors: Record<string, string> = {}

  // 用户名验证
  if (!isRequired(form.username)) {
    errors.username = '用户名不能为空'
  } else if (!hasMinLength(form.username, 3)) {
    errors.username = '用户名至少3个字符'
  } else if (!hasMaxLength(form.username, 20)) {
    errors.username = '用户名最多20个字符'
  }

  // 邮箱验证
  if (!isRequired(form.email)) {
    errors.email = '邮箱不能为空'
  } else if (!isEmail(form.email)) {
    errors.email = '邮箱格式不正确'
  }

  // 手机号验证
  if (!isRequired(form.phone)) {
    errors.phone = '手机号不能为空'
  } else if (!isChinesePhoneNumber(form.phone)) {
    errors.phone = '手机号格式不正确'
  }

  // 密码验证
  if (!isPassword(form.password, { minLength: 8, requireSpecialChars: true })) {
    errors.password = '密码至少8位，需包含大小写字母、数字和特殊字符'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
```

### 4. 布尔值统一处理

```typescript
import { isTrue, toBoolString, toggleStatus } from '@/utils/boolean'

// API 响应处理 - 支持多种布尔格式
const processApiResponse = (response: any) => {
  return {
    isEnabled: isTrue(response.enabled),   // 支持 '1', 'true', 'yes', 1, true
    isActive: isTrue(response.status),     // 统一转换
    isAdmin: isTrue(response.role === 'admin')
  }
}

// 表单提交 - 统一为 '1'/'0' 格式
const prepareSubmitData = (form: any) => {
  return {
    ...form,
    isActive: toBoolString(form.isActive),      // 转为 '1' 或 '0'
    isPublished: toBoolString(form.isPublished)
  }
}

// 状态切换
const handleToggle = (currentStatus: string) => {
  const newStatus = toggleStatus(currentStatus)
  // '1' -> '0' 或 '0' -> '1'
  return newStatus
}
```

### 5. URL 参数安全处理

```typescript
import { getQueryObject, objectToQuery, normalizePath } from '@/utils/string'

// 安全构建 URL
const buildSafeUrl = (baseUrl: string, params: Record<string, any>) => {
  // 过滤空值
  const filtered: Record<string, any> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      filtered[key] = value
    }
  }

  // 标准化路径
  const normalizedPath = normalizePath(baseUrl)

  // 构建查询字符串
  const query = objectToQuery(filtered)
  return query ? `${normalizedPath}?${query}` : normalizedPath
}

// 解析并验证 URL 参数
const parseAndValidate = (url: string, requiredParams: string[]) => {
  const params = getQueryObject(url)

  for (const param of requiredParams) {
    if (!params[param]) {
      throw new Error(`缺少必需参数: ${param}`)
    }
  }

  return params
}
```

### 6. 文件上传验证

```typescript
import { isAllowedFileType, isWithinFileSize, isImageFile } from '@/utils/validators'

interface UploadConfig {
  allowedTypes: string[]
  maxSize: number  // MB
  imageOnly?: boolean
}

const validateUpload = (file: File, config: UploadConfig) => {
  const errors: string[] = []

  // 检查文件类型
  if (!isAllowedFileType(file, config.allowedTypes)) {
    errors.push(`只允许上传 ${config.allowedTypes.join(', ')} 格式的文件`)
  }

  // 检查文件大小
  if (!isWithinFileSize(file, config.maxSize)) {
    errors.push(`文件大小不能超过 ${config.maxSize}MB`)
  }

  // 如果要求仅图片
  if (config.imageOnly && !isImageFile(file)) {
    errors.push('只允许上传图片文件')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// 使用示例
const handleFileSelect = (file: File) => {
  const result = validateUpload(file, {
    allowedTypes: ['jpg', 'png', 'gif', 'webp'],
    maxSize: 5,
    imageOnly: true
  })

  if (!result.valid) {
    console.error(result.errors.join('\n'))
    return
  }

  // 继续上传流程...
}
```

### 7. 中文内容字节截断

```typescript
import { byteLength, truncate } from '@/utils/string'

// 按字节截断（适合中英文混合场景，如数据库字段限制）
const truncateByBytes = (str: string, maxBytes: number, ellipsis: string = '...') => {
  if (!str) return ''

  const ellipsisBytes = byteLength(ellipsis)
  if (byteLength(str) <= maxBytes) return str

  let result = ''
  let currentBytes = 0

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

// 使用示例
truncateByBytes('Hello世界', 10)  // "Hello..." (5+3=8字节，加省略号刚好)
truncateByBytes('你好世界', 10)   // "你好..." (6+3=9字节)
```

## 常见问题

### 1. 日期格式化时区问题

**问题:** 使用 ISO 格式字符串时，时区处理不正确。

**原因:** JavaScript 的 `new Date()` 对于 ISO 格式字符串会自动处理时区，但对于其他格式可能不会。

**解决方案:**

```typescript
import { formatDate, parseDate } from '@/utils/date'

// 处理 UTC 时间
const formatUTCDate = (utcStr: string) => {
  // ISO 格式自动处理时区
  const date = new Date(utcStr)
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss')
}

// 安全解析（防止无效日期）
const safeFormat = (dateStr: string) => {
  const date = parseDate(dateStr)
  return date ? formatDate(date) : ''
}

// 手动指定时区偏移
const formatWithTimezone = (timestamp: number, offsetHours: number = 8) => {
  const date = new Date(timestamp + offsetHours * 60 * 60 * 1000)
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss')
}
```

### 2. 验证函数输入预处理

**问题:** 验证函数对于非预期类型的输入可能返回错误结果。

**解决方案:**

```typescript
import { isChinesePhoneNumber, isEmpty } from '@/utils/validators'
import { parseStrEmpty } from '@/utils/string'

// 预处理输入
const validatePhone = (phone: any) => {
  // 转为字符串并去除空白
  const cleaned = parseStrEmpty(phone).trim()

  // 先检查是否为空
  if (isEmpty(cleaned)) {
    return { valid: false, error: '手机号不能为空' }
  }

  // 再验证格式
  if (!isChinesePhoneNumber(cleaned)) {
    return { valid: false, error: '手机号格式不正确' }
  }

  return { valid: true, value: cleaned }
}
```

### 3. 身份证校验位计算

**问题:** 手动输入身份证号时，不确定校验位是否正确。

**解决方案:**

```typescript
// 计算身份证校验位
const calculateIdCardCheckCode = (id17: string): string => {
  if (id17.length !== 17) return ''

  const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const parity = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(id17[i]) * factor[i]
  }

  return parity[sum % 11]
}

// 使用示例
const id17 = '11010119900307653'
const checkCode = calculateIdCardCheckCode(id17)
console.log(`完整身份证号: ${id17}${checkCode}`)  // 110101199003076534
```

### 4. 相对时间显示优化

**问题:** `formatRelativeTime` 在超过2天后显示格式不够友好。

**解决方案:**

```typescript
import { formatDate, formatRelativeTime } from '@/utils/date'

// 扩展的相对时间显示
const formatSmartRelativeTime = (timestamp: number) => {
  const now = Date.now()
  const diff = (now - timestamp) / 1000

  if (diff < 30) return '刚刚'
  if (diff < 3600) return `${Math.ceil(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.ceil(diff / 3600)}小时前`
  if (diff < 172800) return '昨天'
  if (diff < 259200) return '前天'
  if (diff < 604800) return `${Math.ceil(diff / 86400)}天前`
  if (diff < 2592000) return `${Math.ceil(diff / 604800)}周前`
  if (diff < 31536000) return formatDate(timestamp, 'MM月dd日')
  return formatDate(timestamp, 'yyyy年MM月dd日')
}
```

### 5. 密码强度评估

**问题:** 需要向用户展示密码强度等级。

**解决方案:**

```typescript
type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong'

const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password || password.length < 6) return 'weak'

  let score = 0

  // 长度评分
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1

  // 复杂度评分
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1

  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  if (score <= 5) return 'strong'
  return 'very-strong'
}

// 使用示例
getPasswordStrength('123456')       // 'weak'
getPasswordStrength('Abc12345')     // 'medium'
getPasswordStrength('Abc123!@#')    // 'strong'
getPasswordStrength('MyP@ssw0rd!2025')  // 'very-strong'
```

### 6. 批量验证处理

**问题:** 需要对多个字段进行批量验证。

**解决方案:**

```typescript
type ValidationRule = {
  validator: (value: any) => boolean
  message: string
}

const batchValidate = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule[]>
) => {
  const errors: Record<string, string[]> = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field]
    const fieldErrors: string[] = []

    for (const rule of fieldRules) {
      if (!rule.validator(value)) {
        fieldErrors.push(rule.message)
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// 使用示例
import { isRequired, isEmail, hasMinLength } from '@/utils/validators'

const result = batchValidate(
  { username: 'ab', email: 'invalid', phone: '' },
  {
    username: [
      { validator: isRequired, message: '用户名不能为空' },
      { validator: v => hasMinLength(v, 3), message: '用户名至少3个字符' }
    ],
    email: [
      { validator: isRequired, message: '邮箱不能为空' },
      { validator: isEmail, message: '邮箱格式不正确' }
    ],
    phone: [
      { validator: isRequired, message: '手机号不能为空' }
    ]
  }
)

// result.errors = {
//   username: ['用户名至少3个字符'],
//   email: ['邮箱格式不正确'],
//   phone: ['手机号不能为空']
// }
```

### 7. 数据脱敏处理

**问题:** 需要对敏感信息进行脱敏显示。

**解决方案:**

```typescript
// 手机号脱敏
const maskPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

// 身份证脱敏
const maskIdCard = (id: string): string => {
  if (!id || id.length !== 18) return id
  return id.replace(/^(\d{6})\d{8}(\d{4})$/, '$1********$2')
}

// 邮箱脱敏
const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email
  const [local, domain] = email.split('@')
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`
}

// 银行卡脱敏
const maskBankCard = (card: string): string => {
  if (!card || card.length < 8) return card
  return `${card.slice(0, 4)} **** **** ${card.slice(-4)}`
}

// 使用示例
maskPhone('13812345678')      // '138****5678'
maskIdCard('110101199003076534')  // '110101********6534'
maskEmail('test@example.com') // 'te***t@example.com'
maskBankCard('6222020111122220000')  // '6222 **** **** 0000'
```

### 8. 表格数据格式化

**问题:** 表格列需要统一的格式化处理。

**解决方案:**

```typescript
import { formatTableDate, formatDate } from '@/utils/date'
import { isTrue, toBoolString } from '@/utils/boolean'
import { truncate, isEmpty } from '@/utils/string'

// 表格列格式化器
const tableFormatters = {
  // 日期格式化
  date: (value: string) => formatTableDate(value, 'yyyy-MM-dd'),
  datetime: (value: string) => formatTableDate(value, 'yyyy-MM-dd HH:mm:ss'),

  // 状态格式化
  status: (value: any) => isTrue(value) ? '启用' : '停用',
  yesNo: (value: any) => isTrue(value) ? '是' : '否',

  // 文本格式化
  text: (value: any, maxLength: number = 50) => {
    if (isEmpty(value)) return '-'
    return truncate(String(value), maxLength)
  },

  // 金额格式化
  money: (value: number) => {
    if (typeof value !== 'number') return '-'
    return `¥${value.toFixed(2)}`
  },

  // 百分比格式化
  percent: (value: number) => {
    if (typeof value !== 'number') return '-'
    return `${(value * 100).toFixed(2)}%`
  }
}

// 使用示例
tableFormatters.datetime('2025-12-14T15:30:45.000Z')  // '2025-12-14 15:30:45'
tableFormatters.status('1')   // '启用'
tableFormatters.money(1234.5) // '¥1234.50'
```

## 总结

格式化工具集核心要点：

1. **日期格式化**: `formatDate`、`formatRelativeTime`、`parseDate`、`dateAdd` 处理各种日期场景
2. **字符串处理**: `truncate`、`escapeHtml`、`isEmpty`、`byteLength` 安全处理字符串
3. **布尔值转换**: `isTrue`、`isFalse`、`toBoolString`、`toggleStatus` 统一处理多格式布尔值
4. **数据验证**: 完整的验证函数覆盖文件、类型、中国特色、金融等场景
5. **URL处理**: `getQueryObject`、`objectToQuery`、`isPathMatch` 处理URL参数和路径匹配
6. **类型检查**: `isString`、`isNumber`、`isArray`、`isObject` 提供完整的类型判断
7. **中国特色**: 身份证校验位算法、手机号验证、邮政编码等本地化支持
8. **金融验证**: Luhn算法实现信用卡校验、银行卡号验证

工具集采用模块化设计，各功能独立封装，支持按需引入，同时保持统一的API风格和错误处理机制。
