# 移动端项目简介

RuoYi-Plus-UniApp 移动端是一个基于 UniApp + Vue 3 + TypeScript 的企业级跨平台移动应用开发框架。项目深度整合 unibest 最佳实践，自研维护 WD UI 组件库（78个组件），为开发者提供开箱即用的移动端解决方案。

## 项目概述

### 项目定位

RuoYi-Plus-UniApp 移动端定位为**企业级多端统一开发框架**，具有以下核心定位：

- **全栈协同** - 与 RuoYi-Plus 后端、plus-ui 前端形成完整的全栈技术体系
- **多端统一** - 一套代码同时运行在小程序、H5、App 等多个平台
- **开箱即用** - 内置认证授权、字典管理、主题系统等通用业务功能
- **组件丰富** - 自研 WD UI 组件库提供 78 个高质量移动端组件

### 版本信息

| 项目信息 | 版本 |
|---------|------|
| 项目版本 | 2.11.0 |
| 更新时间 | 2025-05-28 |
| 作者 | 抓蛙师 (bkywksj) |
| 许可证 | MIT |
| 官网 | https://ruoyi.plus |

### 环境要求

| 环境 | 最低版本 |
|------|---------|
| Node.js | ≥ 18.0.0 |
| pnpm | ≥ 7.30.0 |

## 技术栈

### 核心技术

| 技术 | 版本 | 说明 |
|------|------|------|
| UniApp | 3.0.0-4060620250520001 | 跨平台应用框架 |
| Vue | 3.4.21 | 渐进式 JavaScript 框架 |
| TypeScript | 5.7.2 | JavaScript 超集 |
| Pinia | 2.0.36 | Vue 状态管理库 |
| Vite | 6.3.5 | 下一代前端构建工具 |

### 样式与UI

| 技术 | 版本 | 说明 |
|------|------|------|
| UnoCSS | 65.4.2 | 原子化 CSS 引擎 |
| Sass | 1.77.8 | CSS 预处理器 |
| WD UI | 自研维护 | 78 个移动端组件 |

### 工具链

| 技术 | 版本 | 说明 |
|------|------|------|
| ESLint | 9.29.0 | 代码检查工具 |
| Iconify | 2.2.323 | 图标解决方案 |
| crypto-js | 4.2.0 | 加密库 |
| jsencrypt | 3.3.2 | RSA 加密库 |

### 开发辅助

| 插件 | 说明 |
|------|------|
| @uni-helper/vite-plugin-uni-pages | 页面路由自动生成 |
| @uni-helper/vite-plugin-uni-layouts | 布局系统支持 |
| @uni-helper/vite-plugin-uni-components | 组件自动导入 |
| @uni-helper/vite-plugin-uni-manifest | manifest 配置管理 |
| unplugin-auto-import | API 自动导入 |

## 平台支持

### 小程序平台

| 平台 | 支持状态 | 说明 |
|------|---------|------|
| 微信小程序 | ✅ 完整支持 | 主要目标平台，功能最完善 |
| 支付宝小程序 | ✅ 完整支持 | 已配置独立 appid |
| QQ 小程序 | ✅ 完整支持 | 已配置独立 appid |
| 百度小程序 | ✅ 完整支持 | 已配置独立 appid |
| 抖音小程序 | ✅ 完整支持 | 字节跳动小程序 |
| 快手小程序 | ✅ 支持 | 已配置基础设置 |
| 飞书小程序 | ✅ 支持 | 已配置基础设置 |
| 京东小程序 | ✅ 支持 | 已配置基础设置 |
| 小红书小程序 | ✅ 支持 | 已配置基础设置 |
| 鸿蒙小程序 | ✅ 支持 | HarmonyOS 小程序 |

### H5 平台

| 特性 | 支持状态 | 说明 |
|------|---------|------|
| History 路由 | ✅ 支持 | 默认使用 history 模式 |
| HTTPS | ✅ 支持 | 可配置 HTTPS 开发服务器 |
| 响应式布局 | ✅ 支持 | 完整的响应式设计方案 |
| 微信公众号 | ✅ 支持 | 支持微信公众号 H5 应用 |

### App 平台

| 平台 | 支持状态 | 最低版本 |
|------|---------|---------|
| Android | ✅ 支持 | minSdkVersion 30 |
| iOS | ✅ 支持 | - |
| HarmonyOS | ✅ 支持 | App-Harmony |

### 快应用平台

| 平台 | 支持状态 |
|------|---------|
| 快应用 WebView | ✅ 支持 |
| 华为快应用 | ✅ 支持 |
| 联盟快应用 | ✅ 支持 |

## 项目架构

