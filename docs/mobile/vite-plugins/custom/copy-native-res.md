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
- **异步操作** - 使用 fs-extra 异步 API，不阻塞构建流程
- **日志输出** - 提供清晰的控制台日志，便于调试

**使用场景：**

- uni-app 项目中需要包含原生插件资源
- 需要复制静态资源到特定平台的构建目录
- 确保原生代码、配置文件等在构建后正确放置
- App 原生模块（如推送、地图、支付等）的资源集成
- 自定义原生模块开发中的资源管理
- 第三方 SDK 集成所需的配置文件分发

## 架构设计

### 插件系统架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Vite 构建流程                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │  配置解析    │ -> │  模块解析    │ -> │  代码转换    │                 │
│  │  (config)   │    │  (resolve)  │    │ (transform) │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                  │                  │                         │
│         v                  v                  v                         │
│  ┌─────────────────────────────────────────────────────┐               │
│  │                    Bundle 生成                       │               │
│  │              (renderChunk, generateBundle)          │               │
│  └─────────────────────────────────────────────────────┘               │
│                              │                                          │
│                              v                                          │
│  ┌─────────────────────────────────────────────────────┐               │
│  │                   writeBundle 钩子                   │               │
│  │              (文件已写入磁盘后触发)                    │               │
│  └─────────────────────────────────────────────────────┘               │
│                              │                                          │
│                              v                                          │
│  ┌─────────────────────────────────────────────────────┐               │
│  │                 copyNativeRes 插件                   │ <- enforce:post│
│  │           复制 nativeResources 到构建目录             │               │
│  └─────────────────────────────────────────────────────┘               │
│                              │                                          │
│                              v                                          │
│  ┌─────────────────────────────────────────────────────┐               │
│  │                     构建完成                          │               │
│  └─────────────────────────────────────────────────────┘               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 资源复制流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        copyNativeRes 执行流程                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  开始                                                                   │
│    │                                                                    │
│    v                                                                    │
│  ┌─────────────────────────────────────────┐                           │
│  │ 计算源路径                                │                           │
│  │ src/nativeResources (固定)               │                           │
│  └─────────────────────────────────────────┘                           │
│    │                                                                    │
│    v                                                                    │
│  ┌─────────────────────────────────────────┐                           │
│  │ 计算目标路径                              │                           │
│  │ dist/{env}/{platform}/nativeResources    │                           │
│  │ 环境: development -> dev, production -> build                        │
│  │ 平台: app, mp-weixin, h5, etc.           │                           │
│  └─────────────────────────────────────────┘                           │
│    │                                                                    │
│    v                                                                    │
│  ┌─────────────────────────────────────────┐                           │
│  │ 检查源目录是否存在                         │                           │
│  │ fs.pathExists(waitPath)                  │                           │
│  └─────────────────────────────────────────┘                           │
│    │                    │                                               │
│   不存在               存在                                              │
│    │                    │                                               │
│    v                    v                                               │
│  ┌────────────┐  ┌─────────────────────────────────────────┐           │
│  │ 输出警告    │  │ 确保目标目录存在                         │           │
│  │ 跳过复制    │  │ fs.ensureDir(buildPath)                 │           │
│  └────────────┘  └─────────────────────────────────────────┘           │
│                           │                                             │
│                           v                                             │
│                  ┌─────────────────────────────────────────┐           │
│                  │ 递归复制文件                             │           │
│                  │ fs.copy(waitPath, buildPath)            │           │
│                  └─────────────────────────────────────────┘           │
│                           │                                             │
│                           v                                             │
│                  ┌─────────────────────────────────────────┐           │
│                  │ 输出成功日志                             │           │
│                  └─────────────────────────────────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 目录映射关系

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          目录映射关系图                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  源目录 (固定)                          目标目录 (动态)                   │
│  ──────────────                        ──────────────                    │
│                                                                          │
│  src/nativeResources/                                                    │
│  ├── android/        ──────────────>   dist/dev/app/nativeResources/     │
│  │   ├── libs/                         ├── android/                      │
│  │   └── res/                          │   ├── libs/                     │
│  ├── ios/                              │   └── res/                      │
│  │   ├── Frameworks/                   ├── ios/                          │
│  │   └── Resources/                    │   ├── Frameworks/               │
│  └── common/                           │   └── Resources/                │
│      ├── config/                       └── common/                       │
│      └── data/                             ├── config/                   │
│                                            └── data/                     │
│                                                                          │
│  环境变量决定目标目录:                                                    │
│  ┌──────────────────┬────────────────────┬──────────────────────────┐   │
│  │ VITE_APP_ENV     │ UNI_PLATFORM       │ 目标路径                  │   │
│  ├──────────────────┼────────────────────┼──────────────────────────┤   │
│  │ development      │ app                │ dist/dev/app/...         │   │
│  │ production       │ app                │ dist/build/app/...       │   │
│  │ development      │ mp-weixin          │ dist/dev/mp-weixin/...   │   │
│  │ production       │ mp-weixin          │ dist/build/mp-weixin/... │   │
│  │ development      │ h5                 │ dist/dev/h5/...          │   │
│  │ production       │ h5                 │ dist/build/h5/...        │   │
│  └──────────────────┴────────────────────┴──────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## 核心实现

