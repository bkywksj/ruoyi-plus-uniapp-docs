# HBuilderX 使用

## 概述

HBuilderX 是 DCloud 推出的 uni-app 官方开发工具，专为 uni-app 和 App 开发优化。虽然本项目主要使用 VSCode + CLI 开发，但在 App 打包和真机调试时仍需要 HBuilderX。本文档详细介绍 HBuilderX 的使用方法、App 打包流程、真机调试技巧等内容。

**核心功能:**

- **App 云打包** - 无需本地环境，云端打包 Android/iOS 应用
- **真机调试** - 连接手机实时调试，查看日志
- **模拟器支持** - 支持 Android/iOS 模拟器调试
- **条件编译** - 可视化预览不同平台代码
- **uni-app 代码提示** - 完善的 API 和组件提示

## 开发工作流

### 工作流程架构

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         uni-app 开发工作流                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        开发阶段 (VSCode + CLI)                       │   │
│  │                                                                      │   │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────────┐   │   │
│  │  │   代码编写   │   │  类型检查   │   │       热重载调试        │   │   │
│  │  │   VSCode    │ → │ TypeScript  │ → │  H5/小程序开发者工具     │   │   │
│  │  └─────────────┘   └─────────────┘   └─────────────────────────┘   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    App 调试阶段 (HBuilderX)                          │   │
│  │                                                                      │   │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────────┐   │   │
│  │  │ pnpm dev:app│   │   导入项目   │   │       真机调试          │   │   │
│  │  │ 编译到 dist │ → │ dist/dev/app│ → │  Android/iOS 设备       │   │   │
│  │  └─────────────┘   └─────────────┘   └─────────────────────────┘   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    App 打包阶段 (HBuilderX)                          │   │
│  │                                                                      │   │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────────┐   │   │
│  │  │pnpm build:  │   │   导入项目   │   │       云打包            │   │   │
│  │  │    app      │ → │dist/build/  │ → │  生成 APK/IPA           │   │   │
│  │  │             │   │    app      │   │                         │   │   │
│  │  └─────────────┘   └─────────────┘   └─────────────────────────┘   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### App 打包流程

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           App 云打包流程                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                            开始打包                                          │
│                               │                                             │
│                               ▼                                             │
│                    ┌───────────────────────┐                               │
│                    │   pnpm build:app      │                               │
│                    │   构建生产版本         │                               │
│                    └───────────────────────┘                               │
│                               │                                             │
│                               ▼                                             │
│                    ┌───────────────────────┐                               │
│                    │   导入到 HBuilderX    │                               │
│                    │   dist/build/app      │                               │
│                    └───────────────────────┘                               │
│                               │                                             │
│                    ┌──────────┴──────────┐                                 │
│                    ▼                     ▼                                  │
│           ┌──────────────┐      ┌──────────────┐                           │
│           │   Android    │      │     iOS      │                           │
│           │     打包     │      │     打包     │                           │
│           └──────────────┘      └──────────────┘                           │
│                    │                     │                                  │
│                    ▼                     ▼                                  │
│           ┌──────────────┐      ┌──────────────┐                           │
│           │  配置证书    │      │  配置证书    │                           │
│           │  (keystore)  │      │  (.p12+描述) │                           │
│           └──────────────┘      └──────────────┘                           │
│                    │                     │                                  │
│                    ▼                     ▼                                  │
│           ┌──────────────┐      ┌──────────────┐                           │
│           │  配置权限    │      │  配置权限    │                           │
│           │  (定位/相机) │      │  (推送/支付) │                           │
│           └──────────────┘      └──────────────┘                           │
│                    │                     │                                  │
│                    ▼                     ▼                                  │
│           ┌──────────────┐      ┌──────────────┐                           │
│           │  云端打包    │      │  云端打包    │                           │
│           │  (排队等待)  │      │  (排队等待)  │                           │
│           └──────────────┘      └──────────────┘                           │
│                    │                     │                                  │
│                    ▼                     ▼                                  │
│           ┌──────────────┐      ┌──────────────┐                           │
│           │  下载 APK    │      │  下载 IPA    │                           │
│           └──────────────┘      └──────────────┘                           │
│                    │                     │                                  │
│                    └──────────┬──────────┘                                 │
│                               ▼                                             │
│                    ┌───────────────────────┐                               │
│                    │   应用分发/上架        │                               │
│                    │   (应用商店/企业分发)  │                               │
│                    └───────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 下载与安装

