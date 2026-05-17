# 目录结构详解

## 介绍

本文档详细介绍RuoYi-Plus-UniApp前端管理端(plus-ui)的目录结构。该项目基于Vue 3 + TypeScript + Vite构建,采用模块化、组件化的设计理念,提供清晰的目录划分和代码组织方式。

**核心特性:**

- **模块化设计** - 按功能模块划分目录,业务逻辑清晰
- **组件化开发** - 组件独立封装,复用性强
- **类型安全** - 完整的TypeScript类型定义
- **约定优于配置** - 遵循统一的目录命名和组织规范
- **关注点分离** - API、状态、组件、视图、工具分离管理

## 项目根目录

```text
plus-ui/
├── env/                     # 环境变量配置目录
│   ├── .env.development    # 开发环境配置
│   ├── .env.production     # 生产环境配置
│   └── .env.test           # 测试环境配置
├── public/                  # 静态资源目录(不经过Vite处理)
│   ├── favicon.ico         # 网站图标
│   └── index.html          # HTML模板
├── src/                     # 源代码目录
│   ├── api/                # API接口定义
│   ├── assets/             # 静态资源(经过Vite处理)
│   ├── components/         # 全局公共组件
│   ├── composables/        # 组合式函数(Composables)
│   ├── directives/         # 全局指令
│   ├── layouts/            # 布局组件
│   ├── locales/            # 国际化语言文件
│   ├── plugins/            # 插件配置
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia状态管理
│   ├── types/              # TypeScript类型定义
│   ├── utils/              # 工具函数
│   ├── views/              # 页面视图组件
│   ├── App.vue             # 根组件
│   ├── main.ts             # 应用入口文件
│   └── systemConfig.ts     # 系统配置文件
├── vite/                    # Vite插件配置
│   └── plugins/            # 自定义Vite插件
├── .gitignore              # Git忽略文件配置
├── eslint.config.ts        # ESLint配置
├── package.json            # 项目依赖配置
├── tsconfig.json           # TypeScript配置
├── uno.config.ts           # UnoCSS配置
└── vite.config.ts          # Vite配置
```

## 核心目录详解

### src/api - API接口目录

API接口按业务模块划分,每个模块包含API函数和类型定义。

```text
src/api/
├── business/               # 业务模块API
│   ├── base/              # 基础业务(广告、支付等)
│   │   ├── ad/           # 广告管理
│   │   │   ├── adApi.ts  # 广告API函数
│   │   │   └── adTypes.ts # 广告类型定义
│   │   ├── payment/      # 支付管理
│   │   └── ...
│   └── mall/              # 商城业务
│       ├── goods/        # 商品管理
│       ├── order/        # 订单管理
│       └── ...
├── common/                 # 通用API
│   ├── upload/           # 文件上传
│   ├── download/         # 文件下载
│   └── ...
├── system/                 # 系统模块API
│   ├── core/             # 系统核心
│   │   ├── user/        # 用户管理
│   │   ├── role/        # 角色管理
│   │   ├── menu/        # 菜单管理
│   │   ├── dept/        # 部门管理
│   │   ├── post/        # 岗位管理
│   │   ├── dict/        # 字典管理
│   │   └── config/      # 配置管理
│   ├── log/              # 日志管理
│   └── monitor/          # 系统监控
├── tool/                   # 工具模块API
│   ├── gen/              # 代码生成
│   └── swagger/          # 接口文档
├── workflow/               # 工作流API
│   ├── category/         # 分类管理
│   ├── definition/       # 流程定义
│   ├── instance/         # 流程实例
│   └── task/             # 任务管理
└── index.ts                # API统一导出

```

**命名规范:**
- API文件: `{模块}Api.ts`
- 类型文件: `{模块}Types.ts`
- API函数: 使用动词+名词,如 `getUser`、`updateUser`、`deleteUser`
- 类型接口: 使用名词+Vo/Query/Form,如 `UserVo`、`UserQuery`、`UserForm`

**示例:**

```typescript
// src/api/system/core/user/userApi.ts
import request from '@/utils/request'
import type { UserVo, UserQuery, UserForm } from './userTypes'

/** 查询用户列表 */
export const listUser = (query: UserQuery): Result<PageResult<UserVo>> => {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

/** 获取用户详情 */
export const getUser = (userId: number): Result<UserVo> => {
  return request({
    url: `/system/user/${userId}`,
    method: 'get'
  })
}

/** 新增用户 */
export const addUser = (data: UserForm): Result<void> => {
  return request({
    url: '/system/user',
    method: 'post',
    data
  })
}
```

### src/assets - 静态资源目录

