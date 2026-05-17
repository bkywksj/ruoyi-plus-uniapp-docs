# TypeScript配置

## 概述

RuoYi-Plus-UniApp 框架采用 TypeScript 5.x 作为开发语言，通过完善的类型系统配置，提供了优秀的开发体验和代码质量保障。框架构建了一套完整的类型体系，包括全局类型声明、组件类型定义、API响应类型、路由类型扩展等，确保开发过程中的类型安全和智能提示。

**核心特性:**

- **适度严格的类型检查** - 启用 `strict` 模式的同时，关闭部分过于严格的选项（如 `strictNullChecks`、`noImplicitAny`），在类型安全和开发灵活性之间取得平衡
- **自动类型生成** - 通过 `unplugin-auto-import` 和 `unplugin-vue-components` 插件自动生成类型声明文件，无需手动维护
- **全局类型声明** - 提供 8 个类型声明文件，涵盖环境变量、API响应、Element Plus组件、路由扩展等所有常用场景
- **渐进式类型化** - 支持从 JavaScript 逐步迁移到 TypeScript，允许隐式 any 类型，降低迁移成本
- **IDE友好** - 完善的类型定义提供精准的智能提示、类型检查和重构支持

## 配置文件结构

```text
📁 plus-ui/
├── 📄 tsconfig.json           # 主要 TypeScript 配置文件
├── 📁 src/types/              # 类型定义目录
│   ├── 📄 auto-imports.d.ts   # 自动导入函数类型声明 (56KB, 自动生成)
│   ├── 📄 components.d.ts     # 组件类型声明 (11KB, 自动生成)
│   ├── 📄 element.d.ts        # Element Plus 组件实例类型 (29KB)
│   ├── 📄 env.d.ts            # 环境变量类型定义 (2.8KB)
│   ├── 📄 global.d.ts         # 全局类型声明 (9.2KB)
│   ├── 📄 http.d.ts           # HTTP 请求类型扩展 (442B)
│   ├── 📄 icons.d.ts          # 图标类型定义 (88KB, 自动生成)
│   └── 📄 router.d.ts         # Vue Router 类型扩展 (3.3KB)
├── 📁 vite/plugins/           # Vite 插件配置目录
│   ├── 📄 index.ts            # 插件入口文件
│   ├── 📄 auto-imports.ts     # 自动导入插件配置
│   └── 📄 components.ts       # 组件自动导入配置
└── 📄 vite.config.ts          # Vite 配置文件
```

**类型文件分类:**

| 文件 | 类型 | 大小 | 说明 |
|------|------|------|------|
| `auto-imports.d.ts` | 自动生成 | 56KB | Vue、VueUse、Pinia 等函数自动导入类型 |
| `components.d.ts` | 自动生成 | 11KB | Element Plus 和图标组件类型 |
| `icons.d.ts` | 自动生成 | 88KB | Iconify 图标类型定义 |
| `element.d.ts` | 手动维护 | 29KB | Element Plus 组件实例和属性类型 |
| `global.d.ts` | 手动维护 | 9KB | API响应、分页、字典等全局类型 |
| `env.d.ts` | 手动维护 | 3KB | Vite 环境变量类型定义 |
| `router.d.ts` | 手动维护 | 3KB | Vue Router 路由元数据扩展 |
| `http.d.ts` | 手动维护 | 442B | Axios 请求头扩展类型 |

## 主配置文件 (tsconfig.json)

### 完整配置

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    // ========== 模块解析配置 ==========
    "baseUrl": ".",
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],

    // ========== 类型检查配置 ==========
    "strict": true,
    "noImplicitAny": false,
    "strictFunctionTypes": false,
    "strictNullChecks": false,

    // ========== 编译输出配置 ==========
    "skipLibCheck": true,
    "noEmit": true,
    "sourceMap": true,
    "removeComments": true,

    // ========== Vue 支持配置 ==========
    "jsx": "preserve",
    "allowJs": true,

    // ========== 模块互操作配置 ==========
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,

    // ========== 路径别名配置 ==========
    "paths": {
      "@/*": ["./src/*"]
    },

    // ========== 类型定义配置 ==========
    "types": ["node", "vite/client"],

    // ========== 实验性特性 ==========
    "experimentalDecorators": true,

    // ========== 其他配置 ==========
    "forceConsistentCasingInFileNames": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.tsbuildinfo"
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "src/**/*.d.ts",
    "vite.config.ts",
    "vitest.config.ts",
    "eslint.config.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "src/**/__tests__/*"
  ]
}
```

### 编译目标配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

**配置说明:**

| 选项 | 值 | 说明 |
|------|------|------|
| `target` | `ES2020` | 编译目标版本，支持可选链、空值合并等现代特性 |
| `lib` | `["ESNext", "DOM", "DOM.Iterable"]` | 包含的类型库，提供 ES 最新标准和 DOM API 类型 |
| `module` | `ESNext` | 模块格式，使用最新的 ES 模块语法 |
| `moduleResolution` | `Bundler` | 模块解析策略，专为 Vite/Webpack 等打包工具优化 |

**为什么选择 ES2020:**

ES2020 是 Vite 默认的编译目标，提供了良好的浏览器兼容性和现代语法支持：

```typescript
// ES2020 支持的特性示例

// 可选链操作符
const userName = user?.profile?.name

// 空值合并操作符
const displayName = userName ?? '未知用户'

// BigInt 支持
const bigNumber = 9007199254740991n

// Promise.allSettled
const results = await Promise.allSettled([promise1, promise2])

// 动态导入
const module = await import('./module.ts')
```

### 严格性配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": false,
    "strictFunctionTypes": false,
    "strictNullChecks": false
  }
}
```

**配置策略:**

| 选项 | 值 | 说明 | 设置原因 |
|------|------|------|----------|
| `strict` | `true` | 启用所有严格检查 | 提供基础类型安全保障 |
| `noImplicitAny` | `false` | 允许隐式 any | 支持渐进式类型化，降低迁移成本 |
| `strictFunctionTypes` | `false` | 关闭函数参数协变检查 | 提升事件处理器等场景的灵活性 |
| `strictNullChecks` | `false` | 关闭严格 null 检查 | 减少大量的空值判断代码 |

**适度严格的好处:**

```typescript
// ✅ noImplicitAny: false 允许渐进式类型化
function processData(data) {  // 参数类型可后续补充
  return data.map(item => item.name)
}

// ✅ strictNullChecks: false 简化空值处理
const user = getUser()
console.log(user.name)  // 无需 user?.name 或 user!.name

// ✅ strictFunctionTypes: false 支持事件处理器
const handleClick = (e: MouseEvent) => { ... }
element.addEventListener('click', handleClick)  // 无类型冲突
```

### 路径别名配置

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**配合 Vite 配置:**

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(process.cwd(), './src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
})
```

**使用示例:**

```typescript
// 使用路径别名导入
import { useUserStore } from '@/stores/modules/user'
import { formatDate } from '@/utils/date'
import MyComponent from '@/components/MyComponent.vue'
import type { UserInfo } from '@/types/user'

// 等价于相对路径导入
import { useUserStore } from '../../stores/modules/user'
```

### 编译优化配置

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noEmit": true,
    "removeComments": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.tsbuildinfo"
  }
}
```

**配置说明:**

| 选项 | 值 | 性能影响 |
|------|------|----------|
| `skipLibCheck` | `true` | 跳过 `.d.ts` 文件类型检查，显著提升编译速度 |
| `noEmit` | `true` | 不生成输出文件，由 Vite 处理编译 |
| `removeComments` | `true` | 删除编译后的注释，减小产物体积 |
| `tsBuildInfoFile` | `./node_modules/.tmp/...` | 增量编译缓存，加快后续构建 |

## 环境变量类型定义

### env.d.ts 文件结构

```typescript
// src/types/env.d.ts

/**
 * Vue 组件模块声明
 * 支持在 TypeScript 中导入 .vue 单文件组件
 */
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const Component: DefineComponent<{}, {}, any>
  export default Component
}

