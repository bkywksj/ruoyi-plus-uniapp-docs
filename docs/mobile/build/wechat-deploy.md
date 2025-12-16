# 微信小程序发布

## 介绍

微信小程序是腾讯推出的轻量级应用形态,无需下载安装即可使用,具有接近原生应用的体验。RuoYi-Plus-UniApp 通过 UniApp 框架实现一套代码编译为微信小程序,提供完整的开发、调试、发布流程支持。本文档详细介绍从开发环境准备到正式发布上线的完整部署流程。

**核心特性:**

- **完整工具链** - 微信开发者工具集成,支持预览、调试、上传
- **多环境支持** - 开发版、体验版、正式版三个版本管理
- **快速构建** - Vite 构建工具,编译速度快,支持增量更新
- **代码优化** - 自动分包、Tree-shaking、代码压缩等优化策略
- **安全保障** - API 加密传输、权限配置、域名白名单管理
- **审核友好** - 符合微信审核规范,提供完整的隐私政策和用户协议
- **自动化发布** - 支持 CI/CD 自动化发布流程
- **版本管理** - 完善的版本号管理和更新机制

## 前置准备

### 注册小程序账号

#### 1. 注册流程

1. 访问微信公众平台: https://mp.weixin.qq.com/
2. 点击"立即注册" → 选择"小程序"
3. 填写账号信息:
   - 邮箱(未注册过微信公众平台)
   - 密码(字母+数字,8-20位)
   - 验证码
4. 邮箱激活:
   - 登录邮箱点击激活链接
   - 完成邮箱验证
5. 选择主体类型:
   - **个人** - 个人开发者,功能受限
   - **企业** - 企业/个体工商户,功能完整
   - **政府** - 政府机关
   - **媒体** - 媒体机构
   - **其他组织** - 非企业机构
6. 主体信息登记:
   - 企业:营业执照、对公账户、管理员信息
   - 个人:身份证信息、手机号验证
7. 管理员身份验证:
   - 微信扫码验证
   - 手机号验证

**注意事项:**

- 一个邮箱只能注册一个小程序
- 个人主体小程序无法开通支付功能
- 企业主体需要对公账户打款验证或微信认证(300元/年)
- 已认证的企业可直接复用资质

#### 2. 获取小程序信息

注册完成后,在小程序管理后台获取关键信息:

**开发设置 → 开发者ID:**

```
AppID(小程序ID): wx1234567890abcdef
AppSecret(小程序密钥): a1b2c3d4e5f6789012345678901234567
```

**⚠️ 重要:**
- AppID 用于小程序身份标识,需要配置到项目中
- AppSecret 用于服务端 API 调用,务必保密,不要提交到代码仓库
- 定期更换 AppSecret 提升安全性

### 安装微信开发者工具

#### 1. 下载安装

官方下载地址: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

**支持平台:**
- Windows (64位)
- macOS (Intel/Apple Silicon)
- Linux (Ubuntu/Debian)

**版本要求:**
- 稳定版(Stable) - 推荐生产使用
- 预发布版(RC) - 抢先体验新特性
- 最低版本要求: v1.06.0+

#### 2. 安装步骤

**Windows:**

```bash
# 下载安装包
微信开发者工具_x64.exe

# 双击安装
# 选择安装路径(建议默认)
# 完成安装
```

**macOS:**

```bash
# 下载 dmg 文件
wechat_devtools_mac.dmg

# 双击打开
# 拖拽到应用程序文件夹
# 首次打开允许系统权限
```

**Linux:**

```bash
# 下载 deb 包
wechat_devtools_linux_x64.deb

# 安装
sudo dpkg -i wechat_devtools_linux_x64.deb

# 修复依赖
sudo apt-get install -f
```

#### 3. 登录开发者工具

1. 启动微信开发者工具
2. 使用小程序管理员/开发者微信扫码登录
3. 选择"小程序项目"

**角色权限:**

| 角色 | 开发权限 | 上传代码 | 发布体验版 | 提交审核 | 发布正式版 |
|------|---------|---------|----------|---------|----------|
| 管理员 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 开发者 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 体验者 | ❌ | ❌ | ❌ | ❌ | ❌ |

**添加项目成员:**

1. 小程序管理后台 → 管理 → 成员管理
2. 项目成员 → 添加成员
3. 输入微信号 → 选择角色(管理员/开发者/体验者)
4. 成员微信确认邀请

### 开发环境准备

#### 1. 安装 Node.js 和 pnpm

```bash
# 检查 Node.js 版本(需要 ≥18.0.0)
node -v
# v18.20.0

# 安装 pnpm(需要 ≥7.30)
npm install -g pnpm

# 验证 pnpm 版本
pnpm -v
# 9.15.0
```

#### 2. 克隆项目代码

```bash
# 克隆仓库
git clone https://gitee.com/bkywksj/ruoyi-plus-uniapp-workflow.git
cd ruoyi-plus-uniapp-workflow/plus-app

# 安装依赖
pnpm install
```

#### 3. 配置小程序 AppID

编辑 `manifest.json` 文件,配置小程序 AppID:

```json
{
  "name": "ryplus_uni_workflow",
  "appid": "__UNI__F708A27",
  "versionName": "5.5.0",
  "versionCode": "100",
  "mp-weixin": {
    "appid": "wx1234567890abcdef",  // 修改为你的小程序 AppID
    "setting": {
      "urlCheck": false,  // 开发环境关闭域名校验
      "es6": true,
      "postcss": true,
      "minified": true
    },
    "usingComponents": true,
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于小程序位置服务"
      }
    }
  }
}
```

**配置说明:**

- `appid` - 小程序 AppID,必填
- `urlCheck` - URL 域名校验,开发环境可关闭,正式版必须开启
- `es6` - 是否将 ES6 代码转为 ES5
- `postcss` - 是否使用 PostCSS 处理样式
- `minified` - 是否压缩代码
- `permission` - 小程序权限描述

#### 4. 配置环境变量

编辑环境变量文件,配置开发和生产环境:

**开发环境** `env/.env.development`:

```bash
# 环境标识
VITE_APP_ENV='development'

# API 基础路径(本地开发)
VITE_APP_BASE_API='http://127.0.0.1:5500'

# 微信小程序专用配置
VITE_APP_PLATFORM='mp-weixin'

# 保留 console 和 debugger
VITE_DELETE_CONSOLE=false

# 开启 SourceMap
VITE_SHOW_SOURCEMAP=true
```

**生产环境** `env/.env.production`:

```bash
# 环境标识
VITE_APP_ENV='production'

# API 基础路径(生产服务器)
VITE_APP_BASE_API='https://api.example.com'

# 微信小程序专用配置
VITE_APP_PLATFORM='mp-weixin'

# 移除 console 和 debugger
VITE_DELETE_CONSOLE=true

# 关闭 SourceMap
VITE_SHOW_SOURCEMAP=false
```

**公共配置** `env/.env`:

```bash
# 应用ID
VITE_APP_ID='ryplus_uni_workflow'

# 应用标题
VITE_APP_TITLE='RuoYi-Plus'

# 接口加密功能开关
VITE_APP_API_ENCRYPT='true'

# RSA 公钥(用于加密请求)
VITE_APP_RSA_PUBLIC_KEY='MFwwDQYJKoZIhvcNAQEBBQAD...'

# RSA 私钥(用于解密响应)
VITE_APP_RSA_PRIVATE_KEY='MIIBOwIBAAJBAIrZxEhzVAHK...'

# WebSocket 开关
VITE_APP_WEBSOCKET='false'
```

## 本地开发

### 启动开发服务器

#### 1. 命令行启动

```bash
# 进入项目目录
cd ruoyi-plus-uniapp-workflow/plus-app

# 启动微信小程序开发模式
pnpm dev:mp-weixin
```

**输出信息:**

```
> ryplus-uni@2.11.0 dev:mp-weixin
> uni -p mp-weixin

vite v6.3.5 building for development...

watching for file changes...

✓ built in 3.2s
DONE  Build complete. Watching for changes...

小程序开发目录: dist/dev/mp-weixin
请在微信开发者工具中打开该目录
```

#### 2. 微信开发者工具导入项目

**方式一:手动导入**

1. 打开微信开发者工具
2. 点击"+"或"导入项目"
3. 项目配置:
   - 项目目录: 选择 `dist/dev/mp-weixin` 目录
   - AppID: 选择你的小程序 AppID
   - 项目名称: 自定义(如: RuoYi-Plus)
   - 开发模式: 小程序
4. 点击"导入"

**方式二:命令行打开**

```bash
# Windows
cli open --project dist/dev/mp-weixin

# macOS
/Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project dist/dev/mp-weixin

# Linux
/opt/wechatwebdevtools/cli open --project dist/dev/mp-weixin
```

