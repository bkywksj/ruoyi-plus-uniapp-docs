# UniApp 概览

## 什么是 uni-app？

uni-app 是一个使用 Vue.js 开发所有前端应用的框架，开发者编写一套代码，可发布到iOS、Android、Web（响应式）、以及各种小程序（微信/支付宝/百度/头条/QQ/钉钉/淘宝）、快应用等多个平台。

## 核心特性

### 1. 跨平台支持

一套代码，多端运行：

- **移动端应用**：iOS App、Android App
- **H5网页**：响应式移动端网页
- **小程序平台**：
  - 微信小程序
  - 支付宝小程序
  - 百度小程序
  - 字节跳动小程序（抖音、头条）
  - QQ小程序
  - 快手小程序
  - 京东小程序
  - 小红书小程序
  - 鸿蒙小程序
- **快应用**：华为、联盟快应用

### 2. Vue 3 生态

- **语法支持**：完整支持 Vue 3 Composition API
- **响应式系统**：基于 Vue 3 的响应式系统
- **组件化开发**：复用 Vue 组件开发经验
- **生态兼容**：支持 Vue 生态的部分库

### 3. 丰富的组件和API

- **内置组件**：60+ 跨端组件
- **扩展组件**：uni-ui、第三方组件库
- **API封装**：统一的跨平台API调用方式
- **原生能力**：调用各平台原生能力

## 项目中的 uni-app 版本

### 版本信息

```json
{
  "name": "ryplus-uni",
  "version": "2.11.0",
  "engines": {
    "node": ">=18",
    "pnpm": ">=7.30"
  }
}
```

### 核心依赖

```json
{
  "@dcloudio/uni-app": "3.0.0-4060620250520001",
  "@dcloudio/uni-components": "3.0.0-4060620250520001",
  "@dcloudio/uni-h5": "3.0.0-4060620250520001",
  "@dcloudio/uni-mp-weixin": "3.0.0-4060620250520001",
  "vue": "^3.4.21",
  "pinia": "2.0.36"
}
```

## 支持的平台

### 📱 小程序平台

| 平台 | 开发命令 | 构建命令 | 状态 |
|------|---------|---------|------|
| 微信小程序 | `pnpm dev:mp-weixin` | `pnpm build:mp-weixin` | ✅ 主要支持 |
| 支付宝小程序 | `pnpm dev:mp-alipay` | `pnpm build:mp-alipay` | ✅ 支持 |
| 百度小程序 | `pnpm dev:mp-baidu` | `pnpm build:mp-baidu` | ✅ 支持 |
| 字节跳动小程序 | `pnpm dev:mp-toutiao` | `pnpm build:mp-toutiao` | ✅ 支持 |
| QQ小程序 | `pnpm dev:mp-qq` | `pnpm build:mp-qq` | ✅ 支持 |
| 快手小程序 | `pnpm dev:mp-kuaishou` | `pnpm build:mp-kuaishou` | ✅ 支持 |
| 京东小程序 | `pnpm dev:mp-jd` | `pnpm build:mp-jd` | ✅ 支持 |
| 小红书小程序 | `pnpm dev:mp-xhs` | `pnpm build:mp-xhs` | ✅ 支持 |
| 飞书小程序 | `pnpm dev:mp-lark` | `pnpm build:mp-lark` | ✅ 支持 |
| 鸿蒙小程序 | `pnpm dev:mp-harmony` | `pnpm build:mp-harmony` | ✅ 支持 |

### 🌐 Web 平台

| 平台 | 开发命令 | 构建命令 | 说明 |
|------|---------|---------|------|
| H5 | `pnpm dev:h5` | `pnpm build:h5` | 移动端响应式网页 |

### 📲 App 平台

| 平台 | 开发命令 | 构建命令 | 说明 |
|------|---------|---------|------|
| App | `pnpm dev:app` | `pnpm build:app` | 同时开发 iOS + Android |
| Android | `pnpm dev:app-android` | `pnpm build:app-android` | 仅Android |
| iOS | `pnpm dev:app-ios` | `pnpm build:app-ios` | 仅iOS |
| 鸿蒙App | `pnpm dev:app-harmony` | `pnpm build:app-harmony` | 鸿蒙原生应用 |

### ⚡ 快应用

| 平台 | 开发命令 | 说明 |
|------|---------|------|
| 快应用 | `pnpm dev:quickapp-webview` | 标准快应用 |
| 华为快应用 | `pnpm dev:quickapp-webview-huawei` | 华为快应用 |
| 联盟快应用 | `pnpm dev:quickapp-webview-union` | 快应用联盟 |

## 项目技术栈

### 核心框架

- **uni-app 3.x**：跨平台应用框架
- **Vue 3.4+**：渐进式 JavaScript 框架
- **TypeScript 5.x**：JavaScript 的超集
- **Vite 6.x**：下一代前端构建工具

### UI 组件库

- **WotUI**：自维护重构版本，基于 Vue 3 + TypeScript
- **uni-ui**：uni-app 官方组件库（按需使用）

### 工具库

- **Pinia**：Vue 3 状态管理
- **UnoCSS**：原子化 CSS 引擎
- **VueUse**：Vue 组合式工具库（部分功能）

### 开发工具

- **ESLint**：代码质量检查
- **Prettier**：代码格式化
- **TypeScript**：类型检查
- **uni-helper**：uni-app 开发增强工具

## 开发环境要求

### Node.js

- **版本要求**：Node.js >= 18
- **推荐版本**：Node.js 20 LTS
- **版本管理**：推荐使用 nvm 管理 Node.js 版本

