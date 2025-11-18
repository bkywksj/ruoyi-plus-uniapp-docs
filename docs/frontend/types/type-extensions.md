# TypeScript 类型扩展

## 介绍

TypeScript 类型扩展是 RuoYi-Plus 前端框架中的核心类型系统,通过模块声明和接口合并等技术,为项目提供全面的类型安全保障。该系统整合了全局类型定义、第三方库类型扩展、环境变量类型、路由类型等多个层面的类型支持,确保开发过程中的类型安全性和开发体验。

**核心特性:**

- **全局类型系统** - 定义了 API 响应、分页数据、UI 配置等全局通用类型,无需导入即可使用
- **第三方库扩展** - 扩展 Vue Router、Axios、Element Plus 等第三方库的类型定义
- **环境变量类型** - 为所有环境变量提供完整的类型检查,避免配置错误
- **自动化类型生成** - 通过 Vite 插件自动生成图标、组件等类型定义
- **IDE 友好** - 完整的 JSDoc 注释和类型提示,提升开发效率
- **类型安全** - 启用 TypeScript 严格模式,确保代码质量

## 全局类型定义

### API 响应类型

#### Result 类型

统一的 API 响应格式,采用 Promise 元组结构 `[错误, 数据]`:

```typescript
/**
 * 统一 API 响应类型
 * @template T 响应数据的类型
 * @returns Promise<[Error | null, T | null]>
 */
declare type Result<T = any> = Promise<[Error | null, T | null]>

// 使用示例
const [error, data] = await api.getUserList()
if (error) {
  ElMessage.error(error.message)
  return
}
// data 的类型由泛型 T 决定
console.log(data)
```

**技术实现:**

- 采用 `[Error, Data]` 元组结构,避免 try-catch 嵌套
- 返回 Promise 类型,支持 async/await
- 支持泛型参数,提供灵活的类型推导

#### R 类型

标准 API 响应结构,包含状态码、消息和数据:

```typescript
/**
 * 标准 API 响应结构
 * @template T 数据字段的类型
 */
declare interface R<T = any> {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: T
}

// 使用示例
interface User {
  id: number
  name: string
}

const response: R<User> = await fetch('/api/user/1')
if (response.code === 200) {
  console.log(response.data.name) // 类型安全
}
```

**类型说明:**

- `code` - 响应状态码(200表示成功)
- `msg` - 响应消息文本
- `data` - 业务数据,类型由泛型 T 指定

#### PageResult 类型

标准化的分页响应数据结构:

```typescript
/**
 * 分页响应数据类型
 * @template T 列表项的类型
 */
declare interface PageResult<T = any> {
  /** 数据记录列表 */
  records: T[]
  /** 总记录数 */
  total: number
  /** 总页数 */
  pages: number
  /** 当前页码 */
  current: number
  /** 每页大小 */
  size: number
  /** 是否为最后一页 */
  last: boolean
}

// 使用示例
interface User {
  id: number
  name: string
}

const pageData: PageResult<User> = await api.getUserList({
  pageNum: 1,
  pageSize: 10
})

console.log(pageData.records) // User[]
console.log(pageData.total)   // number
```

**字段说明:**

| 字段 | 类型 | 说明 |
|------|------|------|
| records | `T[]` | 当前页数据记录列表 |
| total | `number` | 总记录数 |
| pages | `number` | 总页数 |
| current | `number` | 当前页码(从1开始) |
| size | `number` | 每页显示记录数 |
| last | `boolean` | 是否为最后一页 |

#### PageQuery 类型

分页查询基础参数:

```typescript
/**
 * 分页查询基础参数
 */
declare interface PageQuery {
  /** 当前页码,从1开始 */
  pageNum?: number
  /** 每页显示记录数 */
  pageSize?: number
  /** 排序字段 */
  orderByColumn?: string
  /** 排序方向 asc/desc */
  isAsc?: string
  /** 模糊搜索关键词 */
  searchValue?: string
  /** 扩展查询参数 */
  params?: Record<string, any>
}

// 使用示例
const query: PageQuery = {
  pageNum: 1,
  pageSize: 20,
  orderByColumn: 'createTime',
  isAsc: 'desc',
  searchValue: 'admin',
  params: {
    status: '1',
    deptId: 100
  }
}
```