### 下载地址

官网：https://www.dcloud.io/hbuilderx.html

### 版本选择

**标准版（推荐）**：
- 免费使用
- 包含 uni-app 开发所需功能
- 适合大部分开发场景
- 云打包次数有限制

**App 开发版**：
- 付费版本
- 无限次云打包
- 优先打包队列
- 适合商业项目

### 版本对比

| 功能 | 标准版 | App 开发版 |
|------|--------|-----------|
| uni-app 开发 | ✅ | ✅ |
| 真机调试 | ✅ | ✅ |
| 模拟器调试 | ✅ | ✅ |
| 云打包次数 | 有限制 | 无限制 |
| 打包队列 | 普通 | 优先 |
| 自定义基座 | ✅ | ✅ |
| 离线打包 | ❌ | ✅ |
| 价格 | 免费 | 付费 |

### 安装步骤

1. 下载对应操作系统的安装包
2. 解压到任意目录（建议：非中文路径）
3. 双击 `HBuilderX.exe`（Windows）或 `HBuilderX.app`（Mac）启动

**Windows 安装注意事项**：
```text
✅ 推荐路径：D:\HBuilderX
❌ 避免路径：C:\Program Files\HBuilderX（权限问题）
❌ 避免路径：D:\开发工具\HBuilderX（中文路径）
```

**Mac 安装注意事项**：
```text
1. 将 HBuilderX.app 拖入 Applications 文件夹
2. 首次打开可能提示"无法验证开发者"
3. 前往"系统偏好设置" -> "安全性与隐私" -> "通用"
4. 点击"仍然打开"
```

### 首次配置

```text
1. 登录 DCloud 账号
   - 菜单：帮助 -> 登录
   - 使用手机号或邮箱注册

2. 配置插件
   - 菜单：工具 -> 插件安装
   - 安装 uni-app 编译插件
   - 安装 App 真机运行插件

3. 配置代理（可选）
   - 菜单：工具 -> 设置
   - 网络设置 -> HTTP 代理
```

## 项目导入

### 方式一：导入编译产物（推荐）

本项目使用 CLI 模式开发，HBuilderX 主要用于 App 调试和打包。

**步骤**：

1. 使用 CLI 编译项目

```bash
# 编译 App（开发版本）
pnpm dev:app

# 编译 App（生产版本）
pnpm build:app
```

2. HBuilderX 导入项目
   - 点击"文件" -> "导入" -> "从本地目录导入"
   - 选择 `dist/dev/app` 或 `dist/build/app` 目录
   - 点击"选择"

3. 项目导入成功
   - 项目会出现在左侧项目列表
   - 可以进行真机调试和云打包

### 方式二：直接打开源码（不推荐）

HBuilderX 也可以直接打开源码目录，但建议使用 VSCode 开发，HBuilderX 仅用于打包。

### 项目结构说明

```text
dist/
├── dev/                    # 开发版本输出
│   ├── app/               # App 平台编译产物
│   │   ├── manifest.json  # 应用配置
│   │   ├── pages.json     # 页面配置
│   │   └── ...           # 其他文件
│   ├── h5/               # H5 平台编译产物
│   └── mp-weixin/        # 微信小程序编译产物
│
└── build/                 # 生产版本输出
    ├── app/              # App 平台编译产物（已压缩）
    ├── h5/               # H5 平台编译产物
    └── mp-weixin/        # 微信小程序编译产物
```

## manifest.json 配置

### 基础配置

```json
{
  "name": "RuoYi-Plus",
  "appid": "__UNI__XXXXXXX",
  "description": "RuoYi-Plus 移动端",
  "versionName": "1.0.0",
  "versionCode": 100,
  "transformPx": false,
  "locale": "zh-Hans"
}
```

