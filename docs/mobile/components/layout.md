# 布局组件

布局组件用于页面结构布局，提供栅格系统、宫格布局、分割线、间距控制、吸顶定位等核心能力。

## 组件列表

| 组件 | 说明 |
|------|------|
| Grid | 宫格布局，用于展示多个同类项目 |
| Row/Col | 栅格系统，24列弹性布局 |
| Divider | 分割线，内容分隔 |
| Gap | 间距，元素间距控制 |
| Sticky | 吸顶，元素滚动吸顶 |

---

## Grid 宫格

宫格布局组件，将页面在水平方向分隔成等宽度的区块，用于展示内容或进行页面导航。支持数据驱动模式（items 数组）和子组件模式（`wd-grid-item`）。

### 基本用法

```vue
<template>
  <!-- 子组件模式 -->
  <wd-grid :column="4">
    <wd-grid-item icon="home" text="首页" />
    <wd-grid-item icon="category" text="分类" />
    <wd-grid-item icon="cart" text="购物车" />
    <wd-grid-item icon="user" text="我的" />
  </wd-grid>

  <!-- 数据驱动模式 -->
  <wd-grid :items="gridItems" :column="4" clickable @item-click="handleClick" />
</template>

<script lang="ts" setup>
import type { GridItem } from '@/wd/components/wd-grid/wd-grid.vue'

const gridItems: GridItem[] = [
  { icon: 'home', text: '首页', url: '/pages/index/index' },
  { icon: 'category', text: '分类', url: '/pages/category/index' },
  { icon: 'cart', text: '购物车', url: '/pages/cart/index' },
  { icon: 'user', text: '我的', url: '/pages/mine/index' },
]

const handleClick = (item: GridItem, index: number) => {
  console.log('点击了:', item.text, '索引:', index)
}
</script>
```

### 列数与样式

```vue
<template>
  <!-- 3列布局 -->
  <wd-grid :column="3">
    <wd-grid-item icon="goods" text="商品" />
    <wd-grid-item icon="order" text="订单" />
    <wd-grid-item icon="service" text="客服" />
  </wd-grid>

  <!-- 正方形格子 + 间距 + 边框 -->
  <wd-grid :column="4" square :gutter="10" border>
    <wd-grid-item icon="home" text="首页" />
    <wd-grid-item icon="category" text="分类" />
    <wd-grid-item icon="cart" text="购物车" />
    <wd-grid-item icon="user" text="我的" />
  </wd-grid>
</template>
```

### 点击反馈与页面跳转

```vue
<template>
  <wd-grid :column="4" clickable>
    <wd-grid-item
      icon="home"
      text="首页"
      url="/pages/index/index"
      link-type="switchTab"
    />
    <wd-grid-item
      icon="detail"
      text="详情"
      url="/pages/detail/index"
      link-type="navigateTo"
    />
  </wd-grid>
</template>
```

**跳转类型说明：**

| 类型 | 说明 |
|------|------|
| `navigateTo` | 保留当前页面，跳转到应用内的某个页面 |
| `redirectTo` | 关闭当前页面，跳转到应用内的某个页面 |
| `switchTab` | 跳转到 tabBar 页面，并关闭其他非 tabBar 页面 |
| `reLaunch` | 关闭所有页面，打开到应用内的某个页面 |

### 自定义图标与内容

```vue
<template>
  <wd-grid :column="4">
    <!-- 自定义图标 -->
    <wd-grid-item text="自定义" use-icon-slot>
      <template #icon>
        <image src="/static/images/logo.png" class="custom-icon" />
      </template>
    </wd-grid-item>
    <wd-grid-item icon="home" text="首页" />
  </wd-grid>

  <!-- 自定义内容 -->
  <wd-grid :column="2">
    <wd-grid-item use-slot>
      <view class="custom-content">
        <image src="/static/images/banner1.png" class="content-image" />
        <text>自定义内容</text>
      </view>
    </wd-grid-item>
  </wd-grid>
</template>

<style lang="scss" scoped>
.custom-icon {
  width: 52rpx;
  height: 52rpx;
}
.custom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}
.content-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
}
</style>
```

### 徽标显示

```vue
<template>
  <wd-grid :column="4">
    <wd-grid-item icon="message" text="消息" is-dot />
    <wd-grid-item icon="notification" text="通知" :value="5" />
    <wd-grid-item icon="cart" text="购物车" :value="99" :max="99" />
    <wd-grid-item icon="warning" text="警告" type="warning" :value="10" />
  </wd-grid>
</template>
```

