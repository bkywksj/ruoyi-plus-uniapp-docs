# 项目结构

## 总览

Ruoyi-Plus-Uniapp 移动端项目采用标准的 uni-app 项目结构，基于 Vue 3 + TypeScript + Vite 构建，以下是详细的目录结构说明。

## 根目录结构

```text
📁 plus-uniapp                       // 项目根目录
├── 📁 dist/                         // 构建输出目录
│   ├── 📁 dev/                      // 开发环境构建产物
│   │   ├── mp-weixin/               // 微信小程序开发版
│   │   ├── h5/                      // H5开发版
│   │   └── app/                     // App开发版
│   └── 📁 build/                    // 生产环境构建产物
│       ├── mp-weixin/               // 微信小程序生产版
│       ├── h5/                      // H5生产版
│       └── app/                     // App生产版
├── 📁 env/                          // 环境配置
│   ├── .env                         // 基础环境配置
│   ├── .env.development             // 开发环境配置
│   └── .env.production              // 生产环境配置
├── 📁 node_modules/                 // 依赖包目录
├── 📁 src/                          // 源码目录（详见下方）
├── 📁 vite/                         // Vite 插件目录
├── 📄 .editorconfig                 // 编辑器配置
├── 📄 .eslintrc-auto-import.json    // ESLint 自动导入配置
├── 📄 .gitignore                    // Git 忽略文件配置
├── 📄 .npmrc                        // npm 配置文件
├── 📄 .prettierignore               // Prettier 忽略文件配置
├── 📄 .prettierrc.cjs               // Prettier 格式化配置
├── 📄 eslint.config.mjs             // ESLint 新版配置
├── 📄 favicon.ico                   // 网站图标
├── 📄 index.html                    // HTML 入口文件
├── 📄 LICENSE                       // 开源协议
├── 📄 manifest.config.ts            // 应用清单配置
├── 📄 package.json                  // 项目依赖和脚本配置
├── 📄 pages.config.ts               // 页面路由配置
├── 📄 pnpm-lock.yaml                // pnpm 依赖锁定文件
├── 📄 README.md                     // 项目说明文档
├── 📄 tsconfig.json                 // TypeScript 配置
├── 📄 uno.config.ts                 // UnoCSS 原子化 CSS 配置
└── 📄 vite.config.ts                // Vite 构建工具配置
```

## src 源码目录

