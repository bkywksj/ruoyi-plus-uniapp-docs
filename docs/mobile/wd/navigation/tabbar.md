---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/navigation/tabbar
---

# Tabbar 标签栏

## 介绍

Tabbar 标签栏组件是一个底部导航栏组件,用于在不同页面或功能模块之间进行快速切换。它是移动应用中最常用的导航组件之一,通常固定在页面底部,提供 3-5 个主要功能入口。组件支持两种使用模式:子组件模式和配置数组模式,可以灵活适应不同的开发场景。标签栏集成了图标、文字、徽标等多种视觉元素,支持圆角样式、安全区域适配、懒加载等高级特性,能够满足各种复杂的移动端导航需求。

**核心特性:**

- **双模式支持** - 支持子组件模式(`wd-tabbar-item`)和配置数组模式(`items`),开发者可以根据项目需求选择最适合的使用方式,子组件模式更直观灵活,数组模式更适合动态配置
- **固定定位与占位** - 默认固定在页面底部,自动计算并生成等高的占位元素,避免页面内容被标签栏遮挡,确保良好的用户体验和页面布局
- **双形状设计** - 提供 `default`(默认矩形)和 `round`(圆角胶囊)两种形状样式,圆角样式带有阴影效果和左右边距,视觉效果更加现代化
- **徽标系统** - 深度集成 Badge 徽标组件,支持数字徽标、小红点、自定义最大值等功能,方便显示未读消息、待办事项等提示信息
- **双色主题** - 通过 `activeColor` 和 `inactiveColor` 属性自定义激活和未激活状态的颜色,轻松实现品牌色定制,支持暗黑模式自动适配
- **懒加载机制** - 内置 `loaded` 属性支持页面懒加载,首次点击标签时自动标记为已加载,配合条件渲染可以优化应用性能,减少初始加载时间
- **安全区域适配** - 自动处理 iPhone X 等刘海屏设备的底部安全区域,`safeAreaInsetBottom` 属性确保标签栏在各种设备上都能正确显示
- **灵活定制** - 支持自定义图标、文字大小、层级、边框、插槽等,提供丰富的配置选项和插槽,满足各种个性化需求

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:1-503

## 基本用法

### 子组件模式

使用 `wd-tabbar-item` 子组件定义标签项,这是最直观和灵活的使用方式,适合静态配置的标签栏。

```vue
<template>
  <view class="demo">
    <wd-tabbar v-model="activeTab">
      <wd-tabbar-item icon="home-outline" title="首页" name="home" />
      <wd-tabbar-item icon="search" title="搜索" name="search" />
      <wd-tabbar-item icon="bell-outline" title="消息" name="message" />
      <wd-tabbar-item icon="user" title="我的" name="mine" />
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref('home')
</script>

```

**使用说明:**
- 通过 `v-model` 双向绑定当前激活的标签,值为标签的 `name` 或索引
- 每个 `wd-tabbar-item` 代表一个标签项,通过 `icon` 和 `title` 设置图标和文字
- `name` 属性是标签的唯一标识,如果不设置则使用索引值
- 标签栏默认固定在页面底部,需要为页面内容预留底部空间

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:46-48

### Items 配置模式

通过 `items` 数组配置标签项,适合需要动态生成标签栏的场景。

```vue
<template>
  <view class="demo">
    <wd-tabbar v-model="activeTab" :items="tabbarItems" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { WdTabbarItemProps } from '@/wd'

const activeTab = ref('home')

const tabbarItems = ref<WdTabbarItemProps[]>([
  {
    name: 'home',
    title: '首页',
    icon: 'home-outline',
  },
  {
    name: 'category',
    title: '分类',
    icon: 'grid',
  },
  {
    name: 'cart',
    title: '购物车',
    icon: 'cart-outline',
    value: 5, // 显示数字徽标
  },
  {
    name: 'mine',
    title: '我的',
    icon: 'user',
    isDot: true, // 显示小红点
  },
])
</script>

```

**使用说明:**
- 通过 `items` 属性传入标签配置数组,每个对象包含标签的所有配置信息
- 配置对象支持 `name`、`title`、`icon`、`activeIcon`、`value`、`isDot` 等属性
- 数组模式更适合从后端接口获取配置或需要动态修改标签项的场景
- 可以直接在配置中设置徽标相关属性,无需额外嵌套

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:12-44, src/wd/components/wd-tabbar/wd-tabbar.vue:164-166

### 带徽标显示

标签项可以显示徽标,支持数字徽标和小红点两种形式。

```vue
<template>
  <view class="demo">
    <wd-tabbar v-model="activeTab">
      <wd-tabbar-item icon="home-outline" title="首页" name="home" />

      <!-- 数字徽标 -->
      <wd-tabbar-item
        icon="bell-outline"
        title="消息"
        name="message"
        :value="messageCount"
        :max="99"
      />

      <!-- 小红点 -->
      <wd-tabbar-item
        icon="cart-outline"
        title="购物车"
        name="cart"
        is-dot
      />

      <!-- 自定义徽标属性 -->
      <wd-tabbar-item
        icon="user"
        title="我的"
        name="mine"
        :value="3"
        :badge-props="{ bgColor: '#ff4d4f', top: '4rpx', right: '8rpx' }"
      />
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref('home')
const messageCount = ref(128)
</script>

```

**技术实现:**
- 标签项内部集成了 `wd-badge` 组件,通过 `value` 属性显示数字徽标
- `is-dot` 属性可以显示小红点样式,适合仅作提示不需要显示具体数量的场景
- `max` 属性设置数字徽标的最大值,超出显示为 `max+`,默认为 99
- `badge-props` 属性可以透传更多配置给 Badge 组件,如位置、颜色、偏移等
- 徽标会自动继承标签栏的激活颜色,也可以单独定制

参考: src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:7, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:111-130

### 圆角样式

通过 `shape` 属性设置标签栏的形状,支持默认矩形和圆角胶囊两种样式。

```vue
<template>
  <view class="demo">
    <!-- 默认矩形样式 -->
    <view class="section">
      <text class="section-title">默认样式</text>
      <wd-tabbar v-model="activeTab1" shape="default">
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 圆角胶囊样式 -->
    <view class="section">
      <text class="section-title">圆角样式</text>
      <wd-tabbar v-model="activeTab2" shape="round">
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
</script>

```

