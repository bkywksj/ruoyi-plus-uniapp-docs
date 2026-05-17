# 环境配置

## 介绍

RuoYi-Plus-UniApp 移动端采用多环境配置方案,通过 Vite 的环境变量系统实现开发、测试、预发布、生产等多个环境的独立配置。每个环境拥有独立的 API 地址、加密配置、功能开关等,确保不同环境间的完全隔离,避免配置混淆导致的问题。

**核心特性:**

- **环境隔离** - 开发、测试、生产环境完全独立,互不影响
- **配置分层** - 公共配置 + 环境特定配置的三层架构
- **类型安全** - TypeScript 类型定义,编译时检查
- **安全保障** - 敏感信息本地化,不提交到版本库
- **灵活扩展** - 支持自定义环境和配置项
- **自动加载** - Vite 自动识别和加载对应环境配置
- **运行时访问** - 通过 `import.meta.env` 访问所有环境变量

## 环境文件结构

### 文件组织

```text
plus-app/
├── env/                          # 环境变量目录
│   ├── .env                      # 公共配置(所有环境)
│   ├── .env.development          # 开发环境
│   ├── .env.test                 # 测试环境(可选)
│   ├── .env.staging              # 预发布环境(可选)
│   ├── .env.production           # 生产环境
│   └── .env.local                # 本地配置(不提交)
├── vite.config.ts                # Vite 配置(加载环境变量)
└── .gitignore                    # Git 忽略配置
```

### 加载优先级

环境变量的加载遵循以下优先级(从高到低):

```text
1. .env.[mode].local     # 本地环境特定配置(最高优先级)
   ↓
2. .env.[mode]           # 环境特定配置
   ↓
3. .env.local            # 本地公共配置
   ↓
4. .env                  # 公共配置(最低优先级)
```

**示例:**

开发环境下(`mode=development`),加载顺序为:
1. `.env.development.local` (如果存在)
2. `.env.development`
3. `.env.local` (如果存在)
4. `.env`

同名变量会被高优先级的值覆盖。

## 公共环境配置

### .env 文件

公共配置文件,包含所有环境共享的基础配置。

```bash
# ===== 应用基础信息 =====
# 应用ID(每个项目唯一,用于缓存键前缀)
VITE_APP_ID = 'ryplus_uni_workflow'

# 应用名称
VITE_APP_TITLE = 'ryplus-uni'

# 应用版本号
VITE_APP_VERSION = '2.11.0'

# ===== 安全配置 =====
# 接口加密功能开关
VITE_APP_API_ENCRYPT = 'true'

# 接口加密传输 RSA 公钥(与后端解密私钥配对)
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAK9s1Pbnn5W+l1hx3ukHLtevayF5nOFIb140zvIPksw8h7bZWY05zyWdsQ2I51ypiC53KnyfhibPk3AJ2yr+qnkCAwEAAQ=='

# 接口响应解密 RSA 私钥(与后端加密公钥配对)
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOwIBAAJBAIrZxEhzVAHKJm7BJpXIHWGU3sHJYgRiOOTw3Auj/iNDTL+RExEW2Y0dg/IC71DKxcjvVEA9GdDp0/5nph+4dIMCAwEAAQJAIyPdwyA84H8SnvEPHNUaannMrmqS/d0F3Rr/9Yo5ZR7htKMON9zDgixHOZb+MQmpXapvl8NgQazUsLtya/pX4QIhAMGq7rIFz2OXce1KsQ7nVj+6fAjguW4mDEcgXKUnQn9bAiEAt4o8KELUNEFNuVJs89QMrDiuyo1PQQc9pB5nUP4wz/kCIFJ/StCgsvg8kfY/4+5yUwYwnRd3CuZF5OMDgROFBsmTAiEAgycdq6ttldWgY7A5uNarI5nxlT37Bz3UV2V+cIrjeIkCIQCAJS0PinuXxvX9Sqr+1+n0gMB+nU0frif1icnKWGQzRw=='

# ===== 功能开关 =====
# WebSocket 功能开关
VITE_APP_WEBSOCKET = 'false'

# 多语言功能开关
VITE_APP_I18N = 'true'

# 主题切换功能开关
VITE_APP_THEME = 'true'
```

### 配置项说明

#### 应用基础信息

**VITE_APP_ID**
- **作用**: 应用唯一标识符
- **用途**:
  - 缓存键前缀,避免多项目缓存冲突
  - 本地存储命名空间
  - 日志标识
- **命名规范**: 使用项目名 + 下划线分隔
- **示例**: `ryplus_uni_workflow`、`myapp_mobile`