### App 平台配置

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
    "modules": {
      "Geolocation": {},
      "Camera": {},
      "Payment": {},
      "Push": {},
      "Fingerprint": {}
    },
    "distribute": {
      "android": {
        "permissions": [
          "<uses-permission android:name=\"android.permission.INTERNET\"/>",
          "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>",
          "<uses-permission android:name=\"android.permission.ACCESS_WIFI_STATE\"/>",
          "<uses-permission android:name=\"android.permission.CAMERA\"/>",
          "<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\"/>",
          "<uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\"/>",
          "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>",
          "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\"/>"
        ],
        "minSdkVersion": 21,
        "targetSdkVersion": 30
      },
      "ios": {
        "UIBackgroundModes": ["location", "audio"],
        "capabilities": {
          "entitlements": {
            "com.apple.developer.associated-domains": [
              "applinks:example.com"
            ]
          }
        }
      },
      "sdkConfigs": {
        "geolocation": {
          "amap": {
            "__platform__": ["ios", "android"],
            "appkey_ios": "YOUR_IOS_AMAP_KEY",
            "appkey_android": "YOUR_ANDROID_AMAP_KEY"
          }
        },
        "push": {
          "unipush": {
            "version": "2"
          }
        }
      }
    }
  }
}
```

### 常用模块说明

| 模块 | 说明 | 配置要求 |
|------|------|---------|
| Geolocation | 定位功能 | 需要高德/百度 Key |
| Camera | 相机/拍照 | 需要相机权限 |
| Payment | 支付功能 | 需要支付配置 |
| Push | 推送通知 | 需要 UniPush 配置 |
| Fingerprint | 指纹识别 | 需要设备支持 |
| OAuth | 第三方登录 | 需要各平台配置 |
| Share | 分享功能 | 需要各平台配置 |

### 图标和启动页配置

```json
{
  "app-plus": {
    "distribute": {
      "icons": {
        "android": {
          "hdpi": "static/icon/android/72x72.png",
          "xhdpi": "static/icon/android/96x96.png",
          "xxhdpi": "static/icon/android/144x144.png",
          "xxxhdpi": "static/icon/android/192x192.png"
        },
        "ios": {
          "appstore": "static/icon/ios/1024x1024.png",
          "ipad": {
            "app": "static/icon/ios/76x76.png",
            "app@2x": "static/icon/ios/152x152.png"
          },
          "iphone": {
            "app@2x": "static/icon/ios/120x120.png",
            "app@3x": "static/icon/ios/180x180.png"
          }
        }
      },
      "splashscreen": {
        "android": {
          "hdpi": "static/splash/android/480x762.png",
          "xhdpi": "static/splash/android/720x1242.png",
          "xxhdpi": "static/splash/android/1080x1882.png"
        },
        "ios": {
          "iphonex": "static/splash/ios/1125x2436.png",
          "iphone": "static/splash/ios/750x1334.png"
        }
      }
    }
  }
}
```

## App 真机调试

### Android 真机调试

**准备工作**：

1. 手机开启开发者模式
   - 设置 -> 关于手机 -> 连续点击"版本号" 7 次
   - 开发者选项会出现在设置中

2. 开启 USB 调试
   - 设置 -> 开发者选项 -> USB 调试 -> 开启

3. 连接电脑（使用数据线）

4. 安装手机驱动（Windows 需要）
   - 小米：安装小米助手
   - 华为：安装华为手机助手
   - 其他：安装通用 ADB 驱动

**调试步骤**：

1. HBuilderX 导入项目（`dist/dev/app`）

2. 点击菜单：运行 -> 运行到手机或模拟器 -> 运行到 Android App 基座

3. 选择设备
   - HBuilderX 会自动识别连接的手机
   - 选择对应设备

4. 等待安装和启动
   - 首次运行会安装调试基座
   - 自动启动应用

5. 查看日志
   - 控制台会输出运行日志
   - 可以查看 console.log 输出

**USB 调试模式说明**：

```text
┌─────────────────────────────────────────────────────────────────┐
│                      USB 调试模式                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  仅充电模式        ❌ 无法调试                                   │
│  传输文件(MTP)     ✅ 可以调试                                   │
│  传输照片(PTP)     ✅ 可以调试                                   │
│  MIDI 模式         ❌ 无法调试                                   │
│                                                                 │
│  推荐使用 "传输文件(MTP)" 模式                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**常见问题**：

