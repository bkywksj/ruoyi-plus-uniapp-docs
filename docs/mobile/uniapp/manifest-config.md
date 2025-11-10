# 项目配置 (manifest.json)

## 概述

`manifest.json` 是 uni-app 应用的配置清单文件，用于指定应用的名称、图标、权限等基本信息。本项目使用 `manifest.config.ts` 以 TypeScript 的方式管理配置，由 `@uni-helper/vite-plugin-uni-manifest` 插件自动生成 `manifest.json`。

## 配置文件位置

- **源配置文件**：`manifest.config.ts`（根目录）
- **生成文件**：`src/manifest.json`（自动生成，不要手动修改）

## 基础配置

### 应用信息

```typescript
{
  name: 'ryplus-uni',           // 应用名称
  appid: 'UNI__6E229FA',        // uni-app应用ID
  description: 'ryplus-uni',    // 应用描述
  versionName: '5.5.0',         // 版本名称（显示给用户）
  versionCode: '100',           // 版本号（数字，用于版本比较）
  transformPx: false,           // 是否转换px单位为rpx
  locale: 'zh-Hans',            // 默认语言
  vueVersion: '3',              // Vue版本
  compilerVersion: 3            // 编译器版本
}
```

**配置说明**：

- `name`: 应用名称，显示在启动页、关于等页面
- `appid`: uni-app应用唯一标识，从 DCloud 开发者中心获取
- `versionName`: 语义化版本号，如 "5.5.0"
- `versionCode`: 纯数字版本号，用于版本升级判断
- `transformPx`: 设为 false，统一使用 rpx
- `locale`: 默认语言，可选值：zh-Hans（简体中文）、en（英文）

## H5 配置

### 基础配置

```typescript
h5: {
  router: {
    mode: 'history',            // 路由模式: hash | history
    base: '/'                   // 应用基础路径
  },
  title: 'ryplus-uni',          // 页面标题
  template: 'index.html',       // HTML模板路径
  devServer: {
    https: false                // 开发服务器是否使用HTTPS
  }
}
```

**配置说明**：

- `router.mode`:
  - `hash`: URL 带 `#` 号，兼容性好
  - `history`: 干净的 URL，需要服务器配置
- `router.base`: 部署到子目录时配置，如 `/app/`
- `title`: 默认页面标题，可被页面配置覆盖

### 部署到子目录

如果 H5 部署到服务器子目录（如 `https://example.com/app/`），需要配置：

```bash
# .env
VITE_APP_PUBLIC_PATH = '/app/'
```

```typescript
// manifest.config.ts
h5: {
  router: {
    base: VITE_APP_PUBLIC_PATH  // '/app/'
  }
}
```

## App 配置

### App-Plus 基础配置

```typescript
'app-plus': {
  usingComponents: true,         // 启用自定义组件模式
  nvueStyleCompiler: 'uni-app',  // nvue样式编译器
  compilerVersion: 3,            // 编译器版本

  // 兼容性配置
  compatible: {
    ignoreVersion: true          // 忽略编译器版本检查
  },

  // 启动界面配置
  splashscreen: {
    alwaysShowBeforeRender: true, // 首页渲染前总是显示
    waiting: true,                // 等待首页渲染完成
    autoclose: true,              // 自动关闭
    delay: 0                      // 延迟时间(ms)
  }
}
```

### Android 配置

```typescript
android: {
  minSdkVersion: 30,              // 最低SDK版本
  targetSdkVersion: 30,           // 目标SDK版本
  abiFilters: [                   // CPU架构过滤
    'armeabi-v7a',                // ARM 32位
    'arm64-v8a'                   // ARM 64位
  ],
  permissions: [                  // 权限列表
    '<uses-permission android:name="android.permission.CAMERA"/>',
    '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>',
    '<uses-permission android:name="android.permission.INTERNET"/>',
    // ... 更多权限
  ]
}
```

**常用权限**：

| 权限 | 说明 |
|------|------|
| `CAMERA` | 相机权限 |
| `ACCESS_NETWORK_STATE` | 访问网络状态 |
| `INTERNET` | 网络访问 |
| `READ_PHONE_STATE` | 读取手机状态 |
| `WRITE_EXTERNAL_STORAGE` | 写入外部存储 |
| `ACCESS_FINE_LOCATION` | 精确定位 |
| `VIBRATE` | 震动 |

### iOS 配置

```typescript
ios: {
  // 暂无特殊配置
}
```

iOS 配置通常在 HBuilderX 云打包时设置，包括：
- 证书和描述文件
- Bundle ID
- 隐私权限说明