### 包管理器

- **pnpm >= 7.30**（推荐）
- **npm >= 8.0**（备选）
- **yarn >= 1.22**（备选）

### 开发工具

#### 必备工具

1. **VSCode**：推荐的代码编辑器
   - 安装插件：
     - Volar（Vue 3 支持）
     - uni-create-view（uni-app 页面创建）
     - uni-helper（uni-app 代码提示）
     - ESLint
     - Prettier

2. **微信开发者工具**：调试微信小程序
3. **HBuilderX**：调试 App（可选）

#### 其他平台工具

- **支付宝开发者工具**：调试支付宝小程序
- **百度开发者工具**：调试百度小程序
- **抖音开发者工具**：调试字节跳动小程序
- **QQ开发者工具**：调试QQ小程序

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/ruoyi-plus-uniapp.git
cd plus-uniapp
```

### 2. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 3. 启动开发

#### H5 开发

```bash
pnpm dev:h5
```

访问：http://localhost:100

#### 微信小程序开发

```bash
pnpm dev:mp-weixin
```

然后：
1. 打开微信开发者工具
2. 导入项目目录：`dist/dev/mp-weixin`
3. 配置小程序 AppID

#### App 开发

```bash
pnpm dev:app
```

然后：
1. 打开 HBuilderX
2. 导入项目目录：`dist/dev/app`
3. 连接手机或模拟器运行

### 4. 生产构建

```bash
# H5 构建
pnpm build:h5

# 微信小程序构建
pnpm build:mp-weixin

# App 构建
pnpm build:app
```

## uni-app 特色功能

### 1. 条件编译

针对不同平台编写特定代码：

```vue
<template>
  <!-- #ifdef MP-WEIXIN -->
  <view>仅微信小程序显示</view>
  <!-- #endif -->

  <!-- #ifdef H5 -->
  <view>仅H5显示</view>
  <!-- #endif -->
</template>
```

### 2. 原生渲染

- **小程序**：使用小程序原生渲染
- **App**：使用 Weex 渲染引擎
- **H5**：使用浏览器渲染

### 3. 分包加载

优化小程序包体积：

```json
{
  "pages": [/* 主包页面 */],
  "subPackages": [
    {
      "root": "pages-sub/admin",
      "pages": [/* 分包页面 */]
    }
  ]
}
```

### 4. easycom 自动导入

无需手动导入组件：

```vue
<template>
  <!-- 自动识别并导入 wd-button -->
  <wd-button>按钮</wd-button>
</template>
```

## 平台差异说明

### API 差异

| 功能 | H5 | 小程序 | App |
|------|-----|--------|-----|
| WebSocket | ✅ | ✅ | ✅ |
| SSE | ✅ | ❌ | ✅ |
| DOM操作 | ✅ | ❌ | ❌ |
| BOM对象 | ✅ | 部分 | 部分 |
| 文件系统 | ❌ | ✅ | ✅ |

### 组件差异

| 组件 | H5 | 小程序 | App | 说明 |
|------|-----|--------|-----|------|
| view | ✅ | ✅ | ✅ | div 标签 |
| scroll-view | ✅ | ✅ | ✅ | 滚动区域 |
| swiper | ✅ | ✅ | ✅ | 轮播组件 |
| video | ✅ | ✅ | ✅ | 视频播放 |
| map | ✅ | ✅ | ✅ | 地图组件 |
| canvas | ✅ | ✅ | ✅ | 画布 |

### 样式差异

- **H5**：支持完整的 CSS3
- **小程序**：部分 CSS3 特性受限
- **App**：类似小程序，部分特性受限

## 学习资源

### 官方文档

- **uni-app 官网**：https://uniapp.dcloud.net.cn/
- **Vue 3 文档**：https://cn.vuejs.org/
- **TypeScript 文档**：https://www.typescriptlang.org/zh/

### 社区资源

- **uni-app 论坛**：https://ask.dcloud.net.cn/
- **插件市场**：https://ext.dcloud.net.cn/
- **GitHub**：https://github.com/dcloudio/uni-app

## 常见问题

### 1. 为什么选择 uni-app？

- ✅ 一套代码，多端运行
- ✅ 完整的 Vue 3 生态支持
- ✅ 丰富的组件和 API
- ✅ 活跃的社区和插件市场
- ✅ DCloud 官方技术支持

### 2. 与原生小程序开发的区别？

| 对比项 | uni-app | 原生小程序 |
|--------|---------|-----------|
| 开发语言 | Vue 3 + TypeScript | 小程序专用语法 |
| 跨平台 | ✅ 多端 | ❌ 单一平台 |
| 组件库 | 丰富 | 平台限制 |
| 学习成本 | 低（Vue基础） | 中等 |
| 性能 | 接近原生 | 原生 |

### 3. uni-app 3.x 与 2.x 的区别？

- **编译器**：Vite 替代 Webpack
- **Vue 版本**：Vue 3 替代 Vue 2
- **API**：Composition API 支持
- **类型支持**：更好的 TypeScript 支持
- **性能**：启动和热更新速度提升

## 下一步

- [项目配置 (manifest.json)](./manifest-config.md) - 了解应用配置
- [页面配置 (pages.json)](./pages-config.md) - 了解页面路由配置
- [生命周期](./lifecycle.md) - 掌握应用和页面生命周期
- [路由导航](./navigation.md) - 学习页面跳转和导航
- [条件编译](./conditional.md) - 处理平台差异
