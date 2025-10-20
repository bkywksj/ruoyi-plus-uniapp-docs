# HBuilderX 使用

## 概述

HBuilderX 是 DCloud 推出的 uni-app 官方开发工具，专为 uni-app 和 App 开发优化。虽然本项目主要使用 VSCode + CLI 开发，但在 App 打包和真机调试时仍需要 HBuilderX。

## 下载与安装

### 下载地址

官网：https://www.dcloud.io/hbuilderx.html

### 版本选择

**标准版（推荐）**：
- 免费使用
- 包含 uni-app 开发所需功能
- 适合大部分开发场景

**App 开发版**：
- 付费版本
- 包含云打包等高级功能
- 适合商业项目

### 安装步骤

1. 下载对应操作系统的安装包
2. 解压到任意目录（建议：非中文路径）
3. 双击 `HBuilderX.exe`（Windows）或 `HBuilderX.app`（Mac）启动

**注意**：
- Windows 建议以管理员身份运行
- Mac 首次打开可能需要在"安全性与隐私"中允许

## 项目导入

### 方式一：导入编译产物（推荐）

本项目使用 CLI 模式开发，HBuilderX 主要用于 App 调试和打包。

**步骤**：

1. 使用 CLI 编译项目

```bash
# 编译 App
pnpm dev:app
```

2. HBuilderX 导入项目
   - 点击"文件" -> "导入" -> "从本地目录导入"
   - 选择 `dist/dev/app` 目录
   - 点击"选择"

3. 项目导入成功
   - 项目会出现在左侧项目列表
   - 可以进行真机调试和云打包

### 方式二：直接打开源码（不推荐）

HBuilderX 也可以直接打开源码目录，但建议使用 VSCode 开发，HBuilderX 仅用于打包。

## App 真机调试

### Android 真机调试

**准备工作**：

1. 手机开启开发者模式
2. 开启 USB 调试
3. 连接电脑（使用数据线）
4. 安装手机驱动（Windows 需要）

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

**常见问题**：

| 问题 | 解决方案 |
|------|---------|
| 设备未识别 | 检查 USB 调试是否开启，重新连接 |
| 安装失败 | 手机设置允许"未知来源"应用安装 |
| 无法启动 | 卸载旧版调试基座，重新安装 |

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
   - iOS 设备：设置 -> 通用 -> 设备管理
   - 信任开发者证书

6. 启动调试

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

```
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

### iOS 模拟器

**仅 Mac 支持**：

1. 安装 Xcode

2. Xcode -> Preferences -> Components -> 下载模拟器

3. HBuilderX：运行 -> 运行到手机或模拟器 -> iOS 模拟器

4. 选择模拟器型号

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

### 条件编译预览

可以预览不同平台的代码：

1. 点击工具栏"条件编译"图标
2. 选择平台（H5、微信小程序、App）
3. 代码会高亮显示当前平台的代码块

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

```
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

```
1. 检查控制台错误信息
2. 验证证书和描述文件
3. 检查 manifest.json 配置
4. 重试打包
```

### 3. 真机运行白屏？

**排查步骤**：

```
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

```
免费证书：
- 每 7 天过期
- 重新连接设备运行即可

开发者证书：
- 每年过期
- 续费后重新申请证书
- 更新描述文件
```

## 最佳实践

### 1. 使用标准版

除非有特殊需求，使用免费的标准版即可。

### 2. 分离开发和打包

```
开发：VSCode + CLI
打包：HBuilderX
```

### 3. 保存证书信息

将证书信息保存到项目文档：

```
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

## 快捷键

### 常用快捷键

| 功能 | Windows/Linux | Mac |
|------|--------------|-----|
| 运行到真机 | Ctrl + R | Cmd + R |
| 打开控制台 | Ctrl + ` | Cmd + ` |
| 查找 | Ctrl + F | Cmd + F |
| 全局搜索 | Ctrl + Shift + F | Cmd + Shift + F |
| 格式化代码 | Ctrl + Shift + F | Cmd + Shift + F |
| 注释/取消注释 | Ctrl + / | Cmd + / |

## 插件推荐

虽然本项目主要使用 VSCode，但如果使用 HBuilderX，推荐以下插件：

- **eslint-js**：JavaScript 代码检查
- **prettier**：代码格式化
- **emmet**：HTML/CSS 快速编写

## 相关文档

- [UniApp概览](./overview.md) - uni-app 介绍
- [调试工具](./debugging.md) - 多平台调试方法
- [项目配置](./manifest-config.md) - App 配置说明
