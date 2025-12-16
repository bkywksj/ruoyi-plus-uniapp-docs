# Paging 分页加载

## 介绍

Paging 分页加载组件是一个功能强大的智能分页解决方案,专为复杂列表场景设计。组件基于 scroll-view 实现,无需处理页面生命周期,自动管理分页逻辑,支持 Tabs 切换、Radio 筛选、搜索、数据缓存等高级功能,极大简化列表页面开发。

**核心特性:**

- **智能分页** - 基于 IntersectionObserver 自动触发加载更多,支持禁用自动加载改为手动加载模式
- **Tab 切换** - 集成 wd-tabs 组件,支持多个 Tab,每个 Tab 独立管理分页数据和缓存
- **Radio 筛选** - 支持 RadioGroup 筛选功能,可配置全局筛选或 Tab 级别独立筛选,支持水平滚动
- **搜索功能** - 内置 wd-search 搜索框,支持搜索关键词筛选,可显示搜索结果总数
- **数据缓存** - 为每个 Tab+Radio 组合独立缓存分页数据,切换时无需重新加载
- **粘性定位** - Tabs、RadioGroup、搜索框支持独立的粘性定位配置,优化滚动体验
- **限制加载** - 支持设置最大记录数限制,控制最多显示的数据条数,防止过度加载
- **空状态** - 内置 wd-status-tip 组件展示空数据状态,可自定义空状态内容
- **回到顶部** - 集成 wd-backtop 组件,数据加载后自动显示回到顶部按钮
- **清空数据** - 提供清空所有数据、指定 Tab 数据、指定 Tab+Radio 组合数据的方法
- **完整 TypeScript** - 提供完整的类型定义,包括 Props、Emits、Expose 接口
- **UnoCSS 样式** - 使用 UnoCSS 原子化CSS,样式简洁高效

参考: src/wd/components/wd-paging/wd-paging.vue:1-88

## 基本用法

### 简单列表

最简单的分页列表,只需提供数据获取函数。

```vue
<template>
  <view class="page">
    <wd-paging :fetch="fetchUsers">
      <template #item="{ item }">
        <view class="user-card">
          <view class="user-name">{{ item.name }}</view>
          <view class="user-email">{{ item.email }}</view>
        </view>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
// 数据获取函数
const fetchUsers = async (query: PageQuery) => {
  try {
    const response = await fetch(`/api/users?page=${query.pageNum}&size=${query.pageSize}`)
    const data = await response.json()
    return [null, data] // 返回 [error, result] 格式
  } catch (error) {
    return [error, null]
  }
}
</script>

```

**使用说明:**
- 组件自动处理首次加载和滚动加载更多
- `fetch` 函数接收 `PageQuery` 参数,返回 `[error, PageResult]` 格式
- 使用 `#item` 插槽自定义每条数据的渲染
- 组件会自动显示加载状态和"没有更多了"提示

参考: src/wd/components/wd-paging/wd-paging.vue:325-326, 1242-1336

### 带搜索功能

添加搜索框,支持关键词搜索。

```vue
<template>
  <view class="page">
    <wd-paging
      :fetch="fetchProducts"
      show-search
      search-placeholder="搜索商品名称"
      show-total
      @search="handleSearch"
    >
      <template #item="{ item }">
        <view class="product-card">
          <view class="product-name">{{ item.name }}</view>
          <view class="product-price">¥{{ item.price }}</view>
        </view>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
const fetchProducts = async (query: PageQuery) => {
  // query.searchValue 会包含搜索关键词
  console.log('搜索关键词:', query.searchValue)

  try {
    const response = await fetch(`/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    const data = await response.json()
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}

const handleSearch = (keyword: string) => {
  console.log('搜索:', keyword)
}
</script>

```

**技术实现:**
- `show-search` 属性启用搜索框
- 搜索关键词自动添加到 `query.searchValue` 参数
- `show-total` 显示搜索结果总数
- `@search` 事件在用户搜索时触发

参考: src/wd/components/wd-paging/wd-paging.vue:341-344, 1479-1493

### Tabs 切换

使用 Tabs 实现多个分类列表。

```vue
<template>
  <view class="page">
    <wd-paging
      :fetch="fetchOrders"
      :tabs="orderTabs"
      tabs-fixed
      @tab-change="handleTabChange"
    >
      <template #item="{ item }">
        <view class="order-card">
          <view class="order-no">订单号: {{ item.orderNo }}</view>
          <view class="order-amount">金额: ¥{{ item.amount }}</view>
          <view class="order-status">状态: {{ item.statusText }}</view>
        </view>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
import type { PagingTabItem } from '@/wd/components/wd-paging/wd-paging.vue'

const orderTabs: PagingTabItem[] = [
  {
    name: 'all',
    title: '全部',
    data: {},
  },
  {
    name: 'pending',
    title: '待付款',
    data: { status: 'pending' },
    badgeProps: {
      modelValue: 5, // 显示待付款数量
      isDot: false,
    },
  },
  {
    name: 'paid',
    title: '已付款',
    data: { status: 'paid' },
  },
  {
    name: 'shipped',
    title: '已发货',
    data: { status: 'shipped' },
  },
  {
    name: 'completed',
    title: '已完成',
    data: { status: 'completed' },
  },
]

const fetchOrders = async (query: PageQuery) => {
  // query 会自动包含 tab.data 中的参数
  // 例如切换到"待付款"tab时: { ...query, status: 'pending' }
  console.log('查询参数:', query)

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    const data = await response.json()
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}

const handleTabChange = ({ index, name, tab }) => {
  console.log('切换到Tab:', name, tab)
}
</script>

```

**技术实现:**
- 每个 Tab 通过 `data` 属性定义查询参数,会自动合并到 `query` 中
- 每个 Tab 的分页数据独立缓存,切换时无需重新加载
- `tabs-fixed` 启用 Tab 粘性定位
- `badgeProps` 可以为 Tab 添加徽标

参考: src/wd/components/wd-paging/wd-paging.vue:282-302, 348-353, 1368-1408

### Radio 筛选

添加 Radio 筛选功能。

```vue
<template>
  <view class="page">
    <wd-paging
      :fetch="fetchTasks"
      :radio-group-config="radioConfig"
      radio-group-sticky
      @radio-change="handleRadioChange"
    >
      <template #item="{ item }">
        <view class="task-card">
          <view class="task-title">{{ item.title }}</view>
          <view class="task-priority">优先级: {{ item.priorityText }}</view>
        </view>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
