# boolean 布尔值工具

## 介绍

`boolean` 是布尔值处理工具模块，提供多种格式布尔值的判断、转换和状态切换功能。该工具支持字符串布尔值（如 `'true'`、`'1'`、`'yes'`）与原生布尔值之间的互转，特别适用于处理后端API返回的字符串状态值。

**核心特性:**

- **多格式支持** - 支持 `'1'/'0'`、`'true'/'false'`、`'yes'/'no'`、`'on'/'off'` 等多种格式
- **类型判断** - 精确判断值是否为真值或假值，处理各种边界情况
- **格式转换** - 布尔值与字符串的相互转换，输出标准化格式
- **状态切换** - 便捷的状态反转功能，自动保持输出格式一致
- **大小写不敏感** - 自动处理大小写差异，`'TRUE'`、`'True'`、`'true'` 均可识别
- **空值安全** - 正确处理 `null`、`undefined`、空字符串等边界值

## 架构设计

### 模块结构

```
┌─────────────────────────────────────────────────────────────────┐
│                     Boolean 工具模块架构                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      判断函数层                            │  │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐  │  │
│  │  │      isTrue()       │  │       isFalse()          │  │  │
│  │  │   判断是否为真值     │  │    判断是否为假值          │  │  │
│  │  │                     │  │                          │  │  │
│  │  │  输入: any          │  │  输入: any               │  │  │
│  │  │  输出: boolean      │  │  输出: boolean           │  │  │
│  │  └─────────────────────┘  └──────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      转换函数层                            │  │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐  │  │
│  │  │     toBool()        │  │    toBoolString()        │  │  │
│  │  │  转换为布尔值        │  │   转换为字符串('1'/'0')   │  │  │
│  │  │                     │  │                          │  │  │
│  │  │  输入: any          │  │  输入: any               │  │  │
│  │  │  输出: boolean      │  │  输出: '1' | '0'         │  │  │
│  │  └─────────────────────┘  └──────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      操作函数层                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │                 toggleStatus()                      │ │  │
│  │  │                切换状态值                             │ │  │
│  │  │                                                     │ │  │
│  │  │            输入: any → 输出: '1' | '0'              │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流转

```
值类型判断与转换流程：

输入值                           处理逻辑                    输出
──────────────────────────────────────────────────────────────────

                          ┌─────────────────┐
null / undefined ────────►│   返回 false    │──────► false
                          └─────────────────┘

                          ┌─────────────────┐
true / false ────────────►│   直接返回      │──────► true/false
                          └─────────────────┘

                          ┌─────────────────┐
1 / 0 ───────────────────►│   === 1 判断    │──────► true/false
                          └─────────────────┘

                          ┌─────────────────┐
'1'/'true'/'yes'/'on' ──►│  toLowerCase()  │──────► true
                          │  includes()     │
'0'/'false'/'no'/'off'──►│                 │──────► false
                          └─────────────────┘

                          ┌─────────────────┐
其他值 ──────────────────►│  默认 false     │──────► false
                          └─────────────────┘
```

### 真值/假值映射表

```
┌─────────────────────────────────────────────────────────────────┐
│                      真值/假值映射关系                           │
├────────────────────┬───────────────────┬───────────────────────┤
│      输入格式       │       真值        │        假值           │
├────────────────────┼───────────────────┼───────────────────────┤
│      boolean       │      true         │       false           │
│      number        │        1          │         0             │
│    数字字符串       │       '1'         │        '0'            │
│   布尔值字符串      │     'true'        │      'false'          │
│    是否字符串       │      'yes'        │        'no'           │
│    开关字符串       │      'on'         │       'off'           │
│      空值          │        -          │ null/undefined/''      │
├────────────────────┴───────────────────┴───────────────────────┤
│  注: 字符串比较不区分大小写，'TRUE'、'True'、'true' 等效        │
└─────────────────────────────────────────────────────────────────┘
```

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

// 数字类型
console.log(isTrue(1))       // true
console.log(isTrue(0))       // false

// 大小写不敏感
console.log(isTrue('TRUE'))  // true
console.log(isTrue('True'))  // true
console.log(isTrue('YES'))   // true

// 空值和其他情况
console.log(isTrue(null))      // false
console.log(isTrue(undefined)) // false
console.log(isTrue(''))        // false
console.log(isTrue('  '))      // false (空白字符串)
console.log(isTrue('hello'))   // false (无法识别的字符串)
```

