# 移动端快速启动

本章节将指导你快速启动 RuoYi-Plus-UniApp 移动端项目，支持 H5、微信小程序、支付宝小程序、App 等多端开发。项目基于 UniApp 3.0 + Vue 3.4 + TypeScript 5.7 + Vite 6.3 构建，采用组合式 API 和 Pinia 状态管理。

## 🎯 环境要求

### 必需环境

在开始开发之前，请确保你的开发环境满足以下要求：

| 环境 | 版本要求 | 说明 |
|------|---------|------|
| **Node.js** | >= 18.0.0 | 推荐使用 LTS 版本 |
| **pnpm** | >= 7.30.0 | 包管理器(项目强制使用) |
| **Git** | >= 2.30 | 版本控制工具 |

**版本检查命令：**

```bash
# 检查 Node.js 版本
node -v
# 输出应为 v18.x.x 或更高

# 检查 pnpm 版本
pnpm -v
# 输出应为 7.30.0 或更高

# 检查 Git 版本
git --version
```

### 平台开发工具

根据目标平台安装对应的开发工具：

| 平台 | 开发工具 | 下载地址 | 必需性 |
|------|---------|---------|-------|
| **H5** | 现代浏览器 | - | 必需 |
| **微信小程序** | 微信开发者工具 | [下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) | 按需 |
| **支付宝小程序** | 支付宝开发者工具 | [下载](https://opendocs.alipay.com/mini/ide/download) | 按需 |
| **百度小程序** | 百度开发者工具 | [下载](https://smartprogram.baidu.com/docs/develop/devtools/history/) | 按需 |
| **抖音小程序** | 抖音开发者工具 | [下载](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/developer-instrument/download/developer-instrument-update-and-download) | 按需 |
| **QQ小程序** | QQ开发者工具 | [下载](https://q.qq.com/wiki/tools/devtool/) | 按需 |
| **App开发** | HBuilderX | [下载](https://www.dcloud.io/hbuilderx.html) | 按需 |

### 推荐开发工具

| 工具 | 用途 | 推荐扩展 |
|------|------|---------|
| **VS Code** | 代码编辑器 | Volar、ESLint、UnoCSS、uni-helper |
| **WebStorm/IDEA** | IDE | Vue.js 插件、UniApp 插件 |
| **nvm/nvm-windows** | Node 版本管理 | - |

---

## 🏗️ 技术栈概览

项目采用现代化的技术栈，确保开发效率和运行性能：

### 核心框架

| 技术 | 版本 | 说明 |
|------|------|------|
| **UniApp** | 3.0.0-4060620250520001 | 跨平台应用框架 |
| **Vue** | 3.4.21 | 渐进式 JavaScript 框架 |
| **TypeScript** | 5.7.2 | 类型安全的 JavaScript 超集 |
| **Vite** | 6.3.5 | 下一代前端构建工具 |
| **Pinia** | 2.0.36 | Vue 状态管理库 |

### UI 与样式

| 技术 | 版本 | 说明 |
|------|------|------|
| **WD UI** | 自维护版本 | 基于 Wot Design Uni 的组件库 |
| **UnoCSS** | 65.4.2 | 原子化 CSS 引擎 |
| **SCSS** | 1.77.8 | CSS 预处理器 |

### 开发工具链

| 工具 | 说明 |
|------|------|
| **ESLint** | 代码质量检查 |
| **Prettier** | 代码格式化 |
| **unplugin-auto-import** | 自动导入 Vue API |
| **@uni-helper/vite-plugin-uni-pages** | 页面路由自动生成 |
| **@uni-helper/vite-plugin-uni-layouts** | 布局系统支持 |
| **@uni-helper/vite-plugin-uni-components** | 组件自动注册 |

### 安全与加密

| 技术 | 版本 | 说明 |
|------|------|------|
| **crypto-js** | 4.2.0 | AES 加密库 |
| **jsencrypt** | 3.3.2 | RSA 加密库 |

---

## 🛠️ 环境准备

### 1. Node.js 环境安装

#### Windows 系统

**方式一：使用 nvm-windows (推荐)**

```bash
# 1. 下载 nvm-windows
# 访问 https://github.com/coreybutler/nvm-windows/releases
# 下载 nvm-setup.exe 并安装

# 2. 安装 Node.js
nvm install 18
nvm use 18

# 3. 验证安装
node -v
npm -v
```

**方式二：直接安装**

访问 [Node.js 官网](https://nodejs.org/) 下载 LTS 版本安装。

#### macOS/Linux 系统

```bash
# 使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载配置
source ~/.bashrc  # 或 ~/.zshrc

# 安装 Node.js
nvm install 18
nvm use 18
```

### 2. pnpm 包管理器安装

项目强制使用 pnpm 作为包管理器，这确保了依赖安装的一致性。

```bash
# 全局安装 pnpm
npm install -g pnpm

# 验证安装
pnpm -v

# 配置 pnpm 镜像源(可选，加速下载)
pnpm config set registry https://registry.npmmirror.com
```

### 3. 开发工具安装

#### 微信开发者工具

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 使用微信扫码登录
3. 配置：设置 → 安全设置 → 开启服务端口

#### HBuilderX (App开发)

1. 下载安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 安装 uni-app 编译插件
3. 安装 scss/sass 编译插件
4. 配置 Android SDK 或连接 iOS 设备

---

## 🚀 项目启动

### 1. 获取项目代码

```bash
# 克隆项目仓库
git clone https://gitee.com/ruoyi-plus/ruoyi-plus-uniapp.git

# 进入移动端项目目录
cd ruoyi-plus-uniapp/plus-uniapp
```

### 2. 安装依赖

```bash
# 安装项目依赖
pnpm install

# 如果安装失败，尝试以下步骤
# 1. 清除 pnpm 缓存
pnpm store prune

# 2. 删除已有的 node_modules
rm -rf node_modules

# 3. 删除 lock 文件
rm pnpm-lock.yaml

# 4. 重新安装
pnpm install
```

### 3. 环境配置

项目使用 `env/` 目录管理环境变量，支持开发、生产等多环境配置。

#### 基础配置 (env/.env)

```bash
# 应用标识
VITE_APP_ID=ryplus_uni

# 微信小程序 AppID (必须配置才能运行小程序)
VITE_WECHAT_MINI_APP_ID=your_wechat_appid

# 微信公众号 AppID
VITE_WECHAT_OFFICIAL_APP_ID=your_wechat_h5_appid

# 支付宝小程序 AppID
VITE_ALIPAY_MINI_APP_ID=your_alipay_appid

# 百度小程序 App Key
VITE_BAIDU_MINI_APP_KEY=your_baidu_appkey

# 抖音小程序 AppID
VITE_TOUTIAO_MINI_APP_ID=your_toutiao_appid

# QQ小程序 AppID
VITE_QQ_MINI_APP_ID=your_qq_appid

# 京东小程序 AppID
VITE_JD_MINI_APP_ID=your_jd_appid

# 快手小程序 AppID
VITE_KUAISHOU_MINI_APP_ID=your_kuaishou_appid

# 飞书小程序 AppID
VITE_LARK_MINI_APP_ID=your_lark_appid

# 小红书小程序 AppID
VITE_XHS_MINI_APP_ID=your_xhs_appid

# WebSocket 开关 (true/false)
VITE_WEBSOCKET_ENABLE=false

# RSA 公钥 (用于数据加密传输)
VITE_RSA_PUBLIC_KEY=your_rsa_public_key
```

#### 开发环境配置 (env/.env.development)

```bash
# 后端 API 地址
VITE_BASE_URL=http://localhost:5500

# 开启调试模式
VITE_DEBUG=true
```

#### 生产环境配置 (env/.env.production)

```bash
# 后端 API 地址
VITE_BASE_URL=https://your-api-domain.com

# 关闭调试模式
VITE_DEBUG=false
```

### 4. 多端启动

#### H5 端开发

```bash
# 启动 H5 开发服务器
pnpm dev:h5

# 启动成功后访问：http://localhost:100
# 支持热更新，修改代码后自动刷新
```

**H5 端特点：**

- 开发效率最高，支持热更新
- 可在浏览器中使用开发者工具调试
- 适合快速验证功能逻辑
- 支持 Vue DevTools 调试

#### 微信小程序开发

```bash
# 编译微信小程序
pnpm dev:mp-weixin
```

**编译完成后的操作步骤：**

1. 打开微信开发者工具
2. 选择「导入项目」
3. 项目目录选择：`dist/dev/mp-weixin`
4. AppID 填写 `env/.env` 中配置的 `VITE_WECHAT_MINI_APP_ID`
5. 点击「导入」

::: tip 开发调试技巧
- 在微信开发者工具中勾选「不校验合法域名」方便本地调试
- 使用「预览」功能可以在真机上测试
- 开启「增强编译」获得更好的兼容性
:::

#### 支付宝小程序开发

```bash
# 编译支付宝小程序
pnpm dev:mp-alipay
```

编译完成后：

1. 打开支付宝开发者工具
2. 选择「打开项目」
3. 项目目录选择：`dist/dev/mp-alipay`

#### 其他小程序平台

```bash
# 百度小程序
pnpm dev:mp-baidu

# 抖音小程序
pnpm dev:mp-toutiao

# QQ小程序
pnpm dev:mp-qq

# 京东小程序
pnpm dev:mp-jd

# 快手小程序
pnpm dev:mp-kuaishou

# 飞书小程序
pnpm dev:mp-lark

# 小红书小程序
pnpm dev:mp-xhs

# 鸿蒙小程序
pnpm dev:mp-harmony
```

#### APP 端开发

```bash
# 编译通用 APP
pnpm dev:app

# 编译 Android APP
pnpm dev:app-android

# 编译 iOS APP
pnpm dev:app-ios

# 编译鸿蒙 APP
pnpm dev:app-harmony
```

**使用 HBuilderX 运行：**

1. 打开 HBuilderX
2. 文件 → 导入 → 从本地目录导入
3. 选择目录：`dist/dev/app-plus`
4. 运行 → 运行到手机或模拟器

---

## 📱 多端开发脚本

### 开发环境启动

| 平台 | 命令 | 输出目录 | 说明 |
|------|------|----------|------|
| H5 | `pnpm dev:h5` | - | 浏览器运行，支持热更新 |
| 微信小程序 | `pnpm dev:mp-weixin` | `dist/dev/mp-weixin` | 编译到微信小程序格式 |
| 支付宝小程序 | `pnpm dev:mp-alipay` | `dist/dev/mp-alipay` | 编译到支付宝小程序格式 |
| 百度小程序 | `pnpm dev:mp-baidu` | `dist/dev/mp-baidu` | 编译到百度小程序格式 |
| QQ小程序 | `pnpm dev:mp-qq` | `dist/dev/mp-qq` | 编译到QQ小程序格式 |
| 抖音小程序 | `pnpm dev:mp-toutiao` | `dist/dev/mp-toutiao` | 编译到抖音小程序格式 |
| 京东小程序 | `pnpm dev:mp-jd` | `dist/dev/mp-jd` | 编译到京东小程序格式 |
| 快手小程序 | `pnpm dev:mp-kuaishou` | `dist/dev/mp-kuaishou` | 编译到快手小程序格式 |
| 飞书小程序 | `pnpm dev:mp-lark` | `dist/dev/mp-lark` | 编译到飞书小程序格式 |
| 小红书小程序 | `pnpm dev:mp-xhs` | `dist/dev/mp-xhs` | 编译到小红书小程序格式 |
| 鸿蒙小程序 | `pnpm dev:mp-harmony` | `dist/dev/mp-harmony` | 编译到鸿蒙小程序格式 |
| APP | `pnpm dev:app` | `dist/dev/app-plus` | 编译到APP格式 |
| Android APP | `pnpm dev:app-android` | `dist/dev/app-android` | 仅编译 Android |
| iOS APP | `pnpm dev:app-ios` | `dist/dev/app-ios` | 仅编译 iOS |
| 鸿蒙 APP | `pnpm dev:app-harmony` | `dist/dev/app-harmony` | 编译到鸿蒙 APP |
| 快应用 | `pnpm dev:quickapp-webview` | `dist/dev/quickapp-webview` | 编译到快应用格式 |

### 生产环境构建

| 平台 | 命令 | 输出目录 |
|------|------|----------|
| H5 | `pnpm build:h5` | `dist/build/h5` |
| 微信小程序 | `pnpm build:mp-weixin` | `dist/build/mp-weixin` |
| 支付宝小程序 | `pnpm build:mp-alipay` | `dist/build/mp-alipay` |
| 百度小程序 | `pnpm build:mp-baidu` | `dist/build/mp-baidu` |
| QQ小程序 | `pnpm build:mp-qq` | `dist/build/mp-qq` |
| 抖音小程序 | `pnpm build:mp-toutiao` | `dist/build/mp-toutiao` |
| APP | `pnpm build:app` | `dist/build/app-plus` |

### 其他脚本

```bash
# TypeScript 类型检查
pnpm type-check

# ESLint 代码检查
pnpm lint

# ESLint 自动修复
pnpm lint:fix

# 升级 uni-app 版本
pnpm uvm
```

---

## 📁 项目结构

```text
plus-uniapp/
├── env/                          # 环境变量配置
│   ├── .env                      # 基础配置(所有环境共享)
│   ├── .env.development          # 开发环境配置
│   └── .env.production           # 生产环境配置
│
├── src/                          # 源代码目录
│   ├── api/                      # API 接口模块
│   │   ├── app/                  # 应用相关接口
│   │   ├── common/               # 通用接口
│   │   └── system/               # 系统管理接口
│   │
│   ├── components/               # 业务组件
│   │   ├── auth/                 # 授权相关组件
│   │   ├── index/                # 首页组件
│   │   └── tabbar/               # 底部导航组件
│   │
│   ├── composables/              # 组合式函数
│   │   ├── useAppInit.ts         # 应用初始化
│   │   ├── useHttp.ts            # HTTP 请求
│   │   ├── useAuth.ts            # 认证授权
│   │   ├── useToast.ts           # 轻提示
│   │   ├── useModal.ts           # 模态框
│   │   ├── useWebSocket.ts       # WebSocket
│   │   └── ...
│   │
│   ├── layouts/                  # 布局组件
│   │   ├── default.vue           # 默认布局
│   │   └── custom-navbar.vue     # 自定义导航栏布局
│   │
│   ├── locales/                  # 国际化语言包
│   │   ├── zh-CN.ts              # 中文
│   │   └── en-US.ts              # 英文
│   │
│   ├── pages/                    # 主包页面
│   │   ├── index/                # 首页
│   │   │   └── index.vue
│   │   ├── auth/                 # 认证页面
│   │   │   └── login.vue
│   │   └── my/                   # 我的页面
│   │       └── index.vue
│   │
│   ├── pages-sub/                # 分包页面
│   │   └── admin/                # 管理后台分包
│   │       ├── user/             # 用户管理
│   │       ├── role/             # 角色管理
│   │       └── ...
│   │
│   ├── static/                   # 静态资源
│   │   ├── app/                  # 应用图标和启动图
│   │   └── style/                # 全局样式
│   │       └── index.scss
│   │
│   ├── stores/                   # Pinia 状态管理
│   │   ├── store.ts              # Store 入口
│   │   └── modules/
│   │       ├── user.ts           # 用户状态
│   │       ├── app.ts            # 应用状态
│   │       └── feature.ts        # 功能配置状态
│   │
│   ├── types/                    # TypeScript 类型定义
│   │   ├── api.d.ts              # API 类型
│   │   ├── global.d.ts           # 全局类型
│   │   └── ...
│   │
│   ├── uni_modules/              # uni-app 插件模块
│   │
│   ├── utils/                    # 工具函数
│   │   ├── http.ts               # HTTP 封装
│   │   ├── storage.ts            # 存储封装
│   │   ├── platform.ts           # 平台判断
│   │   ├── crypto.ts             # 加密工具
│   │   ├── logger.ts             # 日志工具
│   │   └── ...
│   │
│   ├── wd/                       # WD UI 组件库
│   │   ├── components/           # 组件实现
│   │   └── locale/               # 组件国际化
│   │
│   ├── App.vue                   # 应用根组件
│   ├── main.ts                   # 应用入口
│   ├── manifest.json             # 应用配置(自动生成)
│   └── pages.json                # 页面路由配置(自动生成)
│
├── vite/                         # Vite 插件配置
│
├── .editorconfig                 # 编辑器配置
├── .eslintrc-auto-import.json    # ESLint 自动导入配置
├── .gitignore                    # Git 忽略文件
├── .npmrc                        # npm 配置
├── .prettierrc.cjs               # Prettier 配置
├── eslint.config.mjs             # ESLint 配置
├── index.html                    # HTML 模板
├── manifest.config.ts            # manifest.json 配置源
├── package.json                  # 项目配置
├── pages.config.ts               # pages.json 配置源
├── tsconfig.json                 # TypeScript 配置
├── uno.config.ts                 # UnoCSS 配置
└── vite.config.ts                # Vite 配置
```

---

## 🔧 项目配置文件

### 核心配置文件说明

| 文件 | 说明 | 用途 |
|------|------|------|
| `manifest.config.ts` | 应用配置源 | 配置应用信息、权限、SDK、各平台 AppID |
| `pages.config.ts` | 页面路由配置源 | 配置页面路径、窗口样式、tabBar、分包 |
| `vite.config.ts` | Vite 构建配置 | 配置构建工具、插件、代理等 |
| `uno.config.ts` | UnoCSS 配置 | 配置原子化 CSS 规则和主题 |
| `tsconfig.json` | TypeScript 配置 | 配置类型检查和编译选项 |
| `eslint.config.mjs` | ESLint 配置 | 配置代码规范检查规则 |

### manifest.config.ts 关键配置

```typescript
// manifest.config.ts
import process from 'node:process'
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'
import pkg from './package.json'

export default defineManifestConfig({
  // 应用名称
  name: pkg.name,
  // 应用 ID
  appid: process.env.VITE_APP_ID,
  // 应用描述
  description: pkg.description,
  // 版本名称
  versionName: pkg.version,
  // 版本号
  versionCode: 1,
  // 是否转换 px 到 rpx
  transformPx: false,

  // 微信小程序配置
  'mp-weixin': {
    appid: process.env.VITE_WECHAT_MINI_APP_ID,
    setting: {
      urlCheck: false,
      es6: true,
      postcss: true,
      minified: true,
    },
    usingComponents: true,
    permission: {
      'scope.userLocation': {
        desc: '用于获取您的位置信息',
      },
    },
    // ...
  },

  // APP 配置
  app: {
    distribute: {
      android: {
        permissions: [
          '<uses-permission android:name="android.permission.CAMERA"/>',
          '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>',
          '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>',
        ],
      },
    },
  },
})
```

### pages.config.ts 关键配置

```typescript
// pages.config.ts
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  // 全局样式
  globalStyle: {
    navigationBarTextStyle: 'black',
    navigationBarTitleText: 'RuoYi-Plus',
    navigationBarBackgroundColor: '#F8F8F8',
    backgroundColor: '#F8F8F8',
    // 使用自定义导航栏
    navigationStyle: 'custom',
  },

  // easycom 组件自动注册
  easycom: {
    autoscan: true,
    custom: {
      // WD UI 组件自动注册
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    },
  },

  // TabBar 配置
  tabBar: {
    custom: true,
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/my/index', text: '我的' },
    ],
  },
})
```

---

## 🔍 开发调试

### H5 端调试

```bash
# 启动开发服务器
pnpm dev:h5

# 使用浏览器开发者工具 (F12) 进行调试
# - Elements: 查看 DOM 结构
# - Console: 查看日志输出
# - Network: 分析网络请求
# - Sources: 断点调试
# - Performance: 性能分析
```

**Vue DevTools 调试：**

1. 安装 [Vue DevTools](https://devtools.vuejs.org/) 浏览器扩展
2. 打开开发者工具，切换到 Vue 面板
3. 可以查看组件树、状态、事件等

### 小程序调试

**微信开发者工具调试技巧：**

1. **真机预览**：点击「预览」扫码在手机上测试
2. **真机调试**：点击「真机调试」可远程调试真机
3. **性能分析**：使用「调试器」→「Performance」分析性能
4. **网络请求**：在「调试器」→「Network」查看请求详情

**常用调试设置：**

```json
// project.config.json
{
  "setting": {
    "urlCheck": false,      // 不校验合法域名
    "es6": true,            // ES6 转 ES5
    "postcss": true,        // 样式补全
    "minified": true,       // 代码压缩
    "newFeature": true,     // 新特性
    "autoAudits": false     // 关闭自动审计
  }
}
```

### APP 调试

**使用 HBuilderX 调试：**

1. 连接真机或启动模拟器
2. 运行 → 运行到手机或模拟器
3. 使用控制台查看日志输出
4. 支持断点调试和热重载

**使用 Chrome 调试 WebView：**

1. 在 Android 设备上开启开发者模式
2. 使用 USB 连接电脑
3. Chrome 访问 `chrome://inspect`
4. 找到对应的 WebView 进行调试

---

## 📱 开发流程指南

### 创建新页面

#### 1. 在 pages 目录创建页面文件

```vue
<!-- src/pages/user/profile.vue -->
<template>
  <view class="profile-page">
    <wd-navbar title="个人信息" />

    <view class="content">
      <wd-cell-group>
        <wd-cell title="头像" is-link>
          <template #value>
            <wd-image
              :src="userInfo.avatar"
              width="80rpx"
              height="80rpx"
              round
            />
          </template>
        </wd-cell>
        <wd-cell title="昵称" :value="userInfo.nickname" is-link />
        <wd-cell title="手机号" :value="userInfo.phone" is-link />
      </wd-cell-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

const userInfo = ref({
  avatar: '',
  nickname: '',
  phone: '',
})

onMounted(() => {
  userInfo.value = userStore.userInfo || {}
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content {
  padding: 24rpx;
}
</style>
```

#### 2. 页面自动注册

使用 `@uni-helper/vite-plugin-uni-pages` 插件后，页面会自动注册到 `pages.json`。

如需手动配置页面属性，可以使用 `definePage` 宏：

```vue
<script lang="ts" setup>
// 页面配置
definePage({
  style: {
    navigationBarTitleText: '个人信息',
  },
})
</script>
```

#### 3. 页面跳转

```typescript
// 普通跳转(保留当前页面)
uni.navigateTo({
  url: '/pages/user/profile'
})

// 重定向(关闭当前页面)
uni.redirectTo({
  url: '/pages/user/profile'
})

// 返回上一页
uni.navigateBack()

// Tab 页面跳转
uni.switchTab({
  url: '/pages/index/index'
})

// 关闭所有页面并跳转
uni.reLaunch({
  url: '/pages/auth/login'
})

// 带参数跳转
uni.navigateTo({
  url: '/pages/user/detail?id=123&name=test'
})
```

### 创建分包页面

分包可以有效减少主包大小，提升小程序加载速度。

#### 1. 在 pages-sub 目录创建分包页面

```vue
<!-- src/pages-sub/admin/user/list.vue -->
<template>
  <view class="user-list-page">
    <wd-navbar title="用户管理" left-arrow @click-left="handleBack" />

    <wd-search v-model="keyword" @search="handleSearch" placeholder="搜索用户" />

    <scroll-view scroll-y class="list-container" @scrolltolower="loadMore">
      <view v-for="user in userList" :key="user.id" class="user-item">
        <wd-image :src="user.avatar" width="100rpx" height="100rpx" round />
        <view class="user-info">
          <text class="name">{{ user.nickname }}</text>
          <text class="phone">{{ user.phone }}</text>
        </view>
        <wd-icon name="arrow-right" />
      </view>

      <wd-loading v-if="loading" />
      <view v-else-if="!hasMore" class="no-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { getUserList } from '@/api/system/user'

// 页面配置
definePage({
  style: {
    navigationBarTitleText: '用户管理',
    navigationStyle: 'custom',
  },
})

const keyword = ref('')
const userList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)

const handleBack = () => {
  uni.navigateBack()
}

const handleSearch = async () => {
  page.value = 1
  userList.value = []
  await fetchUserList()
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  page.value++
  await fetchUserList()
}

const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      pageNum: page.value,
      pageSize: 10,
      keyword: keyword.value,
    })
    if (page.value === 1) {
      userList.value = res.rows
    } else {
      userList.value.push(...res.rows)
    }
    hasMore.value = userList.value.length < res.total
  } finally {
    loading.value = false
  }
}

fetchUserList()
</script>
```

#### 2. 分包配置

分包会根据目录结构自动配置。如需自定义分包设置，可在 `pages.config.ts` 中配置：

```typescript
// pages.config.ts
export default defineUniPages({
  // 分包配置
  subPackages: [
    {
      root: 'pages-sub/admin',
      pages: [],  // 会自动扫描
    },
  ],

  // 分包预下载
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['pages-sub/admin'],
    },
  },
})
```

### 使用组合式函数

#### 创建自定义 Composable

```typescript
// src/composables/useList.ts
import { ref, reactive } from 'vue'

interface ListOptions<T> {
  fetchApi: (params: any) => Promise<{ rows: T[]; total: number }>
  pageSize?: number
  immediate?: boolean
}

export function useList<T>(options: ListOptions<T>) {
  const { fetchApi, pageSize = 10, immediate = true } = options

  const list = ref<T[]>([])
  const loading = ref(false)
  const hasMore = ref(true)
  const pagination = reactive({
    pageNum: 1,
    pageSize,
    total: 0,
  })

  const fetchList = async (reset = false) => {
    if (reset) {
      pagination.pageNum = 1
      list.value = []
      hasMore.value = true
    }

    if (loading.value || !hasMore.value) return

    loading.value = true
    try {
      const res = await fetchApi({
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      })

      if (reset) {
        list.value = res.rows as any
      } else {
        list.value.push(...res.rows as any)
      }

      pagination.total = res.total
      hasMore.value = list.value.length < res.total
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    pagination.pageNum++
    await fetchList()
  }

  const refresh = () => fetchList(true)

  // 立即获取数据
  if (immediate) {
    fetchList(true)
  }

  return {
    list,
    loading,
    hasMore,
    pagination,
    fetchList,
    loadMore,
    refresh,
  }
}
```

#### 使用 Composable

```vue
<script lang="ts" setup>
import { useList } from '@/composables/useList'
import { getUserList } from '@/api/system/user'

const { list, loading, hasMore, loadMore, refresh } = useList({
  fetchApi: getUserList,
  pageSize: 20,
})

// 下拉刷新
onPullDownRefresh(async () => {
  await refresh()
  uni.stopPullDownRefresh()
})
</script>
```

### API 接口开发

#### 创建 API 模块

```typescript
// src/api/system/user.ts
import { useHttp } from '@/composables/useHttp'

const http = useHttp()

// 类型定义
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  email: string
  roles: string[]
  permissions: string[]
}

export interface LoginParams {
  username: string
  password: string
  code?: string
  uuid?: string
}

export interface LoginResult {
  token: string
  expires: number
}

// 用户登录
export function login(params: LoginParams): Promise<LoginResult> {
  return http.post('/auth/login', params)
}

// 获取用户信息
export function getUserInfo(): Promise<UserInfo> {
  return http.get('/system/user/info')
}

// 获取用户列表
export function getUserList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
}): Promise<{ rows: UserInfo[]; total: number }> {
  return http.get('/system/user/list', params)
}

// 更新用户信息
export function updateUserInfo(data: Partial<UserInfo>): Promise<void> {
  return http.put('/system/user/profile', data)
}

// 修改密码
export function changePassword(data: {
  oldPassword: string
  newPassword: string
}): Promise<void> {
  return http.put('/system/user/password', data)
}

// 上传头像
export function uploadAvatar(filePath: string): Promise<{ url: string }> {
  return http.upload('/system/user/avatar', filePath)
}

// 用户登出
export function logout(): Promise<void> {
  return http.post('/auth/logout')
}
```

---

## 🔧 开发工具配置

### VS Code 配置

#### 推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "antfu.unocss",
    "evils.uniapp-vscode",
    "uni-helper.uni-helper-vscode"
  ]
}
```

#### 编辑器配置

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[vue]": {
    "editor.defaultFormatter": "Vue.volar"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "unocss.root": ".",
  "files.associations": {
    "pages.json": "jsonc",
    "manifest.json": "jsonc"
  }
}
```

### 微信开发者工具配置

```json
// project.config.json
{
  "miniprogramRoot": "./",
  "projectname": "ruoyi-plus-uniapp",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "postcss": true,
    "minified": true,
    "newFeature": true,
    "nodeModules": false,
    "autoAudits": false
  },
  "compileType": "miniprogram"
}
```

**开发建议：**

1. **启用不校验域名**：设置 → 项目设置 → 勾选「不校验合法域名」
2. **启用 ES6 转 ES5**：设置 → 项目设置 → 勾选「ES6 转 ES5」
3. **开启增强编译**：设置 → 项目设置 → 勾选「增强编译」

---

## 🐛 常见问题排查

### 1. 依赖安装失败

**问题表现：**

```bash
Error: Unable to resolve module xxx
ERR_PNPM_PEER_DEP_ISSUES
```

**解决方案：**

```bash
# 清除 pnpm 缓存
pnpm store prune

# 删除 node_modules
rm -rf node_modules

# 删除 lock 文件
rm pnpm-lock.yaml

# 重新安装
pnpm install
```

### 2. 微信小程序编译失败

**问题表现：**

- 白屏
- 页面加载失败
- 组件不显示

**解决方案：**

1. 检查 AppID 配置是否正确
2. 检查开发者工具版本是否最新
3. 清除开发者工具缓存：详情 → 本地设置 → 清除缓存

```bash
# 删除旧的编译产物
rm -rf dist/dev/mp-weixin

# 重新编译
pnpm dev:mp-weixin
```

### 3. H5 跨域问题

**问题表现：**

```text
Access to XMLHttpRequest blocked by CORS policy
```

**解决方案：**

方案一：配置 Vite 代理

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

方案二：后端配置 CORS 允许跨域请求

### 4. 样式不生效

**问题表现：**

- 组件样式异常
- 自定义样式被覆盖
- rpx 单位不转换

**解决方案：**

```scss
// 使用 :deep() 穿透组件样式
.custom-button {
  :deep(.wd-button__text) {
    font-size: 32rpx;
  }
}

// 使用 !important 提高优先级(不推荐)
.force-style {
  color: red !important;
}

// 确保使用 rpx 单位
.container {
  padding: 32rpx;
  margin: 24rpx;
}
```

### 5. 页面跳转失败

**问题表现：**

- 页面白屏
- 路由报错
- 参数丢失

**解决方案：**

```typescript
// 检查路径是否正确（必须以 / 开头）
uni.navigateTo({
  url: '/pages/user/profile', // ✅ 正确
  // url: 'pages/user/profile', // ❌ 错误
})

// 接收页面参数
// 方式一：使用 defineProps
const props = defineProps<{
  id: string
  name: string
}>()

// 方式二：使用 onLoad
onLoad((options) => {
  console.log(options.id, options.name)
})
```

### 6. 请求接口失败

**问题表现：**

- 接口 404
- 请求超时
- 数据格式错误

**解决方案：**

```typescript
// 1. 检查环境配置
// env/.env.development
VITE_BASE_URL=http://localhost:8080

// 2. 检查请求拦截器是否正确添加 token
// 3. 检查请求路径是否正确
// 4. 查看控制台网络请求详情

// 开启调试日志
console.log('Request URL:', config.url)
console.log('Request Headers:', config.header)
console.log('Request Data:', config.data)
```

### 7. 小程序体积过大

**问题表现：**

- 主包超过 2MB 限制
- 总包超过 20MB 限制

**解决方案：**

1. **使用分包**

```typescript
// pages.config.ts
export default defineUniPages({
  subPackages: [
    {
      root: 'pages-sub/admin',
      pages: ['user/list', 'role/list'],
    },
  ],
})
```

2. **图片优化**

- 使用 CDN 加载图片
- 压缩本地图片
- 使用 WebP 格式

3. **按需引入组件**

4. **分析包体积**

```bash
# 查看构建产物大小
du -sh dist/build/mp-weixin/*
```

### 8. TypeScript 类型错误

**问题表现：**

```text
Cannot find module '@/xxx' or its corresponding type declarations
```

**解决方案：**

检查 `tsconfig.json` 中的路径别名配置：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 📦 生产部署

### H5 部署

```bash
# 构建生产版本
pnpm build:h5

# 构建产物在 dist/build/h5 目录
# 将此目录下的文件部署到 Web 服务器即可
```

**Nginx 配置示例：**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/h5;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://backend-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 小程序发布

1. 构建生产版本

```bash
pnpm build:mp-weixin
```

2. 在微信开发者工具中上传代码
3. 在微信公众平台提交审核
4. 审核通过后发布

### APP 打包

1. 构建生产版本

```bash
pnpm build:app
```

2. 使用 HBuilderX 打开 `dist/build/app-plus`
3. 发行 → 云打包 或 本地打包

---

## 🎉 开发环境就绪

恭喜！如果以上步骤都顺利完成，你的移动端开发环境已经成功搭建。

### 接下来可以

1. **阅读项目结构文档** - 深入了解项目目录组织
2. **学习 WD UI 组件** - 熟悉移动端组件库的使用
3. **查看示例代码** - 运行 demo 分包查看组件示例
4. **开始业务开发** - 创建自己的页面和功能

### 快速参考

| 需求 | 操作 |
|------|------|
| 启动 H5 开发 | `pnpm dev:h5` |
| 启动微信小程序 | `pnpm dev:mp-weixin` |
| 创建新页面 | 在 pages 目录创建 .vue 文件 |
| 使用组件 | `<wd-button>` 自动导入 |
| 调用接口 | 使用 `useHttp` composable |
| 状态管理 | 使用 Pinia stores |
| 类型检查 | `pnpm type-check` |
| 代码检查 | `pnpm lint` |

开始你的跨平台移动端开发之旅吧！🚀
