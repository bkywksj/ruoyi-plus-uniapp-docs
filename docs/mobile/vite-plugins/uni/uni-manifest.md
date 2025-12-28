# 配置类型插件

## 介绍

配置类型插件（@uni-helper/vite-plugin-uni-manifest）为 UniApp 项目提供 TypeScript 类型化的 `manifest.json` 配置支持。通过使用 `manifest.config.ts` 文件替代传统的 `manifest.json`，开发者可以享受完整的类型提示、智能补全和编译时校验，同时支持使用环境变量动态配置应用信息。

**核心特性：**

- **TypeScript 支持** - 完整的类型定义，提供智能提示和自动补全
- **环境变量支持** - 可在配置中使用 Vite 环境变量
- **多平台配置** - 统一管理 H5、小程序、App 等平台配置
- **编译时校验** - 配置错误在编译时即可发现
- **defineManifestConfig** - 提供类型安全的配置函数

## 基本用法

### 插件注册

在 `vite/plugins/index.ts` 中注册：

```typescript
import UniManifest from '@uni-helper/vite-plugin-uni-manifest'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // UniApp 相关插件
  vitePlugins.push(UniManifest())  // 配置类型插件

  return vitePlugins
}
```

### 创建配置文件

在项目根目录创建 `manifest.config.ts`：

```typescript
// manifest.config.ts
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'
import path from 'node:path'
import { loadEnv } from 'vite'
import process from 'node:process'

// 加载环境变量
const env = loadEnv(process.env.VITE_APP_ENV!, path.resolve(process.cwd(), 'env'))
const { VITE_APP_TITLE, VITE_UNI_APPID } = env

export default defineManifestConfig({
  name: VITE_APP_TITLE,
  appid: VITE_UNI_APPID,
  description: '应用描述',
  versionName: '1.0.0',
  versionCode: '100',
  transformPx: false,
  locale: 'zh-Hans',
  vueVersion: '3',
})
```

## 配置选项

### 基础配置

```typescript
export default defineManifestConfig({
  // 应用名称
  name: '我的应用',

  // 应用标识（UniApp 分配的 AppID）
  appid: '__UNI__XXXXXXX',

  // 应用描述
  description: '这是一个 UniApp 应用',

  // 版本名称（用户可见）
  versionName: '1.0.0',

  // 版本号（内部使用，每次发布递增）
  versionCode: '100',

  // 是否转换 px 为 rpx
  transformPx: false,

  // 默认语言
  locale: 'zh-Hans',

  // Vue 版本
  vueVersion: '3',

  // 编译器版本
  compilerVersion: 3,
})
```

### H5 平台配置

```typescript
export default defineManifestConfig({
  h5: {
    // 路由配置
    router: {
      mode: 'history',  // 'history' | 'hash'
      base: '/',        // 基础路径
    },

    // 页面标题
    title: '我的应用',

    // HTML 模板路径
    template: 'index.html',

    // 开发服务器配置
    devServer: {
      https: false,
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },

    // 异步加载配置
    async: {
      loading: 'AsyncLoading',   // 加载中组件
      error: 'AsyncError',       // 加载失败组件
      delay: 200,                // 延迟显示加载组件
      timeout: 60000,            // 超时时间
    },

    // 优化配置
    optimization: {
      prefetch: true,   // 预取
      preload: true,    // 预加载
      treeShaking: {
        enable: true,   // 摇树优化
      },
    },

    // SDK 配置
    sdkConfigs: {
      maps: {
        qqmap: {
          key: 'YOUR_QQ_MAP_KEY',
        },
      },
    },
  },
})
```

### App 平台配置

