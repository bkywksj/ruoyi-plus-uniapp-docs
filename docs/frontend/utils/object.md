# 对象工具 (object.ts)

对象工具函数集合，提供全面的对象处理功能。该模块是 Plus-UI 管理系统的核心工具库之一，涵盖对象基本操作、属性访问、筛选、数组操作、URL处理和键名转换等功能，为前端开发提供便捷高效的对象处理能力。

## 功能特性

- **对象基本操作** - 检查、比较、合并、克隆等基础功能
- **对象属性访问** - 安全获取和设置嵌套属性，避免空指针异常
- **对象属性筛选** - 选取、排除或清理对象属性
- **数组操作** - 清理、去重、分组等数组工具函数
- **URL与查询字符串** - 查询字符串和对象互相转换
- **对象键名转换** - 驼峰与蛇形命名格式互转
- **类型安全** - 完整的 TypeScript 类型定义

## 模块概览

对象工具库按功能分为六大类别：

```
┌─────────────────────────────────────────────────────────────────┐
│                    对象工具 (object.ts)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │   对象基本操作       │  │   对象属性访问       │              │
│  │ isEmptyObject       │  │ getPropertyByPath   │              │
│  │ shallowEqual        │  │ get                 │              │
│  │ objectMerge         │  │ set                 │              │
│  │ deepClone           │  │                     │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │   对象属性筛选       │  │   数组操作          │              │
│  │ pick                │  │ cleanArray          │              │
│  │ omit                │  │ uniqueArr           │              │
│  │ removeEmpty         │  │ groupBy             │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │   URL与查询字符串    │  │   对象键名转换       │              │
│  │ queryToObject       │  │ camelizeKeys        │              │
│  │ objectToQuery       │  │ snakeizeKeys        │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 对象基本操作

### isEmptyObject

检查对象是否为空（无属性）。

**函数签名：**

```typescript
function isEmptyObject(obj: Record<string, any>): boolean
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `obj` | `Record<string, any>` | 要检查的对象 |

**返回值：**

- `boolean` - 如果对象为空则返回 `true`

**实现原理：**

```typescript
export const isEmptyObject = (obj: Record<string, any>): boolean => {
  // 处理非对象类型和数组
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return true
  }
  // 通过 Object.keys 检查属性数量
  return Object.keys(obj).length === 0
}
```

**使用示例：**

```typescript
import { isEmptyObject } from '@/utils/object'

// 空对象检查
isEmptyObject({})                    // true
isEmptyObject({ a: 1 })              // false

// 特殊值处理
isEmptyObject(null)                  // true
isEmptyObject(undefined)             // true

// 数组被视为空
isEmptyObject([])                    // true
isEmptyObject([1, 2, 3])             // true

// 实际应用：检查表单数据是否有值
const formData = { name: '', email: '' }
if (isEmptyObject(removeEmpty(formData))) {
  console.log('表单为空')
}
```

**使用场景：**

1. 检查 API 返回的数据是否有效
2. 验证表单数据是否为空
3. 条件渲染判断
4. 数据清理前的检查

### shallowEqual

比较两个对象是否相等（浅比较）。只比较对象的直接属性，不递归比较嵌套对象。

**函数签名：**

```typescript
function shallowEqual(obj1: any, obj2: any): boolean
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `obj1` | `any` | 第一个对象 |
| `obj2` | `any` | 第二个对象 |

**返回值：**

- `boolean` - 如果对象相等则返回 `true`

**实现原理：**

```typescript
export const shallowEqual = (obj1: any, obj2: any): boolean => {
  // 相同引用直接返回 true
  if (obj1 === obj2) {
    return true
  }

  // 类型检查
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' ||
      obj1 === null || obj2 === null) {
    return false
  }

  // 属性数量比较
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) {
    return false
  }

  // 逐个属性比较
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}
```

**使用示例：**

```typescript
import { shallowEqual } from '@/utils/object'

// 基本对象比较
shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })         // true
shallowEqual({ a: 1, b: 2 }, { a: 1, b: 3 })         // false

// 相同引用
const obj = { a: 1 }
shallowEqual(obj, obj)                                // true

// 嵌套对象（浅比较，不递归）
shallowEqual(
  { a: 1, b: { c: 2 } },
  { a: 1, b: { c: 2 } }
)                                                     // false（嵌套对象引用不同）

// 属性数量不同
shallowEqual({ a: 1 }, { a: 1, b: 2 })               // false

// 实际应用：React/Vue 优化渲染
const prevProps = { count: 1, name: 'test' }
const nextProps = { count: 1, name: 'test' }
if (!shallowEqual(prevProps, nextProps)) {
  // 需要重新渲染
}
```

**使用场景：**

1. 性能优化中的 props 比较
2. 表单脏检查
3. 缓存命中判断
4. 状态变更检测

### objectMerge

合并两个对象，后者优先。会深度合并对象的属性。

**函数签名：**

```typescript
function objectMerge<T>(target: T, source: any): T
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `target` | `T` | 目标对象 |
| `source` | `any` | 源对象或数组 |

**返回值：**

- `T` - 合并后的对象

**实现原理：**