### UI 配置类型

#### FieldVisibilityConfig 类型

字段可见性配置,用于控制表格列、表单字段的显示/隐藏:

```typescript
/**
 * 字段可见性配置
 */
declare interface FieldVisibilityConfig {
  /** 字段唯一标识 */
  key: string | number
  /** 字段名称 */
  field: string
  /** 字段显示标签 */
  label: string
  /** 是否可见 */
  visible: boolean
  /** 子字段配置,支持层级结构 */
  children?: Array<FieldVisibilityConfig>
}

// 使用示例 - 表格列配置
const columns: FieldVisibilityConfig[] = [
  { key: 0, field: 'userId', label: '用户ID', visible: false, children: [] },
  { key: 1, field: 'userName', label: '用户名称', visible: true, children: [] },
  {
    key: 2,
    field: 'contactInfo',
    label: '联系信息',
    visible: true,
    children: [
      { key: 3, field: 'email', label: '邮箱', visible: true, children: [] },
      { key: 4, field: 'phone', label: '手机号', visible: true, children: [] }
    ]
  }
]
```

**应用场景:**

- TableToolbar 组件的列管理
- 动态表单字段显示控制
- 详情页面字段展示配置

#### DialogState 类型

弹窗状态配置:

```typescript
/**
 * 弹窗状态配置
 */
declare interface DialogState {
  /** 弹窗标题 */
  title?: string
  /** 弹窗是否显示 */
  visible: boolean
}

// 使用示例
const dialog = reactive<DialogState>({
  title: '新增用户',
  visible: false
})

const openDialog = () => {
  dialog.title = '编辑用户'
  dialog.visible = true
}

const closeDialog = () => {
  dialog.visible = false
}
```

#### DictItem 类型

字典数据项配置:

```typescript
/**
 * 字典项配置
 */
declare interface DictItem {
  /** 显示标签文本 */
  label: string
  /** 实际存储的值 */
  value: string
  /** 状态标识 */
  status?: string
  /** Element UI Tag 组件的类型 */
  elTagType?: ElTagType
  /** Element UI Tag 组件的自定义类名 */
  elTagClass?: string
}

// 使用示例
const statusOptions: DictItem[] = [
  { label: '正常', value: '0', elTagType: 'success' },
  { label: '停用', value: '1', elTagType: 'danger' },
  { label: '未知', value: '2', elTagType: 'info' }
]

// 在组件中使用
const getStatusTag = (status: string) => {
  const item = statusOptions.find(opt => opt.value === status)
  return item
}
```

#### FieldConfig 类型

字段配置接口,支持多种显示类型:

```typescript
/**
 * 字段配置接口
 */
declare interface FieldConfig {
  /** 字段属性名,支持嵌套如 'user.name' */
  prop: string
  /** 字段显示标签 */
  label: string
  /** 字段占用列数 */
  span?: number
  /** 自定义插槽名称 */
  slot?: string
  /** 自定义格式化函数 */
  formatter?: (value: any, data: any) => string
  /** 数据类型 */
  type?: 'text' | 'copyable' | 'date' | 'datetime' | 'currency' |
         'boolean' | 'array' | 'dict' | 'image' | 'password' |
         'html' | 'file'
  /** 字典选项 */
  dictOptions?: DictItem[]
  /** 图片预览配置 */
  imageConfig?: {
    width?: number | string
    height?: number | string
    showAll?: boolean
    layout?: 'flex' | 'grid'
    columns?: number
    maxShow?: number
    gap?: number
  }
  /** 是否隐藏字段 */
  hidden?: boolean | ((data: any) => boolean)
  /** 分组名称 */
  group?: string
  /** 是否不参与打印 */
  noPrint?: boolean
}

// 使用示例 - 详情页配置
const detailConfig: FieldConfig[] = [
  { prop: 'userName', label: '用户名称', type: 'text' },
  { prop: 'avatar', label: '头像', type: 'image' },
  {
    prop: 'status',
    label: '状态',
    type: 'dict',
    dictOptions: statusOptions
  },
  {
    prop: 'createTime',
    label: '创建时间',
    type: 'datetime'
  },
  {
    prop: 'password',
    label: '密码',
    type: 'password',
    noPrint: true  // 不参与打印
  }
]
```

