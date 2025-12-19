---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/countTo
---

# CountTo 数字滚动

## 介绍

CountTo 数字滚动组件用于创建数字递增/递减动画效果,常用于数据统计、金额展示、进度显示等场景。通过平滑的数字滚动动画,可以有效吸引用户注意力,增强数据展示的视觉效果。

**核心特性:**

- **数字动画** - 支持数字的递增和递减动画,从起始值平滑过渡到目标值
- **缓动效果** - 内置 `easingFn` 缓动函数,动画更自然流畅
- **格式化** - 支持千分位分隔符、小数点符号和指定小数位数
- **前后缀** - 支持添加前缀后缀(如货币符号、百分号等)
- **手动控制** - 提供 start、pause、reset 方法,支持手动控制动画
- **主题类型** - 支持 default、primary、success、warning、error 五种主题
- **插槽定制** - 支持通过插槽自定义前缀、后缀和数字内容

**技术实现:**

组件基于 `useCountDown` Composable 实现动画控制,内部使用毫秒级精度的计时器。数字变化通过 `easingFn` 缓动函数计算,该函数采用 easeOutExpo 曲线,公式为 `c * (-(2^((-10*t)/d)) + 1) * 1024 / 1023 + b`,确保动画在结束时逐渐减速,提供自然的视觉体验。

## 基本用法

### 基础用法

设置 `end-val` 指定目标数字,组件会从 0 开始自动滚动到目标值。

```vue
<template>
  <wd-count-to :end-val="2024" />
</template>
```

**默认行为:**
- 起始值: 0
- 动画时长: 3000ms
- 自动开始: true
- 使用缓动: true

### 自定义起始值

通过 `start-val` 设置起始数字,实现从任意值开始的动画。

```vue
<template>
  <!-- 从 100 滚动到 2024 -->
  <wd-count-to :start-val="100" :end-val="2024" />

  <!-- 从大到小递减 -->
  <wd-count-to :start-val="1000" :end-val="0" />
</template>
```

### 动画时长

通过 `duration` 设置动画时长,单位为毫秒。

```vue
<template>
  <!-- 快速动画: 1秒 -->
  <wd-count-to :end-val="999" :duration="1000" />

  <!-- 中等速度: 3秒(默认) -->
  <wd-count-to :end-val="9999" :duration="3000" />

  <!-- 慢速动画: 5秒 -->
  <wd-count-to :end-val="99999" :duration="5000" />
</template>
```

### 小数位数

通过 `decimals` 设置保留的小数位数。

```vue
<template>
  <!-- 保留1位小数 -->
  <wd-count-to :end-val="99.9" :decimals="1" />

  <!-- 保留2位小数 -->
  <wd-count-to :end-val="99.99" :decimals="2" />

  <!-- 保留3位小数 -->
  <wd-count-to :end-val="3.141" :decimals="3" />
</template>
```

**注意:** `decimals` 必须大于等于 0,否则会在控制台输出错误。

### 自定义小数点符号

通过 `decimal` 自定义小数点符号。

```vue
<template>
  <!-- 使用逗号作为小数点(欧洲格式) -->
  <wd-count-to :end-val="1234.56" :decimals="2" decimal="," separator="." />
</template>
```

### 千分位分隔符

通过 `separator` 设置千分位分隔符。

```vue
<template>
  <!-- 使用逗号分隔(默认) -->
  <wd-count-to :end-val="1234567" separator="," />

  <!-- 使用空格分隔 -->
  <wd-count-to :end-val="1234567" separator=" " />

  <!-- 不使用分隔符 -->
  <wd-count-to :end-val="1234567" separator="" />
</template>
```

### 前缀和后缀

通过 `prefix` 和 `suffix` 添加前后缀。

```vue
<template>
  <!-- 金额展示 -->
  <wd-count-to :end-val="999.99" :decimals="2" prefix="¥" />

  <!-- 美元展示 -->
  <wd-count-to :end-val="1234.56" :decimals="2" prefix="$" separator="," />

  <!-- 百分比展示 -->
  <wd-count-to :end-val="85" suffix="%" />

  <!-- 温度展示 -->
  <wd-count-to :end-val="36.5" :decimals="1" suffix="°C" />

  <!-- 同时使用前后缀 -->
  <wd-count-to :end-val="100" prefix="共 " suffix=" 件" />
</template>
```

