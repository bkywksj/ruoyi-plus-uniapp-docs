# 项目配置 (manifest.json)

## 概述

`manifest.json` 是 uni-app 应用的核心配置清单文件,用于定义应用的基本信息、平台配置、权限声明等关键设置。该文件采用标准 JSON 格式,支持配置多端应用(H5、App、小程序、快应用)的不同特性,是 uni-app 项目中最重要的配置文件之一。

配置文件位于项目根目录 `manifest.json`,由 HBuilderX 或其他开发工具自动识别和解析。对于使用 TypeScript 的项目,可以通过 `@uni-helper/vite-plugin-uni-manifest` 插件,使用 `manifest.config.ts` 以 TypeScript 方式编写配置,享受类型提示和自动补全的便利。

### 核心特性

- **跨平台配置管理** - 统一配置多个平台的应用信息
- **权限声明系统** - 为不同平台声明所需的系统权限
- **图标资源管理** - 配置各平台不同尺寸的应用图标
- **编译优化选项** - 针对不同平台的编译和性能优化设置
- **版本号管理** - 统一管理应用版本信息
- **平台差异化配置** - 为每个平台提供独立的配置空间

## 配置文件位置

### 标准 JSON 配置

**文件路径**: 项目根目录 `manifest.json`

这是 UniApp 官方标准配置文件,使用 JSON 格式,适合所有 UniApp 项目。HBuilderX 提供了可视化编辑界面,可以直接在界面上修改配置,也可以手动编辑 JSON 源码。

**编辑方式**:
- HBuilderX: 在项目管理器中双击 manifest.json,使用可视化编辑器
- VSCode: 直接编辑 JSON 文件,配合 JSON Schema 获得智能提示

### TypeScript 配置方案

**文件路径**: 项目根目录 `manifest.config.ts`

使用 TypeScript 编写配置文件,通过 Vite 插件自动生成 `manifest.json`。这种方式提供了更好的开发体验。

**优势**:
- 完整的 TypeScript 类型提示和自动补全
- 支持环境变量和动态配置逻辑
- 更好的代码可维护性和可读性
- 编译时类型检查,减少配置错误

**配置步骤**:

1. 安装 Vite 插件:
```bash
pnpm add -D @uni-helper/vite-plugin-uni-manifest
```

2. 在 `vite.config.ts` 中注册插件:
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

3. 创建 `manifest.config.ts` 文件:
```typescript
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'

export default defineManifestConfig({
  name: 'ryplus_uni_workflow',
  appid: '__UNI__F708A27',
  versionName: '5.5.0',
  versionCode: '100',
  // ... 其他配置
})
```

4. 构建时自动生成 `manifest.json`:
```bash
pnpm build:h5    # 生成 manifest.json 并构建 H5
pnpm build:app   # 生成 manifest.json 并构建 App
```

**注意事项**:
- 生成的 `manifest.json` 不要手动修改,修改会在下次构建时被覆盖
- TypeScript 配置文件支持动态逻辑,但生成的 JSON 必须是静态的
- 环境变量可以在构建时注入配置

## 基础配置

### 应用基本信息

应用基本信息定义了应用的标识和版本,是所有平台共享的通用配置。

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

### 配置项详解

#### name - 应用名称

应用的显示名称,会在以下场景使用:
- 应用启动页标题
- 关于页面的应用名称
- 桌面图标下方的文字(部分平台)

**示例**:
```json
{
  "name": "ryplus_uni_workflow"
}
```

**命名建议**:
- 使用有意义的英文名称或拼音
- 避免使用特殊符号和空格
- 长度控制在 20 个字符以内
- 与应用实际功能相关

#### appid - 应用唯一标识

UniApp 应用的全局唯一标识符,由 DCloud 开发者中心分配。这个 ID 用于云端服务(如统计、推送等)识别应用。

**获取方式**:
1. 登录 DCloud 开发者中心: https://dev.dcloud.net.cn
2. 创建应用或选择已有应用
3. 复制应用的 AppID

**格式说明**:
- 正式 AppID: `__UNI__` 前缀 + 7位字符,如 `__UNI__F708A27`
- 测试 AppID: HBuilderX 创建项目时自动生成

**示例**:
```json
{
  "appid": "__UNI__F708A27"
}
```

**注意事项**:
- 不要手动修改 AppID
- 不同项目使用不同的 AppID
- 发布到应用商店时需要使用正式 AppID

#### description - 应用描述

应用的简短描述,用于说明应用的主要功能。这个描述会在应用商店、关于页面等位置展示。

**示例**:
```json
{
  "description": "ryplus-uni"
}
```

**编写建议**:
- 简洁明了,控制在 50 字以内
- 突出核心功能和特色
- 使用专业术语,避免口语化
- 可以包含关键词,利于搜索

#### versionName - 版本名称

应用的版本号,采用语义化版本规范(Semantic Versioning),展示给最终用户。

**格式**: `主版本号.次版本号.修订号`

**示例**:
```json
{
  "versionName": "5.5.0"
}
```

**版本号说明**:
- **主版本号**(5): 重大功能变更,可能不向后兼容
- **次版本号**(5): 新增功能,向后兼容
- **修订号**(0): Bug 修复,向后兼容

**递增规则**:
- 重大架构调整: 5.5.0 → 6.0.0
- 新增功能模块: 5.5.0 → 5.6.0
- 修复 Bug: 5.5.0 → 5.5.1
- 优化性能: 5.5.0 → 5.5.1

**版本管理最佳实践**:
```json
{
  "versionName": "5.5.0",  // 对用户展示
  "versionCode": "100"     // 用于版本比较
}
```

#### versionCode - 版本号

应用的内部版本号,纯数字格式,用于版本比较和更新检测。这个值必须是整数,每次发布新版本时递增。

**示例**:
```json
{
  "versionCode": "100"
}
```

**递增规则**:
- 每次发布新版本,versionCode 必须 +1
- 不能跳号或倒退
- 用于判断版本新旧(数值越大越新)

**版本号对应关系示例**:
```json
// 版本 1.0.0
{ "versionName": "1.0.0", "versionCode": "1" }

// 版本 1.0.1 (Bug 修复)
{ "versionName": "1.0.1", "versionCode": "2" }

// 版本 1.1.0 (新功能)
{ "versionName": "1.1.0", "versionCode": "3" }

// 版本 2.0.0 (重大更新)
{ "versionName": "2.0.0", "versionCode": "4" }
```

