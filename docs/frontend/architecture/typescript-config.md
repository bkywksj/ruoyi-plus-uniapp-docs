# TypeScript配置 

## 概述

Ruoyi-Plus-Uniapp 框架采用 TypeScript 作为开发语言，通过完善的类型系统配置，提供了优秀的开发体验和代码质量保障。本章详细介绍框架中 TypeScript 的配置和最佳实践。

## 配置文件结构

```
📁 项目根目录/
├── 📄 tsconfig.json           # 主要 TypeScript 配置
├── 📁 src/types/              # 类型定义目录
│   ├── 📄 auto-imports.d.ts   # 自动导入类型声明
│   ├── 📄 components.d.ts     # 组件类型声明
│   └── 📄 global.d.ts         # 全局类型声明
└── 📁 vite/                   # Vite 插件配置
    └── 📁 plugins/
        └── 📄 auto-imports.ts  # 自动导入配置
```

## 主配置文件 (tsconfig.json)

### 基础配置

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    // 模块解析配置
    "baseUrl": ".",
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    
    // 类型检查配置
    "strict": true,
    "skipLibCheck": true,
    
    // 输出配置
    "noEmit": true,
    "sourceMap": true,
    
    // Vue 支持
    "jsx": "preserve",
    "allowJs": true,
    
    // 模块系统
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true
  }
}
```

### 编译目标配置

```json
{
  "compilerOptions": {
    // 编译目标版本 - 支持现代浏览器特性
    "target": "ES2020",
    
    // 包含的库文件 - 提供编译时类型检查
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    
    // 模块格式 - 使用最新的 ES 模块语法
    "module": "ESNext",
    
    // 模块解析策略 - 适用于 Vite/Webpack 等打包工具
    "moduleResolution": "Bundler"
  }
}
```

### 路径别名配置

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]  // @ 指向 src 目录
    }
  }
}
```

**使用示例：**
```typescript
// 使用别名导入
import { useUserStore } from '@/stores/modules/user'
import { formatDate } from '@/utils/date'
import MyComponent from '@/components/MyComponent.vue'
```

### 严格模式配置

```json
{
  "compilerOptions": {
    // 启用所有严格类型检查选项
    "strict": true,
    
    // 自定义严格性配置（框架特殊设置）
    "noImplicitAny": false,           // 允许隐式 any，适用于渐进式类型化
    "strictFunctionTypes": false,     // 关闭函数参数协变检查，提升灵活性
    "strictNullChecks": false,        // 关闭严格 null 检查，减少类型复杂度
    
    // 其他有用的检查
    "forceConsistentCasingInFileNames": true  // 确保文件引用大小写一致
  }
}
```

**严格性说明：**
- ✅ **适度严格**：既保证类型安全，又保持开发灵活性
- ✅ **渐进式**：支持从 JavaScript 逐步迁移到 TypeScript
- ✅ **实用性**：避免过度严格影响开发效率

## 编译优化配置

### 性能优化

```json
{
  "compilerOptions": {
    // 跳过声明文件类型检查，提升编译速度
    "skipLibCheck": true,
    
    // 增量编译配置
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.tsbuildinfo",
    
    // 不生成输出文件，由 Vite 处理
    "noEmit": true,
    
    // 删除编译后的注释，减小产物体积
    "removeComments": true
  }
}
```

### Vue 专用配置

```json
{
  "compilerOptions": {
    // 保留 JSX 语法，交给 Vue 处理
    "jsx": "preserve",
    
    // 允许编译 JavaScript 文件
    "allowJs": true,
    
    // 生成 source map 用于调试
    "sourceMap": true
  }
}
```

## 类型声明配置

### 环境变量类型