**使用说明:**
- `shape="default"` 为默认矩形样式,标签栏占满整个底部宽度,有顶部边框
- `shape="round"` 为圆角胶囊样式,标签栏左右各有 32rpx 边距,带圆角和阴影效果
- 圆角样式的视觉效果更加现代化,适合年轻化、时尚化的应用设计
- 圆角样式在固定定位时,底部安全区域的处理方式与默认样式不同

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:9, src/wd/components/wd-tabbar/wd-tabbar.vue:418-445

### 自定义颜色

通过 `activeColor` 和 `inactiveColor` 属性自定义激活和未激活状态的颜色。

```vue
<template>
  <view class="demo">
    <!-- 品牌色主题 -->
    <view class="section">
      <text class="section-title">品牌色主题</text>
      <wd-tabbar
        v-model="activeTab1"
        active-color="#1989fa"
        inactive-color="#969799"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="cart-outline" title="购物车" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 渐变色主题 -->
    <view class="section">
      <text class="section-title">紫色主题</text>
      <wd-tabbar
        v-model="activeTab2"
        active-color="#7232dd"
        inactive-color="#c8c9cc"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="cart-outline" title="购物车" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 暖色主题 -->
    <view class="section">
      <text class="section-title">暖色主题</text>
      <wd-tabbar
        v-model="activeTab3"
        active-color="#ff6b22"
        inactive-color="#aaa"
        shape="round"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="cart-outline" title="购物车" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
const activeTab3 = ref(0)
</script>

```

**技术实现:**
- `activeColor` 属性设置激活标签的图标和文字颜色
- `inactiveColor` 属性设置未激活标签的图标和文字颜色
- 颜色会应用到标签的图标和文字上,自动处理样式继承
- 支持任何 CSS 颜色值,包括十六进制、RGB、颜色名称等
- 颜色优先级:子组件单独设置 > 标签栏统一设置 > 主题默认值

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:268-279, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:178-207

### 切换图标

可以为激活和未激活状态设置不同的图标,增强视觉反馈效果。

```vue
<template>
  <view class="demo">
    <wd-tabbar v-model="activeTab">
      <!-- 使用 activeIcon 切换图标 -->
      <wd-tabbar-item
        icon="home-outline"
        active-icon="home"
        title="首页"
        name="home"
      />

      <wd-tabbar-item
        icon="bell-outline"
        active-icon="bell"
        title="消息"
        name="message"
        :value="5"
      />

      <wd-tabbar-item
        icon="cart-outline"
        active-icon="cart"
        title="购物车"
        name="cart"
      />

      <wd-tabbar-item
        icon="user-circle"
        active-icon="user"
        title="我的"
        name="mine"
      />
    </wd-tabbar>

    <!-- Items 模式下的切换图标 -->
    <view style="margin-top: 160rpx;">
      <wd-tabbar v-model="activeTab2" :items="items" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { WdTabbarItemProps } from '@/wd'

const activeTab = ref('home')
const activeTab2 = ref('home')

const items = ref<WdTabbarItemProps[]>([
  {
    name: 'home',
    title: '首页',
    icon: 'home-outline',
    activeIcon: 'home', // 激活时的图标
  },
  {
    name: 'message',
    title: '消息',
    icon: 'bell-outline',
    activeIcon: 'bell',
  },
  {
    name: 'cart',
    title: '购物车',
    icon: 'cart-outline',
    activeIcon: 'cart',
  },
  {
    name: 'mine',
    title: '我的',
    icon: 'user-circle',
    activeIcon: 'user',
  },
])
</script>

```

**使用说明:**
- 通过 `active-icon` 属性设置激活状态时显示的图标
- 未激活时显示 `icon` 属性指定的图标,激活时自动切换为 `active-icon`
- 通常使用线性图标作为未激活状态,填充图标作为激活状态,视觉效果更明显
- Items 模式下同样支持 `activeIcon` 配置
- 如果不设置 `activeIcon`,则激活和未激活状态使用相同图标,仅颜色不同

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:229-239, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:214-222

### 自定义图标插槽

使用插槽可以完全自定义标签的图标内容,实现更复杂的视觉效果。

```vue
<template>
  <view class="demo">
    <wd-tabbar v-model="activeTab">
      <!-- 普通图标 -->
      <wd-tabbar-item icon="home-outline" title="首页" name="home" />

      <!-- 自定义图标插槽 -->
      <wd-tabbar-item title="扫一扫" name="scan">
        <template #icon="{ active }">
          <view class="custom-icon" :class="{ active }">
            <wd-icon name="scan" size="48rpx" />
          </view>
        </template>
      </wd-tabbar-item>

      <!-- 图片图标 -->
      <wd-tabbar-item title="相册" name="album">
        <template #icon="{ active }">
          <image
            class="icon-image"
            :src="active ? albumActiveIcon : albumIcon"
          />
        </template>
      </wd-tabbar-item>

      <wd-tabbar-item icon="user" title="我的" name="mine" />
    </wd-tabbar>

    <!-- Items 模式下的自定义插槽 -->
    <view style="margin-top: 160rpx;">
      <wd-tabbar v-model="activeTab2" :items="items">
        <!-- 具名插槽:icon-{name} -->
        <template #icon-special="{ active }">
          <view class="special-icon" :class="{ glow: active }">
            <text class="icon-text">✨</text>
          </view>
        </template>
      </wd-tabbar>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { WdTabbarItemProps } from '@/wd'

const activeTab = ref('home')
const activeTab2 = ref('home')

const albumIcon = '/static/images/album-inactive.png'
const albumActiveIcon = '/static/images/album-active.png'

const items = ref<WdTabbarItemProps[]>([
  { name: 'home', title: '首页', icon: 'home-outline' },
  { name: 'special', title: '特别' }, // 使用插槽自定义
  { name: 'mine', title: '我的', icon: 'user' },
])
</script>

```

**使用说明:**
- 子组件模式使用 `#icon` 插槽自定义图标内容
- Items 模式使用 `#icon-{name}` 具名插槽,其中 `{name}` 是标签的 name 属性
- 插槽接收 `active` 参数,表示当前标签是否激活,可以根据状态渲染不同内容
- 可以使用图片、自定义图标、动画效果等实现个性化的标签图标
- 使用插槽后,`icon` 和 `active-icon` 属性将被忽略

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:26-33, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:12-19

## 高级用法

### 懒加载页面

利用 `loaded` 属性实现标签页的懒加载,优化应用性能。

