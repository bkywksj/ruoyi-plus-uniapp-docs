# 首页 (Index)

## 介绍

首页（Index Page）是 RuoYi-Plus-UniApp 移动端应用的核心入口页面，采用了创新的**单页面多标签**架构设计。与传统的多页面 Tabbar 实现不同，本项目将所有 Tabbar 标签页内容整合到一个页面中，通过状态管理和条件渲染实现标签切换，显著提升了用户体验和应用性能。

这种架构设计带来了多项核心优势：首先，标签切换时无需页面跳转，实现了真正的无缝切换体验；其次，通过 `v-if` + `v-show` 的组合优化策略，实现了懒加载与组件缓存的完美平衡；最后，结合 Pinia 状态管理，支持跨组件的标签状态同步、徽标更新等高级功能。

**核心特性：**

- **单页面多标签** - 所有 Tabbar 内容集成在一个页面，避免页面跳转带来的性能损耗
- **懒加载优化** - 使用 `v-if` 控制组件首次加载时机，未访问的标签不会渲染
- **组件缓存** - 使用 `v-show` 控制已加载组件的显示隐藏，保持组件状态
- **状态管理** - 通过 Pinia Store 管理标签状态，支持跨组件通信
- **徽标系统** - 支持标签徽标数字和小红点提示，实时更新
- **平台适配** - 针对支付宝小程序等平台进行了特殊优化
- **滚动状态** - 统一管理页面滚动位置，支持滚动到顶部等操作
- **分享功能** - 内置微信分享能力配置

## 页面架构

### 单页面多标签设计

首页采用单页面多标签架构，所有 Tabbar 对应的内容都作为子组件嵌入到一个页面中。

```vue
<template>
  <scroll-view
    class="h-100vh"
    scroll-y
    :show-scrollbar="false"
    :scroll-top="scrollTopValue"
    @scroll="handleScroll"
  >
    <!-- 非支付宝小程序：使用 v-if + v-show 优化 -->
    <!-- #ifndef MP-ALIPAY -->
    <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
    <Menu v-if="tabs[1].loaded" v-show="currentTab === 1" />
    <My v-if="tabs[2].loaded" v-show="currentTab === 2" />
    <!-- #endif -->

    <!-- 支付宝小程序：仅使用 v-if -->
    <!-- #ifdef MP-ALIPAY -->
    <Home v-if="currentTab === 0" />
    <Menu v-if="currentTab === 1" />
    <My v-if="currentTab === 2" />
    <!-- #endif -->

    <!-- 底部标签栏 -->
    <wd-tabbar v-model="currentTab" :items="tabs" @change="handleTabChange" />
  </scroll-view>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import Home from '@/components/tabbar/Home.vue'
import Menu from '@/components/tabbar/Menu.vue'
import My from '@/components/tabbar/My.vue'
import { useShare, useScroll } from '@/composables'
import { useTabbarStore } from '@/stores'

// 启用微信分享功能
useShare()

// 获取全局滚动状态
const { scrollTopValue, handleScroll } = useScroll()

// 获取标签栏状态
const tabbarStore = useTabbarStore()
const { currentTab, tabs } = storeToRefs(tabbarStore)

// 处理标签切换
const handleTabChange = (index: number) => {
  tabbarStore.toTab(index)
}
</script>
```

**架构说明：**

- 整个页面使用 `scroll-view` 作为根容器，统一管理滚动行为
- 三个标签内容组件（Home、Menu、My）作为子组件嵌入
- 底部 `wd-tabbar` 组件控制标签切换
- 使用条件编译处理不同平台差异

### v-if + v-show 优化策略

这是本项目的核心优化策略，结合了两种条件渲染方式的优点：

```vue
<!-- 优化策略示例 -->
<template>
  <!-- v-if 控制组件是否创建（懒加载） -->
  <!-- v-show 控制已创建组件的显示隐藏（缓存） -->
  <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
</template>
```

**工作原理：**

1. **首次访问标签时**：
   - `tabs[index].loaded` 为 `false`，组件不会渲染
   - 切换到该标签时，`loaded` 变为 `true`，组件首次创建
   - 组件执行 `onMounted` 生命周期，加载数据

2. **再次切换到该标签时**：
   - `tabs[index].loaded` 保持 `true`，`v-if` 条件满足
   - 通过 `v-show` 控制显示，组件不会重新创建
   - 保持之前的状态，如滚动位置、表单数据等

3. **切换离开标签时**：
   - `v-show` 隐藏组件，但组件实例仍然存在
   - 不会触发 `onUnmounted`，状态完整保留

