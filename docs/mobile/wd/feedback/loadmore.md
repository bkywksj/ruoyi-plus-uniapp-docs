---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/loadmore
---

# Loadmore 加载更多

## 介绍

Loadmore 加载更多组件用于在列表底部展示加载状态,适用于分页加载、下拉刷新、无限滚动等场景。组件支持三种状态:加载中(loading)、加载完成(finished)、加载失败(error),并提供完整的重试机制。

**核心特性:**

- **三种状态** - 支持 loading(加载中)、finished(加载完成)、error(加载失败) 三种状态
- **自定义文案** - 支持自定义各状态的提示文案,支持国际化
- **重试机制** - 加载失败时点击可重新加载,提供良好的用户体验
- **加载动画** - 内置 Loading 组件,支持自定义动画类型、颜色、大小
- **分割线样式** - 加载完成状态使用 Divider 组件展示,样式优雅
- **暗黑模式** - 支持暗黑主题适配
- **国际化支持** - 内置多语言翻译,支持 useTranslate 自定义

**技术实现:**

组件内部使用三个子组件实现不同状态的展示:
- `wd-loading`: 加载状态时显示加载动画
- `wd-divider`: 完成状态时显示分割线
- `wd-icon`: 错误状态时显示刷新图标

## 基本用法

### 加载中状态

设置 `state="loading"` 显示加载中状态。默认显示 Loading 动画和"加载中..."文案。

```vue
<template>
  <view class="demo">
    <wd-loadmore state="loading" />
  </view>
</template>
```

**状态说明:**
- 加载中状态显示 Loading 动画和提示文案
- 默认文案为"加载中...",可通过 `loading-text` 自定义
- Loading 动画可通过 `loading-props` 自定义

### 加载完成状态

设置 `state="finished"` 显示加载完成状态。使用 Divider 分割线展示,表示没有更多数据。

```vue
<template>
  <view class="demo">
    <wd-loadmore state="finished" />
  </view>
</template>
```

**状态说明:**
- 加载完成状态使用 Divider 组件展示
- 默认文案为"没有更多了",可通过 `finished-text` 自定义
- 适用于列表数据全部加载完成的场景

### 加载失败状态

设置 `state="error"` 显示加载失败状态,点击可触发重新加载。

```vue
<template>
  <view class="demo">
    <wd-loadmore state="error" @reload="handleReload" />
  </view>
</template>

<script lang="ts" setup>
const handleReload = () => {
  console.log('重新加载')
  // 重新发起请求
}
</script>
```

**状态说明:**
- 加载失败状态显示错误文案、重试提示和刷新图标
- 点击整个组件区域触发 `reload` 事件
- 默认显示"加载失败 点击重试"文案

### 自定义文案

通过 `loading-text`、`finished-text`、`error-text` 自定义各状态的提示文案。

```vue
<template>
  <view class="demo">
    <!-- 自定义加载中文案 -->
    <wd-loadmore state="loading" loading-text="正在努力加载中..." />

    <!-- 自定义加载完成文案 -->
    <wd-loadmore state="finished" finished-text="— 我是有底线的 —" />

    <!-- 自定义加载失败文案 -->
    <wd-loadmore state="error" error-text="网络开小差了" @reload="handleReload" />
  </view>
</template>

<script lang="ts" setup>
const handleReload = () => {
  // 重新加载
}
</script>
```

**文案配置:**
| 属性 | 说明 | 默认值 |
|------|------|--------|
| loading-text | 加载中提示 | 加载中... |
| finished-text | 加载完成提示 | 没有更多了 |
| error-text | 加载失败提示 | 加载失败 |

### 自定义加载动画

通过 `loading-props` 自定义加载动画的属性。支持 Loading 组件的所有属性。

```vue
<template>
  <view class="demo">
    <!-- 圆环类型 -->
    <wd-loadmore
      state="loading"
      :loading-props="{ type: 'ring' }"
    />

    <!-- 自定义颜色 -->
    <wd-loadmore
      state="loading"
      :loading-props="{ type: 'ring', color: '#1989fa' }"
    />

    <!-- 自定义大小 -->
    <wd-loadmore
      state="loading"
      :loading-props="{ size: '48rpx', color: '#ee0a24' }"
    />
  </view>
</template>
```

