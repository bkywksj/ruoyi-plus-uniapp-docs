# 应用配置

## 概述

应用配置是 UniApp 项目的核心基础设施,统一管理应用的运行时配置、环境变量、样式变量等关键信息。RuoYi-Plus-UniApp 项目采用分层配置架构,实现了配置的集中管理、环境隔离和类型安全。

**核心特性:**

- **分层架构** - 环境变量、应用配置、样式变量三层分离,职责清晰
- **类型安全** - 基于 TypeScript 接口定义,编译时类型检查
- **深度冻结** - 配置对象不可变,防止运行时意外修改
- **环境隔离** - 开发、生产环境配置分离,支持自动切换
- **全局注入** - 样式变量自动注入所有组件,无需手动导入
- **多平台适配** - 统一管理各小程序平台的 AppId 和密钥

## 架构设计

### 配置分层架构

```text
┌─────────────────────────────────────────────────────────────────┐
│                     应用配置系统架构                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    环境变量层                              │  │
│  │  .env / .env.development / .env.production               │  │
│  │  VITE_APP_* 变量定义                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   应用配置层                               │  │
│  │                 systemConfig.ts                           │  │
│  │  SystemConfig 对象 (类型安全 + 深度冻结)                   │  │
│  │  app / api / security / platforms                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   样式变量层                               │  │
│  │                    uni.scss                               │  │
│  │  $uni-color-* / $uni-font-* / $uni-spacing-*             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   应用组件层                               │  │
│  │            Pages / Components / Composables               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 配置加载流程

```text
应用启动
    │
    ▼
┌─────────────────┐
│  Vite 构建时    │
│  读取 .env 文件 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ import.meta.env │
│ 注入环境变量     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ systemConfig.ts │
│ 解析配置对象     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   deepFreeze    │
│   冻结配置对象   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SystemConfig   │
│  导出只读配置    │
└─────────────────┘
```

## 文件结构

```text
src/
├── systemConfig.ts          # 应用配置主文件
├── uni.scss                 # 全局样式变量
└── env/
    ├── .env                 # 通用环境变量
    ├── .env.development     # 开发环境变量
    └── .env.production      # 生产环境变量
```

## 应用配置 (systemConfig.ts)

### 配置结构概览

`systemConfig.ts` 是应用的核心配置文件,定义了四大配置模块:

| 模块 | 说明 | 典型配置 |
|------|------|---------|
| `app` | 应用基础信息 | id, title, env, publicPath |
| `api` | API 服务配置 | baseUrl |
| `security` | 安全相关配置 | apiEncrypt, rsaPublicKey, rsaPrivateKey |
| `platforms` | 多平台配置 | 各小程序 AppId, mapKey 等 |

### 配置接口定义

#### SystemConfigType 总接口

```typescript
/**
 * 应用配置总接口 - 只读
 */
interface SystemConfigType {
  /** 应用基础信息 */
  app: BaseConfig
  /** 服务端配置 */
  api: ApiConfig
  /** 安全配置 */
  security: SecurityConfig
  /** 平台配置 */
  platforms: PlatformsConfig
}
```

#### BaseConfig 应用基础配置

```typescript
/**
 * 应用基础信息
 */
interface BaseConfig {
  /** 应用唯一标识 - 用于缓存键前缀等场景 */
  id: string
  /** 应用名称 - 显示在标题栏等位置 */
  title: string
  /** 运行环境 */
  env: 'development' | 'production'
  /** 应用部署的基础路径 - H5 路由 base */
  publicPath: string
}
```

**配置说明:**

| 字段 | 环境变量 | 用途 |
|------|---------|------|
| `id` | `VITE_APP_ID` | 缓存键前缀,避免多项目冲突 |
| `title` | `VITE_APP_TITLE` | 应用标题,页面 document.title |
| `env` | `VITE_APP_ENV` | 环境标识,控制日志等行为 |
| `publicPath` | `VITE_APP_PUBLIC_PATH` | H5 部署路径,如 `/demo/` |

#### ApiConfig API 配置

```typescript
/**
 * API相关配置
 */