/**
 * Vite 环境变量类型定义
 */
interface ImportMetaEnv {
  // ========== 应用基础配置 ==========
  /** 页面标题 */
  VITE_APP_TITLE: string
  /** 应用ID (每个项目唯一，避免不同项目间键值冲突) */
  VITE_APP_ID: string
  /** 运行环境配置 */
  VITE_APP_ENV: 'development' | 'production'

  // ========== API 配置 ==========
  /** API基础路径 */
  VITE_APP_BASE_API: string
  /** 后端服务端口 */
  VITE_APP_BASE_API_PORT: number
  /** 应用访问路径前缀，例如: /admin/ */
  VITE_APP_CONTEXT_PATH: string

  // ========== 功能开关 ==========
  /** 是否开启前台首页 */
  VITE_ENABLE_FRONTEND: string
  /** WebSocket开关 */
  VITE_APP_WEBSOCKET: string
  /** SSE(Server-Sent Events)开关 */
  VITE_APP_SSE: string

  // ========== 安全配置 ==========
  /** 接口加密功能开关 */
  VITE_APP_API_ENCRYPT: string
  /** 接口加密传输 RSA 公钥 */
  VITE_APP_RSA_PUBLIC_KEY: string
  /** 接口响应解密 RSA 私钥 */
  VITE_APP_RSA_PRIVATE_KEY: string

  // ========== 外部服务配置 ==========
  /** 监控系统地址 */
  VITE_APP_MONITOR_ADMIN: string
  /** SnailJob 任务调度控制台地址 */
  VITE_APP_SNAILJOB_ADMIN: string
  /** 仓库地址 */
  VITE_APP_GIT_URL: string
  /** 文档地址 */
  VITE_APP_DOC_URL: string

  // ========== 构建配置 ==========
  /** 是否在打包时开启压缩 */
  VITE_BUILD_COMPRESS: number
  /** Vite开发服务器端口 */
  VITE_APP_PORT: number
}

/**
 * Vite ImportMeta 扩展
 */
interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 环境变量使用示例

```typescript
// 在代码中使用环境变量（带完整类型提示）
const title = import.meta.env.VITE_APP_TITLE  // string
const port = import.meta.env.VITE_APP_PORT    // number
const env = import.meta.env.VITE_APP_ENV      // 'development' | 'production'

// 条件判断
if (import.meta.env.VITE_APP_ENV === 'development') {
  console.log('开发环境')
}

// 安全配置
const useEncrypt = import.meta.env.VITE_APP_API_ENCRYPT === 'true'
const publicKey = import.meta.env.VITE_APP_RSA_PUBLIC_KEY

// 服务地址
const apiBase = import.meta.env.VITE_APP_BASE_API
const contextPath = import.meta.env.VITE_APP_CONTEXT_PATH
```

### 环境变量文件

```bash
# env/.env.development
VITE_APP_TITLE=RuoYi Plus
VITE_APP_ID=ruoyi-plus
VITE_APP_ENV=development
VITE_APP_PORT=80
VITE_APP_BASE_API=/dev-api
VITE_APP_BASE_API_PORT=8080
VITE_APP_CONTEXT_PATH=/
VITE_APP_WEBSOCKET=true
VITE_APP_SSE=true
VITE_APP_API_ENCRYPT=false

# env/.env.production
VITE_APP_TITLE=RuoYi Plus
VITE_APP_ID=ruoyi-plus
VITE_APP_ENV=production
VITE_APP_BASE_API=/prod-api
VITE_BUILD_COMPRESS=1
VITE_APP_API_ENCRYPT=true
```

## 全局类型声明

### global.d.ts 核心类型

