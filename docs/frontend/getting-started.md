# 前端快速启动

## 介绍

本指南将帮助你快速搭建和启动 RuoYi-Plus-UniApp 前端项目开发环境。项目基于 Vue 3.5.13 + TypeScript 5.8.3 + Vite 6.3.2 构建，采用现代化的前端技术栈，提供完整的企业级后台管理解决方案。

**核心特性:**

- **现代化技术栈** - Vue 3 Composition API + TypeScript + Vite
- **组件化开发** - Element Plus 2.9.8 + 自定义业务组件
- **状态管理** - Pinia 3.0.2 响应式状态管理
- **原子化 CSS** - UnoCSS 66.5.2 即时原子化引擎
- **自动导入** - 组件和 API 自动导入，无需手动 import
- **代码规范** - ESLint + Prettier 统一代码风格
- **安全加固** - RSA 加密传输 + 接口安全防护

**项目版本信息:**

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.13 | 渐进式 JavaScript 框架 |
| TypeScript | 5.8.3 | JavaScript 超集 |
| Vite | 6.3.2 | 下一代前端构建工具 |
| Element Plus | 2.9.8 | Vue 3 组件库 |
| Pinia | 3.0.2 | Vue 状态管理 |
| Vue Router | 4.5.0 | Vue 官方路由 |
| UnoCSS | 66.5.2 | 原子化 CSS 引擎 |
| Axios | 1.8.4 | HTTP 客户端 |

---

## 环境要求

### 必需环境

在开始之前，请确保你的开发环境满足以下要求：

| 环境 | 最低版本 | 推荐版本 | 说明 |
|------|----------|----------|------|
| Node.js | 18.18.0 | 20.x LTS | JavaScript 运行时 |
| npm | 8.9.0 | 10.x | Node.js 包管理器 |
| pnpm | 7.30.0 | 9.x | 推荐的包管理器 |
| Git | 2.30.0 | 最新版 | 版本控制工具 |

**版本检查命令:**

```bash
# 检查 Node.js 版本
node -v
# 期望输出: v18.18.0 或更高

# 检查 npm 版本
npm -v
# 期望输出: 8.9.0 或更高

# 检查 pnpm 版本
pnpm -v
# 期望输出: 7.30.0 或更高

# 检查 Git 版本
git --version
# 期望输出: git version 2.30.0 或更高
```

### 浏览器兼容性

项目支持以下现代浏览器，不支持 IE 浏览器：

| 浏览器 | 最低版本 | 说明 |
|--------|----------|------|
| Chrome | 87+ | 推荐使用，开发体验最佳 |
| Edge | 88+ | 基于 Chromium 内核 |
| Safari | 14+ | macOS/iOS 系统浏览器 |
| Firefox | 78+ | Mozilla 浏览器 |

**浏览器兼容性配置:**

```json
{
  "browserslist": [
    "Chrome >= 87",
    "Edge >= 88",
    "Safari >= 14",
    "Firefox >= 78"
  ]
}
```

### 推荐开发工具

#### IDE 推荐

**Visual Studio Code (推荐):**

推荐安装以下扩展：

| 扩展名称 | 说明 |
|----------|------|
| Vue - Official | Vue 3 官方扩展 (原 Volar) |
| TypeScript Vue Plugin | TypeScript Vue 支持 |
| ESLint | 代码检查 |
| Prettier | 代码格式化 |
| UnoCSS | UnoCSS 智能提示 |
| Auto Close Tag | 自动闭合标签 |
| Auto Rename Tag | 自动重命名标签 |
| Path Intellisense | 路径智能提示 |
| Error Lens | 错误高亮显示 |

**VSCode 推荐配置 (.vscode/settings.json):**

```json
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
  "vue.server.hybridMode": true,
  "files.associations": {
    "*.css": "css",
    "*.scss": "scss"
  }
}
```

**IntelliJ IDEA / WebStorm:**

- 安装 Vue.js 插件
- 启用 TypeScript 支持
- 配置 ESLint 和 Prettier

#### 辅助工具

| 工具 | 用途 | 安装方式 |
|------|------|----------|
| Vue DevTools | Vue 调试工具 | Chrome/Edge 扩展 |
| Postman | API 测试 | 独立应用 |
| SourceTree | Git 图形化 | 独立应用 |

---

## 环境安装

