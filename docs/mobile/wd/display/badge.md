# Badge 徽标

## 介绍

Badge 徽标组件用于在按钮、图标等元素的右上角显示数字或状态标记，常用于消息通知、购物车数量、待办事项计数等场景。组件支持数字徽标、点状徽标、自定义颜色、主题类型等多种展示形式。

**核心特性:**

- **多种类型** - 支持 5 种主题类型(primary、success、warning、danger、info)
- **数字徽标** - 支持显示数字，超过最大值显示 `{max}+`
- **点状徽标** - 支持红色点状标注，不显示具体数值
- **自定义样式** - 支持自定义背景色、位置偏移
- **灵活控制** - 支持隐藏徽标、控制零值显示
- **响应式定位** - 自动定位在父元素右上角

## 基本用法

### 数字徽标

显示具体的数字内容。

```vue
<template>
  <view class="demo">
    <wd-badge :model-value="5">
      <wd-button>消息</wd-button>
    </wd-badge>

    <wd-badge :model-value="12">
      <wd-button>通知</wd-button>
    </wd-badge>

    <wd-badge :model-value="99">
      <wd-button>待办</wd-button>
    </wd-badge>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  display: flex;
  gap: 32rpx;
  padding: 32rpx;
}
</style>
```

**使用说明:**
- 使用 `model-value` 属性设置徽标内容
- 徽标会自动定位在父元素右上角
- 支持数字和字符串类型

### 最大值限制

当数字超过最大值时，显示 `{max}+`。

```vue
<template>
  <view class="demo">
    <wd-badge :model-value="99" :max="99">
      <wd-button>消息</wd-button>
    </wd-badge>

    <wd-badge :model-value="100" :max="99">
      <wd-button>通知</wd-button>
    </wd-badge>

    <wd-badge :model-value="200" :max="99">
      <wd-button>待办</wd-button>
    </wd-badge>
  </view>
</template>
```

**使用说明:**
- 使用 `max` 属性设置最大值
- 当 `model-value` 超过 `max` 时，显示 `{max}+`
- `max` 和 `model-value` 都必须是数字类型

### 点状徽标

显示小红点，不显示具体数值。

```vue
<template>
  <view class="demo">
    <wd-badge is-dot>
      <wd-button>消息</wd-button>
    </wd-badge>

    <wd-badge is-dot>
      <wd-icon name="bell" size="40" />
    </wd-badge>

    <wd-badge is-dot>
      <text>动态</text>
    </wd-badge>
  </view>
</template>
```

**使用说明:**
- 使用 `is-dot` 属性启用点状徽标
- 点状徽标不显示数字内容
- 适用于只需要提示有新消息的场景

### 主题类型

支持 5 种主题类型，不同类型显示不同颜色。

```vue
<template>
  <view class="demo-column">
    <view class="demo-row">
      <wd-badge :model-value="5" type="primary">
        <wd-button>Primary</wd-button>
      </wd-badge>

      <wd-badge :model-value="5" type="success">
        <wd-button>Success</wd-button>
      </wd-badge>
    </view>

    <view class="demo-row">
      <wd-badge :model-value="5" type="warning">
        <wd-button>Warning</wd-button>
      </wd-badge>

      <wd-badge :model-value="5" type="danger">
        <wd-button>Danger</wd-button>
      </wd-badge>

      <wd-badge :model-value="5" type="info">
        <wd-button>Info</wd-button>
      </wd-badge>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  padding: 32rpx;
}

.demo-row {
  display: flex;
  gap: 32rpx;
}
</style>
```

**使用说明:**
- 使用 `type` 属性设置主题类型
- 支持类型: `primary`(蓝色)、`success`(绿色)、`warning`(橙色)、`danger`(红色)、`info`(灰色)
- 默认为红色(danger)

### 自定义颜色

使用自定义背景色。

```vue
<template>
  <view class="demo">
    <wd-badge :model-value="5" bg-color="#ff6b6b">
      <wd-button>红色</wd-button>
    </wd-badge>

    <wd-badge :model-value="5" bg-color="#4ecdc4">
      <wd-button>青色</wd-button>
    </wd-badge>

    <wd-badge :model-value="5" bg-color="#ffe66d">
      <wd-button>黄色</wd-button>
    </wd-badge>

    <wd-badge is-dot bg-color="#a8e6cf">
      <wd-button>绿点</wd-button>
    </wd-badge>
  </view>
</template>
```