**实现原理:**

```typescript
export const isTrue = (value: any): boolean => {
  // 处理 null 和 undefined
  if (value === null || value === undefined) {
    return false
  }

  // 处理布尔值
  if (typeof value === 'boolean') {
    return value
  }

  // 处理数字
  if (typeof value === 'number') {
    return value === 1
  }

  // 处理字符串（转换为小写进行比较）
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim()
    return ['1', 'true', 'yes', 'on'].includes(lowerValue)
  }

  return false
}
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
console.log(isFalse(0))       // true

// 空值也是假值
console.log(isFalse(null))      // true
console.log(isFalse(undefined)) // true
console.log(isFalse(''))        // true

// 大小写不敏感
console.log(isFalse('FALSE'))   // true
console.log(isFalse('No'))      // true
console.log(isFalse('OFF'))     // true

// 非假值
console.log(isFalse(true))    // false
console.log(isFalse('1'))     // false
console.log(isFalse('yes'))   // false
console.log(isFalse(1))       // false
```

**实现原理:**

```typescript
export const isFalse = (value: any): boolean => {
  // 处理 null、undefined 和空字符串
  if (value === null || value === undefined || value === '') {
    return true
  }

  // 处理布尔值
  if (typeof value === 'boolean') {
    return !value
  }

  // 处理数字
  if (typeof value === 'number') {
    return value === 0
  }

  // 处理字符串（转换为小写进行比较）
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim()
    return ['0', 'false', 'no', 'off'].includes(lowerValue)
  }

  return false
}
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

// 无法识别的值返回 false
console.log(toBool('maybe'))    // false
console.log(toBool('unknown'))  // false
console.log(toBool({}))         // false
```

**说明:**
- `toBool` 内部调用 `isTrue` 实现
- 无法识别的值统一返回 `false`
- 适合用于将 API 返回的字符串状态转换为前端布尔值

### toBoolString

将布尔值转换为字符串：

```typescript
import { toBoolString } from '@/utils/boolean'

// 布尔值转换
console.log(toBoolString(true))   // '1'
console.log(toBoolString(false))  // '0'

// 字符串布尔值转换
console.log(toBoolString('true'))  // '1'
console.log(toBoolString('false')) // '0'
console.log(toBoolString('yes'))   // '1'
console.log(toBoolString('no'))    // '0'

// 数字转换
console.log(toBoolString(1))  // '1'
console.log(toBoolString(0))  // '0'

// 空值转换
console.log(toBoolString(null))      // '0'
console.log(toBoolString(undefined)) // '0'
console.log(toBoolString(''))        // '0'
```

**说明:**
- 输出固定为 `'1'` 或 `'0'`
- 适合用于将前端布尔值转换为 API 需要的字符串格式
- 内部通过 `isTrue` 判断后返回对应字符串

### toggleStatus

切换状态值：

```typescript
import { toggleStatus } from '@/utils/boolean'

// 切换 '1'/'0'
console.log(toggleStatus('1'))  // '0'
console.log(toggleStatus('0'))  // '1'

// 切换 'true'/'false'
console.log(toggleStatus('true'))   // '0'
console.log(toggleStatus('false'))  // '1'

// 切换 'yes'/'no'
console.log(toggleStatus('yes'))  // '0'
console.log(toggleStatus('no'))   // '1'

// 切换布尔值
console.log(toggleStatus(true))   // '0'
console.log(toggleStatus(false))  // '1'

// 切换空值
console.log(toggleStatus(null))      // '1'
console.log(toggleStatus(undefined)) // '1'
```

**注意:**
- `toggleStatus` 输出固定为 `'1'` 或 `'0'` 字符串
- 不会保持原输入格式（与文档原描述不同，以源码为准）
- 适合用于状态切换场景，如启用/禁用切换

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
  emailVerified: 'yes' | 'no' // 邮箱验证状态
}

// 转换为前端友好的格式
interface User {
  id: string
  name: string
  status: boolean
  isVip: boolean
  emailVerified: boolean
}

// API 响应转换
const transformUser = (apiUser: UserFromApi): User => ({
  id: apiUser.id,
  name: apiUser.name,
  status: toBool(apiUser.status),
  isVip: toBool(apiUser.isVip),
  emailVerified: toBool(apiUser.emailVerified)
})