#### 3. 开发者工具配置

**项目设置:**

1. 详情 → 本地设置:
   - ✅ 不校验合法域名、web-view、TLS版本
   - ✅ 启用调试(显示 vConsole)
   - ✅ 不校验请求域名合法性
   - ✅ 开启热重载
2. 详情 → 项目设置:
   - 基础库版本: 选择最新稳定版(如 3.5.8)
   - 调试基础库: 保持默认
   - 上传代码时自动压缩: ✅

**调试工具:**

- **模拟器** - 实时预览,快速调试
- **真机调试** - 扫码在真机上调试
- **调试器** - 类似 Chrome DevTools
- **网络面板** - 查看 API 请求
- **Storage** - 查看本地存储
- **AppData** - 查看页面数据

### 实时调试

#### 1. 模拟器调试

**优点:**
- 启动快速
- 支持多种机型切换
- 支持场景值模拟

**常用操作:**

```typescript
// 查看 console 输出
console.log('调试信息', data)

// 查看页面栈
const pages = getCurrentPages()
console.log('当前页面', pages[pages.length - 1])

// 查看 Storage
console.log('用户Token', uni.getStorageSync('token'))

// 网络请求
uni.request({
  url: 'https://api.example.com/user',
  success: (res) => {
    console.log('API响应', res.data)
  }
})
```

**切换机型:**

1. 模拟器顶部 → 设备型号
2. 选择常见机型:
   - iPhone 14 Pro Max (414×896)
   - iPhone SE (375×667)
   - iPad (768×1024)

#### 2. 真机调试

**操作步骤:**

1. 工具栏 → 预览 → 真机调试
2. 选择调试类型:
   - **普通编译** - 正常运行
   - **清缓存编译** - 清除缓存后运行
3. 手机微信扫码
4. 允许调试授权
5. 开始调试

**真机调试特点:**

- 真实网络环境
- 真实性能表现
- 测试蓝牙、NFC等硬件功能
- vConsole 实时查看日志

**调试技巧:**

```typescript
// 开启 vConsole
// manifest.json → mp-weixin → setting
{
  "setting": {
    "debug": true  // 开启调试模式
  }
}

// 条件编译:仅小程序输出日志
// #ifdef MP-WEIXIN
console.log('微信小程序专用日志')
// #endif

// 性能监控
const start = Date.now()
// 执行操作
console.log('耗时', Date.now() - start, 'ms')
```

#### 3. 预览二维码

**快速预览:**

1. 工具栏 → 预览
2. 生成预览二维码
3. 微信扫码直接体验
4. 无需上传代码

**使用场景:**

- 快速验证功能
- 分享给团队成员测试
- 不占用体验版配额
- 二维码有效期 24 小时

### 热更新开发

Vite 构建工具支持热模块替换(HMR),修改代码后自动编译刷新。

**自动监听:**

```bash
# 启动开发模式后,Vite 自动监听文件变化
pnpm dev:mp-weixin

# 修改文件后自动触发:
# 1. Vite 增量编译
# 2. 生成新的代码文件
# 3. 微信开发者工具自动刷新
```

**刷新模式:**

| 修改类型 | 刷新方式 | 保留状态 |
|---------|---------|---------|
| JS/TS 逻辑 | 热更新 | ✅ 保留 |
| Vue 模板 | 热更新 | ✅ 保留 |
| CSS 样式 | 热更新 | ✅ 保留 |
| 配置文件 | 完全刷新 | ❌ 重置 |
| 静态资源 | 完全刷新 | ❌ 重置 |

**禁用自动编译:**

如果自动编译影响性能,可临时禁用:

```bash
# 修改 vite.config.ts
{
  server: {
    watch: {
      ignored: ['**/dist/**']  // 忽略 dist 目录
    }
  }
}
```

## 生产构建

### 构建命令

#### 1. 标准构建

```bash
# 生产环境构建
pnpm build:mp-weixin
```

**构建流程:**

```
1. 加载生产环境变量(.env.production)
   ↓
2. TypeScript 类型检查
   ↓
3. Vite 编译打包
   ↓
4. 条件编译处理(仅保留 MP-WEIXIN 代码)
   ↓
5. Tree-shaking 移除未使用代码
   ↓
6. 代码压缩混淆(esbuild)
   ↓
7. 移除 console 和 debugger
   ↓
8. 生成构建产物(dist/build/mp-weixin)
```

**输出信息:**

```
> ryplus-uni@2.11.0 build:mp-weixin
> uni build -p mp-weixin

vite v6.3.5 building for production...

✓ 856 modules transformed.
dist/build/mp-weixin/app.js               45.6 kB │ gzip: 12.3 kB
dist/build/mp-weixin/pages/index/index.js 23.4 kB │ gzip: 6.8 kB
...

✓ built in 8.5s

DONE  Build complete. Output directory: dist/build/mp-weixin
Total size: 1.2 MB (gzip: 456 KB)
```

#### 2. 构建产物结构

```
dist/build/mp-weixin/
├── app.js                    # 小程序主逻辑
├── app.json                  # 小程序配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── sitemap.json             # 搜索索引配置
├── pages/                   # 页面目录
│   ├── index/
│   │   ├── index.js         # 页面逻辑
│   │   ├── index.json       # 页面配置
│   │   ├── index.wxml       # 页面结构
│   │   └── index.wxss       # 页面样式
│   ├── login/
│   │   └── ...
│   └── ...
├── components/              # 组件目录
│   ├── wd-button/
│   │   ├── wd-button.js
│   │   ├── wd-button.json
│   │   ├── wd-button.wxml
│   │   └── wd-button.wxss
│   └── ...
├── static/                  # 静态资源
│   ├── images/
│   ├── fonts/
│   └── ...
└── common/                  # 公共资源
    ├── vendor.js            # 第三方库
    └── runtime.js           # 运行时代码
```

#### 3. 构建优化

**代码分割:**

主包和分包自动分离,优化加载性能:

```json
// app.json
{
  "pages": [
    "pages/index/index",
    "pages/login/index"
  ],
  "subPackages": [
    {
      "root": "pages-sub/user",
      "pages": [
        "profile/index",
        "settings/index"
      ]
    },
    {
      "root": "pages-sub/order",
      "pages": [
        "list/index",
        "detail/index"
      ]
    }
  ]
}
```

**分包优势:**

- 主包体积更小,首屏加载快
- 按需加载分包,节省流量
- 突破主包 2MB 限制
- 分包可达 20MB

**依赖优化:**

```typescript
// vite.config.ts
{
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 第三方库单独打包
          'vendor': ['vue', 'pinia'],
          'crypto': ['crypto-js', 'jsencrypt'],
        }
      }
    }
  }
}
```

### 代码质量检查

#### 1. TypeScript 类型检查

```bash
# 运行类型检查
pnpm type-check

# 输出示例
✓ Type check complete. No errors found.
```

**修复类型错误:**

```typescript
// ❌ 错误示例
const user = {}
user.name = 'John'  // Property 'name' does not exist on type '{}'

// ✅ 正确写法
interface User {
  name: string
  age?: number
}

const user: User = {
  name: 'John'
}
```

#### 2. ESLint 代码检查

```bash
# 运行代码检查
pnpm lint

# 自动修复
pnpm lint:fix
```

**常见问题修复:**

```typescript
// ❌ 错误:未使用的变量
const unused = 'value'

// ✅ 修复:移除或使用
// (移除该行)

// ❌ 错误:缺少分号
const value = 'test'

// ✅ 修复:添加分号
const value = 'test';
```

#### 3. 构建前检查清单

- [ ] TypeScript 类型检查通过
- [ ] ESLint 代码检查通过
- [ ] 所有功能测试通过
- [ ] API 接口地址正确(生产环境)
- [ ] AppID 配置正确
- [ ] 环境变量配置正确
- [ ] console 已移除(生产环境)
- [ ] SourceMap 已关闭(生产环境)

## 上传代码

### 使用开发者工具上传

#### 1. 导入构建产物

```bash
# 确保已完成生产构建
pnpm build:mp-weixin

# 打开微信开发者工具
# 导入项目:dist/build/mp-weixin
```

#### 2. 上传代码

**操作步骤:**

1. 工具栏 → 上传
2. 填写版本信息:
   - **版本号**: 遵循语义化版本(如 1.0.0)
   - **项目备注**: 本次更新内容(如"修复登录问题")
3. 点击"上传"
4. 等待上传完成(显示上传成功提示)

**版本号规范:**

```
主版本号.次版本号.修订号

示例:
1.0.0 - 初始版本
1.1.0 - 新增功能
1.1.1 - 修复 Bug
2.0.0 - 重大更新(不兼容旧版本)
```

