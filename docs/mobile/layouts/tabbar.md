# 标签栏配置

## 介绍

标签栏（Tabbar）是移动端应用中最常见的底部导航组件，用于在不同页面之间进行快速切换。RuoYi-Plus-UniApp 项目基于 WD UI 组件库的 `wd-tabbar` 组件实现底部标签栏功能，支持两种使用模式：通过 items 数组配置和使用子组件配置，能够满足大多数移动端应用的导航需求。

标签栏组件采用了灵活的设计理念，不仅支持基础的图标和文字展示，还支持徽标显示、自定义颜色、圆角形状等丰富的定制功能。组件内置了安全区域适配、固定定位、占位元素等实用特性，确保在各种设备和平台上都能正常显示。

**核心特性：**

- **双模式支持** - 支持通过 items 数组配置和使用 `wd-tabbar-item` 子组件两种方式，灵活适应不同场景
- **丰富的样式定制** - 支持自定义激活/非激活颜色、图标大小、文字大小、形状样式等
- **徽标功能** - 内置徽标组件支持，可显示数字、小红点等提示信息
- **安全区域适配** - 自动适配 iPhone X 及以上机型的底部安全区域
- **固定定位** - 支持固定在底部，并自动生成占位元素防止内容被遮挡
- **多形状支持** - 支持默认和圆角两种形状样式
- **激活图标切换** - 支持激活状态和非激活状态显示不同的图标
- **响应式更新** - 选中状态变化时自动更新样式和触发事件

## 基本用法

### Items 数组模式

通过 `items` 属性传入配置数组，是最简洁的使用方式。

```vue
<template>
  <view class="page">
    <view class="content">页面内容</view>

    <wd-tabbar v-model="active" :items="tabbarItems" @change="handleChange" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home' },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart' },
  { title: '我的', icon: 'user' },
])

const handleChange = (value: number | string) => {
  console.log('切换到标签:', value)
}
</script>
```

**使用说明：**

- `v-model` 绑定当前选中的标签索引或名称
- `items` 数组中每个对象代表一个标签项
- 每个标签项至少包含 `title`（标题）和 `icon`（图标）

### 子组件模式

通过 `wd-tabbar-item` 子组件的方式配置，更加灵活，支持更多自定义内容。

```vue
<template>
  <view class="page">
    <view class="content">页面内容</view>

    <wd-tabbar v-model="active" @change="handleChange">
      <wd-tabbar-item
        v-for="item in tabbarItems"
        :key="item.name"
        :name="item.name"
        :title="item.title"
        :icon="item.icon"
      />
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref('home')

const tabbarItems = ref([
  { name: 'home', title: '首页', icon: 'home' },
  { name: 'category', title: '分类', icon: 'menu' },
  { name: 'cart', title: '购物车', icon: 'cart' },
  { name: 'my', title: '我的', icon: 'user' },
])

const handleChange = (value: number | string) => {
  console.log('切换到标签:', value)
}
</script>
```

**使用说明：**

- 使用 `name` 属性标识每个标签项的唯一标识
- `v-model` 可以绑定索引或 `name` 值
- 子组件模式支持更多自定义内容和插槽

### 自定义图标名称

使用 `name` 属性为每个标签项指定唯一标识，便于通过名称切换标签。

```vue
<template>
  <wd-tabbar v-model="active" :items="tabbarItems" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref('home')

const tabbarItems = ref([
  { name: 'home', title: '首页', icon: 'home' },
  { name: 'category', title: '分类', icon: 'menu' },
  { name: 'cart', title: '购物车', icon: 'cart' },
  { name: 'my', title: '我的', icon: 'user' },
])
</script>
```

**使用说明：**

- 指定 `name` 后，`v-model` 绑定的值对应 `name` 而非索引
- 未指定 `name` 时，默认使用数组索引作为标识

## 激活状态图标

### 切换激活图标

通过 `activeIcon` 属性为每个标签项设置激活状态时显示的图标。