**使用说明:**
- 使用 `bg-color` 属性设置自定义背景色
- 支持任意 CSS 颜色值(hex、rgb、rgba 等)
- 自定义颜色会覆盖 `type` 属性的颜色

### 自定义位置

通过 `top` 和 `right` 属性调整徽标位置。

```vue
<template>
  <view class="demo">
    <wd-badge :model-value="5" :top="0" :right="0">
      <wd-button>默认位置</wd-button>
    </wd-badge>

    <wd-badge :model-value="5" :top="10" :right="10">
      <wd-button>向内偏移</wd-button>
    </wd-badge>

    <wd-badge :model-value="5" :top="-10" :right="-10">
      <wd-button>向外偏移</wd-button>
    </wd-badge>
  </view>
</template>
```

**使用说明:**
- `top` 属性: 正值向下偏移，负值向上偏移
- `right` 属性: 正值向左偏移，负值向右偏移
- 单位会自动添加，支持数字或带单位的字符串

### 显示零值

控制当值为 0 时是否显示徽标。

```vue
<template>
  <view class="demo">
    <wd-badge :model-value="0">
      <wd-button>隐藏零值</wd-button>
    </wd-badge>

    <wd-badge :model-value="0" show-zero>
      <wd-button>显示零值</wd-button>
    </wd-badge>
  </view>
</template>
```

**使用说明:**
- 默认情况下，值为 0 时不显示徽标
- 设置 `show-zero` 属性可以强制显示零值
- 适用于需要明确显示"无消息"状态的场景

### 隐藏徽标

动态控制徽标的显示和隐藏。

```vue
<template>
  <view class="demo-column">
    <wd-badge :model-value="5" :hidden="isHidden">
      <wd-button>消息</wd-button>
    </wd-badge>

    <wd-button @click="toggleHidden">
      {{ isHidden ? '显示徽标' : '隐藏徽标' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isHidden = ref(false)

const toggleHidden = () => {
  isHidden.value = !isHidden.value
}
</script>
```

**使用说明:**
- 使用 `hidden` 属性控制徽标显示/隐藏
- 适用于需要动态控制徽标状态的场景
- 隐藏后徽标完全不渲染

### 独立使用

徽标也可以不包裹其他元素，独立使用。

```vue
<template>
  <view class="demo">
    <wd-badge :model-value="5" type="primary" />
    <wd-badge :model-value="10" type="success" />
    <wd-badge :model-value="99" :max="99" type="warning" />
    <wd-badge is-dot type="danger" />
  </view>
</template>
```

**使用说明:**
- 独立使用时，徽标显示为 inline-block
- 不设置 `model-value` 或 `is-dot` 时不显示
- 可以配合其他样式使用

## 实战案例

### 消息中心

```vue
<template>
  <view class="message-center">
    <wd-cell-group>
      <wd-cell title="系统消息" is-link>
        <template #suffix>
          <wd-badge :model-value="systemCount" :max="99" />
        </template>
      </wd-cell>

      <wd-cell title="互动消息" is-link>
        <template #suffix>
          <wd-badge :model-value="interactionCount" :max="99" type="primary" />
        </template>
      </wd-cell>

      <wd-cell title="待办事项" is-link>
        <template #suffix>
          <wd-badge :model-value="todoCount" type="warning" />
        </template>
      </wd-cell>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const systemCount = ref(5)
const interactionCount = ref(128)
const todoCount = ref(3)
</script>
```

### 购物车

```vue
<template>
  <view class="cart-demo">
    <wd-badge :model-value="cartCount" :max="99">
      <wd-button icon="cart" type="primary" size="large">
        购物车
      </wd-button>
    </wd-badge>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const cartCount = ref(8)

// 添加商品到购物车
const addToCart = () => {
  cartCount.value++
}
</script>
```

### 未读消息提示

```vue
<template>
  <view class="message-list">
    <view
      v-for="item in messages"
      :key="item.id"
      class="message-item"
      @click="readMessage(item.id)"
    >
      <wd-badge v-if="!item.isRead" is-dot :top="-5" :right="-5">
        <image :src="item.avatar" class="avatar" />
      </wd-badge>
      <image v-else :src="item.avatar" class="avatar" />

      <view class="message-content">
        <text class="name">{{ item.name }}</text>
        <text class="text">{{ item.content }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Message {
  id: number
  name: string
  avatar: string
  content: string
  isRead: boolean
}

const messages = ref<Message[]>([
  { id: 1, name: '张三', avatar: '/avatar1.png', content: '你好', isRead: false },
  { id: 2, name: '李四', avatar: '/avatar2.png', content: '在吗', isRead: true },
  { id: 3, name: '王五', avatar: '/avatar3.png', content: '晚上见', isRead: false },
])

const readMessage = (id: number) => {
  const message = messages.value.find(m => m.id === id)
  if (message) {
    message.isRead = true
  }
}
</script>

<style lang="scss" scoped>
.message-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  gap: 24rpx;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.name {
  font-size: 32rpx;
  font-weight: 500;
}

.text {
  font-size: 28rpx;
  color: #999;
}
</style>
```

