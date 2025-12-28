# 原生资源复制插件

## 介绍

原生资源复制插件（copyNativeRes）是项目自研的 Vite 插件，用于在构建完成后将原生资源文件复制到对应的构建输出目录中。该插件主要用于 App 原生应用开发场景，确保原生插件资源、配置文件等在构建后正确放置。

**核心特性：**

- **自动复制** - 构建完成后自动将原生资源复制到输出目录
- **环境感知** - 根据开发/生产环境自动选择正确的输出路径
- **平台适配** - 支持 App、小程序等多平台构建
- **递归复制** - 完整复制目录结构，包含所有子目录和文件
- **安全执行** - 在所有插件执行完毕后运行，避免被覆盖
- **容错处理** - 源目录不存在时跳过，不中断构建流程

**使用场景：**

- uni-app 项目中需要包含原生插件资源
- 需要复制静态资源到特定平台的构建目录
- 确保原生代码、配置文件等在构建后正确放置
- App 原生模块（如推送、地图、支付等）的资源集成

## 基本用法

### 插件配置

在 `vite/plugins/index.ts` 中配置插件：

```typescript
import copyNativeRes from './copyNativeRes'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  const { UNI_PLATFORM } = process.env

  // 其他插件...

  // App 平台资源复制（仅在 App 平台启用）
  if (UNI_PLATFORM === 'app') {
    vitePlugins.push(copyNativeRes())
  }

  // Uni 插件必须放在最后
  vitePlugins.push(Uni())

  return vitePlugins
}
```

### 创建原生资源目录

在项目根目录下创建 `src/nativeResources` 目录，放置需要复制的原生资源：

```
src/
└── nativeResources/           # 原生资源目录
    ├── android/               # Android 平台资源
    │   ├── libs/              # 原生库文件
    │   │   └── xxx.aar
    │   └── res/               # 资源文件
    │       └── drawable/
    ├── ios/                   # iOS 平台资源
    │   ├── Frameworks/        # 框架文件
    │   │   └── xxx.framework
    │   └── Resources/         # 资源文件
    │       └── xxx.bundle
    └── common/                # 通用资源
        ├── config.json        # 配置文件
        └── certificates/      # 证书文件
```

### 构建输出

构建完成后，原生资源会被复制到对应的输出目录：

**开发环境：**
```
dist/dev/app/nativeResources/
├── android/
├── ios/
└── common/
```

**生产环境：**
```
dist/build/app/nativeResources/
├── android/
├── ios/
└── common/
```

## 工作原理

### 执行流程

```
┌─────────────────────────────────────────────────────────┐
│                   插件执行流程                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Vite 构建开始                                           │
│       ↓                                                 │
│  其他插件执行（enforce: 'post' 确保最后执行）              │
│       ↓                                                 │
│  writeBundle 钩子触发（文件已写入磁盘）                    │
│       ↓                                                 │
│  检查源目录是否存在                                       │
│       ↓                                                 │
│  存在？ ──否──> 输出警告，跳过复制                         │
│       │                                                 │
│       是                                                │
│       ↓                                                 │
│  确保目标目录存在                                         │
│       ↓                                                 │
│  递归复制所有文件和目录                                   │
│       ↓                                                 │
│  输出成功日志                                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 路径规则

插件根据环境变量自动计算源目录和目标目录：

| 环境变量 | 说明 | 示例值 |
|---------|------|--------|
| `VITE_APP_ENV` | 应用环境 | `'development'` / `'production'` |
| `UNI_PLATFORM` | uni-app 平台标识 | `'app'` / `'mp-weixin'` / `'h5'` |

**目标路径计算规则：**

```typescript
// 源目录（固定）
const sourcePath = 'src/nativeResources'

// 目标目录（动态）
const targetPath = `dist/${env}/${platform}/nativeResources`

