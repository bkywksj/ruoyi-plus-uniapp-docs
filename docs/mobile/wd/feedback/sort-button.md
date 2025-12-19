---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/sortButton
---

# SortButton 排序按钮

## 介绍

SortButton 排序按钮组件用于展示可切换的排序状态,支持升序、降序、重置三种状态。组件采用有限状态机模式实现状态切换,通过双箭头图标直观展示排序方向,常用于列表排序、表格排序等场景。

**核心特性:**

- **三态切换** - 支持升序(1)、降序(-1)、重置(0)三种状态的循环切换
- **智能状态机** - 基于有限状态机模式,根据配置自动计算下一个状态
- **优先级配置** - 通过 `descFirst` 配置优先切换升序或降序
- **重置控制** - 通过 `allowReset` 控制是否允许重置到未排序状态
- **下划线指示** - 激活状态显示底部下划线,支持关闭
- **双箭头图标** - 使用 wd-icon 的 up/down 图标,根据状态动态显示

**技术实现:**

组件内部使用有限状态机模式管理排序状态:

```typescript
// 优先升序模式状态转换
if (value === 0) value = 1           // 重置 → 升序
else if (value === 1) value = -1     // 升序 → 降序
else if (value === -1) {
  value = allowReset ? 0 : 1         // 降序 → 重置或升序
}

// 优先降序模式状态转换
if (value === 0) value = -1          // 重置 → 降序
else if (value === -1) value = 1     // 降序 → 升序
else if (value === 1) {
  value = allowReset ? 0 : -1        // 升序 → 重置或降序
}
```

## 基本用法

### 基础用法

通过 `v-model` 绑定排序状态,`title` 设置按钮文案。

```vue
<template>
  <view class="demo">
    <wd-sort-button v-model="sortValue" title="价格" />
    <text class="status">当前状态: {{ sortValue }}</text>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const sortValue = ref(0)
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
}

.status {
  font-size: 28rpx;
  color: #666;
}
</style>
```

**排序值说明:**

| 值 | 含义 | 图标显示 |
|---|------|---------|
| `0` | 未排序/重置状态 | 同时显示上下箭头 |
| `1` | 升序 | 只显示向上箭头(隐藏向下) |
| `-1` | 降序 | 只显示向下箭头(隐藏向上) |

### 排序状态说明

结合状态值展示不同的排序提示信息。

```vue
<template>
  <view class="sort-demo">
    <wd-sort-button v-model="sortValue" title="排序" />

    <view class="status-info">
      <view class="status-row">
        <text class="label">数值:</text>
        <text class="value">{{ sortValue }}</text>
      </view>
      <view class="status-row">
        <text class="label">状态:</text>
        <text class="value" :class="statusClass">{{ statusText }}</text>
      </view>
      <view class="status-row">
        <text class="label">说明:</text>
        <text class="desc">{{ statusDesc }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const sortValue = ref(0)

const statusText = computed(() => {
  const map: Record<number, string> = {
    0: '未排序',
    1: '升序 ↑',
    '-1': '降序 ↓'
  }
  return map[sortValue.value] || '未知'
})

const statusDesc = computed(() => {
  const map: Record<number, string> = {
    0: '点击开始排序',
    1: '数据从小到大排列',
    '-1': '数据从大到小排列'
  }
  return map[sortValue.value] || ''
})

const statusClass = computed(() => {
  if (sortValue.value === 1) return 'asc'
  if (sortValue.value === -1) return 'desc'
  return ''
})
</script>

<style lang="scss" scoped>
.sort-demo {
  padding: 32rpx;
}

.status-info {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  font-size: 26rpx;
  color: #999;
  width: 80rpx;
}

.value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;

  &.asc {
    color: #67c23a;
  }

  &.desc {
    color: #f56c6c;
  }
}

.desc {
  font-size: 26rpx;
  color: #666;
}
</style>
```

### 允许重置

设置 `allow-reset` 允许在升序或降序状态下再次点击重置到未排序状态。