```vue
<template>
  <wd-tabbar v-model="active" :items="tabbarItems" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home', activeIcon: 'home-fill' },
  { title: '分类', icon: 'menu', activeIcon: 'menu-fill' },
  { title: '购物车', icon: 'cart', activeIcon: 'cart-fill' },
  { title: '我的', icon: 'user', activeIcon: 'user-fill' },
])
</script>
```

**使用说明：**

- `icon` 为非激活状态显示的图标
- `activeIcon` 为激活状态显示的图标
- 如果未设置 `activeIcon`，激活状态也使用 `icon` 图标

### 自定义颜色

通过 `activeColor` 和 `inactiveColor` 属性自定义标签的颜色。

```vue
<template>
  <wd-tabbar
    v-model="active"
    :items="tabbarItems"
    active-color="#ee0a24"
    inactive-color="#7d7e80"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home' },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart' },
  { title: '我的', icon: 'user' },
])
</script>
```

**使用说明：**

- `activeColor` 设置激活状态的图标和文字颜色
- `inactiveColor` 设置非激活状态的图标和文字颜色
- 颜色值支持十六进制、RGB、RGBA 等格式

## 徽标显示

### 显示徽标数字

通过 `value` 属性为标签项添加徽标数字。

```vue
<template>
  <wd-tabbar v-model="active" :items="tabbarItems" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home' },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart', value: 3 },
  { title: '我的', icon: 'user', value: 99 },
])
</script>
```

**使用说明：**

- `value` 属性显示徽标数字
- 默认最大显示 99，超过显示 99+
- 可通过 `max` 属性自定义最大值

### 显示小红点

通过 `isDot` 属性显示小红点而不是数字。

```vue
<template>
  <wd-tabbar v-model="active" :items="tabbarItems" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home', isDot: true },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart', value: 3 },
  { title: '我的', icon: 'user' },
])
</script>
```

**使用说明：**

- `isDot` 为 `true` 时显示小红点
- 小红点模式下 `value` 属性不生效

### 自定义徽标最大值

通过 `max` 属性自定义徽标数字的最大显示值。

```vue
<template>
  <wd-tabbar v-model="active" :items="tabbarItems" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home' },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart', value: 150, max: 200 },
  { title: '我的', icon: 'user', value: 999, max: 999 },
])
</script>
```

**使用说明：**

- `max` 属性设置最大显示数字
- 超过 `max` 时显示 `max+`
- 默认 `max` 值为 99

## 形状样式

### 圆角形状

通过 `shape` 属性设置标签栏的形状为圆角样式。

```vue
<template>
  <wd-tabbar v-model="active" :items="tabbarItems" shape="round" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home' },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart' },
  { title: '我的', icon: 'user' },
])
</script>
```

**使用说明：**

- `shape` 支持 `default`（默认）和 `round`（圆角）两种值
- 圆角形状会在两侧添加边距和圆角效果
- 圆角形状带有阴影效果

### 隐藏边框

通过设置 `bordered` 为 `false` 隐藏顶部边框。

```vue
<template>
  <wd-tabbar v-model="active" :items="tabbarItems" :bordered="false" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home' },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart' },
  { title: '我的', icon: 'user' },
])
</script>
```

**使用说明：**

- `bordered` 默认为 `true`，显示顶部边框
- 设置为 `false` 时隐藏顶部边框

## 固定定位

### 固定在底部

默认情况下，标签栏固定在页面底部。

```vue
<template>
  <view class="page">
    <view class="content" style="height: 2000rpx">
      长内容区域，可滚动...
    </view>

    <wd-tabbar v-model="active" :items="tabbarItems" fixed placeholder />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home' },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart' },
  { title: '我的', icon: 'user' },
])
</script>
```

**使用说明：**

- `fixed` 默认为 `true`，标签栏固定在底部
- `placeholder` 默认为 `true`，生成等高占位元素防止内容被遮挡
- 占位高度会自动计算

### 非固定定位

将 `fixed` 设置为 `false`，标签栏将随页面内容滚动。