### 源码解析

```typescript
import path from 'node:path'
import fs from 'fs-extra'
import process from 'node:process'

/**
 * 复制原生资源文件插件
 *
 * 作用：在构建完成后，将 src/nativeResources 目录下的原生资源文件
 *      复制到对应的构建输出目录中
 *
 * 使用场景：
 * - uni-app 项目中需要包含原生插件资源
 * - 需要复制静态资源到特定平台的构建目录
 * - 确保原生代码、配置文件等在构建后正确放置
 *
 * 构建路径规则：
 * - 开发环境：dist/dev/{平台}/nativeResources/
 * - 生产环境：dist/build/{平台}/nativeResources/
 *
 * @returns Vite/Rollup 插件对象
 */
export default () => {
  // 源目录：项目根目录下的 src/nativeResources
  const waitPath = path.resolve(__dirname, '../src/nativeResources')

  // 目标目录：根据环境和平台动态构建路径
  // 格式：dist/{build|dev}/{平台}/nativeResources
  const buildPath = path.resolve(
    __dirname,
    '../dist',
    process.env.VITE_APP_ENV === 'production' ? 'build' : 'dev', // 环境目录
    process.env.UNI_PLATFORM!, // uni-app 平台标识（如：mp-weixin, app-plus 等）
    'nativeResources',
  )

  return {
    // 插件执行时机：在所有其他插件执行完毕后运行
    enforce: 'post' as const,

    /**
     * writeBundle 钩子：在构建完成，文件写入磁盘后执行
     * 这是复制资源文件的最佳时机，确保不会被其他插件覆盖
     */
    async writeBundle() {
      try {
        // 1. 检查源目录是否存在
        const sourceExists = await fs.pathExists(waitPath)
        if (!sourceExists) {
          console.warn(`[copyNativeRes] 警告：源目录 "${waitPath}" 不存在，跳过复制操作。`)
          return
        }

        // 2. 确保目标目录及其父级目录存在
        await fs.ensureDir(buildPath)
        console.log(`[copyNativeRes] 确保目标目录存在：${buildPath}`)

        // 3. 执行递归复制操作（包含子目录和文件）
        await fs.copy(waitPath, buildPath)
        console.log(
          `[copyNativeRes] 成功将 nativeResources 目录中的资源移动到构建目录：${buildPath}`,
        )
      } catch (error) {
        // 4. 错误处理：记录详细错误信息但不中断构建流程
        console.error(`[copyNativeRes] 复制资源失败：`, error)
      }
    },
  }
}
```