**应用场景**:
- App 内部版本更新检测
- 应用商店版本比较
- 灰度发布版本控制

#### transformPx - px 单位转换

控制是否自动将 CSS 中的 `px` 单位转换为 `rpx`(响应式像素)。

**示例**:
```json
{
  "transformPx": false
}
```

**配置说明**:
- `false`: 不转换,推荐设置(默认值)
- `true`: 自动转换 px 为 rpx

**推荐做法**:
```scss
// 统一使用 rpx 单位,不依赖自动转换
.container {
  width: 750rpx;        // ✅ 推荐
  padding: 32rpx;       // ✅ 推荐
  margin-top: 20rpx;    // ✅ 推荐
}

// 避免混用
.container {
  width: 750px;         // ❌ 不推荐
  padding: 32rpx;
}
```

**rpx 单位说明**:
- rpx 是 UniApp 的响应式单位
- 750rpx = 屏幕宽度
- 1rpx = 屏幕宽度 / 750
- 可以自适应不同屏幕尺寸

#### locale - 默认语言

应用的默认语言设置,影响系统 API 返回的文本语言。

**示例**:
```json
{
  "locale": "zh-Hans"
}
```

**支持的语言代码**:
- `zh-Hans`: 简体中文(推荐)
- `zh-Hant`: 繁体中文
- `en`: 英语
- `ja`: 日语
- `ko`: 韩语
- `fr`: 法语
- `de`: 德语
- `es`: 西班牙语

**语言切换**:
```typescript
// 运行时切换语言
uni.setLocale('en')

// 获取当前语言
const currentLocale = uni.getLocale()
console.log(currentLocale) // 'zh-Hans'
```

#### vueVersion - Vue 版本

指定使用的 Vue 框架版本,UniApp 支持 Vue 2 和 Vue 3。

**示例**:
```json
{
  "vueVersion": "3"
}
```

**版本选择**:
- `"2"`: Vue 2(旧项目)
- `"3"`: Vue 3(推荐,新项目默认)

**Vue 3 优势**:
- 更好的性能
- Composition API 支持
- 更完善的 TypeScript 支持
- 更小的打包体积
- 更快的渲染速度

#### compilerVersion - 编译器版本

指定 UniApp 编译器的版本。

**示例**:
```json
{
  "compilerVersion": 3
}
```

**版本说明**:
- `2`: 旧版编译器
- `3`: 新版编译器(推荐)

**编译器 3 的改进**:
- 更快的编译速度
- 更好的错误提示
- 支持 Vite 构建工具
- 更完善的 Tree Shaking
- 更小的包体积

## H5 配置

H5 配置用于 Web 端应用(浏览器访问),包括路由模式、开发服务器、优化选项等。

### 基础配置

```json
{
  "h5": {
    "router": {
      "mode": "history",
      "base": "/"
    },
    "title": "RuoYi-Plus",
    "template": "index.html",
    "devServer": {
      "https": false,
      "port": 8080,
      "disableHostCheck": true
    },
    "optimization": {
      "treeShaking": {
        "enable": true
      }
    },
    "publicPath": "/"
  }
}
```

### router - 路由配置

#### mode - 路由模式

H5 路由模式,影响 URL 的展示形式和服务器配置要求。

**hash 模式**:
```json
{
  "h5": {
    "router": {
      "mode": "hash"
    }
  }
}
```

URL 示例: `https://example.com/#/pages/index/index`

**优点**:
- 无需服务器配置,开箱即用
- 兼容性好,支持所有浏览器
- 刷新页面不会 404

**缺点**:
- URL 带 `#` 号,不够美观
- SEO 不友好(搜索引擎可能忽略 hash 部分)
- 无法使用锚点定位(hash 被路由占用)

**适用场景**:
- 快速开发和测试
- 无服务器配置权限
- 不需要 SEO 的应用

**history 模式**:
```json
{
  "h5": {
    "router": {
      "mode": "history"
    }
  }
}
```

URL 示例: `https://example.com/pages/index/index`

**优点**:
- URL 美观,没有 `#` 号
- SEO 友好
- 可以正常使用锚点

**缺点**:
- 需要服务器配置支持
- 直接访问路由或刷新可能 404
- 配置不当会影响用户体验

**适用场景**:
- 生产环境部署
- 需要 SEO 优化的应用
- 有服务器配置权限

**服务器配置示例**:

Nginx 配置:
```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

Apache 配置(.htaccess):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### base - 基础路径

应用的部署基础路径,用于部署到服务器子目录。

**根目录部署**:
```json
{
  "h5": {
    "router": {
      "base": "/"
    }
  }
}
```

访问路径: `https://example.com/`

**子目录部署**:
```json
{
  "h5": {
    "router": {
      "base": "/app/"
    }
  }
}
```

访问路径: `https://example.com/app/`

**配合环境变量使用**:

.env.production:
```bash
VITE_APP_PUBLIC_PATH=/app/
```

manifest.config.ts:
```typescript
export default defineManifestConfig({
  h5: {
    router: {
      base: process.env.VITE_APP_PUBLIC_PATH || '/'
    }
  }
})
```

**注意事项**:
- base 必须以 `/` 开头和结尾
- 需要与 vite.config.ts 中的 base 保持一致
- 静态资源路径会自动添加 base 前缀

### title - 页面标题

H5 默认页面标题,可以被 pages.json 中的页面配置覆盖。

```json
{
  "h5": {
    "title": "RuoYi-Plus"
  }
}
```

**动态修改标题**:
```typescript
// 在页面中修改标题
uni.setNavigationBarTitle({
  title: '新标题'
})
```

### devServer - 开发服务器配置

开发服务器的配置选项,仅在开发环境生效。

