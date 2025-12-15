# SwipeAction 滑动操作

## 介绍

SwipeAction 是一个滑动操作组件,常用于单元格左右滑动删除等手势操作场景。该组件支持左滑和右滑两个方向,可以在滑动后展示操作按钮,广泛应用于列表项的编辑、删除、收藏等快捷操作。

**核心特性:**

- **双向滑动** - 支持左滑和右滑两个方向,可分别配置不同的操作按钮
- **双向绑定** - 支持 v-model 控制滑动状态,可手动打开或关闭
- **关闭前钩子** - 支持 beforeClose 钩子函数,可在关闭前进行拦截处理
- **自动关闭** - 点击内容区域或其他滑动组件时自动关闭当前展开的操作
- **平滑动画** - 采用 CSS3 transform 实现流畅的滑动动画效果
- **阈值控制** - 滑动超过 30% 阈值才会展开操作按钮,避免误触
- **禁用状态** - 支持禁用滑动操作,适用于特殊场景
- **自定义内容** - 通过插槽完全自定义内容区域和操作按钮
- **队列管理** - 支持全局队列管理,同时只展开一个滑动操作

## 基本用法

### 基础用法

最基础的用法,右滑显示删除按钮:

```vue
<template>
  <view class="demo">
    <wd-swipe-action>
      <wd-cell title="标题文字" value="内容" />
      <template #right>
        <view class="action-btn delete">删除</view>
      </template>
    </wd-swipe-action>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 100%;
  font-size: 28rpx;
  color: #fff;

  &.delete {
    background: #ff4d4f;
  }
}
</style>
```

**使用说明:**

- 将需要滑动的内容放在默认插槽中
- 右侧操作按钮放在 `right` 插槽中
- 组件会自动计算按钮宽度

### 左侧操作

通过 `left` 插槽设置左侧操作按钮:

```vue
<template>
  <view class="demo">
    <wd-swipe-action>
      <template #left>
        <view class="action-btn collect">收藏</view>
      </template>
      <wd-cell title="左滑收藏" value="向右滑动显示收藏按钮" />
    </wd-swipe-action>
  </view>
</template>

<style lang="scss" scoped>
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 100%;
  font-size: 28rpx;
  color: #fff;

  &.collect {
    background: #ffc107;
  }
}
</style>
```

### 双向滑动

同时设置左右两侧操作按钮:

```vue
<template>
  <view class="demo">
    <wd-swipe-action>
      <template #left>
        <view class="action-btn collect">收藏</view>
        <view class="action-btn share">分享</view>
      </template>
      <wd-cell title="双向滑动" value="左右都可以滑动" />
      <template #right>
        <view class="action-btn edit">编辑</view>
        <view class="action-btn delete">删除</view>
      </template>
    </wd-swipe-action>
  </view>
</template>

<style lang="scss" scoped>
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 100%;
  font-size: 28rpx;
  color: #fff;

  &.collect {
    background: #ffc107;
  }

  &.share {
    background: #1890ff;
  }

  &.edit {
    background: #52c41a;
  }

  &.delete {
    background: #ff4d4f;
  }
}
</style>
```

### 控制滑动状态

通过 `v-model` 控制滑动状态:

```vue
<template>
  <view class="demo">
    <view class="buttons">
      <wd-button size="small" @click="state = 'left'">打开左侧</wd-button>
      <wd-button size="small" @click="state = 'right'">打开右侧</wd-button>
      <wd-button size="small" @click="state = 'close'">关闭</wd-button>
    </view>

    <wd-swipe-action v-model="state">
      <template #left>
        <view class="action-btn collect">收藏</view>
      </template>
      <wd-cell title="受控模式" :value="state" />
      <template #right>
        <view class="action-btn delete">删除</view>
      </template>
    </wd-swipe-action>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const state = ref<'left' | 'close' | 'right'>('close')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.buttons {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 100%;
  font-size: 28rpx;
  color: #fff;

  &.collect {
    background: #ffc107;
  }

  &.delete {
    background: #ff4d4f;
  }
}
</style>
```