```typescript
// 标签配置数据结构
interface TabItem {
  title: string      // 标签标题
  icon: string       // 图标名称
  isDot: boolean     // 是否显示小红点
  value: number      // 徽标数字
  loaded: boolean    // 是否已加载（核心字段）
}

// 初始状态：只有首页标记为已加载
const tabs = ref<TabItem[]>([
  { title: '首页', icon: 'home', isDot: false, value: 0, loaded: true },
  { title: '点餐', icon: 'shop', isDot: false, value: 0, loaded: false },
  { title: '我的', icon: 'user', isDot: false, value: 0, loaded: false },
])
```

**性能优势：**

| 方案 | 首次加载 | 切换速度 | 状态保持 | 内存占用 |
|------|---------|---------|---------|---------|
| 纯 v-if | 快 | 慢（重新创建） | 不保持 | 低 |
| 纯 v-show | 慢（全部渲染） | 快 | 保持 | 高 |
| v-if + v-show | 快 | 快 | 保持 | 中 |

### 平台适配处理

针对支付宝小程序的特殊限制，使用条件编译进行平台适配：

```vue
<template>
  <!-- 非支付宝小程序：使用完整优化策略 -->
  <!-- #ifndef MP-ALIPAY -->
  <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
  <Menu v-if="tabs[1].loaded" v-show="currentTab === 1" />
  <My v-if="tabs[2].loaded" v-show="currentTab === 2" />
  <!-- #endif -->

  <!-- 支付宝小程序：仅使用 v-if -->
  <!-- #ifdef MP-ALIPAY -->
  <Home v-if="currentTab === 0" />
  <Menu v-if="currentTab === 1" />
  <My v-if="currentTab === 2" />
  <!-- #endif -->
</template>
```

**支付宝小程序限制说明：**

- 支付宝小程序对 `v-show` 的支持存在兼容性问题
- 同时使用 `v-if` 和 `v-show` 可能导致渲染异常
- 因此在支付宝小程序中退化为纯 `v-if` 方案

**条件编译语法：**

| 语法 | 说明 |
|------|------|
| `#ifdef MP-ALIPAY` | 仅在支付宝小程序中编译 |
| `#ifndef MP-ALIPAY` | 在非支付宝小程序中编译 |
| `#endif` | 条件编译结束标记 |

## 状态管理

### Tabbar Store

首页的标签状态通过 Pinia Store 进行管理，实现了状态的集中化和响应式更新。

```typescript
// stores/modules/tabbar.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WdTabbarItemProps } from '@/wd'

// Store 模块名称
const TABBAR_MODULE = 'tabbar'

// Tabbar 页面路径（不带前导斜杠）
const TABBAR_PAGE_PATH = 'pages/index/index'

export const useTabbarStore = defineStore(TABBAR_MODULE, () => {
  // 当前选中的标签索引
  const currentTab = ref(0)

  // 标签配置列表
  const tabs = ref<WdTabbarItemProps[]>([
    { title: '首页', icon: 'home', isDot: false, value: 0, loaded: true },
    { title: '点餐', icon: 'shop', isDot: false, value: 0, loaded: false },
    { title: '我的', icon: 'user', isDot: false, value: 0, loaded: false },
  ])

  /**
   * 切换到指定标签
   * @param index 标签索引
   * @param params 可选参数，用于传递额外数据
   */
  const toTab = async (index: number, params?: Record<string, any>) => {
    // 参数校验
    if (index < 0 || index >= tabs.value.length) {
      console.warn(`无效的标签索引: ${index}`)
      return
    }

    // 获取当前页面路径
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentPath = currentPage?.route || ''

    // 判断当前是否已在 Tabbar 页面
    const isOnTabbarPage = currentPath === TABBAR_PAGE_PATH

    if (isOnTabbarPage) {
      // 已在 Tabbar 页面，直接切换标签
      currentTab.value = index
      // 标记为已加载
      if (!tabs.value[index].loaded) {
        tabs.value[index].loaded = true
      }
    } else {
      // 不在 Tabbar 页面，先跳转再切换
      // 先设置目标标签，确保跳转后显示正确
      currentTab.value = index
      if (!tabs.value[index].loaded) {
        tabs.value[index].loaded = true
      }

      // 跳转到 Tabbar 页面
      uni.switchTab({
        url: `/${TABBAR_PAGE_PATH}`,
        fail: (err) => {
          console.error('跳转 Tabbar 页面失败:', err)
        },
      })
    }
  }

  /**
   * 更新标签小红点状态
   * @param index 标签索引
   * @param isDot 是否显示小红点
   */
  const updateDot = (index: number, isDot: boolean) => {
    if (index >= 0 && index < tabs.value.length) {
      tabs.value[index].isDot = isDot
      // 显示小红点时清除数字
      if (isDot) {
        tabs.value[index].value = 0
      }
    }
  }

  /**
   * 更新标签徽标数字
   * @param index 标签索引
   * @param value 徽标数字
   */
  const updateBadge = (index: number, value: number) => {
    if (index >= 0 && index < tabs.value.length) {
      tabs.value[index].value = value
      // 显示数字时关闭小红点
      if (value > 0) {
        tabs.value[index].isDot = false
      }
    }
  }

  /**
   * 清除标签徽标
   * @param index 标签索引
   */
  const clearBadge = (index: number) => {
    if (index >= 0 && index < tabs.value.length) {
      tabs.value[index].value = 0
      tabs.value[index].isDot = false
    }
  }

  /**
   * 重置所有标签的加载状态（除首页外）
   * 用于登出等场景
   */
  const resetLoaded = () => {
    tabs.value.forEach((tab, index) => {
      if (index !== 0) {
        tab.loaded = false
      }
    })
  }

  return {
    currentTab,
    tabs,
    toTab,
    updateDot,
    updateBadge,
    clearBadge,
    resetLoaded,
  }
})
```