```json
{
  "h5": {
    "devServer": {
      "https": false,
      "port": 8080,
      "disableHostCheck": true,
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

**配置项说明**:

- `https`: 是否启用 HTTPS
  - `false`: HTTP 协议(默认)
  - `true`: HTTPS 协议(需要证书)

- `port`: 开发服务器端口号
  - 默认: 8080
  - 建议: 8080、3000、5173 等常用端口

- `disableHostCheck`: 是否禁用 Host 检查
  - `true`: 允许任何 Host 访问
  - `false`: 只允许配置的 Host

- `proxy`: API 代理配置,用于解决开发环境跨域问题

**代理配置示例**:
```json
{
  "devServer": {
    "proxy": {
      "/api": {
        "target": "https://api.example.com",
        "changeOrigin": true,
        "secure": false,
        "pathRewrite": {
          "^/api": ""
        }
      }
    }
  }
}
```

请求转发示例:
- 原始请求: `http://localhost:8080/api/user/info`
- 代理转发: `https://api.example.com/user/info`

### optimization - 优化配置

构建优化选项,用于提升应用性能和减小包体积。

```json
{
  "h5": {
    "optimization": {
      "treeShaking": {
        "enable": true
      }
    }
  }
}
```

**treeShaking - Tree Shaking 优化**:
- `enable: true`: 启用 Tree Shaking,移除未使用的代码
- `enable: false`: 禁用 Tree Shaking

**Tree Shaking 效果**:
```typescript
// utils.ts
export const add = (a, b) => a + b
export const multiply = (a, b) => a * b

// main.ts
import { add } from './utils'  // 只导入 add

// 启用 Tree Shaking 后,multiply 不会被打包
```

## App 配置 (app-plus)

App 配置用于原生应用(Android 和 iOS),包括启动页、权限、图标、打包等。

### 基础配置

```json
{
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
    "modules": {},
    "distribute": {
      "android": {},
      "ios": {},
      "sdkConfigs": {},
      "icons": {}
    }
  }
}
```

### usingComponents - 自定义组件模式

是否启用自定义组件模式,推荐启用。

```json
{
  "app-plus": {
    "usingComponents": true
  }
}
```

**优势**:
- 更好的性能
- 更小的包体积
- 支持组件懒加载
- 更好的生命周期管理

### nvueStyleCompiler - nvue 样式编译器

nvue 页面的样式编译器选择。

```json
{
  "app-plus": {
    "nvueStyleCompiler": "uni-app"
  }
}
```

**选项**:
- `uni-app`: UniApp 编译器(推荐)
- `weex`: Weex 原生编译器

### splashscreen - 启动页配置

应用启动时的闪屏页面配置。

```json
{
  "app-plus": {
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    }
  }
}
```

**配置项说明**:

- `alwaysShowBeforeRender`: 首页渲染前是否总是显示启动页
  - `true`: 每次启动都显示(推荐)
  - `false`: 首次启动显示,后续启动可能不显示

- `waiting`: 是否等待首页渲染完成
  - `true`: 等待首页完全渲染后关闭启动页(推荐)
  - `false`: 立即关闭启动页(可能看到白屏)

- `autoclose`: 是否自动关闭启动页
  - `true`: 首页渲染完成后自动关闭(推荐)
  - `false`: 需要手动调用 API 关闭

- `delay`: 启动页最小显示时间(毫秒)
  - `0`: 不延迟(推荐)
  - `1000`: 延迟 1 秒关闭

**手动关闭启动页**:
```typescript
// App.vue
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  // 执行一些初始化操作
  initApp().then(() => {
    // 关闭启动页
    plus.navigator.closeSplashscreen()
  })
})
```

### distribute - 打包配置

应用分发和打包的详细配置,包括 Android、iOS、图标等。

#### Android 配置

Android 平台的权限、SDK 版本、签名等配置。

```json
{
  "app-plus": {
    "distribute": {
      "android": {
        "minSdkVersion": 21,
        "targetSdkVersion": 30,
        "abiFilters": [
          "armeabi-v7a",
          "arm64-v8a"
        ],
        "permissions": [
          "<uses-permission android:name=\"android.permission.CHANGE_NETWORK_STATE\"/>",
          "<uses-permission android:name=\"android.permission.MOUNT_UNMOUNT_FILESYSTEMS\"/>",
          "<uses-permission android:name=\"android.permission.VIBRATE\"/>",
          "<uses-permission android:name=\"android.permission.READ_LOGS\"/>",
          "<uses-permission android:name=\"android.permission.ACCESS_WIFI_STATE\"/>",
          "<uses-feature android:name=\"android.hardware.camera.autofocus\"/>",
          "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>",
          "<uses-permission android:name=\"android.permission.CAMERA\"/>",
          "<uses-permission android:name=\"android.permission.GET_ACCOUNTS\"/>",
          "<uses-permission android:name=\"android.permission.READ_PHONE_STATE\"/>",
          "<uses-permission android:name=\"android.permission.CHANGE_WIFI_STATE\"/>",
          "<uses-permission android:name=\"android.permission.WAKE_LOCK\"/>",
          "<uses-permission android:name=\"android.permission.FLASHLIGHT\"/>",
          "<uses-feature android:name=\"android.hardware.camera\"/>",
          "<uses-permission android:name=\"android.permission.WRITE_SETTINGS\"/>"
        ]
      }
    }
  }
}
```

**minSdkVersion - 最低 SDK 版本**:

指定应用支持的最低 Android 系统版本。

**常用版本对照表**:

| SDK 版本 | Android 版本 | 发布年份 | 市场占有率 | 推荐程度 |
|----------|--------------|----------|------------|----------|
| 19 | Android 4.4 | 2013 | ~98% | 🟡 兼容性优先 |
| 21 | Android 5.0 | 2014 | ~95% | ✅ 推荐 |
| 23 | Android 6.0 | 2015 | ~90% | ✅ 推荐 |
| 26 | Android 8.0 | 2017 | ~80% | ✅ 平衡选择 |
| 28 | Android 9.0 | 2018 | ~70% | 🟡 新特性优先 |
| 29 | Android 10.0 | 2019 | ~60% | 🟡 新特性优先 |
| 30 | Android 11.0 | 2020 | ~40% | 🟡 新特性优先 |
| 31 | Android 12.0 | 2021 | ~25% | ❌ 不推荐 |

**选择建议**:
- 通用应用: 21 (覆盖 95% 设备)
- 企业应用: 23-26 (兼顾新特性和兼容性)
- 新特性应用: 28-30 (使用最新 API)

**示例**:
```json
{
  "android": {
    "minSdkVersion": 21,
    "targetSdkVersion": 30
  }
}
```

**targetSdkVersion - 目标 SDK 版本**:

