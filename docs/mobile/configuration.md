# 移动端配置文件详解

## 介绍

RuoYi-Plus-UniApp 移动端项目采用现代化的配置体系，基于 Vite 构建工具和 uni-app 框架，提供了完整的跨平台开发配置方案。本文档详细介绍项目中所有配置文件的作用、配置项说明及最佳实践。

**核心特性：**

- **多环境配置** - 支持开发、测试、生产等多环境配置，通过 `.env` 文件管理
- **跨平台支持** - 单套代码支持 H5、微信/支付宝/百度等小程序、App 等 10+ 平台
- **类型安全** - 完整的 TypeScript 配置，提供类型检查和智能提示
- **代码规范** - 集成 ESLint + Prettier，确保代码质量和风格统一
- **原子化 CSS** - UnoCSS 配置，支持 uni-app 特有的 rpx 单位和条件编译
- **安全加密** - 内置 RSA 加密配置，保障接口通信安全
- **自动导入** - easycom 自动组件注册，无需手动 import

---

## 技术栈概述

### 核心技术版本

| 技术 | 版本 | 说明 |
|------|------|------|
| uni-app | 3.0.0-4060620250520001 | 跨平台开发框架 |
| Vue | 3.4.21 | 渐进式 JavaScript 框架 |
| TypeScript | 5.7.2 | JavaScript 超集 |
| Vite | 6.3.5 | 下一代前端构建工具 |
| Pinia | 2.0.36 | Vue 状态管理库 |
| UnoCSS | 65.4.2 | 原子化 CSS 引擎 |
| ESLint | 9.29.0 | 代码质量检查工具 |

### 项目信息

```json
{
  "name": "ryplus-uni",
  "version": "2.11.0",
  "description": "ryplus-uni",
  "author": {
    "name": "bkywksj",
    "zhName": "抓蛙师",
    "email": "770492966@qq.com"
  },
  "license": "MIT",
  "homepage": "https://ruoyi.plus"
}
```

### 运行环境要求

```json
{
  "engines": {
    "node": ">=18",
    "pnpm": ">=7.30"
  }
}
```

---

## 支持平台

### 小程序平台 (10+)

| 平台 | 环境变量 | 开发命令 | 构建命令 |
|------|----------|----------|----------|
| 微信小程序 | `VITE_WECHAT_MINI_APP_ID` | `pnpm dev:mp-weixin` | `pnpm build:mp-weixin` |
| 支付宝小程序 | `VITE_ALIPAY_MINI_APP_ID` | `pnpm dev:mp-alipay` | `pnpm build:mp-alipay` |
| 百度小程序 | `VITE_BAIDU_MINI_APP_ID` | `pnpm dev:mp-baidu` | `pnpm build:mp-baidu` |
| 字节跳动小程序 | `VITE_BYTEDANCE_MINI_APP_ID` | `pnpm dev:mp-toutiao` | `pnpm build:mp-toutiao` |
| QQ 小程序 | `VITE_QQ_MINI_APP_ID` | `pnpm dev:mp-qq` | `pnpm build:mp-qq` |
| 快手小程序 | - | `pnpm dev:mp-kuaishou` | `pnpm build:mp-kuaishou` |
| 飞书小程序 | - | `pnpm dev:mp-lark` | `pnpm build:mp-lark` |
| 京东小程序 | - | `pnpm dev:mp-jd` | `pnpm build:mp-jd` |
| 小红书小程序 | - | `pnpm dev:mp-xhs` | `pnpm build:mp-xhs` |
| 鸿蒙小程序 | - | `pnpm dev:mp-harmony` | `pnpm build:mp-harmony` |

### 移动应用平台

| 平台 | 开发命令 | 构建命令 |
|------|----------|----------|
| H5 | `pnpm dev:h5` | `pnpm build:h5` |
| App (通用) | `pnpm dev:app` | `pnpm build:app` |
| App Android | `pnpm dev:app-android` | `pnpm build:app-android` |
| App iOS | `pnpm dev:app-ios` | `pnpm build:app-ios` |
| App 鸿蒙 | `pnpm dev:app-harmony` | `pnpm build:app-harmony` |

### 快应用平台

| 平台 | 开发命令 | 构建命令 |
|------|----------|----------|
| 快应用 (通用) | `pnpm dev:quickapp-webview` | `pnpm build:quickapp-webview` |
| 华为快应用 | `pnpm dev:quickapp-webview-huawei` | `pnpm build:quickapp-webview-huawei` |
| 联盟快应用 | `pnpm dev:quickapp-webview-union` | `pnpm build:quickapp-webview-union` |

---

## 配置文件结构

### 目录结构

```text
plus-uniapp/
├── env/                          # 环境变量目录
│   ├── .env                      # 基础环境变量（所有环境共享）
│   ├── .env.development          # 开发环境变量
│   └── .env.production           # 生产环境变量
├── vite.config.ts                # Vite 构建配置
├── manifest.config.ts            # uni-app 应用清单配置
├── pages.config.ts               # 页面路由配置
├── uno.config.ts                 # UnoCSS 配置
├── eslint.config.mjs             # ESLint 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 项目依赖配置
```

---

## 环境变量配置

### 基础环境配置 (`.env`)

基础环境变量定义了所有环境共享的配置项。

