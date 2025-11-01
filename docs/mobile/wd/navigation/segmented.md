# Segmented 分段器

## 介绍

Segmented 分段器是一个用于在多个选项之间进行单选切换的组件，通常用于切换不同的视图、筛选条件或功能模式。该组件提供了简洁美观的 UI 设计，具有平滑的滑动动画效果和丰富的自定义能力，适用于设置面板、列表筛选、内容切换等各类单选场景。

**核心特性:**

- **简洁设计** - 采用扁平化设计风格，选项以胶囊形式呈现，视觉清晰且现代
- **三种尺寸** - 提供 large（大）、middle（中）、small（小）三种尺寸，适应不同场景需求
- **平滑动画** - 激活项背景支持平滑的滑动动画，切换时视觉流畅自然
- **灵活数据** - 支持简单数组（字符串/数字）和对象数组两种数据格式，满足不同复杂度需求
- **禁用控制** - 支持整体禁用和单个选项禁用，灵活控制交互行为
- **自定义标签** - 提供插槽支持自定义选项标签内容，可以添加图标、徽标等元素
- **触觉反馈** - 可选的振动反馈，增强移动端交互体验
- **暗色主题** - 内置暗色模式支持，自动适配深色界面风格

参考: src/wd/components/wd-segmented/wd-segmented.vue:1-42

---

## 基本用法

### 基础使用

