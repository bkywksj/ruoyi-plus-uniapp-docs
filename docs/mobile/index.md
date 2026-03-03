# 移动端项目简介

RuoYi-Plus-UniApp 移动端是一个基于 UniApp + Vue 3 + TypeScript 的企业级跨平台移动应用开发框架。项目深度整合 unibest 最佳实践，自研维护 WD UI 组件库（78个组件），为开发者提供开箱即用的移动端解决方案。

## 项目概述

### 项目定位

RuoYi-Plus-UniApp 移动端定位为**企业级多端统一开发框架**，具有以下核心定位：

- **全栈协同** - 与 RuoYi-Plus 后端、plus-ui 前端形成完整的全栈技术体系
- **多端统一** - 一套代码同时运行在小程序、H5、App 等多个平台
- **开箱即用** - 内置认证授权、字典管理、主题系统等通用业务功能
- **组件丰富** - 自研 WD UI 组件库提供 78 个高质量移动端组件


### 环境要求

| 环境 | 最低版本     |
|------|----------|
| Node.js | ≥ 20.0.0 |
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

| 技术 | 版本      | 说明 |
|------|---------|------|
| UnoCSS | 65.4.2  | 原子化 CSS 引擎 |
| Sass | 1.77.8  | CSS 预处理器 |
| WD UI | 重构后持续维护 | 78 个移动端组件 |

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
│   │   ├── common/              # 通用接口
│   │   │   └── mall/            # 商城模块接口
│   │   │       └── order/       # 订单相关接口
│   │   └── system/              # 系统模块接口
│   │       ├── core/            # 核心接口（用户、角色、岗位）
│   │       └── dict/            # 字典接口
│   ├── components/               # 自定义业务组件
│   ├── composables/              # 组合式函数（14个）
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
│   │       ├── dict.ts          # 字典状态
│   │       ├── feature.ts       # 功能开关状态
│   │       └── user.ts          # 用户状态
│   ├── types/                    # TypeScript 类型定义
│   │   ├── global.d.ts          # 全局类型声明
│   │   └── http.d.ts            # HTTP 相关类型
│   ├── utils/                    # 工具函数（13个）
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

**useAuth 组合函数**

提供完整的权限检查功能：

```typescript
import { useAuth } from '@/composables/useAuth'

const {
  // 状态
  isLoggedIn,      // 当前登录状态
  isSuperAdmin,    // 是否超级管理员
  isTenantAdmin,   // 是否租户管理员
  isAnyAdmin,      // 是否任意管理员

  // 权限检查
  hasPermission,   // 检查单个权限
  hasAllPermissions, // 检查所有权限
  hasTenantPermission, // 租户权限检查

  // 角色检查
  hasRole,         // 检查单个角色
  hasAllRoles,     // 检查所有角色

  // 路由控制
  canAccessRoute,  // 检查路由访问权限
  filterAuthorizedRoutes, // 过滤授权路由
} = useAuth()

// 检查特定权限
const canAddUser = hasPermission('system:user:add')

// 检查多个权限（满足任一）
const canManageUsers = hasPermission(['system:user:add', 'system:user:update'])

// 检查所有权限（满足全部）
const canFullManage = hasAllPermissions(['system:user:add', 'system:user:delete'])

// 检查角色
const isEditor = hasRole('editor')

// 租户权限检查
const canManageTenant = hasTenantPermission('tenant:manage')
```

### 🎨 WD UI 组件库

重构后持续维护的高质量移动端组件库，共计 **78 个组件**：

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

项目提供 14 个核心组合式函数，覆盖常见业务场景：

#### useHttp - HTTP 请求

提供完整的 HTTP 请求封装，支持链式调用配置：

