# 格式化工具 (format.ts)

格式化工具函数集合，提供全面的数据格式化功能，包含数值、时间、隐私数据、文本、集合、状态等各种类型的格式化处理。

## 概述

格式化工具库包含以下功能类别：
- **数值格式化**：处理单位、数字、金额、百分比和单位
- **时间与持续时间**：处理时长的格式化
- **隐私和敏感数据处理**：处理敏感信息的格式化和脱敏
- **文本和URL处理**：处理字符串截断和格式化
- **集合和枚举处理**：处理列表、枚举和布尔值的格式化
- **状态与颜色**：根据状态值返回对应的颜色类名
- **表格数据格式化**：为表格单元格提供通用的格式化功能

## 数值格式化

### formatUnit

格式化CSS单位值，如果值是数字，自动添加px单位。

```typescript
formatUnit(
  val: number | string,
  defaultUnit: string = 'px',
  options?: FormatOptions
): string
```

**参数：**
- `val` - 要格式化的值
- `defaultUnit` - 默认单位，默认为 'px'
- `options` - 格式化选项

**返回值：**
- `string` - 格式化后的CSS单位值

**示例：**
```typescript
formatUnit(100)           // "100px"
formatUnit('100')         // "100px"
formatUnit('100%')        // "100%" (已有单位，保持不变)
formatUnit('auto')        // "auto" (非数字，保持不变)
formatUnit(100, 'rem')    // "100rem"
formatUnit(0)             // "0px"
```

### formatNumber

格式化数字，支持小数位数控制和千分位分隔符。

```typescript
formatNumber(
  value: number,
  decimals: number = 0,
  useThousandsSeparator: boolean = false,
  thousandsSeparator: string = ',',
  options?: FormatOptions
): string
```

**参数：**
- `value` - 数值
- `decimals` - 小数位数，默认为0
- `useThousandsSeparator` - 是否使用千分位分隔符，默认为false
- `thousandsSeparator` - 千分位分隔符，默认为 ','
- `options` - 格式化选项

**返回值：**
- `string` - 格式化后的数字

**示例：**
```typescript
formatNumber(1234.56)              // "1235" (四舍五入)
formatNumber(1234.56, 2)           // "1234.56"
formatNumber(1234.56, 2, true)     // "1,234.56"
formatNumber(1234567.89, 2, true)  // "1,234,567.89"
formatNumber(-1234.56, 2, true)    // "-1,234.56"
```

### formatPercent

格式化百分比，将小数转换为百分比格式。

```typescript
formatPercent(
  value: number,
  decimals: number = 2,
  withSymbol: boolean = true,
  options?: FormatOptions
): string
```

**参数：**
- `value` - 小数值（如 0.1234 表示 12.34%）
- `decimals` - 小数位数，默认为2
- `withSymbol` - 是否包含百分号，默认为true
- `options` - 格式化选项

**返回值：**
- `string` - 格式化后的百分比

**示例：**
```typescript
formatPercent(0.1234)           // "12.34%"
formatPercent(0.1234, 1)        // "12.3%"
formatPercent(0.1234, 1, false) // "12.3"
formatPercent(1.5)              // "150.00%"
formatPercent(0)                // "0.00%"
```

### formatAmount

格式化金额，支持自定义货币符号和分隔符。

```typescript
formatAmount(
  amount: number,
  decimals: number = 2,
  decimalSeparator: string = '.',
  thousandsSeparator: string = ',',
  prefix: string = '',
  suffix: string = '',
  options?: FormatOptions
): string
```

**参数：**
- `amount` - 金额数值
- `decimals` - 小数位数，默认为2
- `decimalSeparator` - 小数点分隔符，默认为 '.'
- `thousandsSeparator` - 千分位分隔符，默认为 ','
- `prefix` - 前缀（如货币符号），默认为空
- `suffix` - 后缀，默认为空
- `options` - 格式化选项

**返回值：**
- `string` - 格式化后的金额字符串

**示例：**
```typescript
formatAmount(1234.56)                           // "1,234.56"
formatAmount(1234.56, 2, '.', ',', '¥')        // "¥1,234.56"
formatAmount(1234.56, 0, '.', ',', '$')        // "$1,235"
formatAmount(-1234.56, 2, '.', ',', '¥')       // "¥-1,234.56"
formatAmount(1234.56, 2, ',', '.', '€', ' EUR') // "€1.234,56 EUR"
```

### formatCurrency

通用货币格式化，支持不同区域的货币格式。

```typescript
formatCurrency(
  amount: number,
  currencyCode: string = 'CNY',
  options?: CurrencyFormatOptions
): string
```

**参数：**
- `amount` - 金额
- `currencyCode` - 货币代码（ISO 4217），默认为 'CNY'
- `options` - 货币格式化选项

**货币格式化选项：**
```typescript
interface CurrencyFormatOptions {
  decimals?: number          // 小数位数，默认为2
  currencySymbol?: string    // 货币符号
  symbolPosition?: 'prefix' | 'suffix'  // 符号位置，默认为 'prefix'
  decimalSeparator?: string  // 小数点分隔符，默认为 '.'
  thousandsSeparator?: string // 千分位分隔符，默认为 ','
}
```

**支持的货币代码：**
- `CNY` - 人民币 (¥)
- `USD` - 美元 ($)
- `EUR` - 欧元 (€)
- `GBP` - 英镑 (£)
- `JPY` - 日元 (¥)
- `KRW` - 韩元 (₩)
- `RUB` - 卢布 (₽)

**示例：**
```typescript
formatCurrency(1234.56)              // "¥1,234.56" (默认人民币)
formatCurrency(1234.56, 'USD')       // "$1,234.56"
formatCurrency(1234.56, 'EUR')       // "€1,234.56"
formatCurrency(1234.56, 'GBP')       // "£1,234.56"

// 自定义选项
formatCurrency(1234.56, 'CNY', {
  decimals: 0,
  symbolPosition: 'suffix'
})  // "1,235¥"
```

### formatFileSize

格式化文件大小，将字节数转换为易读的文件大小格式。

```typescript
formatFileSize(bytes: number, decimals: number = 2, options?: FormatOptions): string
```

**参数：**
- `bytes` - 文件大小（字节）
- `decimals` - 小数位数，默认为2
- `options` - 格式化选项

**返回值：**
- `string` - 格式化后的文件大小

**示例：**
```typescript
formatFileSize(0)           // "0 Bytes"
formatFileSize(1024)        // "1.00 KB"
formatFileSize(1234567)     // "1.18 MB"
formatFileSize(1073741824)  // "1.00 GB"
formatFileSize(1099511627776, 1)  // "1.0 TB"
```

### formatDistance

格式化距离单位，根据米数自动选择合适的单位。

```typescript
formatDistance(meters: number, decimals: number = 1, options?: FormatOptions): string
```

**参数：**
- `meters` - 米数
- `decimals` - 公里小数位数，默认为1
- `options` - 格式化选项

**返回值：**
- `string` - 格式化后的距离

**示例：**
```typescript
formatDistance(500)      // "500米"
formatDistance(999)      // "999米"
formatDistance(1000)     // "1.0公里"
formatDistance(1500)     // "1.5公里"
formatDistance(1234)     // "1.2公里"
formatDistance(1234, 2)  // "1.23公里"
```

## 时间与持续时间

### formatDuration

格式化时长，将秒数转换为时分秒格式。

```typescript
formatDuration(
  seconds: number,
  showZeroHours: boolean = false,
  options?: FormatOptions
): string
```

**参数：**
- `seconds` - 秒数
- `showZeroHours` - 是否显示为0的小时，默认为false
- `options` - 格式化选项

**返回值：**
- `string` - 格式化后的时长

**示例：**
```typescript
formatDuration(61)       // "1分1秒"
formatDuration(3661)     // "1小时1分1秒"
formatDuration(7320)     // "2小时2分0秒"
formatDuration(61, true) // "0小时1分1秒" (显示零小时)
formatDuration(3600)     // "1小时0分0秒"
```