import type { PagingRadioGroupConfig } from '@/wd/components/wd-paging/wd-paging.vue'

const radioConfig: PagingRadioGroupConfig = {
  field: 'priority', // 查询字段名
  defaultValue: '2', // 默认选中
  options: [
    { label: '低优先级', value: '1' },
    { label: '中优先级', value: '2' },
    { label: '高优先级', value: '3' },
    { label: '紧急', value: '4' },
  ],
}

const fetchTasks = async (query: PageQuery) => {
  // query.priority 会包含选中的优先级
  console.log('查询参数:', query)

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    const data = await response.json()
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}

const handleRadioChange = ({ value, option, field }) => {
  console.log('Radio 变化:', field, value, option)
}
</script>

```

**技术实现:**
- `radio-group-config` 定义 Radio 筛选配置
- `field` 属性指定查询参数的 key,选中的 value 会添加到 `query[field]`
- `radio-group-sticky` 启用 Radio 粘性定位
- 选项超过3个时自动启用水平滚动

参考: src/wd/components/wd-paging/wd-paging.vue:304-314, 355-358, 1410-1478

### 限制最大记录数

限制最多显示的数据条数,防止过度加载。

```vue
<template>
  <view class="page">
    <wd-paging
      :fetch="fetchNews"
      :max-records="50"
      disabled-auto-load
      show-manual-load-button
      @manual-load-more="handleManualLoad"
    >
      <template #item="{ item }">
        <view class="news-card">
          <view class="news-title">{{ item.title }}</view>
          <view class="news-date">{{ item.date }}</view>
        </view>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