```vue
<template>
  <view class="demo">
    <!-- 标签栏 -->
    <wd-tabbar v-model="activeTab" :items="tabItems" @update:items="handleItemsUpdate" />

    <!-- 页面内容 -->
    <view class="content">
      <!-- 首页 - 总是渲染 -->
      <view v-show="activeTab === 'home'" class="page">
        <HomePage />
      </view>

      <!-- 分类页 - 懒加载 -->
      <view v-if="getPageLoaded('category')" v-show="activeTab === 'category'" class="page">
        <CategoryPage />
      </view>

      <!-- 购物车 - 懒加载 -->
      <view v-if="getPageLoaded('cart')" v-show="activeTab === 'cart'" class="page">
        <CartPage />
      </view>

      <!-- 我的页面 - 懒加载 -->
      <view v-if="getPageLoaded('mine')" v-show="activeTab === 'mine'" class="page">
        <MinePage />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { WdTabbarItemProps } from '@/wd'
import HomePage from './components/HomePage.vue'
import CategoryPage from './components/CategoryPage.vue'
import CartPage from './components/CartPage.vue'
import MinePage from './components/MinePage.vue'

const activeTab = ref('home')

const tabItems = ref<WdTabbarItemProps[]>([
  {
    name: 'home',
    title: '首页',
    icon: 'home-outline',
    loaded: true, // 首页默认已加载
  },
  {
    name: 'category',
    title: '分类',
    icon: 'grid',
    loaded: false,
  },
  {
    name: 'cart',
    title: '购物车',
    icon: 'cart-outline',
    loaded: false,
  },
  {
    name: 'mine',
    title: '我的',
    icon: 'user',
    loaded: false,
  },
])

/**
 * 处理 items 更新
 * 组件会在点击标签时自动更新 loaded 状态
 */
const handleItemsUpdate = (items: WdTabbarItemProps[]) => {
  tabItems.value = items
  console.log('标签加载状态更新:', items)
}

/**
 * 获取页面是否已加载
 */
const getPageLoaded = (name: string) => {
  const item = tabItems.value.find(item => item.name === name)
  return item?.loaded ?? false
}
</script>

```

**技术实现:**
- 组件内部会在点击标签时自动将 `loaded` 设置为 `true`
- 通过监听 `update:items` 事件同步组件内部的 loaded 状态到外部
- 使用 `v-if` 配合 `loaded` 属性实现页面的懒加载,首次点击才渲染页面
- 使用 `v-show` 控制页面显示隐藏,保持已加载页面的状态
- 这种方式可以显著减少应用的初始加载时间和内存占用

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:329-334, src/wd/components/wd-tabbar/wd-tabbar.vue:365-375, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:228-239

### 非固定定位

标签栏可以不固定在底部,作为普通内联元素使用。

```vue
<template>
  <view class="demo">
    <view class="header">页面头部内容</view>

    <view class="content">
      <text>页面主要内容区域</text>
      <text>滚动内容...</text>
    </view>

    <!-- 非固定定位的标签栏 -->
    <wd-tabbar
      v-model="activeTab"
      :fixed="false"
      :placeholder="false"
    >
      <wd-tabbar-item icon="home-outline" title="首页" />
      <wd-tabbar-item icon="search" title="搜索" />
      <wd-tabbar-item icon="cart-outline" title="购物车" />
      <wd-tabbar-item icon="user" title="我的" />
    </wd-tabbar>

    <!-- 或者放在页面中间 -->
    <view class="section">
      <text class="section-title">内联标签栏</text>
      <wd-tabbar
        v-model="activeTab2"
        :fixed="false"
        shape="round"
      >
        <wd-tabbar-item icon="grid" title="全部" />
        <wd-tabbar-item icon="fire" title="热门" />
        <wd-tabbar-item icon="heart" title="收藏" />
      </wd-tabbar>
    </view>

    <view class="footer">页面底部内容</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
const activeTab2 = ref(0)
</script>

```

**使用说明:**
- 设置 `:fixed="false"` 取消固定定位,标签栏作为普通元素嵌入文档流
- 同时建议设置 `:placeholder="false"` 关闭占位元素
- 非固定模式适合特殊的页面布局需求,如分段导航、模块切换等
- 可以与圆角样式结合,实现类似选项卡的效果
- 非固定模式下,安全区域适配仍然生效,但通常不需要

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:100-113, src/wd/components/wd-tabbar/wd-tabbar.vue:190-198

### 监听切换事件

监听标签切换事件,执行页面跳转、数据加载等操作。

```vue
<template>
  <view class="demo">
    <view class="info">
      <text>当前标签: {{ currentTabName }}</text>
      <text>切换次数: {{ changeCount }}</text>
    </view>

    <wd-tabbar v-model="activeTab" @change="handleTabChange">
      <wd-tabbar-item icon="home-outline" title="首页" name="home" />
      <wd-tabbar-item icon="search" title="搜索" name="search" />
      <wd-tabbar-item icon="bell-outline" title="消息" name="message" />
      <wd-tabbar-item icon="user" title="我的" name="mine" />
    </wd-tabbar>

    <!-- 页面内容 -->
    <view class="content">
      <view v-if="activeTab === 'home'" class="page">
        <text>首页内容</text>
      </view>
      <view v-else-if="activeTab === 'search'" class="page">
        <text>搜索页面</text>
      </view>
      <view v-else-if="activeTab === 'message'" class="page">
        <text>消息列表</text>
      </view>
      <view v-else-if="activeTab === 'mine'" class="page">
        <text>个人中心</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from '@/hooks/useRouter'

const activeTab = ref('home')
const changeCount = ref(0)

const router = useRouter()

const tabNames: Record<string, string> = {
  home: '首页',
  search: '搜索',
  message: '消息',
  mine: '我的',
}

const currentTabName = computed(() => {
  return tabNames[activeTab.value as string] || '未知'
})

/**
 * 处理标签切换
 */
const handleTabChange = (value: number | string) => {
  console.log('标签切换:', value)
  changeCount.value++

  // 可以在这里执行页面跳转
  // router.navigateTo(`/pages/tab-${value}/index`)

  // 或者加载对应页面的数据
  loadPageData(value)

  // 埋点统计
  trackPageView(value)
}

/**
 * 加载页面数据
 */
const loadPageData = (tabName: number | string) => {
  console.log(`加载 ${tabName} 页面数据`)
  // 实际的数据加载逻辑
}

/**
 * 页面访问统计
 */
const trackPageView = (tabName: number | string) => {
  console.log(`统计页面访问: ${tabName}`)
  // 埋点上报逻辑
}
</script>

```

**技术实现:**
- 通过 `@change` 事件监听标签切换,事件参数为标签的 `name` 或索引
- `change` 事件在用户点击标签时触发,同时 `v-model` 也会更新
- 可以在事件处理函数中执行路由跳转、数据加载、埋点统计等操作
- 事件在组件内部 `modelValue` 更新后触发
- Items 模式和子组件模式都会触发 change 事件

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:126-129, src/wd/components/wd-tabbar/wd-tabbar.vue:172-176, src/wd/components/wd-tabbar/wd-tabbar.vue:326-338