```typescript
// src/types/global.d.ts
import type { ComponentInternalInstance as ComponentInstance } from 'vue'

declare global {
  /** Vue 组件实例类型 */
  declare type ComponentInternalInstance = ComponentInstance

  /**
   * 统一 API 响应类型
   * 使用 [Error, Data] 元组格式，支持 async/await 错误处理
   */
  declare type Result<T = any> = Promise<[Error | null, T | null]>

  /**
   * 分页响应数据类型
   * 与后端 PageResult 保持一致
   */
  declare interface PageResult<T = any> {
    records: T[]      // 数据记录列表
    total: number     // 总记录数
    pages: number     // 总页数
    current: number   // 当前页码
    size: number      // 每页大小
    last: boolean     // 是否为最后一页
  }

  /**
   * 标准 API 响应结构
   */
  declare interface R<T = any> {
    code: number      // 响应状态码
    msg: string       // 响应消息
    data: T           // 响应数据
  }

  /**
   * 分页查询参数
   */
  declare interface PageQuery {
    pageNum?: number           // 当前页码
    pageSize?: number          // 每页显示记录数
    orderByColumn?: string     // 排序字段
    isAsc?: string             // 排序方向 asc/desc
    searchValue?: string       // 模糊搜索关键词
    params?: Record<string, any> // 扩展查询参数
  }

  /**
   * 字典项配置
   */
  declare interface DictItem {
    label: string              // 显示标签文本
    value: string              // 实际存储的值
    status?: string            // 状态标识
    elTagType?: ElTagType      // Element UI Tag 类型
    elTagClass?: string        // 自定义类名
  }

  /**
   * 字段配置接口
   * 用于详情展示、表单等组件
   */
  declare interface FieldConfig {
    prop: string               // 字段属性名，支持嵌套如 'user.name'
    label: string              // 字段显示标签
    span?: number              // 字段占用列数
    slot?: string              // 自定义插槽名称
    formatter?: (value: any, data: any) => string  // 格式化函数
    type?: 'text' | 'copyable' | 'date' | 'datetime' | 'currency'
        | 'boolean' | 'array' | 'dict' | 'image' | 'password'
        | 'html' | 'file' | 'region'  // 数据类型
    dictOptions?: DictItem[]   // 字典选项
    imageConfig?: {            // 图片配置
      width?: number | string
      height?: number | string
      showAll?: boolean
      layout?: 'flex' | 'grid'
      columns?: number
      maxShow?: number
      gap?: number
    }
    hidden?: boolean | ((data: any) => boolean)  // 是否隐藏
    group?: string             // 分组名称
    noPrint?: boolean          // 是否不参与打印
  }

  /**
   * 表格操作按钮配置
   */
  declare interface TableActionConfig {
    icon?: string
    text?: string
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    permission?: string | string[]
    tooltip?: string
    show?: boolean | ((row: any) => boolean)
    disabled?: boolean | ((row: any) => boolean)
    onClick: (row: any, index: number) => void
  }

  /**
   * 表格列配置
   */
  declare interface TableColumnConfig {
    prop: string
    label: string
    width?: number | string
    minWidth?: number | string
    align?: 'left' | 'center' | 'right'
    fixed?: 'left' | 'right' | boolean
    sortable?: boolean | 'custom'
    showOverflowTooltip?: boolean
    slot?: string
    formatter?: (value: any, row: any) => string
    type?: 'text' | 'dict' | 'switch' | 'image' | 'datetime'
        | 'date' | 'actions' | 'copyable' | 'currency' | 'boolean'
    dictOptions?: DictItem[]
    hidden?: boolean
    actions?: TableActionConfig[]
  }

  /**
   * 响应式 Span 配置
   */
  declare interface ResponsiveSpan {
    xs?: number   // <768px
    sm?: number   // ≥768px
    md?: number   // ≥992px
    lg?: number   // ≥1200px
    xl?: number   // ≥1920px
  }

  /** Span 属性类型 */
  declare type SpanType = number | string | ResponsiveSpan | undefined

  /** 弹窗状态配置 */
  declare interface DialogState {
    title?: string
    visible: boolean
  }

  /** 字段可见性配置 */
  declare interface FieldVisibilityConfig {
    key: string | number
    field: string
    label: string
    visible: boolean
    children?: Array<FieldVisibilityConfig>
  }
}

export {}
```

### 全局类型使用示例

```vue
<script setup lang="ts">
// 所有全局类型无需导入，直接使用

// API 响应类型
const fetchUsers = async (): Result<PageResult<UserVO>> => {
  return await listUserApi(queryParams)
}

// 分页查询参数
const queryParams: PageQuery = {
  pageNum: 1,
  pageSize: 10,
  orderByColumn: 'createTime',
  isAsc: 'desc'
}

// 字段配置
const fields: FieldConfig[] = [
  { prop: 'name', label: '姓名', type: 'text' },
  { prop: 'status', label: '状态', type: 'dict', dictOptions: statusOptions },
  { prop: 'createTime', label: '创建时间', type: 'datetime' },
  { prop: 'avatar', label: '头像', type: 'image', imageConfig: { width: 80 } }
]

// 表格列配置
const columns: TableColumnConfig[] = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'status', label: '状态', type: 'dict', dictOptions: statusOptions },
  {
    prop: 'actions',
    label: '操作',
    type: 'actions',
    actions: [
      { text: '编辑', permission: 'system:user:edit', onClick: handleEdit },
      { text: '删除', type: 'danger', permission: 'system:user:remove', onClick: handleDelete }
    ]
  }
]

// 弹窗状态
const dialog: DialogState = reactive({
  visible: false,
  title: ''
})
</script>
```

## 路由类型扩展

### router.d.ts 完整定义

```typescript
// src/types/router.d.ts
import { type LocationQuery, type RouteMeta as VRouteMeta } from 'vue-router'

declare module 'vue-router' {
  /**
   * 路由元数据接口
   * 扩展原生 RouteMeta，添加自定义属性
   */
  interface RouteMeta extends VRouteMeta {
    /** 外部链接 URL */
    link?: string
    /** 路由标题，显示在侧边栏、面包屑和标签栏 */
    title?: string
    /** 是否固定在标签栏，不可关闭 */
    affix?: boolean
    /** 是否不缓存该路由 */
    noCache?: boolean
    /** 高亮对应的侧边栏菜单 */
    activeMenu?: string
    /** 路由图标 */
    icon?: IconCode
    /** 是否在面包屑中显示 */
    breadcrumb?: boolean
    /** 国际化键 */
    i18nKey?: string
  }

  /**
   * 路由记录基础接口
   * 添加权限控制等属性
   */
  interface _RouteRecordBase {
    /** 是否在侧边栏隐藏 */
    hidden?: boolean | string | number
    /** 访问所需的权限标识 */
    permissions?: string[]
    /** 访问所需的角色 */
    roles?: string[]
    /** 总是显示根路由 */
    alwaysShow?: boolean
    /** 默认传递参数 */
    query?: string
    /** 父路由路径 */
    parentPath?: string
  }

  /**
   * 路由位置基础接口
   */
  interface _RouteLocationBase {
    children?: _RouteRecordBase[]
    path?: string
    title?: string
  }

  /**
   * 标签视图接口
   * 用于多标签页导航
   */
  interface TagView {
    fullPath?: string
    name?: string
    path?: string
    title?: string
    meta?: RouteMeta
    query?: LocationQuery
  }
}

export {}
```