### 主题类型

通过 `type` 设置文字主题类型。

```vue
<template>
  <view class="type-demo">
    <view class="type-item">
      <wd-count-to :end-val="100" type="default" />
      <text>default</text>
    </view>
    <view class="type-item">
      <wd-count-to :end-val="100" type="primary" />
      <text>primary</text>
    </view>
    <view class="type-item">
      <wd-count-to :end-val="100" type="success" />
      <text>success</text>
    </view>
    <view class="type-item">
      <wd-count-to :end-val="100" type="warning" />
      <text>warning</text>
    </view>
    <view class="type-item">
      <wd-count-to :end-val="100" type="error" />
      <text>error</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.type-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 32rpx;
}
.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}
</style>
```

### 自定义颜色和大小

通过 `color` 和 `font-size` 自定义样式。

```vue
<template>
  <!-- 自定义颜色 -->
  <wd-count-to :end-val="8888" color="#ee0a24" />

  <!-- 自定义大小(默认32rpx) -->
  <wd-count-to :end-val="8888" :font-size="48" />

  <!-- 同时自定义颜色和大小 -->
  <wd-count-to :end-val="8888" color="#1890ff" :font-size="64" />
</template>
```

**注意:** 前缀和后缀的字体大小为主字体大小的 70%(即 `fontSize * 0.7`)。

### 禁用缓动

设置 `use-easing` 为 `false` 禁用缓动效果,使用线性动画。

```vue
<template>
  <!-- 使用缓动效果(默认) -->
  <wd-count-to :end-val="1000" :use-easing="true" />

  <!-- 线性动画(匀速) -->
  <wd-count-to :end-val="1000" :use-easing="false" />
</template>
```

**效果对比:**
- 缓动动画: 先快后慢,结束时减速,更自然
- 线性动画: 匀速变化,适合精确计时场景

### 手动控制

通过 ref 获取组件实例,调用 start、pause、reset 方法控制动画。

```vue
<template>
  <view class="demo">
    <wd-count-to
      ref="countToRef"
      :end-val="9999"
      :auto-start="false"
      :font-size="48"
      @mounted="onMounted"
      @finish="onFinish"
    />
    <view class="controls">
      <wd-button type="primary" @click="start">开始</wd-button>
      <wd-button type="warning" @click="pause">暂停</wd-button>
      <wd-button @click="reset">重置</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CountToInstance } from '@/wd'

const countToRef = ref<CountToInstance>()

const start = () => {
  countToRef.value?.start()
}

const pause = () => {
  countToRef.value?.pause()
}

const reset = () => {
  countToRef.value?.reset()
}

const onMounted = () => {
  console.log('组件挂载完成')
}

const onFinish = () => {
  console.log('动画完成')
  uni.showToast({ title: '动画完成', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}
.controls {
  display: flex;
  gap: 24rpx;
}
</style>
```

### 自定义插槽

通过插槽自定义前缀、后缀和数字内容。

```vue
<template>
  <!-- 自定义前缀 -->
  <wd-count-to :end-val="8888">
    <template #prefix>
      <wd-icon name="money" size="32rpx" color="#ee0a24" />
    </template>
  </wd-count-to>

  <!-- 自定义后缀 -->
  <wd-count-to :end-val="99">
    <template #suffix>
      <view class="unit">
        <text class="unit-value">%</text>
        <text class="unit-label">完成率</text>
      </view>
    </template>
  </wd-count-to>

  <!-- 同时自定义前后缀 -->
  <wd-count-to :end-val="1234">
    <template #prefix>
      <view class="prefix-icon">
        <wd-icon name="user" />
      </view>
    </template>
    <template #suffix>
      <text class="suffix-text">人</text>
    </template>
  </wd-count-to>
</template>

<style lang="scss" scoped>
.unit {
  display: flex;
  flex-direction: column;
  margin-left: 8rpx;
}
.unit-value {
  font-size: 28rpx;
  font-weight: 600;
}
.unit-label {
  font-size: 20rpx;
  color: #999;
}
</style>
```