**Store 核心功能：**

| 方法 | 说明 | 使用场景 |
|------|------|---------|
| `toTab(index)` | 切换到指定标签 | 底部导航点击、深层页面返回 |
| `updateDot(index, isDot)` | 更新小红点 | 新消息提示 |
| `updateBadge(index, value)` | 更新徽标数字 | 购物车数量、未读消息数 |
| `clearBadge(index)` | 清除徽标 | 查看后清除提示 |
| `resetLoaded()` | 重置加载状态 | 退出登录 |

### 在页面中使用 Store

```vue
<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useTabbarStore } from '@/stores'

const tabbarStore = useTabbarStore()

// 使用 storeToRefs 保持响应式
const { currentTab, tabs } = storeToRefs(tabbarStore)

// 处理标签切换
const handleTabChange = (index: number) => {
  tabbarStore.toTab(index)
}
</script>
```

**注意事项：**

- 使用 `storeToRefs` 解构响应式状态，而非直接解构
- 方法调用通过 store 实例，不需要 `storeToRefs`
- 状态变更会自动触发视图更新

### 跨组件标签操作

在任意页面或组件中都可以操作标签栏：

```typescript
// 在详情页跳转回首页的购物车标签
import { useTabbarStore } from '@/stores'

const tabbarStore = useTabbarStore()

// 跳转到购物车标签（索引 2）
const goToCart = () => {
  tabbarStore.toTab(2)
}

// 更新购物车徽标
const updateCartBadge = (count: number) => {
  tabbarStore.updateBadge(2, count)
}

// 显示新消息小红点
const showMessageDot = () => {
  tabbarStore.updateDot(2, true)
}
```

## 标签页组件

### Home 首页标签

首页标签展示了应用的主要内容，包括轮播广告、金刚区导航和商品列表。

```vue
<!-- components/tabbar/Home.vue -->
<template>
  <view class="min-h-100vh">
    <!-- 导航栏 -->
    <wd-navbar title="首页" />

    <!-- 轮播广告 -->
    <wd-swiper :list="swiperList" custom-class="m-2" />

    <!-- 金刚区导航 -->
    <wd-row custom-class="p-2 bg-white mx-4 rounded-xl" :gutter="16">
      <wd-col v-for="(item, index) in menuList" :key="index" :span="6">
        <view class="flex flex-col items-center py-2" @click="handleMenuClick(item)">
          <wd-icon :name="item.icon" size="60" :color="item.color" />
          <wd-text custom-class="mt-2" :text="item.title" />
        </view>
      </wd-col>
    </wd-row>

    <!-- 商品列表（分页加载） -->
    <wd-paging
      ref="pagingRef"
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
              <wd-text :text="`¥${item.price}`" size="32" type="error" bold />
              <wd-button type="primary" size="small" @click="handleBuy(item)">
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
import { ref, onMounted } from 'vue'
import type { GoodsQuery, GoodsVo } from '@/api/app/home/homeTypes'
import { listAds, pageGoods } from '@/api/app/home/homeApi'
import { usePayment } from '@/composables/usePayment'

// 支付 Composable
const { pay } = usePayment()

// 轮播图数据
const swiperList = ref<string[]>([])

// 金刚区菜单配置
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

// 商品列表查询参数
const queryParams = ref<GoodsQuery>({
  pageNum: 1,
  pageSize: 10,
  orderByColumn: 'createTime',
  isAsc: 'desc',
})

// 分页组件标签配置
const tabsConfig = ref([
  { name: 'all', title: '全部' },
  { name: 'hot', title: '热销' },
  { name: 'new', title: '新品' },
])

// 初始化轮播广告
const initAds = async () => {
  const [err, data] = await listAds()
  if (!err && data) {
    swiperList.value = data.map((ad) => ad.img)
  }
}

// 菜单点击处理
const handleMenuClick = (item: any) => {
  uni.showToast({ title: `点击了${item.title}`, icon: 'none' })
}

// 购买处理
const handleBuy = async (item: GoodsVo) => {
  try {
    await pay({
      orderNo: `ORDER_${Date.now()}`,
      amount: item.price,
      subject: item.name,
    })
    uni.showToast({ title: '支付成功', icon: 'success' })
  } catch (error) {
    console.error('支付失败:', error)
  }
}

onMounted(() => {
  initAds()
})
</script>
```