```typescript
import { useHttp, http } from '@/composables/useHttp'

// 使用默认实例
const [err, users] = await http.get<User[]>('/api/users')
if (!err) {
  console.log(users)
}

// POST 请求
const [err, user] = await http.post<User>('/api/users', userData)

// 链式调用配置
const [err, token] = await http
  .noAuth()        // 禁用认证
  .encrypt()       // 启用加密
  .skipWait()      // 跳过初始化等待
  .timeout(20000)  // 设置超时
  .post<LoginResult>('/api/login', data)

// 上传文件
const [err, result] = await http.upload<UploadResult>({
  url: '/api/upload',
  filePath: tempFilePath,
  name: 'file',
  formData: { type: 'avatar' }
})

// 下载文件
const [err, result] = await http.download({
  url: '/api/download/file.pdf',
  filePath: `${uni.env.USER_DATA_PATH}/file.pdf`
})
```

**链式配置方法**

| 方法 | 说明 |
|------|------|
| `noAuth()` | 禁用认证，不携带 Token |
| `encrypt()` | 启用请求加密 |
| `noRepeatSubmit()` | 禁用防重复提交检查 |
| `noTenant()` | 禁用租户信息 |
| `skipWait()` | 跳过应用初始化等待 |
| `noMsgError()` | 禁用错误提示 |
| `timeout(ms)` | 设置超时时间 |

#### useDict - 字典管理

提供字典数据的获取和缓存管理：

```typescript
import { useDict, DictTypes } from '@/composables/useDict'

// 获取多个字典类型
const {
  sys_user_gender,
  sys_enable_status,
  dictLoading
} = useDict(DictTypes.sys_user_gender, DictTypes.sys_enable_status)

// 在模板中使用
// <wd-picker v-model="form.gender" :loading="dictLoading" :columns="sys_user_gender" />
```

**预定义字典类型**

| 类型 | 说明 |
|------|------|
| `sys_audit_status` | 审核状态 |
| `sys_boolean_flag` | 逻辑标志 |
| `sys_display_setting` | 显示设置 |
| `sys_enable_status` | 启用状态 |
| `sys_file_type` | 文件类型 |
| `sys_message_type` | 消息类型 |
| `sys_notice_status` | 通知状态 |
| `sys_notice_type` | 通知类型 |
| `sys_oper_result` | 操作结果 |
| `sys_oper_type` | 业务操作类型 |
| `sys_payment_method` | 支付方式 |
| `sys_platform_type` | 平台类型 |
| `sys_user_gender` | 用户性别 |
| `sys_data_scope` | 数据权限类型 |

#### usePayment - 支付处理

提供多平台支付功能，自动适配不同支付环境：

```typescript
import { usePayment } from '@/composables/usePayment'

const {
  // 状态
  loading,
  availableMethods,

  // 核心方法
  createOrderAndPay,  // 创建订单并支付
  payOrder,           // 支付已有订单

  // 查询方法
  queryOrderStatus,   // 单次查询订单状态
  pollOrderStatus,    // 轮询查询订单状态

  // 工具方法
  getTradeType,       // 获取交易类型
  fetchAvailableMethods, // 获取可用支付方式
  getPlatformInfo,    // 获取平台信息
} = usePayment()

// 创建订单并支付
const [err, result] = await createOrderAndPay({
  orderData: {
    productId: '123',
    quantity: 1,
    totalAmount: 99.00
  },
  paymentMethod: PaymentMethod.WECHAT,
  appId: 'wx123456',
  openId: 'user_openid'
})

if (!err) {
  console.log('支付成功', result)
}

// 获取平台支付信息
const platformInfo = getPlatformInfo()
console.log(platformInfo)
// {
//   platform: 'mp-weixin',
//   supportsWechatPay: true,
//   supportsAlipayPay: false,
//   supportsBalancePay: true,
//   isWechatEnvironment: true,
//   recommendedTradeTypes: { wechat: 'JSAPI', alipay: 'APP' }
// }
```

**支持的支付方式**

| 支付方式 | 平台支持 |
|---------|---------|
| 微信支付 | 微信小程序、微信公众号H5、App |
| 支付宝支付 | 支付宝小程序、支付宝H5、普通H5、App |
| 余额支付 | 所有平台 |

#### useWebSocket - 实时通信

提供 WebSocket 连接管理，支持自动重连和心跳检测：