export interface ApiConfig {
  /** API 基础地址 */
  baseUrl: string
}
```

**使用示例:**

```typescript
import { SystemConfig } from '@/systemConfig'

// 获取 API 基础地址
const baseUrl = SystemConfig.api.baseUrl
// 开发环境: http://127.0.0.1:5503
// 生产环境: https://api.example.com
```

#### SecurityConfig 安全配置

```typescript
/**
 * 安全配置
 */
interface SecurityConfig {
  /** 接口加密功能开关 */
  apiEncrypt: boolean
  /** RSA公钥 - 用于加密传输 */
  rsaPublicKey: string
  /** RSA私钥 - 用于解密响应 */
  rsaPrivateKey: string
}
```

**安全机制说明:**

1. **接口加密** - 通过 `apiEncrypt` 开关控制是否启用请求/响应加密
2. **RSA 公钥** - 用于加密请求数据,与后端解密私钥配对
3. **RSA 私钥** - 用于解密响应数据,与后端加密公钥配对

**使用示例:**

```typescript
import { SystemConfig } from '@/systemConfig'
import { encrypt, decrypt } from '@/utils/rsa'

// 判断是否启用加密
if (SystemConfig.security.apiEncrypt) {
  // 使用公钥加密请求数据
  const encryptedData = encrypt(requestData, SystemConfig.security.rsaPublicKey)

  // 使用私钥解密响应数据
  const decryptedData = decrypt(responseData, SystemConfig.security.rsaPrivateKey)
}
```

#### PlatformsConfig 平台配置

```typescript
/**
 * 第三方平台配置
 */
interface PlatformsConfig {
  /** 微信小程序 appid */
  wechatMiniAppId: string
  /** 微信公众号 appid */
  wechatOfficialAppId: string
  /** 支付宝小程序 appid */
  alipayMiniAppId: string
  /** 头条小程序 appid /抖音 */
  toutiaoMiniAppId: string
  /** 百度小程序 appid */
  baiduMiniAppId: string
  /** QQ小程序 appid */
  qqMiniAppId: string
  /** 地图服务密钥 */
  mapKey: string
  /** 在线客服链接 */
  serviceUrl: string
  /** 分享页面域名 */
  shareDomain: string
  /** 数据统计服务 ID */
  analyticsId: string
}
```

**平台 AppId 对应关系:**

| 平台 | 环境变量 | 用途 |
|------|---------|------|
| 微信小程序 | `VITE_WECHAT_MINI_APP_ID` | 微信登录、支付、分享 |
| 微信公众号 | `VITE_WECHAT_OFFICIAL_APP_ID` | H5 微信授权登录 |
| 支付宝小程序 | `VITE_ALIPAY_MINI_APP_ID` | 支付宝登录、支付 |
| 抖音小程序 | `VITE_BYTEDANCE_MINI_APP_ID` | 抖音平台功能 |
| 百度小程序 | `VITE_BAIDU_MINI_APP_ID` | 百度平台功能 |
| QQ小程序 | `VITE_QQ_MINI_APP_ID` | QQ 平台功能 |

### 深度冻结机制

配置对象使用 `deepFreeze` 函数进行深度冻结,确保配置在运行时不可被修改:

```typescript
/**
 * 深度只读类型工具
 */
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Record<string, any> ? DeepReadonly<T[P]> : T[P]
}

/**
 * 深度冻结对象，防止修改
 */
const deepFreeze = <T extends Record<string, any>>(obj: T): DeepReadonly<T> => {
  Object.freeze(obj)
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (obj[prop] !== null && typeof obj[prop] === 'object') {
      deepFreeze(obj[prop])
    }
  })
  return obj as DeepReadonly<T>
}
```

**冻结机制的优点:**

1. **防止意外修改** - 配置对象完全只读
2. **类型安全** - TypeScript 编译时检查
3. **运行时保护** - 修改操作会静默失败(严格模式下抛错)
4. **提升可维护性** - 配置来源单一,便于追踪

### 配置导出

```typescript
/**
 * 移动端应用配置
 * @description 基于环境变量的应用配置，专为移动端优化
 */