存放项目中使用的静态资源,这些文件会被Vite处理(压缩、优化)。

```text
src/assets/
├── icons/                  # SVG图标文件
│   ├── svg/               # 自定义SVG图标
│   └── index.ts           # 图标注册文件
├── images/                 # 图片资源
│   ├── login-bg.jpg       # 登录背景图
│   ├── 404.png            # 404页面图片
│   └── ...
├── logo/                   # Logo图片
│   ├── logo.png           # 系统Logo
│   └── logo-text.png      # 带文字Logo
└── styles/                 # 全局样式文件
    ├── index.scss         # 样式入口文件
    ├── variables.scss     # SCSS变量定义
    ├── mixins.scss        # SCSS混入
    ├── element-ui.scss    # Element Plus样式覆盖
    ├── transition.scss    # 过渡动画
    └── sidebar.scss       # 侧边栏样式
```

**使用示例:**

```vue
<template>
  <img :src="loginBg" alt="登录背景" />
</template>

<script lang="ts" setup>
import loginBg from '@/assets/images/login-bg.jpg'
</script>

```

### src/components - 全局公共组件目录

存放可在全局使用的公共组件,按组件功能分类。

```text
src/components/
├── AAi/                    # AI对话组件
│   ├── AAiChat.vue        # AI聊天组件
│   └── types.ts           # 类型定义
├── ACard/                  # 卡片组件集
│   ├── ACard.vue          # 基础卡片
│   ├── AStatsCard.vue     # 统计卡片
│   └── ...
├── AChart/                 # 图表组件
│   ├── AChart.vue         # 基础图表
│   ├── ALineChart.vue     # 折线图
│   ├── ABarChart.vue      # 柱状图
│   └── ...
├── ADetail/                # 详情展示组件
│   ├── ADetail.vue        # 详情组件
│   └── types.ts           # 类型定义
├── AForm/                  # 表单组件集
│   ├── AFormInput.vue     # 输入框
│   ├── AFormSelect.vue    # 下拉选择
│   ├── AFormDate.vue      # 日期选择
│   ├── AFormUpload.vue    # 文件上传
│   └── ...
├── AImportExcel/           # Excel导入组件
│   └── AImportExcel.vue
├── AModal/                 # 弹窗组件
│   ├── AModal.vue         # 基础弹窗
│   └── types.ts           # 类型定义
├── AOssMediaManager/       # OSS媒体管理器
│   ├── AOssMediaManager.vue
│   └── components/        # 子组件
├── ARecharge/              # 充值组件
│   └── ARecharge.vue
├── AResizablePanels/       # 可调整大小面板
│   └── AResizablePanels.vue
├── ASearchForm/            # 搜索表单组件
│   ├── ASearchForm.vue
│   └── types.ts
├── ASelectionTags/         # 选择标签组件
│   └── ASelectionTags.vue
├── ATheme/                 # 主题配置组件
│   └── ATheme.vue
├── DictTag/                # 字典标签组件
│   └── DictTag.vue
├── Icon/                   # 图标组件
│   ├── Icon.vue
│   └── types.ts
├── IFrameContainer/        # IFrame容器
│   └── IFrameContainer.vue
├── ImagePreview/           # 图片预览组件
│   └── ImagePreview.vue
├── Pagination/             # 分页组件
│   └── Pagination.vue
├── TableToolbar/           # 表格工具栏
│   └── TableToolbar.vue
├── UserSelect/             # 用户选择器
│   └── UserSelect.vue
└── index.ts                # 组件统一注册导出
```

**组件命名规范:**
- 组件文件名: 大驼峰(PascalCase),如 `ASearchForm.vue`
- 组件名称: 使用 `A` 前缀表示自定义组件,避免与Element Plus组件冲突
- 组件目录: 单个组件直接放在目录下,复杂组件可包含 `components` 子目录

**全局注册:**

```typescript
// src/components/index.ts
import type { App } from 'vue'
import ASearchForm from './ASearchForm/ASearchForm.vue'
import AModal from './AModal/AModal.vue'
// ... 其他组件导入

export default {
  install(app: App) {
    app.component('ASearchForm', ASearchForm)
    app.component('AModal', AModal)
    // ... 其他组件注册
  }
}
```

### src/composables - 组合式函数目录

存放可复用的组合式函数(Composables),封装业务逻辑和状态管理。