// 提交前转换回 API 格式
const prepareForApi = (user: User): UserFromApi => ({
  id: user.id,
  name: user.name,
  status: toBoolString(user.status) as '0' | '1',
  isVip: user.isVip ? 'true' : 'false',
  emailVerified: user.emailVerified ? 'yes' : 'no'
})

// 使用示例
const apiResponse = {
  id: '1',
  name: '张三',
  status: '1',
  isVip: 'true',
  emailVerified: 'yes'
}

const user = transformUser(apiResponse)
console.log(user.status)        // true
console.log(user.isVip)         // true
console.log(user.emailVerified) // true
```

### 表单开关控制

```vue
<template>
  <view class="settings-form">
    <wd-cell-group title="通知设置">
      <wd-cell title="消息通知">
        <template #right>
          <wd-switch v-model="form.enableNotify" />
        </template>
      </wd-cell>

      <wd-cell title="显示徽章">
        <template #right>
          <wd-switch v-model="form.showBadge" />
        </template>
      </wd-cell>

      <wd-cell title="自动更新">
        <template #right>
          <wd-switch v-model="form.autoUpdate" />
        </template>
      </wd-cell>
    </wd-cell-group>

    <wd-button block @click="saveConfig">保存设置</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from 'vue'
import { toBool, toBoolString } from '@/utils/boolean'

// 表单数据（前端使用布尔值）
const form = reactive({
  enableNotify: true,
  showBadge: false,
  autoUpdate: true
})

// 从服务器加载配置
const loadConfig = async () => {
  const config = await api.getConfig()

  // API 返回字符串格式，转换为布尔值
  form.enableNotify = toBool(config.enableNotify)
  form.showBadge = toBool(config.showBadge)
  form.autoUpdate = toBool(config.autoUpdate)
}

// 保存配置到服务器
const saveConfig = async () => {
  // 提交前转换为 API 需要的字符串格式
  await api.saveConfig({
    enableNotify: toBoolString(form.enableNotify),
    showBadge: toBoolString(form.showBadge),
    autoUpdate: toBoolString(form.autoUpdate)
  })

  uni.showToast({ title: '保存成功' })
}

onMounted(() => {
  loadConfig()
})
</script>
```

### 状态切换

```vue
<template>
  <view class="user-list">
    <wd-cell
      v-for="user in users"
      :key="user.id"
      :title="user.name"
    >
      <template #right>
        <wd-switch
          :model-value="isUserEnabled(user)"
          @change="() => toggleUserStatus(user)"
        />
      </template>
    </wd-cell>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { toggleStatus, isTrue } from '@/utils/boolean'

interface User {
  id: string
  name: string
  status: string // '0' 或 '1'
}

const users = ref<User[]>([
  { id: '1', name: '用户A', status: '1' },
  { id: '2', name: '用户B', status: '0' },
  { id: '3', name: '用户C', status: '1' },
])

// 判断用户是否启用
const isUserEnabled = (user: User) => isTrue(user.status)

// 切换用户状态
const toggleUserStatus = async (user: User) => {
  const newStatus = toggleStatus(user.status)

  // 调用 API 更新状态
  await api.updateUserStatus(user.id, newStatus)

  // 更新本地状态
  user.status = newStatus

  uni.showToast({
    title: isTrue(newStatus) ? '已启用' : '已禁用'
  })
}

// 批量启用/禁用
const batchToggle = async (userIds: string[], enable: boolean) => {
  const status = toBoolString(enable)

  await api.batchUpdateStatus(userIds, status)

  users.value.forEach(user => {
    if (userIds.includes(user.id)) {
      user.status = status
    }
  })
}
</script>
```

### 条件渲染

```vue
<template>
  <view class="user-card">
    <!-- VIP 徽章 -->
    <wd-badge v-if="showVipBadge" value="VIP" type="warning" />

    <!-- 用户名 -->
    <text class="username">{{ user.name }}</text>

    <!-- 状态标签 -->
    <wd-tag :type="statusTagType">
      {{ statusText }}
    </wd-tag>

    <!-- 认证图标 -->
    <wd-icon
      v-if="isVerified"
      name="check-circle"
      color="#52c41a"
    />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { isTrue } from '@/utils/boolean'