```vue
<template>
  <view class="page">
    <view class="content">页面内容</view>

    <wd-tabbar v-model="active" :items="tabbarItems" :fixed="false" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home' },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart' },
  { title: '我的', icon: 'user' },
])
</script>
```

**使用说明：**

- 非固定定位时，标签栏会随页面内容滚动
- 适用于单页面应用或特殊布局需求

## 安全区域

### 底部安全区域适配

默认启用底部安全区域适配，适配 iPhone X 及以上机型。

```vue
<template>
  <wd-tabbar
    v-model="active"
    :items="tabbarItems"
    safe-area-inset-bottom
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home' },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart' },
  { title: '我的', icon: 'user' },
])
</script>
```

**使用说明：**

- `safeAreaInsetBottom` 默认为 `true`
- 自动在底部添加安全区域内边距
- 确保标签栏不会被底部横条遮挡

## 自定义尺寸

### 自定义图标和文字大小

通过 `iconSize` 和 `fontSize` 属性自定义图标和文字的大小。

```vue
<template>
  <wd-tabbar
    v-model="active"
    :items="tabbarItems"
    icon-size="48rpx"
    font-size="24rpx"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const tabbarItems = ref([
  { title: '首页', icon: 'home' },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart' },
  { title: '我的', icon: 'user' },
])
</script>
```

**使用说明：**

- `iconSize` 设置图标大小，默认由组件样式定义
- `fontSize` 设置文字大小，默认由组件样式定义
- 支持 rpx、px 等单位，也可以只传数字（默认 rpx）

## 项目中的实现

### Tabbar 页面结构

RuoYi-Plus-UniApp 项目将 Tabbar 的每个标签页拆分为独立的 Vue 组件，放置在 `src/components/tabbar/` 目录下：

```
src/components/tabbar/
├── Home.vue    # 首页标签内容
├── Menu.vue    # 菜单/点餐标签内容
└── My.vue      # 我的标签内容
```

### Home 页面示例

首页标签页展示了轮播图、金刚区、商品列表等内容：

```vue
<template>
  <view class="min-h-[100vh]">
    <wd-navbar title="首页" />

    <!-- 轮播图 -->
    <wd-swiper :list="swiperList" custom-class="m-2" />

    <!-- 金刚区 -->
    <wd-row custom-class="p-2 bg-white mx-4 rounded-xl" :gutter="16">
      <wd-col v-for="(item, index) in menuList" :key="index" :span="6">
        <view class="flex flex-col items-center py-2" @click="handleMenuClick(item)">
          <wd-icon :name="item.icon" size="60" :color="item.color" />
          <wd-text custom-class="mt-2" :text="item.title" />
        </view>
      </wd-col>
    </wd-row>

    <!-- 商品列表 -->
    <wd-paging
      ref="paging"
      :fetch="pageGoods"
      :params="queryParams"
      :tabs="tabsConfig"
    >
      <template #item="{ item, currentTabData }">
        <wd-card custom-class="w-694rpx box-border">
          <template #title>
            <view class="flex items-center">
              <wd-img :src="item.img" width="120" height="120" radius="8" />
              <view class="ml-2 flex items-center">
                <wd-tag v-if="currentTabData?.name === 'hot'" type="danger" size="small">
                  热销
                </wd-tag>
                <wd-text custom-class="ml-1" :text="item.name" />
              </view>
            </view>
          </template>

          <template #footer>
            <view class="flex justify-between">
              <wd-text :text="item.price" size="32" type="error" bold />
              <wd-button type="primary" size="small" @click="handleGoodsPay(item)">
                立即购买
              </wd-button>
            </view>
          </template>
        </wd-card>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
import type { GoodsQuery, GoodsVo } from '@/api/app/home/homeTypes'
import { listAds, pageGoods } from '@/api/app/home/homeApi'
import { usePayment } from '@/composables/usePayment'

const { scrollTop, scrollToTop } = useScroll()

// 轮播图数据
const swiperList = ref<string[]>([])

// 金刚区数据
const menuList = ref([
  { title: '外卖', icon: 'goods', color: '#ff6b6b' },
  { title: '超市', icon: 'cart', color: '#4ecdc4' },
  { title: '水果', icon: 'apple', color: '#45b7d1' },
  { title: '药店', icon: 'bag-fill', color: '#96ceb4' },
  { title: '鲜花', icon: 'gift', color: '#feca57' },
  { title: '蛋糕', icon: 'layers', color: '#ff9ff3' },
  { title: '酒店', icon: 'company', color: '#54a0ff' },
  { title: '更多', icon: 'more', color: '#5f27cd' },
])

// 查询参数
const queryParams = ref<GoodsQuery>({
  pageNum: 1,
  pageSize: 10,
  orderByColumn: 'createTime',
  isAsc: 'desc',
})

// 初始化首页广告
const initAds = async () => {
  const [err, data] = await listAds()
  if (!err) {
    swiperList.value = data.map((ad) => ad.img)
  }
}

onMounted(() => {
  initAds()
})
</script>
```