### 应用图标配置

```typescript
icons: {
  android: {
    hdpi: 'static/app/icons/72x72.png',      // 72x72
    xhdpi: 'static/app/icons/96x96.png',     // 96x96
    xxhdpi: 'static/app/icons/144x144.png',  // 144x144
    xxxhdpi: 'static/app/icons/192x192.png'  // 192x192
  },
  ios: {
    appstore: 'static/app/icons/1024x1024.png',  // App Store图标
    iphone: {
      'app@2x': 'static/app/icons/120x120.png',   // iPhone 120x120
      'app@3x': 'static/app/icons/180x180.png',   // iPhone 180x180
      // ... 更多尺寸
    },
    ipad: {
      'app': 'static/app/icons/76x76.png',        // iPad 76x76
      'app@2x': 'static/app/icons/152x152.png',   // iPad 152x152
      // ... 更多尺寸
    }
  }
}
```

**图标尺寸要求**：

**Android**：
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

**iOS**：
- App Store: 1024x1024
- iPhone 2x: 120x120
- iPhone 3x: 180x180
- iPad: 76x76
- iPad 2x: 152x152

## 小程序配置

### 微信小程序

```typescript
'mp-weixin': {
  appid: 'wxd44a6eaefd42428c',  // 微信小程序AppID

  // 编译设置
  setting: {
    urlCheck: false,             // 不检查安全域名（开发时）
    es6: true,                   // ES6转ES5
    enhance: true,               // 增强编译
    postcss: true,               // PostCSS编译
    minified: true,              // 代码压缩
    coverView: true,             // 工具渲染CoverView
    bigPackageSizeSupport: true  // 支持分包异步化
  },

  usingComponents: true,         // 自定义组件模式

  // 按需注入
  lazyCodeLoading: 'requiredComponents',

  // 权限配置
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于小程序位置接口的效果展示'
    }
  },

  // 隐私相关设置
  requiredPrivateInfos: [
    'getLocation',               // 获取位置
    'chooseLocation'             // 选择位置
  ]
}
```

**配置说明**：

- `appid`: 从微信公众平台获取
- `urlCheck`:
  - 开发环境设为 `false`，方便调试
  - 生产环境建议设为 `true`
- `bigPackageSizeSupport`: 支持分包异步化，提升大型小程序性能
- `lazyCodeLoading`: 按需注入，减少启动时注入的代码量

**获取 AppID**：
1. 登录微信公众平台：https://mp.weixin.qq.com/
2. 开发 -> 开发管理 -> 开发设置
3. 复制 AppID

### 支付宝小程序

```json
{
  "mp-alipay": {
    "usingComponents": true,
    "appid": "your_alipay_app_id",
    "styleIsolation": "shared"
  }
}
```

**配置说明**：

- `appid`: 支付宝小程序 AppID，从支付宝开放平台获取
- `usingComponents`: 启用自定义组件模式，必须为 `true`
- `styleIsolation`: 样式隔离配置
  - `shared`: 页面共享样式（默认）
  - `apply-shared`: 启用 app.acss 的全局样式
  - `isolated`: 完全隔离

**获取 AppID**：
1. 登录支付宝开放平台：https://open.alipay.com/
2. 开发者中心 -> 网页&移动应用 -> 小程序
3. 创建小程序后获取 AppID

**开发配置**：
```json
{
  "mp-alipay": {
    "usingComponents": true,
    "appid": "2021001122334455",
    "styleIsolation": "shared",
    "component2": true
  }
}
```

### 百度小程序

```json
{
  "mp-baidu": {
    "usingComponents": true,
    "appid": "your_baidu_app_id",
    "compilation": {
      "workers": 1
    },
    "optimization": {
      "subPackages": true
    },
    "permission": {}
  }
}
```

**配置说明**：

- `appid`: 百度小程序 AppID
- `compilation`: 编译配置
  - `workers`: 多进程编译，提升编译速度
- `optimization`: 优化配置
  - `subPackages`: 是否启用分包优化
- `permission`: 权限配置，用于声明小程序需要的权限

**获取 AppID**：
1. 登录百度智能小程序平台：https://smartprogram.baidu.com/
2. 开发管理 -> 设置 -> 开发设置
3. 获取 AppID 和 AppKey