**VITE_APP_TITLE**
- **作用**: 应用名称
- **用途**:
  - 页面标题
  - APP 启动页显示
  - 关于页面显示
- **示例**: `'若依管理系统'`、`'RuoYi Admin'`

**VITE_APP_VERSION**
- **作用**: 应用版本号
- **格式**: 遵循语义化版本规范 `主版本.次版本.修订号`
- **用途**:
  - 版本检查
  - 更新提示
  - 日志记录
- **示例**: `'2.11.0'`、`'1.0.0'`

#### 安全配置

**VITE_APP_API_ENCRYPT**
- **作用**: API 接口加密开关
- **值**: `'true'` | `'false'`
- **说明**:
  - 启用后,请求参数使用 AES 加密
  - 响应数据使用 AES 解密
  - **前后端必须保持一致**
- **注意**: 关闭时后端也必须关闭,否则通信失败

**VITE_APP_RSA_PUBLIC_KEY**
- **作用**: RSA 公钥,用于加密传输 AES 密钥
- **格式**: Base64 编码的公钥字符串
- **配对**: 与后端的 RSA 私钥配对使用
- **更换流程**:
  1. 生成新的 RSA 密钥对
  2. 前端配置公钥
  3. 后端配置私钥
  4. 前后端同时发布

**VITE_APP_RSA_PRIVATE_KEY**
- **作用**: RSA 私钥,用于解密响应数据
- **配对**: 与后端的 RSA 公钥配对使用
- **安全性**:
  - ⚠️ **不要泄露私钥**
  - 生产环境建议使用 `.env.local` 配置
  - 不提交到公开代码仓库

#### 功能开关

**VITE_APP_WEBSOCKET**
- **作用**: WebSocket 功能开关
- **值**: `'true'` | `'false'`
- **用途**:
  - 实时消息推送
  - 在线状态同步
  - 实时数据更新
- **说明**: 关闭后不建立 WebSocket 连接

**VITE_APP_I18N**
- **作用**: 多语言功能开关
- **值**: `'true'` | `'false'`
- **用途**: 控制是否加载国际化模块
- **说明**: 关闭后默认使用中文

**VITE_APP_THEME**
- **作用**: 主题切换功能开关
- **值**: `'true'` | `'false'`
- **用途**: 控制是否支持亮色/暗色主题切换
- **说明**: 关闭后使用默认主题

## 开发环境配置

### .env.development 文件

开发环境专用配置,用于本地开发调试。

```bash
# 变量必须以 VITE_ 为前缀才能暴露给外部读取
# 环境标识
VITE_APP_ENV = 'development'

# API 基础路径(本地后端服务)
VITE_APP_BASE_API = 'http://127.0.0.1:5500'

# API 超时时间(毫秒)
VITE_APP_TIMEOUT = '30000'

# ===== 构建优化配置 =====
# 是否移除 console 和 debugger
VITE_DELETE_CONSOLE = false

# 是否生成 SourceMap
VITE_SHOW_SOURCEMAP = true

# 是否开启代码压缩
VITE_MINIFY = false

# ===== 调试配置 =====
# 是否开启请求日志
VITE_APP_LOG_REQUEST = 'true'

# 是否开启响应日志
VITE_APP_LOG_RESPONSE = 'true'

# 是否开启性能监控
VITE_APP_PERFORMANCE = 'false'

# ===== Mock 配置 =====
# 是否启用 Mock 数据
VITE_APP_MOCK = 'false'

# Mock API 延迟(毫秒)
VITE_APP_MOCK_DELAY = '500'
```

### 开发环境特点

**1. 调试友好**
- 保留 `console.log` 和 `debugger`
- 生成完整的 SourceMap
- 不压缩代码,便于断点调试

**2. 快速构建**
- 不进行代码混淆
- 不进行代码压缩
- 启用热模块替换(HMR)

**3. 本地服务**
- API 指向本地后端 `127.0.0.1:5500`
- 可快速修改和测试

**4. 详细日志**
- 输出请求和响应详情
- 记录错误堆栈
- 性能监控(可选)

### 开发环境使用

#### 启动开发服务器

```bash
# H5 开发
pnpm dev:h5
# 访问: http://localhost:5173

# 微信小程序开发
pnpm dev:mp-weixin
# 使用微信开发者工具打开 dist/dev/mp-weixin

# 支付宝小程序开发
pnpm dev:mp-alipay

# APP 开发
pnpm dev:app
```

#### 访问环境变量

```typescript
// 获取 API 地址
const apiUrl = import.meta.env.VITE_APP_BASE_API
// 'http://127.0.0.1:5500'

// 判断是否开发环境
const isDev = import.meta.env.DEV
// true

// 获取模式
const mode = import.meta.env.MODE
// 'development'
```