## 隐私和敏感数据处理

### formatPrivacy

格式化敏感数据，提供隐私保护。

```typescript
formatPrivacy(
  data: string,
  options?: PrivacyOptions,
  formatOptions?: FormatOptions
): string
```

**隐私选项：**
```typescript
interface PrivacyOptions {
  showStart?: number      // 显示开头字符数，默认为0
  showEnd?: number        // 显示结尾字符数，默认为0
  maskChar?: string       // 掩码字符，默认为'*'
  maskLength?: number     // 掩码字符重复次数，0表示根据原始长度自动计算
}
```

**示例：**
```typescript
formatPrivacy('13812345678', { showStart: 3, showEnd: 4 })  // "138****5678"
formatPrivacy('张三丰', { showStart: 1, showEnd: 0 })        // "张**"
formatPrivacy('admin@example.com', { 
  showStart: 2, 
  showEnd: 10, 
  maskChar: '-' 
})  // "ad----ample.com"
```

### formatIDCard

格式化身份证号，提供隐私保护。

```typescript
formatIDCard(
  idNumber: string,
  options?: PrivacyOptions,
  formatOptions?: FormatOptions
): string
```

**示例：**
```typescript
formatIDCard('110101199001011234')  // "1101**********1234" (默认显示前4位后4位)
formatIDCard('110101199001011234', { showStart: 6, showEnd: 4 })  // "110101********1234"
```

### formatPhone

格式化手机号，支持多种格式化方式。

```typescript
formatPhone(
  phone: string,
  format: string = 'xxx-xxxx-xxxx',
  mask: string = '*',
  privacy: boolean = false,
  options?: FormatOptions
): string
```

**参数：**
- `phone` - 手机号码
- `format` - 格式化模式，x将被替换为数字，默认为 'xxx-xxxx-xxxx'
- `mask` - 掩码字符，默认为 '*'
- `privacy` - 是否启用隐私保护（中间四位使用掩码），默认为false
- `options` - 格式化选项

**示例：**
```typescript
formatPhone('13812345678')                    // "138-1234-5678"
formatPhone('13812345678', 'xxx xxxx xxxx')   // "138 1234 5678"
formatPhone('13812345678', undefined, undefined, true)  // "138****5678"
formatPhone('13812345678', '(xxx) xxxx-xxxx') // "(138) 1234-5678"
```

### formatBankCard

格式化银行卡号，每4位插入一个空格。

```typescript
formatBankCard(
  cardNumber: string,
  separator: string = ' ',
  privacy: boolean = false,
  options?: FormatOptions
): string
```

**参数：**
- `cardNumber` - 银行卡号
- `separator` - 分隔符，默认为 ' '
- `privacy` - 是否启用隐私保护（只显示后四位），默认为false
- `options` - 格式化选项

**示例：**
```typescript
formatBankCard('6225365271562822')              // "6225 3652 7156 2822"
formatBankCard('6225365271562822', '-')         // "6225-3652-7156-2822"
formatBankCard('6225365271562822', ' ', true)   // "**** **** **** 2822"
```

### formatIP

格式化IP地址，支持隐私保护。

```typescript
formatIP(
  ip: string,
  options?: IPFormatOptions,
  formatOptions?: FormatOptions
): string
```

**IP格式化选项：**
```typescript
interface IPFormatOptions {
  privacy?: boolean      // 是否隐藏部分IP，默认为false
  maskChar?: string      // 掩码字符，默认为'*'
}
```

**示例：**
```typescript
formatIP('192.168.1.1')                        // "192.168.1.1"
formatIP('192.168.1.1', { privacy: true })     // "192.168.*.*"
formatIP('192.168.1.1', { privacy: true, maskChar: 'x' })  // "192.168.x.x"
```

## 文本和URL处理

### formatStringLength

格式化字符串长度，超出指定长度的部分用省略号代替。

```typescript
formatStringLength(
  str: string,
  options?: StringLengthOptions,
  formatOptions?: FormatOptions
): string
```

**字符串长度选项：**
```typescript
interface StringLengthOptions {
  maxLength?: number     // 最大长度，默认为20
  ellipsis?: string      // 省略号字符，默认为'...'
  position?: 'start' | 'middle' | 'end'  // 截取位置，默认为'end'
}
```

**示例：**
```typescript
formatStringLength('这是一个很长的字符串', { maxLength: 10 })
// "这是一个很长..."

formatStringLength('这是一个很长的字符串', { 
  maxLength: 10, 
  position: 'middle' 
})
// "这是一个...字符串"

formatStringLength('这是一个很长的字符串', { 
  maxLength: 10, 
  position: 'start' 
})
// "...很长的字符串"
```

### formatFileName

格式化文件名，保留扩展名。

```typescript
formatFileName(
  filename: string,
  maxLength: number = 20,
  ellipsis: string = '...',
  options?: FormatOptions
): string
```

**参数：**
- `filename` - 文件名
- `maxLength` - 最大长度，默认为20
- `ellipsis` - 省略号字符，默认为 '...'
- `options` - 格式化选项

**示例：**
```typescript
formatFileName('very_long_filename_example.txt', 20)  // "very_long_f...ple.txt"
formatFileName('document.pdf', 20)                    // "document.pdf"
formatFileName('超长的文件名称示例.docx', 15)           // "超长的文...例.docx"
```

### formatURL

格式化URL，可选择显示或隐藏参数。

```typescript
formatURL(url: string, showParams: boolean = true, options?: FormatOptions): string
```

**参数：**
- `url` - URL地址
- `showParams` - 是否显示参数，默认为true
- `options` - 格式化选项

**示例：**
```typescript
formatURL('https://example.com/path?query=123')        // "https://example.com/path?query=123"
formatURL('https://example.com/path?query=123', false) // "https://example.com/path"
```

## 集合和枚举处理

### formatList

格式化列表数据为分隔符连接的字符串。

```typescript
formatList(
  list: any[],
  field?: string | ((item: any) => any),
  options?: ListFormatOptions,
  formatOptions?: FormatOptions
): string
```

**列表格式化选项：**
```typescript
interface ListFormatOptions {
  separator?: string     // 分隔符，默认为','
  maxItems?: number      // 最大显示项数，默认为0（不限制）
  ellipsis?: string      // 省略提示文本，默认为'...'
  emptyText?: string     // 空列表显示文本，默认为''
}
```

**示例：**
```typescript
// 基本用法
formatList([1, 2, 3])  // "1,2,3"

// 提取对象属性
formatList([{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}], 'name')  // "Alice,Bob"

// 限制显示数量
formatList([1, 2, 3, 4, 5], null, { maxItems: 3, ellipsis: '等' })  // "1,2,3等"

// 使用函数转换
formatList([1, 2, 3], item => `项目${item}`)  // "项目1,项目2,项目3"

// 自定义分隔符
formatList(['A', 'B', 'C'], null, { separator: ' | ' })  // "A | B | C"
```

### formatEnum

格式化枚举值为显示文本。

```typescript
formatEnum(
  value: any,
  enumMap: Record<string | number, string>,
  defaultText: string = ''
): string
```

**参数：**
- `value` - 枚举值
- `enumMap` - 枚举映射对象
- `defaultText` - 默认文本，当映射不存在时返回

**示例：**
```typescript
const statusMap = { 0: '禁用', 1: '启用', 2: '待审核' }

formatEnum(1, statusMap)           // "启用"
formatEnum('PENDING', { PENDING: '待处理', SUCCESS: '成功' })  // "待处理"
formatEnum(99, statusMap, '未知')   // "未知"
```

### formatBoolean

格式化布尔值。

```typescript
formatBoolean(
  value: any,
  trueText: string = '是',
  falseText: string = '否'
): string
```

