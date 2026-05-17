# 微信小程序发布

## 介绍

微信小程序是腾讯推出的轻量级应用形态,无需下载安装即可使用,具有接近原生应用的体验。RuoYi-Plus-UniApp 通过 UniApp 框架实现一套代码编译为微信小程序,提供完整的开发、调试、发布流程支持。本文档详细介绍从开发环境准备到正式发布上线的完整部署流程。

**核心特性:**

- **完整工具链** - 微信开发者工具集成,支持预览、调试、上传
- **多环境支持** - 开发版、体验版、正式版三个版本管理
- **快速构建** - Vite 构建工具,编译速度快,支持增量更新
- **代码优化** - 自动分包、Tree-shaking、代码压缩等优化策略
- **安全保障** - API 加密传输、权限配置、域名白名单管理
- **自动化发布** - 支持 CI/CD 自动化发布流程

## 前置准备

### 注册小程序账号

#### 1. 注册流程

1. 访问微信公众平台: https://mp.weixin.qq.com/
2. 点击"立即注册" → 选择"小程序"
3. 填写邮箱、密码、验证码
4. 邮箱激活验证
5. 选择主体类型(个人/企业/政府/媒体)
6. 主体信息登记(企业需营业执照、对公账户)
7. 管理员微信扫码验证

**注意事项:**

- 一个邮箱只能注册一个小程序
- 个人主体小程序无法开通支付功能
- 企业主体需要对公账户打款验证或微信认证(300元/年)

#### 2. 获取小程序信息

注册完成后,在小程序管理后台获取关键信息:

**开发设置 → 开发者ID:**

```text
AppID(小程序ID): wx1234567890abcdef
AppSecret(小程序密钥): a1b2c3d4e5f6789012345678901234567
```

**⚠️ 重要:**
- AppID 用于小程序身份标识,需要配置到项目中
- AppSecret 用于服务端 API 调用,务必保密,不要提交到代码仓库

### 安装微信开发者工具

#### 1. 下载安装

官方下载地址: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

**支持平台:** Windows (64位) / macOS (Intel/Apple Silicon) / Linux (Ubuntu/Debian)

**版本要求:** 稳定版(Stable),最低版本 v1.06.0+

#### 2. 登录开发者工具

1. 启动微信开发者工具
2. 使用小程序管理员/开发者微信扫码登录
3. 选择"小程序项目"

**角色权限:**

| 角色 | 开发权限 | 上传代码 | 发布体验版 | 提交审核 | 发布正式版 |
|------|---------|---------|----------|---------|----------|
| 管理员 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 开发者 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 体验者 | ❌ | ❌ | ❌ | ❌ | ❌ |

### 开发环境准备

#### 1. 安装 Node.js 和 pnpm

```bash
# 检查 Node.js 版本(需要 ≥18.0.0)
node -v

# 安装 pnpm(需要 ≥7.30)
npm install -g pnpm
```

#### 2. 克隆项目代码

```bash
git clone https://gitee.com/bkywksj/ruoyi-plus-uniapp-workflow.git
cd ruoyi-plus-uniapp-workflow/plus-app
pnpm install
```

#### 3. 配置小程序 AppID

编辑 `manifest.json` 文件:

```json
{
  "mp-weixin": {
    "appid": "wx1234567890abcdef",
    "setting": {
      "urlCheck": false,
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

#### 4. 配置环境变量

**开发环境** `env/.env.development`:

```bash
VITE_APP_ENV='development'
VITE_APP_BASE_API='http://127.0.0.1:5500'
VITE_APP_PLATFORM='mp-weixin'
VITE_DELETE_CONSOLE=false
VITE_SHOW_SOURCEMAP=true
```

**生产环境** `env/.env.production`:

```bash
VITE_APP_ENV='production'
VITE_APP_BASE_API='https://api.example.com'
VITE_APP_PLATFORM='mp-weixin'
VITE_DELETE_CONSOLE=true
VITE_SHOW_SOURCEMAP=false
```

**公共配置** `env/.env`:

```bash
VITE_APP_ID='ryplus_uni_workflow'
VITE_APP_TITLE='RuoYi-Plus'
VITE_APP_API_ENCRYPT='true'
VITE_APP_RSA_PUBLIC_KEY='MFwwDQYJKoZIhvcNAQEBBQAD...'
VITE_APP_RSA_PRIVATE_KEY='MIIBOwIBAAJBAIrZxEhzVAHK...'
```

## 本地开发

### 启动开发服务器

```bash
cd ruoyi-plus-uniapp-workflow/plus-app
pnpm dev:mp-weixin
```

**输出信息:**

```text
vite v6.3.5 building for development...
✓ built in 3.2s
小程序开发目录: dist/dev/mp-weixin
```

### 微信开发者工具导入项目

1. 打开微信开发者工具
2. 点击"+"或"导入项目"
3. 项目目录: 选择 `dist/dev/mp-weixin` 目录
4. AppID: 选择你的小程序 AppID
5. 点击"导入"

**开发者工具配置:**

详情 → 本地设置:
- ✅ 不校验合法域名、web-view、TLS版本
- ✅ 启用调试(显示 vConsole)
- ✅ 开启热重载

### 调试方式

#### 1. 模拟器调试

支持多种机型切换和场景值模拟,启动快速。

```typescript
// 查看 console 输出
console.log('调试信息', data)