### Grid Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| items | 网格项数据数组（数据驱动模式） | `GridItem[]` | `[]` |
| column | 列数 | `number` | `4` |
| border | 是否显示边框 | `boolean` | `false` |
| gutter | 格子间距，单位 px | `number` | `0` |
| square | 是否将格子固定为正方形 | `boolean` | `false` |
| clickable | 是否开启点击反馈 | `boolean` | `false` |
| bg-color | 背景颜色 | `string` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Grid Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| item-click | 点击宫格项时触发（仅 items 模式） | `item: GridItem, index: number` |

### GridItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| icon | 图标名称 | `string` | - |
| icon-size | 图标大小 | `string` | `'26px'` |
| icon-color | 图标颜色 | `string` | - |
| text | 文字内容 | `string` | - |
| url | 跳转链接 | `string` | - |
| link-type | 跳转类型 | `LinkType` | `'navigateTo'` |
| use-slot | 是否使用内容插槽 | `boolean` | `false` |
| use-icon-slot | 是否使用图标插槽 | `boolean` | `false` |
| use-text-slot | 是否使用文字插槽 | `boolean` | `false` |
| is-dot | 是否显示小红点 | `boolean` | `false` |
| type | 徽标类型 | `BadgeType` | - |
| value | 徽标显示值 | `string \| number` | - |
| max | 徽标最大值 | `number` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### GridItem Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| itemclick | 点击宫格项时触发 | - |

### GridItem Slots

| 名称 | 说明 |
|------|------|
| default | 自定义内容（需设置 `use-slot`） |
| icon | 自定义图标（需设置 `use-icon-slot`） |
| text | 自定义文字（需设置 `use-text-slot`） |

### GridItem 类型定义

```typescript
type LinkType = 'navigateTo' | 'switchTab' | 'reLaunch' | 'redirectTo'
type BadgeType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface GridItem {
  icon?: string
  iconSize?: string
  iconColor?: string
  text?: string
  url?: string
  linkType?: LinkType
  useSlot?: boolean
  useIconSlot?: boolean
  useTextSlot?: boolean
  isDot?: boolean
  type?: BadgeType
  value?: string | number
  max?: number
  [key: string]: any
}
```

---

## Row/Col 栅格

栅格系统采用 24 列布局，通过 `wd-row` 和 `wd-col` 组件实现灵活的弹性布局。

### 基本用法

```vue
<template>
  <wd-row>
    <wd-col :span="24">span: 24</wd-col>
  </wd-row>

  <wd-row>
    <wd-col :span="12">span: 12</wd-col>
    <wd-col :span="12">span: 12</wd-col>
  </wd-row>

  <wd-row>
    <wd-col :span="8">span: 8</wd-col>
    <wd-col :span="8">span: 8</wd-col>
    <wd-col :span="8">span: 8</wd-col>
  </wd-row>
</template>

<style lang="scss" scoped>
.wd-col {
  text-align: center;
  padding: 20rpx 0;
  background: #39a9ed;
  color: #fff;
  &:nth-child(odd) {
    background: #66c6f2;
  }
}
</style>
```

### 列间距与偏移

```vue
<template>
  <!-- 列间距 -->
  <wd-row :gutter="20">
    <wd-col :span="8"><view class="col-content">span: 8</view></wd-col>
    <wd-col :span="8"><view class="col-content">span: 8</view></wd-col>
    <wd-col :span="8"><view class="col-content">span: 8</view></wd-col>
  </wd-row>

  <!-- 列偏移 -->
  <wd-row>
    <wd-col :span="12" :offset="6">offset: 6, span: 12</wd-col>
  </wd-row>

  <wd-row>
    <wd-col :span="6" :offset="6">offset: 6</wd-col>
    <wd-col :span="6" :offset="6">offset: 6</wd-col>
  </wd-row>
</template>
```

### 混合布局

```vue
<template>
  <wd-row :gutter="10">
    <wd-col :span="16"><view class="col-content">span: 16</view></wd-col>
    <wd-col :span="8"><view class="col-content">span: 8</view></wd-col>
  </wd-row>

  <wd-row :gutter="10">
    <wd-col :span="8"><view class="col-content">span: 8</view></wd-col>
    <wd-col :span="8"><view class="col-content">span: 8</view></wd-col>
    <wd-col :span="4" :offset="4"><view class="col-content">span: 4</view></wd-col>
  </wd-row>
</template>
```

### Row Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| gutter | 列间距，单位 px | `number` | `0` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Col Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| span | 列宽度（栅格数，1-24） | `number` | `24` |
| offset | 列偏移量（栅格数，0-24） | `number` | `0` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### 栅格系统说明