```text
src/composables/
├── useAiChat.ts            # AI对话功能
├── useAnimation.ts         # 动画效果
├── useAuth.ts              # 权限验证
├── useDialog.ts            # 弹窗状态管理
├── useDict.ts              # 字典数据管理
├── useDownload.ts          # 文件下载
├── useHttp.ts              # HTTP请求封装
├── useI18n.ts              # 国际化
├── useLayout.ts            # 布局管理
├── usePrint.ts             # 打印功能
├── useResponsiveSpan.ts    # 响应式布局
├── useSelection.ts         # 表格选择管理
├── useSSE.ts               # Server-Sent Events
├── useTableHeight.ts       # 表格高度自适应
├── useTheme.ts             # 主题切换
├── useToken.ts             # Token管理
└── useWS.ts                # WebSocket通信
```

**命名规范:**
- 文件名: `use` + 功能名,小驼峰(camelCase)
- 函数导出: `export const use{功能名} = () => { ... }`
- 返回值: 返回响应式状态和操作方法的对象

**示例:**

```typescript
// src/composables/useDialog.ts
import { ref } from 'vue'

export const useDialog = () => {
  const dialogVisible = ref(false)
  const dialogTitle = ref('')
  const dialogData = ref<any>(null)

  const openDialog = (title: string, data?: any) => {
    dialogVisible.value = true
    dialogTitle.value = title
    dialogData.value = data
  }

  const closeDialog = () => {
    dialogVisible.value = false
    dialogData.value = null
  }

  return {
    dialogVisible,
    dialogTitle,
    dialogData,
    openDialog,
    closeDialog
  }
}
```

### src/directives - 全局指令目录

存放Vue自定义指令,用于DOM操作和行为扩展。

```text
src/directives/
├── permission/             # 权限指令
│   ├── index.ts           # 指令导出
│   └── hasPermi.ts        # 权限判断指令
├── dialog/                 # 弹窗相关指令
│   └── dragDialog.ts      # 弹窗拖拽指令
├── common/                 # 通用指令
│   ├── copy.ts            # 复制指令
│   ├── debounce.ts        # 防抖指令
│   └── throttle.ts        # 节流指令
└── index.ts                # 指令统一注册导出
```

**使用示例:**

```vue
<template>
  <!-- 权限指令 -->
  <el-button v-hasPermi="['system:user:add']">新增</el-button>

  <!-- 复制指令 -->
  <el-button v-copy="textToCopy">复制</el-button>

  <!-- 防抖指令 -->
  <el-button v-debounce="handleClick">搜索</el-button>
</template>
```

### src/layouts - 布局组件目录

存放页面布局组件,定义应用的整体结构。

```text
src/layouts/
├── components/             # 布局子组件
│   ├── AppMain.vue        # 主内容区域
│   ├── Navbar.vue         # 顶部导航栏
│   ├── Sidebar/           # 侧边栏组件
│   │   ├── index.vue     # 侧边栏入口
│   │   ├── SidebarItem.vue # 侧边栏菜单项
│   │   └── Logo.vue      # Logo组件
│   ├── TagsView/          # 标签页视图
│   │   ├── index.vue
│   │   └── ScrollPane.vue
│   ├── Settings/          # 设置面板
│   │   └── index.vue
│   └── Breadcrumb/        # 面包屑导航
│       └── index.vue
├── index.vue               # 默认布局
├── blank.vue               # 空白布局
└── iframe.vue              # IFrame布局
```

**布局类型:**
- **index.vue**: 标准管理后台布局(侧边栏+顶部栏+主内容区)
- **blank.vue**: 空白布局(仅主内容区,用于登录页等)
- **iframe.vue**: IFrame嵌入布局

### src/locales - 国际化语言文件目录

存放多语言翻译文件,支持国际化。

```text
src/locales/
├── lang/                   # 语言文件目录
│   ├── zh-cn.ts           # 中文简体
│   ├── zh-tw.ts           # 中文繁体
│   ├── en.ts              # 英文
│   └── ja.ts              # 日文
├── index.ts                # 国际化配置入口
└── README.md               # 使用说明
```

**使用示例:**

```typescript
// 语言文件: src/locales/lang/zh-cn.ts
export default {
  common: {
    add: '新增',
    edit: '编辑',
    delete: '删除',
    search: '搜索',
    reset: '重置'
  },
  user: {
    username: '用户名',
    password: '密码',
    login: '登录'
  }
}
```

```vue
<template>
  <el-button>{{ t('common.add') }}</el-button>
  <el-input :placeholder="t('user.username')" />
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>
```

### src/plugins - 插件配置目录

存放第三方库的插件配置和初始化代码。

```text
src/plugins/
├── element-plus.ts         # Element Plus配置
├── echarts.ts              # ECharts配置
├── i18n.ts                 # 国际化配置
├── permission.ts           # 路由权限配置
└── index.ts                # 插件统一导出
```