```bash
# ===== 应用基础配置 =====
# 应用唯一标识符，用于区分不同项目，避免键冲突
VITE_APP_ID = 'ryplus_uni_workflow'

# 应用名称，显示在页面标题等位置
VITE_APP_TITLE = 'ryplus-uni'

# uni-app 应用 ID，用于云端服务识别
VITE_UNI_APPID = 'UNI__6E229FA'

# ===== 各平台小程序 APPID 配置 =====
# 微信小程序 APPID（从微信公众平台获取）
VITE_WECHAT_MINI_APP_ID = 'wxd44a6eaefd42428c'

# 微信公众号 APPID（用于公众号相关功能）
VITE_WECHAT_OFFICIAL_APP_ID = 'wx08728cf8ec97725f'

# 支付宝小程序 APPID（从支付宝开放平台获取）
VITE_ALIPAY_MINI_APP_ID = 'your_alipay_app_id'

# 字节跳动小程序 APPID（从字节开放平台获取）
VITE_BYTEDANCE_MINI_APP_ID = 'your_bytedance_app_id'

# 百度小程序 APPID（从百度智能小程序平台获取）
VITE_BAIDU_MINI_APP_ID = 'your_baidu_app_id'

# QQ 小程序 APPID（从 QQ 小程序开放平台获取）
VITE_QQ_MINI_APP_ID = 'your_qq_app_id'

# ===== H5 部署配置 =====
# H5 部署基础路径，如部署到子目录需配置为 '/demo/'
# 注意：前后都需要斜杠
VITE_APP_PUBLIC_PATH = '/'

# ===== 安全配置 =====
# 接口加密功能开关（如需关闭，后端也必须对应关闭）
VITE_APP_API_ENCRYPT = 'true'

# RSA 公钥：用于接口请求数据加密，与后端解密私钥配对
# 如更换需前后端一同更换
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAK9s1Pbnn5W+...'

# RSA 私钥：用于接口响应数据解密，与后端加密公钥配对
# 如更换需前后端一同更换
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOwIBAAJBAIrZxEhzVAHKJm7BJpXIHWGU3sHJYg...'

# ===== 功能开关 =====
# WebSocket 功能开关
VITE_APP_WEBSOCKET = 'false'
```

### 开发环境配置 (`.env.development`)

开发环境专用配置，优先级高于基础配置。

```bash
# 变量必须以 VITE_ 为前缀才能暴露给外部读取
# 环境标识
VITE_APP_ENV='development'

# API 基础路径（开发环境后端地址）
VITE_APP_BASE_API='http://127.0.0.1:5503'

# 开发环境后端端口
VITE_APP_BASE_API_PORT='5503'

# 是否移除 console 和 debugger（开发环境保留便于调试）
VITE_DELETE_CONSOLE=false

# 是否开启 sourcemap（开发环境开启便于调试）
VITE_SHOW_SOURCEMAP=true
```

### 生产环境配置 (`.env.production`)

生产环境专用配置。

```bash
# 环境标识
VITE_APP_ENV='production'

# API 基础路径（生产环境后端地址）
VITE_APP_BASE_API='https://ruoyi.plus/ryplus_uni_workflow'

# 是否移除 console 和 debugger（生产环境移除）
VITE_DELETE_CONSOLE=true

# 是否开启 sourcemap（生产环境关闭）
VITE_SHOW_SOURCEMAP=false
```

### 环境变量使用说明

**命名规范：**

- 所有环境变量必须以 `VITE_` 前缀开头
- 使用大写字母和下划线命名
- 布尔值使用字符串 `'true'` 或 `'false'`

**在代码中使用：**

```typescript
// 通过 import.meta.env 访问环境变量
const baseApi = import.meta.env.VITE_APP_BASE_API
const isEncrypt = import.meta.env.VITE_APP_API_ENCRYPT === 'true'

// 环境判断
if (import.meta.env.VITE_APP_ENV === 'development') {
  console.log('开发环境')
}
```

**优先级规则：**

1. `.env.development` / `.env.production` (环境特定)
2. `.env` (基础配置)
3. 系统环境变量

---

## Vite 构建配置

### vite.config.ts 详解

Vite 配置文件是项目构建的核心，定义了开发服务器、构建优化、插件等配置。

```typescript
import type { ConfigEnv, UserConfig } from 'vite'
import path from 'node:path'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import createVitePlugins from './vite/plugins/index'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  // 命令和模式说明：
  // pnpm dev:h5        => command: 'serve', mode: 'development'
  // pnpm build:h5      => command: 'build', mode: 'production'
  // pnpm dev:mp-weixin => command: 'build', mode: 'development' (注意：小程序开发也是 build)
  console.log('command, mode -> ', command, mode)

  // 获取当前构建平台
  const { UNI_PLATFORM } = process.env
  console.log('UNI_PLATFORM -> ', UNI_PLATFORM) // mp-weixin, h5, app 等

  // 加载环境变量
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))
  const {
    VITE_APP_BASE_API,
    VITE_DELETE_CONSOLE,
    VITE_SHOW_SOURCEMAP,
    VITE_APP_PUBLIC_PATH
  } = env

  return defineConfig({
    // 基础路径配置
    // 如配置为 '/demo/'，访问地址为：https://ruoyi.plus/demo/
    // 需要在 nginx 中配置对应的静态资源映射
    base: VITE_APP_PUBLIC_PATH || '/',

    // 环境变量目录
    envDir: './env',

    // 使用抽离后的插件配置
    plugins: await createVitePlugins({ command, mode, env }),

    // 全局常量定义
    define: {
      __UNI_PLATFORM__: JSON.stringify(UNI_PLATFORM),
    },

    // CSS 配置
    css: {
      postcss: {
        plugins: [
          // 可配置 autoprefixer 等 PostCSS 插件
        ],
      },
    },

    // 路径别名
    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src'),
      },
    },

    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      // 允许访问的域名列表
      allowedHosts: ['.ruoyikj.top'],
      // 热更新
      hmr: true,
      // 端口被占用时自动递增
      strictPort: false,
      // 让 Vite 自己决定打开哪个 URL
      open: true
    },

    // esbuild 配置 - 用于移除 console 和 debugger
    esbuild: {
      drop: VITE_DELETE_CONSOLE === 'true'
        ? ['console', 'debugger']
        : ['debugger'],
    },

    // 依赖预构建优化
    optimizeDeps: {
      include: [
        'jsencrypt/bin/jsencrypt.min.js',  // RSA 加密库
        'crypto-js',                        // 加密工具
      ],
    },

    // 构建配置
    build: {
      // 是否生成 sourcemap
      sourcemap: VITE_SHOW_SOURCEMAP === 'true',
      // 构建目标
      target: 'es6',
      // 压缩方式：开发环境不压缩，生产环境使用 esbuild
      minify: mode === 'development' ? false : 'esbuild',
    },
  })
}
```