**使用说明:**

- `v-model` 可选值: `'left'`(左侧展开)、`'close'`(关闭)、`'right'`(右侧展开)
- 可以通过修改绑定值来手动控制滑动状态

### 禁用滑动

通过 `disabled` 属性禁用滑动操作:

```vue
<template>
  <view class="demo">
    <wd-swipe-action disabled>
      <wd-cell title="禁用滑动" value="无法滑动操作" />
      <template #right>
        <view class="action-btn delete">删除</view>
      </template>
    </wd-swipe-action>
  </view>
</template>
```

### 点击事件

监听点击事件,获取点击位置:

```vue
<template>
  <view class="demo">
    <wd-swipe-action @click="handleClick">
      <wd-cell title="点击事件" value="点击任意位置查看" />
      <template #right>
        <view class="action-btn delete">删除</view>
      </template>
    </wd-swipe-action>
  </view>
</template>

<script lang="ts" setup>
const handleClick = (event: { value: string }) => {
  const position = event.value
  uni.showToast({
    title: `点击了: ${position}`,
    icon: 'none'
  })
}
</script>
```

**使用说明:**

- `click` 事件返回的 `value` 可能是:
  - `'left'` - 点击了左侧操作区域
  - `'right'` - 点击了右侧操作区域
  - `'inside'` - 点击了内容区域
- 点击后滑动操作会自动关闭

## 关闭前钩子

### 基本用法

通过 `beforeClose` 钩子可以在关闭前进行拦截:

```vue
<template>
  <view class="demo">
    <wd-swipe-action :before-close="beforeClose">
      <wd-cell title="关闭前确认" value="点击删除按钮会弹出确认" />
      <template #right>
        <view class="action-btn delete">删除</view>
      </template>
    </wd-swipe-action>
  </view>
</template>

<script lang="ts" setup>
import type { SwipeActionReason, SwipeActionPosition } from '@/wd/components/wd-swipe-action/wd-swipe-action.vue'

const beforeClose = (reason: SwipeActionReason, position: SwipeActionPosition) => {
  console.log('关闭原因:', reason)
  console.log('点击位置:', position)

  // 如果点击的是右侧按钮区域(删除按钮)
  if (position === 'right') {
    uni.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗?',
      success: (res) => {
        if (res.confirm) {
          // 用户确认删除
          console.log('执行删除操作')
        }
      }
    })
  }
}
</script>
```

**使用说明:**

- `beforeClose` 接收两个参数:
  - `reason` - 关闭原因: `'click'`(点击)、`'swipe'`(滑动)、`'value'`(值改变)
  - `position` - 点击位置: `'left'`、`'right'`、`'inside'`
- 钩子函数在操作按钮关闭前触发

### 异步确认删除

结合 MessageBox 实现异步确认删除:

```vue
<template>
  <view class="demo">
    <wd-swipe-action
      v-for="(item, index) in list"
      :key="item.id"
      :before-close="(reason, position) => beforeClose(reason, position, index)"
    >
      <wd-cell :title="item.title" :value="item.value" />
      <template #right>
        <view class="action-btn delete">删除</view>
      </template>
    </wd-swipe-action>

    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useMessage } from '@/wd/components/wd-message-box/useMessage'
import type { SwipeActionReason, SwipeActionPosition } from '@/wd/components/wd-swipe-action/wd-swipe-action.vue'

const message = useMessage()

const list = ref([
  { id: 1, title: '项目一', value: '内容一' },
  { id: 2, title: '项目二', value: '内容二' },
  { id: 3, title: '项目三', value: '内容三' }
])

const beforeClose = async (reason: SwipeActionReason, position: SwipeActionPosition, index: number) => {
  if (position === 'right') {
    const result = await message.confirm({
      title: '确认删除',
      msg: `确定要删除"${list.value[index].title}"吗?`
    })

    if (result.action === 'confirm') {
      list.value.splice(index, 1)
      uni.showToast({ title: '删除成功', icon: 'success' })
    }
  }
}
</script>
```