**参数：**
- `value` - 布尔值
- `trueText` - 布尔值为true时的显示文本，默认为 '是'
- `falseText` - 布尔值为false时的显示文本，默认为 '否'

**示例：**
```typescript
formatBoolean(true)                    // "是"
formatBoolean(false)                   // "否"
formatBoolean(false, '启用', '禁用')    // "禁用"
formatBoolean('true')                  // "是" (字符串也支持)
formatBoolean('false')                 // "否"
formatBoolean(1, '开', '关')           // "开"
formatBoolean(0, '开', '关')           // "关"
```

## 状态与颜色

### formatStatusColor

根据状态值返回对应的颜色类名。

```typescript
formatStatusColor(
  status: number | string,
  customColorMap?: StatusColorMap
): StatusColorType
```

**状态颜色类型：**
```typescript
type StatusColorType = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'default'
```

**默认状态颜色映射：**
- `'0'` - info（默认或待处理）
- `'1'` - success（成功或正常）
- `'2'` - warning（警告或异常）
- `'3'` - danger（错误或禁用）

**示例：**
```typescript
formatStatusColor(1)       // "success"
formatStatusColor('2')     // "warning"
formatStatusColor(3)       // "danger"

// 自定义颜色映射
const customMap = { 'error': 'danger', 'ok': 'success' }
formatStatusColor('error', customMap)  // "danger"
```

## 表格数据格式化

### formatTableCell

为表格单元格提供格式化函数，支持多种数据类型格式化。

```typescript
formatTableCell(
  value: any,
  type: 'text' | 'number' | 'amount' | 'percent' | 'date' | 'datetime' | 'boolean' | 'enum',
  options?: Record<string, any>
): string
```

**参数：**
- `value` - 单元格值
- `type` - 数据类型
- `options` - 格式化选项，根据type不同而不同

**示例：**
```typescript
// 金额格式化
formatTableCell(1234.56, 'amount', { decimals: 2, prefix: '¥' })  // "¥1,234.56"

// 百分比格式化
formatTableCell(0.1234, 'percent', { decimals: 1 })  // "12.3%"

// 日期格式化
formatTableCell('2023-01-01', 'date')  // "2023-01-01"

// 枚举格式化
formatTableCell(1, 'enum', { enumMap: { 0: '禁用', 1: '启用' } })  // "启用"

// 布尔值格式化
formatTableCell(true, 'boolean', { trueText: '是', falseText: '否' })  // "是"
```

## 使用技巧

### 1. 表格列配置
在Vue表格中统一使用格式化函数：

```typescript
const columns = [
  {
    prop: 'amount',
    label: '金额',
    formatter: (row) => formatTableCell(row.amount, 'amount', { prefix: '¥', decimals: 2 })
  },
  {
    prop: 'status',
    label: '状态',
    formatter: (row) => formatTableCell(row.status, 'enum', { enumMap: statusMap })
  },
  {
    prop: 'progress',
    label: '进度',
    formatter: (row) => formatTableCell(row.progress, 'percent', { decimals: 1 })
  }
]
```

### 2. 敏感信息展示
在用户信息展示中保护隐私：

```typescript
// 用户信息组件
const userInfo = {
  phone: '13812345678',
  email: 'user@example.com',
  idCard: '110101199001011234'
}

// 显示处理
const displayInfo = {
  phone: formatPhone(userInfo.phone, undefined, undefined, true),     // "138****5678"
  email: formatPrivacy(userInfo.email, { showStart: 3, showEnd: 8 }), // "use****mple.com"
  idCard: formatIDCard(userInfo.idCard)                               // "1101**********1234"
}
```

### 3. 金额显示统一
在财务系统中统一金额格式：

```typescript
// 配置货币格式
const formatMoney = (amount, currency = 'CNY') => {
  return formatCurrency(amount, currency, { decimals: 2 })
}

// 使用
formatMoney(1234.56)         // "¥1,234.56"
formatMoney(1234.56, 'USD')  // "$1,234.56"
```

### 4. 文件大小显示
在文件管理系统中：

```typescript
const files = [
  { name: 'document.pdf', size: 1024000 },
  { name: 'image.jpg', size: 2048000 },
  { name: 'video.mp4', size: 104857600 }
]

files.forEach(file => {
  console.log(`${file.name}: ${formatFileSize(file.size)}`)
})
// document.pdf: 1000.00 KB
// image.jpg: 1.95 MB
// video.mp4: 100.00 MB
```

### 5. 数据列表格式化
在数据展示中优雅处理列表：

```typescript
const tags = ['JavaScript', 'Vue', 'TypeScript', 'Node.js', 'React']

// 限制显示数量
formatList(tags, null, { maxItems: 3, separator: ' · ', ellipsis: '...' })
// "JavaScript · Vue · TypeScript..."

// 提取对象字段
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
]
formatList(users, 'name', { separator: ', ' })  // "Alice, Bob, Charlie"
```

## 注意事项

1. **数值精度**：浮点数计算可能有精度问题，重要场景请使用专门的数值库
2. **格式化选项**：`strict` 模式会在无效输入时返回默认值，非严格模式保持原值
3. **性能考虑**：频繁格式化大量数据时考虑缓存结果
4. **国际化**：部分格式化函数使用中文文本，国际化项目需要适配
5. **类型安全**：在TypeScript中注意类型匹配，避免运行时错误

## 常见问题

### 1. 金额格式化出现浮点数精度问题

**问题描述：**

使用 `formatAmount` 或 `formatCurrency` 格式化金额时，出现精度丢失问题，导致显示的金额与预期不符。

```typescript
// 期望结果 "¥1,234.56"，实际可能出现 "¥1,234.5599999999999"
formatAmount(1234.56, 2)

// 更明显的例子
const result = 0.1 + 0.2  // 0.30000000000000004
formatAmount(result, 2)   // "0.30" 还是 "0.30000000000000"？
```

**问题原因：**

- JavaScript 浮点数使用 IEEE 754 双精度格式，存在固有精度问题
- 金融计算中的乘法、除法、累加操作会放大精度误差
- `toFixed()` 方法在某些边界情况下的舍入行为不一致
- 后端返回的金额可能已经包含精度问题

**解决方案：**

```typescript
// ❌ 错误：直接使用浮点数计算
const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
const formatted = formatAmount(total, 2)  // 可能出现精度问题

// ✅ 正确：使用整数计算（分为单位）避免精度问题
class MoneyFormatter {
  /**
   * 安全的金额格式化（内部使用分为单位）
   */
  static formatSafe(
    amountInCents: number,
    options?: {
      decimals?: number
      prefix?: string
      suffix?: string
    }
  ): string {
    const { decimals = 2, prefix = '¥', suffix = '' } = options || {}

    // 确保是整数
    const cents = Math.round(amountInCents)
    const yuan = cents / 100

    // 使用 Intl.NumberFormat 确保正确的格式化
    const formatter = new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })

    return `${prefix}${formatter.format(yuan)}${suffix}`
  }

  /**
   * 元转分（安全转换）
   */
  static yuanToCents(yuan: number): number {
    // 先转换为字符串再处理，避免浮点数精度问题
    const str = String(yuan)
    const parts = str.split('.')

    if (parts.length === 1) {
      return parseInt(parts[0]) * 100
    }

    const integerPart = parseInt(parts[0]) * 100
    const decimalPart = parts[1].padEnd(2, '0').substring(0, 2)

    const sign = yuan < 0 ? -1 : 1
    return sign * (Math.abs(integerPart) + parseInt(decimalPart))
  }

  /**
   * 安全的金额计算（避免精度问题）
   */
  static safeAdd(...amounts: number[]): number {
    // 先全部转换为分，计算后再转回元
    const totalCents = amounts.reduce((sum, amount) => {
      return sum + this.yuanToCents(amount)
    }, 0)

    return totalCents / 100
  }
}

// 使用示例
const items = [
  { price: 10.01, quantity: 3 },
  { price: 20.02, quantity: 2 }
]

// 安全计算总价
const totalCents = items.reduce((sum, item) => {
  const priceCents = MoneyFormatter.yuanToCents(item.price)
  return sum + priceCents * item.quantity
}, 0)

// 格式化输出
const formatted = MoneyFormatter.formatSafe(totalCents)
console.log(formatted)  // "¥70.07"

// 使用 decimal.js 库处理高精度计算
import Decimal from 'decimal.js'

function formatAmountPrecise(amount: string | number, decimals: number = 2): string {
  const decimal = new Decimal(amount)
  const formatted = decimal.toFixed(decimals)
  const parts = formatted.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `¥${parts.join('.')}`
}

formatAmountPrecise('1234.56789', 2)  // "¥1,234.57"
formatAmountPrecise(0.1 + 0.2, 2)     // "¥0.30"
```

