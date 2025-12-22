# 项目结构

## 介绍

RuoYi-Plus-UniApp 前端项目(plus-ui)采用现代化的 Vue 3 技术栈构建，遵循清晰的目录组织规范和模块化设计原则。

**核心特性:**

- **模块化架构** - 按功能职责划分目录，API、组件、状态管理各司其职
- **类型安全** - 完整的 TypeScript 类型定义，自动生成类型声明文件
- **组合式开发** - 基于 Vue 3 Composition API 的 Composables 函数库
- **统一规范** - 标准化的文件命名、目录组织和代码风格
- **构建优化** - Vite 插件体系，支持自动导入、图标生成、代码压缩

**技术栈:**

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.13 | 渐进式 JavaScript 框架 |
| TypeScript | 5.8.3 | JavaScript 超集 |
| Vite | 6.3.2 | 下一代构建工具 |
| Element Plus | 2.9.8 | Vue 3 UI 组件库 |
| Pinia | 3.0.2 | Vue 状态管理 |
| Vue Router | 4.5.0 | Vue 官方路由 |
| UnoCSS | 65.5.1 | 原子化 CSS 引擎 |

## 目录结构总览

```text
📁 plus-ui/
├── 📁 bin/                             # 脚本工具目录
├── 📁 dist/                            # 构建输出目录
├── 📁 env/                             # 环境变量配置目录
│   ├── 📄 .env                         # 共同环境配置
│   ├── 📄 .env.development             # 开发环境配置
│   └── 📄 .env.production              # 生产环境配置
│
├── 📁 node_modules/                    # 依赖包目录
├── 📁 public/                          # 静态资源目录(不参与构建)
├── 📁 src/                             # 源代码目录
│   ├── 📁 api/                         # API 接口模块
│   ├── 📁 assets/                      # 静态资源(参与构建)
│   ├── 📁 components/                  # 全局组件库
│   ├── 📁 composables/                 # 组合式函数
│   ├── 📁 directives/                  # 自定义指令
│   ├── 📁 layouts/                     # 布局组件
│   ├── 📁 locales/                     # 国际化资源
│   ├── 📁 plugins/                     # 插件配置
│   ├── 📁 router/                      # 路由配置
│   ├── 📁 stores/                      # Pinia 状态管理
│   ├── 📁 types/                       # TypeScript 类型定义
│   ├── 📁 utils/                       # 工具函数库
│   ├── 📁 views/                       # 页面视图
│   ├── 📄 App.vue                      # 根组件
│   ├── 📄 main.ts                      # 应用入口
│   └── 📄 systemConfig.ts              # 系统配置
│
├── 📁 vite/                            # Vite 插件目录
│   └── 📁 plugins/                     # 自定义插件
│
├── 📄 .editorconfig                    # 编辑器配置
├── 📄 .eslintrc-auto-import.json       # ESLint 自动导入配置
├── 📄 .gitignore                       # Git 忽略文件
├── 📄 .npmrc                           # npm 配置
├── 📄 .prettierignore                  # Prettier 忽略文件
├── 📄 .prettierrc.js                   # Prettier 配置
├── 📄 eslint.config.ts                 # ESLint 配置
├── 📄 index.html                       # HTML 模板
├── 📄 package.json                     # 项目依赖配置
├── 📄 pnpm-lock.yaml                   # pnpm 锁定文件
├── 📄 tsconfig.json                    # TypeScript 配置
├── 📄 uno.config.ts                    # UnoCSS 配置
└── 📄 vite.config.ts                   # Vite 构建配置
```

## 根目录文件详解

### package.json

项目依赖和脚本配置文件，定义项目元信息、依赖包和 npm 脚本。

```json
{
  "name": "plus-ui",
  "version": "5.5.0",
  "scripts": {
    "dev": "vite serve --mode development",
    "build:prod": "vite build --mode production",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint:eslint": "eslint --max-warnings=0 --timeout=60000",
    "lint:eslint:fix": "eslint --fix --timeout=60000",
    "prettier": "prettier --write ."
  },
  "engines": {
    "node": ">=18.18.0",
    "npm": ">=8.9.0",
    "pnpm": ">=7.30"
  }
}
```

**核心脚本说明:**

| 脚本 | 说明 |
|------|------|
| `dev` | 启动开发服务器 |
| `build:prod` | 生产环境构建 |
| `build:dev` | 开发环境构建 |
| `preview` | 预览构建结果 |
| `lint:eslint` | ESLint 代码检查 |
| `lint:eslint:fix` | ESLint 自动修复 |
| `prettier` | Prettier 格式化 |

### vite.config.ts

Vite 构建工具配置文件，包含开发服务器、代理、插件等配置。

```typescript
import { ConfigEnv, defineConfig, loadEnv, UserConfig } from 'vite'
import createPlugins from './vite/plugins'
import autoprefixer from 'autoprefixer'
import path from 'path'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))

  return defineConfig({
    // 环境变量目录
    envDir: './env',

    // 部署基础路径
    base: env.VITE_APP_CONTEXT_PATH,

    // 路径别名
    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },

    // 插件配置
    plugins: createPlugins(env, command === 'build'),

    // 开发服务器
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_APP_PORT),
      open: true,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: 'http://127.0.0.1:' + env.VITE_APP_BASE_API_PORT,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        }
      }
    },

    // CSS 配置
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      },
      postcss: {
        plugins: [autoprefixer()]
      }
    },

    // 依赖优化
    optimizeDeps: {
      include: [
        'vue', 'vue-router', 'pinia', 'axios',
        '@vueuse/core', 'echarts', 'vue-i18n'
      ]
    }
  })
}
```

