# 分包页面管理

## 介绍

分包是 UniApp 优化小程序体积的重要手段，将非首屏页面拆分到独立的分包中，实现按需加载，提升首次启动速度。

**核心特性:**

- **按需加载** - 分包页面仅在访问时才会下载，减少首次启动加载时间
- **体积优化** - 将主包控制在限制范围内（微信主包 2MB），避免包体积超限
- **模块隔离** - 按业务模块划分分包，降低代码耦合度，便于团队协作开发
- **预加载支持** - 配置分包预加载规则，提前加载高频访问的分包
- **独立分包** - 支持独立运行的分包，适合营销活动等独立场景
- **插件集成** - 与 UniPages 插件深度集成，自动生成分包配置

## 分包概述

### 为什么需要分包

| 问题 | 分包解决方案 |
|------|-------------|
| 小程序包体积限制（微信主包 2MB） | 将页面拆分到不同分包 |
| 首次加载时间长 | 主包精简，分包按需加载 |
| 功能模块耦合 | 按业务模块划分分包 |
| 团队协作困难 | 分包独立开发，降低冲突 |
| 热更新范围大 | 仅更新变更的分包 |

### 分包规则

- **主包**：包含启动页、Tabbar 页面、公共资源
- **分包**：包含非首屏的业务页面
- **独立分包**：可独立运行，不依赖主包

### 体积限制

| 平台 | 主包限制 | 单个分包限制 | 总包限制 |
|------|---------|-------------|---------|
| 微信小程序 | 2MB | 2MB | 20MB |
| 支付宝小程序 | 2MB | 2MB | 8MB |
| 百度小程序 | 2MB | 2MB | 8MB |
| 抖音小程序 | 2MB | 2MB | 16MB |
| QQ小程序 | 2MB | 2MB | 20MB |
| 快手小程序 | 2MB | 2MB | 16MB |

### 分包类型对比

| 特性 | 普通分包 | 独立分包 |
|------|---------|---------|
| 依赖主包 | 是 | 否 |
| 首次加载主包 | 必须 | 可跳过 |
| 使用主包组件 | 可以 | 不可以 |
| 使用主包样式 | 可以 | 不可以 |
| 适用场景 | 业务模块 | 营销活动、独立H5 |

## 目录结构

```
src/
├── pages/                    # 主包页面
│   ├── index/
│   │   └── index.vue        # 首页（Tabbar容器）
│   ├── auth/
│   │   ├── auth.vue         # 授权页
│   │   ├── login.vue        # 登录页
│   │   ├── phoneLogin.vue   # 手机登录
│   │   ├── register.vue     # 注册页
│   │   └── smsVerify.vue    # 短信验证
│   └── my/
│       └── settings.vue     # 设置页
├── pages-sub/               # 分包目录
│   ├── admin/              # 管理模块分包
│   │   └── user/
│   │       └── user.vue    # 用户管理
│   ├── mall/               # 商城模块分包
│   │   ├── goods/
│   │   │   ├── list.vue    # 商品列表
│   │   │   └── detail.vue  # 商品详情
│   │   └── order/
│   │       ├── list.vue    # 订单列表
│   │       └── detail.vue  # 订单详情
│   ├── workflow/           # 工作流模块分包
│   │   ├── task/
│   │   │   └── list.vue    # 任务列表
│   │   └── process/
│   │       └── detail.vue  # 流程详情
│   └── activity/           # 活动分包（独立分包）
│       ├── index.vue       # 活动首页
│       └── static/         # 分包静态资源
│           └── images/
└── components/              # 公共组件（打入主包）
```

## UniPages 插件配置

项目使用 `@uni-helper/vite-plugin-uni-pages` 插件自动管理分包配置，简化页面路由配置流程。

### 插件安装

```bash
pnpm add @uni-helper/vite-plugin-uni-pages -D
```

### 插件配置

```typescript
// vite/plugins/uni-pages.ts
import UniPages from '@uni-helper/vite-plugin-uni-pages'

export default (mode: string) => {
  return UniPages({
    // 直接设置主页
    homePage: 'pages/index/index',

    // 排除的组件路径
    exclude: ['**/components/**/**.*'],

    // 页面可以使用route块配置路由
    routeBlockLang: 'json5',

    // 分包配置 - pages 目录为 src/pages，分包目录不能配置在pages目录下
    subPackages: [
      // 管理员相关页面分包
      'src/pages-sub/admin',

      // 商城模块分包
      'src/pages-sub/mall',

      // 可以通过下面的方式根据环境条件加载对应分包
      ...(mode === 'production' ? [] : ['src/pages-sub/demo']),
    ],

    // 生成类型定义文件
    dts: 'src/types/uni-pages.d.ts',

    // 页面元数据处理钩子
    onAfterMergePageMetaData(ctx) {
      // 处理主包页面 - 设置默认 layout
      ctx.pageMetaData.forEach((page) => {
        page.layout = 'default'
      })

      // 处理分包页面
      if (ctx.subPageMetaData) {
        ctx.subPageMetaData.forEach((subPackage) => {
          subPackage.pages.forEach((page) => {
            page.layout = 'default'

            // 根据分包根目录设置不同的 layout
            if (subPackage.root === 'pages-sub/admin') {
              page.layout = 'default'
            }
          })
        })
      }
    },
  })
}
```