---

### 2. 不同国家手机号格式化规则不一致

**问题描述：**

使用 `formatPhone` 格式化手机号时，默认格式只适用于中国手机号，对于其他国家的手机号格式化结果不正确。

```typescript
// 中国手机号格式化正常
formatPhone('13812345678')  // "138-1234-5678"

// 美国手机号格式化结果不符合当地习惯
formatPhone('12025551234')  // "120-2555-1234"（错误）
// 应该是 "(202) 555-1234"
```

**问题原因：**

- 不同国家手机号长度不同（美国10位，中国11位，日本11位等）
- 分隔符位置和符号各国规范不同
- 国际号码需要处理国家代码前缀
- 部分号码可能包含空格或特殊字符

**解决方案：**

```typescript
// ❌ 错误：使用固定格式处理所有国家手机号
const formatted = formatPhone(phone)

// ✅ 正确：支持多国手机号格式化
interface PhoneFormatRule {
  pattern: RegExp
  format: string
  example: string
}

const phoneFormatRules: Record<string, PhoneFormatRule> = {
  CN: {
    pattern: /^(\d{3})(\d{4})(\d{4})$/,
    format: '$1-$2-$3',
    example: '138-1234-5678'
  },
  US: {
    pattern: /^1?(\d{3})(\d{3})(\d{4})$/,
    format: '($1) $2-$3',
    example: '(202) 555-1234'
  },
  UK: {
    pattern: /^(\d{4})(\d{3})(\d{4})$/,
    format: '$1 $2 $3',
    example: '0123 456 7890'
  },
  JP: {
    pattern: /^(\d{3})(\d{4})(\d{4})$/,
    format: '$1-$2-$3',
    example: '090-1234-5678'
  },
  HK: {
    pattern: /^(\d{4})(\d{4})$/,
    format: '$1 $2',
    example: '9123 4567'
  }
}

class InternationalPhoneFormatter {
  /**
   * 清理手机号中的非数字字符
   */
  private static cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '')
  }

  /**
   * 检测手机号所属国家
   */
  private static detectCountry(phone: string): string {
    const cleaned = this.cleanPhone(phone)

    // 根据长度和前缀判断
    if (cleaned.startsWith('86') && cleaned.length === 13) {
      return 'CN'
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return 'CN'  // 中国手机号以1开头
    }
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      return 'US'  // 美国手机号（含国家代码）
    }
    if (cleaned.length === 10) {
      return 'US'  // 美国手机号（不含国家代码）
    }
    if (cleaned.startsWith('44') && cleaned.length === 12) {
      return 'UK'
    }
    if (cleaned.startsWith('81') && cleaned.length === 13) {
      return 'JP'
    }
    if (cleaned.startsWith('852') && cleaned.length === 11) {
      return 'HK'
    }

    return 'CN'  // 默认中国
  }

  /**
   * 移除国家代码前缀
   */
  private static removeCountryCode(phone: string, country: string): string {
    const cleaned = this.cleanPhone(phone)
    const countryCodes: Record<string, string> = {
      CN: '86',
      US: '1',
      UK: '44',
      JP: '81',
      HK: '852'
    }

    const code = countryCodes[country]
    if (code && cleaned.startsWith(code)) {
      return cleaned.substring(code.length)
    }

    return cleaned
  }

  /**
   * 格式化国际手机号
   */
  static format(
    phone: string,
    options?: {
      country?: string
      privacy?: boolean
      includeCountryCode?: boolean
    }
  ): string {
    const { country, privacy = false, includeCountryCode = false } = options || {}

    const detectedCountry = country || this.detectCountry(phone)
    const localPhone = this.removeCountryCode(phone, detectedCountry)
    const rule = phoneFormatRules[detectedCountry]

    if (!rule) {
      return phone  // 未知格式，返回原值
    }

    const match = localPhone.match(rule.pattern)
    if (!match) {
      return phone  // 格式不匹配，返回原值
    }

    let formatted = localPhone.replace(rule.pattern, rule.format)

    // 隐私保护
    if (privacy) {
      formatted = this.applyPrivacy(formatted, detectedCountry)
    }

    // 添加国家代码
    if (includeCountryCode) {
      const countryCodes: Record<string, string> = {
        CN: '+86',
        US: '+1',
        UK: '+44',
        JP: '+81',
        HK: '+852'
      }
      formatted = `${countryCodes[detectedCountry]} ${formatted}`
    }

    return formatted
  }

  /**
   * 应用隐私保护
   */
  private static applyPrivacy(formatted: string, country: string): string {
    // 根据不同国家的格式，隐藏中间部分
    const privacyRules: Record<string, (s: string) => string> = {
      CN: (s) => s.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3'),
      US: (s) => s.replace(/\((\d{3})\) (\d{3})-(\d{4})/, '($1) ***-$3'),
      UK: (s) => s.replace(/(\d{4}) (\d{3}) (\d{4})/, '$1 *** $3'),
      JP: (s) => s.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3'),
      HK: (s) => s.replace(/(\d{4}) (\d{4})/, '$1 ****')
    }

    const rule = privacyRules[country]
    return rule ? rule(formatted) : formatted
  }
}

// 使用示例
console.log(InternationalPhoneFormatter.format('13812345678'))
// "138-1234-5678"

console.log(InternationalPhoneFormatter.format('2025551234', { country: 'US' }))
// "(202) 555-1234"

console.log(InternationalPhoneFormatter.format('13812345678', { privacy: true }))
// "138-****-5678"

console.log(InternationalPhoneFormatter.format('13812345678', { includeCountryCode: true }))
// "+86 138-1234-5678"
```

---

### 3. 大数据量表格格式化导致性能问题

**问题描述：**

在表格中对大量数据进行格式化时，页面出现明显卡顿，滚动不流畅，用户体验变差。

```typescript
// 对10000行数据进行格式化
const formattedData = data.map(row => ({
  ...row,
  amount: formatAmount(row.amount, 2, '.', ',', '¥'),
  phone: formatPhone(row.phone, undefined, undefined, true),
  status: formatEnum(row.status, statusMap),
  createTime: formatDate(row.createTime)
}))
```

**问题原因：**

- 同步格式化大量数据阻塞主线程
- 每次渲染都重新执行格式化计算
- 格式化函数内部创建临时对象增加 GC 压力
- 复杂的正则表达式匹配消耗 CPU 时间
- 虚拟滚动未正确实现导致全量渲染

**解决方案：**

