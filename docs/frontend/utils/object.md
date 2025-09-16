# 对象工具 (object.ts)

对象工具函数集合，提供全面的对象处理功能，包含对象基本操作、属性访问、筛选、数组操作、URL处理和键名转换等功能。

## 📖 概述

对象工具库包含以下功能类别：
- **对象基本操作**：检查、比较、合并、克隆等基础功能
- **对象属性访问**：安全获取和设置嵌套属性
- **对象属性筛选**：选取、排除或清理对象属性
- **数组操作**：清理、去重、分组等数组工具函数
- **URL与查询字符串**：查询字符串和对象互相转换
- **对象键名转换**：对象属性名称格式转换

## 🔧 对象基本操作

### isEmptyObject

检查对象是否为空（无属性）。

```typescript
isEmptyObject(obj: Record<string, any>): boolean
```

**参数：**
- `obj` - 要检查的对象

**返回值：**
- `boolean` - 如果对象为空则返回true

**示例：**
```typescript
// 返回 true
isEmptyObject({})

// 返回 false
isEmptyObject({ a: 1 })

// 返回 true
isEmptyObject(null)
```

### shallowEqual

比较两个对象是否相等（浅比较）。只比较对象的直接属性，不递归比较嵌套对象。

```typescript
shallowEqual(obj1: any, obj2: any): boolean
```

**参数：**
- `obj1` - 第一个对象
- `obj2` - 第二个对象

**返回值：**
- `boolean` - 如果对象相等则返回true

**示例：**
```typescript
// 返回 true
shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })

// 返回 false（嵌套对象引用不同）
shallowEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })
```

### objectMerge

合并两个对象，后者优先。会深度合并对象的属性。

```typescript
objectMerge<T>(target: T, source: any): T
```

**参数：**
- `target` - 目标对象
- `source` - 源对象或数组

**返回值：**
- `T` - 合并后的对象

**示例：**
```typescript
const target = { a: 1, b: { c: 2 } }
const source = { b: { d: 4, c: 3 } }

// 返回 { a: 1, b: { c: 3, d: 4 } }
const result = objectMerge(target, source)
```

### deepClone

深拷贝对象。这是一个简单版本的深拷贝，如果需要使用完美的深拷贝，请使用lodash的`_.cloneDeep`。

```typescript
deepClone<T>(source: T): T
```

**参数：**
- `source` - 源对象

**返回值：**
- `T` - 拷贝后的对象

**示例：**
```typescript
const original = { a: 1, b: { c: 2 } }
const copy = deepClone(original)

copy.b.c = 3  // 不会影响 original.b.c
console.log(original.b.c)  // 输出：2
```

## 🎯 对象属性访问

### getPropertyByPath

获取对象的指定属性路径的值，支持通过点表示法访问嵌套属性。

```typescript
getPropertyByPath(obj: Record<string, any>, path: string, defaultValue?: any): any
```

**参数：**
- `obj` - 源对象
- `path` - 属性路径，如 'user.profile.name'
- `defaultValue` - 如果路径不存在，返回的默认值

**返回值：**
- `any` - 属性值或默认值

**示例：**
```typescript
const obj = { user: { profile: { name: 'John' } } }

// 返回 'John'
getPropertyByPath(obj, 'user.profile.name')

// 返回 'Unknown'
getPropertyByPath({ user: {} }, 'user.profile.name', 'Unknown')
```

### get

安全地获取对象的嵌套属性，避免空指针异常。支持数组索引。

```typescript
get(object: any, path: string | string[], defaultValue?: any): any
```

**参数：**
- `object` - 源对象
- `path` - 属性路径，支持数组索引，如 'users[0].name'
- `defaultValue` - 默认值

**返回值：**
- `any` - 属性值或默认值

**示例：**
```typescript
const obj = { users: [{ name: 'John' }] }

// 返回 'John'
get(obj, 'users[0].name')

// 返回 'Unknown'
get({ users: [] }, 'users[0].name', 'Unknown')

// 也支持传入数组作为路径
get(obj, ['users', '0', 'name'])  // 返回 'John'
```

### set

设置对象的嵌套属性值，自动创建中间对象。

```typescript
set<T>(object: T, path: string | string[], value: any): T
```

**参数：**
- `object` - 源对象
- `path` - 属性路径，支持数组表示法
- `value` - 要设置的值

**返回值：**
- `T` - 修改后的对象