### Menu 页面示例

菜单页面展示了侧边栏导航与内容联动的效果：

```vue
<template>
  <view>
    <wd-navbar title="点餐" />

    <view class="wraper">
      <wd-sidebar v-model="active" @change="handleChange">
        <wd-sidebar-item
          v-for="(item, index) in categories"
          :key="index"
          :value="index"
          :label="item.label"
        />
      </wd-sidebar>
      <scroll-view
        class="content"
        scroll-y
        :scroll-with-animation="scrollWithAnimation"
        :scroll-top="scrollTop"
        @scroll="onScroll"
      >
        <view v-for="(item, index) in categories" :key="index" class="category">
          <wd-cell-group :title="item.title" border>
            <wd-cell
              v-for="(cell, cellIndex) in item.items"
              :key="cellIndex"
              :title="cell.title"
              :label="cell.label"
            >
              <wd-icon name="github-fill" size="24px" />
            </wd-cell>
          </wd-cell-group>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onMounted, ref, getCurrentInstance } from 'vue'
import { CommonUtil } from '@/wd'

const active = ref<number>(0)
const scrollTop = ref<number>(0)
const itemScrollTop = ref<number[]>([])
const scrollWithAnimation = ref<boolean>(true)

const categories = ref([
  { label: '分类一', title: '标题一', items: [...] },
  { label: '分类二', title: '标题二', items: [...] },
  // ...更多分类
])

// 处理侧边栏切换
function handleChange({ value }) {
  active.value = value
  // 滚动到对应分类位置
  scrollTop.value = itemScrollTop.value[value]
}

// 处理内容滚动
function onScroll(e) {
  const { scrollTop: currentScrollTop } = e.detail
  // 根据滚动位置更新侧边栏激活项
  const index = itemScrollTop.value.findIndex(
    (top) => top > currentScrollTop
  )
  if (index > -1 && active.value !== index) {
    active.value = index
  }
}
</script>

```

### My 页面示例

我的页面展示了用户信息、订单入口、快捷功能等内容：