最简单的使用方式，传入字符串数组作为选项。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="基础分段器" />
    <wd-segmented v-model:value="value1" :options="options1" />
    <view class="result">
      当前选中: {{ value1 }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('选项1')
const options1 = ['选项1', '选项2', '选项3']
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.result {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
}
</style>
```

**使用说明:**
- `v-model:value` 双向绑定当前选中的值
- `options` 传入选项数组，可以是字符串、数字或对象
- 默认选中第一个选项
- 选中值必须与 options 中的某个值匹配

参考: src/wd/components/wd-segmented/wd-segmented.vue:70-77, 103-109

### 数字选项

options 支持数字类型的选项。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="数字选项" />
    <wd-segmented v-model:value="value2" :options="options2" />
    <view class="result">
      当前选中: {{ value2 }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value2 = ref(1)
const options2 = [1, 2, 3, 4, 5]
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.result {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
}
</style>
```

**使用说明:**
- options 可以是数字数组
- v-model:value 绑定的值类型要与 options 保持一致
- 数字选项常用于分页、步骤等场景

参考: src/wd/components/wd-segmented/wd-segmented.vue:70-77

### 对象选项

使用对象数组可以为选项添加更多配置，如禁用、附加数据等。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="对象选项" />
    <wd-segmented v-model:value="value3" :options="options3" @change="handleChange" />
    <view class="result">
      <view>当前选中: {{ value3 }}</view>
      <view v-if="currentPayload">附加数据: {{ JSON.stringify(currentPayload) }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const value3 = ref('daily')
const currentPayload = ref<any>(null)

const options3: SegmentedOption[] = [
  { value: 'daily', payload: { type: 'day', days: 1 } },
  { value: 'weekly', payload: { type: 'week', days: 7 } },
  { value: 'monthly', payload: { type: 'month', days: 30 } },
  { value: 'yearly', payload: { type: 'year', days: 365 } },
]

const handleChange = (option: SegmentedOption) => {
  currentPayload.value = option.payload
}
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.result {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;

  view + view {
    margin-top: 8rpx;
  }
}
</style>
```

**使用说明:**
- 对象选项必须包含 `value` 属性
- 可以添加 `disabled` 属性禁用单个选项
- `payload` 属性可以存储任意附加数据
- 通过 `change` 事件可以获取完整的选项对象

参考: src/wd/components/wd-segmented/wd-segmented.vue:52-59, 77

### 禁用选项

可以禁用整个分段器或禁用单个选项。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="整体禁用" />
    <wd-segmented v-model:value="value4" :options="options4" :disabled="true" />

    <wd-text title="部分禁用" custom-style="margin-top: 32rpx" />
    <wd-segmented v-model:value="value5" :options="options5" />
    <view class="tip">第2和第4个选项被禁用</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const value4 = ref('选项1')
const options4 = ['选项1', '选项2', '选项3']

const value5 = ref('选项1')
const options5: SegmentedOption[] = [
  { value: '选项1' },
  { value: '选项2', disabled: true },
  { value: '选项3' },
  { value: '选项4', disabled: true },
]
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.tip {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
```

**使用说明:**
- `disabled` prop 禁用整个分段器，所有选项不可点击
- 对象选项中的 `disabled` 属性禁用单个选项
- 禁用选项样式置灰且不可点击
- 禁用状态下不触发任何事件

**技术实现:**
- 整体禁用通过 `props.disabled` 判断
- 单个禁用通过 `option.disabled` 判断
- 禁用样式添加 `is-disabled` 类名
- 点击时检查禁用状态，禁用则直接返回

参考: src/wd/components/wd-segmented/wd-segmented.vue:72, 8, 56, 213-217, 321-324

### 不同尺寸

提供三种尺寸：large（大）、middle（中）、small（小）。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="大尺寸（Large）" />
    <wd-segmented v-model:value="value6" :options="options6" size="large" />

    <wd-text title="中尺寸（Middle）" custom-style="margin-top: 32rpx" />
    <wd-segmented v-model:value="value7" :options="options7" size="middle" />

    <wd-text title="小尺寸（Small）" custom-style="margin-top: 32rpx" />
    <wd-segmented v-model:value="value8" :options="options8" size="small" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value6 = ref('选项1')
const options6 = ['选项1', '选项2', '选项3']

const value7 = ref('选项1')
const options7 = ['选项1', '选项2', '选项3']

const value8 = ref('选项1')
const options8 = ['选项1', '选项2', '选项3']
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}
</style>
```

**尺寸规格:**

| 尺寸 | 高度 | 内边距 | 字体大小 |
|------|------|--------|----------|
| large | 64rpx | 0 24rpx | 32rpx |
| middle | 56rpx | 0 24rpx | 28rpx |
| small | 48rpx | 0 14rpx | 24rpx |

**使用说明:**
- `size` 属性设置尺寸，默认为 `middle`
- large 尺寸适合重要操作、首屏展示
- middle 尺寸适合常规场景
- small 尺寸适合紧凑布局、表单内嵌

参考: src/wd/components/wd-segmented/wd-segmented.vue:74-75, 107, 305-318

### 振动反馈

启用振动反馈，切换选项时触发短促振动。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="振动反馈" />
    <wd-segmented
      v-model:value="value9"
      :options="options9"
      :vibrate-short="true"
    />
    <view class="tip">切换选项时会触发短促振动（需要设备支持）</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value9 = ref('选项1')
const options9 = ['选项1', '选项2', '选项3', '选项4']
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.tip {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
```

**使用说明:**
- `vibrateShort` 属性启用振动反馈
- 振动反馈通过 `uni.vibrateShort()` 实现
- 只在选项切换时触发，点击当前选项不触发
- 需要设备支持振动功能
- 建议用于移动端应用，提升触觉体验

参考: src/wd/components/wd-segmented/wd-segmented.vue:78-79, 108, 191-193

### 自定义标签

使用 label 插槽自定义选项标签内容。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="带图标的选项" />
    <wd-segmented v-model:value="value10" :options="options10">
      <template #label="{ option }">
        <view class="custom-label">
          <wd-icon :name="option.payload.icon" size="32" />
          <text class="label-text">{{ option.value }}</text>
        </view>
      </template>
    </wd-segmented>

    <wd-text title="带徽标的选项" custom-style="margin-top: 32rpx" />
    <wd-segmented v-model:value="value11" :options="options11">
      <template #label="{ option }">
        <view class="custom-label">
          <text class="label-text">{{ option.value }}</text>
          <wd-badge
            v-if="option.payload.badge"
            :value="option.payload.badge"
            custom-style="margin-left: 8rpx"
          />
        </view>
      </template>
    </wd-segmented>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const value10 = ref('首页')
const options10: SegmentedOption[] = [
  { value: '首页', payload: { icon: 'home' } },
  { value: '分类', payload: { icon: 'category' } },
  { value: '购物车', payload: { icon: 'cart' } },
  { value: '我的', payload: { icon: 'user' } },
]

const value11 = ref('消息')
const options11: SegmentedOption[] = [
  { value: '消息', payload: { badge: 5 } },
  { value: '通知', payload: { badge: '99+' } },
  { value: '待办', payload: { badge: 3 } },
  { value: '已读', payload: {} },
]
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.custom-label {
  display: flex;
  align-items: center;
  justify-content: center;

  .label-text {
    margin-left: 8rpx;
  }
}
</style>
```

**使用说明:**
- label 插槽接收 `option` 参数，包含完整的选项数据
- 插槽内容会替换默认的文字显示
- 可以在插槽中添加图标、徽标、自定义样式等
- 插槽内容需要自行处理样式和布局

参考: src/wd/components/wd-segmented/wd-segmented.vue:12-21

---

## 高级用法

### 动态选项

根据数据动态生成选项，支持选项的增删改。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="动态选项" />
    <wd-segmented v-model:value="value12" :options="options12" />

    <view class="btn-group">
      <wd-button size="small" type="primary" @click="addOption">
        添加选项
      </wd-button>
      <wd-button size="small" type="danger" @click="removeOption">
        删除最后一项
      </wd-button>
      <wd-button size="small" type="warning" @click="toggleDisabled">
        切换禁用
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const value12 = ref('选项1')
const options12 = ref<SegmentedOption[]>([
  { value: '选项1' },
  { value: '选项2' },
  { value: '选项3' },
])

let optionCounter = 3

const addOption = () => {
  optionCounter++
  options12.value.push({ value: `选项${optionCounter}` })
}

const removeOption = () => {
  if (options12.value.length > 1) {
    options12.value.pop()
  }
}

const toggleDisabled = () => {
  options12.value = options12.value.map((option) => ({
    ...option,
    disabled: !option.disabled,
  }))
}
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.btn-group {
  display: flex;
  gap: 16rpx;
  margin-top: 32rpx;
}
</style>
```

**使用说明:**
- options 支持动态修改，响应式更新
- 添加选项时需要确保 value 唯一
- 删除当前选中的选项时，会自动选中第一项
- 动态修改禁用状态时，组件会自动更新样式

参考: src/wd/components/wd-segmented/wd-segmented.vue:138-152, 186-196

### 实例方法

通过 ref 调用组件实例方法。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="实例方法" />
    <wd-segmented
      ref="segmentedRef"
      v-model:value="value13"
      :options="options13"
    />

    <view class="btn-group">
      <wd-button size="small" type="primary" @click="updateStyle">
        更新滑块样式
      </wd-button>
      <wd-button size="small" type="success" @click="changeValue">
        切换到选项3
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SegmentedInstance } from '@/wd/components/wd-segmented/wd-segmented.vue'

