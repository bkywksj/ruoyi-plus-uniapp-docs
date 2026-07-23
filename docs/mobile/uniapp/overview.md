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

### 小程序平台

| 平台 | 开发命令 | 构建命令 | 状态 |
|------|---------|---------|------|
| 微信小程序 | `pnpm dev:mp-weixin` | `pnpm build:mp-weixin` | 是 主要支持 |
| 支付宝小程序 | `pnpm dev:mp-alipay` | `pnpm build:mp-alipay` | 是 支持 |
| 百度小程序 | `pnpm dev:mp-baidu` | `pnpm build:mp-baidu` | 是 支持 |
| 字节跳动小程序 | `pnpm dev:mp-toutiao` | `pnpm build:mp-toutiao` | 是 支持 |
| QQ小程序 | `pnpm dev:mp-qq` | `pnpm build:mp-qq` | 是 支持 |
| 快手小程序 | `pnpm dev:mp-kuaishou` | `pnpm build:mp-kuaishou` | 是 支持 |
| 京东小程序 | `pnpm dev:mp-jd` | `pnpm build:mp-jd` | 是 支持 |
| 小红书小程序 | `pnpm dev:mp-xhs` | `pnpm build:mp-xhs` | 是 支持 |
| 飞书小程序 | `pnpm dev:mp-lark` | `pnpm build:mp-lark` | 是 支持 |
| 鸿蒙小程序 | `pnpm dev:mp-harmony` | `pnpm build:mp-harmony` | 是 支持 |

### Web 平台

| 平台 | 开发命令 | 构建命令 | 说明 |
|------|---------|---------|------|
| H5 | `pnpm dev:h5` | `pnpm build:h5` | 移动端响应式网页 |

### App 平台

| 平台 | 开发命令 | 构建命令 | 说明 |
|------|---------|---------|------|
| App | `pnpm dev:app` | `pnpm build:app` | 同时开发 iOS + Android |
| Android | `pnpm dev:app-android` | `pnpm build:app-android` | 仅Android |
| iOS | `pnpm dev:app-ios` | `pnpm build:app-ios` | 仅iOS |
| 鸿蒙App | `pnpm dev:app-harmony` | `pnpm build:app-harmony` | 鸿蒙原生应用 |

### 快应用

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
| WebSocket | 是 | 是 | 是 |
| SSE | 是 | 否 | 是 |
| DOM操作 | 是 | 否 | 否 |
| BOM对象 | 是 | 部分 | 部分 |
| 文件系统 | 否 | 是 | 是 |

### 组件差异

| 组件 | H5 | 小程序 | App | 说明 |
|------|-----|--------|-----|------|
| view | 是 | 是 | 是 | div 标签 |
| scroll-view | 是 | 是 | 是 | 滚动区域 |
| swiper | 是 | 是 | 是 | 轮播组件 |
| video | 是 | 是 | 是 | 视频播放 |
| map | 是 | 是 | 是 | 地图组件 |
| canvas | 是 | 是 | 是 | 画布 |

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

- <Ok/> 一套代码，多端运行
- <Ok/> 完整的 Vue 3 生态支持
- <Ok/> 丰富的组件和 API
- <Ok/> 活跃的社区和插件市场
- <Ok/> DCloud 官方技术支持

### 2. 与原生小程序开发的区别？

| 对比项 | uni-app | 原生小程序 |
|--------|---------|-----------|
| 开发语言 | Vue 3 + TypeScript | 小程序专用语法 |
| 跨平台 | 是 多端 | 否 单一平台 |
| 组件库 | 丰富 | 平台限制 |
| 学习成本 | 低（Vue基础） | 中等 |
| 性能 | 接近原生 | 原生 |

### 3. uni-app 3.x 与 2.x 的区别？

- **编译器**：Vite 替代 Webpack
- **Vue 版本**：Vue 3 替代 Vue 2
- **API**：Composition API 支持
- **类型支持**：更好的 TypeScript 支持
- **性能**：启动和热更新速度提升

### 4. 开发环境配置问题

**问题**: 运行 `pnpm install` 时出错

**解决方案**:
```bash
# 1. 确保 Node.js 版本 >= 18
node -v

# 2. 确保使用 pnpm
npm install -g pnpm

# 3. 清除缓存重新安装
pnpm store prune
rm -rf node_modules
pnpm install
```