**loading-props 常用属性:**
| 属性 | 说明 | 类型 | 可选值 |
|------|------|------|--------|
| type | 动画类型 | `string` | `outline` / `ring` |
| color | 动画颜色 | `string` | - |
| size | 动画大小 | `string` | - |

## 高级用法

### 列表分页加载

完整的列表分页加载示例,结合 scroll-view 实现滚动加载。

```vue
<template>
  <scroll-view
    scroll-y
    class="scroll-list"
    @scrolltolower="onScrollToLower"
  >
    <view v-for="item in list" :key="item.id" class="list-item">
      <text class="item-title">{{ item.title }}</text>
      <text class="item-desc">{{ item.description }}</text>
    </view>
    <wd-loadmore :state="loadState" @reload="loadMore" />
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface ListItem {
  id: number
  title: string
  description: string
}

const list = ref<ListItem[]>([])
const loadState = ref<'loading' | 'finished' | 'error'>('loading')
const page = ref(1)
const pageSize = 10
const loading = ref(false)

// 滚动到底部触发
const onScrollToLower = () => {
  if (loadState.value === 'finished' || loading.value) return
  loadMore()
}

// 加载更多数据
const loadMore = async () => {
  if (loading.value) return
  loading.value = true
  loadState.value = 'loading'

  try {
    const res = await fetchList(page.value, pageSize)

    if (res.data.length > 0) {
      list.value.push(...res.data)
      page.value++

      // 判断是否还有更多数据
      if (res.data.length < pageSize) {
        loadState.value = 'finished'
      }
    } else {
      loadState.value = 'finished'
    }
  } catch (error) {
    loadState.value = 'error'
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

// 模拟接口请求
const fetchList = (page: number, size: number) => {
  return new Promise<{ data: ListItem[] }>((resolve, reject) => {
    setTimeout(() => {
      // 模拟第4页之后没有数据
      if (page > 3) {
        resolve({ data: [] })
        return
      }

      // 模拟随机失败
      if (Math.random() < 0.1) {
        reject(new Error('网络错误'))
        return
      }

      const data = Array.from({ length: size }, (_, i) => ({
        id: (page - 1) * size + i + 1,
        title: `列表项标题 ${(page - 1) * size + i + 1}`,
        description: `这是第 ${page} 页的第 ${i + 1} 条数据的描述信息`,
      }))
      resolve({ data })
    }, 1000)
  })
}

onMounted(() => {
  loadMore()
})
</script>

<style lang="scss" scoped>
.scroll-list {
  height: 100vh;
}

.list-item {
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #eee;
}

.item-title {
  display: block;
  font-size: 32rpx;
  color: #333;
}

.item-desc {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}
</style>
```

### 下拉刷新配合

结合 scroll-view 的下拉刷新功能,实现完整的列表刷新和加载更多。

```vue
<template>
  <scroll-view
    scroll-y
    class="scroll-list"
    refresher-enabled
    :refresher-triggered="isRefreshing"
    @refresherrefresh="onRefresh"
    @scrolltolower="onScrollToLower"
  >
    <view v-for="item in list" :key="item.id" class="list-item">
      {{ item.title }}
    </view>
    <wd-loadmore :state="loadState" @reload="loadMore" />
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface ListItem {
  id: number
  title: string
}

const list = ref<ListItem[]>([])
const isRefreshing = ref(false)
const loadState = ref<'loading' | 'finished' | 'error'>('loading')
const page = ref(1)
const pageSize = 10
const loading = ref(false)

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true

  // 重置状态
  page.value = 1
  list.value = []
  loadState.value = 'loading'

  try {
    await loadMore()
  } finally {
    isRefreshing.value = false
  }
}

// 滚动到底部
const onScrollToLower = () => {
  if (loadState.value === 'finished' || loading.value) return
  loadMore()
}

// 加载数据
const loadMore = async () => {
  if (loading.value) return
  loading.value = true
  loadState.value = 'loading'

  try {
    const res = await fetchList(page.value, pageSize)

    if (res.data.length > 0) {
      list.value.push(...res.data)
      page.value++

      if (res.data.length < pageSize) {
        loadState.value = 'finished'
      }
    } else {
      loadState.value = 'finished'
    }
  } catch (error) {
    loadState.value = 'error'
  } finally {
    loading.value = false
  }
}

// 模拟接口
const fetchList = (page: number, size: number) => {
  return new Promise<{ data: ListItem[] }>((resolve) => {
    setTimeout(() => {
      const data = page <= 3
        ? Array.from({ length: size }, (_, i) => ({
            id: (page - 1) * size + i + 1,
            title: `列表项 ${(page - 1) * size + i + 1}`,
          }))
        : []
      resolve({ data })
    }, 1000)
  })
}

onMounted(() => {
  loadMore()
})
</script>
```