**完整配置示例**：
```json
{
  "mp-baidu": {
    "usingComponents": true,
    "appid": "your_baidu_app_id",
    "compilation": {
      "workers": 1
    },
    "optimization": {
      "subPackages": true
    },
    "permission": {
      "scope.userLocation": {
        "desc": "您的位置信息将用于小程序位置功能"
      },
      "scope.userInfo": {
        "desc": "您的用户信息将用于完善用户资料"
      }
    },
    "requiredBackgroundModes": [
      "audio",
      "location"
    ]
  }
}
```

### 抖音小程序（头条小程序）

```json
{
  "mp-toutiao": {
    "usingComponents": true,
    "appid": "your_bytedance_app_id",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true,
      "newFeature": true
    },
    "permission": {},
    "subPackages": [],
    "plugins": {}
  }
}
```

**配置说明**：

- `appid`: 抖音小程序 AppID（字节跳动小程序）
- `setting`: 编译设置
  - `urlCheck`: 是否校验合法域名
  - `es6`: 是否启用 ES6 转 ES5
  - `postcss`: 是否启用 PostCSS
  - `minified`: 是否压缩代码
  - `newFeature`: 是否启用新特性
- `permission`: 权限声明
- `subPackages`: 分包配置
- `plugins`: 插件配置

**获取 AppID**：
1. 登录字节跳动小程序平台：https://microapp.bytedance.com/
2. 开发管理 -> 开发设置
3. 获取 AppID

**分包配置示例**：
```json
{
  "mp-toutiao": {
    "usingComponents": true,
    "appid": "tt1234567890",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true,
      "newFeature": true
    },
    "permission": {
      "scope.userLocation": {
        "desc": "您的位置信息将用于小程序位置功能"
      }
    },
    "subPackages": [
      {
        "root": "pages/subpage",
        "pages": [
          "index/index"
        ]
      }
    ],
    "plugins": {
      "myPlugin": {
        "version": "1.0.0",
        "provider": "wx1234567890"
      }
    }
  }
}
```

### QQ 小程序

```json
{
  "mp-qq": {
    "appid": "your_qq_app_id",
    "usingComponents": true,
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true,
      "newFeature": true
    },
    "permission": {
      "scope.userLocation": {
        "desc": "您的位置信息将用于小程序位置接口的效果展示"
      }
    },
    "subPackages": [],
    "plugins": {}
  }
}
```

**配置说明**：

- `appid`: QQ 小程序 AppID
- `setting`: 编译配置，与微信小程序类似
- `permission`: 权限声明
- `subPackages`: 分包配置
- `plugins`: 插件配置

**获取 AppID**：
1. 登录 QQ 小程序开发者平台：https://q.qq.com/
2. 开发管理 -> 开发设置
3. 获取 AppID

**QQ 小程序特色功能**：
```json
{
  "mp-qq": {
    "appid": "1234567890",
    "usingComponents": true,
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true,
      "newFeature": true,
      "bigPackageSizeSupport": true
    },
    "permission": {
      "scope.userLocation": {
        "desc": "您的位置信息将用于小程序位置接口的效果展示"
      },
      "scope.userInfo": {
        "desc": "您的用户信息将用于完善用户资料"
      }
    },
    "navigateToMiniProgramAppIdList": [
      "wx1234567890"
    ],
    "subPackages": [],
    "plugins": {}
  }
}
```

### 快手小程序

```json
{
  "mp-kuaishou": {
    "usingComponents": true,
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true
    }
  }
}
```

**配置说明**：

- `usingComponents`: 启用自定义组件模式
- `setting`: 编译设置，配置项与其他小程序平台类似

**获取 AppID**：
1. 登录快手小程序平台：https://mp.kuaishou.com/
2. 开发设置
3. 获取 AppID

**完整配置**：
```json
{
  "mp-kuaishou": {
    "usingComponents": true,
    "appid": "ks1234567890",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true,
      "coverView": true
    },
    "permission": {
      "scope.userLocation": {
        "desc": "您的位置信息将用于小程序位置功能"
      }
    }
  }
}
```

### 飞书小程序

```json
{
  "mp-lark": {
    "usingComponents": true,
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true
    }
  }
}
```

**配置说明**：

- `usingComponents`: 启用自定义组件模式
- `setting`: 编译设置

**获取 AppID**：
1. 登录飞书开放平台：https://open.feishu.cn/
2. 应用管理 -> 小程序
3. 创建小程序后获取 AppID

**企业内部应用配置**：
```json
{
  "mp-lark": {
    "usingComponents": true,
    "appid": "cli_a1234567890",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true
    },
    "permission": {
      "scope.userLocation": {
        "desc": "您的位置信息将用于小程序位置功能"
      }
    },
    "networkTimeout": {
      "request": 60000,
      "connectSocket": 60000,
      "uploadFile": 60000,
      "downloadFile": 60000
    }
  }
}
```