**支持的数据类型:**

| 类型 | 说明 | 示例 |
|------|------|------|
| `text` | 普通文本 | 用户名称 |
| `copyable` | 可复制文本 | API Key |
| `date` | 日期 | 2024-01-01 |
| `datetime` | 日期时间 | 2024-01-01 12:00:00 |
| `currency` | 货币 | ¥1,000.00 |
| `boolean` | 布尔值 | 是/否 |
| `array` | 数组 | 标签1, 标签2 |
| `dict` | 字典 | 正常/停用 |
| `image` | 图片 | 缩略图预览 |
| `password` | 密码 | ****** |
| `html` | HTML内容 | 富文本 |
| `file` | 文件 | 文件链接 |

#### ResponsiveSpan 类型

响应式 Span 配置:

```typescript
/**
 * 响应式 Span 配置接口
 */
declare interface ResponsiveSpan {
  /** 超小屏幕 <768px */
  xs?: number
  /** 小屏幕 ≥768px */
  sm?: number
  /** 中等屏幕 ≥992px */
  md?: number
  /** 大屏幕 ≥1200px */
  lg?: number
  /** 超大屏幕 ≥1920px */
  xl?: number
}

/**
 * Span 属性类型
 */
declare type SpanType = number | ResponsiveSpan | 'auto' | undefined

// 使用示例
const formItemSpan: ResponsiveSpan = {
  xs: 24,  // 手机端占满整行
  sm: 12,  // 平板占半行
  md: 8,   // 桌面占1/3
  lg: 6,   // 大屏占1/4
  xl: 4    // 超大屏占1/6
}
```

## Vue Router 类型扩展

### RouteMeta 接口扩展

扩展 Vue Router 的 `RouteMeta` 接口,添加自定义路由元数据:

```typescript
declare module 'vue-router' {
  /**
   * 路由元数据接口
   */
  interface RouteMeta {
    /** 外部链接 */
    link?: string
    /** 路由标题 */
    title?: string
    /** 是否固定在标签栏 */
    affix?: boolean
    /** 是否不缓存 */
    noCache?: boolean
    /** 高亮的侧边栏路径 */
    activeMenu?: string
    /** 路由图标 */
    icon?: IconCode
    /** 是否在面包屑中显示 */
    breadcrumb?: boolean
    /** 国际化键 */
    i18nKey?: string
  }
}
```

**使用示例:**

```typescript
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: Layout,
    meta: {
      title: '用户管理',
      icon: 'user',
      affix: false,
      noCache: false,
      breadcrumb: true
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/user/index.vue'),
        meta: {
          title: '用户列表',
          icon: 'list',
          activeMenu: '/user'  // 高亮父级菜单
        }
      }
    ]
  }
]
```

**属性说明:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| link | `string` | - | 外部链接地址 |
| title | `string` | - | 路由标题,显示在侧边栏、面包屑等 |
| affix | `boolean` | `false` | 是否固定在标签栏,不可关闭 |
| noCache | `boolean` | `false` | 是否不缓存该路由组件 |
| activeMenu | `string` | - | 高亮的侧边栏路径 |
| icon | `IconCode` | - | 路由图标代码 |
| breadcrumb | `boolean` | `true` | 是否在面包屑中显示 |
| i18nKey | `string` | - | 国际化键,用于多语言 |

### _RouteRecordBase 接口扩展

扩展路由记录基础接口,添加权限控制:

```typescript
declare module 'vue-router' {
  interface _RouteRecordBase {
    /** 是否隐藏 */
    hidden?: boolean | string | number
    /** 访问权限标识 */
    permissions?: string[]
    /** 访问角色 */
    roles?: string[]
    /** 总是显示根路由 */
    alwaysShow?: boolean
    /** 默认查询参数 */
    query?: string
    /** 父路由路径 */
    parentPath?: string
  }
}
```

**使用示例:**