### 配置说明

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `homePage` | `string` | 首页路径 |
| `exclude` | `string[]` | 排除的文件路径模式 |
| `routeBlockLang` | `string` | 路由块语言（json5/yaml） |
| `subPackages` | `string[]` | 分包目录列表 |
| `dts` | `string` | 类型定义输出路径 |
| `onAfterMergePageMetaData` | `function` | 页面元数据处理钩子 |

### Vite 配置集成

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import UniPages from './vite/plugins/uni-pages'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      UniPages(mode),
      uni(),
    ],
  }
})
```

## pages.json 配置

### 基础配置结构

```json
{
  "globalStyle": {
    "navigationBarTitleText": "ryplus-uni",
    "navigationStyle": "custom",
    "mp-alipay": {
      "transparentTitle": "always",
      "titlePenetrate": "YES"
    },
    "h5": {
      "titleNView": false
    },
    "app-plus": {
      "bounce": "none"
    }
  },
  "easycom": {
    "autoscan": true,
    "custom": {
      "^wd-(.*)": "@/wd/components/wd-$1/wd-$1.vue"
    }
  },
  "pages": [
    {
      "path": "pages/index/index",
      "type": "home",
      "layout": "default"
    },
    {
      "path": "pages/auth/auth",
      "type": "page",
      "layout": "default"
    },
    {
      "path": "pages/auth/login",
      "type": "page",
      "layout": "default"
    },
    {
      "path": "pages/auth/phoneLogin",
      "type": "page",
      "layout": "default"
    },
    {
      "path": "pages/auth/register",
      "type": "page",
      "layout": "default"
    },
    {
      "path": "pages/auth/smsVerify",
      "type": "page",
      "layout": "default"
    },
    {
      "path": "pages/my/settings",
      "type": "page",
      "layout": "default"
    }
  ],
  "subPackages": [
    {
      "root": "pages-sub/admin",
      "pages": [
        {
          "path": "user/user",
          "type": "page",
          "layout": "default"
        }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub/mall"]
    }
  }
}
```

### 配置项说明

| 配置项 | 说明 |
|--------|------|
| `root` | 分包根目录 |
| `pages` | 分包内的页面列表 |
| `independent` | 是否为独立分包 |
| `preloadRule` | 分包预加载规则 |

### 页面配置属性

```json
{
  "path": "goods/list",
  "type": "page",
  "layout": "default",
  "style": {
    "navigationBarTitleText": "商品列表",
    "enablePullDownRefresh": true,
    "backgroundTextStyle": "dark"
  }
}
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `path` | `string` | 页面路径（不带.vue后缀） |
| `type` | `string` | 页面类型（home/page） |
| `layout` | `string` | 布局名称 |
| `style` | `object` | 页面样式配置 |

## 路由工具函数

项目提供了路由工具函数，方便处理分包页面跳转和路由解析。

### 基础路由工具

```typescript
// src/utils/route.ts
import pagesConfig from '@/pages.json'

// 从 pages.json 配置中解构出页面配置、分包配置和底部导航配置
const { pages, subPackages, tabBar = { list: [] } } = { ...pagesConfig }

/**
 * 获取当前页面栈中的最后一个页面（即当前页面）
 */
export const getCurrentPage = () => {
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}

// 导出底部导航栏配置列表
export const tabBarList = tabBar?.list || []

/**
 * 判断当前页面是否是 tabBar 页面
 */
export const isCurrentTabBarPage = () => {
  try {
    const lastPage = getCurrentPage()
    const currPath = lastPage?.route
    return Boolean(tabBar?.list?.some((item) => item.pagePath === currPath))
  } catch {
    return false
  }
}

/**
 * 判断指定页面路径是否是 tabBar 页面
 */
export const isTabBarPage = (path: string) => {
  if (!tabBar || !tabBar.list.length) {
    return false
  }

  // 处理路径格式：移除开头的 '/' 字符
  if (path.startsWith('/')) {
    path = path.substring(1)
  }

  return !!tabBar.list.find((e) => e.pagePath === path)
}
```

### URL 解析工具

```typescript
/**
 * 递归解码 URL 编码的字符串
 * 确保完全解码多层编码的 URL 参数
 */
const fullyDecodeUrl = (url: string) => {
  if (url.startsWith('%')) {
    return fullyDecodeUrl(decodeURIComponent(url))
  }
  return url
}

/**
 * 解析 URL 字符串，提取路径和查询参数
 * @example
 * parseUrl('/pages/auth/login?redirect=%2Fpages%2Fdemo')
 * // { path: '/pages/auth/login', query: { redirect: '/pages/demo' } }
 */
export const parseUrl = (url: string) => {
  const [path, queryStr] = url.split('?')

  if (!queryStr) {
    return { path, query: {} }
  }

  const query: Record<string, string> = {}
  queryStr.split('&').forEach((item) => {
    const [key, value] = item.split('=')
    query[key] = fullyDecodeUrl(value)
  })

  return { path, query }
}

/**
 * 获取当前页面的完整路由信息
 */
export const getCurrentRoute = () => {
  const lastPage = getCurrentPage()
  const currRoute = (lastPage as any).$page
  const { fullPath } = currRoute as { fullPath: string }
  return parseUrl(fullPath)
}
```

### 分包页面跳转封装

```typescript
// utils/navigate.ts

/**
 * 分包导航工具
 * 封装分包页面跳转，提供类型安全的导航方法
 */
export const subNavigate = {
  // 管理模块
  admin: {
    user: () => uni.navigateTo({ url: '/pages-sub/admin/user/user' }),
    role: () => uni.navigateTo({ url: '/pages-sub/admin/role/role' }),
    dept: () => uni.navigateTo({ url: '/pages-sub/admin/dept/dept' }),
    menu: () => uni.navigateTo({ url: '/pages-sub/admin/menu/menu' }),
  },

  // 商城模块
  mall: {
    goodsList: () => uni.navigateTo({ url: '/pages-sub/mall/goods/list' }),
    goodsDetail: (id: number | string) => uni.navigateTo({
      url: `/pages-sub/mall/goods/detail?id=${id}`
    }),
    orderList: () => uni.navigateTo({ url: '/pages-sub/mall/order/list' }),
    orderDetail: (id: string) => uni.navigateTo({
      url: `/pages-sub/mall/order/detail?id=${id}`
    }),
    cart: () => uni.navigateTo({ url: '/pages-sub/mall/cart/cart' }),
    checkout: (goodsIds: string) => uni.navigateTo({
      url: `/pages-sub/mall/order/checkout?ids=${goodsIds}`
    }),
  },

  // 工作流模块
  workflow: {
    taskList: () => uni.navigateTo({ url: '/pages-sub/workflow/task/list' }),
    taskDetail: (id: string) => uni.navigateTo({
      url: `/pages-sub/workflow/task/detail?id=${id}`
    }),
    processDetail: (id: string) => uni.navigateTo({
      url: `/pages-sub/workflow/process/detail?id=${id}`
    }),
    processStart: (key: string) => uni.navigateTo({
      url: `/pages-sub/workflow/process/start?key=${key}`
    }),
  },

  // 活动模块（独立分包）
  activity: {
    index: () => uni.navigateTo({ url: '/pages-sub/activity/index' }),
    detail: (id: string) => uni.navigateTo({
      url: `/pages-sub/activity/detail?id=${id}`
    }),
  }
}

// 使用示例
// import { subNavigate } from '@/utils/navigate'
// subNavigate.mall.goodsDetail(123)
// subNavigate.workflow.taskList()
```

### 类型安全的路由跳转

```typescript
// types/route.ts

/** 分包路由类型定义 */
export interface SubPackageRoutes {
  admin: {
    user: string
    role: string
    dept: string
    menu: string
  }
  mall: {
    goodsList: string
    goodsDetail: string
    orderList: string
    orderDetail: string
    cart: string
    checkout: string
  }
  workflow: {
    taskList: string
    taskDetail: string
    processDetail: string
    processStart: string
  }
  activity: {
    index: string
    detail: string
  }
}

/** 分包路由常量 */
export const SUB_ROUTES: SubPackageRoutes = {
  admin: {
    user: '/pages-sub/admin/user/user',
    role: '/pages-sub/admin/role/role',
    dept: '/pages-sub/admin/dept/dept',
    menu: '/pages-sub/admin/menu/menu',
  },
  mall: {
    goodsList: '/pages-sub/mall/goods/list',
    goodsDetail: '/pages-sub/mall/goods/detail',
    orderList: '/pages-sub/mall/order/list',
    orderDetail: '/pages-sub/mall/order/detail',
    cart: '/pages-sub/mall/cart/cart',
    checkout: '/pages-sub/mall/order/checkout',
  },
  workflow: {
    taskList: '/pages-sub/workflow/task/list',
    taskDetail: '/pages-sub/workflow/task/detail',
    processDetail: '/pages-sub/workflow/process/detail',
    processStart: '/pages-sub/workflow/process/start',
  },
  activity: {
    index: '/pages-sub/activity/index',
    detail: '/pages-sub/activity/detail',
  },
}

/**
 * 带参数的路由跳转
 */
export const navigateToWithParams = (
  path: string,
  params?: Record<string, string | number>
) => {
  let url = path
  if (params && Object.keys(params).length > 0) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&')
    url = `${path}?${queryString}`
  }
  return uni.navigateTo({ url })
}
```

## 分包预加载

### 配置预加载

```json
{
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub/mall"]
    },
    "pages/my/settings": {
      "network": "wifi",
      "packages": ["pages-sub/admin"]
    }
  }
}
```

### 预加载参数

| 参数 | 说明 | 可选值 |
|------|------|--------|
| `network` | 网络条件 | `all`（所有网络）、`wifi`（仅WiFi） |
| `packages` | 预加载的分包列表 | 分包 root 数组 |

### 预加载策略

```
用户行为预测流程:
首页加载 → 预加载商城分包 → 用户点击商品 → 秒开详情页
设置页加载 → WiFi下预加载管理分包 → 用户进入管理 → 无需等待
```

### 动态预加载

```typescript
/**
 * 动态预加载分包
 * 根据用户行为动态加载可能访问的分包
 */
export const preloadSubPackage = (packages: string[]) => {
  // #ifdef MP-WEIXIN
  packages.forEach(pkg => {
    wx.preloadSubPackage({
      name: pkg,
      complete: () => {
        console.log(`分包 ${pkg} 预加载完成`)
      }
    })
  })
  // #endif
}

// 使用示例 - 用户查看商品时预加载订单分包
const onGoodsView = () => {
  preloadSubPackage(['pages-sub/mall'])
}
```

## 创建分包页面

### 步骤一：创建目录和文件

```bash
# 创建分包目录
mkdir -p src/pages-sub/mall/goods

# 创建页面文件
touch src/pages-sub/mall/goods/detail.vue
```

### 步骤二：编写页面代码

```vue
<!-- pages-sub/mall/goods/detail.vue -->
<template>
  <view class="goods-detail">
    <wd-navbar title="商品详情" show-back />

    <view v-if="loading" class="loading">
      <wd-loading />
    </view>

    <view v-else class="content">
      <!-- 商品图片轮播 -->
      <wd-swiper :list="goods.images" />

      <!-- 商品信息 -->
      <view class="info">
        <view class="price">
          <text class="current">¥{{ goods.price }}</text>
          <text class="original">¥{{ goods.originalPrice }}</text>
        </view>
        <view class="title">{{ goods.title }}</view>
        <view class="desc">{{ goods.description }}</view>
      </view>

      <!-- 规格选择 -->
      <view class="specs" @click="showSpecPopup = true">
        <wd-cell title="规格" is-link :value="selectedSpec || '请选择规格'" />
      </view>

      <!-- 购买栏 -->
      <view class="buy-bar safe-area-bottom">
        <wd-button type="warning" @click="addToCart">加入购物车</wd-button>
        <wd-button type="primary" @click="buyNow">立即购买</wd-button>
      </view>
    </view>

    <!-- 规格弹窗 -->
    <wd-popup v-model="showSpecPopup" position="bottom" round>
      <view class="spec-popup">
        <view class="spec-header">
          <text>选择规格</text>
          <wd-icon name="close" @click="showSpecPopup = false" />
        </view>
        <view class="spec-list">
          <view
            v-for="spec in goods.specs"
            :key="spec.id"
            class="spec-item"
            :class="{ active: selectedSpec === spec.name }"
            @click="selectSpec(spec)"
          >
            {{ spec.name }}
          </view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { getGoodsDetail } from '@/api/mall/goods'
import { useToast } from '@/wd'

const props = defineProps<{
  id: string
}>()

const toast = useToast()
const loading = ref(true)
const goods = ref<any>({})
const showSpecPopup = ref(false)
const selectedSpec = ref('')

const loadGoodsDetail = async () => {
  loading.value = true
  const [err, data] = await getGoodsDetail(props.id)
  loading.value = false

  if (!err) {
    goods.value = data
  } else {
    toast.error('加载失败')
  }
}

const selectSpec = (spec: any) => {
  selectedSpec.value = spec.name
  showSpecPopup.value = false
}

const addToCart = () => {
  if (!selectedSpec.value) {
    toast.info('请选择规格')
    return
  }
  toast.success('已加入购物车')
}

const buyNow = () => {
  if (!selectedSpec.value) {
    toast.info('请选择规格')
    return
  }
  uni.navigateTo({
    url: `/pages-sub/mall/order/confirm?goodsId=${props.id}&spec=${selectedSpec.value}`
  })
}

onMounted(() => {
  loadGoodsDetail()
})
</script>

<style lang="scss" scoped>
.goods-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.info {
  background: #fff;
  padding: 24rpx;
  margin-top: 20rpx;

  .price {
    .current {
      font-size: 48rpx;
      color: #ff4d4f;
      font-weight: bold;
    }
    .original {
      font-size: 28rpx;
      color: #999;
      text-decoration: line-through;
      margin-left: 16rpx;
    }
  }

  .title {
    font-size: 32rpx;
    font-weight: 500;
    margin-top: 16rpx;
    line-height: 1.4;
  }

  .desc {
    font-size: 26rpx;
    color: #666;
    margin-top: 12rpx;
    line-height: 1.5;
  }
}

.specs {
  margin-top: 20rpx;
}

.buy-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx;
  background: #fff;
  gap: 20rpx;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
}

.spec-popup {
  padding: 32rpx;

  .spec-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
    font-size: 32rpx;
    font-weight: 500;
  }

  .spec-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }

  .spec-item {
    padding: 16rpx 32rpx;
    border: 2rpx solid #eee;
    border-radius: 8rpx;
    font-size: 28rpx;

    &.active {
      border-color: var(--wd-color-primary);
      color: var(--wd-color-primary);
      background: rgba(var(--wd-color-primary-rgb), 0.1);
    }
  }
}
</style>
```

### 步骤三：注册页面

使用 UniPages 插件时，页面会自动注册。如果需要手动配置：

```json
// pages.json
{
  "subPackages": [
    {
      "root": "pages-sub/mall",
      "pages": [
        {
          "path": "goods/detail",
          "type": "page",
          "layout": "default",
          "style": {
            "navigationBarTitleText": "商品详情"
          }
        }
      ]
    }
  ]
}
```

## 分包内资源管理

### 组件引用规则

```vue
<!-- 分包页面可以引用主包组件 -->
<script lang="ts" setup>
// 引用主包公共组件（自动通过 easycom 注册）
// <wd-button> <wd-cell> 等 WD UI 组件

// 引用主包业务组件
import PageHeader from '@/components/PageHeader.vue'

// 引用分包内组件（相对路径）
import GoodsCard from '../components/goods-card.vue'
</script>
```

### 静态资源组织

```
pages-sub/
└── mall/
    ├── goods/
    │   └── detail.vue
    ├── components/           # 分包私有组件
    │   ├── goods-card.vue
    │   └── price-tag.vue
    └── static/               # 分包静态资源
        ├── images/
        │   ├── empty.png
        │   └── banner.png
        └── icons/
            └── cart.svg
```

### 资源引用方式

```vue
<template>
  <!-- 引用分包内静态资源（相对路径或绝对路径） -->
  <image src="/pages-sub/mall/static/images/empty.png" />

  <!-- 引用主包静态资源 -->
  <image src="/static/images/logo.png" />

  <!-- 使用网络资源（推荐，减少包体积） -->
  <image src="https://cdn.example.com/images/banner.png" />
</template>

<style lang="scss" scoped>
.banner {
  /* SCSS 中引用分包资源 */
  background-image: url('/pages-sub/mall/static/images/banner.png');
}
</style>
```

### 分包组件共享策略

```typescript
// 策略一：将公共组件放到主包
// src/components/common/goods-card.vue
// 所有分包都可以通过 easycom 使用

// 策略二：分包内复制组件
// pages-sub/mall/components/goods-card.vue
// pages-sub/activity/components/goods-card.vue

// 策略三：使用分包异步化共享组件（微信小程序）
// 需要配置 bigPackageSizeSupport: true
```

## 独立分包

独立分包可以独立于主包运行，适合营销活动页面等场景。

### 配置独立分包

```json
{
  "subPackages": [
    {
      "root": "pages-sub/activity",
      "independent": true,
      "pages": [
        {
          "path": "index",
          "type": "page",
          "style": {
            "navigationBarTitleText": "活动专区"
          }
        }
      ]
    }
  ]
}
```

### 独立分包限制

| 限制项 | 说明 |
|--------|------|
| JS 引用 | 不能引用主包的 JS 文件 |
| 组件引用 | 不能引用主包的组件 |
| 全局样式 | 不能使用主包的全局样式 |
| App.vue | 不会执行主包的 App.vue 生命周期 |
| 全局状态 | 不能直接使用主包的 Pinia store |
| 插件 | 需要在分包内重新初始化插件 |

### 独立分包示例

```vue
<!-- pages-sub/activity/index.vue -->
<template>
  <view class="activity-page">
    <!-- 独立分包需要自己的导航栏 -->
    <view class="nav-bar">
      <text class="title">限时特惠</text>
    </view>

    <image class="banner" src="./static/banner.png" />

    <view class="content">
      <view class="countdown">
        <text>距离结束还有: {{ countdown }}</text>
      </view>

      <view class="goods-list">
        <view
          v-for="item in goodsList"
          :key="item.id"
          class="goods-item"
          @click="viewDetail(item)"
        >
          <image :src="item.image" />
          <view class="info">
            <text class="name">{{ item.name }}</text>
            <text class="price">¥{{ item.price }}</text>
          </view>
        </view>
      </view>
    </view>

    <button class="enter-btn" @click="goToMain">进入主程序</button>
  </view>
</template>

<script lang="ts" setup>
// 独立分包需要独立的数据获取逻辑
const goodsList = ref<any[]>([])
const countdown = ref('00:00:00')

// 独立分包内的请求配置
const request = (url: string, options?: any) => {
  return uni.request({
    url: `https://api.example.com${url}`,
    ...options,
  })
}