```typescript
// ❌ 错误：在渲染时同步格式化所有数据
const TableComponent = () => {
  const formatted = data.map(row => ({
    amount: formatAmount(row.amount)
  }))
  return <Table data={formatted} />
}

// ✅ 正确：使用多种优化策略
import { ref, computed, shallowRef } from 'vue'

// 1. 格式化结果缓存
class FormatCache {
  private cache: Map<string, string> = new Map()
  private maxSize: number

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize
  }

  private generateKey(type: string, value: unknown, options: unknown): string {
    return `${type}:${JSON.stringify(value)}:${JSON.stringify(options)}`
  }

  get(type: string, value: unknown, options: unknown): string | undefined {
    const key = this.generateKey(type, value, options)
    return this.cache.get(key)
  }

  set(type: string, value: unknown, options: unknown, result: string): void {
    const key = this.generateKey(type, value, options)

    // LRU 淘汰策略
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, result)
  }

  clear(): void {
    this.cache.clear()
  }
}

const formatCache = new FormatCache()

// 2. 带缓存的格式化函数
function cachedFormatAmount(amount: number, options?: Record<string, unknown>): string {
  const cached = formatCache.get('amount', amount, options)
  if (cached) return cached

  const result = formatAmount(
    amount,
    (options?.decimals as number) ?? 2,
    (options?.decimalSeparator as string) ?? '.',
    (options?.thousandsSeparator as string) ?? ',',
    (options?.prefix as string) ?? ''
  )

  formatCache.set('amount', amount, options, result)
  return result
}

// 3. 虚拟滚动 + 懒格式化
export function useVirtualTableFormatter<T extends Record<string, unknown>>(
  rawData: Ref<T[]>,
  formatConfig: Record<string, (value: unknown) => string>
) {
  // 只格式化可见区域的数据
  const visibleRange = ref({ start: 0, end: 50 })
  const formattedCache = shallowRef<Map<number, Record<string, string>>>(new Map())

  const visibleData = computed(() => {
    const result: Array<T & { _formatted: Record<string, string> }> = []
    const { start, end } = visibleRange.value

    for (let i = start; i < end && i < rawData.value.length; i++) {
      const row = rawData.value[i]
      let formatted = formattedCache.value.get(i)

      if (!formatted) {
        formatted = {}
        for (const [field, formatter] of Object.entries(formatConfig)) {
          if (field in row) {
            formatted[field] = formatter(row[field])
          }
        }
        formattedCache.value.set(i, formatted)
      }

      result.push({ ...row, _formatted: formatted })
    }

    return result
  })

  const updateVisibleRange = (start: number, end: number) => {
    visibleRange.value = { start, end }
  }

  const clearCache = () => {
    formattedCache.value.clear()
  }

  return {
    visibleData,
    updateVisibleRange,
    clearCache
  }
}

// 4. Web Worker 后台格式化
const formatWorker = new Worker(new URL('./format.worker.ts', import.meta.url))

interface FormatTask {
  id: string
  data: unknown[]
  config: Record<string, string>
}

interface FormatResult {
  id: string
  formatted: unknown[]
}

class BackgroundFormatter {
  private pending: Map<string, (result: unknown[]) => void> = new Map()

  constructor() {
    formatWorker.onmessage = (event: MessageEvent<FormatResult>) => {
      const { id, formatted } = event.data
      const resolve = this.pending.get(id)
      if (resolve) {
        resolve(formatted)
        this.pending.delete(id)
      }
    }
  }

  format(data: unknown[], config: Record<string, string>): Promise<unknown[]> {
    return new Promise(resolve => {
      const id = Math.random().toString(36).substring(7)
      this.pending.set(id, resolve)

      const task: FormatTask = { id, data, config }
      formatWorker.postMessage(task)
    })
  }
}

// format.worker.ts
// self.onmessage = (event: MessageEvent<FormatTask>) => {
//   const { id, data, config } = event.data
//   const formatted = data.map(row => {
//     const result = { ...row }
//     for (const [field, type] of Object.entries(config)) {
//       result[`${field}_formatted`] = formatByType(row[field], type)
//     }
//     return result
//   })
//   self.postMessage({ id, formatted })
// }

// 5. 使用 requestIdleCallback 分批处理
function formatInBatches<T>(
  data: T[],
  formatter: (item: T) => T,
  batchSize: number = 100
): Promise<T[]> {
  return new Promise(resolve => {
    const result: T[] = []
    let index = 0

    const processBatch = (deadline: IdleDeadline) => {
      while (index < data.length && deadline.timeRemaining() > 0) {
        const batchEnd = Math.min(index + batchSize, data.length)

        for (let i = index; i < batchEnd; i++) {
          result.push(formatter(data[i]))
        }

        index = batchEnd
      }

      if (index < data.length) {
        requestIdleCallback(processBatch)
      } else {
        resolve(result)
      }
    }

    requestIdleCallback(processBatch)
  })
}

// 使用示例
const { visibleData, updateVisibleRange } = useVirtualTableFormatter(
  tableData,
  {
    amount: (v) => cachedFormatAmount(v as number, { prefix: '¥' }),
    phone: (v) => formatPhone(v as string, undefined, undefined, true),
    status: (v) => formatEnum(v, statusMap)
  }
)
```

---

### 4. 枚举格式化在多语言环境下失效

**问题描述：**

使用 `formatEnum` 格式化枚举值时，在切换语言后枚举显示文本没有更新，或者不同语言下显示混乱。

```typescript
const statusMap = { 0: '禁用', 1: '启用' }

// 切换到英文后，依然显示中文
formatEnum(1, statusMap)  // "启用"（期望显示 "Enabled"）
```

**问题原因：**

- 枚举映射表是静态定义的，不支持动态切换
- 未与 i18n 国际化系统集成
- 缓存的格式化结果未在语言切换时清除
- 枚举值来源分散，难以统一管理

**解决方案：**

```typescript
// ❌ 错误：静态定义枚举映射
const statusMap = { 0: '禁用', 1: '启用' }
formatEnum(status, statusMap)

// ✅ 正确：与 i18n 集成的动态枚举格式化
import { useI18n } from 'vue-i18n'
import { computed, watch, ref } from 'vue'

// 枚举定义（使用 i18n key）
interface EnumDefinition {
  value: string | number
  labelKey: string
  color?: string
  icon?: string
}

const statusEnumDef: EnumDefinition[] = [
  { value: 0, labelKey: 'enum.status.disabled', color: 'danger' },
  { value: 1, labelKey: 'enum.status.enabled', color: 'success' },
  { value: 2, labelKey: 'enum.status.pending', color: 'warning' }
]

// i18n 消息
// zh-CN.json
// {
//   "enum": {
//     "status": {
//       "disabled": "禁用",
//       "enabled": "启用",
//       "pending": "待审核"
//     }
//   }
// }

// en-US.json
// {
//   "enum": {
//     "status": {
//       "disabled": "Disabled",
//       "enabled": "Enabled",
//       "pending": "Pending"
//     }
//   }
// }

// 动态枚举格式化 Composable
export function useEnumFormatter() {
  const { t, locale } = useI18n()

  // 缓存，按语言区分
  const cache = ref<Map<string, Map<string, Record<string | number, string>>>>(new Map())

  // 语言切换时清除缓存
  watch(locale, () => {
    cache.value.clear()
  })

  /**
   * 构建枚举映射表
   */
  const buildEnumMap = (
    enumDef: EnumDefinition[],
    cacheKey: string
  ): Record<string | number, string> => {
    const currentLocale = locale.value
    let localeCache = cache.value.get(currentLocale)

    if (!localeCache) {
      localeCache = new Map()
      cache.value.set(currentLocale, localeCache)
    }

    let enumMap = localeCache.get(cacheKey)
    if (enumMap) {
      return enumMap
    }

    enumMap = {}
    for (const item of enumDef) {
      enumMap[item.value] = t(item.labelKey)
    }

    localeCache.set(cacheKey, enumMap)
    return enumMap
  }

  /**
   * 格式化枚举值
   */
  const formatEnumI18n = (
    value: string | number,
    enumDef: EnumDefinition[],
    cacheKey: string,
    defaultText?: string
  ): string => {
    const enumMap = buildEnumMap(enumDef, cacheKey)
    return enumMap[value] ?? defaultText ?? String(value)
  }

  /**
   * 获取枚举选项列表（用于下拉框）
   */
  const getEnumOptions = (
    enumDef: EnumDefinition[],
    cacheKey: string
  ): Array<{ value: string | number; label: string; color?: string }> => {
    const enumMap = buildEnumMap(enumDef, cacheKey)

    return enumDef.map(item => ({
      value: item.value,
      label: enumMap[item.value],
      color: item.color
    }))
  }

  /**
   * 获取枚举项的颜色
   */
  const getEnumColor = (
    value: string | number,
    enumDef: EnumDefinition[]
  ): string | undefined => {
    const item = enumDef.find(e => e.value === value)
    return item?.color
  }

  return {
    formatEnumI18n,
    getEnumOptions,
    getEnumColor,
    buildEnumMap
  }
}

// 使用示例
const { formatEnumI18n, getEnumOptions, getEnumColor } = useEnumFormatter()

// 格式化单个值
const statusText = formatEnumI18n(1, statusEnumDef, 'status')
// 中文环境: "启用"
// 英文环境: "Enabled"

// 获取下拉选项
const statusOptions = getEnumOptions(statusEnumDef, 'status')
// [
//   { value: 0, label: '禁用', color: 'danger' },
//   { value: 1, label: '启用', color: 'success' },
//   { value: 2, label: '待审核', color: 'warning' }
// ]

// 在表格中使用
const columns = [
  {
    prop: 'status',
    label: t('table.status'),
    formatter: (row) => formatEnumI18n(row.status, statusEnumDef, 'status')
  }
]
```