应用针对的目标 Android 版本,影响系统行为适配。

**配置建议**:
- 与 minSdkVersion 保持一致或略高
- 定期更新到最新稳定版本
- 注意新版本的行为变更

**abiFilters - CPU 架构过滤**:

指定应用支持的 CPU 架构,影响包体积和兼容性。

**常用架构**:
- `armeabi-v7a`: ARM 32位,兼容性最好,包体较小
- `arm64-v8a`: ARM 64位,性能更好,是主流架构
- `x86`: Intel 32位,主要用于模拟器
- `x86_64`: Intel 64位,用于 Intel 处理器设备

**推荐配置**:
```json
{
  "abiFilters": [
    "armeabi-v7a",
    "arm64-v8a"
  ]
}
```

**说明**:
- 只包含 ARM 架构,覆盖 99% 的真实设备
- 减小包体积(不包含 x86 架构的 so 库)
- 模拟器调试需要 x86 架构时,单独配置开发版本

**permissions - 权限列表**:

声明应用需要的 Android 系统权限。

**权限分类及详解**:

**1. 网络相关权限** (必需):
```json
{
  "permissions": [
    "<uses-permission android:name=\"android.permission.INTERNET\"/>",
    "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>",
    "<uses-permission android:name=\"android.permission.ACCESS_WIFI_STATE\"/>",
    "<uses-permission android:name=\"android.permission.CHANGE_NETWORK_STATE\"/>",
    "<uses-permission android:name=\"android.permission.CHANGE_WIFI_STATE\"/>"
  ]
}
```

**权限说明**:
- `INTERNET`: 访问网络,几乎所有应用必需
- `ACCESS_NETWORK_STATE`: 获取网络状态,用于判断网络连接
- `ACCESS_WIFI_STATE`: 获取 WiFi 状态
- `CHANGE_NETWORK_STATE`: 改变网络连接状态
- `CHANGE_WIFI_STATE`: 改变 WiFi 连接状态

**2. 存储相关权限**:
```json
{
  "permissions": [
    "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\"/>",
    "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>",
    "<uses-permission android:name=\"android.permission.MOUNT_UNMOUNT_FILESYSTEMS\"/>"
  ]
}
```

**权限说明**:
- `WRITE_EXTERNAL_STORAGE`: 写入外部存储,下载文件、保存图片等
- `READ_EXTERNAL_STORAGE`: 读取外部存储,访问文件、相册等
- `MOUNT_UNMOUNT_FILESYSTEMS`: 挂载/卸载文件系统

**Android 10+ 变化**:
- 分区存储(Scoped Storage)限制外部存储访问
- 建议使用 MediaStore API 或 SAF(Storage Access Framework)

**3. 相机相关权限**:
```json
{
  "permissions": [
    "<uses-permission android:name=\"android.permission.CAMERA\"/>",
    "<uses-feature android:name=\"android.hardware.camera\"/>",
    "<uses-feature android:name=\"android.hardware.camera.autofocus\"/>",
    "<uses-permission android:name=\"android.permission.FLASHLIGHT\"/>"
  ]
}
```

**权限说明**:
- `CAMERA`: 使用相机权限,拍照、扫码等功能必需
- `android.hardware.camera`: 声明需要相机硬件
- `android.hardware.camera.autofocus`: 声明需要自动对焦
- `FLASHLIGHT`: 使用闪光灯

**uses-feature vs uses-permission**:
- `uses-permission`: 请求权限
- `uses-feature`: 声明硬件需求,不是权限
- `uses-feature` 可以设置 `required="false"` 表示可选

**4. 定位相关权限**:
```json
{
  "permissions": [
    "<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\"/>",
    "<uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\"/>",
    "<uses-permission android:name=\"android.permission.ACCESS_BACKGROUND_LOCATION\"/>"
  ]
}
```

**权限说明**:
- `ACCESS_FINE_LOCATION`: 精确定位(GPS),精度约 10 米
- `ACCESS_COARSE_LOCATION`: 粗略定位(网络),精度约 100 米
- `ACCESS_BACKGROUND_LOCATION`: 后台定位(Android 10+)

**Android 权限变化**:
- Android 6.0+: 运行时权限,需要动态申请
- Android 10+: 后台定位需要单独申请
- Android 12+: 粗略定位和精确定位分开申请

**5. 设备相关权限**:
```json
{
  "permissions": [
    "<uses-permission android:name=\"android.permission.READ_PHONE_STATE\"/>",
    "<uses-permission android:name=\"android.permission.VIBRATE\"/>",
    "<uses-permission android:name=\"android.permission.WAKE_LOCK\"/>",
    "<uses-permission android:name=\"android.permission.GET_ACCOUNTS\"/>"
  ]
}
```

**权限说明**:
- `READ_PHONE_STATE`: 读取手机状态,获取设备 ID、电话状态等
- `VIBRATE`: 控制振动器,震动反馈
- `WAKE_LOCK`: 防止设备休眠,后台任务使用
- `GET_ACCOUNTS`: 获取账户信息,第三方登录等

**6. 系统相关权限**:
```json
{
  "permissions": [
    "<uses-permission android:name=\"android.permission.READ_LOGS\"/>",
    "<uses-permission android:name=\"android.permission.WRITE_SETTINGS\"/>"
  ]
}
```

**权限说明**:
- `READ_LOGS`: 读取系统日志,仅用于调试
- `WRITE_SETTINGS`: 修改系统设置,如修改音量、亮度等

**注意**:
- `READ_LOGS` 在正式版本中应该移除
- `WRITE_SETTINGS` 是敏感权限,需要特殊处理

**权限最佳实践**:

1. **最小化原则** - 只申请必需的权限:
```json
{
  "permissions": [
    "<uses-permission android:name=\"android.permission.INTERNET\"/>",
    "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>"
  ]
}
```

2. **按需申请** - 使用功能时才申请权限:
```typescript
// 使用相机功能时才申请权限
const openCamera = async () => {
  // 检查权限
  const [err, status] = await uni.getSetting()

  if (!status.authSetting['scope.camera']) {
    // 申请权限
    await uni.authorize({ scope: 'scope.camera' })
  }

  // 打开相机
  uni.chooseImage({
    sourceType: ['camera']
  })
}
```