### 京东小程序

```json
{
  "mp-jd": {
    "usingComponents": true
  }
}
```

**配置说明**：

京东小程序配置相对简单，主要启用自定义组件模式即可。

**获取 AppID**：
1. 登录京东小程序平台：https://mp.jd.com/
2. 开发管理 -> 开发设置
3. 获取 AppID

**完整配置示例**：
```json
{
  "mp-jd": {
    "usingComponents": true,
    "appid": "jd1234567890",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "minified": true
    }
  }
}
```

### 360 小程序

```json
{
  "mp-360": {
    "usingComponents": true
  }
}
```

**配置说明**：

360 小程序配置也相对简单，主要启用自定义组件模式。

**获取 AppID**：
1. 登录 360 小程序平台：https://mp.360.cn/
2. 开发设置
3. 获取 AppID

**扩展配置**：
```json
{
  "mp-360": {
    "usingComponents": true,
    "appid": "qh1234567890",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "minified": true
    }
  }
}
```

## 快应用配置

```json
{
  "quickapp": {}
}
```

**配置说明**：

快应用是一种基于手机硬件平台的新型应用生态，配置相对简单。

**完整配置示例**：
```json
{
  "quickapp": {
    "icon": "/static/logo.png",
    "package": "com.example.demo",
    "minPlatformVersion": 1060,
    "versionName": "1.0.0",
    "versionCode": 1
  }
}
```

**配置项说明**：

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `icon` | String | 应用图标路径 |
| `package` | String | 应用包名，采用反域名格式 |
| `minPlatformVersion` | Number | 支持的最低平台版本号 |
| `versionName` | String | 应用版本名称 |
| `versionCode` | Number | 应用版本号 |

## uni 统计配置

```json
{
  "uniStatistics": {
    "enable": false
  }
}
```

**配置说明**：

uni 统计是 DCloud 提供的免费、开源的全端统计平台。

**启用统计**：
```json
{
  "uniStatistics": {
    "enable": true,
    "version": "2"
  }
}
```

**配置项说明**：

| 配置项 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| `enable` | Boolean | 是否启用统计 | `false` |
| `version` | String | 统计版本，"1" 或 "2" | `"2"` |

**统计功能**：
- 设备统计
- 渠道统计
- 页面访问统计
- 错误统计
- 自定义事件统计

## Android 权限详解

### 权限分类

**网络权限**：

| 权限 | 说明 | 是否必需 |
|------|------|----------|
| `INTERNET` | 访问网络 | ✅ 必需 |
| `ACCESS_NETWORK_STATE` | 获取网络状态 | ✅ 推荐 |
| `ACCESS_WIFI_STATE` | 获取 WiFi 状态 | 🟡 可选 |
| `CHANGE_NETWORK_STATE` | 改变网络状态 | 🟡 可选 |
| `CHANGE_WIFI_STATE` | 改变 WiFi 状态 | 🟡 可选 |

**存储权限**：

| 权限 | 说明 | 是否必需 |
|------|------|----------|
| `WRITE_EXTERNAL_STORAGE` | 写入外部存储 | 🟡 可选 |
| `READ_EXTERNAL_STORAGE` | 读取外部存储 | 🟡 可选 |
| `MOUNT_UNMOUNT_FILESYSTEMS` | 挂载/卸载文件系统 | 🟡 可选 |

**设备权限**：

| 权限 | 说明 | 是否必需 |
|------|------|----------|
| `CAMERA` | 使用相机 | 🟡 可选 |
| `VIBRATE` | 控制振动器 | 🟡 可选 |
| `FLASHLIGHT` | 使用闪光灯 | 🟡 可选 |
| `READ_PHONE_STATE` | 读取手机状态 | 🟡 可选 |

**定位权限**：

| 权限 | 说明 | 是否必需 |
|------|------|----------|
| `ACCESS_FINE_LOCATION` | 精确定位 | 🟡 可选 |
| `ACCESS_COARSE_LOCATION` | 粗略定位 | 🟡 可选 |

**其他权限**：

| 权限 | 说明 | 是否必需 |
|------|------|----------|
| `READ_LOGS` | 读取系统日志 | 🟡 调试用 |
| `GET_ACCOUNTS` | 获取账户信息 | 🟡 可选 |
| `WAKE_LOCK` | 防止设备休眠 | 🟡 可选 |
| `WRITE_SETTINGS` | 修改系统设置 | 🟡 可选 |

