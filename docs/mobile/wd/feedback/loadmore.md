---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/loadmore
---

# Loadmore 加载更多

## 介绍

Loadmore 加载更多组件用于在列表底部展示加载状态,适用于分页加载、下拉刷新等场景。组件支持三种状态:加载中、加载完成、加载失败。

**核心特性:**

- **多状态支持** - 支持 loading、finished、error 三种状态
- **自定义文案** - 支持自定义各状态的提示文案
- **重试机制** - 加载失败时点击可重新加载
- **加载动画** - 内置 loading 动画,支持自定义配置

## 基本用法

### 加载中状态

设置 `state="loading"` 显示加载中状态。

```vue
<template>
  <wd-loadmore state="loading" />
</template>
```

### 加载完成状态

设置 `state="finished"` 显示加载完成状态。

```vue
<template>
  <wd-loadmore state="finished" />
</template>
```

### 加载失败状态

设置 `state="error"` 显示加载失败状态,点击可触发重新加载。

```vue
<template>
  <wd-loadmore state="error" @reload="handleReload" />
</template>

<script lang="ts" setup>
const handleReload = () => {
  console.log('重新加载')
}
</script>
```

### 自定义文案

通过 `loading-text`、`finished-text`、`error-text` 自定义各状态的提示文案。

```vue
<template>
  <wd-loadmore
    state="loading"
    loading-text="正在加载中..."
    finished-text="已经到底了"
    error-text="加载失败"
  />
</template>
```

### 自定义加载动画

通过 `loading-props` 自定义加载动画的属性。

```vue
<template>
  <wd-loadmore
    state="loading"
    :loading-props="{ type: 'ring', color: '#1989fa' }"
  />
</template>
```

### 列表加载示例

完整的列表分页加载示例。

```vue
<template>
  <view class="list-container">
    <view v-for="item in list" :key="item.id" class="list-item">
      {{ item.title }}
    </view>
    <wd-loadmore :state="loadState" @reload="loadData" />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface ListItem {
  id: number
  title: string
}

const list = ref<ListItem[]>([])
const loadState = ref<'loading' | 'finished' | 'error'>('loading')
const page = ref(1)
const pageSize = 10

const loadData = async () => {
  loadState.value = 'loading'

  try {
    // 模拟接口请求
    const res = await fetchList(page.value, pageSize)

    if (res.data.length > 0) {
      list.value.push(...res.data)
      page.value++

      // 判断是否还有更多数据
      if (res.data.length < pageSize) {
        loadState.value = 'finished'
      } else {
        loadState.value = 'loading'
      }
    } else {
      loadState.value = 'finished'
    }
  } catch (error) {
    loadState.value = 'error'
  }
}

// 模拟接口
const fetchList = (page: number, size: number) => {
  return new Promise<{ data: ListItem[] }>((resolve) => {
    setTimeout(() => {
      const data = Array.from({ length: page < 3 ? size : 3 }, (_, i) => ({
        id: (page - 1) * size + i + 1,
        title: `列表项 ${(page - 1) * size + i + 1}`
      }))
      resolve({ data })
    }, 1000)
  })
}

onMounted(() => {
  loadData()
})
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| state | 加载状态 | `'loading' \| 'finished' \| 'error'` | - |
| loading-text | 加载提示文案 | `string` | `加载中...` |
| finished-text | 加载完成提示文案 | `string` | `没有更多了` |
| error-text | 加载失败提示文案 | `string` | `加载失败` |
| loading-props | loading 组件的属性 | `Partial<WdLoadingProps>` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| reload | 点击重新加载时触发(仅在 error 状态下) | - |

### 类型定义

```typescript
/**
 * 加载更多状态类型
 */
type LoadMoreState = 'loading' | 'error' | 'finished'
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-loadmore-height | 组件高度 | `80rpx` |
| --wd-loadmore-color | 文字颜色 | `#909399` |
| --wd-loadmore-fs | 文字大小 | `28rpx` |
| --wd-loadmore-loading-size | 加载图标大小 | `40rpx` |
| --wd-loadmore-error-color | 错误状态文字颜色 | `#c0c4cc` |
| --wd-loadmore-refresh-fs | 刷新图标大小 | `32rpx` |

## 最佳实践

### 1. 滚动加载

结合 scroll-view 实现滚动加载:

```vue
<template>
  <scroll-view
    scroll-y
    class="scroll-list"
    @scrolltolower="onScrollToLower"
  >
    <view v-for="item in list" :key="item.id" class="list-item">
      {{ item.title }}
    </view>
    <wd-loadmore :state="loadState" @reload="loadMore" />
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const list = ref([])
const loadState = ref('loading')

const onScrollToLower = () => {
  if (loadState.value !== 'loading') {
    loadMore()
  }
}

const loadMore = async () => {
  // 加载逻辑
}
</script>
```

### 2. 下拉刷新配合

```vue
<template>
  <scroll-view
    scroll-y
    refresher-enabled
    :refresher-triggered="isRefreshing"
    @refresherrefresh="onRefresh"
    @scrolltolower="onScrollToLower"
  >
    <view v-for="item in list" :key="item.id">{{ item.title }}</view>
    <wd-loadmore :state="loadState" @reload="loadMore" />
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isRefreshing = ref(false)
const loadState = ref('loading')
const list = ref([])

const onRefresh = async () => {
  isRefreshing.value = true
  // 重置数据
  list.value = []
  await loadMore()
  isRefreshing.value = false
}

const onScrollToLower = () => {
  if (loadState.value === 'loading') return
  loadMore()
}

const loadMore = async () => {
  // 加载逻辑
}
</script>
```

## 常见问题

### 1. 如何手动控制加载状态?

直接修改 `state` 属性即可:

```typescript
// 开始加载
loadState.value = 'loading'

// 加载完成
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
  fetchData()
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