### 路由配置示例

```typescript
// router/modules/system.ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout,
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'ep:setting',
      i18nKey: 'menu.system'
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index.vue'),
        name: 'User',
        meta: {
          title: '用户管理',
          icon: 'ep:user',
          noCache: false,          // 启用缓存
          affix: false,            // 不固定在标签栏
          breadcrumb: true         // 显示在面包屑
        },
        permissions: ['system:user:list'],  // 权限控制
        roles: ['admin', 'system']          // 角色控制
      },
      {
        path: 'role',
        component: () => import('@/views/system/role/index.vue'),
        name: 'Role',
        hidden: false,            // 在侧边栏显示
        meta: {
          title: '角色管理',
          icon: 'ep:avatar'
        },
        permissions: ['system:role:list']
      },
      {
        path: 'external-link',
        meta: {
          title: '外部链接',
          icon: 'ep:link',
          link: 'https://ruoyi.plus'  // 外部链接
        }
      }
    ]
  }
]
```

### 路由类型使用

```typescript
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 访问扩展的路由元数据（完整类型提示）
const title = route.meta.title           // string | undefined
const icon = route.meta.icon             // IconCode | undefined
const isAffix = route.meta.affix         // boolean | undefined
const noCache = route.meta.noCache       // boolean | undefined
const i18nKey = route.meta.i18nKey       // string | undefined

// 权限检查
const permissions = route.permissions    // string[] | undefined
const roles = route.roles                // string[] | undefined

// 标签视图
const tagView: TagView = {
  fullPath: route.fullPath,
  name: route.name as string,
  path: route.path,
  title: route.meta.title,
  meta: route.meta,
  query: route.query
}
```

## HTTP 请求类型扩展

### http.d.ts 定义

```typescript
// src/types/http.d.ts
import type { AxiosRequestConfig } from 'axios'

/**
 * 自定义请求头接口
 * 用于控制请求的认证、租户、防重复等行为
 */
export interface CustomHeaders {
  /** 是否需要认证，默认 true */
  auth?: boolean
  /** 是否需要租户ID，默认 true */
  tenant?: boolean
  /** 是否防止重复提交，默认 true */
  repeatSubmit?: boolean
  /** 是否加密请求数据 */
  isEncrypt?: boolean
  /** 其他自定义头部 */
  [key: string]: any
}
```

### HTTP 请求使用示例

```typescript
import { request } from '@/utils/request'

// 普通请求（使用默认配置）
const getUsers = () => {
  return request.get('/system/user/list')
}

// 自定义请求头
const uploadFile = (file: File) => {
  return request.post('/file/upload', file, {
    headers: {
      auth: true,           // 需要认证
      tenant: true,         // 需要租户ID
      repeatSubmit: false,  // 允许重复提交
      isEncrypt: false      // 不加密
    }
  })
}

// 无需认证的公开接口
const getPublicData = () => {
  return request.get('/public/data', {
    headers: {
      auth: false,       // 不需要认证
      tenant: false      // 不需要租户ID
    }
  })
}

// 需要加密的敏感接口
const updatePassword = (data: any) => {
  return request.post('/user/password', data, {
    headers: {
      isEncrypt: true    // 加密请求数据
    }
  })
}
```

## Element Plus 类型定义

### element.d.ts 类型分类

框架提供了完整的 Element Plus 类型声明，包含以下分类：

**样式类型 (6个):**

```typescript
declare global {
  /** 标签类型 */
  declare type ElTagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

  /** 按钮类型 */
  declare type ElButtonType = '' | 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'

  /** 消息类型 */
  declare type ElMessageType = 'success' | 'warning' | 'info' | 'error'

  /** 通知类型 */
  declare type ElNotificationType = 'success' | 'warning' | 'info' | 'error'

  /** 组件尺寸 */
  declare type ElSize = 'large' | 'default' | 'small'

  /** 效果类型 */
  declare type ElEffect = 'light' | 'dark' | 'plain'
}
```

**表单组件实例类型 (18个):**

```typescript
declare global {
  declare type ElFormInstance = ep.FormInstance
  declare type ElInputInstance = ep.InputInstance
  declare type ElInputNumberInstance = ep.InputNumberInstance
  declare type ElSelectInstance = InstanceType<typeof ep.ElSelect>
  declare type ElRadioInstance = ep.RadioInstance
  declare type ElRadioGroupInstance = ep.RadioGroupInstance
  declare type ElCheckboxInstance = ep.CheckboxInstance
  declare type ElCheckboxGroupInstance = InstanceType<typeof ep.ElCheckboxGroup>
  declare type ElSwitchInstance = ep.SwitchInstance
  declare type ElCascaderInstance = ep.CascaderInstance
  declare type ElSliderInstance = ep.SliderInstance
  declare type ElTimePickerInstance = InstanceType<typeof ep.ElTimePicker>
  declare type ElTimeSelectInstance = InstanceType<typeof ep.ElTimeSelect>
  declare type ElDatePickerInstance = InstanceType<typeof ep.ElDatePicker>
  declare type ElRateInstance = ep.RateInstance
  declare type ElColorPickerInstance = ep.ColorPickerInstance
  declare type ElTransferInstance = InstanceType<typeof ep.ElTransfer>
  declare type ElUploadInstance = ep.UploadInstance
}
```

**数据展示组件实例类型 (12个):**