### Nginx 部署配置示例

当 `VITE_APP_PUBLIC_PATH` 配置为子目录时，需要相应的 Nginx 配置：

```nginx
server {
    listen 80;
    server_name ruoyi.plus;

    # 子目录部署配置
    location /demo/ {
        alias /www/sites/ruoyi.plus/index/demo/;
        try_files $uri $uri/ /demo/index.html;
    }

    # 根目录部署配置
    location / {
        root /www/sites/ruoyi.plus/index;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 应用清单配置

### manifest.config.ts 详解

应用清单配置定义了 uni-app 应用的基本信息和各平台的特有配置。

```typescript
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'
import path from 'node:path'
import { loadEnv } from 'vite'
import process from 'node:process'

// 获取环境变量
const env = loadEnv(process.env.VITE_APP_ENV!, path.resolve(process.cwd(), 'env'))
const {
  VITE_APP_TITLE,
  VITE_UNI_APPID,
  VITE_APP_PUBLIC_PATH,
  VITE_WECHAT_MINI_APP_ID,
  VITE_ALIPAY_MINI_APP_ID,
  VITE_BYTEDANCE_MINI_APP_ID,
  VITE_BAIDU_MINI_APP_ID,
  VITE_QQ_MINI_APP_ID,
} = env

export default defineManifestConfig({
  // ===== 基础信息 =====
  name: VITE_APP_TITLE,           // 应用名称
  appid: VITE_UNI_APPID,          // uni-app 应用 ID
  description: 'ryplus-uni',       // 应用描述
  versionName: '5.5.0',           // 版本名称（展示用）
  versionCode: '100',             // 版本号（数字，用于版本比较）
  transformPx: false,             // 是否转换 px 单位
  locale: 'zh-Hans',              // 默认语言
  vueVersion: '3',                // Vue 版本
  compilerVersion: 3,             // 编译器版本

  // ===== H5 平台配置 =====
  h5: {
    router: {
      mode: 'history',            // 路由模式：history 或 hash
      base: VITE_APP_PUBLIC_PATH, // 路由基础路径
    },
    title: VITE_APP_TITLE,        // 页面标题
    template: 'index.html',       // HTML 模板
    devServer: {
      https: false,               // 开发服务器 HTTPS
    },
  },

  // ===== App 平台配置 =====
  'app-plus': {
    usingComponents: true,        // 启用自定义组件
    nvueStyleCompiler: 'uni-app', // nvue 样式编译器
    compilerVersion: 3,           // 编译器版本
    compatible: {
      ignoreVersion: true,        // 忽略版本兼容性检查
    },

    // 启动界面配置
    splashscreen: {
      alwaysShowBeforeRender: true,  // 渲染前显示启动界面
      waiting: true,                  // 等待首页渲染完成
      autoclose: true,                // 自动关闭
      delay: 0,                       // 延迟时间（毫秒）
    },

    // 模块配置
    modules: {},

    // 应用发布配置
    distribute: {
      // Android 打包配置
      android: {
        minSdkVersion: 30,            // 最低 SDK 版本
        targetSdkVersion: 30,         // 目标 SDK 版本
        abiFilters: ['armeabi-v7a', 'arm64-v8a'],  // CPU 架构
        permissions: [
          '<uses-permission android:name="android.permission.CAMERA"/>',
          '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>',
          '<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>',
          '<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>',
          '<uses-permission android:name="android.permission.CHANGE_WIFI_STATE"/>',
          '<uses-permission android:name="android.permission.READ_PHONE_STATE"/>',
          '<uses-permission android:name="android.permission.VIBRATE"/>',
          '<uses-permission android:name="android.permission.WAKE_LOCK"/>',
          '<uses-permission android:name="android.permission.FLASHLIGHT"/>',
          '<uses-permission android:name="android.permission.WRITE_SETTINGS"/>',
          '<uses-feature android:name="android.hardware.camera"/>',
          '<uses-feature android:name="android.hardware.camera.autofocus"/>',
        ],
      },

      // iOS 打包配置
      ios: {},

      // SDK 配置
      sdkConfigs: {},

      // 应用图标配置
      icons: {
        android: {
          hdpi: 'static/app/icons/72x72.png',
          xhdpi: 'static/app/icons/96x96.png',
          xxhdpi: 'static/app/icons/144x144.png',
          xxxhdpi: 'static/app/icons/192x192.png',
        },
        ios: {
          appstore: 'static/app/icons/1024x1024.png',
          ipad: {
            app: 'static/app/icons/76x76.png',
            'app@2x': 'static/app/icons/152x152.png',
            notification: 'static/app/icons/20x20.png',
            'notification@2x': 'static/app/icons/40x40.png',
            'proapp@2x': 'static/app/icons/167x167.png',
            settings: 'static/app/icons/29x29.png',
            'settings@2x': 'static/app/icons/58x58.png',
            spotlight: 'static/app/icons/40x40.png',
            'spotlight@2x': 'static/app/icons/80x80.png',
          },
          iphone: {
            'app@2x': 'static/app/icons/120x120.png',
            'app@3x': 'static/app/icons/180x180.png',
            'notification@2x': 'static/app/icons/40x40.png',
            'notification@3x': 'static/app/icons/60x60.png',
            'settings@2x': 'static/app/icons/58x58.png',
            'settings@3x': 'static/app/icons/87x87.png',
            'spotlight@2x': 'static/app/icons/80x80.png',
            'spotlight@3x': 'static/app/icons/120x120.png',
          },
        },
      },
    },
  },

  // ===== 微信小程序配置 =====
  'mp-weixin': {
    appid: VITE_WECHAT_MINI_APP_ID,
    setting: {
      urlCheck: false,            // 不检查安全域名
      es6: true,                  // ES6 转 ES5
      enhance: true,              // 增强编译
      postcss: true,              // 启用 postcss
      preloadBackgroundData: false,  // 分包预下载
      minified: true,             // 代码压缩
      coverView: true,            // CoverView 渲染
      bigPackageSizeSupport: true,   // 分包异步化支持
    },
    usingComponents: true,
    lazyCodeLoading: 'requiredComponents',  // 按需注入
    permission: {
      'scope.userLocation': {
        desc: '您的位置信息将用于小程序位置接口的效果展示'
      }
    },
    requiredPrivateInfos: ['getLocation', 'chooseLocation'],
  },

  // ===== 支付宝小程序配置 =====
  'mp-alipay': {
    appid: VITE_ALIPAY_MINI_APP_ID,
    usingComponents: true,
    styleIsolation: 'shared',     // 样式隔离模式
  },

  // ===== 百度小程序配置 =====
  'mp-baidu': {
    appid: VITE_BAIDU_MINI_APP_ID,
    usingComponents: true,
    compilation: { workers: 1 },
    optimization: { subPackages: true },
    permission: {},
  },

  // ===== 字节跳动小程序配置 =====
  'mp-toutiao': {
    appid: VITE_BYTEDANCE_MINI_APP_ID,
    usingComponents: true,
    setting: {
      urlCheck: false,
      es6: true,
      postcss: true,
      minified: true,
      newFeature: true,
    },
    permission: {},
    subPackages: [],
    plugins: {},
  },

  // ===== QQ 小程序配置 =====
  'mp-qq': {
    appid: VITE_QQ_MINI_APP_ID,
    usingComponents: true,
    setting: {
      urlCheck: false,
      es6: true,
      postcss: true,
      minified: true,
      newFeature: true,
    },
    permission: {
      'scope.userLocation': {
        desc: '您的位置信息将用于小程序位置接口的效果展示'
      }
    },
    subPackages: [],
    plugins: {},
  },

  // ===== 快手小程序配置 =====
  'mp-kuaishou': {
    usingComponents: true,
    setting: {
      urlCheck: false,
      es6: true,
      postcss: true,
      minified: true,
    },
  },

  // ===== 飞书小程序配置 =====
  'mp-lark': {
    usingComponents: true,
    setting: {
      urlCheck: false,
      es6: true,
      postcss: true,
      minified: true,
    },
  },

  // ===== 京东小程序配置 =====
  'mp-jd': {
    usingComponents: true,
  },

  // ===== 360 小程序配置 =====
  'mp-360': {
    usingComponents: true,
  },

  // ===== 快应用配置 =====
  quickapp: {},

  // ===== 统计配置 =====
  uniStatistics: {
    enable: false,                // 是否开启 uni 统计
  },
})
```

### 图标尺寸要求

**Android 图标尺寸：**

| DPI | 尺寸 | 说明 |
|-----|------|------|
| hdpi | 72x72 | 高密度屏幕 |
| xhdpi | 96x96 | 超高密度屏幕 |
| xxhdpi | 144x144 | 超超高密度屏幕 |
| xxxhdpi | 192x192 | 超超超高密度屏幕 |

**iOS 图标尺寸：**

| 类型 | 尺寸 | 说明 |
|------|------|------|
| appstore | 1024x1024 | App Store 图标 |
| iphone app@2x | 120x120 | iPhone 应用图标 @2x |
| iphone app@3x | 180x180 | iPhone 应用图标 @3x |
| ipad app | 76x76 | iPad 应用图标 |
| ipad app@2x | 152x152 | iPad 应用图标 @2x |

---

## 页面路由配置

### pages.config.ts 详解

页面路由配置定义了全局页面样式和组件自动导入规则。

```typescript
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  // ===== 全局页面样式配置 =====
  globalStyle: {
    // 默认导航栏标题
    navigationBarTitleText: 'ryplus-uni',

    // 导航栏样式：'default' 默认 | 'custom' 自定义
    navigationStyle: 'custom',

    // 支付宝小程序特殊配置
    'mp-alipay': {
      'transparentTitle': 'always',   // 透明标题栏
      'titlePenetrate': 'YES'         // 标题栏点击穿透
    },

    // H5 端配置
    'h5': {
      'titleNView': false             // 不显示原生标题栏
    },

    // App 端配置
    'app-plus': {
      'bounce': 'none',               // 禁用页面弹性效果（防抖动）
    },
  },

  // ===== 组件自动导入配置 =====
  easycom: {
    // 自动扫描 components 目录
    autoscan: true,

    // 自定义组件映射规则
    custom: {
      // WD UI 组件库自动导入
      // 使用 <wd-button> 时自动导入对应组件
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue'
    }
  }
})
```

### easycom 规则说明

easycom 是 uni-app 提供的组件自动注册机制，无需手动 import 即可使用组件。

**规则语法：**

```typescript
{
  // 正则表达式: 组件路径
  '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue'
}
```

**匹配示例：**

| 组件标签 | 匹配结果 | 实际路径 |
|----------|----------|----------|
| `<wd-button>` | `$1 = button` | `@/wd/components/wd-button/wd-button.vue` |
| `<wd-icon>` | `$1 = icon` | `@/wd/components/wd-icon/wd-icon.vue` |
| `<wd-popup>` | `$1 = popup` | `@/wd/components/wd-popup/wd-popup.vue` |

---

## TypeScript 配置

### tsconfig.json 详解

TypeScript 配置定义了编译选项和类型检查规则。

```json
{
  "compilerOptions": {
    // 编译目标（ES2015 兼容小程序）
    "target": "ES2015",

    // 复合项目模式
    "composite": true,

    // 包含的库
    "lib": ["esnext", "dom"],

    // 基础目录
    "baseUrl": ".",

    // 模块系统
    "module": "ESNext",

    // 模块解析策略
    "moduleResolution": "Node",

    // 路径别名
    "paths": {
      "@/*": ["./src/*"],
      "@img/*": ["./src/static/*"]
    },

    // 允许解析 JSON 模块
    "resolveJsonModule": true,

    // 类型声明文件
    "types": [
      "@dcloudio/types",              // uni-app 核心类型
      "@uni-helper/uni-types",        // uni-helper 类型增强
      "@types/wechat-miniprogram",    // 微信小程序类型
      "wot-design-uni/global.d.ts",   // WD UI 组件类型
      "z-paging/types",               // z-paging 分页组件类型
      "./src/typings.d.ts"            // 自定义类型定义
    ],

    // 允许 JS 文件
    "allowJs": true,

    // 禁止隐式 this
    "noImplicitThis": true,

    // 输出目录
    "outDir": "dist",

    // 生成 sourcemap
    "sourceMap": true,

    // 允许合成默认导入
    "allowSyntheticDefaultImports": true,

    // 跳过库文件类型检查
    "skipLibCheck": true
  },

  // Vue 编译器选项
  "vueCompilerOptions": {
    "plugins": [
      "@uni-helper/uni-types/volar-plugin"  // uni-app 类型增强插件
    ]
  },

  // 包含的文件
  "include": [
    "src/**/*.ts",
    "src/**/*.js",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.jsx",
    "src/**/*.vue",
    "src/**/*.json"
  ],

  // 排除的文件
  "exclude": ["node_modules"]
}
```

### 路径别名使用

```typescript
// 使用 @ 别名导入
import { useUserStore } from '@/stores/user'
import Button from '@/components/Button.vue'

