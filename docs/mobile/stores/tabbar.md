# Tabbar 标签栏状态

## 介绍

`useTabbarStore` 是 RuoYi-Plus-UniApp 移动端的底部标签栏状态管理模块，用于管理标签页的状态、徽标显示和页面跳转功能。通过统一的状态管理，实现标签页之间的平滑切换和消息徽标的动态更新。

**核心特性:**

- **标签页管理** - 统一管理底部标签页的配置和激活状态
- **智能导航** - 根据当前页面环境自动选择切换或跳转方式
- **徽章系统** - 支持数字徽章和小红点两种提示方式
- **懒加载标记** - 标记页面加载状态，支持按需加载优化
- **参数传递** - 支持跳转时携带自定义参数

## 基本用法

### 引入与使用

```typescript
import { useTabbarStore } from '@/stores/modules/tabbar'
import { storeToRefs } from 'pinia'

// 获取 Store 实例
const tabbarStore = useTabbarStore()

// 使用 storeToRefs 保持响应性
const { currentTab, tabs } = storeToRefs(tabbarStore)

// 方法可以直接解构
const { toTab, updateBadge, updateDot, clearBadge } = tabbarStore
```

### 在 Tabbar 页面中使用

```vue
<!-- pages/index/index.vue -->
<template>
  <view class="page-container">
    <!-- 页面内容区域 -->
    <view class="content">
      <!-- 首页 -->
      <home-page v-if="currentTab === 0" />
      <!-- 点餐 -->
      <order-page v-else-if="currentTab === 1" />
      <!-- 我的 -->
      <my-page v-else-if="currentTab === 2" />
    </view>

    <!-- 底部标签栏 -->
    <wd-tabbar
      v-model="currentTab"
      fixed
      bordered
      safe-area-inset-bottom
    >
      <wd-tabbar-item
        v-for="(tab, index) in tabs"
        :key="index"
        :title="tab.title"
        :icon="tab.icon"
        :is-dot="tab.isDot"
        :value="tab.value"
      />
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()
const { currentTab, tabs } = storeToRefs(tabbarStore)

// 处理页面参数
onLoad((options) => {
  if (options?.tab) {
    tabbarStore.toTab(Number(options.tab))
  }
})
</script>
```

### 跳转到指定标签页

```typescript
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()

// 跳转到首页（索引 0）
tabbarStore.toTab(0)

// 跳转到点餐页面（索引 1）
tabbarStore.toTab(1)

// 跳转到我的页面（索引 2）
tabbarStore.toTab(2)

// 带参数跳转
tabbarStore.toTab(2, { showOrders: true, orderId: '123' })
```

### 更新徽章数值

```typescript
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()

// 设置购物车徽章为 5
tabbarStore.updateBadge(1, 5)

// 设置消息徽章为 99+
tabbarStore.updateBadge(2, 99)

// 隐藏徽章（设置为 0）
tabbarStore.updateBadge(1, 0)
```

### 显示小红点

```typescript
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()

// 显示我的页面小红点
tabbarStore.updateDot(2, true)

// 隐藏小红点
tabbarStore.updateDot(2, false)
```

### 清除徽标

```typescript
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()

// 清除指定标签页的所有徽标（数字和小红点）
tabbarStore.clearBadge(1)
```

## API 详解

### 状态

#### currentTab

当前激活的标签页索引。

```typescript
const currentTab: Ref<number>
```

**默认值:** `0`

**使用示例:**

```typescript
const tabbarStore = useTabbarStore()

// 读取当前标签
console.log(tabbarStore.currentTab) // 0

// 在模板中使用
const { currentTab } = storeToRefs(tabbarStore)
```

#### tabs

标签页列表配置。

```typescript
const tabs: Ref<WdTabbarItemProps[]>
```

**默认值:**

```typescript
[
  { title: '首页', icon: 'home', isDot: false, value: 0, loaded: true },
  { title: '点餐', icon: 'shop', isDot: false, value: 0, loaded: false },
  { title: '我的', icon: 'user', isDot: false, value: 0, loaded: false },
]
```

**标签项属性说明:**

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 标签标题 |
| `icon` | `string` | 图标名称 |
| `isDot` | `boolean` | 是否显示小红点 |
| `value` | `number` | 徽章数值 |
| `loaded` | `boolean` | 页面是否已加载 |

### 方法

#### toTab