// 查看页面栈
const pages = getCurrentPages()
console.log('当前页面', pages[pages.length - 1])
```

#### 2. 真机调试

1. 工具栏 → 预览 → 真机调试
2. 手机微信扫码
3. 允许调试授权

**调试技巧:**

```typescript
// 条件编译:仅小程序输出日志
// #ifdef MP-WEIXIN
console.log('微信小程序专用日志')
// #endif
```

#### 3. 预览二维码

工具栏 → 预览 → 生成预览二维码,微信扫码直接体验,无需上传代码,二维码有效期 24 小时。

### 热更新开发

Vite 构建工具支持热模块替换(HMR),修改代码后自动编译刷新。

| 修改类型 | 刷新方式 | 保留状态 |
|---------|---------|---------|
| JS/TS 逻辑 | 热更新 | ✅ 保留 |
| Vue 模板 | 热更新 | ✅ 保留 |
| CSS 样式 | 热更新 | ✅ 保留 |
| 配置文件 | 完全刷新 | ❌ 重置 |

## 生产构建

### 构建命令

```bash
pnpm build:mp-weixin
```

**构建流程:**

```text
1. 加载生产环境变量(.env.production)
2. TypeScript 类型检查
3. Vite 编译打包
4. 条件编译处理(仅保留 MP-WEIXIN 代码)
5. Tree-shaking 移除未使用代码
6. 代码压缩混淆(esbuild)
7. 移除 console 和 debugger
8. 生成构建产物(dist/build/mp-weixin)
```

### 构建产物结构

```text
dist/build/mp-weixin/
├── app.js                    # 小程序主逻辑
├── app.json                  # 小程序配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── pages/                    # 页面目录
├── components/               # 组件目录
├── static/                   # 静态资源
└── common/                   # 公共资源
    ├── vendor.js             # 第三方库
    └── runtime.js            # 运行时代码
```

### 分包配置

```json
{
  "pages": [
    "pages/index/index",
    "pages/login/index"
  ],
  "subPackages": [
    {
      "root": "pages-sub/user",
      "pages": ["profile/index", "settings/index"]
    },
    {
      "root": "pages-sub/order",
      "pages": ["list/index", "detail/index"]
    }
  ]
}
```

**分包优势:**
- 主包体积更小,首屏加载快
- 按需加载分包,节省流量
- 突破主包 2MB 限制,分包可达 20MB

### 代码质量检查

```bash
# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix
```

**构建前检查清单:**

- [ ] TypeScript 类型检查通过
- [ ] ESLint 代码检查通过
- [ ] API 接口地址正确(生产环境)
- [ ] AppID 配置正确
- [ ] console 已移除(生产环境)

## 上传代码

### 使用开发者工具上传

```bash
# 确保已完成生产构建
pnpm build:mp-weixin
```

**操作步骤:**

1. 工具栏 → 上传
2. 填写版本号(如 1.0.0)和项目备注
3. 点击"上传"
4. 等待上传成功

**版本号规范:**

```text
主版本号.次版本号.修订号

1.0.0 - 初始版本
1.1.0 - 新增功能
1.1.1 - 修复 Bug
2.0.0 - 重大更新
```

**上传限制:**

- 主包大小: ≤ 2MB
- 分包大小: 单个 ≤ 2MB
- 小程序总大小: ≤ 20MB

### 使用命令行上传

#### 1. 安装 miniprogram-ci

```bash
npm install -g miniprogram-ci
```

#### 2. 获取上传密钥

1. 小程序管理后台 → 开发设置 → 小程序代码上传密钥
2. 生成密钥 → 下载 `private.key`
3. 保存到项目根目录(不要提交到 Git)

#### 3. 创建上传脚本

创建 `scripts/upload-weixin.js`:

```javascript
const ci = require('miniprogram-ci')
const path = require('path')
const package = require('../package.json')