```typescript
// src/types/env.d.ts
interface ImportMetaEnv {
  VITE_APP_TITLE: string                    // 页面标题
  VITE_APP_ID: string                       // 应用ID
  VITE_APP_ENV: 'development' | 'production'// 运行环境
  VITE_APP_BASE_API: string                 // API基础路径
  VITE_APP_BASE_API_PORT: number            // 后端服务端口
  VITE_APP_CONTEXT_PATH: string             // 访问路径前缀
  VITE_ENABLE_FRONTEND: string              // 是否开启前台首页
  VITE_APP_MONITOR_ADMIN: string            // 监控系统地址
  VITE_APP_GIT_URL: string                  // 仓库地址
  VITE_APP_DOC_URL: string                  // 文档地址
  VITE_BUILD_COMPRESS: number               // 打包压缩开关
  VITE_APP_PORT: number                     // 开发服务器端口
  VITE_APP_API_ENCRYPT: string              // 接口加密开关
  VITE_APP_RSA_PUBLIC_KEY: string           // RSA公钥
  VITE_APP_RSA_PRIVATE_KEY: string          // RSA私钥
  VITE_APP_WEBSOCKET: string                // WebSocket开关
  VITE_APP_SSE: string                      // SSE开关
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 文件包含配置

```json
{
  "include": [
    "src/**/*.ts",      // 所有 TypeScript 文件
    "src/**/*.vue",     // 所有 Vue 组件
    "src/**/*.d.ts",    // 类型声明文件
    "vite.config.ts",   // Vite 配置
    "uno.config.ts"     // UnoCSS 配置
  ],
  "exclude": [
    "node_modules",     // 依赖包
    "dist",            // 构建输出
    "src/**/__tests__/*" // 测试文件
  ]
}
```

## 自动导入类型配置

### 自动导入插件配置

```typescript
// vite/plugins/auto-imports.ts
export default (path: any) => {
  return AutoImport({
    imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
    dirs: ['src/composables', 'src/stores/modules'],
    
    // 类型声明文件配置
    dts: 'src/types/auto-imports.d.ts',
    
    // ESLint 配置
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json'
    }
  })
}
```

### 生成的类型声明

```typescript
// src/types/auto-imports.d.ts (自动生成)
export {}
declare global {
  const computed: typeof import('vue')['computed']
  const ref: typeof import('vue')['ref']
  const useRoute: typeof import('vue-router')['useRoute']
  const useRouter: typeof import('vue-router')['useRouter']
  const useUserStore: typeof import('@/stores/modules/user')['useUserStore']
  // ... 更多自动导入的类型
}
```

## 组件类型配置

### 组件自动导入

```typescript
// vite/plugins/components.ts
export default (path: any) => {
  return Components({
    resolvers: [
      ElementPlusResolver(),  // Element Plus 组件
      IconsResolver({         // 图标组件
        enabledCollections: ['ep']
      })
    ],
    
    // 生成组件类型声明
    dts: path.resolve('./src/types/components.d.ts')
  })
}
```

### 生成的组件类型

```typescript
// src/types/components.d.ts (自动生成)
declare module 'vue' {
  export interface GlobalComponents {
    ElButton: typeof import('element-plus/es')['ElButton']
    ElDialog: typeof import('element-plus/es')['ElDialog']
    IEpClose: typeof import('~icons/ep/close')['default']
    // ... 更多组件类型
  }
}
```

## 全局类型声明

### 全局类型定义

```typescript
// src/types/global.d.ts
declare global {
  // Vue 组件实例类型
  declare type ComponentInternalInstance = ComponentInstance

  // 统一 API 响应类型
  declare type Result<T = any> = Promise<[Error | null, T | null]>

  // 分页响应数据类型
  declare interface PageResult<T = any> {
    records: T[]
    total: number
    pages: number
    current: number
    size: number
    last: boolean
  }

  // 标准 API 响应结构
  declare interface R<T = any> {
    code: number
    msg: string
    data: T
  }

  // 分页查询基础参数
  declare interface PageQuery {
    pageNum?: number
    pageSize?: number
    orderByColumn?: string
    isAsc?: string
    searchValue?: string
    params?: Record<string, any>
  }

  // 字段可见性配置
  declare interface FieldVisibilityConfig {
    key: string | number
    field: string
    label: string
    visible: boolean
    children?: Array<FieldVisibilityConfig>
  }

  // 弹窗状态配置
  declare interface DialogState {
    title?: string
    visible: boolean
  }

  // 字典项配置
  declare interface DictItem {
    label: string
    value: string
    status?: string
    elTagType?: ElTagType
    elTagClass?: string
  }
}

