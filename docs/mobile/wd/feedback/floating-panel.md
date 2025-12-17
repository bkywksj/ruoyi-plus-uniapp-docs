---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/floatingPanel
---

# FloatingPanel 浮动面板

## 介绍

FloatingPanel 浮动面板是一个浮动在页面底部的面板组件,用户可以通过上下拖动面板来浏览内容。这种交互模式常用于地图导航、音乐播放器等场景,在不离开当前视图的情况下访问更多信息。

**核心特性:**

- **拖拽交互** - 支持手势拖拽控制面板高度
- **锚点吸附** - 支持自定义锚点,释放后自动吸附
- **平滑动画** - 内置缓动动画,体验流畅
- **内容滚动** - 内容区域支持独立滚动
- **安全区域** - 支持底部安全区域适配

## 基本用法

### 基础用法

```vue
<template>
  <view class="page">
    <view class="content">页面内容</view>
    <wd-floating-panel>
      <view class="panel-content">
        <view v-for="i in 20" :key="i" class="panel-item">
          列表项 {{ i }}
        </view>
      </view>
    </wd-floating-panel>
  </view>
</template>

<style lang="scss" scoped>
.panel-content {
  padding: 32rpx;
}
.panel-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eee;
}
</style>
```

### 自定义锚点

通过 `anchors` 属性设置自定义锚点。

```vue
<template>
  <wd-floating-panel :anchors="[100, 300, 500]">
    <view class="panel-content">
      面板内容
    </view>
  </wd-floating-panel>
</template>
```

### 受控高度

通过 `v-model:height` 控制面板高度。

```vue
<template>
  <view class="controls">
    <wd-button @click="height = 100">收起</wd-button>
    <wd-button @click="height = 300">中间</wd-button>
    <wd-button @click="height = 500">展开</wd-button>
  </view>
  <wd-floating-panel v-model:height="height" :anchors="[100, 300, 500]">
    <view class="panel-content">
      当前高度: {{ height }}
    </view>
  </wd-floating-panel>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const height = ref(100)
</script>
```

### 监听高度变化

通过 `height-change` 事件监听高度变化。

```vue
<template>
  <wd-floating-panel
    :anchors="[100, 300, 500]"
    @height-change="handleHeightChange"
  >
    <view class="panel-content">面板内容</view>
  </wd-floating-panel>
</template>

<script lang="ts" setup>
const handleHeightChange = ({ height }) => {
  console.log('面板高度变化:', height)
}
</script>
```

### 安全区域适配

设置 `safe-area-inset-bottom` 适配底部安全区域。

```vue
<template>
  <wd-floating-panel safe-area-inset-bottom>
    <view class="panel-content">面板内容</view>
  </wd-floating-panel>
</template>
```

### 自定义动画时长

通过 `duration` 设置动画时长。

```vue
<template>
  <wd-floating-panel :duration="500">
    <view class="panel-content">面板内容</view>
  </wd-floating-panel>
</template>
```

### 禁用内容拖拽

设置 `content-draggable` 为 `false`,仅允许头部拖拽。

```vue
<template>
  <wd-floating-panel :content-draggable="false">
    <view class="panel-content">
      只能通过顶部拖拽条拖拽面板
    </view>
  </wd-floating-panel>
</template>
```

### 隐藏滚动条

设置 `show-scrollbar` 为 `false` 隐藏滚动条。

