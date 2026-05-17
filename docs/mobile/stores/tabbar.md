# Tabbar 标签栏状态

## 介绍

`useTabbarStore` 是 RuoYi-Plus-UniApp 移动端的底部标签栏状态管理模块，用于管理标签页的状态、徽标显示和页面跳转功能。通过统一的状态管理，实现标签页之间的平滑切换和消息徽标的动态更新。该模块采用 Pinia 组合式 API 风格，与 WdTabbar 组件深度集成，提供了完整的标签栏交互解决方案。

**核心特性:**

- **标签页管理** - 统一管理底部标签页的配置和激活状态，支持动态配置修改
- **智能导航** - 根据当前页面环境自动选择切换或跳转方式，智能判断页面栈状态
- **徽章系统** - 支持数字徽章和小红点两种提示方式，自动处理互斥逻辑
- **懒加载标记** - 标记页面加载状态，支持按需加载优化，减少首屏渲染压力
- **参数传递** - 支持跳转时携带自定义参数，自动序列化为 URL 查询字符串
- **边界保护** - 内置索引边界检查，防止无效操作导致错误
- **类型安全** - 完整的 TypeScript 类型定义，提供良好的开发体验

## 架构设计

### Store 结构

```text
┌─────────────────────────────────────────────────────────────┐
│                    useTabbarStore                           │
├─────────────────────────────────────────────────────────────┤
│  状态 (State)                                                │
│  ├── currentTab: Ref<number>        // 当前激活标签索引       │
│  └── tabs: Ref<WdTabbarItemProps[]> // 标签配置列表           │
├─────────────────────────────────────────────────────────────┤
│  方法 (Actions)                                              │
│  ├── toTab()      // 跳转到指定标签页                         │
│  ├── updateDot()  // 更新小红点状态                          │
│  ├── updateBadge() // 更新数字徽章                           │
│  └── clearBadge() // 清除所有徽标                            │
├─────────────────────────────────────────────────────────────┤
│  常量 (Constants)                                            │
│  └── TABBAR_PAGE_PATH = 'pages/index/index'                 │
└─────────────────────────────────────────────────────────────┘
```

### 依赖关系

```text
useTabbarStore
    │
    ├── WdTabbarItemProps (组件类型)
    │   └── wd-tabbar-item.vue
    │
    ├── getCurrentPage (路由工具)
    │   └── utils/route.ts
    │
    ├── objectToQuery (字符串工具)
    │   └── utils/string.ts
    │
    └── isDef (通用工具)
        └── wd/components/common/util.ts
```

### 状态流转

```text
┌──────────────┐     toTab(index)      ┌──────────────────────┐
│  其他页面     │ ───────────────────▶ │  判断当前页面环境      │
└──────────────┘                       └──────────────────────┘
                                                │
                    ┌───────────────────────────┴───────────────────────────┐
                    ▼                                                       ▼
          ┌─────────────────┐                                    ┌─────────────────┐
          │ 在 Tabbar 页面   │                                    │  在其他页面       │
          └─────────────────┘                                    └─────────────────┘
                    │                                                       │
                    ▼                                                       ▼
          ┌─────────────────┐                                    ┌─────────────────┐
          │ 直接切换 Tab     │                                    │ navigateTo 跳转  │
          │ currentTab = n  │                                    │ 携带 tab 参数    │
          └─────────────────┘                                    └─────────────────┘
                    │                                                       │
                    └───────────────────────────┬───────────────────────────┘
                                                ▼
                                    ┌─────────────────────────┐
                                    │ 标记页面已加载            │
                                    │ tabs[n].loaded = true   │
                                    └─────────────────────────┘
                                                │
                                                ▼
                                    ┌─────────────────────────┐
                                    │ 清除目标标签徽标          │
                                    │ clearBadge(index)       │
                                    └─────────────────────────┘
```

### 徽章互斥机制