**Home 组件功能：**

- **wd-navbar**：顶部导航栏，显示页面标题
- **wd-swiper**：轮播图组件，展示广告或活动
- **金刚区**：8 宫格快捷入口，使用 `wd-row` + `wd-col` 布局
- **wd-paging**：分页列表组件，自动加载更多、下拉刷新

### Menu 点餐标签

点餐标签实现了侧边栏与内容联动的分类导航功能。

```vue
<!-- components/tabbar/Menu.vue -->
<template>
  <view>
    <wd-navbar title="点餐" />

    <view class="wrapper">
      <!-- 左侧分类导航 -->
      <wd-sidebar v-model="activeCategory" @change="handleCategoryChange">
        <wd-sidebar-item
          v-for="(item, index) in categories"
          :key="index"
          :value="index"
          :label="item.label"
        />
      </wd-sidebar>

      <!-- 右侧商品内容 -->
      <scroll-view
        class="content"
        scroll-y
        :scroll-with-animation="scrollWithAnimation"
        :scroll-top="scrollTop"
        @scroll="handleScroll"
      >
        <view v-for="(category, index) in categories" :key="index" class="category-section">
          <wd-cell-group :title="category.title" border>
            <wd-cell
              v-for="(goods, goodsIndex) in category.items"
              :key="goodsIndex"
              :title="goods.name"
              :label="goods.desc"
            >
              <template #icon>
                <wd-img :src="goods.img" width="80" height="80" radius="8" />
              </template>
              <template #default>
                <view class="flex items-center">
                  <wd-text :text="`¥${goods.price}`" type="error" />
                  <wd-stepper v-model="goods.count" :min="0" size="small" />
                </view>
              </template>
            </wd-cell>
          </wd-cell-group>
        </view>
      </scroll-view>
    </view>

    <!-- 底部购物栏 -->
    <view v-if="totalCount > 0" class="cart-bar">
      <view class="cart-info">
        <wd-badge :value="totalCount">
          <wd-icon name="cart" size="48" />
        </wd-badge>
        <wd-text :text="`¥${totalPrice}`" size="36" type="error" bold />
      </view>
      <wd-button type="primary" @click="handleCheckout">
        去结算
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, getCurrentInstance } from 'vue'

const activeCategory = ref(0)
const scrollTop = ref(0)
const scrollWithAnimation = ref(true)
const categoryScrollTops = ref<number[]>([])

// 分类数据
const categories = ref([
  {
    label: '热销',
    title: '热销推荐',
    items: [
      { name: '招牌炒饭', desc: '蛋炒饭升级版', price: 18, img: '/static/food1.jpg', count: 0 },
      { name: '红烧肉', desc: '肥而不腻', price: 28, img: '/static/food2.jpg', count: 0 },
    ],
  },
  {
    label: '主食',
    title: '主食类',
    items: [
      { name: '米饭', desc: '东北大米', price: 2, img: '/static/rice.jpg', count: 0 },
      { name: '面条', desc: '手工拉面', price: 12, img: '/static/noodle.jpg', count: 0 },
    ],
  },
  // 更多分类...
])

// 计算已选商品数量
const totalCount = computed(() => {
  return categories.value.reduce((sum, category) => {
    return sum + category.items.reduce((itemSum, item) => itemSum + item.count, 0)
  }, 0)
})

// 计算已选商品总价
const totalPrice = computed(() => {
  return categories.value.reduce((sum, category) => {
    return sum + category.items.reduce((itemSum, item) => itemSum + item.count * item.price, 0)
  }, 0)
})

// 分类切换处理
const handleCategoryChange = ({ value }: { value: number }) => {
  activeCategory.value = value
  scrollTop.value = categoryScrollTops.value[value] || 0
}

// 滚动监听，联动左侧分类高亮
const handleScroll = (e: any) => {
  const { scrollTop: currentScrollTop } = e.detail

  // 根据滚动位置计算当前分类
  const index = categoryScrollTops.value.findIndex(
    (top, i) => currentScrollTop < (categoryScrollTops.value[i + 1] || Infinity)
  )

  if (index !== -1 && activeCategory.value !== index) {
    scrollWithAnimation.value = false
    activeCategory.value = index
  }
}

// 去结算
const handleCheckout = () => {
  uni.navigateTo({ url: '/pages/order/confirm' })
}
</script>

```

