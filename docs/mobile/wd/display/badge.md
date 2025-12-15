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

| CSS 变量 | 说明 | 默认值 |
|----------|------|--------|
| `--wot-badge-height` | 徽标高度 | `32rpx` |
| `--wot-badge-padding` | 徽标内边距 | `0 10rpx` |
| `--wot-badge-bg` | 徽标背景色(默认红色) | `$-color-danger` |
| `--wot-badge-color` | 徽标文字颜色 | `#fff` |
| `--wot-badge-fs` | 徽标字体大小 | `20rpx` |
| `--wot-badge-border` | 徽标边框 | `2rpx solid #fff` |
| `--wot-badge-dot-size` | 点状徽标尺寸 | `16rpx` |
| `--wot-badge-primary` | 主要类型颜色 | `$-color-theme` |
| `--wot-badge-success` | 成功类型颜色 | `$-color-success` |
| `--wot-badge-warning` | 警告类型颜色 | `$-color-warning` |
| `--wot-badge-info` | 信息类型颜色 | `$-color-info` |
| `--wot-badge-danger` | 危险类型颜色 | `$-color-danger` |

```scss
// SCSS 变量定义
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

### 自定义主题示例

通过 CSS 变量覆盖默认样式,实现自定义主题效果。

```vue
<template>
  <view class="custom-badge-demo">
    <wd-badge :model-value="5" custom-class="custom-badge">
      <wd-button>自定义徽标</wd-button>
    </wd-badge>
  </view>
</template>

<style lang="scss">
// 注意: 需要使用非 scoped 样式或 :deep() 选择器
.custom-badge {
  --wot-badge-height: 40rpx;
  --wot-badge-fs: 24rpx;
  --wot-badge-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --wot-badge-border: none;
}
</style>
```

**使用说明:**

- 使用 `custom-class` 属性添加自定义类名
- 在自定义类中覆盖 CSS 变量
- 需要注意 scoped 样式的穿透问题

### 使用 ConfigProvider 全局配置

通过 ConfigProvider 组件可以全局配置 Badge 组件的主题样式。

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="demo">
      <wd-badge :model-value="5">
        <wd-button>消息</wd-button>
      </wd-badge>

      <wd-badge :model-value="10" type="primary">
        <wd-button>通知</wd-button>
      </wd-badge>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const themeVars = reactive({
  badgeHeight: '36rpx',
  badgeFs: '22rpx',
  badgePrimary: '#6366f1',
  badgeSuccess: '#22c55e',
  badgeWarning: '#f59e0b',
  badgeDanger: '#ef4444',
  badgeInfo: '#6b7280'
})
</script>
```

**ConfigProvider 支持的徽标变量:**

| 变量名 | 说明 | 对应 CSS 变量 |
|--------|------|---------------|
| `badgeHeight` | 徽标高度 | `--wot-badge-height` |
| `badgePadding` | 徽标内边距 | `--wot-badge-padding` |
| `badgeBg` | 徽标背景色 | `--wot-badge-bg` |
| `badgeColor` | 徽标文字颜色 | `--wot-badge-color` |
| `badgeFs` | 徽标字体大小 | `--wot-badge-fs` |
| `badgeBorder` | 徽标边框 | `--wot-badge-border` |
| `badgeDotSize` | 点状徽标尺寸 | `--wot-badge-dot-size` |
| `badgePrimary` | 主要类型颜色 | `--wot-badge-primary` |
| `badgeSuccess` | 成功类型颜色 | `--wot-badge-success` |
| `badgeWarning` | 警告类型颜色 | `--wot-badge-warning` |
| `badgeInfo` | 信息类型颜色 | `--wot-badge-info` |
| `badgeDanger` | 危险类型颜色 | `--wot-badge-danger` |

### 暗黑模式适配

组件支持暗黑模式，在暗黑模式下会自动调整边框颜色以适应深色背景。