const loadData = async () => {
  const [err, res] = await uni.request({
    url: 'https://api.example.com/activity/goods',
  })
  if (!err && res.data) {
    goodsList.value = res.data.list
  }
}

const viewDetail = (item: any) => {
  // 跳转到主程序的商品详情
  uni.navigateTo({
    url: `/pages-sub/mall/goods/detail?id=${item.id}`
  })
}

const goToMain = () => {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

// 倒计时逻辑
let timer: number
const startCountdown = () => {
  const endTime = new Date().getTime() + 24 * 60 * 60 * 1000

  timer = setInterval(() => {
    const now = new Date().getTime()
    const diff = endTime - now

    if (diff <= 0) {
      clearInterval(timer)
      countdown.value = '活动已结束'
      return
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    countdown.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, 1000)
}

onMounted(() => {
  loadData()
  startCountdown()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
/* 独立分包需要完整的独立样式 */
.activity-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #ff6b6b, #ffa502);
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: env(safe-area-inset-top);
}

.nav-bar .title {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
}

.banner {
  width: 100%;
  height: 300rpx;
}

.content {
  padding: 32rpx;
}

.countdown {
  text-align: center;
  font-size: 32rpx;
  color: #fff;
  margin-bottom: 32rpx;
}

.goods-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.goods-item {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.goods-item image {
  width: 100%;
  height: 200rpx;
}

.goods-item .info {
  padding: 16rpx;
}

.goods-item .name {
  font-size: 28rpx;
  color: #333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-item .price {
  font-size: 32rpx;
  color: #ff4d4f;
  font-weight: bold;
  margin-top: 8rpx;
  display: block;
}

.enter-btn {
  position: fixed;
  bottom: 40rpx;
  left: 32rpx;
  right: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: #fff;
  color: #ff6b6b;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
```

## 分包优化策略

### 1. 合理划分分包

```
推荐的分包划分原则：

按业务模块划分：
├── pages-sub/admin/      # 管理后台（低频，不预加载）
├── pages-sub/mall/       # 商城模块（高频，预加载）
├── pages-sub/workflow/   # 工作流（按需）
├── pages-sub/user/       # 用户中心（中频）
└── pages-sub/activity/   # 活动页（独立分包）

按访问频率划分：
├── 主包：首页、登录、核心功能
├── 高频分包：配置预加载
└── 低频分包：按需加载
```

### 2. 减小分包体积

```typescript
// ❌ 不推荐：在分包页面引入完整的大型库
import _ from 'lodash'
import dayjs from 'dayjs'
import { Chart } from 'echarts'

// ✅ 推荐：按需引入
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

// ✅ 推荐：使用轻量替代方案
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// ✅ 推荐：动态导入（代码分割）
const loadEcharts = async () => {
  const { Chart } = await import('echarts')
  return Chart
}
```

### 3. 图片资源优化

```vue
<template>
  <!-- ✅ 使用网络图片减少包体积 -->
  <image src="https://cdn.example.com/images/banner.png" />

  <!-- ✅ 小图标使用 base64 -->
  <image :src="iconBase64" />

  <!-- ✅ 使用 webp 格式 -->
  <image src="https://cdn.example.com/images/banner.webp" />

  <!-- ✅ 懒加载图片 -->
  <image :src="imageSrc" lazy-load />
</template>

<script setup>
// 小图标转 base64
const iconBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0i...'

// 图片懒加载
const imageSrc = ref('')
onMounted(() => {
  // 延迟加载非关键图片
  setTimeout(() => {
    imageSrc.value = 'https://cdn.example.com/images/large.png'
  }, 100)
})
</script>
```

### 4. 代码分析

```bash
# 使用 uni-app 构建分析
npm run build:mp-weixin -- --report

# 查看各分包体积
ls -la dist/build/mp-weixin/pages-sub/

# 使用微信开发者工具查看
# 详情 -> 本地设置 -> 上传代码时自动压缩
# 详情 -> 代码依赖分析
```

### 5. 分包体积监控

```typescript
// scripts/check-size.ts
import fs from 'fs'
import path from 'path'

const LIMITS = {
  main: 2 * 1024 * 1024,  // 2MB
  sub: 2 * 1024 * 1024,   // 2MB
  total: 20 * 1024 * 1024 // 20MB
}

const checkPackageSize = () => {
  const distPath = path.resolve('dist/build/mp-weixin')

  // 检查主包大小
  const mainSize = getDirectorySize(distPath, ['pages-sub'])
  console.log(`主包大小: ${formatSize(mainSize)}`)

  if (mainSize > LIMITS.main) {
    console.error('❌ 主包超过限制!')
    process.exit(1)
  }

  // 检查分包大小
  const subPath = path.join(distPath, 'pages-sub')
  if (fs.existsSync(subPath)) {
    const subs = fs.readdirSync(subPath)
    subs.forEach(sub => {
      const size = getDirectorySize(path.join(subPath, sub))
      console.log(`分包 ${sub}: ${formatSize(size)}`)

      if (size > LIMITS.sub) {
        console.error(`❌ 分包 ${sub} 超过限制!`)
        process.exit(1)
      }
    })
  }

  console.log('✅ 所有分包体积检查通过')
}

const getDirectorySize = (dir: string, excludes: string[] = []): number => {
  let size = 0
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    if (excludes.includes(file)) return

    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      size += getDirectorySize(filePath)
    } else {
      size += stat.size
    }
  })

  return size
}

const formatSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024
    index++
  }
  return `${bytes.toFixed(2)} ${units[index]}`
}

checkPackageSize()
```

## 平台差异处理

### 各平台分包特性对比

| 特性 | 微信 | 支付宝 | 百度 | 抖音 | QQ |
|------|------|--------|------|------|-----|
| 独立分包 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 分包预加载 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 分包异步化 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 懒加载组件 | ✅ | ❌ | ❌ | ❌ | ❌ |

### 条件编译处理

```vue
<script lang="ts" setup>
// 分包预加载 - 仅微信小程序支持 API
const preloadPackage = (name: string) => {
  // #ifdef MP-WEIXIN
  wx.preloadSubPackage({
    name,
    success: () => console.log('预加载成功'),
    fail: (err) => console.error('预加载失败', err)
  })
  // #endif

  // #ifdef MP-ALIPAY
  // 支付宝使用不同的 API
  my.preloadSubPackage({
    name,
    success: () => console.log('预加载成功'),
    fail: (err) => console.error('预加载失败', err)
  })
  // #endif
}

// H5 不需要分包逻辑
// #ifdef H5
const isH5 = true
// #endif
</script>
```

### manifest.json 平台配置

```typescript
// manifest.config.ts
export default defineManifestConfig({
  /* 微信小程序配置 */
  'mp-weixin': {
    appid: VITE_WECHAT_MINI_APP_ID,
    setting: {
      urlCheck: false,
      es6: true,
      enhance: true,
      postcss: true,
      preloadBackgroundData: false,
      minified: true,
      coverView: true,
      bigPackageSizeSupport: true, // 支持分包异步化
    },
    lazyCodeLoading: 'requiredComponents', // 按需注入
  },

  /* 百度小程序配置 */
  'mp-baidu': {
    appid: VITE_BAIDU_MINI_APP_ID,
    optimization: {
      subPackages: true, // 开启分包优化
    },
  },

  /* 抖音小程序配置 */
  'mp-toutiao': {
    appid: VITE_BYTEDANCE_MINI_APP_ID,
    setting: {
      urlCheck: false,
      es6: true,
      postcss: true,
      minified: true,
      newFeature: true,
    },
    subPackages: [],
  },
})
```

## 调试与测试

### 分包加载调试

```typescript
// 监听分包加载状态
// #ifdef MP-WEIXIN
wx.onSubPackageLoad((res) => {
  console.log('分包加载信息:', res)
  // res.packageName: 分包名称
  // res.durationMs: 加载耗时
})
// #endif
```

### 开发环境分包配置

```typescript
// vite/plugins/uni-pages.ts
export default (mode: string) => {
  return UniPages({
    subPackages: [
      'src/pages-sub/admin',
      'src/pages-sub/mall',
      // 开发环境加载 demo 分包
      ...(mode === 'development' ? ['src/pages-sub/demo'] : []),
    ],
  })
}
```

### 分包体积检查命令

```json
// package.json
{
  "scripts": {
    "build:analyze": "npm run build:mp-weixin -- --report",
    "check:size": "ts-node scripts/check-size.ts"
  }
}
```

## 最佳实践

### 1. 分包规划原则

```
✅ 推荐做法:
- 按业务模块划分分包
- 高频页面配置预加载
- 活动营销使用独立分包
- 公共组件放主包

❌ 避免做法:
- 主包放太多页面
- 分包之间相互依赖
- 独立分包引用主包资源
- 忽略分包体积监控
```

### 2. 路由跳转规范

```typescript
// ✅ 使用封装的导航方法
import { subNavigate } from '@/utils/navigate'
subNavigate.mall.goodsDetail(123)

// ✅ 使用类型安全的路由
import { SUB_ROUTES, navigateToWithParams } from '@/types/route'
navigateToWithParams(SUB_ROUTES.mall.goodsDetail, { id: 123 })

// ❌ 避免硬编码路径
uni.navigateTo({ url: '/pages-sub/mall/goods/detail?id=123' })
```

### 3. 资源管理规范

```
✅ 推荐:
- 大图使用 CDN
- 小图标使用 base64 或字体图标
- 分包私有资源放分包目录
- 公共资源放主包

❌ 避免:
- 分包内放大尺寸图片
- 重复引用相同资源
- 分包间共享静态资源
```

### 4. 性能优化建议

```typescript
// 分包页面骨架屏
<template>
  <view v-if="loading">
    <wd-skeleton :loading="true" :rows="5" />
  </view>
  <view v-else>
    <!-- 实际内容 -->
  </view>
</template>

// 分包页面预渲染
onLoad(() => {
  // 立即显示骨架屏
  loading.value = true

  // 并行加载数据
  Promise.all([
    loadGoodsInfo(),
    loadComments(),
    loadRecommend()
  ]).then(() => {
    loading.value = false
  })
})
```

## 常见问题

### 1. 分包页面找不到

**原因**：pages.json 配置路径错误

**解决方案**：
```json
// 确保路径正确，不带 .vue 后缀
{
  "root": "pages-sub/mall",
  "pages": [
    { "path": "goods/detail" }  // ✅ 正确
    // { "path": "goods/detail.vue" }  // ❌ 错误
  ]
}
```

### 2. 分包组件引用失败

**原因**：分包不能直接引用其他分包的组件

**解决方案**：
```typescript
// 方案一：将公共组件放到主包
// src/components/common/goods-card.vue

// 方案二：在分包内复制组件
// pages-sub/mall/components/goods-card.vue

// 方案三：使用分包异步化（仅微信）
// 需要配置 bigPackageSizeSupport: true
```

### 3. 分包预加载不生效

**原因**：配置格式错误或网络条件不满足

**解决方案**：
```json
{
  "preloadRule": {
    "pages/index/index": {  // 必须是完整页面路径
      "network": "all",     // all 表示所有网络
      "packages": ["pages-sub/mall"]  // 分包 root 路径
    }
  }
}
```

### 4. 独立分包无法使用全局方法

**原因**：独立分包与主包隔离

**解决方案**：
```typescript
// 在独立分包入口重新初始化
// pages-sub/activity/index.vue
const initConfig = () => {
  // 设置请求基础URL
  const baseUrl = 'https://api.example.com'

  // 初始化必要的配置
  uni.setStorageSync('baseUrl', baseUrl)
}

onLoad(() => {
  initConfig()
  loadData()
})
```

### 5. 分包体积超限

**原因**：分包内引入了大型依赖或过多静态资源

**解决方案**：
```typescript
// 1. 按需引入依赖
import debounce from 'lodash/debounce' // ✅
// import _ from 'lodash' // ❌

// 2. 图片使用 CDN
<image src="https://cdn.example.com/image.png" /> // ✅
// <image src="/pages-sub/mall/static/large.png" /> // ❌

// 3. 使用代码分割
const loadChart = async () => {
  const { Chart } = await import('echarts')
  return new Chart(...)
}
```

### 6. 分包页面跳转白屏

**原因**：分包加载时间过长或页面渲染阻塞

**解决方案**：
```vue
<template>
  <!-- 添加加载状态 -->
  <view v-if="pageReady">
    <wd-skeleton :loading="loading" :rows="5">
      <!-- 页面内容 -->
    </wd-skeleton>
  </view>
</template>

<script setup>
const pageReady = ref(false)
const loading = ref(true)

onLoad(() => {
  // 延迟渲染避免白屏
  nextTick(() => {
    pageReady.value = true
  })

  loadData().then(() => {
    loading.value = false
  })
})
</script>
```

### 7. 分包间数据共享问题

**原因**：分包间没有直接的数据共享机制

**解决方案**：
```typescript
// 方案一：使用全局存储
// 在分包A中设置
uni.setStorageSync('sharedData', data)

// 在分包B中获取
const data = uni.getStorageSync('sharedData')

// 方案二：使用事件总线
// utils/eventBus.ts
export const eventBus = {
  events: new Map<string, Set<Function>>(),

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(callback)
  },

  emit(event: string, data?: any) {
    this.events.get(event)?.forEach(cb => cb(data))
  },

  off(event: string, callback?: Function) {
    if (callback) {
      this.events.get(event)?.delete(callback)
    } else {
      this.events.delete(event)
    }
  }
}

