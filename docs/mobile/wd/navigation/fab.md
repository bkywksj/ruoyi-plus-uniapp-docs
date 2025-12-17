---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/navigation/fab
---

# Fab 悬浮按钮

## 介绍

Fab 悬浮按钮(Floating Action Button)是一个悬浮在页面上的动作按钮,用于提供页面的主要操作入口。支持展开菜单、拖拽定位、磁吸边缘等功能。

**核心特性:**

- **多位置定位** - 支持 8 种预设位置
- **菜单展开** - 支持点击展开动作菜单
- **拖拽移动** - 支持拖拽改变位置
- **边缘磁吸** - 拖拽释放后自动吸附到边缘
- **自定义触发器** - 支持自定义按钮内容

## 基本用法

### 基础用法

```vue
<template>
  <wd-fab>
    <wd-button round type="success" size="small">
      <wd-icon name="edit" />
    </wd-button>
    <wd-button round type="warning" size="small">
      <wd-icon name="share" />
    </wd-button>
    <wd-button round type="error" size="small">
      <wd-icon name="delete" />
    </wd-button>
  </wd-fab>
</template>
```

### 位置配置

通过 `position` 属性设置悬浮按钮位置。

```vue
<template>
  <!-- 左上角 -->
  <wd-fab position="left-top" />

  <!-- 右上角 -->
  <wd-fab position="right-top" />

  <!-- 左下角 -->
  <wd-fab position="left-bottom" />

  <!-- 右下角(默认) -->
  <wd-fab position="right-bottom" />

  <!-- 左侧居中 -->
  <wd-fab position="left-center" />

  <!-- 右侧居中 -->
  <wd-fab position="right-center" />

  <!-- 顶部居中 -->
  <wd-fab position="top-center" />

  <!-- 底部居中 -->
  <wd-fab position="bottom-center" />
</template>
```

### 展开方向

通过 `direction` 属性设置菜单展开方向。

```vue
<template>
  <!-- 向上展开(默认) -->
  <wd-fab direction="top" />

  <!-- 向下展开 -->
  <wd-fab direction="bottom" />

  <!-- 向左展开 -->
  <wd-fab direction="left" />

  <!-- 向右展开 -->
  <wd-fab direction="right" />
</template>
```

### 按钮类型

通过 `type` 属性设置按钮类型。

```vue
<template>
  <wd-fab type="primary" />
  <wd-fab type="success" />
  <wd-fab type="warning" />
  <wd-fab type="error" />
  <wd-fab type="info" />
  <wd-fab type="default" />
</template>
```

### 自定义图标

通过 `inactive-icon` 和 `active-icon` 属性设置图标。

```vue
<template>
  <wd-fab inactive-icon="add" active-icon="close">
    <wd-button round size="small">操作1</wd-button>
    <wd-button round size="small">操作2</wd-button>
  </wd-fab>
</template>
```

### 可拖拽

设置 `draggable` 启用拖拽功能。

```vue
<template>
  <wd-fab draggable>
    <wd-button round size="small">操作</wd-button>
  </wd-fab>
</template>
```

### 不可展开

设置 `expandable` 为 `false` 禁用菜单展开,仅作为单一按钮使用。

```vue
<template>
  <wd-fab :expandable="false" @click="handleClick" />
</template>

<script lang="ts" setup>
const handleClick = () => {
  uni.showToast({ title: '点击了悬浮按钮', icon: 'none' })
}
</script>
```

### 禁用状态

设置 `disabled` 禁用悬浮按钮。

```vue
<template>
  <wd-fab disabled />
</template>
```

### 受控模式

通过 `v-model:active` 控制菜单展开状态。

```vue
<template>
  <wd-fab v-model:active="isActive">
    <wd-button round size="small">操作</wd-button>
  </wd-fab>
  <wd-button @click="isActive = !isActive">
    {{ isActive ? '收起' : '展开' }}
  </wd-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isActive = ref(false)
</script>
```

### 自定义间距

通过 `gap` 属性配置与边缘的间距。

```vue
<template>
  <wd-fab :gap="{ top: 100, right: 32, bottom: 100, left: 32 }" />
</template>
```

### 自定义触发器

通过 `trigger` 插槽自定义触发按钮。

```vue
<template>
  <wd-fab>
    <template #trigger>
      <view class="custom-trigger">
        <wd-icon name="customer-service" size="48rpx" color="#fff" />
      </view>
    </template>
    <wd-button round size="small">在线客服</wd-button>
    <wd-button round size="small">常见问题</wd-button>
  </wd-fab>
</template>

<style lang="scss" scoped>
.custom-trigger {
  width: 112rpx;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
}
</style>
```