**上传限制:**

- 主包大小: ≤ 2MB
- 分包大小: 单个 ≤ 2MB
- 小程序总大小: ≤ 20MB
- 上传频率: 建议每天 ≤ 10 次

#### 3. 查看上传记录

**小程序管理后台:**

1. 登录 https://mp.weixin.qq.com/
2. 版本管理 → 开发版本
3. 查看已上传的版本列表

**版本信息:**

- 版本号
- 上传时间
- 上传者
- 项目备注
- 体验版二维码
- 操作(提交审核/设为体验版/删除)

### 使用命令行上传

#### 1. 安装 miniprogram-ci

```bash
# 全局安装
npm install -g miniprogram-ci

# 或项目依赖
pnpm add -D miniprogram-ci
```

#### 2. 获取上传密钥

**操作步骤:**

1. 小程序管理后台 → 开发 → 开发管理
2. 开发设置 → 小程序代码上传密钥
3. 生成密钥 → 下载密钥文件 `private.key`
4. 将密钥文件保存到项目根目录(不要提交到 Git)

**.gitignore 配置:**

```
# 上传密钥(务必忽略)
private.key
*.key
```

#### 3. 创建上传脚本

创建 `scripts/upload-weixin.js`:

```javascript
const ci = require('miniprogram-ci')
const path = require('path')
const package = require('../package.json')

;(async () => {
  const project = new ci.Project({
    appid: 'wx1234567890abcdef',  // 小程序 AppID
    type: 'miniProgram',
    projectPath: path.resolve(__dirname, '../dist/build/mp-weixin'),
    privateKeyPath: path.resolve(__dirname, '../private.key'),
    ignores: ['node_modules/**/*'],
  })

  try {
    console.log('开始上传小程序代码...')

    const uploadResult = await ci.upload({
      project,
      version: package.version,  // 从 package.json 读取版本号
      desc: `版本${package.version} - ${package['update-time']}`,  // 更新说明
      setting: {
        es6: true,
        es7: true,
        minify: true,
        minifyJS: true,
        minifyWXML: true,
        minifyWXSS: true,
        autoPrefixWXSS: true,
      },
      onProgressUpdate: (info) => {
        console.log(`上传进度: ${info._msg} ${info._status}`)
      },
    })

    console.log('上传成功!')
    console.log('版本号:', uploadResult.version)
    console.log('更新时间:', uploadResult.updateTime)
  } catch (error) {
    console.error('上传失败:', error)
    process.exit(1)
  }
})()
```

**配置说明:**

- `appid` - 小程序 AppID
- `projectPath` - 构建产物路径
- `privateKeyPath` - 上传密钥路径
- `version` - 版本号
- `desc` - 版本描述
- `setting` - 编译设置

#### 4. 添加上传命令

编辑 `package.json`:

```json
{
  "scripts": {
    "build:mp-weixin": "uni build -p mp-weixin",
    "upload:weixin": "node scripts/upload-weixin.js",
    "deploy:weixin": "pnpm build:mp-weixin && pnpm upload:weixin"
  }
}
```

#### 5. 执行上传

```bash
# 构建并上传
pnpm deploy:weixin
```

**输出示例:**

```
> ryplus-uni@2.11.0 deploy:weixin
> pnpm build:mp-weixin && pnpm upload:weixin

✓ Build complete. Output directory: dist/build/mp-weixin

开始上传小程序代码...
上传进度: 正在压缩文件 doing
上传进度: 正在上传 doing
上传进度: 上传成功 done
上传成功!
版本号: 2.11.0
更新时间: 2025-11-21 10:30:00
```

### CI/CD 自动化上传

#### 1. GitHub Actions

创建 `.github/workflows/deploy-weixin.yml`:

```yaml
name: 微信小程序自动部署

on:
  push:
    tags:
      - 'v*'  # 推送 tag 时触发

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: |
          cd plus-app
          pnpm install

      - name: Build
        run: |
          cd plus-app
          pnpm build:mp-weixin

      - name: Upload to WeChat
        env:
          PRIVATE_KEY: ${{ secrets.WEIXIN_PRIVATE_KEY }}
        run: |
          cd plus-app
          echo "$PRIVATE_KEY" > private.key
          pnpm upload:weixin

      - name: Notify
        if: success()
        run: echo "✅ 微信小程序部署成功!"
```

**配置 Secrets:**

1. GitHub 仓库 → Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `WEIXIN_PRIVATE_KEY`
4. Value: 粘贴 `private.key` 文件内容
5. Add secret

**触发部署:**

```bash
# 创建 tag
git tag v1.0.0

# 推送 tag
git push origin v1.0.0

# 自动触发 GitHub Actions 部署
```

#### 2. GitLab CI/CD

创建 `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

variables:
  NODE_VERSION: "18"

build-weixin:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm install -g pnpm
    - cd plus-app
    - pnpm install
    - pnpm build:mp-weixin
  artifacts:
    paths:
      - plus-app/dist/build/mp-weixin
    expire_in: 1 hour
  only:
    - tags

deploy-weixin:
  stage: deploy
  image: node:${NODE_VERSION}
  dependencies:
    - build-weixin
  script:
    - npm install -g miniprogram-ci
    - cd plus-app
    - echo "$WEIXIN_PRIVATE_KEY" > private.key
    - node scripts/upload-weixin.js
  only:
    - tags
```

**配置 CI/CD 变量:**

1. GitLab 项目 → Settings → CI/CD → Variables
2. Add variable
3. Key: `WEIXIN_PRIVATE_KEY`
4. Value: 粘贴 `private.key` 文件内容
5. Protected: ✅
6. Masked: ✅

#### 3. Jenkins Pipeline

创建 `Jenkinsfile`:

```groovy
pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://gitee.com/bkywksj/ruoyi-plus-uniapp-workflow.git'
            }
        }

        stage('Install') {
            steps {
                sh '''
                    npm install -g pnpm
                    cd plus-app
                    pnpm install
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    cd plus-app
                    pnpm build:mp-weixin
                '''
            }
        }

        stage('Upload') {
            steps {
                withCredentials([
                    file(credentialsId: 'weixin-private-key', variable: 'PRIVATE_KEY')
                ]) {
                    sh '''
                        cd plus-app
                        cp $PRIVATE_KEY private.key
                        pnpm upload:weixin
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ 微信小程序部署成功!'
        }
        failure {
            echo '❌ 微信小程序部署失败!'
        }
    }
}
```

**配置凭证:**

1. Jenkins → Manage Jenkins → Manage Credentials
2. Add Credentials
3. Kind: Secret file
4. File: 上传 `private.key` 文件
5. ID: `weixin-private-key`

## 版本管理

### 开发版本

开发版本是上传后默认的版本状态,仅开发者可见。

**特点:**

- 仅限开发者登录查看
- 可以在开发者工具中直接预览
- 可以设置为体验版
- 可以提交审核
- 可以删除

**使用场景:**

- 开发过程中的临时版本
- 功能测试
- Bug 修复验证

**管理操作:**

1. 小程序管理后台 → 版本管理 → 开发版本
2. 可选操作:
   - 预览二维码 - 生成预览二维码
   - 设为体验版 - 供体验者测试
   - 提交审核 - 提交审核发布
   - 删除 - 删除该版本

### 体验版本

体验版本供指定的体验者测试,验证功能是否正常。

**设置体验版:**

1. 版本管理 → 开发版本
2. 选择要设为体验版的版本
3. 点击"设为体验版"
4. 生成体验版二维码

**体验者管理:**

1. 成员管理 → 项目成员
2. 添加成员 → 选择"体验者"角色
3. 输入微信号 → 发送邀请
4. 体验者微信确认

**体验者权限:**

- ✅ 扫码体验小程序
- ✅ 查看体验版功能
- ❌ 无开发权限
- ❌ 无上传代码权限
- ❌ 无发布权限

**体验版特点:**

- 同时只能有一个体验版
- 体验版二维码长期有效
- 体验者需在成员列表中
- 适合内部测试和验收

### 审核版本

提交审核后进入审核队列,由微信官方审核。

**提交审核:**

1. 版本管理 → 开发版本
2. 选择要提交的版本
3. 点击"提交审核"
4. 填写审核信息:
   - **功能页面** - 选择主要功能页面(至少1个)
   - **测试账号** - 提供测试账号密码(如需登录)
   - **配置项** - 配置需要的权限和接口
   - **补充说明** - 说明特殊功能或注意事项

**审核信息填写示例:**