### 目录结构

```text
plus-uniapp/
├── src/                          # 源代码目录
│   ├── api/                      # API 接口层
│   │   └── system/              # 系统模块接口
│   │       └── core/            # 核心接口（用户、角色、岗位）
│   ├── components/               # 自定义业务组件
│   ├── composables/              # 组合式函数（15个）
│   │   ├── useAppInit.ts        # 应用初始化
│   │   ├── useAuth.ts           # 认证授权
│   │   ├── useDict.ts           # 字典管理
│   │   ├── useEventBus.ts       # 事件总线
│   │   ├── useHttp.ts           # HTTP 请求
│   │   ├── useI18n.ts           # 国际化
│   │   ├── usePayment.ts        # 支付处理
│   │   ├── useScroll.ts         # 滚动处理
│   │   ├── useShare.ts          # 分享功能
│   │   ├── useSubscribe.ts      # 订阅消息
│   │   ├── useTheme.ts          # 主题管理
│   │   ├── useToken.ts          # 令牌管理
│   │   ├── useWebSocket.ts      # WebSocket 通信
│   │   └── useWxShare.ts        # 微信分享
│   ├── layouts/                  # 布局组件
│   ├── locales/                  # 国际化语言包
│   ├── pages/                    # 主包页面
│   │   ├── auth/                # 认证相关页面
│   │   ├── index/               # 首页
│   │   └── my/                  # 个人中心
│   ├── pages-sub/                # 分包页面
│   │   └── admin/               # 管理员功能分包
│   ├── static/                   # 静态资源
│   ├── stores/                   # Pinia 状态管理
│   │   └── modules/             # 状态模块
│   │       └── dict.ts          # 字典状态
│   ├── types/                    # TypeScript 类型定义
│   │   └── global.d.ts          # 全局类型声明
│   ├── utils/                    # 工具函数（14个）
│   │   ├── boolean.ts           # 布尔值工具
│   │   ├── cache.ts             # 缓存工具
│   │   ├── crypto.ts            # 加密工具
│   │   ├── date.ts              # 日期工具
│   │   ├── function.ts          # 函数工具
│   │   ├── logger.ts            # 日志工具
│   │   ├── platform.ts          # 平台判断
│   │   ├── route.ts             # 路由工具
│   │   ├── rsa.ts               # RSA 加密
│   │   ├── string.ts            # 字符串工具
│   │   ├── tenant.ts            # 租户工具
│   │   ├── to.ts                # 异步处理
│   │   └── validators.ts        # 验证工具
│   ├── wd/                       # WD UI 组件库（78个组件）
│   │   ├── components/          # 组件实现
│   │   └── composables/         # 组件内部组合函数
│   ├── App.vue                   # 应用根组件
│   ├── main.ts                   # 应用入口
│   ├── manifest.json             # 应用配置
│   ├── pages.json                # 页面路由配置
│   ├── systemConfig.ts           # 系统配置
│   └── uni.scss                  # 全局样式变量
├── .env                          # 环境变量
├── .env.development              # 开发环境变量
├── .env.production               # 生产环境变量
├── package.json                  # 项目配置
├── vite.config.ts                # Vite 配置
├── tsconfig.json                 # TypeScript 配置
└── uno.config.ts                 # UnoCSS 配置
```

### 架构设计