```vue
<template>
  <wd-floating-panel :show-scrollbar="false">
    <view class="panel-content">
      <view v-for="i in 20" :key="i">列表项 {{ i }}</view>
    </view>
  </wd-floating-panel>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model:height | 面板显示高度 | `number` | `0` |
| anchors | 自定义锚点数组 | `number[]` | `[100, windowHeight * 0.6]` |
| duration | 动画时长(毫秒) | `number \| string` | `300` |
| content-draggable | 是否允许内容区域拖拽 | `boolean` | `true` |
| safe-area-inset-bottom | 是否设置底部安全距离 | `boolean` | `false` |
| show-scrollbar | 是否显示滚动条 | `boolean` | `true` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:height | 高度更新时触发 | `height: number` |
| height-change | 高度变化完成时触发 | `{ height: number }` |

### Slots

| 名称 | 说明 |
|------|------|
| default | 面板内容 |

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-floating-panel-z-index | 面板层级 | `999` |
| --wd-floating-panel-radius | 面板圆角 | `32rpx` |
| --wd-floating-panel-bg | 面板背景色 | `#ffffff` |
| --wd-floating-panel-header-height | 头部高度 | `60rpx` |
| --wd-floating-panel-bar-width | 拖拽条宽度 | `40rpx` |
| --wd-floating-panel-bar-height | 拖拽条高度 | `6rpx` |
| --wd-floating-panel-bar-bg | 拖拽条背景色 | `#c0c4cc` |
| --wd-floating-panel-bar-radius | 拖拽条圆角 | `3rpx` |
| --wd-floating-panel-content-bg | 内容区背景色 | `#ffffff` |

## 最佳实践

### 1. 地图导航场景

```vue
<template>
  <view class="map-page">
    <!-- 地图区域 -->
    <map class="map" :latitude="latitude" :longitude="longitude" />

    <!-- 浮动面板 -->
    <wd-floating-panel
      :anchors="[150, 400]"
      safe-area-inset-bottom
    >
      <view class="route-info">
        <view class="destination">
          <text class="name">目的地名称</text>
          <text class="distance">3.2公里 · 约15分钟</text>
        </view>
        <view class="actions">
          <wd-button type="primary" block>开始导航</wd-button>
        </view>
        <view class="route-steps">
          <view v-for="step in steps" :key="step.id" class="step">
            {{ step.instruction }}
          </view>
        </view>
      </view>
    </wd-floating-panel>
  </view>
</template>
```

### 2. 音乐播放器

```vue
<template>
  <view class="music-page">
    <wd-floating-panel
      v-model:height="panelHeight"
      :anchors="[80, 400]"
    >
      <!-- 迷你播放条 -->
      <view v-if="panelHeight <= 100" class="mini-player">
        <image :src="currentSong.cover" class="cover" />
        <view class="info">
          <text class="title">{{ currentSong.title }}</text>
          <text class="artist">{{ currentSong.artist }}</text>
        </view>
        <wd-icon name="play" size="48rpx" @click="togglePlay" />
      </view>

      <!-- 完整播放器 -->
      <view v-else class="full-player">
        <image :src="currentSong.cover" class="cover-large" />
        <text class="title">{{ currentSong.title }}</text>
        <text class="artist">{{ currentSong.artist }}</text>
        <!-- 播放控制 -->
      </view>
    </wd-floating-panel>
  </view>
</template>
```

### 3. 商品详情

```vue
<template>
  <view class="product-page">
    <image :src="product.image" class="product-image" />

    <wd-floating-panel :anchors="[200, 500]">
      <view class="product-info">
        <view class="price">¥{{ product.price }}</view>
        <view class="title">{{ product.title }}</view>
        <view class="desc">{{ product.description }}</view>

        <view class="specs">
          <text class="label">规格</text>
          <view class="spec-list">
            <view
              v-for="spec in product.specs"
              :key="spec.id"
              class="spec-item"
            >
              {{ spec.name }}
            </view>
          </view>
        </view>

        <wd-button type="primary" block>加入购物车</wd-button>
      </view>
    </wd-floating-panel>
  </view>
</template>
```

## 常见问题

### 1. 面板无法拖动?

检查是否设置了正确的锚点,以及组件是否被其他元素遮挡。

### 2. 内容滚动与面板拖拽冲突?

组件已经处理了滚动与拖拽的冲突。如果仍有问题,可以尝试设置 `content-draggable` 为 `false`。

### 3. 如何实现完全收起?

将锚点数组的第一个值设置为 0:

```vue
<wd-floating-panel :anchors="[0, 300, 500]">
  ...
</wd-floating-panel>
```

### 4. 动画不流畅?

适当增加 `duration` 值,或检查页面是否有性能问题。
