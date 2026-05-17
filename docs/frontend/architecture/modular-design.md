# 模块化设计

## 介绍

RuoYi-Plus-UniApp 前端框架采用高度模块化的架构设计，通过清晰的分层结构、明确的职责边界和灵活的模块通信机制，实现了代码的高内聚、低耦合。这种设计理念贯穿整个项目，从基础配置到业务组件，从工具函数到状态管理，每个模块都有其明确的定位和职责。

**核心设计理念：**

- **分层解耦** - 按职责垂直分层，每层只关注自身逻辑，通过定义良好的接口与其他层交互
- **单一职责** - 每个模块只负责一个功能域，避免功能混杂导致的维护困难
- **可组合性** - 小模块可以灵活组合形成复杂功能，支持按需加载和 Tree Shaking
- **类型安全** - 全面采用 TypeScript，通过接口定义模块边界，编译时发现问题
- **可测试性** - 模块独立性高，便于编写单元测试和集成测试

**架构优势：**

1. **开发效率** - 职责清晰，开发者可以快速定位代码位置
2. **团队协作** - 模块边界明确，多人并行开发互不干扰
3. **代码复用** - 高度抽象的模块可以在多个项目间复用
4. **维护成本** - 修改影响范围可控，降低回归风险
5. **扩展性强** - 新增功能只需添加新模块，无需修改现有代码

## 模块化架构总览

### 架构层次图

```text
┌─────────────────────────────────────────────────────────────────┐
│                        📱 应用层 (App)                           │
│  main.ts: 应用入口，负责初始化和插件注册                          │
├─────────────────────────────────────────────────────────────────┤
│                        🎨 布局层 (Layouts)                       │
│  Layout.vue / HomeLayout.vue: 页面骨架，包含导航、侧边栏等        │
├─────────────────────────────────────────────────────────────────┤
│                        📄 页面层 (Views)                         │
│  业务页面组件，每个页面对应一个视图模块                           │
├─────────────────────────────────────────────────────────────────┤
│                        🧩 组件层 (Components)                    │
│  基础组件 (A*) / 业务组件 / 布局组件                              │
├─────────────────────────────────────────────────────────────────┤
│                        🎣 逻辑层 (Composables)                   │
│  组合式函数：useAuth / useDict / useHttp / useDialog 等          │
├─────────────────────────────────────────────────────────────────┤
│                        📦 状态层 (Stores)                        │
│  Pinia 状态管理：user / permission / theme / dict / tagsView    │
├─────────────────────────────────────────────────────────────────┤
│                        📡 接口层 (API)                           │
│  API 接口模块：按业务域划分，统一请求处理                         │
├─────────────────────────────────────────────────────────────────┤
│                        🛠️ 工具层 (Utils)                         │
│  纯函数工具：string / object / date / format / validators 等     │
├─────────────────────────────────────────────────────────────────┤
│                        📋 类型层 (Types)                         │
│  TypeScript 类型定义：API 类型 / 组件 Props / 全局类型            │
├─────────────────────────────────────────────────────────────────┤
│                        🔧 配置层 (Config)                        │
│  systemConfig.ts / 环境变量 / 构建配置                           │
└─────────────────────────────────────────────────────────────────┘
```

### 目录结构详解