```text
📁 src/                              // 源码根目录
├── 📁 api/                          // API 接口管理
│   ├── 📁 app/                      // 应用相关接口
│   ├── 📁 common/                   // 通用接口
│   └── 📁 system/                   // 系统相关接口
│
├── 📁 components/                   // 全局组件
│   ├── 📁 auth/                     // 认证相关组件
│   │   └── AuthModal.vue            // 认证模态框组件
│   ├── 📁 index/                    // 首页相关组件
│   └── 📁 tabbar/                   // 底部导航栏组件
│       ├── Home.vue                 // 首页标签
│       ├── Menu.vue                 // 菜单标签
│       └── My.vue                   // 我的标签
│
├── 📁 composables/                  // 组合式函数（Composables）
│   ├── useAuth.ts                   // 权限相关组合函数
│   ├── useDict.ts                   // 字典相关组合函数
│   ├── useHttp.ts                   // HTTP 请求组合函数
│   ├── usePayment.ts                // 支付相关组合函数
│   ├── useScroll.ts                 // 滚动相关组合函数
│   ├── useTheme.ts                  // 主题相关组合函数
│   └── useToken.ts                  // Token 管理组合函数
│
├── 📁 layouts/                      // 布局组件
│   └── default.vue                  // 默认布局
│
├── 📁 locales/                      // 国际化语言包
│   ├── en_US.ts                     // 英文语言包
│   ├── zh_CN.ts                     // 中文语言包
│   └── i18n.ts                      // 国际化配置
│
├── 📁 pages/                        // 页面文件
│   ├── 📁 auth/                     // 认证相关页面
│   │   ├── auth.vue                 // 认证授权页面
│   │   ├── login.vue                // 登录页面
│   │   ├── phoneLogin.vue           // 手机号登录页面
│   │   ├── register.vue             // 注册页面
│   │   └── smsVerify.vue            // 短信验证页面
│   └── 📁 index/                    // 底部导航相关页面
│       └── index.vue                // 底部导航入口页
│
├── 📁 pages-sub/                    // 分包页面目录（子包）
│   ├── 📁 admin/                    // 管理功能分包
│   └── 📁 demo/                     // 示例代码分包
│
├── 📁 static/                       // 静态资源
│   ├── 📁 app/                      // 应用相关静态资源
│   ├── 📁 images/                   // 图片资源
│   └── 📁 style/                    // 样式文件
│
├── 📁 stores/                       // Pinia 状态管理
│   ├── 📁 modules/                  // 状态模块
│   │   ├── dict.ts                  // 字典状态管理
│   │   ├── tabbar.ts                // 底部导航状态管理
│   │   └── user.ts                  // 用户状态管理
│   └── index.ts                     // 状态管理入口
│
├── 📁 types/                        // TypeScript 类型定义
│   ├── api.d.ts                     // API 相关类型
│   ├── global.d.ts                  // 全局类型
│   └── uni.d.ts                     // uni-app 扩展类型
│
├── 📁 uni_modules/                  // UniApp 模块
│   └── [第三方插件]                  // 第三方 uni-app 插件
│
├── 📁 utils/                        // 工具函数
│   ├── boolean.ts                   // 布尔值相关工具
│   ├── cache.ts                     // 缓存相关工具
│   ├── crypto.ts                    // 加密相关工具
│   ├── date.ts                      // 日期相关工具
│   ├── format.ts                    // 格式化相关工具
│   ├── function.ts                  // 函数相关工具
│   ├── platform.ts                  // 平台判断工具
│   ├── route.ts                     // 路由相关工具
│   ├── rsa.ts                       // RSA 加密工具
│   ├── string.ts                    // 字符串相关工具
│   ├── tenant.ts                    // 租户相关工具
│   ├── to.ts                        // 安全异步执行工具
│   └── validators.ts                // 表单验证工具
│
├── 📁 wd/                           // WotUI 重构组件库
│   ├── 📁 components/               // 组件源码
│   ├── 📁 mixins/                   // 混入
│   └── 📁 utils/                    // 组件工具函数
│
├── 📄 App.vue                       // 应用入口组件
├── 📄 main.ts                       // 应用入口文件
├── 📄 manifest.json                 // 应用配置清单
├── 📄 pages.json                    // 页面路由配置
├── 📄 systemConfig.ts               // 系统配置
└── 📄 uni.scss                      // 全局样式变量
```

## 目录功能说明

### 核心配置文件

#### systemConfig.ts
系统核心配置文件，管理移动端应用的所有配置信息：

```typescript
// 配置结构
export const SystemConfig = {
  app: {                           // 应用基础信息
    id: string,                    // 应用唯一标识
    title: string,                 // 应用名称
    env: 'development' | 'production',  // 运行环境
    publicPath: string             // 部署基础路径
  },
  api: {                           // 服务端配置
    baseUrl: string                // API 基础地址
  },
  security: {                      // 安全配置
    apiEncrypt: boolean,           // 接口加密开关
    rsaPublicKey: string,          // RSA公钥
    rsaPrivateKey: string          // RSA私钥
  },
  platforms: {                     // 第三方平台配置
    wechatMiniAppId: string,       // 微信小程序 appid
    wechatOfficialAppId: string,   // 微信公众号 appid
    alipayMiniAppId: string,       // 支付宝小程序 appid
    toutiaoMiniAppId: string,      // 抖音小程序 appid
    baiduMiniAppId: string,        // 百度小程序 appid
    qqMiniAppId: string,           // QQ小程序 appid
    mapKey: string,                // 地图服务密钥
    serviceUrl: string,            // 在线客服链接
    shareDomain: string,           // 分享页面域名
    analyticsId: string            // 数据统计服务 ID
  }
}
```

