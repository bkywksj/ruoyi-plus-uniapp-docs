# 项目配置 (manifest.json)

## 介绍

`manifest.json` 是 UniApp 应用的核心配置清单文件，用于定义应用的基本信息、平台配置、权限声明等关键设置。

**核心特性:**

- **跨平台配置管理** - 统一配置多个平台的应用信息
- **权限声明系统** - 为不同平台声明所需的系统权限
- **图标资源管理** - 配置各平台不同尺寸的应用图标
- **编译优化选项** - 针对不同平台的编译和性能优化设置

## 配置文件

### JSON 配置

**文件路径**: 项目根目录 `manifest.json`

HBuilderX 提供可视化编辑界面，VSCode 可配合 JSON Schema 获得智能提示。

### TypeScript 配置

**文件路径**: 项目根目录 `manifest.config.ts`

使用 TypeScript 编写配置，提供类型提示和动态配置能力。

**配置步骤:**

1. 安装插件:
```bash
pnpm add -D @uni-helper/vite-plugin-uni-manifest
```

2. Vite 配置:
```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import UniManifest from '@uni-helper/vite-plugin-uni-manifest'

export default defineConfig({
  plugins: [
    UniManifest(),
    uni()
  ]
})
```

3. 创建配置文件:
```typescript
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'

export default defineManifestConfig({
  name: 'ryplus_uni_workflow',
  appid: '__UNI__F708A27',
  versionName: '5.5.0',
  versionCode: '100',
})
```

## 基础配置

### 应用基本信息

```json
{
  "name": "ryplus_uni_workflow",
  "appid": "__UNI__F708A27",
  "description": "ryplus-uni",
  "versionName": "5.5.0",
  "versionCode": "100",
  "transformPx": false,
  "locale": "zh-Hans",
  "vueVersion": "3",
  "compilerVersion": 3
}
```

### 配置项说明

| 配置项 | 说明 | 示例值 |
|-------|------|--------|
| name | 应用显示名称 | `ryplus_uni_workflow` |
| appid | DCloud 应用唯一标识 | `__UNI__F708A27` |
| description | 应用描述 | `ryplus-uni` |
| versionName | 版本名称(语义化) | `5.5.0` |
| versionCode | 内部版本号(纯数字) | `100` |
| transformPx | px 转 rpx | `false`(推荐) |
| locale | 默认语言 | `zh-Hans` |
| vueVersion | Vue 版本 | `3`(推荐) |
| compilerVersion | 编译器版本 | `3`(推荐) |

**版本号规范:**

```text
主版本号.次版本号.修订号
5.5.0 → 5.5.1 (Bug修复)
5.5.0 → 5.6.0 (新功能)
5.5.0 → 6.0.0 (重大更新)
```

**支持的语言代码:**

- `zh-Hans`: 简体中文
- `zh-Hant`: 繁体中文
- `en`: 英语
- `ja`: 日语

## H5 配置

### 基础配置

```json
{
  "h5": {
    "router": {
      "mode": "history",
      "base": "/"
    },
    "title": "RuoYi-Plus",
    "devServer": {
      "https": false,
      "port": 8080,
      "disableHostCheck": true
    },
    "optimization": {
      "treeShaking": {
        "enable": true
      }
    }
  }
}
```

### 路由模式对比

| 模式 | URL 示例 | 优点 | 缺点 |
|-----|---------|------|------|
| hash | `/#/pages/index` | 无需服务器配置 | URL 带 # 号 |
| history | `/pages/index` | URL 美观、SEO 友好 | 需服务器配置 |

**Nginx 配置(history 模式):**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 子目录部署

```json
{
  "h5": {
    "router": {
      "base": "/app/"
    }
  }
}
```

### 代理配置

```json
{
  "h5": {
    "devServer": {
      "proxy": {
        "/api": {
          "target": "https://api.example.com",
          "changeOrigin": true,
          "secure": false
        }
      }
    }
  }
}
```

## App 配置

### 基础配置

```json
{
  "app-plus": {
    "usingComponents": true,
    "nvueCompiler": "uni-app",
    "nvueStyleCompiler": "uni-app",
    "nvueLaunchMode": "fast",
    "compilerVersion": 3,
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    },
    "distribute": {
      "android": {},
      "ios": {},
      "icons": {}
    }
  }
}
```

### 启动页配置

| 配置项 | 说明 | 推荐值 |
|-------|------|--------|
| alwaysShowBeforeRender | 渲染前显示启动页 | `true` |
| waiting | 等待首页渲染完成 | `true` |
| autoclose | 自动关闭启动页 | `true` |
| delay | 最小显示时间(ms) | `0` |

**手动关闭启动页:**

```typescript
onLaunch(() => {
  initApp().then(() => {
    plus.navigator.closeSplashscreen()
  })
})
```