### 动态徽标

根据数据动态显示不同状态的徽标。

```vue
<template>
  <view class="dynamic-badge">
    <wd-badge
      :model-value="count"
      :type="badgeType"
      :max="99"
      :is-dot="count === 0"
      :hidden="count === 0 && !showZeroBadge"
    >
      <wd-button>动态徽标</wd-button>
    </wd-badge>

    <view class="controls">
      <wd-button @click="increment">增加</wd-button>
      <wd-button @click="decrement">减少</wd-button>
      <wd-button @click="reset">重置</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { BadgeType } from '@/wd/components/wd-badge/wd-badge.vue'

const count = ref(0)
const showZeroBadge = ref(false)

// 根据数量动态计算徽标类型
const badgeType = computed<BadgeType>(() => {
  if (count.value === 0) return 'info'
  if (count.value < 10) return 'success'
  if (count.value < 50) return 'warning'
  return 'danger'
})

const increment = () => {
  count.value++
}

const decrement = () => {
  if (count.value > 0) {
    count.value--
  }
}

const reset = () => {
  count.value = 0
}
</script>

<style lang="scss" scoped>
.dynamic-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  padding: 32rpx;
}

.controls {
  display: flex;
  gap: 16rpx;
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `model-value` | 显示值 | `string \| number` | `''` |
| `max` | 最大值，超过最大值会显示 `{max}+`，要求 `model-value` 是数字类型 | `number` | - |
| `is-dot` | 是否为红色点状标注 | `boolean` | `false` |
| `hidden` | 是否隐藏徽标 | `boolean` | `false` |
| `type` | 徽标类型，可选值: `primary`/`success`/`warning`/`danger`/`info` | `BadgeType` | - |
| `bg-color` | 自定义背景颜色 | `string` | - |
| `top` | 向下偏移量，支持数字或带单位的字符串 | `string \| number` | - |
| `right` | 向左偏移量，支持数字或带单位的字符串 | `string \| number` | - |
| `show-zero` | 当数值为 0 时，是否展示徽标 | `boolean` | `false` |
| `custom-class` | 自定义根节点样式类 | `string` | `''` |
| `custom-style` | 自定义根节点样式 | `string` | `''` |

### Slots

| 名称 | 说明 |
|------|------|
| `default` | 徽标包裹的内容 |

### 类型定义

```typescript
/**
 * 徽标类型
 */
export type BadgeType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

/**
 * 徽标组件属性接口
 */
export interface WdBadgeProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 显示值 */
  modelValue?: string | number
  /** 当数值为 0 时，是否展示徽标 */
  showZero?: boolean
  /** 背景颜色 */
  bgColor?: string
  /** 最大值，超过最大值会显示 '{max}+'，要求 value 是 Number 类型 */
  max?: number
  /** 是否为红色点状标注 */
  isDot?: boolean
  /** 是否隐藏 badge */
  hidden?: boolean
  /** badge类型 */
  type?: BadgeType
  /** 为正时，角标向下偏移对应的像素 */
  top?: string | number
  /** 为正时，角标向左偏移对应的像素 */
  right?: string | number
}
```

## 主题定制

### CSS 变量

Badge 组件提供了以下 CSS 变量用于主题定制：

```scss
$-badge-height: 32rpx;              // 徽标高度
$-badge-padding: 0 10rpx;           // 徽标内边距
$-badge-bg: $-color-danger;         // 徽标背景色(默认红色)
$-badge-color: #fff;                // 徽标文字颜色
$-badge-fs: 20rpx;                  // 徽标字体大小
$-badge-border: 2rpx solid #fff;    // 徽标边框
$-badge-dot-size: 16rpx;            // 点状徽标尺寸

