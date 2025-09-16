# 格式化工具 (format.ts)

格式化工具函数集合，提供全面的数据格式化功能，包含数值、时间、隐私数据、文本、集合、状态等各种类型的格式化处理。

## 📖 概述

格式化工具库包含以下功能类别：
- **数值格式化**：处理单位、数字、金额、百分比和单位
- **时间与持续时间**：处理时长的格式化
- **隐私和敏感数据处理**：处理敏感信息的格式化和脱敏
- **文本和URL处理**：处理字符串截断和格式化
- **集合和枚举处理**：处理列表、枚举和布尔值的格式化
- **状态与颜色**：根据状态值返回对应的颜色类名
- **表格数据格式化**：为表格单元格提供通用的格式化功能

## 🔢 数值格式化

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

## ⏱️ 时间与持续时间

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

## 🔒 隐私和敏感数据处理

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

## 📝 文本和URL处理

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

## 📋 集合和枚举处理

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

## 🎨 状态与颜色

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

## 📊 表格数据格式化

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

## 💡 使用技巧

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

## ⚠️ 注意事项

1. **数值精度**：浮点数计算可能有精度问题，重要场景请使用专门的数值库
2. **格式化选项**：`strict` 模式会在无效输入时返回默认值，非严格模式保持原值
3. **性能考虑**：频繁格式化大量数据时考虑缓存结果
4. **国际化**：部分格式化函数使用中文文本，国际化项目需要适配
5. **类型安全**：在TypeScript中注意类型匹配，避免运行时错误