**问题**: 微信开发者工具无法打开项目

**解决方案**:
1. 确保已运行 `pnpm dev:mp-weixin`
2. 在微信开发者工具中导入 `dist/dev/mp-weixin` 目录
3. 在开发者工具设置中启用"不校验合法域名"

### 5. 跨平台兼容性问题

**问题**: 某些功能在特定平台不可用

**解决方案**: 使用条件编译处理平台差异

```vue
<template>
  <!-- #ifdef MP-WEIXIN -->
  <button open-type="share">分享</button>
  <!-- #endif -->

  <!-- #ifdef H5 -->
  <button @click="handleShare">分享</button>
  <!-- #endif -->
</template>

<script lang="ts" setup>
// #ifdef H5
const handleShare = () => {
  // H5 分享逻辑
  navigator.share?.({
    title: '分享标题',
    url: window.location.href
  })
}
// #endif
</script>
```

### 6. 性能优化建议

**小程序包体积优化**:

1. **启用分包加载**
```json
{
  "subPackages": [
    {
      "root": "pages-sub",
      "pages": [
        { "path": "detail/index" }
      ]
    }
  ]
}
```

2. **按需引入组件**
```typescript
// 仅导入需要的组件
import { WdButton, WdIcon } from '@/wd'
```

3. **使用 Tree Shaking**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      treeshake: true
    }
  }
})
```

**渲染性能优化**:

1. **使用虚拟列表处理长列表**
```vue
<template>
  <wd-paging
    v-model="list"
    :page-size="20"
    @load="loadMore"
  >
    <template #default="{ item }">
      <view class="list-item">{{ item.name }}</view>
    </template>
  </wd-paging>
</template>
```

2. **避免不必要的重渲染**
```vue
<script lang="ts" setup>
import { shallowRef, computed } from 'vue'

// 使用 shallowRef 减少深度响应
const list = shallowRef<Item[]>([])

// 使用 computed 缓存计算结果
const filteredList = computed(() =>
  list.value.filter(item => item.active)
)
</script>
```

## 最佳实践

### 1. 项目结构组织

推荐的项目目录结构：

```text
src/
├── api/                  # API 接口定义
│   ├── modules/          # 按模块分类的 API
│   └── index.ts          # API 导出入口
├── components/           # 公共组件
│   ├── business/         # 业务组件
│   └── common/           # 通用组件
├── composables/          # 组合式函数
│   ├── useAuth.ts        # 认证相关
│   ├── useHttp.ts        # 请求封装
│   └── useModal.ts       # 弹窗相关
├── layouts/              # 布局组件
├── pages/                # 主包页面
├── pages-sub/            # 分包页面
├── stores/               # Pinia 状态管理
│   ├── modules/          # 状态模块
│   └── index.ts          # Store 导出
├── styles/               # 全局样式
│   ├── variables.scss    # SCSS 变量
│   └── index.scss        # 全局样式入口
├── types/                # TypeScript 类型
├── utils/                # 工具函数
├── wd/                   # WD UI 组件库
├── App.vue               # 根组件
├── main.ts               # 应用入口
├── manifest.json         # 应用配置
├── pages.json            # 页面配置
└── uni.scss              # uni-app 主题变量
```

### 2. 组件开发规范

```vue
<template>
  <view :class="rootClass" :style="customStyle">
    <slot />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// 1. 定义属性接口
interface Props {
  /** 自定义样式 */
  customStyle?: string
  /** 自定义类名 */
  customClass?: string
  /** 是否禁用 */
  disabled?: boolean
}

// 2. 定义属性默认值
const props = withDefaults(defineProps<Props>(), {
  customStyle: '',
  customClass: '',
  disabled: false
})

// 3. 定义事件
const emit = defineEmits<{
  click: [event: Event]
}>()

// 4. 计算属性
const rootClass = computed(() => {
  return [
    'my-component',
    props.customClass,
    { 'is-disabled': props.disabled }
  ]
})
</script>

```

### 3. 状态管理规范

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.nickname || '未登录')

  // 方法
  const setToken = (newToken: string) => {
    token.value = newToken
    uni.setStorageSync('token', newToken)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
  }

  // 初始化
  const init = () => {
    const savedToken = uni.getStorageSync('token')
    if (savedToken) {
      token.value = savedToken
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    userName,
    setToken,
    setUserInfo,
    logout,
    init
  }
})
```