| 问题 | 解决方案 |
|------|---------|
| 设备未识别 | 检查 USB 调试是否开启，重新连接 |
| 安装失败 | 手机设置允许"未知来源"应用安装 |
| 无法启动 | 卸载旧版调试基座，重新安装 |
| 运行卡顿 | 检查手机存储空间，清理缓存 |
| 无法热重载 | 检查电脑和手机是否在同一网络 |

### iOS 真机调试

**准备工作**：

1. Mac 电脑（必须）
2. 安装 Xcode
3. Apple 开发者账号
4. iOS 设备

**调试步骤**：

1. 连接 iOS 设备到 Mac

2. HBuilderX 导入项目

3. 点击：运行 -> 运行到手机或模拟器 -> 运行到 iOS App 基座

4. 配置证书
   - 首次运行需要配置开发证书
   - 使用 Apple ID 登录
   - 选择开发团队

5. 信任开发者
   - iOS 设备：设置 -> 通用 -> VPN与设备管理
   - 信任开发者证书

6. 启动调试

**iOS 证书类型**：

```text
┌─────────────────────────────────────────────────────────────────┐
│                      iOS 证书类型                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  开发证书 (Development)                                          │
│  ├── 用于真机调试                                                │
│  ├── 可绑定最多 100 台设备                                       │
│  └── 有效期 1 年                                                 │
│                                                                 │
│  发布证书 (Distribution)                                         │
│  ├── 用于 App Store 上架                                         │
│  ├── 不限设备数量                                                │
│  └── 有效期 1 年                                                 │
│                                                                 │
│  推送证书 (Push)                                                  │
│  ├── 用于推送通知                                                │
│  ├── 分开发/生产两种                                             │
│  └── 有效期 1 年                                                 │
│                                                                 │
│  免费证书 (Personal Team)                                        │
│  ├── 使用个人 Apple ID                                           │
│  ├── 最多 3 台设备                                               │
│  └── 有效期 7 天                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**注意**：
- iOS 真机调试需要 Mac 电脑
- 免费 Apple ID 有设备数量限制（最多 3 台）
- 证书有效期 7 天，到期需重新安装

## App 云打包

### 准备工作

**Android 打包**：

无特殊要求，可直接打包。

**iOS 打包**：

1. Apple 开发者账号（付费，99$/年）
2. 证书和描述文件
   - 开发证书（Development）
   - 发布证书（Distribution）
   - 推送证书（Push）

### Android 云打包

**步骤**：

1. HBuilderX 打开项目（`dist/build/app`）

```bash
# 先构建生产版本
pnpm build:app
```

2. 点击：发行 -> 原生App-云打包 -> 打包 Android 应用

3. 配置打包参数

**基础配置**：
- 应用名称：显示在桌面的名称
- 应用版本名称：如 1.0.0
- 应用版本号：如 100（纯数字，递增）

**图标配置**：
- 自动生成：上传 1024x1024 图标，自动生成各尺寸
- 手动配置：分别上传各尺寸图标

**证书配置**：

使用云端证书（DCloud 提供）：
- 适合测试
- 不适合上架

使用自有证书：
- 生成 keystore 文件
- 配置别名和密码
- 适合上架

**权限配置**：
- 定位权限
- 相机权限
- 存储权限
- 等

4. 点击"打包"

5. 等待打包完成
   - 打包需要几分钟
   - 可以在控制台查看进度

6. 下载 APK
   - 打包成功后会提示下载
   - 或在"发行记录"中下载

### Android 打包配置详解

```json
{
  "android": {
    // 包名（必须唯一）
    "packagename": "com.example.app",

    // 签名配置
    "keystore": "path/to/keystore",
    "password": "keystore_password",
    "aliasname": "key_alias",
    "aliaspassword": "key_password",

    // SDK 版本
    "minSdkVersion": 21,      // 最低 Android 5.0
    "targetSdkVersion": 30,   // 目标 Android 11

    // 权限配置
    "permissions": [
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "ACCESS_WIFI_STATE",
      "CAMERA",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "VIBRATE",
      "FLASHLIGHT"
    ],

    // ABI 架构
    "abiFilters": ["armeabi-v7a", "arm64-v8a"],

    // 渠道配置
    "channel": "default"
  }
}
```

### iOS 云打包

**步骤**：

1. 准备证书和描述文件

2. 点击：发行 -> 原生App-云打包 -> 打包 iOS 应用

3. 配置证书
   - 选择证书文件（.p12）
   - 输入证书密码
   - 选择描述文件（.mobileprovision）

4. 配置参数
   - Bundle ID：与证书对应
   - 版本号
   - 图标

5. 点击"打包"

6. 下载 IPA
   - 可使用 TestFlight 内测
   - 或提交 App Store 审核

### iOS 证书申请流程

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         iOS 证书申请流程                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. 创建 CSR 文件                                                            │
│     ├── 打开"钥匙串访问"                                                     │
│     ├── 证书助理 -> 从证书颁发机构请求证书                                    │
│     └── 保存为 .certSigningRequest 文件                                      │
│                                                                             │
│  2. 创建证书                                                                 │
│     ├── 登录 Apple Developer                                                │
│     ├── Certificates -> Create                                              │
│     ├── 选择证书类型                                                         │
│     ├── 上传 CSR 文件                                                        │
│     └── 下载 .cer 文件                                                       │
│                                                                             │
│  3. 导出 .p12 文件                                                           │
│     ├── 双击 .cer 文件导入钥匙串                                             │
│     ├── 钥匙串访问 -> 我的证书                                               │
│     ├── 右键证书 -> 导出                                                     │
│     └── 保存为 .p12 格式，设置密码                                           │
│                                                                             │
│  4. 创建描述文件                                                             │
│     ├── Apple Developer -> Profiles                                         │
│     ├── 选择类型（Development/Distribution）                                 │
│     ├── 选择 App ID                                                          │
│     ├── 选择证书                                                             │
│     ├── 选择设备（开发描述文件需要）                                          │
│     └── 下载 .mobileprovision 文件                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 生成证书（Android）

**使用 keytool 生成**：

```bash
# 进入 JDK bin 目录
cd "C:\Program Files\Java\jdk-17\bin"