### Node.js 安装

#### 方式一：使用 NVM 管理（推荐）

NVM (Node Version Manager) 可以方便地管理多个 Node.js 版本，推荐使用此方式安装。

**Windows 系统:**

1. 下载 nvm-windows：https://github.com/coreybutler/nvm-windows/releases
2. 下载 `nvm-setup.exe` 并安装
3. 安装完成后打开新的命令行窗口

```bash
# 查看可用的 Node.js 版本
nvm list available

# 安装 Node.js 20 LTS 版本（推荐）
nvm install 20

# 或安装 Node.js 18 LTS 版本
nvm install 18

# 使用指定版本
nvm use 20

# 验证安装
node -v
npm -v
```

**macOS / Linux 系统:**

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载配置
source ~/.bashrc
# 或
source ~/.zshrc

# 安装 Node.js 20 LTS
nvm install 20

# 设置默认版本
nvm alias default 20

# 验证安装
node -v
npm -v
```

**NVM 常用命令:**

```bash
# 列出已安装的版本
nvm list

# 列出可用的远程版本
nvm list available  # Windows
nvm ls-remote       # macOS/Linux

# 切换版本
nvm use 20

# 设置默认版本
nvm alias default 20

# 卸载版本
nvm uninstall 18.17.0
```

#### 方式二：直接下载安装

1. 访问 Node.js 官网：https://nodejs.org/
2. 下载 LTS（长期支持）版本
3. 按照安装向导完成安装
4. 验证安装

```bash
# 验证 Node.js 安装
node -v
# 期望输出: v20.x.x 或 v18.x.x

# 验证 npm 安装
npm -v
# 期望输出: 10.x.x 或 8.x.x
```

### pnpm 安装

pnpm 是推荐的包管理器，相比 npm 具有更快的安装速度和更高效的磁盘空间利用。

**安装方式一：通过 npm 安装（推荐）**

```bash
# 全局安装 pnpm
npm install -g pnpm

# 验证安装
pnpm -v
# 期望输出: 9.x.x 或 8.x.x
```

**安装方式二：通过 corepack 启用**

```bash
# Node.js 16.13+ 内置 corepack
corepack enable

# 安装最新版 pnpm
corepack prepare pnpm@latest --activate

# 验证安装
pnpm -v
```

**安装方式三：独立安装脚本**

```bash
# Windows (PowerShell)
iwr https://get.pnpm.io/install.ps1 -useb | iex

# macOS / Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**pnpm 配置优化:**

```bash
# 设置国内镜像源（加速下载）
pnpm config set registry https://registry.npmmirror.com

# 查看当前配置
pnpm config list

# 设置全局 bin 目录（如果遇到命令找不到的问题）
pnpm config set global-bin-dir "C:\Users\你的用户名\AppData\Local\pnpm"

# 更新 pnpm 到最新版本
pnpm self-update
```

**为什么推荐 pnpm？**

| 特性 | pnpm | npm | yarn |
|------|------|-----|------|
| 安装速度 | ⚡️ 最快 | 较慢 | 较快 |
| 磁盘空间 | 硬链接共享 | 重复存储 | 重复存储 |
| 依赖隔离 | 严格隔离 | 扁平化 | 扁平化 |
| Monorepo | 原生支持 | 需配置 | workspaces |
| 幻影依赖 | 防止 | 存在风险 | 存在风险 |

### Git 安装

**Windows:**

1. 下载 Git for Windows：https://git-scm.com/download/win
2. 运行安装程序，建议选择以下选项：
   - 使用 VSCode 作为默认编辑器
   - 使用 Git from the command line and also from 3rd-party software
   - 使用 OpenSSL 库
   - Checkout Windows-style, commit Unix-style line endings
   - 使用 MinTTY 终端

**macOS:**

```bash
# 使用 Homebrew 安装
brew install git

# 或使用 Xcode Command Line Tools
xcode-select --install
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install git
```

**Git 基础配置:**

```bash
# 配置用户信息
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱@example.com"

# 配置默认分支名
git config --global init.defaultBranch main

# 配置行尾处理（Windows 推荐）
git config --global core.autocrlf true

# 查看配置
git config --list
```

---

## 项目获取与安装

### 获取项目代码

#### 方式一：Git 克隆（推荐）