```typescript
export const objectMerge = <T>(target: T, source: any): T => {
  if (typeof target !== 'object') {
    target = {} as T
  }
  // 数组直接返回拷贝
  if (Array.isArray(source)) {
    return source.slice() as unknown as T
  }
  // 深度合并对象
  Object.keys(source).forEach((property) => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object' && sourceProperty !== null) {
      target[property as keyof T] = objectMerge(
        target[property as keyof T] || ({} as any),
        sourceProperty
      )
    } else {
      target[property as keyof T] = sourceProperty
    }
  })
  return target
}
```

**使用示例：**

```typescript
import { objectMerge } from '@/utils/object'

// 基本合并
const target = { a: 1, b: 2 }
const source = { b: 3, c: 4 }
objectMerge(target, source)              // { a: 1, b: 3, c: 4 }

// 深度合并
const config = {
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000
  },
  features: {
    cache: true
  }
}

const overrides = {
  api: {
    timeout: 10000,
    retries: 3
  }
}

const result = objectMerge(config, overrides)
// {
//   api: {
//     baseUrl: 'https://api.example.com',
//     timeout: 10000,
//     retries: 3
//   },
//   features: {
//     cache: true
//   }
// }

// 实际应用：合并默认配置
const defaultSettings = {
  theme: 'light',
  language: 'zh-CN',
  sidebar: { collapsed: false, width: 200 }
}

const userSettings = {
  theme: 'dark',
  sidebar: { collapsed: true }
}

const settings = objectMerge(defaultSettings, userSettings)
// { theme: 'dark', language: 'zh-CN', sidebar: { collapsed: true, width: 200 } }
```

**使用场景：**

1. 合并配置对象
2. 组件 props 默认值合并
3. 状态更新
4. 多来源数据整合

### deepClone

深拷贝对象。创建一个与原对象完全独立的副本。

**函数签名：**

```typescript
function deepClone<T>(source: T): T
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `source` | `T` | 源对象 |

**返回值：**

- `T` - 拷贝后的对象

**实现原理：**

```typescript
export const deepClone = <T>(source: T): T => {
  if (!source || typeof source !== 'object') {
    throw new Error('deepClone: 参数错误')
  }

  // 处理数组
  if (Array.isArray(source)) {
    return source.map((item) => {
      return typeof item === 'object' && item !== null
        ? deepClone(item)
        : item
    }) as unknown as T
  }

  // 处理对象
  const targetObj = {} as T
  Object.keys(source as object).forEach((key) => {
    const value = source[key as keyof T]
    if (value && typeof value === 'object') {
      targetObj[key as keyof T] = deepClone(value)
    } else {
      targetObj[key as keyof T] = value
    }
  })

  return targetObj
}
```

**使用示例：**

```typescript
import { deepClone } from '@/utils/object'

// 基本用法
const original = { a: 1, b: { c: 2, d: [1, 2, 3] } }
const copy = deepClone(original)

// 修改副本不影响原对象
copy.b.c = 100
copy.b.d.push(4)
console.log(original.b.c)              // 2（未受影响）
console.log(original.b.d)              // [1, 2, 3]（未受影响）

// 数组深拷贝
const arr = [{ id: 1 }, { id: 2 }]
const arrCopy = deepClone(arr)
arrCopy[0].id = 100
console.log(arr[0].id)                 // 1（未受影响）

// 实际应用：表单数据备份
const formData = {
  user: { name: 'John', age: 25 },
  settings: { theme: 'dark' }
}
const backup = deepClone(formData)

// 用户修改后可以恢复
formData.user.name = 'Jane'
// 恢复
Object.assign(formData, deepClone(backup))
```

**注意事项：**

```typescript
// ⚠️ 此函数的限制

// 1. 不能处理循环引用
const obj = { a: 1 }
obj.self = obj  // 循环引用
// deepClone(obj)  // 会报错或无限递归

// 2. 不能正确处理特殊对象
const date = { date: new Date() }
const dateCopy = deepClone(date)
// dateCopy.date 不再是 Date 对象

// 3. 不能处理函数
const withFn = { fn: () => {} }
// deepClone(withFn)  // fn 会丢失

// 如需完美深拷贝，请使用 lodash 的 _.cloneDeep
import { cloneDeep } from 'lodash-es'
```

**使用场景：**

1. 状态快照备份
2. 表单初始值保存
3. 避免直接修改原始数据
4. 撤销/重做功能实现

## 对象属性访问

### getPropertyByPath

获取对象的指定属性路径的值，支持通过点表示法访问嵌套属性。

**函数签名：**

```typescript
function getPropertyByPath(
  obj: Record<string, any>,
  path: string,
  defaultValue?: any
): any
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `obj` | `Record<string, any>` | 源对象 |
| `path` | `string` | 属性路径，如 `'user.profile.name'` |
| `defaultValue` | `any` | 如果路径不存在，返回的默认值 |

**返回值：**

- `any` - 属性值或默认值

**实现原理：**

```typescript
export const getPropertyByPath = (
  obj: Record<string, any>,
  path: string,
  defaultValue?: any
): any => {
  if (!obj || !path) {
    return defaultValue
  }

  // 按点分割路径
  const keys = path.split('.')
  let current = obj

  // 逐层访问
  for (const key of keys) {
    if (current === null || current === undefined ||
        typeof current !== 'object') {
      return defaultValue
    }
    current = current[key]
  }

  return current === undefined ? defaultValue : current
}
```