### src/router - 路由配置目录

定义应用的路由规则和导航守卫。

```text
src/router/
├── modules/                # 路由模块
│   ├── system.ts          # 系统管理路由
│   ├── business.ts        # 业务模块路由
│   ├── tool.ts            # 工具模块路由
│   └── workflow.ts        # 工作流路由
├── utils/                  # 路由工具函数
│   ├── guards.ts          # 路由守卫
│   └── dynamic.ts         # 动态路由处理
├── index.ts                # 路由实例
└── routes.ts               # 静态路由配置
```

**路由定义示例:**

```typescript
// src/router/modules/system.ts
import type { RouteRecordRaw } from 'vue-router'

const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: () => import('@/layouts/index.vue'),
    meta: { title: '系统管理', icon: 'system' },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/core/user/user.vue'),
        meta: { title: '用户管理', icon: 'user', perms: ['system:user:list'] }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/core/role/role.vue'),
        meta: { title: '角色管理', icon: 'role', perms: ['system:role:list'] }
      }
    ]
  }
]

export default systemRoutes
```

### src/stores - Pinia状态管理目录

使用Pinia进行全局状态管理。

```text
src/stores/
├── modules/                # Store模块
│   ├── user.ts            # 用户信息状态
│   ├── app.ts             # 应用配置状态
│   ├── permission.ts      # 权限路由状态
│   ├── tagsView.ts        # 标签页状态
│   ├── settings.ts        # 系统设置状态
│   └── dict.ts            # 字典数据状态
└── index.ts                # Store统一导出
```

**Store定义示例:**

```typescript
// src/stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const setRoles = (newRoles: string[]) => {
    roles.value = newRoles
  }

  const setPermissions = (perms: string[]) => {
    permissions.value = perms
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    roles.value = []
    permissions.value = []
  }

  return {
    userInfo,
    token,
    roles,
    permissions,
    setUserInfo,
    setToken,
    setRoles,
    setPermissions,
    logout
  }
}, {
  persist: true // 持久化配置
})
```

### src/types - TypeScript类型定义目录

集中管理项目的TypeScript类型定义。

```text
src/types/
├── global.d.ts             # 全局类型定义
├── env.d.ts                # 环境变量类型
├── api.d.ts                # API通用类型
├── router.d.ts             # 路由类型扩展
├── components.d.ts         # 组件类型(自动生成)
├── auto-imports.d.ts       # 自动导入类型(自动生成)
└── icons.d.ts              # 图标类型定义
```

**全局类型定义示例:**

```typescript
// src/types/global.d.ts
/** API响应结果类型 */
declare type Result<T = any> = Promise<[Error | null, T | null]>

/** 分页结果类型 */
declare interface PageResult<T = any> {
  /** 数据列表 */
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

/** 弹窗状态类型 */
declare interface DialogState {
  /** 是否显示 */
  visible: boolean
  /** 弹窗标题 */
  title?: string
  /** 弹窗数据 */
  data?: any
}

/** 字典项类型 */
declare interface DictItem {
  /** 字典值 */
  value: string | number
  /** 字典标签 */
  label: string
  /** 标签样式类型 */
  elTagType?: '' | 'success' | 'info' | 'warning' | 'danger'
  /** 标签样式主题 */
  elTagClass?: string
}

/** 表单配置类型 */
declare interface FieldConfig {
  /** 字段名 */
  prop: string
  /** 标签 */
  label: string
  /** 响应式span配置 */
  span?: SpanType
  /** 是否显示表单项 */
  showFormItem?: boolean
}

/** 响应式Span类型 */
declare type SpanType = number | ResponsiveSpan | 'auto' | undefined

/** 响应式Span配置 */
declare interface ResponsiveSpan {
  /** 超小屏 <768px */
  xs?: number
  /** 小屏 ≥768px */
  sm?: number
  /** 中屏 ≥992px */
  md?: number
  /** 大屏 ≥1200px */
  lg?: number
  /** 超大屏 ≥1920px */
  xl?: number
}
```

### src/utils - 工具函数目录

存放通用的工具函数和辅助方法。

```text
src/utils/
├── request.ts              # Axios请求封装
├── auth.ts                 # 认证工具(Token操作)
├── validate.ts             # 表单验证工具
├── permission.ts           # 权限判断工具
├── ruoyi.ts                # 若依框架工具集
├── jsencrypt.ts            # 加密解密工具
├── modal.ts                # 弹窗消息工具
├── dict.ts                 # 字典工具
├── download.ts             # 下载工具
├── scroll-to.ts            # 平滑滚动工具
├── clipboard.ts            # 剪贴板工具
└── index.ts                # 工具统一导出
```