### tsconfig.json

TypeScript 编译器配置文件。

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client", "element-plus/global"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "vite/**/*.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

### uno.config.ts

UnoCSS 原子化 CSS 配置文件。

```typescript
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true
    })
  ],
  shortcuts: {
    'flex-center': 'flex justify-center items-center',
    'flex-between': 'flex justify-between items-center'
  },
  theme: {
    colors: {
      primary: 'var(--el-color-primary)'
    }
  }
})
```

### eslint.config.ts

ESLint 代码检查配置文件，采用扁平化配置格式。

```typescript
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import * as parserTypeScript from '@typescript-eslint/parser'
import pluginTypeScript from '@typescript-eslint/eslint-plugin'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: parserTypeScript,
        sourceType: 'module'
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: parserTypeScript
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript
    }
  }
]
```

## src 目录详解

### api/ - API 接口模块

API 接口按业务模块组织，每个模块包含接口定义和类型声明。

```text
📁 api/
├── 📁 business/                # 业务模块接口
│   ├── 📁 base/                # 基础业务
│   └── 📁 mall/                # 商城业务
│
├── 📁 common/                  # 通用接口
│   └── 📄 captcha.ts           # 验证码接口
│
├── 📁 system/                  # 系统管理接口
│   ├── 📁 auth/                # 认证相关
│   │   ├── 📄 authApi.ts       # 认证接口
│   │   └── 📄 authTypes.ts     # 认证类型
│   ├── 📁 config/              # 参数配置
│   ├── 📁 dept/                # 部门管理
│   ├── 📁 dict/                # 字典管理
│   ├── 📁 menu/                # 菜单管理
│   ├── 📁 notice/              # 通知公告
│   ├── 📁 oss/                 # 对象存储
│   ├── 📁 post/                # 岗位管理
│   ├── 📁 role/                # 角色管理
│   ├── 📁 tenant/              # 租户管理
│   └── 📁 user/                # 用户管理
│
├── 📁 tool/                    # 工具接口
│   └── 📁 gen/                 # 代码生成
│
└── 📁 workflow/                # 工作流接口
    ├── 📁 definition/          # 流程定义
    ├── 📁 instance/            # 流程实例
    └── 📁 task/                # 任务管理
```

**API 模块规范:**

每个 API 模块通常包含两个文件：
- `xxxApi.ts` - 接口函数定义
- `xxxTypes.ts` - TypeScript 类型定义

```typescript
// userApi.ts - 接口函数示例
import { useHttp } from '@/composables/useHttp'
import type { UserQuery, UserVO, UserForm } from './userTypes'

const { request } = useHttp()

/** 查询用户列表 */
export const listUser = (query: UserQuery) => {
  return request.get<PageResult<UserVO>>('/system/user/list', { params: query })
}

/** 获取用户详情 */
export const getUser = (userId: number) => {
  return request.get<UserVO>(`/system/user/${userId}`)
}

/** 新增用户 */
export const addUser = (data: UserForm) => {
  return request.post('/system/user', data)
}

/** 修改用户 */
export const updateUser = (data: UserForm) => {
  return request.put('/system/user', data)
}

/** 删除用户 */
export const deleteUser = (userIds: number[]) => {
  return request.delete(`/system/user/${userIds.join(',')}`)
}
```

```typescript
// userTypes.ts - 类型定义示例
/** 用户查询参数 */
export interface UserQuery extends PageQuery {
  userName?: string
  phonenumber?: string
  status?: string
  deptId?: number
}

/** 用户视图对象 */
export interface UserVO {
  userId: number
  userName: string
  nickName: string
  email: string
  phonenumber: string
  sex: string
  avatar: string
  status: string
  deptId: number
  deptName: string
  roleIds: number[]
  postIds: number[]
  createTime: string
}

/** 用户表单对象 */
export interface UserForm {
  userId?: number
  userName: string
  nickName: string
  password?: string
  email?: string
  phonenumber?: string
  sex?: string
  status?: string
  deptId?: number
  roleIds?: number[]
  postIds?: number[]
  remark?: string
}
```

### assets/ - 静态资源目录

存放需要参与构建处理的静态资源文件。

```text
📁 assets/
├── 📁 icons/                   # 图标资源
│   ├── 📁 system/              # 系统图标字体
│   │   ├── 📄 iconfont.css     # 图标样式
│   │   ├── 📄 iconfont.ttf     # 字体文件
│   │   └── 📄 iconfont.woff    # 字体文件
│   └── 📁 svg/                 # SVG 图标
│
├── 📁 images/                  # 图片资源
│   ├── 📁 login/               # 登录页图片
│   ├── 📁 common/              # 通用图片
│   └── 📁 error/               # 错误页图片
│
├── 📁 logo/                    # Logo 资源
│   ├── 📄 logo.png             # 标准 Logo
│   └── 📄 logo-mini.png        # 迷你 Logo
│
└── 📁 styles/                  # 样式文件
    ├── 📄 main.scss            # 主样式入口
    ├── 📄 variables.scss       # SCSS 变量
    ├── 📄 element-plus.scss    # Element Plus 覆盖样式
    ├── 📄 sidebar.scss         # 侧边栏样式
    ├── 📄 transition.scss      # 过渡动画
    └── 📄 mixin.scss           # SCSS 混入
```

**样式文件说明:**

| 文件 | 说明 |
|------|------|
| `main.scss` | 主样式入口，导入所有子样式 |
| `variables.scss` | SCSS 变量定义，主题色、间距等 |
| `element-plus.scss` | Element Plus 组件样式覆盖 |
| `sidebar.scss` | 侧边栏相关样式 |
| `transition.scss` | 页面过渡动画 |
| `mixin.scss` | SCSS 混入函数 |