### 4. API 请求封装

```typescript
// api/request.ts
import { useUserStore } from '@/stores'

interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  header?: Record<string, string>
}

interface Response<T = any> {
  code: number
  msg: string
  data: T
}

const BASE_URL = import.meta.env.VITE_API_URL

export const request = <T = any>(config: RequestConfig): Promise<T> => {
  const userStore = useUserStore()

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${config.url}`,
      method: config.method || 'GET',
      data: config.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': userStore.token ? `Bearer ${userStore.token}` : '',
        ...config.header
      },
      success: (res) => {
        const response = res.data as Response<T>

        if (response.code === 200) {
          resolve(response.data)
        } else if (response.code === 401) {
          // Token 过期
          userStore.logout()
          uni.navigateTo({ url: '/pages/login/index' })
          reject(new Error('登录已过期'))
        } else {
          uni.showToast({
            title: response.msg || '请求失败',
            icon: 'none'
          })
          reject(new Error(response.msg))
        }
      },
      fail: (error) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(error)
      }
    })
  })
}
```

### 5. 条件编译最佳实践

```vue
<template>
  <view class="container">
    <!-- 平台特定的头部 -->
    <!-- #ifdef MP-WEIXIN -->
    <view class="weixin-header">
      <button open-type="getUserInfo" @getuserinfo="onGetUserInfo">
        获取用户信息
      </button>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view class="h5-header">
      <button @click="onLogin">登录</button>
    </view>
    <!-- #endif -->

    <!-- 通用内容 -->
    <view class="content">
      <slot />
    </view>
  </view>
</template>

<script lang="ts" setup>
// #ifdef MP-WEIXIN
const onGetUserInfo = (e: any) => {
  console.log('微信用户信息:', e.detail)
}
// #endif

// #ifdef H5
const onLogin = () => {
  // H5 登录逻辑
}
// #endif
</script>

```

## 调试技巧

### 1. H5 调试

```bash
# 启动开发服务器
pnpm dev:h5
```

使用浏览器开发者工具进行调试：
- 打开 Chrome DevTools (F12)
- 使用移动设备模拟器测试响应式
- 使用 Network 面板查看请求
- 使用 Console 面板查看日志

### 2. 微信小程序调试

```bash
# 启动小程序编译
pnpm dev:mp-weixin
```

调试步骤：
1. 打开微信开发者工具
2. 导入 `dist/dev/mp-weixin` 目录
3. 使用开发者工具的调试面板
4. 查看 AppData 面板了解数据状态
5. 使用远程调试功能真机调试

### 3. 日志输出

```typescript
// 使用 uni.log 兼容多平台
const log = {
  info: (...args: any[]) => {
    // #ifdef H5
    console.log(...args)
    // #endif
    // #ifndef H5
    console.log(JSON.stringify(args))
    // #endif
  },
  error: (...args: any[]) => {
    console.error(...args)
  }
}

// 使用
log.info('用户信息:', userInfo)
```

### 4. 网络请求调试

```typescript
// 开发环境启用请求日志
const DEBUG = import.meta.env.DEV

export const request = async (config: RequestConfig) => {
  if (DEBUG) {
    console.log('🚀 Request:', config.url, config.data)
  }

  try {
    const response = await doRequest(config)

    if (DEBUG) {
      console.log('✅ Response:', config.url, response)
    }

    return response
  } catch (error) {
    if (DEBUG) {
      console.error('❌ Error:', config.url, error)
    }
    throw error
  }
}
```

## 发布部署

### 1. H5 部署

```bash
# 生产构建
pnpm build:h5

# 输出目录
dist/build/h5/
```

部署到服务器：
```bash
# 使用 nginx 配置
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/dist/build/h5;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### 2. 小程序发布

```bash
# 生产构建
pnpm build:mp-weixin
```

发布流程：
1. 打开微信开发者工具
2. 导入 `dist/build/mp-weixin` 目录
3. 点击"上传"按钮
4. 填写版本号和备注
5. 在微信公众平台提交审核

### 3. App 打包

```bash
# 生产构建
pnpm build:app
```

使用 HBuilderX 打包：
1. 打开 HBuilderX
2. 导入项目
3. 发行 → 原生App-云打包
4. 配置签名证书
5. 等待打包完成

## 版本升级

### 升级 uni-app 版本