**示例：**
```typescript
const obj = {}

// 返回 { users: [{ name: 'John' }] }
set(obj, 'users[0].name', 'John')

// 也支持传入数组作为路径
set({}, ['users', '0', 'name'], 'John')
```

## 🔍 对象属性筛选

### pick

从对象中拾取指定属性。

```typescript
pick<T, K>(obj: T, keys: K[]): Pick<T, K>
```

**参数：**
- `obj` - 源对象
- `keys` - 要拾取的属性数组

**返回值：**
- `Pick<T, K>` - 只包含指定属性的新对象

**示例：**
```typescript
const obj = { a: 1, b: 2, c: 3, d: 4 }

// 返回 { a: 1, c: 3 }
pick(obj, ['a', 'c'])
```

### omit

从对象中省略指定属性。

```typescript
omit<T, K>(obj: T, keys: K[]): Omit<T, K>
```

**参数：**
- `obj` - 源对象
- `keys` - 要省略的属性数组

**返回值：**
- `Omit<T, K>` - 不包含指定属性的新对象

**示例：**
```typescript
const obj = { a: 1, b: 2, c: 3, d: 4 }

// 返回 { b: 2, d: 4 }
omit(obj, ['a', 'c'])
```

### removeEmpty

移除对象中的空值属性（null、undefined、空字符串等）。

```typescript
removeEmpty<T>(
  object: T,
  options?: {
    deep?: boolean
    emptyValues?: any[]
  }
): T
```

**参数：**
- `object` - 要处理的对象
- `options` - 选项
    - `deep` - 是否深度清理，默认为false
    - `emptyValues` - 被视为空的值列表，默认为[null, undefined, '']

**返回值：**
- `T` - 清理后的对象

**示例：**
```typescript
const obj = { a: 1, b: null, c: 3, d: '' }

// 返回 { a: 1, c: 3 }
removeEmpty(obj)

// 深度清理
const deepObj = { a: 1, b: { c: null, d: 4 }, e: '' }
// 返回 { a: 1, b: { d: 4 } }
removeEmpty(deepObj, { deep: true })

// 自定义空值
// 返回 { a: 1 }
removeEmpty({ a: 1, b: 0, c: false }, { emptyValues: [0, false] })
```

## 📊 数组操作

### cleanArray

清理数组中的空值（假值）。

```typescript
cleanArray<T>(actual: T[]): T[]
```

**参数：**
- `actual` - 原始数组

**返回值：**
- `T[]` - 清理后的数组

**示例：**
```typescript
// 返回 [1, 2, 3]
cleanArray([0, 1, false, 2, '', 3, null, undefined])
```

### uniqueArr

数组去重。

```typescript
uniqueArr<T>(arr: T[]): T[]
```

**参数：**
- `arr` - 原始数组

**返回值：**
- `T[]` - 去重后的数组

**示例：**
```typescript
// 返回 [1, 2, 3, 4]
uniqueArr([1, 2, 2, 3, 3, 4])
```

### groupBy

将对象数组按指定键值分组。

```typescript
groupBy<T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]>
```

**参数：**
- `array` - 对象数组
- `key` - 分组依据的属性名或函数

**返回值：**
- `Record<string, T[]>` - 分组后的对象

**示例：**
```typescript
const data = [
  {id: 1, status: 'active'}, 
  {id: 2, status: 'inactive'}, 
  {id: 3, status: 'active'}
]

// 按属性分组
// 返回 { active: [{id: 1, status: 'active'}, {id: 3, status: 'active'}], inactive: [{id: 2, status: 'inactive'}] }
groupBy(data, 'status')

// 使用函数分组
// 返回 { even: [{id: 2}], odd: [{id: 1}, {id: 3}] }
groupBy(data, item => item.id % 2 === 0 ? 'even' : 'odd')
```

## 🌐 URL与查询字符串

### queryToObject

将URL查询参数字符串转换为对象。

```typescript
queryToObject(url: string): Record<string, string>
```

**参数：**
- `url` - 包含查询参数的URL或查询参数字符串

**返回值：**
- `Record<string, string>` - 解析后的参数对象

**示例：**
```typescript
// 返回 { name: 'John', age: '30' }
queryToObject('https://example.com?name=John&age=30')

// 返回 { name: 'John', age: '30' }
queryToObject('name=John&age=30')
```

### objectToQuery

将参数对象转换为URL查询字符串，支持嵌套对象。

```typescript
objectToQuery(params: Record<string, any>): string
```

**参数：**
- `params` - 参数对象