```
功能页面:
  首页: pages/index/index - 展示产品列表和banner
  登录页: pages/login/index - 用户登录功能
  个人中心: pages/user/profile - 用户信息管理

测试账号:
  账号: test001
  密码: Test@123456
  说明: 测试账号已充值,可正常使用所有功能

隐私权限:
  ✅ 用户信息(昵称、头像) - 用于展示用户身份
  ✅ 手机号码 - 用于账号绑定和安全验证
  ✅ 地理位置 - 用于附近门店查询

接口权限:
  ✅ wx.getUserProfile - 获取用户信息
  ✅ wx.getPhoneNumber - 获取手机号码
  ✅ wx.getLocation - 获取地理位置

补充说明:
  本次更新内容:
  1. 新增订单支付功能
  2. 优化商品详情页加载速度
  3. 修复已知Bug
```

**审核状态:**

| 状态 | 说明 | 操作 |
|------|------|------|
| 审核中 | 等待审核(1-7个工作日) | 可撤回 |
| 审核通过 | 已通过审核 | 发布 |
| 审核拒绝 | 未通过审核 | 修改后重新提交 |

**审核时长:**

- 一般审核: 1-3 个工作日
- 加急审核: 2-12 小时(需使用加急次数)
- 加急次数: 每月 3 次(企业认证后)

**撤回审核:**

```
版本管理 → 审核版本 → 撤回
撤回后可修改并重新提交
```

### 线上版本

审核通过后可发布为线上版本,所有用户可见。

**发布上线:**

1. 版本管理 → 审核通过的版本
2. 点击"发布"
3. 确认发布信息
4. 点击"确定"发布

**发布后:**

- 全量用户可见(立即生效)
- 替换旧的线上版本
- 旧版本自动归档
- 无法撤回(需要发布新版本覆盖)

**版本回退:**

如果发现线上版本有严重问题:

1. 版本管理 → 历史版本
2. 选择稳定的旧版本
3. 点击"回退"
4. 确认回退

**注意:**
- 回退会立即生效
- 回退不需要审核
- 每月回退次数有限(一般3次)

### 版本号规范

**语义化版本(SemVer):**

```
主版本号.次版本号.修订号

规则:
- 主版本号:不兼容的 API 修改
- 次版本号:向下兼容的功能新增
- 修订号:向下兼容的 Bug 修复

示例:
1.0.0 → 初始版本
1.1.0 → 新增用户中心功能
1.1.1 → 修复登录Bug
1.2.0 → 新增订单支付功能
2.0.0 → 重构架构(不兼容1.x版本)
```

**版本管理最佳实践:**

```json
// package.json
{
  "version": "2.11.0",
  "update-time": "2025-11-21"
}
```

**更新版本号:**

```bash
# 自动递增版本号
pnpm version patch  # 2.11.0 → 2.11.1
pnpm version minor  # 2.11.0 → 2.12.0
pnpm version major  # 2.11.0 → 3.0.0

# 手动指定版本号
pnpm version 2.12.0
```

## 域名配置

### 服务器域名配置

小程序只能访问配置的合法域名,需要在管理后台配置白名单。

**配置步骤:**

1. 小程序管理后台 → 开发 → 开发管理
2. 开发设置 → 服务器域名
3. 点击"修改"
4. 配置各类域名:

**request 合法域名(API 接口):**

```
https://api.example.com
https://admin.example.com
```

**socket 合法域名(WebSocket):**

```
wss://ws.example.com
```

**uploadFile 合法域名(文件上传):**

```
https://upload.example.com
https://oss.example.com
```

**downloadFile 合法域名(文件下载):**

```
https://cdn.example.com
https://static.example.com
```

**域名要求:**

- ✅ 必须使用 HTTPS/WSS 协议
- ✅ 必须备案(中国大陆域名)
- ✅ 不支持 IP 地址
- ✅ 不支持端口号
- ✅ 每月可修改 5 次
- ✅ 每种类型最多 20 个域名

**配置示例:**

```
request合法域名:
  https://api.example.com      # 主API
  https://admin.example.com    # 管理API
  https://pay.example.com      # 支付API

uploadFile合法域名:
  https://upload.example.com   # 文件上传
  https://oss.aliyuncs.com     # 阿里云OSS

downloadFile合法域名:
  https://cdn.example.com      # CDN
  https://static.example.com   # 静态资源
```

### 业务域名配置

如果小程序中使用 `<web-view>` 组件嵌入H5页面,需要配置业务域名。

**配置步骤:**

1. 开发设置 → 业务域名
2. 点击"添加"
3. 输入域名(如 `https://h5.example.com`)
4. 下载校验文件
5. 将校验文件上传到域名根目录
6. 点击"保存"

**校验文件示例:**

```
下载: WxVerifyFile_1234567890.txt
上传至: https://h5.example.com/WxVerifyFile_1234567890.txt
```

**业务域名要求:**

- ✅ 必须使用 HTTPS 协议
- ✅ 必须备案
- ✅ 每月可修改 3 次
- ✅ 最多 20 个域名

**web-view 使用示例:**

```vue
<template>
  <web-view :src="h5Url" @message="handleMessage" />
</template>

<script lang="ts" setup>
const h5Url = 'https://h5.example.com/活动页面'

const handleMessage = (e: any) => {
  console.log('H5消息', e.detail.data)
}
</script>
```

### SSL 证书配置

域名必须配置 SSL 证书才能使用 HTTPS。

**获取免费 SSL 证书:**

**1. Let's Encrypt(免费,90天有效期):**

```bash
# 安装 Certbot
sudo apt-get install certbot

# 生成证书
sudo certbot certonly --standalone -d api.example.com

# 证书文件位置
# /etc/letsencrypt/live/api.example.com/fullchain.pem
# /etc/letsencrypt/live/api.example.com/privkey.pem

# 自动续期
sudo certbot renew --dry-run
```

**2. 阿里云 SSL 证书(免费,1年有效期):**

1. 阿里云控制台 → SSL 证书
2. 选择免费证书
3. 购买(0元)
4. 申请证书
5. 填写域名信息
6. 选择验证方式(DNS/文件)
7. 完成验证
8. 下载证书

**3. 腾讯云 SSL 证书(免费,1年有效期):**

1. 腾讯云控制台 → SSL 证书管理
2. 申请免费证书
3. 填写域名
4. 验证域名所有权
5. 下载证书

**Nginx 配置 SSL:**

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL 证书配置
    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;

    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 后端代理
    location / {
        proxy_pass http://127.0.0.1:5500;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}
```

**验证 SSL 配置:**

```bash
# 检查证书有效期
openssl s_client -connect api.example.com:443 -servername api.example.com

# 在线检测
# https://www.ssllabs.com/ssltest/
```

## 权限配置

### 用户信息权限

小程序获取用户信息需要用户授权。

**获取用户信息:**

```vue
<template>
  <view class="profile">
    <button @click="getUserProfile">获取用户信息</button>
    <view v-if="userInfo">
      <image :src="userInfo.avatarUrl" />
      <text>{{ userInfo.nickName }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const userInfo = ref<any>(null)

const getUserProfile = () => {
  uni.getUserProfile({
    desc: '用于完善用户资料',  // 必填,说明用途
    success: (res) => {
      console.log('用户信息', res.userInfo)
      userInfo.value = res.userInfo
      // 保存用户信息到服务器
    },
    fail: (err) => {
      console.error('获取失败', err)
      uni.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      })
    }
  })
}
</script>
```

**隐私政策配置:**

1. 小程序管理后台 → 设置 → 基本设置
2. 服务内容声明 → 用户隐私保护指引
3. 填写隐私政策内容:

```
《用户隐私保护指引》

一、我们收集的信息
1. 用户昵称和头像:用于展示用户身份
2. 手机号码:用于账号绑定和安全验证
3. 地理位置:用于附近门店查询

二、信息的使用
我们仅将收集的信息用于提供服务,不会用于其他用途。

三、信息的保护
我们采用行业标准的安全措施保护用户信息。

四、用户权利
用户可以随时删除个人信息或注销账号。