### 使用 Composable 封装

封装可复用的分页加载 Composable,简化业务代码。

```typescript
// composables/usePageList.ts
import { ref, onMounted } from 'vue'

interface UsePageListOptions<T> {
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total?: number }>
  pageSize?: number
  immediate?: boolean
}

export function usePageList<T>(options: UsePageListOptions<T>) {
  const { fetchFn, pageSize = 10, immediate = true } = options

  const list = ref<T[]>([]) as { value: T[] }
  const page = ref(1)
  const loadState = ref<'loading' | 'finished' | 'error'>('loading')
  const loading = ref(false)
  const total = ref(0)

  // 加载数据
  const loadMore = async () => {
    if (loading.value || loadState.value === 'finished') return

    loading.value = true
    loadState.value = 'loading'

    try {
      const res = await fetchFn(page.value, pageSize)

      if (res.data.length > 0) {
        list.value.push(...res.data)
        page.value++

        if (res.total !== undefined) {
          total.value = res.total
        }

        if (res.data.length < pageSize) {
          loadState.value = 'finished'
        }
      } else {
        loadState.value = 'finished'
      }
    } catch (error) {
      loadState.value = 'error'
      console.error('加载失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 刷新列表
  const refresh = async () => {
    page.value = 1
    list.value = []
    loadState.value = 'loading'
    await loadMore()
  }

  // 重试
  const retry = () => {
    loadMore()
  }

  if (immediate) {
    onMounted(loadMore)
  }

  return {
    list,
    page,
    total,
    loadState,
    loading,
    loadMore,
    refresh,
    retry,
  }
}
```

```vue
<!-- 使用示例 -->
<template>
  <scroll-view scroll-y @scrolltolower="loadMore">
    <view v-for="item in list" :key="item.id">{{ item.name }}</view>
    <wd-loadmore :state="loadState" @reload="retry" />
  </scroll-view>
</template>

<script lang="ts" setup>
import { usePageList } from '@/composables/usePageList'
import { getUserList } from '@/api/user'

interface User {
  id: number
  name: string
}

const { list, loadState, loadMore, retry } = usePageList<User>({
  fetchFn: async (page, pageSize) => {
    const res = await getUserList({ page, pageSize })
    return { data: res.data.list, total: res.data.total }
  },
  pageSize: 20,
})
</script>
```

### 虚拟列表配合

在大数据量场景下,结合虚拟列表组件使用。

```vue
<template>
  <view class="virtual-list-container">
    <!-- 虚拟列表组件 -->
    <virtual-list
      :list="list"
      :item-height="100"
      @scroll-to-bottom="loadMore"
    >
      <template #default="{ item }">
        <view class="list-item">{{ item.title }}</view>
      </template>
    </virtual-list>

    <!-- 加载更多状态 -->
    <wd-loadmore :state="loadState" @reload="loadMore" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const list = ref([])
const loadState = ref('loading')

const loadMore = async () => {
  // 加载逻辑
}
</script>
```

### 空状态处理

结合 StatusTip 组件处理列表为空的情况。