### components/ - 全局组件库

项目全局可用的业务组件，采用 `A` 前缀命名。

```text
📁 components/
├── 📁 AAi/                     # AI 聊天组件
│   └── 📄 AAiChat.vue          # AI 对话组件
│
├── 📁 ACard/                   # 数据卡片组件
│   └── 📄 ADataCard.vue        # 统计数据卡片
│
├── 📁 AChart/                  # 图表组件
│   ├── 📄 ABarChart.vue        # 柱状图
│   ├── 📄 ALineChart.vue       # 折线图
│   └── 📄 APieChart.vue        # 饼图
│
├── 📁 ADetail/                 # 详情展示组件
│   ├── 📄 ADetailDialog.vue    # 详情弹窗
│   └── 📄 ADetailDrawer.vue    # 详情抽屉
│
├── 📁 AForm/                   # 表单组件库
│   ├── 📄 AFormCascader.vue    # 级联选择
│   ├── 📄 AFormCheckbox.vue    # 复选框
│   ├── 📄 AFormDate.vue        # 日期选择
│   ├── 📄 AFormEditor.vue      # 富文本编辑器
│   ├── 📄 AFormFileUpload.vue  # 文件上传
│   ├── 📄 AFormImgUpload.vue   # 图片上传
│   ├── 📄 AFormInput.vue       # 输入框
│   ├── 📄 AFormRadio.vue       # 单选框
│   ├── 📄 AFormSelect.vue      # 下拉选择
│   ├── 📄 AFormSwitch.vue      # 开关
│   ├── 📄 AFormTextarea.vue    # 文本域
│   └── 📄 AFormTreeSelect.vue  # 树形选择
│
├── 📁 AImportExcel/            # Excel 导入组件
│   └── 📄 AImportExcel.vue     # 导入弹窗
│
├── 📁 AModal/                  # 模态框组件
│   ├── 📄 AModal.vue           # 通用模态框
│   └── 📄 ADrawer.vue          # 抽屉组件
│
├── 📁 AOssMediaManager/        # OSS 媒体管理
│   └── 📄 AOssMediaManager.vue # 媒体库组件
│
├── 📁 ARecharge/               # 充值组件
│   └── 📄 ARecharge.vue        # 在线充值
│
├── 📁 AResizablePanels/        # 可调整面板
│   └── 📄 AResizablePanels.vue # 分割面板
│
├── 📁 ASearchForm/             # 搜索表单
│   └── 📄 ASearchForm.vue      # 通用搜索
│
├── 📁 ASelectionTags/          # 选择标签
│   └── 📄 ASelectionTags.vue   # 可选标签组
│
├── 📁 ATable/                  # 表格组件
│   ├── 📄 ATable.vue           # 增强表格
│   └── 📄 ATablePro.vue        # 高级表格
│
├── 📁 ATableColumnSettings/    # 表格列设置
│   └── 📄 ATableColumnSettings.vue
│
├── 📁 ATheme/                  # 主题组件
│   └── 📄 AThemePicker.vue     # 主题选择器
│
├── 📁 DictTag/                 # 字典标签
│   └── 📄 DictTag.vue          # 字典值展示
│
├── 📁 Icon/                    # 图标组件
│   └── 📄 SvgIcon.vue          # SVG 图标
│
├── 📁 IFrameContainer/         # IFrame 容器
│   └── 📄 IFrameContainer.vue  # 内嵌页面
│
├── 📁 ImagePreview/            # 图片预览
│   └── 📄 ImagePreview.vue     # 图片查看器
│
├── 📁 Pagination/              # 分页组件
│   └── 📄 Pagination.vue       # 通用分页
│
├── 📁 TableToolbar/            # 表格工具栏
│   └── 📄 TableToolbar.vue     # 右侧工具
│
└── 📁 UserSelect/              # 用户选择
    └── 📄 UserSelect.vue       # 用户选择器
```

**组件命名规范:**

| 前缀 | 说明 | 示例 |
|------|------|------|
| `A` | 业务组件 | `AForm`、`ATable`、`AModal` |
| `Dict` | 字典相关 | `DictTag` |
| `Svg` | SVG 图标 | `SvgIcon` |
| 无前缀 | 通用组件 | `Pagination`、`ImagePreview` |

### composables/ - 组合式函数

基于 Vue 3 Composition API 的可复用逻辑函数。

```text
📁 composables/
├── 📄 useAiChat.ts             # AI 聊天功能
├── 📄 useAnimation.ts          # 动画效果
├── 📄 useAuth.ts               # 权限控制
├── 📄 useDialog.ts             # 对话框管理
├── 📄 useDict.ts               # 字典数据
├── 📄 useDownload.ts           # 文件下载
├── 📄 useHttp.ts               # HTTP 请求
├── 📄 useI18n.ts               # 国际化
├── 📄 useLayout.ts             # 布局控制
├── 📄 usePrint.ts              # 打印功能
├── 📄 useResponsiveSpan.ts     # 响应式栅格
├── 📄 useSelection.ts          # 表格选择
├── 📄 useSSE.ts                # SSE 连接
├── 📄 useTableHeight.ts        # 表格高度
├── 📄 useTheme.ts              # 主题管理
├── 📄 useToken.ts              # Token 管理
└── 📄 useWS.ts                 # WebSocket
```

**核心 Composables 说明:**