### 方法调用

通过 ref 获取组件实例,调用 open/close 方法。

```vue
<template>
  <wd-fab ref="fabRef">
    <wd-button round size="small">操作</wd-button>
  </wd-fab>
  <wd-button @click="handleOpen">展开</wd-button>
  <wd-button @click="handleClose">收起</wd-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const fabRef = ref()

const handleOpen = () => fabRef.value?.open()
const handleClose = () => fabRef.value?.close()
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model:active | 是否激活(展开) | `boolean` | `false` |
| type | 按钮类型 | `'primary' \| 'success' \| 'info' \| 'warning' \| 'error' \| 'default'` | `primary` |
| position | 按钮位置 | `FabPosition` | `right-bottom` |
| direction | 菜单展开方向 | `'top' \| 'right' \| 'bottom' \| 'left'` | `top` |
| inactive-icon | 未激活时的图标 | `string` | `add` |
| active-icon | 激活时的图标 | `string` | `close` |
| disabled | 是否禁用 | `boolean` | `false` |
| draggable | 是否可拖拽 | `boolean` | `false` |
| expandable | 是否可展开菜单 | `boolean` | `true` |
| z-index | 层级 | `number` | `99` |
| gap | 与边缘的间距 | `FabGap` | `{}` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击按钮时触发(expandable为false时) | - |

### Slots

| 名称 | 说明 |
|------|------|
| default | 菜单内容 |
| trigger | 自定义触发按钮 |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 展开菜单 | - | - |
| close | 收起菜单 | - | - |

### 类型定义

```typescript
/**
 * 悬浮按钮位置
 */
type FabPosition =
  | 'left-top'
  | 'right-top'
  | 'left-bottom'
  | 'right-bottom'
  | 'left-center'
  | 'right-center'
  | 'top-center'
  | 'bottom-center'

/**
 * 悬浮按钮间距配置
 */
type FabGap = Partial<{
  top: number
  right: number
  bottom: number
  left: number
}>
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-fab-trigger-width | 触发按钮宽度 | `112rpx` |
| --wd-fab-trigger-height | 触发按钮高度 | `112rpx` |
| --wd-fab-icon-fs | 图标大小 | `48rpx` |
| --wd-fab-actions-padding | 菜单内边距 | `16rpx` |

## 最佳实践

### 1. 快捷操作菜单

```vue
<template>
  <wd-fab>
    <wd-button round type="primary" size="small" @click="handleAdd">
      <wd-icon name="add" />
    </wd-button>
    <wd-button round type="success" size="small" @click="handleScan">
      <wd-icon name="scan" />
    </wd-button>
    <wd-button round type="warning" size="small" @click="handleShare">
      <wd-icon name="share" />
    </wd-button>
  </wd-fab>
</template>

<script lang="ts" setup>
const handleAdd = () => {
  // 新增操作
}

const handleScan = () => {
  uni.scanCode({
    success: (res) => {
      console.log('扫码结果:', res)
    }
  })
}

const handleShare = () => {
  // 分享操作
}
</script>
```

### 2. 客服入口

```vue
<template>
  <wd-fab
    position="right-bottom"
    :expandable="false"
    @click="openCustomerService"
  >
    <template #trigger>
      <view class="service-btn">
        <wd-icon name="customer-service" color="#fff" size="44rpx" />
      </view>
    </template>
  </wd-fab>
</template>

<script lang="ts" setup>
const openCustomerService = () => {
  // 打开客服
}
</script>
```

### 3. 返回顶部

```vue
<template>
  <wd-fab
    v-if="showBackTop"
    position="right-bottom"
    type="default"
    :expandable="false"
    @click="scrollToTop"
  >
    <template #trigger>
      <view class="back-top-btn">
        <wd-icon name="arrow-up" />
      </view>
    </template>
  </wd-fab>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showBackTop = ref(false)

// 监听页面滚动
onPageScroll((e) => {
  showBackTop.value = e.scrollTop > 300
})

const scrollToTop = () => {
  uni.pageScrollTo({ scrollTop: 0, duration: 300 })
}
</script>
```

## 常见问题

### 1. 按钮位置不正确?

检查页面是否有影响定位的样式。组件使用 fixed 定位,确保父容器没有 transform 属性。

### 2. 拖拽后位置会重置?

拖拽位置不会持久化保存。如需保存位置,可以监听拖拽结束后的位置,存储到本地。

### 3. 多个 Fab 同时展开?

组件内置了队列管理,同一时间只会有一个 Fab 展开。