### NVUE 原生渲染配置

NVUE（Native Vue）是 uni-app 提供的原生渲染方案，基于 Weex 引擎将 Vue 模板编译为原生 UI 控件，绕过 WebView 直接在 iOS/Android 上以原生组件呈现。在长列表滚动、复杂动画、大量绘制场景中性能显著优于 vue 页面，适用于首页、商品流、视频流、地图、原生导航栏等关键路径。

`plus-app` 子项目在 `manifest.json` 的 `app-plus` 段开启了完整的 NVUE 编译配置：

```json
{
  "app-plus": {
    "usingComponents": true,
    "nvueCompiler": "uni-app",
    "nvueStyleCompiler": "uni-app",
    "nvueLaunchMode": "fast",
    "compilerVersion": 3
  }
}
```

**核心配置项:**

| 配置项 | 类型 | 可选值 | 说明 |
|--------|------|--------|------|
| `nvueCompiler` | string | `uni-app` / `weex` | NVUE 编译器。`uni-app` 编译器支持完整 Vue 语法、组件、生命周期；`weex` 编译器仅支持子集，已不推荐 |
| `nvueStyleCompiler` | string | `uni-app` / `weex` | NVUE 样式编译器。`uni-app` 支持 CSS 单位 `rpx` 与百分比；`weex` 仅支持 `px` 与 `wx` |
| `nvueLaunchMode` | string | `fast` / `normal` | 启动模式。`fast` 在 App 启动时预加载 NVUE 引擎，首屏冷启动更快；`normal` 按需加载，包体更小但首屏稍慢 |
| `compilerVersion` | number | `3` / `2` | uni-app 编译器主版本，`3` 即 Vue 3 模式 |

**配置组合推荐:**

- **推荐组合（plus-app 当前采用）**：`uni-app` 编译器 + `uni-app` 样式编译器 + `fast` 启动模式 + 编译器 v3。该组合可以让 NVUE 页面完全使用 Vue 3 语法（`<script setup>`、`ref`、`reactive`），并与 vue 页面共享组件库 / Composables / Pinia 状态，无需为 NVUE 单独维护代码分支。
- **不推荐**：`weex` 编译器组合。已不再迭代，遇到 Vue 3 新特性会直接编译失败。

**NVUE 页面识别:**

NVUE 页面以 `.nvue` 为扩展名，与 `.vue` 页面共存于 `pages/` 目录。`pages.json` 中通过文件后缀自动识别：

```json
{
  "pages": [
    { "path": "pages/index/index" },
    { "path": "pages/feed/list", "style": { "navigationStyle": "custom" } }
  ]
}
```

`pages/feed/list.nvue` 将被识别为 NVUE 页面，使用原生渲染；`pages/index/index.vue` 仍走 WebView 渲染。两者通过 `uni.navigateTo` 互相跳转时，平台自动衔接渲染层。

**NVUE 限制与替代:**

| 限制项 | vue 页面 | NVUE 页面 | 替代方案 |
|--------|----------|-----------|----------|
| `<div>` / `<span>` / `<p>` | 是 支持 | 否 不支持 | 使用 `<view>` / `<text>` |
| CSS 选择器 | 是 全部 | 部分 仅类选择器 | 拆分类名，避免后代选择器 |
| `flex` 布局 | 是 自由组合 | 部分 默认 `flex-direction: column` | 显式声明 `flex-direction` |
| `position: fixed` | 是 支持 | 否 不支持 | 使用 `<cover-view>` 或独立组件 |
| 浏览器 API（`window` / `document`） | 是 支持 | 否 不支持 | 使用 `uni.*` API 或原生模块 |
| WD UI 组件 | 是 完全支持 | 部分 部分支持 | 优先使用 WD 原生兼容组件，复杂组件保留在 vue 页面 |

**性能对照:**

| 场景 | vue 页面（WebView） | NVUE 页面（原生） |
|------|---------------------|-------------------|
| 长列表滚动（1000+ item） | 30-45 FPS，滑动卡顿明显 | 55-60 FPS，平滑 |
| 大图片滑动（视频流） | 内存占用高，易触发回收 | 内存可控，原生图片缓存 |
| 复杂动画 | 主线程阻塞 | GPU 加速，独立渲染线程 |
| 冷启动首屏 | 较慢（含 WebView 初始化） | 快（`fast` 模式预热引擎） |
| 包体增量 | 基础 | 增加约 2-3 MB（NVUE 引擎） |

**接入步骤:**