```typescript
const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout,
    hidden: false,  // 不隐藏
    alwaysShow: true,  // 总是显示根路由
    permissions: ['system:user:list'],  // 需要权限
    roles: ['admin', 'editor'],  // 需要角色
    meta: {
      title: '系统管理',
      icon: 'system'
    },
    children: [...]
  }
]
```

### TagView 接口

标签页导航路由视图:

```typescript
declare module 'vue-router' {
  interface TagView {
    /** 完整路径 */
    fullPath?: string
    /** 路由名称 */
    name?: string
    /** 路由路径 */
    path?: string
    /** 路由标题 */
    title?: string
    /** 路由元数据 */
    meta?: RouteMeta
    /** 路由查询参数 */
    query?: LocationQuery
  }
}
```

**使用示例:**

```typescript
import { useTagsViewStore } from '@/stores/tagsView'

const tagsViewStore = useTagsViewStore()
const route = useRoute()

// 添加标签页
const addTag = () => {
  const tag: TagView = {
    fullPath: route.fullPath,
    name: route.name as string,
    path: route.path,
    title: route.meta?.title,
    meta: route.meta,
    query: route.query
  }
  tagsViewStore.addView(tag)
}

// 关闭标签页
const closeTag = (view: TagView) => {
  tagsViewStore.delView(view)
}
```

## 环境变量类型扩展

### ImportMetaEnv 接口

为 Vite 项目的环境变量提供类型检查:

```typescript
/**
 * 环境变量类型定义
 */
interface ImportMetaEnv {
  /** 页面标题 */
  VITE_APP_TITLE: string
  /** 应用ID */
  VITE_APP_ID: string
  /** 运行环境 */
  VITE_APP_ENV: 'development' | 'production'
  /** API基础路径 */
  VITE_APP_BASE_API: string
  /** 后端服务端口 */
  VITE_APP_BASE_API_PORT: number
  /** 应用访问路径前缀 */
  VITE_APP_CONTEXT_PATH: string
  /** 是否开启前台首页 */
  VITE_ENABLE_FRONTEND: string
  /** 监控系统地址 */
  VITE_APP_MONITOR_ADMIN: string
  /** SnailJob 任务调度地址 */
  VITE_APP_SNAILJOB_ADMIN: string
  /** 仓库地址 */
  VITE_APP_GIT_URL: string
  /** 文档地址 */
  VITE_APP_DOC_URL: string
  /** 是否开启打包压缩 */
  VITE_BUILD_COMPRESS: number
  /** 开发服务器端口 */
  VITE_APP_PORT: number
  /** 接口加密开关 */
  VITE_APP_API_ENCRYPT: string
  /** RSA 公钥 */
  VITE_APP_RSA_PUBLIC_KEY: string
  /** RSA 私钥 */
  VITE_APP_RSA_PRIVATE_KEY: string
  /** WebSocket开关 */
  VITE_APP_WEBSOCKET: string
  /** SSE开关 */
  VITE_APP_SSE: string
}

/**
 * ImportMeta 扩展
 */
interface ImportMeta {
  /** 环境变量对象 */
  readonly env: ImportMetaEnv
}
```

**使用示例:**

```typescript
// 访问环境变量 - 类型安全
const apiUrl = import.meta.env.VITE_APP_BASE_API  // string
const apiPort = import.meta.env.VITE_APP_BASE_API_PORT  // number
const isDev = import.meta.env.VITE_APP_ENV === 'development'  // boolean

// TypeScript 会检查环境变量是否存在
// import.meta.env.VITE_UNKNOWN_VAR  // ✗ 类型错误

// 在配置中使用
export default defineConfig({
  server: {
    port: import.meta.env.VITE_APP_PORT,
    proxy: {
      '/api': {
        target: `${import.meta.env.VITE_APP_BASE_API}:${import.meta.env.VITE_APP_BASE_API_PORT}`,
        changeOrigin: true
      }
    }
  }
})
```

**环境变量分类:**