跳转到指定标签页。

```typescript
const toTab: (index: number | string, params?: Record<string, any>) => Promise<void>
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `index` | `number \| string` | 是 | 标签页索引 |
| `params` | `Record<string, any>` | 否 | 跳转参数 |

**功能说明:**
1. 自动处理索引类型转换（字符串转数字）
2. 校验索引有效性，无效则返回
3. 更新当前标签状态
4. 标记目标页面为已加载
5. 智能判断页面环境：
   - 在 tabbar 页面内：直接切换标签
   - 在其他页面：跳转到 tabbar 页面并传递参数
6. 清除目标标签页的徽标

**使用示例:**

```typescript
const tabbarStore = useTabbarStore()

// 基础跳转
await tabbarStore.toTab(1)

// 字符串索引（自动转换）
await tabbarStore.toTab('2')

// 带参数跳转
await tabbarStore.toTab(2, {
  showOrders: true,
  orderId: '12345'
})
// 实际跳转 URL: /pages/index/index?tab=2&showOrders=true&orderId=12345
```

#### updateDot

更新标签页小红点状态。

```typescript
const updateDot: (index: number, isDot: boolean) => void
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `index` | `number` | 是 | 标签页索引 |
| `isDot` | `boolean` | 是 | 是否显示小红点 |

**功能说明:**
- 校验索引有效性
- 显示小红点时自动隐藏数字徽章（value 设为 0）
- 小红点和数字徽章互斥

**使用示例:**

```typescript
const tabbarStore = useTabbarStore()

// 显示小红点
tabbarStore.updateDot(2, true)

// 隐藏小红点
tabbarStore.updateDot(2, false)
```

#### updateBadge

更新标签页徽章数值。

```typescript
const updateBadge: (index: number, value: number) => void
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `index` | `number` | 是 | 标签页索引 |
| `value` | `number` | 是 | 徽章数值，0 或负数会隐藏徽章 |

**功能说明:**
- 校验索引有效性
- 数值自动取最大值（与 0 比较），负数会被处理为 0
- 显示数字徽章时自动隐藏小红点
- 数字徽章和小红点互斥

**使用示例:**

```typescript
const tabbarStore = useTabbarStore()

// 设置徽章数值
tabbarStore.updateBadge(1, 5)

// 负数会被处理为 0（隐藏徽章）
tabbarStore.updateBadge(1, -1) // 实际设置为 0

// 大数值
tabbarStore.updateBadge(2, 999) // 显示 999
```

#### clearBadge

清除标签页徽标。

```typescript
const clearBadge: (index: number) => void
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `index` | `number` | 是 | 标签页索引 |

**功能说明:**
- 校验索引有效性
- 同时清除数字徽章和小红点

**使用示例:**

```typescript
const tabbarStore = useTabbarStore()

// 清除所有徽标
tabbarStore.clearBadge(1)
```

## 类型定义

### WdTabbarItemProps

```typescript
/**
 * 标签项属性
 */
interface WdTabbarItemProps {
  /** 标签标题 */
  title: string
  /** 图标名称 */
  icon: string
  /** 是否显示小红点 */
  isDot: boolean
  /** 徽章数值 */
  value: number
  /** 页面是否已加载 */
  loaded: boolean
}
```

### TabbarStore 完整类型

```typescript
interface TabbarStore {
  /** 当前激活的标签页索引 */
  currentTab: Ref<number>
  /** 标签页列表 */
  tabs: Ref<WdTabbarItemProps[]>
  /** 跳转到指定标签页 */
  toTab: (index: number | string, params?: Record<string, any>) => Promise<void>
  /** 更新小红点状态 */
  updateDot: (index: number, isDot: boolean) => void
  /** 更新徽章数值 */
  updateBadge: (index: number, value: number) => void
  /** 清除徽标 */
  clearBadge: (index: number) => void
}
```

## 最佳实践

### 1. 封装业务导航 Composable

```typescript
// composables/useNavigation.ts
import { useTabbarStore } from '@/stores/modules/tabbar'

export function useNavigation() {
  const tabbarStore = useTabbarStore()

  // 跳转到首页
  const goHome = () => {
    tabbarStore.toTab(0)
  }

  // 跳转到购物车
  const goCart = () => {
    tabbarStore.toTab(1)
  }

  // 跳转到我的页面
  const goProfile = () => {
    tabbarStore.toTab(2)
  }

  // 跳转到订单详情
  const goOrderDetail = (orderId: string) => {
    tabbarStore.toTab(2, { showOrders: true, orderId })
  }

  return {
    goHome,
    goCart,
    goProfile,
    goOrderDetail
  }
}
```