```vue
<template>
  <view class="dark-mode-demo" :class="{ 'dark': isDark }">
    <wd-button size="small" @click="toggleDark">
      切换主题: {{ isDark ? '暗黑' : '亮色' }}
    </wd-button>

    <view class="badge-group">
      <wd-badge :model-value="5" type="primary">
        <wd-button>Primary</wd-button>
      </wd-badge>

      <wd-badge :model-value="10" type="success">
        <wd-button>Success</wd-button>
      </wd-badge>

      <wd-badge :model-value="15" type="danger">
        <wd-button>Danger</wd-button>
      </wd-badge>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)

const toggleDark = () => {
  isDark.value = !isDark.value
}
</script>

<style lang="scss" scoped>
.dark-mode-demo {
  padding: 32rpx;
  transition: background-color 0.3s;

  &.dark {
    background-color: #1f2937;

    // 暗黑模式下调整徽标边框
    :deep(.wd-badge__content) {
      border-color: #374151;
    }
  }
}

.badge-group {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}
</style>
```

**暗黑模式实现要点:**

- 徽标边框颜色会自动适应深色背景
- 可以通过 CSS 变量进一步自定义暗黑模式下的样式
- 建议使用统一的暗黑模式管理方案(如 useTheme Hook)

### 品牌色定制

根据品牌风格自定义徽标颜色体系。

```vue
<template>
  <view class="brand-badge-demo">
    <!-- 企业微信风格 -->
    <view class="brand-section">
      <text class="brand-title">企业微信风格</text>
      <view class="badge-row">
        <wd-badge :model-value="3" bg-color="#1890ff">
          <wd-button>消息</wd-button>
        </wd-badge>
        <wd-badge is-dot bg-color="#52c41a">
          <wd-button>在线</wd-button>
        </wd-badge>
      </view>
    </view>

    <!-- 淘宝风格 -->
    <view class="brand-section">
      <text class="brand-title">淘宝风格</text>
      <view class="badge-row">
        <wd-badge :model-value="99" :max="99" bg-color="#ff4d4f">
          <wd-button>购物车</wd-button>
        </wd-badge>
        <wd-badge model-value="HOT" bg-color="#ff7875">
          <wd-button>活动</wd-button>
        </wd-badge>
      </view>
    </view>

    <!-- 抖音风格 -->
    <view class="brand-section">
      <text class="brand-title">抖音风格</text>
      <view class="badge-row">
        <wd-badge :model-value="88" bg-color="linear-gradient(135deg, #fe2c55 0%, #25f4ee 100%)">
          <wd-button>消息</wd-button>
        </wd-badge>
        <wd-badge is-dot bg-color="#fe2c55">
          <wd-button>通知</wd-button>
        </wd-badge>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.brand-badge-demo {
  padding: 32rpx;
}

.brand-section {
  margin-bottom: 32rpx;
}

.brand-title {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.badge-row {
  display: flex;
  gap: 24rpx;
}
</style>
```

## 最佳实践

### 1. 合理使用徽标类型

根据业务含义选择合适的徽标类型,提升用户体验和信息传达效率。

```vue
<template>
  <view class="type-demo">
    <!-- ✅ 推荐: 根据业务含义选择合适的类型 -->
    <view class="demo-section">
      <text class="section-title">✅ 推荐做法</text>
      <view class="badge-row">
        <wd-badge :model-value="errorCount" type="danger">
          <wd-button>错误日志</wd-button>
        </wd-badge>
        <wd-badge :model-value="successCount" type="success">
          <wd-button>成功任务</wd-button>
        </wd-badge>
        <wd-badge :model-value="warningCount" type="warning">
          <wd-button>待处理</wd-button>
        </wd-badge>
        <wd-badge :model-value="infoCount" type="info">
          <wd-button>一般通知</wd-button>
        </wd-badge>
      </view>
    </view>

    <!-- ❌ 不推荐: 所有场景使用同一类型 -->
    <view class="demo-section">
      <text class="section-title">❌ 不推荐做法</text>
      <view class="badge-row">
        <wd-badge :model-value="errorCount">
          <wd-button>错误日志</wd-button>
        </wd-badge>
        <wd-badge :model-value="successCount">
          <wd-button>成功任务</wd-button>
        </wd-badge>
        <wd-badge :model-value="warningCount">
          <wd-button>待处理</wd-button>
        </wd-badge>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const errorCount = ref(3)
const successCount = ref(15)
const warningCount = ref(8)
const infoCount = ref(2)
</script>
```

**类型选择指南:**