**使用示例：**

```typescript
import { getPropertyByPath } from '@/utils/object'

const user = {
  profile: {
    name: 'John',
    contact: {
      email: 'john@example.com',
      phone: '123-456-7890'
    }
  },
  settings: {
    theme: 'dark'
  }
}

// 获取嵌套属性
getPropertyByPath(user, 'profile.name')                    // 'John'
getPropertyByPath(user, 'profile.contact.email')           // 'john@example.com'
getPropertyByPath(user, 'settings.theme')                  // 'dark'

// 使用默认值
getPropertyByPath(user, 'profile.age', 0)                  // 0
getPropertyByPath(user, 'profile.contact.address', 'N/A')  // 'N/A'
getPropertyByPath(user, 'nonexistent.path', 'default')     // 'default'

// 实际应用：安全地访问 API 响应数据
const apiResponse = {
  data: {
    result: {
      items: [{ id: 1, name: 'Item 1' }]
    }
  }
}

const items = getPropertyByPath(apiResponse, 'data.result.items', [])
console.log(items)  // [{ id: 1, name: 'Item 1' }]
```

### get

安全地获取对象的嵌套属性，避免空指针异常。支持数组索引语法。

**函数签名：**

```typescript
function get(object: any, path: string | string[], defaultValue?: any): any
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `object` | `any` | 源对象 |
| `path` | `string \| string[]` | 属性路径，支持数组索引 |
| `defaultValue` | `any` | 默认值 |

**返回值：**

- `any` - 属性值或默认值

**实现原理：**

```typescript
export const get = (object: any, path: string | string[], defaultValue?: any): any => {
  // 支持字符串路径和数组路径
  // 将 'users[0].name' 转换为 ['users', '0', 'name']
  const keys = Array.isArray(path)
    ? path
    : path.replace(/\[(\d+)\]/g, '.$1').split('.')

  let result = object

  for (const key of keys) {
    result = result?.[key]
    if (result === undefined) return defaultValue
  }

  return result
}
```

**使用示例：**

```typescript
import { get } from '@/utils/object'

const data = {
  users: [
    {
      name: 'John',
      roles: ['admin', 'user'],
      address: { city: 'New York' }
    },
    {
      name: 'Jane',
      roles: ['user']
    }
  ],
  config: {
    features: {
      darkMode: true
    }
  }
}

// 点表示法
get(data, 'config.features.darkMode')                  // true

// 数组索引语法
get(data, 'users[0].name')                             // 'John'
get(data, 'users[0].roles[0]')                         // 'admin'
get(data, 'users[1].address.city', 'Unknown')          // 'Unknown'

// 数组形式的路径
get(data, ['users', '0', 'name'])                      // 'John'
get(data, ['config', 'features', 'darkMode'])          // true

// 实际应用：安全地渲染数据
const renderUserInfo = (response: any) => {
  const userName = get(response, 'data.user.profile.name', '匿名用户')
  const avatar = get(response, 'data.user.profile.avatar', '/default-avatar.png')

  return `
    <div class="user-info">
      <img src="${avatar}" alt="${userName}" />
      <span>${userName}</span>
    </div>
  `
}
```

**与 getPropertyByPath 的区别：**

| 特性 | get | getPropertyByPath |
|------|-----|-------------------|
| 数组索引语法 | ✅ 支持 `users[0].name` | ❌ 不支持 |
| 数组形式路径 | ✅ 支持 `['a', 'b']` | ❌ 不支持 |
| 可选链式访问 | ✅ 内置 `?.` 行为 | ✅ 手动检查 |

### set

设置对象的嵌套属性值，自动创建中间对象或数组。

**函数签名：**

```typescript
function set<T extends Record<string, any>>(
  object: T,
  path: string | string[],
  value: any
): T
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `object` | `T` | 源对象 |
| `path` | `string \| string[]` | 属性路径 |
| `value` | `any` | 要设置的值 |

**返回值：**

- `T` - 修改后的对象

**实现原理：**

```typescript
export const set = <T extends Record<string, any>>(
  object: T,
  path: string | string[],
  value: any
): T => {
  if (!object || typeof object !== 'object') return object

  const keys = Array.isArray(path)
    ? path
    : path.replace(/\[(\d+)\]/g, '.$1').split('.')

  let current: any = object

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    // 根据下一个键是否为数字决定创建数组还是对象
    if (/^\d+$/.test(key) && Array.isArray(current)) {
      const index = parseInt(key)
      current[index] = current[index] || (/^\d+$/.test(keys[i + 1]) ? [] : {})
      current = current[index]
    } else {
      current[key] = current[key] || (/^\d+$/.test(keys[i + 1]) ? [] : {})
      current = current[key]
    }
  }

  // 设置最终值
  const lastKey = keys[keys.length - 1]
  current[lastKey] = value

  return object
}
```

**使用示例：**