```vue
<template>
  <view class="reset-demo">
    <view class="demo-item">
      <text class="item-label">不允许重置(默认)</text>
      <wd-sort-button v-model="sort1" title="价格" />
      <text class="item-tip">循环: 升序 ↔ 降序</text>
    </view>

    <view class="demo-item">
      <text class="item-label">允许重置</text>
      <wd-sort-button v-model="sort2" title="价格" allow-reset />
      <text class="item-tip">循环: 升序 → 降序 → 重置</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const sort1 = ref(0)
const sort2 = ref(0)
</script>

<style lang="scss" scoped>
.reset-demo {
  padding: 32rpx;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.item-label {
  font-size: 28rpx;
  color: #333;
  min-width: 200rpx;
}

.item-tip {
  font-size: 24rpx;
  color: #999;
}
</style>
```

**状态转换对比:**

| 配置 | 状态循环 |
|------|---------|
| `allow-reset: false` | 0 → 1 → -1 → 1 → -1 ... (跳过重置) |
| `allow-reset: true` | 0 → 1 → -1 → 0 → 1 ... (包含重置) |

### 优先降序

设置 `desc-first` 使点击时优先切换为降序,适用于"销量"等默认降序排列的场景。

```vue
<template>
  <view class="desc-first-demo">
    <view class="demo-item">
      <text class="item-label">优先升序(默认)</text>
      <wd-sort-button v-model="sort1" title="价格" />
      <text class="item-tip">从低到高</text>
    </view>

    <view class="demo-item">
      <text class="item-label">优先降序</text>
      <wd-sort-button v-model="sort2" title="销量" desc-first />
      <text class="item-tip">从高到低</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const sort1 = ref(0)
const sort2 = ref(0)
</script>

<style lang="scss" scoped>
.desc-first-demo {
  padding: 32rpx;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.item-label {
  font-size: 28rpx;
  color: #333;
  min-width: 200rpx;
}

.item-tip {
  font-size: 24rpx;
  color: #999;
}
</style>
```

**状态转换对比:**

| 配置 | 首次点击 | 第二次点击 |
|------|---------|-----------|
| `desc-first: false` | 0 → 1 (升序) | 1 → -1 (降序) |
| `desc-first: true` | 0 → -1 (降序) | -1 → 1 (升序) |

### 隐藏下划线

设置 `line` 为 `false` 隐藏选中状态的下划线,适用于单个排序按钮或表格场景。

```vue
<template>
  <view class="line-demo">
    <view class="demo-item">
      <wd-sort-button v-model="sort1" title="显示下划线" />
    </view>

    <view class="demo-item">
      <wd-sort-button v-model="sort2" title="隐藏下划线" :line="false" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const sort1 = ref(1)  // 设置为激活状态以展示下划线
const sort2 = ref(1)
</script>

<style lang="scss" scoped>
.line-demo {
  display: flex;
  gap: 48rpx;
  padding: 32rpx;
}

.demo-item {
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}
</style>
```

**下划线样式:**

下划线使用伪元素实现,宽度固定 38rpx,高度 4rpx:

```scss
&::after {
  position: absolute;
  content: '';
  width: 38rpx;
  height: 4rpx;
  bottom: 8rpx;
  left: 50%;
  transform: translate(-50%, 0);
  background: $-sort-button-line-color;
  border-radius: 3rpx;
  transition: opacity 0.15s;
  opacity: 0;
}

&.is-active::after {
  opacity: 1;
}
```

### 监听变化

通过 `change` 事件监听排序状态变化,执行数据请求等操作。

```vue
<template>
  <view class="change-demo">
    <wd-sort-button
      v-model="sortValue"
      title="评分"
      @change="handleChange"
    />

    <view class="log-panel">
      <view class="log-title">事件日志:</view>
      <view v-for="(log, index) in logs" :key="index" class="log-item">
        {{ log }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const sortValue = ref(0)
const logs = ref<string[]>([])

const handleChange = ({ value }: { value: number }) => {
  const statusMap: Record<number, string> = {
    0: '重置',
    1: '升序',
    '-1': '降序'
  }

  const time = new Date().toLocaleTimeString()
  const log = `[${time}] 切换到: ${statusMap[value]} (${value})`

  logs.value.unshift(log)

  // 保留最近5条日志
  if (logs.value.length > 5) {
    logs.value.pop()
  }

  // 实际应用中可以触发数据请求
  console.log('当前排序状态:', value)
}
</script>

<style lang="scss" scoped>
.change-demo {
  padding: 32rpx;
}

.log-panel {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.log-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.log-item {
  font-size: 24rpx;
  color: #666;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }
}
</style>
```

