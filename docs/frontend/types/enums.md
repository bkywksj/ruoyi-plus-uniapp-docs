# 枚举类型

项目中的枚举和常量定义。

## 🎯 枚举使用场景

### 状态枚举

```typescript
// 用户状态
enum UserStatus {
  NORMAL = '0',
  DISABLED = '1'
}

// 使用
const status = UserStatus.NORMAL
```

### 常量对象

```typescript
// 字典常量
export const DICT_TYPE = {
  USER_STATUS: 'sys_user_status',
  NORMAL_DISABLE: 'sys_normal_disable'
} as const

// 使用
const dictType = DICT_TYPE.USER_STATUS
```

## 📋 常用枚举示例

### 请求方法

```typescript
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}
```

### 组件尺寸

```typescript
enum ComponentSize {
  LARGE = 'large',
  DEFAULT = 'default',
  SMALL = 'small'
}
```

## 使用建议

1. **优先使用字符串枚举**: 便于调试和序列化
2. **使用 const 对象**: 对于简单常量，使用 `as const`
3. **类型安全**: 结合 TypeScript 类型系统使用

## 相关文档

- [类型系统概览](./overview.md)
- [全局类型](./global-types.md)