```typescript
declare global {
  declare type ElTableInstance = ep.TableInstance
  declare type ElTableColumnInstance = InstanceType<typeof ep.ElTableColumn>
  declare type ElPaginationInstance = InstanceType<typeof ep.ElPagination>
  declare type ElTreeInstance = InstanceType<typeof ep.ElTree>
  declare type ElTreeSelectInstance = InstanceType<typeof ep.ElTreeSelect>
  declare type ElTagInstance = InstanceType<typeof ep.ElTag>
  declare type ElBadgeInstance = InstanceType<typeof ep.ElBadge>
  declare type ElSkeletonInstance = InstanceType<typeof ep.ElSkeleton>
  declare type ElEmptyInstance = InstanceType<typeof ep.ElEmpty>
  declare type ElDescriptionsInstance = InstanceType<typeof ep.ElDescriptions>
  declare type ElResultInstance = InstanceType<typeof ep.ElResult>
  declare type ElStatisticInstance = InstanceType<typeof ep.ElStatistic>
}
```

**导航组件实例类型 (12个):**

```typescript
declare global {
  declare type ElMenuInstance = InstanceType<typeof ep.ElMenu>
  declare type ElMenuItemInstance = InstanceType<typeof ep.ElMenuItem>
  declare type ElSubMenuInstance = InstanceType<typeof ep.ElSubMenu>
  declare type ElBreadcrumbInstance = InstanceType<typeof ep.ElBreadcrumb>
  declare type ElPageHeaderInstance = InstanceType<typeof ep.ElPageHeader>
  declare type ElDropdownInstance = InstanceType<typeof ep.ElDropdown>
  declare type ElDropdownItemInstance = InstanceType<typeof ep.ElDropdownItem>
  declare type ElStepsInstance = InstanceType<typeof ep.ElSteps>
  declare type ElStepInstance = InstanceType<typeof ep.ElStep>
  declare type ElTabsInstance = InstanceType<typeof ep.ElTabs>
  declare type ElTabPaneInstance = InstanceType<typeof ep.ElTabPane>
  // ...
}
```

**反馈组件实例类型 (14个):**

```typescript
declare global {
  declare type ElAlertInstance = InstanceType<typeof ep.ElAlert>
  declare type ElDialogInstance = InstanceType<typeof ep.ElDialog>
  declare type ElDrawerInstance = InstanceType<typeof ep.ElDrawer>
  declare type ElPopoverInstance = InstanceType<typeof ep.ElPopover>
  declare type ElPopconfirmInstance = InstanceType<typeof ep.ElPopconfirm>
  declare type ElProgressInstance = InstanceType<typeof ep.ElProgress>
  declare type ElTooltipInstance = InstanceType<typeof ep.ElTooltip>
  declare type ElImageInstance = InstanceType<typeof ep.ElImage>
  declare type ElCarouselInstance = InstanceType<typeof ep.ElCarousel>
  declare type ElCollapseInstance = InstanceType<typeof ep.ElCollapse>
  declare type ElTimelineInstance = InstanceType<typeof ep.ElTimeline>
  declare type ElLoadingInstance = ep.LoadingInstance
  declare type ElScrollbarInstance = ep.ScrollbarInstance
  // ...
}
```

**属性和配置类型 (20+个):**

```typescript
declare global {
  declare type ElFormRules = ep.FormRules
  declare type ElUploadFile = ep.UploadFile
  declare type ElUploadFiles = ep.UploadFiles
  declare type ElTreeNodeData = ep.TreeNodeData
  declare type ElTreeNode = ep.TreeNode
  declare type ElTableProps = ep.TableProps
  declare type ElTableColumnProps = ep.TableColumnProps
  declare type ElFormProps = ep.FormProps
  declare type ElInputProps = ep.InputProps
  declare type ElSelectProps = ep.SelectProps
  declare type ElDatePickerProps = ep.DatePickerProps
  declare type ElTreeProps = ep.TreeProps
  declare type ElLoadingOptions = ep.LoadingOptions
  declare type ElNotificationOptions = ep.NotificationOptions
  declare type ElMessageOptions = ep.MessageOptions
  declare type ElMessageBoxOptions = ep.ElMessageBoxOptions
  declare type ElTableColumnCtx<T> = ep.TableColumnCtx<T>
  declare type ElSortOrder = ep.SortOrder
  declare type ElComponentSize = ep.ComponentSize
  declare type ElDatePickerType = 'year' | 'years' | 'month' | 'months' | 'date'
                                | 'dates' | 'week' | 'datetime' | 'datetimerange'
                                | 'daterange' | 'monthrange' | 'yearrange'
  // ...
}
```

### Element Plus 类型使用示例

```vue
<template>
  <el-form ref="formRef" :model="form" :rules="rules">
    <el-form-item label="用户名" prop="username">
      <el-input ref="inputRef" v-model="form.username" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-select ref="selectRef" v-model="form.status">
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
    </el-form-item>
  </el-form>

  <el-table ref="tableRef" :data="tableData">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="status" label="状态">
      <template #default="{ row }">
        <el-tag :type="getTagType(row.status)">
          {{ row.status === '1' ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
// 所有类型无需导入，直接使用全局声明

// 组件引用（完整类型提示）
const formRef = ref<ElFormInstance>()
const inputRef = ref<ElInputInstance>()
const selectRef = ref<ElSelectInstance>()
const tableRef = ref<ElTableInstance>()

// 表单验证规则
const rules: ElFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 标签类型
const getTagType = (status: string): ElTagType => {
  return status === '1' ? 'success' : 'danger'
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      // 提交逻辑
    }
  })
}

// 表格操作
const clearSelection = () => {
  tableRef.value?.clearSelection()
}

// 输入框聚焦
const focusInput = () => {
  inputRef.value?.focus()
}
</script>
```

## 自动导入配置

### auto-imports.ts 插件配置