```typescript
export default defineManifestConfig({
  'app-plus': {
    // 使用自定义组件模式
    usingComponents: true,

    // nvue 编译器
    nvueStyleCompiler: 'uni-app',

    // 编译器版本
    compilerVersion: 3,

    // 版本兼容
    compatible: {
      ignoreVersion: true,
    },

    // 启动页配置
    splashscreen: {
      alwaysShowBeforeRender: true,
      waiting: true,
      autoclose: true,
      delay: 0,
    },

    // 模块配置
    modules: {
      // OAuth: {},
      // Payment: {},
      // Push: {},
    },

    // 应用发布配置
    distribute: {
      // Android 配置
      android: {
        minSdkVersion: 30,
        targetSdkVersion: 30,
        abiFilters: ['armeabi-v7a', 'arm64-v8a'],
        permissions: [
          '<uses-permission android:name="android.permission.INTERNET"/>',
          '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>',
          '<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>',
          '<uses-permission android:name="android.permission.CAMERA"/>',
          '<uses-permission android:name="android.permission.READ_PHONE_STATE"/>',
          '<uses-permission android:name="android.permission.VIBRATE"/>',
          '<uses-permission android:name="android.permission.FLASHLIGHT"/>',
          '<uses-feature android:name="android.hardware.camera"/>',
          '<uses-feature android:name="android.hardware.camera.autofocus"/>',
        ],
      },

      // iOS 配置
      ios: {
        dSYMs: false,
        capabilities: {
          entitlements: {
            'com.apple.developer.associated-domains': [],
          },
        },
      },

      // SDK 配置
      sdkConfigs: {
        // 第三方 SDK 配置
      },

      // 图标配置
      icons: {
        android: {
          hdpi: 'static/app/icons/72x72.png',
          xhdpi: 'static/app/icons/96x96.png',
          xxhdpi: 'static/app/icons/144x144.png',
          xxxhdpi: 'static/app/icons/192x192.png',
        },
        ios: {
          appstore: 'static/app/icons/1024x1024.png',
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
        },
      },
    },
  },
})
```

### 微信小程序配置

```typescript
export default defineManifestConfig({
  'mp-weixin': {
    // 小程序 AppID
    appid: 'wx1234567890abcdef',

    // 使用自定义组件
    usingComponents: true,

    // 编译设置
    setting: {
      urlCheck: false,              // 是否检查安全域名
      es6: true,                    // 启用 ES6 转 ES5
      enhance: true,                // 增强编译
      postcss: true,                // 启用 postcss
      preloadBackgroundData: false, // 独立分包预加载
      minified: true,               // 代码压缩
      coverView: true,              // CoverView 渲染
      bigPackageSizeSupport: true,  // 分包异步化支持
    },

    // 权限配置
    permission: {
      'scope.userLocation': {
        desc: '您的位置信息将用于位置接口的效果展示',
      },
      'scope.userFuzzyLocation': {
        desc: '您的模糊位置信息将用于推荐附近内容',
      },
    },

    // 按需注入
    lazyCodeLoading: 'requiredComponents',

    // 隐私相关设置
    requiredPrivateInfos: [
      'getLocation',
      'chooseLocation',
      'chooseAddress',
    ],

    // 分包配置
    subPackages: [],

    // 插件配置
    plugins: {},

    // 使用的组件
    useExtendedLib: {
      weui: true,
    },
  },
})
```

### 支付宝小程序配置

```typescript
export default defineManifestConfig({
  'mp-alipay': {
    // 小程序 AppID
    appid: '',

    // 使用自定义组件
    usingComponents: true,

    // 样式隔离
    styleIsolation: 'shared',  // 'shared' | 'isolated'

    // 组件配置
    component2: true,

    // 启用 ES6
    enableAppxNg: true,

    // 其他配置
  },
})
```

### 百度小程序配置

```typescript
export default defineManifestConfig({
  'mp-baidu': {
    appid: '',
    usingComponents: true,

    // 编译设置
    compilation: {
      workers: 1,  // 编译进程数
    },

    // 优化设置
    optimization: {
      subPackages: true,  // 开启分包优化
    },

    // 权限配置
    permission: {},
  },
})
```

### 字节跳动小程序配置