```text
src/
├── api/                      # 📡 API 接口层
│   ├── business/            # 业务相关接口
│   │   ├── base/           # 基础业务（客户、订单等）
│   │   └── mall/           # 商城业务
│   ├── common/              # 通用接口
│   │   └── captchaApi.ts   # 验证码接口
│   ├── system/              # 系统管理接口
│   │   ├── auth/           # 认证授权
│   │   ├── core/           # 核心功能（用户、角色、菜单等）
│   │   └── monitor/        # 系统监控
│   ├── tool/                # 工具相关接口
│   │   └── gen/            # 代码生成
│   └── workflow/            # 工作流接口
│       ├── model/          # 流程模型
│       └── task/           # 任务管理
│
├── assets/                   # 🎨 静态资源层
│   ├── icons/               # 图标资源
│   │   ├── biz/            # 业务图标
│   │   └── system/         # 系统图标
│   ├── images/              # 图片资源
│   └── styles/              # 样式文件
│       ├── main.scss       # 主样式入口
│       └── variables/      # SCSS 变量
│
├── components/               # 🧩 组件层
│   ├── AForm/               # 表单组件库（原子级）
│   │   ├── AFormInput.vue
│   │   ├── AFormSelect.vue
│   │   └── ...
│   ├── ASearchForm/         # 搜索表单（分子级）
│   ├── AOssMediaManager/    # 媒体管理（组织级）
│   ├── UserSelect/          # 用户选择（业务级）
│   └── ...
│
├── composables/              # 🎣 组合函数层
│   ├── useAuth.ts           # 权限管理
│   ├── useDict.ts           # 字典管理
│   ├── useHttp.ts           # HTTP 请求
│   ├── useDialog.ts         # 弹窗管理
│   ├── useDownload.ts       # 文件下载
│   ├── useI18n.ts           # 国际化
│   ├── useLayout.ts         # 布局管理
│   ├── useSelection.ts      # 选择状态
│   ├── useSSE.ts            # SSE 连接
│   ├── useTableHeight.ts    # 表格高度
│   ├── useTheme.ts          # 主题管理
│   ├── useToken.ts          # Token 管理
│   └── useWS.ts             # WebSocket
│
├── directives/               # 📌 自定义指令层
│   ├── directives.ts        # 指令注册入口
│   └── permission.ts        # 权限指令
│
├── layouts/                  # 🎨 布局层
│   ├── components/          # 布局子组件
│   │   ├── AppMain/        # 主内容区
│   │   ├── Navbar/         # 顶部导航
│   │   ├── Sidebar/        # 侧边栏
│   │   ├── TagsView/       # 标签页导航
│   │   └── Settings/       # 设置面板
│   ├── Layout.vue           # 后台主布局
│   └── HomeLayout.vue       # 前台布局
│
├── locales/                  # 🌍 国际化层
│   ├── i18n.ts              # i18n 配置
│   ├── zh_CN/               # 中文语言包
│   └── en_US/               # 英文语言包
│
├── plugins/                  # 🔌 插件层
│   └── elementIcons.ts      # Element 图标注册
│
├── router/                   # 🛣️ 路由层
│   ├── modules/             # 路由模块
│   │   ├── constant.ts     # 静态路由
│   │   └── ...
│   ├── utils/               # 路由工具
│   ├── guard.ts             # 路由守卫
│   └── router.ts            # 路由配置
│
├── stores/                   # 📦 状态管理层
│   ├── modules/             # 状态模块
│   │   ├── user.ts         # 用户状态
│   │   ├── permission.ts   # 权限状态
│   │   ├── dict.ts         # 字典状态
│   │   ├── feature.ts      # 功能状态
│   │   ├── notice.ts       # 通知状态
│   │   └── aiChat.ts       # AI 聊天状态
│   └── store.ts             # Pinia 实例
│
├── types/                    # 📋 类型定义层
│   ├── api/                 # API 响应类型
│   ├── components/          # 组件 Props 类型
│   └── global.d.ts          # 全局类型声明
│
├── utils/                    # 🛠️ 工具函数层
│   ├── boolean.ts           # 布尔值处理
│   ├── cache.ts             # 缓存操作
│   ├── class.ts             # 类名处理
│   ├── colors.ts            # 颜色处理
│   ├── crypto.ts            # 加密解密
│   ├── date.ts              # 日期处理
│   ├── format.ts            # 格式化
│   ├── function.ts          # 函数工具
│   ├── modal.ts             # 模态框工具
│   ├── object.ts            # 对象操作
│   ├── rsa.ts               # RSA 加密
│   ├── scroll.ts            # 滚动处理
│   ├── string.ts            # 字符串处理
│   ├── tab.ts               # 标签页工具
│   ├── to.ts                # 异步处理
│   ├── tree.ts              # 树结构处理
│   └── validators.ts        # 表单验证
│
├── views/                    # 📄 页面层
│   ├── dashboard/           # 仪表盘
│   ├── login/               # 登录页
│   ├── system/              # 系统管理页面
│   └── ...
│
├── App.vue                   # 根组件
├── main.ts                   # 应用入口
└── systemConfig.ts           # 系统配置
```

## 应用初始化流程

### 入口文件详解

应用从 `main.ts` 开始初始化，按照严格的顺序加载各个模块：

```typescript
/**
 * 应用入口文件
 * @description 初始化Vue应用并配置全局插件、样式、路由等
 */
import { createApp } from 'vue'

/**
 * 第一阶段：样式加载
 * 按顺序加载样式以确保优先级正确
 */
// 1. UnoCSS（原子化 CSS 框架，最低优先级）
import 'virtual:uno.css'
// 2. Element Plus 暗黑模式变量
import 'element-plus/theme-chalk/dark/css-vars.css'
// 3. 自定义全局样式（最高优先级）
import '@/assets/styles/main.scss'
// 4. 系统图标
import '@/assets/icons/system/iconfont.css'

/**
 * 第二阶段：核心模块加载
 */
// 根组件
import App from './App.vue'
// Pinia 状态管理
import store from '@/stores/store'
// Vue Router 路由管理
import router from './router/router'

/**
 * 第三阶段：功能模块加载
 */
// 自定义指令
import directive from '@/directives/directives'
// 代码高亮
import 'highlight.js/styles/atom-one-dark.css'
import 'highlight.js/lib/common'
import HighLight from '@highlightjs/vue-plugin'
// Element Plus 图标
import ElementIcons from '@/plugins/elementIcons'
// 国际化
import i18n from '@/locales/i18n'

/**
 * 第四阶段：全局配置修改
 */
import { ElDialog } from 'element-plus'
// 修改 el-dialog 默认点击遮罩不关闭
ElDialog.props.closeOnClickModal.default = false

/**
 * 第五阶段：应用创建与挂载
 */
const app = createApp(App)

// 注册插件（顺序很重要）
app.use(HighLight)      // 代码高亮
app.use(ElementIcons)   // Element 图标
app.use(router)         // 路由（必须在 store 之前注册）
app.use(store)          // 状态管理
app.use(i18n)           // 国际化

// 注册自定义指令
directive(app)

// 挂载应用
app.mount('#app')
```

**初始化顺序说明：**

1. **样式加载** - 按优先级从低到高加载，确保自定义样式能覆盖框架样式
2. **核心模块** - 加载 Vue 核心功能模块（Store、Router）
3. **功能模块** - 加载辅助功能（高亮、图标、国际化）
4. **全局配置** - 修改第三方组件的默认行为
5. **应用挂载** - 创建应用实例并挂载到 DOM

### 插件系统

框架支持通过插件扩展功能，插件遵循 Vue 3 的插件规范：

```typescript
/**
 * Element Plus 图标全局注册插件
 * 注册后可以在模板中直接使用图标组件，无需单独导入
 * 例如：<Edit />、<Search />、<Delete /> 等
 */
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { App } from 'vue'

export default {
  install: (app: App) => {
    // 遍历所有 Element Plus 图标并逐个注册为全局组件
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
  }
}
```

**自定义插件模板：**

