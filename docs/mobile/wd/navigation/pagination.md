# Pagination 分页

## 介绍

Pagination 分页组件用于在数据量过多时,将数据分页展示,提供页码导航功能。组件采用简洁的设计风格,支持文本和图标两种展示模式,适用于列表数据、表格数据等场景的分页控制。

**核心特性:**

- **简洁导航** - 提供上一页、下一页按钮和当前页/总页数显示,界面简洁清晰
- **双模式展示** - 支持文本模式和图标模式,文本模式显示"上一页/下一页",图标模式使用箭头图标
- **智能计算** - 支持直接设置总页数,也可通过总条数和每页条数自动计算总页数
- **信息展示** - 可选择展示详细分页信息,包括当前页、总条数、每页条数等
- **按钮状态** - 自动管理按钮状态,首页时禁用上一页,末页时禁用下一页,防止无效操作
- **自定义文本** - 支持自定义上一页和下一页的按钮文本,满足个性化需求
- **智能隐藏** - 提供单页隐藏功能,当总页数只有1页时可选择隐藏分页组件
- **国际化** - 内置国际化支持,自动根据语言环境显示相应文本

参考: src/wd/components/wd-pagination/wd-pagination.vue:1-199

## 基本用法

### 基础分页

最简单的分页用法,只需要提供当前页和总页数。

```vue
<template>
  <view class="demo">
    <wd-pagination v-model="current" :total-page="10" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const current = ref(1)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- 使用 `v-model` 绑定当前页码,实现双向数据绑定
- `total-page` 属性设置总页数
- 组件默认隐藏单页分页(`hideIfOnePage` 默认为 `true`)
- 页码从1开始计数

参考: src/wd/components/wd-pagination/wd-pagination.vue:82-99

### 自动计算总页数

通过总条数和每页条数自动计算总页数,无需手动设置 `total-page`。

```vue
<template>
  <view class="demo">
    <wd-pagination
      v-model="current"
      :total="95"
      :page-size="10"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const current = ref(1)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**技术实现:**
- 组件监听 `total` 属性变化,自动调用 `updateTotalPage` 方法
- 使用 `Math.ceil(total / pageSize)` 计算总页数
- 当 `total` 为95,`pageSize` 为10时,计算结果为10页
- 优先级: 如果同时设置了 `total` 和 `totalPage`,优先使用 `total` 计算

参考: src/wd/components/wd-pagination/wd-pagination.vue:148-168

### 图标模式

使用图标替代文本,更加美观简洁。

```vue
<template>
  <view class="demo">
    <wd-pagination
      v-model="current"
      :total-page="10"
      show-icon
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const current = ref(1)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**技术实现:**
- `show-icon` 为 `true` 时,使用 `wd-icon` 组件显示箭头图标
- 左箭头通过 CSS `transform: rotate(180deg)` 旋转右箭头实现
- 图标根据按钮状态自动应用不同样式类: `wd-pager__nav--active` 和 `wd-pager__nav--disabled`
- 图标大小由 CSS 变量 `$-pagination-icon-size` 控制

参考: src/wd/components/wd-pagination/wd-pagination.vue:17-46, 271-274

### 显示分页信息

展示详细的分页信息,包括当前页、总条数和每页条数。

```vue
<template>
  <view class="demo">
    <wd-pagination
      v-model="current"
      :total="95"
      :page-size="10"
      show-message
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const current = ref(1)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**技术实现:**
- `show-message` 为 `true` 时,在分页按钮下方显示信息文本
- 信息包括: "第X页,共X条,每页X条"
- 使用 `useTranslate` composable 实现国际化
- 信息文本样式由 `wd-pager__message` 类控制
- 如果未设置 `total`,则不显示总条数信息

参考: src/wd/components/wd-pagination/wd-pagination.vue:50-54, 236-241

### 自定义按钮文本

自定义上一页和下一页的按钮文本。