```typescript
export default defineManifestConfig({
  'mp-toutiao': {
    appid: '',
    usingComponents: true,

    // 编译设置
    setting: {
      urlCheck: false,   // 是否检查安全域名
      es6: true,         // 启用 ES6 转 ES5
      postcss: true,     // 启用 postcss
      minified: true,    // 代码压缩
      newFeature: true,  // 启用新特性
    },

    // 权限配置
    permission: {},

    // 分包配置
    subPackages: [],

    // 插件配置
    plugins: {},
  },
})
```

### QQ 小程序配置

```typescript
export default defineManifestConfig({
  'mp-qq': {
    appid: '',
    usingComponents: true,

    // 编译设置
    setting: {
      urlCheck: false,
      es6: true,
      postcss: true,
      minified: true,
      newFeature: true,
    },

    // 权限配置
    permission: {
      'scope.userLocation': {
        desc: '您的位置信息将用于位置接口的效果展示',
      },
    },

    // 分包配置
    subPackages: [],

    // 插件配置
    plugins: {},
  },
})
```

### 其他小程序配置

```typescript
export default defineManifestConfig({
  // 快手小程序
  'mp-kuaishou': {
    usingComponents: true,
    setting: {
      urlCheck: false,
      es6: true,
      postcss: true,
      minified: true,
    },
  },

  // 飞书小程序
  'mp-lark': {
    usingComponents: true,
    setting: {
      urlCheck: false,
      es6: true,
      postcss: true,
      minified: true,
    },
  },

  // 京东小程序
  'mp-jd': {
    usingComponents: true,
  },

  // 360 小程序
  'mp-360': {
    usingComponents: true,
  },

  // 快应用
  quickapp: {},
})
```

### 统计配置

```typescript
export default defineManifestConfig({
  // uni 统计配置
  uniStatistics: {
    enable: false,  // 是否开启 uni 统计
  },
})
```

## 使用环境变量

### 加载环境变量

```typescript
// manifest.config.ts
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'
import path from 'node:path'
import { loadEnv } from 'vite'
import process from 'node:process'

// 获取当前环境
const mode = process.env.VITE_APP_ENV || 'development'

// 加载环境变量
const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))

// 解构需要的变量
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
```

### 动态配置

```typescript
export default defineManifestConfig({
  // 从环境变量读取应用名称
  name: VITE_APP_TITLE,

  // 从环境变量读取 AppID
  appid: VITE_UNI_APPID,

  // H5 路由基础路径
  h5: {
    router: {
      mode: 'history',
      base: VITE_APP_PUBLIC_PATH,
    },
    title: VITE_APP_TITLE,
  },

  // 各平台小程序 AppID
  'mp-weixin': {
    appid: VITE_WECHAT_MINI_APP_ID,
  },

  'mp-alipay': {
    appid: VITE_ALIPAY_MINI_APP_ID,
  },

  'mp-toutiao': {
    appid: VITE_BYTEDANCE_MINI_APP_ID,
  },

  'mp-baidu': {
    appid: VITE_BAIDU_MINI_APP_ID,
  },

  'mp-qq': {
    appid: VITE_QQ_MINI_APP_ID,
  },
})
```

### 环境文件示例

```bash
# env/.env
VITE_APP_TITLE=RuoYi Plus UniApp
VITE_UNI_APPID=__UNI__XXXXXXX
VITE_APP_PUBLIC_PATH=/

# 各平台小程序 AppID
VITE_WECHAT_MINI_APP_ID=wx1234567890abcdef
VITE_ALIPAY_MINI_APP_ID=
VITE_BYTEDANCE_MINI_APP_ID=
VITE_BAIDU_MINI_APP_ID=
VITE_QQ_MINI_APP_ID=
```

## 完整配置示例