```bash
# 克隆项目仓库
git clone https://gitee.com/your-org/ruoyi-plus-uniapp.git

# 进入前端项目目录
cd ruoyi-plus-uniapp/plus-ui

# 查看分支
git branch -a

# 切换到开发分支（如果需要）
git checkout develop
```

#### 方式二：下载压缩包

1. 访问项目仓库页面
2. 点击"下载 ZIP"按钮
3. 解压到工作目录
4. 进入 plus-ui 目录

```bash
# 解压后进入项目目录
cd ruoyi-plus-uniapp/plus-ui
```

### 安装项目依赖

```bash
# 确保在 plus-ui 目录下
pwd
# 应显示: .../ruoyi-plus-uniapp/plus-ui

# 安装依赖
pnpm install

# 安装完成后会显示类似信息:
# Packages: +XXX
# Progress: resolved XXX, reused XXX, downloaded X, added XXX, done
```

**安装过程说明:**

1. pnpm 会读取 `package.json` 中的依赖列表
2. 从 npm 仓库下载依赖包
3. 创建 `node_modules` 目录存放依赖
4. 生成 `pnpm-lock.yaml` 锁定依赖版本

**依赖安装时间参考:**

| 网络环境 | 首次安装 | 后续安装 |
|----------|----------|----------|
| 国内镜像 | 1-3 分钟 | 10-30 秒 |
| 官方源 | 3-10 分钟 | 30-60 秒 |
| 离线缓存 | - | 5-15 秒 |

### 安装问题排查

#### 问题一：网络超时或下载失败

**解决方案：配置国内镜像源**

```bash
# 配置淘宝镜像源
pnpm config set registry https://registry.npmmirror.com

# 或配置腾讯镜像源
pnpm config set registry https://mirrors.cloud.tencent.com/npm/

# 验证配置
pnpm config get registry

# 重新安装
pnpm install
```

#### 问题二：权限不足

**Windows 解决方案:**

```bash
# 以管理员身份运行命令提示符或 PowerShell
# 右键点击终端 -> 以管理员身份运行
```

**macOS / Linux 解决方案:**

```bash
# 修复 npm 全局目录权限
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global

# 添加到 PATH（bash）
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 或（zsh）
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

#### 问题三：依赖版本冲突

**解决方案：清除缓存并重新安装**

```bash
# 删除现有依赖
rm -rf node_modules
# Windows PowerShell 使用:
# Remove-Item -Recurse -Force node_modules

# 删除锁定文件
rm pnpm-lock.yaml
# Windows PowerShell 使用:
# Remove-Item pnpm-lock.yaml

# 清除 pnpm 缓存
pnpm store prune

# 重新安装
pnpm install
```

#### 问题四：Node.js 版本不兼容

**解决方案：使用 nvm 切换版本**

```bash
# 查看当前版本
node -v

# 如果版本低于 18.18.0，切换到兼容版本
nvm install 20
nvm use 20

# 重新安装依赖
rm -rf node_modules
pnpm install
```

#### 问题五：ENOENT 或文件找不到

**解决方案：检查路径和权限**

```bash
# 确认当前目录正确
ls package.json
# 应能看到 package.json 文件

# 如果文件不存在，确认在正确的目录
cd plus-ui

# 检查文件权限
ls -la
```

---

## 环境配置

### 环境配置文件结构

项目使用 Vite 的环境变量系统，配置文件位于 `env/` 目录：

```text
plus-ui/
├── env/
│   ├── .env                 # 基础配置（所有环境共享）
│   ├── .env.development     # 开发环境配置
│   └── .env.production      # 生产环境配置
└── vite.config.ts           # Vite 配置文件
```

**环境配置加载优先级:**

1. `.env` - 基础配置，始终加载
2. `.env.[mode]` - 模式配置，根据启动命令加载
3. `.env.[mode].local` - 本地配置，不提交到 Git

### 基础配置 (.env)

基础配置包含所有环境共享的变量：

```bash
# ===== 应用基础配置 =====
# 应用唯一标识（用于 localStorage 键前缀，避免多项目冲突）
VITE_APP_ID = ryplus_uni_workflow

# 页面标题（显示在浏览器标签页）
VITE_APP_TITLE = ryplus_uni_workflow后台管理

# 应用访问路径（部署在子目录时需要修改）
# 例如部署在 https://example.com/admin/ 时设置为 '/admin/'
VITE_APP_CONTEXT_PATH = '/'