// 示例：
// 开发环境 + App 平台 → dist/dev/app/nativeResources
// 生产环境 + App 平台 → dist/build/app/nativeResources
// 开发环境 + 微信小程序 → dist/dev/mp-weixin/nativeResources
```

### 执行时机

插件使用 `enforce: 'post'` 和 `writeBundle` 钩子，确保在最佳时机执行：

```typescript
return {
  // 在所有其他插件执行完毕后运行
  enforce: 'post' as const,

  // writeBundle 钩子：在构建完成，文件写入磁盘后执行
  async writeBundle() {
    // 复制资源文件
  },
}
```

**为什么选择 writeBundle 钩子：**

1. 此时所有构建文件已写入磁盘
2. 不会被其他插件覆盖
3. 目标目录结构已完整创建
4. 可以安全地进行文件操作

## 目录结构规范

### 推荐的目录结构

```
src/nativeResources/
├── android/                      # Android 平台专用资源
│   ├── libs/                     # 原生库
│   │   ├── xxx-sdk.aar          # AAR 库文件
│   │   └── xxx.jar              # JAR 库文件
│   ├── res/                      # 资源文件
│   │   ├── drawable/            # 图片资源
│   │   ├── values/              # 值资源
│   │   └── xml/                 # XML 配置
│   ├── assets/                   # 资产文件
│   │   └── fonts/               # 字体文件
│   └── AndroidManifest.xml       # 清单文件片段
│
├── ios/                          # iOS 平台专用资源
│   ├── Frameworks/               # 框架文件
│   │   └── XXX.framework        # 动态框架
│   ├── Libraries/                # 静态库
│   │   └── libxxx.a             # 静态库文件
│   ├── Resources/                # 资源包
│   │   └── XXX.bundle           # 资源包
│   ├── Plugins/                  # 插件文件
│   │   └── XXX.appex            # App 扩展
│   └── Info.plist                # 配置文件片段
│
├── common/                       # 通用资源（跨平台）
│   ├── config/                   # 配置文件
│   │   ├── app.json             # 应用配置
│   │   └── sdk.json             # SDK 配置
│   ├── certificates/             # 证书文件
│   │   ├── push.p12             # 推送证书
│   │   └── sign.keystore        # 签名文件
│   ├── data/                     # 数据文件
│   │   └── initial.db           # 初始数据库
│   └── scripts/                  # 脚本文件
│       └── post-build.sh        # 构建后脚本
│
└── plugins/                      # 原生插件资源
    ├── push/                     # 推送插件
    │   ├── android/
    │   └── ios/
    ├── map/                      # 地图插件
    │   ├── android/
    │   └── ios/
    └── payment/                  # 支付插件
        ├── android/
        └── ios/
```

### 文件类型说明

| 文件类型 | 说明 | 存放位置 |
|---------|------|---------|
| `.aar` | Android 库文件 | `android/libs/` |
| `.jar` | Java 库文件 | `android/libs/` |
| `.framework` | iOS 动态框架 | `ios/Frameworks/` |
| `.a` | iOS 静态库 | `ios/Libraries/` |
| `.bundle` | iOS 资源包 | `ios/Resources/` |
| `.json` | 配置文件 | `common/config/` |
| `.p12` / `.pem` | 证书文件 | `common/certificates/` |
| `.keystore` | 签名文件 | `common/certificates/` |
| `.db` / `.sqlite` | 数据库文件 | `common/data/` |

## 使用示例

### 集成推送插件资源

```
src/nativeResources/
└── plugins/
    └── push/
        ├── android/
        │   ├── libs/
        │   │   └── jpush-android-4.0.0.aar
        │   └── res/
        │       └── values/
        │           └── jpush_config.xml
        └── ios/
            ├── Frameworks/
            │   └── JPush.framework
            └── Resources/
                └── PushConfig.plist
```

### 集成地图 SDK

```
src/nativeResources/
└── plugins/
    └── map/
        ├── android/
        │   └── libs/
        │       ├── AMap3DMap_9.5.0.aar
        │       └── AMapLocation_6.1.0.aar
        └── ios/
            ├── Frameworks/
            │   ├── MAMapKit.framework
            │   └── AMapLocationKit.framework
            └── Resources/
                └── AMap.bundle
```

### 集成支付 SDK

```
src/nativeResources/
└── plugins/
    └── payment/
        ├── android/
        │   └── libs/
        │       ├── alipaySdk-15.8.11.aar
        │       └── wechat-sdk-android.aar
        └── ios/
            ├── Frameworks/
            │   ├── AlipaySDK.framework
            │   └── WechatOpenSDK.framework
            └── Resources/
                └── AlipaySDK.bundle
```

### 自定义原生模块

```
src/nativeResources/
└── modules/
    └── custom-module/
        ├── android/
        │   ├── src/
        │   │   └── CustomModule.java
        │   └── libs/
        │       └── custom.aar
        ├── ios/
        │   ├── Classes/
        │   │   ├── CustomModule.h
        │   │   └── CustomModule.m
        │   └── Frameworks/
        │       └── Custom.framework
        └── config.json
```

## 控制台输出

### 正常执行

```
[copyNativeRes] 确保目标目录存在：/project/dist/build/app/nativeResources
[copyNativeRes] 成功将 nativeResources 目录中的资源移动到构建目录：/project/dist/build/app/nativeResources
```

### 源目录不存在

```
[copyNativeRes] 警告：源目录 "/project/src/nativeResources" 不存在，跳过复制操作。
```

### 复制失败

```
[copyNativeRes] 复制资源失败：Error: EACCES: permission denied
```

## API

### 插件导出

```typescript
import copyNativeRes from './copyNativeRes'

const plugin = copyNativeRes(): Plugin
```

### 插件配置

该插件目前不接受配置参数，使用固定的源目录和动态计算的目标目录：

| 配置项 | 值 | 说明 |
|-------|-----|------|
| 源目录 | `src/nativeResources` | 固定路径 |
| 目标目录 | `dist/{env}/{platform}/nativeResources` | 动态计算 |
| 执行时机 | `writeBundle` | 构建完成后 |
| 执行顺序 | `enforce: 'post'` | 最后执行 |

### 环境变量依赖

| 环境变量 | 说明 | 必需 |
|---------|------|------|
| `VITE_APP_ENV` | 应用环境（`development` / `production`） | 是 |
| `UNI_PLATFORM` | uni-app 平台标识 | 是 |

## 最佳实践

### 1. 按平台组织资源

将不同平台的资源分开存放，便于管理和维护：

```
src/nativeResources/
├── android/    # Android 专用
├── ios/        # iOS 专用
└── common/     # 跨平台通用
```

### 2. 仅在 App 平台启用

由于原生资源仅在 App 构建时需要，建议按平台条件启用：

```typescript
const { UNI_PLATFORM } = process.env