**使用:**

```vue
<script lang="ts" setup>
import { useNavigation } from '@/composables/useNavigation'

const { goHome, goCart, goProfile } = useNavigation()

const handleBackHome = () => {
  goHome()
}
</script>
```

### 2. 购物车徽章更新

```typescript
// composables/useCart.ts
import { ref, watch } from 'vue'
import { useTabbarStore } from '@/stores/modules/tabbar'

export function useCart() {
  const tabbarStore = useTabbarStore()
  const cartItems = ref<CartItem[]>([])

  // 购物车数量
  const cartCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // 监听购物车数量变化，更新徽章
  watch(cartCount, (count) => {
    tabbarStore.updateBadge(1, count)
  }, { immediate: true })

  // 添加商品到购物车
  const addToCart = (product: Product, quantity = 1) => {
    const existing = cartItems.value.find(item => item.productId === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      cartItems.value.push({
        productId: product.id,
        product,
        quantity
      })
    }
  }

  // 从购物车移除商品
  const removeFromCart = (productId: string) => {
    const index = cartItems.value.findIndex(item => item.productId === productId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
    }
  }

  // 清空购物车
  const clearCart = () => {
    cartItems.value = []
  }

  return {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    clearCart
  }
}
```

### 3. 消息通知小红点

```typescript
// composables/useNotification.ts
import { ref, onMounted } from 'vue'
import { useTabbarStore } from '@/stores/modules/tabbar'

export function useNotification() {
  const tabbarStore = useTabbarStore()
  const hasUnread = ref(false)
  const unreadCount = ref(0)

  // 检查未读消息
  const checkUnreadMessages = async () => {
    const [err, data] = await getUnreadMessageCount()
    if (!err && data) {
      unreadCount.value = data.count
      hasUnread.value = data.count > 0

      // 更新我的页面徽标
      if (data.count > 0) {
        // 如果数量较少，显示具体数字
        if (data.count <= 99) {
          tabbarStore.updateBadge(2, data.count)
        } else {
          // 超过 99 显示小红点
          tabbarStore.updateDot(2, true)
        }
      } else {
        tabbarStore.clearBadge(2)
      }
    }
  }

  // 标记消息为已读
  const markAsRead = async (messageId: string) => {
    const [err] = await markMessageRead(messageId)
    if (!err) {
      await checkUnreadMessages()
    }
  }

  // 标记所有消息为已读
  const markAllAsRead = async () => {
    const [err] = await markAllMessagesRead()
    if (!err) {
      hasUnread.value = false
      unreadCount.value = 0
      tabbarStore.clearBadge(2)
    }
  }

  onMounted(() => {
    checkUnreadMessages()
  })

  return {
    hasUnread,
    unreadCount,
    checkUnreadMessages,
    markAsRead,
    markAllAsRead
  }
}
```

### 4. 懒加载页面优化

```vue
<template>
  <view class="page-container">
    <!-- 首页 - 默认加载 -->
    <home-page v-if="currentTab === 0" />

    <!-- 点餐 - 懒加载 -->
    <template v-if="tabs[1].loaded">
      <order-page v-show="currentTab === 1" />
    </template>

    <!-- 我的 - 懒加载 -->
    <template v-if="tabs[2].loaded">
      <my-page v-show="currentTab === 2" />
    </template>

    <!-- 底部标签栏 -->
    <wd-tabbar v-model="currentTab" @change="handleTabChange">
      <wd-tabbar-item
        v-for="(tab, index) in tabs"
        :key="index"
        v-bind="tab"
      />
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()
const { currentTab, tabs } = storeToRefs(tabbarStore)

// 标签切换时标记页面为已加载
const handleTabChange = (index: number) => {
  tabs.value[index].loaded = true
}
</script>
```

### 5. 结合路由参数初始化