---

### 5. 文件大小格式化对负数和特殊值处理不当

**问题描述：**

使用 `formatFileSize` 处理非常规输入时，返回不合理的结果或抛出错误。

```typescript
formatFileSize(-1024)     // 返回 "-1.00 KB"？还是错误？
formatFileSize(NaN)       // 返回什么？
formatFileSize(Infinity)  // 返回什么？
formatFileSize(null)      // 类型错误？
```

**问题原因：**

- 函数未对边界情况进行防御性处理
- 负数在文件大小场景下无意义但可能出现
- NaN 和 Infinity 会导致计算异常
- null 和 undefined 未进行类型检查

**解决方案：**

```typescript
// ❌ 错误：不处理边界情况
function formatFileSize(bytes: number): string {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024
    index++
  }
  return `${bytes.toFixed(2)} ${units[index]}`
}

// ✅ 正确：完善的边界处理和错误恢复
interface FileSizeFormatOptions {
  decimals?: number
  base?: 1024 | 1000
  units?: string[]
  fallback?: string
  allowNegative?: boolean
  locale?: string
}

function formatFileSizeSafe(
  bytes: unknown,
  options?: FileSizeFormatOptions
): string {
  const {
    decimals = 2,
    base = 1024,
    units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'],
    fallback = '0 Bytes',
    allowNegative = false,
    locale = 'zh-CN'
  } = options || {}

  // 类型检查和转换
  let numericValue: number

  if (bytes === null || bytes === undefined) {
    return fallback
  }

  if (typeof bytes === 'string') {
    numericValue = parseFloat(bytes)
  } else if (typeof bytes === 'number') {
    numericValue = bytes
  } else {
    return fallback
  }

  // 处理特殊数值
  if (Number.isNaN(numericValue)) {
    console.warn('formatFileSize: NaN input, returning fallback')
    return fallback
  }

  if (!Number.isFinite(numericValue)) {
    return numericValue > 0 ? '∞' : '-∞'
  }

  // 处理负数
  const isNegative = numericValue < 0

  if (isNegative && !allowNegative) {
    console.warn('formatFileSize: Negative value not allowed, using absolute value')
  }

  const absoluteValue = Math.abs(numericValue)

  // 处理 0
  if (absoluteValue === 0) {
    return fallback
  }

  // 计算单位
  let unitIndex = 0
  let value = absoluteValue

  while (value >= base && unitIndex < units.length - 1) {
    value /= base
    unitIndex++
  }

  // 格式化数值
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: unitIndex === 0 ? 0 : decimals,
    maximumFractionDigits: unitIndex === 0 ? 0 : decimals
  })

  const formattedValue = formatter.format(value)
  const sign = isNegative && allowNegative ? '-' : ''

  return `${sign}${formattedValue} ${units[unitIndex]}`
}

// 扩展：支持从文件大小字符串解析回字节数
function parseFileSize(sizeStr: string): number | null {
  const match = sizeStr.match(/^(-?)(\d+(?:\.\d+)?)\s*(Bytes?|KB|MB|GB|TB|PB|EB)$/i)

  if (!match) {
    return null
  }

  const [, sign, valueStr, unit] = match
  const value = parseFloat(valueStr)

  const unitMultipliers: Record<string, number> = {
    'byte': 1,
    'bytes': 1,
    'kb': 1024,
    'mb': 1024 ** 2,
    'gb': 1024 ** 3,
    'tb': 1024 ** 4,
    'pb': 1024 ** 5,
    'eb': 1024 ** 6
  }

  const multiplier = unitMultipliers[unit.toLowerCase()] ?? 1
  const bytes = value * multiplier

  return sign === '-' ? -bytes : bytes
}

// 使用示例
console.log(formatFileSizeSafe(1024))           // "1.00 KB"
console.log(formatFileSizeSafe(-1024))          // "1.00 KB"（默认取绝对值）
console.log(formatFileSizeSafe(-1024, { allowNegative: true }))  // "-1.00 KB"
console.log(formatFileSizeSafe(NaN))            // "0 Bytes"
console.log(formatFileSizeSafe(Infinity))       // "∞"
console.log(formatFileSizeSafe(null))           // "0 Bytes"
console.log(formatFileSizeSafe('2048'))         // "2.00 KB"

console.log(parseFileSize('1.5 GB'))            // 1610612736
console.log(parseFileSize('invalid'))           // null
```

---

### 6. 银行卡格式化时卡号验证失败

**问题描述：**

使用 `formatBankCard` 格式化银行卡号时，对于格式不正确或长度异常的卡号没有进行校验，导致格式化结果不正确或产生误导。

```typescript
// 长度不正确的卡号也被格式化了
formatBankCard('123456')           // "1234 56"
formatBankCard('622536527156282')  // "6225 3652 7156 282"（15位，缺一位）

// 包含字母的"卡号"
formatBankCard('622536527156ABCD')  // "6225 3652 7156 ABCD"
```

**问题原因：**

- 格式化函数只负责格式化，未进行验证
- 银行卡号长度可能是15-19位不等
- 用户输入可能包含非数字字符
- 不同银行卡类型有不同的验证规则

**解决方案：**