### 自定义尺寸

通过 `iconSize` 和 `fontSize` 属性自定义图标和文字的大小。

```vue
<template>
  <view class="demo">
    <!-- 小尺寸 -->
    <view class="section">
      <text class="section-title">小尺寸 (图标:40rpx 文字:20rpx)</text>
      <wd-tabbar
        v-model="activeTab1"
        icon-size="40"
        font-size="20"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="cart-outline" title="购物车" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 默认尺寸 -->
    <view class="section">
      <text class="section-title">默认尺寸 (图标:48rpx 文字:24rpx)</text>
      <wd-tabbar v-model="activeTab2">
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="cart-outline" title="购物车" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 大尺寸 -->
    <view class="section">
      <text class="section-title">大尺寸 (图标:56rpx 文字:28rpx)</text>
      <wd-tabbar
        v-model="activeTab3"
        icon-size="56"
        font-size="28"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="cart-outline" title="购物车" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 单独设置某个标签的尺寸 -->
    <view class="section">
      <text class="section-title">混合尺寸</text>
      <wd-tabbar v-model="activeTab4" icon-size="44" font-size="22">
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item
          icon="search"
          title="搜索"
          icon-size="52"
          font-size="26"
        />
        <wd-tabbar-item icon="cart-outline" title="购物车" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
const activeTab3 = ref(0)
const activeTab4 = ref(0)
</script>

```

**技术实现:**
- `icon-size` 属性控制图标大小,支持数字(默认 rpx)或字符串(如 `"20px"`)
- `font-size` 属性控制文字大小,支持数字(默认 rpx)或字符串
- 在标签栏组件上设置会应用到所有标签项
- 在单个标签项上设置可以覆盖标签栏的统一设置
- 内部通过 CSS 变量实现,优先级:标签项 > 标签栏 > 默认值
- 默认值:图标 48rpx,文字 24rpx

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:116-119, src/wd/components/wd-tabbar/wd-tabbar.vue:287-301, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:136-158

### 调整层级和边框

控制标签栏的 z-index 层级和顶部边框显示。

```vue
<template>
  <view class="demo">
    <!-- 自定义层级 -->
    <view class="section">
      <text class="section-title">自定义层级 (z-index: 1000)</text>
      <wd-tabbar
        v-model="activeTab1"
        :z-index="1000"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 无边框 -->
    <view class="section">
      <text class="section-title">无边框样式</text>
      <wd-tabbar
        v-model="activeTab2"
        :bordered="false"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 有边框(默认) -->
    <view class="section">
      <text class="section-title">有边框样式</text>
      <wd-tabbar
        v-model="activeTab3"
        :bordered="true"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 圆角样式无边框 -->
    <view class="section">
      <text class="section-title">圆角样式(无边框效果)</text>
      <wd-tabbar
        v-model="activeTab4"
        shape="round"
        :bordered="false"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 浮动层级示例 -->
    <view class="floating-content">
      <text>这是一个浮动元素 (z-index: 500)</text>
      <text>标签栏的层级低于此元素</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
const activeTab3 = ref(0)
const activeTab4 = ref(0)
</script>

```

**使用说明:**
- `z-index` 属性控制标签栏的层级,默认为 99
- 当页面有其他固定定位元素时,可能需要调整层级避免遮挡问题
- `bordered` 属性控制是否显示顶部边框,默认为 `true`
- 顶部边框使用 0.5px 实现,在高清屏上显示为细线
- 圆角样式(`shape="round"`)没有顶部边框,`bordered` 属性对圆角样式无效
- 边框仅在 `shape="default"` 时生效

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:9-10, src/wd/components/wd-tabbar/wd-tabbar.vue:102-115, src/wd/components/wd-tabbar/wd-tabbar.vue:442-444

### 关闭安全区域

某些情况下可能需要关闭底部安全区域适配。

```vue
<template>
  <view class="demo">
    <!-- 开启安全区域(默认) -->
    <view class="section">
      <text class="section-title">开启安全区域适配</text>
      <wd-tabbar
        v-model="activeTab1"
        :safe-area-inset-bottom="true"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 关闭安全区域 -->
    <view class="section">
      <text class="section-title">关闭安全区域适配</text>
      <wd-tabbar
        v-model="activeTab2"
        :safe-area-inset-bottom="false"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 圆角样式的安全区域 -->
    <view class="section">
      <text class="section-title">圆角样式 - 开启安全区域</text>
      <wd-tabbar
        v-model="activeTab3"
        shape="round"
        :safe-area-inset-bottom="true"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>

    <!-- 圆角样式 - 关闭安全区域 -->
    <view class="section">
      <text class="section-title">圆角样式 - 关闭安全区域</text>
      <wd-tabbar
        v-model="activeTab4"
        shape="round"
        :safe-area-inset-bottom="false"
      >
        <wd-tabbar-item icon="home-outline" title="首页" />
        <wd-tabbar-item icon="search" title="搜索" />
        <wd-tabbar-item icon="user" title="我的" />
      </wd-tabbar>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
const activeTab3 = ref(0)
const activeTab4 = ref(0)
</script>

```

**技术实现:**
- `safe-area-inset-bottom` 属性控制是否适配底部安全区域,默认为 `true`
- 底部安全区域适配使用 CSS 的 `env(safe-area-inset-bottom)` 实现
- 默认样式(`shape="default"`)通过 `padding-bottom` 添加安全区域高度
- 圆角样式(`shape="round"`)通过 `bottom` 属性调整位置,避免被安全区域遮挡
- 在 iPhone X 及以上机型中,安全区域高度通常为 34px
- 如果页面已经处理了安全区域,可以关闭此选项避免重复处理

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:4-6, src/wd/components/wd-tabbar/wd-tabbar.vue:104-105, src/wd/components/wd-tabbar/wd-tabbar.vue:424-439

### 路由模式集成

将标签栏与 UniApp 的页面路由系统集成。