;(async () => {
  const project = new ci.Project({
    appid: 'wx1234567890abcdef',
    type: 'miniProgram',
    projectPath: path.resolve(__dirname, '../dist/build/mp-weixin'),
    privateKeyPath: path.resolve(__dirname, '../private.key'),
    ignores: ['node_modules/**/*'],
  })

  try {
    console.log('开始上传小程序代码...')
    const uploadResult = await ci.upload({
      project,
      version: package.version,
      desc: `版本${package.version}`,
      setting: {
        es6: true, es7: true, minify: true,
        minifyJS: true, minifyWXML: true, minifyWXSS: true,
      },
    })
    console.log('上传成功!', uploadResult.version)
  } catch (error) {
    console.error('上传失败:', error)
    process.exit(1)
  }
})()
```

#### 4. 添加上传命令

```json
{
  "scripts": {
    "upload:weixin": "node scripts/upload-weixin.js",
    "deploy:weixin": "pnpm build:mp-weixin && pnpm upload:weixin"
  }
}
```

### CI/CD 自动化上传

#### GitHub Actions

创建 `.github/workflows/deploy-weixin.yml`:

```yaml
name: 微信小程序自动部署

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g pnpm
      - run: cd plus-app && pnpm install
      - run: cd plus-app && pnpm build:mp-weixin
      - name: Upload to WeChat
        env:
          PRIVATE_KEY: ${{ secrets.WEIXIN_PRIVATE_KEY }}
        run: |
          cd plus-app
          echo "$PRIVATE_KEY" > private.key
          pnpm upload:weixin
```

**配置 Secrets:**

GitHub 仓库 → Settings → Secrets → 添加 `WEIXIN_PRIVATE_KEY`

**触发部署:**

```bash
git tag v1.0.0 && git push origin v1.0.0
```

#### GitLab CI/CD

创建 `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build-weixin:
  stage: build
  image: node:18
  script:
    - npm install -g pnpm
    - cd plus-app && pnpm install && pnpm build:mp-weixin
  artifacts:
    paths:
      - plus-app/dist/build/mp-weixin
  only:
    - tags

deploy-weixin:
  stage: deploy
  image: node:18
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

## 版本管理

### 开发版本

上传后默认的版本状态,仅开发者可见。

**使用场景:** 开发过程中的临时版本、功能测试、Bug修复验证

**管理操作:** 版本管理 → 开发版本 → 预览二维码/设为体验版/提交审核/删除

### 体验版本

供指定的体验者测试,验证功能是否正常。

**设置体验版:**

1. 版本管理 → 开发版本 → 选择版本
2. 点击"设为体验版"
3. 生成体验版二维码

**体验者管理:**

成员管理 → 添加成员 → 选择"体验者"角色 → 输入微信号

**特点:** 同时只能有一个体验版,二维码长期有效

### 审核版本

提交审核后进入审核队列,由微信官方审核。

**提交审核:**

1. 版本管理 → 开发版本 → 提交审核
2. 填写审核信息:功能页面、测试账号、权限配置、补充说明

**审核时长:**

- 一般审核: 1-3 个工作日
- 加急审核: 2-12 小时(企业每月 3 次)

**审核状态:** 审核中(可撤回) → 审核通过(可发布) / 审核拒绝(修改后重新提交)

### 线上版本

审核通过后可发布为线上版本,所有用户可见。

**发布上线:** 版本管理 → 审核通过的版本 → 发布 → 确认

**版本回退:** 版本管理 → 历史版本 → 选择稳定版本 → 回退(每月3次)

### 版本号管理

```bash
# 自动递增版本号
pnpm version patch  # 2.11.0 → 2.11.1
pnpm version minor  # 2.11.0 → 2.12.0
pnpm version major  # 2.11.0 → 3.0.0
```

## 域名配置

### 服务器域名配置

小程序只能访问配置的合法域名,需要在管理后台配置白名单。

**配置步骤:** 开发设置 → 服务器域名 → 修改

**域名类型:**