export const SystemConfig: DeepReadonly<SystemConfigType> = deepFreeze({
  app: {
    id: import.meta.env.VITE_APP_ID,
    title: import.meta.env.VITE_APP_TITLE,
    env: (import.meta.env.VITE_APP_ENV || 'development') as 'development' | 'production',
    publicPath: import.meta.env.VITE_APP_PUBLIC_PATH || '',
  },
  api: {
    baseUrl: import.meta.env.VITE_APP_BASE_API,
  },
  security: {
    apiEncrypt: import.meta.env.VITE_APP_API_ENCRYPT === 'true',
    rsaPublicKey: import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '',
    rsaPrivateKey: import.meta.env.VITE_APP_RSA_PRIVATE_KEY || '',
  },
  platforms: {
    wechatMiniAppId: import.meta.env.VITE_WECHAT_MINI_APP_ID || '',
    wechatOfficialAppId: import.meta.env.VITE_WECHAT_OFFICIAL_APP_ID || '',
    alipayMiniAppId: import.meta.env.VITE_ALIPAY_MINI_APP_ID || '',
    toutiaoMiniAppId: import.meta.env.VITE_BYTEDANCE_MINI_APP_ID || '',
    baiduMiniAppId: import.meta.env.VITE_BAIDU_MINI_APP_ID || '',
    qqMiniAppId: import.meta.env.VITE_QQ_MINI_APP_ID || '',
    mapKey: import.meta.env.VITE_MAP_KEY || '',
    serviceUrl: import.meta.env.VITE_SERVICE_URL || '',
    shareDomain: import.meta.env.VITE_SHARE_DOMAIN || '',
    analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
  },
})
```

### 语言配置枚举

```typescript
/**
 * 系统支持的语言枚举
 * @description 定义应用程序支持的所有语言选项
 */
export enum LanguageCode {
  /**
   * 中文(简体)
   */
  zh_CN = 'zh-CN',

  /**
   * 英文(美国)
   */
  en_US = 'en-US'
}
```

**使用示例:**

```typescript
import { LanguageCode } from '@/systemConfig'

// 设置默认语言
const defaultLang = LanguageCode.zh_CN

// 判断当前语言
if (currentLang === LanguageCode.en_US) {
  // 英文环境处理
}
```

## 环境变量配置

### 环境变量文件

项目使用三个环境变量文件:

| 文件 | 用途 | 加载时机 |
|------|------|---------|
| `.env` | 通用配置 | 始终加载 |
| `.env.development` | 开发环境配置 | `npm run dev` |
| `.env.production` | 生产环境配置 | `npm run build` |

### 变量命名规范

**重要**: 只有以 `VITE_` 为前缀的变量才会暴露给前端代码使用。

```bash
# ✅ 正确 - 会被暴露
VITE_APP_TITLE = 'My App'

# ❌ 错误 - 不会被暴露
APP_TITLE = 'My App'
```

### 通用配置 (.env)

```bash
# 应用id (每个项目唯一,避免不同项目键产生冲突)
VITE_APP_ID = 'ryplus_uni_workflow'

# 应用标题
VITE_APP_TITLE = 'ryplus-uni'

# uni-app 应用 ID
VITE_UNI_APPID = 'UNI__6E229FA'

# ===== 小程序平台配置 =====
# 微信小程序appid
VITE_WECHAT_MINI_APP_ID = 'wxd44a6eaefd42428c'
# 微信公众号appid
VITE_WECHAT_OFFICIAL_APP_ID = 'wx08728cf8ec97725f'
# 支付宝小程序appid
VITE_ALIPAY_MINI_APP_ID = 'your_alipay_app_id'
# 字节跳动小程序appid
VITE_BYTEDANCE_MINI_APP_ID = 'your_bytedance_app_id'
# 百度小程序appid
VITE_BAIDU_MINI_APP_ID = 'your_baidu_app_id'
# QQ小程序appid
VITE_QQ_MINI_APP_ID = 'your_qq_app_id'