1. 确认 `manifest.json` 的 `app-plus` 段已配置 `nvueCompiler: "uni-app"` 与 `nvueLaunchMode: "fast"`
2. 将关键路径页面（首页、商品流、视频流）的扩展名从 `.vue` 改为 `.nvue`
3. 替换不支持的标签：`<div>` → `<view>`，`<span>` → `<text>`
4. 检查样式选择器，将后代/嵌套选择器拆分为单一类
5. 真机预览验证（`pnpm dev:app` 或 HBuilderX 运行到手机），关注 Android / iOS 双端表现
6. 性能监控接入 `uni.requestPerformance` 或 `uni.getPerformance` API，记录关键指标

**注意事项:**

- NVUE 仅在 App 端生效。H5、小程序端会回退为普通 vue 渲染（小程序）或编译失败（H5），需要做条件编译
- 使用条件编译 `#ifdef APP-NVUE` 包裹原生平台专属逻辑，避免 H5 端报错
- 自定义组件如果需要在 NVUE 中使用，组件本身也必须是 `.nvue` 或纯 JS 组件，不能引用浏览器 API
- 调试时注意 NVUE 不支持 Chrome DevTools，需要使用 HBuilderX 的"运行到 App 真机"调试

### Android 配置

```json
{
  "distribute": {
    "android": {
      "minSdkVersion": 21,
      "targetSdkVersion": 30,
      "abiFilters": ["armeabi-v7a", "arm64-v8a"],
      "permissions": [
        "<uses-permission android:name=\"android.permission.INTERNET\"/>",
        "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>",
        "<uses-permission android:name=\"android.permission.CAMERA\"/>",
        "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\"/>"
      ]
    }
  }
}
```

**SDK 版本参考:**

| SDK | Android | 市场占有率 | 推荐 |
|-----|---------|-----------|------|
| 21 | 5.0 | ~95% | 是 推荐 |
| 23 | 6.0 | ~90% | 是 推荐 |
| 26 | 8.0 | ~80% | 是 平衡 |
| 30 | 11.0 | ~40% | 中 新特性 |

**常用权限:**

| 权限 | 说明 |
|-----|------|
| INTERNET | 网络访问(必需) |
| ACCESS_NETWORK_STATE | 网络状态 |
| ACCESS_WIFI_STATE | WiFi 状态 |
| CAMERA | 相机(拍照/扫码) |
| WRITE_EXTERNAL_STORAGE | 写入存储 |
| ACCESS_FINE_LOCATION | 精确定位 |
| VIBRATE | 振动反馈 |

### iOS 配置

```json
{
  "distribute": {
    "ios": {
      "dSYMs": false
    }
  }
}
```

**常用隐私权限(Info.plist):**

| Key | 说明 |
|-----|------|
| NSCameraUsageDescription | 相机权限说明 |
| NSPhotoLibraryUsageDescription | 相册权限说明 |
| NSLocationWhenInUseUsageDescription | 定位权限说明 |
| NSMicrophoneUsageDescription | 麦克风权限说明 |

**权限说明编写建议:**
- 使用通俗语言，避免技术术语
- 明确说明使用目的和场景
- 长度 20-50 字

### 应用图标配置

```json
{
  "distribute": {
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
}
```

**Android 图标尺寸:**

| 密度 | 尺寸 | 说明 |
|-----|------|------|
| hdpi | 72x72 | 中密度屏幕 |
| xhdpi | 96x96 | 高密度屏幕 |
| xxhdpi | 144x144 | 超高密度屏幕 |
| xxxhdpi | 192x192 | 超超高密度屏幕 |

**iOS 图标尺寸:**

| 用途 | 尺寸 |
|-----|------|
| App Store | 1024x1024 |
| iPhone app@2x | 120x120 |
| iPhone app@3x | 180x180 |
| iPad app@2x | 152x152 |

**图标设计规范:**
- PNG 格式，不透明背景
- 原图至少 1024x1024
- 避免圆角(系统自动处理)
- 图标内容居中

## 微信小程序配置

### 基础配置

```json
{
  "mp-weixin": {
    "appid": "",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "enhance": true,
      "postcss": true,
      "minified": true,
      "bigPackageSizeSupport": true
    },
    "usingComponents": true,
    "lazyCodeLoading": "requiredComponents",
    "permission": {
      "scope.userLocation": {
        "desc": "您的位置信息将用于小程序位置接口的效果展示"
      }
    },
    "requiredPrivateInfos": [
      "getLocation",
      "chooseLocation"
    ]
  }
}
```

### 编译设置说明

| 配置项 | 说明 | 推荐值 |
|-------|------|--------|
| urlCheck | 域名校验 | `false`(开发) |
| es6 | ES6 转 ES5 | `true` |
| enhance | 增强编译 | `true` |
| postcss | PostCSS | `true` |
| minified | 代码压缩 | `true` |
| bigPackageSizeSupport | 大包支持 | `true` |

### 按需注入

```json
{
  "mp-weixin": {
    "lazyCodeLoading": "requiredComponents"
  }
}
```