### 关键技术点

#### 1. enforce: 'post' 执行顺序

Vite 插件的执行顺序由 `enforce` 属性控制：

| 值 | 说明 | 适用场景 |
|----|------|---------|
| `'pre'` | 在其他插件之前执行 | 需要先处理的转换操作 |
| 无 | 正常顺序执行 | 大多数插件 |
| `'post'` | 在其他插件之后执行 | 需要在最后执行的操作 |

copyNativeRes 使用 `enforce: 'post'` 确保在所有其他插件处理完毕后再执行复制操作，避免被覆盖。

#### 2. writeBundle 钩子时机

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Rollup 构建钩子顺序                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  构建阶段 (Build Phase)                                              │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐         │
│  │ buildStart  │  resolveId  │    load     │  transform  │         │
│  └─────────────┴─────────────┴─────────────┴─────────────┘         │
│                              │                                      │
│                              v                                      │
│  输出阶段 (Output Phase)                                             │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐         │
│  │ renderStart │ renderChunk │ generateBundle│ writeBundle│ <-- 这里│
│  └─────────────┴─────────────┴─────────────┴─────────────┘         │
│                                                                     │
│  writeBundle 特点:                                                   │
│  - 文件已完全写入磁盘                                                 │
│  - 可以安全地进行文件操作                                             │
│  - 不会影响 bundle 内容                                              │
│  - 适合做后处理操作                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3. fs-extra 库使用

项目使用 `fs-extra` 替代原生 `fs` 模块，提供更强大的文件操作能力：

| 方法 | 说明 | 原生等价 |
|------|------|---------|
| `fs.pathExists()` | 检查路径是否存在 | `fs.existsSync()` + Promise |
| `fs.ensureDir()` | 确保目录存在，不存在则创建 | `fs.mkdirSync({ recursive: true })` |
| `fs.copy()` | 递归复制文件/目录 | 需要手动实现递归 |

```typescript
// fs-extra 的优势

// 1. 异步 + Promise 支持
await fs.pathExists(path)  // 返回 Promise<boolean>
await fs.ensureDir(path)   // 自动创建父目录
await fs.copy(src, dest)   // 递归复制，自动处理目录

// 2. 更简洁的错误处理
try {
  await fs.copy(src, dest)
} catch (error) {
  // 统一的错误处理
}

// 3. 原生 fs 需要的等价实现
import { existsSync, mkdirSync, cpSync } from 'node:fs'

// 检查是否存在
const exists = existsSync(path)

// 确保目录存在
mkdirSync(path, { recursive: true })

// 递归复制 (Node.js 16.7+)
cpSync(src, dest, { recursive: true })
```

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

### 条件启用

根据不同平台条件启用插件：