#### manifest.json & manifest.config.ts
应用配置清单，配置各平台特定参数（appid、权限、样式等）。

#### pages.json & pages.config.ts
页面路由配置，定义页面路径、样式、导航栏、分包等。

#### vite.config.ts
Vite 构建工具配置，包含插件、别名、构建选项等。

#### uno.config.ts
UnoCSS 原子化 CSS 配置，定义快捷方式、规则和预设。

### 源码目录详解

#### 📁 api/
API 接口管理目录，集中管理所有 HTTP 请求接口：

- **app/**: 应用相关接口（如配置、通知等）
- **common/**: 通用接口（如文件上传、验证码等）
- **system/**: 系统管理接口（如用户、角色、权限等）

**特点**：
- 使用 TypeScript 定义接口类型
- 统一使用 useHttp 进行请求
- 支持请求/响应加密解密

#### 📁 components/
全局组件目录，存放可复用的业务组件：

- **auth/**: 认证相关组件（如授权模态框）
- **tabbar/**: 自定义底部导航栏组件
- **index/**: 首页相关组件

**使用方式**：
```vue
<!-- 自动导入，无需手动引入 -->
<template>
  <AuthModal />
</template>
```

#### 📁 composables/
组合式函数目录，封装可复用的业务逻辑：

**核心 Composables**：
- `useAuth`: 权限管理（权限判断、角色判断）
- `useDict`: 字典管理（获取字典数据、格式化字典值）
- `useHttp`: HTTP 请求（封装 uni.request，支持拦截器）
- `usePayment`: 支付功能（支付流程封装）
- `useScroll`: 滚动管理（滚动监听、滚动到指定位置）
- `useTheme`: 主题管理（主题切换、获取当前主题）
- `useToken`: Token 管理（存储、获取、刷新 token）

**使用示例**：
```typescript
import { useAuth } from '@/composables/useAuth'

const { hasPermi, hasRole } = useAuth()

// 权限判断
if (hasPermi('system:user:add')) {
  // 执行操作
}
```

#### 📁 layouts/
布局组件目录，定义页面布局结构：

- **default.vue**: 默认布局（包含导航栏、内容区等）

#### 📁 locales/
国际化语言包目录：

- **zh_CN.ts**: 中文语言包
- **en_US.ts**: 英文语言包
- **i18n.ts**: 国际化配置

#### 📁 pages/
主包页面目录，存放主包页面文件：

- **auth/**: 认证相关页面（登录、注册、授权等）
- **index/**: 底部导航相关页面

#### 📁 pages-sub/
分包页面目录，用于优化小程序包体积：

- **admin/**: 管理功能分包（管理员专用功能）
- **demo/**: 示例代码分包（组件示例、开发参考）

**分包优势**：
- 减小主包体积，加快首屏加载
- 按需加载，提升用户体验
- 管理功能独立，便于维护

#### 📁 static/
静态资源目录，存放图片、字体等静态文件：

- **app/**: 应用图标、启动图等
- **images/**: 业务图片资源
- **style/**: 全局样式文件

#### 📁 stores/
Pinia 状态管理目录：

**状态模块**：
- **dict.ts**: 字典数据状态（缓存字典数据，减少请求）
- **tabbar.ts**: 底部导航状态（当前选中的tab）
- **user.ts**: 用户信息状态（用户信息、token、权限等）

**使用示例**：
```typescript
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
console.log(userStore.userInfo)
```

#### 📁 types/
TypeScript 类型定义目录：

- **api.d.ts**: API 接口类型定义
- **global.d.ts**: 全局类型定义
- **uni.d.ts**: uni-app 扩展类型定义

#### 📁 utils/
工具函数目录，复用前端的工具函数：

**核心工具**：
- **boolean.ts**: 布尔值转换和判断
- **cache.ts**: 本地存储封装（localStorage、sessionStorage）
- **crypto.ts**: 加密解密工具（AES、MD5等）
- **date.ts**: 日期格式化和计算
- **format.ts**: 数据格式化（金额、手机号等）
- **function.ts**: 函数工具（防抖、节流等）
- **platform.ts**: 平台判断（H5、小程序、App等）
- **route.ts**: 路由跳转封装
- **rsa.ts**: RSA 加密解密
- **string.ts**: 字符串处理
- **tenant.ts**: 租户相关工具
- **to.ts**: 安全异步执行
- **validators.ts**: 表单验证规则

#### 📁 wd/
WotUI 组件库目录，经过 Vue 3 + TypeScript 重构的移动端组件库：

- **components/**: 组件源码
- **mixins/**: 组件混入
- **utils/**: 组件工具函数

**特点**：
- 完整的 TypeScript 类型支持
- 统一使用 rpx 单位
- 400+ 图标库
- 丰富的组件示例

### 环境配置

#### env/.env
基础环境配置，所有环境共用的配置。

#### env/.env.development
开发环境配置，包含：
- 开发服务器地址
- 各平台 appid（测试账号）
- 开发调试相关配置

#### env/.env.production
生产环境配置，包含：
- 生产服务器地址
- 各平台 appid（正式账号）
- 生产环境安全配置

### 构建相关

#### dist/
构建输出目录：

- **dist/dev/**: 开发环境构建产物
  - **mp-weixin/**: 微信小程序开发版（导入微信开发者工具）
  - **h5/**: H5开发版（浏览器访问）
  - **app/**: App开发版（配合 HBuilderX 使用）

- **dist/build/**: 生产环境构建产物
  - **mp-weixin/**: 微信小程序生产版（上传发布）
  - **h5/**: H5生产版（部署到服务器）
  - **app/**: App生产版（打包发布）

## 文件命名规范

### 组件文件
- **页面组件**: 使用 PascalCase，如 `LoginPage.vue`
- **业务组件**: 使用 PascalCase，如 `UserCard.vue`
- **基础组件**: 使用 PascalCase，加前缀 `Base`，如 `BaseButton.vue`

### TypeScript 文件
- **Composables**: 使用 camelCase，加前缀 `use`，如 `useAuth.ts`
- **工具函数**: 使用 camelCase，如 `format.ts`
- **类型定义**: 使用 camelCase，加后缀 `.d.ts`，如 `api.d.ts`

### 目录命名
- 使用 kebab-case（短横线分隔），如 `pages-sub/`
- 或使用 camelCase，如 `composables/`

## 配置文件详解

### vite.config.ts

Vite 构建配置文件，定义项目构建行为：

```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import Components from '@uni-helper/vite-plugin-uni-components'
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    // UniApp 插件
    uni(),

    // 组件自动导入
    Components({
      // 自定义组件解析规则
      resolvers: [
        // WD UI 组件自动导入
        (name) => {
          if (name.startsWith('Wd')) {
            return {
              name,
              from: '@/wd/components',
            }
          }
        }
      ]
    }),

    // API 自动导入
    AutoImport({
      imports: ['vue', 'uni-app', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),

    // UnoCSS 原子化样式
    UnoCSS(),
  ],

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // 开发服务器配置
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
})
```

**核心插件说明：**

| 插件 | 功能 | 说明 |
|------|------|------|
| `@dcloudio/vite-plugin-uni` | UniApp 核心插件 | 支持多平台编译 |
| `@uni-helper/vite-plugin-uni-components` | 组件自动导入 | 无需手动 import 组件 |
| `unplugin-auto-import` | API 自动导入 | 自动导入 Vue、Pinia API |
| `unocss/vite` | 原子化 CSS | 按需生成 CSS |

### uno.config.ts

UnoCSS 原子化 CSS 配置：

```typescript
import { defineConfig, presetIcons, presetUno } from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'
import presetUni from '@uni-helper/unocss-preset-uni'

export default defineConfig({
  presets: [
    // 基础预设
    presetUno(),
    // UniApp 预设（rpx 单位支持）
    presetUni(),
    // rem 转 px
    presetRemToPx(),
    // 图标预设
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],

  // 快捷方式
  shortcuts: {
    // Flex 布局
    'flex-center': 'flex justify-center items-center',
    'flex-between': 'flex justify-between items-center',
    'flex-around': 'flex justify-around items-center',
    'flex-col': 'flex flex-col',
    'flex-col-center': 'flex flex-col justify-center items-center',

    // 常用样式
    'wh-full': 'w-full h-full',
    'text-ellipsis': 'overflow-hidden text-ellipsis whitespace-nowrap',
  },

  // 主题变量
  theme: {
    colors: {
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f',
    },
  },

  // 规则
  rules: [
    // 自定义规则示例
    [/^m-(\d+)$/, ([, d]) => ({ margin: `${d}rpx` })],
    [/^p-(\d+)$/, ([, d]) => ({ padding: `${d}rpx` })],
  ],
})
```

**快捷方式使用示例：**

```vue
<template>
  <!-- 使用快捷方式 -->
  <view class="flex-center wh-full">
    <text class="text-ellipsis">内容文字</text>
  </view>

  <!-- 使用原子类 -->
  <view class="m-20 p-30 bg-primary text-white rounded-10">
    自定义样式
  </view>
</template>
```

### tsconfig.json

TypeScript 配置文件：

```json
{
  "extends": "@vue/tsconfig/tsconfig.json",
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "node",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "lib": ["esnext", "dom"],
    "types": [
      "@dcloudio/types",
      "@uni-helper/uni-types"
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

**配置要点：**

- `types` 引入 UniApp 类型定义，提供完整的类型支持
- `paths` 配置路径别名，`@` 指向 `src` 目录
- `strict` 开启严格模式，提高代码质量

### eslint.config.mjs

ESLint 代码检查配置（Flat Config 格式）：

```javascript
import antfu from '@antfu/eslint-config'
import uniHelper from '@uni-helper/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    formatters: true,
  },
  ...uniHelper(),
  {
    rules: {
      // Vue 相关规则
      'vue/block-order': ['error', {
        order: ['template', 'script', 'style'],
      }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],

      // TypeScript 相关规则
      'ts/no-unused-vars': 'warn',
      'ts/explicit-function-return-type': 'off',

      // 通用规则
      'no-console': 'warn',
      'no-debugger': 'error',
    },
  }
)
```

## 开发规范

### 目录规范

#### 页面目录规范

```text
pages/
├── auth/                    # 认证模块
│   ├── login.vue           # 登录页
│   ├── register.vue        # 注册页
│   └── index.ts            # 模块导出（可选）
├── user/                    # 用户模块
│   ├── profile.vue         # 个人信息页
│   ├── settings.vue        # 设置页
│   └── components/         # 页面级组件
│       └── UserCard.vue
└── index/                   # 首页模块
    └── index.vue           # 首页
```

#### 组件目录规范

```text
components/
├── business/               # 业务组件
│   ├── UserAvatar.vue     # 用户头像组件
│   └── OrderCard.vue      # 订单卡片组件
├── common/                 # 通用组件
│   ├── BaseButton.vue     # 基础按钮
│   └── BaseInput.vue      # 基础输入框
└── layout/                 # 布局组件
    ├── PageHeader.vue     # 页面头部
    └── PageFooter.vue     # 页面底部
```

### 代码风格规范

#### Vue 组件规范

```vue
<!-- 模板写在最前面 -->
<template>
  <view class="container">
    <!-- 组件内容 -->
  </view>
</template>

<!-- 脚本写在中间 -->
<script lang="ts" setup>
// 导入语句
import { ref, computed, onMounted } from 'vue'
import type { UserInfo } from '@/types'

// 定义组件选项
defineOptions({
  name: 'ComponentName',
})

// 定义 Props
interface Props {
  title?: string
  data?: UserInfo
}

const props = withDefaults(defineProps<Props>(), {
  title: '默认标题',
})

// 定义 Emits
const emit = defineEmits<{
  change: [value: string]
  submit: []
}>()

// 响应式数据
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
const handleClick = () => {
  emit('change', 'value')
}

// 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<!-- 样式写在最后 -->
```

#### TypeScript 类型规范

```typescript
// 接口命名使用 PascalCase
interface UserInfo {
  id: number
  name: string
  avatar: string
  roles: string[]
}

// 类型别名
type UserId = number | string

// 枚举类型
enum UserStatus {
  Active = 1,
  Inactive = 0,
}

// Props 接口
interface WdButtonProps {
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'error'
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
}
```

### API 接口规范

```typescript
// api/system/user.ts
import { useHttp } from '@/composables/useHttp'
import type { UserInfo, LoginParams, LoginResult } from '@/types'

const http = useHttp()

/**
 * 用户登录
 * @param params 登录参数
 */