```text
┌─────────────────────────────────────────────────────────────┐
│                    徽章状态管理                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   updateBadge(value)                updateDot(isDot)        │
│         │                                  │                │
│         ▼                                  ▼                │
│   ┌─────────────┐                  ┌─────────────┐          │
│   │ value > 0   │                  │ isDot = true│          │
│   └─────────────┘                  └─────────────┘          │
│         │                                  │                │
│         ▼                                  ▼                │
│   ┌─────────────┐                  ┌─────────────┐          │
│   │ isDot = false│                 │ value = 0   │          │
│   │ 数字优先     │                  │ 红点优先     │          │
│   └─────────────┘                  └─────────────┘          │
│                                                             │
│                  clearBadge()                               │
│                       │                                     │
│                       ▼                                     │
│               ┌─────────────┐                               │
│               │ value = 0   │                               │
│               │ isDot = false│                               │
│               └─────────────┘                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

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

## 与 WdTabbar 组件集成

### 组件属性映射

Tabbar Store 的 `tabs` 数组直接对应 `WdTabbarItem` 组件的属性，实现了状态与视图的完美绑定：

```typescript
// WdTabbarItemProps 完整定义
interface WdTabbarItemProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 标签页的标题 */
  title?: string
  /** 唯一标识符 */
  name?: string | number
  /** 图标名称 */
  icon?: IconName
  /** 激活状态的图标名称 */
  activeIcon?: string
  /** 徽标显示值 */
  value?: number | string | null
  /** 是否点状徽标 */
  isDot?: boolean
  /** 徽标最大值 */
  max?: number
  /** 徽标属性，透传给 Badge 组件 */
  badgeProps?: Partial<WdBadgeProps>
  /** 页面是否已加载（用于懒加载） */
  loaded?: boolean
  /** 图标大小 */
  iconSize?: string | number
  /** 文字大小 */
  fontSize?: string | number
}
```

### 完整集成示例

```vue
<template>
  <view class="tabbar-page">
    <!-- 页面内容区域 -->
    <view class="content-area">
      <!-- 首页 - 默认展示 -->
      <template v-if="tabs[0].loaded">
        <home-content v-show="currentTab === 0" />
      </template>

      <!-- 分类页 - 懒加载 -->
      <template v-if="tabs[1].loaded">
        <category-content v-show="currentTab === 1" />
      </template>

      <!-- 购物车页 - 懒加载 -->
      <template v-if="tabs[2].loaded">
        <cart-content v-show="currentTab === 2" />
      </template>

      <!-- 我的页面 - 懒加载 -->
      <template v-if="tabs[3].loaded">
        <profile-content v-show="currentTab === 3" />
      </template>
    </view>

    <!-- 底部标签栏 -->
    <wd-tabbar
      v-model="currentTab"
      fixed
      bordered
      placeholder
      safe-area-inset-bottom
      :active-color="activeColor"
      :inactive-color="inactiveColor"
      @change="handleTabChange"
    >
      <wd-tabbar-item
        v-for="(tab, index) in tabs"
        :key="index"
        :title="tab.title"
        :icon="tab.icon"
        :active-icon="tab.activeIcon"
        :is-dot="tab.isDot"
        :value="tab.value"
        :badge-props="{ max: 99 }"
      >
        <!-- 自定义图标插槽 -->
        <template #icon="{ active }">
          <image
            v-if="customIcons[index]"
            :src="active ? customIcons[index].active : customIcons[index].inactive"
            class="custom-icon"
          />
        </template>
      </wd-tabbar-item>
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTabbarStore } from '@/stores/modules/tabbar'
import { useThemeStore } from '@/stores/modules/theme'

const tabbarStore = useTabbarStore()
const themeStore = useThemeStore()

const { currentTab, tabs } = storeToRefs(tabbarStore)

// 主题相关颜色
const activeColor = computed(() => themeStore.primaryColor)
const inactiveColor = computed(() => themeStore.isDark ? '#999' : '#7d7e80')

// 自定义图标配置
const customIcons = ref<Record<number, { active: string; inactive: string }>>({})