```typescript
// pages/index/index.vue
<script lang="ts" setup>
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()

onLoad((options) => {
  // 处理标签参数
  if (options?.tab) {
    const tabIndex = Number(options.tab)
    if (!isNaN(tabIndex)) {
      tabbarStore.toTab(tabIndex)
    }
  }

  // 处理其他业务参数
  if (options?.showOrders) {
    // 跳转到我的页面并显示订单
    tabbarStore.toTab(2)
    // 可以通过事件总线或其他方式通知子组件
  }
})

// 监听其他页面的跳转请求
onShow(() => {
  // 页面显示时可以刷新徽章状态
  refreshBadges()
})

const refreshBadges = async () => {
  // 刷新购物车数量
  const cartCount = await getCartCount()
  tabbarStore.updateBadge(1, cartCount)

  // 刷新未读消息
  const unreadCount = await getUnreadCount()
  if (unreadCount > 0) {
    tabbarStore.updateDot(2, true)
  }
}
</script>
```

## 常见问题

### 1. 切换标签页时内容闪烁

**问题原因：** 使用 `v-if` 切换时组件重新创建

**解决方案：** 使用 `v-show` 配合懒加载标记

```vue
<template>
  <view class="content">
    <!-- 使用 v-if 控制首次加载，v-show 控制显示隐藏 -->
    <template v-if="tabs[0].loaded">
      <home-page v-show="currentTab === 0" />
    </template>
    <template v-if="tabs[1].loaded">
      <order-page v-show="currentTab === 1" />
    </template>
    <template v-if="tabs[2].loaded">
      <my-page v-show="currentTab === 2" />
    </template>
  </view>
</template>
```

### 2. 从其他页面跳转后标签状态不同步

**问题原因：** 直接使用 `uni.navigateTo` 跳转没有更新 Store 状态

**解决方案：** 始终使用 `toTab` 方法跳转

```typescript
// 错误方式
uni.navigateTo({
  url: '/pages/index/index?tab=2'
})

// 正确方式
const tabbarStore = useTabbarStore()
tabbarStore.toTab(2)
```

### 3. 徽章数值和小红点同时显示

**问题原因：** 分别调用了 `updateBadge` 和 `updateDot`

**解决方案：** Store 内部已处理互斥逻辑，只需选择一种方式

```typescript
// 方式一：显示数字徽章（会自动隐藏小红点）
tabbarStore.updateBadge(1, 5)

// 方式二：显示小红点（会自动隐藏数字徽章）
tabbarStore.updateDot(1, true)

// 清除所有徽标
tabbarStore.clearBadge(1)
```

### 4. 标签页索引越界

**问题原因：** 传入了无效的索引值

**解决方案：** Store 内部已有边界检查，无效索引会被忽略

```typescript
// 这些调用会被安全忽略
tabbarStore.toTab(-1)     // 无效
tabbarStore.toTab(999)    // 无效
tabbarStore.updateBadge(5, 10) // 无效
```

### 5. 页面返回后标签状态丢失

**问题原因：** 页面栈机制导致组件重新创建

**解决方案：** 在 `onShow` 生命周期中恢复状态

```typescript
<script lang="ts" setup>
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()

onShow(() => {
  // 页面显示时同步状态
  // Store 状态是持久的，不会因页面切换而丢失
  console.log('当前标签:', tabbarStore.currentTab)
})
</script>
```

### 6. 自定义标签配置

**问题原因：** 需要动态修改标签配置

**解决方案：** 直接修改 `tabs` 数组

```typescript
import { useTabbarStore } from '@/stores/modules/tabbar'
import { storeToRefs } from 'pinia'

const tabbarStore = useTabbarStore()
const { tabs } = storeToRefs(tabbarStore)

// 修改标签标题
tabs.value[0].title = '主页'

// 修改标签图标
tabs.value[1].icon = 'cart'

// 添加新标签（需要配合页面逻辑）
tabs.value.push({
  title: '设置',
  icon: 'setting',
  isDot: false,
  value: 0,
  loaded: false
})
```

### 7. 徽章数值超大显示

**问题原因：** 徽章数值可能很大影响显示

**解决方案：** 在组件层面处理显示格式

```vue
<template>
  <wd-tabbar-item
    v-for="(tab, index) in tabs"
    :key="index"
    :title="tab.title"
    :icon="tab.icon"
    :is-dot="tab.isDot"
    :value="formatBadgeValue(tab.value)"
  />
</template>

<script lang="ts" setup>
// 格式化徽章数值
const formatBadgeValue = (value: number): string | number => {
  if (value > 99) {
    return '99+'
  }
  return value
}
</script>
```