| span | 宽度 | span | 宽度 |
|------|------|------|------|
| 1 | 4.167% | 12 | 50% |
| 4 | 16.667% | 16 | 66.667% |
| 6 | 25% | 18 | 75% |
| 8 | 33.333% | 24 | 100% |

---

## Divider 分割线

分割线组件用于将内容分隔为多个区域，支持水平和垂直两种方向。

### 基本用法

```vue
<template>
  <view class="content">内容区域1</view>
  <wd-divider />
  <view class="content">内容区域2</view>

  <!-- 带文字分割线 -->
  <wd-divider>文字分割</wd-divider>
  <wd-divider content-position="left">左侧文字</wd-divider>
  <wd-divider content-position="right">右侧文字</wd-divider>

  <!-- 虚线分割 -->
  <wd-divider dashed>虚线分割</wd-divider>
</template>
```

### 垂直分割线

```vue
<template>
  <view class="inline-content">
    <text>文字</text>
    <wd-divider vertical />
    <text>文字</text>
    <wd-divider vertical />
    <text>文字</text>
  </view>
</template>

<style lang="scss" scoped>
.inline-content {
  display: flex;
  align-items: center;
}
</style>
```

### 自定义颜色

```vue
<template>
  <wd-divider color="#1989fa">蓝色分割线</wd-divider>
  <wd-divider color="#07c160">绿色分割线</wd-divider>
  <wd-divider color="#ee0a24">红色分割线</wd-divider>
</template>
```

### Divider Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| content-position | 文字位置 | `'left' \| 'center' \| 'right'` | `'center'` |
| dashed | 是否为虚线 | `boolean` | `false` |
| vertical | 是否为垂直分割线 | `boolean` | `false` |
| hairline | 是否为 0.5px 细线 | `boolean` | `true` |
| color | 分割线颜色 | `string` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Divider Slots

| 名称 | 说明 |
|------|------|
| default | 分割线文字内容 |

---

## Gap 间距

间距组件用于设置元素之间的间距，可替代 margin 或 padding，也可作为底部占位元素。

### 基本用法

```vue
<template>
  <view class="content">内容1</view>
  <wd-gap height="20rpx" />
  <view class="content">内容2</view>
  <wd-gap height="40rpx" bg-color="#f5f5f5" />
  <view class="content">内容3</view>
</template>
```

### 底部安全区

```vue
<template>
  <view class="page">
    <view class="content">页面内容</view>
    <!-- 底部占位，适配底部安全区 -->
    <wd-gap height="100rpx" safe-area-bottom />
  </view>
</template>
```

### 作为分隔区域

```vue
<template>
  <view class="card">卡片1</view>
  <wd-gap height="24rpx" bg-color="#f8f8f8" />
  <view class="card">卡片2</view>
  <wd-gap height="24rpx" bg-color="#f8f8f8" />
  <view class="card">卡片3</view>
</template>
```

### Gap Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| height | 间距高度，支持 rpx/px 单位 | `string \| number` | `15` |
| bg-color | 背景颜色 | `string` | `'transparent'` |
| safe-area-bottom | 是否开启底部安全区适配 | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

---

## Sticky 吸顶

粘性布局组件，用于在页面滚动时将元素固定在指定位置。基于 `IntersectionObserver` API 实现。

### 基本用法

```vue
<template>
  <wd-sticky>
    <view class="sticky-header">吸顶内容</view>
  </wd-sticky>

  <!-- 设置吸顶距离 -->
  <wd-sticky :offset-top="50">
    <view class="sticky-header">距顶部 50px 时吸顶</view>
  </wd-sticky>

  <!-- 设置层级 -->
  <wd-sticky :z-index="100">
    <view class="sticky-header">高层级吸顶</view>
  </wd-sticky>
</template>

<style lang="scss" scoped>
.sticky-header {
  padding: 20rpx;
  background: #1989fa;
  color: #fff;
  text-align: center;
}
</style>
```

### 配合导航栏使用

```vue
<template>
  <wd-sticky>
    <wd-navbar title="标题" left-arrow />
  </wd-sticky>
  <view class="content">
    <view v-for="i in 50" :key="i" class="item">内容项 {{ i }}</view>
  </view>
</template>
```

### 吸顶容器

```vue
<template>
  <wd-sticky-box>
    <wd-sticky>
      <view class="sticky-header">在容器内吸顶</view>
    </wd-sticky>
    <view class="content">
      <view v-for="i in 20" :key="i" class="item">内容项 {{ i }}</view>
    </view>
  </wd-sticky-box>
</template>
```

### Sticky Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| offset-top | 吸顶距离，单位 px | `number` | `0` |
| z-index | 吸顶时的层级 | `number` | `1` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Sticky 注意事项