// 使用 @img 别名导入静态资源
import logo from '@img/logo.png'
```

---

## UnoCSS 配置

### uno.config.ts 详解

UnoCSS 是原子化 CSS 引擎，为 uni-app 提供了特别优化的配置。

```typescript
import { presetUni } from '@uni-helper/unocss-preset-uni'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  // ===== 预设配置 =====
  presets: [
    // uni-app 专用预设
    presetUni({
      attributify: {
        prefixedOnly: true,   // 只支持前缀属性化
      },
    }),

    // 图标预设
    presetIcons({
      scale: 1.2,             // 图标缩放
      warn: true,             // 警告提示
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),

    // 属性化预设
    presetAttributify(),
  ],

  // ===== 转换器配置 =====
  transformers: [
    // @apply 等指令支持
    transformerDirectives(),

    // 变体组支持
    // 示例: hover:(bg-gray-400 font-medium)
    transformerVariantGroup(),
  ],

  // ===== 快捷方式 =====
  shortcuts: [
    {
      // flex 居中
      center: 'flex justify-center items-center',
    },
  ],

  // ===== 安全列表 =====
  safelist: [],

  // ===== 自定义规则 =====
  rules: [
    // 安全区域内边距
    ['p-safe', {
      padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    }],
    ['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
  ],

  // ===== 主题配置 =====
  theme: {
    colors: {
      // 主题色，使用 CSS 变量支持动态切换
      primary: 'var(--wot-color-theme,#0957DE)',
    },
    fontSize: {
      // 超小号字体（rpx 单位）
      '2xs': ['20rpx', '28rpx'],
      '3xs': ['18rpx', '26rpx'],
    },
  },
})
```

### UnoCSS 使用示例

```vue
<template>
  <!-- 基础类名 -->
  <view class="flex items-center justify-between p-4 bg-white">
    <text class="text-primary text-lg font-bold">标题</text>
    <wd-button class="ml-2">按钮</wd-button>
  </view>

  <!-- 变体组语法 -->
  <view class="hover:(bg-gray-100 text-primary) active:(scale-95)">
    悬停效果
  </view>

  <!-- 安全区域适配 -->
  <view class="pb-safe">
    底部安全区域
  </view>

  <!-- 属性化写法 -->
  <view flex="~ col" p="4" bg="white">
    属性化样式
  </view>