**工具函数示例:**

```typescript
// src/utils/validate.ts
/** 验证手机号 */
export const isValidPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone)
}

/** 验证邮箱 */
export const isValidEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
}

/** 验证身份证号 */
export const isValidIdCard = (idCard: string): boolean => {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}
```

### src/views - 页面视图目录

存放所有页面级组件,按业务模块划分。

```text
src/views/
├── business/               # 业务模块页面
│   ├── base/              # 基础业务
│   │   ├── ad/           # 广告管理页面
│   │   │   └── ad.vue
│   │   ├── payment/      # 支付管理页面
│   │   └── ...
│   └── mall/              # 商城业务
│       ├── goods/        # 商品管理页面
│       │   ├── goods.vue # 商品列表
│       │   └── detail.vue # 商品详情
│       ├── order/        # 订单管理页面
│       └── ...
├── common/                 # 通用页面
│   ├── login.vue          # 登录页
│   ├── register.vue       # 注册页
│   ├── 404.vue            # 404错误页
│   └── 403.vue            # 403无权限页
├── system/                 # 系统模块页面
│   ├── core/              # 系统核心
│   │   ├── user/         # 用户管理
│   │   │   ├── user.vue  # 用户列表
│   │   │   ├── profile.vue # 用户资料
│   │   │   └── SelectUser.vue # 用户选择器
│   │   ├── role/         # 角色管理
│   │   │   └── role.vue
│   │   ├── menu/         # 菜单管理
│   │   │   └── menu.vue
│   │   ├── dept/         # 部门管理
│   │   │   └── dept.vue
│   │   ├── post/         # 岗位管理
│   │   │   └── post.vue
│   │   ├── dict/         # 字典管理
│   │   │   ├── index.vue
│   │   │   └── data.vue
│   │   └── config/       # 配置管理
│   │       └── config.vue
│   ├── log/               # 日志管理
│   │   ├── operlog.vue   # 操作日志
│   │   └── loginlog.vue  # 登录日志
│   └── monitor/           # 系统监控
│       ├── online.vue    # 在线用户
│       ├── job.vue       # 定时任务
│       └── cache.vue     # 缓存监控
├── tool/                   # 工具模块页面
│   ├── gen/               # 代码生成
│   │   └── gen.vue
│   └── swagger/           # 接口文档
│       └── index.vue
└── workflow/               # 工作流页面
    ├── definition/        # 流程定义
    ├── instance/          # 流程实例
    └── task/              # 待办任务
```

**页面组件命名:**
- 文件名: 小写连字符(kebab-case),如 `user-list.vue` 或 `user.vue`
- 组件name: 大驼峰(PascalCase),如 `UserList` 或 `User`

## 配置文件详解

### vite.config.ts - Vite配置文件

Vite构建工具的核心配置文件。

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  // 环境变量目录
  envDir: './env',

  // 基础路径
  base: '/',

  // 路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },

  // 插件配置
  plugins: [
    vue(),
    // ... 其他插件
  ],

  // 开发服务器配置
  server: {
    host: '0.0.0.0',
    port: 80,
    open: true,
    proxy: {
      '/dev-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-api/, '')
      }
    }
  },

  // CSS配置
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },

  // 依赖优化
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      '@vueuse/core',
      'echarts',
      'element-plus'
    ]
  }
})
```

### tsconfig.json - TypeScript配置文件

TypeScript编译器配置。

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": ["vite/client", "element-plus/global"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

### uno.config.ts - UnoCSS配置文件

原子化CSS框架配置。

```typescript
import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  // 预设配置
  presets: [
    presetUno(),           // Tailwind/Windi CSS预设
    presetAttributify(),   // 属性化模式
    presetIcons({          // 图标预设
      scale: 1.2,
      warn: true,
    })
  ],

  // 自定义规则
  rules: [
    // 示例: [/^m-(\d+)$/, ([, d]) => ({ margin: `${d}px` })]
  ],

  // 自定义快捷方式
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'text-ellipsis': 'overflow-hidden text-overflow-ellipsis whitespace-nowrap'
  },

  // 主题定制
  theme: {
    colors: {
      primary: '#409eff',
      success: '#67c23a',
      warning: '#e6a23c',
      danger: '#f56c6c',
      info: '#909399'
    }
  }
})
```

### eslint.config.ts - ESLint配置文件

代码质量和风格检查配置。

```typescript
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off'
    }
  }
]
```

### package.json - 项目依赖配置

项目元数据和依赖管理。

**核心依赖:**
- **Vue 3.5.13**: 渐进式JavaScript框架
- **TypeScript 5.8.3**: JavaScript超集,提供类型系统
- **Vite 6.3.2**: 下一代前端构建工具
- **Vue Router 4.5.0**: Vue官方路由管理器
- **Pinia 3.0.2**: Vue官方状态管理库
- **Element Plus 2.9.8**: Vue 3 UI组件库
- **Axios 1.8.4**: HTTP客户端
- **ECharts 5.6.0**: 数据可视化图表库
- **UnoCSS 66.5.2**: 原子化CSS引擎
- **@vueuse/core 13.1.0**: Vue组合式工具集

**开发依赖:**
- **@vitejs/plugin-vue**: Vite的Vue插件
- **unplugin-auto-import**: 自动导入API
- **unplugin-vue-components**: 自动导入组件
- **sass**: SCSS预处理器
- **eslint**: 代码检查工具
- **prettier**: 代码格式化工具

**脚本命令:**
```json
{
  "scripts": {
    "dev": "vite serve --mode development",
    "build:prod": "vite build --mode production",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint:eslint": "eslint --max-warnings=0",
    "lint:eslint:fix": "eslint --fix",
    "prettier": "prettier --write ."
  }
}
```

## 环境变量配置

### env目录结构

```text
env/
├── .env.development        # 开发环境
├── .env.production         # 生产环境
└── .env.test               # 测试环境
```

### 环境变量示例

```bash
# .env.development

