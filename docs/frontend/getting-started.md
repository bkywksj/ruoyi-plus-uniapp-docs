# 前端快速启动

本章节将指导你快速启动 Ruoyi-Plus-Uniapp 前端项目，包含环境准备、项目安装和运行等完整流程。

## 🎯 环境要求

### 必需环境
- **Node.js**: >= 18.18.0
- **包管理器**: pnpm >= 8.9.0 (推荐) 或 npm >= 8.9.0
- **浏览器**: Chrome >= 87 / Edge >= 88 / Safari >= 14 / Firefox >= 78

### 推荐工具
- **IDE**: IDEA / VSCode + Volar 插件
- **版本管理**: Git
- **Node管理**: nvm (推荐用于多版本管理)

## 🛠️ 环境安装

### 1. Node.js 安装

#### 方式一：使用 NVM 管理 (推荐)
```bash
# Windows 用户可下载 nvm-windows
# https://github.com/coreybutler/nvm-windows

# 安装18 版本
nvm install 18
nvm use 18

# 验证版本
node -v  # 应显示 >= v18.18.0
npm -v   # 应显示 >= 8.9.0
```

### 2. pnpm 安装

```bash
# 全局安装 pnpm
npm install -g pnpm

# 验证安装
pnpm -v  # 应显示 >= 8.9.0

# 如果遇到全局bin目录问题，设置正确路径
pnpm config set global-bin-dir "你的nodejs路径"

# 更新 pnpm
pnpm self-update
```

::: tip 💡 为什么推荐 pnpm？
- **节省磁盘空间**: 通过硬链接共享依赖
- **安装速度快**: 并行安装，显著提升效率  
- **更严格的依赖管理**: 避免幻影依赖问题
- **支持 monorepo**: 更好的多包项目管理
:::

## 🚀 项目启动

### 1. 获取项目代码

```bash
# 方式一：使用 Git 克隆（如果有权限）
git clone https://gitee.com/your-repo/ruoyi-plus-uniapp.git
cd ruoyi-plus-uniapp/plus-ui

# 方式二：下载压缩包解压后进入前端目录
cd plus-ui
```

### 2. 安装依赖

```bash
# 安装项目依赖
pnpm install

# 如果安装失败，可以尝试清除缓存后重新安装
pnpm store prune
pnpm install
```

::: warning 🚨 安装问题解决
如果遇到依赖安装失败：
1. **网络问题**: 配置国内镜像源
2. **权限问题**: 使用管理员权限运行终端
3. **版本冲突**: 删除 `node_modules` 和 `pnpm-lock.yaml` 后重新安装
:::

### 3. 配置后端接口地址

编辑 `env/.env.development` 文件，配置后端基础路径和端口号

### 4. 启动开发服务器

```bash
# 启动开发服务器
pnpm dev

# 启动成功后会显示类似信息：
# ➜  Local:   http://localhost:80/
# ➜  Network: http://192.168.1.100:80/
```

成功启动后，浏览器访问: http://localhost:80

## 🔧 可用脚本命令

| 命令 | 说明 | 用途 |
|------|------|------|
| `pnpm dev` | 启动开发服务器 | 开发调试，支持热更新 |
| `pnpm build:prod` | 生产环境构建 | 构建用于生产部署的代码 |
| `pnpm build:dev` | 开发环境构建 | 构建用于开发环境的代码 |
| `pnpm preview` | 预览构建结果 | 本地预览生产构建 |
| `pnpm lint:eslint` | ESLint 检查 | 代码质量检查 |
| `pnpm lint:eslint:fix` | 自动修复 ESLint | 自动修复可修复的问题 |
| `pnpm prettier` | 格式化代码 | 统一代码格式 |

## 📋 登录系统

### 默认管理员账号

启动成功后，使用以下账号登录系统：

- **用户名**: `admin`
- **密码**: `admin123`
- **验证码**: 点击验证码图片可刷新

开始你的前端开发之旅吧！🚀