// 标签切换处理
const handleTabChange = (index: number) => {
  // 标记页面为已加载
  tabs.value[index].loaded = true

  // 执行页面切换动画或其他逻辑
  console.log(`切换到标签 ${index}`)
}

// 页面加载时处理路由参数
onLoad((options) => {
  if (options?.tab) {
    const tabIndex = Number(options.tab)
    if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < tabs.value.length) {
      tabbarStore.toTab(tabIndex)
    }
  }
})

// 页面显示时刷新徽章
onShow(() => {
  refreshBadges()
})

// 刷新所有徽章
const refreshBadges = async () => {
  // 刷新购物车数量
  const [cartErr, cartData] = await getCartCount()
  if (!cartErr && cartData) {
    tabbarStore.updateBadge(2, cartData.count)
  }

  // 刷新未读消息
  const [msgErr, msgData] = await getUnreadCount()
  if (!msgErr && msgData) {
    if (msgData.count > 0) {
      tabbarStore.updateDot(3, true)
    } else {
      tabbarStore.clearBadge(3)
    }
  }
}
</script>

<style lang="scss" scoped>
.tabbar-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content-area {
  flex: 1;
  overflow: hidden;
}

.custom-icon {
  width: 48rpx;
  height: 48rpx;
}
</style>
```

### 动态图标切换

支持根据激活状态切换不同图标：

```vue
<template>
  <wd-tabbar v-model="currentTab">
    <wd-tabbar-item
      v-for="(tab, index) in tabs"
      :key="index"
      :title="tab.title"
      :icon="getIconName(tab, index)"
    />
  </wd-tabbar>
</template>

<script lang="ts" setup>
const getIconName = (tab: WdTabbarItemProps, index: number) => {
  const isActive = currentTab.value === index

  // 返回激活或非激活状态的图标
  if (isActive && tab.activeIcon) {
    return tab.activeIcon
  }
  return tab.icon
}
</script>
```

## 性能优化

### 1. 懒加载策略

利用 `loaded` 属性实现页面懒加载，减少首屏渲染压力：

```vue
<template>
  <view class="page-wrapper">
    <!-- 使用 v-if 控制组件创建 -->
    <template v-for="(tab, index) in tabs" :key="index">
      <keep-alive>
        <component
          v-if="tab.loaded"
          v-show="currentTab === index"
          :is="getComponent(index)"
        />
      </keep-alive>
    </template>
  </view>
</template>

<script lang="ts" setup>
import { markRaw, shallowRef } from 'vue'
import HomePage from './components/HomePage.vue'
import CategoryPage from './components/CategoryPage.vue'
import CartPage from './components/CartPage.vue'
import ProfilePage from './components/ProfilePage.vue'

// 使用 shallowRef 避免深度响应
const componentMap = shallowRef({
  0: markRaw(HomePage),
  1: markRaw(CategoryPage),
  2: markRaw(CartPage),
  3: markRaw(ProfilePage),
})

const getComponent = (index: number) => {
  return componentMap.value[index]
}
</script>
```

### 2. 徽章更新节流

避免频繁更新徽章导致性能问题：

```typescript
import { useDebounceFn } from '@vueuse/core'
import { useTabbarStore } from '@/stores/modules/tabbar'

export function useBadgeUpdater() {
  const tabbarStore = useTabbarStore()

  // 使用防抖优化频繁更新
  const debouncedUpdateBadge = useDebounceFn((index: number, value: number) => {
    tabbarStore.updateBadge(index, value)
  }, 300)

  // 批量更新优化
  const batchUpdateBadges = (updates: Array<{ index: number; value: number }>) => {
    // 使用 nextTick 批量更新
    nextTick(() => {
      updates.forEach(({ index, value }) => {
        tabbarStore.updateBadge(index, value)
      })
    })
  }

  return {
    debouncedUpdateBadge,
    batchUpdateBadges,
  }
}
```

### 3. 状态缓存优化

使用 computed 缓存派生状态：

```typescript
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTabbarStore } from '@/stores/modules/tabbar'