```bash
# 使用官方升级工具
pnpm uvm

# 或手动升级
pnpm add @dcloudio/uni-app@latest
```

### 升级注意事项

1. **备份项目**：升级前备份代码和依赖锁文件
2. **阅读更新日志**：了解 Breaking Changes
3. **测试功能**：升级后在各平台测试核心功能
4. **更新依赖**：同步更新相关插件和依赖

## 高级条件编译

### 条件编译语法详解

条件编译使用特定的注释标记，支持模板、脚本和样式三个区域：

```vue
<template>
  <!-- 单平台条件 -->
  <!-- #ifdef MP-WEIXIN -->
  <view>仅微信小程序显示</view>
  <!-- #endif -->

  <!-- 多平台条件（或关系） -->
  <!-- #ifdef MP-WEIXIN || MP-ALIPAY -->
  <view>微信或支付宝小程序显示</view>
  <!-- #endif -->

  <!-- 排除平台 -->
  <!-- #ifndef H5 -->
  <view>除H5外的所有平台显示</view>
  <!-- #endif -->
</template>

<script lang="ts" setup>
// 脚本区域条件编译
// #ifdef APP-PLUS
import { plus } from '@/utils/plus-api'
// #endif

// #ifdef MP-WEIXIN
const wxLogin = async () => {
  const { code } = await uni.login({ provider: 'weixin' })
  return code
}
// #endif

// #ifdef H5
const h5Login = async () => {
  // H5 登录逻辑
  return 'h5-token'
}
// #endif
</script>

<style lang="scss" scoped>
/* 样式区域条件编译 */
.container {
  padding: 20rpx;

  /* #ifdef H5 */
  max-width: 750px;
  margin: 0 auto;
  /* #endif */

  /* #ifdef MP-WEIXIN */
  background-color: #f8f8f8;
  /* #endif */
}
</style>
```

### 平台标识符完整列表

| 平台标识符 | 说明 |
|-----------|------|
| `VUE3` | HBuilderX 3.2.0+ 使用 Vue 3 |
| `APP-PLUS` | App（包含 iOS 和 Android） |
| `APP-PLUS-NVUE` | App nvue 页面 |
| `APP-ANDROID` | App Android 平台 |
| `APP-IOS` | App iOS 平台 |
| `H5` | H5 网页 |
| `MP-WEIXIN` | 微信小程序 |
| `MP-ALIPAY` | 支付宝小程序 |
| `MP-BAIDU` | 百度小程序 |
| `MP-TOUTIAO` | 字节跳动小程序 |
| `MP-QQ` | QQ 小程序 |
| `MP-KUAISHOU` | 快手小程序 |
| `MP-JD` | 京东小程序 |
| `MP-LARK` | 飞书小程序 |
| `MP-360` | 360 小程序 |
| `QUICKAPP-WEBVIEW` | 快应用 |

## 环境变量配置

### 多环境配置

项目支持开发、测试、生产等多环境配置：

```typescript
// .env.development
VITE_API_URL = 'http://localhost:8080/api'
VITE_APP_TITLE = '开发环境'
VITE_UPLOAD_URL = 'http://localhost:8080/upload'

// .env.production
VITE_API_URL = 'https://api.example.com'
VITE_APP_TITLE = '生产环境'
VITE_UPLOAD_URL = 'https://upload.example.com'
```

### 在代码中使用

```typescript
// 获取环境变量
const apiUrl = import.meta.env.VITE_API_URL
const appTitle = import.meta.env.VITE_APP_TITLE

// 判断环境
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
const mode = import.meta.env.MODE

// 条件配置
const config = {
  baseUrl: isDev ? 'http://localhost:8080' : 'https://api.example.com',
  timeout: isDev ? 30000 : 10000,
  enableLog: isDev
}
```

### 类型定义

```typescript
// src/types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_UPLOAD_URL: string
  readonly VITE_WX_APPID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 错误处理与监控

### 全局错误捕获

```typescript
// main.ts
import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)

  // 全局错误处理
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err)
    console.error('Component:', instance)
    console.error('Error Info:', info)

    // 上报错误到监控平台
    reportError({
      type: 'vue-error',
      message: String(err),
      stack: (err as Error).stack,
      info
    })
  }

  // 全局警告处理（仅开发环境）
  if (import.meta.env.DEV) {
    app.config.warnHandler = (msg, instance, trace) => {
      console.warn('Vue Warning:', msg)
    }
  }

  return { app }
}
```

### API 请求错误处理

```typescript
// composables/useRequest.ts
import { ref } from 'vue'

