---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/popover
---

# Popover 气泡

## 介绍

Popover 气泡组件用于展示弹出式的提示信息或操作菜单。相比 Tooltip,Popover 更适合展示复杂内容或操作列表,支持普通模式和菜单模式两种展示形式。

**核心特性:**

- **双模式支持** - 普通模式和菜单模式
- **多方位弹出** - 支持 12 种弹出位置
- **菜单图标** - 菜单项支持图标展示
- **自定义内容** - 支持插槽完全自定义
- **受控模式** - 支持 v-model 控制显示状态

## 基本用法

### 普通模式

默认为普通模式,通过 `content` 属性设置文本内容。

```vue
<template>
  <wd-popover content="这是一段普通文本提示">
    <wd-button>点击显示</wd-button>
  </wd-popover>
</template>
```

### 菜单模式

设置 `mode="menu"` 启用菜单模式,`content` 传入菜单项数组。

```vue
<template>
  <wd-popover mode="menu" :content="menuList" @menuclick="handleMenuClick">
    <wd-button>菜单模式</wd-button>
  </wd-popover>
</template>

<script lang="ts" setup>
const menuList = [
  { content: '选项一' },
  { content: '选项二' },
  { content: '选项三' }
]

const handleMenuClick = ({ item, index }) => {
  console.log('点击菜单项:', item, index)
}
</script>
```

### 带图标的菜单

菜单项支持 `iconClass` 属性设置图标。

```vue
<template>
  <wd-popover mode="menu" :content="iconMenuList" @menuclick="handleMenuClick">
    <wd-button>带图标菜单</wd-button>
  </wd-popover>
</template>

<script lang="ts" setup>
const iconMenuList = [
  { content: '编辑', iconClass: 'edit' },
  { content: '删除', iconClass: 'delete' },
  { content: '分享', iconClass: 'share' }
]

const handleMenuClick = ({ item, index }) => {
  uni.showToast({ title: item.content, icon: 'none' })
}
</script>
```

### 弹出位置

通过 `placement` 设置弹出位置。

```vue
<template>
  <wd-popover content="顶部弹出" placement="top">
    <wd-button>上</wd-button>
  </wd-popover>

  <wd-popover content="底部弹出" placement="bottom">
    <wd-button>下</wd-button>
  </wd-popover>

  <wd-popover content="左侧弹出" placement="left">
    <wd-button>左</wd-button>
  </wd-popover>

  <wd-popover content="右侧弹出" placement="right">
    <wd-button>右</wd-button>
  </wd-popover>
</template>
```

### 受控模式

通过 `v-model` 控制气泡的显示状态。

```vue
<template>
  <wd-popover v-model="visible" content="受控模式">
    <wd-button>{{ visible ? '点击关闭' : '点击打开' }}</wd-button>
  </wd-popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
</script>
```

### 显示关闭按钮

设置 `show-close` 显示关闭按钮。

```vue
<template>
  <wd-popover content="带关闭按钮的气泡" show-close>
    <wd-button>显示关闭按钮</wd-button>
  </wd-popover>
</template>
```

### 隐藏箭头

设置 `visible-arrow` 为 `false` 隐藏箭头。

```vue
<template>
  <wd-popover content="无箭头气泡" :visible-arrow="false">
    <wd-button>隐藏箭头</wd-button>
  </wd-popover>
</template>
```

### 自定义内容

通过 `content` 插槽自定义气泡内容。

```vue
<template>
  <wd-popover use-content-slot>
    <template #content>
      <view class="custom-popover">
        <image src="/static/avatar.png" class="avatar" />
        <view class="info">
          <text class="name">用户名</text>
          <text class="desc">这是个人简介</text>
        </view>
      </view>
    </template>
    <wd-button>自定义内容</wd-button>
  </wd-popover>
</template>

<style lang="scss" scoped>
.custom-popover {
  display: flex;
  align-items: center;
  padding: 16rpx;

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
  }

  .info {
    margin-left: 16rpx;

    .name {
      font-size: 28rpx;
      font-weight: bold;
    }

    .desc {
      font-size: 24rpx;
      color: #999;
    }
  }
}
</style>
```

### 禁用状态

设置 `disabled` 禁用气泡。

```vue
<template>
  <wd-popover content="禁用状态" disabled>
    <wd-button>禁用的气泡</wd-button>
  </wd-popover>
</template>
```