// 主题色
$-badge-primary: $-color-theme;     // 蓝色
$-badge-success: $-color-success;   // 绿色
$-badge-warning: $-color-warning;   // 橙色
$-badge-info: $-color-info;         // 灰色
$-badge-danger: $-color-danger;     // 红色
```

### 暗黑模式

组件支持暗黑模式，在暗黑模式下会自动调整边框颜色以适应深色背景。

## 最佳实践

### 1. 合理使用徽标类型

```vue
<!-- ✅ 推荐: 根据业务含义选择合适的类型 -->
<wd-badge :model-value="errorCount" type="danger">错误</wd-badge>
<wd-badge :model-value="successCount" type="success">成功</wd-badge>
<wd-badge :model-value="warningCount" type="warning">警告</wd-badge>

<!-- ❌ 不推荐: 所有场景使用同一类型 -->
<wd-badge :model-value="count">默认</wd-badge>
```

### 2. 设置最大值

```vue
<!-- ✅ 推荐: 设置合理的最大值 -->
<wd-badge :model-value="999" :max="99">消息</wd-badge>

<!-- ❌ 不推荐: 显示过大的数字 -->
<wd-badge :model-value="99999">消息</wd-badge>
```

### 3. 适当使用点状徽标

```vue
<!-- ✅ 推荐: 不需要显示具体数量时使用点状 -->
<wd-badge is-dot>新消息</wd-badge>

<!-- ❌ 不推荐: 有具体数量时使用点状 -->
<wd-badge is-dot :model-value="5">消息</wd-badge>
```

### 4. 控制零值显示

```vue
<!-- ✅ 推荐: 根据业务需求控制零值显示 -->
<wd-badge :model-value="0" show-zero>待办</wd-badge>

<!-- ❌ 不推荐: 零值时显示空徽标 -->
<wd-badge :model-value="0">待办</wd-badge>
```

## 常见问题

### 1. 徽标位置不准确

**原因:**
- 父元素没有设置 `position: relative`
- 自定义偏移值不合适

**解决方案:**
```vue
<!-- 确保父元素有正确的定位 -->
<view style="position: relative; display: inline-block;">
  <wd-badge :model-value="5">
    <wd-button>消息</wd-button>
  </wd-badge>
</view>

<!-- 或调整偏移量 -->
<wd-badge :model-value="5" :top="5" :right="5">
  <wd-button>消息</wd-button>
</wd-badge>
```

### 2. 数字超过最大值但没显示加号

**原因:**
- `model-value` 或 `max` 不是数字类型
- 没有设置 `max` 属性

**解决方案:**
```vue
<!-- ✅ 正确: 使用数字类型 -->
<wd-badge :model-value="100" :max="99">消息</wd-badge>

<!-- ❌ 错误: 使用字符串类型 -->
<wd-badge model-value="100" max="99">消息</wd-badge>
```

### 3. 自定义颜色不生效

**原因:**
- 同时设置了 `type` 和 `bg-color`，`bg-color` 优先级更高
- 颜色值格式不正确

**解决方案:**
```vue
<!-- ✅ 正确: 使用正确的颜色值 -->
<wd-badge :model-value="5" bg-color="#ff6b6b">消息</wd-badge>

<!-- 如果要使用 type，不要设置 bg-color -->
<wd-badge :model-value="5" type="primary">消息</wd-badge>
```

### 4. 徽标不显示

**原因:**
- 设置了 `hidden="true"`
- `model-value` 为空且没有设置 `is-dot`
- `model-value` 为 0 且没有设置 `show-zero`

**解决方案:**
```vue
<!-- 检查是否隐藏 -->
<wd-badge :model-value="5" :hidden="false">消息</wd-badge>

<!-- 零值时显示 -->
<wd-badge :model-value="0" show-zero>消息</wd-badge>

<!-- 使用点状徽标 -->
<wd-badge is-dot>消息</wd-badge>
```

### 5. 独立使用时徽标不显示

**原因:**
- 没有设置 `model-value` 或 `is-dot`
- `model-value` 为空值

**解决方案:**
```vue
<!-- ✅ 正确: 设置 model-value 或 is-dot -->
<wd-badge :model-value="5" />
<wd-badge is-dot />

<!-- ❌ 错误: 没有设置任何值 -->
<wd-badge />
```

## 总结

Badge 徽标组件功能丰富，使用灵活：

1. ✅ 支持数字徽标和点状徽标
2. ✅ 提供 5 种主题类型
3. ✅ 支持自定义颜色和位置
4. ✅ 可设置最大值限制
5. ✅ 灵活控制显示状态
6. ✅ 支持暗黑模式

通过合理使用 Badge 组件，可以为应用添加醒目的数字标记和状态提示！