export function login(params: LoginParams): Promise<LoginResult> {
  return http.post('/auth/login', params)
}

/**
 * 获取用户信息
 */
export function getUserInfo(): Promise<UserInfo> {
  return http.get('/system/user/info')
}

/**
 * 修改用户信息
 * @param data 用户信息
 */
export function updateUserInfo(data: Partial<UserInfo>): Promise<void> {
  return http.put('/system/user/profile', data)
}

/**
 * 用户登出
 */
export function logout(): Promise<void> {
  return http.post('/auth/logout')
}
```

### 状态管理规范

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { getUserInfo, login, logout } from '@/api/system/user'
import { useToken } from '@/composables/useToken'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])

  // 计算属性
  const isLoggedIn = computed(() => !!userInfo.value)
  const userName = computed(() => userInfo.value?.name || '未登录')

  // Token 管理
  const { getToken, setToken, removeToken } = useToken()

  // 方法
  async function loginAction(params: LoginParams) {
    const result = await login(params)
    setToken(result.token)
    await fetchUserInfo()
    return result
  }

  async function fetchUserInfo() {
    const info = await getUserInfo()
    userInfo.value = info
    permissions.value = info.permissions || []
    roles.value = info.roles || []
  }

  async function logoutAction() {
    await logout()
    userInfo.value = null
    permissions.value = []
    roles.value = []
    removeToken()
  }

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  return {
    // 状态
    userInfo,
    permissions,
    roles,
    // 计算属性
    isLoggedIn,
    userName,
    // 方法
    loginAction,
    fetchUserInfo,
    logoutAction,
    hasPermission,
    hasRole,
  }
})
```

