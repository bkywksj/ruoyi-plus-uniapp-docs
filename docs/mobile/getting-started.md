# 移动端快速启动

本章节将指导你快速启动 Ruoyi-Plus-Uniapp 移动端项目，支持 H5、微信小程序、支付宝小程序、App 等多端开发。

## 🎯 环境要求

### 必需环境
- **Node.js**: >= 18.0.0
- **包管理器**: pnpm >= 7.30.0 (推荐)
- **UniApp CLI**: 最新版本

### 平台开发工具
- **H5开发**: 现代浏览器即可
- **微信小程序**: [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- **支付宝小程序**: [支付宝开发者工具](https://opendocs.alipay.com/mini/ide/download)
- **App开发**: [HBuilderX](https://www.dcloud.io/hbuilderx.html)

### 推荐工具
- **IDE**: IDEA / VS Code
- **版本管理**: [Git](https://git-scm.com/downloads)
- **Node管理**: [nvm (用于多版本管理)](https://github.com/coreybutler/nvm-windows)

## 🛠️ 环境准备

### 1. Node.js 环境安装

参考前端章节的环境安装说明，确保 Node.js >= 18.0.0

### 2. 开发工具安装

#### 微信开发者工具
1. 下载并安装微信开发者工具
2. 登录微信开发者账号
3. 配置服务端口（用于调试）

#### HBuilderX (App开发)
1. 下载安装 HBuilderX
2. 安装 uni-app 插件
3. 配置 Android/iOS 开发环境

## 🚀 项目启动

### 1. 获取项目代码

```bash
# 进入移动端项目目录
cd ruoyi-plus-uniapp/plus-uniapp
```

### 2. 安装依赖

```bash
# 安装项目依赖
pnpm install

# 如果安装失败，清除缓存后重新安装
pnpm store prune
pnpm install
```

### 3. 环境配置

编辑 `env/.env` 配置文件：

```text
# 开发环境配置
VITE_APP_ENV=development

# 后端API地址
VITE_BASE_URL=http://localhost:5500

# 应用标识符
VITE_APP_ID=ryplus_uni

# 微信小程序 AppID (需要申请)
VITE_WECHAT_MINI_APP_ID=your_wechat_appid

# 支付宝小程序 AppID (需要申请)  
VITE_WECHAT_OFFICIAL_APP_ID=your_alipay_appid
```

### 4. 多端启动

#### H5 端开发

```bash
# 启动 H5 开发服务器
pnpm dev:h5

# 启动成功后访问：http://localhost:100
```

H5 端特点：
- 支持热更新，开发效率高
- 可在浏览器中直接调试
- 支持浏览器开发者工具

#### 微信小程序开发

```bash
# 编译微信小程序
pnpm dev:mp-weixin
```

编译完成后：
1. 打开微信开发者工具
2. 选择「导入项目」
3. 项目目录选择：`dist/dev/mp-weixin`
4. AppID需提前在env/.env中配置VITE_WECHAT_MINI_APP_ID

::: tip 💡 微信小程序调试
- 在微信开发者工具中可以实时预览和调试
- 支持真机预览和调试
- 可以使用开发者工具的调试面板
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

#### APP 端开发

```bash
# 编译 APP
pnpm dev:app
```

编译完成后：
1. 打开 HBuilderX
2. 文件 → 导入 → 从本地目录导入
3. 选择目录：`dist/dev/app-plus`
4. 连接手机或使用模拟器运行

## 📱 多端开发脚本

### 开发环境启动

| 平台 | 命令 | 说明 |
|------|------|------|
| H5 | `pnpm dev:h5` | 浏览器运行，支持热更新 |
| 微信小程序 | `pnpm dev:mp-weixin` | 编译到微信小程序格式 |
| 支付宝小程序 | `pnpm dev:mp-alipay` | 编译到支付宝小程序格式 |
| 百度小程序 | `pnpm dev:mp-baidu` | 编译到百度小程序格式 |
| QQ小程序 | `pnpm dev:mp-qq` | 编译到QQ小程序格式 |
| 抖音小程序 | `pnpm dev:mp-toutiao` | 编译到抖音小程序格式 |
| 京东小程序 | `pnpm dev:mp-jd` | 编译到京东小程序格式 |
| APP | `pnpm dev:app` | 编译到APP格式 |

### 生产环境构建

| 平台 | 命令 | 输出目录 |
|------|------|----------|
| H5 | `pnpm build:h5` | `dist/build/h5` |
| 微信小程序 | `pnpm build:mp-weixin` | `dist/build/mp-weixin` |
| 支付宝小程序 | `pnpm build:mp-alipay` | `dist/build/mp-alipay` |
| APP | `pnpm build:app` | `dist/build/app-plus` |

## 🔧 项目配置文件

### 核心配置文件

| 文件 | 说明 | 作用 |
|------|------|------|
| `manifest.json` | UniApp 应用配置清单 | 配置应用信息、权限、SDK等 |
| `pages.config.ts` | 页面路由配置 | 配置页面路径、窗口样式、tabBar等 |
| `uni.scss` | 全局样式变量 | 定义全局SCSS变量 |
| `vite.config.ts` | Vite 构建配置 | 构建工具配置 |
| `uno.config.ts` | UnoCSS 配置 | 原子化CSS配置 |

### 环境配置

```text
env/
├── .env                 # 公共配置
├── .env.development     # 开发环境配置
└── .env.production      # 生产环境配置
```

## 🔍 开发调试

### H5 端调试
```bash
# 启动并在浏览器中调试
pnpm dev:h5

# 使用浏览器开发者工具进行调试
# 支持断点调试、网络分析、性能分析等
```

### 小程序调试
1. 在对应的开发者工具中导入项目
2. 使用开发者工具的调试面板
3. 支持真机预览和调试
4. 可以查看网络请求、存储数据等

### APP 调试
1. 在 HBuilderX 中导入项目
2. 连接真机或使用模拟器
3. 使用 HBuilderX 的调试功能
4. 支持断点调试和日志查看

## 🌟 开发建议

### 代码组织
1. **页面开发**: 在 `src/pages` 或 `src/subpackages` 中创建页面
2. **组件开发**: 使用 WotUI 组件库，保持界面一致性
3. **API调用**: 使用 `useHttp` 组合函数统一处理请求

### 跨平台注意事项
1. **条件编译**: 使用 `#ifdef` 处理平台差异
2. **API兼容**: 注意不同平台API的差异
3. **样式适配**: 使用 rpx 单位确保不同设备适配

### 性能优化
1. **分包加载**: 合理使用分包减少主包大小
2. **图片优化**: 使用合适格式和大小的图片
3. **组件按需引入**: 避免全量引入组件库

## 🎉 开发环境就绪

恭喜！如果以上步骤都顺利完成，你的移动端开发环境已经成功搭建。

开始你的跨平台移动端开发之旅吧！🚀