```typescript
import { App } from 'vue'

interface PluginOptions {
  // 插件配置选项
}

export default {
  install: (app: App, options?: PluginOptions) => {
    // 1. 注册全局组件
    app.component('MyComponent', MyComponent)

    // 2. 注册全局指令
    app.directive('my-directive', myDirective)

    // 3. 注册全局属性
    app.config.globalProperties.$myMethod = myMethod

    // 4. 提供全局注入
    app.provide('myService', myService)
  }
}
```

## 核心模块详解

### 配置模块 (systemConfig)

系统配置模块采用集中式管理，通过 TypeScript 接口确保类型安全：

```typescript
/**
 * 系统全局配置
 * @description 集中管理所有应用配置，提供类型安全访问
 * @module @/systemConfig
 */

/**
 * 系统支持的语言枚举
 */
export enum LanguageCode {
  /** 中文(简体) */
  zh_CN = 'zh_CN',
  /** 英文(美国) */
  en_US = 'en_US'
}

/** 侧边栏主题枚举 */
export enum SideTheme {
  /** 深色主题 */
  Dark = 'theme-dark',
  /** 浅色主题 */
  Light = 'theme-light'
}

/** 菜单布局模式枚举 */
export enum MenuLayoutMode {
  /** 垂直布局（左侧边栏） */
  Vertical = 'vertical',
  /** 混合布局（顶部+左侧） */
  Mixed = 'mixed',
  /** 水平布局（纯顶部） */
  Horizontal = 'horizontal'
}

/**
 * 系统全局配置对象
 */
export const SystemConfig: SystemConfigType = {
  /**
   * 应用基础信息
   */
  app: {
    id: import.meta.env.VITE_APP_ID || 'ryplus_uni_workflow',
    title: import.meta.env.VITE_APP_TITLE || 'ryplus-uni后台管理',
    env: import.meta.env.VITE_APP_ENV || 'development',
    contextPath: import.meta.env.VITE_APP_CONTEXT_PATH || '/',
    enableFrontend: import.meta.env.VITE_ENABLE_FRONTEND === 'true'
  },

  /**
   * API 配置
   */
  api: {
    baseUrl: import.meta.env.VITE_APP_BASE_API || '/dev-api',
    port: Number(import.meta.env.VITE_APP_BASE_API_PORT || 5500),
    timeout: 10000
  },

  /**
   * 安全配置
   */
  security: {
    apiEncrypt: import.meta.env.VITE_APP_API_ENCRYPT === 'true',
    rsaPublicKey: import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '',
    rsaPrivateKey: import.meta.env.VITE_APP_RSA_PRIVATE_KEY || ''
  },

  /**
   * 外部服务地址
   */
  services: {
    monitor: import.meta.env.VITE_APP_MONITOR_ADMIN || '',
    snailJob: import.meta.env.VITE_APP_SNAILJOB_ADMIN || '',
    gitUrl: import.meta.env.VITE_APP_GIT_URL || '',
    docUrl: import.meta.env.VITE_APP_DOC_URL || ''
  },

  /**
   * UI 及布局设置
   */
  ui: {
    title: import.meta.env.VITE_APP_TITLE || 'ryplus-uni后台管理',
    theme: '#5d87ff',
    sideTheme: SideTheme.Dark,
    showSettings: true,
    topNav: false,
    menuLayout: MenuLayoutMode.Vertical,
    tagsView: true,
    fixedHeader: true,
    sidebarLogo: true,
    dynamicTitle: true,
    animationEnable: false,
    dark: false,
    layout: '',
    sidebarStatus: '1',
    size: 'default',
    language: LanguageCode.zh_CN,
    showSelectValue: undefined,
    watermark: false,
    watermarkContent: ''
  }
}
```

**配置使用示例：**

```typescript
import { SystemConfig } from '@/systemConfig'

// 获取 API 基础路径
const baseUrl = SystemConfig.api.baseUrl

// 获取应用标题
const appTitle = SystemConfig.app.title

// 检查是否启用加密
if (SystemConfig.security.apiEncrypt) {
  // 执行加密逻辑
}

// 获取主题设置
const { theme, dark, menuLayout } = SystemConfig.ui
```

### API 接口层

API 层按业务域垂直划分，采用统一的请求响应格式：

```typescript
/**
 * API 模块结构
 *
 * api/
 * ├── business/         # 业务接口
 * │   ├── base/        # 基础业务
 * │   │   ├── customerApi.ts
 * │   │   └── customerTypes.ts
 * │   └── mall/        # 商城业务
 * ├── system/           # 系统管理
 * │   ├── auth/        # 认证授权
 * │   │   ├── authApi.ts
 * │   │   └── authTypes.ts
 * │   ├── core/        # 核心功能
 * │   └── monitor/     # 系统监控
 * └── workflow/         # 工作流
 *     ├── model/       # 流程模型
 *     └── task/        # 任务管理
 */
```

**API 模块示例：**

```typescript
// api/system/auth/authApi.ts
import { http } from '@/composables/useHttp'
import type { LoginRequest, AuthTokenVo, UserInfoVo } from './authTypes'

/**
 * 用户登录
 * @param data 登录参数
 */
export const userLogin = (data: LoginRequest) => {
  return http.post<AuthTokenVo>('/auth/userLogin', data, {
    auth: false,      // 不需要认证
    isEncrypt: true   // 启用加密
  })
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return http.get<UserInfoVo>('/auth/getUserInfo')
}

/**
 * 用户登出
 */
export const userLogout = () => {
  return http.post('/auth/logout')
}
```

