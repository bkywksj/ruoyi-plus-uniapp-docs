# 状态类型

Pinia Store 的状态管理类型定义。

## 🎯 Store 状态类型

### User Store

```typescript
interface UserState {
  token: string
  userInfo: UserInfo
  roles: string[]
  permissions: string[]
}
```

### Settings Store

```typescript
interface SettingsState {
  theme: 'light' | 'dark'
  sidebarOpened: boolean
  size: 'default' | 'large' | 'small'
}
```

## 使用示例

```typescript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    userInfo: {} as UserInfo,
    roles: [],
    permissions: []
  }),

  actions: {
    setToken(token: string) {
      this.token = token
    }
  }
})
```

## 相关文档

- [类型系统概览](./overview.md)