# h5部署网站的base，配置到 manifest.config.ts 里的 h5.router.base
# 如/demo/ 注意前后都需加斜杠
VITE_APP_PUBLIC_PATH = '/'

# ===== 安全配置 =====
# 接口加密功能开关(如需关闭 后端也必须对应关闭)
VITE_APP_API_ENCRYPT = 'true'

# 接口加密传输 RSA 公钥与后端解密私钥对应
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZI...'

# 接口响应解密 RSA 私钥与后端加密公钥对应
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOwIBAAJB...'

# ===== 功能开关 =====
# websocket 开关
VITE_APP_WEBSOCKET = 'false'
```

### 开发环境配置 (.env.development)

```bash
# 环境标识
VITE_APP_ENV='development'

# api基础路径
VITE_APP_BASE_API='http://127.0.0.1:5503'

# 开发环境后端端口
VITE_APP_BASE_API_PORT='5503'

# 是否去除console 和 debugger
VITE_DELETE_CONSOLE=false

# 是否开启sourcemap
VITE_SHOW_SOURCEMAP=true
```

### 生产环境配置 (.env.production)

```bash
# 环境标识
VITE_APP_ENV='production'

# api基础路径 (生产环境 API 地址)
VITE_APP_BASE_API='https://api.example.com'

# 是否去除console 和 debugger
VITE_DELETE_CONSOLE=true

# 是否开启sourcemap
VITE_SHOW_SOURCEMAP=false
```

### 访问环境变量

```typescript
// 方式一: 通过 import.meta.env 直接访问
const apiUrl = import.meta.env.VITE_APP_BASE_API

// 方式二: 通过 SystemConfig 访问 (推荐)
import { SystemConfig } from '@/systemConfig'
const apiUrl = SystemConfig.api.baseUrl
```

**推荐使用 SystemConfig 的原因:**

1. 类型安全 - 有 TypeScript 类型提示
2. 集中管理 - 配置来源清晰
3. 默认值处理 - 已处理空值情况
4. 类型转换 - 布尔值等已正确转换

## 样式变量配置 (uni.scss)

### 概述

`uni.scss` 是 uni-app 的全局样式变量文件,定义了应用的主题色、字体大小、间距等样式变量。这些变量可以在整个项目中使用,**无需手动导入**。

### 文件位置

```text
src/uni.scss
```

### 自动导入机制

`uni.scss` 中的变量会被自动注入到每个 `.vue` 组件的 `<style lang="scss">` 中:

```vue
<template>
  <view class="container">
    <text class="title">标题</text>
  </view>
</template>

<style lang="scss" scoped>
// 无需 @import,直接使用变量
.container {
  background-color: $uni-bg-color;
  padding: $uni-spacing-row-base;
}

.title {
  color: $uni-color-primary;
  font-size: $uni-font-size-lg;
}
</style>
```

### 颜色变量

#### 行为相关颜色

```scss
/* 主色调 */
$uni-color-primary: #007aff;      // 主色（品牌色）
$uni-color-success: #4cd964;      // 成功色
$uni-color-warning: #f0ad4e;      // 警告色
$uni-color-error: #dd524d;        // 错误色
```

**使用场景:**

| 变量 | 使用场景 | 示例 |
|------|---------|------|
| `$uni-color-primary` | 主按钮、链接、重要信息 | 提交按钮 |
| `$uni-color-success` | 成功提示、完成状态 | 支付成功 |
| `$uni-color-warning` | 警告提示、待处理状态 | 待审核 |
| `$uni-color-error` | 错误提示、危险操作 | 删除按钮 |

#### 文字颜色

```scss
$uni-text-color: #333;                    // 基本文字颜色
$uni-text-color-inverse: #fff;            // 反色文字（用于深色背景）
$uni-text-color-grey: #999;               // 辅助灰色文字
$uni-text-color-placeholder: #808080;     // 占位符文字
$uni-text-color-disable: #c0c0c0;         // 禁用状态文字
```

**使用示例:**

```vue
<template>
  <view class="info-card">
    <text class="title">订单信息</text>
    <text class="label">订单号:</text>
    <text class="value">20231201001</text>
    <text class="hint">请在24小时内完成支付</text>
  </view>