```typescript
// api/system/auth/authTypes.ts

/**
 * 登录请求参数
 */
export interface LoginRequest {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 验证码 */
  code?: string
  /** 验证码 UUID */
  uuid?: string
}

/**
 * 认证 Token 响应
 */
export interface AuthTokenVo {
  /** 访问令牌 */
  access_token: string
  /** 过期时间（秒） */
  expires_in: number
}

/**
 * 用户信息响应
 */
export interface UserInfoVo {
  /** 用户 ID */
  userId: number
  /** 用户名 */
  userName: string
  /** 昵称 */
  nickName: string
  /** 头像 */
  avatar: string
  /** 角色列表 */
  roles: string[]
  /** 权限列表 */
  permissions: string[]
}
```

### 状态管理层

采用 Pinia 进行状态管理，每个状态模块职责单一：

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userLogin, getUserInfo, userLogout } from '@/api/system/auth/authApi'
import type { LoginRequest, UserInfoVo } from '@/api/system/auth/authTypes'

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', () => {
  // ========== 状态定义 ==========

  /** 用户信息 */
  const userInfo = ref<UserInfoVo | null>(null)

  /** 角色列表 */
  const roles = ref<string[]>([])

  /** 权限列表 */
  const permissions = ref<string[]>([])

  // ========== 计算属性 ==========

  /** 是否已登录 */
  const isLoggedIn = computed(() => !!userInfo.value)

  /** 用户显示名称 */
  const displayName = computed(() =>
    userInfo.value?.nickName || userInfo.value?.userName || ''
  )

  // ========== 操作方法 ==========

  /**
   * 用户登录
   */
  const login = async (data: LoginRequest) => {
    const res = await userLogin(data)
    if (res.data) {
      // 存储 Token
      localStorage.setItem('token', res.data.access_token)
      // 获取用户信息
      await fetchUserInfo()
    }
    return res
  }

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async () => {
    const res = await getUserInfo()
    if (res.data) {
      userInfo.value = res.data
      roles.value = res.data.roles || []
      permissions.value = res.data.permissions || []
    }
    return res
  }

  /**
   * 退出登录
   */
  const logout = async () => {
    await userLogout()
    // 清除状态
    userInfo.value = null
    roles.value = []
    permissions.value = []
    // 清除 Token
    localStorage.removeItem('token')
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    userInfo.value = null
    roles.value = []
    permissions.value = []
  }

  return {
    // 状态
    userInfo,
    roles,
    permissions,
    // 计算属性
    isLoggedIn,
    displayName,
    // 方法
    login,
    fetchUserInfo,
    logout,
    resetState
  }
})
```

**状态模块职责划分：**

| 模块 | 职责 | 主要状态 |
|------|------|----------|
| user | 用户认证与信息 | userInfo, roles, permissions |
| permission | 路由权限 | routes, menus, buttons |
| dict | 字典数据 | dictMap, loading |
| feature | 功能开关 | features, settings |
| notice | 通知消息 | notices, unreadCount |
| aiChat | AI 聊天 | messages, sessions |

### 组合函数层

组合函数封装可复用的逻辑，是业务逻辑复用的核心：

```typescript
// composables/useAuth.ts
import { computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { storeToRefs } from 'pinia'

/**
 * 权限管理组合函数
 * 提供权限检查、角色验证等功能
 */
export const useAuth = () => {
  const userStore = useUserStore()
  const { roles, permissions } = storeToRefs(userStore)

  /**
   * 是否为超级管理员
   */
  const isSuperAdmin = computed(() =>
    roles.value.includes('superadmin')
  )

  /**
   * 是否为管理员（包括超级管理员和租户管理员）
   */
  const isAdmin = computed(() =>
    roles.value.includes('superadmin') || roles.value.includes('admin')
  )

  /**
   * 检查是否拥有指定权限（OR 逻辑）
   * @param perms 权限标识数组
   */
  const hasPermi = (perms: string | string[]): boolean => {
    if (isSuperAdmin.value) return true
    const permList = Array.isArray(perms) ? perms : [perms]
    return permList.some(p => permissions.value.includes(p))
  }

  /**
   * 检查是否拥有所有权限（AND 逻辑）
   * @param perms 权限标识数组
   */
  const hasPermiAll = (perms: string[]): boolean => {
    if (isSuperAdmin.value) return true
    return perms.every(p => permissions.value.includes(p))
  }

  /**
   * 检查是否拥有指定角色（OR 逻辑）
   * @param roleList 角色标识数组
   */
  const hasRole = (roleList: string | string[]): boolean => {
    if (isSuperAdmin.value) return true
    const list = Array.isArray(roleList) ? roleList : [roleList]
    return list.some(r => roles.value.includes(r))
  }

  /**
   * 检查是否拥有所有角色（AND 逻辑）
   * @param roleList 角色标识数组
   */
  const hasRoleAll = (roleList: string[]): boolean => {
    if (isSuperAdmin.value) return true
    return roleList.every(r => roles.value.includes(r))
  }

  return {
    // 状态
    roles,
    permissions,
    isSuperAdmin,
    isAdmin,
    // 方法
    hasPermi,
    hasPermiAll,
    hasRole,
    hasRoleAll
  }
}
```

**组合函数分类：**

| 类型 | 组合函数 | 功能描述 |
|------|----------|----------|
| 认证权限 | useAuth | 权限检查、角色验证 |
| 数据管理 | useDict | 字典数据加载与缓存 |
| 网络请求 | useHttp | HTTP 请求封装 |
| 界面交互 | useDialog | 弹窗状态管理 |
| 文件处理 | useDownload | 文件下载与导出 |
| 国际化 | useI18n | 多语言切换 |
| 布局控制 | useLayout | 布局状态管理 |
| 选择状态 | useSelection | 跨页选择状态 |
| 实时通信 | useSSE, useWS | SSE/WebSocket 连接 |
| 主题管理 | useTheme | 主题切换与配置 |
| Token 管理 | useToken | Token 存取与刷新 |
| 界面适配 | useTableHeight | 动态高度计算 |

### 自定义指令层

自定义指令提供声明式的 DOM 操作能力：

```typescript
// directives/directives.ts
import { App } from 'vue'
import {
  // 基础指令
  permi,
  role,
  admin,
  superadmin,
  // 高级指令
  permiAll,
  roleAll,
  tenant,
  // 反向指令
  noPermi,
  noRole,
  // 灵活控制指令
  auth
} from './permission'

/**
 * 全局注册自定义指令
 */
export default (app: App) => {
  // ===== 基础权限指令 =====

  /** 基于权限控制元素显示(OR逻辑) */
  app.directive('permi', permi)

  /** 基于角色控制元素显示(OR逻辑) */
  app.directive('role', role)

  /** 仅管理员可见 */
  app.directive('admin', admin)

  /** 仅超级管理员可见 */
  app.directive('superadmin', superadmin)

  // ===== 高级权限指令 =====

  /** 必须满足所有权限才显示(AND逻辑) */
  app.directive('permiAll', permiAll)

  /** 必须满足所有角色才显示(AND逻辑) */
  app.directive('roleAll', roleAll)

  /** 基于租户权限控制 */
  app.directive('tenant', tenant)

  // ===== 反向权限指令 =====

  /** 拥有权限时隐藏 */
  app.directive('noPermi', noPermi)

  /** 拥有角色时隐藏 */
  app.directive('noRole', noRole)

  // ===== 自定义控制指令 =====

  /** 高级权限控制（支持禁用、隐藏、类名等） */
  app.directive('auth', auth)
}
```

**指令使用示例：**

```vue
<template>
  <!-- 基础权限控制 -->
  <el-button v-permi="['system:user:add']">新增用户</el-button>

  <!-- 多权限 OR 逻辑 -->
  <el-button v-permi="['system:user:edit', 'system:user:update']">
    编辑用户
  </el-button>

  <!-- 多权限 AND 逻辑 -->
  <el-button v-permiAll="['system:user:view', 'system:user:edit']">
    查看并编辑
  </el-button>

  <!-- 角色控制 -->
  <el-button v-role="['admin']">管理员操作</el-button>

  <!-- 仅超级管理员可见 -->
  <el-button v-superadmin>超级管理员专属</el-button>

  <!-- 反向控制：有权限时隐藏 -->
  <span v-noPermi="['system:user:add']">无添加权限提示</span>

  <!-- 高级控制：禁用而非隐藏 -->
  <el-button v-auth="{ permi: ['system:user:add'], action: 'disabled' }">
    新增（无权限时禁用）
  </el-button>
</template>
```

### 工具函数层

工具函数是纯函数，无副作用，便于测试和复用：

```typescript
// utils/string.ts

/**
 * 驼峰转下划线
 * @param str 驼峰字符串
 * @example camelToSnake('userName') => 'user_name'
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * 下划线转驼峰
 * @param str 下划线字符串
 * @example snakeToCamel('user_name') => 'userName'
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 首字母大写
 * @param str 字符串
 * @example capitalize('hello') => 'Hello'
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 生成 UUID
 * @returns UUID 字符串
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 字符串截断
 * @param str 原字符串
 * @param length 最大长度
 * @param suffix 后缀，默认 '...'
 */
export const truncate = (
  str: string,
  length: number,
  suffix = '...'
): string => {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}
```

**工具函数分类：**

| 文件 | 功能领域 | 主要函数 |
|------|----------|----------|
| string.ts | 字符串处理 | camelToSnake, truncate, generateUUID |
| object.ts | 对象操作 | deepClone, merge, pick, omit |
| date.ts | 日期处理 | formatDate, parseDate, getDateRange |
| format.ts | 格式化 | formatNumber, formatCurrency, formatBytes |
| validators.ts | 表单验证 | isEmail, isPhone, isIdCard |
| tree.ts | 树结构 | listToTree, treeToList, findNode |
| cache.ts | 缓存操作 | getCache, setCache, removeCache |
| crypto.ts | 加密解密 | encrypt, decrypt, hash |

## 模块通信机制

### 组件通信

```typescript
/**
 * 1. Props / Emit（父子组件）
 */
// 父组件
<UserSelect
  v-model="selectedUser"
  :multiple="true"
  @confirm="handleConfirm"
/>

// 子组件
const props = defineProps<{
  modelValue: UserInfo | UserInfo[]
  multiple?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UserInfo | UserInfo[]]
  confirm: [users: UserInfo[]]
}>()

