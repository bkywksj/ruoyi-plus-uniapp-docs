# 状态管理概览

## 架构设计

项目采用 Pinia 作为状态管理方案，使用 Composition API 风格组织代码，提供类型安全的全局状态管理。

## Store 模块划分

```
stores/
├── store.ts          # Pinia 实例创建
├── user.ts           # 用户认证与权限
├── permission.ts     # 路由权限管理
├── state.ts          # 应用交互状态
├── theme.ts          # 主题与布局配置
├── tagsView.ts       # 标签导航管理
├── dict.ts           # 字典数据管理
└── notice.ts         # 通知消息管理
```

## 设计原则

### 1. 模块化组织
每个 Store 负责独立的业务领域，职责单一，相互解耦。

### 2. Composition API 风格
```typescript
export const useXxxStore = defineStore('module-name', () => {
  // 响应式状态
  const state = ref()
  
  // 计算属性
  const getters = computed()
  
  // 业务方法
  const actions = () => {}
  
  // 统一导出
  return { state, getters, actions }
})
```

### 3. TypeScript 类型支持
- 完整的类型定义和接口声明
- 自动的类型推导和智能提示
- 编译时类型检查

### 4. 持久化策略
- `user`: Token 通过专门工具类管理
- `theme`: 使用 localCache 工具持久化
- `state`: 自动同步到 localStorage
- 其他模块按需持久化

## 使用规范

### 在组件中使用
```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
// 访问状态
userStore.userInfo
// 调用方法
await userStore.fetchUserInfo()
```

### 跨 Store 协作
```typescript
// 在 permission store 中使用 auth 功能
const { hasPermission } = useAuth()
```

### 异步操作规范
```typescript
// 统一使用 Result 类型处理异步结果
const fetchData = async (): Result<Data> => {
  const [err, data] = await api.getData()
  if (err) return [err, null]
  return [null, data]
}
```

## 核心功能模块

| 模块 | 职责 | 核心功能 |
|-----|------|---------|
| user | 用户认证 | 登录、注销、权限验证 |
| permission | 路由权限 | 动态路由、菜单生成 |
| state | 交互状态 | 侧边栏、设备适配、多语言 |
| theme | 主题配置 | 布局、颜色、暗黑模式 |
| tagsView | 标签导航 | 多页签、页面缓存 |
| dict | 字典管理 | 下拉选项、数据映射 |
| notice | 通知管理 | 系统通知、消息提醒 |

## 最佳实践

1. **避免直接修改状态**：通过定义的方法修改状态
2. **合理使用计算属性**：派生状态使用 computed
3. **异步操作错误处理**：统一的错误处理机制
4. **模块职责清晰**：不跨界处理其他模块的业务
5. **类型定义完整**：确保 TypeScript 类型覆盖