| 函数 | 说明 | 主要功能 |
|------|------|----------|
| `useHttp` | HTTP 请求 | 封装 Axios，支持加密、拦截器 |
| `useAuth` | 权限控制 | 按钮权限、角色权限判断 |
| `useDict` | 字典数据 | 字典加载、缓存、格式化 |
| `useToken` | Token 管理 | 存取 Token、刷新 Token |
| `useTheme` | 主题管理 | 切换主题、暗黑模式 |
| `useDialog` | 对话框 | 弹窗打开、关闭、状态管理 |
| `useDownload` | 文件下载 | Blob 下载、导出文件 |
| `useSelection` | 表格选择 | 多选、单选、全选逻辑 |
| `useTableHeight` | 表格高度 | 自适应高度计算 |
| `useI18n` | 国际化 | 多语言切换、翻译函数 |
| `useLayout` | 布局控制 | 侧边栏、导航栏状态 |
| `useSSE` | SSE 连接 | 服务端推送事件 |
| `useWS` | WebSocket | 实时双向通信 |

**使用示例:**

```typescript
// 使用 useAuth 进行权限控制
import { useAuth } from '@/composables/useAuth'

const { hasPermi, hasRole } = useAuth()

// 检查按钮权限
if (hasPermi('system:user:add')) {
  // 有新增权限
}

// 检查角色
if (hasRole('admin')) {
  // 是管理员角色
}
```

```typescript
// 使用 useDict 加载字典
import { useDict } from '@/composables/useDict'

const { sys_normal_disable, sys_user_sex } = useDict(
  'sys_normal_disable',
  'sys_user_sex'
)
```

```typescript
// 使用 useHttp 发送请求
import { useHttp } from '@/composables/useHttp'

const { request, get, post } = useHttp()

// GET 请求
const data = await get<UserVO[]>('/system/user/list')

// POST 请求
await post('/system/user', formData)
```

### directives/ - 自定义指令

Vue 自定义指令定义和注册。

```text
📁 directives/
├── 📄 directives.ts            # 指令统一注册
└── 📄 permission.ts            # 权限控制指令
```

**权限指令使用:**

```vue
<template>
  <!-- 按钮权限 -->
  <el-button v-hasPermi="['system:user:add']">新增</el-button>

  <!-- 角色权限 -->
  <el-button v-hasRole="['admin']">管理员操作</el-button>
</template>
```

**指令注册:**

```typescript
// directives.ts
import type { App } from 'vue'
import hasPermi from './permission'

export default function directive(app: App) {
  // 注册权限指令
  app.directive('hasPermi', hasPermi)
  app.directive('hasRole', hasRole)
}
```

### layouts/ - 布局组件

应用布局相关组件，包括导航栏、侧边栏、标签页等。

```text
📁 layouts/
├── 📁 components/              # 布局子组件
│   ├── 📁 AppMain/             # 主内容区
│   │   ├── 📁 iframe/          # iframe 相关
│   │   │   ├── 📄 IframeToggle.vue
│   │   │   └── 📄 InnerLink.vue
│   │   ├── 📄 AppMain.vue      # 主内容入口
│   │   └── 📄 ParentView.vue   # 父级视图
│   │
│   ├── 📁 Navbar/              # 导航栏
│   │   ├── 📁 tools/           # 工具组件
│   │   │   ├── 📄 DocLink.vue          # 文档链接
│   │   │   ├── 📄 FullscreenToggle.vue # 全屏切换
│   │   │   ├── 📄 GitLink.vue          # Git 链接
│   │   │   ├── 📄 LangSelect.vue       # 语言选择
│   │   │   ├── 📄 NavbarSearch.vue     # 搜索
│   │   │   ├── 📄 Notice.vue           # 通知
│   │   │   ├── 📄 SizeSelect.vue       # 尺寸选择
│   │   │   ├── 📄 TenantSelect.vue     # 租户选择
│   │   │   └── 📄 UserDropdown.vue     # 用户菜单
│   │   ├── 📄 Breadcrumb.vue   # 面包屑
│   │   ├── 📄 Hamburger.vue    # 汉堡菜单
│   │   ├── 📄 Navbar.vue       # 导航栏主组件
│   │   └── 📄 TopNav.vue       # 顶部导航
│   │
│   ├── 📁 Settings/            # 设置面板
│   │   └── 📄 Settings.vue     # 布局设置
│   │
│   ├── 📁 Sidebar/             # 侧边栏
│   │   ├── 📄 AppLink.vue      # 应用链接
│   │   ├── 📄 Logo.vue         # Logo
│   │   ├── 📄 Sidebar.vue      # 侧边栏主组件
│   │   └── 📄 SidebarItem.vue  # 菜单项
│   │
│   └── 📁 TagsView/            # 标签页
│       ├── 📄 ScrollPane.vue   # 滚动面板
│       └── 📄 TagsView.vue     # 标签页主组件
│
├── 📄 HomeLayout.vue           # 首页布局
└── 📄 Layout.vue               # 主布局入口
```

**布局结构:**

```
┌─────────────────────────────────────────────────┐
│                    Navbar                        │
├─────────┬───────────────────────────────────────┤
│         │              TagsView                  │
│         ├───────────────────────────────────────┤
│ Sidebar │                                       │
│         │              AppMain                   │
│         │                                       │
│         │                                       │
└─────────┴───────────────────────────────────────┘
```

### locales/ - 国际化资源

多语言翻译文件和国际化配置。

```text
📁 locales/
├── 📄 en_US.ts                 # 英文语言包
├── 📄 zh_CN.ts                 # 中文语言包
└── 📄 i18n.ts                  # 国际化配置
```

**语言包结构:**