/**
 * 2. Provide / Inject（跨层级组件）
 */
// 祖先组件
const theme = reactive({
  primary: '#1890ff',
  dark: false
})
provide('theme', theme)

// 后代组件
const theme = inject<ThemeConfig>('theme')

/**
 * 3. 事件总线（跨模块通信）
 */
// 使用 mitt 创建事件总线
import mitt from 'mitt'

type Events = {
  'user:login': UserInfo
  'user:logout': void
  'theme:change': ThemeConfig
}

export const emitter = mitt<Events>()

// 发送事件
emitter.emit('user:login', userInfo)

// 监听事件
emitter.on('user:login', (user) => {
  console.log('用户登录:', user)
})
```

### 状态通信

```typescript
/**
 * 跨组件状态共享
 */
// 组件 A
const userStore = useUserStore()
userStore.login(loginData)

// 组件 B（自动响应状态变化）
const userStore = useUserStore()
const { isLoggedIn, displayName } = storeToRefs(userStore)

// 在模板中使用
<template>
  <span v-if="isLoggedIn">欢迎，{{ displayName }}</span>
  <el-button v-else @click="goLogin">请登录</el-button>
</template>
```

### 模块依赖关系

```text
依赖层次（从底层到上层）：

┌─────────────────────────────────────────────────────────────┐
│                        页面层 (views)                        │
│                    依赖：所有下层模块                         │
├─────────────────────────────────────────────────────────────┤
│                        布局层 (layouts)                      │
│                    依赖：components, composables             │
├─────────────────────────────────────────────────────────────┤
│                        组件层 (components)                   │
│                依赖：composables, stores, utils              │
├─────────────────────────────────────────────────────────────┤
│                        逻辑层 (composables)                  │
│                    依赖：stores, api, utils                  │
├─────────────────────────────────────────────────────────────┤
│                        状态层 (stores)                       │
│                        依赖：api, utils                      │
├─────────────────────────────────────────────────────────────┤
│                        接口层 (api)                          │
│                        依赖：utils, types                    │
├─────────────────────────────────────────────────────────────┤
│                        工具层 (utils)                        │
│                        依赖：types                           │
├─────────────────────────────────────────────────────────────┤
│                        类型层 (types)                        │
│                        无依赖                                │
└─────────────────────────────────────────────────────────────┘