```typescript
import { set } from '@/utils/object'

// 创建嵌套结构
const obj = {}
set(obj, 'user.profile.name', 'John')
// { user: { profile: { name: 'John' } } }

// 设置数组元素
set(obj, 'users[0].name', 'Jane')
// { user: {...}, users: [{ name: 'Jane' }] }

// 修改已有属性
const config = { api: { timeout: 5000 } }
set(config, 'api.timeout', 10000)
// { api: { timeout: 10000 } }

// 数组形式路径
set({}, ['settings', 'theme', 'color'], '#409EFF')
// { settings: { theme: { color: '#409EFF' } } }

// 实际应用：动态表单数据绑定
const formData = {}

const handleInput = (path: string, value: any) => {
  set(formData, path, value)
}

// 组件中使用
handleInput('user.name', 'John')
handleInput('user.contacts[0].phone', '123-456-7890')
handleInput('user.contacts[1].phone', '098-765-4321')

console.log(formData)
// {
//   user: {
//     name: 'John',
//     contacts: [
//       { phone: '123-456-7890' },
//       { phone: '098-765-4321' }
//     ]
//   }
// }
```

**使用场景：**

1. 动态表单数据绑定
2. 配置项动态设置
3. 深层对象结构初始化
4. 数据转换处理

## 对象属性筛选

### pick

从对象中拾取指定属性，创建一个只包含这些属性的新对象。

**函数签名：**

```typescript
function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K>
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `obj` | `T` | 源对象 |
| `keys` | `K[]` | 要拾取的属性数组 |

**返回值：**

- `Pick<T, K>` - 只包含指定属性的新对象

**实现原理：**

```typescript
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }

  return result
}
```

**使用示例：**

```typescript
import { pick } from '@/utils/object'

const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  password: 'secret123',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15'
}

// 提取公开信息
const publicInfo = pick(user, ['id', 'name', 'email'])
// { id: 1, name: 'John', email: 'john@example.com' }

// 提取用于显示的字段
const displayData = pick(user, ['name', 'createdAt'])
// { name: 'John', createdAt: '2024-01-01' }

// 实际应用：API 请求数据筛选
const submitData = (formData: UserFormData) => {
  // 只发送需要的字段
  const payload = pick(formData, ['name', 'email', 'phone'])
  return api.updateUser(payload)
}

// 实际应用：组件 props 筛选
const buttonProps = { type: 'primary', size: 'large', onClick: () => {} }
const elButtonProps = pick(buttonProps, ['type', 'size'])
```

### omit

从对象中省略指定属性，创建一个不包含这些属性的新对象。

**函数签名：**

```typescript
function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K>
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `obj` | `T` | 源对象 |
| `keys` | `K[]` | 要省略的属性数组 |

**返回值：**

- `Omit<T, K>` - 不包含指定属性的新对象

**实现原理：**

```typescript
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }

  for (const key of keys) {
    delete result[key]
  }

  return result as Omit<T, K>
}
```

**使用示例：**

```typescript
import { omit } from '@/utils/object'

const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  password: 'secret123',
  internalFlag: true
}

// 移除敏感信息
const safeUser = omit(user, ['password', 'internalFlag'])
// { id: 1, name: 'John', email: 'john@example.com' }

// 实际应用：日志记录时移除敏感数据
const logRequest = (data: RequestData) => {
  const safeData = omit(data, ['password', 'token', 'apiKey'])
  console.log('Request:', safeData)
}

// 实际应用：传递 props 时移除内部属性
const MyComponent = defineComponent({
  props: ['type', 'size', 'internalId', 'debugMode'],
  setup(props) {
    // 传给子组件时移除内部属性
    const childProps = omit(props, ['internalId', 'debugMode'])
    return () => h(ChildComponent, childProps)
  }
})
```

**pick 与 omit 的选择：**

```typescript
// 当需要保留的属性较少时，使用 pick
pick(user, ['name', 'email'])  // 更清晰

// 当需要移除的属性较少时，使用 omit
omit(user, ['password'])       // 更清晰

// 它们是互补的操作
const keys = ['a', 'b']
// pick(obj, keys) 等价于 omit(obj, Object.keys(obj).filter(k => !keys.includes(k)))
```

### removeEmpty

移除对象中的空值属性（null、undefined、空字符串等）。

**函数签名：**

```typescript
function removeEmpty<T extends Record<string, any>>(
  object: T,
  options?: {
    deep?: boolean
    emptyValues?: any[]
  }
): T
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `object` | `T` | 要处理的对象 |
| `options.deep` | `boolean` | 是否深度清理，默认 `false` |
| `options.emptyValues` | `any[]` | 被视为空的值列表，默认 `[null, undefined, '']` |

**返回值：**

- `T` - 清理后的对象

**实现原理：**

```typescript
export const removeEmpty = <T extends Record<string, any>>(
  object: T,
  options: { deep?: boolean; emptyValues?: any[] } = {}
): T => {
  const { deep = false, emptyValues = [null, undefined, ''] } = options
  if (!object || typeof object !== 'object') return object

  const result = { ...object }
  for (const key in result) {
    const value = result[key]
    // 检查是否为空值
    if (emptyValues.includes(value)) {
      delete result[key]
    }
    // 深度处理嵌套对象
    else if (deep && typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        result[key] = value.map((item) =>
          typeof item === 'object' && item !== null
            ? removeEmpty(item, options)
            : item
        )
      } else {
        result[key] = removeEmpty(value, options)
        // 如果处理后对象为空，移除该属性
        if (isEmptyObject(result[key])) {
          delete result[key]
        }
      }
    }
  }

  return result
}
```

**使用示例：**

```typescript
import { removeEmpty } from '@/utils/object'