# 生成 keystore
keytool -genkey -alias myapp -keyalg RSA -keysize 2048 -validity 36500 -keystore myapp.keystore

# 参数说明：
# -alias: 别名
# -keyalg: 加密算法
# -keysize: 密钥长度
# -validity: 有效期（天）
# -keystore: 输出文件名
```

**填写信息**：

```text
输入密钥库口令: ******
再次输入新口令: ******
您的名字与姓氏是什么? [Unknown]: MyCompany
您的组织单位名称是什么? [Unknown]: IT
您的组织名称是什么? [Unknown]: MyCompany
您所在的城市或区域名称是什么? [Unknown]: Beijing
您所在的省/市/自治区名称是什么? [Unknown]: Beijing
该单位的双字母国家/地区代码是什么? [Unknown]: CN
CN=MyCompany, OU=IT, O=MyCompany, L=Beijing, ST=Beijing, C=CN是否正确? [否]: y
```

**保存证书信息**：
- 证书文件：myapp.keystore
- 证书密码：******
- 证书别名：myapp
- 妥善保管，用于后续更新

**查看证书信息**：

```bash
keytool -list -v -keystore myapp.keystore
```

### 打包配置管理

```typescript
// 打包配置模板

interface AndroidPackConfig {
  // 应用信息
  appName: string
  packageName: string
  versionName: string
  versionCode: number

  // 签名配置
  keystore: string
  keystorePassword: string
  keyAlias: string
  keyPassword: string

  // SDK 版本
  minSdkVersion: number
  targetSdkVersion: number

  // 权限列表
  permissions: string[]

  // 渠道包
  channels: string[]
}

interface IOSPackConfig {
  // 应用信息
  appName: string
  bundleId: string
  version: string
  buildNumber: string

  // 证书配置
  certificate: string
  certificatePassword: string
  provisioningProfile: string

  // 能力配置
  capabilities: string[]

  // 推送配置
  pushCertificate?: string
  pushPassword?: string
}