| 场景 | 推荐类型 | 说明 |
|------|---------|------|
| 错误/异常 | `danger` | 需要立即关注的问题 |
| 成功/完成 | `success` | 积极的反馈信息 |
| 警告/待处理 | `warning` | 需要注意但不紧急 |
| 一般信息 | `info` | 普通的提示信息 |
| 重要/主要 | `primary` | 品牌色,突出重要内容 |

### 2. 设置最大值

为徽标设置合理的最大值,避免显示过长的数字影响布局和美观。

```vue
<template>
  <view class="max-demo">
    <!-- ✅ 推荐: 根据场景设置合理的最大值 -->
    <view class="demo-section">
      <text class="section-title">✅ 推荐做法</text>
      <view class="badge-row">
        <!-- 消息类: 最大99 -->
        <wd-badge :model-value="messageCount" :max="99">
          <wd-button>消息</wd-button>
        </wd-badge>
        <!-- 购物车: 最大9 -->
        <wd-badge :model-value="cartCount" :max="9" type="danger">
          <wd-button>购物车</wd-button>
        </wd-badge>
        <!-- 通知类: 最大999 -->
        <wd-badge :model-value="notifyCount" :max="999" type="primary">
          <wd-button>通知</wd-button>
        </wd-badge>
      </view>
    </view>

    <!-- ❌ 不推荐: 不设置最大值 -->
    <view class="demo-section">
      <text class="section-title">❌ 不推荐做法</text>
      <view class="badge-row">
        <wd-badge :model-value="99999">
          <wd-button>消息数过大</wd-button>
        </wd-badge>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const messageCount = ref(128)
const cartCount = ref(15)
const notifyCount = ref(1234)
</script>
```

**最大值设置建议:**

| 场景 | 推荐最大值 | 显示效果 |
|------|-----------|---------|
| 购物车数量 | 9 | `9+` |
| 消息/评论数 | 99 | `99+` |
| 粉丝/点赞数 | 999 | `999+` |
| 浏览量/播放量 | 9999 | `9999+` |

### 3. 适当使用点状徽标

点状徽标适用于只需提示"有新内容"而不需要显示具体数量的场景。

```vue
<template>
  <view class="dot-demo">
    <!-- ✅ 推荐: 只需提示有新内容时使用点状 -->
    <view class="demo-section">
      <text class="section-title">✅ 适用场景</text>
      <view class="badge-row">
        <!-- 在线状态 -->
        <wd-badge is-dot type="success">
          <view class="avatar">
            <image src="/avatar.png" class="avatar-img" />
          </view>
        </wd-badge>
        <!-- 新功能提示 -->
        <wd-badge is-dot type="danger">
          <wd-button>设置</wd-button>
        </wd-badge>
        <!-- 有更新 -->
        <wd-badge is-dot type="primary">
          <wd-button>版本更新</wd-button>
        </wd-badge>
      </view>
    </view>

    <!-- ❌ 不推荐: 有具体数量时使用点状 -->
    <view class="demo-section">
      <text class="section-title">❌ 不适用场景</text>
      <view class="badge-row">
        <!-- 有具体数量应该显示数字 -->
        <wd-badge is-dot :model-value="5">
          <wd-button>5条消息用点状不合适</wd-button>
        </wd-badge>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
}
</style>
```

**点状徽标适用场景:**

- 在线/离线状态指示
- 新功能/新版本提示
- 未读消息提示(不关注数量)
- 设置项有更新
- 头像装饰

### 4. 控制零值显示

根据业务需求合理控制零值的显示与隐藏。

```vue
<template>
  <view class="zero-demo">
    <!-- 根据业务场景选择是否显示零值 -->
    <view class="demo-section">
      <text class="section-title">场景对比</text>

      <!-- 待办事项: 显示0表示"已清空" -->
      <view class="scenario">
        <text class="scenario-name">待办事项:</text>
        <wd-badge :model-value="todoCount" show-zero type="success">
          <wd-button>已完成 (显示0)</wd-button>
        </wd-badge>
      </view>

      <!-- 购物车: 为空时隐藏徽标 -->
      <view class="scenario">
        <text class="scenario-name">购物车:</text>
        <wd-badge :model-value="cartCount" type="danger">
          <wd-button>购物车 (隐藏0)</wd-button>
        </wd-badge>
      </view>

      <!-- 消息: 为空时隐藏徽标 -->
      <view class="scenario">
        <text class="scenario-name">消息:</text>
        <wd-badge :model-value="messageCount">
          <wd-button>消息 (隐藏0)</wd-button>
        </wd-badge>
      </view>
    </view>

    <!-- 控制按钮 -->
    <view class="controls">
      <wd-button size="small" @click="clearAll">清空所有</wd-button>
      <wd-button size="small" @click="addItems">添加数据</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const todoCount = ref(0)
const cartCount = ref(0)
const messageCount = ref(0)

const clearAll = () => {
  todoCount.value = 0
  cartCount.value = 0
  messageCount.value = 0
}

const addItems = () => {
  todoCount.value = 3
  cartCount.value = 5
  messageCount.value = 8
}
</script>
```