```vue
<template>
  <view class="min-h-[100vh] bg-#FFFCF5 pb-10">
    <wd-navbar :bg-color="`rgba(255,252,245,${scrollTop / 60})`" :title="t('app.my.title')" />

    <!-- 用户信息头部 -->
    <view class="relative pt-10">
      <view class="flex flex-col items-center justify-center">
        <wd-icon
          v-if="!userStore.userInfo?.avatar"
          custom-class="bg-#f8f6f8 rounded-full p-6"
          name="user"
          size="80"
          @click="handleUserInfo"
        />
        <wd-img
          v-else
          :src="userStore.userInfo?.avatar"
          width="128"
          height="128"
          round
          @click="handleUserInfo"
        />
        <wd-text
          size="36"
          :text="userStore.userInfo?.nickName || '昵称'"
          @click="handleUserInfo"
        />
      </view>

      <!-- 统计数据 -->
      <wd-row custom-class="mt-6 bg-#ffffffcc mx-5! rounded-lg py-2" :gutter="12">
        <wd-col v-for="(stat, index) in statsData" :key="index" :span="8">
          <view class="text-center" @click="handleStatClick(stat)">
            <wd-text bold block size="34" :text="stat.value" />
            <wd-text block :text="stat.label" size="24" />
          </view>
        </wd-col>
      </wd-row>
    </view>

    <!-- 我的订单 -->
    <wd-cell-group custom-class="mt-2 mx-3" title="我的订单">
      <wd-grid :items="orderTypes" clickable @item-click="handleOrderClick" />
    </wd-cell-group>

    <!-- 快捷功能 -->
    <wd-cell-group custom-class="mt-2 mx-3" title="快捷功能">
      <wd-grid :items="quickActions" clickable />
    </wd-cell-group>

    <!-- 退出登录 -->
    <wd-button
      v-if="auth.isLoggedIn.value"
      block
      custom-class="mx-10! mt-4"
      @click="handleLogout"
    >
      {{ t('app.my.logout') }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage, useToast } from '@/wd'
import { useI18n } from '@/composables/useI18n'

const { confirm } = useMessage()
const toast = useToast()
const { t } = useI18n()

const userStore = useUserStore()
const auth = useAuth()

// 统计数据
const statsData = ref([
  { label: '优惠券', value: '3', type: 'coupon' },
  { label: '积分', value: '1285', type: 'points' },
  { label: '余额', value: '268', type: 'balance' },
])

// 订单类型
const orderTypes = ref([
  { text: '待付款', icon: 'wallet' },
  { text: '待收货', icon: 'calendar' },
  { text: '待评价', icon: 'star' },
  { text: '退款/售后', icon: 'service' },
])

// 快捷功能
const quickActions = ref([
  { text: '收货地址', icon: 'location' },
  { text: '优惠券', icon: 'discount' },
  { text: '积分商城', icon: 'star' },
  { text: '客服', icon: 'service' },
])

// 退出登录
const handleLogout = async () => {
  const result = await confirm({
    title: '确认退出',
    msg: '您确定要退出登录吗？',
  })
  if (result.action === 'confirm') {
    toast.loading('退出中...')
    await userStore.logoutUser()
    toast.success('退出成功')
  }
}

const { scrollTop } = useScroll()

onMounted(async () => {
  await userStore.fetchUserInfo()
})
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 选中标签的索引值或名称 | `number \| string` | `0` |
| items | 标签栏配置列表 | `WdTabbarItemProps[]` | `[]` |
| fixed | 是否固定在底部 | `boolean` | `true` |
| bordered | 是否显示顶部边框 | `boolean` | `true` |
| safeAreaInsetBottom | 是否设置底部安全距离 | `boolean` | `true` |
| shape | 标签栏形状 | `'default' \| 'round'` | `'default'` |
| activeColor | 激活标签的颜色 | `string` | - |
| inactiveColor | 未激活标签的颜色 | `string` | - |
| placeholder | 固定时是否生成占位元素 | `boolean` | `true` |
| zIndex | 标签栏的层级 | `number` | `99` |
| iconSize | 图标大小 | `string \| number` | - |
| fontSize | 文字大小 | `string \| number` | - |
| customStyle | 自定义根节点样式 | `string` | `''` |
| customClass | 自定义根节点样式类 | `string` | `''` |

### TabbarItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 标签项唯一标识 | `string \| number` | - |
| title | 标签标题 | `string` | - |
| icon | 图标名称 | `string` | - |
| activeIcon | 激活状态图标名称 | `string` | - |
| value | 徽标数字 | `number \| string` | - |
| isDot | 是否显示小红点 | `boolean` | `false` |
| max | 徽标最大值 | `number` | `99` |
| badgeProps | 徽标组件属性 | `WdBadgeProps` | - |
| loaded | 标记页面是否已加载 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 标签切换时触发 | `value: number \| string` |
| update:modelValue | v-model 更新事件 | `value: number \| string` |
| update:items | items 的 loaded 状态更新 | `items: WdTabbarItemProps[]` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 子组件模式时的内容插槽 |
| icon-{name\|index} | 自定义图标插槽，name 或 index 对应标签项 |

### 类型定义

```typescript
/**
 * 标签栏形状类型
 */