3. **权限分组** - 根据功能模块组织权限:
```typescript
// manifest.config.ts
const permissions = {
  network: [
    '<uses-permission android:name="android.permission.INTERNET"/>',
    '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>'
  ],
  storage: [
    '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>',
    '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>'
  ],
  camera: [
    '<uses-permission android:name="android.permission.CAMERA"/>',
    '<uses-feature android:name="android.hardware.camera"/>'
  ]
}

export default defineManifestConfig({
  'app-plus': {
    distribute: {
      android: {
        permissions: [
          ...permissions.network,
          ...permissions.storage,
          ...permissions.camera
        ]
      }
    }
  }
})
```

#### iOS 配置

iOS 平台的符号表、隐私权限等配置。

```json
{
  "app-plus": {
    "distribute": {
      "ios": {
        "dSYMs": false
      }
    }
  }
}
```

**dSYMs - 符号表文件**:

符号表文件用于调试和崩溃日志分析。

**配置说明**:
- `false`: 不生成符号表文件(默认,减小包体积)
- `true`: 生成符号表文件(用于崩溃分析)

**使用场景**:
- 开发测试: `false`
- 正式发布: `true`(用于分析线上崩溃)

**崩溃分析流程**:
1. 打包时启用 `dSYMs: true`
2. 上传 dSYM 文件到崩溃分析平台
3. 收集崩溃日志并符号化
4. 定位崩溃代码位置

**隐私权限配置**:

iOS 需要在 Info.plist 中声明隐私权限说明,这些配置在 HBuilderX 云打包时设置。

**常用隐私权限说明**:

1. **相机权限** (NSCameraUsageDescription):
```xml
<key>NSCameraUsageDescription</key>
<string>我们需要访问您的相机,以便您可以拍摄照片上传或进行扫码功能。</string>
```

2. **相册权限** (NSPhotoLibraryUsageDescription):
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>我们需要访问您的相册,以便您可以选择图片上传。</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>我们需要保存图片到您的相册。</string>
```

3. **定位权限**:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>我们需要获取您的位置信息,以便为您提供位置相关服务。</string>

<key>NSLocationAlwaysUsageDescription</key>
<string>我们需要获取您的位置信息,以便在后台为您提供持续的位置服务。</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>我们需要获取您的位置信息,以便为您提供位置相关服务。</string>
```

4. **麦克风权限** (NSMicrophoneUsageDescription):
```xml
<key>NSMicrophoneUsageDescription</key>
<string>我们需要访问您的麦克风,以便您可以录音或进行语音通话。</string>
```

5. **通讯录权限** (NSContactsUsageDescription):
```xml
<key>NSContactsUsageDescription</key>
<string>我们需要访问您的通讯录,以便您可以选择联系人。</string>
```

6. **日历权限** (NSCalendarsUsageDescription):
```xml
<key>NSCalendarsUsageDescription</key>
<string>我们需要访问您的日历,以便您可以创建和管理日程。</string>
```

7. **蓝牙权限**:
```xml
<key>NSBluetoothPeripheralUsageDescription</key>
<string>我们需要使用蓝牙功能,以便连接外部设备。</string>

<key>NSBluetoothAlwaysUsageDescription</key>
<string>我们需要使用蓝牙功能,以便持续连接外部设备。</string>
```

**权限说明编写建议**:
- 使用通俗易懂的语言,避免技术术语
- 明确说明使用该权限的目的和场景
- 不要使用模糊的表述,如"提升用户体验"
- 长度适中,一般 20-50 字
- 真实反映应用功能,不要夸大或隐瞒

**iOS 审核注意事项**:
- 不要申请不必要的权限
- 权限说明要与应用功能一致
- 后台定位需要详细说明理由
- 相册权限分"读取"和"添加"两种

#### icons - 应用图标配置

配置不同平台、不同尺寸的应用图标。

```json
{
  "app-plus": {
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
          "ipad": {
            "app": "static/app/icons/76x76.png",
            "app@2x": "static/app/icons/152x152.png",
            "notification": "static/app/icons/20x20.png",
            "notification@2x": "static/app/icons/40x40.png",
            "proapp@2x": "static/app/icons/167x167.png",
            "settings": "static/app/icons/29x29.png",
            "settings@2x": "static/app/icons/58x58.png",
            "spotlight": "static/app/icons/40x40.png",
            "spotlight@2x": "static/app/icons/80x80.png"
          },
          "iphone": {
            "app@2x": "static/app/icons/120x120.png",
            "app@3x": "static/app/icons/180x180.png",
            "notification@2x": "static/app/icons/40x40.png",
            "notification@3x": "static/app/icons/60x60.png",
            "settings@2x": "static/app/icons/58x58.png",
            "settings@3x": "static/app/icons/87x87.png",
            "spotlight@2x": "static/app/icons/80x80.png",
            "spotlight@3x": "static/app/icons/120x120.png"
          }
        }
      }
    }
  }
}
```

**Android 图标尺寸**:

Android 根据屏幕密度(DPI)使用不同尺寸的图标。

| 密度 | 倍率 | 图标尺寸 | 适用设备 |
|------|------|----------|----------|
| ldpi | 0.75x | 36x36 | 旧设备(已淘汰) |
| mdpi | 1x | 48x48 | 低密度屏幕 |
| hdpi | 1.5x | 72x72 | 中密度屏幕 |
| xhdpi | 2x | 96x96 | 高密度屏幕 |
| xxhdpi | 3x | 144x144 | 超高密度屏幕 |
| xxxhdpi | 4x | 192x192 | 超超高密度屏幕 |

**推荐配置**:
```json
{
  "android": {
    "hdpi": "static/app/icons/72x72.png",
    "xhdpi": "static/app/icons/96x96.png",
    "xxhdpi": "static/app/icons/144x144.png",
    "xxxhdpi": "static/app/icons/192x192.png"
  }
}
```

**iOS 图标尺寸**:

iOS 图标根据设备类型和用途分为多种尺寸。

**iPhone 图标**:

| 用途 | 尺寸 | 说明 |
|------|------|------|
| app@2x | 120x120 | iPhone 主屏幕图标(2x) |
| app@3x | 180x180 | iPhone 主屏幕图标(3x) |
| notification@2x | 40x40 | 通知图标(2x) |
| notification@3x | 60x60 | 通知图标(3x) |
| settings@2x | 58x58 | 设置图标(2x) |
| settings@3x | 87x87 | 设置图标(3x) |
| spotlight@2x | 80x80 | 搜索图标(2x) |
| spotlight@3x | 120x120 | 搜索图标(3x) |