联系方式:770492966@qq.com
```

### 位置权限

获取用户位置需要在 `manifest.json` 中声明:

```json
{
  "mp-weixin": {
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于附近门店查询"
      }
    }
  }
}
```

**获取位置信息:**

```typescript
// 获取当前位置
uni.getLocation({
  type: 'gcj02',  // 返回国测局坐标
  success: (res) => {
    console.log('经度', res.longitude)
    console.log('纬度', res.latitude)
    // 调用地图API查询附近门店
  },
  fail: (err) => {
    if (err.errMsg.includes('auth deny')) {
      uni.showModal({
        title: '需要位置权限',
        content: '请允许访问你的位置信息',
        success: (res) => {
          if (res.confirm) {
            // 打开设置页面
            uni.openSetting()
          }
        }
      })
    }
  }
})
```

**地图选择位置:**

```typescript
// 打开地图选择位置
uni.chooseLocation({
  success: (res) => {
    console.log('位置名称', res.name)
    console.log('详细地址', res.address)
    console.log('经纬度', res.latitude, res.longitude)
  }
})
```

### 相机和相册权限

拍照和选择图片需要权限:

```typescript
// 拍照或从相册选择
uni.chooseImage({
  count: 1,
  sizeType: ['compressed'],  // 压缩图
  sourceType: ['camera', 'album'],  // 相机和相册
  success: (res) => {
    const tempFilePath = res.tempFilePaths[0]
    console.log('临时文件路径', tempFilePath)

    // 上传图片
    uni.uploadFile({
      url: 'https://api.example.com/upload',
      filePath: tempFilePath,
      name: 'file',
      success: (uploadRes) => {
        console.log('上传成功', uploadRes.data)
      }
    })
  },
  fail: (err) => {
    console.error('选择图片失败', err)
  }
})
```

**图片预览:**

```typescript
// 预览图片
uni.previewImage({
  current: 0,  // 当前显示图片索引
  urls: [
    'https://cdn.example.com/image1.jpg',
    'https://cdn.example.com/image2.jpg'
  ]
})
```

### 录音权限

录音功能需要用户授权:

```typescript
// 开始录音
const recorderManager = uni.getRecorderManager()

recorderManager.onStart(() => {
  console.log('开始录音')
})

recorderManager.onStop((res) => {
  console.log('录音结束', res.tempFilePath)
  // 上传录音文件
})

// 开始录音
recorderManager.start({
  duration: 60000,  // 最长60秒
  format: 'mp3'
})

// 停止录音
setTimeout(() => {
  recorderManager.stop()
}, 5000)
```

### 通讯录权限

获取手机号码:

```vue
<template>
  <button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
    获取手机号
  </button>
</template>

<script lang="ts" setup>
const getPhoneNumber = (e: any) => {
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    const { code } = e.detail

    // 将 code 发送到后端
    uni.request({
      url: 'https://api.example.com/user/phone',
      method: 'POST',
      data: { code },
      success: (res) => {
        console.log('手机号', res.data.phoneNumber)
      }
    })
  } else {
    uni.showToast({
      title: '获取手机号失败',
      icon: 'none'
    })
  }
}
</script>
```

**后端解密手机号:**

```java
// 后端接口(Java)
@PostMapping("/user/phone")
public R<String> getPhoneNumber(@RequestBody PhoneCodeDTO dto) {
    // 调用微信API解密手机号
    String phoneNumber = wechatService.getPhoneNumber(dto.getCode());
    return R.ok(phoneNumber);
}
```

## 审核规范

### 审核要点

微信小程序审核严格,需要遵守平台规范。

**必须满足的条件:**

1. **功能完整** - 所有功能可正常使用,无死链接
2. **信息真实** - 小程序信息与实际功能一致
3. **内容合规** - 不涉及违法违规内容
4. **隐私保护** - 明确告知用户信息收集用途
5. **支付规范** - 使用微信支付,不跳转外部支付
6. **不诱导分享** - 不强制用户分享才能使用功能
7. **不诱导关注** - 不强制关注公众号
8. **无虚假宣传** - 不夸大宣传,不虚假承诺

**常见拒绝原因:**

| 原因 | 说明 | 解决方案 |
|------|------|---------|
| 功能缺失 | 页面空白或无法使用 | 确保所有功能正常 |
| 测试账号无效 | 提供的测试账号无法登录 | 提供可用的测试账号 |
| 缺少用户协议 | 未提供用户协议和隐私政策 | 添加协议页面 |
| 诱导分享 | 强制分享才能使用 | 移除强制分享 |
| 内容违规 | 涉及违禁内容 | 移除违规内容 |
| 支付不规范 | 使用第三方支付 | 接入微信支付 |
| 域名未配置 | API域名未在后台配置 | 配置服务器域名 |

### 用户协议和隐私政策

小程序必须提供完整的用户协议和隐私政策。

**创建协议页面:**

```
pages/agreement/
├── user-agreement.vue      # 用户协议
└── privacy-policy.vue      # 隐私政策
```

**用户协议示例:**

```vue
<!-- pages/agreement/user-agreement.vue -->
<template>
  <view class="agreement">
    <view class="title">用户服务协议</view>

    <view class="section">
      <view class="section-title">一、服务条款的确认</view>
      <text class="content">
        欢迎使用本小程序。在使用本小程序之前,请您仔细阅读本协议。
        使用本小程序即表示您同意遵守本协议的所有条款。
      </text>
    </view>

    <view class="section">
      <view class="section-title">二、服务内容</view>
      <text class="content">
        1. 本小程序提供XXX服务
        2. 用户可以通过小程序实现XXX功能
        3. 我们保留随时修改或中断服务的权利
      </text>
    </view>

    <view class="section">
      <view class="section-title">三、用户义务</view>
      <text class="content">
        1. 用户应当遵守国家法律法规
        2. 不得利用本小程序从事违法活动
        3. 不得恶意攻击或破坏小程序
      </text>
    </view>

    <view class="section">
      <view class="section-title">四、知识产权</view>
      <text class="content">
        本小程序的所有内容(包括但不限于文字、图片、代码)均受知识产权法保护。
      </text>
    </view>

    <view class="section">
      <view class="section-title">五、免责声明</view>
      <text class="content">
        对于因使用本小程序而产生的任何直接、间接、偶然或后果性损害,
        我们不承担任何责任。
      </text>
    </view>

    <view class="footer">
      <text>本协议最后更新时间:2025年11月21日</text>
      <text>联系方式:770492966@qq.com</text>
    </view>
  </view>
</template>

```

**隐私政策示例:**

```vue
<!-- pages/agreement/privacy-policy.vue -->
<template>
  <view class="privacy">
    <view class="title">隐私政策</view>

    <view class="section">
      <view class="section-title">一、信息收集</view>
      <text class="content">
        我们会收集以下信息:
        1. 基本信息:昵称、头像
        2. 联系方式:手机号码
        3. 位置信息:地理位置
        4. 设备信息:设备型号、操作系统版本
      </text>
    </view>

    <view class="section">
      <view class="section-title">二、信息使用</view>
      <text class="content">
        收集的信息用于:
        1. 提供小程序服务
        2. 改善用户体验
        3. 发送服务通知
        4. 统计分析(匿名)
      </text>
    </view>

    <view class="section">
      <view class="section-title">三、信息保护</view>
      <text class="content">
        我们采取以下措施保护用户信息:
        1. 数据加密传输(HTTPS)
        2. 数据库加密存储
        3. 严格的访问控制
        4. 定期安全审计
      </text>
    </view>

    <view class="section">
      <view class="section-title">四、信息共享</view>
      <text class="content">
        我们不会向第三方出售、出租或共享您的个人信息,
        除非:
        1. 获得您的明确同意
        2. 法律法规要求
        3. 司法机关或政府部门要求
      </text>
    </view>

    <view class="section">
      <view class="section-title">五、用户权利</view>
      <text class="content">
        您可以:
        1. 查询和更正个人信息
        2. 删除个人信息
        3. 注销账号
        4. 撤回授权同意
      </text>
    </view>

    <view class="section">
      <view class="section-title">六、政策更新</view>
      <text class="content">
        我们可能会不时更新本隐私政策。
        更新后我们会在小程序内通知您。
      </text>
    </view>

    <view class="footer">
      <text>本政策最后更新时间:2025年11月21日</text>
      <text>如有疑问,请联系:770492966@qq.com</text>
    </view>
  </view>
</template>

```

**在登录页面引用协议:**

```vue
<template>
  <view class="login">
    <button @click="handleLogin">微信登录</button>

    <view class="agreement">
      <checkbox :checked="agreeAgreement" @click="agreeAgreement = !agreeAgreement" />
      <text>我已阅读并同意</text>
      <text class="link" @click="toUserAgreement">《用户协议》</text>
      <text>和</text>
      <text class="link" @click="toPrivacyPolicy">《隐私政策》</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const agreeAgreement = ref(false)

const handleLogin = () => {
  if (!agreeAgreement.value) {
    uni.showToast({
      title: '请先阅读并同意用户协议和隐私政策',
      icon: 'none'
    })
    return
  }

  // 执行登录逻辑
  uni.login({
    success: (res) => {
      // 获取 code,发送到后端
    }
  })
}

const toUserAgreement = () => {
  uni.navigateTo({
    url: '/pages/agreement/user-agreement'
  })
}

const toPrivacyPolicy = () => {
  uni.navigateTo({
    url: '/pages/agreement/privacy-policy'
  })
}
</script>