| 分类 | 环境变量 | 用途 |
|------|----------|------|
| **应用配置** | `VITE_APP_TITLE` | 页面标题 |
| | `VITE_APP_ID` | 应用唯一标识 |
| | `VITE_APP_ENV` | 运行环境 |
| **API配置** | `VITE_APP_BASE_API` | API基础路径 |
| | `VITE_APP_BASE_API_PORT` | 后端端口 |
| | `VITE_APP_CONTEXT_PATH` | 路径前缀 |
| **加密配置** | `VITE_APP_API_ENCRYPT` | 加密开关 |
| | `VITE_APP_RSA_PUBLIC_KEY` | RSA公钥 |
| | `VITE_APP_RSA_PRIVATE_KEY` | RSA私钥 |
| **功能开关** | `VITE_APP_WEBSOCKET` | WebSocket |
| | `VITE_APP_SSE` | Server-Sent Events |
| **外部服务** | `VITE_APP_MONITOR_ADMIN` | 监控系统 |
| | `VITE_APP_SNAILJOB_ADMIN` | 任务调度 |
| | `VITE_APP_DOC_URL` | 文档地址 |

## 组件实例类型

### Vue 组件实例

```typescript
import type { ComponentInternalInstance } from 'vue'

declare global {
  /** Vue 组件实例类型 */
  declare type ComponentInternalInstance = ComponentInstance
}

// 使用示例
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance() as ComponentInternalInstance
console.log(instance.proxy)  // 组件代理对象
```

## Element Plus 类型扩展

### 全局组件类型注册

通过模块声明扩展,将自定义组件注册为全局类型:

```typescript
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    Icon: typeof import('@/components/Icon/Icon.vue')['default']
    IconSelect: typeof import('@/components/Icon/IconSelect.vue')['default']
    TableToolbar: typeof import('@/components/TableToolbar/TableToolbar.vue')['default']
    // ... 更多自定义组件
  }
}
```

**使用效果:**

```vue
<template>
  <!-- 无需导入,直接使用,且有类型提示 -->
  <Icon code="user" />
  <IconSelect v-model="icon" />
  <TableToolbar v-model:showSearch="showSearch" />
</template>

<script lang="ts" setup>
// 无需导入组件
const icon = ref<IconCode>('user')
const showSearch = ref(true)
</script>
```

### Element Plus 组件实例类型

项目中定义了所有 Element Plus 组件的实例类型:

```typescript
// 表单组件
type ElFormInstance = InstanceType<typeof import('element-plus')['ElForm']>
type ElInputInstance = InstanceType<typeof import('element-plus')['ElInput']>
type ElSelectInstance = InstanceType<typeof import('element-plus')['ElSelect']>

// 数据展示
type ElTableInstance = InstanceType<typeof import('element-plus')['ElTable']>
type ElTreeInstance = InstanceType<typeof import('element-plus')['ElTree']>

// 反馈组件
type ElDialogInstance = InstanceType<typeof import('element-plus')['ElDialog']>
type ElDrawerInstance = InstanceType<typeof import('element-plus')['ElDrawer']>

// 使用示例
const formRef = ref<ElFormInstance>()
const tableRef = ref<ElTableInstance>()

// 调用组件方法 - 类型安全
const validate = async () => {
  await formRef.value?.validate()
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
}
```

## 自动化类型生成

### 图标类型自动生成

通过 Vite 插件自动扫描图标资源,生成类型定义:

```typescript
// vite/plugins/iconfont-types.ts
export function createIconfontTypes(): Plugin {
  return {
    name: 'vite-plugin-iconfont-types',

    buildStart() {
      // 扫描 src/assets/icons 目录
      // 解析 iconfont.json 和 preset.json
      // 生成 src/types/icons.d.ts
    },

    handleHotUpdate({ file }) {
      // 监听图标文件变化,自动重新生成
      if (file.includes('assets/icons')) {
        this.buildStart()
      }
    }
  }
}
```

**生成的类型定义:**

```typescript
// src/types/icons.d.ts (自动生成)
declare global {
  /** 图标代码类型 - 包含所有可用图标 */
  type IconCode =
    | 'user'
    | 'search'
    | 'settings'
    // ... 共 817 个图标

  /** 图标项接口 */
  interface IconItem {
    code: string
    name: string
    type: 'iconfont' | 'iconify'
    value?: string
  }
}

// 导出图标列表和工具函数
export const ALL_ICONS: IconItem[]
export const ICONFONT_ICONS: IconItem[]
export const ICONIFY_ICONS: IconItem[]

export function isIconfontIcon(code: string): boolean
export function isIconifyIcon(code: string): boolean
export function getIconifyValue(code: string): string | undefined
export function searchIcons(query: string): IconItem[]
```