## 生产环境配置

### .env.production 文件

生产环境配置,用于正式对外发布。

```bash
# 环境标识
VITE_APP_ENV = 'production'

# API 基础路径(生产服务器)
VITE_APP_BASE_API = 'https://ruoyi.plus/ryplus_uni_workflow'

# API 超时时间
VITE_APP_TIMEOUT = '20000'

# ===== 构建优化配置 =====
# 移除所有 console 和 debugger
VITE_DELETE_CONSOLE = true

# 关闭 SourceMap(安全)
VITE_SHOW_SOURCEMAP = false

# 开启代码压缩
VITE_MINIFY = true

# ===== 调试配置 =====
# 关闭所有日志
VITE_APP_LOG_REQUEST = 'false'
VITE_APP_LOG_RESPONSE = 'false'

# 开启性能监控(用于线上监控)
VITE_APP_PERFORMANCE = 'true'

# ===== 安全配置 =====
# 生产环境强制加密
VITE_APP_API_ENCRYPT = 'true'

# ===== CDN 配置 =====
# 静态资源 CDN 地址(可选)
VITE_APP_CDN = 'https://cdn.ruoyi.plus'

# 公共资源基础路径
VITE_APP_PUBLIC_BASE = '/'
```

### 生产环境特点

**1. 极致优化**
- 移除所有调试代码
- 完全的代码压缩和混淆
- 关闭 SourceMap

**2. 安全加固**
- 强制 API 加密
- 隐藏源码结构
- 防止调试

**3. 性能优先**
- CDN 加速(可选)
- 代码分割
- 资源预加载

**4. 监控告警**
- 错误监控(Sentry等)
- 性能监控
- 用户行为分析

### 生产环境构建

```bash
# H5 生产构建
pnpm build:h5

# 微信小程序生产构建
pnpm build:mp-weixin

# 支付宝小程序生产构建
pnpm build:mp-alipay

# APP 生产构建
pnpm build:app
```

## 本地环境配置

### .env.local 文件

本地个人配置,不提交到版本库。

```bash
# ===== 本地开发配置 =====
# 本地 API 地址(覆盖 .env.development)
VITE_APP_BASE_API = 'http://192.168.1.100:8080'

# ===== 个人调试配置 =====
# 开启更详细的日志
VITE_APP_LOG_LEVEL = 'debug'

# 开启 Mock 数据
VITE_APP_MOCK = 'true'

# ===== 敏感信息(不提交) =====
# 本地测试的 RSA 私钥
VITE_APP_RSA_PRIVATE_KEY = '本地测试密钥...'

# 第三方服务密钥
VITE_APP_WECHAT_APPID = 'wx1234567890'
VITE_APP_ALIPAY_APPID = '2021001234567890'
```

### .gitignore 配置

确保本地配置不被提交:

```bash
# 本地环境文件
.env.local
.env.*.local

# 敏感信息
.env.production.local
```

### 使用场景

**1. 个性化配置**
- 本地 API 地址不同
- 调试级别偏好不同
- Mock 数据开关

**2. 敏感信息**
- 测试账号密码
- 第三方 AppID/Secret
- RSA 密钥(开发用)

**3. 临时配置**
- 临时功能开关
- 调试参数
- 实验性功能

## 环境变量使用

### 在代码中访问

#### TypeScript/JavaScript 代码

```typescript
// ===== 获取环境变量 =====
// API 基础路径
const apiUrl = import.meta.env.VITE_APP_BASE_API
// 'http://127.0.0.1:5500' (开发环境)
// 'https://ruoyi.plus/api' (生产环境)

// 应用ID
const appId = import.meta.env.VITE_APP_ID
// 'ryplus_uni_workflow'

// 是否加密
const isEncrypt = import.meta.env.VITE_APP_API_ENCRYPT === 'true'
// true | false

// ===== 判断环境 =====
// 是否开发环境
const isDev = import.meta.env.DEV
// true (开发环境) | false (生产环境)

// 是否生产环境
const isProd = import.meta.env.PROD
// true (生产环境) | false (开发环境)

// 当前模式
const mode = import.meta.env.MODE
// 'development' | 'production' | 'test' | 'staging'

// 环境标识
const env = import.meta.env.VITE_APP_ENV
// 'development' | 'production' | 'test' | 'staging'

// ===== 条件执行 =====
if (import.meta.env.DEV) {
  console.log('开发环境:API地址', apiUrl)
} else {
  // 生产环境不输出(console 会被移除)
}

// 根据环境配置不同逻辑
if (import.meta.env.VITE_APP_MOCK === 'true') {
  // 使用 Mock 数据
  useMockData()
} else {
  // 使用真实 API
  useRealApi()
}
```

