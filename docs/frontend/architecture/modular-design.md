# 模块化设计

## 概述

Ruoyi-Plus-Uniapp 框架采用高度模块化的设计理念，通过清晰的目录结构和模块划分，实现了代码的高内聚、低耦合。每个模块都有明确的职责边界，便于开发、维护和扩展。

## 模块化架构图

```
📁 plus-ui/
├── 🔧 配置层    # 环境配置、构建配置
├── 📡 接口层    # API 接口管理
├── 🎨 表现层    # 组件、布局、页面
├── 🧠 逻辑层    # 状态管理、组合函数
├── 🛠️ 工具层    # 工具函数、指令、类型
└── 🌍 资源层    # 静态资源、国际化
```

## 核心模块设计

### 📡 API 接口层 (`/api`)

**设计原则**：按业务域垂直划分，每个模块独立管理

```typescript
// 模块结构
src/api/
├── business/    # 业务相关接口
│   ├── base/    # 基础业务
│   └── mall/    # 商城业务
├── system/      # 系统相关接口  
│   ├── auth/    # 认证授权
│   ├── core/    # 核心功能
│   └── monitor/ # 系统监控
└── tool/        # 工具相关接口
```

**特点**：
- ✅ **按域划分**：每个业务域独立管理 API
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **统一规范**：统一的请求响应格式
- ✅ **错误处理**：集中的错误处理机制

```typescript
// API 模块示例
// /api/system/auth/authApi.ts
export const userLogin = (data: LoginRequest): Result<AuthTokenVo> => {
  return http.post<AuthTokenVo>('/auth/userLogin', data, {
    auth: false,
    isEncrypt: true
  })
}
```

### 🎨 组件系统 (`/components`)

**设计原则**：原子化设计，可复用优先

```typescript
// 组件层次结构
src/components/
├── AForm/           # 表单组件库（原子级）
│   ├── AFormInput.vue
│   ├── AFormSelect.vue
│   └── ...
├── ASearchForm/     # 搜索表单（分子级）
├── AOssMediaManager/# 媒体管理（组织级）
└── UserSelect/      # 业务组件（模板级）
```

**分层策略**：
- **原子级**：基础表单控件 (AForm*)
- **分子级**：功能组合组件 (ASearchForm)
- **组织级**：业务功能模块 (AOssMediaManager)
- **模板级**：页面级业务组件 (UserSelect)

### 🧠 状态管理 (`/stores`)

**设计原则**：单一职责，模块化管理

```typescript
// 状态模块划分
src/stores/modules/
├── user.ts         # 用户状态（认证、信息）
├── permission.ts   # 权限状态（路由、按钮权限）
├── theme.ts        # 主题状态（样式、布局）
├── tagsView.ts     # 标签页状态
├── dict.ts         # 字典状态
└── state.ts        # 应用全局状态
```

**模块特点**：
- ✅ **职责单一**：每个模块管理特定领域状态
- ✅ **组合式 API**：使用 Pinia 的组合式写法
- ✅ **类型安全**：完整的 TypeScript 支持
- ✅ **持久化**：支持本地存储持久化

```typescript
// 状态模块示例
export const useUserStore = defineStore('user', () => {
  // 状态定义
  const userInfo = ref<SysUserVo | null>(null)
  const roles = ref<string[]>([])
  
  // 操作方法
  const loginUser = async (data: LoginRequest) => { /* ... */ }
  const fetchUserInfo = async () => { /* ... */ }
  
  return { userInfo, roles, loginUser, fetchUserInfo }
})
```

### 🎣 组合函数 (`/composables`)

**设计原则**：逻辑复用，功能内聚

```typescript
// 组合函数分类
src/composables/
├── useAuth.ts       # 权限相关
├── useDict.ts       # 字典管理  
├── useHttp.ts       # HTTP 请求
├── useTheme.ts      # 主题管理
├── useDialog.ts     # 弹窗管理
├── useDownload.ts   # 文件下载
└── useTableHeight.ts# 表格高度计算
```

**设计特点**：
- ✅ **功能内聚**：相关逻辑集中管理
- ✅ **响应式**：基于 Vue 3 响应式系统
- ✅ **可测试**：独立的函数便于单元测试
- ✅ **类型安全**：完整的 TypeScript 支持

```typescript
// 组合函数示例
export const useDict = (...dictTypes: string[]) => {
  const dictStore = useDictStore()
  const dictObject = reactive<Record<string, DictItem[]>>({})
  const dictLoading = ref(true)
  
  // 逻辑处理...
  
  return { ...toRefs(dictObject), dictLoading }
}
```

### 🛠️ 工具函数 (`/utils`)

**设计原则**：纯函数，无副作用