```typescript
// zh_CN.ts
export default {
  // 通用
  common: {
    add: '新增',
    edit: '编辑',
    delete: '删除',
    search: '搜索',
    reset: '重置',
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    export: '导出',
    import: '导入'
  },

  // 登录页
  login: {
    title: '系统登录',
    username: '用户名',
    password: '密码',
    captcha: '验证码',
    rememberMe: '记住我',
    login: '登录'
  },

  // 菜单
  menu: {
    dashboard: '首页',
    system: '系统管理',
    user: '用户管理',
    role: '角色管理',
    menu: '菜单管理'
  }
}
```

**国际化配置:**

```typescript
// i18n.ts
import { createI18n } from 'vue-i18n'
import zhCN from './zh_CN'
import enUS from './en_US'
import { SystemConfig } from '@/systemConfig'

const i18n = createI18n({
  legacy: false,
  locale: SystemConfig.ui.language,
  fallbackLocale: 'zh_CN',
  messages: {
    zh_CN: zhCN,
    en_US: enUS
  }
})

export default i18n
```

### plugins/ - 插件配置

Vue 插件和第三方库配置。

```text
📁 plugins/
└── 📄 elementIcons.ts          # Element Plus 图标注册
```

**图标注册:**

```typescript
// elementIcons.ts
import type { App } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export default {
  install(app: App) {
    // 注册所有 Element Plus 图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
  }
}
```

### router/ - 路由配置

Vue Router 路由配置和导航守卫。

```text
📁 router/
├── 📁 modules/                 # 路由模块
│   ├── 📄 constant.ts          # 常量路由(无需权限)
│   ├── 📄 system.ts            # 系统模块路由
│   └── 📄 tool.ts              # 工具模块路由
│
├── 📁 utils/                   # 路由工具
│   └── 📄 createCustomNameComponent.tsx
│
├── 📄 guard.ts                 # 路由守卫
└── 📄 router.ts                # 路由主配置
```

**路由配置示例:**

```typescript
// router.ts
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes } from './modules/constant'
import { SystemConfig } from '@/systemConfig'

const router = createRouter({
  history: createWebHistory(SystemConfig.app.contextPath),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
})

export default router
```

**路由守卫:**

```typescript
// guard.ts
import router from './router'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'

// 白名单路由
const whiteList = ['/login', '/register', '/social-callback']

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 已登录
  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 判断是否已获取用户信息
      if (!userStore.roles.length) {
        // 获取用户信息
        await userStore.getInfo()
        // 生成动态路由
        const accessRoutes = await permissionStore.generateRoutes()
        // 添加路由
        accessRoutes.forEach(route => router.addRoute(route))
        next({ ...to, replace: true })
      } else {
        next()
      }
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`)
    }
  }
})
```

### stores/ - Pinia 状态管理

Pinia 状态管理模块。

```text
📁 stores/
├── 📁 modules/                 # 状态模块
│   ├── 📄 aiChat.ts            # AI 聊天状态
│   ├── 📄 dict.ts              # 字典数据状态
│   ├── 📄 feature.ts           # 功能特性状态
│   ├── 📄 notice.ts            # 通知公告状态
│   ├── 📄 permission.ts        # 权限状态
│   └── 📄 user.ts              # 用户状态
│
└── 📄 store.ts                 # Store 统一入口
```

**状态模块说明:**

| 模块 | 说明 | 主要状态 |
|------|------|----------|
| `user` | 用户状态 | token、用户信息、角色、权限 |
| `permission` | 权限状态 | 动态路由、菜单 |
| `dict` | 字典状态 | 字典数据缓存 |
| `notice` | 通知状态 | 未读消息、通知列表 |
| `feature` | 功能状态 | 功能开关、配置 |
| `aiChat` | AI 聊天 | 聊天记录、会话状态 |

**用户状态示例:**

```typescript
// user.ts
import { defineStore } from 'pinia'
import { login, logout, getInfo } from '@/api/system/auth/authApi'
import { useToken } from '@/composables/useToken'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: useToken().getToken(),
    name: '',
    avatar: '',
    roles: [] as string[],
    permissions: [] as string[]
  }),

  actions: {
    // 登录
    async login(userInfo: LoginParams) {
      const { data } = await login(userInfo)
      this.token = data.token
      useToken().setToken(data.token)
    },

    // 获取用户信息
    async getInfo() {
      const { data } = await getInfo()
      this.name = data.user.nickName
      this.avatar = data.user.avatar
      this.roles = data.roles
      this.permissions = data.permissions
    },

    // 登出
    async logout() {
      await logout()
      this.token = ''
      this.roles = []
      this.permissions = []
      useToken().removeToken()
    }
  }
})
```

### types/ - TypeScript 类型定义

TypeScript 类型声明文件。

```text
📁 types/
├── 📄 auto-imports.d.ts        # 自动导入类型(自动生成)
├── 📄 components.d.ts          # 组件类型(自动生成)
├── 📄 element.d.ts             # Element Plus 类型扩展
├── 📄 env.d.ts                 # 环境变量类型
├── 📄 global.d.ts              # 全局类型定义
├── 📄 http.d.ts                # HTTP 相关类型
├── 📄 icons.d.ts               # 图标类型(自动生成)
└── 📄 router.d.ts              # 路由类型扩展
```

**全局类型定义:**

```typescript
// global.d.ts
/** 分页查询参数 */
interface PageQuery {
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: string
}

/** 分页结果 */
interface PageResult<T> {
  rows: T[]
  total: number
}

/** 通用响应结构 */
interface R<T = any> {
  code: number
  msg: string
  data: T
}