减少启动时注入的代码量，提升首页打开速度。

### 权限配置

```json
{
  "permission": {
    "scope.userLocation": {
      "desc": "您的位置信息将用于位置服务"
    }
  },
  "requiredPrivateInfos": [
    "getLocation",
    "chooseLocation"
  ]
}
```

**常用权限作用域:**

| 作用域 | 说明 |
|-------|------|
| scope.userLocation | 地理位置 |
| scope.writePhotosAlbum | 保存到相册 |
| scope.camera | 摄像头 |
| scope.record | 录音 |

## 其他小程序配置

### 支付宝小程序

```json
{
  "mp-alipay": {
    "usingComponents": true,
    "appid": "your_alipay_app_id",
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
    "optimization": {
      "subPackages": true
    }
  }
}
```

### 抖音小程序

```json
{
  "mp-toutiao": {
    "usingComponents": true,
    "appid": "your_bytedance_app_id",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "minified": true
    }
  }
}
```

## uni 统计配置

```json
{
  "uniStatistics": {
    "enable": false,
    "version": "2"
  }
}
```

统计功能包括：设备统计、渠道统计、页面访问统计、错误统计。

## 最佳实践

### 1. 环境配置分离

```typescript
// manifest.config.ts
const isProd = process.env.NODE_ENV === 'production'

export default defineManifestConfig({
  name: 'ryplus_uni_workflow',
  appid: isProd ? '__UNI__F708A27' : '__UNI__DEV_F708A27',
  'mp-weixin': {
    appid: isProd ? 'wxd44a6eaefd42428c' : 'wxdev1234567890',
    setting: {
      urlCheck: isProd
    }
  },
  h5: {
    router: {
      base: isProd ? '/app/' : '/'
    }
  }
})
```

### 2. 权限最小化

**基础应用(仅网络):**

```json
{
  "permissions": [
    "<uses-permission android:name=\"android.permission.INTERNET\"/>",
    "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>"
  ]
}
```

**按功能模块添加权限:**
- 使用相机时添加 CAMERA
- 使用定位时添加 ACCESS_FINE_LOCATION
- 使用存储时添加 WRITE_EXTERNAL_STORAGE

### 3. 图标规范管理

```text
static/app/icons/
├── source/
│   └── logo-1024.png      # 原图
├── android/
│   ├── 72x72.png
│   ├── 96x96.png
│   ├── 144x144.png
│   └── 192x192.png
└── ios/
    ├── 1024x1024.png
    ├── 120x120.png
    └── 180x180.png
```

### 4. 性能优化配置

```json
{
  "h5": {
    "optimization": {
      "treeShaking": { "enable": true }
    }
  },
  "mp-weixin": {
    "lazyCodeLoading": "requiredComponents",
    "setting": {
      "bigPackageSizeSupport": true
    }
  },
  "app-plus": {
    "compilerVersion": 3,
    "splashscreen": {
      "waiting": true,
      "autoclose": true
    }
  }
}
```

## 常见问题

### 1. H5 路由模式选择

**开发环境:** 使用 hash 模式，无需服务器配置

**生产环境:** 使用 history 模式 + Nginx 配置

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 2. 小程序包体积超限

使用分包功能(pages.json 配置):

```json
{
  "subPackages": [
    {
      "root": "pages/subpage",
      "pages": [{ "path": "detail/detail" }]
    }
  ]
}
```

启用分包异步化:

```json
{
  "mp-weixin": {
    "setting": {
      "bigPackageSizeSupport": true
    }
  }
}
```

### 3. Android 打包失败

**检查 SDK 版本:**

```json
{
  "android": {
    "minSdkVersion": 21,
    "targetSdkVersion": 30
  }
}
```

**检查 CPU 架构:**

```json
{
  "android": {
    "abiFilters": ["armeabi-v7a", "arm64-v8a"]
  }
}
```

### 4. 微信小程序域名校验失败

**开发环境:** 禁用域名校验

```json
{
  "mp-weixin": {
    "setting": {
      "urlCheck": false
    }
  }
}
```

**生产环境:** 在微信公众平台配置合法域名

### 5. H5 部署到子目录

配置 base 路径:

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

Vite 配置:

```typescript
export default defineConfig({
  base: '/app/'
})
```

### 6. 版本更新检测

```typescript
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
      content: `发现新版本 ${res.data.latestVersion}`,
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

## 总结

manifest.json 核心配置:

1. **基础信息** - name、appid、version
2. **H5 配置** - router.mode、devServer、optimization
3. **App 配置** - splashscreen、distribute(android/ios/icons)
4. **小程序配置** - appid、setting、lazyCodeLoading、permission
5. **最佳实践** - 环境分离、权限最小化、性能优化