```typescript
// 工具函数分类
src/utils/
├── string.ts        # 字符串处理
├── object.ts        # 对象操作
├── array.ts         # 数组处理
├── date.ts          # 日期处理
├── format.ts        # 格式化
├── validators.ts    # 表单验证
├── crypto.ts        # 加密解密
└── cache.ts         # 缓存操作
```

**特点**：
- ✅ **纯函数**：无副作用，易于测试
- ✅ **类型安全**：完整的输入输出类型定义
- ✅ **按需导入**：支持 Tree Shaking
- ✅ **文档完善**：详细的 JSDoc 注释

### 🎨 布局系统 (`/layouts`)

**设计原则**：层次化布局，可配置组合

```typescript
// 布局组件结构
src/layouts/
├── components/
│   ├── AppMain/     # 主内容区
│   ├── Navbar/      # 顶部导航
│   ├── Sidebar/     # 侧边栏
│   ├── TagsView/    # 标签页
│   └── Settings/    # 设置面板
├── Layout.vue       # 后台主布局
└── HomeLayout.vue   # 前台布局
```

**布局特性**：
- ✅ **模块化**：每个布局组件独立
- ✅ **可配置**：支持动态配置显示/隐藏
- ✅ **响应式**：适配不同屏幕尺寸
- ✅ **主题化**：支持主题切换

### 🛣️ 路由系统 (`/router`)

**设计原则**：模块化路由，权限控制

```typescript
// 路由模块结构
src/router/
├── modules/
│   ├── constant.ts  # 静态路由
│   ├── system.ts    # 系统模块路由
│   └── tool.ts      # 工具模块路由
├── utils/           # 路由工具
├── guard.ts         # 路由守卫
└── router.ts        # 路由配置
```

**路由特性**：
- ✅ **模块划分**：按功能模块组织路由
- ✅ **动态路由**：基于权限动态生成
- ✅ **路由守卫**：完整的权限控制
- ✅ **类型安全**：路由参数类型检查

## 模块通信机制

### 🔄 模块间通信

```typescript
// 1. 状态管理通信
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 2. 组合函数通信
const { isAuthenticated } = useAuth()
const { dictData } = useDict('sys_user_status')

// 3. 提供/注入（Provide/Inject）
// 父组件
provide('theme', themeConfig)
// 子组件  
const theme = inject<ThemeConfig>('theme')

// 4. Props/Emit 组件通信
// 父组件
<UserSelect @change="handleUserChange" />
// 子组件
const emit = defineEmits<{
  change: [user: UserInfo]
}>()
```

### 📦 模块依赖管理

```typescript
// 依赖层次（由底层到上层）
工具层 (utils) 
    ↓
逻辑层 (composables, stores)
    ↓  
组件层 (components)
    ↓
页面层 (views)
    ↓
布局层 (layouts)
```

**依赖原则**：
- ✅ **单向依赖**：上层可以依赖下层，禁止反向依赖
- ✅ **接口隔离**：通过接口定义模块边界
- ✅ **依赖注入**：通过依赖注入解耦模块关系

## 模块化优势

### 🚀 开发效率
- **职责清晰**：每个模块职责明确，减少认知负担
- **并行开发**：不同模块可以并行开发
- **快速定位**：问题定位更加精确
- **代码复用**：组件和函数高度复用

### 🛡️ 维护性
- **影响隔离**：模块间相互独立，修改影响可控
- **单元测试**：模块化便于编写单元测试
- **重构安全**：模块边界清晰，重构更安全
- **版本管理**：便于版本控制和回滚

### 📈 扩展性
- **新功能添加**：新增模块不影响现有功能
- **模块替换**：可以轻松替换整个模块
- **渐进式升级**：支持逐模块升级
- **插件化**：支持插件式功能扩展

## 最佳实践

### ✅ 命名规范
```typescript
// 组件命名：PascalCase + 前缀
AFormInput.vue
AOssMediaManager.vue

// 文件命名：camelCase
useAuth.ts
userStore.ts

// 目录命名：kebab-case
user-select/
oss-media-manager/
```

### ✅ 导入导出规范
```typescript
// 统一导出入口
// /utils/index.ts
export * from './string'
export * from './object'
export * from './date'

// 按需导入
import { formatDate, parseDate } from '@/utils'
```

### ✅ 模块边界控制
```typescript
// 明确的接口定义
export interface UserService {
  getUserInfo(): Promise<UserInfo>
  updateProfile(data: ProfileData): Promise<void>
}

// 通过接口约束模块行为
export const useUserService = (): UserService => {
  // 实现...
}
```

## 总结

Ruoyi-Plus-Uniapp 的模块化设计通过清晰的分层架构、合理的职责划分、统一的规范约束，实现了代码的高内聚、低耦合。这种设计不仅提高了开发效率，也保证了系统的可维护性和扩展性，为企业级应用的持续发展奠定了坚实的基础。