export function useTabbarComputed() {
  const tabbarStore = useTabbarStore()
  const { currentTab, tabs } = storeToRefs(tabbarStore)

  // 缓存当前标签信息
  const currentTabInfo = computed(() => tabs.value[currentTab.value])

  // 缓存是否有徽章显示
  const hasAnyBadge = computed(() =>
    tabs.value.some(tab => tab.value > 0 || tab.isDot)
  )

  // 缓存已加载的页面数量
  const loadedCount = computed(() =>
    tabs.value.filter(tab => tab.loaded).length
  )

  // 缓存各标签的徽章总数
  const totalBadgeCount = computed(() =>
    tabs.value.reduce((sum, tab) => sum + (tab.value || 0), 0)
  )

  return {
    currentTabInfo,
    hasAnyBadge,
    loadedCount,
    totalBadgeCount,
  }
}
```

### 4. 减少不必要的响应式

```typescript
// 静态配置使用 Object.freeze 避免响应式开销
const STATIC_TAB_CONFIG = Object.freeze({
  HOME: { title: '首页', icon: 'home' },
  CATEGORY: { title: '分类', icon: 'category' },
  CART: { title: '购物车', icon: 'cart' },
  PROFILE: { title: '我的', icon: 'user' },
})

// 初始化时使用
const initTabs = () => {
  tabs.value = [
    { ...STATIC_TAB_CONFIG.HOME, isDot: false, value: 0, loaded: true },
    { ...STATIC_TAB_CONFIG.CATEGORY, isDot: false, value: 0, loaded: false },
    { ...STATIC_TAB_CONFIG.CART, isDot: false, value: 0, loaded: false },
    { ...STATIC_TAB_CONFIG.PROFILE, isDot: false, value: 0, loaded: false },
  ]
}
```

## 高级用法

### 1. 动态标签配置

根据用户角色或权限动态配置标签：

```typescript
import { useTabbarStore } from '@/stores/modules/tabbar'
import { useUserStore } from '@/stores/modules/user'

export function useDynamicTabs() {
  const tabbarStore = useTabbarStore()
  const userStore = useUserStore()

  // 根据用户角色配置标签
  const configureTabsByRole = () => {
    const baseConfig = [
      { title: '首页', icon: 'home', isDot: false, value: 0, loaded: true },
      { title: '我的', icon: 'user', isDot: false, value: 0, loaded: false },
    ]

    // 商家用户增加店铺管理
    if (userStore.isMerchant) {
      baseConfig.splice(1, 0, {
        title: '店铺',
        icon: 'shop',
        isDot: false,
        value: 0,
        loaded: false,
      })
    }

    // VIP 用户增加特权入口
    if (userStore.isVip) {
      baseConfig.splice(1, 0, {
        title: 'VIP',
        icon: 'vip',
        isDot: false,
        value: 0,
        loaded: false,
      })
    }

    tabbarStore.tabs = baseConfig
  }

  return { configureTabsByRole }
}
```

### 2. 徽章动画效果

结合 CSS 动画增强徽章视觉效果：

```vue
<template>
  <wd-tabbar v-model="currentTab">
    <wd-tabbar-item
      v-for="(tab, index) in tabs"
      :key="index"
      :class="{ 'badge-bounce': hasBadgeAnimation[index] }"
      v-bind="tab"
    />
  </wd-tabbar>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()
const { tabs } = storeToRefs(tabbarStore)

// 动画状态
const hasBadgeAnimation = ref<Record<number, boolean>>({})

// 监听徽章变化触发动画
watch(
  () => tabs.value.map(t => t.value),
  (newValues, oldValues) => {
    newValues.forEach((value, index) => {
      if (value > (oldValues?.[index] || 0)) {
        // 徽章增加时触发动画
        hasBadgeAnimation.value[index] = true
        setTimeout(() => {
          hasBadgeAnimation.value[index] = false
        }, 300)
      }
    })
  }
)
</script>