</template>

<style lang="scss" scoped>
.custom-class {
  /* 使用 @apply 指令 */
  @apply flex items-center p-4;
}
</style>
```

---

## ESLint 配置

### eslint.config.mjs 详解

ESLint 配置基于 `@uni-helper/eslint-config`，专门为 uni-app 项目优化。

```javascript
import uniHelper from '@uni-helper/eslint-config'

export default uniHelper({
  // ===== 功能开关配置 =====

  // 启用 UnoCSS 支持
  unocss: true,

  // 启用 Vue 3 支持
  vue: true,

  // 禁用 Markdown 检查
  markdown: false,

  // ===== 忽略文件配置 =====
  ignores: [
    'src/uni_modules/',       // uni-app 插件目录
    'dist',                    // 构建输出
    'auto-imports.d.ts',       // 自动导入类型
    'uni-pages.d.ts',          // 页面类型
    'src/pages.json',          // 页面配置
    'src/manifest.json',       // 应用配置
  ],

  // ===== 自定义规则配置 =====
  rules: {
    // 允许 console（开发调试需要）
    'no-console': 'off',

    // 关闭未使用变量检查
    'no-unused-vars': 'off',

    // 允许未使用的 ref
    'vue/no-unused-refs': 'off',

    // 关闭 unused-imports 检查
    'unused-imports/no-unused-vars': 'off',

    // 允许无限制 eslint-disable
    'eslint-comments/no-unlimited-disable': 'off',

    // JSDoc 规则
    'jsdoc/check-param-names': 'off',
    'jsdoc/require-returns-description': 'off',

    // TypeScript 规则
    'ts/no-empty-object-type': 'off',

    // Vue 规则
    'vue/block-order': 'off',
    'vue/define-macros-order': 'off',
    'vue/operator-linebreak': 'off',
    'vue/html-indent': 'off',
    'vue/singleline-html-element-content-newline': 'off',

    // 代码风格规则
    'func-style': 'off',
    'antfu/top-level-function': 'off',
    'antfu/if-newline': 'off',
    'style/brace-style': 'off',
    'style/quote-props': 'off',
    'style/operator-linebreak': 'off',
    'style/arrow-parens': 'off',
    'style/indent-binary-ops': 'off',
    'style/indent': 'off',
    'style/member-delimiter-style': 'off',
    'style/comma-dangle': 'off',

    // 其他规则
    'no-extend-native': 'off',
    'format/prettier': 'off',
    'perfectionist/sort-named-imports': 'off',
    'perfectionist/sort-imports': 'off',
  },

  // ===== 格式化配置 =====
  formatters: {
    css: true,    // CSS 格式化
    html: true,   // HTML 格式化
  },
})
```

### ESLint 命令

```bash
# 检查代码
pnpm lint