**Menu 组件功能：**

- **wd-sidebar**：左侧分类导航，支持滚动联动
- **scroll-view**：右侧可滚动的商品列表
- **wd-stepper**：商品数量步进器
- **购物栏**：底部显示已选商品数量和总价

### My 我的标签

我的标签展示用户信息和各类快捷功能入口，采用了透明渐变导航栏效果。

```vue
<!-- components/tabbar/My.vue -->
<template>
  <view class="min-h-100vh bg-#FFFCF5 pb-10">
    <!-- 透明渐变导航栏 -->
    <wd-navbar
      :bg-color="`rgba(255,252,245,${scrollTop / 60})`"
      :title="t('app.my.title')"
    />

    <!-- 背景装饰 -->
    <view class="relative">
      <view
        class="absolute top-0 h-35 w-35 rounded-full filter-blur-lg -left-10"
        style="background: linear-gradient(120deg, #f3f4f600 0%, #ffedda 100%)"
      />
    </view>

    <!-- 用户信息头部 -->
    <view class="relative pt-10">
      <view class="flex flex-col items-center justify-center">
        <!-- 用户头像 -->
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

        <!-- 用户昵称 -->
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
      <wd-grid :column="5" :items="orderTypes" clickable @item-click="handleOrderClick" />
    </wd-cell-group>

    <!-- 快捷功能 -->
    <wd-cell-group custom-class="mt-2 mx-3" title="快捷功能">
      <wd-cell
        v-for="(item, index) in quickActions"
        :key="index"
        :title="item.title"
        :icon="item.icon"
        is-link
        @click="handleActionClick(item)"
      />
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
import { ref, onMounted } from 'vue'
import { useMessage, useToast } from '@/wd'
import { useI18n } from '@/composables/useI18n'
import { useScroll, useAuth } from '@/composables'
import { useUserStore } from '@/stores'

const { confirm } = useMessage()
const toast = useToast()
const { t } = useI18n()
const { scrollTop } = useScroll()
const auth = useAuth()
const userStore = useUserStore()

// 统计数据
const statsData = ref([
  { label: '优惠券', value: '3', type: 'coupon' },
  { label: '积分', value: '1285', type: 'points' },
  { label: '余额', value: '268', type: 'balance' },
])

// 订单类型入口
const orderTypes = ref([
  { text: '待付款', icon: 'wallet' },
  { text: '待发货', icon: 'calendar' },
  { text: '待收货', icon: 'location' },
  { text: '待评价', icon: 'star' },
  { text: '退款/售后', icon: 'service' },
])

// 快捷功能
const quickActions = ref([
  { title: '收货地址', icon: 'location', url: '/pages/address/list' },
  { title: '我的收藏', icon: 'star', url: '/pages/favorite/list' },
  { title: '浏览记录', icon: 'clock', url: '/pages/history/list' },
  { title: '意见反馈', icon: 'comment', url: '/pages/feedback/index' },
  { title: '关于我们', icon: 'info', url: '/pages/about/index' },
  { title: '设置', icon: 'setting', url: '/pages/setting/index' },
])

// 用户信息点击
const handleUserInfo = () => {
  if (auth.isLoggedIn.value) {
    uni.navigateTo({ url: '/pages/user/profile' })
  } else {
    auth.login()
  }
}

// 统计数据点击
const handleStatClick = (stat: any) => {
  const routes: Record<string, string> = {
    coupon: '/pages/coupon/list',
    points: '/pages/points/index',
    balance: '/pages/balance/index',
  }
  const url = routes[stat.type]
  if (url) {
    uni.navigateTo({ url })
  }
}

// 订单类型点击
const handleOrderClick = (item: any) => {
  uni.navigateTo({ url: `/pages/order/list?status=${item.text}` })
}

// 快捷功能点击
const handleActionClick = (item: any) => {
  uni.navigateTo({ url: item.url })
}

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

onMounted(async () => {
  if (auth.isLoggedIn.value) {
    await userStore.fetchUserInfo()
  }
})
</script>
```

**My 组件功能：**

- **透明导航栏**：根据滚动位置动态调整透明度
- **用户信息**：头像、昵称展示，支持点击编辑
- **统计数据**：优惠券、积分、余额等数据展示
- **订单入口**：5 种订单状态的快捷入口
- **快捷功能**：收货地址、收藏、设置等常用功能