/** 树形结构 */
interface TreeNode<T = any> {
  id: number | string
  label: string
  children?: TreeNode<T>[]
  [key: string]: any
}

/** Element Plus 尺寸 */
type ElSize = 'large' | 'default' | 'small'
```

**环境变量类型:**

```typescript
// env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 应用ID */
  readonly VITE_APP_ID: string
  /** 应用标题 */
  readonly VITE_APP_TITLE: string
  /** 应用环境 */
  readonly VITE_APP_ENV: string
  /** 应用端口 */
  readonly VITE_APP_PORT: string
  /** API 基础路径 */
  readonly VITE_APP_BASE_API: string
  /** 后端端口 */
  readonly VITE_APP_BASE_API_PORT: string
  /** 是否启用 API 加密 */
  readonly VITE_APP_API_ENCRYPT: string
  /** RSA 公钥 */
  readonly VITE_APP_RSA_PUBLIC_KEY: string
  /** RSA 私钥 */
  readonly VITE_APP_RSA_PRIVATE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### utils/ - 工具函数库

通用工具函数集合。

```text
📁 utils/
├── 📄 boolean.ts               # 布尔值处理
├── 📄 cache.ts                 # 缓存工具
├── 📄 class.ts                 # DOM 类操作
├── 📄 colors.ts                # 颜色处理
├── 📄 crypto.ts                # 加密解密
├── 📄 date.ts                  # 日期处理
├── 📄 format.ts                # 格式化工具
├── 📄 function.ts              # 函数工具(防抖节流)
├── 📄 modal.ts                 # 模态框工具
├── 📄 object.ts                # 对象处理
├── 📄 rsa.ts                   # RSA 加密
├── 📄 scroll.ts                # 滚动工具
├── 📄 string.ts                # 字符串处理
├── 📄 tab.ts                   # 标签页工具
├── 📄 themeAnimation.ts        # 主题动画
├── 📄 to.ts                    # 安全异步工具
├── 📄 tree.ts                  # 树形数据处理
└── 📄 validators.ts            # 表单验证
```

**工具函数说明:**

| 文件 | 说明 | 主要函数 |
|------|------|----------|
| `boolean.ts` | 布尔值处理 | `isBoolean`、`toBoolean` |
| `cache.ts` | 缓存工具 | `setCache`、`getCache`、`removeCache` |
| `crypto.ts` | 加密解密 | `encrypt`、`decrypt`、`md5` |
| `date.ts` | 日期处理 | `formatDate`、`parseDate`、`dateDiff` |
| `format.ts` | 格式化工具 | `formatMoney`、`formatPhone`、`formatSize` |
| `function.ts` | 函数工具 | `debounce`、`throttle`、`sleep` |
| `modal.ts` | 模态框工具 | `confirm`、`alert`、`prompt` |
| `object.ts` | 对象处理 | `deepClone`、`merge`、`pick` |
| `string.ts` | 字符串处理 | `trim`、`capitalize`、`camelCase` |
| `to.ts` | 安全异步 | `to` - Promise 包装器 |
| `tree.ts` | 树形处理 | `listToTree`、`treeToList`、`findNode` |
| `validators.ts` | 表单验证 | `isPhone`、`isEmail`、`isIdCard` |

**使用示例:**

```typescript
// 防抖函数
import { debounce } from '@/utils/function'

const handleSearch = debounce(() => {
  fetchData()
}, 300)

// 安全异步
import { to } from '@/utils/to'

const [err, data] = await to(fetchUser())
if (err) {
  console.error('获取失败:', err)
} else {
  console.log('用户数据:', data)
}

// 树形转换
import { listToTree } from '@/utils/tree'

const treeData = listToTree(flatList, {
  id: 'id',
  parentId: 'parentId',
  children: 'children'
})
```

### views/ - 页面视图

业务页面组件。

```text
📁 views/
├── 📁 business/                # 业务模块
│   ├── 📁 base/                # 基础业务
│   │   └── 📁 demo/            # 演示页面
│   └── 📁 mall/                # 商城模块
│       ├── 📁 goods/           # 商品管理
│       └── 📁 order/           # 订单管理
│
├── 📁 common/                  # 通用页面
│   ├── 📄 401.vue              # 未授权
│   ├── 📄 404.vue              # 页面不存在
│   ├── 📄 home.vue             # 主页
│   ├── 📄 index.vue            # 首页
│   └── 📄 redirect.vue         # 重定向
│
├── 📁 system/                  # 系统管理
│   ├── 📁 auth/                # 认证管理
│   │   ├── 📁 client/          # 客户端管理
│   │   └── 📁 app/             # 应用管理
│   ├── 📁 config/              # 参数配置
│   ├── 📁 core/                # 核心功能
│   │   ├── 📁 dept/            # 部门管理
│   │   ├── 📁 menu/            # 菜单管理
│   │   ├── 📁 post/            # 岗位管理
│   │   ├── 📁 role/            # 角色管理
│   │   └── 📁 user/            # 用户管理
│   ├── 📁 dict/                # 字典管理
│   ├── 📁 monitor/             # 系统监控
│   │   ├── 📁 cache/           # 缓存监控
│   │   ├── 📁 job/             # 任务监控
│   │   ├── 📁 logininfor/      # 登录日志
│   │   ├── 📁 online/          # 在线用户
│   │   ├── 📁 operlog/         # 操作日志
│   │   └── 📁 server/          # 服务监控
│   ├── 📁 notice/              # 通知公告
│   ├── 📁 oss/                 # 对象存储
│   │   ├── 📁 config/          # OSS 配置
│   │   └── 📁 file/            # 文件管理
│   └── 📁 tenant/              # 租户管理
│       ├── 📁 tenant/          # 租户信息
│       └── 📁 package/         # 租户套餐
│
├── 📁 tool/                    # 系统工具
│   └── 📁 gen/                 # 代码生成
│
└── 📁 workflow/                # 工作流
    ├── 📁 definition/          # 流程定义
    ├── 📁 instance/            # 流程实例
    └── 📁 task/                # 任务管理
```