const value13 = ref('选项1')
const options13 = ['选项1', '选项2', '选项3', '选项4']
const segmentedRef = ref<SegmentedInstance>()

const updateStyle = () => {
  segmentedRef.value?.updateActiveStyle(true)
}

const changeValue = () => {
  value13.value = '选项3'
}
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.btn-group {
  display: flex;
  gap: 16rpx;
  margin-top: 32rpx;
}
</style>
```

**使用说明:**
- `updateActiveStyle(animation?)` - 更新滑块偏移量和样式
  - `animation`: 是否启用动画，默认 `true`
- 通常在动态修改选项后需要手动调用此方法
- 组件内部已自动处理大部分场景，手动调用仅用于特殊情况

参考: src/wd/components/wd-segmented/wd-segmented.vue:98-100, 158-180, 229-231

### 事件监听

监听选项切换和点击事件。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="事件监听" />
    <wd-segmented
      v-model:value="value14"
      :options="options14"
      @change="handleChange"
      @click="handleClick"
      @update:value="handleUpdateValue"
    />

    <view class="event-log">
      <view class="log-title">事件日志:</view>
      <view v-for="(log, index) in eventLogs" :key="index" class="log-item">
        {{ log }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const value14 = ref('选项1')
const options14: SegmentedOption[] = [
  { value: '选项1', payload: { id: 1 } },
  { value: '选项2', payload: { id: 2 }, disabled: true },
  { value: '选项3', payload: { id: 3 } },
  { value: '选项4', payload: { id: 4 } },
]

const eventLogs = ref<string[]>([])

const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${time}] ${message}`)
  if (eventLogs.value.length > 10) {
    eventLogs.value.pop()
  }
}

const handleChange = (option: SegmentedOption) => {
  addLog(`change 事件 - 切换到: ${option.value}, payload: ${JSON.stringify(option.payload)}`)
}

const handleClick = (option: SegmentedOption) => {
  addLog(`click 事件 - 点击: ${option.value}`)
}