```typescript
// 仅 App 平台
if (UNI_PLATFORM === 'app') {
  vitePlugins.push(copyNativeRes())
}

// App 和小程序平台
if (['app', 'mp-weixin', 'mp-alipay'].includes(UNI_PLATFORM)) {
  vitePlugins.push(copyNativeRes())
}

// 仅生产环境
if (command === 'build') {
  vitePlugins.push(copyNativeRes())
}

// 生产环境 + App 平台
if (command === 'build' && UNI_PLATFORM === 'app') {
  vitePlugins.push(copyNativeRes())
}
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
| `.so` | 原生共享库 | `android/libs/{abi}/` |
| `.framework` | iOS 动态框架 | `ios/Frameworks/` |
| `.xcframework` | iOS 通用框架 | `ios/Frameworks/` |
| `.a` | iOS 静态库 | `ios/Libraries/` |
| `.bundle` | iOS 资源包 | `ios/Resources/` |
| `.json` | 配置文件 | `common/config/` |
| `.p12` / `.pem` | 证书文件 | `common/certificates/` |
| `.keystore` | 签名文件 | `common/certificates/` |
| `.db` / `.sqlite` | 数据库文件 | `common/data/` |

### 平台特定资源

#### Android 平台资源

```
src/nativeResources/android/
├── libs/                         # 库文件目录
│   ├── xxx.aar                  # Android Archive
│   ├── xxx.jar                  # Java Archive
│   ├── armeabi-v7a/             # ARM v7 架构
│   │   └── libxxx.so
│   ├── arm64-v8a/               # ARM v8 架构
│   │   └── libxxx.so
│   ├── x86/                     # x86 架构
│   │   └── libxxx.so
│   └── x86_64/                  # x86_64 架构
│       └── libxxx.so
├── res/                          # 资源目录
│   ├── drawable/                # 图片资源
│   ├── drawable-hdpi/           # 高分辨率图片
│   ├── drawable-xhdpi/          # 超高分辨率图片
│   ├── drawable-xxhdpi/         # 超超高分辨率图片
│   ├── values/                  # 值资源
│   │   ├── strings.xml          # 字符串
│   │   ├── colors.xml           # 颜色
│   │   └── styles.xml           # 样式
│   └── xml/                     # XML 配置
│       └── network_security.xml # 网络安全配置
├── assets/                       # 资产文件
│   ├── fonts/                   # 字体
│   └── data/                    # 数据文件
└── AndroidManifest.xml           # 清单文件片段
```

#### iOS 平台资源

```
src/nativeResources/ios/
├── Frameworks/                   # 框架目录
│   ├── XXX.framework/           # 动态框架
│   │   ├── XXX                  # 二进制文件
│   │   ├── Headers/             # 头文件
│   │   ├── Modules/             # 模块映射
│   │   └── Info.plist           # 框架信息
│   └── XXX.xcframework/         # 通用框架
│       ├── ios-arm64/           # iOS 设备
│       ├── ios-arm64_x86_64-simulator/ # 模拟器
│       └── Info.plist
├── Libraries/                    # 静态库目录
│   ├── libxxx.a                 # 静态库
│   └── Headers/                 # 头文件
│       └── xxx.h
├── Resources/                    # 资源目录
│   ├── XXX.bundle/              # 资源包
│   │   ├── images/              # 图片
│   │   ├── fonts/               # 字体
│   │   └── Info.plist           # 资源包信息
│   └── Assets.xcassets/         # 资产目录
├── Plugins/                      # 插件目录
│   └── XXXExtension.appex/      # App 扩展
└── Info.plist                    # 配置片段
```

## 使用示例

### 集成推送插件资源

```
src/nativeResources/
└── plugins/
    └── push/
        ├── android/
        │   ├── libs/
        │   │   ├── jpush-android-4.0.0.aar
        │   │   └── jcore-android-3.0.0.aar
        │   └── res/
        │       └── values/
        │           └── jpush_config.xml
        └── ios/
            ├── Frameworks/
            │   ├── JPush.framework
            │   └── JCore.framework
            └── Resources/
                └── PushConfig.plist
```

**jpush_config.xml 示例：**

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- JPush AppKey -->
    <string name="JPUSH_APPKEY">your_app_key_here</string>
    <!-- 渠道标识 -->
    <string name="JPUSH_CHANNEL">developer-default</string>
</resources>
```

### 集成地图 SDK

```
src/nativeResources/
└── plugins/
    └── map/
        ├── android/
        │   ├── libs/
        │   │   ├── AMap3DMap_9.5.0.aar
        │   │   ├── AMapLocation_6.1.0.aar
        │   │   └── AMapSearch_9.4.0.aar
        │   └── res/
        │       └── values/
        │           └── amap_config.xml
        └── ios/
            ├── Frameworks/
            │   ├── MAMapKit.framework
            │   ├── AMapLocationKit.framework
            │   └── AMapSearchKit.framework
            └── Resources/
                └── AMap.bundle
```

**amap_config.xml 示例：**

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 高德地图 API Key -->
    <string name="AMAP_API_KEY">your_api_key_here</string>