**零值显示策略:**

| 场景 | 显示零值 | 原因 |
|------|---------|------|
| 待办事项 | ✅ 是 | 0表示"已完成全部",是积极反馈 |
| 购物车 | ❌ 否 | 空购物车不需要徽标 |
| 消息通知 | ❌ 否 | 无消息时不需要提示 |
| 库存数量 | ✅ 是 | 0表示"缺货",需要提醒 |
| 评论数 | 可选 | 根据产品策略决定 |

### 5. 动态徽标状态管理

使用计算属性和响应式数据管理徽标状态。

```vue
<template>
  <view class="dynamic-demo">
    <!-- 根据状态动态显示不同样式的徽标 -->
    <wd-badge
      :model-value="displayValue"
      :type="badgeType"
      :is-dot="isDotMode"
      :hidden="isHidden"
      :max="maxValue"
    >
      <wd-button :type="buttonType">
        {{ buttonText }}
      </wd-button>
    </wd-badge>

    <!-- 状态控制面板 -->
    <view class="control-panel">
      <view class="control-row">
        <text>数量: {{ count }}</text>
        <view class="button-group">
          <wd-button size="small" @click="count++">+</wd-button>
          <wd-button size="small" @click="count > 0 && count--">-</wd-button>
        </view>
      </view>

      <view class="control-row">
        <text>状态: {{ status }}</text>
        <wd-radio-group v-model="status" direction="horizontal">
          <wd-radio value="normal">正常</wd-radio>
          <wd-radio value="warning">警告</wd-radio>
          <wd-radio value="error">错误</wd-radio>
        </wd-radio-group>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { BadgeType } from '@/wd/components/wd-badge/wd-badge.vue'

const count = ref(5)
const status = ref('normal')
const maxValue = ref(99)

// 根据状态计算徽标类型
const badgeType = computed<BadgeType>(() => {
  switch (status.value) {
    case 'error':
      return 'danger'
    case 'warning':
      return 'warning'
    default:
      return count.value > 50 ? 'danger' : count.value > 20 ? 'warning' : 'primary'
  }
})

// 根据数量决定是否使用点状模式
const isDotMode = computed(() => count.value > 0 && count.value <= 1)

// 根据数量决定是否隐藏
const isHidden = computed(() => count.value === 0 && status.value === 'normal')

// 显示值
const displayValue = computed(() => isDotMode.value ? 0 : count.value)

// 按钮类型
const buttonType = computed(() => {
  switch (status.value) {
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    default:
      return 'primary'
  }
})

// 按钮文字
const buttonText = computed(() => {
  if (count.value === 0) return '无消息'
  if (count.value === 1) return '有新消息'
  return `${count.value}条消息`
})
</script>
```

### 6. 徽标与列表项结合

在列表场景中合理使用徽标组件。