```typescript
// vite/plugins/auto-imports.ts
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default (path: any) => {
  return AutoImport({
    // 自动导入的库和模块
    imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],

    // 自动导入组合函数和状态管理模块
    dirs: ['src/composables', 'src/stores/modules'],

    // ESLint 配置
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true
    },

    // 解析器配置
    resolvers: [
      ElementPlusResolver()
    ],

    // 在 Vue 模板中自动导入
    vueTemplate: true,

    // 类型声明文件路径
    dts: 'src/types/auto-imports.d.ts',

    // 导入优先级设置
    defaultExportByFilename: false
  })
}
```

### 自动导入的函数

插件会自动导入以下模块的函数：

**Vue 核心函数:**

```typescript
// 无需导入，直接使用
const count = ref(0)
const doubled = computed(() => count.value * 2)
const state = reactive({ name: '', age: 0 })

watch(count, (newVal) => { ... })
watchEffect(() => { ... })

onMounted(() => { ... })
onUnmounted(() => { ... })

const { proxy } = getCurrentInstance()
nextTick(() => { ... })
```

**Vue Router 函数:**

```typescript
// 无需导入，直接使用
const route = useRoute()
const router = useRouter()

router.push('/home')
router.replace('/login')
router.back()
```

**VueUse 函数:**

```typescript
// 无需导入，直接使用
const { x, y } = useMouse()
const { width, height } = useWindowSize()
const isDark = useDark()
const { copy } = useClipboard()
const { isFullscreen, toggle } = useFullscreen()
```

**Pinia 函数:**

```typescript
// 无需导入，直接使用
const userStore = useUserStore()
const appStore = useAppStore()
const permissionStore = usePermissionStore()
```

**项目 Composables:**

```typescript
// src/composables 目录下的函数自动导入
const { getDict, getDictLabel } = useDict()
const { hasPermission, hasRole } = usePermission()
const { openModal, closeModal } = useModal()
const { request, loading } = useRequest()
```

### 生成的类型声明

```typescript
// src/types/auto-imports.d.ts (自动生成)
export {}
declare global {
  // Vue 核心
  const computed: typeof import('vue')['computed']
  const ref: typeof import('vue')['ref']
  const reactive: typeof import('vue')['reactive']
  const watch: typeof import('vue')['watch']
  const watchEffect: typeof import('vue')['watchEffect']
  const onMounted: typeof import('vue')['onMounted']
  const onUnmounted: typeof import('vue')['onUnmounted']
  const nextTick: typeof import('vue')['nextTick']
  const toRef: typeof import('vue')['toRef']
  const toRefs: typeof import('vue')['toRefs']
  const unref: typeof import('vue')['unref']
  const shallowRef: typeof import('vue')['shallowRef']
  const triggerRef: typeof import('vue')['triggerRef']

  // Vue Router
  const useRoute: typeof import('vue-router')['useRoute']
  const useRouter: typeof import('vue-router')['useRouter']

  // VueUse
  const useMouse: typeof import('@vueuse/core')['useMouse']
  const useWindowSize: typeof import('@vueuse/core')['useWindowSize']
  const useDark: typeof import('@vueuse/core')['useDark']
  const useClipboard: typeof import('@vueuse/core')['useClipboard']
  const useFullscreen: typeof import('@vueuse/core')['useFullscreen']
  const useStorage: typeof import('@vueuse/core')['useStorage']
  const useLocalStorage: typeof import('@vueuse/core')['useLocalStorage']

  // Pinia Stores
  const useUserStore: typeof import('@/stores/modules/user')['useUserStore']
  const useAppStore: typeof import('@/stores/modules/app')['useAppStore']
  const usePermissionStore: typeof import('@/stores/modules/permission')['usePermissionStore']
  const useTagsViewStore: typeof import('@/stores/modules/tagsView')['useTagsViewStore']

  // 项目 Composables
  const useDict: typeof import('@/composables/useDict')['useDict']
  const usePermission: typeof import('@/composables/usePermission')['usePermission']
  const useModal: typeof import('@/composables/useModal')['useModal']
  const useRequest: typeof import('@/composables/useRequest')['useRequest']
  // ... 更多
}
```

## 组件自动导入配置

### components.ts 插件配置

```typescript
// vite/plugins/components.ts
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'

export default (path: any) => {
  return Components({
    resolvers: [
      // 自动导入 Element Plus 组件
      ElementPlusResolver(),

      // 自动注册图标组件
      IconsResolver({
        enabledCollections: ['ep']  // Element Plus 图标集
      })
    ],

    // 生成组件类型声明文件
    dts: path.resolve(path.join(process.cwd(), './src'), 'types', 'components.d.ts')
  })
}
```

### 生成的组件类型

```typescript
// src/types/components.d.ts (自动生成)
declare module 'vue' {
  export interface GlobalComponents {
    // Element Plus 组件
    ElButton: typeof import('element-plus/es')['ElButton']
    ElDialog: typeof import('element-plus/es')['ElDialog']
    ElForm: typeof import('element-plus/es')['ElForm']
    ElFormItem: typeof import('element-plus/es')['ElFormItem']
    ElInput: typeof import('element-plus/es')['ElInput']
    ElSelect: typeof import('element-plus/es')['ElSelect']
    ElOption: typeof import('element-plus/es')['ElOption']
    ElTable: typeof import('element-plus/es')['ElTable']
    ElTableColumn: typeof import('element-plus/es')['ElTableColumn']
    ElPagination: typeof import('element-plus/es')['ElPagination']
    ElTree: typeof import('element-plus/es')['ElTree']
    ElTag: typeof import('element-plus/es')['ElTag']
    ElSwitch: typeof import('element-plus/es')['ElSwitch']
    ElDatePicker: typeof import('element-plus/es')['ElDatePicker']
    ElUpload: typeof import('element-plus/es')['ElUpload']
    ElImage: typeof import('element-plus/es')['ElImage']
    // ... 更多 Element Plus 组件

    // Element Plus 图标
    IEpClose: typeof import('~icons/ep/close')['default']
    IEpEdit: typeof import('~icons/ep/edit')['default']
    IEpDelete: typeof import('~icons/ep/delete')['default']
    IEpSearch: typeof import('~icons/ep/search')['default']
    IEpPlus: typeof import('~icons/ep/plus')['default']
    IEpRefresh: typeof import('~icons/ep/refresh')['default']
    // ... 更多图标
  }
}
```