## 列表场景

### 基本列表

在列表中使用滑动操作:

```vue
<template>
  <view class="demo">
    <wd-swipe-action
      v-for="(item, index) in list"
      :key="item.id"
      @click="(e) => handleClick(e, index)"
    >
      <wd-cell :title="item.title" :label="item.desc" />
      <template #right>
        <view class="action-btn edit" @click.stop="handleEdit(index)">编辑</view>
        <view class="action-btn delete" @click.stop="handleDelete(index)">删除</view>
      </template>
    </wd-swipe-action>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const list = ref([
  { id: 1, title: '消息标题一', desc: '这是消息描述内容' },
  { id: 2, title: '消息标题二', desc: '这是消息描述内容' },
  { id: 3, title: '消息标题三', desc: '这是消息描述内容' }
])

const handleClick = (event: { value: string }, index: number) => {
  if (event.value === 'inside') {
    uni.showToast({ title: `点击了第 ${index + 1} 项`, icon: 'none' })
  }
}

const handleEdit = (index: number) => {
  uni.showToast({ title: `编辑第 ${index + 1} 项`, icon: 'none' })
}

const handleDelete = (index: number) => {
  list.value.splice(index, 1)
  uni.showToast({ title: '删除成功', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 100%;
  font-size: 28rpx;
  color: #fff;

  &.edit {
    background: #52c41a;
  }

  &.delete {
    background: #ff4d4f;
  }
}
</style>
```

**使用说明:**

- 在操作按钮上使用 `@click.stop` 阻止事件冒泡
- 这样可以分别处理点击内容和点击按钮的逻辑

### 购物车场景

购物车列表中的滑动删除:

```vue
<template>
  <view class="cart-list">
    <wd-swipe-action
      v-for="(item, index) in cartList"
      :key="item.id"
      :before-close="(reason, position) => beforeClose(reason, position, index)"
    >
      <view class="cart-item">
        <image class="cart-item__image" :src="item.image" mode="aspectFill" />
        <view class="cart-item__info">
          <text class="cart-item__title">{{ item.title }}</text>
          <text class="cart-item__price">¥{{ item.price }}</text>
        </view>
        <view class="cart-item__quantity">
          <wd-input-number v-model="item.quantity" :min="1" :max="99" />
        </view>
      </view>
      <template #right>
        <view class="action-btn collect">收藏</view>
        <view class="action-btn delete">删除</view>
      </template>
    </wd-swipe-action>

    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const cartList = ref([
  {
    id: 1,
    title: '商品名称一',
    price: 99.00,
    quantity: 1,
    image: 'https://example.com/product1.jpg'
  },
  {
    id: 2,
    title: '商品名称二',
    price: 199.00,
    quantity: 2,
    image: 'https://example.com/product2.jpg'
  }
])

const beforeClose = async (reason: string, position: string, index: number) => {
  if (position === 'right') {
    const result = await message.confirm({
      title: '确认删除',
      msg: '确定要删除该商品吗?'
    })

    if (result.action === 'confirm') {
      cartList.value.splice(index, 1)
      uni.showToast({ title: '删除成功', icon: 'success' })
    }
  }
}
</script>

<style lang="scss" scoped>
.cart-list {
  background: #fff;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 24rpx;

  &__image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 8rpx;
  }

  &__info {
    flex: 1;
    margin-left: 24rpx;

    .cart-item__title {
      font-size: 28rpx;
      color: #333;
    }

    .cart-item__price {
      font-size: 32rpx;
      color: #ff4d4f;
      margin-top: 16rpx;
    }
  }
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 100%;
  font-size: 28rpx;
  color: #fff;

  &.collect {
    background: #ffc107;
  }

  &.delete {
    background: #ff4d4f;
  }
}
</style>
```

### 消息列表场景

消息列表中的滑动操作:

```vue
<template>
  <view class="message-list">
    <wd-swipe-action
      v-for="(item, index) in messages"
      :key="item.id"
    >
      <template #left>
        <view class="action-btn read" @click.stop="markAsRead(index)">
          {{ item.isRead ? '标记未读' : '标记已读' }}
        </view>
      </template>
      <view class="message-item" :class="{ 'is-unread': !item.isRead }">
        <view class="message-item__avatar">
          <image :src="item.avatar" mode="aspectFill" />
        </view>
        <view class="message-item__content">
          <view class="message-item__header">
            <text class="message-item__name">{{ item.name }}</text>
            <text class="message-item__time">{{ item.time }}</text>
          </view>
          <text class="message-item__text">{{ item.content }}</text>
        </view>
      </view>
      <template #right>
        <view class="action-btn pin" @click.stop="togglePin(index)">
          {{ item.isPinned ? '取消置顶' : '置顶' }}
        </view>
        <view class="action-btn delete" @click.stop="deleteMessage(index)">删除</view>
      </template>
    </wd-swipe-action>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Message {
  id: number
  name: string
  avatar: string
  content: string
  time: string
  isRead: boolean
  isPinned: boolean
}

const messages = ref<Message[]>([
  {
    id: 1,
    name: '张三',
    avatar: 'https://example.com/avatar1.jpg',
    content: '你好,明天有空吗?',
    time: '10:30',
    isRead: false,
    isPinned: true
  },
  {
    id: 2,
    name: '李四',
    avatar: 'https://example.com/avatar2.jpg',
    content: '收到,我已经处理好了',
    time: '昨天',
    isRead: true,
    isPinned: false
  }
])

const markAsRead = (index: number) => {
  messages.value[index].isRead = !messages.value[index].isRead
}

const togglePin = (index: number) => {
  messages.value[index].isPinned = !messages.value[index].isPinned
}

const deleteMessage = (index: number) => {
  messages.value.splice(index, 1)
}
</script>

<style lang="scss" scoped>
.message-item {
  display: flex;
  padding: 24rpx;
  background: #fff;

  &.is-unread {
    background: #f0f8ff;
  }

  &__avatar {
    image {
      width: 96rpx;
      height: 96rpx;
      border-radius: 50%;
    }
  }

  &__content {
    flex: 1;
    margin-left: 24rpx;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__name {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
  }

  &__time {
    font-size: 24rpx;
    color: #999;
  }

  &__text {
    font-size: 26rpx;
    color: #666;
    margin-top: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 160rpx;
  padding: 0 24rpx;
  height: 100%;
  font-size: 26rpx;
  color: #fff;

  &.read {
    background: #1890ff;
  }

  &.pin {
    background: #ffc107;
  }

  &.delete {
    background: #ff4d4f;
  }
}
</style>
```

## 高级用法

### 自定义按钮样式

完全自定义操作按钮的样式:

```vue
<template>
  <view class="demo">
    <wd-swipe-action>
      <wd-cell title="自定义按钮" value="图标按钮" />
      <template #right>
        <view class="icon-btn edit">
          <wd-icon name="edit" size="40rpx" color="#fff" />
        </view>
        <view class="icon-btn delete">
          <wd-icon name="delete" size="40rpx" color="#fff" />
        </view>
      </template>
    </wd-swipe-action>
  </view>
</template>

<style lang="scss" scoped>
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 100%;

  &.edit {
    background: #52c41a;
  }

  &.delete {
    background: #ff4d4f;
  }
}
</style>
```

### 结合 ref 调用方法

通过 ref 获取组件实例调用方法:

```vue
<template>
  <view class="demo">
    <wd-button @click="closeSwipe">关闭滑动操作</wd-button>

    <wd-swipe-action ref="swipeRef" v-model="state">
      <wd-cell title="通过 ref 调用" value="点击按钮关闭" />
      <template #right>
        <view class="action-btn delete">删除</view>
      </template>
    </wd-swipe-action>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SwipeActionInstance } from '@/wd/components/wd-swipe-action/wd-swipe-action.vue'

const swipeRef = ref<SwipeActionInstance>()
const state = ref<'left' | 'close' | 'right'>('right')

const closeSwipe = () => {
  swipeRef.value?.close('click', 'inside')
}
</script>
```