type TabbarShape = 'default' | 'round'

/**
 * 标签栏配置项
 */
interface WdTabbarItemProps {
  /** 标签项唯一标识 */
  name?: string | number
  /** 标签标题 */
  title?: string
  /** 图标名称 */
  icon?: string
  /** 激活状态图标名称 */
  activeIcon?: string
  /** 徽标数字 */
  value?: number | string
  /** 是否显示小红点 */
  isDot?: boolean
  /** 徽标最大值 */
  max?: number
  /** 徽标组件属性 */
  badgeProps?: Partial<WdBadgeProps>
  /** 标记页面是否已加载 */
  loaded?: boolean
}

/**
 * 标签栏组件属性
 */
interface WdTabbarProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 选中标签的索引值或名称 */
  modelValue?: number | string
  /** 标签栏配置列表 */
  items?: WdTabbarItemProps[]
  /** 是否固定在底部 */
  fixed?: boolean
  /** 是否显示顶部边框 */
  bordered?: boolean
  /** 是否设置底部安全距离 */
  safeAreaInsetBottom?: boolean
  /** 标签栏形状 */
  shape?: TabbarShape
  /** 激活标签的颜色 */
  activeColor?: string
  /** 未激活标签的颜色 */
  inactiveColor?: string
  /** 固定时是否生成占位元素 */
  placeholder?: boolean
  /** 标签栏的层级 */
  zIndex?: number
  /** 图标大小 */
  iconSize?: string | number
  /** 文字大小 */
  fontSize?: string | number
}
```

## 主题定制

### CSS 变量

标签栏组件使用以下 CSS 变量，可通过 ConfigProvider 组件进行全局定制：

```scss
// 标签栏高度
$-tabbar-height: 100rpx;

// 标签栏背景色
$-color-white: #ffffff;

// 标签栏阴影（圆角形状）
$-tabbar-box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);

