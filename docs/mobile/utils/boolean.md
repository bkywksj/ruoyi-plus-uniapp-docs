# boolean 布尔值工具

## 介绍

`boolean` 是布尔值处理工具，提供多种格式布尔值的判断、转换和状态切换功能。该工具支持字符串布尔值（如 `'true'`、`'1'`、`'yes'`）与原生布尔值之间的互转。

**核心特性:**

- **多格式支持** - 支持 `'1'/'0'`、`'true'/'false'`、`'yes'/'no'` 等多种格式
- **类型判断** - 判断值是否为真值或假值
- **格式转换** - 布尔值与字符串的相互转换
- **状态切换** - 便捷的状态反转功能

## 基本用法

### isTrue

判断值是否为真值：

```typescript
import { isTrue } from '@/utils/boolean'

// 原生布尔值
console.log(isTrue(true))    // true
console.log(isTrue(false))   // false

// 字符串布尔值
console.log(isTrue('true'))  // true
console.log(isTrue('false')) // false

// 数字字符串
console.log(isTrue('1'))     // true
console.log(isTrue('0'))     // false

// yes/no 格式
console.log(isTrue('yes'))   // true
console.log(isTrue('no'))    // false

// on/off 格式
console.log(isTrue('on'))    // true
console.log(isTrue('off'))   // false

// 其他值
console.log(isTrue(null))    // false
console.log(isTrue(''))      // false
```

### isFalse

判断值是否为假值：

```typescript
import { isFalse } from '@/utils/boolean'

// 假值判断
console.log(isFalse(false))   // true
console.log(isFalse('false')) // true
console.log(isFalse('0'))     // true
console.log(isFalse('no'))    // true
console.log(isFalse('off'))   // true

// 非假值
console.log(isFalse(true))    // false
console.log(isFalse('1'))     // false
console.log(isFalse('yes'))   // false
```

### toBool

将任意值转换为布尔值：

```typescript
import { toBool } from '@/utils/boolean'

// 字符串转布尔值
console.log(toBool('true'))  // true
console.log(toBool('false')) // false
console.log(toBool('1'))     // true
console.log(toBool('0'))     // false

// 数字转布尔值
console.log(toBool(1))       // true
console.log(toBool(0))       // false

// 空值处理
console.log(toBool(null))    // false
console.log(toBool(''))      // false

// 使用默认值
console.log(toBool('maybe', true))  // true（无法识别时返回默认值）
```

### toBoolString

将布尔值转换为字符串：

```typescript
import { toBoolString } from '@/utils/boolean'

// 默认格式 '1'/'0'
console.log(toBoolString(true))   // '1'
console.log(toBoolString(false))  // '0'

// 指定格式 'true'/'false'
console.log(toBoolString(true, 'true/false'))   // 'true'
console.log(toBoolString(false, 'true/false'))  // 'false'

// 指定格式 'yes'/'no'
console.log(toBoolString(true, 'yes/no'))   // 'yes'
console.log(toBoolString(false, 'yes/no'))  // 'no'

// 指定格式 'on'/'off'
console.log(toBoolString(true, 'on/off'))   // 'on'
console.log(toBoolString(false, 'on/off'))  // 'off'
```

### toggleStatus

切换状态值：

```typescript
import { toggleStatus } from '@/utils/boolean'

// 切换 '1'/'0'
console.log(toggleStatus('1'))  // '0'
console.log(toggleStatus('0'))  // '1'

// 切换 'true'/'false'
console.log(toggleStatus('true'))   // 'false'
console.log(toggleStatus('false'))  // 'true'

// 切换 'yes'/'no'
console.log(toggleStatus('yes'))  // 'no'
console.log(toggleStatus('no'))   // 'yes'

// 切换布尔值
console.log(toggleStatus(true))   // false
console.log(toggleStatus(false))  // true
```

## 实际应用场景

### API 数据处理

```typescript
import { isTrue, toBool, toBoolString } from '@/utils/boolean'

// API 返回的状态通常是字符串
interface UserFromApi {
  id: string
  name: string
  status: '0' | '1'       // 启用状态
  isVip: 'true' | 'false' // VIP 状态
}

// 转换为前端友好的格式
interface User {
  id: string
  name: string
  status: boolean
  isVip: boolean
}

const transformUser = (apiUser: UserFromApi): User => ({
  id: apiUser.id,
  name: apiUser.name,
  status: toBool(apiUser.status),
  isVip: toBool(apiUser.isVip)
})

// 提交前转换回 API 格式
const prepareForApi = (user: User): UserFromApi => ({
  id: user.id,
  name: user.name,
  status: toBoolString(user.status) as '0' | '1',
  isVip: toBoolString(user.isVip, 'true/false') as 'true' | 'false'
})
```

### 表单开关控制

```typescript
import { toBool, toBoolString } from '@/utils/boolean'

// 表单数据
const formData = reactive({
  enableNotify: true,
  showBadge: false,
  autoUpdate: true
})

// 从服务器加载配置
const loadConfig = async () => {
  const config = await api.getConfig()

  // API 返回字符串格式
  formData.enableNotify = toBool(config.enableNotify)
  formData.showBadge = toBool(config.showBadge)
  formData.autoUpdate = toBool(config.autoUpdate)
}

// 保存配置到服务器
const saveConfig = async () => {
  await api.saveConfig({
    enableNotify: toBoolString(formData.enableNotify),
    showBadge: toBoolString(formData.showBadge),
    autoUpdate: toBoolString(formData.autoUpdate)
  })
}
```