### 自动关闭其他

当打开一个滑动操作时,自动关闭其他已展开的滑动操作(这是默认行为):

```vue
<template>
  <view class="demo">
    <text class="tip">滑动任意一个,其他会自动关闭</text>

    <wd-swipe-action v-for="i in 3" :key="i">
      <wd-cell :title="`项目 ${i}`" value="滑动我" />
      <template #right>
        <view class="action-btn delete">删除</view>
      </template>
    </wd-swipe-action>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.tip {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 24rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 100%;
  font-size: 28rpx;
  color: #fff;
  background: #ff4d4f;
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 滑动状态 | `'left' \| 'close' \| 'right'` | `'close'` |
| disabled | 是否禁用滑动 | `boolean` | `false` |
| before-close | 关闭前的钩子函数 | `(reason: SwipeActionReason, position: SwipeActionPosition) => void` | - |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击时触发 | `{ value: SwipeActionPosition }` |
| update:modelValue | 状态变化时触发 | `value: SwipeActionStatus` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 内容区域 |
| left | 左侧操作按钮区域 |
| right | 右侧操作按钮区域 |

### Methods

通过 ref 可以获取到组件实例并调用以下方法:

| 方法名 | 说明 | 参数 |
|--------|------|------|
| close | 关闭滑动操作 | `(reason: SwipeActionReason, position?: SwipeActionPosition) => void` |

### 类型定义

```typescript
/**
 * 滑动操作状态类型
 */
export type SwipeActionStatus = 'left' | 'close' | 'right'

/**
 * 滑动操作原因类型
 */
export type SwipeActionReason = 'click' | 'swipe' | 'value'

/**
 * 滑动操作位置类型
 */
export type SwipeActionPosition = 'left' | 'close' | 'right' | 'inside'

/**
 * 关闭前回调函数类型
 */
export type SwipeActionBeforeClose = (
  reason: SwipeActionReason,
  position: SwipeActionPosition
) => void

/**
 * 滑动操作组件实例类型
 */
export type SwipeActionInstance = {
  close: (reason: SwipeActionReason, position?: SwipeActionPosition) => void
}
```

## 主题定制

### 自定义操作按钮样式

操作按钮的样式完全由用户自定义,以下是推荐的样式示例:

```scss
// 基础按钮样式
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;        // 按钮宽度
  height: 100%;         // 高度撑满
  font-size: 28rpx;     // 字体大小
  color: #fff;          // 文字颜色
}

// 删除按钮
.action-btn.delete {
  background: #ff4d4f;
}

// 编辑按钮
.action-btn.edit {
  background: #52c41a;
}

// 收藏按钮
.action-btn.collect {
  background: #ffc107;
}

// 分享按钮
.action-btn.share {
  background: #1890ff;
}
```

### 图标按钮样式

```scss
// 图标按钮
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 100%;
}

// 带文字的图标按钮
.icon-text-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 100%;

  .icon {
    margin-bottom: 8rpx;
  }

  .text {
    font-size: 24rpx;
  }
}
```

## 最佳实践

### 1. 操作按钮的设计

```vue
<!-- ✅ 按钮顺序:优先级低的在前,高的在后 -->
<template #right>
  <view class="action-btn edit">编辑</view>
  <view class="action-btn delete">删除</view>
</template>

<!-- ✅ 使用明确的颜色区分操作类型 -->
<template #right>
  <view class="action-btn" style="background: #52c41a">安全操作</view>
  <view class="action-btn" style="background: #ff4d4f">危险操作</view>
</template>

<!-- ❌ 避免放置过多按钮 -->
<template #right>
  <view class="action-btn">按钮1</view>
  <view class="action-btn">按钮2</view>
  <view class="action-btn">按钮3</view>
  <view class="action-btn">按钮4</view> <!-- 太多了! -->