const handleUpdateValue = (value: string | number) => {
  addLog(`update:value 事件 - 新值: ${value}`)
}
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.event-log {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;

  .log-title {
    margin-bottom: 16rpx;
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
  }

  .log-item {
    padding: 12rpx 0;
    font-size: 24rpx;
    color: #666;
    border-bottom: 1rpx solid #e0e0e0;

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
```

**使用说明:**
- `update:value` 事件：绑定值变化时触发，参数为新的值
- `change` 事件：选项改变时触发，参数为完整的选项对象
- `click` 事件：点击选项时触发（包括禁用选项），参数为完整的选项对象
- 事件触发顺序：`click` → `update:value`（如果值改变）→ `change`（如果值改变）
- 点击当前选中项会触发 `click` 事件，但不会触发 `change` 和 `update:value` 事件
- 点击禁用项只触发 `click` 事件，不触发其他事件

参考: src/wd/components/wd-segmented/wd-segmented.vue:85-92, 213-226

### 配合内容区域使用

Segmented 常用于切换不同的内容视图。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="视图切换" />
    <wd-segmented v-model:value="currentView" :options="viewOptions" />

    <view class="content-area">
      <view v-if="currentView === 'list'" class="content-panel">
        <view class="panel-title">列表视图</view>
        <view v-for="i in 5" :key="i" class="list-item">
          列表项 {{ i }}
        </view>
      </view>

      <view v-else-if="currentView === 'grid'" class="content-panel">
        <view class="panel-title">网格视图</view>
        <view class="grid-container">
          <view v-for="i in 9" :key="i" class="grid-item">
            网格 {{ i }}
          </view>
        </view>
      </view>

      <view v-else-if="currentView === 'chart'" class="content-panel">
        <view class="panel-title">图表视图</view>
        <view class="chart-placeholder">图表内容区域</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const currentView = ref('list')
const viewOptions = ['list', 'grid', 'chart']
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.content-area {
  margin-top: 32rpx;
}

.content-panel {
  padding: 32rpx;
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.panel-title {
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.list-item {
  padding: 24rpx;
  margin-bottom: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;

  &:last-child {
    margin-bottom: 0;
  }
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.grid-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
}

.chart-placeholder {
  height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx;
  font-size: 32rpx;
  color: #fff;
}
</style>
```

**使用说明:**
- Segmented 用于控制内容视图的切换
- 通过 v-if/v-else-if 根据选中值显示不同内容
- 建议为内容区域添加过渡动画，提升视觉体验
- 可以配合懒加载优化性能，只渲染当前视图

### 表单筛选

在表单或列表中使用 Segmented 进行筛选。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="订单状态筛选" />
    <wd-segmented v-model:value="orderStatus" :options="statusOptions" />

    <view class="order-list">
      <view v-for="order in filteredOrders" :key="order.id" class="order-item">
        <view class="order-id">订单号: {{ order.id }}</view>
        <view class="order-status">状态: {{ order.statusText }}</view>
        <view class="order-amount">金额: ¥{{ order.amount }}</view>
      </view>
      <view v-if="filteredOrders.length === 0" class="empty">
        暂无订单
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const orderStatus = ref('all')

const statusOptions: SegmentedOption[] = [
  { value: 'all', payload: { label: '全部' } },
  { value: 'pending', payload: { label: '待付款' } },
  { value: 'processing', payload: { label: '处理中' } },
  { value: 'completed', payload: { label: '已完成' } },
  { value: 'cancelled', payload: { label: '已取消' } },
]

const orders = ref([
  { id: '001', status: 'pending', statusText: '待付款', amount: 199.00 },
  { id: '002', status: 'processing', statusText: '处理中', amount: 299.00 },
  { id: '003', status: 'completed', statusText: '已完成', amount: 399.00 },
  { id: '004', status: 'pending', statusText: '待付款', amount: 499.00 },
  { id: '005', status: 'cancelled', statusText: '已取消', amount: 599.00 },
  { id: '006', status: 'completed', statusText: '已完成', amount: 699.00 },
])

const filteredOrders = computed(() => {
  if (orderStatus.value === 'all') {
    return orders.value
  }
  return orders.value.filter((order) => order.status === orderStatus.value)
})
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.order-list {
  margin-top: 32rpx;
}

.order-item {
  padding: 24rpx;
  margin-bottom: 16rpx;
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

  &:last-child {
    margin-bottom: 0;
  }

  .order-id {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
  }

  .order-status {
    margin-top: 8rpx;
    font-size: 26rpx;
    color: #666;
  }

  .order-amount {
    margin-top: 8rpx;
    font-size: 32rpx;
    color: #ff6b6b;
    font-weight: bold;
  }
}

.empty {
  padding: 64rpx 32rpx;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}
</style>
```

**使用说明:**
- Segmented 用于筛选条件的单选
- 通过 computed 计算属性根据选中值过滤数据
- 适用于状态筛选、分类筛选、时间范围筛选等场景
- 选项建议不超过 5 个，过多会影响体验

### 多个分段器组合

多个分段器配合使用，实现复杂的筛选逻辑。

```vue
<template>
  <view class="demo-segmented">
    <wd-text title="商品筛选" />

    <view class="filter-group">
      <view class="filter-label">分类:</view>
      <wd-segmented v-model:value="category" :options="categoryOptions" size="small" />
    </view>

    <view class="filter-group">
      <view class="filter-label">排序:</view>
      <wd-segmented v-model:value="sortBy" :options="sortOptions" size="small" />
    </view>

    <view class="filter-group">
      <view class="filter-label">价格:</view>
      <wd-segmented v-model:value="priceRange" :options="priceOptions" size="small" />
    </view>

    <view class="result-info">
      <text>筛选条件: </text>
      <text>分类={{ category }}, 排序={{ sortBy }}, 价格={{ priceRange }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const category = ref('全部')
const categoryOptions = ['全部', '数码', '服装', '食品', '图书']

const sortBy = ref('默认')
const sortOptions = ['默认', '价格', '销量', '好评']

const priceRange = ref('全部')
const priceOptions = ['全部', '0-100', '100-500', '500+']
</script>

<style lang="scss" scoped>
.demo-segmented {
  padding: 32rpx;
}

.filter-group {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .filter-label {
    width: 100rpx;
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
  }
}

.result-info {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
}
</style>
```

**使用说明:**
- 多个 Segmented 可以组合使用，实现多维度筛选
- 每个 Segmented 独立控制一个筛选条件
- 建议使用小尺寸（small）节省空间
- 筛选条件较多时考虑使用下拉菜单或抽屉

---

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customStyle | 自定义根节点样式 | `string` | `''` |
| customClass | 自定义根节点样式类 | `string` | `''` |
| value / v-model:value | 当前选中的值 | `string \| number` | - |
| disabled | 是否禁用分段器 | `boolean` | `false` |
| size | 控件尺寸 | `'large' \| 'middle' \| 'small'` | `'middle'` |
| options | 数据集合，支持字符串/数字数组或对象数组 | `(string \| number \| SegmentedOption)[]` | - |
| vibrateShort | 切换选项时是否振动 | `boolean` | `false` |

参考: src/wd/components/wd-segmented/wd-segmented.vue:64-80, 103-109

### SegmentedOption 类型

```typescript
/**
 * 分段器选项接口
 */
export interface SegmentedOption {
  /** 选中值 */
  value: string | number
  /** 是否禁用 */
  disabled?: boolean
  /** 更多数据 */
  payload?: any
}
```

参考: src/wd/components/wd-segmented/wd-segmented.vue:52-59

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:value | 选中值变化时触发 | `value: string \| number` |
| change | 选项改变时触发 | `option: SegmentedOption \| { value: string \| number }` |
| click | 点击选项时触发（包括禁用选项） | `option: SegmentedOption \| { value: string \| number }` |

参考: src/wd/components/wd-segmented/wd-segmented.vue:85-92, 213-226

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| label | 自定义选项标签内容 | `{ option: SegmentedOption \| { value: string \| number } }` |

参考: src/wd/components/wd-segmented/wd-segmented.vue:12-21

### 实例方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| updateActiveStyle | 更新滑块偏移量 | `(animation?: boolean) => void` | - |

参考: src/wd/components/wd-segmented/wd-segmented.vue:98-100, 158-180, 229-231

### 类型定义

```typescript
/**
 * 分段器尺寸类型
 */
export type SegmentedType = 'large' | 'middle' | 'small'

/**
 * 分段器选项接口
 */
export interface SegmentedOption {
  /** 选中值 */
  value: string | number
  /** 是否禁用 */
  disabled?: boolean
  /** 更多数据 */
  payload?: any
}

/**
 * 分段器组件属性接口
 */
interface WdSegmentedProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 当前选中的值 */
  value: string | number
  /** 是否禁用分段器 */
  disabled?: boolean
  /** 控件尺寸，可选值：'large' | 'middle' | 'small' */
  size?: SegmentedType
  /** 数据集合 */
  options: (string | number | SegmentedOption)[]
  /** 切换选项时是否振动 */
  vibrateShort?: boolean
}

/**
 * 分段器组件事件接口
 */
interface WdSegmentedEmits {
  /** 更新选中值 */
  'update:value': [value: string | number]
  /** 选项改变时触发 */
  change: [option: SegmentedOption | { value: string | number }]
  /** 点击选项时触发 */
  click: [option: SegmentedOption | { value: string | number }]
}

/**
 * 分段器组件暴露接口
 */
interface WdSegmentedExpose {
  /** 更新滑块偏移量 */
  updateActiveStyle: (animation?: boolean) => void
}

/** 分段器组件实例类型 */
export type SegmentedInstance = ComponentPublicInstance<WdSegmentedProps, WdSegmentedExpose>
```

参考: src/wd/components/wd-segmented/wd-segmented.vue:45-100, 233

---

## 主题定制

### CSS 变量

Segmented 组件提供了以下 CSS 变量用于主题定制:

```scss
// 分段器容器
$-segmented-padding: 8rpx;                              // 容器内边距
$-segmented-item-bg-color: #f5f5f5;                     // 容器背景色

// 分段器选项
$-segmented-item-color: #323233;                        // 选项文字颜色
$-segmented-item-disabled-color: #c8c9cc;               // 禁用选项文字颜色
$-segmented-item-acitve-bg: #fff;                       // 激活项背景色

// 暗色主题
.wot-theme-dark {
  $-dark-background2: #232323;                          // 容器背景色
  $-dark-color: #e5e5e5;                                // 激活项文字颜色
  $-dark-color3: #808080;                               // 普通文字颜色
  $-dark-color-gray: #555;                              // 禁用文字颜色
  $-color-theme: #4d80f0;                               // 激活项背景色（暗色模式下使用主题色）
}
```

参考: src/wd/components/wd-segmented/wd-segmented.vue:236-345

### 自定义样式

**基础样式定制:**

```vue
<template>
  <view class="custom-segmented">
    <wd-segmented
      v-model:value="value"
      :options="options"
      custom-class="my-segmented"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('选项1')
const options = ['选项1', '选项2', '选项3']
</script>

<style lang="scss" scoped>
.custom-segmented {
  padding: 32rpx;

  // 自定义容器样式
  :deep(.my-segmented) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 12rpx;
    border-radius: 16rpx;
  }

  // 自定义选项样式
  :deep(.wd-segmented__item) {
    color: rgba(255, 255, 255, 0.7);
    font-weight: bold;

    &.is-active {
      color: #333;
    }
  }

  // 自定义激活项背景
  :deep(.wd-segmented__item--active) {
    background: #fff;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  }
}
</style>
```

**深色主题:**

```vue
<template>
  <view class="dark-segmented wot-theme-dark">
    <wd-segmented v-model:value="value" :options="options" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('选项1')
const options = ['选项1', '选项2', '选项3']
</script>

<style lang="scss" scoped>
.dark-segmented {
  padding: 32rpx;
  background: #1a1a1a;
  min-height: 100vh;
}
</style>
```

**胶囊样式:**

```vue
<template>
  <view class="capsule-segmented">
    <wd-segmented
      v-model:value="value"
      :options="options"
      custom-class="capsule-style"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('选项1')
const options = ['选项1', '选项2', '选项3']
</script>

<style lang="scss" scoped>
.capsule-segmented {
  padding: 32rpx;

  :deep(.capsule-style) {
    background: #fff;
    border: 2rpx solid #e0e0e0;
    border-radius: 48rpx;

    .wd-segmented__item {
      color: #666;

      &.is-active {
        color: #fff;
      }
    }

    .wd-segmented__item--active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 48rpx;
    }
  }
}
</style>
```

参考: src/wd/components/wd-segmented/wd-segmented.vue:236-345

---

## 最佳实践

### 1. 选项数量控制

**推荐做法:**

```vue
<!-- ✅ 选项数量适中（2-5个） -->
<wd-segmented v-model:value="value1" :options="['全部', '进行中', '已完成']" />

<!-- ✅ 使用对象数组简化显示 -->
<wd-segmented
  v-model:value="value2"
  :options="[
    { value: 'all', payload: { label: '全部' } },
    { value: 'ongoing', payload: { label: '进行中' } },
    { value: 'completed', payload: { label: '已完成' } }
  ]"