// 方案三：使用 URL 参数传递
uni.navigateTo({
  url: `/pages-sub/mall/order/confirm?data=${encodeURIComponent(JSON.stringify(data))}`
})
```

### 8. UniPages 插件分包不生效

**原因**：分包目录配置错误或缓存问题

**解决方案**：
```typescript
// 确保分包目录在 src 下但不在 pages 目录内
subPackages: [
  'src/pages-sub/admin',  // ✅ 正确
  // 'src/pages/admin',   // ❌ 错误，不能在 pages 目录下
],

// 清除缓存重新构建
// rm -rf node_modules/.vite
// npm run dev
```

## 分包检查清单

### 开发阶段

- [ ] 分包目录结构正确（pages-sub/模块名/页面）
- [ ] pages.json 中正确配置 subPackages
- [ ] 页面路径不带 .vue 后缀
- [ ] 分包内静态资源路径正确
- [ ] 组件引用方式正确（主包/分包内）

### 构建阶段

- [ ] 主包体积未超过 2MB
- [ ] 单个分包体积未超过 2MB
- [ ] 总包体积符合平台限制
- [ ] 预加载规则配置正确
- [ ] 各平台条件编译正确

### 测试阶段

- [ ] 分包页面正常跳转
- [ ] 分包组件正确渲染
- [ ] 预加载功能生效
- [ ] 独立分包可独立运行
- [ ] 各平台表现一致

## 类型定义

```typescript
/** 分包配置 */
interface SubPackageConfig {
  /** 分包根目录 */
  root: string
  /** 分包内页面列表 */
  pages: PageConfig[]
  /** 是否为独立分包 */
  independent?: boolean
}