# 自动修复
pnpm lint:fix
```

---

## 开发命令详解

### package.json scripts

```json
{
  "scripts": {
    // ===== 开发命令 =====
    "dev:h5": "uni",                          // H5 开发
    "dev:mp-weixin": "uni -p mp-weixin",      // 微信小程序开发
    "dev:mp-alipay": "uni -p mp-alipay",      // 支付宝小程序开发
    "dev:mp-baidu": "uni -p mp-baidu",        // 百度小程序开发
    "dev:mp-qq": "uni -p mp-qq",              // QQ 小程序开发
    "dev:mp-toutiao": "uni -p mp-toutiao",    // 字节跳动小程序开发
    "dev:mp-jd": "uni -p mp-jd",              // 京东小程序开发
    "dev:mp-kuaishou": "uni -p mp-kuaishou",  // 快手小程序开发
    "dev:mp-lark": "uni -p mp-lark",          // 飞书小程序开发
    "dev:mp-xhs": "uni -p mp-xhs",            // 小红书小程序开发
    "dev:mp-harmony": "uni -p mp-harmony",    // 鸿蒙小程序开发
    "dev:app": "uni -p app",                  // App 开发
    "dev:app-android": "uni -p app-android",  // Android App 开发
    "dev:app-ios": "uni -p app-ios",          // iOS App 开发
    "dev:app-harmony": "uni -p app-harmony",  // 鸿蒙 App 开发

    // ===== 构建命令 =====
    "build:h5": "uni build",
    "build:mp-weixin": "uni build -p mp-weixin",
    "build:mp-alipay": "uni build -p mp-alipay",
    // ... 其他平台类似

    // ===== 工具命令 =====
    "type-check": "vue-tsc --noEmit",         // 类型检查
    "lint": "eslint --max-warnings=0 --timeout=60000",  // 代码检查
    "lint:fix": "eslint --fix --timeout=60000",         // 代码修复
    "preinstall": "npx only-allow pnpm",      // 强制使用 pnpm
    "uvm": "npx @dcloudio/uvm@latest",        // 升级 uni-app
    "uvm-rm": "node ./scripts/postupgrade.js" // 升级后清理
  }
}
```

### 命令说明

**开发与构建的区别：**

| 场景 | command | mode | 说明 |
|------|---------|------|------|
| `dev:h5` | serve | development | H5 开发服务器 |
| `build:h5` | build | production | H5 生产构建 |
| `dev:mp-weixin` | build | development | 小程序开发构建 |
| `build:mp-weixin` | build | production | 小程序生产构建 |

**注意：** 小程序开发命令 (`dev:mp-*`) 的 command 是 `build` 而非 `serve`，因为小程序需要构建后在开发者工具中运行。

---

## 平台差异处理

### 条件编译语法

uni-app 提供条件编译语法，用于处理不同平台的差异。

**模板条件编译：**

```vue
<template>
  <!-- 仅微信小程序显示 -->
  <!-- #ifdef MP-WEIXIN -->
  <view>微信小程序专属内容</view>
  <!-- #endif -->

  <!-- 仅 H5 显示 -->
  <!-- #ifdef H5 -->
  <view>H5 专属内容</view>
  <!-- #endif -->

  <!-- 除 App 外都显示 -->
  <!-- #ifndef APP-PLUS -->
  <view>非 App 内容</view>
  <!-- #endif -->

  <!-- 多平台条件 -->
  <!-- #ifdef MP-WEIXIN || MP-ALIPAY -->
  <view>小程序共用内容</view>
  <!-- #endif -->