</resources>
```

### 集成支付 SDK

```
src/nativeResources/
└── plugins/
    └── payment/
        ├── android/
        │   └── libs/
        │       ├── alipaySdk-15.8.11.aar
        │       └── wechat-sdk-android-6.8.0.aar
        └── ios/
            ├── Frameworks/
            │   ├── AlipaySDK.framework
            │   └── WXApi.xcframework
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
        │   │   └── com/
        │   │       └── example/
        │   │           └── CustomModule.java
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

**config.json 示例：**

```json
{
  "name": "custom-module",
  "version": "1.0.0",
  "description": "自定义原生模块",
  "platforms": {
    "android": {
      "minSdkVersion": 21,
      "targetSdkVersion": 33
    },
    "ios": {
      "minVersion": "12.0"
    }
  }
}
```

### 初始数据库

```
src/nativeResources/
└── common/
    └── data/
        ├── initial.db           # SQLite 初始数据库
        ├── initial.db.sql       # SQL 脚本备份
        └── README.md            # 数据库说明
```

**README.md 示例：**

```markdown
# 初始数据库说明

## 版本信息
- 版本: 1.0.0
- 创建时间: 2024-01-01
- 更新时间: 2024-06-01

## 表结构
- users: 用户表
- settings: 设置表
- cache: 缓存表

## 注意事项
- 首次启动时自动复制到应用数据目录
- 更新数据库版本时需要处理迁移逻辑
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

### 调试日志增强

可以添加更详细的日志输出：

```typescript
export default (options: { verbose?: boolean } = {}) => {
  const { verbose = false } = options

  return {
    enforce: 'post' as const,
    async writeBundle() {
      try {
        const sourceExists = await fs.pathExists(waitPath)
        if (!sourceExists) {
          console.warn(`[copyNativeRes] 警告：源目录不存在，跳过复制。`)
          return
        }

        if (verbose) {
          // 统计文件数量
          const files = await fs.readdir(waitPath, { recursive: true })
          console.log(`[copyNativeRes] 发现 ${files.length} 个文件/目录`)
        }

        await fs.ensureDir(buildPath)
        await fs.copy(waitPath, buildPath)

        if (verbose) {
          // 输出复制详情
          const stats = await fs.stat(buildPath)
          console.log(`[copyNativeRes] 复制完成，目标目录大小：${stats.size} bytes`)
        }

        console.log(`[copyNativeRes] 成功复制到：${buildPath}`)
      } catch (error) {
        console.error(`[copyNativeRes] 复制失败：`, error)
      }
    },
  }
}
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

### 类型定义

```typescript
import type { Plugin } from 'vite'

/**
 * 复制原生资源插件配置选项
 */
interface CopyNativeResOptions {
  /**
   * 源目录路径，相对于项目根目录
   * @default 'src/nativeResources'
   */
  sourceDir?: string

  /**
   * 目标目录名称
   * @default 'nativeResources'
   */
  targetDir?: string

  /**
   * 是否输出详细日志
   * @default false
   */
  verbose?: boolean

  /**
   * 是否在复制前清空目标目录
   * @default false
   */
  clean?: boolean

  /**
   * 文件过滤函数
   * @param path 文件路径
   * @returns 是否包含该文件
   */
  filter?: (path: string) => boolean
}

/**
 * 创建原生资源复制插件
 * @param options 插件配置选项
 * @returns Vite 插件实例
 */
declare function copyNativeRes(options?: CopyNativeResOptions): Plugin

export default copyNativeRes
```

### 扩展配置实现