```vue
<template>
  <scroll-view scroll-y @scrolltolower="onScrollToLower">
    <!-- 列表内容 -->
    <template v-if="list.length > 0">
      <view v-for="item in list" :key="item.id" class="list-item">
        {{ item.title }}
      </view>
      <wd-loadmore :state="loadState" @reload="loadMore" />
    </template>

    <!-- 空状态 -->
    <template v-else-if="loadState === 'finished'">
      <wd-status-tip image="content" tip="暂无数据" />
    </template>

    <!-- 加载失败 -->
    <template v-else-if="loadState === 'error'">
      <wd-status-tip image="network" tip="加载失败">
        <wd-button size="small" @click="loadMore">点击重试</wd-button>
      </wd-status-tip>
    </template>

    <!-- 首次加载 -->
    <template v-else>
      <view class="loading-container">
        <wd-loading />
        <text>加载中...</text>
      </view>
    </template>
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const list = ref([])
const loadState = ref<'loading' | 'finished' | 'error'>('loading')
const page = ref(1)
const isFirstLoad = ref(true)

const onScrollToLower = () => {
  if (loadState.value === 'finished' || loadState.value === 'loading') return
  loadMore()
}

const loadMore = async () => {
  loadState.value = 'loading'

  try {
    const res = await fetchList(page.value)

    if (res.data.length > 0) {
      list.value.push(...res.data)
      page.value++
    }

    if (res.data.length < 10) {
      loadState.value = 'finished'
    }

    isFirstLoad.value = false
  } catch (error) {
    loadState.value = 'error'
  }
}

onMounted(loadMore)
</script>
```

### 多列表场景

在 Tab 切换的多列表场景中使用。

```vue
<template>
  <view class="multi-list">
    <wd-tabs v-model="activeTab" @change="onTabChange">
      <wd-tab title="推荐" name="recommend" />
      <wd-tab title="热门" name="hot" />
      <wd-tab title="最新" name="new" />
    </wd-tabs>

    <scroll-view
      v-for="tab in tabs"
      v-show="activeTab === tab.name"
      :key="tab.name"
      scroll-y
      class="list-scroll"
      @scrolltolower="() => onScrollToLower(tab.name)"
    >
      <view v-for="item in tab.list" :key="item.id" class="list-item">
        {{ item.title }}
      </view>
      <wd-loadmore
        :state="tab.loadState"
        @reload="() => loadMore(tab.name)"
      />
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

interface TabData {
  name: string
  list: any[]
  page: number
  loadState: 'loading' | 'finished' | 'error'
  loading: boolean
}

const activeTab = ref('recommend')

const tabs = reactive<TabData[]>([
  { name: 'recommend', list: [], page: 1, loadState: 'loading', loading: false },
  { name: 'hot', list: [], page: 1, loadState: 'loading', loading: false },
  { name: 'new', list: [], page: 1, loadState: 'loading', loading: false },
])

const onTabChange = (name: string) => {
  const tab = tabs.find(t => t.name === name)
  if (tab && tab.list.length === 0 && tab.loadState !== 'finished') {
    loadMore(name)
  }
}

const onScrollToLower = (name: string) => {
  const tab = tabs.find(t => t.name === name)
  if (tab && tab.loadState !== 'finished' && !tab.loading) {
    loadMore(name)
  }
}

const loadMore = async (name: string) => {
  const tab = tabs.find(t => t.name === name)
  if (!tab || tab.loading) return

  tab.loading = true
  tab.loadState = 'loading'

  try {
    const res = await fetchList(name, tab.page)

    if (res.data.length > 0) {
      tab.list.push(...res.data)
      tab.page++
    }

    if (res.data.length < 10) {
      tab.loadState = 'finished'
    }
  } catch (error) {
    tab.loadState = 'error'
  } finally {
    tab.loading = false
  }
}

// 初始加载第一个 Tab
loadMore('recommend')
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| state | 加载状态 | `'loading' \| 'finished' \| 'error'` | - |
| loading-text | 加载中提示文案 | `string` | `加载中...` |
| finished-text | 加载完成提示文案 | `string` | `没有更多了` |
| error-text | 加载失败提示文案 | `string` | `加载失败` |
| loading-props | Loading 组件的属性 | `Partial<WdLoadingProps>` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| reload | 点击重新加载时触发(仅在 error 状态下有效) | - |

### 类型定义

```typescript
/**
 * 加载更多状态类型
 */