| 类型 | 用途 | 示例 |
|------|------|------|
| request 合法域名 | API 接口 | `https://api.example.com` |
| socket 合法域名 | WebSocket | `wss://ws.example.com` |
| uploadFile 合法域名 | 文件上传 | `https://upload.example.com` |
| downloadFile 合法域名 | 文件下载 | `https://cdn.example.com` |

**域名要求:**

- ✅ 必须使用 HTTPS/WSS 协议
- ✅ 必须备案(中国大陆域名)
- ✅ 不支持 IP 地址和端口号
- ✅ 每月可修改 5 次,每种类型最多 20 个域名

### 业务域名配置

如果小程序中使用 `<web-view>` 组件嵌入H5页面,需要配置业务域名。

**配置步骤:**

1. 开发设置 → 业务域名 → 添加
2. 输入域名,下载校验文件
3. 将校验文件上传到域名根目录
4. 保存

### SSL 证书配置

域名必须配置 SSL 证书才能使用 HTTPS。

**获取免费 SSL 证书:**

1. **Let's Encrypt** - 免费,90天有效期,支持自动续期
2. **阿里云 SSL 证书** - 免费,1年有效期
3. **腾讯云 SSL 证书** - 免费,1年有效期

**Nginx 配置 SSL:**

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:5500;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 权限配置

### 用户信息权限

```vue
<template>
  <button @click="getUserProfile">获取用户信息</button>
</template>

<script lang="ts" setup>
const getUserProfile = () => {
  uni.getUserProfile({
    desc: '用于完善用户资料',
    success: (res) => {
      console.log('用户信息', res.userInfo)
    },
    fail: (err) => {
      uni.showToast({ title: '获取用户信息失败', icon: 'none' })
    }
  })
}
</script>
```

### 位置权限

需要在 `manifest.json` 中声明:

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

```typescript
uni.getLocation({
  type: 'gcj02',
  success: (res) => {
    console.log('经度', res.longitude, '纬度', res.latitude)
  },
  fail: (err) => {
    if (err.errMsg.includes('auth deny')) {
      uni.showModal({
        title: '需要位置权限',
        content: '请允许访问你的位置信息',
        success: (res) => {
          if (res.confirm) uni.openSetting()
        }
      })
    }
  }
})
```

### 手机号获取

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
    // 将 code 发送到后端解密获取手机号
    uni.request({
      url: 'https://api.example.com/user/phone',
      method: 'POST',
      data: { code }
    })
  }
}
</script>
```

### 相机和相册权限

```typescript
uni.chooseImage({
  count: 1,
  sizeType: ['compressed'],
  sourceType: ['camera', 'album'],
  success: (res) => {
    const tempFilePath = res.tempFilePaths[0]
    // 上传图片
    uni.uploadFile({
      url: 'https://api.example.com/upload',
      filePath: tempFilePath,
      name: 'file'
    })
  }
})
```

## 审核规范

### 审核要点

**必须满足的条件:**

1. **功能完整** - 所有功能可正常使用,无死链接
2. **信息真实** - 小程序信息与实际功能一致
3. **内容合规** - 不涉及违法违规内容
4. **隐私保护** - 明确告知用户信息收集用途
5. **支付规范** - 使用微信支付,不跳转外部支付
6. **不诱导分享/关注** - 不强制用户分享或关注公众号

**常见拒绝原因:**

| 原因 | 解决方案 |
|------|---------|
| 功能无法使用 | 确保所有功能正常,提供可用测试账号 |
| 缺少用户协议 | 添加用户协议和隐私政策页面 |
| 诱导分享 | 移除强制分享逻辑 |
| 支付不规范 | 接入微信支付,移除第三方支付 |
| 域名未配置 | 配置服务器域名 |

### 用户协议和隐私政策

小程序必须提供完整的用户协议和隐私政策。

**创建协议页面:**

```text
pages/agreement/
├── user-agreement.vue      # 用户协议
└── privacy-policy.vue      # 隐私政策
```

**用户协议要点:**
- 服务条款的确认
- 服务内容说明
- 用户义务
- 知识产权声明
- 免责声明
- 联系方式

**隐私政策要点:**
- 信息收集(基本信息、联系方式、位置信息)
- 信息使用(服务提供、体验改善)
- 信息保护(加密传输、访问控制)
- 信息共享(明确不出售用户信息)
- 用户权利(查询、更正、删除、注销)
- 政策更新说明

**在登录页面引用:**

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
const agreeAgreement = ref(false)

const handleLogin = () => {
  if (!agreeAgreement.value) {
    uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
    return
  }
  // 执行登录逻辑
}
</script>
```