const props = defineProps<{
  user: {
    name: string
    isVip: string
    status: string
    verified: string
  }
}>()

// 是否显示 VIP 徽章
const showVipBadge = computed(() => isTrue(props.user.isVip))

// 用户是否启用
const isActive = computed(() => isTrue(props.user.status))

// 是否已认证
const isVerified = computed(() => isTrue(props.user.verified))

// 状态文本
const statusText = computed(() => isActive.value ? '启用' : '禁用')

// 状态标签类型
const statusTagType = computed(() => isActive.value ? 'success' : 'danger')
</script>

<style lang="scss" scoped>
.user-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
}

.username {
  flex: 1;
  font-size: 28rpx;
}
</style>
```

### 本地存储处理

```typescript
import { toBool, toBoolString } from '@/utils/boolean'

/**
 * 布尔值存储工具
 * 解决 Storage 只能存储字符串的问题
 */
class BooleanStorage {
  /**
   * 存储布尔值
   */
  static set(key: string, value: boolean): void {
    uni.setStorageSync(key, toBoolString(value))
  }

  /**
   * 读取布尔值
   */
  static get(key: string, defaultValue = false): boolean {
    const stored = uni.getStorageSync(key)
    return stored ? toBool(stored) : defaultValue
  }

  /**
   * 切换存储的布尔值
   */
  static toggle(key: string): boolean {
    const current = this.get(key)
    const newValue = !current
    this.set(key, newValue)
    return newValue
  }
}

// 使用示例
BooleanStorage.set('darkMode', true)
console.log(BooleanStorage.get('darkMode'))  // true

BooleanStorage.set('firstLaunch', false)
console.log(BooleanStorage.get('firstLaunch'))  // false

// 切换暗黑模式
const isDark = BooleanStorage.toggle('darkMode')
console.log(isDark)  // false
```

### 列表筛选

```vue
<template>
  <view class="filter-list">
    <wd-tabs v-model="activeTab">
      <wd-tab title="全部" name="all" />
      <wd-tab title="已启用" name="enabled" />
      <wd-tab title="已禁用" name="disabled" />
    </wd-tabs>

    <view class="list">
      <wd-cell
        v-for="item in filteredList"
        :key="item.id"
        :title="item.name"
        :label="getStatusLabel(item.status)"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isTrue, isFalse } from '@/utils/boolean'

interface ListItem {
  id: string
  name: string
  status: string
}

const activeTab = ref('all')

const list = ref<ListItem[]>([
  { id: '1', name: '项目A', status: '1' },
  { id: '2', name: '项目B', status: '0' },
  { id: '3', name: '项目C', status: 'true' },
  { id: '4', name: '项目D', status: 'false' },
])

// 根据筛选条件过滤列表
const filteredList = computed(() => {
  switch (activeTab.value) {
    case 'enabled':
      return list.value.filter(item => isTrue(item.status))
    case 'disabled':
      return list.value.filter(item => isFalse(item.status))
    default:
      return list.value
  }
})

// 获取状态标签
const getStatusLabel = (status: string) => {
  return isTrue(status) ? '已启用' : '已禁用'
}
</script>
```

## API

### 函数列表

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `isTrue` | 判断是否为真值 | `(value: any)` | `boolean` |
| `isFalse` | 判断是否为假值 | `(value: any)` | `boolean` |
| `toBool` | 转换为布尔值 | `(value: any)` | `boolean` |
| `toBoolString` | 转换为字符串 | `(value: any)` | `'1' \| '0'` |
| `toggleStatus` | 切换状态值 | `(value: any)` | `'1' \| '0'` |

### 支持的真值格式

| 格式 | 真值 | 假值 |
|------|------|------|
| 布尔值 | `true` | `false` |
| 数字 | `1` | `0` |
| 数字字符串 | `'1'` | `'0'` |
| 布尔字符串 | `'true'` / `'TRUE'` | `'false'` / `'FALSE'` |
| 是否字符串 | `'yes'` / `'YES'` | `'no'` / `'NO'` |
| 开关字符串 | `'on'` / `'ON'` | `'off'` / `'OFF'` |
| 空值 | - | `null` / `undefined` / `''` |

### 类型定义

```typescript
/**
 * 判断值是否为真值
 * 支持多种真值表示形式：'1', 'true', 'yes', 'on', true, 1 等
 *
 * @param value 待判断的值
 * @returns 是否为真值
 */