// 基本用法
const data = { a: 1, b: null, c: '', d: undefined, e: 'hello' }
removeEmpty(data)
// { a: 1, e: 'hello' }

// 深度清理
const nested = {
  user: {
    name: 'John',
    nickname: '',
    profile: {
      bio: null,
      website: 'https://example.com'
    }
  },
  settings: null
}
removeEmpty(nested, { deep: true })
// { user: { name: 'John', profile: { website: 'https://example.com' } } }

// 自定义空值
const customData = { a: 1, b: 0, c: false, d: [], e: {} }
removeEmpty(customData, { emptyValues: [0, false, null, undefined, ''] })
// { a: 1, d: [], e: {} }

// 实际应用：清理表单数据再提交
const formData = {
  username: 'john',
  nickname: '',
  bio: null,
  age: 0,
  preferences: {
    theme: 'dark',
    language: '',
    notifications: null
  }
}

const cleanedData = removeEmpty(formData, {
  deep: true,
  emptyValues: [null, undefined, '']
})
// { username: 'john', age: 0, preferences: { theme: 'dark' } }
```

**使用场景：**

1. 表单数据清理
2. API 请求参数过滤
3. 数据存储优化
4. 日志数据简化

## 数组操作

### cleanArray

清理数组中的假值（falsy values）。

**函数签名：**

```typescript
function cleanArray<T>(actual: T[]): T[]
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `actual` | `T[]` | 原始数组 |

**返回值：**

- `T[]` - 清理后的数组

**实现原理：**

```typescript
export const cleanArray = <T>(actual: T[]): T[] => {
  return actual.filter((item) => !!item)
}
```

**使用示例：**

```typescript
import { cleanArray } from '@/utils/object'

// 清理假值
cleanArray([0, 1, false, 2, '', 3, null, undefined])
// [1, 2, 3]

// 清理字符串数组中的空字符串
cleanArray(['a', '', 'b', '', 'c'])
// ['a', 'b', 'c']

// 实际应用：处理可选参数
const buildUrl = (base: string, ...paths: (string | undefined)[]) => {
  return [base, ...cleanArray(paths)].join('/')
}

buildUrl('/api', 'users', undefined, '123', '')
// '/api/users/123'

// 实际应用：CSS 类名拼接
const classNames = cleanArray([
  'btn',
  isActive && 'btn-active',
  isDisabled && 'btn-disabled',
  size && `btn-${size}`
])
// 只包含有效的类名
```

**注意事项：**

```typescript
// ⚠️ 此函数会移除所有假值，包括 0 和 false
cleanArray([0, 1, 2])          // [1, 2] - 0 被移除了
cleanArray([false, true])      // [true] - false 被移除了

// 如果需要保留 0 或 false，使用自定义过滤
[0, 1, null, 2].filter(item => item !== null && item !== undefined)
// [0, 1, 2]
```

### uniqueArr

数组去重，返回只包含唯一值的新数组。

**函数签名：**

```typescript
function uniqueArr<T>(arr: T[]): T[]
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `arr` | `T[]` | 原始数组 |

**返回值：**

- `T[]` - 去重后的数组

**实现原理：**

```typescript
export const uniqueArr = <T>(arr: T[]): T[] => {
  return Array.from(new Set(arr))
}
```

**使用示例：**

```typescript
import { uniqueArr } from '@/utils/object'

// 基本用法
uniqueArr([1, 2, 2, 3, 3, 4])           // [1, 2, 3, 4]
uniqueArr(['a', 'b', 'a', 'c', 'b'])    // ['a', 'b', 'c']

// 实际应用：合并并去重标签
const tags1 = ['vue', 'react', 'angular']
const tags2 = ['react', 'svelte', 'vue']
const allTags = uniqueArr([...tags1, ...tags2])
// ['vue', 'react', 'angular', 'svelte']

// 实际应用：收集唯一的用户 ID
const comments = [
  { userId: 1, text: 'Hello' },
  { userId: 2, text: 'World' },
  { userId: 1, text: 'Again' }
]
const uniqueUserIds = uniqueArr(comments.map(c => c.userId))
// [1, 2]
```

**注意事项：**

```typescript
// ⚠️ 对于对象数组，Set 比较的是引用
const arr = [{ id: 1 }, { id: 1 }]
uniqueArr(arr)  // [{ id: 1 }, { id: 1 }] - 两个对象引用不同

// 对象去重需要自定义逻辑
const uniqueById = <T extends { id: number }>(arr: T[]): T[] => {
  const seen = new Set()
  return arr.filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}
```

### groupBy

将对象数组按指定键值分组。

**函数签名：**

```typescript
function groupBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]>
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `array` | `T[]` | 对象数组 |
| `key` | `keyof T \| ((item: T) => string)` | 分组依据的属性名或函数 |

**返回值：**

- `Record<string, T[]>` - 分组后的对象

**实现原理：**

```typescript
export const groupBy = <T extends Record<string, any>>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> => {
  const result: Record<string, T[]> = {}

  array.forEach((item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key])
    result[groupKey] = result[groupKey] || []
    result[groupKey].push(item)
  })

  return result
}
```

**使用示例：**