### 测试账号准备

提交审核时必须提供可用的测试账号。

**要求:**
- 可正常登录,无验证码限制
- 权限完整,可访问所有审核功能
- 数据充足,有足够的测试数据
- 长期有效(至少7天以上)

### 审核加急

企业认证小程序每月有 3 次加急机会,加急审核时长 2-12 小时。

## 性能优化

### 包体积优化

**体积限制:** 主包 ≤ 2MB,分包单个 ≤ 2MB,总包 ≤ 20MB

**优化策略:**

**1. 图片优化**

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
```

**3. 分包预加载**

```json
{
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub/user"]
    }
  }
}
```

**4. 静态资源 CDN**

大图片使用 CDN,小图标可内联 Base64。

### 加载速度优化

**1. 骨架屏**

```vue
<template>
  <view v-if="loading" class="skeleton">
    <view class="skeleton-item" />
  </view>
  <view v-else class="content">
    <!-- 实际内容 -->
  </view>
</template>
```

**2. 图片懒加载**

```vue
<image :src="item.image" mode="aspectFill" lazy-load />
```

**3. 数据预加载**

```typescript
// app.ts
export default {
  onLaunch() {
    // 预加载用户信息和配置
    this.loadUserInfo()
    this.loadConfig()
  }
}
```

### 渲染性能优化

**1. 虚拟列表**

对于长列表使用虚拟滚动,只渲染可见区域的元素。

**2. 条件渲染**

```vue
<!-- 频繁切换用 v-show -->
<view v-show="visible" class="modal">模态框</view>

<!-- 不频繁切换用 v-if -->
<view v-if="isLoggedIn" class="user-panel">用户面板</view>
```

**3. 事件节流防抖**

```typescript
// 防抖:搜索输入
const handleSearch = debounce((keyword: string) => {
  // 执行搜索
}, 500)

// 节流:滚动事件
const handleScroll = throttle((e: any) => {
  // 处理滚动
}, 200)
```

## 常见问题

### 1. 上传代码失败

**问题原因:** 网络问题、包体积超限、代码错误、权限不足

**解决方案:**

```bash
# 检查包体积
pnpm build:mp-weixin

# 清理重新构建
rm -rf dist node_modules/.vite
pnpm install && pnpm build:mp-weixin

# 确认有上传权限(管理后台 → 成员管理)
```

### 2. 真机调试白屏

**问题原因:** API 域名未配置、代码语法错误、网络请求失败

**解决方案:**

```json
// 开启 vConsole 查看错误
{
  "mp-weixin": {
    "setting": {
      "debug": true
    }
  }
}
```

- 检查域名配置(管理后台 → 服务器域名)
- 查看 vConsole → Network 失败请求

### 3. 审核被拒

**常见原因及解决:**

| 拒绝原因 | 解决方案 |
|---------|---------|
| 功能无法使用 | 检查测试账号、API域名配置 |
| 缺少用户协议 | 添加协议页面,登录时需勾选同意 |
| 诱导分享 | 移除强制分享逻辑 |
| 支付不规范 | 接入微信支付 |

**重新提交时填写修改说明:**

```text
已根据审核意见进行如下修改:
1. 添加了用户协议和隐私政策页面
2. 移除了强制分享功能
3. 提供了可用的测试账号
```

### 4. 接口请求失败

**解决方案:**

```typescript
const request = (options: any) => {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => {
        if (res.statusCode === 200) resolve(res.data)
        else reject(new Error(`HTTP ${res.statusCode}`))
      },
      fail: (err) => {
        let message = '网络请求失败'
        if (err.errMsg.includes('timeout')) message = '请求超时'
        uni.showToast({ title: message, icon: 'none' })
        reject(err)
      }
    })
  })
}
```

### 5. 本地存储数据丢失

**原因:** 超出存储限制(10MB)、用户清理缓存

**解决方案:**

```typescript
const storage = {
  set(key: string, value: any) {
    try {
      uni.setStorageSync(key, value)
      return true
    } catch (error) {
      // 存储空间不足时清理过期数据
      this.clearExpired()
      return false
    }
  },
  get(key: string, defaultValue: any = null) {
    try {
      return uni.getStorageSync(key) || defaultValue
    } catch {
      return defaultValue
    }
  }
}