// 配置示例
const androidConfig: AndroidPackConfig = {
  appName: 'RuoYi-Plus',
  packageName: 'com.ruoyi.plus',
  versionName: '1.0.0',
  versionCode: 100,

  keystore: './keys/android.keystore',
  keystorePassword: 'your_password',
  keyAlias: 'ruoyi',
  keyPassword: 'your_password',

  minSdkVersion: 21,
  targetSdkVersion: 30,

  permissions: [
    'INTERNET',
    'ACCESS_NETWORK_STATE',
    'CAMERA',
    'ACCESS_FINE_LOCATION'
  ],

  channels: ['official', 'huawei', 'xiaomi', 'oppo', 'vivo']
}
```

## 模拟器调试

### Android 模拟器

**使用 HBuilderX 内置模拟器**：

1. 点击：运行 -> 运行到手机或模拟器 -> 运行到 Android App 基座

2. 选择"雷电模拟器"或"夜神模拟器"

3. 首次使用需要下载安装模拟器

4. 启动模拟器后自动安装应用

**使用 Android Studio 模拟器**：

1. 启动 Android Studio AVD

2. HBuilderX 会自动识别

3. 选择对应模拟器运行

**模拟器配置建议**：

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Android 模拟器配置建议                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  开发调试用：                                                    │
│  ├── 设备：Pixel 4                                              │
│  ├── 系统：Android 11 (API 30)                                  │
│  ├── 内存：2GB                                                  │
│  └── 存储：2GB                                                  │
│                                                                 │
│  兼容性测试：                                                    │
│  ├── 低端机：Android 5.0 (API 21)                               │
│  ├── 主流机：Android 10 (API 29)                                │
│  └── 高端机：Android 13 (API 33)                                │
│                                                                 │
│  性能提示：                                                      │
│  ├── 启用 GPU 加速                                              │
│  ├── 使用 x86 镜像（Intel 电脑）                                 │
│  └── 使用 ARM 镜像（Apple Silicon）                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### iOS 模拟器

**仅 Mac 支持**：

1. 安装 Xcode

2. Xcode -> Preferences -> Components -> 下载模拟器

3. HBuilderX：运行 -> 运行到手机或模拟器 -> iOS 模拟器

4. 选择模拟器型号

**iOS 模拟器常用设备**：

| 设备 | 屏幕尺寸 | 分辨率 | 适用场景 |
|------|---------|--------|---------|
| iPhone SE | 4.7" | 750×1334 | 小屏适配 |
| iPhone 14 | 6.1" | 1170×2532 | 主流设备 |
| iPhone 14 Pro Max | 6.7" | 1290×2796 | 大屏适配 |
| iPad Pro 11" | 11" | 1668×2388 | 平板适配 |

## 常用功能

### 代码提示

HBuilderX 对 uni-app 有很好的代码提示：

- uni API 提示
- 组件属性提示
- 平台判断提示

### 真机运行日志

运行时可以查看实时日志：

- console.log 输出
- 网络请求
- 错误信息

**日志过滤**：

```javascript
// 在控制台输入过滤条件
// 按标签过滤
[UserStore]

// 按级别过滤
[error]
[warn]

// 按内容过滤
登录
```

### 条件编译预览

可以预览不同平台的代码：

1. 点击工具栏"条件编译"图标
2. 选择平台（H5、微信小程序、App）
3. 代码会高亮显示当前平台的代码块

```vue
<!-- 条件编译示例 -->
<template>
  <!-- #ifdef H5 -->
  <div>仅在 H5 显示</div>
  <!-- #endif -->

  <!-- #ifdef APP-PLUS -->
  <view>仅在 App 显示</view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <view>仅在微信小程序显示</view>
  <!-- #endif -->
</template>
```

### 自定义基座

**什么是自定义基座**：
- 默认基座：DCloud 提供的通用调试基座
- 自定义基座：包含项目特定原生插件的调试基座

**何时需要自定义基座**：
- 使用原生插件时
- 需要自定义原生功能时
- 测试推送等原生功能时

**创建自定义基座**：

1. 发行 -> 原生 App-云打包
2. 勾选"自定义调试基座"
3. 配置必要参数
4. 打包完成后自动安装

## CLI 模式 vs HBuilderX 模式

本项目采用 CLI 模式开发，HBuilderX 仅用于 App 调试和打包。

### CLI 模式（项目使用）

**优点**：
- ✅ 使用熟悉的编辑器（VSCode）
- ✅ 支持丰富的插件生态
- ✅ 更好的 Git 集成
- ✅ 更好的 TypeScript 支持
- ✅ 使用 Vite 构建，速度快

**缺点**：
- ❌ App 打包需要 HBuilderX
- ❌ 某些功能需要手动配置

### HBuilderX 模式

**优点**：
- ✅ 集成度高，开箱即用
- ✅ uni-app 代码提示完善
- ✅ 可视化配置界面
- ✅ 内置云打包功能

**缺点**：
- ❌ 编辑器功能相对简单
- ❌ 插件生态不如 VSCode
- ❌ 自定义配置受限

### 推荐工作流程

```text
开发阶段：
VSCode + CLI 模式
├── H5 调试：浏览器
├── 小程序调试：对应小程序开发者工具
└── 代码编写：VSCode