```vue
<template>
  <view class="demo">
    <wd-tabbar v-model="activeTab" @change="handleTabChange">
      <wd-tabbar-item
        icon="home-outline"
        title="首页"
        name="/pages/home/index"
      />
      <wd-tabbar-item
        icon="search"
        title="搜索"
        name="/pages/search/index"
      />
      <wd-tabbar-item
        icon="bell-outline"
        title="消息"
        name="/pages/message/index"
        :value="unreadCount"
      />
      <wd-tabbar-item
        icon="user"
        title="我的"
        name="/pages/mine/index"
      />
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

// 使用路径作为 activeTab 的值
const activeTab = ref('/pages/home/index')
const unreadCount = ref(3)

/**
 * 获取当前页面路径
 */
const getCurrentPath = () => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    return `/${currentPage.route}`
  }
  return ''
}

/**
 * 处理标签切换
 * 使用 switchTab 进行页面跳转
 */
const handleTabChange = (value: number | string) => {
  const path = value as string

  // 使用 switchTab 跳转到 tabBar 页面
  uni.switchTab({
    url: path,
    success: () => {
      console.log('页面跳转成功:', path)
    },
    fail: (err) => {
      console.error('页面跳转失败:', err)

      // 如果 switchTab 失败,尝试使用 navigateTo
      uni.navigateTo({
        url: path,
        fail: (err2) => {
          console.error('navigateTo 也失败:', err2)
        },
      })
    },
  })
}

/**
 * 页面加载时同步当前路径
 */
onMounted(() => {
  activeTab.value = getCurrentPath()
})

/**
 * 模拟获取未读消息数
 */
const fetchUnreadCount = async () => {
  // 实际项目中从接口获取
  unreadCount.value = 5
}

onMounted(() => {
  fetchUnreadCount()
})
</script>

```

**pages.json 配置:**

```json
{
  "tabBar": {
    "custom": true,
    "color": "#999999",
    "selectedColor": "#4A90E2",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/home/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/search/index",
        "text": "搜索"
      },
      {
        "pagePath": "pages/message/index",
        "text": "消息"
      },
      {
        "pagePath": "pages/mine/index",
        "text": "我的"
      }
    ]
  }
}
```

**使用说明:**
- 将页面路径作为标签的 `name` 属性,实现路径与标签的绑定
- 在 `change` 事件中使用 `uni.switchTab` 进行页面跳转
- 需要在 `pages.json` 中配置 `tabBar`,并设置 `custom: true` 使用自定义标签栏
- 页面加载时通过 `getCurrentPages()` 获取当前路径,同步到 `activeTab`
- 这种方式可以实现完整的路由功能,包括浏览器地址栏同步(H5)、页面栈管理等

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:326-338

## API

### Tabbar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model-value / v-model | 当前选中标签的索引值或名称 | `number \| string` | `0` |
| items | 标签栏配置列表,使用数组模式时传入 | `WdTabbarItemProps[]` | `[]` |
| fixed | 是否固定在页面底部 | `boolean` | `true` |
| bordered | 是否显示顶部边框,仅在 `shape="default"` 时有效 | `boolean` | `true` |
| safe-area-inset-bottom | 是否开启底部安全区域适配 | `boolean` | `true` |
| shape | 标签栏形状,可选值: `default`(默认矩形) / `round`(圆角胶囊) | `TabbarShape` | `'default'` |
| active-color | 激活状态的颜色(图标和文字) | `string` | `''` |
| inactive-color | 未激活状态的颜色(图标和文字) | `string` | `''` |
| placeholder | 固定在底部时,是否在标签位置生成一个等高的占位元素 | `boolean` | `true` |
| z-index | 标签栏的 CSS 层级 | `number` | `99` |
| icon-size | 图标大小,支持数字(rpx)或字符串 | `string \| number` | `''` |
| font-size | 文字大小,支持数字(rpx)或字符串 | `string \| number` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:89-120

### Tabbar Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | v-model 更新事件 | `value: number \| string` - 当前选中标签的索引或名称 |
| change | 标签切换时触发 | `value: number \| string` - 当前选中标签的索引或名称 |
| update:items | items 数组更新事件,当 loaded 状态改变时触发 | `items: WdTabbarItemProps[]` - 更新后的 items 数组 |

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:125-132

### Tabbar Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 默认插槽,用于放置 `wd-tabbar-item` 子组件 | - |
| icon-{name} | 自定义图标插槽(Items 模式),`{name}` 为标签的 name 属性 | `{ active: boolean }` - 是否激活 |

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:26-33, src/wd/components/wd-tabbar/wd-tabbar.vue:46-48

### TabbarItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标签页的标题 | `string` | `''` |
| name | 唯一标识符,用于匹配 v-model,不设置则使用索引 | `string \| number` | - |
| icon | 图标名称 | `IconName` | - |
| active-icon | 激活状态的图标名称 | `string` | - |
| value | 徽标显示值,传入数字或字符串 | `number \| string \| null` | `null` |
| is-dot | 是否显示小红点样式的徽标 | `boolean` | `false` |
| max | 徽标显示的最大值,超出显示为 `max+` | `number` | `99` |
| badge-props | 徽标属性配置对象,透传给 Badge 组件 | `Partial<WdBadgeProps>` | - |
| loaded | 页面是否已加载,用于懒加载 | `boolean` | `false` |
| icon-size | 图标大小,优先级高于 Tabbar 的 icon-size | `string \| number` | - |
| font-size | 文字大小,优先级高于 Tabbar 的 font-size | `string \| number` | - |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:55-83

### TabbarItem Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:loaded | loaded 状态更新事件 | `loaded: boolean` - 更新后的 loaded 状态 |

参考: src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:88-91

### TabbarItem Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| icon | 自定义图标内容 | `{ active: boolean }` - 当前标签是否激活 |

参考: src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:12-19

### 类型定义