```typescript
// ❌ 错误：只格式化不验证
function formatBankCard(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})/g, '$1 ').trim()
}

// ✅ 正确：带验证的银行卡格式化
interface BankCardFormatResult {
  formatted: string
  isValid: boolean
  cardType?: string
  bankName?: string
  errors: string[]
}

// 常见银行卡 BIN（前6位）对应的银行和卡类型
const bankBinMap: Record<string, { bank: string; type: string }> = {
  '622202': { bank: '中国工商银行', type: '借记卡' },
  '622848': { bank: '中国工商银行', type: '信用卡' },
  '621226': { bank: '中国建设银行', type: '借记卡' },
  '622280': { bank: '中国农业银行', type: '借记卡' },
  '621660': { bank: '中国银行', type: '借记卡' },
  '622150': { bank: '招商银行', type: '借记卡' },
  '622588': { bank: '招商银行', type: '信用卡' },
  '622700': { bank: '中国银行', type: '信用卡' }
}

class BankCardFormatter {
  /**
   * Luhn 算法验证卡号
   */
  private static luhnCheck(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '')

    if (digits.length < 13 || digits.length > 19) {
      return false
    }

    let sum = 0
    let isEven = false

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10)

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  /**
   * 识别银行和卡类型
   */
  private static identifyCard(cardNumber: string): { bank?: string; type?: string } {
    const cleaned = cardNumber.replace(/\D/g, '')
    const bin = cleaned.substring(0, 6)

    return bankBinMap[bin] || {}
  }

  /**
   * 验证并格式化银行卡号
   */
  static formatWithValidation(
    cardNumber: string,
    options?: {
      separator?: string
      privacy?: boolean
      strictValidation?: boolean
    }
  ): BankCardFormatResult {
    const {
      separator = ' ',
      privacy = false,
      strictValidation = true
    } = options || {}

    const errors: string[] = []
    const cleaned = cardNumber.replace(/\D/g, '')

    // 检查是否包含非数字字符
    if (cardNumber !== cleaned && cardNumber.replace(/\s/g, '') !== cleaned) {
      errors.push('卡号包含非数字字符')
    }

    // 检查长度
    if (cleaned.length < 13) {
      errors.push('卡号长度不足（最少13位）')
    } else if (cleaned.length > 19) {
      errors.push('卡号长度过长（最多19位）')
    }

    // Luhn 校验
    const isLuhnValid = this.luhnCheck(cleaned)
    if (strictValidation && !isLuhnValid && cleaned.length >= 13) {
      errors.push('卡号校验位不正确')
    }

    // 识别银行
    const { bank, type } = this.identifyCard(cleaned)

    // 格式化
    let formatted: string

    if (privacy) {
      // 隐私模式：只显示后四位
      const visible = cleaned.slice(-4)
      const hidden = '*'.repeat(cleaned.length - 4)
      const combined = hidden + visible

      formatted = combined.replace(/(.{4})/g, `$1${separator}`).trim()
    } else {
      formatted = cleaned.replace(/(.{4})/g, `$1${separator}`).trim()
    }

    return {
      formatted,
      isValid: errors.length === 0 && (isLuhnValid || !strictValidation),
      cardType: type,
      bankName: bank,
      errors
    }
  }

  /**
   * 简单格式化（带基本验证）
   */
  static format(cardNumber: string, separator: string = ' '): string {
    const result = this.formatWithValidation(cardNumber, { separator, strictValidation: false })
    return result.formatted
  }

  /**
   * 实时输入格式化（用于输入框）
   */
  static formatInput(input: string, maxLength: number = 19): string {
    // 移除非数字
    let cleaned = input.replace(/\D/g, '')

    // 限制长度
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength)
    }

    // 每4位添加空格
    return cleaned.replace(/(.{4})/g, '$1 ').trim()
  }
}

// 使用示例
const result = BankCardFormatter.formatWithValidation('6225365271562822')
console.log(result)
// {
//   formatted: "6225 3652 7156 2822",
//   isValid: true,
//   cardType: undefined,
//   bankName: undefined,
//   errors: []
// }

const invalidResult = BankCardFormatter.formatWithValidation('123456')
console.log(invalidResult)
// {
//   formatted: "1234 56",
//   isValid: false,
//   cardType: undefined,
//   bankName: undefined,
//   errors: ["卡号长度不足（最少13位）"]
// }

// 在 Vue 输入框中使用
// <input
//   v-model="cardNumber"
//   @input="cardNumber = BankCardFormatter.formatInput($event.target.value)"
//   placeholder="请输入银行卡号"
// />
```

---

### 7. 列表格式化对嵌套对象和复杂数据结构处理失败

**问题描述：**

使用 `formatList` 处理复杂对象数组时，无法正确提取嵌套属性或处理数组属性。

```typescript
const users = [
  { id: 1, profile: { name: '张三' }, roles: ['admin', 'user'] },
  { id: 2, profile: { name: '李四' }, roles: ['user'] }
]

// 无法提取嵌套属性
formatList(users, 'profile.name')  // 返回 "undefined,undefined"

// 无法处理数组属性
formatList(users, 'roles')  // 返回 "[object Array],[object Array]"
```

**问题原因：**

- `formatList` 只支持单层属性访问
- 未处理数组类型的属性值
- 缺少对 null 和 undefined 的处理
- 不支持复杂的取值逻辑

**解决方案：**

```typescript
// ❌ 错误：简单的属性访问
function formatList(list: any[], field?: string): string {
  return list.map(item => field ? item[field] : item).join(',')
}

// ✅ 正确：支持深度访问和复杂数据结构
type PathAccessor<T> = string | ((item: T) => unknown)

interface AdvancedListFormatOptions {
  separator?: string
  maxItems?: number
  ellipsis?: string
  emptyText?: string
  nullText?: string
  arrayJoinSeparator?: string
  transform?: (value: unknown) => string
}

class AdvancedListFormatter {
  /**
   * 根据路径获取嵌套属性值
   */
  private static getNestedValue(obj: unknown, path: string): unknown {
    if (obj === null || obj === undefined) {
      return undefined
    }

    const parts = path.split('.')
    let current: unknown = obj

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined
      }

      // 处理数组索引 (如 "items[0]")
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/)
      if (arrayMatch) {
        const [, prop, index] = arrayMatch
        current = (current as Record<string, unknown>)[prop]
        if (Array.isArray(current)) {
          current = current[parseInt(index)]
        } else {
          return undefined
        }
      } else {
        current = (current as Record<string, unknown>)[part]
      }
    }

    return current
  }

  /**
   * 将值转换为字符串
   */
  private static valueToString(
    value: unknown,
    options: AdvancedListFormatOptions
  ): string {
    const { nullText = '', arrayJoinSeparator = '、', transform } = options

    if (value === null || value === undefined) {
      return nullText
    }

    if (transform) {
      return transform(value)
    }

    if (Array.isArray(value)) {
      return value
        .map(v => this.valueToString(v, { ...options, transform: undefined }))
        .filter(Boolean)
        .join(arrayJoinSeparator)
    }

    if (typeof value === 'object') {
      // 尝试使用 toString 或 name/label 属性
      const obj = value as Record<string, unknown>
      if (typeof obj.toString === 'function' && obj.toString !== Object.prototype.toString) {
        return obj.toString()
      }
      if (typeof obj.name === 'string') {
        return obj.name
      }
      if (typeof obj.label === 'string') {
        return obj.label
      }
      return JSON.stringify(value)
    }

    return String(value)
  }

  /**
   * 格式化列表
   */
  static format<T>(
    list: T[],
    accessor?: PathAccessor<T>,
    options?: AdvancedListFormatOptions
  ): string {
    const {
      separator = ',',
      maxItems = 0,
      ellipsis = '...',
      emptyText = '',
      nullText = '',
      arrayJoinSeparator = '、',
      transform
    } = options || {}

    if (!list || list.length === 0) {
      return emptyText
    }

    // 处理 maxItems
    const itemsToProcess = maxItems > 0 ? list.slice(0, maxItems) : list
    const hasMore = maxItems > 0 && list.length > maxItems

    const values = itemsToProcess.map(item => {
      let value: unknown

      if (accessor === undefined) {
        value = item
      } else if (typeof accessor === 'function') {
        try {
          value = accessor(item)
        } catch {
          value = undefined
        }
      } else if (typeof accessor === 'string') {
        value = this.getNestedValue(item, accessor)
      } else {
        value = item
      }

      return this.valueToString(value, { nullText, arrayJoinSeparator, transform })
    })

    const result = values.filter(v => v !== '').join(separator)

    return hasMore ? `${result}${ellipsis}` : result
  }

  /**
   * 便捷方法：格式化对象列表的指定字段
   */
  static formatField<T extends Record<string, unknown>>(
    list: T[],
    field: string,
    options?: AdvancedListFormatOptions
  ): string {
    return this.format(list, field, options)
  }

  /**
   * 便捷方法：使用函数提取值
   */
  static formatWith<T>(
    list: T[],
    getter: (item: T) => unknown,
    options?: AdvancedListFormatOptions
  ): string {
    return this.format(list, getter, options)
  }
}

// 使用示例
const users = [
  { id: 1, profile: { name: '张三' }, roles: ['admin', 'user'] },
  { id: 2, profile: { name: '李四' }, roles: ['user'] }
]

// 提取嵌套属性
console.log(AdvancedListFormatter.format(users, 'profile.name'))
// "张三,李四"

// 处理数组属性
console.log(AdvancedListFormatter.format(users, 'roles'))
// "admin、user,user"

// 使用函数提取
console.log(AdvancedListFormatter.formatWith(users, u => `${u.profile.name}(${u.roles.length}个角色)`))
// "张三(2个角色),李四(1个角色)"

// 自定义分隔符和限制数量
const tags = ['JavaScript', 'Vue', 'TypeScript', 'React', 'Node.js']
console.log(AdvancedListFormatter.format(tags, undefined, {
  separator: ' | ',
  maxItems: 3,
  ellipsis: ' +2'
}))
// "JavaScript | Vue | TypeScript +2"

// 处理空值
const mixedList = [{ name: '张三' }, { name: null }, { name: '王五' }]
console.log(AdvancedListFormatter.format(mixedList, 'name', { nullText: '未知' }))
// "张三,未知,王五"
```