>
  <template #label="{ option }">
    {{ option.payload.label }}
  </template>
</wd-segmented>
```

**不推荐做法:**

```vue
<!-- ❌ 选项过多，挤压空间 -->
<wd-segmented
  v-model:value="value"
  :options="['选项1', '选项2', '选项3', '选项4', '选项5', '选项6', '选项7']"
/>

<!-- ❌ 选项文字过长 -->
<wd-segmented
  v-model:value="value"
  :options="['这是一个很长很长的选项', '这是另一个很长的选项']"
/>
```

**说明:**
- 选项数量建议控制在 2-5 个
- 选项文字保持简洁，避免过长
- 选项过多时考虑使用下拉选择或分页
- 文字过长时使用对象数组配合插槽

### 2. 合理使用禁用状态

**推荐做法:**

```vue
<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const userRole = ref('guest')  // guest, user, admin

// ✅ 根据权限动态禁用选项
const options = computed<SegmentedOption[]>(() => [
  { value: '查看', disabled: false },
  { value: '编辑', disabled: userRole.value === 'guest' },
  { value: '删除', disabled: userRole.value !== 'admin' },
])
</script>

<template>
  <wd-segmented v-model:value="action" :options="options" />
</template>
```

**不推荐做法:**

```vue
<!-- ❌ 大部分选项都禁用 -->
<wd-segmented
  v-model:value="value"
  :options="[
    { value: '选项1' },
    { value: '选项2', disabled: true },
    { value: '选项3', disabled: true },
    { value: '选项4', disabled: true }
  ]"