export {}
```

### Element Plus 组件类型

框架中包含了完整的 Element Plus 组件类型声明：

```typescript
// src/types/element.d.ts
declare global {
  // 样式类型
  declare type ElTagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'
  declare type ElButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'
  declare type ElSize = 'large' | 'default' | 'small'
  
  // 组件实例类型
  declare type ElFormInstance = ep.FormInstance
  declare type ElTableInstance = ep.TableInstance
  declare type ElUploadInstance = ep.UploadInstance
  declare type ElInputInstance = ep.InputInstance
  declare type ElSelectInstance = InstanceType<typeof ep.ElSelect>
  declare type ElDialogInstance = InstanceType<typeof ep.ElDialog>
  // ... 更多组件实例类型
  
  // 组件属性类型
  declare type ElFormRules = ep.FormRules
  declare type ElUploadFile = ep.UploadFile
  declare type ElTreeNodeData = ep.TreeNodeData
  // ... 更多属性类型
}
```

**使用示例：**
```vue
<script setup lang="ts">
// 直接使用全局类型，无需导入
const formRef = ref<ElFormInstance>()
const tableRef = ref<ElTableInstance>()
const uploadRef = ref<ElUploadInstance>()

const formRules: ElFormRules = {
  name: [{ required: true, message: '请输入姓名' }]
}

// 组件方法调用
const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      console.log('表单验证通过')
    }
  })
}

const handleUpload = () => {
  uploadRef.value?.submit()
}
</script>
```

### 路由类型扩展

```typescript
// src/types/router.d.ts
declare module 'vue-router' {
  interface RouteMeta extends VRouteMeta {
    link?: string          // 外部链接
    title?: string         // 路由标题
    affix?: boolean        // 是否固定在标签栏
    noCache?: boolean      // 是否不缓存
    activeMenu?: string    // 高亮对应的侧边栏
    icon?: string          // 路由图标
    breadcrumb?: boolean   // 是否显示在面包屑
    i18nKey?: string       // 国际化键
  }

  interface _RouteRecordBase {
    hidden?: boolean | string | number  // 是否隐藏
    permissions?: string[]              // 访问权限
    roles?: string[]                    // 访问角色
    alwaysShow?: boolean                // 总是显示根路由
    query?: string                      // 默认传递参数
    parentPath?: string                 // 父路由路径
  }

  interface TagView {
    fullPath?: string
    name?: string
    path?: string
    title?: string
    meta?: RouteMeta
    query?: LocationQuery
  }
}
```

### HTTP 请求类型扩展

```typescript
// src/types/http.d.ts
interface CustomHeaders {
  auth?: boolean          // 是否需要认证，默认 true
  tenant?: boolean        // 是否需要租户ID，默认 true
  repeatSubmit?: boolean  // 是否防止重复提交，默认 true
  isEncrypt?: boolean     // 是否加密请求数据
  [key: string]: any      // 其他自定义头部
}
```

## IDE 集成配置

### VS Code 配置

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

### WebStorm 配置

- 启用 TypeScript 服务
- 配置代码风格为项目 TypeScript 规范
- 启用自动导入和重构功能

## 最佳实践

### ✅ 类型定义规范

```typescript
// 良好的类型定义
interface UserInfo {
  id: number
  username: string
  email: string | null
  avatar?: string  // 可选属性
}

// 使用泛型提高复用性
interface ApiResult<T> {
  code: number
  data: T
  message: string
}

// 联合类型
type Theme = 'light' | 'dark'
type Status = 'pending' | 'success' | 'error'
```

### ✅ 渐进式类型化

```typescript
// 从 any 开始，逐步细化类型
let userConfig: any = getUserConfig()  // 临时使用 any

// 后续优化为具体类型
interface UserConfig {
  theme: Theme
  language: string
  notifications: boolean
}
let userConfig: UserConfig = getUserConfig()
```

### ✅ 类型守卫

```typescript
// 类型守卫函数
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

// 使用类型守卫
function processValue(value: unknown) {
  if (isString(value)) {
    // 这里 TypeScript 知道 value 是 string 类型
    console.log(value.toUpperCase())
  }
}
```

## 总结

Ruoyi-Plus-Uniapp 的 TypeScript 配置注重实用性和开发体验：

- ✅ **适度严格**：既保证类型安全又保持灵活性
- ✅ **自动化**：通过插件自动生成类型声明
- ✅ **渐进式**：支持从 JavaScript 逐步迁移
- ✅ **IDE 友好**：完善的智能提示和重构支持

这种配置策略既满足了大型项目的类型安全需求，又保证了良好的开发体验。