interface RequestState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export const useRequest = <T>(
  requestFn: () => Promise<T>
) => {
  const state = ref<RequestState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = async () => {
    state.value.loading = true
    state.value.error = null

    try {
      state.value.data = await requestFn()
    } catch (error) {
      state.value.error = error as Error

      // 统一错误提示
      uni.showToast({
        title: (error as Error).message || '请求失败',
        icon: 'none'
      })
    } finally {
      state.value.loading = false
    }
  }

  return {
    state,
    execute,
    loading: computed(() => state.value.loading),
    error: computed(() => state.value.error),
    data: computed(() => state.value.data)
  }
}
```

## 安全性考虑

### 敏感信息保护

```typescript
// 不要在代码中硬编码敏感信息
// ❌ 错误做法
const API_SECRET = 'abc123secret'

// ✅ 正确做法 - 使用环境变量
const API_SECRET = import.meta.env.VITE_API_SECRET

// Token 存储加密
import CryptoJS from 'crypto-js'

const encryptToken = (token: string): string => {
  const secretKey = import.meta.env.VITE_ENCRYPT_KEY
  return CryptoJS.AES.encrypt(token, secretKey).toString()
}

const decryptToken = (encryptedToken: string): string => {
  const secretKey = import.meta.env.VITE_ENCRYPT_KEY
  const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey)
  return bytes.toString(CryptoJS.enc.Utf8)
}
```

### XSS 防护

```vue
<template>
  <!-- 使用 v-text 而非 v-html 渲染用户内容 -->
  <view v-text="userContent" />

  <!-- 如需渲染 HTML，必须先消毒 -->
  <rich-text :nodes="sanitizedHtml" />
</template>

<script lang="ts" setup>
import DOMPurify from 'dompurify'

const userContent = ref('')
const rawHtml = ref('')

const sanitizedHtml = computed(() => {
  return DOMPurify.sanitize(rawHtml.value)
})
</script>
```

### 请求签名验证

```typescript
// utils/sign.ts
import CryptoJS from 'crypto-js'

export const generateSign = (params: Record<string, any>): string => {
  // 按 key 排序
  const sortedKeys = Object.keys(params).sort()

  // 拼接参数
  const signStr = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&')

  // 添加密钥并生成签名
  const secret = import.meta.env.VITE_SIGN_SECRET
  return CryptoJS.MD5(signStr + secret).toString()
}

// 使用示例
const params = { userId: 123, timestamp: Date.now() }
const sign = generateSign(params)

request({
  url: '/api/user/info',
  data: { ...params, sign }
})
```

## 多语言支持

### i18n 配置

```typescript
// locales/index.ts
import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

const i18n = createI18n({
  legacy: false,
  locale: uni.getStorageSync('language') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

export default i18n
```

### 在组件中使用

```vue
<template>
  <view class="page">
    <text>{{ t('common.welcome') }}</text>
    <wd-button @click="changeLanguage">
      {{ t('common.switchLang') }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const changeLanguage = () => {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  uni.setStorageSync('language', locale.value)
}
</script>
```

## 测试策略

### 单元测试配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
})
```

### 编写组件测试

```typescript
// components/__tests__/MyButton.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyButton from '../MyButton.vue'

describe('MyButton', () => {
  it('渲染正确的文本', () => {
    const wrapper = mount(MyButton, {
      props: { text: '点击我' }
    })
    expect(wrapper.text()).toContain('点击我')
  })

  it('点击时触发事件', async () => {
    const wrapper = mount(MyButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('禁用状态不触发事件', async () => {
    const wrapper = mount(MyButton, {
      props: { disabled: true }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
```

### 端到端测试

```typescript
// e2e/login.spec.ts
describe('登录流程', () => {
  it('成功登录后跳转首页', () => {
    // 访问登录页
    cy.visit('/pages/login/index')

    // 输入账号密码
    cy.get('[data-testid="username"]').type('admin')
    cy.get('[data-testid="password"]').type('123456')

    // 点击登录
    cy.get('[data-testid="login-btn"]').click()

    // 验证跳转到首页
    cy.url().should('include', '/pages/index/index')
  })
})