#### Vue 组件中使用

```vue
<script lang="ts" setup>
// 获取环境变量
const apiUrl = import.meta.env.VITE_APP_BASE_API
const appTitle = import.meta.env.VITE_APP_TITLE
const isDev = import.meta.env.DEV

// 使用环境变量
onMounted(() => {
  if (isDev) {
    console.log('应用启动:', appTitle)
    console.log('API地址:', apiUrl)
  }
})
</script>

<template>
  <view class="app">
    <text>{{ appTitle }}</text>
    <!-- 开发环境显示调试信息 -->
    <view v-if="isDev" class="debug-info">
      <text>环境: 开发</text>
      <text>API: {{ apiUrl }}</text>
    </view>
  </view>
</template>
```

### 在 Vite 配置中使用

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv } from 'vite'
import path from 'node:path'

export default ({ mode }: ConfigEnv) => {
  // 加载环境变量
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))

  // 解构需要的变量
  const {
    VITE_APP_BASE_API,
    VITE_DELETE_CONSOLE,
    VITE_SHOW_SOURCEMAP,
    VITE_APP_PUBLIC_BASE,
  } = env

  return defineConfig({
    // 基础路径
    base: VITE_APP_PUBLIC_BASE || '/',

    // 移除 console
    esbuild: {
      drop: VITE_DELETE_CONSOLE === 'true'
        ? ['console', 'debugger']
        : ['debugger'],
    },

    // 构建配置
    build: {
      sourcemap: VITE_SHOW_SOURCEMAP === 'true',
      minify: mode === 'development' ? false : 'esbuild',
    },

    // 开发服务器代理
    server: {
      proxy: {
        '/api': {
          target: VITE_APP_BASE_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  })
}
```

### TypeScript 类型定义

创建环境变量类型定义文件:

```typescript
// types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 基础配置
  readonly VITE_APP_ID: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string

  // 环境标识
  readonly VITE_APP_ENV: 'development' | 'test' | 'staging' | 'production'

  // API 配置
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_TIMEOUT: string

  // 安全配置
  readonly VITE_APP_API_ENCRYPT: 'true' | 'false'
  readonly VITE_APP_RSA_PUBLIC_KEY: string
  readonly VITE_APP_RSA_PRIVATE_KEY: string

  // 构建配置
  readonly VITE_DELETE_CONSOLE: boolean
  readonly VITE_SHOW_SOURCEMAP: boolean

  // 功能开关
  readonly VITE_APP_WEBSOCKET: 'true' | 'false'
  readonly VITE_APP_I18N: 'true' | 'false'
  readonly VITE_APP_THEME: 'true' | 'false'
  readonly VITE_APP_MOCK: 'true' | 'false'

  // 调试配置
  readonly VITE_APP_LOG_REQUEST: 'true' | 'false'
  readonly VITE_APP_LOG_RESPONSE: 'true' | 'false'
  readonly VITE_APP_PERFORMANCE: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 环境切换

### 命令行切换

#### 开发环境

```bash
# H5
pnpm dev:h5
# 等同于: vite --mode development

# 小程序
pnpm dev:mp-weixin
pnpm dev:mp-alipay
```

#### 生产环境

```bash
# 构建生产环境
pnpm build:h5
# 等同于: vite build --mode production

pnpm build:mp-weixin
pnpm build:mp-alipay
```

### package.json 脚本配置

```json
{
  "scripts": {
    // 开发环境
    "dev:h5": "uni",
    "dev:mp-weixin": "uni -p mp-weixin",

    // 生产环境
    "build:h5": "uni build",
    "build:mp-weixin": "uni build -p mp-weixin"
  }
}
```

## 最佳实践

### 1. 环境变量命名规范

**统一前缀**

```bash
# ✅ 正确 - 使用 VITE_ 前缀
VITE_APP_API='https://api.example.com'
VITE_APP_TITLE='My App'

# ❌ 错误 - 没有前缀,不会暴露给客户端
APP_API='https://api.example.com'
API_URL='https://api.example.com'
```

**语义化命名**

```bash
# ✅ 正确 - 清晰的命名
VITE_APP_BASE_API         # API 基础路径
VITE_APP_TIMEOUT          # 请求超时时间
VITE_APP_API_ENCRYPT      # API 加密开关

# ❌ 错误 - 含糊的命名
VITE_API                  # 不明确
VITE_TIME                 # 不明确
VITE_ENCRYPT              # 不明确
```

### 2. 敏感信息管理

**不提交敏感信息**

```bash
# .gitignore
.env.local
.env.*.local
.env.production.local

# 密钥文件
keys/
*.key
*.pem
```

**使用本地配置**

```bash
# .env (提交)
VITE_APP_BASE_API='https://api.example.com'

# .env.local (不提交)
VITE_APP_BASE_API='http://192.168.1.100:8080'  # 本地开发地址
VITE_APP_RSA_PRIVATE_KEY='本地测试密钥'
```

### 3. 环境变量文档化

创建环境变量说明文档:

```markdown
# 环境变量说明

## 必需变量

| 变量名 | 说明 | 示例 | 是否必需 |
|--------|------|------|---------|
| VITE_APP_ID | 应用ID | `ryplus_uni` | ✅ |
| VITE_APP_TITLE | 应用名称 | `若依管理` | ✅ |
| VITE_APP_BASE_API | API地址 | `https://api.example.com` | ✅ |

## 可选变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| VITE_APP_TIMEOUT | 超时时间 | `20000` | `30000` |
| VITE_APP_WEBSOCKET | WebSocket开关 | `false` | `true` |
```

## 常见问题

### 1. 环境变量不生效

**问题原因:**
- 变量名未以 `VITE_` 开头
- 未重启开发服务器
- 环境文件路径错误

**解决方案:**

```bash
# 1. 检查变量名
# ✅ 正确
VITE_APP_API='http://localhost:5500'

# ❌ 错误
APP_API='http://localhost:5500'

# 2. 重启服务器
# Ctrl+C 停止
pnpm dev:h5

# 3. 检查文件位置
ls env/
# 确保文件在 env/ 目录下
```

### 2. 不同环境使用同一配置

**问题原因:**
- 环境文件未创建
- mode 参数未传递

**解决方案:**

```bash
# 1. 检查环境文件是否存在
ls env/
# .env
# .env.development
# .env.production

# 2. 检查构建命令
# ✅ 正确 - 自动使用对应环境
pnpm build:h5  # 使用 production
pnpm dev:h5    # 使用 development
```

### 3. 密钥配置错误

**问题原因:**
- RSA 密钥对不匹配
- 前后端密钥配置颠倒

**解决方案:**

```bash
# 检查密钥对应关系
# 前端: VITE_APP_RSA_PUBLIC_KEY (加密用)
# 后端: RSA 私钥 (解密用)
#
# 前端: VITE_APP_RSA_PRIVATE_KEY (解密用)
# 后端: RSA 公钥 (加密用)

# 确保前后端密钥对应
```

## 多平台环境配置

### 平台特定配置

不同平台可能需要不同的环境配置,可以通过条件编译结合环境变量实现。

#### Vite 配置中的平台检测

```typescript
// vite.config.ts
import type { ConfigEnv, UserConfig } from 'vite'
import path from 'node:path'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  // 获取当前编译平台
  const { UNI_PLATFORM } = process.env
  console.log('当前平台:', UNI_PLATFORM)
  // mp-weixin - 微信小程序
  // h5 - H5 网页
  // app - APP 应用
  // mp-alipay - 支付宝小程序

  // 加载环境变量
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))

  return defineConfig({
    // 根据平台定义全局常量
    define: {
      __UNI_PLATFORM__: JSON.stringify(UNI_PLATFORM),
    },

    // 其他配置...
  })
}
```

#### 平台特定环境变量

```bash
# .env.development
# H5 开发服务器配置
VITE_APP_H5_BASE_URL = 'http://localhost:5173'