**页面组件结构:**

每个功能模块通常包含以下文件：

```text
📁 user/                        # 用户管理模块
├── 📄 index.vue                # 列表页面
├── 📄 UserForm.vue             # 表单组件
├── 📄 UserDetail.vue           # 详情组件
├── 📄 ImportUser.vue           # 导入组件
└── 📄 ResetPwd.vue             # 重置密码组件
```

## vite/ - Vite 插件目录

Vite 构建插件配置。

```text
📁 vite/
└── 📁 plugins/                 # 插件目录
    ├── 📄 auto-imports.ts      # 自动导入配置
    ├── 📄 components.ts        # 组件自动注册
    ├── 📄 compression.ts       # 代码压缩
    ├── 📄 hmrControl.ts        # HMR 控制
    ├── 📄 iconfont-types.ts    # 图标类型生成
    ├── 📄 icons.ts             # 图标插件
    ├── 📄 index.ts             # 插件入口
    ├── 📁 openapi/             # OpenAPI 代码生成
    ├── 📄 setup-extend.ts      # setup 扩展
    └── 📄 unocss.ts            # UnoCSS 配置
```

**插件配置入口:**

```typescript
// vite/plugins/index.ts
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import createAutoImport from './auto-imports'
import createComponents from './components'
import createIcons from './icons'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import createUnoCSS from './unocss'

export default function createPlugins(env: Record<string, string>, isBuild: boolean) {
  const plugins = [
    vue(),
    vueJsx()
  ]

  plugins.push(createAutoImport())
  plugins.push(createComponents())
  plugins.push(createIcons())
  plugins.push(createSetupExtend())
  plugins.push(createUnoCSS())

  if (isBuild) {
    plugins.push(createCompression(env))
  }

  return plugins
}
```

**自动导入配置:**

```typescript
// vite/plugins/auto-imports.ts
import AutoImport from 'unplugin-auto-import/vite'

export default function createAutoImport() {
  return AutoImport({
    imports: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core'
    ],
    dts: 'src/types/auto-imports.d.ts',
    dirs: ['src/composables'],
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json'
    }
  })
}
```

**组件自动注册:**

```typescript
// vite/plugins/components.ts
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default function createComponents() {
  return Components({
    dts: 'src/types/components.d.ts',
    dirs: ['src/components'],
    resolvers: [
      ElementPlusResolver()
    ]
  })
}
```

## env/ - 环境配置目录

环境变量配置文件。

```text
📁 env/
├── 📄 .env                     # 共同配置
├── 📄 .env.development         # 开发环境
└── 📄 .env.production          # 生产环境
```

**共同配置(.env):**

```bash
# 应用ID
VITE_APP_ID = ryplus_uni_workflow

# 应用标题
VITE_APP_TITLE = ryplus-uni后台管理

# 是否开启 API 加密(对称加密)
VITE_APP_API_ENCRYPT = false

# 是否开启 WebSocket
VITE_APP_WEBSOCKET = false

# 是否开启 SSE
VITE_APP_SSE = false

# RSA 公钥(用于加密)
VITE_APP_RSA_PUBLIC_KEY =

# RSA 私钥(用于解密)
VITE_APP_RSA_PRIVATE_KEY =
```

**开发环境(.env.development):**

```bash
# 应用环境
VITE_APP_ENV = development

# 应用端口
VITE_APP_PORT = 80

# API 基础路径
VITE_APP_BASE_API = /dev-api

# 后端服务端口
VITE_APP_BASE_API_PORT = 5503

# 部署路径
VITE_APP_CONTEXT_PATH = /

# 监控中心地址
VITE_APP_MONITOR_ADMIN = http://localhost:9090/admin

# SnailJob 地址
VITE_APP_SNAILJOB_ADMIN = http://localhost:8800/snail-job
```

**生产环境(.env.production):**

```bash
# 应用环境
VITE_APP_ENV = production

# API 基础路径
VITE_APP_BASE_API = /ryplus_uni_workflow

# 部署路径
VITE_APP_CONTEXT_PATH = /

# 是否开启压缩
VITE_BUILD_COMPRESS = gzip
```

## 文件命名规范

### 目录命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 功能目录 | 小写 camelCase | `composables`、`utils` |
| 模块目录 | 小写连字符 | `system`、`business` |
| 组件目录 | PascalCase + A 前缀 | `AForm`、`ATable` |

### 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| Vue 组件 | PascalCase | `UserForm.vue`、`ATable.vue` |
| TypeScript | camelCase | `useHttp.ts`、`validators.ts` |
| 类型定义 | camelCase + `.d.ts` | `global.d.ts`、`env.d.ts` |
| 样式文件 | 小写连字符 | `main.scss`、`element-plus.scss` |
| API 文件 | camelCase + Api/Types | `userApi.ts`、`userTypes.ts` |

### 组件命名

```typescript
// 组件内部命名
defineOptions({
  name: 'AFormInput',  // PascalCase，与文件名一致
})

// 使用时
<AFormInput />
// 或
<a-form-input />
```

## 目录组织最佳实践

### 1. 按功能模块组织