</template>

<style lang="scss" scoped>
.info-card {
  .title {
    color: $uni-text-color;
    font-weight: bold;
  }

  .label {
    color: $uni-text-color-grey;
  }

  .value {
    color: $uni-text-color;
  }

  .hint {
    color: $uni-text-color-placeholder;
  }
}
</style>
```

#### 背景颜色

```scss
$uni-bg-color: #fff;                      // 主背景色（白色）
$uni-bg-color-grey: #f8f8f8;              // 灰色背景
$uni-bg-color-hover: #f1f1f1;             // 点击态背景
$uni-bg-color-mask: rgba(0, 0, 0, 0.4);   // 遮罩层背景
```

**使用场景:**

```scss
.page {
  background-color: $uni-bg-color;        // 页面背景
}

.card {
  background-color: $uni-bg-color-grey;   // 卡片背景
}

.item:active {
  background-color: $uni-bg-color-hover;  // 按下态
}

.modal-mask {
  background-color: $uni-bg-color-mask;   // 弹窗遮罩
}
```

#### 边框颜色

```scss
$uni-border-color: #c8c7cc;               // 边框颜色
```

### 尺寸变量

#### 文字尺寸

```scss
$uni-font-size-sm: 12px;                  // 小号字体
$uni-font-size-base: 14px;                // 基础字体
$uni-font-size-lg: 16px;                  // 大号字体
```

**字体使用规范:**

| 尺寸 | 使用场景 | rpx换算 |
|------|---------|---------|
| `12px` | 辅助文字、说明 | 24rpx |
| `14px` | 正文、列表 | 28rpx |
| `16px` | 标题、按钮 | 32rpx |

#### 图片尺寸

```scss
$uni-img-size-sm: 20px;                   // 小图标
$uni-img-size-base: 26px;                 // 基础图标
$uni-img-size-lg: 40px;                   // 大图标
```

#### 圆角半径

```scss
$uni-border-radius-sm: 2px;               // 小圆角
$uni-border-radius-base: 3px;             // 基础圆角
$uni-border-radius-lg: 6px;               // 大圆角
$uni-border-radius-circle: 50%;           // 圆形
```

**使用示例:**

```scss
.button {
  border-radius: $uni-border-radius-base;    // 按钮圆角
}

.card {
  border-radius: $uni-border-radius-lg;      // 卡片圆角
}

.avatar {
  border-radius: $uni-border-radius-circle;  // 圆形头像
}
```

#### 间距变量

**水平间距（左右）:**

```scss
$uni-spacing-row-sm: 5px;                 // 小间距
$uni-spacing-row-base: 10px;              // 基础间距
$uni-spacing-row-lg: 15px;                // 大间距
```

**垂直间距（上下）:**

```scss
$uni-spacing-col-sm: 4px;                 // 小间距
$uni-spacing-col-base: 8px;               // 基础间距
$uni-spacing-col-lg: 12px;                // 大间距
```

**使用示例:**

```scss
.container {
  padding: $uni-spacing-row-base;          // 左右10px
  margin-top: $uni-spacing-col-lg;         // 上方12px
}

.item + .item {
  margin-top: $uni-spacing-col-base;       // 项目间距8px
}
```

### 文章场景变量

```scss
/* 标题 */
$uni-color-title: #2c405a;                // 文章标题颜色
$uni-font-size-title: 20px;               // 标题字号

/* 副标题 */
$uni-color-subtitle: #555;                // 二级标题颜色
$uni-font-size-subtitle: 18px;            // 副标题字号

/* 段落 */
$uni-color-paragraph: #3f536e;            // 段落文字颜色
$uni-font-size-paragraph: 15px;           // 段落字号
```

**使用示例:**

```vue
<template>
  <view class="article">
    <text class="article-title">文章标题</text>
    <text class="article-subtitle">副标题内容</text>
    <text class="article-content">段落正文内容...</text>
  </view>