```

### 测试账号准备

提交审核时必须提供可用的测试账号。

**测试账号要求:**

1. **可正常登录** - 账号密码正确,无验证码
2. **权限完整** - 可以访问所有需要审核的功能
3. **数据充足** - 有足够的测试数据展示功能
4. **长期有效** - 至少在审核期间有效(7天以上)

**测试账号示例:**

```
账号: test001
密码: Test@123456
说明: 测试账号已开通VIP,可使用所有功能

如需充值测试:
  测试银行卡: 6214 8888 8888 8888
  手机号: 18888888888
  验证码: 123456 (固定验证码)
```

**创建测试环境:**

```typescript
// utils/env.ts
export const isTestAccount = (username: string) => {
  const testAccounts = ['test001', 'test002', 'demo']
  return testAccounts.includes(username)
}

// 测试账号跳过某些验证
if (isTestAccount(username)) {
  // 跳过验证码验证
  // 跳过支付流程
  // 模拟充值成功
}
```

### 审核加急

企业认证小程序可使用加急审核。

**加急条件:**

- ✅ 企业认证小程序
- ✅ 无违规记录
- ✅ 每月 3 次加急机会

**使用加急:**

1. 提交审核后 → 版本管理
2. 审核中的版本 → 点击"加急"
3. 选择加急原因:
   - 重要活动即将开始
   - 修复严重Bug
   - 业务紧急需求
4. 填写详细说明
5. 提交加急申请

**加急审核时长:**

- 一般: 2-12 小时
- 特殊情况: 最快 30 分钟

**注意事项:**

- 加急不保证一定通过审核
- 加急次数用完需等下月
- 滥用加急可能影响审核

## 性能优化

### 包体积优化

小程序包体积限制严格,需要持续优化。

**体积限制:**

- 主包: ≤ 2MB
- 分包: 单个 ≤ 2MB
- 总包: ≤ 20MB

**优化策略:**

**1. 图片优化**

```bash
# 使用 TinyPNG 压缩图片
# https://tinypng.com/

# 或使用 ImageOptim (Mac)
# https://imageoptim.com/

# 压缩率可达 70%,视觉无损
```

**图片格式选择:**

| 场景 | 推荐格式 | 说明 |
|------|---------|------|
| 图标 | SVG/IconFont | 矢量,体积小 |
| 背景图 | WebP | 体积小,质量高 |
| 照片 | JPG | 压缩率高 |
| 透明背景 | PNG8 | 比PNG24小 |

**2. 代码优化**

```typescript
// ✅ 按需导入
import { ref, computed } from 'vue'

// ❌ 全量导入
import * as Vue from 'vue'

// ✅ Tree-shaking 友好
import { formatDate } from '@/utils/date'

// ❌ 全量导入工具库
import * as utils from '@/utils'
```

**3. 分包加载**

```json
// pages.json
{
  "pages": [
    "pages/index/index",
    "pages/login/index"
  ],
  "subPackages": [
    {
      "root": "pages-sub/user",
      "pages": [
        "profile/index",
        "settings/index"
      ]
    },
    {
      "root": "pages-sub/order",
      "pages": [
        "list/index",
        "detail/index"
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub/user"]
    }
  }
}
```

**分包预加载:**

- `network: "all"` - 在任何网络下预下载
- `network: "wifi"` - 仅 WiFi 下预下载
- `packages` - 预下载的分包列表

**4. 移除未使用的依赖**

```bash
# 分析依赖
pnpm list --depth 0

# 移除未使用的依赖
pnpm remove unused-package

# 分析打包体积
pnpm build:mp-weixin --report
```

**5. 静态资源 CDN**

```typescript
// 大图片使用 CDN
const bannerUrl = 'https://cdn.example.com/banner.jpg'

// 小图标内联 Base64
const iconBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEU...'
```

### 加载速度优化

**1. 骨架屏**

```vue
<template>
  <view class="page">
    <!-- 加载中显示骨架屏 -->
    <view v-if="loading" class="skeleton">
      <view class="skeleton-item" />
      <view class="skeleton-item" />
      <view class="skeleton-item" />
    </view>

    <!-- 加载完成显示内容 -->
    <view v-else class="content">
      <view v-for="item in list" :key="item.id">
        {{ item.name }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const list = ref([])

onMounted(async () => {
  // 加载数据
  const res = await loadData()
  list.value = res.data
  loading.value = false
})
</script>

```

**2. 图片懒加载**

```vue
<template>
  <scroll-view
    scroll-y
    class="list"
    @scrolltolower="loadMore"
  >
    <view v-for="item in list" :key="item.id" class="item">
      <image
        :src="item.image"
        mode="aspectFill"
        lazy-load
      />
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
const loadMore = () => {
  // 加载更多数据
}
</script>
```

**3. 数据预加载**

```typescript
// app.ts
export default {
  onLaunch() {
    // 预加载用户信息
    this.loadUserInfo()

    // 预加载配置信息
    this.loadConfig()
  },

  async loadUserInfo() {
    try {
      const res = await uni.request({
        url: 'https://api.example.com/user/info'
      })
      uni.setStorageSync('userInfo', res.data)
    } catch (error) {
      console.error('预加载用户信息失败', error)
    }
  }
}
```

**4. 请求优化**

```typescript
// 请求并发控制
const requestQueue = []
const MAX_CONCURRENT = 5

const request = (url: string) => {
  return new Promise((resolve, reject) => {
    if (requestQueue.length >= MAX_CONCURRENT) {
      // 等待队列
      setTimeout(() => {
        request(url).then(resolve).catch(reject)
      }, 100)
      return
    }

    requestQueue.push(url)
    uni.request({
      url,
      success: (res) => {
        requestQueue.splice(requestQueue.indexOf(url), 1)
        resolve(res.data)
      },
      fail: reject
    })
  })
}

// 请求去重
const requestCache = new Map()

const cachedRequest = (url: string) => {
  if (requestCache.has(url)) {
    return requestCache.get(url)
  }

  const promise = uni.request({ url })
  requestCache.set(url, promise)

  // 5分钟后清除缓存
  setTimeout(() => {
    requestCache.delete(url)
  }, 5 * 60 * 1000)

  return promise
}
```

### 渲染性能优化

**1. 虚拟列表**

对于长列表,使用虚拟滚动:

```vue
<template>
  <scroll-view
    scroll-y
    class="virtual-list"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <view :style="{ height: totalHeight + 'px' }">
      <view
        v-for="item in visibleItems"
        :key="item.id"
        class="item"
        :style="{ transform: `translateY(${item.top}px)` }"
      >
        {{ item.name }}
      </view>
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const itemHeight = 100  // 每项高度
const containerHeight = 600  // 容器高度
const bufferSize = 5  // 缓冲区大小

const list = ref([])  // 完整列表
const scrollTop = ref(0)

const totalHeight = computed(() => list.value.length * itemHeight)

const visibleItems = computed(() => {
  const startIndex = Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferSize)
  const endIndex = Math.min(
    list.value.length,
    Math.ceil((scrollTop.value + containerHeight) / itemHeight) + bufferSize
  )

  return list.value.slice(startIndex, endIndex).map((item, index) => ({
    ...item,
    top: (startIndex + index) * itemHeight
  }))
})

const handleScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}
</script>
```

**2. 条件渲染优化**

```vue
<template>
  <!-- ✅ 使用 v-show 切换显示隐藏(频繁切换) -->
  <view v-show="visible" class="modal">
    模态框内容
  </view>

  <!-- ✅ 使用 v-if 条件渲染(不频繁切换) -->
  <view v-if="isLoggedIn" class="user-panel">
    用户面板
  </view>
</template>
```

**3. 计算属性缓存**

```typescript
// ✅ 使用计算属性(有缓存)
const filteredList = computed(() => {
  return list.value.filter(item => item.status === 'active')
})

// ❌ 使用方法(每次调用都重新计算)
const getFilteredList = () => {
  return list.value.filter(item => item.status === 'active')
}
```

**4. 事件节流防抖**

```typescript
// 防抖
const debounce = (fn: Function, delay: number) => {
  let timer: any
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

// 搜索输入防抖
const handleSearch = debounce((keyword: string) => {
  // 执行搜索
}, 500)

// 节流
const throttle = (fn: Function, delay: number) => {
  let lastTime = 0
  return (...args: any[]) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn(...args)
      lastTime = now
    }
  }
}

// 滚动事件节流
const handleScroll = throttle((e: any) => {
  // 处理滚动
}, 200)
```

## 常见问题

### 1. 上传代码失败

**问题原因:**

- 网络连接问题
- 包体积超出限制
- 代码编译错误
- 权限不足

**解决方案:**

```bash
# 1. 检查网络连接
ping mp.weixin.qq.com