// 重要数据使用服务器存储
```

### 6. 分包加载失败

**解决方案:**

```json
{
  "subPackages": [
    {
      "root": "pages-sub/user",
      "pages": ["profile/index", "settings/index"]
    }
  ]
}
```

确保分包目录存在,单个分包不超过 2MB。

### 7. 支付失败

```typescript
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
    await uni.requestPayment({
      provider: 'wxpay',
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType,
      paySign: payParams.paySign,
    })
    console.log('支付成功')
  } catch (error) {
    if (error.errMsg.includes('cancel')) {
      uni.showToast({ title: '已取消支付', icon: 'none' })
    } else {
      uni.showToast({ title: '支付失败', icon: 'none' })
    }
  }
}
```

### 8. 小程序更新失败

```typescript
// app.ts
export default {
  onLaunch() {
    this.checkUpdate()
  },

  checkUpdate() {
    const updateManager = uni.getUpdateManager()

    updateManager.onUpdateReady(() => {
      uni.showModal({
        title: '更新提示',
        content: '新版本已准备好,是否重启应用?',
        success: (res) => {
          if (res.confirm) updateManager.applyUpdate()
        }
      })
    })

    updateManager.onUpdateFailed(() => {
      uni.showModal({
        title: '更新失败',
        content: '请检查网络后重试',
        showCancel: false
      })
    })
  }
}
```

## 最佳实践

### 1. 版本发布流程

```text
1. 开发新功能 → 本地调试 → 代码Review → 合并主分支
2. 测试验证 → 构建开发版 → 设为体验版 → 团队测试
3. 发布准备 → 更新版本号 → 检查配置 → 生产构建
4. 提交审核 → 上传代码 → 填写审核信息 → 等待审核
5. 正式发布 → 发布上线 → 监控数据 → 收集反馈
```

### 2. 环境管理

```text
env/
├── .env                # 公共配置
├── .env.development    # 开发环境
├── .env.test           # 测试环境
├── .env.production     # 生产环境
```

```json
{
  "scripts": {
    "build:test": "uni build -p mp-weixin --mode test",
    "build:prod": "uni build -p mp-weixin --mode production"
  }
}
```

### 3. 代码质量保证

```bash
# 提交前检查
pnpm type-check && pnpm lint:fix && pnpm build:mp-weixin
```

### 4. 错误监控

```typescript
// app.ts
export default {
  onError(error: string) {
    console.error('全局错误', error)
    // 上报错误
    uni.request({
      url: 'https://api.example.com/log/error',
      method: 'POST',
      data: {
        message: error,
        page: getCurrentPages().pop()?.route,
        timestamp: new Date().toISOString()
      }
    })
  }
}
```

### 5. 性能监控

```typescript
const performanceMonitor = {
  pageLoad(pageName: string, startTime: number) {
    const loadTime = Date.now() - startTime
    this.report('page_load', { page: pageName, duration: loadTime })
  },
  report(event: string, data: any) {
    uni.request({
      url: 'https://api.example.com/monitor/report',
      method: 'POST',
      data: { event, data, timestamp: Date.now() }
    })
  }
}
```

### 6. 友好的错误提示

```typescript
const handleError = (error: any) => {
  const messages: Record<string, string> = {
    'NETWORK_ERROR': '网络连接失败,请检查网络',
    'TIMEOUT': '请求超时,请稍后重试',
    'UNAUTHORIZED': '登录已过期,请重新登录',
    'SERVER_ERROR': '服务器错误,请稍后重试'
  }
  uni.showToast({
    title: messages[error.code] || '操作失败',
    icon: 'none'
  })
}
```

## 总结

微信小程序发布是一个完整的流程,涉及开发、测试、审核、发布等多个环节。

**核心流程:**

1. **前置准备** - 注册账号、安装工具、配置环境
2. **本地开发** - 开发调试、真机预览、热更新
3. **生产构建** - 代码编译、优化压缩、质量检查
4. **上传代码** - 开发者工具上传、命令行上传、CI/CD自动化
5. **版本管理** - 开发版、体验版、审核版、线上版
6. **域名配置** - 服务器域名、业务域名、SSL证书
7. **权限配置** - 用户信息、位置、相机等权限
8. **审核发布** - 审核规范、用户协议、测试账号
9. **性能优化** - 包体积、加载速度、渲染性能

**最佳实践:**

- 严格遵循审核规范,避免被拒
- 做好版本管理和发布流程
- 持续优化性能和用户体验
- 建立完善的监控和错误追踪