### 组件使用（无需导入）

```vue
<template>
  <!-- Element Plus 组件直接使用 -->
  <el-button type="primary" @click="handleClick">
    <template #icon>
      <i-ep-plus />
    </template>
    新增
  </el-button>

  <el-table :data="tableData">
    <el-table-column prop="name" label="名称" />
    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button type="text" @click="handleEdit(row)">
          <i-ep-edit />
        </el-button>
        <el-button type="text" @click="handleDelete(row)">
          <i-ep-delete />
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog v-model="dialogVisible" title="编辑">
    <el-form :model="form" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
// 无需任何 import 语句
// 组件和图标已自动注册

const dialogVisible = ref(false)
const form = reactive({ name: '' })
const rules: ElFormRules = {
  name: [{ required: true, message: '请输入名称' }]
}
</script>
```

## IDE 集成配置

### VS Code 推荐配置

```json
// .vscode/settings.json
{
  // TypeScript 配置
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.importModuleSpecifier": "shortest",

  // 代码保存时操作
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit"
  },

  // Vue 文件关联
  "files.associations": {
    "*.vue": "vue"
  },

  // ESLint 配置
  "eslint.validate": [
    "javascript",
    "typescript",
    "vue"
  ],

  // Volar 配置
  "vue.inlayHints.inlineHandlerLeading": true,
  "vue.inlayHints.missingProps": true,

  // 格式化配置
  "editor.formatOnSave": true,
  "[vue]": {
    "editor.defaultFormatter": "Vue.volar"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### VS Code 推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "Vue.volar",                    // Vue 3 语言支持
    "Vue.vscode-typescript-vue-plugin",  // TypeScript Vue 插件
    "dbaeumer.vscode-eslint",       // ESLint
    "esbenp.prettier-vscode",       // Prettier
    "antfu.iconify",                // Iconify 图标预览
    "antfu.unocss"                  // UnoCSS 智能提示
  ]
}
```

### WebStorm 配置

1. **启用 TypeScript 服务**
   - Settings → Languages & Frameworks → TypeScript
   - 勾选 "Enable TypeScript service"
   - TypeScript 版本选择项目的 `node_modules` 中的版本

2. **配置代码风格**
   - Settings → Editor → Code Style → TypeScript
   - 导入项目的 `.prettierrc` 配置

3. **Vue 支持**
   - Settings → Languages & Frameworks → JavaScript → Frameworks
   - 勾选 "Vue.js"

4. **路径别名解析**
   - WebStorm 会自动读取 `tsconfig.json` 中的 `paths` 配置

## 类型编写规范

### 接口命名规范

```typescript
// ✅ 接口命名使用 PascalCase
interface UserInfo {
  id: number
  username: string
  email: string
}

// ✅ VO (View Object) 后缀用于视图对象
interface UserVO {
  userId: number
  userName: string
  nickName: string
  roles: RoleVO[]
}

// ✅ DTO (Data Transfer Object) 后缀用于传输对象
interface UserDTO {
  username: string
  password: string
  rememberMe?: boolean
}

// ✅ Query 后缀用于查询参数
interface UserQuery extends PageQuery {
  userName?: string
  status?: string
  deptId?: number
}

// ✅ Form 后缀用于表单数据
interface UserForm {
  userId?: number
  userName: string
  nickName: string
  deptId: number
  roleIds: number[]
}
```

### 类型别名规范

```typescript
// ✅ 简单联合类型使用 type
type Status = 'pending' | 'active' | 'disabled'
type Theme = 'light' | 'dark'
type Size = 'small' | 'medium' | 'large'

// ✅ 函数类型使用 type
type Formatter = (value: any, row: any) => string
type Validator = (rule: any, value: any, callback: Function) => void

// ✅ 复杂类型组合使用 type
type UserWithRoles = UserVO & { roles: RoleVO[] }
type PartialUser = Partial<UserVO>
type RequiredUser = Required<UserVO>
type ReadonlyUser = Readonly<UserVO>

// ✅ 工具类型
type Nullable<T> = T | null
type ArrayElement<T> = T extends (infer E)[] ? E : never
```

### 泛型使用规范

```typescript
// ✅ API 响应泛型
interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

// ✅ 分页响应泛型
interface PageResponse<T> extends ApiResponse<PageResult<T>> {}

// ✅ 列表响应泛型
interface ListResponse<T> extends ApiResponse<T[]> {}

// ✅ 使用泛型
async function getUser(id: number): Promise<ApiResponse<UserVO>> {
  return request.get(`/user/${id}`)
}

async function getUserList(query: UserQuery): Promise<PageResponse<UserVO>> {
  return request.get('/user/list', { params: query })
}
```

### 类型守卫

```typescript
// ✅ 类型守卫函数
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

// ✅ 使用类型守卫
function processValue(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase())  // TypeScript 知道是 string
  } else if (isNumber(value)) {
    console.log(value.toFixed(2))     // TypeScript 知道是 number
  } else if (isArray<string>(value)) {
    console.log(value.join(', '))     // TypeScript 知道是 string[]
  }
}
```

### 断言使用规范

```typescript
// ✅ 类型断言（确定类型时使用）
const element = document.getElementById('app') as HTMLElement
const value = response.data as UserVO

// ✅ 非空断言（确定非空时使用）
const user = getUser()!  // 确定 user 不为 null/undefined
formRef.value!.validate()

// ✅ const 断言（字面量类型）
const config = {
  type: 'primary',
  size: 'small'
} as const  // 类型为 { readonly type: "primary"; readonly size: "small" }

// ❌ 避免过度使用 any
// const data: any = getData()  // 不推荐

// ✅ 使用 unknown 代替 any
const data: unknown = getData()
if (isUserVO(data)) {
  console.log(data.username)  // 类型安全
}
```

## 常见问题

### 1. 类型声明文件未生成

**问题现象:**
- `auto-imports.d.ts` 或 `components.d.ts` 文件不存在
- 自动导入的函数和组件报类型错误

**解决方案:**