**iPad 图标**:

| 用途 | 尺寸 | 说明 |
|------|------|------|
| app | 76x76 | iPad 主屏幕图标(1x) |
| app@2x | 152x152 | iPad 主屏幕图标(2x) |
| proapp@2x | 167x167 | iPad Pro 主屏幕图标 |
| notification | 20x20 | 通知图标(1x) |
| notification@2x | 40x40 | 通知图标(2x) |
| settings | 29x29 | 设置图标(1x) |
| settings@2x | 58x58 | 设置图标(2x) |
| spotlight | 40x40 | 搜索图标(1x) |
| spotlight@2x | 80x80 | 搜索图标(2x) |

**App Store 图标**:

| 用途 | 尺寸 | 说明 |
|------|------|------|
| appstore | 1024x1024 | App Store 展示图标 |

**图标设计规范**:

1. **文件格式**:
   - 格式: PNG
   - 透明度: 不透明(iOS 不支持透明图标)
   - 颜色: RGB

2. **设计要求**:
   - 避免使用圆角(系统会自动处理)
   - 不要添加阴影或高光
   - 保持图标四周留白适当
   - 图标内容居中

3. **图标内容**:
   - 简洁明了,易于识别
   - 避免细小文字和复杂图案
   - 使用品牌色彩
   - 确保在不同尺寸下都清晰

4. **命名规范**:
```
static/app/icons/
  ├── 72x72.png       # Android hdpi
  ├── 96x96.png       # Android xhdpi
  ├── 144x144.png     # Android xxhdpi
  ├── 192x192.png     # Android xxxhdpi
  ├── 1024x1024.png   # iOS App Store
  ├── 120x120.png     # iPhone app@2x
  ├── 180x180.png     # iPhone app@3x
  ├── 76x76.png       # iPad app
  └── ...             # 其他尺寸
```

**批量生成图标**:

使用 ImageMagick 批量生成不同尺寸:
```bash
# 从 1024x1024 原图生成所有尺寸
convert logo-1024.png -resize 72x72 72x72.png
convert logo-1024.png -resize 96x96 96x96.png
convert logo-1024.png -resize 144x144 144x144.png
convert logo-1024.png -resize 192x192 192x192.png
convert logo-1024.png -resize 120x120 120x120.png
convert logo-1024.png -resize 180x180 180x180.png
```

使用在线工具:
- https://icon.wuruihong.com/ - 一键生成所有尺寸图标
- https://www.appicon.co/ - iOS 和 Android 图标生成

## 小程序配置

### 微信小程序 (mp-weixin)

微信小程序平台配置,包括 AppID、编译设置、权限等。

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
      "coverView": true,
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

**appid - 小程序 AppID**:

微信小程序的唯一标识符,从微信公众平台获取。

**获取步骤**:
1. 登录微信公众平台: https://mp.weixin.qq.com/
2. 开发 → 开发管理 → 开发设置
3. 复制开发者 ID(AppID)

**示例**:
```json
{
  "mp-weixin": {
    "appid": "wxd44a6eaefd42428c"
  }
}
```

**注意事项**:
- 开发阶段可以留空,使用测试号
- 发布前必须填写正式 AppID
- 不要将 AppID 提交到公开仓库

**setting - 编译设置**:

微信小程序的编译和优化选项。

**urlCheck - URL 合法性校验**:
```json
{
  "setting": {
    "urlCheck": false
  }
}
```

- `false`: 不校验合法域名(开发环境推荐)
- `true`: 校验合法域名(生产环境必须)

**域名配置位置**:
微信公众平台 → 开发 → 开发管理 → 开发设置 → 服务器域名

**es6 - ES6 转 ES5**:
```json
{
  "setting": {
    "es6": true
  }
}
```

- `true`: 启用 ES6 转 ES5(推荐)
- `false`: 不转换,可能不兼容低版本

**enhance - 增强编译**:
```json
{
  "setting": {
    "enhance": true
  }
}
```

- `true`: 启用增强编译,优化性能
- `false`: 普通编译

**postcss - PostCSS 编译**:
```json
{
  "setting": {
    "postcss": true
  }
}
```

- `true`: 启用 PostCSS,支持 CSS 预处理
- `false`: 不使用 PostCSS

**minified - 代码压缩**:
```json
{
  "setting": {
    "minified": true
  }
}
```

- `true`: 压缩代码,减小包体积
- `false`: 不压缩,便于调试

**coverView - CoverView 渲染**:
```json
{
  "setting": {
    "coverView": true
  }
}
```

- `true`: 使用工具渲染 CoverView
- `false`: 使用原生渲染

**bigPackageSizeSupport - 大包支持**:
```json
{
  "setting": {
    "bigPackageSizeSupport": true
  }
}
```

- `true`: 支持分包异步化,提升大型小程序性能
- `false`: 不支持

**usingComponents - 自定义组件模式**:

启用自定义组件模式,必须设为 `true`。

```json
{
  "mp-weixin": {
    "usingComponents": true
  }
}
```

**lazyCodeLoading - 按需注入**:

控制小程序代码的注入时机,优化启动性能。

```json
{
  "mp-weixin": {
    "lazyCodeLoading": "requiredComponents"
  }
}
```

**选项**:
- `"requiredComponents"`: 按需注入(推荐)
- `null`: 全量注入

**效果**:
- 减少小程序启动时注入的代码量
- 首页打开更快
- 降低内存占用

**permission - 权限配置**:

声明小程序需要的用户权限,并提供权限说明。

```json
{
  "mp-weixin": {
    "permission": {
      "scope.userLocation": {
        "desc": "您的位置信息将用于小程序位置接口的效果展示"
      },
      "scope.userInfo": {
        "desc": "您的用户信息将用于完善用户资料"
      }
    }
  }
}
```

**常用权限作用域**:

| 作用域 | 说明 | 对应 API |
|--------|------|----------|
| scope.userLocation | 地理位置 | wx.getLocation, wx.chooseLocation |
| scope.userInfo | 用户信息 | wx.getUserInfo |
| scope.writePhotosAlbum | 保存到相册 | wx.saveImageToPhotosAlbum |
| scope.camera | 摄像头 | wx.createCameraContext |
| scope.record | 录音 | wx.startRecord |