1. **H5 端适配**：组件会自动计算 H5 端导航栏高度（44px）
2. **性能优化**：基于 `IntersectionObserver` API，不会造成页面卡顿
3. **动态内容**：当吸顶内容尺寸发生变化时，组件会自动重新计算
4. **嵌套使用**：可以与 `wd-sticky-box` 配合使用，实现容器内吸顶

---

## 最佳实践

### 1. 宫格布局

```vue
<template>
  <!-- 推荐：数据驱动，适合动态数据 -->
  <wd-grid :items="menuItems" :column="4" clickable @item-click="handleMenuClick" />
</template>

<script lang="ts" setup>
const menuItems = computed(() => {
  return userPermissions.value.map(item => ({
    icon: item.icon,
    text: item.name,
    url: item.path,
    isDot: item.hasNew,
  }))
})
</script>
```

### 2. 栅格系统

```vue
<template>
  <!-- 推荐：使用 gutter 统一管理列间距 -->
  <wd-row :gutter="20">
    <wd-col :span="12"><view class="card">内容1</view></wd-col>
    <wd-col :span="12"><view class="card">内容2</view></wd-col>
  </wd-row>
</template>

<style lang="scss" scoped>
.card {
  /* 不需要额外设置 margin */
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}
</style>
```

### 3. 分割线使用

```vue
<template>
  <!-- 列表项分割 -->
  <view class="list">
    <view class="list-item">项目1</view>
    <wd-divider />
    <view class="list-item">项目2</view>
  </view>

  <!-- 行内文字分割 -->
  <view class="links">
    <text>首页</text>
    <wd-divider vertical />
    <text>关于我们</text>
  </view>
</template>
```

### 4. 吸顶组件

```vue
<template>
  <wd-sticky :z-index="99">
    <view class="sticky-nav">
      <wd-tabs v-model="activeTab">
        <wd-tab title="推荐" />
        <wd-tab title="热门" />
        <wd-tab title="最新" />
      </wd-tabs>
    </view>
  </wd-sticky>
</template>
```

---

## 常见问题

### 1. 宫格项无法点击跳转

**原因**：未设置 `clickable` 属性、`url` 格式不正确、`linkType` 与页面类型不匹配

```vue
<template>
  <!-- 确保设置 clickable，tabBar 页面用 switchTab -->
  <wd-grid :column="4" clickable>
    <wd-grid-item icon="home" text="首页" url="/pages/index/index" link-type="switchTab" />
    <wd-grid-item icon="detail" text="详情" url="/pages/detail/index" link-type="navigateTo" />
  </wd-grid>
</template>
```

### 2. 栅格列宽度不正确

**原因**：span 总和超过 24、Col 未放在 Row 内、存在额外的 margin

```vue
<template>
  <!-- span 总和必须等于或小于 24 -->
  <wd-row :gutter="10">
    <wd-col :span="8">1/3</wd-col>
    <wd-col :span="8">1/3</wd-col>
    <wd-col :span="8">1/3</wd-col>
  </wd-row>
</template>

<style lang="scss" scoped>
/* 避免给 wd-col 设置额外的宽度相关样式 */
</style>
```

### 3. 吸顶组件不生效

**原因**：页面未产生滚动、父元素设置了 `overflow: hidden`、层级被遮挡

```vue
<template>
  <view class="page">
    <wd-sticky :z-index="99">
      <view class="header">吸顶内容</view>
    </wd-sticky>
    <!-- 确保有足够的内容产生滚动 -->
    <view class="content" style="height: 2000rpx;">长内容区域</view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  /* 不要设置 overflow: hidden */
  min-height: 100vh;
}
</style>
```

### 4. 分割线在暗黑模式下不可见

```vue
<template>
  <wd-divider :color="isDark ? '#4a4a4a' : '#ebedf0'">分割线</wd-divider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'
const { isDark } = useTheme()
</script>
```

### 5. Gap 组件高度不生效

```vue
<template>
  <!-- 明确指定单位 -->
  <wd-gap height="40rpx" />
  <!-- 或使用数字（默认 px） -->
  <wd-gap :height="20" />
</template>
```

---

## 主题定制

```scss
// Grid 宫格
$-grid-item-fs: 24rpx;
$-grid-item-padding: 32rpx 16rpx;
$-grid-item-bg: #fff;
$-grid-item-border-color: #ebedf0;
$-grid-item-hover-bg: #f2f3f5;

// Divider 分割线
$-divider-margin: 32rpx 0;
$-divider-color: #969799;
$-divider-fs: 28rpx;
$-divider-line-color: #ebedf0;
$-divider-line-height: 1px;
```