## 高级用法

### 数据统计仪表盘

展示多个统计指标的仪表盘布局。

```vue
<template>
  <view class="dashboard">
    <view class="dashboard-header">
      <text class="title">数据概览</text>
      <wd-button size="small" @click="refreshData">刷新</wd-button>
    </view>

    <view class="stat-grid">
      <view class="stat-card">
        <view class="stat-icon" style="background: #e6f7ff">
          <wd-icon name="user" color="#1890ff" size="48rpx" />
        </view>
        <view class="stat-content">
          <wd-count-to
            ref="userRef"
            :end-val="stats.users"
            separator=","
            :font-size="48"
            type="primary"
          />
          <text class="stat-label">注册用户</text>
        </view>
      </view>

      <view class="stat-card">
        <view class="stat-icon" style="background: #f6ffed">
          <wd-icon name="cart" color="#52c41a" size="48rpx" />
        </view>
        <view class="stat-content">
          <wd-count-to
            ref="orderRef"
            :end-val="stats.orders"
            separator=","
            :font-size="48"
            type="success"
          />
          <text class="stat-label">订单总数</text>
        </view>
      </view>

      <view class="stat-card">
        <view class="stat-icon" style="background: #fff7e6">
          <wd-icon name="money" color="#fa8c16" size="48rpx" />
        </view>
        <view class="stat-content">
          <wd-count-to
            ref="amountRef"
            :end-val="stats.amount"
            :decimals="2"
            prefix="¥"
            separator=","
            :font-size="48"
            type="warning"
          />
          <text class="stat-label">销售总额</text>
        </view>
      </view>

      <view class="stat-card">
        <view class="stat-icon" style="background: #fff1f0">
          <wd-icon name="eye" color="#f5222d" size="48rpx" />
        </view>
        <view class="stat-content">
          <wd-count-to
            ref="viewRef"
            :end-val="stats.views"
            separator=","
            :font-size="48"
            type="error"
          />
          <text class="stat-label">访问量</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { CountToInstance } from '@/wd'

const userRef = ref<CountToInstance>()
const orderRef = ref<CountToInstance>()
const amountRef = ref<CountToInstance>()
const viewRef = ref<CountToInstance>()

const stats = reactive({
  users: 125800,
  orders: 88888,
  amount: 9999999.99,
  views: 5678900,
})

const refreshData = () => {
  // 模拟数据刷新
  stats.users += Math.floor(Math.random() * 100)
  stats.orders += Math.floor(Math.random() * 50)
  stats.amount += Math.random() * 10000
  stats.views += Math.floor(Math.random() * 1000)

  // 重置所有动画
  userRef.value?.reset()
  orderRef.value?.reset()
  amountRef.value?.reset()
  viewRef.value?.reset()
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 32rpx;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  margin-right: 24rpx;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
</style>
```

### 实时数据更新

监听数据变化自动触发动画。