```typescript
import { useWebSocket, webSocket } from '@/composables/useWebSocket'

// 使用全局 WebSocket 管理器
webSocket.initialize()
webSocket.connect()

// 发送消息
webSocket.send({ type: 'chat', content: 'Hello' })

// 获取连接状态
console.log(webSocket.status)      // 'OPEN' | 'CLOSED' | 'CONNECTING' | 'CLOSING'
console.log(webSocket.isConnected) // true | false

// 自定义 WebSocket 实例
const { connect, disconnect, send, status, isConnected, data } = useWebSocket(
  'wss://example.com/ws',
  {
    maxRetries: 8,
    baseDelay: 3,
    heartbeatInterval: 30000,
    onMessage: (data) => console.log('收到消息:', data),
    onConnected: () => console.log('已连接'),
    onDisconnected: (code, reason) => console.log('已断开:', code, reason),
    onError: (error) => console.error('错误:', error)
  }
)
```

**消息类型枚举**

| 类型 | 说明 |
|------|------|
| `SYSTEM_NOTICE` | 系统通知 |
| `CHAT_MESSAGE` | 聊天消息 |
| `DEV_LOG` | 开发日志 |
| `HEARTBEAT` | 心跳消息 |

#### useTheme - 主题管理

提供主题配置管理，支持全局和局部定制：

```typescript
import { useTheme } from '@/composables/useTheme'

const {
  themeVars,        // 响应式主题配置
  setGlobalTheme,   // 设置全局主题
  resetGlobalTheme, // 重置全局主题
  getCurrentTheme,  // 获取当前主题
} = useTheme()

// 设置全局主题
setGlobalTheme({
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
  colorWarning: '#FFBA00',
  colorDanger: '#F56C6C'
})

// 局部定制
const { themeVars } = useTheme({
  buttonPrimaryBgColor: '#ff4757',
  toastPadding: '8px 16px'
})

// 在模板中使用
// <wd-config-provider :theme-vars="themeVars">
//   <slot />
// </wd-config-provider>
```

#### useI18n - 国际化

提供增强的国际化功能，支持多种翻译模式：

```typescript
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const {
  // 翻译函数
  t,
  translate,
  translateRouteTitle,

  // 语言状态
  currentLanguage,
  currentLanguageName,
  languageOptions,
  isChinese,
  isEnglish,

  // 语言管理
  setLanguage,
} = useI18n()

// 简单用法
const text1 = t('userName', '用户名')
// 英文环境: "userName", 中文环境: "用户名"

// 使用字段信息
const text2 = t('', { field: 'UserName', comment: '用户名' })
// 英文环境: "UserName", 中文环境: "用户名"

// 使用语言特定翻译
const text3 = t('', {
  [LanguageCode.zh_CN]: '用户名',
  [LanguageCode.en_US]: 'UserName'
})

// 传统 i18n 键
const text4 = t('user.userName')

// 切换语言
setLanguage(LanguageCode.en_US)
```

#### useShare - 分享功能

提供多平台分享功能，支持页面级单例模式：

```typescript
import { useShare } from '@/composables/useShare'

const {
  shareConfig,           // 当前分享配置
  pageConfig,            // 页面配置
  setShareData,          // 动态设置分享数据
  triggerShare,          // 主动触发分享
  resetShareConfig,      // 重置分享配置
  canShareToTimeline,    // 检查是否支持朋友圈分享
  handleShareAppMessage, // 处理分享到好友
  handleShareTimeline,   // 处理分享到朋友圈
} = useShare({
  title: '自定义标题',
  imageUrl: '/static/share.png',
  enableTimeline: true
})

// 动态设置分享数据（如根据商品信息）
setShareData({
  title: '精品商品推荐',
  imageUrl: product.coverImage,
  extraParams: { productId: product.id }
})

// 主动触发分享
triggerShare()
```

### 🛠️ 工具函数库

项目提供 13 个工具模块，复用前端工具函数设计：

#### cache - 缓存工具

基于 UniApp 存储 API 的优化缓存封装：