/>

<!-- ❌ 整体禁用后还显示组件 -->
<wd-segmented v-model:value="value" :options="options" :disabled="true" />
```

**说明:**
- 禁用状态应该有明确的业务逻辑
- 避免大部分选项被禁用，影响用户体验
- 整体禁用时考虑隐藏组件或使用只读展示
- 提供禁用原因的提示信息

### 3. 选择合适的尺寸

**推荐做法:**

```vue
<!-- ✅ 根据场景选择尺寸 -->

<!-- 首屏重要操作 - 使用大尺寸 -->
<wd-segmented
  v-model:value="viewMode"
  :options="['列表', '网格']"
  size="large"
/>

<!-- 常规筛选 - 使用中尺寸 -->
<wd-segmented
  v-model:value="status"
  :options="['全部', '进行中', '已完成']"
  size="middle"
/>

<!-- 表单内嵌 - 使用小尺寸 -->
<wd-form-item label="性别">
  <wd-segmented
    v-model:value="gender"
    :options="['男', '女']"
    size="small"
  />
</wd-form-item>
```

**不推荐做法:**

```vue
<!-- ❌ 场景和尺寸不匹配 -->

<!-- 次要筛选使用大尺寸，占用过多空间 -->
<wd-segmented
  v-model:value="sortBy"
  :options="['默认', '价格', '销量']"
  size="large"
/>

<!-- 重要操作使用小尺寸，不够醒目 -->
<wd-segmented
  v-model:value="payMethod"
  :options="['微信', '支付宝']"
  size="small"
/>
```

**说明:**
- large 尺寸用于首屏、重要操作
- middle 尺寸用于常规场景
- small 尺寸用于表单、紧凑布局
- 同一页面保持尺寸统一

### 4. 结合业务逻辑使用

**推荐做法:**

```vue
<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const timeRange = ref('day')
const chartData = ref<any[]>([])

const timeOptions: SegmentedOption[] = [
  { value: 'day', payload: { days: 1 } },
  { value: 'week', payload: { days: 7 } },
  { value: 'month', payload: { days: 30 } },
]

// ✅ 监听选项变化，加载对应数据
watch(timeRange, (newValue) => {
  const option = timeOptions.find(opt => opt.value === newValue)
  if (option) {
    loadChartData(option.payload.days)
  }
})

const loadChartData = (days: number) => {
  // 加载数据逻辑
  console.log(`加载最近 ${days} 天的数据`)
}
</script>

<template>
  <view>
    <wd-segmented v-model:value="timeRange" :options="timeOptions">
      <template #label="{ option }">
        {{ option.value === 'day' ? '今日' : option.value === 'week' ? '本周' : '本月' }}
      </template>
    </wd-segmented>

    <Chart :data="chartData" />
  </view>
</template>
```

**不推荐做法:**

```vue
<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('选项1')
const options = ['选项1', '选项2', '选项3']

// ❌ 没有结合业务逻辑，选项切换无实际作用
</script>

<template>
  <wd-segmented v-model:value="value" :options="options" />
  <!-- 没有根据选项值显示不同内容 -->
</template>
```

**说明:**
- 选项切换应该触发实际的业务逻辑
- 使用 watch 监听选项变化并执行相应操作
- 利用 payload 存储选项的附加信息
- 提供明确的视觉反馈

### 5. 性能优化

**推荐做法:**

```vue
<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

// ✅ 静态选项使用常量
const STATUS_OPTIONS: SegmentedOption[] = [
  { value: 'all', payload: { label: '全部' } },
  { value: 'active', payload: { label: '进行中' } },
  { value: 'completed', payload: { label: '已完成' } },
]

// ✅ 使用 shallowRef 减少响应式开销
const options = shallowRef(STATUS_OPTIONS)
const currentStatus = ref('all')
</script>

<template>
  <wd-segmented v-model:value="currentStatus" :options="options" />
</template>
```

**不推荐做法:**

```vue
<script lang="ts" setup>
import { ref } from 'vue'

// ❌ 每次渲染都创建新的选项数组
const getOptions = () => [
  { value: 'all' },
  { value: 'active' },
  { value: 'completed' },
]
</script>