```vue
<template>
  <view class="realtime-demo">
    <view class="price-display">
      <text class="label">实时价格</text>
      <wd-count-to
        :start-val="prevPrice"
        :end-val="currentPrice"
        :decimals="2"
        prefix="¥"
        :font-size="64"
        :color="priceColor"
        :duration="500"
      />
      <view class="price-change" :class="priceChange >= 0 ? 'up' : 'down'">
        <wd-icon :name="priceChange >= 0 ? 'arrow-up' : 'arrow-down'" />
        <text>{{ Math.abs(priceChange).toFixed(2) }}%</text>
      </view>
    </view>

    <view class="controls">
      <wd-button @click="simulatePriceChange">模拟价格变动</wd-button>
      <wd-button @click="toggleAutoUpdate">
        {{ autoUpdate ? '停止自动更新' : '开始自动更新' }}
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onUnmounted } from 'vue'

const prevPrice = ref(100)
const currentPrice = ref(100)
const autoUpdate = ref(false)
let timer: number | null = null

const priceChange = computed(() => {
  if (prevPrice.value === 0) return 0
  return ((currentPrice.value - prevPrice.value) / prevPrice.value) * 100
})

const priceColor = computed(() => {
  if (priceChange.value > 0) return '#52c41a'
  if (priceChange.value < 0) return '#f5222d'
  return '#333'
})

const simulatePriceChange = () => {
  prevPrice.value = currentPrice.value
  const change = (Math.random() - 0.5) * 10
  currentPrice.value = Math.max(0, currentPrice.value + change)
}

const toggleAutoUpdate = () => {
  autoUpdate.value = !autoUpdate.value
  if (autoUpdate.value) {
    timer = setInterval(simulatePriceChange, 2000)
  } else if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.realtime-demo {
  padding: 48rpx;
  text-align: center;
}

.price-display {
  margin-bottom: 48rpx;
}

.label {
  font-size: 28rpx;
  color: #999;
  display: block;
  margin-bottom: 16rpx;
}

.price-change {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  margin-top: 16rpx;
}

.price-change.up {
  background: #f6ffed;
  color: #52c41a;
}

.price-change.down {
  background: #fff1f0;
  color: #f5222d;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 24rpx;
}
</style>
```

### 数据对比展示

对比展示多个数据指标。

```vue
<template>
  <view class="comparison">
    <view class="period-tabs">
      <view
        v-for="period in periods"
        :key="period.value"
        class="period-tab"
        :class="{ active: activePeriod === period.value }"
        @click="switchPeriod(period.value)"
      >
        {{ period.label }}
      </view>
    </view>

    <view class="comparison-cards">
      <view class="comparison-card">
        <text class="card-title">本期销售额</text>
        <wd-count-to
          :key="`current-${activePeriod}`"
          :end-val="currentData.sales"
          :decimals="2"
          prefix="¥"
          separator=","
          :font-size="48"
          type="primary"
        />
        <view class="card-trend" :class="salesTrend >= 0 ? 'up' : 'down'">
          <text>较上期</text>
          <text>{{ salesTrend >= 0 ? '+' : '' }}{{ salesTrend.toFixed(1) }}%</text>
        </view>
      </view>

      <view class="comparison-card">
        <text class="card-title">本期订单数</text>
        <wd-count-to
          :key="`orders-${activePeriod}`"
          :end-val="currentData.orders"
          separator=","
          :font-size="48"
          type="success"
        />
        <view class="card-trend" :class="ordersTrend >= 0 ? 'up' : 'down'">
          <text>较上期</text>
          <text>{{ ordersTrend >= 0 ? '+' : '' }}{{ ordersTrend.toFixed(1) }}%</text>
        </view>
      </view>

      <view class="comparison-card">
        <text class="card-title">转化率</text>
        <wd-count-to
          :key="`rate-${activePeriod}`"
          :end-val="currentData.conversionRate"
          :decimals="1"
          suffix="%"
          :font-size="48"
          type="warning"
        />
        <view class="card-trend" :class="rateTrend >= 0 ? 'up' : 'down'">
          <text>较上期</text>
          <text>{{ rateTrend >= 0 ? '+' : '' }}{{ rateTrend.toFixed(1) }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface PeriodData {
  sales: number
  orders: number
  conversionRate: number
}

const periods = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
]

const activePeriod = ref('today')

const periodData: Record<string, { current: PeriodData; previous: PeriodData }> = {
  today: {
    current: { sales: 12580.5, orders: 156, conversionRate: 3.2 },
    previous: { sales: 10200.0, orders: 142, conversionRate: 2.8 },
  },
  week: {
    current: { sales: 88888.88, orders: 1024, conversionRate: 4.5 },
    previous: { sales: 76543.21, orders: 987, conversionRate: 4.1 },
  },
  month: {
    current: { sales: 358000.0, orders: 4567, conversionRate: 5.8 },
    previous: { sales: 320000.0, orders: 4200, conversionRate: 5.2 },
  },
}

const currentData = computed(() => periodData[activePeriod.value].current)
const previousData = computed(() => periodData[activePeriod.value].previous)

const salesTrend = computed(() =>
  ((currentData.value.sales - previousData.value.sales) / previousData.value.sales) * 100
)

const ordersTrend = computed(() =>
  ((currentData.value.orders - previousData.value.orders) / previousData.value.orders) * 100
)

const rateTrend = computed(() =>
  currentData.value.conversionRate - previousData.value.conversionRate
)

const switchPeriod = (period: string) => {
  activePeriod.value = period
}
</script>

<style lang="scss" scoped>
.comparison {
  padding: 32rpx;
}

.period-tabs {
  display: flex;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 8rpx;
  margin-bottom: 32rpx;
}

.period-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #666;
  border-radius: 8rpx;
  transition: all 0.3s;
}

.period-tab.active {
  background: #fff;
  color: #333;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.comparison-cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.comparison-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 16rpx;
}

.card-trend {
  display: flex;
  gap: 16rpx;
  font-size: 24rpx;
  margin-top: 16rpx;
}

.card-trend.up {
  color: #52c41a;
}

.card-trend.down {
  color: #f5222d;
}
</style>
```