```text
┌─────────────────────────────────────────────────────────────┐
│                      应用层 (App Layer)                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Pages  │  │ Layouts │  │Components│  │  Stores │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼────────────┼───────────┼────────────┼──────────────┘
        │            │           │            │
┌───────┴────────────┴───────────┴────────────┴──────────────┐
│                   组合层 (Composition Layer)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ useAuth  │  │ useHttp  │  │ useDict  │  │usePayment│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │useTheme  │  │ useI18n  │  │useScroll │  │useShare  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
        │
┌───────┴─────────────────────────────────────────────────────┐
│                    UI层 (UI Layer)                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              WD UI 组件库 (78个组件)                    │  │
│  │  基础(6) │ 布局(5) │ 导航(10) │ 表单(24) │ 展示(14)    │  │
│  │                    反馈(19)                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
        │
┌───────┴─────────────────────────────────────────────────────┐
│                   工具层 (Utils Layer)                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │boolean │ │ cache  │ │ crypto │ │  date  │ │function│    │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ logger │ │platform│ │ route  │ │  rsa   │ │ string │    │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │
└─────────────────────────────────────────────────────────────┘
        │
┌───────┴─────────────────────────────────────────────────────┐
│                  平台层 (Platform Layer)                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   H5    │  │   App   │  │微信小程序│  │其他小程序│        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 核心特性

### 🔐 认证与授权

项目提供完整的移动端认证授权方案：

**多种登录方式**
- 微信小程序一键登录（手机号授权）
- 微信公众号 OAuth 登录
- 手机号 + 验证码登录
- 账号密码登录
- 第三方社交登录

**账号体系**
- 支持 unionid 关联，实现跨平台账号统一
- 自动注册机制，新用户无感注册
- 多租户账号隔离

**令牌管理**
- JWT Token 认证
- 自动刷新机制
- 安全存储方案

### 🎨 WD UI 组件库

自研维护的高质量移动端组件库，共计 **78 个组件**：

| 分类 | 组件数量 | 主要组件 |
|------|---------|---------|
| 基础组件 | 6 | Button、Icon、Text、Transition、Resize、ConfigProvider |
| 布局组件 | 5 | Row-Col、Grid、Gap、Divider、Sticky |
| 导航组件 | 10 | Navbar、Tabbar、Tabs、Segmented、Sidebar、IndexBar、Pagination、Paging、Backtop、Fab |
| 表单组件 | 24 | Input、Textarea、Checkbox、Radio、Switch、Picker、DatetimePicker、Calendar、Upload、Form 等 |
| 展示组件 | 14 | Cell、Badge、Tag、Card、Collapse、Steps、Table、Img、Swiper、Skeleton 等 |
| 反馈组件 | 19 | Popup、Toast、MessageBox、Loading、ActionSheet、Notify、NoticeBar 等 |

**组件特性**
- 全部使用 Vue 3 + TypeScript 重构
- 统一使用 rpx 单位适配移动端
- 完整的 Props/Events/Slots 类型定义
- 支持暗黑模式和主题定制
- 按需引入，优化包体积

### 📱 图标系统

项目提供丰富的图标解决方案：

**图标类型**
- **Iconify 图标** - 基于 @iconify-json/carbon，提供 1000+ 图标
- **字体图标** - 400+ 自定义图标，包含线条和实心两种风格
- **UnoCSS 图标** - 支持任意 Iconify 图标集

**使用方式**

```vue
<!-- 字体图标 -->
<wd-icon name="home" />
<wd-icon name="home-fill" />

<!-- UnoCSS 图标 -->
<wd-icon name="i-carbon-home" />

<!-- 自定义大小和颜色 -->
<wd-icon name="home" size="48" color="#1890ff" />
```

### 🔧 组合式函数

项目提供 15 个核心组合式函数，覆盖常见业务场景：

**核心函数**

| 函数 | 说明 | 主要功能 |
|------|------|---------|
| `useAuth` | 认证管理 | 登录、登出、权限校验 |
| `useHttp` | HTTP 请求 | 请求封装、拦截器、错误处理 |
| `useToken` | 令牌管理 | Token 存取、刷新、过期处理 |
| `useDict` | 字典管理 | 字典加载、缓存、格式化 |

**业务函数**

| 函数 | 说明 | 主要功能 |
|------|------|---------|
| `usePayment` | 支付处理 | 微信支付、支付宝支付 |
| `useShare` | 分享功能 | 页面分享、自定义分享 |
| `useScroll` | 滚动处理 | 滚动监听、回到顶部 |
| `useWebSocket` | 实时通信 | WebSocket 连接、消息收发 |

**界面函数**

| 函数 | 说明 | 主要功能 |
|------|------|---------|
| `useTheme` | 主题管理 | 主题切换、暗黑模式 |
| `useI18n` | 国际化 | 多语言切换、文案管理 |
| `useAppInit` | 应用初始化 | 启动配置、环境检测 |
| `useEventBus` | 事件总线 | 跨组件通信 |

### 🛠️ 工具函数库

项目提供 14 个工具模块，复用前端工具函数设计：

| 模块 | 说明 | 主要功能 |
|------|------|---------|
| `boolean` | 布尔值工具 | 布尔值转换、判断 |
| `cache` | 缓存工具 | 本地存储封装、过期策略 |
| `crypto` | 加密工具 | AES/MD5/SHA 加密 |
| `date` | 日期工具 | 日期格式化、计算 |
| `function` | 函数工具 | 防抖、节流、组合函数 |
| `logger` | 日志工具 | 调试日志、错误追踪 |
| `platform` | 平台工具 | 平台判断、条件执行 |
| `route` | 路由工具 | 页面跳转、参数处理 |
| `rsa` | RSA 加密 | RSA 加解密 |
| `string` | 字符串工具 | 字符串处理、格式化 |
| `tenant` | 租户工具 | 多租户标识管理 |
| `to` | 异步处理 | Promise 错误处理 |
| `validators` | 验证工具 | 数据校验、正则验证 |

### 🌐 网络与安全

**HTTP 请求封装**

```typescript
// 使用 useHttp 组合函数
const { request, get, post } = useHttp()