# 微信小程序 AppID(开发版)
VITE_APP_WECHAT_APPID_DEV = 'wx1234567890abcdef'

# 支付宝小程序 AppID(开发版)
VITE_APP_ALIPAY_APPID_DEV = '2021001234567890'
```

```bash
# .env.production
# H5 生产服务器配置
VITE_APP_H5_BASE_URL = 'https://m.example.com'

# 微信小程序 AppID(生产版)
VITE_APP_WECHAT_APPID = 'wx0987654321fedcba'

# 支付宝小程序 AppID(生产版)
VITE_APP_ALIPAY_APPID = '2021009876543210'
```

#### 代码中使用平台变量

```typescript
// 使用全局平台常量
declare const __UNI_PLATFORM__: string

// 获取当前平台
const platform = __UNI_PLATFORM__

// 根据平台执行不同逻辑
if (platform === 'h5') {
  // H5 特定逻辑
  console.log('H5 平台')
} else if (platform === 'mp-weixin') {
  // 微信小程序特定逻辑
  console.log('微信小程序平台')
} else if (platform === 'app') {
  // APP 特定逻辑
  console.log('APP 平台')
}

// 获取平台对应的 AppID
const getAppId = (): string => {
  const isDev = import.meta.env.DEV

  if (platform === 'mp-weixin') {
    return isDev
      ? import.meta.env.VITE_APP_WECHAT_APPID_DEV
      : import.meta.env.VITE_APP_WECHAT_APPID
  }

  if (platform === 'mp-alipay') {
    return isDev
      ? import.meta.env.VITE_APP_ALIPAY_APPID_DEV
      : import.meta.env.VITE_APP_ALIPAY_APPID
  }

  return import.meta.env.VITE_APP_ID
}
```

### 条件编译与环境结合

```vue
<template>
  <view class="container">
    <!-- #ifdef H5 -->
    <view v-if="isDev" class="debug-panel">
      <text>开发调试面板 (仅 H5 开发环境显示)</text>
      <text>API: {{ apiUrl }}</text>
    </view>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <button open-type="getUserInfo" @getuserinfo="handleGetUserInfo">
      微信登录
    </button>
    <!-- #endif -->

    <!-- #ifdef APP -->
    <button @click="handleNativeScan">
      原生扫码
    </button>
    <!-- #endif -->
  </view>