### 权限申请最佳实践

**基础应用权限**（仅网络功能）：
```json
{
  "android": {
    "permissions": [
      "<uses-permission android:name=\"android.permission.INTERNET\"/>",
      "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>"
    ]
  }
}
```

**标准应用权限**（网络 + 存储 + 基础设备）：
```json
{
  "android": {
    "permissions": [
      "<uses-permission android:name=\"android.permission.INTERNET\"/>",
      "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>",
      "<uses-permission android:name=\"android.permission.ACCESS_WIFI_STATE\"/>",
      "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\"/>",
      "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>",
      "<uses-permission android:name=\"android.permission.CAMERA\"/>",
      "<uses-permission android:name=\"android.permission.VIBRATE\"/>"
    ]
  }
}
```

**完整应用权限**（所有常用权限）：
```json
{
  "android": {
    "permissions": [
      "<uses-permission android:name=\"android.permission.INTERNET\"/>",
      "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>",
      "<uses-permission android:name=\"android.permission.ACCESS_WIFI_STATE\"/>",
      "<uses-permission android:name=\"android.permission.CHANGE_NETWORK_STATE\"/>",
      "<uses-permission android:name=\"android.permission.CHANGE_WIFI_STATE\"/>",
      "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\"/>",
      "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>",
      "<uses-permission android:name=\"android.permission.MOUNT_UNMOUNT_FILESYSTEMS\"/>",
      "<uses-permission android:name=\"android.permission.CAMERA\"/>",
      "<uses-feature android:name=\"android.hardware.camera\"/>",
      "<uses-feature android:name=\"android.hardware.camera.autofocus\"/>",
      "<uses-permission android:name=\"android.permission.VIBRATE\"/>",
      "<uses-permission android:name=\"android.permission.FLASHLIGHT\"/>",
      "<uses-permission android:name=\"android.permission.READ_PHONE_STATE\"/>",
      "<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\"/>",
      "<uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\"/>",
      "<uses-permission android:name=\"android.permission.GET_ACCOUNTS\"/>",
      "<uses-permission android:name=\"android.permission.WAKE_LOCK\"/>",
      "<uses-permission android:name=\"android.permission.WRITE_SETTINGS\"/>",
      "<uses-permission android:name=\"android.permission.READ_LOGS\"/>"
    ]
  }
}
```

### Android 版本兼容性

**SDK 版本选择指南**：

| SDK 版本 | Android 版本 | 市场占有率 | 推荐使用 |
|----------|--------------|------------|----------|
| 21 | Android 5.0 | ~95% | 🟡 兼容性优先 |
| 23 | Android 6.0 | ~90% | ✅ 推荐 |
| 26 | Android 8.0 | ~80% | ✅ 推荐 |
| 28 | Android 9.0 | ~70% | ✅ 平衡选择 |
| 29 | Android 10.0 | ~60% | 🟡 新特性优先 |
| 30 | Android 11.0 | ~40% | 🟡 新特性优先 |
| 31 | Android 12.0 | ~25% | ❌ 不推荐 |

**本项目配置**：
```json
{
  "android": {
    "minSdkVersion": 30,
    "targetSdkVersion": 30
  }
}
```

**配置建议**：
- **minSdkVersion**: 应用支持的最低 Android 版本
  - 设置为 21（Android 5.0）可覆盖 95% 设备
  - 设置为 23（Android 6.0）是推荐值
- **targetSdkVersion**: 应用针对的目标版本
  - 建议与 minSdkVersion 保持一致
  - 或设置为最新的稳定版本

## iOS 配置详解

### 基础配置

```json
{
  "ios": {
    "dSYMs": false
  }
}
```

**配置项说明**：

| 配置项 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| `dSYMs` | Boolean | 是否生成符号表文件 | `false` |

### 权限配置（Info.plist）

iOS 需要在打包时配置隐私权限说明文本：

**相机权限**：
```xml
<key>NSCameraUsageDescription</key>
<string>需要使用您的相机进行拍照或扫码</string>
```

**相册权限**：
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>需要访问您的相册以选择图片</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>需要保存图片到您的相册</string>
```

**定位权限**：
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>需要获取您的位置信息</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>需要始终获取您的位置信息</string>
```

**麦克风权限**：
```xml
<key>NSMicrophoneUsageDescription</key>
<string>需要使用您的麦克风进行语音录入</string>
```