// GET 请求
const data = await get('/api/user/info')

// POST 请求
const result = await post('/api/user/update', { name: '张三' })
```

**安全特性**
- API 请求加密解密（可配置开关）
- RSA 公钥加密传输
- 请求签名验证
- 敏感数据脱敏

### 📦 分包策略

项目采用合理的分包策略优化小程序性能：

**主包内容**
- 核心框架代码
- 基础页面（首页、登录、个人中心）
- 常用组件和工具

**分包设计**
- `pages-sub/admin` - 管理员功能分包

**分包优势**
- 减小主包体积，加快首屏加载
- 按需加载，优化用户体验
- 独立更新，降低维护成本

### 🎯 系统配置

项目提供统一的系统配置管理：

```typescript
import { SystemConfig } from '@/systemConfig'

// 应用基础配置
SystemConfig.app.id          // 应用标识
SystemConfig.app.title       // 应用名称
SystemConfig.app.env         // 运行环境

// API 配置
SystemConfig.api.baseUrl     // API 基础地址

// 安全配置
SystemConfig.security.apiEncrypt    // API 加密开关
SystemConfig.security.rsaPublicKey  // RSA 公钥

// 平台配置
SystemConfig.platforms.wechatMiniAppId      // 微信小程序 AppId
SystemConfig.platforms.wechatOfficialAppId  // 微信公众号 AppId
SystemConfig.platforms.alipayMiniAppId      // 支付宝小程序 AppId
```

### 🌍 国际化支持

项目内置国际化解决方案：

**支持语言**
- 中文简体 (zh-CN)
- 英文 (en-US)

**使用方式**

```typescript
import { useI18n } from '@/composables/useI18n'

const { t, locale, setLocale } = useI18n()

// 获取翻译文案
const text = t('common.confirm')

// 切换语言
setLocale('en-US')
```

## 快速体验

### 环境准备

```bash
# 安装 Node.js (>=18)
# 安装 pnpm
npm install -g pnpm
```

### 项目安装

```bash
# 克隆项目
git clone https://gitee.com/dromara/RuoYi-Plus-uniapp.git

# 进入移动端目录
cd RuoYi-Plus-uniapp/plus-uniapp

# 安装依赖
pnpm install
```

### 开发运行

```bash
# H5 开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:mp-weixin

# 支付宝小程序开发
pnpm dev:mp-alipay

# App 开发
pnpm dev:app
```

### 项目构建

```bash
# H5 构建
pnpm build:h5

# 微信小程序构建
pnpm build:mp-weixin

# App 构建
pnpm build:app
```

### 开发工具

| 工具 | 用途 |
|------|------|
| HBuilderX | UniApp 官方 IDE，支持可视化开发 |
| VS Code | 代码编辑器，搭配 Volar 插件 |
| 微信开发者工具 | 微信小程序调试预览 |
| 支付宝小程序开发者工具 | 支付宝小程序调试预览 |

## 开发优势

### 1. 完整的类型支持

- 全部源码使用 TypeScript 编写
- 组件 Props/Events/Slots 完整类型定义
- API 接口类型自动推导
- 智能提示和错误检查

### 2. 丰富的组件生态

- 78 个高质量 UI 组件
- 400+ 图标资源
- 15 个业务组合函数
- 14 个工具函数模块

### 3. 跨平台统一体验

- 一套代码多端运行
- 平台差异自动抹平
- 条件编译精细控制
- 统一的 API 调用方式

### 4. 优秀的开发体验

- 热更新支持
- 组件自动导入
- API 自动导入
- 路由自动生成

### 5. 企业级特性

- 多租户支持
- 权限控制
- 数据加密
- 日志追踪

## 适用场景

- ✅ 企业移动办公应用
- ✅ 电商小程序 / H5 商城
- ✅ 多端统一的业务系统
- ✅ 需要快速开发的小程序项目
- ✅ 需要完整后台支撑的移动应用
- ✅ 多租户 SaaS 移动端

## 生态系统

RuoYi-Plus-UniApp 是 RuoYi-Plus 全栈框架的移动端部分，与以下项目协同工作：

| 项目 | 说明 |
|------|------|
| RuoYi-Plus | Spring Boot 3 后端框架 |
| plus-ui | Vue 3 管理端前端 |
| plus-uniapp | UniApp 移动端（本项目） |

通过统一的 API 接口、类型定义和业务逻辑，三端形成完整的企业级全栈解决方案。