### 组件类型自动注册

通过 `unplugin-vue-components` 插件自动生成组件类型:

```typescript
// vite.config.ts
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    Components({
      dts: 'src/types/components.d.ts',  // 类型定义输出路径
      dirs: ['src/components'],  // 组件目录
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/]
    })
  ]
})
```

**生成的类型定义:**

```typescript
// src/types/components.d.ts (自动生成)
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    // 自定义组件
    Icon: typeof import('@/components/Icon/Icon.vue')['default']
    IconSelect: typeof import('@/components/Icon/IconSelect.vue')['default']
    TableToolbar: typeof import('@/components/TableToolbar/TableToolbar.vue')['default']

    // Element Plus 组件
    ElButton: typeof import('element-plus/es')['ElButton']
    ElInput: typeof import('element-plus/es')['ElInput']
    // ... 所有使用的 Element Plus 组件

    // Vue Router 组件
    RouterLink: typeof import('vue-router')['RouterLink']
    RouterView: typeof import('vue-router')['RouterView']
  }
}
```

### API 自动导入类型

通过 `unplugin-auto-import` 插件自动生成全局 API 类型:

```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    AutoImport({
      dts: 'src/types/auto-imports.d.ts',
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        {
          'element-plus': [
            'ElMessage',
            'ElMessageBox',
            'ElNotification'
          ]
        }
      ],
      dirs: [
        'src/composables',
        'src/stores'
      ]
    })
  ]
})
```

**生成的类型定义:**

```typescript
// src/types/auto-imports.d.ts (自动生成)
export {}

declare global {
  // Vue 核心 API
  const ref: typeof import('vue')['ref']
  const computed: typeof import('vue')['computed']
  const reactive: typeof import('vue')['reactive']
  const watch: typeof import('vue')['watch']

  // VueUse
  const useStorage: typeof import('@vueuse/core')['useStorage']
  const useClipboard: typeof import('@vueuse/core')['useClipboard']

  // Element Plus
  const ElMessage: typeof import('element-plus')['ElMessage']
  const ElMessageBox: typeof import('element-plus')['ElMessageBox']

  // 自定义 Composables
  const useHttp: typeof import('@/composables/useHttp')['useHttp']
  const useAuth: typeof import('@/composables/useAuth')['useAuth']

  // 自定义 Stores
  const useUserStore: typeof import('@/stores/user')['useUserStore']
  const useDictStore: typeof import('@/stores/dict')['useDictStore']
}
```

**使用效果:**

```vue
<script lang="ts" setup>
// 无需导入,直接使用
const count = ref(0)  // Vue ref
const route = useRoute()  // Vue Router
const userStore = useUserStore()  // Pinia Store

// 全局 API - 无需导入
ElMessage.success('操作成功')
ElMessageBox.confirm('确认删除?')
</script>
```

## TypeScript 配置

### tsconfig.json 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["node", "vite/client"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "vite.config.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

**关键配置说明:**

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `target` | `ES2020` | 编译目标 |
| `module` | `ESNext` | 模块系统 |
| `moduleResolution` | `bundler` | 适用于 Vite |
| `strict` | `true` | 启用严格模式 |
| `baseUrl` | `.` | 路径解析基础路径 |
| `paths` | `@/*: ./src/*` | 路径别名 |
| `types` | `node, vite/client` | 包含的类型库 |

## API

### 全局类型定义汇总

#### API 响应类型

```typescript
// API 响应类型
type Result<T = any> = Promise<[Error | null, T | null]>

interface R<T = any> {
  code: number
  msg: string
  data: T
}

interface PageResult<T = any> {
  records: T[]
  total: number
  pages: number
  current: number
  size: number
  last: boolean
}

interface PageQuery {
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: string
  searchValue?: string
  params?: Record<string, any>
}
```

#### UI 配置类型