**通讯录权限**：
```xml
<key>NSContactsUsageDescription</key>
<string>需要访问您的通讯录</string>
```

**日历权限**：
```xml
<key>NSCalendarsUsageDescription</key>
<string>需要访问您的日历</string>
```

**蓝牙权限**：
```xml
<key>NSBluetoothPeripheralUsageDescription</key>
<string>需要使用蓝牙功能</string>
```

### 打包配置

iOS 打包需要在 HBuilderX 云打包或本地打包时配置：

**证书配置**：
- 开发证书（Development）：用于真机调试
- 发布证书（Distribution）：用于 App Store 发布或企业版分发

**Bundle ID**：
- 唯一标识符，如 `com.example.app`
- 必须与苹果开发者账号中的 App ID 一致

**版本号配置**：
- Version（CFBundleShortVersionString）：显示给用户的版本号，如 "1.0.0"
- Build（CFBundleVersion）：构建版本号，如 "1"

## 完整配置示例

### 通用跨平台配置

```json
{
  "name": "ryplus-uni",
  "appid": "UNI__6E229FA",
  "description": "RuoYi-Plus UniApp 移动端",
  "versionName": "5.5.0",
  "versionCode": "100",
  "transformPx": false,
  "locale": "zh-Hans",
  "vueVersion": "3",
  "compilerVersion": 3,

  "h5": {
    "router": {
      "mode": "history",
      "base": "/"
    },
    "title": "RuoYi-Plus",
    "template": "index.html",
    "devServer": {
      "https": false,
      "port": 8080
    },
    "optimization": {
      "treeShaking": {
        "enable": true
      }
    }
  },

  "app-plus": {
    "usingComponents": true,
    "nvueStyleCompiler": "uni-app",
    "compilerVersion": 3,
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    },
    "compatible": {
      "ignoreVersion": true
    },
    "distribute": {
      "android": {
        "minSdkVersion": 23,
        "targetSdkVersion": 30,
        "abiFilters": ["armeabi-v7a", "arm64-v8a"],
        "permissions": [
          "<uses-permission android:name=\"android.permission.INTERNET\"/>",
          "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>",
          "<uses-permission android:name=\"android.permission.ACCESS_WIFI_STATE\"/>",
          "<uses-permission android:name=\"android.permission.CAMERA\"/>",
          "<uses-permission android:name=\"android.permission.VIBRATE\"/>"
        ]
      },
      "ios": {
        "dSYMs": false
      },
      "icons": {
        "android": {
          "hdpi": "static/app/icons/72x72.png",
          "xhdpi": "static/app/icons/96x96.png",
          "xxhdpi": "static/app/icons/144x144.png",
          "xxxhdpi": "static/app/icons/192x192.png"
        },
        "ios": {
          "appstore": "static/app/icons/1024x1024.png",
          "iphone": {
            "app@2x": "static/app/icons/120x120.png",
            "app@3x": "static/app/icons/180x180.png"
          }
        }
      }
    }
  },

  "mp-weixin": {
    "appid": "wxd44a6eaefd42428c",
    "usingComponents": true,
    "lazyCodeLoading": "requiredComponents",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "enhance": true,
      "postcss": true,
      "minified": true,
      "coverView": true,
      "bigPackageSizeSupport": true
    },
    "permission": {
      "scope.userLocation": {
        "desc": "您的位置信息将用于小程序位置接口的效果展示"
      }
    },
    "requiredPrivateInfos": ["getLocation", "chooseLocation"]
  },

  "mp-alipay": {
    "usingComponents": true,
    "appid": "your_alipay_app_id",
    "styleIsolation": "shared"
  },

  "uniStatistics": {
    "enable": false
  }
}
```

## 最佳实践

### 1. 版本号管理

**语义化版本**：
```
主版本号.次版本号.修订号
5.5.0
```

- **主版本号**：重大功能变更或不兼容的 API 修改
- **次版本号**：新增功能，向下兼容
- **修订号**：问题修复，向下兼容

**版本号配置**：
```json
{
  "versionName": "5.5.0",
  "versionCode": "100"
}
```

**版本号递增规则**：
- `versionName`: 遵循语义化版本规范
- `versionCode`: 每次发布递增，用于版本比较

### 2. AppID 管理

**开发环境和生产环境分离**：

**开发环境**（manifest.dev.json）：
```json
{
  "appid": "UNI__DEV_6E229FA",
  "mp-weixin": {
    "appid": "wxdev1234567890"
  }
}
```

