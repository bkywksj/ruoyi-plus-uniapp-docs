# 工具类型

TypeScript 内置工具类型和项目自定义工具类型。

## 🎯 TypeScript 内置工具类型

### 基础工具类型

```typescript
// Partial - 所有属性可选
type PartialUser = Partial<UserVo>

// Required - 所有属性必选  
type RequiredUser = Required<UserBo>

// Readonly - 所有属性只读
type ReadonlyUser = Readonly<UserVo>

// Pick - 选择部分属性
type UserBasic = Pick<UserVo, 'id' | 'username' | 'nickname'>

// Omit - 排除部分属性
type UserWithoutPassword = Omit<UserBo, 'password'>

// Record - 键值对类型
type UserMap = Record<string, UserVo>
```

### 高级工具类型

```typescript
// ReturnType - 函数返回类型
type ApiReturn = ReturnType<typeof getUser>

// Parameters - 函数参数类型
type ApiParams = Parameters<typeof updateUser>

// Awaited - Promise 返回类型
type UserData = Awaited<ReturnType<typeof getUser>>
```

## 🔧 项目自定义工具类型

### SpanType - 响应式列数

```typescript
type SpanType = number | ResponsiveSpan | 'auto'

interface ResponsiveSpan {
  xs?: number  // <768px
  sm?: number  // ≥768px
  md?: number  // ≥992px
  lg?: number  // ≥1200px
  xl?: number  // ≥1920px
}
```

## 使用示例

```typescript
// 表单数据（部分字段可选）
const formData: Partial<UserBo> = {
  username: 'admin'
}

// 只读配置
const config: Readonly<SettingsVo> = {
  theme: 'dark'
}

// 提取关键字段
const userInfo: Pick<UserVo, 'id' | 'username'> = {
  id: '1',
  username: 'admin'
}
```

## 相关文档

- [类型系统概览](./overview.md)
- [全局类型](./global-types.md)