**权限说明建议**:
- 明确说明使用目的
- 不要使用模糊表述
- 与实际功能一致
- 简洁明了,20-30 字

**requiredPrivateInfos - 隐私信息配置**:

声明小程序需要收集的用户隐私信息,微信要求在隐私政策中说明。

```json
{
  "mp-weixin": {
    "requiredPrivateInfos": [
      "getLocation",
      "chooseLocation",
      "chooseAddress",
      "choosePoi"
    ]
  }
}
```

**常用隐私信息**:

| 标识 | 说明 | 对应 API |
|------|------|----------|
| getLocation | 获取位置 | wx.getLocation |
| chooseLocation | 选择位置 | wx.chooseLocation |
| chooseAddress | 获取收货地址 | wx.chooseAddress |
| choosePoi | 选择POI | wx.choosePoi |
| chooseInvoiceTitle | 选择发票抬头 | wx.chooseInvoiceTitle |

**隐私政策配置**:
1. 在微信公众平台配置隐私政策
2. 在小程序中展示隐私政策弹窗
3. 用户同意后才能使用相关功能

### 支付宝小程序 (mp-alipay)

支付宝小程序平台配置。

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

**appid - 小程序 AppID**:

从支付宝开放平台获取。

**获取步骤**:
1. 登录支付宝开放平台: https://open.alipay.com/
2. 开发者中心 → 网页&移动应用 → 小程序
3. 创建小程序后获取 AppID

**styleIsolation - 样式隔离**:

控制组件样式的隔离模式。

**选项**:
- `"shared"`: 页面共享样式(默认)
- `"apply-shared"`: 启用 app.acss 的全局样式
- `"isolated"`: 完全隔离

**component2 - 组件2.0**:

启用支付宝小程序组件 2.0。

```json
{
  "mp-alipay": {
    "component2": true
  }
}
```

### 百度小程序 (mp-baidu)

百度小程序平台配置。

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
    }
  }
}
```

**compilation - 编译配置**:

```json
{
  "compilation": {
    "workers": 1
  }
}
```

- `workers`: 多进程编译数量,提升编译速度

**optimization - 优化配置**:

```json
{
  "optimization": {
    "subPackages": true
  }
}
```

- `subPackages`: 是否启用分包优化

### 抖音小程序 (mp-toutiao)

抖音小程序(字节跳动小程序)平台配置。

```json
{
  "mp-toutiao": {
    "usingComponents": true,
    "appid": "your_bytedance_app_id",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true
    }
  }
}
```

配置项与微信小程序类似。

## 快应用配置 (quickapp)

快应用是一种基于手机硬件平台的新型应用生态。

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

**配置项说明**:

- `icon`: 应用图标路径
- `package`: 应用包名,采用反域名格式
- `minPlatformVersion`: 支持的最低平台版本号
- `versionName`: 应用版本名称
- `versionCode`: 应用版本号

## uni 统计配置 (uniStatistics)

DCloud 提供的免费、开源的全端统计平台。

```json
{
  "uniStatistics": {
    "enable": false,
    "version": "2"
  }
}
```

**enable - 是否启用统计**:
- `false`: 禁用统计(默认)
- `true`: 启用统计

**version - 统计版本**:
- `"1"`: 统计 1.0
- `"2"`: 统计 2.0(推荐)

**统计功能**:
- 设备统计(UV、PV)
- 渠道统计
- 页面访问统计
- 错误统计
- 自定义事件统计

**启用统计后的使用**:

登录 DCloud 开发者中心查看统计数据: https://tongji.dcloud.net.cn/

## 最佳实践

### 1. 版本号管理

采用语义化版本规范,规范化版本发布流程。

**版本号格式**:
```
主版本号.次版本号.修订号-预发布版本
5.5.0-beta.1
```

**递增规则**:
- 主版本号: 重大功能变更或不兼容的 API 修改
- 次版本号: 新增功能,向下兼容
- 修订号: Bug 修复,向下兼容
- 预发布版本: alpha、beta、rc

**示例**:
```json
{
  "versionName": "5.5.0",
  "versionCode": "100"
}
```

**版本发布流程**:
1. 开发版: `5.5.0-alpha.1` (内部测试)
2. 测试版: `5.5.0-beta.1` (外部测试)
3. 候选版: `5.5.0-rc.1` (发布候选)
4. 正式版: `5.5.0` (正式发布)

### 2. 环境配置分离

开发、测试、生产环境使用不同的配置。

**方案一: 多配置文件**

创建不同环境的配置文件:
- `manifest.dev.json` - 开发环境
- `manifest.test.json` - 测试环境
- `manifest.prod.json` - 生产环境

构建脚本根据环境选择配置:
```json
{
  "scripts": {
    "build:h5:dev": "cross-env NODE_ENV=development uni build --outDir dist-dev",
    "build:h5:test": "cross-env NODE_ENV=test uni build --outDir dist-test",
    "build:h5:prod": "cross-env NODE_ENV=production uni build --outDir dist-prod"
  }
}
```

**方案二: TypeScript 配置 + 环境变量**

manifest.config.ts:
```typescript
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'

const isDev = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'
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

### 3. 权限最小化原则

只申请必需的权限,提升用户信任度和审核通过率。

**基础应用权限** (仅网络功能):
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

**标准应用权限** (网络 + 存储 + 基础设备):
```json
{
  "android": {
    "permissions": [
      "<uses-permission android:name=\"android.permission.INTERNET\"/>",
      "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>",
      "<uses-permission android:name=\"android.permission.ACCESS_WIFI_STATE\"/>",
      "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\"/>",
      "<uses-permission android:name=\"android.permission.CAMERA\"/>",
      "<uses-permission android:name=\"android.permission.VIBRATE\"/>"
    ]
  }
}
```

**按功能模块申请**:
- 使用相机功能时才添加 `CAMERA` 权限
- 使用定位功能时才添加 `ACCESS_FINE_LOCATION` 权限
- 使用存储功能时才添加 `WRITE_EXTERNAL_STORAGE` 权限

### 4. 图标规范管理

统一图标设计和管理流程。