```typescript
// manifest.config.ts
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'
import path from 'node:path'
import { loadEnv } from 'vite'
import process from 'node:process'

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
  // ===== 基础配置 =====
  name: VITE_APP_TITLE,
  appid: VITE_UNI_APPID,
  description: 'RuoYi Plus UniApp',
  versionName: '5.5.0',
  versionCode: '100',
  transformPx: false,
  locale: 'zh-Hans',
  vueVersion: '3',
  compilerVersion: 3,

  // ===== H5 配置 =====
  h5: {
    router: {
      mode: 'history',
      base: VITE_APP_PUBLIC_PATH,
    },
    title: VITE_APP_TITLE,
    template: 'index.html',
    devServer: {
      https: false,
    },
  },

  // ===== App 配置 =====
  'app-plus': {
    usingComponents: true,
    nvueStyleCompiler: 'uni-app',
    compilerVersion: 3,
    compatible: {
      ignoreVersion: true,
    },
    splashscreen: {
      alwaysShowBeforeRender: true,
      waiting: true,
      autoclose: true,
      delay: 0,
    },
    modules: {},
    distribute: {
      android: {
        minSdkVersion: 30,
        targetSdkVersion: 30,
        abiFilters: ['armeabi-v7a', 'arm64-v8a'],
        permissions: [
          '<uses-permission android:name="android.permission.INTERNET"/>',
          '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>',
          '<uses-permission android:name="android.permission.CAMERA"/>',
        ],
      },
      ios: {},
      sdkConfigs: {},
      icons: {
        android: {
          hdpi: 'static/app/icons/72x72.png',
          xhdpi: 'static/app/icons/96x96.png',
          xxhdpi: 'static/app/icons/144x144.png',
          xxxhdpi: 'static/app/icons/192x192.png',
        },
        ios: {
          appstore: 'static/app/icons/1024x1024.png',
        },
      },
    },
  },

  // ===== 微信小程序 =====
  'mp-weixin': {
    appid: VITE_WECHAT_MINI_APP_ID,
    setting: {
      urlCheck: false,
      es6: true,
      enhance: true,
      postcss: true,
      preloadBackgroundData: false,
      minified: true,
      coverView: true,
      bigPackageSizeSupport: true,
    },
    usingComponents: true,
    permission: {
      'scope.userLocation': {
        desc: '您的位置信息将用于位置接口的效果展示',
      },
    },
    lazyCodeLoading: 'requiredComponents',
    requiredPrivateInfos: ['getLocation', 'chooseLocation'],
  },

  // ===== 支付宝小程序 =====
  'mp-alipay': {
    appid: VITE_ALIPAY_MINI_APP_ID,
    usingComponents: true,
    styleIsolation: 'shared',
  },

  // ===== 百度小程序 =====
  'mp-baidu': {
    appid: VITE_BAIDU_MINI_APP_ID,
    usingComponents: true,
    compilation: { workers: 1 },
    optimization: { subPackages: true },
  },

  // ===== 字节跳动小程序 =====
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
  },

  // ===== QQ 小程序 =====
  'mp-qq': {
    appid: VITE_QQ_MINI_APP_ID,
    usingComponents: true,
    setting: {
      urlCheck: false,
      es6: true,
      postcss: true,
      minified: true,
    },
  },

  // ===== 统计配置 =====
  uniStatistics: {
    enable: false,
  },
})
```

## 工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                  uni-manifest 工作流程                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 构建启动                                                 │
│       ↓                                                     │
│  2. 读取 manifest.config.ts                                 │
│       ├─ 加载环境变量                                        │
│       └─ 执行 defineManifestConfig                          │
│       ↓                                                     │
│  3. 类型校验                                                 │
│       ├─ 检查必填字段                                        │
│       └─ 验证配置格式                                        │
│       ↓                                                     │
│  4. 生成 manifest.json                                      │
│       ├─ 转换 TS 配置为 JSON                                 │
│       └─ 输出到构建目录                                      │
│       ↓                                                     │
│  5. UniApp 使用配置                                          │
│       ├─ 读取平台相关配置                                    │
│       └─ 应用到编译过程                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## API