```vue
<template>
  <view class="list-badge-demo">
    <wd-cell-group title="消息中心">
      <wd-cell
        v-for="item in menuItems"
        :key="item.id"
        :title="item.title"
        :label="item.desc"
        is-link
        @click="handleItemClick(item)"
      >
        <template #icon>
          <wd-badge
            :model-value="item.count"
            :type="item.type"
            :is-dot="item.isDot"
            :hidden="item.count === 0 && !item.isDot"
          >
            <wd-icon :name="item.icon" size="48rpx" />
          </wd-badge>
        </template>
      </wd-cell>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { BadgeType } from '@/wd/components/wd-badge/wd-badge.vue'

interface MenuItem {
  id: number
  title: string
  desc: string
  icon: string
  count: number
  type: BadgeType
  isDot: boolean
}

const menuItems = ref<MenuItem[]>([
  {
    id: 1,
    title: '系统消息',
    desc: '查看系统通知和公告',
    icon: 'bell',
    count: 5,
    type: 'danger',
    isDot: false
  },
  {
    id: 2,
    title: '互动消息',
    desc: '评论、点赞、关注等',
    icon: 'chat',
    count: 128,
    type: 'primary',
    isDot: false
  },
  {
    id: 3,
    title: '活动通知',
    desc: '优惠活动和促销信息',
    icon: 'gift',
    count: 0,
    type: 'warning',
    isDot: true
  },
  {
    id: 4,
    title: '服务通知',
    desc: '订单、物流等服务消息',
    icon: 'service',
    count: 0,
    type: 'info',
    isDot: false
  }
])

const handleItemClick = (item: MenuItem) => {
  // 点击后清除徽标
  item.count = 0
  item.isDot = false
  console.log('点击了:', item.title)
}
</script>
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

### 6. 徽标在小程序中样式异常

**问题原因:**
- 组件样式隔离导致样式无法穿透
- 自定义样式类名未生效
- CSS 变量未正确传递

**解决方案:**

```vue
<template>
  <view class="badge-container">
    <!-- 方案1: 使用 custom-class -->
    <wd-badge :model-value="5" custom-class="my-badge">
      <wd-button>消息</wd-button>
    </wd-badge>

    <!-- 方案2: 使用 custom-style 内联样式 -->
    <wd-badge
      :model-value="5"
      custom-style="--wot-badge-bg: #6366f1;"
    >
      <wd-button>消息</wd-button>
    </wd-badge>
  </view>
</template>

<style lang="scss">
/* 方案1: 全局样式或使用 :deep() */
.my-badge {
  --wot-badge-bg: #6366f1;
  --wot-badge-fs: 24rpx;
}

/* 或者使用 page 选择器提升优先级 */
page .my-badge {
  --wot-badge-bg: #6366f1 !important;
}
</style>
```

**小程序样式隔离说明:**

| 平台 | 样式隔离 | 解决方案 |
|------|---------|---------|
| H5 | 无 | 正常使用 |
| 微信小程序 | 有 | 使用 `custom-style` 或全局样式 |
| 支付宝小程序 | 有 | 使用 `custom-style` |
| 其他小程序 | 视情况 | 优先使用 `custom-style` |

### 7. 徽标动画效果不流畅

**问题原因:**
- 频繁更新数值导致重绘
- 过渡动画配置不当

**解决方案:**

```vue
<template>
  <view class="animated-badge">
    <!-- 添加过渡动画 -->
    <wd-badge
      :model-value="count"
      custom-class="badge-transition"
    >
      <wd-button @click="increment">消息 {{ count }}</wd-button>
    </wd-badge>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const count = ref(0)

// 使用节流函数避免频繁更新
let timer: ReturnType<typeof setTimeout> | null = null
const increment = () => {
  if (timer) return
  count.value++
  timer = setTimeout(() => {
    timer = null
  }, 100)
}
</script>

<style lang="scss">
.badge-transition {
  :deep(.wd-badge__content) {
    transition: transform 0.2s ease, background-color 0.2s ease;
  }
}

/* 数值变化时的缩放动画 */
.badge-transition:active {
  :deep(.wd-badge__content) {
    transform: scale(1.2);
  }
}
</style>
```

### 8. 文本徽标内容过长

**问题原因:**
- 文本内容超出徽标宽度
- 没有设置最大宽度或省略

**解决方案:**

```vue
<template>
  <view class="text-badge-demo">
    <!-- 方案1: 使用简短文本 -->
    <wd-badge model-value="NEW">
      <wd-button>新品</wd-button>
    </wd-badge>

    <!-- 方案2: 使用自定义样式限制宽度 -->
    <wd-badge model-value="限时特惠" custom-class="max-width-badge">
      <wd-button>活动</wd-button>
    </wd-badge>

    <!-- 方案3: 使用缩写 -->
    <wd-badge model-value="VIP">
      <wd-button>会员</wd-button>
    </wd-badge>
  </view>
</template>

