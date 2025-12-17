---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/tooltip
---

# Tooltip 文字提示

## 介绍

Tooltip 文字提示组件用于展示简短的提示信息,常用于解释图标、按钮等元素的含义。组件支持多种弹出位置和自定义内容,提供了灵活的提示展示方案。

**核心特性:**

- **多方位弹出** - 支持 12 种弹出位置
- **自定义内容** - 支持文本内容和插槽自定义
- **箭头指示** - 可选的箭头指示器
- **受控模式** - 支持 v-model 控制显示状态
- **关闭按钮** - 可选的内置关闭按钮

## 基本用法

### 基础用法

通过 `content` 属性设置提示内容。

```vue
<template>
  <wd-tooltip content="这是一段提示文字">
    <wd-button>点击显示提示</wd-button>
  </wd-tooltip>
</template>
```

### 弹出位置

通过 `placement` 设置弹出位置,支持 12 种方向。

```vue
<template>
  <wd-tooltip content="顶部提示" placement="top">
    <wd-button>上</wd-button>
  </wd-tooltip>

  <wd-tooltip content="底部提示" placement="bottom">
    <wd-button>下</wd-button>
  </wd-tooltip>

  <wd-tooltip content="左侧提示" placement="left">
    <wd-button>左</wd-button>
  </wd-tooltip>

  <wd-tooltip content="右侧提示" placement="right">
    <wd-button>右</wd-button>
  </wd-tooltip>
</template>
```

### 受控模式

通过 `v-model` 控制提示的显示状态。

```vue
<template>
  <wd-tooltip v-model="show" content="受控模式提示">
    <wd-button>{{ show ? '隐藏' : '显示' }}</wd-button>
  </wd-tooltip>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
</script>
```

### 显示关闭按钮

设置 `show-close` 显示关闭按钮。

```vue
<template>
  <wd-tooltip content="点击关闭按钮可以关闭提示" show-close>
    <wd-button>显示带关闭按钮的提示</wd-button>
  </wd-tooltip>
</template>
```

### 隐藏箭头

设置 `visible-arrow` 为 `false` 隐藏箭头。

```vue
<template>
  <wd-tooltip content="没有箭头的提示" :visible-arrow="false">
    <wd-button>无箭头提示</wd-button>
  </wd-tooltip>
</template>
```

### 偏移量

通过 `offset` 设置弹出位置的偏移量。

```vue
<template>
  <!-- 数字偏移 -->
  <wd-tooltip content="偏移10px" :offset="10">
    <wd-button>数字偏移</wd-button>
  </wd-tooltip>

  <!-- 对象偏移 -->
  <wd-tooltip content="X轴偏移20,Y轴偏移10" :offset="{ x: 20, y: 10 }">
    <wd-button>对象偏移</wd-button>
  </wd-tooltip>
</template>
```

### 自定义内容

通过 `content` 插槽自定义提示内容。

```vue
<template>
  <wd-tooltip use-content-slot>
    <template #content>
      <view class="custom-content">
        <wd-icon name="info-circle" />
        <text>自定义图标提示</text>
      </view>
    </template>
    <wd-button>自定义内容</wd-button>
  </wd-tooltip>
</template>

<style lang="scss" scoped>
.custom-content {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
</style>
```

### 禁用状态

设置 `disabled` 禁用 Tooltip。

```vue
<template>
  <wd-tooltip content="禁用状态下不会显示" disabled>
    <wd-button>禁用的提示</wd-button>
  </wd-tooltip>
</template>
```

### 方法调用

通过 ref 获取组件实例,调用 open/close 方法。

```vue
<template>
  <wd-tooltip ref="tooltipRef" content="通过方法控制">
    <wd-button>目标元素</wd-button>
  </wd-tooltip>
  <wd-button @click="handleOpen">打开</wd-button>
  <wd-button @click="handleClose">关闭</wd-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const tooltipRef = ref()

const handleOpen = () => {
  tooltipRef.value?.open()
}

const handleClose = () => {
  tooltipRef.value?.close()
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 是否显示 | `boolean` | `false` |
| content | 提示内容 | `string` | - |
| placement | 弹出位置 | `PlacementType` | `bottom` |
| offset | 偏移量 | `number \| number[] \| { x: number, y: number }` | `0` |
| visible-arrow | 是否显示箭头 | `boolean` | `true` |
| use-content-slot | 是否使用 content 插槽 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| show-close | 是否显示关闭按钮 | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |
| custom-arrow | 自定义箭头样式类 | `string` | - |
| custom-pop | 自定义弹出层样式类 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 显示状态变化时触发 | `{ show: boolean }` |
| open | 打开时触发 | - |
| close | 关闭时触发 | - |

### Slots

| 名称 | 说明 |
|------|------|
| default | 触发提示的元素 |
| content | 自定义提示内容 |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开提示 | - | - |
| close | 关闭提示 | - | - |

### 类型定义

```typescript
/**
 * 弹出位置类型
 */
type PlacementType =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-tooltip-bg | 背景颜色 | `rgba(0, 0, 0, 0.8)` |
| --wd-tooltip-color | 文字颜色 | `#ffffff` |
| --wd-tooltip-fs | 字体大小 | `28rpx` |
| --wd-tooltip-padding | 内边距 | `16rpx 24rpx` |
| --wd-tooltip-radius | 圆角 | `8rpx` |
| --wd-tooltip-line-height | 行高 | `40rpx` |
| --wd-tooltip-z-index | 层级 | `500` |

## 最佳实践

### 1. 图标说明

```vue
<template>
  <view class="icon-list">
    <wd-tooltip content="首页">
      <wd-icon name="home" size="48rpx" />
    </wd-tooltip>
    <wd-tooltip content="设置">
      <wd-icon name="setting" size="48rpx" />
    </wd-tooltip>
    <wd-tooltip content="帮助">
      <wd-icon name="help-circle" size="48rpx" />
    </wd-tooltip>
  </view>
</template>
```

### 2. 表单字段提示

```vue
<template>
  <wd-cell title="手机号">
    <template #title>
      <view class="cell-title">
        <text>手机号</text>
        <wd-tooltip content="用于接收验证码和找回密码">
          <wd-icon name="info-circle" size="32rpx" />
        </wd-tooltip>
      </view>
    </template>
    <wd-input v-model="phone" placeholder="请输入手机号" />
  </wd-cell>
</template>
```

### 3. 长内容提示

```vue
<template>
  <wd-tooltip use-content-slot show-close>
    <template #content>
      <view class="long-content">
        <view class="title">使用须知</view>
        <view class="desc">1. 请在有效期内使用</view>
        <view class="desc">2. 不可与其他优惠叠加</view>
        <view class="desc">3. 每个账号限用一次</view>
      </view>
    </template>
    <wd-button size="small">查看规则</wd-button>
  </wd-tooltip>
</template>
```

## 常见问题

### 1. Tooltip 不显示?

检查是否设置了 `disabled` 属性,以及内容是否为空。

### 2. 位置偏移不正确?

确保父容器没有设置 `overflow: hidden`,这可能会裁剪弹出层。

### 3. 如何在点击外部时关闭?

组件内置了点击外部关闭的功能,无需额外配置。

### 4. 多个 Tooltip 同时显示?

组件内置了队列管理,同一时间只会显示一个 Tooltip。