### defineManifestConfig

```typescript
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'

// 函数签名
function defineManifestConfig(config: ManifestConfig): ManifestConfig
```

### ManifestConfig 类型

```typescript
interface ManifestConfig {
  // 基础配置
  name?: string
  appid?: string
  description?: string
  versionName?: string
  versionCode?: string
  transformPx?: boolean
  locale?: string
  vueVersion?: '2' | '3'
  compilerVersion?: number

  // 平台配置
  h5?: H5Config
  'app-plus'?: AppPlusConfig
  'mp-weixin'?: MpWeixinConfig
  'mp-alipay'?: MpAlipayConfig
  'mp-baidu'?: MpBaiduConfig
  'mp-toutiao'?: MpToutiaoConfig
  'mp-qq'?: MpQQConfig
  'mp-kuaishou'?: MpKuaishouConfig
  'mp-lark'?: MpLarkConfig
  'mp-jd'?: MpJdConfig
  'mp-360'?: Mp360Config
  quickapp?: QuickappConfig

  // 统计配置
  uniStatistics?: UniStatisticsConfig
}
```

## 最佳实践

### 1. 使用环境变量管理敏感信息

```typescript
// ✅ 推荐：敏感信息放在环境变量中
'mp-weixin': {
  appid: VITE_WECHAT_MINI_APP_ID,  // 从环境变量读取
}

// ❌ 不推荐：硬编码敏感信息
'mp-weixin': {
  appid: 'wx1234567890abcdef',  // 直接写在代码中
}
```

### 2. 按平台组织配置

```typescript
export default defineManifestConfig({
  // 1. 基础配置（所有平台通用）
  name: VITE_APP_TITLE,
  appid: VITE_UNI_APPID,

  // 2. H5 配置
  h5: { /* ... */ },

  // 3. App 配置
  'app-plus': { /* ... */ },

  // 4. 各小程序配置（按使用频率排序）
  'mp-weixin': { /* ... */ },
  'mp-alipay': { /* ... */ },
  'mp-toutiao': { /* ... */ },
})
```

### 3. 版本管理

```typescript
// 版本号管理建议
export default defineManifestConfig({
  // 用户可见版本
  versionName: '1.2.3',

  // 内部版本号（每次发布递增）
  // 建议格式：主版本*10000 + 次版本*100 + 修订版本
  // 如 1.2.3 => 10203
  versionCode: '10203',
})
```

## 常见问题

### 1. 配置不生效

**问题原因：**
- 配置文件名称错误
- 插件未注册

**解决方案：**

```bash
# 确保文件名正确
manifest.config.ts  # ✅
manifest.ts         # ❌

# 确保插件已注册
vitePlugins.push(UniManifest())
```

### 2. 环境变量未加载

**问题原因：**
- loadEnv 路径错误
- 环境变量名称错误

**解决方案：**

```typescript
// 确保路径正确
const env = loadEnv(
  process.env.VITE_APP_ENV!,
  path.resolve(process.cwd(), 'env')  // 环境文件目录
)

// 确保变量以 VITE_ 开头
VITE_APP_TITLE=xxx  # ✅
APP_TITLE=xxx       # ❌
```

### 3. 类型错误

**问题原因：**
- 配置项类型不匹配

**解决方案：**

```typescript
// 确保使用正确的类型
export default defineManifestConfig({
  versionCode: '100',   // ✅ 字符串
  versionCode: 100,     // ❌ 数字

  transformPx: false,   // ✅ 布尔值
  transformPx: 'false', // ❌ 字符串
})
```

### 4. 小程序 AppID 未生效

**问题原因：**
- 环境变量为空
- 配置覆盖问题

**解决方案：**

```typescript
// 添加默认值处理
'mp-weixin': {
  appid: VITE_WECHAT_MINI_APP_ID || '',
}

// 检查环境文件是否正确配置
// env/.env
VITE_WECHAT_MINI_APP_ID=wx1234567890abcdef
```