---

### 8. 百分比格式化在不同场景下精度要求不一致

**问题描述：**

使用 `formatPercent` 时，不同业务场景对百分比的精度和显示格式有不同要求，统一的格式化参数无法满足需求。

```typescript
// 进度条需要整数百分比
formatPercent(0.756, 2)  // "75.60%"（期望 "76%"）

// 财务报表需要保留4位小数
formatPercent(0.12345678, 2)  // "12.35%"（期望 "12.3457%"）

// 科学数据需要使用指数形式
formatPercent(0.00000123, 2)  // "0.00%"（期望 "1.23e-4%"）
```

**问题原因：**

- 不同场景对精度有不同要求
- 极小值或极大值需要特殊处理
- 部分场景需要显示正负号
- 数值接近边界时的舍入规则不同

**解决方案：**

```typescript
// ❌ 错误：简单的百分比格式化
function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// ✅ 正确：支持多种场景的百分比格式化
type RoundingMode = 'round' | 'floor' | 'ceil' | 'trunc'

interface PercentFormatOptions {
  decimals?: number
  minDecimals?: number
  maxDecimals?: number
  showSign?: boolean
  withSymbol?: boolean
  roundingMode?: RoundingMode
  useExponential?: boolean
  exponentialThreshold?: number
  colorCode?: boolean
  locale?: string
}

interface PercentFormatResult {
  text: string
  value: number
  color?: 'positive' | 'negative' | 'neutral'
}

class PercentFormatter {
  private static round(value: number, decimals: number, mode: RoundingMode): number {
    const factor = Math.pow(10, decimals)

    switch (mode) {
      case 'floor':
        return Math.floor(value * factor) / factor
      case 'ceil':
        return Math.ceil(value * factor) / factor
      case 'trunc':
        return Math.trunc(value * factor) / factor
      case 'round':
      default:
        return Math.round(value * factor) / factor
    }
  }

  /**
   * 格式化百分比
   */
  static format(value: number, options?: PercentFormatOptions): string {
    const result = this.formatDetailed(value, options)
    return result.text
  }

  /**
   * 格式化百分比（返回详细结果）
   */
  static formatDetailed(value: number, options?: PercentFormatOptions): PercentFormatResult {
    const {
      decimals,
      minDecimals = 0,
      maxDecimals = 2,
      showSign = false,
      withSymbol = true,
      roundingMode = 'round',
      useExponential = false,
      exponentialThreshold = 0.0001,
      colorCode = false,
      locale = 'zh-CN'
    } = options || {}

    // 处理特殊值
    if (!Number.isFinite(value)) {
      return {
        text: Number.isNaN(value) ? 'N/A' : (value > 0 ? '+∞%' : '-∞%'),
        value,
        color: 'neutral'
      }
    }

    const percentValue = value * 100
    const absPercent = Math.abs(percentValue)

    // 确定小数位数
    let effectiveDecimals: number
    if (decimals !== undefined) {
      effectiveDecimals = decimals
    } else {
      // 根据数值大小自动调整精度
      if (absPercent >= 10) {
        effectiveDecimals = minDecimals
      } else if (absPercent >= 1) {
        effectiveDecimals = Math.min(1, maxDecimals)
      } else if (absPercent >= 0.1) {
        effectiveDecimals = Math.min(2, maxDecimals)
      } else {
        effectiveDecimals = maxDecimals
      }
    }

    // 使用指数形式（极小值）
    if (useExponential && absPercent > 0 && absPercent < exponentialThreshold * 100) {
      const exponential = percentValue.toExponential(effectiveDecimals)
      const sign = showSign && percentValue > 0 ? '+' : ''
      const symbol = withSymbol ? '%' : ''
      return {
        text: `${sign}${exponential}${symbol}`,
        value,
        color: this.getColor(percentValue, colorCode)
      }
    }

    // 应用舍入
    const rounded = this.round(percentValue, effectiveDecimals, roundingMode)

    // 格式化数值
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: effectiveDecimals,
      maximumFractionDigits: effectiveDecimals,
      signDisplay: showSign ? 'exceptZero' : 'auto'
    })

    const formattedNumber = formatter.format(rounded)
    const symbol = withSymbol ? '%' : ''

    return {
      text: `${formattedNumber}${symbol}`,
      value,
      color: this.getColor(percentValue, colorCode)
    }
  }

  private static getColor(value: number, colorCode: boolean): 'positive' | 'negative' | 'neutral' | undefined {
    if (!colorCode) return undefined
    if (value > 0) return 'positive'
    if (value < 0) return 'negative'
    return 'neutral'
  }

  /**
   * 进度百分比（整数，限制0-100）
   */
  static formatProgress(value: number): string {
    const clamped = Math.max(0, Math.min(1, value))
    const percent = Math.round(clamped * 100)
    return `${percent}%`
  }

  /**
   * 财务百分比（高精度，带符号）
   */
  static formatFinance(value: number, decimals: number = 4): string {
    return this.format(value, {
      decimals,
      showSign: true,
      colorCode: true
    })
  }

  /**
   * 科学百分比（支持指数形式）
   */
  static formatScientific(value: number, decimals: number = 4): string {
    return this.format(value, {
      decimals,
      useExponential: true,
      exponentialThreshold: 0.0001
    })
  }

  /**
   * 变化率格式化（强调正负）
   */
  static formatChange(value: number, options?: PercentFormatOptions): PercentFormatResult {
    return this.formatDetailed(value, {
      showSign: true,
      colorCode: true,
      ...options
    })
  }
}

// 预设场景的便捷函数
export const percentPresets = {
  // 进度条
  progress: (value: number) => PercentFormatter.formatProgress(value),
  // "76%"

  // 财务报表
  finance: (value: number) => PercentFormatter.formatFinance(value),
  // "+12.3457%" 或 "-5.2341%"

  // 科学数据
  scientific: (value: number) => PercentFormatter.formatScientific(value),
  // "1.2300e-4%"

  // 变化率
  change: (value: number) => PercentFormatter.formatChange(value),
  // { text: "+15.23%", value: 0.1523, color: "positive" }

  // 默认格式
  default: (value: number, decimals?: number) => PercentFormatter.format(value, { decimals })
  // "12.34%"
}

// 使用示例
console.log(percentPresets.progress(0.756))     // "76%"
console.log(percentPresets.finance(0.12345678)) // "+12.3457%"
console.log(percentPresets.scientific(0.00000123))  // "1.2300e-4%"

const changeResult = percentPresets.change(0.1523)
console.log(changeResult)
// { text: "+15.23%", value: 0.1523, color: "positive" }

// 在 Vue 模板中使用
// <span :class="percentPresets.change(item.rate).color">
//   {{ percentPresets.change(item.rate).text }}
// </span>
```