```vue
<template>
  <view class="demo">
    <wd-pagination
      v-model="current"
      :total-page="10"
      prev-text="向前"
      next-text="向后"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const current = ref(1)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**技术实现:**
- 通过 `prev-text` 和 `next-text` 属性自定义按钮文本
- 如果未设置,则使用国际化文本 `translate('prev')` 和 `translate('next')`
- 只在非图标模式下生效,图标模式下忽略自定义文本
- 支持任意长度的文本,但建议保持简短

参考: src/wd/components/wd-pagination/wd-pagination.vue:17, 41, 94-97

### 监听页码变化

监听页码变化事件,执行数据加载等操作。

```vue
<template>
  <view class="demo">
    <wd-pagination
      v-model="current"
      :total="dataList.length"
      :page-size="pageSize"
      @change="handlePageChange"
    />

    <view class="data-list">
      <view
        v-for="item in currentPageData"
        :key="item.id"
        class="data-item"
      >
        {{ item.name }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

// 模拟数据
const dataList = ref(
  Array.from({ length: 95 }, (_, i) => ({
    id: i + 1,
    name: `数据项 ${i + 1}`,
  }))
)

const current = ref(1)
const pageSize = 10

// 计算当前页数据
const currentPageData = computed(() => {
  const start = (current.value - 1) * pageSize
  const end = start + pageSize
  return dataList.value.slice(start, end)
})

// 页码变化处理
const handlePageChange = (event: { value: number }) => {
  console.log('页码变化:', event.value)
  // 可以在这里执行数据加载、滚动到顶部等操作
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.data-list {
  margin-top: 32rpx;
}

.data-item {
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}
</style>
```

**技术实现:**
- 组件触发两个事件: `change` 和 `update:modelValue`
- `change` 事件携带 `{ value: number }` 参数,表示新的页码
- `update:modelValue` 事件用于 v-model 双向绑定
- 可以在 `change` 事件中执行异步数据加载、页面滚动等操作
- 配合 computed 属性实现数据分页显示

参考: src/wd/components/wd-pagination/wd-pagination.vue:105-110, 174-198

### 显示单页分页

即使只有一页数据,也显示分页组件。

```vue
<template>
  <view class="demo">
    <wd-pagination
      v-model="current"
      :total-page="1"
      :hide-if-one-page="false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const current = ref(1)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**技术实现:**
- 通过设置 `hide-if-one-page` 为 `false` 强制显示单页分页
- 默认值为 `true`,即单页时隐藏组件
- 组件根节点使用 `v-if="!(hideIfOnePage && totalPageNum === 1)"` 控制显示
- 单页时上一页和下一页按钮都处于禁用状态

参考: src/wd/components/wd-pagination/wd-pagination.vue:4, 98-99, 121

## 高级用法

### 完整分页系统

结合所有功能,构建完整的分页数据展示系统。

```vue
<template>
  <view class="demo">
    <!-- 数据列表 -->
    <view class="product-list">
      <view
        v-for="item in currentPageData"
        :key="item.id"
        class="product-item"
      >
        <view class="product-name">{{ item.name }}</view>
        <view class="product-price">¥{{ item.price }}</view>
      </view>
    </view>

    <!-- 分页组件 -->
    <wd-pagination
      v-model="current"
      :total="filteredData.length"
      :page-size="pageSize"
      show-icon
      show-message
      @change="handlePageChange"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Product {
  id: number
  name: string
  price: number
}

// 模拟商品数据
const allProducts = ref<Product[]>(
  Array.from({ length: 156 }, (_, i) => ({
    id: i + 1,
    name: `商品 ${i + 1}`,
    price: Math.floor(Math.random() * 10000) / 100,
  }))
)

const current = ref(1)
const pageSize = 20

// 筛选后的数据(这里示例中直接使用全部数据)
const filteredData = computed(() => allProducts.value)

// 当前页数据
const currentPageData = computed(() => {
  const start = (current.value - 1) * pageSize
  const end = start + pageSize
  return filteredData.value.slice(start, end)
})

// 页码变化处理
const handlePageChange = (event: { value: number }) => {
  console.log('切换到第', event.value, '页')

  // 滚动到页面顶部
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })

  // 如果是服务端分页,可以在这里发起请求
  // loadData(event.value, pageSize)
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.product-list {
  margin-bottom: 32rpx;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.product-name {
  font-size: 28rpx;
  color: #333;
}

.product-price {
  font-size: 32rpx;
  color: #ff4444;
  font-weight: bold;
}
</style>
```

**技术实现:**
- 同时使用 `show-icon` 和 `show-message` 提供完整的分页信息
- 使用 computed 属性计算当前页数据,实现前端分页
- 页码变化时自动滚动到页面顶部,提升用户体验
- 支持切换为服务端分页,只需修改 `handlePageChange` 方法

参考: src/wd/components/wd-pagination/wd-pagination.vue:2-199

### 服务端分页

结合后端接口实现服务端分页,适用于大数据量场景。

```vue
<template>
  <view class="demo">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 数据列表 -->
    <view v-else class="article-list">
      <view
        v-for="item in articles"
        :key="item.id"
        class="article-item"
      >
        <view class="article-title">{{ item.title }}</view>
        <view class="article-summary">{{ item.summary }}</view>
        <view class="article-meta">
          <text>{{ item.author }}</text>
          <text>{{ item.date }}</text>
        </view>
      </view>
    </view>

    <!-- 分页组件 -->
    <wd-pagination
      v-model="current"
      :total="total"
      :page-size="pageSize"
      show-icon
      show-message
      @change="handlePageChange"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface Article {
  id: number
  title: string
  summary: string
  author: string
  date: string
}

const articles = ref<Article[]>([])
const current = ref(1)
const pageSize = 15
const total = ref(0)
const loading = ref(false)

// 加载数据
const loadData = async (page: number, size: number) => {
  loading.value = true

  try {
    // 模拟API请求
    const response = await new Promise<{
      data: Article[]
      total: number
    }>((resolve) => {
      setTimeout(() => {
        const mockData = Array.from({ length: size }, (_, i) => ({
          id: (page - 1) * size + i + 1,
          title: `文章标题 ${(page - 1) * size + i + 1}`,
          summary: '这是文章的摘要内容...',
          author: '作者名称',
          date: '2025-01-01',
        }))

        resolve({
          data: mockData,
          total: 328, // 模拟总条数
        })
      }, 500)
    })

    articles.value = response.data
    total.value = response.total
  } catch (error) {
    console.error('加载失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

// 页码变化处理
const handlePageChange = (event: { value: number }) => {
  loadData(event.value, pageSize)

  // 滚动到顶部
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
}

// 初始加载
onMounted(() => {
  loadData(current.value, pageSize)
})
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.loading {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
}

.article-list {
  margin-bottom: 32rpx;
}

.article-item {
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.article-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.article-summary {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12rpx;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
}
</style>
```

**技术实现:**
- 使用 `loading` 状态控制加载提示显示
- 通过 `total` 属性动态设置总条数,组件自动计算总页数
- 页码变化时调用 `loadData` 方法请求新数据
- 使用 `async/await` 处理异步请求
- 添加错误处理,提升用户体验

参考: src/wd/components/wd-pagination/wd-pagination.vue:82-84, 148-168

### 筛选后分页

结合筛选功能,实现筛选后的数据分页。

```vue
<template>
  <view class="demo">
    <!-- 筛选条件 -->
    <view class="filter">
      <view class="filter-item">
        <text class="filter-label">类别:</text>
        <view class="filter-options">
          <view
            v-for="item in categories"
            :key="item.value"
            class="filter-option"
            :class="{ active: category === item.value }"
            @click="handleCategoryChange(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>

    <!-- 数据列表 -->
    <view class="book-list">
      <view
        v-for="item in currentPageData"
        :key="item.id"
        class="book-item"
      >
        <view class="book-name">{{ item.name }}</view>
        <view class="book-category">{{ item.category }}</view>
      </view>
    </view>

    <!-- 分页组件 -->
    <wd-pagination
      v-model="current"
      :total="filteredData.length"
      :page-size="pageSize"
      show-message
      @change="handlePageChange"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

interface Book {
  id: number
  name: string
  category: string
}

// 类别选项
const categories = [
  { label: '全部', value: '' },
  { label: '小说', value: '小说' },
  { label: '历史', value: '历史' },
  { label: '科技', value: '科技' },
]

// 模拟书籍数据
const allBooks = ref<Book[]>(
  Array.from({ length: 120 }, (_, i) => ({
    id: i + 1,
    name: `书籍 ${i + 1}`,
    category: categories[Math.floor(Math.random() * 3) + 1].value,
  }))
)

const category = ref('')
const current = ref(1)
const pageSize = 12

// 筛选后的数据
const filteredData = computed(() => {
  if (!category.value) {
    return allBooks.value
  }
  return allBooks.value.filter(book => book.category === category.value)
})

// 当前页数据
const currentPageData = computed(() => {
  const start = (current.value - 1) * pageSize
  const end = start + pageSize
  return filteredData.value.slice(start, end)
})

// 监听筛选条件变化,重置到第一页
watch(category, () => {
  current.value = 1
})

// 类别变化处理
const handleCategoryChange = (value: string) => {
  category.value = value
}

// 页码变化处理
const handlePageChange = (event: { value: number }) => {
  console.log('切换到第', event.value, '页')
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.filter {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 8rpx;
}

.filter-item {
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.filter-option {
  padding: 12rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 4rpx;
  font-size: 26rpx;
  color: #666;

  &.active {
    background-color: #4d80f0;
    color: #fff;
  }
}

.book-list {
  margin-bottom: 32rpx;
}

.book-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.book-name {
  font-size: 28rpx;
  color: #333;
}

.book-category {
  font-size: 24rpx;
  color: #999;
}
</style>
```

**技术实现:**
- 使用 computed 属性根据筛选条件过滤数据
- 监听筛选条件变化,自动重置页码到第一页
- 分页组件的 `total` 属性使用筛选后的数据长度
- 筛选和分页逻辑完全解耦,易于维护

参考: src/wd/components/wd-pagination/wd-pagination.vue:82-84, 148-168

### 分页缓存

实现页码缓存,用户离开页面后再次进入时恢复到之前的页码。

```vue
<template>
  <view class="demo">
    <!-- 数据列表 -->
    <view class="news-list">
      <view
        v-for="item in currentPageData"
        :key="item.id"
        class="news-item"
        @click="handleNewsClick(item.id)"
      >
        <view class="news-title">{{ item.title }}</view>
        <view class="news-date">{{ item.date }}</view>
      </view>
    </view>

    <!-- 分页组件 -->
    <wd-pagination
      v-model="current"
      :total-page="totalPage"
      show-icon
      @change="handlePageChange"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface News {
  id: number
  title: string
  date: string
}

// 缓存键名
const CACHE_KEY = 'news_list_page'

// 模拟新闻数据
const allNews = ref<News[]>(
  Array.from({ length: 80 }, (_, i) => ({
    id: i + 1,
    title: `新闻标题 ${i + 1}`,
    date: '2025-01-01',
  }))
)

const current = ref(1)
const pageSize = 10
const totalPage = Math.ceil(allNews.value.length / pageSize)

// 当前页数据
const currentPageData = computed(() => {
  const start = (current.value - 1) * pageSize
  const end = start + pageSize
  return allNews.value.slice(start, end)
})

// 页码变化处理
const handlePageChange = (event: { value: number }) => {
  console.log('切换到第', event.value, '页')

  // 保存页码到缓存
  uni.setStorageSync(CACHE_KEY, event.value)
}

// 新闻点击处理
const handleNewsClick = (id: number) => {
  // 跳转到详情页
  uni.navigateTo({
    url: `/pages/news/detail?id=${id}`,
  })
}

// 加载缓存的页码
onMounted(() => {
  try {
    const cachedPage = uni.getStorageSync(CACHE_KEY)
    if (cachedPage && cachedPage >= 1 && cachedPage <= totalPage) {
      current.value = cachedPage
    }
  } catch (error) {
    console.error('读取缓存失败:', error)
  }
})

// 清理缓存(可选)
onUnmounted(() => {
  // 如果需要在页面卸载时清理缓存,可以在这里处理
  // uni.removeStorageSync(CACHE_KEY)
})
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.news-list {
  margin-bottom: 32rpx;
}

.news-item {
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.news-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.news-date {
  font-size: 24rpx;
  color: #999;
}
</style>
```

**技术实现:**
- 使用 `uni.setStorageSync` 和 `uni.getStorageSync` 实现页码缓存
- `onMounted` 生命周期中读取缓存的页码
- 验证缓存页码的合法性,防止越界
- 页码变化时自动更新缓存
- 可以根据需要在 `onUnmounted` 中清理缓存

参考: src/wd/components/wd-pagination/wd-pagination.vue:82-84, 105-110

### 跳转到指定页

提供输入框,允许用户直接跳转到指定页码。

```vue
<template>
  <view class="demo">
    <!-- 数据列表 -->
    <view class="item-list">
      <view
        v-for="item in currentPageData"
        :key="item.id"
        class="item"
      >
        数据项 {{ item.id }}
      </view>
    </view>

    <!-- 分页组件 -->
    <wd-pagination
      v-model="current"
      :total-page="totalPage"
      show-icon
      show-message
    />

    <!-- 跳转输入框 -->
    <view class="jump-to">
      <text class="jump-label">跳转到</text>
      <input
        v-model.number="jumpPage"
        type="number"
        class="jump-input"
        placeholder="页码"
        @confirm="handleJump"
      />
      <text class="jump-unit">页</text>
      <button class="jump-button" size="mini" @click="handleJump">
        确定
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface DataItem {
  id: number
}

// 模拟数据
const allData = ref<DataItem[]>(
  Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }))
)

const current = ref(1)
const jumpPage = ref<number | undefined>()
const pageSize = 15
const totalPage = Math.ceil(allData.value.length / pageSize)

// 当前页数据
const currentPageData = computed(() => {
  const start = (current.value - 1) * pageSize
  const end = start + pageSize
  return allData.value.slice(start, end)
})

// 处理跳转
const handleJump = () => {
  if (!jumpPage.value) {
    uni.showToast({
      title: '请输入页码',
      icon: 'none',
    })
    return
  }

  if (jumpPage.value < 1 || jumpPage.value > totalPage) {
    uni.showToast({
      title: `页码范围: 1-${totalPage}`,
      icon: 'none',
    })
    return
  }

  current.value = jumpPage.value
  jumpPage.value = undefined

  // 滚动到顶部
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.item-list {
  margin-bottom: 32rpx;
}

.item {
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
  text-align: center;
}

.jump-to {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 8rpx;
}

.jump-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 16rpx;
}

.jump-input {
  width: 120rpx;
  height: 60rpx;
  padding: 0 16rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 4rpx;
  text-align: center;
  font-size: 28rpx;
}

.jump-unit {
  font-size: 28rpx;
  color: #333;
  margin: 0 16rpx;
}

.jump-button {
  background-color: #4d80f0;
  color: #fff;
  border: none;
}
</style>
```

**技术实现:**
- 使用 `v-model.number` 确保输入框绑定的是数字类型
- 在跳转前验证页码的合法性(范围检查)
- 直接修改 `current` 值实现跳转,组件会自动更新显示
- 添加友好的错误提示,提升用户体验

参考: src/wd/components/wd-pagination/wd-pagination.vue:82-84

### 无限滚动与分页结合

将分页组件与无限滚动结合,提供更灵活的数据加载方式。

```vue
<template>
  <view class="demo">
    <!-- 数据列表 -->
    <scroll-view
      scroll-y
      class="scroll-view"
      @scrolltolower="handleLoadMore"
    >
      <view
        v-for="item in loadedData"
        :key="item.id"
        class="card-item"
      >
        <view class="card-title">{{ item.title }}</view>
        <view class="card-content">{{ item.content }}</view>
      </view>

      <!-- 加载提示 -->
      <view v-if="loading" class="loading-tip">
        加载中...
      </view>

      <!-- 没有更多数据提示 -->
      <view v-if="!hasMore" class="no-more-tip">
        没有更多数据了
      </view>
    </scroll-view>

    <!-- 分页组件 -->
    <wd-pagination
      v-model="current"
      :total-page="totalPage"
      show-icon
      @change="handlePageChange"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface CardData {
  id: number
  title: string
  content: string
}

// 模拟数据
const allData = ref<CardData[]>(
  Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    title: `卡片 ${i + 1}`,
    content: `这是卡片 ${i + 1} 的内容`,
  }))
)

const loadedData = ref<CardData[]>([])
const current = ref(1)
const pageSize = 10
const totalPage = Math.ceil(allData.value.length / pageSize)
const loading = ref(false)

// 是否还有更多数据
const hasMore = computed(() => {
  return loadedData.value.length < allData.value.length
})

// 加载指定页的数据
const loadPage = (page: number) => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const pageData = allData.value.slice(start, end)

  loadedData.value = allData.value.slice(0, end)
  current.value = page
}

// 加载更多(滚动到底部)
const handleLoadMore = () => {
  if (loading.value || !hasMore.value) {
    return
  }

  loading.value = true

  // 模拟异步加载
  setTimeout(() => {
    if (current.value < totalPage) {
      loadPage(current.value + 1)
    }
    loading.value = false
  }, 500)
}

// 页码变化(点击分页组件)
const handlePageChange = (event: { value: number }) => {
  loadPage(event.value)

  // 滚动到顶部
  const scrollView = uni.createSelectorQuery().select('.scroll-view')
  scrollView.scrollTop = 0
}

// 初始加载
loadPage(1)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.scroll-view {
  flex: 1;
  margin-bottom: 32rpx;
}

.card-item {
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.card-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.loading-tip,
.no-more-tip {
  text-align: center;
  padding: 24rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
```

**技术实现:**
- 使用 `scroll-view` 组件监听滚动到底部事件
- 无限滚动逐步加载数据,累积显示
- 分页组件用于快速跳转到指定页
- 两种加载方式互不干扰,提供灵活的导航方式
- 添加加载状态和结束提示,提升用户体验

参考: src/wd/components/wd-pagination/wd-pagination.vue:2-199

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model-value / v-model | 当前页码,支持双向绑定 | `number` | - |
| total-page | 总页数,如果同时设置了 total,则优先使用 total 计算页数 | `number` | `1` |
| show-icon | 是否使用图标模式,为 true 时显示箭头图标,为 false 时显示文本 | `boolean` | `false` |
| show-message | 是否显示分页详细信息(当前页、总条数、每页条数) | `boolean` | `false` |
| total | 总条数,用于自动计算总页数 | `number` | `0` |
| page-size | 每页条数,与 total 配合使用自动计算总页数 | `number` | `10` |
| prev-text | 上一页按钮文本,仅在非图标模式下生效 | `string` | `'上一页'` |
| next-text | 下一页按钮文本,仅在非图标模式下生效 | `string` | `'下一页'` |
| hide-if-one-page | 总页数只有一页时是否隐藏分页组件 | `boolean` | `true` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-pagination/wd-pagination.vue:73-100

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 页码变化时触发 | `event: { value: number }` |
| update:modelValue | 当前页码更新时触发,用于 v-model 双向绑定 | `value: number` |

参考: src/wd/components/wd-pagination/wd-pagination.vue:105-110

### 方法

组件内部方法,通过源码暴露:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| handleNext | 处理下一页点击事件 | - | `void` |
| handlePrev | 处理上一页点击事件 | - | `void` |
| updateTotalPage | 更新总页数,根据 total 和 pageSize 计算 | - | `void` |

参考: src/wd/components/wd-pagination/wd-pagination.vue:148-198

### 类型定义

```typescript
/**
 * 分页组件属性接口
 */
interface WdPaginationProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 当前页码 */
  modelValue: number
  /** 总页数,如果有total,则优先使用total计算页数 */
  totalPage?: number
  /** 是否展示分页为Icon图标 */
  showIcon?: boolean
  /** 是否展示总条数信息 */
  showMessage?: boolean
  /** 总条数 */
  total?: number
  /** 每页条数 */
  pageSize?: number
  /** 上一页文本 */
  prevText?: string
  /** 下一页文本 */
  nextText?: string
  /** 总页数只有一页时是否隐藏 */
  hideIfOnePage?: boolean
}

/**
 * 分页组件事件接口
 */
interface WdPaginationEmits {
  /** 页码变化时触发 */
  change: [event: { value: number }]
  /** 更新当前页码 */
  'update:modelValue': [value: number]
}
```

参考: src/wd/components/wd-pagination/wd-pagination.vue:73-110

## 主题定制

### CSS 变量

组件提供以下 CSS 变量用于主题定制:

```scss
// 分页组件主题变量
$-pagination-icon-size: 32rpx !default;              // 图标大小
$-pagination-content-padding: 32rpx !default;        // 内容区域内边距
$-pagination-message-color: rgba(0, 0, 0, 0.45) !default;  // 消息文本颜色
$-pagination-message-fs: 28rpx !default;             // 消息文本字体大小
$-pagination-message-padding: 0 32rpx 32rpx !default; // 消息文本内边距
$-pagination-nav-width: 150rpx !default;             // 导航按钮最小宽度
$-pagination-nav-content-fs: 28rpx !default;         // 页码文本字体大小
$-pagination-nav-sepatator-padding: 0 12rpx !default; // 分隔符内边距
$-pagination-nav-current-color: #4d80f0 !default;    // 当前页码颜色
```

参考: src/wd/components/wd-pagination/wd-pagination.vue:201-281

### 暗黑模式

组件内置暗黑模式支持,通过 `wot-theme-dark` 类名自动切换:

```scss
.wot-theme-dark {
  .wd-pager {
    background-color: $-dark-background;

    &__message {
      color: $-dark-color3;
    }
  }
}
```

**使用方式:**

```vue
<template>
  <view :class="{ 'wot-theme-dark': isDark }">
    <wd-pagination v-model="current" :total-page="10" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)
const current = ref(1)
</script>
```

参考: src/wd/components/wd-pagination/wd-pagination.vue:206-215

### 自定义样式

通过 `custom-class` 和 `custom-style` 自定义组件样式:

```vue
<template>
  <wd-pagination
    v-model="current"
    :total-page="10"
    custom-class="my-pagination"
    custom-style="margin: 20px 0;"
  />
</template>

<style lang="scss">
.my-pagination {
  // 自定义背景色
  background: linear-gradient(to right, #f5f5f5, #fff);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

  // 自定义当前页码颜色
  .wd-pager__current {
    color: #ff4444;
    font-weight: bold;
  }

  // 自定义按钮样式
  .wd-pager__nav {
    min-width: 180rpx;
  }
}
</style>
```

参考: src/wd/components/wd-pagination/wd-pagination.vue:78-80

## 最佳实践

### 1. 选择合适的总页数设置方式

根据数据来源选择合适的总页数设置方式:

```vue
<!-- ✅ 推荐: 前端分页时使用 total 和 pageSize -->
<wd-pagination
  v-model="current"
  :total="dataList.length"
  :page-size="10"
/>

<!-- ✅ 推荐: 后端分页时直接使用 total-page -->
<wd-pagination
  v-model="current"
  :total-page="totalPage"
/>

<!-- ❌ 不推荐: 同时设置 total 和 total-page,会造成混淆 -->
<wd-pagination
  v-model="current"
  :total="100"
  :total-page="10"
/>
```

**说明:**
- 前端分页场景,使用 `total` 和 `page-size`,组件自动计算总页数
- 后端分页场景,直接使用后端返回的 `total-page`
- 避免同时设置两种方式,以免造成混淆

参考: src/wd/components/wd-pagination/wd-pagination.vue:82-99, 148-168

### 2. 合理使用显示模式

根据界面设计和内容密度选择合适的显示模式:

```vue
<!-- ✅ 推荐: 简单列表使用图标模式,节省空间 -->
<wd-pagination
  v-model="current"
  :total-page="10"
  show-icon
/>

<!-- ✅ 推荐: 复杂表格使用文本+信息模式,提供完整信息 -->
<wd-pagination
  v-model="current"
  :total="156"
  :page-size="20"
  show-message
/>

<!-- ✅ 推荐: 移动端优先使用图标模式 -->
<wd-pagination
  v-model="current"
  :total-page="10"
  show-icon
/>
```

**说明:**
- 图标模式更简洁,适合移动端和空间受限的场景
- 文本模式更清晰,适合老年用户和无障碍场景
- `show-message` 适合需要展示详细分页信息的场景

参考: src/wd/components/wd-pagination/wd-pagination.vue:86-89

### 3. 页码变化时处理滚动位置

页码变化时,应自动滚动到页面顶部或列表顶部:

```vue
<script lang="ts" setup>
const handlePageChange = (event: { value: number }) => {
  // ✅ 推荐: 滚动到页面顶部
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })

  // ✅ 推荐: 如果使用 scroll-view,滚动到列表顶部
  const query = uni.createSelectorQuery()
  query.select('#scroll-view').boundingClientRect()
  query.exec((res) => {
    uni.pageScrollTo({
      scrollTop: res[0].top,
      duration: 300,
    })
  })

  // 加载新数据
  loadData(event.value)
}
</script>
```

**说明:**
- 页码变化后不滚动,用户需要手动滚动查看新数据,体验不佳
- 使用 `uni.pageScrollTo` 实现平滑滚动
- `duration` 设置为 300ms 提供流畅的动画效果

参考: src/wd/components/wd-pagination/wd-pagination.vue:105-110

### 4. 合理处理筛选和分页的关系

筛选条件变化时,应重置页码到第一页:

```vue
<script lang="ts" setup>
import { ref, watch } from 'vue'

const category = ref('')
const current = ref(1)

// ✅ 推荐: 监听筛选条件,重置页码
watch(category, () => {
  current.value = 1
})

// ❌ 不推荐: 不重置页码,可能导致当前页无数据
// 例如: 筛选前有10页,当前第8页,筛选后只有3页,第8页无数据
</script>
```

**说明:**
- 筛选条件变化后,数据总数可能变化,当前页码可能无效
- 始终重置到第一页,确保用户看到筛选结果
- 也可以检查当前页码是否超出新的总页数,然后调整

参考: src/wd/components/wd-pagination/wd-pagination.vue:82-84

### 5. 单页时的显示策略

根据业务场景选择合适的单页显示策略:

```vue
<!-- ✅ 推荐: 列表数据,单页时隐藏(默认行为) -->
<wd-pagination
  v-model="current"
  :total-page="totalPage"
  :hide-if-one-page="true"
/>

<!-- ✅ 推荐: 搜索结果,始终显示分页(即使只有一页) -->
<wd-pagination
  v-model="current"
  :total="searchResults.length"
  :page-size="10"
  :hide-if-one-page="false"
/>

<!-- ✅ 推荐: 表格数据,始终显示以保持布局稳定 -->
<wd-pagination
  v-model="current"
  :total-page="totalPage"
  :hide-if-one-page="false"
  show-message
/>
```

**说明:**
- 普通列表,单页时隐藏分页,界面更简洁
- 搜索结果或表格,始终显示分页,保持布局一致性
- 后台管理系统建议始终显示,方便用户了解数据量

参考: src/wd/components/wd-pagination/wd-pagination.vue:4, 98-99

## 常见问题

### 1. 为什么页码变化了但数据没更新?

**问题原因:**
- 只绑定了 `v-model` 但没有监听 `change` 事件
- 没有在 `change` 事件中加载新数据
- 前端分页时,没有根据页码计算当前页数据

**解决方案:**

```vue
<template>
  <wd-pagination
    v-model="current"
    :total-page="10"
    @change="handlePageChange"
  />
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const current = ref(1)
const pageSize = 10

// ✅ 方案1: 使用 computed 自动计算当前页数据
const currentPageData = computed(() => {
  const start = (current.value - 1) * pageSize
  const end = start + pageSize
  return allData.value.slice(start, end)
})

// ✅ 方案2: 监听 change 事件加载数据
const handlePageChange = (event: { value: number }) => {
  loadData(event.value, pageSize)
}
</script>
```

参考: src/wd/components/wd-pagination/wd-pagination.vue:105-110, 174-198

### 2. 如何实现服务端分页?

**问题原因:**
- 不清楚如何在页码变化时请求后端数据
- 不知道如何设置总页数

**解决方案:**

```vue
<template>
  <wd-pagination
    v-model="current"
    :total="total"
    :page-size="pageSize"
    @change="handlePageChange"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const current = ref(1)
const pageSize = 20
const total = ref(0)
const dataList = ref([])

// ✅ 加载数据的方法
const loadData = async (page: number, size: number) => {
  try {
    const response = await fetch(`/api/list?page=${page}&size=${size}`)
    const data = await response.json()

    // 更新数据和总条数
    dataList.value = data.list
    total.value = data.total
  } catch (error) {
    console.error('加载失败:', error)
  }
}

// ✅ 页码变化时加载数据
const handlePageChange = (event: { value: number }) => {
  loadData(event.value, pageSize)
}

// ✅ 初始加载
onMounted(() => {
  loadData(current.value, pageSize)
})
</script>
```

参考: src/wd/components/wd-pagination/wd-pagination.vue:82-84, 148-168

### 3. 总页数计算不正确怎么办?

**问题原因:**
- 同时设置了 `total-page` 和 `total`,优先级混淆
- `page-size` 设置不正确
- `total` 数据未及时更新

**解决方案:**

```vue
<script lang="ts" setup>
import { ref, watch } from 'vue'

const total = ref(0)
const pageSize = 10

// ✅ 方案1: 只使用 total 和 pageSize,让组件自动计算
// 组件内部: Math.ceil(total / pageSize)

// ✅ 方案2: 后端返回总页数,直接使用
const totalPage = ref(0)
// 从后端获取: totalPage.value = response.totalPages

// ❌ 错误: 同时设置两种方式
// <wd-pagination :total="100" :total-page="10" />

// ✅ 正确: 监听 total 变化,确保总页数更新
watch(total, (newTotal) => {
  console.log('总条数变化:', newTotal)
  console.log('总页数:', Math.ceil(newTotal / pageSize))
})
</script>
```

参考: src/wd/components/wd-pagination/wd-pagination.vue:84, 148-168

### 4. 如何禁用分页按钮?

**问题原因:**
- 组件自动管理按钮禁用状态,但不清楚禁用逻辑
- 想要手动控制按钮禁用状态

**解决方案:**

```vue
<!-- ✅ 组件自动禁用 -->
<!-- 首页时上一页按钮自动禁用 -->
<!-- 末页时下一页按钮自动禁用 -->
<wd-pagination v-model="current" :total-page="10" />

<!-- ❌ 组件不提供手动禁用功能 -->
<!-- 如需要,可以通过控制显示/隐藏实现 -->
<wd-pagination
  v-if="!isLoading"
  v-model="current"
  :total-page="10"
/>
<view v-else class="loading">加载中...</view>
```

**技术说明:**
- 上一页按钮: 当 `modelValue <= 1` 时自动禁用
- 下一页按钮: 当 `modelValue >= totalPageNum` 时自动禁用
- 禁用时按钮的 `disabled` 属性为 `true`,图标样式变为 `wd-pager__nav--disabled`

参考: src/wd/components/wd-pagination/wd-pagination.vue:10-14, 34-37, 174-198

### 5. 如何自定义分页样式?

**问题原因:**
- 不知道如何修改按钮样式
- 不清楚 CSS 变量的使用方法

**解决方案:**

```vue
<template>
  <wd-pagination
    v-model="current"
    :total-page="10"
    custom-class="my-pagination"
  />
</template>

<style lang="scss">
.my-pagination {
  // ✅ 修改导航按钮宽度
  .wd-pager__nav {
    min-width: 200rpx;
  }

  // ✅ 修改当前页码颜色
  .wd-pager__current {
    color: #ff4444;
    font-size: 32rpx;
    font-weight: bold;
  }

  // ✅ 修改消息文本样式
  .wd-pager__message {
    color: #666;
    font-size: 26rpx;
  }

  // ✅ 修改图标大小
  .wd-pager__icon {
    font-size: 40rpx;
  }
}
</style>
```

参考: src/wd/components/wd-pagination/wd-pagination.vue:218-281

## 注意事项

1. **页码从1开始** - 组件的页码从1开始计数,不是从0开始,使用时注意数组索引转换

2. **v-model 必填** - `model-value` 是必填属性,必须通过 v-model 或显式绑定提供当前页码

3. **总页数设置优先级** - 如果同时设置了 `total` 和 `total-page`,组件优先使用 `total` 和 `page-size` 计算总页数

4. **自动计算总页数** - 使用 `total` 和 `page-size` 时,组件自动调用 `Math.ceil(total / pageSize)` 计算总页数

5. **图标模式的文本无效** - 当 `show-icon` 为 `true` 时,`prev-text` 和 `next-text` 属性不生效

6. **单页隐藏默认开启** - `hide-if-one-page` 默认为 `true`,只有一页时组件不显示,如需显示需设置为 `false`

7. **按钮状态自动管理** - 组件自动管理按钮的禁用状态,首页禁用上一页,末页禁用下一页,无需手动控制

8. **change 事件参数格式** - `change` 事件的参数是对象格式 `{ value: number }`,不是直接的 `number`

9. **国际化支持** - 组件使用 `useTranslate('pagination')` 实现国际化,可根据语言环境自动切换文本

10. **左箭头实现方式** - 左箭头是通过 CSS `transform: rotate(180deg)` 旋转右箭头实现的

11. **暗黑模式自动适配** - 组件内置暗黑模式样式,通过 `wot-theme-dark` 类名自动切换

12. **分页信息显示条件** - 启用 `show-message` 后,如果未设置 `total` 属性,则不显示总条数信息,只显示当前页和每页条数

参考: src/wd/components/wd-pagination/wd-pagination.vue:1-281