```typescript
// UI 配置类型
interface FieldVisibilityConfig {
  key: string | number
  field: string
  label: string
  visible: boolean
  children?: Array<FieldVisibilityConfig>
}

interface DialogState {
  title?: string
  visible: boolean
}

interface DictItem {
  label: string
  value: string
  status?: string
  elTagType?: ElTagType
  elTagClass?: string
}

interface FieldConfig {
  prop: string
  label: string
  span?: number
  slot?: string
  formatter?: (value: any, data: any) => string
  type?: 'text' | 'copyable' | 'date' | 'datetime' | 'currency' |
         'boolean' | 'array' | 'dict' | 'image' | 'password' |
         'html' | 'file'
  dictOptions?: DictItem[]
  imageConfig?: {...}
  hidden?: boolean | ((data: any) => boolean)
  group?: string
  noPrint?: boolean
}

interface ResponsiveSpan {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

type SpanType = number | ResponsiveSpan | 'auto' | undefined
```

### 模块扩展类型

#### Vue Router

```typescript
declare module 'vue-router' {
  interface RouteMeta {
    link?: string
    title?: string
    affix?: boolean
    noCache?: boolean
    activeMenu?: string
    icon?: IconCode
    breadcrumb?: boolean
    i18nKey?: string
  }

  interface _RouteRecordBase {
    hidden?: boolean | string | number
    permissions?: string[]
    roles?: string[]
    alwaysShow?: boolean
    query?: string
    parentPath?: string
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

#### 环境变量

```typescript
interface ImportMetaEnv {
  VITE_APP_TITLE: string
  VITE_APP_ID: string
  VITE_APP_ENV: 'development' | 'production'
  VITE_APP_BASE_API: string
  VITE_APP_BASE_API_PORT: number
  VITE_APP_CONTEXT_PATH: string
  // ... 更多环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 最佳实践

### 1. 优先使用全局类型

```typescript
// ✅ 推荐: 使用全局类型,无需导入
const query: PageQuery = {
  pageNum: 1,
  pageSize: 10
}

const [error, data] = await api.getUserList(query) as Result<PageResult<User>>

// ❌ 不推荐: 重复定义类型
interface MyPageQuery {
  pageNum?: number
  pageSize?: number
}
```

### 2. 充分利用类型推导

```typescript
// ✅ 推荐: 利用泛型类型推导
const fetchUser = async (id: number): Result<User> => {
  return api.getUser(id)
}

const [error, user] = await fetchUser(1)
// user 类型自动推导为 User | null

// ❌ 不推荐: 手动类型断言
const [error, user] = await fetchUser(1)
const userData = user as User  // 不安全
```

### 3. 使用响应式配置

```typescript
// ✅ 推荐: 使用 ResponsiveSpan
const formItemSpan: ResponsiveSpan = {
  xs: 24,
  sm: 12,
  md: 8,
  lg: 6
}

// ❌ 不推荐: 固定数值
const formItemSpan = 8  // 不响应式
```

### 4. 合理使用 FieldConfig

```typescript
// ✅ 推荐: 完整的字段配置
const detailFields: FieldConfig[] = [
  {
    prop: 'status',
    label: '状态',
    type: 'dict',
    dictOptions: statusOptions,
    formatter: (value) => value === '0' ? '正常' : '停用'
  },
  {
    prop: 'password',
    label: '密码',
    type: 'password',
    noPrint: true,  // 敏感信息不打印
    hidden: (data) => !data.isAdmin  // 动态隐藏
  }
]

// ❌ 不推荐: 缺少必要配置
const detailFields: FieldConfig[] = [
  { prop: 'status', label: '状态' },  // 缺少 type 和 dictOptions
  { prop: 'password', label: '密码' }  // 敏感信息未处理
]
```

### 5. 环境变量使用

```typescript
// ✅ 推荐: 使用环境变量类型
const apiUrl = import.meta.env.VITE_APP_BASE_API
const isDev = import.meta.env.VITE_APP_ENV === 'development'

// 在配置文件中统一管理
export const config = {
  apiUrl: import.meta.env.VITE_APP_BASE_API,
  apiPort: import.meta.env.VITE_APP_BASE_API_PORT,
  title: import.meta.env.VITE_APP_TITLE
}

// ❌ 不推荐: 硬编码配置
const apiUrl = 'http://localhost:8080'  // 不灵活
const title = 'RuoYi-Plus'  // 不统一
```

## 常见问题

### 1. 类型未定义错误

**问题原因:**

- 类型声明文件未被 TypeScript 识别
- `tsconfig.json` 配置错误

**解决方案:**

```json
// tsconfig.json
{
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "src/types/**/*.d.ts"  // ✅ 确保包含类型声明文件
  ]
}
```

```bash
# 重启 TypeScript 服务器
# VS Code: Ctrl+Shift+P -> TypeScript: Restart TS Server
```

### 2. 环境变量类型错误

**问题原因:**

- `.env` 文件中的变量未添加到类型定义
- 环境变量名称拼写错误

**解决方案:**

```typescript
// ✅ 1. 在 env.d.ts 中添加类型定义
interface ImportMetaEnv {
  VITE_APP_NEW_CONFIG: string  // 新增环境变量
}

// ✅ 2. 在 .env 文件中添加变量
// VITE_APP_NEW_CONFIG=value

// ✅ 3. 重启开发服务器
// pnpm dev
```

### 3. 路由类型扩展不生效

**问题原因:**

- 模块声明顺序错误
- 类型定义文件未导出

**解决方案:**

```typescript
// ✅ router.d.ts
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

export {}  // ✅ 必须有导出语句

// ❌ 错误写法 - 缺少 export
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}
// 缺少 export {}
```

### 4. 全局类型未生效

**问题原因:**

- 类型声明在 `declare global` 块外部
- 类型文件未被包含

**解决方案:**

```typescript
// ✅ 正确写法
declare global {
  interface MyGlobalType {
    name: string
  }
}

export {}  // 必须导出

// ❌ 错误写法
interface MyGlobalType {  // 不在 global 块内
  name: string
}
```

### 5. 组件自动导入失败

**问题原因:**

- 组件路径配置错误
- 自动生成的类型文件损坏

**解决方案:**

```typescript
// ✅ 检查 vite.config.ts
Components({
  dts: 'src/types/components.d.ts',
  dirs: ['src/components'],  // ✅ 确保路径正确
  extensions: ['vue']
})

// ✅ 删除自动生成的类型文件,重新生成
// 1. 删除 src/types/components.d.ts
// 2. 重启开发服务器: pnpm dev
// 3. 类型文件会自动重新生成
```

### 6. 图标类型未更新

**问题原因:**

- 图标类型生成插件未运行
- 图标资源文件格式错误

**解决方案:**

```bash
# ✅ 1. 检查图标文件格式
# src/assets/icons/system/iconfont.json
# src/assets/icons/iconify/preset.json

# ✅ 2. 重新生成类型
pnpm dev  # 开发服务器会自动生成

# ✅ 3. 手动触发生成
# 修改图标文件后保存,触发 HMR
```

## 性能优化

### 类型检查优化

```json
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true,  // 跳过库文件检查
    "incremental": true,  // 增量编译
    "tsBuildInfoFile": ".tsbuildinfo"  // 缓存文件
  }
}
```

### 自动生成类型优化

```typescript
// vite.config.ts
AutoImport({
  dts: 'src/types/auto-imports.d.ts',
  cache: true,  // 启用缓存
  eslintrc: {
    enabled: true,  // 生成 ESLint 配置
    filepath: './.eslintrc-auto-import.json'
  }
})
```

## 总结

TypeScript 类型扩展系统是 RuoYi-Plus 前端框架的核心基础设施,提供了完整的类型安全保障:

1. **全局类型系统** - 统一的 API 响应、UI 配置等全局类型
2. **第三方库扩展** - 扩展 Vue Router、Element Plus 等库的类型
3. **环境变量类型** - 完整的环境变量类型检查
4. **自动化生成** - 图标、组件、API 类型自动生成
5. **类型安全** - 严格的 TypeScript 配置,确保代码质量

合理使用类型扩展系统可以大幅提升开发效率,减少运行时错误,建议在项目中充分利用这些类型定义。