```typescript
import { groupBy } from '@/utils/object'

const orders = [
  { id: 1, status: 'pending', amount: 100 },
  { id: 2, status: 'completed', amount: 200 },
  { id: 3, status: 'pending', amount: 150 },
  { id: 4, status: 'cancelled', amount: 50 },
  { id: 5, status: 'completed', amount: 300 }
]

// 按属性分组
const byStatus = groupBy(orders, 'status')
// {
//   pending: [{ id: 1, ... }, { id: 3, ... }],
//   completed: [{ id: 2, ... }, { id: 5, ... }],
//   cancelled: [{ id: 4, ... }]
// }

// 使用函数分组
const byAmountRange = groupBy(orders, (order) => {
  if (order.amount < 100) return 'low'
  if (order.amount < 200) return 'medium'
  return 'high'
})
// {
//   low: [{ id: 4, amount: 50 }],
//   medium: [{ id: 1, amount: 100 }, { id: 3, amount: 150 }],
//   high: [{ id: 2, amount: 200 }, { id: 5, amount: 300 }]
// }

// 实际应用：按日期分组消息
const messages = [
  { id: 1, text: 'Hello', date: '2024-01-15' },
  { id: 2, text: 'World', date: '2024-01-15' },
  { id: 3, text: 'Foo', date: '2024-01-16' }
]

const messagesByDate = groupBy(messages, 'date')
// 渲染时可以按日期显示分组

// 实际应用：表格数据按类别汇总
const products = [
  { name: 'Apple', category: 'Fruit', price: 1.5 },
  { name: 'Banana', category: 'Fruit', price: 0.5 },
  { name: 'Carrot', category: 'Vegetable', price: 0.8 }
]

const byCategory = groupBy(products, 'category')
// 可以计算每个类别的总价等
```

## URL与查询字符串

### queryToObject

将URL查询参数字符串转换为对象。

**函数签名：**

```typescript
function queryToObject(url: string): Record<string, string>
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `url` | `string` | 包含查询参数的URL或查询参数字符串 |

**返回值：**

- `Record<string, string>` - 解析后的参数对象

**实现原理：**

```typescript
export const queryToObject = (url: string): Record<string, string> => {
  // 处理完整URL或纯查询字符串
  const search = url.includes('?')
    ? decodeURIComponent(url.split('?')[1] || '')
    : decodeURIComponent(url)

  if (!search) {
    return {}
  }

  const obj: Record<string, string> = {}
  const searchArr = search.split('&')

  searchArr.forEach((v) => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })

  return obj
}
```

**使用示例：**

```typescript
import { queryToObject } from '@/utils/object'

// 解析完整 URL
queryToObject('https://example.com?name=John&age=30')
// { name: 'John', age: '30' }

// 解析查询字符串
queryToObject('name=John&age=30')
// { name: 'John', age: '30' }

// 处理编码的参数
queryToObject('search=%E4%B8%AD%E6%96%87&page=1')
// { search: '中文', page: '1' }

// 实际应用：解析当前页面 URL 参数
const parseCurrentUrl = () => {
  return queryToObject(window.location.search)
}

// 实际应用：从分享链接中提取参数
const parseShareLink = (link: string) => {
  const params = queryToObject(link)
  return {
    inviteCode: params.invite,
    channel: params.channel || 'direct'
  }
}
```

### objectToQuery

将参数对象转换为URL查询字符串，支持嵌套对象。

**函数签名：**

```typescript
function objectToQuery(params: Record<string, any>): string
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `params` | `Record<string, any>` | 参数对象 |

**返回值：**

- `string` - 生成的查询字符串（不含前缀 `?`）

**实现原理：**

```typescript
export const objectToQuery = (params: Record<string, any>): string => {
  if (!params) return ''

  let result = ''

  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = encodeURIComponent(propName) + '='

    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        // 处理嵌套对象
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' &&
              typeof value[key] !== 'undefined') {
            const nestedParam = propName + '[' + key + ']'
            const subPart = encodeURIComponent(nestedParam) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }

  return result.endsWith('&') ? result.slice(0, -1) : result
}
```

**使用示例：**

```typescript
import { objectToQuery } from '@/utils/object'

// 基本对象
objectToQuery({ name: 'John', age: 25 })
// 'name=John&age=25'

// 嵌套对象
objectToQuery({
  name: 'test',
  filter: { status: 1, type: 2 }
})
// 'name=test&filter%5Bstatus%5D=1&filter%5Btype%5D=2'
// 解码后: 'name=test&filter[status]=1&filter[type]=2'

// 过滤空值
objectToQuery({ name: 'John', age: null, city: '' })
// 'name=John'

// 实际应用：构建 API 请求 URL
const buildApiUrl = (baseUrl: string, params: Record<string, any>) => {
  const query = objectToQuery(params)
  return query ? `${baseUrl}?${query}` : baseUrl
}

const url = buildApiUrl('/api/users', {
  page: 1,
  pageSize: 10,
  filter: { status: 'active' }
})
// '/api/users?page=1&pageSize=10&filter[status]=active'

// 实际应用：更新浏览器 URL
const updateUrlParams = (params: Record<string, any>) => {
  const query = objectToQuery(params)
  const newUrl = `${window.location.pathname}?${query}`
  window.history.replaceState({}, '', newUrl)
}
```