if (UNI_PLATFORM === 'app') {
  vitePlugins.push(copyNativeRes())
}
```

### 3. 版本管理原生 SDK

在资源目录中包含版本信息，便于追踪和更新：

```
src/nativeResources/
└── plugins/
    └── push/
        ├── android/
        │   └── libs/
        │       └── jpush-android-4.0.0.aar    # 包含版本号
        └── VERSION.txt                         # 版本说明文件
```

### 4. 添加 README 说明

为复杂的原生资源添加说明文档：

```
src/nativeResources/
└── plugins/
    └── map/
        ├── README.md           # 使用说明
        ├── CHANGELOG.md        # 变更记录
        ├── android/
        └── ios/
```

### 5. Git LFS 管理大文件

对于较大的原生库文件，使用 Git LFS 管理：

```gitattributes
# .gitattributes
src/nativeResources/**/*.aar filter=lfs diff=lfs merge=lfs -text
src/nativeResources/**/*.framework/** filter=lfs diff=lfs merge=lfs -text
src/nativeResources/**/*.a filter=lfs diff=lfs merge=lfs -text
```

### 6. 环境隔离

为不同环境准备不同的配置文件：

```
src/nativeResources/
└── common/
    └── config/
        ├── app.dev.json        # 开发环境配置
        ├── app.staging.json    # 测试环境配置
        └── app.prod.json       # 生产环境配置
```

## 与 uni-app 原生插件配合

### 本地原生插件

uni-app 支持本地原生插件，插件资源可以放在 `nativeResources` 目录：

```
src/nativeResources/
└── nativeplugins/
    └── MyPlugin/
        ├── android/
        │   ├── libs/
        │   └── src/
        ├── ios/
        │   ├── Frameworks/
        │   └── Classes/
        └── package.json         # 插件配置
```

### 云端原生插件

对于云端原生插件的本地资源，也可以通过此插件复制：

```
src/nativeResources/
└── cloud-plugins/
    └── xxx-plugin/
        └── config/
            └── local-config.json   # 本地配置文件
```

## 常见问题

### 1. 资源未被复制

**问题原因：**
- 源目录不存在或路径错误
- 插件未在 App 平台启用
- 构建命令未正确设置环境变量

**解决方案：**

```bash
# 确保目录存在
mkdir -p src/nativeResources

# 确保使用正确的构建命令
pnpm build:app
```

检查插件是否启用：

```typescript
if (UNI_PLATFORM === 'app') {
  vitePlugins.push(copyNativeRes())
}
```

### 2. 权限错误

**问题原因：**
- 目标目录没有写入权限
- 文件被其他进程占用

**解决方案：**

```bash
# 清理构建目录
rm -rf dist/

# 重新构建
pnpm build:app
```

### 3. 大文件复制慢

**问题原因：**
- 原生 SDK 文件较大
- 磁盘 I/O 性能限制

**解决方案：**

1. 使用 SSD 硬盘
2. 考虑将不常变动的大文件移出项目
3. 使用符号链接代替复制（高级用法）

### 4. 目录结构不正确

**问题原因：**
- 源目录结构与预期不符
- 子目录嵌套过深

**解决方案：**

确保遵循推荐的目录结构：

```
src/nativeResources/
├── android/
├── ios/
└── common/
```

### 5. 与 HBuilderX 云打包冲突

**问题原因：**
- HBuilderX 云打包有自己的资源处理机制

**解决方案：**

对于云打包场景，建议：

1. 使用 HBuilderX 的原生插件市场
2. 将本地插件上传到云端
3. 或使用本地打包方式

### 6. 增量构建时资源未更新

**问题原因：**
- Vite 增量构建可能跳过 writeBundle 钩子

**解决方案：**

```bash
# 清理后重新构建
pnpm clean && pnpm build:app

# 或者强制完整构建
rm -rf dist/ && pnpm build:app
```

## 扩展配置

如果需要自定义源目录或目标目录，可以修改插件代码：

```typescript
// copyNativeRes.ts
export default (options: {
  sourceDir?: string
  targetDir?: string
} = {}) => {
  const {
    sourceDir = 'src/nativeResources',
    targetDir = 'nativeResources',
  } = options

  const sourcePath = path.resolve(__dirname, '..', sourceDir)

  const targetPath = path.resolve(
    __dirname,
    '../dist',
    process.env.VITE_APP_ENV === 'production' ? 'build' : 'dev',
    process.env.UNI_PLATFORM!,
    targetDir,
  )

  // ... 其余代码
}
```

使用自定义配置：

```typescript
vitePlugins.push(copyNativeRes({
  sourceDir: 'native-assets',
  targetDir: 'assets/native',
}))
```