```typescript
import path from 'node:path'
import fs from 'fs-extra'
import process from 'node:process'
import type { Plugin } from 'vite'

interface CopyNativeResOptions {
  sourceDir?: string
  targetDir?: string
  verbose?: boolean
  clean?: boolean
  filter?: (path: string) => boolean
}

export default (options: CopyNativeResOptions = {}): Plugin => {
  const {
    sourceDir = 'src/nativeResources',
    targetDir = 'nativeResources',
    verbose = false,
    clean = false,
    filter,
  } = options

  let projectRoot = ''

  return {
    name: 'copy-native-res',
    enforce: 'post',

    configResolved(config) {
      projectRoot = config.root
    },

    async writeBundle() {
      const sourcePath = path.resolve(projectRoot, sourceDir)
      const destPath = path.resolve(
        projectRoot,
        'dist',
        process.env.VITE_APP_ENV === 'production' ? 'build' : 'dev',
        process.env.UNI_PLATFORM!,
        targetDir,
      )

      try {
        // 检查源目录
        const sourceExists = await fs.pathExists(sourcePath)
        if (!sourceExists) {
          if (verbose) {
            console.warn(`[copyNativeRes] 源目录不存在：${sourcePath}`)
          }
          return
        }

        // 清空目标目录
        if (clean && (await fs.pathExists(destPath))) {
          await fs.remove(destPath)
          if (verbose) {
            console.log(`[copyNativeRes] 已清空目标目录：${destPath}`)
          }
        }

        // 确保目标目录存在
        await fs.ensureDir(destPath)

        // 复制文件
        await fs.copy(sourcePath, destPath, {
          filter: filter
            ? (src) => filter(path.relative(sourcePath, src))
            : undefined,
        })

        console.log(`[copyNativeRes] 复制完成：${destPath}`)
      } catch (error) {
        console.error(`[copyNativeRes] 复制失败：`, error)
      }
    },
  }
}
```

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
src/nativeResources/**/*.so filter=lfs diff=lfs merge=lfs -text
src/nativeResources/**/*.xcframework/** filter=lfs diff=lfs merge=lfs -text
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

使用时可通过环境变量选择：

```typescript
// 根据环境加载不同配置
const env = process.env.VITE_APP_ENV
const configFile = `app.${env === 'production' ? 'prod' : 'dev'}.json`
```

### 7. 敏感文件处理

对于包含敏感信息的文件（如证书、密钥），建议：

```gitignore
# .gitignore
src/nativeResources/common/certificates/
src/nativeResources/**/*.p12
src/nativeResources/**/*.pem
src/nativeResources/**/*.keystore
```

使用 `.gitignore.example` 提供模板：

```
# .gitignore.example
# 复制为 .gitignore 并根据需要调整
src/nativeResources/common/certificates/push.p12
src/nativeResources/common/certificates/sign.keystore
```

### 8. 资源完整性校验

为重要的原生资源添加校验文件：

```
src/nativeResources/
└── plugins/
    └── sdk/
        ├── libs/
        │   └── sdk.aar
        └── checksums.json       # 校验文件
```

**checksums.json 示例：**

```json
{
  "files": {
    "libs/sdk.aar": {
      "md5": "d41d8cd98f00b204e9800998ecf8427e",
      "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "size": 1234567
    }
  },
  "generatedAt": "2024-01-01T00:00:00Z"
}
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

**package.json 示例：**

```json
{
  "name": "MyPlugin",
  "id": "MyPlugin",
  "version": "1.0.0",
  "description": "自定义原生插件",
  "_dp_type": "nativeplugin",
  "_dp_nativeplugin": {
    "android": {
      "plugins": [
        {
          "type": "module",
          "name": "MyPlugin",
          "class": "com.example.MyPlugin"
        }
      ],
      "integrateType": "aar",
      "minSdkVersion": 21
    },
    "ios": {
      "plugins": [
        {
          "type": "module",
          "name": "MyPlugin",
          "class": "MyPlugin"
        }
      ],
      "integrateType": "framework"
    }
  }
}
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

### uni-app 原生插件目录结构对比

| 路径 | 说明 | 用途 |
|------|------|------|
| `nativeplugins/` | uni-app 原生插件目录 | HBuilderX 识别的插件目录 |
| `src/nativeResources/` | 本项目资源目录 | 构建时复制的资源 |

## 性能优化

### 1. 增量复制

对于大型资源目录，可以实现增量复制：

```typescript
import crypto from 'node:crypto'