### 倒计时抢购

结合倒计时实现抢购场景。

```vue
<template>
  <view class="flash-sale">
    <view class="sale-header">
      <text class="sale-title">限时抢购</text>
      <view class="countdown">
        <text class="countdown-label">距结束</text>
        <wd-count-down :time="countdownTime" format="HH:mm:ss" />
      </view>
    </view>

    <view class="sale-stats">
      <view class="stat-item">
        <text class="stat-label">已抢购</text>
        <wd-count-to
          :end-val="soldCount"
          separator=","
          :font-size="40"
          type="error"
        />
        <text class="stat-unit">件</text>
      </view>
      <view class="stat-item">
        <text class="stat-label">节省金额</text>
        <wd-count-to
          :end-val="savedAmount"
          :decimals="2"
          prefix="¥"
          separator=","
          :font-size="40"
          type="warning"
        />
      </view>
      <view class="stat-item">
        <text class="stat-label">参与人数</text>
        <wd-count-to
          :end-val="participantCount"
          separator=","
          :font-size="40"
          type="primary"
        />
        <text class="stat-unit">人</text>
      </view>
    </view>

    <view class="progress-section">
      <view class="progress-header">
        <text>抢购进度</text>
        <text class="progress-text">{{ progressPercent }}%</text>
      </view>
      <wd-progress
        :percentage="progressPercent"
        color="#f5222d"
        :show-text="false"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const countdownTime = ref(2 * 60 * 60 * 1000) // 2小时
const soldCount = ref(8888)
const totalCount = ref(10000)
const savedAmount = ref(125800.5)
const participantCount = ref(12580)

const progressPercent = computed(() =>
  Math.floor((soldCount.value / totalCount.value) * 100)
)
</script>

<style lang="scss" scoped>
.flash-sale {
  padding: 32rpx;
  background: linear-gradient(135deg, #ff6b6b, #ee0a24);
  border-radius: 24rpx;
  color: #fff;
}

.sale-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.sale-title {
  font-size: 36rpx;
  font-weight: 600;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.countdown-label {
  font-size: 24rpx;
  opacity: 0.8;
}

.sale-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 22rpx;
  opacity: 0.8;
  margin-bottom: 8rpx;
}

.stat-unit {
  font-size: 22rpx;
  opacity: 0.8;
}

.progress-section {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  padding: 24rpx;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  margin-bottom: 16rpx;
}

.progress-text {
  font-weight: 600;
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| start-val | 起始值 | `number` | `0` |
| end-val | 目标值 | `number` | `2024` |
| duration | 动画时长(毫秒) | `number` | `3000` |
| auto-start | 是否自动开始 | `boolean` | `true` |
| decimals | 小数位数(必须>=0) | `number` | `0` |
| decimal | 小数点符号 | `string` | `.` |
| separator | 千分位分隔符 | `string` | `,` |
| prefix | 前缀 | `string` | `''` |
| suffix | 后缀 | `string` | `''` |
| use-easing | 是否使用缓动效果 | `boolean` | `true` |
| font-size | 字体大小(rpx) | `number` | `32` |
| color | 文字颜色 | `string` | `''` |
| type | 主题类型 | `TextType` | `'default'` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### TextType

```typescript
type TextType = 'default' | 'primary' | 'success' | 'warning' | 'error'
```

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| mounted | 组件挂载完成时触发 | - |
| finish | 动画完成时触发 | - |

### Slots

| 名称 | 说明 |
|------|------|
| default | 自定义数字内容 |
| prefix | 自定义前缀内容 |
| suffix | 自定义后缀内容 |

### Methods

通过 ref 获取组件实例后可调用的方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| start | 开始动画 | - | `void` |
| pause | 暂停动画 | - | `void` |
| reset | 重置动画(autoStart为true时会自动开始) | - | `void` |

### 类型定义

```typescript
/**
 * 文本类型
 */