## 对象键名转换

### camelizeKeys

对象键名驼峰转换（将下划线或中划线转为驼峰）。

**函数签名：**

```typescript
function camelizeKeys(
  obj: Record<string, any>,
  options?: {
    recursive?: boolean
    exclude?: string[]
  }
): Record<string, any>
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `obj` | `Record<string, any>` | 源对象 |
| `options.recursive` | `boolean` | 是否递归处理，默认 `true` |
| `options.exclude` | `string[]` | 排除的属性名列表 |

**返回值：**

- `Record<string, any>` - 转换后的对象

**实现原理：**

```typescript
export const camelizeKeys = (
  obj: Record<string, any>,
  options: { recursive?: boolean; exclude?: string[] } = {}
): Record<string, any> => {
  const { recursive = true, exclude = [] } = options

  const camelizeStr = (str: string): string => {
    return str.replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase())
  }

  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return recursive ? obj.map((item) => camelizeKeys(item, options)) : obj
  }

  const result: Record<string, any> = {}

  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    const newKey = exclude.includes(key) ? key : camelizeStr(key)
    result[newKey] = recursive && typeof value === 'object' && value !== null
      ? camelizeKeys(value, options)
      : value
  })

  return result
}
```

**使用示例：**

```typescript
import { camelizeKeys } from '@/utils/object'

// 基本转换
camelizeKeys({ first_name: 'John', last_name: 'Doe' })
// { firstName: 'John', lastName: 'Doe' }

// 中划线转换
camelizeKeys({ 'user-name': 'John', 'user-age': 25 })
// { userName: 'John', userAge: 25 }

// 嵌套对象
camelizeKeys({
  user_info: {
    first_name: 'John',
    contact_details: {
      phone_number: '123-456'
    }
  }
})
// {
//   userInfo: {
//     firstName: 'John',
//     contactDetails: {
//       phoneNumber: '123-456'
//     }
//   }
// }

// 排除特定键
camelizeKeys(
  { first_name: 'John', last_name: 'Doe' },
  { exclude: ['last_name'] }
)
// { firstName: 'John', last_name: 'Doe' }

// 实际应用：处理后端 API 响应
const handleApiResponse = (response: any) => {
  // 后端返回 snake_case，前端使用 camelCase
  return camelizeKeys(response.data)
}
```

### snakeizeKeys

对象键名蛇形转换（将驼峰转为下划线）。

**函数签名：**

```typescript
function snakeizeKeys(
  obj: Record<string, any>,
  options?: {
    recursive?: boolean
    exclude?: string[]
  }
): Record<string, any>
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `obj` | `Record<string, any>` | 源对象 |
| `options.recursive` | `boolean` | 是否递归处理，默认 `true` |
| `options.exclude` | `string[]` | 排除的属性名列表 |

**返回值：**

- `Record<string, any>` - 转换后的对象

**使用示例：**

```typescript
import { snakeizeKeys } from '@/utils/object'

// 基本转换
snakeizeKeys({ firstName: 'John', lastName: 'Doe' })
// { first_name: 'John', last_name: 'Doe' }

// 嵌套对象
snakeizeKeys({
  userInfo: {
    firstName: 'John',
    contactDetails: {
      phoneNumber: '123-456'
    }
  }
})
// {
//   user_info: {
//     first_name: 'John',
//     contact_details: {
//       phone_number: '123-456'
//     }
//   }
// }

// 实际应用：发送数据到后端 API
const submitToApi = (formData: Record<string, any>) => {
  // 前端使用 camelCase，后端接收 snake_case
  const payload = snakeizeKeys(formData)
  return api.post('/users', payload)
}
```

**API 数据转换最佳实践：**

```typescript
// 创建 API 请求/响应拦截器
import axios from 'axios'
import { camelizeKeys, snakeizeKeys } from '@/utils/object'

const api = axios.create({
  baseURL: '/api'
})

// 请求拦截器：驼峰转蛇形
api.interceptors.request.use((config) => {
  if (config.data) {
    config.data = snakeizeKeys(config.data)
  }
  if (config.params) {
    config.params = snakeizeKeys(config.params)
  }
  return config
})

// 响应拦截器：蛇形转驼峰
api.interceptors.response.use((response) => {
  if (response.data) {
    response.data = camelizeKeys(response.data)
  }
  return response
})
```

## API 参考

### 对象基本操作

| 函数 | 说明 | 返回类型 |
|------|------|----------|
| `isEmptyObject(obj)` | 检查对象是否为空 | `boolean` |
| `shallowEqual(obj1, obj2)` | 浅比较两个对象 | `boolean` |
| `objectMerge(target, source)` | 深度合并对象 | `T` |
| `deepClone(source)` | 深拷贝对象 | `T` |

### 对象属性访问

| 函数 | 说明 | 返回类型 |
|------|------|----------|
| `getPropertyByPath(obj, path, defaultValue?)` | 按路径获取属性值 | `any` |
| `get(object, path, defaultValue?)` | 安全获取嵌套属性 | `any` |
| `set(object, path, value)` | 设置嵌套属性值 | `T` |

### 对象属性筛选