**目录结构**:
```
static/app/icons/
  ├── source/
  │   └── logo-1024.png      # 原图(1024x1024)
  ├── android/
  │   ├── 72x72.png
  │   ├── 96x96.png
  │   ├── 144x144.png
  │   └── 192x192.png
  └── ios/
      ├── 1024x1024.png
      ├── 120x120.png
      ├── 180x180.png
      └── ...
```

**生成脚本** (generate-icons.sh):
```bash
#!/bin/bash

SOURCE="static/app/icons/source/logo-1024.png"
ANDROID_DIR="static/app/icons/android"
IOS_DIR="static/app/icons/ios"

# Android icons
convert $SOURCE -resize 72x72 $ANDROID_DIR/72x72.png
convert $SOURCE -resize 96x96 $ANDROID_DIR/96x96.png
convert $SOURCE -resize 144x144 $ANDROID_DIR/144x144.png
convert $SOURCE -resize 192x192 $ANDROID_DIR/192x192.png

# iOS icons
convert $SOURCE -resize 1024x1024 $IOS_DIR/1024x1024.png
convert $SOURCE -resize 120x120 $IOS_DIR/120x120.png
convert $SOURCE -resize 180x180 $IOS_DIR/180x180.png
# ... 更多尺寸

echo "Icons generated successfully!"
```

**设计规范**:
- 原图至少 1024x1024 像素
- PNG 格式,RGB 颜色
- 不透明背景
- 避免圆角(系统自动处理)
- 图标内容居中,留白适当

### 5. 性能优化配置

针对不同平台的性能优化配置。

**H5 优化**:
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

**小程序优化**:
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

**App 优化**:
```json
{
  "app-plus": {
    "compilerVersion": 3,
    "splashscreen": {
      "waiting": true,
      "autoclose": true
    }
  }
}
```

### 6. 多平台兼容性

确保配置在所有平台上正确生效。

**平台检测**:
```typescript
// manifest.config.ts
export default defineManifestConfig({
  name: 'ryplus_uni_workflow',

  // H5 配置
  h5: {
    router: {
      mode: 'history'
    }
  },

  // App 配置
  'app-plus': {
    usingComponents: true
  },

  // 微信小程序配置
  'mp-weixin': {
    usingComponents: true
  },

  // 支付宝小程序配置
  'mp-alipay': {
    usingComponents: true
  }
})
```

**条件编译**:
```typescript
// #ifdef H5
const config = { baseUrl: 'https://h5.example.com' }
// #endif

// #ifdef MP-WEIXIN
const config = { baseUrl: 'https://mp.example.com' }
// #endif

// #ifdef APP-PLUS
const config = { baseUrl: 'https://app.example.com' }
// #endif
```

## 常见问题

### 1. H5 路由模式选择

**问题**: H5 应该使用 hash 模式还是 history 模式？

**解决方案**:

开发阶段推荐 hash 模式:
```json
{
  "h5": {
    "router": {
      "mode": "hash"
    }
  }
}
```

生产环境推荐 history 模式(配置 Nginx):
```json
{
  "h5": {
    "router": {
      "mode": "history"
    }
  }
}
```

Nginx 配置:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 2. 小程序分包配置

**问题**: 小程序包体积超过 2MB 限制怎么办？

**解决方案**:

使用分包功能,在 pages.json 中配置:
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
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages/subpage"]
    }
  }
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

**问题**: Android 打包时提示权限错误或 SDK 版本不兼容？

**常见原因**:
1. minSdkVersion 设置过高
2. 权限配置格式错误
3. abiFilters 配置缺失

**解决方案**:

降低 SDK 版本:
```json
{
  "android": {
    "minSdkVersion": 21,
    "targetSdkVersion": 30
  }
}
```

检查权限格式:
```json
{
  "android": {
    "permissions": [
      "<uses-permission android:name=\"android.permission.INTERNET\"/>"
    ]
  }
}
```

添加 CPU 架构:
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

**问题**: iOS 提交审核时被拒,提示权限说明不符合要求？

**常见原因**:
1. 隐私权限说明不够详细
2. 申请了不必要的权限
3. 权限说明与实际功能不符

**解决方案**:

详细的权限说明:
```xml
<key>NSCameraUsageDescription</key>
<string>我们需要访问您的相机,以便您可以拍摄照片上传到平台,或者进行二维码/条码扫描功能。您的照片仅用于您主动上传的场景,我们不会在未经您同意的情况下访问您的相机。</string>
```

移除不必要的权限:
- 检查代码中是否真的使用了该权限
- 删除未使用权限的相关配置

### 5. H5 部署到子目录

**问题**: H5 部署到服务器子目录后,页面无法正常访问？

**解决方案**:

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

环境变量:
```bash
VITE_APP_PUBLIC_PATH=/app/
```

### 6. 微信小程序域名校验失败

**问题**: 微信小程序开发时提示"不在以下合法域名列表中"？

**开发环境解决方案**:
```json
{
  "mp-weixin": {
    "setting": {
      "urlCheck": false
    }
  }
}
```

**生产环境解决方案**:
1. 登录微信公众平台
2. 开发 → 开发管理 → 开发设置 → 服务器域名
3. 添加合法域名(需要 HTTPS 和 ICP 备案)

### 7. App 图标显示异常

**问题**: App 打包后图标显示不正确或模糊？

**常见原因**:
1. 图标尺寸不正确
2. 图标格式不符合要求
3. 图标路径配置错误

**解决方案**:

检查图标尺寸:
```bash
# 使用 ImageMagick 批量生成
convert logo.png -resize 72x72 72x72.png
convert logo.png -resize 96x96 96x96.png
convert logo.png -resize 144x144 144x144.png
```

验证图标配置:
```json
{
  "icons": {
    "android": {
      "hdpi": "static/app/icons/72x72.png"
    }
  }
}
```

图标设计建议:
- PNG 格式,透明背景
- 至少 1024x1024 原图
- 避免细小文字和复杂图案

### 8. 版本更新提示

**问题**: 如何实现 App 版本更新检测？

**解决方案**:

配置版本号:
```json
{
  "versionName": "5.5.0",
  "versionCode": "100"
}
```

版本检测逻辑:
```typescript
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
      content: `发现新版本 ${res.data.latestVersion},是否立即更新？`,
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