type TextType = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * 数字滚动组件属性接口
 */
interface WdCountToProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 字体大小(rpx) */
  fontSize?: number
  /** 文本颜色 */
  color?: string
  /** 主题类型 */
  type?: TextType
  /** 起始值 */
  startVal?: number
  /** 最终值 */
  endVal?: number
  /** 动画时长(毫秒) */
  duration?: number
  /** 是否自动开始 */
  autoStart?: boolean
  /** 小数位数(必须>=0) */
  decimals?: number
  /** 小数点符号 */
  decimal?: string
  /** 千分位分隔符 */
  separator?: string
  /** 前缀 */
  prefix?: string
  /** 后缀 */
  suffix?: string
  /** 是否使用缓动效果 */
  useEasing?: boolean
}

/**
 * 数字滚动组件事件接口
 */
interface WdCountToEmits {
  /** 组件挂载完成时触发 */
  mounted: []
  /** 数字滚动完成时触发 */
  finish: []
}

/**
 * 数字滚动组件暴露方法接口
 */
interface WdCountToExpose {
  /** 开始数字滚动 */
  start: () => void
  /** 暂停数字滚动 */
  pause: () => void
  /** 重置数字滚动 */
  reset: () => void
}

/**
 * 数字滚动组件实例类型
 */
type CountToInstance = ComponentPublicInstance<WdCountToProps, WdCountToExpose>
```

### 缓动函数

组件内置的缓动函数采用 easeOutExpo 曲线:

```typescript
/**
 * 缓动函数 - easeOutExpo
 * @param t 当前时间
 * @param b 起始值
 * @param c 变化量
 * @param d 持续时间
 * @returns 当前值
 */
export const easingFn = (t: number, b: number, c: number, d: number): number => {
  return (c * (-(2 ** ((-10 * t) / d)) + 1) * 1024) / 1023 + b
}
```

## 主题定制

组件使用 `wd-text` 组件渲染文字,可通过 `wd-text` 的主题变量进行定制。

### 主题色参考

| 类型 | 颜色值 |
|------|--------|
| primary | `#4D80F0` |
| success | `#34d19d` |
| warning | `#f0883a` |
| error | `#fa4350` |

### 自定义样式

```vue
<template>
  <!-- 使用 color 属性自定义颜色 -->
  <wd-count-to :end-val="9999" color="#722ed1" />

  <!-- 使用 custom-class 自定义样式 -->
  <wd-count-to :end-val="9999" custom-class="custom-count" />
</template>

<style lang="scss">
.custom-count {
  font-family: 'DIN Alternate', sans-serif;
  letter-spacing: 2rpx;
}
</style>
```

## 最佳实践

### 1. 合理设置动画时长

```typescript
// ✅ 推荐: 根据数值大小调整时长
const getDuration = (value: number) => {
  if (value < 100) return 1000
  if (value < 1000) return 2000
  if (value < 10000) return 3000
  return 4000
}

// ❌ 避免: 数值很小但时长很长,或数值很大但时长很短
```

