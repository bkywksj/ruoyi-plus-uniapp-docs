# 分包页面管理

分包是 UniApp 优化小程序体积的重要手段，将非首屏页面拆分到独立的分包中，实现按需加载，提升首次启动速度。

## 分包概述

### 为什么需要分包

| 问题 | 分包解决方案 |
|------|-------------|
| 小程序包体积限制（微信主包 2MB） | 将页面拆分到不同分包 |
| 首次加载时间长 | 主包精简，分包按需加载 |
| 功能模块耦合 | 按业务模块划分分包 |

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

## 目录结构

```
src/
├── pages/                    # 主包页面
│   ├── index/
│   │   └── index.vue        # 首页（Tabbar容器）
│   ├── auth/
│   │   ├── login.vue        # 登录页
│   │   └── register.vue     # 注册页
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
│   └── workflow/           # 工作流模块分包
│       ├── task/
│       │   └── list.vue    # 任务列表
│       └── process/
│           └── detail.vue  # 流程详情
└── components/              # 公共组件（打入主包）
```

## 配置说明

### pages.json 配置

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "type": "home",
      "layout": "default"
    },
    {
      "path": "pages/auth/login",
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
        },
        {
          "path": "role/role",
          "type": "page",
          "layout": "default"
        }
      ]
    },
    {
      "root": "pages-sub/mall",
      "pages": [
        {
          "path": "goods/list",
          "type": "page",
          "layout": "default"
        },
        {
          "path": "goods/detail",
          "type": "page",
          "layout": "default"
        },
        {
          "path": "order/list",
          "type": "page",
          "layout": "default"
        },
        {
          "path": "order/detail",
          "type": "page",
          "layout": "default"
        }
      ]
    },
    {
      "root": "pages-sub/workflow",
      "pages": [
        {
          "path": "task/list",
          "type": "page",
          "layout": "default"
        },
        {
          "path": "process/detail",
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

## 页面跳转

### 跳转到分包页面

```typescript
// 跳转到管理模块的用户页面
uni.navigateTo({
  url: '/pages-sub/admin/user/user'
})

// 跳转到商城模块的商品详情
uni.navigateTo({
  url: '/pages-sub/mall/goods/detail?id=123'
})

// 跳转到工作流模块的任务列表
uni.navigateTo({
  url: '/pages-sub/workflow/task/list'
})
```

### 封装跳转方法

```typescript
// utils/navigate.ts
export const subNavigate = {
  // 管理模块
  admin: {
    user: () => uni.navigateTo({ url: '/pages-sub/admin/user/user' }),
    role: () => uni.navigateTo({ url: '/pages-sub/admin/role/role' }),
  },

  // 商城模块
  mall: {
    goodsList: () => uni.navigateTo({ url: '/pages-sub/mall/goods/list' }),
    goodsDetail: (id: number) => uni.navigateTo({
      url: `/pages-sub/mall/goods/detail?id=${id}`
    }),
    orderList: () => uni.navigateTo({ url: '/pages-sub/mall/order/list' }),
    orderDetail: (id: string) => uni.navigateTo({
      url: `/pages-sub/mall/order/detail?id=${id}`
    }),
  },

  // 工作流模块
  workflow: {
    taskList: () => uni.navigateTo({ url: '/pages-sub/workflow/task/list' }),
    processDetail: (id: string) => uni.navigateTo({
      url: `/pages-sub/workflow/process/detail?id=${id}`
    }),
  }
}

// 使用
import { subNavigate } from '@/utils/navigate'

subNavigate.mall.goodsDetail(123)
subNavigate.workflow.taskList()
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
首页加载 → 预加载商城分包 → 用户点击商品 → 秒开详情页
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

      <!-- 购买栏 -->
      <view class="buy-bar safe-area-bottom">
        <wd-button type="warning" @click="addToCart">加入购物车</wd-button>
        <wd-button type="primary" @click="buyNow">立即购买</wd-button>
      </view>
    </view>
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
const goods = ref({})

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

const addToCart = () => {
  toast.success('已加入购物车')
}

const buyNow = () => {
  uni.navigateTo({
    url: `/pages-sub/mall/order/confirm?goodsId=${props.id}`
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
    margin-top: 16rpx;
  }

  .desc {
    font-size: 26rpx;
    color: #666;
    margin-top: 12rpx;
  }
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
}
</style>
```

### 步骤三：注册页面

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
          "layout": "default"
        }
      ]
    }
  ]
}
```

## 分包内资源

### 组件引用

```vue
<!-- 分包页面可以引用主包组件 -->
<script lang="ts" setup>
// 引用主包公共组件（自动通过 easycom 注册）
// <wd-button> <wd-cell> 等

// 引用分包内组件
import GoodsCard from '../components/goods-card.vue'
</script>
```

### 静态资源

```
pages-sub/
└── mall/
    ├── goods/
    │   └── detail.vue
    └── static/           # 分包静态资源
        └── images/
            └── empty.png
```

```vue
<!-- 引用分包内静态资源 -->
<image src="/pages-sub/mall/static/images/empty.png" />

<!-- 引用主包静态资源 -->
<image src="/static/images/logo.png" />
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
          "type": "page"
        }
      ]
    }
  ]
}
```

### 独立分包限制

- 不能引用主包的 JS 文件
- 不能引用主包的组件
- 不能使用主包的全局样式
- 需要独立的入口逻辑

### 独立分包示例

```vue
<!-- pages-sub/activity/index.vue -->
<template>
  <view class="activity-page">
    <image src="./static/banner.png" />
    <view class="content">
      <text>活动内容</text>
    </view>
    <button @click="goToMain">进入主程序</button>
  </view>
</template>

<script lang="ts" setup>
const goToMain = () => {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}
</script>

<style scoped>
/* 独立分包需要独立的样式 */
.activity-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #ff6b6b, #ffa502);
}
</style>
```

## 分包优化

### 1. 合理划分分包

```
推荐的分包划分：
├── pages-sub/admin/      # 管理后台（低频）
├── pages-sub/mall/       # 商城模块（高频，预加载）
├── pages-sub/workflow/   # 工作流（按需）
└── pages-sub/activity/   # 活动页（独立分包）
```

### 2. 减小分包体积

```typescript
// 避免在分包中引入大型库
// ❌ 不推荐：在分包页面引入完整的 lodash
import _ from 'lodash'

// ✅ 推荐：按需引入
import debounce from 'lodash/debounce'

// ✅ 或使用轻量替代
const debounce = (fn, delay) => {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
```

### 3. 图片资源优化

```vue
<!-- 使用网络图片减少包体积 -->
<image src="https://cdn.example.com/images/banner.png" />

<!-- 或使用 base64（小图标） -->
<image :src="iconBase64" />
```

### 4. 代码分析

```bash
# 使用 uni-app 构建分析
npm run build:mp-weixin -- --report

# 查看各分包体积
# dist/build/mp-weixin/分包目录
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
// 将公共组件放到主包
// src/components/common/goods-card.vue

// 或在分包内复制一份组件
// pages-sub/mall/components/goods-card.vue
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
onLoad(() => {
  // 初始化必要的配置
  initConfig()
})

const initConfig = () => {
  // 设置请求基础URL等
}
```

## 分包检查清单

- [ ] 分包目录结构正确（pages-sub/模块名/页面）
- [ ] pages.json 中正确配置 subPackages
- [ ] 页面路径不带 .vue 后缀
- [ ] 预加载规则配置正确
- [ ] 分包内静态资源路径正确
- [ ] 分包体积未超过限制
- [ ] 主包体积未超过 2MB