App 调试阶段：
HBuilderX
├── 编译：pnpm dev:app
├── 导入：dist/dev/app
└── 真机调试：HBuilderX

App 打包阶段：
HBuilderX
├── 构建：pnpm build:app
├── 导入：dist/build/app
└── 云打包：HBuilderX
```

## 常见问题

### 1. HBuilderX 无法识别设备？

**解决方案**：

```bash
# Android
1. 检查 USB 调试是否开启
2. 更换 USB 线或接口
3. 重启 HBuilderX
4. 安装手机驱动（Windows）

# 验证 ADB 连接
adb devices

# iOS
1. 信任此电脑
2. 检查数据线
3. 重启设备和 HBuilderX
```

### 2. 云打包失败？

**常见原因**：

- 证书配置错误
- Bundle ID 不匹配
- 权限配置冲突
- 网络问题

**解决方案**：

```text
1. 检查控制台错误信息
2. 验证证书和描述文件
3. 检查 manifest.json 配置
4. 重试打包
```

### 3. 真机运行白屏？

**排查步骤**：

```text
1. 查看控制台日志
2. 检查网络请求
3. 检查 API 地址配置
4. 重新编译项目
```

### 4. 版本更新后无法运行？

**解决方案**：

```bash
# 清除缓存
1. 删除 dist 目录
2. 重新编译项目
3. 卸载手机上的调试基座
4. 重新运行到真机
```

### 5. iOS 证书过期？

**解决方案**：

```text
免费证书：
- 每 7 天过期
- 重新连接设备运行即可

开发者证书：
- 每年过期
- 续费后重新申请证书
- 更新描述文件
```

### 6. 打包后应用闪退？

**排查步骤**：

```javascript
// 1. 连接设备查看日志
adb logcat | grep "your.package.name"

// 2. 检查是否有未捕获的异常
try {
  // 可能出错的代码
} catch (error) {
  console.error('Error:', error)
}

// 3. 检查原生模块是否正确配置
// manifest.json -> modules
```

### 7. 热重载不生效？

**解决方案**：

```text
1. 确保电脑和手机在同一网络
2. 关闭电脑防火墙
3. 检查端口是否被占用
4. 重启 HBuilderX 和设备
```

### 8. 图标不显示或显示异常？

**解决方案**：

```text
1. 检查图片格式（必须是 PNG）
2. 检查图片尺寸（必须符合规范）
3. 检查图片路径是否正确
4. 使用自动生成图标功能
```

### 9. 打包体积过大？

**优化方案**：

```javascript
// 1. 移除未使用的模块
// manifest.json
{
  "app-plus": {
    "modules": {
      // 只保留需要的模块
      "Geolocation": {}
    }
  }
}

// 2. 压缩静态资源
// 使用 TinyPNG 等工具压缩图片

// 3. 按需加载
// 使用分包加载减少首包体积

// 4. 仅支持必要的 ABI
{
  "abiFilters": ["arm64-v8a"]  // 仅支持 64 位
}
```

### 10. 升级后签名不一致？

**解决方案**：

```text
签名必须与首次发布时一致，否则无法覆盖安装

1. 使用相同的 keystore 文件
2. 使用相同的别名和密码
3. 如果丢失 keystore：
   - 需要更换包名重新发布
   - 或申请应用商店进行签名迁移