```typescript
/**
 * 标签栏形状类型
 */
export type TabbarShape = 'default' | 'round'

/**
 * 标签栏组件属性接口
 */
interface WdTabbarProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 选中标签的索引值或者名称 */
  modelValue?: number | string
  /** 标签栏配置列表 */
  items?: WdTabbarItemProps[]
  /** 是否固定在底部 */
  fixed?: boolean
  /** 是否显示顶部边框 */
  bordered?: boolean
  /** 是否设置底部安全距离（iPhone X 类型的机型） */
  safeAreaInsetBottom?: boolean
  /** 标签栏的形状 */
  shape?: TabbarShape
  /** 激活标签的颜色 */
  activeColor?: string
  /** 未激活标签的颜色 */
  inactiveColor?: string
  /** 固定在底部时，是否在标签位置生成一个等高的占位元素 */
  placeholder?: boolean
  /** tabbar组件的层级 */
  zIndex?: number
  /** 图标大小 */
  iconSize?: string | number
  /** 文字大小 */
  fontSize?: string | number
}

/**
 * 标签栏组件事件接口
 */
interface WdTabbarEmits {
  /** v-model 更新事件 */
  'update:modelValue': [value: number | string]
  /** tabbar标签切换时触发 */
  change: [value: number | string]
  /** 更新 items 的 loaded 状态 */
  'update:items': [items: WdTabbarItemProps[]]
}

/**
 * 标签项组件属性接口
 */
export interface WdTabbarItemProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 标签页的标题 */
  title?: string
  /** 唯一标识符 */
  name?: string | number
  /** 图标名称 */
  icon?: IconName
  /** 激活状态的图标名称 */
  activeIcon?: string
  /** 徽标显示值 */
  value?: number | string | null
  /** 是否点状徽标 */
  isDot?: boolean
  /** 徽标最大值 */
  max?: number
  /** 徽标属性，透传给 Badge 组件 */
  badgeProps?: Partial<WdBadgeProps>
  /** 页面是否已加载（用于懒加载） */
  loaded?: boolean
  /** 图标大小 */
  iconSize?: string | number
  /** 文字大小 */
  fontSize?: string | number
}

/**
 * 标签项组件事件接口
 */
interface WdTabbarItemEmits {
  /** 更新 loaded 状态 */
  'update:loaded': [loaded: boolean]
}
```

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:81-132, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:52-91

## 主题定制

### CSS 变量

Tabbar 组件提供了以下 CSS 变量用于主题定制:

```scss
:root {
  // Tabbar 标签栏
  --wd-tabbar-height: 100rpx;                    // 标签栏高度
  --wd-tabbar-background: #ffffff;               // 背景色
  --wd-tabbar-box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08); // 圆角样式阴影
  --wd-tabbar-active-color: #4a90e2;            // 激活状态颜色
  --wd-tabbar-inactive-color: #969799;          // 未激活状态颜色

  // TabbarItem 标签项
  --wd-tabbar-item-icon-size: 48rpx;            // 图标大小
  --wd-tabbar-item-title-font-size: 24rpx;      // 文字大小
  --wd-tabbar-item-title-line-height: 36rpx;    // 文字行高
}
```

### 暗黑模式

组件内置了暗黑模式支持,在暗黑主题下自动切换样式:

```scss
.wot-theme-dark {
  .wd-tabbar {
    // 暗黑模式背景色
    background: $-dark-background;

    .wd-tabbar-item__body {
      // 暗黑模式下未激活状态的颜色
      .is-inactive {
        color: $-dark-color-gray;
      }
    }
  }
}
```

### 自定义样式示例

**通过 CSS 变量定制主题:**

```vue
<template>
  <view class="custom-tabbar-page">
    <wd-tabbar v-model="activeTab" class="my-tabbar">
      <wd-tabbar-item icon="home-outline" title="首页" />
      <wd-tabbar-item icon="search" title="搜索" />
      <wd-tabbar-item icon="user" title="我的" />
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

**通过 custom-style 定制样式:**

```vue
<template>
  <wd-tabbar
    v-model="activeTab"
    custom-style="background: #f5f5f5; border-radius: 32rpx 32rpx 0 0;"
    custom-class="elevated-tabbar"
  >
    <wd-tabbar-item icon="home-outline" title="首页" />
    <wd-tabbar-item icon="search" title="搜索" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:379-501

## 最佳实践

### 1. 标签数量建议

<Ok/> **推荐做法:**

```vue
<template>
  <!-- 3-5 个标签,适合大多数应用 -->
  <wd-tabbar v-model="activeTab">
    <wd-tabbar-item icon="home-outline" title="首页" />
    <wd-tabbar-item icon="search" title="搜索" />
    <wd-tabbar-item icon="cart-outline" title="购物车" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>
</template>
```

<No/> **不推荐做法:**

```vue
<template>
  <!-- 6 个或更多标签,显得拥挤,用户体验差 -->
  <wd-tabbar v-model="activeTab">
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="category" title="分类" />
    <wd-tabbar-item icon="cart" title="购物车" />
    <wd-tabbar-item icon="message" title="消息" />
    <wd-tabbar-item icon="favorites" title="收藏" />
    <wd-tabbar-item icon="user" title="我的" />
    <!-- 太多标签会导致每个标签太小,难以点击 -->
  </wd-tabbar>
</template>
```

**说明:**
- 标签栏应包含 3-5 个主要功能入口,不建议超过 5 个
- 标签过多会导致每个标签的点击区域变小,影响用户体验
- 如果需要更多导航选项,考虑使用侧边栏、抽屉或二级导航

### 2. 合理使用徽标

<Ok/> **推荐做法:**

```vue
<template>
  <wd-tabbar v-model="activeTab">
    <wd-tabbar-item icon="home-outline" title="首页" />

    <!-- 仅在有未读消息时显示徽标 -->
    <wd-tabbar-item
      icon="bell-outline"
      title="消息"
      :value="unreadCount > 0 ? unreadCount : null"
    />

    <!-- 使用小红点提示有更新 -->
    <wd-tabbar-item
      icon="cart-outline"
      title="购物车"
      :is-dot="hasNewItems"
    />

    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
const unreadCount = ref(3)
const hasNewItems = ref(true)
</script>
```

<No/> **不推荐做法:**

```vue
<template>
  <wd-tabbar v-model="activeTab">
    <!-- 所有标签都显示徽标,过于花哨 -->
    <wd-tabbar-item icon="home" title="首页" :value="10" />
    <wd-tabbar-item icon="search" title="搜索" :value="5" />
    <wd-tabbar-item icon="cart" title="购物车" :value="3" />
    <wd-tabbar-item icon="user" title="我的" is-dot />
    <!-- 徽标失去了提示作用,变成视觉干扰 -->
  </wd-tabbar>
</template>
```

**说明:**
- 徽标应该用于提示重要的、需要用户关注的信息
- 避免在所有标签上都显示徽标,这会让用户无法区分优先级
- 当数值为 0 或 null 时应该隐藏徽标,而不是显示 "0"

### 3. 懒加载优化性能

<Ok/> **推荐做法:**

```vue
<template>
  <view class="app">
    <wd-tabbar v-model="activeTab" :items="tabs" @update:items="tabs = $event" />

    <view class="content">
      <!-- 首页始终加载 -->
      <HomePage v-show="activeTab === 'home'" />

      <!-- 其他页面懒加载 -->
      <SearchPage v-if="getTabLoaded('search')" v-show="activeTab === 'search'" />
      <CartPage v-if="getTabLoaded('cart')" v-show="activeTab === 'cart'" />
      <MinePage v-if="getTabLoaded('mine')" v-show="activeTab === 'mine'" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const activeTab = ref('home')
const tabs = ref([
  { name: 'home', title: '首页', icon: 'home', loaded: true },
  { name: 'search', title: '搜索', icon: 'search', loaded: false },
  { name: 'cart', title: '购物车', icon: 'cart', loaded: false },
  { name: 'mine', title: '我的', icon: 'user', loaded: false },
])

const getTabLoaded = (name: string) => {
  return tabs.value.find(t => t.name === name)?.loaded ?? false
}
</script>
```