</template>
```

**脚本条件编译：**

```typescript
// #ifdef MP-WEIXIN
import weixinAPI from '@/utils/weixin'
const isWeixin = true
// #endif

// #ifdef H5
import h5API from '@/utils/h5'
const isH5 = true
// #endif

// #ifdef APP-PLUS
import appAPI from '@/utils/app'
const isApp = true
// #endif

export function getPlatformInfo() {
  // #ifdef MP-WEIXIN
  return { platform: 'weixin', ...uni.getSystemInfoSync() }
  // #endif

  // #ifdef H5
  return { platform: 'h5', userAgent: navigator.userAgent }
  // #endif

  // #ifdef APP-PLUS
  return { platform: 'app', ...plus.device }
  // #endif
}
```

**样式条件编译：**

```scss
/* #ifdef MP-WEIXIN */
.weixin-only {
  color: #07c160;
}
/* #endif */

/* #ifdef H5 */
.h5-only {
  color: #1890ff;
}
/* #endif */

/* #ifndef APP-PLUS */
.not-app {
  display: block;
}
/* #endif */
```

### 平台标识符

| 平台 | 标识符 |
|------|--------|
| H5 | `H5` |
| App | `APP-PLUS` |
| App Android | `APP-ANDROID` |
| App iOS | `APP-IOS` |
| 微信小程序 | `MP-WEIXIN` |
| 支付宝小程序 | `MP-ALIPAY` |
| 百度小程序 | `MP-BAIDU` |
| 字节跳动小程序 | `MP-TOUTIAO` |
| QQ 小程序 | `MP-QQ` |
| 快手小程序 | `MP-KUAISHOU` |
| 飞书小程序 | `MP-LARK` |
| 京东小程序 | `MP-JD` |
| 小红书小程序 | `MP-XHS` |

---

## 安全配置

### RSA 加密配置

项目内置 RSA 加密机制，保障接口通信安全。

**配置说明：**

```bash
# .env 文件
# 接口加密开关
VITE_APP_API_ENCRYPT = 'true'

# RSA 公钥（用于加密请求数据）
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQAD...'

# RSA 私钥（用于解密响应数据）
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOwIBAAJBAIrZxEhzVAHKJ...'
```

**密钥对说明：**

| 密钥 | 用途 | 配对关系 |
|------|------|----------|
| 前端公钥 | 加密请求数据 | 与后端私钥配对 |
| 前端私钥 | 解密响应数据 | 与后端公钥配对 |

**使用示例：**

```typescript
import JSEncrypt from 'jsencrypt'

// 加密请求数据
export function encryptData(data: string): string {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(import.meta.env.VITE_APP_RSA_PUBLIC_KEY)
  return encrypt.encrypt(data) || ''
}

// 解密响应数据
export function decryptData(data: string): string {
  const decrypt = new JSEncrypt()
  decrypt.setPrivateKey(import.meta.env.VITE_APP_RSA_PRIVATE_KEY)
  return decrypt.decrypt(data) || ''
}
```

**注意事项：**

1. 前后端密钥必须配对使用
2. 更换密钥时需前后端同步更新
3. 生产环境务必使用强密钥
4. 私钥不要泄露到公开仓库

---

## 调试技巧

### 小程序调试

```bash
# 1. 启动开发构建
pnpm dev:mp-weixin

# 2. 打开微信开发者工具
# 导入项目：dist/dev/mp-weixin

# 3. 开启调试功能
# - 打开调试器面板
# - 使用 Console 查看日志
# - 使用 Sources 断点调试
# - 使用 Network 查看网络请求
```

**各平台开发者工具：**

| 平台 | 工具 | 导入目录 |
|------|------|----------|
| 微信 | 微信开发者工具 | `dist/dev/mp-weixin` |
| 支付宝 | 支付宝小程序开发者工具 | `dist/dev/mp-alipay` |
| 百度 | 百度开发者工具 | `dist/dev/mp-baidu` |
| 字节 | 字节跳动开发者工具 | `dist/dev/mp-toutiao` |
| QQ | QQ 小程序开发者工具 | `dist/dev/mp-qq` |

### H5 调试

```bash
# 启动开发服务器
pnpm dev:h5

# 浏览器访问（端口自动分配）
# 使用 Chrome DevTools 调试
# - Elements: 查看 DOM
# - Console: 查看日志
# - Network: 查看网络
# - Sources: 断点调试
```

### App 调试

```bash
# 启动 App 开发
pnpm dev:app

# 使用 HBuilderX 运行
# 1. 打开 HBuilderX
# 2. 导入 dist/dev/app 目录
# 3. 运行 -> 运行到手机或模拟器