### 多个排序按钮

多个排序按钮组合使用时,通常需要实现互斥排序(同时只能有一个按钮处于排序状态)。

```vue
<template>
  <view class="multi-sort-demo">
    <view class="sort-bar">
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
      <wd-sort-button
        v-model="rateSort"
        title="评分"
        desc-first
        @change="handleRateSort"
      />
    </view>

    <view class="current-sort">
      当前排序:
      <text class="sort-info">{{ currentSortInfo }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const priceSort = ref(0)
const salesSort = ref(0)
const rateSort = ref(0)

const currentSortInfo = computed(() => {
  if (priceSort.value !== 0) {
    return `价格 ${priceSort.value === 1 ? '升序' : '降序'}`
  }
  if (salesSort.value !== 0) {
    return `销量 ${salesSort.value === 1 ? '升序' : '降序'}`
  }
  if (rateSort.value !== 0) {
    return `评分 ${rateSort.value === 1 ? '升序' : '降序'}`
  }
  return '默认排序'
})

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
  border-radius: 12rpx;
}

.current-sort {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #e8f4ff;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
}

.sort-info {
  color: #4d80f0;
  font-weight: bold;
}
</style>
```

## 高级用法

### 商品列表排序

完整的商品列表排序示例,包含综合排序和多种排序条件。

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
      <wd-sort-button
        v-model="newSort"
        title="新品"
        desc-first
        @change="handleNewSort"
      />
    </view>

    <!-- 商品列表 -->
    <view class="product-list">
      <view
        v-for="item in productList"
        :key="item.id"
        class="product-item"
      >
        <image :src="item.image" class="product-image" />
        <view class="product-info">
          <text class="product-name">{{ item.name }}</text>
          <text class="product-price">¥{{ item.price }}</text>
          <text class="product-sales">销量: {{ item.sales }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface Product {
  id: number
  name: string
  image: string
  price: number
  sales: number
  createTime: string
}

const sortType = ref('default')
const priceSort = ref(0)
const salesSort = ref(0)
const newSort = ref(0)
const productList = ref<Product[]>([])

// 重置所有排序状态
const resetAllSort = () => {
  priceSort.value = 0
  salesSort.value = 0
  newSort.value = 0
}

const handleDefaultSort = () => {
  sortType.value = 'default'
  resetAllSort()
  fetchProducts()
}

const handlePriceSort = ({ value }: { value: number }) => {
  sortType.value = 'price'
  salesSort.value = 0
  newSort.value = 0
  fetchProducts({
    orderBy: 'price',
    order: value === 1 ? 'asc' : 'desc'
  })
}

const handleSalesSort = ({ value }: { value: number }) => {
  sortType.value = 'sales'
  priceSort.value = 0
  newSort.value = 0
  fetchProducts({
    orderBy: 'sales',
    order: value === 1 ? 'asc' : 'desc'
  })
}

const handleNewSort = ({ value }: { value: number }) => {
  sortType.value = 'new'
  priceSort.value = 0
  salesSort.value = 0
  fetchProducts({
    orderBy: 'createTime',
    order: value === 1 ? 'asc' : 'desc'
  })
}

const fetchProducts = async (params?: { orderBy: string; order: string }) => {
  // 模拟API请求
  console.log('请求参数:', params)

  // 模拟数据
  productList.value = [
    { id: 1, name: '商品A', image: '', price: 99, sales: 1000, createTime: '2024-01-01' },
    { id: 2, name: '商品B', image: '', price: 199, sales: 500, createTime: '2024-01-15' },
    { id: 3, name: '商品C', image: '', price: 299, sales: 2000, createTime: '2024-01-20' },
  ]
}

onMounted(() => {
  fetchProducts()
})
</script>

<style lang="scss" scoped>
.product-list-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.sort-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.sort-item {
  font-size: 28rpx;
  color: #333;
  padding: 8rpx 16rpx;

  &.active {
    color: #4d80f0;
    font-weight: bold;
  }
}

.product-list {
  padding: 24rpx;
}

.product-item {
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.product-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 8rpx;
  background: #f0f0f0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.product-name {
  font-size: 28rpx;
  color: #333;
}

.product-price {
  font-size: 32rpx;
  color: #f56c6c;
  font-weight: bold;
}

.product-sales {
  font-size: 24rpx;
  color: #999;
}
</style>
```

### 表格排序

在表格中使用排序按钮,对表格数据进行排序。

```vue
<template>
  <view class="table-container">
    <view class="table">
      <!-- 表头 -->
      <view class="table-header">
        <view class="th th-name">姓名</view>
        <view class="th th-sortable">
          <wd-sort-button
            v-model="ageSort"
            title="年龄"
            :line="false"
            @change="() => handleSort('age')"
          />
        </view>
        <view class="th th-sortable">
          <wd-sort-button
            v-model="scoreSort"
            title="分数"
            :line="false"
            desc-first
            @change="() => handleSort('score')"
          />
        </view>
        <view class="th th-sortable">
          <wd-sort-button
            v-model="salarySort"
            title="薪资"
            :line="false"
            desc-first
            @change="() => handleSort('salary')"
          />
        </view>
      </view>

      <!-- 表体 -->
      <view
        v-for="row in sortedData"
        :key="row.id"
        class="table-row"
      >
        <view class="td td-name">{{ row.name }}</view>
        <view class="td">{{ row.age }}</view>
        <view class="td">{{ row.score }}</view>
        <view class="td">¥{{ row.salary }}</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface TableRow {
  id: number
  name: string
  age: number
  score: number
  salary: number
}

const rawData: TableRow[] = [
  { id: 1, name: '张三', age: 28, score: 85, salary: 15000 },
  { id: 2, name: '李四', age: 32, score: 92, salary: 20000 },
  { id: 3, name: '王五', age: 24, score: 78, salary: 12000 },
  { id: 4, name: '赵六', age: 35, score: 88, salary: 25000 },
  { id: 5, name: '钱七', age: 29, score: 95, salary: 18000 },
]

const ageSort = ref(0)
const scoreSort = ref(0)
const salarySort = ref(0)

const currentSortField = ref<string | null>(null)
const currentSortValue = ref(0)

const handleSort = (field: string) => {
  currentSortField.value = field

  // 重置其他排序
  if (field !== 'age') ageSort.value = 0
  if (field !== 'score') scoreSort.value = 0
  if (field !== 'salary') salarySort.value = 0

  // 获取当前排序值
  if (field === 'age') currentSortValue.value = ageSort.value
  if (field === 'score') currentSortValue.value = scoreSort.value
  if (field === 'salary') currentSortValue.value = salarySort.value
}

const sortedData = computed(() => {
  if (!currentSortField.value || currentSortValue.value === 0) {
    return rawData
  }

  return [...rawData].sort((a, b) => {
    const field = currentSortField.value as keyof TableRow
    const aVal = a[field] as number
    const bVal = b[field] as number

    return currentSortValue.value === 1 ? aVal - bVal : bVal - aVal
  })
})
</script>

<style lang="scss" scoped>
.table-container {
  padding: 32rpx;
}

.table {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #f5f7fa;
  font-weight: bold;
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }
}