### 方法调用

通过 ref 获取组件实例,调用 open/close 方法。

```vue
<template>
  <wd-popover ref="popoverRef" content="方法控制">
    <wd-button>目标元素</wd-button>
  </wd-popover>
  <wd-button @click="handleOpen">打开</wd-button>
  <wd-button @click="handleClose">关闭</wd-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const popoverRef = ref()

const handleOpen = () => {
  popoverRef.value?.open()
}

const handleClose = () => {
  popoverRef.value?.close()
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 是否显示 | `boolean` | `false` |
| mode | 展示模式 | `'normal' \| 'menu'` | `normal` |
| content | 显示内容(普通模式为字符串,菜单模式为数组) | `string \| MenuItem[]` | - |
| placement | 弹出位置 | `PlacementType` | `bottom` |
| offset | 偏移量 | `number` | `0` |
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
| menuclick | 菜单项点击时触发(仅菜单模式) | `{ item: MenuItem, index: number }` |

### Slots

| 名称 | 说明 |
|------|------|
| default | 触发气泡的元素 |
| content | 自定义气泡内容 |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开气泡 | - | - |
| close | 关闭气泡 | - | - |

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

/**
 * 菜单项类型
 */
interface MenuItem {
  /** 菜单项内容 */
  content: string
  /** 图标类名 */
  iconClass?: string
}
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-popover-bg | 背景颜色 | `#ffffff` |
| --wd-popover-color | 文字颜色 | `#333333` |
| --wd-popover-fs | 字体大小 | `28rpx` |
| --wd-popover-padding | 内边距 | `24rpx` |
| --wd-popover-radius | 圆角 | `8rpx` |
| --wd-popover-line-height | 行高 | `40rpx` |
| --wd-popover-z-index | 层级 | `500` |
| --wd-popover-box-shadow | 阴影 | `0 4rpx 20rpx rgba(0, 0, 0, 0.1)` |

## 最佳实践

### 1. 操作菜单

```vue
<template>
  <wd-popover
    mode="menu"
    :content="actionMenu"
    placement="bottom-end"
    @menuclick="handleAction"
  >
    <wd-icon name="more" size="48rpx" />
  </wd-popover>
</template>

<script lang="ts" setup>
const actionMenu = [
  { content: '编辑', iconClass: 'edit' },
  { content: '复制', iconClass: 'copy' },
  { content: '删除', iconClass: 'delete' }
]

const handleAction = ({ item, index }) => {
  switch (index) {
    case 0:
      // 编辑
      break
    case 1:
      // 复制
      break
    case 2:
      // 删除
      break
  }
}
</script>
```

### 2. 用户信息卡片

```vue
<template>
  <wd-popover use-content-slot placement="bottom-start">
    <template #content>
      <view class="user-card">
        <image :src="userInfo.avatar" class="avatar" />
        <view class="info">
          <text class="name">{{ userInfo.name }}</text>
          <text class="role">{{ userInfo.role }}</text>
        </view>
        <wd-button size="small" type="primary" @click="handleFollow">
          关注
        </wd-button>
      </view>
    </template>
    <text class="username">@{{ userInfo.name }}</text>
  </wd-popover>
</template>
```

### 3. 筛选菜单

```vue
<template>
  <wd-popover
    mode="menu"
    :content="filterOptions"
    @menuclick="handleFilter"
  >
    <view class="filter-btn">
      <text>{{ currentFilter }}</text>
      <wd-icon name="arrow-down" />
    </view>
  </wd-popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const currentFilter = ref('全部')
const filterOptions = [
  { content: '全部' },
  { content: '待处理' },
  { content: '已完成' }
]

const handleFilter = ({ item }) => {
  currentFilter.value = item.content
}
</script>
```

## 常见问题

### 1. 菜单项点击后气泡不关闭?

组件默认点击菜单项后会自动关闭,如果没有关闭,检查是否阻止了事件冒泡。

### 2. 自定义内容样式不生效?

确保使用了 `use-content-slot` 属性,并在 `content` 插槽中添加内容。

### 3. 气泡位置不正确?

检查触发元素是否有正确的尺寸,以及父容器是否有 `overflow: hidden`。

### 4. 普通模式和菜单模式的区别?

- 普通模式: content 为字符串,适合展示简单文本
- 菜单模式: content 为数组,适合展示操作列表