# 真机调试
# 1. 手机开启开发者模式
# 2. 连接 USB 数据线
# 3. 在 HBuilderX 中选择设备运行
```

---

## 发布部署

### 小程序发布流程

```bash
# 1. 构建生产版本
pnpm build:mp-weixin

# 2. 上传代码
# 打开微信开发者工具
# 导入 dist/build/mp-weixin
# 点击"上传"按钮

# 3. 提交审核
# 登录微信公众平台
# 版本管理 -> 提交审核

# 4. 发布上线
# 审核通过后点击"发布"
```

### H5 部署流程

```bash
# 1. 构建生产版本
pnpm build:h5

# 2. 部署到服务器
# 将 dist/build/h5 目录内容上传到服务器

# 3. Nginx 配置示例
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /www/your-app;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass https://api.your-domain.com/;
    }
}
```

### App 发布流程

```bash
# 1. 构建生产版本
pnpm build:app

# 2. 使用 HBuilderX 云打包
# - 打开 HBuilderX
# - 发行 -> 原生 App-云打包
# - 配置证书和签名
# - 等待打包完成

# 3. 提交应用商店
# Android: 提交到各应用市场
# iOS: 提交到 App Store Connect
```

---

## 最佳实践

### 1. 环境变量管理

```bash
# 推荐做法：敏感信息不提交到仓库
# .gitignore 中添加
env/.env.local
env/.env.*.local

# 在 CI/CD 中注入环境变量
# GitHub Actions 示例
env:
  VITE_APP_BASE_API: ${{ secrets.API_URL }}
```

### 2. 分包配置优化

```typescript
// pages.config.ts
export default defineUniPages({
  // 主包页面（控制在 2MB 以内）
  pages: [
    { path: 'pages/index/index' },
    { path: 'pages/user/index' },
  ],

  // 分包配置
  subPackages: [
    {
      root: 'pages-sub',
      pages: [
        { path: 'order/list' },
        { path: 'order/detail' },
      ],
    },
  ],

  // 分包预下载
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['pages-sub'],
    },
  },
})
```

### 3. 性能优化配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 分包策略
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia'],
          'crypto': ['crypto-js', 'jsencrypt'],
        },
      },
    },

    // 压缩配置
    minify: 'esbuild',

    // 去除调试代码
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },

  // 依赖预构建
  optimizeDeps: {
    include: ['vue', 'pinia', 'crypto-js'],
  },
})
```

### 4. 多环境配置

```bash
# 创建测试环境配置
# env/.env.test
VITE_APP_ENV='test'
VITE_APP_BASE_API='https://test-api.example.com'

# package.json 添加命令
{
  "scripts": {
    "build:h5:test": "uni build --mode test",
    "build:mp-weixin:test": "uni build -p mp-weixin --mode test"
  }
}
```

---

## 常见问题

### 1. 环境变量不生效

**问题原因：**
- 变量名未以 `VITE_` 开头
- 修改后未重启开发服务器
- 环境变量文件位置错误

**解决方案：**

```bash
# 确保变量名正确
VITE_APP_NAME = 'app'  # ✅ 正确
APP_NAME = 'app'       # ❌ 不会暴露

# 确保文件在 env 目录下
env/.env
env/.env.development
env/.env.production

# 修改后重启服务
pnpm dev:h5
```

### 2. 小程序包体积过大

**问题原因：**
- 未开启分包
- 静态资源过大
- 引入了不必要的依赖

**解决方案：**

```typescript
// 1. 开启分包
// pages.config.ts
subPackages: [
  { root: 'pages-sub', pages: [...] }
]

// 2. 压缩静态资源
// 使用 tinypng 等工具压缩图片

// 3. 按需引入依赖
// 使用 tree-shaking 友好的库
```

### 3. 跨平台样式差异

**问题原因：**
- 不同平台渲染引擎差异
- CSS 属性兼容性问题

**解决方案：**

```scss
// 使用条件编译处理差异
/* #ifdef MP-WEIXIN */
.container {
  padding-top: 44px; /* 微信小程序状态栏 */
}
/* #endif */

/* #ifdef H5 */
.container {
  padding-top: 0;
}
/* #endif */

// 使用安全区域
.footer {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 4. TypeScript 类型报错

**问题原因：**
- 缺少类型声明文件
- tsconfig.json 配置不完整

**解决方案：**

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": [
      "@dcloudio/types",
      "@uni-helper/uni-types",
      "@types/wechat-miniprogram",
      "wot-design-uni/global.d.ts"
    ]
  },
  "vueCompilerOptions": {
    "plugins": ["@uni-helper/uni-types/volar-plugin"]
  }
}
```

### 5. 热更新不生效

**问题原因：**
- 小程序不支持完整 HMR
- 文件监听失败

**解决方案：**

```typescript
// vite.config.ts
server: {
  hmr: true,
  watch: {
    // 使用轮询模式（Windows 环境）
    usePolling: true,
  },
}
```

---

## 总结

本文档详细介绍了 RuoYi-Plus-UniApp 移动端项目的完整配置体系，包括：

1. **环境变量配置** - 多环境管理、安全配置
2. **Vite 构建配置** - 开发服务器、构建优化
3. **应用清单配置** - 多平台支持、权限配置
4. **页面路由配置** - 全局样式、easycom 规则
5. **TypeScript 配置** - 类型检查、路径别名
6. **UnoCSS 配置** - 原子化 CSS、主题定制
7. **ESLint 配置** - 代码规范、自定义规则

通过合理配置这些文件，可以实现：

- 一套代码多端运行
- 高效的开发体验
- 安全的接口通信
- 规范的代码质量
- 优化的构建产物