## 滚动状态管理

### useScroll Composable

首页使用 `useScroll` Composable 统一管理滚动状态，实现滚动位置记录、滚动监听等功能。

```typescript
// composables/useScroll.ts
import { ref, onMounted, onUnmounted } from 'vue'

// 全局滚动位置
const scrollTop = ref(0)
const scrollTopValue = ref(0)

export function useScroll() {
  /**
   * 滚动事件处理
   */
  const handleScroll = (e: any) => {
    scrollTop.value = e.detail.scrollTop
  }

  /**
   * 滚动到顶部
   * @param duration 动画时长（毫秒）
   */
  const scrollToTop = (duration = 300) => {
    // 设置一个不同的值触发滚动
    scrollTopValue.value = scrollTop.value > 0 ? 0 : 0.1

    // 重置为 0
    setTimeout(() => {
      scrollTopValue.value = 0
    }, 50)
  }

  /**
   * 滚动到指定位置
   * @param top 目标位置
   */
  const scrollTo = (top: number) => {
    scrollTopValue.value = top
  }

  return {
    scrollTop,
    scrollTopValue,
    handleScroll,
    scrollToTop,
    scrollTo,
  }
}
```

**使用示例：**

```vue
<template>
  <scroll-view
    scroll-y
    :scroll-top="scrollTopValue"
    @scroll="handleScroll"
  >
    <!-- 内容 -->

    <!-- 返回顶部按钮 -->
    <wd-fab
      v-show="scrollTop > 300"
      icon="arrow-up"
      @click="scrollToTop"
    />
  </scroll-view>
</template>

<script lang="ts" setup>
import { useScroll } from '@/composables'

const { scrollTop, scrollTopValue, handleScroll, scrollToTop } = useScroll()
</script>
```

### 透明导航栏效果

利用滚动位置实现导航栏透明度渐变：

```vue
<template>
  <wd-navbar
    :bg-color="`rgba(255, 252, 245, ${opacity})`"
    :title-color="titleColor"
    title="我的"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useScroll } from '@/composables'

const { scrollTop } = useScroll()

// 透明度计算（0-60px 滚动距离）
const opacity = computed(() => {
  return Math.min(scrollTop.value / 60, 1)
})

// 标题颜色（透明度高时显示深色）
const titleColor = computed(() => {
  return opacity.value > 0.5 ? '#333333' : 'transparent'
})
</script>
```

## 分享功能

### useShare Composable

首页通过 `useShare` Composable 配置微信小程序分享功能。

```typescript
// composables/useShare.ts
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

interface ShareOptions {
  title?: string
  path?: string
  imageUrl?: string
}

export function useShare(options: ShareOptions = {}) {
  // 分享给朋友
  onShareAppMessage(() => {
    return {
      title: options.title || 'RuoYi-Plus-UniApp',
      path: options.path || '/pages/index/index',
      imageUrl: options.imageUrl,
    }
  })

  // 分享到朋友圈
  onShareTimeline(() => {
    return {
      title: options.title || 'RuoYi-Plus-UniApp',
      query: `path=${options.path || '/pages/index/index'}`,
      imageUrl: options.imageUrl,
    }
  })
}
```

**在首页使用：**

```vue
<script lang="ts" setup>
import { useShare } from '@/composables'

// 启用默认分享配置
useShare()

// 或自定义分享内容
useShare({
  title: '发现一个好用的应用',
  path: '/pages/index/index?from=share',
  imageUrl: '/static/share-cover.png',
})
</script>
```

**分享配置说明：**

| 配置项 | 说明 | 默认值 |
|-------|------|--------|
| `title` | 分享标题 | 应用名称 |
| `path` | 分享路径 | 首页路径 |
| `imageUrl` | 分享图片 | 页面截图 |

## 页面配置

### pages.json 配置