<style lang="scss">
.max-width-badge {
  :deep(.wd-badge__content) {
    max-width: 120rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
```

**文本徽标建议:**

| 场景 | 推荐做法 | 示例 |
|------|---------|------|
| 新品标识 | 使用 NEW | `model-value="NEW"` |
| 热门标识 | 使用 HOT | `model-value="HOT"` |
| 会员等级 | 使用简称 | `model-value="VIP"` |
| 促销标签 | 限制字数 | `model-value="促销"` |

### 9. 徽标与父元素层级冲突

**问题原因:**
- 父元素设置了 `overflow: hidden`
- z-index 层级不够
- transform 创建了新的层叠上下文

**解决方案:**

```vue
<template>
  <view class="z-index-demo">
    <!-- 方案1: 调整父元素 overflow -->
    <view class="parent-container" style="overflow: visible;">
      <wd-badge :model-value="5">
        <wd-button>消息</wd-button>
      </wd-badge>
    </view>

    <!-- 方案2: 使用 custom-style 提升层级 -->
    <wd-badge
      :model-value="5"
      custom-style="z-index: 100;"
    >
      <wd-button>消息</wd-button>
    </wd-badge>

    <!-- 方案3: 调整父元素定位 -->
    <view class="parent-container" style="position: relative; z-index: 1;">
      <wd-badge :model-value="5">
        <wd-button>消息</wd-button>
      </wd-badge>
    </view>
  </view>
</template>
```

### 10. 徽标在列表中闪烁

**问题原因:**
- 列表项 key 设置不正确
- 数据更新导致组件重新渲染

**解决方案:**

```vue
<template>
  <view class="list-badge">
    <!-- ✅ 正确: 使用稳定的 key -->
    <view
      v-for="item in list"
      :key="item.id"
      class="list-item"
    >
      <wd-badge :model-value="item.count">
        <text>{{ item.name }}</text>
      </wd-badge>
    </view>

    <!-- ❌ 错误: 使用 index 作为 key -->
    <view
      v-for="(item, index) in list"
      :key="index"
      class="list-item"
    >
      <wd-badge :model-value="item.count">
        <text>{{ item.name }}</text>
      </wd-badge>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, shallowRef } from 'vue'

interface ListItem {
  id: number
  name: string
  count: number
}

// 使用 shallowRef 优化大列表性能
const list = shallowRef<ListItem[]>([
  { id: 1, name: '消息', count: 5 },
  { id: 2, name: '通知', count: 3 },
  { id: 3, name: '待办', count: 8 }
])

// 更新单个项时使用浅拷贝
const updateItemCount = (id: number, count: number) => {
  list.value = list.value.map(item =>
    item.id === id ? { ...item, count } : item
  )
}
</script>
```

## 进阶用法

### 徽标组合使用

多个徽标组合使用的场景。

```vue
<template>
  <view class="combo-badge-demo">
    <!-- 图标 + 多个徽标 -->
    <view class="combo-item">
      <wd-badge :model-value="messageCount" type="danger" :top="-5" :right="30">
        <wd-badge is-dot type="success" :top="-5" :right="-5">
          <view class="avatar-box">
            <image src="/avatar.png" class="avatar" />
          </view>
        </wd-badge>
      </wd-badge>
      <text class="combo-label">消息 + 在线状态</text>
    </view>

    <!-- 按钮组 + 徽标 -->
    <view class="combo-item">
      <view class="button-group">
        <wd-badge :model-value="3" type="danger">
          <wd-button size="small">待审批</wd-button>
        </wd-badge>
        <wd-badge :model-value="5" type="warning">
          <wd-button size="small">待处理</wd-button>
        </wd-badge>
        <wd-badge :model-value="0" show-zero type="success">
          <wd-button size="small">已完成</wd-button>
        </wd-badge>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const messageCount = ref(8)
</script>

<style lang="scss" scoped>
.combo-badge-demo {
  padding: 32rpx;
}

.combo-item {
  margin-bottom: 40rpx;
}

.avatar-box {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  overflow: hidden;
}

.avatar {
  width: 100%;
  height: 100%;
}

.combo-label {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
}

.button-group {
  display: flex;
  gap: 16rpx;
}
</style>
```

### 徽标与 Tabbar 结合

在底部导航栏中使用徽标。

```vue
<template>
  <view class="tabbar-badge-demo">
    <wd-tabbar v-model="activeTab">
      <wd-tabbar-item name="home" icon="home">
        首页
      </wd-tabbar-item>

      <wd-tabbar-item name="category" icon="grid">
        分类
      </wd-tabbar-item>

      <!-- 带徽标的 tabbar-item -->
      <wd-tabbar-item name="cart" icon="cart">
        <template #icon="{ active }">
          <wd-badge :model-value="cartCount" :max="99" type="danger">
            <wd-icon
              name="cart"
              :color="active ? '#1890ff' : '#999'"
              size="48rpx"
            />
          </wd-badge>
        </template>
        购物车
      </wd-tabbar-item>

      <wd-tabbar-item name="message" icon="chat">
        <template #icon="{ active }">
          <wd-badge :model-value="messageCount" :hidden="messageCount === 0">
            <wd-icon
              name="chat"
              :color="active ? '#1890ff' : '#999'"
              size="48rpx"
            />
          </wd-badge>
        </template>
        消息
      </wd-tabbar-item>

      <wd-tabbar-item name="user" icon="user">
        <template #icon="{ active }">
          <wd-badge is-dot :hidden="!hasNewFeature" type="primary">
            <wd-icon
              name="user"
              :color="active ? '#1890ff' : '#999'"
              size="48rpx"
            />
          </wd-badge>
        </template>
        我的
      </wd-tabbar-item>
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref('home')
const cartCount = ref(5)
const messageCount = ref(12)
const hasNewFeature = ref(true)
</script>
```

### 徽标与表格结合

在表格单元格中使用徽标显示状态。

```vue
<template>
  <view class="table-badge-demo">
    <view class="table-header">
      <text class="col col-name">名称</text>
      <text class="col col-status">状态</text>
      <text class="col col-count">数量</text>
    </view>

    <view
      v-for="item in tableData"
      :key="item.id"
      class="table-row"
    >
      <text class="col col-name">{{ item.name }}</text>
      <view class="col col-status">
        <wd-badge
          :model-value="item.statusText"
          :type="item.statusType"
        />
      </view>
      <view class="col col-count">
        <wd-badge
          :model-value="item.count"
          :type="getCountType(item.count)"
          :max="99"
        />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { BadgeType } from '@/wd/components/wd-badge/wd-badge.vue'

interface TableItem {
  id: number
  name: string
  statusText: string
  statusType: BadgeType
  count: number
}

const tableData = ref<TableItem[]>([
  { id: 1, name: '订单A', statusText: '待处理', statusType: 'warning', count: 5 },
  { id: 2, name: '订单B', statusText: '已完成', statusType: 'success', count: 0 },
  { id: 3, name: '订单C', statusText: '已取消', statusType: 'info', count: 3 },
  { id: 4, name: '订单D', statusText: '异常', statusType: 'danger', count: 128 }
])

const getCountType = (count: number): BadgeType => {
  if (count === 0) return 'success'
  if (count < 10) return 'primary'
  if (count < 50) return 'warning'
  return 'danger'
}
</script>

<style lang="scss" scoped>
.table-badge-demo {
  padding: 32rpx;
}

.table-header,
.table-row {
  display: flex;
  align-items: center;
  padding: 24rpx 16rpx;
  border-bottom: 1rpx solid #eee;
}

.table-header {
  background-color: #f5f5f5;
  font-weight: 500;
}

.col {
  flex: 1;
}

.col-name {
  flex: 2;
}

.col-status,
.col-count {
  display: flex;
  justify-content: center;
}
</style>
```

## 总结

Badge 徽标组件功能丰富,使用灵活:

1. ✅ 支持数字徽标和点状徽标
2. ✅ 提供 5 种主题类型
3. ✅ 支持自定义颜色和位置
4. ✅ 可设置最大值限制
5. ✅ 灵活控制显示状态
6. ✅ 支持暗黑模式
7. ✅ 支持 ConfigProvider 全局配置
8. ✅ 完善的 CSS 变量主题定制
9. ✅ 适配多端小程序

**使用建议:**

- 根据业务含义选择合适的徽标类型
- 为数字徽标设置合理的最大值
- 点状徽标适用于状态提示场景
- 根据业务需求控制零值显示
- 使用 CSS 变量或 ConfigProvider 进行主题定制
- 在列表场景中注意 key 的设置避免闪烁

通过合理使用 Badge 组件,可以为应用添加醒目的数字标记和状态提示!