```typescript
import { cache } from '@/utils/cache'

// 设置缓存（支持任意类型）
cache.set('theme', 'dark')                    // 字符串
cache.set('count', 42)                        // 数字
cache.set('isActive', true)                   // 布尔值
cache.set('userInfo', { id: 1, name: 'admin' }) // 对象
cache.set('tags', ['frontend', 'mobile'])     // 数组

// 设置过期时间（秒）
cache.set('token', 'abc123', 7 * 24 * 3600)   // 7天过期
cache.set('tempData', { temp: true }, 3600)   // 1小时过期

// 获取缓存（自动保持原始类型）
const theme = cache.get<string>('theme')      // "dark" (string)
const count = cache.get<number>('count')      // 42 (number)
const userInfo = cache.get<UserInfo>('userInfo') // { id: 1, name: 'admin' }

// 检查缓存是否存在
if (cache.has('userToken')) {
  // 用户已登录
}

// 移除缓存
cache.remove('userToken')

// 清除所有应用缓存
cache.clearAll()

// 手动清理过期缓存
cache.cleanup()

// 获取缓存统计信息
const stats = cache.getStats()
// { totalKeys: 100, appKeys: 50, currentSize: 1024, limitSize: 10485760, usagePercent: 10 }
```

#### platform - 平台判断

提供跨平台环境检测功能：

```typescript
import PLATFORM from '@/utils/platform'

// 平台判断
PLATFORM.platform      // 当前平台标识
PLATFORM.isH5          // 普通浏览器 H5
PLATFORM.isApp         // App 环境
PLATFORM.isMp          // 小程序环境
PLATFORM.isMpWeixin    // 微信小程序
PLATFORM.isMpAlipay    // 支付宝小程序
PLATFORM.isMpToutiao   // 抖音小程序
PLATFORM.isWechatOfficialH5  // 微信公众号 H5
PLATFORM.isAlipayOfficialH5  // 支付宝 H5

// 环境检测函数
PLATFORM.isWechatEnvironment()  // 是否在微信环境
PLATFORM.isAlipayEnvironment()  // 是否在支付宝环境
PLATFORM.isInDevTools()         // 是否在开发者工具
PLATFORM.hasWeixinJSBridge()    // 是否有微信 JSBridge

// 检查支付授权目录（H5）
const { isValid, currentUrl, suggestion } = PLATFORM.checkPaymentUrl()

// 获取 URL 参数（H5）
const code = PLATFORM.safeGetUrlParams('code')
```

#### 其他工具模块

| 模块 | 说明 | 主要功能 |
|------|------|---------|
| `boolean` | 布尔值工具 | 布尔值转换、判断 |
| `crypto` | 加密工具 | AES/MD5/SHA 加密解密 |
| `date` | 日期工具 | 日期格式化、计算 |
| `function` | 函数工具 | 防抖、节流、组合函数 |
| `logger` | 日志工具 | 调试日志、错误追踪 |
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
const [err, data] = await get('/api/user/info')

// POST 请求
const [err, result] = await post('/api/user/update', { name: '张三' })
```

**安全特性**
- API 请求加密解密（可配置开关）
- RSA 公钥加密传输
- 请求签名验证
- 敏感数据脱敏
- 自动添加请求 ID
- 防重复提交保护

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
import { SystemConfig, LanguageCode } from '@/systemConfig'

// 应用基础配置
SystemConfig.app.id          // 应用标识
SystemConfig.app.title       // 应用名称
SystemConfig.app.env         // 运行环境 ('development' | 'production')
SystemConfig.app.publicPath  // 部署路径

// API 配置
SystemConfig.api.baseUrl     // API 基础地址

// 安全配置
SystemConfig.security.apiEncrypt    // API 加密开关
SystemConfig.security.rsaPublicKey  // RSA 公钥
SystemConfig.security.rsaPrivateKey // RSA 私钥

// 平台配置
SystemConfig.platforms.wechatMiniAppId      // 微信小程序 AppId
SystemConfig.platforms.wechatOfficialAppId  // 微信公众号 AppId
SystemConfig.platforms.alipayMiniAppId      // 支付宝小程序 AppId
SystemConfig.platforms.toutiaoMiniAppId     // 抖音小程序 AppId
SystemConfig.platforms.baiduMiniAppId       // 百度小程序 AppId
SystemConfig.platforms.qqMiniAppId          // QQ小程序 AppId
SystemConfig.platforms.mapKey               // 地图服务密钥
SystemConfig.platforms.serviceUrl           // 在线客服链接
SystemConfig.platforms.shareDomain          // 分享页面域名
SystemConfig.platforms.analyticsId          // 数据统计服务 ID

// 语言枚举
LanguageCode.zh_CN  // 'zh-CN'
LanguageCode.en_US  // 'en-US'
```