**返回值：**
- `string` - 生成的查询字符串（不含前缀?）

**示例：**
```typescript
// 返回 "name=test&age=25"
objectToQuery({name: 'test', age: 25})

// 返回 "name=test&filter[status]=1&filter[type]=2"
objectToQuery({name: 'test', filter: {status: 1, type: 2}})
```

## 🔄 对象键名转换

### camelizeKeys

对象键名驼峰转换（将下划线或中划线转为驼峰）。

```typescript
camelizeKeys(
  obj: Record<string, any>,
  options?: {
    recursive?: boolean
    exclude?: string[]
  }
): Record<string, any>
```

**参数：**
- `obj` - 源对象
- `options` - 配置选项
    - `recursive` - 是否递归处理，默认为true
    - `exclude` - 排除的属性名列表

**返回值：**
- `Record<string, any>` - 转换后的对象

**示例：**
```typescript
// 返回 { firstName: 'John', lastName: 'Doe' }
camelizeKeys({ first_name: 'John', last_name: 'Doe' })

// 嵌套对象
const nested = { user: { first_name: 'John', address: { street_name: 'Main' } } }
// 返回 { user: { firstName: 'John', address: { streetName: 'Main' } } }
camelizeKeys(nested)

// 排除特定键
// 返回 { firstName: 'John', last_name: 'Doe' }
camelizeKeys({ first_name: 'John', last_name: 'Doe' }, { exclude: ['last_name'] })
```

### snakeizeKeys

对象键名蛇形转换（将驼峰转为下划线）。

```typescript
snakeizeKeys(
  obj: Record<string, any>,
  options?: {
    recursive?: boolean
    exclude?: string[]
  }
): Record<string, any>
```

**参数：**
- `obj` - 源对象
- `options` - 配置选项
    - `recursive` - 是否递归处理，默认为true
    - `exclude` - 排除的属性名列表

**返回值：**
- `Record<string, any>` - 转换后的对象

**示例：**
```typescript
// 返回 { first_name: 'John', last_name: 'Doe' }
snakeizeKeys({ firstName: 'John', lastName: 'Doe' })

// 嵌套对象
const nested = { user: { firstName: 'John', address: { streetName: 'Main' } } }
// 返回 { user: { first_name: 'John', address: { street_name: 'Main' } } }
snakeizeKeys(nested)

// 排除特定键
// 返回 { first_name: 'John', lastName: 'Doe' }
snakeizeKeys({ firstName: 'John', lastName: 'Doe' }, { exclude: ['lastName'] })
```

## 💡 使用技巧

### 1. 安全的属性访问
使用 `get` 函数可以避免在访问嵌套属性时出现错误：

```typescript
// 不安全的方式
const name = obj.user.profile.name  // 可能报错

// 安全的方式
const name = get(obj, 'user.profile.name', 'Anonymous')
```

### 2. 对象清理与过滤
结合多个函数可以实现复杂的对象处理：

```typescript
const data = {
  name: 'John',
  email: '',
  age: 25,
  password: 'secret',
  temp: null
}

// 移除空值并排除敏感字段
const cleaned = removeEmpty(omit(data, ['password']), { emptyValues: ['', null] })
// 结果：{ name: 'John', age: 25 }
```

### 3. API 数据转换
在处理API数据时，经常需要进行键名转换：

```typescript
// 后端返回的数据（snake_case）
const apiData = {
  user_id: 1,
  user_name: 'John',
  created_at: '2023-01-01'
}

// 转换为前端使用的格式（camelCase）
const frontendData = camelizeKeys(apiData)
// 结果：{ userId: 1, userName: 'John', createdAt: '2023-01-01' }
```

### 4. 表单数据处理
在处理表单提交时的数据清理：

```typescript
const formData = {
  name: 'John',
  email: 'john@example.com',
  company: '',
  phone: null,
  address: {
    street: '',
    city: 'New York',
    country: 'US'
  }
}

// 深度移除空值
const cleanData = removeEmpty(formData, { deep: true })
// 结果：{ name: 'John', email: 'john@example.com', address: { city: 'New York', country: 'US' } }
```

## ⚠️ 注意事项

1. **深拷贝限制**：`deepClone` 是简单实现，不能处理循环引用、函数、Date等特殊对象
2. **类型安全**：在TypeScript中，使用这些函数时要注意类型安全
3. **性能考虑**：对于大型对象的深度操作可能影响性能
4. **引用关系**：某些函数会修改原始对象，某些会创建新对象，使用时要注意