/** 页面配置 */
interface PageConfig {
  /** 页面路径 */
  path: string
  /** 页面类型 */
  type?: 'home' | 'page'
  /** 布局名称 */
  layout?: string
  /** 页面样式 */
  style?: PageStyle
}

/** 页面样式 */
interface PageStyle {
  /** 导航栏标题 */
  navigationBarTitleText?: string
  /** 导航栏背景色 */
  navigationBarBackgroundColor?: string
  /** 导航栏文字颜色 */
  navigationBarTextStyle?: 'black' | 'white'
  /** 是否开启下拉刷新 */
  enablePullDownRefresh?: boolean
  /** 背景文字样式 */
  backgroundTextStyle?: 'dark' | 'light'
}

/** 预加载规则 */
interface PreloadRule {
  [pagePath: string]: {
    /** 网络条件 */
    network: 'all' | 'wifi'
    /** 预加载的分包列表 */
    packages: string[]
  }
}

/** UniPages 插件配置 */
interface UniPagesConfig {
  /** 首页路径 */
  homePage?: string
  /** 排除的文件模式 */
  exclude?: string[]
  /** 路由块语言 */
  routeBlockLang?: 'json5' | 'yaml'
  /** 分包目录列表 */
  subPackages?: string[]
  /** 类型定义输出路径 */
  dts?: string
  /** 页面元数据处理钩子 */
  onAfterMergePageMetaData?: (ctx: PageMetaDataContext) => void
}

/** 页面元数据上下文 */
interface PageMetaDataContext {
  /** 主包页面元数据 */
  pageMetaData: PageConfig[]
  /** 分包页面元数据 */
  subPageMetaData?: SubPackageConfig[]
}
```

## 总结

分包管理核心要点:

1. **目录规划** - 主包放核心页面，分包放业务模块，独立分包放营销活动
2. **体积控制** - 主包 ≤ 2MB，单个分包 ≤ 2MB，监控分包体积变化
3. **预加载策略** - 高频分包配置预加载，提升用户体验
4. **资源管理** - 大图使用 CDN，公共组件放主包，分包资源独立管理
5. **类型安全** - 使用封装的导航方法，避免硬编码路径
6. **平台适配** - 注意各平台分包特性差异，使用条件编译处理