// 计算文件 hash
async function getFileHash(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath)
  return crypto.createHash('md5').update(content).digest('hex')
}

// 增量复制
async function incrementalCopy(src: string, dest: string) {
  const files = await fs.readdir(src, { recursive: true, withFileTypes: true })

  for (const file of files) {
    if (!file.isFile()) continue

    const srcPath = path.join(file.path, file.name)
    const destPath = srcPath.replace(src, dest)

    // 检查目标文件是否存在
    if (await fs.pathExists(destPath)) {
      const srcHash = await getFileHash(srcPath)
      const destHash = await getFileHash(destPath)

      // 文件未变化，跳过
      if (srcHash === destHash) continue
    }

    // 复制文件
    await fs.ensureDir(path.dirname(destPath))
    await fs.copy(srcPath, destPath)
  }
}
```

### 2. 并行复制

使用 Promise.all 并行复制多个文件：

```typescript
async function parallelCopy(src: string, dest: string) {
  const files = await fs.readdir(src, { recursive: true, withFileTypes: true })

  const copyTasks = files
    .filter((file) => file.isFile())
    .map(async (file) => {
      const srcPath = path.join(file.path, file.name)
      const destPath = srcPath.replace(src, dest)
      await fs.ensureDir(path.dirname(destPath))
      await fs.copy(srcPath, destPath)
    })

  await Promise.all(copyTasks)
}
```

### 3. 大文件处理

对于超大文件，使用流式复制：

```typescript
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

async function streamCopy(src: string, dest: string) {
  await fs.ensureDir(path.dirname(dest))
  await pipeline(createReadStream(src), createWriteStream(dest))
}
```

### 4. 缓存机制

实现缓存机制避免重复复制：

```typescript
const copyCache = new Map<string, string>()

async function cachedCopy(src: string, dest: string) {
  const cacheKey = `${src}:${dest}`
  const srcHash = await getFileHash(src)

  if (copyCache.get(cacheKey) === srcHash) {
    console.log(`[copyNativeRes] 使用缓存：${path.basename(src)}`)
    return
  }

  await fs.copy(src, dest)
  copyCache.set(cacheKey, srcHash)
}
```

## 安全考虑

### 1. 敏感文件保护

```typescript
// 敏感文件类型
const sensitivePatterns = [
  /\.p12$/,
  /\.pem$/,
  /\.keystore$/,
  /\.key$/,
  /private.*\.json$/i,
  /secret.*\.json$/i,
]

// 检查是否为敏感文件
function isSensitiveFile(filePath: string): boolean {
  return sensitivePatterns.some((pattern) => pattern.test(filePath))
}

// 构建时警告
async function checkSensitiveFiles(dir: string) {
  const files = await fs.readdir(dir, { recursive: true })

  for (const file of files) {
    if (isSensitiveFile(file)) {
      console.warn(`[copyNativeRes] 警告：检测到敏感文件：${file}`)
      console.warn(`[copyNativeRes] 请确保该文件不会提交到版本控制系统`)
    }
  }
}
```

### 2. 权限检查

```typescript
async function checkPermissions(dir: string) {
  try {
    await fs.access(dir, fs.constants.R_OK | fs.constants.W_OK)
    return true
  } catch {
    console.error(`[copyNativeRes] 权限不足：${dir}`)
    return false
  }
}
```

### 3. 路径验证

```typescript
function isValidPath(targetPath: string, basePath: string): boolean {
  const normalizedTarget = path.normalize(targetPath)
  const normalizedBase = path.normalize(basePath)

  // 防止路径遍历攻击
  return normalizedTarget.startsWith(normalizedBase)
}
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
4. 启用增量复制功能

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