<No/> **不推荐做法:**

```vue
<template>
  <view class="app">
    <wd-tabbar v-model="activeTab" :items="tabs" />

    <!-- 所有页面一次性加载,浪费资源 -->
    <view class="content">
      <HomePage v-show="activeTab === 'home'" />
      <SearchPage v-show="activeTab === 'search'" />
      <CartPage v-show="activeTab === 'cart'" />
      <MinePage v-show="activeTab === 'mine'" />
    </view>
  </view>
</template>
```

**说明:**
- 使用 `v-if` 配合 `loaded` 属性实现页面懒加载
- 使用 `v-show` 控制已加载页面的显示隐藏,保留页面状态
- 首页通常设置为默认加载,其他页面按需加载
- 这种方式可以减少初始加载时间和内存占用

### 4. 选择合适的模式

<Ok/> **推荐做法:**

```vue
<!-- 静态配置,标签固定不变 - 使用子组件模式 -->
<template>
  <wd-tabbar v-model="activeTab">
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="search" title="搜索" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>
</template>

<!-- 动态配置,需要从接口获取或动态修改 - 使用 Items 模式 -->
<template>
  <wd-tabbar v-model="activeTab" :items="dynamicTabs" />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const dynamicTabs = ref([])

onMounted(async () => {
  // 从接口获取标签配置
  const res = await fetch('/api/tabbar-config')
  dynamicTabs.value = await res.json()
})
</script>
```

<No/> **不推荐做法:**

```vue
<!-- 静态配置却使用 Items 模式,增加代码复杂度 -->
<template>
  <wd-tabbar v-model="activeTab" :items="staticTabs" />
</template>

<script lang="ts" setup>
const staticTabs = ref([
  { name: 'home', title: '首页', icon: 'home' },
  { name: 'search', title: '搜索', icon: 'search' },
  { name: 'mine', title: '我的', icon: 'user' },
])
</script>
```

**说明:**
- 子组件模式更直观,适合静态配置
- Items 模式更灵活,适合动态配置
- 不要为了使用某种模式而增加不必要的代码复杂度

### 5. 正确处理安全区域

<Ok/> **推荐做法:**

```vue
<template>
  <!-- 标签栏处理安全区域 -->
  <wd-tabbar v-model="activeTab" :safe-area-inset-bottom="true">
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="search" title="搜索" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>

  <!-- 页面内容预留标签栏高度,但不重复处理安全区域 -->
  <view class="page-content">
    <!-- 内容 -->
  </view>
</template>

```

<No/> **不推荐做法:**

```vue
<template>
  <wd-tabbar v-model="activeTab" :safe-area-inset-bottom="true">
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="search" title="搜索" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>

  <view class="page-content">
    <!-- 内容 -->
  </view>
</template>

```

**说明:**
- 标签栏组件已经处理了安全区域,页面内容不需要重复处理
- 页面仅需预留标签栏本身的高度即可
- 如果手动关闭了标签栏的安全区域适配,则需要在页面级别处理

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:1-503, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:1-305

## 常见问题

### 1. 标签栏遮挡页面内容

**问题原因:**
- 标签栏使用固定定位,会脱离文档流覆盖在页面内容上
- 页面内容没有预留标签栏的高度空间
- 占位元素被禁用或高度计算不正确

**解决方案:**

```vue
<template>
  <view class="page">
    <!-- 页面内容 -->
    <view class="content">
      <text>页面内容</text>
    </view>

    <!-- 标签栏 -->
    <wd-tabbar v-model="activeTab" :placeholder="true">
      <wd-tabbar-item icon="home" title="首页" />
      <wd-tabbar-item icon="search" title="搜索" />
      <wd-tabbar-item icon="user" title="我的" />
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

**或者确保占位元素正常工作:**

```vue
<template>
  <!-- 确保 fixed 和 placeholder 都为 true -->
  <wd-tabbar
    v-model="activeTab"
    :fixed="true"
    :placeholder="true"
  >
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="search" title="搜索" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>
</template>
```

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:3-6, src/wd/components/wd-tabbar/wd-tabbar.vue:190-198

### 2. 徽标不显示或显示不正确

**问题原因:**
- `value` 属性值为 `0`、`''` 或 `null` 时徽标会隐藏
- `is-dot` 和 `value` 同时设置,`is-dot` 优先级更高
- Badge 组件的 `modelValue` 绑定错误

**解决方案:**

```vue
<template>
  <wd-tabbar v-model="activeTab">
    <!-- 正确: value 大于 0 时显示数字 -->
    <wd-tabbar-item
      icon="bell"
      title="消息"
      :value="messageCount > 0 ? messageCount : null"
    />

    <!-- 正确: 使用 is-dot 显示小红点 -->
    <wd-tabbar-item
      icon="cart"
      title="购物车"
      :is-dot="hasNewItems"
    />

    <!-- 错误: value 为 0 时不显示 -->
    <!-- <wd-tabbar-item icon="bell" title="消息" :value="0" /> -->

    <!-- 正确: 如果需要显示 0,使用字符串 -->
    <wd-tabbar-item
      icon="bell"
      title="消息"
      :value="messageCount.toString()"
    />
  </wd-tabbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
const messageCount = ref(5)
const hasNewItems = ref(true)
</script>
```

**自定义徽标样式:**

```vue
<template>
  <wd-tabbar v-model="activeTab">
    <wd-tabbar-item
      icon="bell"
      title="消息"
      :value="99"
      :badge-props="{
        bgColor: '#ff4d4f',
        top: '8rpx',
        right: '16rpx',
      }"
    />
  </wd-tabbar>
</template>
```

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:245-261, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:111-130

### 3. 激活状态不正确或不同步

**问题原因:**
- `v-model` 绑定的值与标签的 `name` 不匹配
- 没有为标签设置 `name` 属性,导致使用索引匹配
- 索引值从 0 开始,容易混淆

**解决方案:**

```vue
<template>
  <wd-tabbar v-model="activeTab">
    <!-- 方案1: 使用明确的 name 属性 -->
    <wd-tabbar-item icon="home" title="首页" name="home" />
    <wd-tabbar-item icon="search" title="搜索" name="search" />
    <wd-tabbar-item icon="user" title="我的" name="mine" />
  </wd-tabbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// v-model 使用字符串类型的 name