// 激活状态颜色
$-tabbar-active-color: var(--wot-color-theme, #4D80F0);

// 非激活状态颜色
$-tabbar-inactive-color: #7d7e80;

// 图标大小
$-tabbar-item-icon-size: 44rpx;

// 标题字体大小
$-tabbar-item-title-font-size: 24rpx;

// 标题行高
$-tabbar-item-title-line-height: 36rpx;
```

### 暗黑模式

标签栏组件支持暗黑模式，在暗黑主题下会自动应用暗色背景和文字颜色：

```scss
.wot-theme-dark {
  .wd-tabbar {
    background: $-dark-background;

    .wd-tabbar-item__body {
      .is-inactive {
        color: $-dark-color-gray;
      }
    }
  }
}
```

## 最佳实践

### 1. 合理使用 name 属性

使用 `name` 属性为每个标签项指定唯一标识，便于状态管理和路由跳转：

```vue
<template>
  <wd-tabbar v-model="active" :items="tabbarItems" @change="handleChange" />
</template>

<script lang="ts" setup>
const active = ref('home')

const tabbarItems = ref([
  { name: 'home', title: '首页', icon: 'home' },
  { name: 'category', title: '分类', icon: 'menu' },
  { name: 'cart', title: '购物车', icon: 'cart' },
  { name: 'my', title: '我的', icon: 'user' },
])

const handleChange = (value: string) => {
  // 根据 name 值进行路由跳转
  uni.switchTab({
    url: `/pages/${value}/${value}`,
  })
}
</script>
```

### 2. 使用 loaded 属性优化加载

利用 `loaded` 属性标记页面是否已加载，可以实现懒加载效果：

```vue
<template>
  <wd-tabbar v-model="active" v-model:items="tabbarItems">
    <template v-for="(item, index) in tabbarItems" :key="item.name">
      <!-- 只渲染已加载的页面 -->
      <view v-if="item.loaded">
        <component :is="getPageComponent(item.name)" />
      </view>
    </template>
  </wd-tabbar>
</template>

<script lang="ts" setup>
const active = ref(0)

const tabbarItems = ref([
  { name: 'home', title: '首页', icon: 'home', loaded: true },
  { name: 'category', title: '分类', icon: 'menu', loaded: false },
  { name: 'cart', title: '购物车', icon: 'cart', loaded: false },
  { name: 'my', title: '我的', icon: 'user', loaded: false },
])
</script>
```

### 3. 徽标数据实时更新

将徽标数据与业务状态关联，实现实时更新：

```vue
<template>
  <wd-tabbar v-model="active" :items="tabbarItems" />
</template>

<script lang="ts" setup>
import { useCartStore } from '@/stores/cart'
import { useMessageStore } from '@/stores/message'

const cartStore = useCartStore()
const messageStore = useMessageStore()

const active = ref(0)

// 计算属性，根据业务状态动态生成徽标
const tabbarItems = computed(() => [
  { title: '首页', icon: 'home' },
  { title: '分类', icon: 'menu' },
  { title: '购物车', icon: 'cart', value: cartStore.totalCount },
  { title: '我的', icon: 'user', isDot: messageStore.hasUnread },
])
</script>
```

### 4. 圆角形状的使用场景

圆角形状适合追求更现代化设计风格的应用：

```vue
<template>
  <wd-tabbar
    v-model="active"
    :items="tabbarItems"
    shape="round"
    active-color="#ff6b6b"
    :bordered="false"
  />
</template>
```

## 常见问题

### 1. 标签栏遮挡页面内容

**问题原因：**

- 固定定位时未生成占位元素
- 页面内容未预留足够底部空间

**解决方案：**

确保 `fixed` 和 `placeholder` 都设置为 `true`（默认值）：

```vue
<wd-tabbar
  v-model="active"
  :items="tabbarItems"
  fixed
  placeholder
/>
```

或者在页面内容区域预留底部空间：

```vue
<template>
  <view class="page">
    <view class="content" style="padding-bottom: 100rpx">
      页面内容
    </view>
    <wd-tabbar v-model="active" :items="tabbarItems" />
  </view>
</template>
```

### 2. iPhone X 底部安全区域适配

**问题原因：**

- 未启用底部安全区域适配
- 自定义样式覆盖了安全区域设置

**解决方案：**

确保 `safeAreaInsetBottom` 设置为 `true`：

```vue
<wd-tabbar
  v-model="active"
  :items="tabbarItems"
  safe-area-inset-bottom
/>
```

### 3. 徽标数字不显示

**问题原因：**

- `value` 值为 0 或未定义
- 同时设置了 `isDot` 为 `true`

**解决方案：**

检查徽标配置：

```typescript
const tabbarItems = ref([
  { title: '购物车', icon: 'cart', value: 3 }, // 显示数字 3
  { title: '我的', icon: 'user', isDot: true }, // 显示小红点
])
```

注意 `value` 为 0 时徽标不显示，`isDot` 优先级高于 `value`。

### 4. 切换标签无响应

**问题原因：**

- 未正确绑定 `v-model`
- 未监听 `change` 事件

**解决方案：**

确保正确绑定和监听：

```vue
<template>
  <wd-tabbar
    v-model="active"
    :items="tabbarItems"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
const active = ref(0)

const handleChange = (value: number | string) => {
  console.log('切换到:', value)
  // 执行页面切换逻辑
}
</script>
```

### 5. 自定义颜色不生效

**问题原因：**

- CSS 特异性问题
- 主题变量覆盖

**解决方案：**

使用 `activeColor` 和 `inactiveColor` 属性：

```vue
<wd-tabbar
  v-model="active"
  :items="tabbarItems"
  active-color="#ee0a24"
  inactive-color="#7d7e80"
/>
```

如果仍不生效，可以通过 `customClass` 添加自定义样式：

```vue
<template>
  <wd-tabbar
    v-model="active"
    :items="tabbarItems"
    custom-class="custom-tabbar"
  />
</template>

<style lang="scss">
.custom-tabbar {
  .wd-tabbar-item__body {
    .is-active {
      color: #ee0a24 !important;
    }
  }
}
</style>
```