```text
✅ 推荐
📁 views/system/user/
├── 📄 index.vue           # 用户列表
├── 📄 UserForm.vue        # 用户表单
└── 📄 UserDetail.vue      # 用户详情

❌ 避免
📁 views/
├── 📄 UserList.vue
├── 📄 UserForm.vue
└── 📄 UserDetail.vue
```

### 2. API 与类型分离

```text
✅ 推荐
📁 api/system/user/
├── 📄 userApi.ts          # 接口函数
└── 📄 userTypes.ts        # 类型定义

❌ 避免
📁 api/
└── 📄 user.ts             # 接口和类型混在一起
```

### 3. 组件按职责划分

```text
✅ 推荐
📁 components/
├── 📁 AForm/              # 表单组件
├── 📁 ATable/             # 表格组件
└── 📁 AModal/             # 模态框组件

❌ 避免
📁 components/
├── 📄 FormInput.vue
├── 📄 TableList.vue
└── 📄 ModalDialog.vue
```

### 4. Composables 单一职责

```typescript
// ✅ 推荐: 单一职责
// useAuth.ts - 只处理权限
export function useAuth() {
  const hasPermi = (permi: string) => { /* ... */ }
  const hasRole = (role: string) => { /* ... */ }
  return { hasPermi, hasRole }
}

// useToken.ts - 只处理 Token
export function useToken() {
  const getToken = () => { /* ... */ }
  const setToken = (token: string) => { /* ... */ }
  return { getToken, setToken }
}

// ❌ 避免: 职责混杂
export function useUser() {
  // 权限、Token、用户信息都在一起
}
```

### 5. 样式文件组织

```text
✅ 推荐
📁 assets/styles/
├── 📄 main.scss           # 入口，导入其他文件
├── 📄 variables.scss      # 变量定义
├── 📄 mixins.scss         # 混入函数
├── 📄 element-plus.scss   # 组件库覆盖
└── 📄 transition.scss     # 过渡动画

❌ 避免
📁 assets/styles/
└── 📄 all.scss            # 所有样式都在一个文件
```

## 常见问题

### 1. 路径别名不生效

**问题原因:**
- TypeScript 配置和 Vite 配置不一致
- IDE 未重新加载配置

**解决方案:**

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

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.join(process.cwd(), './src')
  }
}
```

### 2. 自动导入类型报错

**问题原因:**
- 类型声明文件未生成
- IDE 未识别新生成的类型

**解决方案:**

```bash
# 重新启动开发服务器
pnpm dev

# 检查类型文件是否生成
ls src/types/auto-imports.d.ts
ls src/types/components.d.ts
```

### 3. 组件未自动注册

**问题原因:**
- 组件目录未配置
- 组件命名不符合规范

**解决方案:**

```typescript
// vite/plugins/components.ts
Components({
  dirs: ['src/components'],  // 确保目录正确
  deep: true,                // 递归子目录
  dts: 'src/types/components.d.ts'
})
```

### 4. 环境变量读取失败

**问题原因:**
- 变量名不以 `VITE_` 开头
- 环境文件位置错误

**解决方案:**

```bash
# 环境变量必须以 VITE_ 开头
VITE_APP_TITLE = 我的应用

# 在代码中使用
const title = import.meta.env.VITE_APP_TITLE
```

### 5. 打包后资源路径错误

**问题原因:**
- base 配置与部署路径不一致
- 静态资源引用方式错误

**解决方案:**

```typescript
// vite.config.ts
base: env.VITE_APP_CONTEXT_PATH  // 确保与部署路径一致

// 引用静态资源使用别名
import logo from '@/assets/logo/logo.png'
```

### 6. 热更新(HMR)失效

**问题原因:**
- 组件未定义 name
- 文件修改未触发更新

**解决方案:**

```vue
<script lang="ts" setup>
// 确保定义组件名称
defineOptions({
  name: 'MyComponent'
})
</script>
```

### 7. 类型定义冲突

**问题原因:**
- 多个 `.d.ts` 文件定义相同类型
- 全局类型与模块类型冲突

**解决方案:**

```typescript
// 使用模块声明
declare module '@/types' {
  interface UserVO {
    // 扩展类型
  }
}

// 或使用命名空间
declare namespace API {
  interface UserVO {
    // 类型定义
  }
}
```

### 8. Pinia 状态持久化问题

**问题原因:**
- 刷新页面状态丢失
- 存储容量超限

**解决方案:**

```typescript
// 使用 pinia-plugin-persistedstate
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Store 配置持久化
defineStore('user', {
  state: () => ({ /* ... */ }),
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token']  // 只持久化 token
  }
})
```

## 总结

RuoYi-Plus-UniApp 前端项目采用清晰的目录结构和模块化设计：

**核心目录:**

| 目录 | 职责 | 文件数量 |
|------|------|----------|
| `api/` | API 接口定义 | 50+ 个模块 |
| `components/` | 全局组件库 | 24 个组件 |
| `composables/` | 组合式函数 | 17 个函数 |
| `stores/` | 状态管理 | 6 个模块 |
| `utils/` | 工具函数 | 19 个文件 |
| `views/` | 页面视图 | 100+ 个页面 |

**关键配置:**

| 文件 | 说明 |
|------|------|
| `vite.config.ts` | 构建工具配置 |
| `tsconfig.json` | TypeScript 配置 |
| `uno.config.ts` | 原子化 CSS |
| `eslint.config.ts` | 代码检查 |
| `env/*.env` | 环境变量 |

**命名规范:**

- 组件: PascalCase + A 前缀
- 文件: camelCase
- 目录: 小写或 camelCase
- API: xxxApi.ts / xxxTypes.ts