# 2. 检查包体积
pnpm build:mp-weixin
# 查看输出的包体积信息

# 3. 清理重新构建
rm -rf dist node_modules/.vite
pnpm install
pnpm build:mp-weixin

# 4. 检查开发者权限
# 管理后台 → 成员管理 → 确认有上传权限
```

**包体积超限优化:**

```typescript
// vite.config.ts
{
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia'],
          'crypto': ['crypto-js'],
        }
      }
    }
  }
}
```

### 2. 真机调试白屏

**问题原因:**

- API 域名未配置
- 代码语法错误
- 网络请求失败
- 缺少必要权限

**解决方案:**

```bash
# 1. 开启调试模式查看错误
# manifest.json
{
  "mp-weixin": {
    "setting": {
      "debug": true  # 开启 vConsole
    }
  }
}

# 2. 检查域名配置
# 管理后台 → 开发设置 → 服务器域名
# 确保 API 域名已配置

# 3. 检查网络请求
# vConsole → Network → 查看失败的请求

# 4. 检查权限配置
# manifest.json → permission
```

**添加错误捕获:**

```typescript
// app.ts
export default {
  onError(error: string) {
    console.error('全局错误:', error)

    // 上报错误
    uni.request({
      url: 'https://api.example.com/log/error',
      method: 'POST',
      data: {
        error,
        page: getCurrentPages().pop()?.route,
        time: new Date().toISOString()
      }
    })
  }
}
```

### 3. 审核被拒

**常见拒绝原因及解决方案:**

**场景1:功能无法使用**

```
拒绝原因: 登录功能无法使用,提示"网络错误"

解决方案:
1. 检查测试账号是否可用
2. 检查 API 域名配置
3. 确保开发环境和生产环境一致
4. 提供详细的测试说明
```

**场景2:缺少用户协议**

```
拒绝原因: 未提供用户服务协议和隐私政策

解决方案:
1. 添加协议页面
2. 在登录/注册页面添加协议链接
3. 用户首次使用需同意协议
4. 重新提交审核
```

**场景3:诱导分享**

```
拒绝原因: 存在"分享后才能查看"功能,诱导用户分享

解决方案:
1. 移除强制分享逻辑
2. 改为"分享可获得奖励"(可选)
3. 确保不分享也能使用基本功能
```

**场景4:支付不规范**

```
拒绝原因: 使用第三方支付,未接入微信支付

解决方案:
1. 接入微信支付
2. 移除第三方支付入口
3. 不能跳转到H5支付页面
```

**重新提交审核:**

```
1. 根据拒绝原因修改代码
2. 重新构建上传
3. 填写"修改说明":

   已根据审核意见进行如下修改:
   1. 添加了用户协议和隐私政策页面
   2. 移除了强制分享功能
   3. 接入了微信支付
   4. 提供了可用的测试账号

   请审核人员重新审核,谢谢!

4. 提交审核
```

### 4. 接口请求失败

**问题原因:**

- 域名未配置或配置错误
- SSL 证书问题
- 跨域问题(不存在于小程序)
- 后端接口异常

**解决方案:**

```typescript
// 1. 检查域名配置
// 管理后台 → 服务器域名 → request合法域名
// 确保包含: https://api.example.com

// 2. 统一请求封装,添加错误处理
const request = (options: any) => {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      },
      fail: (err) => {
        console.error('请求失败', options.url, err)

        // 友好提示
        let message = '网络请求失败'
        if (err.errMsg.includes('timeout')) {
          message = '请求超时,请检查网络'
        } else if (err.errMsg.includes('fail')) {
          message = '无法连接服务器'
        }

        uni.showToast({
          title: message,
          icon: 'none'
        })

        reject(err)
      }
    })
  })
}

// 3. 使用请求封装
const getUserInfo = async () => {
  try {
    const data = await request({
      url: 'https://api.example.com/user/info',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })
    return data
  } catch (error) {
    console.error('获取用户信息失败', error)
    return null
  }
}
```

### 5. 本地存储数据丢失

**问题原因:**

- 超出存储限制(10MB)
- 用户清理缓存
- 代码异常导致存储失败

**解决方案:**

```typescript
// 1. 封装存储操作,添加错误处理
const storage = {
  set(key: string, value: any) {
    try {
      uni.setStorageSync(key, value)
      return true
    } catch (error) {
      console.error('存储失败', key, error)

      // 存储空间不足,清理过期数据
      if (error.errMsg.includes('exceed')) {
        this.clearExpired()
        // 重试
        try {
          uni.setStorageSync(key, value)
          return true
        } catch (e) {
          return false
        }
      }
      return false
    }
  },

  get(key: string, defaultValue: any = null) {
    try {
      const value = uni.getStorageSync(key)
      return value || defaultValue
    } catch (error) {
      console.error('读取失败', key, error)
      return defaultValue
    }
  },

  remove(key: string) {
    try {
      uni.removeStorageSync(key)
    } catch (error) {
      console.error('删除失败', key, error)
    }
  },

  clearExpired() {
    // 清理过期的缓存数据
    const keys = ['temp_data_1', 'cache_old']
    keys.forEach(key => this.remove(key))
  }
}

// 2. 重要数据使用服务器存储
// ✅ 用户token存本地
storage.set('token', tokenValue)

// ✅ 用户信息存服务器
await api.updateUserInfo(userInfo)

// 3. 定期同步数据
const syncData = async () => {
  const localData = storage.get('local_data')
  await api.syncData(localData)
}

setInterval(syncData, 5 * 60 * 1000)  // 每5分钟同步
```

### 6. 分包加载失败

**问题原因:**

- 分包路径配置错误
- 分包大小超限
- 分包依赖主包资源

**解决方案:**

```json
// pages.json
{
  "pages": [
    "pages/index/index"
  ],
  "subPackages": [
    {
      "root": "pages-sub/user",  // 确保目录存在
      "pages": [
        "profile/index",  // 完整路径: pages-sub/user/profile/index
        "settings/index"
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub/user"]
    }
  }
}
```

**检查分包大小:**

```bash
# 构建后查看各分包大小
pnpm build:mp-weixin

# 输出示例:
# dist/build/mp-weixin/
# ├── app.js              (主包: 1.2MB)
# ├── pages-sub/user/     (分包: 800KB)
# └── pages-sub/order/    (分包: 1.5MB)

# 如果分包超限,进行优化:
# 1. 图片使用CDN
# 2. 代码分割
# 3. 移除未使用的依赖
```

### 7. 支付失败

**问题原因:**

- 未开通微信支付
- 商户号配置错误
- 支付参数签名错误
- 网络问题

**解决方案:**

```typescript
// 1. 确保已开通微信支付
// 管理后台 → 微信支付 → 开通

// 2. 配置商户号
// 管理后台 → 微信支付 → 商户号配置

// 3. 封装支付方法
const pay = async (orderId: string) => {
  try {
    // 后端生成支付参数
    const res = await uni.request({
      url: 'https://api.example.com/pay/prepay',
      method: 'POST',
      data: { orderId }
    })

    const payParams = res.data

    // 调起微信支付
    const payRes = await uni.requestPayment({
      provider: 'wxpay',
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType,
      paySign: payParams.paySign,
    })

    console.log('支付成功', payRes)

    // 跳转到支付成功页面
    uni.redirectTo({
      url: '/pages/order/success?orderId=' + orderId
    })
  } catch (error) {
    console.error('支付失败', error)

    if (error.errMsg.includes('cancel')) {
      uni.showToast({
        title: '已取消支付',
        icon: 'none'
      })
    } else {
      uni.showToast({
        title: '支付失败,请重试',
        icon: 'none'
      })
    }
  }
}
```

**后端支付接口(Java):**

```java
@PostMapping("/pay/prepay")
public R<PayParamsVO> prepay(@RequestBody PayDTO dto) {
    // 调用微信支付统一下单API
    WxPayUnifiedOrderRequest request = new WxPayUnifiedOrderRequest();
    request.setBody("商品描述");
    request.setOutTradeNo(dto.getOrderId());
    request.setTotalFee(100); // 金额(分)
    request.setSpbillCreateIp("127.0.0.1");
    request.setNotifyUrl("https://api.example.com/pay/notify");
    request.setTradeType("JSAPI");
    request.setOpenid(dto.getOpenid());

    WxPayUnifiedOrderResult result = wxPayService.unifiedOrder(request);

    // 生成小程序支付参数
    PayParamsVO params = new PayParamsVO();
    params.setTimeStamp(String.valueOf(System.currentTimeMillis() / 1000));
    params.setNonceStr(result.getNonceStr());
    params.setPackage("prepay_id=" + result.getPrepayId());
    params.setSignType("MD5");
    params.setPaySign(signPayParams(params));

    return R.ok(params);
}
```

### 8. 小程序更新失败

**问题原因:**

- 用户网络不稳定
- 更新包下载失败
- 版本号未更新

**解决方案:**

```typescript
// app.ts
export default {
  onLaunch() {
    this.checkUpdate()
  },

  checkUpdate() {
    const updateManager = uni.getUpdateManager()

    // 检查更新
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        console.log('发现新版本')
      } else {
        console.log('已是最新版本')
      }
    })

    // 下载新版本
    updateManager.onUpdateReady(() => {
      uni.showModal({
        title: '更新提示',
        content: '新版本已准备好,是否重启应用?',
        success: (res) => {
          if (res.confirm) {
            // 重启应用
            updateManager.applyUpdate()
          }
        }
      })
    })

    // 下载失败
    updateManager.onUpdateFailed(() => {
      uni.showModal({
        title: '更新失败',
        content: '新版本下载失败,请检查网络后重试',
        showCancel: false
      })
    })
  }
}
```

## 最佳实践

### 1. 版本发布流程

**标准发布流程:**

```
1. 开发新功能
   ├── 本地开发调试
   ├── 代码Review
   └── 合并到主分支