export function isTrue(value: any): boolean

/**
 * 判断值是否为假值
 * 支持多种假值表示形式：'0', 'false', 'no', 'off', false, 0, null, undefined, '' 等
 *
 * @param value 待判断的值
 * @returns 是否为假值
 */
export function isFalse(value: any): boolean

/**
 * 将各种形式的布尔值转换为标准的 boolean 类型
 *
 * @param value 待转换的值
 * @returns 转换后的布尔值
 */
export function toBool(value: any): boolean

/**
 * 将各种形式的布尔值转换为标准的 '1' 或 '0' 字符串
 *
 * @param value 待转换的值
 * @returns '1' 表示真值，'0' 表示假值
 */
export function toBoolString(value: any): '1' | '0'

/**
 * 切换布尔值状态
 * 支持多种输入格式，输出标准的 '1'/'0' 字符串
 *
 * @param value 当前状态值
 * @returns 切换后的状态字符串 ('1' 或 '0')
 */
export function toggleStatus(value: any): '1' | '0'
```

## 最佳实践

### 1. API 数据层统一转换

```typescript
import { toBool } from '@/utils/boolean'

/**
 * 批量转换布尔字段
 * 在 API 响应拦截器中使用
 */
const transformBooleanFields = <T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): T => {
  const result = { ...data }
  fields.forEach(field => {
    if (field in result) {
      result[field] = toBool(result[field]) as any
    }
  })
  return result
}

// 在 API 服务中使用
const getUser = async (id: string) => {
  const response = await http.get(`/user/${id}`)

  return transformBooleanFields(response.data, [
    'isVip',
    'isActive',
    'emailVerified',
    'phoneVerified'
  ])
}
```

### 2. 表单与 API 格式隔离

```typescript
import { toBool, toBoolString } from '@/utils/boolean'

// 定义表单类型（使用布尔值）
interface FormData {
  enabled: boolean
  visible: boolean
  required: boolean
}

// 定义 API 类型（使用字符串）
interface ApiData {
  enabled: '0' | '1'
  visible: '0' | '1'
  required: '0' | '1'
}

// 表单始终使用原生布尔值
const form = reactive<FormData>({
  enabled: true,
  visible: false,
  required: true
})

// 从 API 加载时转换
const loadFromApi = (apiData: ApiData) => {
  form.enabled = toBool(apiData.enabled)
  form.visible = toBool(apiData.visible)
  form.required = toBool(apiData.required)
}

// 提交到 API 时转换
const prepareForApi = (): ApiData => ({
  enabled: toBoolString(form.enabled) as '0' | '1',
  visible: toBoolString(form.visible) as '0' | '1',
  required: toBoolString(form.required) as '0' | '1'
})
```

### 3. 状态显示文本映射

```typescript
import { isTrue } from '@/utils/boolean'

// 通用状态文本
const statusText = (value: any): string => {
  return isTrue(value) ? '启用' : '禁用'
}

// VIP 状态文本
const vipText = (value: any): string => {
  return isTrue(value) ? 'VIP会员' : '普通用户'
}

// 认证状态文本
const verifiedText = (value: any): string => {
  return isTrue(value) ? '已认证' : '未认证'
}

// 开关状态文本
const switchText = (value: any): string => {
  return isTrue(value) ? '开启' : '关闭'
}

// 是否文本
const yesNoText = (value: any): string => {
  return isTrue(value) ? '是' : '否'
}

// 使用示例
console.log(statusText('1'))      // '启用'
console.log(vipText('true'))      // 'VIP会员'
console.log(verifiedText('yes'))  // '已认证'
```

### 4. 条件类名生成

```typescript
import { isTrue } from '@/utils/boolean'

// 状态类名
const statusClass = (status: any) => ({
  'status-active': isTrue(status),
  'status-inactive': !isTrue(status)
})

// 可见性类名
const visibilityClass = (visible: any) => ({
  'is-visible': isTrue(visible),
  'is-hidden': !isTrue(visible)
})

// 使用
const user = { status: '1', visible: 'true' }
console.log(statusClass(user.status))      // { 'status-active': true, 'status-inactive': false }
console.log(visibilityClass(user.visible)) // { 'is-visible': true, 'is-hidden': false }
```

### 5. 防御性编程

```typescript
import { toBool } from '@/utils/boolean'