依赖原则：
✅ 上层可以依赖下层
❌ 下层不能依赖上层
❌ 同层模块应避免循环依赖
```

## 组件分层设计

### 原子设计模式

组件采用原子设计模式，按复杂度分为四个层次：

```text
┌─────────────────────────────────────────────────────────────┐
│                    模板级 (Templates)                        │
│  页面级业务组件，如：UserManagement, OrderDetail             │
├─────────────────────────────────────────────────────────────┤
│                    组织级 (Organisms)                        │
│  功能完整的业务模块，如：UserSelect, AOssMediaManager        │
├─────────────────────────────────────────────────────────────┤
│                    分子级 (Molecules)                        │
│  功能组合组件，如：ASearchForm, ADataCard                   │
├─────────────────────────────────────────────────────────────┤
│                    原子级 (Atoms)                            │
│  基础表单控件，如：AFormInput, AFormSelect, AFormDate       │
└─────────────────────────────────────────────────────────────┘
```

**各层次示例：**

```typescript
/**
 * 原子级组件 - AFormInput
 * 最小粒度，只处理输入逻辑
 */
<template>
  <el-form-item :label="label" :prop="prop">
    <el-input v-model="modelValue" v-bind="$attrs" />
  </el-form-item>
</template>

/**
 * 分子级组件 - ASearchForm
 * 组合多个原子组件，提供搜索表单功能
 */
<template>
  <el-form :model="formData" inline>
    <AFormInput
      v-for="field in fields"
      :key="field.prop"
      v-bind="field"
    />
    <el-button @click="handleSearch">搜索</el-button>
    <el-button @click="handleReset">重置</el-button>
  </el-form>
</template>

/**
 * 组织级组件 - UserSelect
 * 完整的用户选择功能，包含搜索、列表、选择等
 */
<template>
  <div class="user-select">
    <ASearchForm :fields="searchFields" @search="fetchUsers" />
    <el-table :data="users" @selection-change="handleSelect">
      <!-- 表格内容 -->
    </el-table>
    <ASelectionTags :selected="selectedUsers" @remove="handleRemove" />
  </div>
</template>

/**
 * 模板级组件 - UserManagement
 * 页面级组件，组合多个组织级组件
 */
<template>
  <div class="user-management">
    <ASearchForm :fields="searchFields" @search="fetchData" />
    <ADataCard title="用户列表">
      <el-table :data="tableData">
        <!-- 表格列 -->
      </el-table>
    </ADataCard>
    <UserSelect v-model="selectedUser" @confirm="handleAssign" />
  </div>
</template>
```

## 最佳实践

### 1. 模块职责划分

```typescript
// ✅ 好的做法：单一职责
// useAuth.ts - 只负责权限相关逻辑
export const useAuth = () => {
  const hasPermi = (perms: string[]) => { /* ... */ }
  const hasRole = (roles: string[]) => { /* ... */ }
  return { hasPermi, hasRole }
}

// useDict.ts - 只负责字典相关逻辑
export const useDict = (...types: string[]) => {
  const dictData = reactive({})
  const loading = ref(true)
  // 加载字典数据
  return { ...toRefs(dictData), loading }
}

// ❌ 不好的做法：职责混杂
export const useCommon = () => {
  // 权限检查
  const hasPermi = () => { /* ... */ }
  // 字典加载
  const loadDict = () => { /* ... */ }
  // 用户信息
  const getUserInfo = () => { /* ... */ }
  // 主题切换
  const toggleTheme = () => { /* ... */ }
  // 太多职责，难以维护
}
```

### 2. 依赖注入解耦

```typescript
// ✅ 好的做法：通过接口定义依赖
interface UserService {
  getUserInfo(): Promise<UserInfo>
  updateProfile(data: ProfileData): Promise<void>
}

// 通过接口约束，实现可替换
export const useUserService = (service: UserService) => {
  const userInfo = ref<UserInfo | null>(null)

  const fetchInfo = async () => {
    userInfo.value = await service.getUserInfo()
  }

  return { userInfo, fetchInfo }
}

// 使用时注入具体实现
const apiService: UserService = {
  getUserInfo: () => getUserInfoApi(),
  updateProfile: (data) => updateProfileApi(data)
}

const { userInfo, fetchInfo } = useUserService(apiService)

// ❌ 不好的做法：直接依赖具体实现
export const useUser = () => {
  const fetchInfo = async () => {
    // 直接耦合 API 实现，难以测试和替换
    const res = await getUserInfoApi()
    // ...
  }
}
```

### 3. 统一导出入口

```typescript
// utils/index.ts
// ✅ 好的做法：提供统一导出
export * from './string'
export * from './object'
export * from './date'
export * from './format'
export * from './validators'
export * from './tree'
export * from './cache'