| 函数 | 说明 | 返回类型 |
|------|------|----------|
| `pick(obj, keys)` | 拾取指定属性 | `Pick<T, K>` |
| `omit(obj, keys)` | 省略指定属性 | `Omit<T, K>` |
| `removeEmpty(object, options?)` | 移除空值属性 | `T` |

### 数组操作

| 函数 | 说明 | 返回类型 |
|------|------|----------|
| `cleanArray(actual)` | 清理数组中的假值 | `T[]` |
| `uniqueArr(arr)` | 数组去重 | `T[]` |
| `groupBy(array, key)` | 按键值分组 | `Record<string, T[]>` |

### URL与查询字符串

| 函数 | 说明 | 返回类型 |
|------|------|----------|
| `queryToObject(url)` | 查询字符串转对象 | `Record<string, string>` |
| `objectToQuery(params)` | 对象转查询字符串 | `string` |

### 对象键名转换

| 函数 | 说明 | 返回类型 |
|------|------|----------|
| `camelizeKeys(obj, options?)` | 键名转驼峰 | `Record<string, any>` |
| `snakeizeKeys(obj, options?)` | 键名转蛇形 | `Record<string, any>` |

## 最佳实践

### 1. 安全的属性访问

使用 `get` 函数避免空指针异常：

```typescript
// ❌ 不安全的方式
const name = response.data.user.profile.name  // 可能报错

// ✅ 安全的方式
const name = get(response, 'data.user.profile.name', 'Anonymous')
```

### 2. 对象清理与过滤

结合多个函数实现复杂的对象处理：

```typescript
const data = {
  name: 'John',
  email: '',
  age: 25,
  password: 'secret',
  temp: null
}

// 移除空值并排除敏感字段
const cleaned = removeEmpty(omit(data, ['password']), {
  emptyValues: ['', null]
})
// { name: 'John', age: 25 }
```

### 3. API 数据转换

在处理 API 数据时进行键名转换：

```typescript
// 后端返回的数据（snake_case）
const apiData = {
  user_id: 1,
  user_name: 'John',
  created_at: '2024-01-01'
}

// 转换为前端使用的格式（camelCase）
const frontendData = camelizeKeys(apiData)
// { userId: 1, userName: 'John', createdAt: '2024-01-01' }
```

### 4. 表单数据处理

在处理表单提交时清理数据：

```typescript
const formData = {
  name: 'John',
  email: 'john@example.com',
  company: '',
  phone: null,
  address: {
    street: '',
    city: 'New York'
  }
}

// 深度移除空值
const cleanData = removeEmpty(formData, { deep: true })
// { name: 'John', email: 'john@example.com', address: { city: 'New York' } }
```

### 5. 性能优化

对于大型对象的处理要注意性能：

```typescript
// ✅ 推荐：使用 pick 选择需要的字段
const displayData = pick(largeObject, ['id', 'name', 'status'])

// ❌ 不推荐：深拷贝大型对象后再过滤
const displayData = omit(deepClone(largeObject), [...manyKeys])
```

## 常见问题

### 1. deepClone 无法处理循环引用

**问题描述：** 对象存在循环引用时，`deepClone` 会导致栈溢出。

**解决方案：**

```typescript
// 使用 lodash 的 cloneDeep
import { cloneDeep } from 'lodash-es'

const obj = { a: 1 }
obj.self = obj  // 循环引用

const copy = cloneDeep(obj)  // 正常工作
```

### 2. shallowEqual 对嵌套对象返回 false

**问题描述：** 两个结构相同的嵌套对象比较返回 `false`。

**解决方案：**

```typescript
// 使用 lodash 的 isEqual 进行深比较
import { isEqual } from 'lodash-es'

const obj1 = { a: { b: 1 } }
const obj2 = { a: { b: 1 } }

shallowEqual(obj1, obj2)  // false
isEqual(obj1, obj2)       // true
```

### 3. uniqueArr 无法对对象数组去重

**问题描述：** 对象数组去重时，相同内容的对象仍然重复。

**解决方案：**

```typescript
// 自定义对象去重函数
const uniqueById = <T extends { id: number }>(arr: T[]): T[] => {
  const map = new Map()
  return arr.filter(item => {
    if (map.has(item.id)) return false
    map.set(item.id, true)
    return true
  })
}

const users = [{ id: 1, name: 'A' }, { id: 1, name: 'B' }]
uniqueById(users)  // [{ id: 1, name: 'A' }]
```

### 4. cleanArray 移除了 0 和 false

**问题描述：** 需要保留 `0` 和 `false` 等有效的假值。

**解决方案：**

```typescript
// 自定义过滤条件
const cleanNullish = <T>(arr: T[]): T[] => {
  return arr.filter(item => item !== null && item !== undefined)
}

cleanNullish([0, 1, null, 2, undefined, false])
// [0, 1, 2, false]
```

### 5. objectToQuery 不处理数组参数

**问题描述：** 需要将数组参数转换为 `key[]=value` 格式。

**解决方案：**

```typescript
// 扩展 objectToQuery 处理数组
const objectToQueryWithArray = (params: Record<string, any>): string => {
  const parts: string[] = []

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => {
        parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`)
      })
    } else if (value !== null && value !== undefined && value !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  })

  return parts.join('&')
}

objectToQueryWithArray({ tags: ['a', 'b', 'c'] })
// 'tags[]=a&tags[]=b&tags[]=c'
```