</template>

<style lang="scss" scoped>
.article {
  &-title {
    color: $uni-color-title;
    font-size: $uni-font-size-title;
    font-weight: bold;
  }

  &-subtitle {
    color: $uni-color-subtitle;
    font-size: $uni-font-size-subtitle;
  }

  &-content {
    color: $uni-color-paragraph;
    font-size: $uni-font-size-paragraph;
    line-height: 1.8;
  }
}
</style>
```

### 其他变量

#### 透明度

```scss
$uni-opacity-disabled: 0.3;               // 禁用态透明度
```

**使用示例:**

```scss
.button:disabled {
  opacity: $uni-opacity-disabled;          // 禁用按钮
}

.text-disabled {
  opacity: $uni-opacity-disabled;          // 禁用文字
}
```

## 实际应用

### 获取当前平台 AppId

```typescript
import { SystemConfig } from '@/systemConfig'
import { platform } from '@/utils/platform'

/**
 * 获取当前平台的 AppId
 */
const getCurrentPlatformAppId = (): string => {
  const { platforms } = SystemConfig

  switch (platform) {
    case 'mp-weixin':
      return platforms.wechatMiniAppId
    case 'mp-alipay':
      return platforms.alipayMiniAppId
    case 'mp-baidu':
      return platforms.baiduMiniAppId
    case 'mp-toutiao':
      return platforms.toutiaoMiniAppId
    case 'mp-qq':
      return platforms.qqMiniAppId
    case 'h5':
      return platforms.wechatOfficialAppId
    default:
      return ''
  }
}
```

### 环境判断与日志控制

```typescript
import { SystemConfig } from '@/systemConfig'

/**
 * 开发环境日志输出
 */
const devLog = (...args: any[]) => {
  if (SystemConfig.app.env === 'development') {
    console.log('[DEV]', ...args)
  }
}

/**
 * 生产环境错误上报
 */
const reportError = (error: Error) => {
  if (SystemConfig.app.env === 'production') {
    // 发送到错误监控系统
    fetch(`${SystemConfig.api.baseUrl}/api/error/report`, {
      method: 'POST',
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        appId: SystemConfig.app.id,
      }),
    })
  }
}
```

### 接口加密处理

```typescript
import { SystemConfig } from '@/systemConfig'
import { rsaEncrypt, rsaDecrypt } from '@/utils/rsa'

/**
 * 请求拦截器 - 加密处理
 */
const encryptRequest = (data: any): any => {
  if (!SystemConfig.security.apiEncrypt) {
    return data
  }

  return rsaEncrypt(JSON.stringify(data), SystemConfig.security.rsaPublicKey)
}

/**
 * 响应拦截器 - 解密处理
 */
const decryptResponse = (data: string): any => {
  if (!SystemConfig.security.apiEncrypt) {
    return data
  }

  const decrypted = rsaDecrypt(data, SystemConfig.security.rsaPrivateKey)
  return JSON.parse(decrypted)
}
```

### 缓存键前缀

```typescript
import { SystemConfig } from '@/systemConfig'

/**
 * 生成带应用前缀的缓存键
 */
const getCacheKey = (key: string): string => {
  return `${SystemConfig.app.id}_${key}`
}

// 使用示例
const TOKEN_KEY = getCacheKey('token')        // 'ryplus_uni_workflow_token'
const USER_KEY = getCacheKey('user')          // 'ryplus_uni_workflow_user'
```

### 自定义主题扩展

在 `uni.scss` 中添加项目特定的变量:

```scss
/* ========== 项目自定义变量 ========== */

/* 品牌色 */
$brand-color-primary: #0957DE;            // 品牌主色
$brand-color-secondary: #FF6B6B;          // 品牌辅色

/* 自定义间距 */
$spacing-page: 32rpx;                     // 页面边距
$spacing-card: 24rpx;                     // 卡片内边距

/* 自定义圆角 */
$border-radius-card: 16rpx;               // 卡片圆角
$border-radius-button: 8rpx;              // 按钮圆角