# 是否启用前台首页（false 时直接访问后台）
VITE_ENABLE_FRONTEND = 'false'

# ===== 安全配置 =====
# 接口加密开关（需要与后端配置一致）
VITE_APP_API_ENCRYPT = 'true'

# RSA 公钥（用于加密发送给后端的数据）
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAK9s1Pbnn5W+...'

# RSA 私钥（用于解密后端返回的数据）
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOwIBAAJBAIrZxEhzVAHKJm7BJpXIHWGU3sHJYgR...'

# ===== 功能开关 =====
# WebSocket 开关（实时通信）
VITE_APP_WEBSOCKET = 'true'

# SSE 开关（服务端推送）
VITE_APP_SSE = 'false'

# ===== 外部服务地址 =====
# 项目仓库地址
VITE_APP_GIT_URL = ''

# 文档地址
VITE_APP_DOC_URL = 'https://ruoyi.plus'
```

**配置项说明:**

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `VITE_APP_ID` | string | 应用唯一标识，用于 localStorage 键前缀 |
| `VITE_APP_TITLE` | string | 应用标题，显示在浏览器标签页 |
| `VITE_APP_CONTEXT_PATH` | string | 应用部署路径，默认为根路径 |
| `VITE_ENABLE_FRONTEND` | boolean | 是否启用前台首页 |
| `VITE_APP_API_ENCRYPT` | boolean | 是否启用接口加密 |
| `VITE_APP_WEBSOCKET` | boolean | 是否启用 WebSocket |
| `VITE_APP_SSE` | boolean | 是否启用 SSE 推送 |

### 开发环境配置 (.env.development)

开发环境特有的配置：

```bash
# 环境标识
VITE_APP_ENV = 'development'

# 开发服务器端口
VITE_APP_PORT = '80'

# ===== API 配置 =====
# API 基础路径（用于请求前缀）
VITE_APP_BASE_API = '/dev-api'

# 后端服务端口
VITE_APP_BASE_API_PORT = '5503'

# ===== 外部服务地址 =====
# Spring Boot Admin 监控地址
VITE_APP_MONITOR_ADMIN = 'http://127.0.0.1:9090/admin/applications'

# SnailJob 任务调度控制台
VITE_APP_SNAILJOB_ADMIN = 'http://127.0.0.1:8800/snail-job'
```

**开发环境代理配置:**

Vite 会根据 `VITE_APP_BASE_API` 和 `VITE_APP_BASE_API_PORT` 自动配置代理：

```typescript
// vite.config.ts 中的代理配置
proxy: {
  '/dev-api': {
    target: 'http://127.0.0.1:5503',
    changeOrigin: true,
    ws: true,
    rewrite: (path) => path.replace(/^\/dev-api/, '')
  }
}
```

**代理工作原理:**

```text
浏览器请求: http://localhost:80/dev-api/system/user/list
    ↓ Vite 代理
后端实际请求: http://127.0.0.1:5503/system/user/list
```

### 生产环境配置 (.env.production)

生产环境特有的配置：

```bash
# 环境标识
VITE_APP_ENV = 'production'

# ===== API 配置 =====
# 生产环境 API 路径（Nginx 反向代理路径）
VITE_APP_BASE_API = '/ryplus_uni_workflow'

# ===== 外部服务地址 =====
# 监控地址（建议使用内网地址）
VITE_APP_MONITOR_ADMIN = '/admin/applications'

# SnailJob 控制台地址
VITE_APP_SNAILJOB_ADMIN = '/snail-job'

# ===== 构建配置 =====
# 构建时启用压缩（gzip / brotli）
VITE_BUILD_COMPRESS = 'gzip'
```

### 本地配置（可选）

如果需要覆盖某些配置但不想提交到 Git，可以创建 `.env.development.local` 文件：

```bash
# .env.development.local（不会被 Git 跟踪）

# 覆盖后端端口
VITE_APP_BASE_API_PORT = '8080'

# 覆盖应用端口
VITE_APP_PORT = '3000'
```

### 环境变量使用

**在代码中使用环境变量:**

```typescript
// 直接访问
const apiBase = import.meta.env.VITE_APP_BASE_API
const appTitle = import.meta.env.VITE_APP_TITLE