type LoadMoreState = 'loading' | 'error' | 'finished'

/**
 * 加载更多组件属性接口
 */
interface WdLoadmoreProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 加载状态 */
  state?: LoadMoreState
  /** 加载提示文案 */
  loadingText?: string
  /** 全部加载完的提示文案 */
  finishedText?: string
  /** 加载失败的提示文案 */
  errorText?: string
  /** 加载中 loading 组件的属性 */
  loadingProps?: Partial<WdLoadingProps>
}

/**
 * 加载更多组件事件接口
 */
interface WdLoadmoreEmits {
  /** 点击重新加载时触发(仅在错误状态下) */
  reload: []
}

/**
 * Loading 组件属性接口(部分)
 */
interface WdLoadingProps {
  /** 加载动画类型 */
  type?: 'outline' | 'ring'
  /** 加载动画颜色 */
  color?: string
  /** 加载动画大小 */
  size?: string
  /** 自定义样式类 */
  customClass?: string
  /** 自定义样式 */
  customStyle?: string
}
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wot-loadmore-height | 组件高度 | `96rpx` |
| --wot-loadmore-color | 文字颜色 | `rgba(0, 0, 0, 0.45)` |
| --wot-loadmore-fs | 文字大小 | `28rpx` |
| --wot-loadmore-loading-size | 加载图标大小 | `$-fs-title` (36rpx) |
| --wot-loadmore-error-color | 错误状态文字颜色 | `$-color-theme` (主题色) |
| --wot-loadmore-refresh-fs | 刷新图标大小 | `$-fs-title` (36rpx) |

### 自定义样式示例

```vue
<template>
  <view class="custom-loadmore">
    <wd-loadmore state="loading" />
  </view>
</template>

<style lang="scss" scoped>
.custom-loadmore {
  --wot-loadmore-height: 120rpx;
  --wot-loadmore-color: #666;
  --wot-loadmore-fs: 32rpx;
  --wot-loadmore-loading-size: 48rpx;
  --wot-loadmore-error-color: #ff4d4f;
}
</style>
```

### 暗黑模式

组件内置暗黑模式支持。当父元素或全局应用 `wot-theme-dark` 类名时,文字颜色会自动切换为暗黑模式颜色。

```vue
<template>
  <view class="wot-theme-dark">
    <wd-loadmore state="loading" />
  </view>
</template>
```

## 最佳实践

### 1. 防止重复加载

```typescript
// ✅ 使用 loading 状态防止重复请求
const loading = ref(false)

const loadMore = async () => {
  if (loading.value || loadState.value === 'finished') return

  loading.value = true
  try {
    await fetchData()
  } finally {
    loading.value = false
  }
}

// ❌ 不检查 loading 状态
const loadMore = async () => {
  await fetchData() // 可能重复请求
}
```

### 2. 正确判断是否还有更多数据

```typescript
// ✅ 根据返回数量判断
const loadMore = async () => {
  const res = await fetchList(page.value, pageSize)

  if (res.data.length > 0) {
    list.value.push(...res.data)
    page.value++
  }

  // 返回数量小于页大小,说明没有更多了
  if (res.data.length < pageSize) {
    loadState.value = 'finished'
  }
}

// ✅ 根据总数判断
const loadMore = async () => {
  const res = await fetchList(page.value, pageSize)

  list.value.push(...res.data)

  // 已加载数量等于总数
  if (list.value.length >= res.total) {
    loadState.value = 'finished'
  }
}
```

### 3. 错误重试处理

```typescript
// ✅ 重试时保持页码
const handleReload = () => {
  loadState.value = 'loading'
  loadMore() // 使用当前页码重试
}

// ❌ 重试时重置页码
const handleReload = () => {
  page.value = 1 // 错误:应该重试当前页
  loadMore()
}
```