// 安全获取配置项
const getConfig = (config: any, key: string, defaultValue = false): boolean => {
  if (!config || typeof config !== 'object') {
    return defaultValue
  }
  return toBool(config[key] ?? defaultValue)
}

// 使用
const config = { enableFeature: '1', showTips: null }
console.log(getConfig(config, 'enableFeature'))     // true
console.log(getConfig(config, 'showTips'))          // false
console.log(getConfig(config, 'nonExistent'))       // false
console.log(getConfig(config, 'nonExistent', true)) // true
console.log(getConfig(null, 'any'))                 // false
```

## 常见问题

### 1. isTrue 和 toBool 的区别？

两者功能相同，`toBool` 内部直接调用 `isTrue`：

```typescript
// 源码实现
export const toBool = (value: any): boolean => {
  return isTrue(value)
}
```

**使用建议:**
- `isTrue`: 语义上表示"判断"，用于条件判断场景
- `toBool`: 语义上表示"转换"，用于类型转换场景

```typescript
// 条件判断 - 使用 isTrue 更清晰
if (isTrue(user.isVip)) {
  showVipContent()
}

// 类型转换 - 使用 toBool 更清晰
const formData = {
  enabled: toBool(apiData.enabled)
}
```

### 2. toggleStatus 返回什么格式？

`toggleStatus` 固定返回 `'1'` 或 `'0'` 字符串：

```typescript
toggleStatus('1')      // '0' (字符串)
toggleStatus(true)     // '0' (字符串)
toggleStatus('yes')    // '0' (字符串)
toggleStatus('on')     // '0' (字符串)

// 不会保持原格式
toggleStatus('true')   // '0' 而不是 'false'
toggleStatus('yes')    // '0' 而不是 'no'
```

### 3. 大小写敏感吗？

不敏感，会统一转为小写处理：

```typescript
isTrue('TRUE')  // true
isTrue('True')  // true
isTrue('true')  // true
isTrue('tRuE')  // true

isFalse('FALSE')  // true
isFalse('False')  // true
isFalse('false')  // true
```

### 4. 空白字符串如何处理？

会进行 `trim()` 处理后再判断：

```typescript
isTrue('  1  ')     // true
isTrue(' true ')    // true
isTrue('   ')       // false (trim 后为空字符串)
isTrue('')          // false
```

### 5. 数组和对象如何处理？

数组和对象不在识别范围内，统一返回 `false`：

```typescript
isTrue([])          // false
isTrue([1])         // false
isTrue({})          // false
isTrue({ a: 1 })    // false
```

### 6. 如何扩展支持更多格式？

可以创建自定义函数扩展：

```typescript
import { isTrue as basIsTrue } from '@/utils/boolean'

// 扩展支持中文
const isTrue = (value: any): boolean => {
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim()
    if (['是', '对', '真', '启用', '开启'].includes(lower)) {
      return true
    }
  }
  return basIsTrue(value)
}

// 使用
console.log(isTrue('是'))    // true
console.log(isTrue('启用'))  // true
```

### 7. 与 JavaScript 原生布尔转换的区别？

JavaScript 原生 `Boolean()` 和 `!!` 转换规则不同：

```typescript
// 原生转换（基于 JavaScript truthy/falsy 规则）
Boolean('false')  // true (非空字符串都是 truthy)
Boolean('0')      // true
!!'false'         // true
!!'0'             // true

// boolean 工具转换（基于语义判断）
toBool('false')   // false
toBool('0')       // false
```

**选择建议:**
- 需要语义判断（如 API 字符串状态）：使用 `boolean` 工具
- 简单的真假判断：使用原生转换

### 8. 性能考虑？

`boolean` 工具函数都是同步操作，性能开销极小：

```typescript
// 性能测试
const start = performance.now()
for (let i = 0; i < 100000; i++) {
  isTrue('1')
  toBool('true')
  toBoolString(true)
  toggleStatus('0')
}
const end = performance.now()
console.log(`100000 次调用耗时: ${end - start}ms`) // 通常 < 50ms
```

对于大量数据处理，可以考虑批量转换：

```typescript
// 批量转换
const convertBatch = (items: any[], key: string) => {
  return items.map(item => ({
    ...item,
    [key]: toBool(item[key])
  }))
}
```