<template>
  <!-- ❌ 内联创建选项，每次渲染都重新创建 -->
  <wd-segmented
    v-model:value="value"
    :options="[
      { value: 'all' },
      { value: 'active' },
      { value: 'completed' }
    ]"
  />
</template>
```

**说明:**
- 静态选项使用常量定义
- 动态选项使用 ref 或 shallowRef
- 避免内联创建复杂对象
- 复杂场景考虑使用 computed

---

## 常见问题

### 1. 为什么选项切换后滑块位置不正确？

**问题原因:**
- 动态修改选项后未更新滑块样式
- 组件初始化时 DOM 元素尚未渲染完成
- 选项宽度计算异常

**解决方案:**

```vue
<template>
  <wd-segmented
    ref="segmentedRef"
    v-model:value="value"
    :options="options"
  />
  <wd-button @click="updateOptions">更新选项</wd-button>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import type { SegmentedInstance, SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const value = ref('选项1')
const options = ref<SegmentedOption[]>([
  { value: '选项1' },
  { value: '选项2' },
  { value: '选项3' },
])

const segmentedRef = ref<SegmentedInstance>()

const updateOptions = async () => {
  // 修改选项
  options.value = [
    { value: '新选项1' },
    { value: '新选项2' },
    { value: '新选项3' },
    { value: '新选项4' },
  ]

  // 重置选中值
  value.value = '新选项1'

  // 等待 DOM 更新后，手动更新滑块样式
  await nextTick()
  segmentedRef.value?.updateActiveStyle(true)
}
</script>
```

**说明:**
- 动态修改选项后调用 `updateActiveStyle` 方法
- 使用 `nextTick` 确保 DOM 更新完成
- 修改选项时同步更新 value 值

参考: src/wd/components/wd-segmented/wd-segmented.vue:158-180, 229-231

### 2. 如何实现选项的条件渲染？

**问题原因:**
- 需要根据条件动态显示不同的选项
- 选项的可见性依赖于其他状态

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-switch v-model="showAdvanced" @change="handleSwitchChange">
      显示高级选项
    </wd-switch>

    <wd-segmented v-model:value="value" :options="computedOptions" />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const value = ref('基础')
const showAdvanced = ref(false)

const baseOptions: SegmentedOption[] = [
  { value: '基础' },
  { value: '标准' },
]

const advancedOptions: SegmentedOption[] = [
  { value: '专业' },
  { value: '企业' },
]

const computedOptions = computed(() => {
  const options = [...baseOptions]
  if (showAdvanced.value) {
    options.push(...advancedOptions)
  }
  return options
})

const handleSwitchChange = (val: boolean) => {
  // 关闭高级选项时，如果当前选中的是高级选项，重置为基础选项
  if (!val && (value.value === '专业' || value.value === '企业')) {
    value.value = '基础'
  }
}
</script>
```

**说明:**
- 使用 computed 动态计算选项列表
- 选项变化时检查当前选中值是否仍然有效
- 无效时重置为默认值

参考: src/wd/components/wd-segmented/wd-segmented.vue:138-152

### 3. 为什么点击事件没有触发？

**问题原因:**
- 选项被禁用
- 事件监听器未正确绑定
- 点击区域被其他元素遮挡

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-segmented
      v-model:value="value"
      :options="options"
      :disabled="globalDisabled"
      @click="handleClick"
      @change="handleChange"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const value = ref('选项1')
const globalDisabled = ref(false)

const options: SegmentedOption[] = [
  { value: '选项1' },
  { value: '选项2', disabled: true },  // 单个选项禁用
  { value: '选项3' },
]

const handleClick = (option: SegmentedOption) => {
  console.log('点击了选项:', option)
  // click 事件会在点击任何选项时触发（包括禁用选项）
}

const handleChange = (option: SegmentedOption) => {
  console.log('切换到选项:', option)
  // change 事件只在选项真正切换时触发（不包括禁用选项）
}
</script>
```

**说明:**
- 检查选项是否被禁用（整体禁用或单个禁用）
- 确认事件监听器正确绑定
- `click` 事件在点击任何选项时触发
- `change` 事件只在选项切换成功时触发
- 禁用选项只触发 `click` 事件，不触发 `change` 事件

参考: src/wd/components/wd-segmented/wd-segmented.vue:213-226

### 4. 如何实现选项的异步加载？

**问题原因:**
- 选项数据需要从后端获取
- 需要根据用户操作动态加载选项

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-loading v-if="loading" />
    <wd-segmented
      v-else
      v-model:value="value"
      :options="options"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const loading = ref(true)
const value = ref('')
const options = ref<SegmentedOption[]>([])

const loadOptions = async () => {
  loading.value = true
  try {
    // 模拟异步请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 获取选项数据
    const data: SegmentedOption[] = [
      { value: '选项1', payload: { id: 1 } },
      { value: '选项2', payload: { id: 2 } },
      { value: '选项3', payload: { id: 3 } },
    ]

    options.value = data

    // 设置默认选中第一个
    if (data.length > 0) {
      value.value = data[0].value
    }
  } catch (error) {
    console.error('加载选项失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOptions()
})
</script>
```

**说明:**
- 加载期间显示加载状态
- 加载完成后设置选项和默认值
- 处理加载失败的情况
- 确保数据加载完成后再渲染组件

### 5. 如何自定义选项的样式？

**问题原因:**
- 需要为不同的选项设置不同的样式
- 想要实现更个性化的视觉效果

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-segmented
      v-model:value="value"
      :options="options"
      custom-class="custom-segmented"
    >
      <template #label="{ option }">
        <view class="custom-label" :style="getLabelStyle(option.value)">
          <wd-icon v-if="option.payload.icon" :name="option.payload.icon" size="32" />
          <text>{{ option.value }}</text>
        </view>
      </template>
    </wd-segmented>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SegmentedOption } from '@/wd/components/wd-segmented/wd-segmented.vue'