const activeTab = ref('home')

// 切换到搜索页
const switchToSearch = () => {
  activeTab.value = 'search'
}
</script>
```

**或者使用索引但要注意从 0 开始:**

```vue
<template>
  <wd-tabbar v-model="activeTab">
    <!-- 索引: 0, 1, 2 -->
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="search" title="搜索" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// v-model 使用数字类型的索引,从 0 开始
const activeTab = ref(0) // 首页

// 切换到搜索页(索引 1)
const switchToSearch = () => {
  activeTab.value = 1
}
</script>
```

**调试技巧:**

```vue
<script lang="ts" setup>
import { ref, watch } from 'vue'

const activeTab = ref('home')

// 监听 activeTab 变化
watch(activeTab, (newValue) => {
  console.log('activeTab changed:', newValue)
})
</script>
```

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:217-220, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:164-172

### 4. 自定义插槽不生效

**问题原因:**
- 子组件模式和 Items 模式的插槽名称不同
- Items 模式需要使用 `#icon-{name}` 格式的具名插槽
- 插槽的作用域参数使用不正确

**解决方案:**

**子组件模式:**

```vue
<template>
  <wd-tabbar v-model="activeTab">
    <wd-tabbar-item title="首页" name="home">
      <!-- 使用 #icon 插槽 -->
      <template #icon="{ active }">
        <wd-icon :name="active ? 'home' : 'home-outline'" />
      </template>
    </wd-tabbar-item>

    <wd-tabbar-item icon="search" title="搜索" />
  </wd-tabbar>
</template>
```

**Items 模式:**

```vue
<template>
  <wd-tabbar v-model="activeTab" :items="tabs">
    <!-- 使用 #icon-{name} 具名插槽 -->
    <template #icon-home="{ active }">
      <wd-icon :name="active ? 'home' : 'home-outline'" />
    </template>

    <template #icon-custom="{ active }">
      <view class="custom-icon" :class="{ active }">
        <text>🏠</text>
      </view>
    </template>
  </wd-tabbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref('home')
const tabs = ref([
  { name: 'home', title: '首页' }, // 使用插槽,不需要 icon
  { name: 'custom', title: '特别' },
  { name: 'mine', title: '我的', icon: 'user' },
])
</script>
```

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:26-33, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:12-19

### 5. 圆角样式在某些设备上显示异常

**问题原因:**
- 圆角样式的标签栏有左右边距,在小屏设备上可能显得过窄
- 安全区域适配在圆角样式下的处理方式不同
- 圆角样式的阴影可能被其他元素遮挡

**解决方案:**

```vue
<template>
  <!-- 方案1: 根据屏幕宽度动态选择样式 -->
  <wd-tabbar
    v-model="activeTab"
    :shape="isSmallScreen ? 'default' : 'round'"
  >
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="search" title="搜索" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const activeTab = ref(0)

// 获取系统信息
const systemInfo = uni.getSystemInfoSync()
const isSmallScreen = computed(() => systemInfo.windowWidth < 375)
</script>
```

**方案2: 使用自定义样式调整圆角边距:**

```vue
<template>
  <wd-tabbar
    v-model="activeTab"
    shape="round"
    custom-class="custom-round-tabbar"
  >
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="search" title="搜索" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>
</template>

```

**方案3: 确保阴影不被遮挡:**

```vue
<template>
  <view class="page">
    <view class="content">
      <!-- 页面内容 -->
    </view>

    <!-- 标签栏层级要高于内容 -->
    <wd-tabbar
      v-model="activeTab"
      shape="round"
      :z-index="100"
    >
      <wd-tabbar-item icon="home" title="首页" />
      <wd-tabbar-item icon="search" title="搜索" />
      <wd-tabbar-item icon="user" title="我的" />
    </wd-tabbar>
  </view>
</template>
```

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:418-430, src/wd/components/wd-tabbar/wd-tabbar.vue:9-10

## 注意事项

1. **标签栏默认固定定位** - 组件默认使用 `position: fixed` 固定在页面底部,会脱离文档流。如果不需要固定定位,请设置 `:fixed="false"`。

2. **占位元素默认开启** - 当使用固定定位时,组件会自动生成一个等高的占位元素,避免内容被遮挡。如果不需要占位,可以设置 `:placeholder="false"`。

3. **安全区域默认适配** - 组件默认开启底部安全区域适配,自动处理 iPhone X 等刘海屏设备的底部安全距离。如果应用已在全局处理,可以设置 `:safe-area-inset-bottom="false"` 关闭。

4. **name 属性的重要性** - 建议为每个标签设置明确的 `name` 属性,便于识别和维护。如果不设置,组件会使用索引值(从 0 开始),容易产生混淆。

5. **v-model 类型匹配** - `v-model` 绑定的值必须与标签的 `name` 属性类型一致。如果 `name` 是字符串,`v-model` 也应该是字符串;如果使用索引,两者都应该是数字。

6. **徽标值为 0 时隐藏** - 当 `value` 属性为 `0`、空字符串或 `null` 时,徽标会自动隐藏。如果需要显示 0,请使用字符串 `'0'`。

7. **徽标最大值限制** - 徽标的 `max` 属性默认为 99,超出会显示为 `99+`。可以通过 `badge-props` 或直接设置 `max` 属性修改最大值。

8. **两种模式互斥** - 子组件模式和 Items 数组模式是互斥的,当传入 `items` 数组时,默认插槽中的子组件会被忽略。

9. **插槽名称差异** - 子组件模式使用 `#icon` 插槽,Items 模式使用 `#icon-{name}` 具名插槽,注意区分使用。

10. **圆角样式的特殊性** - 圆角样式 (`shape="round"`) 有左右 32rpx 边距,不显示顶部边框,`bordered` 属性对圆角样式无效。安全区域的处理方式也与默认样式不同。

11. **懒加载的自动触发** - 组件会在首次点击标签时自动将 `loaded` 设置为 `true`,并触发 `update:items` 事件。如果使用子组件模式,需要监听 `update:loaded` 事件手动同步状态。

12. **层级设置的影响范围** - `z-index` 属性仅在 `fixed="true"` 时生效。如果标签栏与其他固定定位元素存在遮挡关系,可能需要调整层级值。默认值为 99,通常足够使用。

参考: src/wd/components/wd-tabbar/wd-tabbar.vue:1-503, src/wd/components/wd-tabbar-item/wd-tabbar-item.vue:1-305