// 类型安全的访问
interface ImportMetaEnv {
  VITE_APP_ID: string
  VITE_APP_TITLE: string
  VITE_APP_BASE_API: string
  VITE_APP_ENV: 'development' | 'production'
  VITE_APP_API_ENCRYPT: string
  VITE_APP_WEBSOCKET: string
}

// 在 Vue 组件中使用
<script setup lang="ts">
const env = import.meta.env

console.log('当前环境:', env.VITE_APP_ENV)
console.log('API 地址:', env.VITE_APP_BASE_API)
</script>
```

**环境变量命名规则:**

- 必须以 `VITE_` 开头才能在客户端代码中访问
- 不以 `VITE_` 开头的变量仅在 Node.js 环境可用
- 变量值都是字符串类型，布尔值需要手动转换

```typescript
// 布尔值转换
const isEncrypt = import.meta.env.VITE_APP_API_ENCRYPT === 'true'
const useWebSocket = import.meta.env.VITE_APP_WEBSOCKET === 'true'
```

---

## 启动开发服务器

### 启动命令

```bash
# 确保在 plus-ui 目录下
cd plus-ui

# 启动开发服务器
pnpm dev
```

**启动成功输出:**

```text
命令, 模式 ->  serve development
环境变量 env ->  {
  VITE_APP_ID: 'ryplus_uni_workflow',
  VITE_APP_TITLE: 'ryplus_uni_workflow后台管理',
  VITE_APP_BASE_API: '/dev-api',
  VITE_APP_PORT: '80',
  ...
}

  VITE v6.3.2  ready in 2345 ms

  ➜  Local:   http://localhost:80/
  ➜  Network: http://192.168.1.100:80/
  ➜  press h + enter to show help
```

### 访问应用

启动成功后，浏览器会自动打开应用页面。如果没有自动打开，手动访问：

- **本地访问**: http://localhost:80/
- **局域网访问**: http://192.168.x.x:80/（其他设备可访问）

### 默认登录账号

| 账号类型 | 用户名 | 密码 |
|----------|--------|------|
| 超级管理员 | admin | admin123 |
| 普通管理员 | ry | admin123 |

**登录流程:**

1. 输入用户名和密码
2. 点击验证码图片获取验证码
3. 输入验证码
4. 点击登录按钮

### 开发服务器配置

**Vite 开发服务器配置详解:**

```typescript
// vite.config.ts
server: {
  // 监听所有网络接口
  host: '0.0.0.0',

  // 允许的域名列表
  allowedHosts: ['.ruoyikj.top'],

  // 端口号（从环境变量读取）
  port: Number(env.VITE_APP_PORT),

  // 端口被占用时自动递增
  strictPort: false,

  // 启动时自动打开浏览器
  open: true,

  // 代理配置
  proxy: {
    [env.VITE_APP_BASE_API]: {
      target: 'http://127.0.0.1:' + env.VITE_APP_BASE_API_PORT,
      changeOrigin: true,
      ws: true,
      rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
    }
  }
}
```

### 热更新（HMR）

Vite 提供快速的热模块替换（HMR），修改代码后无需刷新页面：

- **Vue 组件修改**: 即时更新，保持组件状态
- **样式修改**: 即时注入，无需刷新
- **TypeScript 修改**: 即时编译和更新
- **配置文件修改**: 需要重启开发服务器

**HMR 不生效时的排查:**

```bash
# 1. 确认文件保存成功
# 2. 检查终端是否有编译错误
# 3. 尝试清除浏览器缓存
# 4. 重启开发服务器
pnpm dev
```

---

## 项目脚本命令

### 完整脚本列表

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `pnpm dev` | 启动开发服务器 | 日常开发调试 |
| `pnpm build:prod` | 生产环境构建 | 部署到生产环境 |
| `pnpm build:dev` | 开发环境构建 | 调试构建产物 |
| `pnpm preview` | 预览构建结果 | 本地验证构建 |
| `pnpm lint:eslint` | ESLint 检查 | 代码质量检查 |
| `pnpm lint:eslint:fix` | ESLint 自动修复 | 自动修复代码问题 |
| `pnpm prettier` | Prettier 格式化 | 统一代码格式 |

### 开发命令

```bash
# 启动开发服务器
pnpm dev