### 7. 不同平台资源混淆

**问题原因：**
- Android 和 iOS 资源放在同一目录
- 缺少平台隔离

**解决方案：**

严格按平台分离资源目录：

```
src/nativeResources/
├── android/   # 仅 Android
├── ios/       # 仅 iOS
└── common/    # 通用
```

### 8. 环境变量未设置

**问题原因：**
- `VITE_APP_ENV` 或 `UNI_PLATFORM` 未设置

**解决方案：**

检查 `.env` 文件配置：

```ini
# .env.development
VITE_APP_ENV=development

# .env.production
VITE_APP_ENV=production
```

检查构建脚本：

```json
{
  "scripts": {
    "build:app": "uni build -p app",
    "build:app:prod": "uni build -p app --mode production"
  }
}
```

## 版本兼容性

### 依赖版本

| 依赖 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 16.0.0 | 18.0.0+ | 支持 ES Modules |
| Vite | 4.0.0 | 5.0.0+ | writeBundle 钩子 |
| fs-extra | 10.0.0 | 11.0.0+ | 异步 API |
| uni-app | 3.0.0 | 最新版 | UNI_PLATFORM 环境变量 |

### Node.js 版本特性

| 版本 | 特性 | 影响 |
|------|------|------|
| 14.x | ES Modules 支持 | 可用 |
| 16.x | fs.cp 递归复制 | 可选替代 fs-extra |
| 18.x | 原生 fetch | 无关 |
| 20.x | 稳定的 ESM | 推荐 |

### 替代 fs-extra 的原生方案 (Node.js 16.7+)

```typescript
import { cp, mkdir, access } from 'node:fs/promises'
import { constants } from 'node:fs'

// 检查是否存在
async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

// 确保目录存在
async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true })
}

// 递归复制
async function copy(src: string, dest: string): Promise<void> {
  await cp(src, dest, { recursive: true })
}
```

## 调试技巧

### 1. 启用详细日志

```typescript
export default (options: { debug?: boolean } = {}) => {
  const { debug = false } = options

  return {
    enforce: 'post' as const,
    async writeBundle() {
      if (debug) {
        console.log('[copyNativeRes] 调试模式已启用')
        console.log('[copyNativeRes] 环境变量:', {
          VITE_APP_ENV: process.env.VITE_APP_ENV,
          UNI_PLATFORM: process.env.UNI_PLATFORM,
        })
        console.log('[copyNativeRes] 源路径:', waitPath)
        console.log('[copyNativeRes] 目标路径:', buildPath)
      }

      // ... 复制逻辑
    },
  }
}
```

### 2. 文件列表输出

```typescript
async function listFiles(dir: string, prefix = ''): Promise<void> {
  const items = await fs.readdir(dir, { withFileTypes: true })

  for (const item of items) {
    const itemPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      console.log(`${prefix}📁 ${item.name}/`)
      await listFiles(itemPath, prefix + '  ')
    } else {
      const stats = await fs.stat(itemPath)
      const size = (stats.size / 1024).toFixed(2)
      console.log(`${prefix}📄 ${item.name} (${size} KB)`)
    }
  }
}
```

### 3. 构建前后对比

```bash
# 构建前查看源目录
find src/nativeResources -type f | wc -l

# 构建后查看目标目录
find dist/build/app/nativeResources -type f | wc -l

# 对比文件差异
diff -rq src/nativeResources dist/build/app/nativeResources
```

### 4. 环境变量检查

```bash
# 检查环境变量
echo "VITE_APP_ENV: $VITE_APP_ENV"
echo "UNI_PLATFORM: $UNI_PLATFORM"

# 在 package.json 中添加检查脚本
{
  "scripts": {
    "check:env": "node -e \"console.log(process.env.VITE_APP_ENV, process.env.UNI_PLATFORM)\""
  }
}
```