### 4. 下拉刷新重置状态

```typescript
// ✅ 刷新时重置所有状态
const onRefresh = async () => {
  isRefreshing.value = true

  // 重置分页状态
  page.value = 1
  list.value = []
  loadState.value = 'loading'

  try {
    await loadMore()
  } finally {
    isRefreshing.value = false
  }
}
```

### 5. 滚动事件节流

```typescript
// ✅ 使用防抖/节流
import { useDebounceFn } from '@vueuse/core'

const onScrollToLower = useDebounceFn(() => {
  if (loadState.value !== 'finished' && !loading.value) {
    loadMore()
  }
}, 100)
```

## 常见问题

### 1. 如何手动控制加载状态?

直接修改 `state` 属性即可:

```typescript
// 开始加载
loadState.value = 'loading'

// 加载完成(没有更多数据)
loadState.value = 'finished'

// 加载失败
loadState.value = 'error'
```

### 2. 加载失败后如何重试?

监听 `reload` 事件,在事件处理函数中重新发起请求:

```vue
<template>
  <wd-loadmore :state="loadState" @reload="handleReload" />
</template>

<script lang="ts" setup>
const handleReload = () => {
  loadState.value = 'loading'
  fetchData() // 重新请求当前页数据
}
</script>
```

### 3. 如何自定义加载动画颜色?

通过 `loading-props` 传入 `color` 属性:

```vue
<wd-loadmore
  state="loading"
  :loading-props="{ color: '#1989fa' }"
/>
```

### 4. 滚动加载不触发?

检查以下几点:

```vue
<!-- 1. scroll-view 需要固定高度 -->
<scroll-view scroll-y style="height: 100vh" @scrolltolower="loadMore">
  ...
</scroll-view>

<!-- 2. 检查状态判断逻辑 -->
<script lang="ts" setup>
const onScrollToLower = () => {
  // 确保不是 finished 状态且不在加载中
  if (loadState.value !== 'finished' && !loading.value) {
    loadMore()
  }
}
</script>
```

### 5. 如何实现首屏 Loading?

在首次加载时显示全屏 Loading:

```vue
<template>
  <!-- 首屏 Loading -->
  <view v-if="isFirstLoad" class="first-loading">
    <wd-loading size="64rpx" />
    <text>加载中...</text>
  </view>

  <!-- 列表内容 -->
  <scroll-view v-else scroll-y @scrolltolower="loadMore">
    <view v-for="item in list" :key="item.id">{{ item.title }}</view>
    <wd-loadmore :state="loadState" @reload="loadMore" />
  </scroll-view>
</template>

<script lang="ts" setup>
const isFirstLoad = ref(true)

const loadMore = async () => {
  try {
    await fetchData()
  } finally {
    isFirstLoad.value = false
  }
}
</script>
```

### 6. 如何在多个 Tab 中独立管理加载状态?

每个 Tab 使用独立的状态对象:

```typescript
const tabs = reactive([
  { name: 'tab1', list: [], page: 1, loadState: 'loading' },
  { name: 'tab2', list: [], page: 1, loadState: 'loading' },
])

const loadMore = async (tabName: string) => {
  const tab = tabs.find(t => t.name === tabName)
  if (!tab) return

  // 使用 tab 独立的状态
  tab.loadState = 'loading'
  // ...
}
```

## 总结

Loadmore 加载更多组件核心使用要点:

1. **状态管理**: 正确管理 loading/finished/error 三种状态
2. **防重复加载**: 使用 loading 标记防止重复请求
3. **判断数据结束**: 根据返回数量或总数判断是否还有更多
4. **错误重试**: 监听 reload 事件实现重试,保持当前页码
5. **下拉刷新**: 刷新时重置所有分页状态
6. **自定义样式**: 通过 loading-props 和 CSS 变量定制样式
7. **暗黑模式**: 自动适配暗黑主题
8. **国际化**: 支持自定义文案和多语言