</template>

<script lang="ts" setup>
const isDev = import.meta.env.DEV
const apiUrl = import.meta.env.VITE_APP_BASE_API
</script>
```

## 环境变量验证

### 启动时验证

创建环境变量验证工具,确保必需的配置项已正确设置:

```typescript
// utils/env-validator.ts

interface EnvConfig {
  required: string[]
  optional: string[]
}

const envConfig: EnvConfig = {
  required: [
    'VITE_APP_ID',
    'VITE_APP_TITLE',
    'VITE_APP_BASE_API',
  ],
  optional: [
    'VITE_APP_TIMEOUT',
    'VITE_APP_WEBSOCKET',
    'VITE_APP_I18N',
    'VITE_APP_THEME',
  ],
}

export const validateEnv = (): void => {
  const missingVars: string[] = []

  // 检查必需变量
  for (const key of envConfig.required) {
    const value = import.meta.env[key]
    if (!value || value === '') {
      missingVars.push(key)
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ 缺少必需的环境变量:')
    missingVars.forEach((key) => {
      console.error(`  - ${key}`)
    })

    if (import.meta.env.PROD) {
      throw new Error(`缺少必需的环境变量: ${missingVars.join(', ')}`)
    }
  }

  // 检查可选变量(仅开发环境警告)
  if (import.meta.env.DEV) {
    const missingOptional: string[] = []
    for (const key of envConfig.optional) {
      const value = import.meta.env[key]
      if (!value || value === '') {
        missingOptional.push(key)
      }
    }

    if (missingOptional.length > 0) {
      console.warn('⚠️ 以下可选环境变量未配置:')
      missingOptional.forEach((key) => {
        console.warn(`  - ${key}`)
      })
    }
  }

  console.log('✅ 环境变量验证通过')
}

// 打印当前环境信息
export const printEnvInfo = (): void => {
  if (import.meta.env.DEV) {
    console.group('📋 环境配置信息')
    console.log('环境:', import.meta.env.VITE_APP_ENV)
    console.log('应用ID:', import.meta.env.VITE_APP_ID)
    console.log('API地址:', import.meta.env.VITE_APP_BASE_API)
    console.log('加密开关:', import.meta.env.VITE_APP_API_ENCRYPT)
    console.log('WebSocket:', import.meta.env.VITE_APP_WEBSOCKET)
    console.groupEnd()
  }
}
```

### 在应用入口使用

```typescript
// main.ts
import { validateEnv, printEnvInfo } from '@/utils/env-validator'

// 验证环境变量
validateEnv()

// 打印环境信息(仅开发环境)
printEnvInfo()

// 应用初始化...
```

## 环境配置进阶

### 动态环境配置

在某些场景下,需要在运行时动态获取配置:

```typescript
// config/env-config.ts

interface RuntimeConfig {
  apiUrl: string
  wsUrl: string
  timeout: number
  encrypt: boolean
}

class EnvConfigManager {
  private static instance: EnvConfigManager
  private config: RuntimeConfig

  private constructor() {
    this.config = this.loadConfig()
  }

  static getInstance(): EnvConfigManager {
    if (!EnvConfigManager.instance) {
      EnvConfigManager.instance = new EnvConfigManager()
    }
    return EnvConfigManager.instance
  }

  private loadConfig(): RuntimeConfig {
    const baseApi = import.meta.env.VITE_APP_BASE_API

    return {
      apiUrl: baseApi,
      wsUrl: this.buildWsUrl(baseApi),
      timeout: Number(import.meta.env.VITE_APP_TIMEOUT) || 20000,
      encrypt: import.meta.env.VITE_APP_API_ENCRYPT === 'true',
    }
  }

  private buildWsUrl(baseApi: string): string {
    // HTTP -> WS, HTTPS -> WSS
    return baseApi.replace(/^http/, 'ws') + '/websocket'
  }

  get apiUrl(): string {
    return this.config.apiUrl
  }

  get wsUrl(): string {
    return this.config.wsUrl
  }

  get timeout(): number {
    return this.config.timeout
  }

  get encrypt(): boolean {
    return this.config.encrypt
  }

  // 运行时更新配置(用于特殊场景)
  updateApiUrl(url: string): void {
    this.config.apiUrl = url
    this.config.wsUrl = this.buildWsUrl(url)
  }
}

export const envConfig = EnvConfigManager.getInstance()
```

### 环境配置热更新

支持在不重启应用的情况下更新配置(适用于 H5):

```typescript
// utils/config-hot-reload.ts

interface RemoteConfig {
  apiUrl?: string
  features?: {
    websocket?: boolean
    i18n?: boolean
    theme?: boolean
  }
}

export const fetchRemoteConfig = async (): Promise<RemoteConfig | null> => {
  // 仅在 H5 环境支持
  // #ifdef H5
  try {
    const response = await fetch('/config.json')
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn('获取远程配置失败:', error)
  }
  // #endif
  return null
}

export const applyRemoteConfig = async (): Promise<void> => {
  const remoteConfig = await fetchRemoteConfig()
  if (remoteConfig) {
    // 合并远程配置
    if (remoteConfig.apiUrl) {
      envConfig.updateApiUrl(remoteConfig.apiUrl)
    }
    console.log('✅ 远程配置已应用')
  }
}
```

## 安全配置最佳实践

### RSA 密钥管理

#### 密钥生成流程

```bash
# 1. 生成 RSA 私钥 (2048 位)
openssl genrsa -out private.key 2048

# 2. 从私钥生成公钥
openssl rsa -in private.key -pubout -out public.key

# 3. 转换为 PKCS#8 格式 (Java 兼容)
openssl pkcs8 -topk8 -inform PEM -in private.key -outform PEM -nocrypt -out private_pkcs8.key

# 4. 将密钥转为 Base64 单行格式
cat public.key | grep -v "^-" | tr -d '\n' > public_base64.txt
cat private_pkcs8.key | grep -v "^-" | tr -d '\n' > private_base64.txt
```

#### 密钥配置策略

```bash
# .env (公共配置,可提交)
# 只配置不敏感的公钥
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQAD...'

# .env.local (本地配置,不提交)
# 配置私钥,仅开发调试使用
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOwIBAAJBAIrZxEhzVAHKJm7B...'
```

### 敏感信息保护

#### 配置分级

```bash
# 第一级: 公共配置(.env) - 可提交
VITE_APP_ID = 'myapp'
VITE_APP_TITLE = '我的应用'
VITE_APP_VERSION = '1.0.0'

# 第二级: 环境配置(.env.development/.env.production) - 可提交
VITE_APP_BASE_API = 'https://api.example.com'
VITE_APP_TIMEOUT = '20000'

# 第三级: 本地配置(.env.local) - 不提交
VITE_APP_RSA_PRIVATE_KEY = '密钥内容'
VITE_APP_WECHAT_SECRET = '微信密钥'
VITE_APP_ALIPAY_PRIVATE_KEY = '支付宝私钥'
```

#### 环境变量加密存储

```typescript
// 敏感配置加密存储工具
import CryptoJS from 'crypto-js'

const STORAGE_KEY = 'app_config'
const ENCRYPT_KEY = import.meta.env.VITE_APP_ID

export const saveSecureConfig = (config: Record<string, any>): void => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(config),
    ENCRYPT_KEY
  ).toString()
  uni.setStorageSync(STORAGE_KEY, encrypted)
}