```

### 11. 原生插件不生效？

**解决方案**：

```text
1. 确认插件已正确导入
2. 检查 manifest.json 配置
3. 制作自定义调试基座
4. 使用自定义基座运行
```

### 12. iOS 无法安装描述文件？

**解决方案**：

```text
1. 确保设备 UDID 已添加到描述文件
2. 检查描述文件是否过期
3. 确保 Bundle ID 匹配
4. 重新生成描述文件
```

## 最佳实践

### 1. 使用标准版

除非有特殊需求，使用免费的标准版即可。

### 2. 分离开发和打包

```text
开发：VSCode + CLI
打包：HBuilderX
```

### 3. 保存证书信息

将证书信息保存到项目文档：

```text
证书文件：myapp.keystore
证书密码：******
证书别名：myapp
存放位置：项目根目录/keys/
```

### 4. 定期更新

HBuilderX 更新频繁，建议定期更新：

- 修复 bug
- 支持新特性
- 提升性能

### 5. 使用版本控制

不要将 HBuilderX 项目配置提交到 Git：

```bash
# .gitignore
.hbuilderx/
unpackage/
```

### 6. 多环境配置

```javascript
// 打包时区分环境
// .env.production
VITE_APP_API_URL=https://api.production.com

// .env.staging
VITE_APP_API_URL=https://api.staging.com

// 打包命令
pnpm build:app          // 生产环境
pnpm build:app:staging  // 测试环境
```

### 7. 渠道包管理

```bash
# Android 渠道包配置
# 在 HBuilderX 打包时选择渠道

# 常见渠道
- 官方渠道 (official)
- 华为应用市场 (huawei)
- 小米应用商店 (xiaomi)
- OPPO 软件商店 (oppo)
- vivo 应用商店 (vivo)
- 应用宝 (myapp)
```

### 8. 自动化打包

```bash
# 使用 HBuilderX CLI 实现自动化
# 需要 HBuilderX 3.1.0+

# 安装 CLI
npm install -g @hbuilderx/cli

# 打包命令
hbuilderx pack --platform android \
  --project ./dist/build/app \
  --keystore ./keys/android.keystore \
  --alias myapp \
  --password ******
```

## 快捷键

### 常用快捷键

| 功能 | Windows/Linux | Mac |
|------|--------------|-----|
| 运行到真机 | Ctrl + R | Cmd + R |
| 打开控制台 | Ctrl + ` | Cmd + ` |
| 查找 | Ctrl + F | Cmd + F |
| 全局搜索 | Ctrl + Shift + F | Cmd + Shift + F |
| 格式化代码 | Ctrl + K | Cmd + K |
| 注释/取消注释 | Ctrl + / | Cmd + / |
| 保存 | Ctrl + S | Cmd + S |
| 全部保存 | Ctrl + Shift + S | Cmd + Shift + S |
| 撤销 | Ctrl + Z | Cmd + Z |
| 重做 | Ctrl + Y | Cmd + Shift + Z |
| 复制行 | Ctrl + D | Cmd + D |
| 删除行 | Ctrl + Shift + K | Cmd + Shift + K |
| 移动行 | Alt + ↑/↓ | Option + ↑/↓ |

## 插件推荐

虽然本项目主要使用 VSCode，但如果使用 HBuilderX，推荐以下插件：

| 插件 | 说明 |
|------|------|
| eslint-js | JavaScript 代码检查 |
| prettier | 代码格式化 |
| emmet | HTML/CSS 快速编写 |
| scss/sass | SCSS 语法支持 |
| vue-beautify | Vue 文件格式化 |
| fileheader | 文件头注释 |

## 性能优化建议

### 开发环境优化

```text
1. 关闭不必要的插件
2. 增加 HBuilderX 内存限制
3. 使用 SSD 硬盘
4. 定期清理缓存
```

### 打包优化

```javascript
// 1. 启用代码压缩
{
  "app-plus": {
    "optimization": {
      "minify": true
    }
  }
}

// 2. 使用 Tree Shaking
// 确保 package.json 中 sideEffects 配置正确

// 3. 图片压缩
// 使用 TinyPNG 等工具压缩图片

// 4. 分包加载
// 将不常用的页面放入分包
```

### 运行时优化

```javascript
// 1. 避免频繁更新 data
// 使用 debounce 或 throttle

// 2. 列表优化
// 使用虚拟列表组件

// 3. 图片懒加载
// 使用 lazy-load 属性

// 4. 减少 setData 数据量
// 只更新需要变化的数据
```