<style lang="scss" scoped>
.badge-bounce {
  animation: bounce 0.3s ease-in-out;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
```

### 3. 标签切换钩子

实现切换前后的钩子函数：

```typescript
import { useTabbarStore } from '@/stores/modules/tabbar'

export function useTabbarHooks() {
  const tabbarStore = useTabbarStore()

  // 切换前钩子
  const beforeTabChange = async (
    from: number,
    to: number
  ): Promise<boolean> => {
    // 检查是否需要登录
    if (to === 3 && !isLoggedIn()) {
      uni.navigateTo({ url: '/pages/auth/login' })
      return false
    }

    // 检查是否有未保存的数据
    if (from === 2 && hasUnsavedData()) {
      const confirmed = await showConfirmDialog('离开将丢失未保存的数据')
      return confirmed
    }

    return true
  }

  // 切换后钩子
  const afterTabChange = (index: number) => {
    // 记录页面访问
    trackPageView(index)

    // 触发页面刷新事件
    uni.$emit('tabChanged', { index })
  }

  // 包装 toTab 方法
  const safeToTab = async (
    index: number,
    params?: Record<string, any>
  ) => {
    const currentIndex = tabbarStore.currentTab
    const canChange = await beforeTabChange(currentIndex, index)

    if (canChange) {
      await tabbarStore.toTab(index, params)
      afterTabChange(index)
    }
  }

  return {
    beforeTabChange,
    afterTabChange,
    safeToTab,
  }
}
```

### 4. 多租户标签配置

支持根据租户配置不同的标签：

```typescript
import { useTabbarStore } from '@/stores/modules/tabbar'
import { useTenantStore } from '@/stores/modules/tenant'

export function useTenantTabs() {
  const tabbarStore = useTabbarStore()
  const tenantStore = useTenantStore()

  // 租户标签配置映射
  const tenantTabConfigs: Record<string, WdTabbarItemProps[]> = {
    // 餐饮租户
    restaurant: [
      { title: '首页', icon: 'home', isDot: false, value: 0, loaded: true },
      { title: '菜单', icon: 'menu', isDot: false, value: 0, loaded: false },
      { title: '订单', icon: 'order', isDot: false, value: 0, loaded: false },
      { title: '我的', icon: 'user', isDot: false, value: 0, loaded: false },
    ],
    // 零售租户
    retail: [
      { title: '首页', icon: 'home', isDot: false, value: 0, loaded: true },
      { title: '商品', icon: 'goods', isDot: false, value: 0, loaded: false },
      { title: '购物车', icon: 'cart', isDot: false, value: 0, loaded: false },
      { title: '我的', icon: 'user', isDot: false, value: 0, loaded: false },
    ],
    // 默认配置
    default: [
      { title: '首页', icon: 'home', isDot: false, value: 0, loaded: true },
      { title: '发现', icon: 'explore', isDot: false, value: 0, loaded: false },
      { title: '我的', icon: 'user', isDot: false, value: 0, loaded: false },
    ],
  }

  // 根据租户配置标签
  const configureByTenant = () => {
    const tenantType = tenantStore.tenantInfo?.type || 'default'
    const config = tenantTabConfigs[tenantType] || tenantTabConfigs.default
    tabbarStore.tabs = [...config]
  }

  return { configureByTenant }
}
```

### 5. 标签状态持久化

将标签状态持久化到本地存储：

```typescript
import { watch } from 'vue'
import { useTabbarStore } from '@/stores/modules/tabbar'

export function useTabbarPersist() {
  const tabbarStore = useTabbarStore()
  const STORAGE_KEY = 'tabbar_state'

  // 保存状态到本地
  const saveState = () => {
    const state = {
      currentTab: tabbarStore.currentTab,
      loadedTabs: tabbarStore.tabs.map(t => t.loaded),
    }
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(state))
  }

  // 从本地恢复状态
  const restoreState = () => {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY)
      if (stored) {
        const state = JSON.parse(stored)

        // 恢复当前标签
        if (typeof state.currentTab === 'number') {
          tabbarStore.currentTab = state.currentTab
        }

        // 恢复加载状态
        if (Array.isArray(state.loadedTabs)) {
          state.loadedTabs.forEach((loaded: boolean, index: number) => {
            if (tabbarStore.tabs[index]) {
              tabbarStore.tabs[index].loaded = loaded
            }
          })
        }
      }
    } catch (error) {
      console.warn('恢复 Tabbar 状态失败:', error)
    }
  }

  // 监听状态变化自动保存
  const enableAutoSave = () => {
    watch(
      () => [tabbarStore.currentTab, tabbarStore.tabs.map(t => t.loaded)],
      () => saveState(),
      { deep: true }
    )
  }

  return {
    saveState,
    restoreState,
    enableAutoSave,
  }
}
```

## 调试技巧

### 1. 状态监控

```typescript
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTabbarStore } from '@/stores/modules/tabbar'