```bash
# 1. 重新启动开发服务器
pnpm dev

# 2. 删除缓存后重启
rm -rf node_modules/.vite
pnpm dev

# 3. 检查插件配置
# 确保 dts 路径正确
```

### 2. 路径别名类型错误

**问题现象:**
- `@/` 开头的导入报 "Cannot find module" 错误

**解决方案:**

```json
// tsconfig.json 检查配置
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```typescript
// vite.config.ts 确保一致
resolve: {
  alias: {
    '@': path.join(process.cwd(), './src')
  }
}
```

### 3. Vue 组件类型错误

**问题现象:**
- `.vue` 文件导入报错
- 组件 props 类型丢失

**解决方案:**

```typescript
// 确保 env.d.ts 包含 Vue 模块声明
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const Component: DefineComponent<{}, {}, any>
  export default Component
}
```

### 4. Element Plus 类型丢失

**问题现象:**
- `ElFormInstance` 等类型未定义
- 组件实例方法无类型提示

**解决方案:**

```typescript
// 确保 element.d.ts 正确导入
import type * as ep from 'element-plus'

declare global {
  declare type ElFormInstance = ep.FormInstance
  // ...
}
```

### 5. 全局类型在 .vue 文件中不生效

**问题现象:**
- 在 `.ts` 文件中全局类型正常
- 在 `.vue` 文件的 `<script lang="ts" setup>` 中报错

**解决方案:**

```typescript
// global.d.ts 文件末尾添加空导出
declare global {
  // 类型声明...
}

export {}  // 确保文件被视为模块
```

### 6. 增量编译缓存问题

**问题现象:**
- 类型修改后未生效
- 旧的类型错误持续出现

**解决方案:**

```bash
# 清理 TypeScript 缓存
rm -rf node_modules/.tmp/tsconfig.tsbuildinfo

# 重启 IDE TypeScript 服务
# VS Code: Ctrl+Shift+P → TypeScript: Restart TS Server
```

## 最佳实践

### 1. 渐进式类型化

```typescript
// 第一阶段：使用 any 快速实现
function processData(data: any) {
  return data.items.map((item: any) => item.name)
}

// 第二阶段：添加基础类型
interface DataItem {
  name: string
  value: number
}

function processData(data: { items: DataItem[] }) {
  return data.items.map(item => item.name)
}

// 第三阶段：完善类型
interface ProcessResult {
  names: string[]
  total: number
}

function processData(data: { items: DataItem[] }): ProcessResult {
  return {
    names: data.items.map(item => item.name),
    total: data.items.reduce((sum, item) => sum + item.value, 0)
  }
}
```

### 2. 类型复用

```typescript
// ✅ 从现有类型派生
type UserCreateForm = Omit<UserVO, 'userId' | 'createTime' | 'updateTime'>
type UserUpdateForm = Partial<UserVO> & { userId: number }
type UserListItem = Pick<UserVO, 'userId' | 'userName' | 'nickName' | 'status'>

// ✅ 使用映射类型
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

// ✅ 条件类型
type ApiResult<T> = T extends undefined ? void : ApiResponse<T>
```

### 3. 统一 API 类型

```typescript
// api/types.ts - 统一定义 API 类型
export interface UserVO {
  userId: number
  userName: string
  nickName: string
  // ...
}

export interface UserQuery extends PageQuery {
  userName?: string
  status?: string
}

export interface UserForm {
  userId?: number
  userName: string
  // ...
}

// api/user.ts - 使用类型
import type { UserVO, UserQuery, UserForm } from './types'

export function getUserList(query: UserQuery): Promise<PageResponse<UserVO>> {
  return request.get('/user/list', { params: query })
}

export function createUser(data: UserForm): Promise<ApiResponse<void>> {
  return request.post('/user', data)
}
```

### 4. 组件 Props 类型

```typescript
// ✅ 使用 interface 定义 Props
interface UserCardProps {
  user: UserVO
  showActions?: boolean
  onEdit?: (user: UserVO) => void
  onDelete?: (userId: number) => void
}

// ✅ 使用 withDefaults 设置默认值
const props = withDefaults(defineProps<UserCardProps>(), {
  showActions: true
})

// ✅ 定义 Emits 类型
interface UserCardEmits {
  (e: 'update', user: UserVO): void
  (e: 'delete', userId: number): void
  (e: 'select', selected: boolean): void
}

const emit = defineEmits<UserCardEmits>()
```

### 5. 组合函数类型

```typescript
// ✅ 返回类型明确
interface UseUserReturn {
  user: Ref<UserVO | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  fetchUser: (id: number) => Promise<void>
  updateUser: (data: UserForm) => Promise<void>
}

export function useUser(): UseUserReturn {
  const user = ref<UserVO | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchUser = async (id: number) => {
    loading.value = true
    try {
      const res = await getUserApi(id)
      user.value = res.data
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (data: UserForm) => {
    // ...
  }

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser
  }
}
```

## 总结

RuoYi-Plus-UniApp 的 TypeScript 配置采用适度严格的策略，在保证类型安全的同时保持开发灵活性：

**配置特点:**

- ✅ **ES2020 目标** - 支持现代语法特性，良好的浏览器兼容性
- ✅ **Bundler 模块解析** - 专为 Vite 等现代打包工具优化
- ✅ **适度严格模式** - 启用 strict 但关闭部分过于严格的选项
- ✅ **自动类型生成** - 通过插件自动维护类型声明文件
- ✅ **全局类型声明** - 8 个类型文件覆盖所有常用场景

**类型文件体系:**

| 文件 | 职责 |
|------|------|
| `env.d.ts` | Vite 环境变量类型 |
| `global.d.ts` | API响应、分页、字段配置等全局类型 |
| `element.d.ts` | Element Plus 组件实例和属性类型 |
| `router.d.ts` | Vue Router 路由元数据扩展 |
| `http.d.ts` | Axios 请求头扩展 |
| `auto-imports.d.ts` | 自动导入函数类型（自动生成） |
| `components.d.ts` | 自动导入组件类型（自动生成） |
| `icons.d.ts` | 图标类型定义（自动生成） |

这套配置既满足了大型企业级项目的类型安全需求，又保证了良好的开发体验和渐进式迁移能力。