export const loadSecureConfig = (): Record<string, any> | null => {
  try {
    const encrypted = uni.getStorageSync(STORAGE_KEY)
    if (!encrypted) return null

    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPT_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decrypted)
  } catch {
    return null
  }
}
```

## 完整项目配置示例

### 标准项目配置

#### 目录结构

```text
my-uniapp/
├── env/
│   ├── .env                    # 公共配置
│   ├── .env.development        # 开发环境
│   ├── .env.test              # 测试环境
│   ├── .env.staging           # 预发布环境
│   └── .env.production        # 生产环境
├── src/
│   ├── config/
│   │   └── env.ts             # 环境配置管理
│   └── utils/
│       └── env-validator.ts   # 环境验证工具
├── types/
│   └── env.d.ts               # 环境变量类型
├── vite.config.ts             # Vite 配置
└── .gitignore                 # Git 忽略
```

#### .env 完整示例

```bash
# =========================================
# 公共配置 - 所有环境共享
# =========================================

# ===== 应用基础信息 =====
VITE_APP_ID = 'myapp_uniapp'
VITE_APP_TITLE = '我的应用'
VITE_APP_VERSION = '1.0.0'
VITE_APP_DESCRIPTION = '基于RuoYi-Plus的移动端应用'

# ===== 安全配置 =====
VITE_APP_API_ENCRYPT = 'true'
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQAD...'