/* 阴影 */
$box-shadow-card: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
$box-shadow-button: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

/* 渐变色 */
$gradient-primary: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
$gradient-success: linear-gradient(135deg, #4cd964 0%, #34c759 100%);
```

### 动态主题切换

结合 CSS 变量实现运行时主题切换:

```scss
// uni.scss
$uni-color-primary: var(--primary-color, #007aff);
$uni-color-success: var(--success-color, #4cd964);
```

```typescript
// 组件中动态修改主题
const changeTheme = (theme: 'default' | 'green' | 'purple') => {
  const colors = {
    default: { primary: '#007aff', success: '#4cd964' },
    green: { primary: '#34c759', success: '#30d158' },
    purple: { primary: '#5856d6', success: '#af52de' },
  }

  const { primary, success } = colors[theme]

  // H5 环境
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--primary-color', primary)
    document.documentElement.style.setProperty('--success-color', success)
  }
}
```

## rpx 与 px 转换

### 单位说明

- **rpx**: 响应式 px,根据屏幕宽度自适应
- **px**: 固定像素,不会随屏幕变化

### 转换关系

以 iPhone 6 为例（屏幕宽度 375px）:

```text
750rpx = 375px（屏幕宽度）
1rpx = 0.5px
2rpx = 1px
```

### 使用建议

```scss
/* ✅ 推荐：移动端尺寸使用 rpx */
.container {
  width: 750rpx;           // 全屏宽度
  padding: 32rpx;          // 内边距
  font-size: 28rpx;        // 字体大小
}

/* ✅ 可以：边框使用 px */
.border {
  border: 1px solid #ddd;  // 1px 边框在所有屏幕都是 1px
}

/* ❌ 不推荐：混用不统一 */
.mixed {
  width: 375px;            // 固定宽度（小屏幕会超出）
  padding: 16rpx;          // 响应式内边距
}
```

## 最佳实践

### 1. 配置访问规范

```typescript
// ✅ 推荐：使用 SystemConfig
import { SystemConfig } from '@/systemConfig'

const apiUrl = SystemConfig.api.baseUrl
const isEncrypt = SystemConfig.security.apiEncrypt

// ❌ 不推荐：直接访问 import.meta.env
const apiUrl = import.meta.env.VITE_APP_BASE_API  // 无类型提示
```

### 2. 保持变量一致性

```scss
/* ✅ 好的做法：使用变量 */
.button {
  color: $uni-color-primary;
  font-size: $uni-font-size-base;
}

/* ❌ 不好的做法：硬编码 */
.button {
  color: #007aff;
  font-size: 14px;
}
```

### 3. 合理使用间距变量

```scss
/* ✅ 推荐：使用统一的间距 */
.container {
  padding: $uni-spacing-row-base;
  margin-bottom: $uni-spacing-col-lg;
}

/* ❌ 不推荐：随意的间距 */
.container {
  padding: 13px;
  margin-bottom: 17px;
}
```

### 4. 语义化使用颜色

```scss
/* ✅ 推荐：根据语义使用颜色 */
.success-text {
  color: $uni-color-success;
}

.error-text {
  color: $uni-color-error;
}

/* ❌ 不推荐：用途不明确 */
.text-green {
  color: #4cd964;
}
```

### 5. 环境变量安全

```bash
# ✅ 敏感信息通过环境变量注入,不要硬编码
VITE_APP_RSA_PUBLIC_KEY = 'xxx'

# ❌ 不要在代码中硬编码密钥
const rsaKey = 'MFwwDQYJKoZI...'  // 危险!
```

### 6. 平台 AppId 管理

```typescript
// ✅ 统一从配置获取
const appId = SystemConfig.platforms.wechatMiniAppId

// ❌ 不要在代码中硬编码 AppId
const appId = 'wxd44a6eaefd42428c'  // 维护困难
```

## 常见问题

### 1. 样式变量不生效?

**原因:**
- style 标签未添加 `lang="scss"`
- 变量名拼写错误

**解决方案:**

```vue
<!-- ✅ 正确 -->
<style lang="scss" scoped>
.button {
  color: $uni-color-primary;
}
</style>

<!-- ❌ 错误 -->
<style scoped>
.button {
  color: $uni-color-primary;  /* 无法识别 */
}
</style>
```

### 2. 如何在 JS 中使用样式变量?

**解决方案 1: 定义主题配置文件**

```typescript
// src/config/theme.ts
export const theme = {
  colorPrimary: '#007aff',
  colorSuccess: '#4cd964',
  colorWarning: '#f0ad4e',
  colorError: '#dd524d',
}

// 使用
import { theme } from '@/config/theme'
console.log(theme.colorPrimary)
```

**解决方案 2: 使用 CSS 变量**

```typescript
// 通过 getComputedStyle 获取 CSS 变量
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary-color')
```

### 3. 修改变量后不生效?

**解决方案:**
- 清除缓存
- 重启开发服务器
- 小程序需要重新编译

### 4. 环境变量未读取到?

**可能原因:**
1. 变量名未以 `VITE_` 开头
2. 环境变量文件位置不正确
3. 未重启开发服务器

**解决方案:**

```bash
# 检查变量名前缀
VITE_APP_XXX = 'xxx'  # ✅ 正确

# 检查文件位置
src/env/.env           # 项目配置的位置
```

### 5. SystemConfig 属性报错?

**原因:** TypeScript 类型定义与实际配置不匹配

**解决方案:** 确保接口定义与配置对象结构一致:

```typescript
// 接口定义
interface SystemConfigType {
  app: BaseConfig
  api: ApiConfig
  security: SecurityConfig
  platforms: PlatformsConfig
}

// 配置对象必须完整实现接口
export const SystemConfig: DeepReadonly<SystemConfigType> = deepFreeze({
  app: { /* 必须包含所有 BaseConfig 字段 */ },
  api: { /* 必须包含所有 ApiConfig 字段 */ },
  security: { /* 必须包含所有 SecurityConfig 字段 */ },
  platforms: { /* 必须包含所有 PlatformsConfig 字段 */ },
})
```

### 6. 如何添加新的配置项?

1. 在 `.env` 文件中添加环境变量:

```bash
VITE_NEW_CONFIG = 'value'
```

2. 在接口中定义类型:

```typescript
interface NewConfig {
  newField: string
}

interface SystemConfigType {
  // ... 现有字段
  newConfig: NewConfig
}
```

3. 在配置对象中添加:

```typescript
export const SystemConfig = deepFreeze({
  // ... 现有配置
  newConfig: {
    newField: import.meta.env.VITE_NEW_CONFIG || '',
  },
})
```

### 7. 多环境配置如何管理?

建议创建多个环境文件:

```text
env/
├── .env              # 通用配置
├── .env.development  # 开发环境
├── .env.staging      # 测试环境
├── .env.production   # 生产环境
```

在 `package.json` 中配置对应脚本:

```json
{
  "scripts": {
    "dev": "uni --mode development",
    "build:staging": "uni build --mode staging",
    "build:prod": "uni build --mode production"
  }
}
```

### 8. 如何实现配置热更新?

环境变量在构建时注入,无法热更新。如需动态配置,可以:

1. 使用远程配置服务
2. 通过 API 获取配置
3. 使用 LocalStorage 存储可变配置

```typescript
// 远程配置示例
const fetchRemoteConfig = async () => {
  const response = await fetch('/api/config')
  const config = await response.json()

  // 存储到本地
  uni.setStorageSync('remoteConfig', config)
}
```

## 总结

应用配置系统核心要点:

1. **分层架构** - 环境变量 → systemConfig.ts → uni.scss
2. **类型安全** - TypeScript 接口定义,编译时检查
3. **深度冻结** - 防止配置被意外修改
4. **环境隔离** - 开发/生产环境配置分离
5. **统一访问** - 通过 SystemConfig 对象访问
6. **全局注入** - 样式变量自动注入组件

合理使用配置系统可以:
- 提高代码可维护性
- 简化环境切换
- 增强类型安全
- 统一视觉风格