## 分包配置

### 分包策略

小程序主包大小限制为 2MB，合理的分包策略可以优化加载性能：

```typescript
// pages.config.ts
export default {
  pages: [
    // 主包页面（核心功能）
    'pages/index/index',
    'pages/auth/login',
  ],

  subPackages: [
    // 管理功能分包
    {
      root: 'pages-sub/admin',
      pages: [
        'user/list',
        'user/detail',
        'role/list',
        'menu/list',
      ],
    },

    // 示例代码分包
    {
      root: 'pages-sub/demo',
      pages: [
        'components/button',
        'components/icon',
        'components/form',
      ],
    },
  ],

  // 分包预加载配置
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['pages-sub/admin'],
    },
  },
}
```

### 分包目录结构

```text
src/
├── pages/                   # 主包页面
│   ├── index/              # 首页
│   └── auth/               # 认证
└── pages-sub/              # 分包目录
    ├── admin/              # 管理功能分包
    │   ├── user/           # 用户管理
    │   │   ├── list.vue    # 用户列表
    │   │   └── detail.vue  # 用户详情
    │   └── role/           # 角色管理
    │       └── list.vue    # 角色列表
    └── demo/               # 示例分包
        └── components/     # 组件示例
            ├── button.vue  # 按钮示例
            └── icon.vue    # 图标示例
```