**生产环境**（manifest.prod.json）：
```json
{
  "appid": "UNI__6E229FA",
  "mp-weixin": {
    "appid": "wxd44a6eaefd42428c"
  }
}
```

### 3. 权限最小化原则

**只申请必需的权限**：
```json
{
  "android": {
    "permissions": [
      "<uses-permission android:name=\"android.permission.INTERNET\"/>",
      "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>"
    ]
  }
}
```

**按需添加权限**：
- 使用相机功能时才添加 `CAMERA` 权限
- 使用定位功能时才添加 `ACCESS_FINE_LOCATION` 权限
- 使用存储功能时才添加 `WRITE_EXTERNAL_STORAGE` 权限

### 4. 性能优化配置

**H5 性能优化**：
```json
{
  "h5": {
    "optimization": {
      "treeShaking": {
        "enable": true
      }
    },
    "router": {
      "mode": "history"
    }
  }
}
```

**小程序性能优化**：
```json
{
  "mp-weixin": {
    "lazyCodeLoading": "requiredComponents",
    "setting": {
      "bigPackageSizeSupport": true
    }
  }
}
```

### 5. 多平台兼容性

**条件编译配置**：
```typescript
// #ifdef H5
const config = {
  baseUrl: 'https://h5.example.com'
}
// #endif

// #ifdef MP-WEIXIN
const config = {
  baseUrl: 'https://mp.example.com'
}
// #endif

// #ifdef APP-PLUS
const config = {
  baseUrl: 'https://app.example.com'
}
// #endif
```

### 6. 图标规范管理

**图标命名规范**：
```
static/app/icons/
  ├── 72x72.png       # Android hdpi
  ├── 96x96.png       # Android xhdpi
  ├── 144x144.png     # Android xxhdpi
  ├── 192x192.png     # Android xxxhdpi
  ├── 120x120.png     # iPhone 2x
  ├── 180x180.png     # iPhone 3x
  └── 1024x1024.png   # App Store
```

**图标设计要求**：
- PNG 格式，透明背景
- 方形尺寸，不要圆角（系统会自动处理）
- 避免使用纯白或纯黑背景
- 保持视觉一致性

## 常见问题

### 1. H5 路由模式选择

**问题**：H5 应该使用 hash 模式还是 history 模式？

**解决方案**：

**Hash 模式**（推荐新手）：
```json
{
  "h5": {
    "router": {
      "mode": "hash"
    }
  }
}
```

优点：
- 兼容性好，无需服务器配置
- URL 带 `#` 号，如 `https://example.com/#/page`

缺点：
- URL 不够美观
- SEO 不友好

**History 模式**（推荐生产环境）：
```json
{
  "h5": {
    "router": {
      "mode": "history"
    }
  }
}
```

优点：
- URL 美观，如 `https://example.com/page`
- SEO 友好

缺点：
- 需要服务器配置支持
- 刷新页面可能 404

**Nginx 配置示例**：
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 2. 小程序分包配置

**问题**：小程序包体积超过 2MB 限制怎么办？

**解决方案**：

使用分包功能，单个分包不超过 2MB，总包不超过 20MB。

**分包配置**（pages.json）：
```json
{
  "pages": [
    {
      "path": "pages/index/index"
    }
  ],
  "subPackages": [
    {
      "root": "pages/subpage",
      "pages": [
        {
          "path": "detail/detail"
        }
      ]
    }
  ]
}
```

**预加载分包**：
```json
{
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages/subpage"]
    }
  }
}
```

### 3. Android 打包失败

**问题**：Android 打包时提示权限错误或 SDK 版本不兼容？

**常见原因**：
1. minSdkVersion 设置过高，导致部分设备无法安装
2. 权限配置错误，格式不正确
3. abiFilters 配置缺失

**解决方案**：

**降低 SDK 版本**：
```json
{
  "android": {
    "minSdkVersion": 21,
    "targetSdkVersion": 30
  }
}
```

**检查权限格式**：
```json
{
  "android": {
    "permissions": [
      "<uses-permission android:name=\"android.permission.INTERNET\"/>"
    ]
  }
}
```

**添加 CPU 架构**：
```json
{
  "android": {
    "abiFilters": [
      "armeabi-v7a",
      "arm64-v8a"
    ]
  }
}
```

### 4. iOS 审核被拒

**问题**：iOS 提交审核时被拒，提示权限说明不符合要求？

**常见原因**：
1. 隐私权限说明文本不够详细
2. 申请了不必要的权限
3. 权限说明与实际功能不符

**解决方案**：