// 使用时从统一入口导入
import { formatDate, parseDate, truncate, deepClone } from '@/utils'

// ❌ 不好的做法：分散导入
import { formatDate } from '@/utils/date'
import { truncate } from '@/utils/string'
import { deepClone } from '@/utils/object'
```

### 4. 类型安全边界

```typescript
// ✅ 好的做法：明确的接口定义
interface UserSelectProps {
  /** 选中的值 */
  modelValue?: string | number | SysUserVo | SysUserVo[]
  /** 是否多选 */
  multiple?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

interface UserSelectEmits {
  'update:modelValue': [value: UserSelectProps['modelValue']]
  confirm: [users: SysUserVo[]]
}

const props = withDefaults(defineProps<UserSelectProps>(), {
  multiple: false,
  disabled: false
})

const emit = defineEmits<UserSelectEmits>()

// ❌ 不好的做法：使用 any 或缺少类型定义
const props = defineProps({
  modelValue: [String, Number, Object, Array],
  multiple: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm'])
```

### 5. 错误边界处理

```typescript
// ✅ 好的做法：统一错误处理
export const useHttp = () => {
  const request = async <T>(config: RequestConfig): Promise<Result<T>> => {
    try {
      const response = await axios(config)
      return handleResponse(response)
    } catch (error) {
      return handleError(error)
    }
  }

  const handleError = (error: unknown): Result<never> => {
    if (axios.isAxiosError(error)) {
      // 网络错误
      if (!error.response) {
        return { code: -1, msg: '网络连接失败', data: null as never }
      }
      // HTTP 错误
      const status = error.response.status
      if (status === 401) {
        // 未授权，跳转登录
        router.push('/login')
      }
      return {
        code: status,
        msg: error.response.data?.msg || '请求失败',
        data: null as never
      }
    }
    // 其他错误
    return { code: -1, msg: '未知错误', data: null as never }
  }

  return { request }
}
```

## 常见问题

### 1. 如何避免循环依赖？

**问题描述：**

模块 A 依赖模块 B，模块 B 又依赖模块 A，导致加载失败或运行时错误。

**解决方案：**

```typescript
// ❌ 循环依赖示例
// user.ts
import { usePermission } from './permission'
export const useUser = () => {
  const permission = usePermission()
  // ...
}

// permission.ts
import { useUser } from './user'
export const usePermission = () => {
  const user = useUser() // 循环依赖！
  // ...
}

// ✅ 解决方案1：提取公共依赖
// common.ts（公共状态）
export const useCommonState = () => {
  const roles = ref<string[]>([])
  return { roles }
}

// user.ts
import { useCommonState } from './common'
export const useUser = () => {
  const { roles } = useCommonState()
  // ...
}

// permission.ts
import { useCommonState } from './common'
export const usePermission = () => {
  const { roles } = useCommonState()
  // ...
}

// ✅ 解决方案2：依赖注入
// permission.ts
export const usePermission = (getRoles: () => string[]) => {
  const hasRole = (role: string) => getRoles().includes(role)
  return { hasRole }
}

// user.ts
export const useUser = () => {
  const roles = ref<string[]>([])
  const permission = usePermission(() => roles.value)
  // ...
}
```

### 2. 如何组织大型模块？

**问题描述：**

随着功能增加，单个模块文件变得庞大难以维护。

**解决方案：**

```typescript
// 按功能拆分为多个文件
composables/
├── useAuth/
│   ├── index.ts        # 主入口，聚合导出
│   ├── usePermission.ts  # 权限检查
│   ├── useRole.ts        # 角色检查
│   ├── useToken.ts       # Token 管理
│   └── types.ts          # 类型定义

// useAuth/index.ts
export { usePermission } from './usePermission'
export { useRole } from './useRole'
export { useToken } from './useToken'
export type * from './types'

// 提供便捷的聚合函数
export const useAuth = () => {
  const permission = usePermission()
  const role = useRole()
  const token = useToken()

  return {
    ...permission,
    ...role,
    ...token
  }
}
```

### 3. 如何处理模块间的状态同步？

**问题描述：**

多个模块需要响应同一状态变化，如何保证同步？

**解决方案：**

```typescript
// 使用 Pinia 的响应式特性
// stores/modules/user.ts
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  // 状态变化时自动通知所有订阅者
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  return { userInfo, setUserInfo }
})

// 组件 A - 修改状态
const userStore = useUserStore()
userStore.setUserInfo(newInfo)

// 组件 B - 自动响应变化
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

watch(userInfo, (newVal) => {
  console.log('用户信息变化:', newVal)
})

// 使用 watch 监听多个状态
const permissionStore = usePermissionStore()
const { routes } = storeToRefs(permissionStore)

watch([userInfo, routes], ([user, routes]) => {
  // 用户信息或路由变化时执行
})
```

### 4. 如何实现模块的懒加载？

**问题描述：**

某些模块较大或不常用，希望按需加载以优化性能。

**解决方案：**

```typescript
// 路由级懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/dashboard/index.vue')
  },
  {
    path: '/system/user',
    component: () => import('@/views/system/user/index.vue')
  }
]

// 组件级懒加载
const UserSelect = defineAsyncComponent(() =>
  import('@/components/UserSelect/UserSelect.vue')
)

// 配合 Suspense 使用
<template>
  <Suspense>
    <template #default>
      <UserSelect v-model="user" />
    </template>
    <template #fallback>
      <el-skeleton :rows="3" />
    </template>
  </Suspense>
</template>

// 模块级懒加载
const loadAIModule = async () => {
  const { useAIChat } = await import('@/composables/useAiChat')
  return useAIChat()
}