首页在 `pages.json` 中需要进行相应配置：

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "navigationStyle": "custom",
        "enablePullDownRefresh": false,
        "app-plus": {
          "bounce": "none"
        }
      }
    }
  ],
  "tabBar": {
    "custom": true,
    "color": "#999999",
    "selectedColor": "#4D80F0",
    "backgroundColor": "#ffffff",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/tabbar/home.png",
        "selectedIconPath": "static/tabbar/home-active.png"
      }
    ]
  },
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#f8f8f8"
  }
}
```

**配置说明：**

| 配置项 | 值 | 说明 |
|-------|-----|------|
| `navigationStyle` | `custom` | 使用自定义导航栏 |
| `enablePullDownRefresh` | `false` | 禁用页面级下拉刷新 |
| `tabBar.custom` | `true` | 使用自定义 Tabbar |
| `bounce` | `none` | App 端禁用橡皮筋效果 |

### 自定义 Tabbar 说明

由于使用了自定义 Tabbar，原生 tabBar 配置仅用于：

1. 声明 Tabbar 页面路径
2. 提供给系统识别 Tabbar 页面
3. 小程序审核时的配置要求

实际的 Tabbar 渲染和逻辑由 `wd-tabbar` 组件和 Pinia Store 控制。

## API

### Page Props

首页作为入口页面，主要通过路由参数接收数据：

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `tab` | 初始标签索引 | `number` | `0` |
| `from` | 来源标识 | `string` | - |

**路由参数示例：**

```typescript
// 跳转到首页的"我的"标签
uni.switchTab({
  url: '/pages/index/index?tab=2',
})

// 从分享进入
// /pages/index/index?from=share
```

### Tabbar Store API

| 方法/属性 | 说明 | 类型 |
|----------|------|------|
| `currentTab` | 当前标签索引 | `Ref<number>` |
| `tabs` | 标签配置列表 | `Ref<TabItem[]>` |
| `toTab(index, params?)` | 切换到指定标签 | `Function` |
| `updateDot(index, isDot)` | 更新小红点状态 | `Function` |
| `updateBadge(index, value)` | 更新徽标数字 | `Function` |
| `clearBadge(index)` | 清除徽标 | `Function` |
| `resetLoaded()` | 重置加载状态 | `Function` |

### 类型定义

```typescript
/**
 * 标签项配置
 */
interface TabItem {
  /** 标签标题 */
  title: string
  /** 图标名称 */
  icon: string
  /** 是否显示小红点 */
  isDot: boolean
  /** 徽标数字 */
  value: number
  /** 是否已加载 */
  loaded: boolean
}

/**
 * 滚动事件参数
 */
interface ScrollEvent {
  detail: {
    scrollTop: number
    scrollHeight: number
    scrollLeft: number
    scrollWidth: number
  }
}

/**
 * 分享配置
 */
interface ShareOptions {
  /** 分享标题 */
  title?: string
  /** 分享路径 */
  path?: string
  /** 分享图片 */
  imageUrl?: string
}

/**
 * Tabbar Store 类型
 */
interface TabbarStore {
  currentTab: Ref<number>
  tabs: Ref<TabItem[]>
  toTab: (index: number, params?: Record<string, any>) => Promise<void>
  updateDot: (index: number, isDot: boolean) => void
  updateBadge: (index: number, value: number) => void
  clearBadge: (index: number) => void
  resetLoaded: () => void
}
```

## 最佳实践

### 1. 合理使用懒加载

利用 `loaded` 标记实现标签内容的懒加载：

```vue
<script lang="ts" setup>
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTabbarStore } from '@/stores'

const tabbarStore = useTabbarStore()
const { tabs } = storeToRefs(tabbarStore)

// 监听标签加载状态，执行初始化
watch(
  () => tabs.value[2].loaded,
  (loaded) => {
    if (loaded) {
      // "我的"标签首次加载时获取用户信息
      fetchUserInfo()
    }
  },
)
</script>
```

### 2. 正确处理标签切换

使用 Store 的 `toTab` 方法统一处理标签切换：

```typescript
// 推荐：使用 Store 方法
const handleGoToMy = () => {
  tabbarStore.toTab(2) // 自动处理页面跳转和状态更新
}

// 不推荐：直接修改状态
const handleGoToMy = () => {
  currentTab.value = 2 // 可能导致状态不一致
}
```

### 3. 徽标更新时机

在合适的时机更新标签徽标：

```typescript
// 获取未读消息数后更新徽标
const fetchUnreadCount = async () => {
  const count = await getUnreadMessageCount()
  tabbarStore.updateBadge(2, count) // 更新"我的"标签徽标
}

// 查看消息后清除徽标
const handleViewMessages = () => {
  tabbarStore.clearBadge(2)
}

// 有新消息时显示小红点
const handleNewMessage = () => {
  tabbarStore.updateDot(2, true)
}
```

### 4. 退出登录时重置状态

用户退出登录时重置标签加载状态：

```typescript
const handleLogout = async () => {
  await userStore.logoutUser()

  // 重置标签加载状态
  tabbarStore.resetLoaded()

  // 切换回首页
  tabbarStore.toTab(0)
}
```

### 5. 处理分享参数

正确处理分享链接带来的参数：

```vue
<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'