const fetchNews = async (query: PageQuery) => {
  try {
    const response = await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    const data = await response.json()
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}

const handleManualLoad = ({ currentRecords, maxRecords }) => {
  console.log(`当前记录数: ${currentRecords}, 最大记录数: ${maxRecords}`)
}
</script>

```

**技术实现:**
- `max-records` 设置最大记录数限制
- `disabled-auto-load` 禁用自动加载
- `show-manual-load-button` 显示手动加载按钮
- 达到限制后显示"已显示全部数据"提示

参考: src/wd/components/wd-paging/wd-paging.vue:334-339, 765-820

### 自定义空状态

自定义空数据时的展示内容。

```vue
<template>
  <view class="page">
    <wd-paging :fetch="fetchBooks">
      <template #item="{ item }">
        <view class="book-card">
          <view class="book-name">{{ item.name }}</view>
          <view class="book-author">作者: {{ item.author }}</view>
        </view>
      </template>

      <template #empty>
        <view class="custom-empty">
          <image
            src="/static/images/empty-book.png"
            class="empty-image"
            mode="aspectFit"
          />
          <view class="empty-text">暂无书籍数据</view>
          <wd-button type="primary" size="small" @click="handleAddBook">
            添加书籍
          </wd-button>
        </view>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
const fetchBooks = async (query: PageQuery) => {
  try {
    const response = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    const data = await response.json()
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}

const handleAddBook = () => {
  uni.navigateTo({
    url: '/pages/book/add',
  })
}
</script>

```

**技术实现:**
- 使用 `#empty` 插槽自定义空状态内容
- 插槽接收 `currentTab`、`currentTabData`、`currentRadioValue`、`currentRadioData` 参数
- 只在数据为空且不在加载中时显示

参考: src/wd/components/wd-paging/wd-paging.vue:202-217

### after-items 插槽

在数据列表后添加额外内容,如添加按钮。

```vue
<template>
  <view class="page">
    <wd-paging :fetch="fetchMembers">
      <template #item="{ item }">
        <view class="member-card">
          <view class="member-name">{{ item.name }}</view>
          <view class="member-role">{{ item.role }}</view>
        </view>
      </template>

      <template #after-items="{ currentPageData }">
        <view class="add-member-card">
          <wd-button
            type="primary"
            block
            icon="add-circle"
            @click="handleAddMember"
          >
            添加成员
          </wd-button>

          <view class="member-count">
            当前共 {{ currentPageData.total }} 名成员
          </view>
        </view>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
const fetchMembers = async (query: PageQuery) => {
  try {
    const response = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    const data = await response.json()
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}

const handleAddMember = () => {
  uni.navigateTo({
    url: '/pages/member/add',
  })
}
</script>

```

**技术实现:**
- `#after-items` 插槽在所有数据项之后渲染
- 插槽接收 `currentPageData`、`displayRecords` 等参数
- 在所有情况下都显示,包括空状态

参考: src/wd/components/wd-paging/wd-paging.vue:190-200

## 高级用法

### Tabs + Radio 组合筛选

结合 Tabs 和 Radio 实现复杂的筛选逻辑。

```vue
<template>
  <view class="page">
    <wd-paging
      :fetch="fetchUsers"
      :tabs="userTabs"
      :radio-group-config="globalRadioConfig"
      tabs-fixed
      radio-group-sticky
      show-search
      show-total
      @tab-change="handleTabChange"
      @radio-change="handleRadioChange"
    >
      <template #item="{ item }">
        <view class="user-card">
          <view class="user-info">
            <view class="user-avatar">
              <image :src="item.avatar" mode="aspectFill" />
            </view>
            <view class="user-details">
              <view class="user-name">{{ item.name }}</view>
              <view class="user-type">{{ item.typeText }}</view>
            </view>
          </view>
          <view class="user-priority">{{ item.priorityText }}</view>
        </view>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
import type { PagingTabItem, PagingRadioGroupConfig } from '@/wd/components/wd-paging/wd-paging.vue'

// Tabs 配置
const userTabs: PagingTabItem[] = [
  {
    name: 'all',
    title: '全部用户',
    data: {},
  },
  {
    name: 'vip',
    title: 'VIP用户',
    data: { userType: 'vip' },
    // 这个 tab 使用独立的 radio 配置
    radioGroupConfig: {
      field: 'level',
      defaultValue: '1',
      options: [
        { label: '铜牌', value: '1' },
        { label: '银牌', value: '2' },
        { label: '金牌', value: '3' },
      ],
    },
  },
  {
    name: 'active',
    title: '活跃用户',
    data: { userType: 'normal', isActive: true },
    // 这个 tab 没有配置 radioGroupConfig,会使用全局配置
  },
]

// 全局 radio 配置,作为默认配置
const globalRadioConfig: PagingRadioGroupConfig = {
  field: 'priority',
  defaultValue: '2',
  options: [
    { label: '低', value: '1' },
    { label: '正常', value: '2' },
    { label: '高', value: '3' },
  ],
}

const fetchUsers = async (query: PageQuery) => {
  // 当切换到"活跃用户"tab且选择"高"优先级时,query 为:
  // { pageNum: 1, pageSize: 10, userType: 'normal', isActive: true, priority: '3' }

  // 当切换到"VIP用户"tab且选择"金牌"时,query 为:
  // { pageNum: 1, pageSize: 10, userType: 'vip', level: '3' }

  console.log('查询参数:', query)

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    const data = await response.json()
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}

const handleTabChange = ({ index, name, tab }) => {
  console.log('Tab 切换:', name, tab)
}

const handleRadioChange = ({ value, option, field, tabIndex }) => {
  console.log('Radio 变化:', field, value, option, '在 Tab:', tabIndex)
}
</script>

```

**技术实现:**
- Tab 可以定义独立的 `radioGroupConfig`,优先级高于全局配置
- 每个 Tab+Radio 组合的数据独立缓存
- Tab 的 `data` 和 Radio 的 `field:value` 会自动合并到查询参数
- 组件自动管理每个组合的分页状态

参考: src/wd/components/wd-paging/wd-paging.vue:39-87, 570-636, 698-723

### 暴露方法调用

通过 ref 调用组件暴露的方法。

```vue
<template>
  <view class="page">
    <view class="toolbar">
      <wd-button size="small" @click="handleRefresh">
        刷新
      </wd-button>
      <wd-button size="small" @click="handleLoadMore">
        加载更多
      </wd-button>
      <wd-button size="small" @click="handleScrollTop">
        回到顶部
      </wd-button>
      <wd-button size="small" type="danger" @click="handleClearAll">
        清空所有数据
      </wd-button>
    </view>

    <wd-paging
      ref="pagingRef"
      :fetch="fetchArticles"
      :tabs="articleTabs"
    >
      <template #item="{ item }">
        <view class="article-card">
          <view class="article-title">{{ item.title }}</view>
          <view class="article-summary">{{ item.summary }}</view>
        </view>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { PagingInstance, PagingTabItem } from '@/wd/components/wd-paging/wd-paging.vue'

const pagingRef = ref<PagingInstance>()

const articleTabs: PagingTabItem[] = [
  { name: 'tech', title: '科技', data: { category: 'tech' } },
  { name: 'life', title: '生活', data: { category: 'life' } },
  { name: 'sports', title: '体育', data: { category: 'sports' } },
]

const fetchArticles = async (query: PageQuery) => {
  try {
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    const data = await response.json()
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}

// 刷新数据
const handleRefresh = () => {
  pagingRef.value?.refresh()
}

// 加载更多
const handleLoadMore = () => {
  if (pagingRef.value?.canLoadMore()) {
    pagingRef.value.loadMore()
  } else {
    uni.showToast({
      title: '没有更多数据了',
      icon: 'none',
    })
  }
}

// 回到顶部
const handleScrollTop = () => {
  pagingRef.value?.scrollToTop()
}

// 清空所有数据
const handleClearAll = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空所有缓存数据吗?',
    success: (res) => {
      if (res.confirm) {
        pagingRef.value?.clearAllData()
        uni.showToast({
          title: '已清空',
          icon: 'success',
        })
      }
    },
  })
}

// 获取当前状态
const checkStatus = () => {
  const pageData = pagingRef.value?.pageData
  const loading = pagingRef.value?.loading
  const currentTab = pagingRef.value?.currentTabIndex

  console.log('当前分页数据:', pageData)
  console.log('加载状态:', loading)
  console.log('当前Tab:', currentTab)
}
</script>

```

**暴露的方法:**
- `refresh()` - 刷新当前数据
- `loadMore()` - 手动加载更多
- `scrollToTop()` - 滚动到顶部
- `switchTab(nameOrIndex)` - 切换到指定 Tab
- `switchRadio(value)` - 切换到指定 Radio
- `clearAllData()` - 清空所有缓存数据
- `clearTabData(tabIndex?)` - 清空指定 Tab 的数据
- `clearTabRadioData(tabIndex?, radioValue?)` - 清空指定 Tab+Radio 的数据
- `canLoadMore()` - 检查是否可以加载更多
- `scrollRadioIntoView()` - 滚动 Radio 到可视区域

参考: src/wd/components/wd-paging/wd-paging.vue:418-458, 1560-1579

### 粘性定位配置

配置 Tabs、RadioGroup、搜索框的粘性定位。

```vue
<template>
  <view class="page">
    <wd-paging
      :fetch="fetchGoods"
      :tabs="goodsTabs"
      :radio-group-config="priceRadioConfig"
      show-search
      tabs-fixed
      radio-group-sticky
      search-sticky
      :navbar-height="navbarHeight"
      :tabs-height="48"
      :radio-group-height="60"
    >
      <template #item="{ item }">
        <view class="goods-card">
          <image :src="item.image" class="goods-image" mode="aspectFill" />
          <view class="goods-info">
            <view class="goods-name">{{ item.name }}</view>
            <view class="goods-price">¥{{ item.price }}</view>
          </view>
        </view>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import type { PagingTabItem, PagingRadioGroupConfig } from '@/wd/components/wd-paging/wd-paging.vue'

// 获取导航栏高度
const navbarHeight = ref(0)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  // 计算导航栏高度: 状态栏高度 + 导航栏高度(默认44px)
  navbarHeight.value = systemInfo.statusBarHeight + 44
})

const goodsTabs: PagingTabItem[] = [
  { name: 'all', title: '全部', data: {} },
  { name: 'hot', title: '热门', data: { hot: true } },
  { name: 'new', title: '最新', data: { sort: 'new' } },
]

const priceRadioConfig: PagingRadioGroupConfig = {
  field: 'priceRange',
  defaultValue: 'all',
  options: [
    { label: '全部', value: 'all' },
    { label: '0-100', value: '0-100' },
    { label: '100-500', value: '100-500' },
    { label: '500+', value: '500-' },
  ],
  scrollThreshold: 3, // 选项超过3个启用滚动
}

const fetchGoods = async (query: PageQuery) => {
  try {
    const response = await fetch('/api/goods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    const data = await response.json()
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}
</script>

```

**技术实现:**
- `tabs-fixed` - 启用 Tabs 粘性定位
- `radio-group-sticky` - RadioGroup 独立粘性定位(不依赖 tabsFixed)
- `search-sticky` - 搜索框粘性定位
- `navbar-height` - 导航栏高度,用于计算粘性定位的 top 偏移量
- `tabs-height` - Tabs 高度,用于计算其他元素的偏移量
- `radio-group-height` - RadioGroup 高度,用于计算搜索框的偏移量

参考: src/wd/components/wd-paging/wd-paging.vue:389-394, 640-695

### 数据加载事件

监听数据加载事件,执行额外操作。

```vue
<template>
  <view class="page">
    <view class="stats">
      <view class="stat-item">
        <text class="stat-label">加载次数:</text>
        <text class="stat-value">{{ loadCount }}</text>
      </view>
      <view class="stat-item">
        <text class="stat-label">总记录数:</text>
        <text class="stat-value">{{ totalRecords }}</text>
      </view>
      <view class="stat-item">
        <text class="stat-label">当前页:</text>
        <text class="stat-value">{{ currentPage }}</text>
      </view>
    </view>

    <wd-paging
      :fetch="fetchData"
      @load="handleLoad"
      @error="handleError"
    >
      <template #item="{ item }">
        <view class="data-card">
          <view class="data-id">ID: {{ item.id }}</view>
          <view class="data-name">{{ item.name }}</view>
        </view>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loadCount = ref(0)
const totalRecords = ref(0)
const currentPage = ref(1)

const fetchData = async (query: PageQuery) => {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    const data = await response.json()
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}

// 数据加载成功事件
const handleLoad = (data: PageResult<any>, tabIndex?: number) => {
  loadCount.value++
  totalRecords.value = data.total
  currentPage.value = data.current

  console.log('数据加载成功:', data)
  console.log('当前Tab索引:', tabIndex)

  // 可以在这里执行统计上报等操作
  uni.reportAnalytics('page_load', {
    page: data.current,
    total: data.total,
    tabIndex: tabIndex,
  })
}

// 数据加载失败事件
const handleError = (error: Error) => {
  console.error('数据加载失败:', error)

  uni.showToast({
    title: '加载失败,请重试',
    icon: 'none',
  })

  // 上报错误
  uni.reportAnalytics('load_error', {
    error: error.message,
  })
}
</script>

```

**技术实现:**
- `@load` 事件在数据加载成功后触发,携带 `PageResult` 和 `tabIndex` 参数
- `@error` 事件在数据加载失败时触发,携带 `Error` 对象
- 可以在这些事件中执行统计上报、错误处理等操作

参考: src/wd/components/wd-paging/wd-paging.vue:401-402, 412, 1319, 1331

### 复杂业务场景

综合使用所有功能的复杂业务场景。

```vue
<template>
  <view class="page">
    <wd-paging
      ref="pagingRef"
      :fetch="fetchOrders"
      :tabs="orderTabs"
      :params="extraParams"
      show-search
      search-placeholder="搜索订单号、商品名称"
      show-total
      tabs-fixed
      radio-group-sticky
      search-sticky
      :navbar-height="88"
      :max-records="100"
      :disabled-auto-load="isManualMode"
      :show-manual-load-button="isManualMode"
      show-back-top
      @load="handleLoad"
      @tab-change="handleTabChange"
      @radio-change="handleRadioChange"
      @search="handleSearch"
      @error="handleError"
      @manual-load-more="handleManualLoadMore"
    >
      <!-- 订单卡片 -->
      <template #item="{ item, index, currentTab, currentRadioValue }">
        <view class="order-card" @click="handleOrderClick(item)">
          <view class="order-header">
            <view class="order-no">订单号: {{ item.orderNo }}</view>
            <view :class="`order-status status-${item.status}`">
              {{ item.statusText }}
            </view>
          </view>

          <view class="order-products">
            <view
              v-for="product in item.products"
              :key="product.id"
              class="product-item"
            >
              <image :src="product.image" class="product-image" mode="aspectFill" />
              <view class="product-info">
                <view class="product-name">{{ product.name }}</view>
                <view class="product-spec">{{ product.spec }}</view>
                <view class="product-price">
                  ¥{{ product.price }} x {{ product.quantity }}
                </view>
              </view>
            </view>
          </view>

          <view class="order-footer">
            <view class="order-total">
              合计: <text class="amount">¥{{ item.totalAmount }}</text>
            </view>
            <view class="order-actions">
              <wd-button
                v-if="item.status === 'pending'"
                size="small"
                type="primary"
                @click.stop="handlePay(item)"
              >
                立即支付
              </wd-button>
              <wd-button
                size="small"
                type="default"
                @click.stop="handleViewDetail(item)"
              >
                查看详情
              </wd-button>
            </view>
          </view>
        </view>
      </template>

      <!-- 底部统计信息 -->
      <template #after-items="{ currentPageData, displayRecords }">
        <view v-if="displayRecords.length > 0" class="summary-card">
          <view class="summary-item">
            <text class="summary-label">当前显示:</text>
            <text class="summary-value">{{ displayRecords.length }} 条</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">总计:</text>
            <text class="summary-value">{{ currentPageData.total }} 条</text>
          </view>
        </view>
      </template>

      <!-- 自定义空状态 -->
      <template #empty="{ currentTabData }">
        <view class="custom-empty">
          <image
            src="/static/images/empty-order.png"
            class="empty-image"
            mode="aspectFit"
          />
          <view class="empty-text">
            {{ currentTabData ? `暂无${currentTabData.title}` : '暂无订单' }}
          </view>
        </view>
      </template>
    </wd-paging>

    <!-- 浮动操作按钮 -->
    <view class="fab-group">
      <view class="fab" @click="handleToggleMode">
        <wd-icon :name="isManualMode ? 'play-circle' : 'pause-circle'" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { PagingInstance, PagingTabItem } from '@/wd/components/wd-paging/wd-paging.vue'

const pagingRef = ref<PagingInstance>()
const isManualMode = ref(false)

// 额外的查询参数
const extraParams = ref({
  storeId: '12345',
})

// Tabs 配置
const orderTabs: PagingTabItem[] = [
  {
    name: 'all',
    title: '全部订单',
    data: {},
    radioGroupConfig: {
      field: 'timeRange',
      defaultValue: 'all',
      options: [
        { label: '全部', value: 'all' },
        { label: '近7天', value: '7' },
        { label: '近30天', value: '30' },
        { label: '近90天', value: '90' },
      ],
    },
  },
  {
    name: 'pending',
    title: '待付款',
    data: { status: 'pending' },
    badgeProps: {
      modelValue: 8,
      isDot: false,
    },
  },
  {
    name: 'paid',
    title: '已付款',
    data: { status: 'paid' },
  },
  {
    name: 'shipped',
    title: '已发货',
    data: { status: 'shipped' },
  },
  {
    name: 'completed',
    title: '已完成',
    data: { status: 'completed' },
  },
  {
    name: 'cancelled',
    title: '已取消',
    data: { status: 'cancelled' },
  },
]

// 数据获取
const fetchOrders = async (query: PageQuery) => {
  console.log('查询参数:', query)

  try {
    // 模拟API请求
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    const data = await response.json()
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}

// 事件处理
const handleLoad = (data: PageResult<any>, tabIndex?: number) => {
  console.log('数据加载成功:', data, '当前Tab:', tabIndex)
}

const handleTabChange = ({ index, name, tab }) => {
  console.log('Tab切换:', index, name, tab)
}

const handleRadioChange = ({ value, option, field, tabIndex }) => {
  console.log('Radio变化:', field, value, option, '在Tab:', tabIndex)
}

const handleSearch = (keyword: string) => {
  console.log('搜索:', keyword)
}

const handleError = (error: Error) => {
  console.error('加载失败:', error)
  uni.showToast({
    title: '加载失败',
    icon: 'none',
  })
}

const handleManualLoadMore = ({ currentRecords, maxRecords }) => {
  console.log(`手动加载更多: ${currentRecords}/${maxRecords}`)
}

// 订单操作
const handleOrderClick = (order: any) => {
  console.log('点击订单:', order)
}

const handlePay = (order: any) => {
  console.log('支付订单:', order)
  uni.navigateTo({
    url: `/pages/pay/index?orderNo=${order.orderNo}`,
  })
}

const handleViewDetail = (order: any) => {
  uni.navigateTo({
    url: `/pages/order/detail?orderNo=${order.orderNo}`,
  })
}

// 切换加载模式
const handleToggleMode = () => {
  isManualMode.value = !isManualMode.value
  uni.showToast({
    title: isManualMode.value ? '手动加载模式' : '自动加载模式',
    icon: 'none',
  })
}
</script>

```

**功能说明:**
- 完整的订单列表场景
- Tab 切换不同订单状态
- Radio 筛选时间范围
- 搜索订单号或商品名称
- 自定义订单卡片展示
- 底部显示统计信息
- 自定义空状态
- 切换自动/手动加载模式
- 完整的错误处理

参考: src/wd/components/wd-paging/wd-paging.vue:16-88

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| fetch | **必填** API请求函数,接收 `PageQuery` 参数,返回 `[error, PageResult]` | `(query: PageQuery) => Result<PageResult<any>>` | - |
| params | 额外的查询参数,会合并到 PageQuery 中 | `Record<string, any>` | `{}` |
| auto | 是否自动加载首页数据 | `boolean` | `true` |
| page-size | 每页条数 | `number` | `10` |
| disabled-auto-load | 是否禁用自动分页加载,禁用后需手动加载更多 | `boolean` | `false` |
| max-records | 最大记录数限制,0 表示无限制 | `number` | `0` |
| show-manual-load-button | 是否显示手动加载更多按钮(当禁用自动加载时) | `boolean` | `false` |
| show-search | 是否显示搜索框 | `boolean` | `false` |
| search-placeholder | 搜索占位符 | `string` | `'请输入搜索关键词'` |
| search-sticky | 搜索框是否粘性定位 | `boolean` | `false` |
| tabs | Tabs 配置列表 | `PagingTabItem[]` | `[]` |
| default-tab | 默认选中的 Tab,可以是索引或 name | `number \| string` | `0` |
| tabs-fixed | Tabs 是否粘性定位 | `boolean` | `false` |
| radio-group-config | 全局 RadioGroup 配置,作为默认配置 | `PagingRadioGroupConfig \| undefined` | `undefined` |
| radio-group-sticky | RadioGroup 是否粘性定位(独立于 tabsFixed) | `boolean` | `false` |
| show-total | 是否在搜索框显示总数 | `boolean` | `false` |
| show-back-top | 是否显示回到顶部按钮 | `boolean` | `true` |
| background | 背景色 | `string` | `''` |
| bottom-safe-area | 底部安全距离 | `string` | `'72rpx'` |
| empty-min-height | 空数据区域最小高度 | `string` | `'600rpx'` |
| loading-min-height | 加载区域最小高度 | `string` | `'600rpx'` |
| loading-text | 加载文本 | `string` | `'加载中...'` |
| load-more-text | 加载更多文本 | `string` | `'上拉加载更多'` |
| manual-load-more-text | 手动加载更多文本 | `string` | `'点击加载更多'` |
| finished-text | 完成文本 | `string` | `'没有更多了'` |
| max-records-reached-text | 达到最大记录数限制文本 | `string` | `'已显示全部数据'` |
| empty-text | 空数据文本 | `string` | `'暂无数据'` |
| empty-image | 空数据图片类型,参考 wd-status-tip 组件 | `string` | `'content'` |
| navbar-height | 导航栏高度(px),用于粘性定位的偏移量 | `number` | `0` |
| tabs-height | Tabs 高度(px),用于计算其他元素的粘性定位偏移量 | `number` | `48` |
| radio-group-height | RadioGroup 高度(px),用于计算搜索框的粘性定位偏移量 | `number` | `60` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-paging/wd-paging.vue:319-395, 461-501

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| load | 数据加载成功时触发 | `data: PageResult<any>, tabIndex?: number` |
| search | 搜索时触发 | `keyword: string` |
| tab-change | Tab 切换时触发 | `event: { index: number; name: string \| number; tab: PagingTabItem }` |
| radio-change | Radio 选项变化时触发 | `event: { value: string \| number \| boolean; option: RadioOption; field: string; tabIndex: number }` |
| error | 数据加载失败时触发 | `error: Error` |
| manual-load-more | 手动加载更多时触发 | `event: { currentRecords: number; maxRecords: number }` |

参考: src/wd/components/wd-paging/wd-paging.vue:400-414

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| item | 数据项插槽 | `{ item: any, index: number, currentTab: number, currentTabData: PagingTabItem, currentRadioValue: string \| number \| boolean, currentRadioData: RadioOption }` |
| after-items | 数据项后的插槽,在所有情况下都显示 | `{ currentTab: number, currentTabData: PagingTabItem, currentRadioValue: string \| number \| boolean, currentRadioData: RadioOption, currentPageData: PageResult<any>, displayRecords: any[] }` |
| empty | 空数据状态插槽 | `{ currentTab: number, currentTabData: PagingTabItem, currentRadioValue: string \| number \| boolean, currentRadioData: RadioOption }` |

参考: src/wd/components/wd-paging/wd-paging.vue:171-217

### 暴露方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| refresh | 刷新当前数据 | - | `Promise<void>` |
| loadMore | 加载更多数据 | - | `Promise<void>` |
| scrollToTop | 滚动到页面顶部 | - | `void` |
| switchTab | 切换到指定 Tab | `nameOrIndex: string \| number` | `void` |
| switchRadio | 切换到指定 Radio 选项 | `value: string \| number \| boolean` | `void` |
| scrollRadioIntoView | 滚动 Radio 到可视区域 | - | `Promise<void>` |
| clearAllData | 清空所有数据,重置到初始状态 | - | `void` |
| clearTabData | 清空指定 Tab 的数据 | `tabIndex?: number` | `void` |
| clearTabRadioData | 清空指定 Tab+Radio 组合的数据 | `tabIndex?: number, radioValue?: string \| number \| boolean` | `void` |
| canLoadMore | 检查是否可以加载更多 | - | `boolean` |

参考: src/wd/components/wd-paging/wd-paging.vue:418-458, 1560-1579

### 暴露属性

| 属性名 | 说明 | 类型 |
|--------|------|------|
| pageData | 当前分页数据 | `ComputedRef<PageResult<any>>` |
| loading | 加载状态 | `Ref<boolean>` |
| currentTabIndex | 当前 Tab 索引 | `Ref<number>` |
| currentTabData | 当前 Tab 数据 | `ComputedRef<PagingTabItem \| null>` |
| currentRadioValue | 当前 Radio 值 | `ComputedRef<string \| number \| boolean>` |
| currentRadioData | 当前 Radio 数据 | `ComputedRef<RadioOption \| null>` |
| isReachEnd | 是否到达结束状态 | `ComputedRef<boolean>` |
| displayRecords | 实际显示的记录(受 maxRecords 限制) | `ComputedRef<any[]>` |

参考: src/wd/components/wd-paging/wd-paging.vue:440-458, 1560-1579

### 类型定义

```typescript
/** Tabs配置 */
export interface PagingTabItem {
  /** 标签名称,作为唯一标识 */
  name?: string | number
  /** 标题 */
  title: string
  /** 是否禁用 */
  disabled?: boolean
  /** 徽标属性,参考 Badge 组件 */
  badgeProps?: {
    modelValue?: string | number
    max?: number
    isDot?: boolean
    right?: string
    showZero?: boolean
  }
  /** 自定义数据,会传递给查询参数 */
  data?: any
  /** 单选框选项配置 */
  radioGroupConfig?: PagingRadioGroupConfig
}

/** RadioGroup配置 */
export interface PagingRadioGroupConfig {
  /** 查询字段名,将作为查询参数的key */
  field: string
  /** 默认选中的值 */
  defaultValue?: string | number | boolean
  /** 选项列表 */
  options: RadioOption[]
  /** 是否启用水平滚动,当选项超过此数量时启用,默认为3 */
  scrollThreshold?: number
}

/** Paging 组件实例类型 */
export type PagingInstance = ComponentPublicInstance<WdPagingProps, WdPagingExpose>
```

参考: src/wd/components/wd-paging/wd-paging.vue:282-314, 1582

## 最佳实践

### 1. 合理使用数据缓存

组件为每个 Tab+Radio 组合独立缓存数据,合理使用缓存可以提升用户体验:

```typescript
// ✅ 推荐: 充分利用缓存,用户切换回之前的Tab时无需重新加载
const orderTabs: PagingTabItem[] = [
  { name: 'all', title: '全部', data: {} },
  { name: 'pending', title: '待付款', data: { status: 'pending' } },
]

// ✅ 推荐: 在需要时手动清空缓存
const handleRefreshAll = () => {
  pagingRef.value?.clearAllData()
  // 清空后会自动重新加载当前Tab的数据
}

// ✅ 推荐: 操作完成后只清空相关Tab的缓存
const handleOrderPaid = (orderNo: string) => {
  // 支付完成后,清空"待付款"Tab的缓存
  const pendingTabIndex = orderTabs.findIndex(tab => tab.name === 'pending')
  pagingRef.value?.clearTabData(pendingTabIndex)
}

// ❌ 不推荐: 频繁清空所有缓存,浪费已加载的数据
const handleSomeAction = () => {
  pagingRef.value?.clearAllData() // 这会清空所有Tab的缓存
}
```

**说明:**
- 组件会自动管理缓存,切换Tab时如果有缓存则直接显示
- 只在数据确实需要刷新时才清空缓存
- 使用 `clearTabData` 只清空相关 Tab,避免清空所有缓存

参考: src/wd/components/wd-paging/wd-paging.vue:888-964

### 2. Tab 和 Radio 配置的优先级

Tab 级别的 `radioGroupConfig` 优先级高于全局配置:

```typescript
// ✅ 推荐: 为不同Tab配置不同的Radio选项
const tabs: PagingTabItem[] = [
  {
    name: 'all',
    title: '全部用户',
    data: {},
    // 这个Tab使用全局radioGroupConfig
  },
  {
    name: 'vip',
    title: 'VIP用户',
    data: { userType: 'vip' },
    // 这个Tab有独立的radioGroupConfig,优先级更高
    radioGroupConfig: {
      field: 'level',
      defaultValue: '1',
      options: [
        { label: '铜牌', value: '1' },
        { label: '银牌', value: '2' },
        { label: '金牌', value: '3' },
      ],
    },
  },
]

// 全局配置,作为默认配置
const globalRadioConfig: PagingRadioGroupConfig = {
  field: 'priority',
  defaultValue: '2',
  options: [
    { label: '低', value: '1' },
    { label: '正常', value: '2' },
    { label: '高', value: '3' },
  ],
}

// ❌ 不推荐: 所有Tab使用相同的Radio配置,灵活性差
// 如果每个Tab的筛选维度不同,应该使用Tab级别的配置
```

**说明:**
- Tab 级别的 `radioGroupConfig` 可以覆盖全局配置
- 每个 Tab 可以有完全不同的筛选维度
- 全局配置作为默认配置,减少重复代码

参考: src/wd/components/wd-paging/wd-paging.vue:570-636

### 3. 查询参数的构建逻辑

理解组件如何构建查询参数,正确设置各项配置:

```typescript
// 查询参数构建顺序:
// 1. 基础参数: pageNum, pageSize
// 2. 外部 params
// 3. 搜索关键词: searchValue (如果有)
// 4. Tab 的 data
// 5. Radio 的 field:value

// ✅ 推荐: 清晰的参数分层
const params = ref({
  storeId: '12345', // 全局参数
})

const tabs: PagingTabItem[] = [
  {
    name: 'urgent',
    title: '紧急订单',
    data: {
      status: 'pending', // Tab级别参数
      urgent: true,
    },
  },
]

const radioConfig = {
  field: 'timeRange', // Radio参数
  options: [
    { label: '今天', value: 'today' },
    { label: '本周', value: 'week' },
  ],
}

// 最终查询参数示例:
// {
//   pageNum: 1,
//   pageSize: 10,
//   storeId: '12345',      // 来自 params
//   searchValue: '订单号',  // 来自搜索框
//   status: 'pending',      // 来自 tab.data
//   urgent: true,           // 来自 tab.data
//   timeRange: 'today'      // 来自 radio
// }

// ❌ 不推荐: 参数混乱,在多个地方设置同一个参数
const params = ref({
  status: 'pending', // 应该放在 tab.data 中
})
```

**说明:**
- 全局参数使用 `params` 属性
- Tab 相关参数使用 `tab.data`
- Radio 筛选使用 `radioGroupConfig.field`
- 搜索关键词自动添加到 `searchValue`

参考: src/wd/components/wd-paging/wd-paging.vue:1084-1135

### 4. 粘性定位的正确配置

粘性定位需要正确计算各元素的高度:

```typescript
// ✅ 推荐: 准确测量并设置各元素高度
import { ref, onMounted } from 'vue'

const navbarHeight = ref(0)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  // 状态栏高度 + 导航栏高度(iOS 44px, Android可能不同)
  navbarHeight.value = systemInfo.statusBarHeight + 44
})

// 使用粘性定位
// <wd-paging
//   tabs-fixed
//   radio-group-sticky
//   search-sticky
//   :navbar-height="navbarHeight"
//   :tabs-height="48"
//   :radio-group-height="60"
// />

// ❌ 不推荐: 使用固定值,在不同设备上可能不准确
// <wd-paging
//   tabs-fixed
//   :navbar-height="88"  // 固定值可能不准确
// />
```

**说明:**
- 使用 `uni.getSystemInfoSync()` 获取准确的状态栏高度
- 各元素的粘性定位 top 值会自动累加计算
- Tabs 在 navbar 下方
- Radio 在 Tabs 下方(如果 Tabs 固定)
- 搜索框在 Radio 下方(如果 Radio 固定)

参考: src/wd/components/wd-paging/wd-paging.vue:640-695

### 5. 限制最大记录数的使用

合理使用 `maxRecords` 和 `disabledAutoLoad` 控制数据加载:

```typescript
// ✅ 推荐: 长列表使用限制,防止性能问题
// <wd-paging
//   :max-records="100"
//   disabled-auto-load
//   show-manual-load-button
// />

// ✅ 推荐: 提示用户使用搜索功能
const handleManualLoadMore = ({ currentRecords, maxRecords }) => {
  if (currentRecords >= maxRecords) {
    uni.showModal({
      title: '提示',
      content: '数据较多,建议使用搜索功能缩小范围',
      showCancel: false,
    })
  }
}

// ✅ 推荐: 短列表可以不限制
// <wd-paging :fetch="fetchData" />

// ❌ 不推荐: 无限制加载大量数据,可能导致性能问题
// 对于可能有数千条数据的列表,建议设置限制
```

**说明:**
- 长列表(可能有数千条数据)应该设置 `maxRecords` 限制
- 配合 `disabledAutoLoad` 和 `showManualLoadButton` 使用
- 达到限制后引导用户使用搜索功能
- 短列表(几十到一两百条)可以不限制

参考: src/wd/components/wd-paging/wd-paging.vue:765-820

## 常见问题

### 1. 为什么切换Tab后数据没有加载?

**问题原因:**
- fetch 函数定义有误,未正确返回 `[error, result]` 格式
- fetch 函数内部抛出异常但未捕获
- 后端接口返回格式不符合 `PageResult` 结构

**解决方案:**

```typescript
// ✅ 正确的 fetch 函数
const fetchData = async (query: PageQuery) => {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      body: JSON.stringify(query),
    })
    const data = await response.json()

    // 确保返回 [error, result] 格式
    return [null, data]
  } catch (error) {
    // 捕获异常并返回
    return [error, null]
  }
}

// ❌ 错误: 直接返回数据,格式不对
const fetchData = async (query: PageQuery) => {
  const response = await fetch('/api/data')
  return response.json() // 错误!应该返回 [null, data]
}

// ❌ 错误: 未捕获异常
const fetchData = async (query: PageQuery) => {
  const response = await fetch('/api/data')
  const data = await response.json()
  return [null, data] // 如果fetch失败,会抛出异常而不是返回[error, null]
}
```

参考: src/wd/components/wd-paging/wd-paging.vue:325-326, 1242-1336

### 2. Radio 选项过多时如何处理?

**问题原因:**
- Radio 选项很多时,会超出屏幕宽度
- 不知道如何启用水平滚动

**解决方案:**

```typescript
// ✅ 方案1: 设置 scrollThreshold,自动启用滚动
const radioConfig: PagingRadioGroupConfig = {
  field: 'category',
  defaultValue: 'all',
  options: [
    // 超过10个选项...
  ],
  scrollThreshold: 3, // 选项超过3个时启用水平滚动
}

// ✅ 方案2: 考虑是否选项太多,应该改用其他交互方式
// 如果选项超过10个,建议改用弹出层+列表选择
const handleSelectCategory = () => {
  uni.showActionSheet({
    itemList: categories.map(c => c.label),
    success: (res) => {
      const category = categories[res.tapIndex]
      pagingRef.value?.switchRadio(category.value)
    },
  })
}

// ✅ 方案3: 分组选项,使用多级筛选
const primaryRadioConfig = {
  field: 'mainCategory',
  options: [
    { label: '电子产品', value: 'electronics' },
    { label: '服装', value: 'clothing' },
  ],
}

// 根据主分类动态设置二级分类
const getSecondaryRadioConfig = (mainCategory) => {
  return {
    field: 'subCategory',
    options: subCategoryMap[mainCategory],
  }
}
```

参考: src/wd/components/wd-paging/wd-paging.vue:304-314, 594-602, 969-1082

### 3. 如何在操作后刷新列表?

**问题原因:**
- 进行了添加、删除、编辑操作后,不知道如何刷新列表
- 不确定是刷新当前页还是重新加载第一页

**解决方案:**

```typescript
// ✅ 方案1: 添加操作后,刷新第一页
const handleAdd = async () => {
  const result = await addItem()
  if (result.success) {
    // 清空当前Tab缓存,重新加载第一页
    pagingRef.value?.clearTabData()
  }
}

// ✅ 方案2: 删除操作后,刷新当前页
const handleDelete = async (id: string) => {
  const result = await deleteItem(id)
  if (result.success) {
    // 刷新当前数据
    pagingRef.value?.refresh()
  }
}

// ✅ 方案3: 编辑操作后,只更新本地数据
const handleEdit = async (item: any) => {
  const result = await editItem(item)
  if (result.success) {
    // 直接更新本地数据,无需重新请求
    const pageData = pagingRef.value?.pageData
    if (pageData) {
      const index = pageData.records.findIndex(r => r.id === item.id)
      if (index >= 0) {
        pageData.records[index] = result.data
      }
    }
  }
}

// ✅ 方案4: 跨Tab操作后,清空相关Tab缓存
const handleChangeStatus = async (id: string, newStatus: string) => {
  const result = await changeStatus(id, newStatus)
  if (result.success) {
    // 清空所有Tab缓存,因为状态变化可能影响多个Tab
    pagingRef.value?.clearAllData()
  }
}
```

参考: src/wd/components/wd-paging/wd-paging.vue:888-964, 1341-1343

### 4. 粘性定位不生效怎么办?

**问题原因:**
- 没有正确设置 `navbarHeight`
- 各元素高度设置不准确
- CSS 冲突

**解决方案:**

```typescript
// ✅ 检查1: 确保正确设置 navbarHeight
import { ref, onMounted } from 'vue'

const navbarHeight = ref(0)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  console.log('状态栏高度:', systemInfo.statusBarHeight)

  // 自定义导航栏
  navbarHeight.value = systemInfo.statusBarHeight + 44

  // 如果使用系统导航栏
  // navbarHeight.value = 0
})

// ✅ 检查2: 确保各元素高度准确
// <wd-paging
//   :navbar-height="navbarHeight"
//   :tabs-height="48"          // Tabs实际高度
//   :radio-group-height="60"   // Radio区域实际高度
// />

// ✅ 检查3: 查看控制台日志
// 组件会计算并应用粘性定位样式,可以通过审查元素查看计算结果

// ✅ 检查4: 确保页面使用了正确的布局
// 粘性定位需要在滚动容器中生效,确保页面可以滚动

// ❌ 常见错误: page 设置了 height: 100vh 但内容不足以滚动
```

参考: src/wd/components/wd-paging/wd-paging.vue:640-695

### 5. 如何实现下拉刷新?

**问题原因:**
- 组件基于 scroll-view 实现,不是页面滚动
- 不知道如何集成下拉刷新功能

**解决方案:**

```vue
<!-- ✅ 方案1: 使用页面的下拉刷新 -->
<template>
  <view class="page">
    <wd-paging ref="pagingRef" :fetch="fetchData">
      <template #item="{ item }">
        <!-- ... -->
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const pagingRef = ref()

// 在 pages.json 中配置
// {
//   "path": "pages/list/index",
//   "style": {
//     "enablePullDownRefresh": true
//   }
// }

// 监听下拉刷新
onPullDownRefresh(() => {
  pagingRef.value?.refresh()

  // 刷新完成后停止下拉动画
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 1000)
})
</script>

<!-- ✅ 方案2: 在搜索框上方添加刷新按钮 -->
<template>
  <view class="page">
    <view class="refresh-bar">
      <wd-button
        size="small"
        icon="refresh"
        @click="handleRefresh"
      >
        刷新
      </wd-button>
    </view>

    <wd-paging ref="pagingRef" :fetch="fetchData">
      <!-- ... -->
    </wd-paging>
  </view>
</template>
```

参考: src/wd/components/wd-paging/wd-paging.vue:1341-1343

## 注意事项

1. **fetch 函数返回格式** - fetch 函数必须返回 `[error, result]` 格式,result 需符合 `PageResult<any>` 结构

2. **数据缓存机制** - 组件为每个 Tab+Radio 组合独立缓存数据,切换时无需重新加载,理解这一点对使用组件很重要

3. **查询参数构建顺序** - 查询参数按顺序合并: params → searchValue → tab.data → radio.field:value

4. **Tab 和 Radio 配置优先级** - Tab 级别的 `radioGroupConfig` 优先级高于全局 `radioGroupConfig`

5. **粘性定位的层级** - 三个粘性元素的 z-index: Tabs(90) > Radio(80) > Search(70),确保正确的视觉层级

6. **IntersectionObserver 的创建时机** - 组件会在数据加载完成后自动创建观察器,无需手动管理

7. **maxRecords 的影响** - 设置 `maxRecords` 后,`displayRecords` 会被截取,但 `pageData.records` 仍包含所有已加载数据

8. **清空数据的影响** - `clearAllData` 会清空所有缓存并销毁观察器,`clearTabData` 只清空指定 Tab 的缓存

9. **Radio 水平滚动阈值** - `scrollThreshold` 默认为 3,选项数量超过此值时启用水平滚动

10. **搜索功能的实现** - 搜索关键词自动添加到 `query.searchValue`,后端需要支持此参数

11. **首次加载状态** - 组件区分首次加载(`firstLoading`)和加载更多(`loading`),首次加载时显示全屏loading

12. **暴露属性是响应式的** - 通过 ref 访问的 `pageData`、`loading` 等属性都是响应式的,可以在模板中直接使用

参考: src/wd/components/wd-paging/wd-paging.vue:1-1675