### 分包最佳实践

1. **主包只放核心页面**
   - 首页、登录页等启动必需页面
   - Tab 页面
   - 高频访问页面

2. **按功能模块分包**
   - 管理功能分包
   - 用户中心分包
   - 商城功能分包

3. **配置分包预加载**
   - 提前加载即将访问的分包
   - 优化用户体验

4. **监控包大小**
   ```bash
   # 查看构建产物大小
   du -sh dist/build/mp-weixin/*
   ```

## 环境配置详解

### 开发环境配置

```bash
# env/.env.development

# 应用配置
VITE_APP_TITLE=RuoYi-Plus-UniApp(开发版)
VITE_APP_ENV=development

# 接口地址
VITE_API_BASE_URL=http://localhost:8080

# 调试配置
VITE_DEBUG=true
VITE_SHOW_API_LOGS=true

# 平台配置（测试账号）
VITE_WX_APPID=wx测试appid
VITE_ALIPAY_APPID=支付宝测试appid
```

### 生产环境配置

```bash
# env/.env.production

# 应用配置
VITE_APP_TITLE=RuoYi-Plus-UniApp
VITE_APP_ENV=production

# 接口地址
VITE_API_BASE_URL=https://api.example.com

# 调试配置
VITE_DEBUG=false
VITE_SHOW_API_LOGS=false

# 平台配置（正式账号）
VITE_WX_APPID=wx正式appid
VITE_ALIPAY_APPID=支付宝正式appid
```