# 开发服务器默认配置:
# - 端口: 80（可在 .env.development 中修改）
# - 自动打开浏览器
# - 支持热更新
# - 代理后端接口
```

### 构建命令

```bash
# 生产环境构建
pnpm build:prod

# 构建完成后，产物在 dist/ 目录
# 构建产物结构:
# dist/
# ├── index.html          # 入口 HTML
# ├── assets/             # 静态资源
# │   ├── js/            # JavaScript 文件
# │   ├── css/           # CSS 文件
# │   └── images/        # 图片资源
# └── favicon.ico        # 网站图标

# 开发环境构建（保留 source map）
pnpm build:dev
```

**构建优化选项:**

```bash
# 生产环境构建会自动:
# 1. 代码压缩和混淆
# 2. 树摇优化（Tree Shaking）
# 3. 代码分割（Code Splitting）
# 4. 资源压缩（gzip/brotli）
# 5. 去除开发代码和注释
```

### 预览命令

```bash
# 预览构建结果
pnpm preview

# 预览服务器会在本地启动:
# ➜  Local:   http://localhost:4173/
# ➜  Network: http://192.168.x.x:4173/
```

### 代码检查命令

```bash
# 运行 ESLint 检查
pnpm lint:eslint

# 检查并自动修复
pnpm lint:eslint:fix

# 运行 Prettier 格式化
pnpm prettier
```

**ESLint 检查内容:**

- TypeScript 类型检查
- Vue 组件规范检查
- 代码风格检查
- 未使用变量检查
- 导入顺序检查

---

## 构建与部署

### 生产环境构建

```bash
# 执行生产构建
pnpm build:prod

# 构建过程会显示:
# vite v6.3.2 building for production...
# ✓ XXX modules transformed.
# dist/index.html                   0.XX kB │ gzip:  0.XX kB
# dist/assets/index-XXXXX.css      XX.XX kB │ gzip:  X.XX kB
# dist/assets/index-XXXXX.js      XXX.XX kB │ gzip: XX.XX kB
# ✓ built in X.XXs
```

### 构建产物分析

```bash
# 查看构建产物
ls -la dist/