### 状态切换

```typescript
import { toggleStatus, isTrue } from '@/utils/boolean'

// 用户状态切换
const toggleUserStatus = async (user: User) => {
  const newStatus = toggleStatus(user.status)

  await api.updateUserStatus(user.id, newStatus)

  user.status = newStatus

  uni.showToast({
    title: isTrue(newStatus) ? '已启用' : '已禁用'
  })
}

// 批量状态切换
const batchToggle = (users: User[], enable: boolean) => {
  const status = toBoolString(enable)
  users.forEach(user => {
    user.status = status
  })
}
```

### 条件渲染

```typescript
import { isTrue } from '@/utils/boolean'

// 在模板中使用
const shouldShowVipBadge = computed(() => isTrue(user.value.isVip))
const isUserActive = computed(() => isTrue(user.value.status))

// 条件样式
const statusClass = computed(() => ({
  'status-active': isTrue(user.value.status),
  'status-inactive': !isTrue(user.value.status)
}))
```

### 本地存储处理

```typescript
import { toBool, toBoolString } from '@/utils/boolean'

// 存储布尔值到本地（自动转为字符串）
const savePreference = (key: string, value: boolean) => {
  uni.setStorageSync(key, toBoolString(value))
}

// 从本地读取布尔值
const loadPreference = (key: string, defaultValue = false): boolean => {
  const stored = uni.getStorageSync(key)
  return stored ? toBool(stored) : defaultValue
}

// 使用示例
savePreference('darkMode', true)
const isDarkMode = loadPreference('darkMode', false)
```

## API

### 函数列表

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| isTrue | 判断是否为真值 | `(value: any)` | `boolean` |
| isFalse | 判断是否为假值 | `(value: any)` | `boolean` |
| toBool | 转换为布尔值 | `(value: any, defaultValue?: boolean)` | `boolean` |
| toBoolString | 转换为字符串 | `(value: boolean, format?: string)` | `string` |
| toggleStatus | 切换状态值 | `(value: any)` | `any` |

### 支持的真值格式

| 格式 | 真值 | 假值 |
|------|------|------|
| 布尔值 | `true` | `false` |
| 数字字符串 | `'1'` | `'0'` |
| 布尔字符串 | `'true'` | `'false'` |
| 是否字符串 | `'yes'` | `'no'` |
| 开关字符串 | `'on'` | `'off'` |

### 类型定义

```typescript
/**
 * 判断值是否为真值
 * @param value 待判断的值
 * @returns 是否为真值
 */
function isTrue(value: any): boolean

/**
 * 判断值是否为假值
 * @param value 待判断的值
 * @returns 是否为假值
 */
function isFalse(value: any): boolean

/**
 * 将任意值转换为布尔值
 * @param value 待转换的值
 * @param defaultValue 无法识别时的默认值，默认 false
 * @returns 转换后的布尔值
 */
function toBool(value: any, defaultValue?: boolean): boolean

/**
 * 将布尔值转换为字符串
 * @param value 布尔值
 * @param format 输出格式，支持 '1/0', 'true/false', 'yes/no', 'on/off'
 * @returns 转换后的字符串
 */
function toBoolString(
  value: boolean,
  format?: '1/0' | 'true/false' | 'yes/no' | 'on/off'
): string

/**
 * 切换状态值
 * @param value 当前状态值
 * @returns 切换后的状态值（保持原格式）
 */
function toggleStatus(value: any): any
```

## 最佳实践

### 1. API 数据层统一转换

```typescript
// 在 API 响应拦截器中统一转换
const transformBooleanFields = (
  data: any,
  fields: string[]
) => {
  fields.forEach(field => {
    if (field in data) {
      data[field] = toBool(data[field])
    }
  })
  return data
}

// 使用
const user = transformBooleanFields(
  apiResponse.data,
  ['isVip', 'isActive', 'emailVerified']
)
```

### 2. 表单与 API 格式隔离

```typescript
// 表单始终使用原生布尔值
const form = reactive({
  enabled: true,
  visible: false
})

// 仅在提交时转换
const submitForm = async () => {
  const apiData = {
    enabled: toBoolString(form.enabled),
    visible: toBoolString(form.visible)
  }
  await api.save(apiData)
}
```

### 3. 状态显示文本

```typescript
const statusText = (value: any) => {
  return isTrue(value) ? '启用' : '禁用'
}

const vipText = (value: any) => {
  return isTrue(value) ? 'VIP会员' : '普通用户'
}
```

## 常见问题

### 1. isTrue 和 toBool 的区别？

- `isTrue`: 返回是否为真值（`boolean`）
- `toBool`: 将值转换为布尔值（带默认值支持）

```typescript
// 相同结果
isTrue('1')        // true
toBool('1')        // true

// 不同之处：默认值
isTrue('unknown')  // false
toBool('unknown', true) // true（使用默认值）
```

### 2. toggleStatus 保持原格式？

是的，`toggleStatus` 会保持输入值的格式：

```typescript
toggleStatus('1')     // '0'（字符串）
toggleStatus(true)    // false（布尔值）
toggleStatus('yes')   // 'no'（字符串）
```

### 3. 大小写敏感吗？

不敏感，会统一转为小写处理：

```typescript
isTrue('TRUE')  // true
isTrue('True')  // true
isTrue('true')  // true
```