export function useTabbarDebug() {
  const tabbarStore = useTabbarStore()
  const { currentTab, tabs } = storeToRefs(tabbarStore)

  // 监控当前标签变化
  watch(currentTab, (newVal, oldVal) => {
    console.log(`[Tabbar] 标签切换: ${oldVal} -> ${newVal}`)
  })

  // 监控徽章变化
  watch(
    () => tabs.value.map(t => ({ value: t.value, isDot: t.isDot })),
    (newVals, oldVals) => {
      newVals.forEach((newVal, index) => {
        const oldVal = oldVals?.[index]
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          console.log(`[Tabbar] 标签 ${index} 徽章变化:`, oldVal, '->', newVal)
        }
      })
    },
    { deep: true }
  )

  // 获取当前状态快照
  const getSnapshot = () => {
    return {
      currentTab: currentTab.value,
      tabs: tabs.value.map(t => ({
        title: t.title,
        value: t.value,
        isDot: t.isDot,
        loaded: t.loaded,
      })),
    }
  }

  return { getSnapshot }
}
```

### 2. DevTools 集成

Pinia DevTools 自动支持状态调试：

```typescript
// 在开发环境启用调试
if (import.meta.env.DEV) {
  const tabbarStore = useTabbarStore()

  // 添加自定义操作到 DevTools
  tabbarStore.$onAction(({ name, args, after, onError }) => {
    console.log(`[Tabbar Action] ${name}`, args)

    after((result) => {
      console.log(`[Tabbar Action] ${name} 完成`, result)
    })

    onError((error) => {
      console.error(`[Tabbar Action] ${name} 错误`, error)
    })
  })
}
```

### 3. 状态重置

```typescript
import { useTabbarStore } from '@/stores/modules/tabbar'

export function useTabbarReset() {
  const tabbarStore = useTabbarStore()

  // 重置到初始状态
  const resetToInitial = () => {
    tabbarStore.currentTab = 0
    tabbarStore.tabs = [
      { title: '首页', icon: 'home', isDot: false, value: 0, loaded: true },
      { title: '点餐', icon: 'shop', isDot: false, value: 0, loaded: false },
      { title: '我的', icon: 'user', isDot: false, value: 0, loaded: false },
    ]
  }

  // 清除所有徽章
  const clearAllBadges = () => {
    tabbarStore.tabs.forEach((_, index) => {
      tabbarStore.clearBadge(index)
    })
  }

  // 重置加载状态（除首页外）
  const resetLoadedState = () => {
    tabbarStore.tabs.forEach((tab, index) => {
      tab.loaded = index === 0
    })
  }

  return {
    resetToInitial,
    clearAllBadges,
    resetLoadedState,
  }
}
```

### 4. 日志追踪

```typescript
// utils/tabbar-logger.ts
type LogLevel = 'info' | 'warn' | 'error'