### 2. 数据更新时重置动画

```vue
<script lang="ts" setup>
import { ref, watch } from 'vue'

const countRef = ref()
const data = ref(1000)

// 监听数据变化,重置动画
watch(data, () => {
  countRef.value?.reset()
})
</script>
```

### 3. 使用 key 强制重新渲染

```vue
<template>
  <!-- 使用 key 确保数据变化时重新渲染 -->
  <wd-count-to :key="dataKey" :end-val="value" />
</template>

<script lang="ts" setup>
const dataKey = ref(0)
const value = ref(1000)

const updateValue = (newValue: number) => {
  value.value = newValue
  dataKey.value++ // 改变 key 强制重新渲染
}
</script>
```

### 4. 金额格式化规范

```vue
<template>
  <!-- ✅ 推荐: 金额使用2位小数 + 千分位 + 货币符号 -->
  <wd-count-to
    :end-val="amount"
    :decimals="2"
    prefix="¥"
    separator=","
  />

  <!-- ❌ 避免: 金额不使用小数或格式化 -->
  <wd-count-to :end-val="amount" />
</template>
```

### 5. 性能优化

```vue
<script lang="ts" setup>
// ✅ 推荐: 大量数据时使用 v-show 而非 v-if
// ✅ 推荐: 禁用不必要的缓动效果
// ✅ 推荐: 适当减少动画时长
</script>

<template>
  <wd-count-to
    :end-val="value"
    :use-easing="false"
    :duration="1000"
  />
</template>
```

## 常见问题

### 1. 数字不滚动?

**可能原因:**
- `auto-start` 设置为 `false`
- `start-val` 和 `end-val` 相同
- 组件未正确挂载

**解决方案:**
```vue
<!-- 确保 auto-start 为 true 或手动调用 start() -->
<wd-count-to :end-val="1000" :auto-start="true" />
```

### 2. 小数位显示不正确?

**可能原因:**
- `decimals` 属性值小于 0
- `end-val` 小数位数少于 `decimals`

**解决方案:**
```vue
<!-- 确保 decimals >= 0 -->
<wd-count-to :end-val="99.99" :decimals="2" />
```

### 3. 如何实现从大到小递减?

```vue
<!-- 设置 start-val 大于 end-val -->
<wd-count-to :start-val="1000" :end-val="0" />
```

### 4. 动画太快/太慢?

```vue
<!-- 调整 duration 值(毫秒) -->
<wd-count-to :end-val="9999" :duration="5000" />
```

### 5. 如何动态更新数值?

```vue
<template>
  <wd-count-to ref="countRef" :end-val="value" />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const countRef = ref()
const value = ref(1000)

// 方法1: 监听数据变化自动重置
watch(value, () => {
  countRef.value?.reset()
})

// 方法2: 使用 start-val 实现平滑过渡
const prevValue = ref(0)
const updateValue = (newValue: number) => {
  prevValue.value = value.value
  value.value = newValue
}
</script>
```

### 6. 前后缀大小如何调整?

前后缀默认使用主字体大小的 70%。如需自定义,可使用插槽:

```vue
<template>
  <wd-count-to :end-val="8888" :font-size="48">
    <template #prefix>
      <text style="font-size: 48rpx">¥</text>
    </template>
  </wd-count-to>
</template>
```

## 总结

`CountTo` 数字滚动核心使用要点:

1. **基本配置** - 使用 `start-val` 和 `end-val` 设置起止值,`duration` 控制时长
2. **格式化** - 使用 `decimals`、`separator`、`prefix`、`suffix` 格式化显示
3. **手动控制** - 通过 ref 调用 `start`、`pause`、`reset` 方法
4. **缓动效果** - 默认启用缓动,可通过 `use-easing` 切换为线性动画
5. **主题样式** - 使用 `type`、`color`、`font-size` 自定义样式
6. **数据更新** - 监听数据变化调用 `reset()` 或使用 `key` 强制重新渲染