# ===== 功能开关 =====
VITE_APP_WEBSOCKET = 'true'
VITE_APP_I18N = 'true'
VITE_APP_THEME = 'true'
VITE_APP_MOCK = 'false'

# ===== 日志配置 =====
VITE_APP_LOG_LEVEL = 'info'
```

#### .env.development 完整示例

```bash
# =========================================
# 开发环境配置
# =========================================

VITE_APP_ENV = 'development'

# ===== API 配置 =====
VITE_APP_BASE_API = 'http://127.0.0.1:5500'
VITE_APP_TIMEOUT = '30000'

# ===== 构建配置 =====
VITE_DELETE_CONSOLE = 'false'
VITE_SHOW_SOURCEMAP = 'true'
VITE_MINIFY = 'false'

# ===== 调试配置 =====
VITE_APP_LOG_REQUEST = 'true'
VITE_APP_LOG_RESPONSE = 'true'
VITE_APP_LOG_LEVEL = 'debug'

# ===== 开发服务器 =====
VITE_APP_DEV_PORT = '5173'
VITE_APP_DEV_OPEN = 'true'
```

#### .env.production 完整示例

```bash
# =========================================
# 生产环境配置
# =========================================

VITE_APP_ENV = 'production'

# ===== API 配置 =====
VITE_APP_BASE_API = 'https://api.example.com'
VITE_APP_TIMEOUT = '20000'

# ===== 构建配置 =====
VITE_DELETE_CONSOLE = 'true'
VITE_SHOW_SOURCEMAP = 'false'
VITE_MINIFY = 'true'

# ===== 日志配置 =====
VITE_APP_LOG_REQUEST = 'false'
VITE_APP_LOG_RESPONSE = 'false'
VITE_APP_LOG_LEVEL = 'error'

# ===== CDN 配置 =====
VITE_APP_CDN = 'https://cdn.example.com'
VITE_APP_PUBLIC_BASE = '/'

# ===== 监控配置 =====
VITE_APP_SENTRY_DSN = 'https://xxx@sentry.io/xxx'
VITE_APP_PERFORMANCE = 'true'
```

### package.json 脚本配置

```json
{
  "scripts": {
    "dev:h5": "uni",
    "dev:mp-weixin": "uni -p mp-weixin",
    "dev:mp-alipay": "uni -p mp-alipay",
    "dev:app": "uni -p app",

    "build:h5": "uni build",
    "build:mp-weixin": "uni build -p mp-weixin",
    "build:mp-alipay": "uni build -p mp-alipay",
    "build:app": "uni build -p app",

    "build:h5:test": "uni build --mode test",
    "build:h5:staging": "uni build --mode staging",

    "type-check": "vue-tsc --noEmit"
  }
}
```

## 总结

RuoYi-Plus-UniApp 的环境配置系统提供了:

**核心优势:**

1. **多环境支持** - 开发、测试、预发布、生产环境独立配置
2. **配置分层** - 公共配置 + 环境特定配置,避免重复
3. **类型安全** - TypeScript 类型定义,编译时检查
4. **安全可靠** - 敏感信息本地化,密钥管理规范
5. **灵活扩展** - 支持自定义环境和配置项
6. **多平台适配** - 支持 H5、小程序、APP 等多平台差异配置

**使用建议:**

1. 严格遵循 `VITE_` 命名前缀规范
2. 敏感信息使用 `.env.local`,不提交到版本库
3. 公共配置提取到 `.env`,避免重复
4. 生产环境务必使用 HTTPS 和加密传输
5. 文档化所有环境变量,便于团队协作
6. 启动时验证必需的环境变量
7. 使用条件编译处理平台差异

通过合理的环境配置,可以实现多环境无缝切换、配置安全管理、团队协作高效的开发体系。