onLoad((options) => {
  // 处理分享来源
  if (options?.from === 'share') {
    // 记录分享统计
    trackShareEntry()
  }

  // 处理指定标签
  if (options?.tab) {
    const tabIndex = parseInt(options.tab)
    tabbarStore.toTab(tabIndex)
  }
})
</script>
```

## 常见问题

### 1. 标签切换后数据丢失

**问题原因：**

- 使用了纯 `v-if` 导致组件被销毁重建
- 数据存储在组件内部而非 Store

**解决方案：**

```vue
<!-- 使用 v-if + v-show 组合 -->
<template>
  <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
</template>

<!-- 或将数据存储在 Store 中 -->
<script lang="ts" setup>
import { useHomeStore } from '@/stores'

// 数据持久化在 Store 中
const homeStore = useHomeStore()
</script>
```

### 2. 支付宝小程序渲染异常

**问题原因：**

- 支付宝小程序对 `v-show` 支持有兼容性问题
- 同时使用 `v-if` 和 `v-show` 可能冲突

**解决方案：**

```vue
<template>
  <!-- 使用条件编译区分平台 -->
  <!-- #ifndef MP-ALIPAY -->
  <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
  <!-- #endif -->

  <!-- #ifdef MP-ALIPAY -->
  <Home v-if="currentTab === 0" />
  <!-- #endif -->
</template>
```

### 3. 滚动位置无法恢复

**问题原因：**

- 切换标签后 scroll-view 重置了滚动位置
- 未正确保存和恢复滚动位置

**解决方案：**

```typescript
// 为每个标签保存滚动位置
const scrollPositions = ref<number[]>([0, 0, 0])

const handleScroll = (e: any) => {
  scrollPositions.value[currentTab.value] = e.detail.scrollTop
}

// 切换标签时恢复滚动位置
watch(currentTab, (newTab) => {
  nextTick(() => {
    scrollTopValue.value = scrollPositions.value[newTab]
  })
})
```

### 4. 从深层页面返回标签不正确

**问题原因：**

- 使用 `uni.navigateBack()` 返回时未指定目标标签
- Store 状态未正确设置

**解决方案：**

```typescript
// 在详情页返回前设置目标标签
const handleBackToCart = () => {
  // 先设置目标标签
  tabbarStore.toTab(2)

  // 然后返回
  uni.navigateBack()
}

// 或使用页面参数
const handleBackToCart = () => {
  uni.navigateBack({
    delta: 1,
    success: () => {
      // 返回成功后切换标签
      tabbarStore.toTab(2)
    },
  })
}
```

### 5. 透明导航栏在 iOS 上闪烁

**问题原因：**

- 滚动事件触发频率过高
- 透明度计算导致频繁重绘

**解决方案：**

```typescript
import { ref, computed } from 'vue'

const scrollTop = ref(0)
let lastScrollTop = 0
let rafId: number | null = null

// 使用 requestAnimationFrame 节流
const handleScroll = (e: any) => {
  const currentScrollTop = e.detail.scrollTop

  if (rafId) return

  rafId = requestAnimationFrame(() => {
    scrollTop.value = currentScrollTop
    lastScrollTop = currentScrollTop
    rafId = null
  })
}

// 使用 CSS transform 代替 opacity 减少重绘
const navbarStyle = computed(() => {
  const opacity = Math.min(scrollTop.value / 60, 1)
  return {
    backgroundColor: `rgba(255, 252, 245, ${opacity})`,
    willChange: 'background-color',
  }
})
```

### 6. 分享参数丢失

**问题原因：**

- 分享路径配置错误
- 参数编码问题

**解决方案：**

```typescript
// 正确编码分享参数
onShareAppMessage(() => {
  const params = encodeURIComponent(JSON.stringify({
    from: 'share',
    userId: userStore.userInfo?.id,
  }))

  return {
    title: '分享标题',
    path: `/pages/index/index?params=${params}`,
  }
})

// 解析分享参数
onLoad((options) => {
  if (options?.params) {
    try {
      const params = JSON.parse(decodeURIComponent(options.params))
      console.log('分享参数:', params)
    } catch (e) {
      console.error('解析分享参数失败:', e)
    }
  }
})
```

### 7. 自定义 Tabbar 与原生 Tabbar 冲突

**问题原因：**

- pages.json 中配置了原生 tabBar
- 同时使用了自定义 wd-tabbar 组件

**解决方案：**

```json
// pages.json
{
  "tabBar": {
    "custom": true,  // 关键：声明使用自定义 tabBar
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      }
    ]
  }
}
```

同时创建自定义 tabBar 组件目录（小程序要求）：

```
src/
├── custom-tab-bar/        # 小程序自定义 tabBar 目录
│   └── index.js           # 空文件或简单占位
└── pages/
    └── index/
        └── index.vue
```