# 应用标题
VITE_APP_TITLE = 若依Plus管理系统

# 应用端口
VITE_APP_PORT = 80

# 应用上下文路径
VITE_APP_CONTEXT_PATH = /

# API基础路径
VITE_APP_BASE_API = /dev-api

# 后端API端口
VITE_APP_BASE_API_PORT = 8080

# 文件上传路径
VITE_APP_UPLOAD_URL = http://localhost:8080/upload

# WebSocket地址
VITE_APP_WS_URL = ws://localhost:8080/ws
```

## 开发规范

### 文件命名规范

| 文件类型 | 命名规则 | 示例 |
|---------|---------|------|
| Vue组件 | 大驼峰(PascalCase) | `UserList.vue` |
| TypeScript文件 | 小驼峰(camelCase) | `useAuth.ts` |
| 样式文件 | 小写连字符(kebab-case) | `user-list.scss` |
| 目录 | 小写连字符(kebab-case) | `user-management/` |
| API文件 | 小驼峰+Api后缀 | `userApi.ts` |
| 类型文件 | 小驼峰+Types后缀 | `userTypes.ts` |

### 目录层级规范

- **最多3-4层**: 避免过深的目录嵌套
- **按功能划分**: 相同功能的文件放在同一目录
- **就近原则**: 组件的子组件、样式、测试文件放在同一目录下

**推荐结构:**

```text
components/
└── UserList/
    ├── UserList.vue          # 主组件
    ├── components/           # 子组件
    │   ├── UserItem.vue
    │   └── UserFilter.vue
    ├── hooks/                # 组合式函数
    │   └── useUserList.ts
    ├── types.ts              # 类型定义
    └── index.ts              # 导出
```

### 导入路径规范

**使用别名:**

```typescript
// ✅ 推荐: 使用@别名
import { useAuth } from '@/composables/useAuth'
import UserList from '@/views/system/user/UserList.vue'

// ❌ 不推荐: 使用相对路径
import { useAuth } from '../../../composables/useAuth'
import UserList from './UserList.vue'
```

**导入顺序:**

```typescript
// 1. Vue核心
import { ref, computed } from 'vue'

// 2. 第三方库
import { ElMessage } from 'element-plus'

// 3. @别名导入(按字母序)
import { useAuth } from '@/composables/useAuth'
import { listUser } from '@/api/system/user/userApi'
import type { UserVo } from '@/api/system/user/userTypes'

// 4. 相对路径导入
import UserItem from './components/UserItem.vue'
```

## 常见问题

### 1. 如何添加新的业务模块?

**步骤:**

1. 在 `src/api/` 下创建模块目录和API文件
2. 在 `src/views/` 下创建对应的页面组件
3. 在 `src/router/modules/` 下添加路由配置
4. 如需权限控制,配置路由的 `meta.perms` 字段

**示例:**

```typescript
// 1. API定义: src/api/business/product/productApi.ts
export const listProduct = (query: ProductQuery) => {
  return request({ url: '/product/list', method: 'get', params: query })
}

// 2. 页面组件: src/views/business/product/product.vue
<template>
  <div class="product-list">...</div>
</template>

