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

## 相关文档

- [页面配置 (pages.json)](./pages-config.md) - 页面路由配置
- [应用配置 (uni.scss)](./app-config.md) - 全局样式变量
- [配置说明](../configuration.md) - 完整配置说明