interface TabbarLog {
  timestamp: number
  level: LogLevel
  action: string
  data: any
}

class TabbarLogger {
  private logs: TabbarLog[] = []
  private maxLogs = 100

  log(level: LogLevel, action: string, data?: any) {
    const log: TabbarLog = {
      timestamp: Date.now(),
      level,
      action,
      data,
    }

    this.logs.push(log)

    // 保持日志数量限制
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // 开发环境输出到控制台
    if (import.meta.env.DEV) {
      const prefix = `[Tabbar ${level.toUpperCase()}]`
      console[level](prefix, action, data)
    }
  }

  getLogs() {
    return [...this.logs]
  }

  clear() {
    this.logs = []
  }

  export() {
    return JSON.stringify(this.logs, null, 2)
  }
}

export const tabbarLogger = new TabbarLogger()
```

## 注意事项

### 1. 索引边界检查

所有方法都内置了索引边界检查，传入无效索引时会静默忽略：

```typescript
// 源码中的边界检查
const clearBadge = (index: number) => {
  if (index < 0 || index >= tabs.value.length) return
  // ...
}

const toTab = async (index: number | string, params?: Record<string, any>) => {
  index = isDef(index) ? (typeof index === 'string' ? Number(index) : index) : 0
  if (index < 0 || index >= tabs.value.length) return
  // ...
}
```

### 2. 徽章互斥逻辑

数字徽章和小红点是互斥的，设置一个会自动清除另一个：

```typescript
// 设置数字徽章时清除小红点
const updateBadge = (index: number, value: number) => {
  tabs.value[index].value = Math.max(0, value)
  if (value > 0) {
    tabs.value[index].isDot = false  // 自动清除小红点
  }
}

// 设置小红点时清除数字徽章
const updateDot = (index: number, isDot: boolean) => {
  tabs.value[index].isDot = isDot
  if (isDot) {
    tabs.value[index].value = 0  // 自动清除数字
  }
}
```

### 3. 页面跳转行为

`toTab` 方法会根据当前页面环境自动选择跳转方式：

```typescript
// 在 Tabbar 页面内 -> 直接切换
// 在其他页面 -> navigateTo 跳转到 Tabbar 页面

const isInTabbar = getCurrentPage()?.route === TABBAR_PAGE_PATH

if (!isInTabbar) {
  await uni.navigateTo({
    url: `/${TABBAR_PAGE_PATH}?${query}`,
  })
}
```

### 4. 类型转换

`toTab` 方法支持字符串和数字两种索引类型，内部会自动转换：

```typescript
index = isDef(index) ? (typeof index === 'string' ? Number(index) : index) : 0
```

### 5. 负数处理

`updateBadge` 方法会自动将负数处理为 0：

```typescript
tabs.value[index].value = Math.max(0, value)  // 确保不会出现负数
```

### 6. 首页始终标记为已加载

默认配置中，首页的 `loaded` 属性为 `true`，确保应用启动时首页立即可用：

```typescript
const tabs = ref<WdTabbarItemProps[]>([
  { title: '首页', icon: 'home', isDot: false, value: 0, loaded: true },  // 默认加载
  { title: '点餐', icon: 'shop', isDot: false, value: 0, loaded: false },
  { title: '我的', icon: 'user', isDot: false, value: 0, loaded: false },
])
```

### 7. 跳转时自动清除徽标

`toTab` 方法在跳转完成后会自动调用 `clearBadge` 清除目标标签的徽标：

```typescript
const toTab = async (index: number | string, params?: Record<string, any>) => {
  // ... 跳转逻辑

  // 清除徽标
  clearBadge(index)
}
```

### 8. 使用 storeToRefs 保持响应性

从 Store 解构状态时，必须使用 `storeToRefs` 保持响应性：

```typescript
// 正确方式
const { currentTab, tabs } = storeToRefs(tabbarStore)

// 错误方式 - 会丢失响应性
const { currentTab, tabs } = tabbarStore
```