// 3. 路由配置: src/router/modules/business.ts
{
  path: '/business/product',
  name: 'Product',
  component: () => import('@/views/business/product/product.vue'),
  meta: { title: '产品管理', perms: ['business:product:list'] }
}
```

### 2. 如何添加全局组件?

**步骤:**

1. 在 `src/components/` 下创建组件目录
2. 开发组件代码
3. 在 `src/components/index.ts` 中注册组件

**示例:**

```typescript
// 1. 组件: src/components/ATable/ATable.vue
<template>
  <el-table>...</el-table>
</template>

<script lang="ts" setup name="ATable">
// 组件逻辑
</script>

// 2. 注册: src/components/index.ts
import ATable from './ATable/ATable.vue'

export default {
  install(app: App) {
    app.component('ATable', ATable)
  }
}
```

### 3. 路径别名@不生效怎么办?

**问题原因:**
- Vite配置中未设置别名
- TypeScript配置中未设置路径映射
- IDE未识别别名配置

**解决方案:**

```typescript
// vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**VSCode配置:**
- 重启VSCode
- 检查 `jsconfig.json` 或 `tsconfig.json` 是否正确
- 安装 Path Intellisense 插件

### 4. 如何按需导入Element Plus组件?

**解决方案:**

项目已配置 `unplugin-vue-components`,会自动按需导入Element Plus组件。

```typescript
// vite/plugins/index.ts
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default function createPlugins() {
  return [
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/components.d.ts'
    })
  ]
}
```

**使用:**

```vue
<template>
  <!-- 无需手动导入,直接使用 -->
  <el-button type="primary">按钮</el-button>
  <el-table :data="tableData">...</el-table>
</template>

<script lang="ts" setup>
// 不需要 import
</script>
```

### 5. 如何自定义主题色?

**方案一: CSS变量覆盖**

```scss
// src/assets/styles/variables.scss
:root {
  --el-color-primary: #1890ff;
  --el-color-success: #52c41a;
  --el-color-warning: #faad14;
  --el-color-danger: #ff4d4f;
}
```

**方案二: UnoCSS主题配置**

```typescript
// uno.config.ts
export default defineConfig({
  theme: {
    colors: {
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      danger: '#ff4d4f'
    }
  }
})
```

**方案三: Element Plus主题定制**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/assets/styles/element/index.scss" as *;
        `
      }
    }
  }
})
```

```scss
// src/assets/styles/element/index.scss
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: (
    'primary': (
      'base': #1890ff,
    ),
  ),
);
```

## 最佳实践

### 1. 组件封装

**原则:**
- 单一职责: 一个组件只做一件事
- 高内聚低耦合: 组件内部逻辑完整,对外依赖少
- 可配置: 通过Props控制组件行为
- 可扩展: 提供插槽和事件

**示例:**

```vue
<template>
  <div class="user-card">
    <slot name="header">
      <div class="card-header">{{ title }}</div>
    </slot>

    <div class="card-body">
      <slot :user="user">
        <p>{{ user.name }}</p>
      </slot>
    </div>

    <slot name="footer">
      <div class="card-footer">
        <el-button @click="handleEdit">编辑</el-button>
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  title?: string
  user: User
}

const props = withDefaults(defineProps<Props>(), {
  title: '用户信息'
})

const emit = defineEmits<{
  edit: [user: User]
}>()

const handleEdit = () => {
  emit('edit', props.user)
}
</script>
```

### 2. Composables使用

**何时使用:**
- 逻辑复用: 多个组件使用相同逻辑
- 状态共享: 跨组件共享状态
- 副作用管理: 封装定时器、监听器等

**命名规范:**
- 文件名: `use{功能名}.ts`
- 函数名: `use{功能名}`
- 返回值: 包含状态和方法的对象

**示例:**

```typescript
// src/composables/useUserList.ts
import { ref } from 'vue'
import { listUser } from '@/api/system/user/userApi'
import type { UserVo, UserQuery } from '@/api/system/user/userTypes'

export const useUserList = () => {
  const loading = ref(false)
  const userList = ref<UserVo[]>([])
  const total = ref(0)
  const queryParams = ref<UserQuery>({
    pageNum: 1,
    pageSize: 10
  })

  const getList = async () => {
    loading.value = true
    const [err, data] = await listUser(queryParams.value)
    if (!err) {
      userList.value = data.records
      total.value = data.total
    }
    loading.value = false
  }

  const handleQuery = () => {
    queryParams.value.pageNum = 1
    getList()
  }

  const resetQuery = () => {
    queryParams.value = {
      pageNum: 1,
      pageSize: 10
    }
    getList()
  }

  return {
    loading,
    userList,
    total,
    queryParams,
    getList,
    handleQuery,
    resetQuery
  }
}
```