### 🌍 国际化支持

项目内置国际化解决方案：

**支持语言**
- 中文简体 (zh-CN)
- 英文 (en-US)

**使用方式**

```typescript
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { t, currentLanguage, setLanguage, isChinese, isEnglish } = useI18n()

// 获取翻译文案
const text = t('common.confirm')

// 切换语言
setLanguage(LanguageCode.en_US)

// 检查当前语言
if (isChinese.value) {
  // 中文环境处理
}
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
- 14 个业务组合函数
- 13 个工具函数模块

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
- WebSocket 实时通信
- 多平台支付

## 适用场景

- ✅ 企业移动办公应用
- ✅ 电商小程序 / H5 商城
- ✅ 多端统一的业务系统
- ✅ 需要快速开发的小程序项目
- ✅ 需要完整后台支撑的移动应用
- ✅ 多租户 SaaS 移动端

## 最佳实践

### 1. 组合函数使用规范

```typescript
// 推荐：在 setup 顶层调用
const { hasPermission, isLoggedIn } = useAuth()
const { get, post } = useHttp()

// 避免：在条件语句中调用
if (someCondition) {
  const { hasPermission } = useAuth() // ❌ 不推荐
}
```

### 2. 错误处理规范

```typescript
// 使用 [err, data] 元组模式
const [err, users] = await http.get<User[]>('/api/users')
if (err) {
  console.error('获取用户列表失败:', err.message)
  return
}
// 使用 users 数据
```

### 3. 缓存使用规范

```typescript
// 设置合理的过期时间
cache.set('userToken', token, 7 * 24 * 3600)  // 7天
cache.set('tempData', data, 5 * 60)           // 5分钟

// 使用泛型获取正确类型
const userInfo = cache.get<UserInfo>('userInfo')
```

### 4. 平台适配规范

```typescript
// 使用条件编译处理平台差异
// #ifdef MP-WEIXIN
// 微信小程序特有逻辑
// #endif

// #ifdef H5
// H5 特有逻辑
// #endif

// 使用 PLATFORM 工具判断
if (PLATFORM.isMpWeixin) {
  // 微信小程序逻辑
}
```

## 常见问题

### 1. 如何配置多租户？

在 `systemConfig.ts` 中配置租户相关参数，使用 `useAuth` 的 `hasTenantPermission` 方法进行租户权限检查。

### 2. 如何自定义主题？

使用 `useTheme` 组合函数设置全局主题，或在 `wd-config-provider` 组件上传入 `themeVars` 属性。

### 3. 如何处理支付回调？

使用 `usePayment` 的 `pollOrderStatus` 方法轮询订单状态，或在后端配置支付回调通知。

### 4. 如何实现国际化？

使用 `useI18n` 组合函数，在 `locales` 目录下配置语言包，通过 `t` 函数进行翻译。

### 5. 如何优化小程序包体积？

- 使用分包策略拆分功能模块
- 按需引入组件和工具
- 压缩图片资源
- 启用 Tree Shaking

## 生态系统

RuoYi-Plus-UniApp 是 RuoYi-Plus 全栈框架的移动端部分，与以下项目协同工作：

| 项目 | 说明 |
|------|------|
| RuoYi-Plus | Spring Boot 3 后端框架 |
| plus-ui | Vue 3 管理端前端 |
| plus-uniapp | UniApp 移动端（本项目） |

通过统一的 API 接口、类型定义和业务逻辑，三端形成完整的企业级全栈解决方案。