**详细的权限说明**：
```xml
<key>NSCameraUsageDescription</key>
<string>我们需要访问您的相机，以便您可以拍摄照片上传到平台，或者进行二维码/条码扫描功能。您的照片仅用于您主动上传的场景，我们不会在未经您同意的情况下访问您的相机。</string>
```

**移除不必要的权限**：
- 检查代码中是否真的使用了该权限
- 删除未使用权限的相关配置

### 5. H5 部署到子目录

**问题**：H5 部署到服务器子目录后，页面无法正常访问？

**解决方案**：

**配置 base 路径**：
```json
{
  "h5": {
    "router": {
      "mode": "history",
      "base": "/app/"
    }
  }
}
```

**Vite 配置**（vite.config.ts）：
```typescript
export default defineConfig({
  base: '/app/'
})
```

**环境变量**（.env）：
```bash
VITE_APP_PUBLIC_PATH=/app/
```

### 6. 微信小程序域名校验失败

**问题**：微信小程序开发时提示"不在以下合法域名列表中"？

**开发环境解决方案**：
```json
{
  "mp-weixin": {
    "setting": {
      "urlCheck": false
    }
  }
}
```

**生产环境解决方案**：
1. 登录微信公众平台
2. 开发 -> 开发管理 -> 开发设置 -> 服务器域名
3. 添加合法域名（需要 HTTPS 和 ICP 备案）

### 7. App 图标显示异常

**问题**：App 打包后图标显示不正确或模糊？

**常见原因**：
1. 图标尺寸不正确
2. 图标格式不符合要求
3. 图标路径配置错误

**解决方案**：

**检查图标尺寸**：
```bash
# 使用工具批量生成图标
# ImageMagick 示例
convert logo.png -resize 72x72 72x72.png
convert logo.png -resize 96x96 96x96.png
convert logo.png -resize 144x144 144x144.png
```

**验证图标配置**：
```json
{
  "icons": {
    "android": {
      "hdpi": "static/app/icons/72x72.png"
    }
  }
}
```

**图标设计建议**：
- 使用 PNG 格式，透明背景
- 至少准备 1024x1024 原图
- 避免细小文字和复杂图案

### 8. 版本更新提示

**问题**：如何实现 App 版本更新检测？

**解决方案**：

**配置版本号**：
```json
{
  "versionName": "5.5.0",
  "versionCode": "100"
}
```

**版本检测逻辑**：
```typescript
// App.vue
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  checkVersion()
})

const checkVersion = async () => {
  const res = await uni.request({
    url: 'https://api.example.com/version/check',
    data: {
      version: '5.5.0',
      platform: uni.getSystemInfoSync().platform
    }
  })

  if (res.data.needUpdate) {
    uni.showModal({
      title: '版本更新',
      content: `发现新版本 ${res.data.latestVersion}，是否立即更新？`,
      success: (modalRes) => {
        if (modalRes.confirm) {
          // #ifdef APP-PLUS
          plus.runtime.openURL(res.data.downloadUrl)
          // #endif
        }
      }
    })
  }
}
```

## 相关工具

### manifest.config.ts 配置方案

本项目使用 TypeScript 配置文件代替 JSON 文件：

**安装插件**：
```bash
pnpm add -D @uni-helper/vite-plugin-uni-manifest
```

**Vite 配置**（vite.config.ts）：
```typescript
import UniManifest from '@uni-helper/vite-plugin-uni-manifest'

export default defineConfig({
  plugins: [
    UniManifest()
  ]
})
```

**创建配置文件**（manifest.config.ts）：
```typescript
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'

export default defineManifestConfig({
  name: 'ryplus-uni',
  appid: 'UNI__6E229FA',
  versionName: '5.5.0',
  versionCode: '100',
  // ... 其他配置
})
```

**优点**：
- 类型提示和自动补全
- 支持环境变量和动态配置
- 更好的维护性和可读性

### HBuilderX 云打包

**打包流程**：
1. 打开 HBuilderX
2. 打开项目
3. 发行 -> 原生 App-云打包
4. 选择平台（Android/iOS）
5. 填写证书信息
6. 提交打包
7. 下载安装包

**注意事项**：
- iOS 打包需要苹果开发者账号
- 证书和描述文件需要提前准备
- 云打包需要联网

### uni-app 官方文档

- **manifest.json 配置**: https://uniapp.dcloud.net.cn/collocation/manifest.html
- **pages.json 配置**: https://uniapp.dcloud.net.cn/collocation/pages.html
- **条件编译**: https://uniapp.dcloud.net.cn/tutorial/platform.html
