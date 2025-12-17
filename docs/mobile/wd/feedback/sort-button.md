---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/sortButton
---

# SortButton 排序按钮

## 介绍

SortButton 排序按钮组件用于展示可切换的排序状态,支持升序、降序、重置三种状态。常用于列表排序、表格排序等场景。

**核心特性:**

- **三态切换** - 支持升序、降序、重置三种状态
- **优先级配置** - 支持配置优先切换升序或降序
- **重置控制** - 可选是否允许重置状态
- **下划线指示** - 可选的选中状态下划线

## 基本用法

### 基础用法

```vue
<template>
  <wd-sort-button v-model="sortValue" title="价格" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const sortValue = ref(0)
</script>
```

### 排序状态说明

- `0`: 未排序(重置状态)
- `1`: 升序
- `-1`: 降序

```vue
<template>
  <view class="sort-demo">
    <wd-sort-button v-model="sortValue" title="排序" />
    <text>当前状态: {{ statusText }}</text>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const sortValue = ref(0)

const statusText = computed(() => {
  const map = { 0: '未排序', 1: '升序', '-1': '降序' }
  return map[sortValue.value]
})
</script>
```

### 允许重置

设置 `allow-reset` 允许手动重置到未排序状态。

```vue
<template>
  <wd-sort-button v-model="sortValue" title="价格" allow-reset />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const sortValue = ref(0)
</script>
```

### 优先降序

设置 `desc-first` 使点击时优先切换为降序。

```vue
<template>
  <wd-sort-button v-model="sortValue" title="销量" desc-first />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const sortValue = ref(0)
</script>
```

### 隐藏下划线

设置 `line` 为 `false` 隐藏选中状态的下划线。

```vue
<template>
  <wd-sort-button v-model="sortValue" title="时间" :line="false" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const sortValue = ref(0)
</script>
```

### 监听变化

通过 `change` 事件监听排序状态变化。

```vue
<template>
  <wd-sort-button
    v-model="sortValue"
    title="评分"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const sortValue = ref(0)

const handleChange = ({ value }) => {
  console.log('排序状态:', value)
}
</script>
```

### 多个排序按钮

```vue
<template>
  <view class="sort-bar">
    <wd-sort-button
      v-model="priceSort"
      title="价格"
      @change="handlePriceSort"
    />
    <wd-sort-button
      v-model="salesSort"
      title="销量"
      @change="handleSalesSort"
    />
    <wd-sort-button
      v-model="rateSort"
      title="评分"
      @change="handleRateSort"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const priceSort = ref(0)
const salesSort = ref(0)
const rateSort = ref(0)

// 切换时重置其他排序
const handlePriceSort = () => {
  salesSort.value = 0
  rateSort.value = 0
}

const handleSalesSort = () => {
  priceSort.value = 0
  rateSort.value = 0
}

const handleRateSort = () => {
  priceSort.value = 0
  salesSort.value = 0
}
</script>

<style lang="scss" scoped>
.sort-bar {
  display: flex;
  justify-content: space-around;
  padding: 24rpx;
  background: #fff;
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 排序状态(1升序, 0重置, -1降序) | `number` | `0` |
| title | 按钮文案 | `string` | - |
| allow-reset | 是否允许重置 | `boolean` | `false` |
| desc-first | 是否优先降序 | `boolean` | `false` |
| line | 是否显示下划线 | `boolean` | `true` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 排序状态变化时触发 | `{ value: number }` |

### 类型定义

```typescript
/**
 * 排序值类型
 * 1: 升序
 * 0: 未排序/重置
 * -1: 降序
 */
type SortValue = 1 | 0 | -1
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-sort-button-height | 按钮高度 | `44rpx` |
| --wd-sort-button-fs | 字体大小 | `28rpx` |
| --wd-sort-button-color | 文字颜色 | `#333333` |
| --wd-sort-button-line-color | 下划线颜色 | `#4d80f0` |
| --wd-sort-button-line-height | 下划线高度 | `4rpx` |

## 最佳实践

### 1. 商品列表排序

```vue
<template>
  <view class="product-list-page">
    <!-- 排序栏 -->
    <view class="sort-bar">
      <view
        class="sort-item"
        :class="{ active: sortType === 'default' }"
        @click="handleDefaultSort"
      >
        综合
      </view>
      <wd-sort-button
        v-model="priceSort"
        title="价格"
        @change="handlePriceSort"
      />
      <wd-sort-button
        v-model="salesSort"
        title="销量"
        desc-first
        @change="handleSalesSort"
      />
    </view>

    <!-- 商品列表 -->
    <view class="product-list">
      <view v-for="item in productList" :key="item.id" class="product-item">
        {{ item.name }} - ¥{{ item.price }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const sortType = ref('default')
const priceSort = ref(0)
const salesSort = ref(0)
const productList = ref([])

const handleDefaultSort = () => {
  sortType.value = 'default'
  priceSort.value = 0
  salesSort.value = 0
  fetchProducts()
}

const handlePriceSort = ({ value }) => {
  sortType.value = 'price'
  salesSort.value = 0
  fetchProducts({ orderBy: 'price', order: value === 1 ? 'asc' : 'desc' })
}

const handleSalesSort = ({ value }) => {
  sortType.value = 'sales'
  priceSort.value = 0
  fetchProducts({ orderBy: 'sales', order: value === 1 ? 'asc' : 'desc' })
}

const fetchProducts = (params = {}) => {
  // 请求商品列表
}
</script>
```

### 2. 表格排序

```vue
<template>
  <view class="table">
    <view class="table-header">
      <view class="th">名称</view>
      <view class="th">
        <wd-sort-button
          v-model="ageSort"
          title="年龄"
          :line="false"
          @change="sortTable"
        />
      </view>
      <view class="th">
        <wd-sort-button
          v-model="scoreSort"
          title="分数"
          :line="false"
          @change="sortTable"
        />
      </view>
    </view>
    <view v-for="row in tableData" :key="row.id" class="table-row">
      <view class="td">{{ row.name }}</view>
      <view class="td">{{ row.age }}</view>
      <view class="td">{{ row.score }}</view>
    </view>
  </view>
</template>
```

### 3. 带图标的排序

```vue
<template>
  <view class="sort-with-icon">
    <wd-icon name="filter" />
    <wd-sort-button v-model="sort" title="筛选" />
  </view>
</template>
```

## 常见问题

### 1. 状态切换顺序是什么?

- 默认: 0 → 1 → -1 → (0 或 1)
- 优先降序: 0 → -1 → 1 → (0 或 -1)

### 2. 如何实现互斥排序?

在一个排序按钮的 change 事件中,将其他排序按钮的值重置为 0。

### 3. 下划线不显示?

检查是否设置了 `line` 为 `false`,以及排序值是否为 0(未选中状态)。

### 4. 如何自定义箭头图标?

目前组件使用内置的上下箭头图标,如需自定义可通过 CSS 覆盖样式。