.th,
.td {
  flex: 1;
  padding: 24rpx 16rpx;
  text-align: center;
  font-size: 26rpx;
}

.th-name,
.td-name {
  flex: 1.5;
  text-align: left;
  padding-left: 24rpx;
}

.th-sortable {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
```

### 排序状态持久化

使用本地存储持久化排序状态。

```vue
<template>
  <view class="persist-demo">
    <view class="sort-bar">
      <wd-sort-button
        v-model="sortValue"
        :title="sortTitle"
        @change="handleChange"
      />
      <wd-button size="small" @click="clearStorage">清除缓存</wd-button>
    </view>

    <view class="tips">
      刷新页面后排序状态会保留
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'product_sort_state'

const sortValue = ref(0)
const sortTitle = ref('价格')

// 保存排序状态
const saveState = (value: number) => {
  uni.setStorageSync(STORAGE_KEY, {
    value,
    timestamp: Date.now()
  })
}

// 恢复排序状态
const restoreState = () => {
  try {
    const state = uni.getStorageSync(STORAGE_KEY)
    if (state && state.value !== undefined) {
      sortValue.value = state.value
    }
  } catch (e) {
    console.error('恢复排序状态失败:', e)
  }
}

const handleChange = ({ value }: { value: number }) => {
  saveState(value)
}

const clearStorage = () => {
  uni.removeStorageSync(STORAGE_KEY)
  sortValue.value = 0
  uni.showToast({ title: '缓存已清除', icon: 'success' })
}

onMounted(() => {
  restoreState()
})
</script>

<style lang="scss" scoped>
.persist-demo {
  padding: 32rpx;
}

.sort-bar {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.tips {
  margin-top: 24rpx;
  padding: 16rpx;
  background: #fff7e6;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #fa8c16;
}
</style>
```

### 排序指示器

自定义排序指示器样式。

```vue
<template>
  <view class="indicator-demo">
    <view class="sort-with-indicator">
      <wd-sort-button
        v-model="sortValue"
        title="价格"
        :line="false"
        @change="handleChange"
      />
      <view class="sort-indicator" :class="indicatorClass">
        <text v-if="sortValue === 1">↑ 从低到高</text>
        <text v-else-if="sortValue === -1">↓ 从高到低</text>
        <text v-else>点击排序</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const sortValue = ref(0)

const indicatorClass = computed(() => {
  if (sortValue.value === 1) return 'asc'
  if (sortValue.value === -1) return 'desc'
  return 'default'
})

const handleChange = ({ value }: { value: number }) => {
  console.log('排序变化:', value)
}
</script>

<style lang="scss" scoped>
.indicator-demo {
  padding: 32rpx;
}

.sort-with-indicator {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.sort-indicator {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;

  &.default {
    background: #f0f0f0;
    color: #999;
  }

  &.asc {
    background: #e6f7ff;
    color: #1890ff;
  }

  &.desc {
    background: #fff1f0;
    color: #f5222d;
  }
}
</style>
```

### 组合筛选器

结合其他筛选条件使用。

```vue
<template>
  <view class="filter-demo">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="sort-group">
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

      <view class="filter-group">
        <view
          class="filter-btn"
          :class="{ active: showFilter }"
          @click="toggleFilter"
        >
          <wd-icon name="filter" size="32rpx" />
          <text>筛选</text>
        </view>
      </view>
    </view>

    <!-- 筛选面板 -->
    <view v-if="showFilter" class="filter-panel">
      <view class="filter-section">
        <text class="section-title">价格区间</text>
        <view class="price-range">
          <wd-input v-model="minPrice" type="number" placeholder="最低价" />
          <text class="range-separator">-</text>
          <wd-input v-model="maxPrice" type="number" placeholder="最高价" />
        </view>
      </view>

      <view class="filter-actions">
        <wd-button block @click="resetFilter">重置</wd-button>
        <wd-button type="primary" block @click="applyFilter">确定</wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const priceSort = ref(0)
const salesSort = ref(0)
const showFilter = ref(false)
const minPrice = ref('')
const maxPrice = ref('')

const handlePriceSort = () => {
  salesSort.value = 0
}

const handleSalesSort = () => {
  priceSort.value = 0
}

const toggleFilter = () => {
  showFilter.value = !showFilter.value
}

const resetFilter = () => {
  minPrice.value = ''
  maxPrice.value = ''
}

const applyFilter = () => {
  console.log('应用筛选:', {
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    priceSort: priceSort.value,
    salesSort: salesSort.value
  })
  showFilter.value = false
}
</script>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #fff;
}

.sort-group {
  display: flex;
  gap: 32rpx;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;

  &.active {
    background: #e6f7ff;
    color: #1890ff;
  }
}

.filter-panel {
  padding: 32rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.filter-section {
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.range-separator {
  color: #999;
}

.filter-actions {
  display: flex;
  gap: 24rpx;
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 排序状态(1升序, 0重置, -1降序) | `number` | `0` |
| title | 按钮文案 | `string` | `''` |
| allow-reset | 是否允许重置到未排序状态 | `boolean` | `false` |
| desc-first | 是否优先切换为降序 | `boolean` | `false` |
| line | 是否显示激活状态下划线 | `boolean` | `true` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 排序值变化时触发(用于 v-model) | `value: number` |
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

/**
 * 排序按钮组件属性接口
 */
interface WdSortButtonProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 排序状态(1升序, 0重置, -1降序) */
  modelValue?: number
  /** 按钮文案 */
  title?: string
  /** 是否允许重置到未排序状态 */
  allowReset?: boolean
  /** 是否优先切换为降序 */
  descFirst?: boolean
  /** 是否显示激活状态下划线 */
  line?: boolean
}

/**
 * 排序按钮组件事件接口
 */
interface WdSortButtonEmits {
  /** 排序状态改变时触发 */
  change: [event: { value: number }]
  /** 更新排序值时触发,用于 v-model 绑定 */
  'update:modelValue': [value: number]
}
```

### 状态转换

| 配置组合 | 状态循环 |
|---------|---------|
| 默认配置 | 0 → 1 → -1 → 1 → -1 ... |
| `allow-reset: true` | 0 → 1 → -1 → 0 → 1 ... |
| `desc-first: true` | 0 → -1 → 1 → -1 → 1 ... |
| `desc-first + allow-reset` | 0 → -1 → 1 → 0 → -1 ... |

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wot-sort-button-fs | 字体大小 | `$-fs-content` |
| --wot-sort-button-color | 文字颜色 | `$-color-content` |
| --wot-sort-button-height | 按钮高度 | `96rpx` |
| --wot-sort-button-line-height | 下划线高度 | `6rpx` |
| --wot-sort-button-line-color | 下划线颜色 | `$-color-theme` |

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <!-- 品牌色主题 -->
    <view class="brand-sort">
      <wd-sort-button v-model="sort1" title="价格" />
    </view>

    <!-- 紧凑型 -->
    <view class="compact-sort">
      <wd-sort-button v-model="sort2" title="销量" />
    </view>

    <!-- 大号字体 -->
    <view class="large-sort">
      <wd-sort-button v-model="sort3" title="评分" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const sort1 = ref(1)
const sort2 = ref(-1)
const sort3 = ref(1)
</script>

<style lang="scss" scoped>
.brand-sort {
  --wot-sort-button-line-color: #ff6b00;
}

.compact-sort {
  --wot-sort-button-height: 72rpx;
  --wot-sort-button-fs: 24rpx;
}

.large-sort {
  --wot-sort-button-fs: 32rpx;
  --wot-sort-button-height: 120rpx;
}
</style>
```

### 暗黑模式

组件内置暗黑模式支持:

```scss
.wot-theme-dark {
  @include b(sort-button) {
    @include e(wrapper) {
      color: $-dark-color;
    }
  }
}
```

## 最佳实践

### 1. 互斥排序处理

```vue
<script lang="ts" setup>
// ✅ 好的做法:在 change 事件中重置其他排序
const handlePriceSort = () => {
  salesSort.value = 0  // 重置其他排序
  rateSort.value = 0
  fetchData()
}

// ❌ 不好的做法:不处理互斥
const handleSort = () => {
  fetchData()  // 可能导致多个排序同时生效
}
</script>
```

### 2. 合理设置默认排序方向

```vue
<!-- ✅ 价格通常从低到高,使用默认升序优先 -->
<wd-sort-button v-model="priceSort" title="价格" />

<!-- ✅ 销量、评分通常从高到低,使用降序优先 -->
<wd-sort-button v-model="salesSort" title="销量" desc-first />
<wd-sort-button v-model="rateSort" title="评分" desc-first />

<!-- ✅ 时间排序通常看最新的,使用降序优先 -->
<wd-sort-button v-model="timeSort" title="时间" desc-first />
```

### 3. 表格场景隐藏下划线

```vue
<!-- ✅ 表格中的排序按钮隐藏下划线 -->
<view class="table-header">
  <view class="th">
    <wd-sort-button v-model="sort" title="年龄" :line="false" />
  </view>
</view>

<!-- ✅ 筛选栏中多个按钮显示下划线 -->
<view class="sort-bar">
  <wd-sort-button v-model="priceSort" title="价格" />
  <wd-sort-button v-model="salesSort" title="销量" />
</view>
```

### 4. 结合请求参数

```typescript
// ✅ 好的做法:将排序状态转换为 API 参数
const handleSort = ({ value }: { value: number }) => {
  const params = {
    orderBy: 'price',
    order: value === 1 ? 'asc' : 'desc'
  }

  if (value === 0) {
    // 重置状态,使用默认排序
    delete params.orderBy
    delete params.order
  }

  fetchData(params)
}
```

### 5. 状态持久化

```typescript
// ✅ 好的做法:使用统一的存储 key
const SORT_STORAGE_KEY = 'list_sort_state'

const saveSort = (field: string, value: number) => {
  uni.setStorageSync(SORT_STORAGE_KEY, { field, value })
}

const restoreSort = () => {
  const state = uni.getStorageSync(SORT_STORAGE_KEY)
  if (state) {
    // 恢复排序状态
  }
}
```

## 常见问题

### 1. 状态切换顺序是什么?

**默认模式 (descFirst: false):**
- 0 → 1 → -1 → (0 或 1,取决于 allowReset)

**优先降序模式 (descFirst: true):**
- 0 → -1 → 1 → (0 或 -1,取决于 allowReset)

### 2. 如何实现互斥排序?

在一个排序按钮的 change 事件中,将其他排序按钮的值重置为 0:

```typescript
const handlePriceSort = () => {
  salesSort.value = 0  // 重置销量排序
  rateSort.value = 0   // 重置评分排序
}
```

### 3. 下划线不显示?

**可能原因:**
- 设置了 `line` 为 `false`
- 排序值为 0(未选中状态,下划线 opacity 为 0)

**解决方案:**
```vue
<!-- 确保 line 为 true(默认) -->
<wd-sort-button v-model="sort" title="价格" :line="true" />

<!-- 确保排序值不为 0 -->
<wd-sort-button v-model="sort" title="价格" />
<!-- sort.value = 1 或 -1 时显示下划线 -->
```

### 4. 如何自定义箭头图标?

组件使用 `wd-icon` 的 `up` 和 `down` 图标,可通过 CSS 覆盖:

```scss
// 自定义箭头颜色
:deep(.wd-sort-button__icon-up),
:deep(.wd-sort-button__icon-down) {
  color: #ff6b00 !important;
}

// 自定义箭头大小
:deep(.wd-sort-button__right) {
  transform: scale(1.2);
}
```

### 5. 如何设置初始排序状态?

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

// 方式1:直接设置初始值
const sortValue = ref(1)  // 默认升序

// 方式2:从 URL 参数恢复
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options

  if (options.sort) {
    sortValue.value = parseInt(options.sort)
  }
})
</script>
```

### 6. 如何与后端排序参数对应?

```typescript
// 排序值与后端参数映射
const getSortParams = (value: number, field: string) => {
  if (value === 0) return {}

  return {
    sortField: field,
    sortOrder: value === 1 ? 'ASC' : 'DESC'
  }
}

// 使用示例
const handlePriceSort = ({ value }) => {
  const params = getSortParams(value, 'price')
  fetchData(params)
}
```

## 总结

SortButton 排序按钮组件核心要点:

1. **三态切换** - 支持升序(1)、降序(-1)、重置(0)三种状态
2. **状态机模式** - 根据 `descFirst` 和 `allowReset` 自动计算下一状态
3. **互斥处理** - 多个按钮时需在 change 事件中重置其他按钮
4. **图标指示** - 使用 up/down 图标动态显示排序方向
5. **下划线样式** - 激活状态显示底部下划线,支持关闭