### 3. API请求封装

**统一错误处理:**

```typescript
// src/utils/request.ts
import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const { code, data, msg } = response.data
    if (code === 200) {
      return [null, data]
    } else {
      ElMessage.error(msg || '请求失败')
      return [new Error(msg), null]
    }
  },
  error => {
    ElMessage.error(error.message || '网络错误')
    return [error, null]
  }
)

export default service
```

**API定义:**

```typescript
// src/api/system/user/userApi.ts
import request from '@/utils/request'
import type { UserVo, UserQuery, UserForm } from './userTypes'

/** 查询用户列表 */
export const listUser = (query: UserQuery): Result<PageResult<UserVo>> => {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

/** 获取用户详情 */
export const getUser = (userId: number): Result<UserVo> => {
  return request({
    url: `/system/user/${userId}`,
    method: 'get'
  })
}

/** 新增用户 */
export const addUser = (data: UserForm): Result<void> => {
  return request({
    url: '/system/user',
    method: 'post',
    data
  })
}

/** 修改用户 */
export const updateUser = (data: UserForm): Result<void> => {
  return request({
    url: '/system/user',
    method: 'put',
    data
  })
}

/** 删除用户 */
export const delUser = (userId: number | number[]): Result<void> => {
  return request({
    url: `/system/user/${userId}`,
    method: 'delete'
  })
}
```

### 4. 类型定义

**接口定义:**

```typescript
// src/api/system/user/userTypes.ts

/** 用户视图对象 */
export interface UserVo {
  /** 用户ID */
  userId: number
  /** 用户名 */
  userName: string
  /** 昵称 */
  nickName: string
  /** 邮箱 */
  email: string
  /** 手机号 */
  phone: string
  /** 性别 */
  sex: string
  /** 头像 */
  avatar: string
  /** 状态 */
  status: string
  /** 部门ID */
  deptId: number
  /** 部门名称 */
  deptName: string
  /** 岗位IDs */
  postIds: number[]
  /** 角色IDs */
  roleIds: number[]
  /** 创建时间 */
  createTime: string
}

/** 用户查询对象 */
export interface UserQuery {
  /** 页码 */
  pageNum: number
  /** 每页大小 */
  pageSize: number
  /** 用户名 */
  userName?: string
  /** 手机号 */
  phone?: string
  /** 状态 */
  status?: string
  /** 部门ID */
  deptId?: number
  /** 开始时间 */
  beginTime?: string
  /** 结束时间 */
  endTime?: string
}

/** 用户表单对象 */
export interface UserForm {
  /** 用户ID */
  userId?: number
  /** 用户名 */
  userName: string
  /** 昵称 */
  nickName: string
  /** 密码 */
  password?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 性别 */
  sex?: string
  /** 状态 */
  status: string
  /** 部门ID */
  deptId: number
  /** 岗位IDs */
  postIds: number[]
  /** 角色IDs */
  roleIds: number[]
  /** 备注 */
  remark?: string
}
```

### 5. 状态管理

**Store定义:**

```typescript
// src/stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/user'
import { getUserInfo } from '@/api/system/user/userApi'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // 计算属性
  const isLogin = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.userName || '')

  // 方法
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    roles.value = info.roles
    permissions.value = info.permissions
  }

  const getInfo = async () => {
    const [err, data] = await getUserInfo()
    if (!err) {
      setUserInfo(data)
    }
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    roles.value = []
    permissions.value = []
    localStorage.removeItem('token')
  }

  return {
    // 状态
    userInfo,
    token,
    roles,
    permissions,
    // 计算属性
    isLogin,
    userName,
    // 方法
    setToken,
    setUserInfo,
    getInfo,
    logout
  }
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['userInfo', 'token', 'roles', 'permissions']
  }
})
```

**使用Store:**

```vue
<template>
  <div>
    <p>欢迎, {{ userStore.userName }}</p>
    <el-button @click="handleLogout">退出登录</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>
```

## 总结

RuoYi-Plus-UniApp前端项目采用清晰的目录结构和模块化设计,遵循Vue 3和TypeScript最佳实践。通过合理的目录划分、统一的命名规范和完善的类型系统,为项目的可维护性和可扩展性提供了坚实基础。

**关键要点:**
- 按功能模块划分目录,便于管理和维护
- 使用TypeScript增强类型安全
- 组件化开发,提高代码复用性
- Composables封装业务逻辑
- 统一的API请求和错误处理
- Pinia状态管理,支持持久化
- 完善的配置文件和环境变量管理