# 目录结构:
# dist/
# ├── index.html           # 入口文件
# ├── favicon.ico          # 网站图标
# └── assets/
#     ├── index-xxx.css    # 主样式文件
#     ├── index-xxx.js     # 主脚本文件
#     ├── vendor-xxx.js    # 第三方库
#     └── ...              # 其他资源
```

### Nginx 部署配置

**基础 Nginx 配置:**

```nginx
server {
    listen       80;
    server_name  your-domain.com;

    # 前端静态资源
    location / {
        root   /usr/share/nginx/html;
        index  index.html;
        # 支持 History 路由模式
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /ryplus_uni_workflow {
        proxy_pass http://127.0.0.1:5503/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root   /usr/share/nginx/html;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/json
               application/xml application/rss+xml;
}
```

**HTTPS 配置:**

```nginx
server {
    listen       443 ssl http2;
    server_name  your-domain.com;

    # SSL 证书
    ssl_certificate      /etc/nginx/ssl/your-domain.crt;
    ssl_certificate_key  /etc/nginx/ssl/your-domain.key;

    # SSL 优化
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # 现代 SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # 其他配置同 HTTP...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Docker 部署

**Dockerfile:**

```dockerfile
# 构建阶段
FROM node:20-alpine as builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建
RUN pnpm build:prod

# 运行阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./plus-ui
      dockerfile: Dockerfile
    ports:
      - "80:80"
    restart: unless-stopped
    networks:
      - app-network

  backend:
    image: ruoyi-plus:latest
    ports:
      - "5503:5503"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Docker 部署命令:**

```bash
# 构建镜像
docker build -t ruoyi-plus-ui:latest ./plus-ui

# 运行容器
docker run -d -p 80:80 --name ruoyi-ui ruoyi-plus-ui:latest

# 使用 docker-compose
docker-compose up -d
```

---

## 后端服务配置

### 后端服务要求

前端应用需要后端服务支持，确保后端服务已正确配置并启动。

**后端服务默认端口:**

| 服务 | 端口 | 说明 |
|------|------|------|
| 主应用 | 5503 | 核心业务 API |
| Monitor Admin | 9090 | 应用监控 |
| SnailJob | 8800 | 任务调度 |

### 连接后端服务

**开发环境连接本地后端:**

```bash
# 1. 确保后端服务已启动
# 2. 修改 .env.development 中的后端端口
VITE_APP_BASE_API_PORT = '5503'

# 3. 启动前端开发服务器
pnpm dev
```

**连接远程后端服务:**

```bash
# 修改 vite.config.ts 中的代理目标
proxy: {
  '/dev-api': {
    target: 'http://remote-server:5503',  // 远程服务器地址
    changeOrigin: true,
    ws: true,
    rewrite: (path) => path.replace(/^\/dev-api/, '')
  }
}
```

### 跨域配置

如果遇到跨域问题，确保：

1. **开发环境**: Vite 代理已正确配置
2. **生产环境**: Nginx 反向代理已配置
3. **后端配置**: CORS 已正确设置

**后端 CORS 配置示例 (Spring Boot):**

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOriginPatterns("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

---

## 常见问题

### 1. 端口被占用

**问题描述:**

```text
Error: listen EADDRINUSE: address already in use :::80
```

**解决方案:**

```bash
# Windows - 查找占用端口的进程
netstat -ano | findstr :80
# 结束进程
taskkill /PID <进程ID> /F

# macOS / Linux - 查找占用端口的进程
lsof -i :80
# 结束进程
kill -9 <进程ID>

# 或者修改 .env.development 使用其他端口
VITE_APP_PORT = '3000'
```

### 2. 依赖安装失败

**问题描述:**

```text
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/xxx: Not Found - 404
```

**解决方案:**

```bash
# 切换到国内镜像源
pnpm config set registry https://registry.npmmirror.com

# 清除缓存
pnpm store prune

# 删除现有依赖
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### 3. TypeScript 类型错误

**问题描述:**

```text
TS2307: Cannot find module '@/xxx' or its corresponding type declarations.
```

**解决方案:**

```bash
# 1. 确保 tsconfig.json 中配置了路径别名
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

# 2. 重启 VSCode 或 IDE
# 3. 删除 node_modules/.vite 缓存
rm -rf node_modules/.vite

# 4. 重启开发服务器
pnpm dev
```

### 4. 页面空白或报错

**问题描述:**

页面加载后显示空白或控制台报错。

**解决方案:**

```bash
# 1. 检查浏览器控制台错误信息

# 2. 确保后端服务已启动
curl http://127.0.0.1:5503/health

# 3. 清除浏览器缓存
# Chrome: Ctrl+Shift+Delete

# 4. 清除 Vite 缓存
rm -rf node_modules/.vite

# 5. 重启开发服务器
pnpm dev
```

### 5. 接口请求失败

**问题描述:**

```text
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**解决方案:**

```bash
# 1. 检查后端服务是否启动
curl http://127.0.0.1:5503

# 2. 检查端口配置是否正确
cat env/.env.development | grep PORT

# 3. 检查代理配置
# 查看 vite.config.ts 中的 proxy 配置

# 4. 检查防火墙设置
# Windows: 控制面板 -> Windows Defender 防火墙
# macOS: 系统偏好设置 -> 安全性与隐私 -> 防火墙
```

### 6. 热更新不生效

**问题描述:**

修改代码后页面不自动更新。

**解决方案:**

```bash
# 1. 检查文件是否正确保存

# 2. 检查终端是否有编译错误

# 3. 清除 Vite 缓存
rm -rf node_modules/.vite

# 4. 重启开发服务器
pnpm dev

# 5. 如果是 Windows，检查文件监听限制
# 可能需要增加系统的文件监听数量
```

### 7. 构建失败

**问题描述:**

```text
Error: Build failed with X errors
```

**解决方案:**

```bash
# 1. 运行类型检查
pnpm lint:eslint

# 2. 查看具体错误信息并修复

# 3. 清除构建缓存
rm -rf dist node_modules/.vite

# 4. 重新安装依赖
rm -rf node_modules
pnpm install

# 5. 重新构建
pnpm build:prod
```

### 8. 内存不足

**问题描述:**

```text
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

**解决方案:**

```bash
# 增加 Node.js 内存限制
# Windows
set NODE_OPTIONS=--max_old_space_size=8192
pnpm build:prod

# macOS / Linux
export NODE_OPTIONS=--max_old_space_size=8192
pnpm build:prod

# 或在 package.json 中配置
{
  "scripts": {
    "build:prod": "cross-env NODE_OPTIONS=--max_old_space_size=8192 vite build --mode production"
  }
}
```

### 9. ESLint 报错过多

**问题描述:**

ESLint 检查报告大量错误。

**解决方案:**

```bash
# 1. 自动修复可修复的问题
pnpm lint:eslint:fix

# 2. 运行 Prettier 格式化
pnpm prettier

# 3. 手动修复剩余问题
# 查看 .eslintrc.cjs 了解规则配置

# 4. 临时禁用某条规则（不推荐）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = {}
```

### 10. 样式不生效

**问题描述:**

UnoCSS 原子类或自定义样式不生效。

**解决方案:**

```bash
# 1. 检查 UnoCSS 配置
cat uno.config.ts

# 2. 确保使用正确的类名语法
# 正确: class="text-red-500 p-4"
# 错误: class="text-red p4"

# 3. 清除 Vite 缓存
rm -rf node_modules/.vite

# 4. 重启开发服务器
pnpm dev

# 5. 如果使用 SCSS，确保导入顺序正确
```

---

## 开发调试技巧

### Vue DevTools 使用

1. 安装 Vue DevTools 浏览器扩展
2. 打开开发者工具 (F12)
3. 选择 Vue 标签页
4. 可以查看组件树、状态、事件等

### 网络请求调试

```typescript
// 在请求拦截器中添加日志
axios.interceptors.request.use((config) => {
  console.log('请求:', config.method?.toUpperCase(), config.url)
  console.log('参数:', config.params || config.data)
  return config
})

// 在响应拦截器中添加日志
axios.interceptors.response.use((response) => {
  console.log('响应:', response.config.url, response.data)
  return response
})
```

### 状态调试

```typescript
// 在 Pinia Store 中使用 $subscribe 监听状态变化
const userStore = useUserStore()
userStore.$subscribe((mutation, state) => {
  console.log('状态变化:', mutation.type, state)
})
```

### 性能分析

```bash
# 使用 Chrome DevTools Performance 面板
# 1. 打开开发者工具
# 2. 切换到 Performance 标签
# 3. 点击录制按钮
# 4. 执行需要分析的操作
# 5. 停止录制并分析结果
```

---

## 最佳实践

### 1. 开发流程建议

1. **启动后端服务** - 确保 API 可用
2. **启动前端开发服务器** - `pnpm dev`
3. **打开 Vue DevTools** - 便于调试
4. **使用 ESLint 自动修复** - 保持代码规范
5. **提交前进行类型检查** - 避免类型错误

### 2. 代码组织建议

```text
src/
├── api/          # API 请求封装
├── assets/       # 静态资源
├── components/   # 公共组件
├── composables/  # 组合式函数
├── layouts/      # 布局组件
├── router/       # 路由配置
├── stores/       # 状态管理
├── styles/       # 全局样式
├── types/        # 类型定义
├── utils/        # 工具函数
└── views/        # 页面视图
```

### 3. 提交代码建议

```bash
# 提交前检查
pnpm lint:eslint:fix
pnpm prettier

# 使用规范的提交信息
git commit -m "feat(user): 添加用户管理功能"
git commit -m "fix(login): 修复登录验证码刷新问题"
git commit -m "docs(readme): 更新项目文档"
```

### 4. 性能优化建议

- 使用路由懒加载
- 合理使用 `v-if` 和 `v-show`
- 避免不必要的响应式数据
- 使用 `shallowRef` 处理大型对象
- 合理配置 Vite 的预构建依赖

---

## 总结

本指南涵盖了 RuoYi-Plus-UniApp 前端项目的完整启动流程：

1. **环境准备** - Node.js 18+、pnpm、Git
2. **项目安装** - 克隆代码、安装依赖
3. **环境配置** - 开发/生产环境变量配置
4. **启动开发** - `pnpm dev` 启动开发服务器
5. **构建部署** - `pnpm build:prod` 构建生产版本
6. **问题排查** - 常见问题及解决方案

**快速启动命令汇总:**

```bash
# 1. 克隆项目
git clone https://gitee.com/your-org/ruoyi-plus-uniapp.git
cd ruoyi-plus-uniapp/plus-ui

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 访问应用
# http://localhost:80
# 账号: admin / admin123
```

祝你开发愉快！