// 按需加载
const aiChat = ref<ReturnType<typeof useAIChat> | null>(null)

const initAIChat = async () => {
  if (!aiChat.value) {
    aiChat.value = await loadAIModule()
  }
  return aiChat.value
}
```

### 5. 如何保证模块的可测试性？

**问题描述：**

模块与外部依赖耦合紧密，难以编写单元测试。

**解决方案：**

```typescript
// ✅ 可测试的模块设计
// 1. 纯函数易于测试
// utils/format.ts
export const formatCurrency = (
  value: number,
  currency = 'CNY'
): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency
  }).format(value)
}

// 测试
describe('formatCurrency', () => {
  it('should format CNY correctly', () => {
    expect(formatCurrency(1234.56)).toBe('¥1,234.56')
  })
})

// 2. 依赖注入便于 Mock
// composables/useUserService.ts
export interface UserAPI {
  getInfo(): Promise<UserInfo>
  update(data: Partial<UserInfo>): Promise<void>
}

export const useUserService = (api: UserAPI) => {
  const userInfo = ref<UserInfo | null>(null)

  const fetchInfo = async () => {
    userInfo.value = await api.getInfo()
  }

  return { userInfo, fetchInfo }
}

// 测试
describe('useUserService', () => {
  it('should fetch user info', async () => {
    const mockApi: UserAPI = {
      getInfo: vi.fn().mockResolvedValue({ id: 1, name: 'Test' }),
      update: vi.fn()
    }

    const { userInfo, fetchInfo } = useUserService(mockApi)
    await fetchInfo()

    expect(userInfo.value).toEqual({ id: 1, name: 'Test' })
    expect(mockApi.getInfo).toHaveBeenCalled()
  })
})

// 3. 状态隔离便于测试
// stores/modules/user.ts
export const useUserStore = defineStore('user', () => {
  // ...
})

// 测试
describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should login successfully', async () => {
    const store = useUserStore()
    await store.login({ username: 'test', password: '123' })
    expect(store.isLoggedIn).toBe(true)
  })
})
```

### 6. 如何处理模块版本升级？

**问题描述：**

模块接口变更时，如何平滑迁移？

**解决方案：**

```typescript
// 1. 保持向后兼容
// useDict.ts
export const useDict = (...types: string[]) => {
  // 新接口
  const dictMap = reactive<Record<string, DictItem[]>>({})

  // 兼容旧接口（标记为废弃）
  /** @deprecated 请使用 dictMap 代替 */
  const getDictData = (type: string) => {
    console.warn('getDictData 已废弃，请使用 dictMap')
    return dictMap[type] || []
  }

  return {
    dictMap,           // 新接口
    getDictData,       // 旧接口（保持兼容）
    ...toRefs(dictMap) // 便捷访问
  }
}

// 2. 版本化接口
// v1/useAuth.ts（旧版本，保持不变）
export const useAuth = () => { /* v1 实现 */ }

// v2/useAuth.ts（新版本）
export const useAuth = () => { /* v2 实现 */ }

// index.ts（默认导出最新版本）
export { useAuth } from './v2/useAuth'
export { useAuth as useAuthV1 } from './v1/useAuth'

// 3. 渐进式迁移
// 使用适配器模式
const createAuthAdapter = (v1Auth: V1Auth): V2Auth => {
  return {
    hasPermission: v1Auth.hasPermi,
    hasRole: v1Auth.hasRole,
    // 新增功能
    hasAnyPermission: (perms) => perms.some(v1Auth.hasPermi)
  }
}
```

### 7. 如何优化模块加载性能？

**问题描述：**

模块数量多，首屏加载慢。

**解决方案：**

```typescript
// 1. 路由懒加载 + 代码分割
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 第三方库分组
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-element': ['element-plus'],
          // 业务模块分组
          'module-system': [
            './src/views/system/user/index.vue',
            './src/views/system/role/index.vue',
            './src/views/system/menu/index.vue'
          ]
        }
      }
    }
  }
})

// 2. 预加载关键模块
// router/guard.ts
router.beforeEach(async (to) => {
  // 预加载即将访问的模块
  if (to.meta.preload) {
    const modules = to.meta.preload as string[]
    await Promise.all(modules.map(m => import(`@/views/${m}`)))
  }
})

// 3. 条件加载非必需模块
// main.ts
const app = createApp(App)

// 核心模块同步加载
app.use(router)
app.use(store)

// 非核心模块异步加载
if (process.env.NODE_ENV === 'development') {
  import('./devtools').then(m => m.install(app))
}

// 4. 使用 Web Worker 处理计算密集型任务
// workers/dataProcessor.ts
self.onmessage = (e) => {
  const result = heavyComputation(e.data)
  self.postMessage(result)
}

// 使用
const worker = new Worker(
  new URL('./workers/dataProcessor.ts', import.meta.url)
)
worker.postMessage(data)
worker.onmessage = (e) => {
  processedData.value = e.data
}
```

## 总结

RuoYi-Plus-UniApp 的模块化设计通过清晰的分层架构、合理的职责划分、统一的规范约束，实现了代码的高内聚、低耦合。核心设计要点：

1. **分层解耦** - 配置层、工具层、接口层、状态层、逻辑层、组件层、页面层、布局层，各司其职
2. **单一职责** - 每个模块只负责一个功能域，便于理解和维护
3. **类型安全** - 全面使用 TypeScript，通过接口定义模块边界
4. **可组合性** - 小模块灵活组合，支持 Tree Shaking 和按需加载
5. **可测试性** - 纯函数和依赖注入设计，便于单元测试

这种设计不仅提高了开发效率，也保证了系统的可维护性和扩展性，为企业级应用的持续发展奠定了坚实的基础。