### 环境变量使用

```typescript
// 在代码中使用环境变量
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const isDebug = import.meta.env.VITE_DEBUG === 'true'
const appTitle = import.meta.env.VITE_APP_TITLE

// TypeScript 类型定义
// src/types/env.d.ts
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ENV: 'development' | 'production'
  readonly VITE_API_BASE_URL: string
  readonly VITE_DEBUG: string
  readonly VITE_WX_APPID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 常见问题

### 1. 路径别名不生效

**问题原因：**
- `tsconfig.json` 中未配置 `paths`
- `vite.config.ts` 中未配置 `alias`

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})

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

### 2. 组件自动导入失败

**问题原因：**
- 组件命名不规范
- 插件配置错误

**解决方案：**

```typescript
// vite.config.ts
import Components from '@uni-helper/vite-plugin-uni-components'

export default defineConfig({
  plugins: [
    Components({
      // 指定组件目录
      dirs: ['src/components', 'src/wd/components'],
      // 组件扩展名
      extensions: ['vue'],
      // 深度搜索
      deep: true,
      // 生成类型声明
      dts: 'src/components.d.ts',
    }),
  ],
})
```

### 3. 样式穿透不生效

**问题原因：**
- 使用了 `scoped` 样式
- 选择器优先级不够

**解决方案：**

```scss
// 使用 :deep() 穿透样式
:deep(.wd-button) {
  background-color: #1890ff;
}

// 或使用 !important
.custom-button {
  background-color: #1890ff !important;
}
```

### 4. TypeScript 类型报错

**问题原因：**
- 缺少类型定义
- 类型不匹配

**解决方案：**

```typescript
// 添加类型定义
// src/types/global.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 使用类型断言
const data = response.data as UserInfo
```

### 5. 分包页面跳转失败

**问题原因：**
- 分包配置错误
- 路径不正确

**解决方案：**

```typescript
// pages.config.ts 确保分包配置正确
export default {
  subPackages: [
    {
      root: 'pages-sub/admin',
      pages: ['user/list'], // 不带 root 前缀
    },
  ],
}

// 跳转时使用完整路径
uni.navigateTo({
  url: '/pages-sub/admin/user/list',
})