</template>
```

### 2. 危险操作的确认

对于删除等不可逆操作,建议使用 beforeClose 进行确认:

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

// ✅ 危险操作需要确认
const beforeClose = async (reason: string, position: string) => {
  if (position === 'right') {
    const result = await message.confirm({
      title: '确认删除',
      msg: '删除后无法恢复,是否继续?'
    })

    if (result.action === 'confirm') {
      // 执行删除
    }
  }
}
</script>
```

### 3. 列表项的事件处理

```vue
<template>
  <wd-swipe-action @click="handleSwipeClick">
    <wd-cell title="列表项" @click="handleCellClick" />
    <template #right>
      <!-- ✅ 使用 @click.stop 阻止冒泡 -->
      <view class="action-btn" @click.stop="handleDelete">删除</view>
    </template>
  </wd-swipe-action>
</template>

<script lang="ts" setup>
// SwipeAction 的点击事件 - 展开状态下点击会关闭
const handleSwipeClick = (e: { value: string }) => {
  console.log('SwipeAction 点击:', e.value)
}

// Cell 的点击事件 - 关闭状态下点击跳转详情
const handleCellClick = () => {
  uni.navigateTo({ url: '/pages/detail' })
}

// 删除按钮点击 - 执行删除操作
const handleDelete = () => {
  // 删除逻辑
}
</script>
```

### 4. 状态管理

```vue
<script lang="ts" setup>
import { ref, watch } from 'vue'

const swipeState = ref<'left' | 'close' | 'right'>('close')

// ✅ 监听状态变化
watch(swipeState, (newState) => {
  if (newState !== 'close') {
    // 展开时可以做一些处理
    console.log(`展开了 ${newState} 侧`)
  }
})

// ✅ 某些条件下禁止展开
const canSwipe = computed(() => {
  return !isEditing.value && !isLoading.value
})
</script>

<template>
  <wd-swipe-action
    v-model="swipeState"
    :disabled="!canSwipe"
  >
    <!-- ... -->
  </wd-swipe-action>
</template>
```

## 常见问题

### 1. 滑动操作无法触发

**问题原因:**
- 组件被设置为 disabled
- 没有设置 left 或 right 插槽内容
- 父容器阻止了触摸事件

**解决方案:**

```vue
<!-- ✅ 确保有操作按钮 -->
<wd-swipe-action>
  <wd-cell title="内容" />
  <template #right>
    <view class="action-btn">操作</view>
  </template>
</wd-swipe-action>

<!-- ✅ 检查 disabled 属性 -->
<wd-swipe-action :disabled="false">
  <!-- ... -->
</wd-swipe-action>
```

### 2. 点击按钮同时触发了内容点击

**问题原因:**
- 没有在操作按钮上阻止事件冒泡

**解决方案:**

```vue
<template #right>
  <!-- ✅ 使用 @click.stop -->
  <view class="action-btn" @click.stop="handleDelete">删除</view>
</template>
```

### 3. 多个滑动操作无法同时展开

**说明:**
这是组件的默认行为,同时只能展开一个滑动操作。如果需要同时展开多个,可以使用队列管理。

### 4. 滑动不够流畅

**问题原因:**
- 内容区域过于复杂
- 存在大量计算或渲染

**解决方案:**

```vue
<!-- ✅ 简化内容结构 -->
<wd-swipe-action>
  <view class="simple-item">
    <text>{{ item.title }}</text>
  </view>
  <template #right>
    <view class="action-btn">删除</view>
  </template>
</wd-swipe-action>

<!-- ✅ 使用虚拟列表处理大量数据 -->
```

### 5. beforeClose 无法阻止关闭

**说明:**
`beforeClose` 是一个回调函数,用于在关闭时执行额外操作,但不能阻止关闭。如果需要阻止关闭,应该通过 v-model 手动控制状态。

```vue
<script lang="ts" setup>
const state = ref<'left' | 'close' | 'right'>('close')

// ✅ 手动控制状态来"阻止"关闭
const beforeClose = (reason: string, position: string) => {
  if (shouldPreventClose) {
    // 重新设置为展开状态
    state.value = 'right'
  }
}
</script>
```