const value = ref('成功')

const options: SegmentedOption[] = [
  { value: '成功', payload: { icon: 'check', color: '#52c41a' } },
  { value: '警告', payload: { icon: 'warning', color: '#faad14' } },
  { value: '错误', payload: { icon: 'close', color: '#ff4d4f' } },
]

const getLabelStyle = (value: string | number) => {
  const option = options.find(opt => opt.value === value)
  if (option?.payload.color) {
    return {
      color: option.payload.color,
    }
  }
  return {}
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  :deep(.custom-segmented) {
    .wd-segmented__item {
      &.is-active {
        font-weight: bold;
      }
    }
  }

  .custom-label {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
}
</style>
```

**说明:**
- 使用 label 插槽自定义选项内容
- 通过 payload 存储样式相关数据
- 使用 :deep() 深度选择器修改内部样式
- 结合 custom-class 添加自定义样式类

参考: src/wd/components/wd-segmented/wd-segmented.vue:12-21, 65-68

---

## 注意事项

1. **v-model 绑定值**：绑定值必须与 options 中某个选项的 value 匹配。如果不匹配，组件会自动选中第一个选项并触发 `update:value` 和 `change` 事件。

参考: src/wd/components/wd-segmented/wd-segmented.vue:138-152

2. **选项类型一致性**：options 数组中的元素类型应该保持一致，要么全是字符串/数字，要么全是对象。混合类型虽然支持，但不推荐使用。

参考: src/wd/components/wd-segmented/wd-segmented.vue:77

3. **对象选项的 value 必填**：使用对象数组时，每个对象必须包含 `value` 属性，否则会导致选项无法正常显示和选中。

参考: src/wd/components/wd-segmented/wd-segmented.vue:52-59

4. **禁用优先级**：如果组件整体禁用（`disabled="true"`），所有选项都不可点击，单个选项的 `disabled` 属性会被忽略。

参考: src/wd/components/wd-segmented/wd-segmented.vue:213-217

5. **事件触发条件**：`change` 事件只在选项真正切换时触发，点击当前选中项或禁用项不会触发。`click` 事件在点击任何选项时都会触发。

参考: src/wd/components/wd-segmented/wd-segmented.vue:213-226

6. **振动功能限制**：`vibrateShort` 功能依赖设备支持，部分设备或浏览器环境可能不支持。建议在移动端使用，PC 端自动忽略。

参考: src/wd/components/wd-segmented/wd-segmented.vue:191-193

7. **选项数量建议**：选项数量建议控制在 2-5 个，过多会导致选项过于拥挤，影响用户体验。超过 5 个选项时建议使用其他组件（如 Tabs 或下拉选择）。

8. **动态修改选项**：动态修改 options 后，如果滑块位置异常，需要手动调用 `updateActiveStyle` 方法更新样式。

参考: src/wd/components/wd-segmented/wd-segmented.vue:158-180

9. **插槽内容宽度**：使用 label 插槽自定义内容时，注意控制内容宽度。过宽的内容会导致选项溢出或文字截断。

参考: src/wd/components/wd-segmented/wd-segmented.vue:339-343

10. **样式隔离**：组件使用 `styleIsolation: 'shared'` 模式，自定义样式时需要注意样式作用域和优先级。

参考: src/wd/components/wd-segmented/wd-segmented.vue:40

11. **初始化时机**：组件挂载后会自动初始化滑块位置。如果在 `v-if` 中使用，确保组件显示后再初始化。

参考: src/wd/components/wd-segmented/wd-segmented.vue:202-206

12. **payload 数据**：`payload` 属性可以存储任意附加数据，在事件回调中可以获取。建议将业务相关的数据存储在 payload 中，保持 value 的简洁性。

参考: src/wd/components/wd-segmented/wd-segmented.vue:58

---

## 总结

Segmented 分段器组件是一个简洁实用的单选组件，适用于选项数量较少且需要快速切换的场景。通过灵活的数据格式、丰富的自定义能力和流畅的动画效果，可以满足各类业务需求。

**使用建议:**

- 选项数量控制在 2-5 个
- 选项文字保持简洁
- 根据场景选择合适的尺寸
- 合理使用禁用状态
- 配合业务逻辑使用

**适用场景:**

- 视图模式切换（列表/网格）
- 筛选条件选择（全部/进行中/已完成）
- 功能模式切换（编辑/预览）
- 时间范围选择（今日/本周/本月）
- 性别选择（男/女）
- 开关设置（开启/关闭）

**性能优化:**

- 静态选项使用常量定义
- 动态选项使用 ref/shallowRef
- 避免频繁修改选项数组
- 合理使用插槽，避免过度复杂

**最佳体验:**

- 提供明确的视觉反馈
- 禁用状态给予说明
- 选项切换触发实际业务逻辑
- 配合动画提升流畅度
