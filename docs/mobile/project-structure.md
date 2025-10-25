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

## 相关文档

- [快速开始](./getting-started.md) - 项目快速上手指南
- [开发规范](./dev-standards.md) - 代码开发规范
- [配置说明](./configuration.md) - 详细配置说明
