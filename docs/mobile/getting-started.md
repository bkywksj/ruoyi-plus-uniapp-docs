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

```

#### 2. 在 pages.config.ts 中注册页面

```typescript
// pages.config.ts
export default {
  pages: [
    'pages/index/index',
    'pages/auth/login',
    'pages/user/profile', // 新增页面
  ],
  // ...其他配置
}
```

#### 3. 页面跳转

```typescript
// 普通跳转
uni.navigateTo({
  url: '/pages/user/profile'
})

// 重定向
uni.redirectTo({
  url: '/pages/user/profile'
})

// 返回上一页
uni.navigateBack()

// Tab 页面跳转
uni.switchTab({
  url: '/pages/index/index'
})
```

### 创建分包页面

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

      <!-- 加载更多 -->
      <wd-loading v-if="loading" />
      <view v-else-if="!hasMore" class="no-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { getUserList } from '@/api/system/user'

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

#### 2. 配置分包

```typescript
// pages.config.ts
export default {
  pages: [
    // 主包页面
    'pages/index/index',
    'pages/auth/login',
  ],

  subPackages: [
    {
      root: 'pages-sub/admin',
      pages: [
        'user/list',   // 新增分包页面
        'user/detail',
        'role/list',
      ],
    },
  ],

  // 分包预加载
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['pages-sub/admin'],
    },
  },
}
```

### 使用组合式函数

#### 创建自定义 Composable

```typescript
// src/composables/useList.ts
import { ref, reactive } from 'vue'

interface ListOptions<T> {
  fetchApi: (params: any) => Promise<{ rows: T[]; total: number }>
  pageSize?: number
}

export function useList<T>(options: ListOptions<T>) {
  const { fetchApi, pageSize = 10 } = options

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

// 页面加载时获取数据
onMounted(() => {
  refresh()
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

// 用户相关接口类型定义
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
    "source.fixAll.eslint": true
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

#### project.config.json

```json
{
  "miniprogramRoot": "./",
  "projectname": "ruoyi-plus-uniapp",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "postcss": true,
    "minified": true,
    "newFeature": true,
    "nodeModules": false
  },
  "compileType": "miniprogram",
  "condition": {}
}
```

#### 开发建议

1. **启用不校验域名**：设置 → 项目设置 → 勾选「不校验合法域名」
2. **启用 ES6 转 ES5**：设置 → 项目设置 → 勾选「ES6 转 ES5」
3. **开启增强编译**：设置 → 项目设置 → 勾选「增强编译」

### HBuilderX 配置

#### 基础设置

1. 工具 → 设置 → 编辑器设置
   - 字体大小：14px
   - Tab 大小：2
   - 保存时自动格式化：开启

2. 工具 → 插件安装
   - uni-app 编译（必装）
   - scss/sass 编译（必装）
   - eslint-plugin-vue（推荐）

#### 运行配置

1. 运行 → 运行到手机或模拟器
   - Android：连接真机或启动模拟器
   - iOS：需要 Mac 系统和 Xcode

2. 运行 → 运行到内置浏览器
   - 快速预览 H5 效果

## 🐛 常见问题排查

### 1. 依赖安装失败

**问题表现：**
```bash
Error: Unable to resolve module xxx
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
# 重新编译
pnpm build:mp-weixin

# 删除旧的编译产物
rm -rf dist/dev/mp-weixin
pnpm dev:mp-weixin
```

### 3. H5 跨域问题

**问题表现：**
```
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

方案二：后端配置 CORS
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

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

// 使用 !important 提高优先级
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

// 检查页面是否在 pages.json 中注册
// pages.config.ts
export default {
  pages: [
    'pages/user/profile', // 确保已注册
  ],
}

// 传递参数
uni.navigateTo({
  url: '/pages/user/detail?id=123&name=test',
})

// 接收参数
const props = defineProps<{
  id: string
  name: string
}>()
// 或使用 onLoad
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
// 检查环境配置
// env/.env.development
VITE_API_BASE_URL=http://localhost:8080

// 检查请求拦截器
// src/composables/useHttp.ts
const http = {
  request: async (config) => {
    // 添加 token
    const token = uni.getStorageSync('token')
    if (token) {
      config.header = {
        ...config.header,
        Authorization: `Bearer ${token}`,
      }
    }

    // 添加请求日志
    console.log('Request:', config)

    try {
      const res = await uni.request(config)
      console.log('Response:', res)
      return res.data
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },
}
```

### 7. 小程序体积过大

**问题表现：**
- 主包超过 2MB 限制
- 总包超过 20MB 限制

**解决方案：**

1. **使用分包**
```typescript
// pages.config.ts
export default {
  subPackages: [
    {
      root: 'pages-sub/admin',
      pages: ['user/list', 'role/list'],
    },
  ],
}
```

2. **图片优化**
- 使用 CDN 加载图片
- 压缩本地图片
- 使用 WebP 格式

3. **按需引入**
```typescript
// 只引入需要的组件
import { WdButton, WdIcon } from '@/wd'
```

4. **分析包体积**
```bash
# 查看构建产物大小
du -sh dist/build/mp-weixin/*
```

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
| 创建新页面 | 在 pages 目录创建 .vue 文件并注册 |
| 使用组件 | `<wd-button>` 自动导入 |
| 调用接口 | 使用 `useHttp` composable |
| 状态管理 | 使用 Pinia stores |

开始你的跨平台移动端开发之旅吧！🚀