2. 测试验证
   ├── 构建开发版本
   ├── 设为体验版
   ├── 团队成员测试
   └── 修复发现的问题

3. 发布准备
   ├── 更新版本号(package.json)
   ├── 更新更新日志
   ├── 检查环境变量配置
   └── 执行生产构建

4. 提交审核
   ├── 上传代码
   ├── 填写审核信息
   ├── 提供测试账号
   └── 等待审核通过

5. 正式发布
   ├── 审核通过后发布
   ├── 监控线上数据
   ├── 收集用户反馈
   └── 必要时进行热修复
```

### 2. 环境管理

**多环境配置:**

```
env/
├── .env                # 公共配置
├── .env.development    # 开发环境
├── .env.test           # 测试环境
├── .env.staging        # 预发布环境
└── .env.production     # 生产环境
```

**构建不同环境:**

```json
// package.json
{
  "scripts": {
    "dev:mp-weixin": "uni -p mp-weixin",
    "build:test": "uni build -p mp-weixin --mode test",
    "build:staging": "uni build -p mp-weixin --mode staging",
    "build:prod": "uni build -p mp-weixin --mode production"
  }
}
```

### 3. 代码质量保证

**提交前检查:**

```bash
# 1. 类型检查
pnpm type-check

# 2. 代码检查
pnpm lint:fix

# 3. 单元测试
pnpm test

# 4. 构建测试
pnpm build:mp-weixin
```

**Git Hooks 自动化:**

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

### 4. 性能监控

**添加性能监控:**

```typescript
// utils/performance.ts
export const performanceMonitor = {
  // 页面加载时间
  pageLoad(pageName: string, startTime: number) {
    const loadTime = Date.now() - startTime
    console.log(`${pageName} 加载耗时: ${loadTime}ms`)

    // 上报到监控平台
    this.report('page_load', {
      page: pageName,
      duration: loadTime
    })
  },

  // API 请求时间
  apiRequest(apiName: string, duration: number) {
    console.log(`${apiName} 请求耗时: ${duration}ms`)

    this.report('api_request', {
      api: apiName,
      duration
    })
  },

  // 上报数据
  report(event: string, data: any) {
    uni.request({
      url: 'https://api.example.com/monitor/report',
      method: 'POST',
      data: {
        event,
        data,
        timestamp: Date.now()
      }
    })
  }
}

// 使用示例
onLoad(() => {
  const startTime = Date.now()

  // 页面加载完成
  onReady(() => {
    performanceMonitor.pageLoad('index', startTime)
  })
})
```

### 5. 错误监控

**全局错误捕获:**

```typescript
// app.ts
export default {
  onError(error: string) {
    console.error('全局错误', error)

    // 解析错误信息
    const errorInfo = {
      message: error,
      page: getCurrentPages().pop()?.route || '',
      userAgent: uni.getSystemInfoSync(),
      timestamp: new Date().toISOString()
    }

    // 上报错误
    uni.request({
      url: 'https://api.example.com/log/error',
      method: 'POST',
      data: errorInfo
    })
  }
}

// Promise 错误捕获
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise错误', event.reason)
})
```

### 6. 安全防护

**API 请求加密:**

```typescript
import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'

// RSA 加密
const encryptData = (data: any) => {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(import.meta.env.VITE_APP_RSA_PUBLIC_KEY)

  const encrypted = encrypt.encrypt(JSON.stringify(data))
  return encrypted
}

// AES 加密
const aesEncrypt = (data: string, key: string) => {
  return CryptoJS.AES.encrypt(data, key).toString()
}

// 请求拦截器
const request = (options: any) => {
  // 加密请求数据
  if (options.data && import.meta.env.VITE_APP_API_ENCRYPT === 'true') {
    options.data = {
      encrypted: encryptData(options.data)
    }
  }

  return uni.request(options)
}
```

### 7. 用户体验优化

**友好的错误提示:**

```typescript
const handleError = (error: any) => {
  let title = '操作失败'

  if (error.code === 'NETWORK_ERROR') {
    title = '网络连接失败,请检查网络'
  } else if (error.code === 'TIMEOUT') {
    title = '请求超时,请稍后重试'
  } else if (error.code === 'UNAUTHORIZED') {
    title = '登录已过期,请重新登录'
    // 跳转到登录页
    uni.reLaunch({ url: '/pages/login/index' })
  } else if (error.code === 'FORBIDDEN') {
    title = '没有权限执行此操作'
  } else if (error.code === 'NOT_FOUND') {
    title = '请求的资源不存在'
  } else if (error.code === 'SERVER_ERROR') {
    title = '服务器错误,请稍后重试'
  }

  uni.showToast({
    title,
    icon: 'none',
    duration: 2000
  })
}
```

**加载状态管理:**

```vue
<template>
  <view class="page">
    <wd-loading v-if="loading" />
    <view v-else-if="error" class="error">
      <text>{{ error }}</text>
      <button @click="reload">重试</button>
    </view>
    <view v-else class="content">
      <!-- 内容 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
const loading = ref(true)
const error = ref('')

const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await api.getData()
    // 处理数据
  } catch (e) {
    error.value = '加载失败,请重试'
  } finally {
    loading.value = false
  }
}

const reload = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
```

### 8. 数据埋点

**用户行为追踪:**

```typescript
// utils/track.ts
export const track = {
  // 页面访问
  pageView(pageName: string) {
    this.report('page_view', {
      page: pageName,
      referrer: document.referrer
    })
  },

  // 按钮点击
  click(buttonName: string, extra?: any) {
    this.report('button_click', {
      button: buttonName,
      ...extra
    })
  },

  // 商品浏览
  productView(productId: string) {
    this.report('product_view', {
      productId
    })
  },

  // 加入购物车
  addToCart(productId: string, quantity: number) {
    this.report('add_to_cart', {
      productId,
      quantity
    })
  },

  // 下单
  purchase(orderId: string, amount: number) {
    this.report('purchase', {
      orderId,
      amount
    })
  },

  // 上报数据
  report(event: string, data: any) {
    uni.request({
      url: 'https://api.example.com/track',
      method: 'POST',
      data: {
        event,
        data,
        userId: uni.getStorageSync('userId'),
        timestamp: Date.now()
      }
    })
  }
}

// 使用示例
onLoad(() => {
  track.pageView('商品详情页')
})

const handleAddCart = () => {
  track.addToCart(productId, 1)
  // 添加购物车逻辑
}
```

## 总结

微信小程序发布是一个完整的流程,涉及开发、测试、审核、发布等多个环节。本文档详细介绍了从环境准备到正式发布的完整流程,包括:

**核心流程:**

1. **前置准备** - 注册账号、安装工具、配置环境
2. **本地开发** - 开发调试、真机预览、热更新
3. **生产构建** - 代码编译、优化压缩、质量检查
4. **上传代码** - 开发者工具上传、命令行上传、CI/CD自动化
5. **版本管理** - 开发版、体验版、审核版、线上版
6. **域名配置** - 服务器域名、业务域名、SSL证书
7. **权限配置** - 用户信息、位置、相机、录音等权限
8. **审核发布** - 审核规范、用户协议、测试账号
9. **性能优化** - 包体积、加载速度、渲染性能

**最佳实践:**

- 严格遵循审核规范,避免被拒
- 做好版本管理和发布流程
- 持续优化性能和用户体验
- 建立完善的监控和错误追踪
- 保护用户隐私和数据安全

通过遵循本文档的指引,可以顺利完成微信小程序的开发、审核和发布,为用户提供高质量的小程序服务。
