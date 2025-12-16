# Sidebar 侧边栏

## 介绍

Sidebar 侧边栏是一个垂直展示的导航组件，用于在不同的内容区域之间进行切换。该组件常用于商品分类、设置页面、内容列表等场景，提供清晰的层级导航和快速切换能力。组件支持双模式使用、图标展示、徽标提示、禁用控制等丰富功能，并具有独特的激活项圆角设计，视觉效果优雅。

**核心特性:**

- **双模式支持** - 提供 Items 数组模式和 SidebarItem 子组件模式两种使用方式，满足不同场景需求
- **图标集成** - 支持为每个侧边栏项添加图标，提升视觉识别度
- **徽标提示** - 内置 Badge 徽标组件，支持数字、圆点、自定义内容等多种形式
- **禁用控制** - 支持禁用单个侧边栏项，禁用项不可点击且样式置灰
- **前置钩子** - 提供 beforeChange 钩子函数，可在切换前执行异步验证或确认操作
- **圆角设计** - 激活项的前后相邻项具有独特的圆角效果，视觉层次分明
- **自定义插槽** - 支持自定义侧边栏项内容和图标，可实现复杂的自定义布局
- **暗色主题** - 内置暗色模式支持，自动适配深色界面风格

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:1-63

---

## 基本用法

### 子组件模式

使用 `wd-sidebar-item` 子组件定义侧边栏项，这是最常见的使用方式。

```vue
<template>
  <view class="demo-sidebar">
    <wd-sidebar v-model="activeKey">
      <wd-sidebar-item label="分类1" value="1" />
      <wd-sidebar-item label="分类2" value="2" />
      <wd-sidebar-item label="分类3" value="3" />
      <wd-sidebar-item label="分类4" value="4" />
      <wd-sidebar-item label="分类5" value="5" />
    </wd-sidebar>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeKey = ref('1')
</script>

```

**使用说明:**
- `v-model` 双向绑定当前激活的 value 值
- 每个 `wd-sidebar-item` 必须设置 `label` 和 `value` 属性
- `value` 值必须唯一，用于标识侧边栏项
- 默认激活 value 与 v-model 绑定值匹配的项

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:41-43, 124-125, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:50-53

### Items 数组模式

通过 `items` 数组配置侧边栏项，适合动态数据场景。

```vue
<template>
  <view class="demo-sidebar">
    <wd-sidebar v-model="activeKey" :items="items" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')

const items: SidebarItem[] = [
  { label: '分类1', value: '1' },
  { label: '分类2', value: '2' },
  { label: '分类3', value: '3' },
  { label: '分类4', value: '4' },
  { label: '分类5', value: '5' },
]
</script>

```

**使用说明:**
- Items 模式通过 `items` 数组传入侧边栏项配置
- 每个 item 必须包含 `label` 和 `value` 属性
- `value` 必须唯一
- 适合从后端获取数据或动态生成侧边栏项的场景

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:5-39, 68-96, 122-123

### 带图标

为侧边栏项添加图标，提升视觉识别度。

```vue
<template>
  <view class="demo-sidebar">
    <wd-text title="子组件模式" />
    <wd-sidebar v-model="activeKey1">
      <wd-sidebar-item label="首页" value="1" icon="home" />
      <wd-sidebar-item label="分类" value="2" icon="category" />
      <wd-sidebar-item label="购物车" value="3" icon="cart" />
      <wd-sidebar-item label="我的" value="4" icon="user" />
    </wd-sidebar>

    <wd-text title="Items 模式" custom-style="margin-top: 32rpx" />
    <wd-sidebar v-model="activeKey2" :items="items" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey1 = ref('1')
const activeKey2 = ref('1')

const items: SidebarItem[] = [
  { label: '首页', value: '1', icon: 'home' },
  { label: '分类', value: '2', icon: 'category' },
  { label: '购物车', value: '3', icon: 'cart' },
  { label: '我的', value: '4', icon: 'user' },
]
</script>

```

**使用说明:**
- 子组件模式通过 `icon` prop 设置图标
- Items 模式在 item 对象中设置 `icon` 属性
- 图标名称来自项目配置的图标库
- 图标显示在文字左侧

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:31-33, 78, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:9-11, 59

### 带徽标

使用徽标显示未读消息、待处理事项等提示信息。

```vue
<template>
  <view class="demo-sidebar">
    <wd-text title="数字徽标" />
    <wd-sidebar v-model="activeKey1">
      <wd-sidebar-item label="消息" value="1" :badge="5" />
      <wd-sidebar-item label="通知" value="2" :badge="10" />
      <wd-sidebar-item label="待办" value="3" :badge="100" :max="99" />
      <wd-sidebar-item label="已读" value="4" />
    </wd-sidebar>

    <wd-text title="圆点徽标" custom-style="margin-top: 32rpx" />
    <wd-sidebar v-model="activeKey2">
      <wd-sidebar-item label="消息" value="1" :is-dot="true" />
      <wd-sidebar-item label="通知" value="2" :is-dot="true" />
      <wd-sidebar-item label="待办" value="3" />
      <wd-sidebar-item label="已读" value="4" />
    </wd-sidebar>

    <wd-text title="Items 模式" custom-style="margin-top: 32rpx" />
    <wd-sidebar v-model="activeKey3" :items="items" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey1 = ref('1')
const activeKey2 = ref('1')
const activeKey3 = ref('1')

const items: SidebarItem[] = [
  { label: '消息', value: '1', badge: 5 },
  { label: '通知', value: '2', badge: '99+' },
  { label: '待办', value: '3', isDot: true },
  { label: '已读', value: '4' },
]
</script>

```

**使用说明:**
- `badge` 属性设置徽标显示的数字或文字
- `isDot` 属性设置为圆点徽标
- `max` 属性设置数字徽标的最大值，超过显示为 `${max}+`
- 徽标显示在文字右上角
- 支持所有 Badge 组件的属性，通过 `badgeProps` 透传

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:34-36, 74-83, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:12-14, 54-56, 60-63, 94-107

### 禁用项

禁用特定的侧边栏项，禁用项不可点击。

```vue
<template>
  <view class="demo-sidebar">
    <wd-text title="子组件模式" />
    <wd-sidebar v-model="activeKey1">
      <wd-sidebar-item label="分类1" value="1" />
      <wd-sidebar-item label="分类2（禁用）" value="2" :disabled="true" />
      <wd-sidebar-item label="分类3" value="3" />
      <wd-sidebar-item label="分类4（禁用）" value="4" :disabled="true" />
      <wd-sidebar-item label="分类5" value="5" />
    </wd-sidebar>

    <wd-text title="Items 模式" custom-style="margin-top: 32rpx" />
    <wd-sidebar v-model="activeKey2" :items="items" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey1 = ref('1')
const activeKey2 = ref('1')

const items: SidebarItem[] = [
  { label: '分类1', value: '1' },
  { label: '分类2（禁用）', value: '2', disabled: true },
  { label: '分类3', value: '3' },
  { label: '分类4（禁用）', value: '4', disabled: true },
  { label: '分类5', value: '5' },
]
</script>

```

**使用说明:**
- 子组件模式通过 `disabled` prop 禁用侧边栏项
- Items 模式在 item 对象中设置 `disabled: true`
- 禁用项样式置灰且不可点击
- 点击禁用项不会触发任何事件
- 禁用项不能被选中

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:213, 249, 84, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:65, 81, 153-154

### 事件监听

监听侧边栏项的切换和点击事件。

```vue
<template>
  <view class="demo-sidebar">
    <wd-sidebar
      v-model="activeKey"
      @change="handleChange"
      @item-click="handleItemClick"
    >
      <wd-sidebar-item
        v-for="i in 5"
        :key="i"
        :label="`分类${i}`"
        :value="`${i}`"
        @itemclick="handleItemClickSub"
      />
    </wd-sidebar>

    <view class="event-log">
      <view class="log-title">事件日志:</view>
      <view v-for="(log, index) in eventLogs" :key="index" class="log-item">
        {{ log }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')
const eventLogs = ref<string[]>([])

const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${time}] ${message}`)
  if (eventLogs.value.length > 10) {
    eventLogs.value.pop()
  }
}

const handleChange = (event: { value: string | number; label: string }) => {
  addLog(`change 事件 - 切换到: ${event.label} (value: ${event.value})`)
}

const handleItemClick = (item: SidebarItem, index: number) => {
  addLog(`item-click 事件 - 点击: ${item.label} (索引: ${index})`)
}

const handleItemClickSub = () => {
  addLog('子组件 itemclick 事件触发')
}
</script>

```

**使用说明:**
- `change` 事件：侧边栏项切换时触发，参数包含 `value` 和 `label`
- `item-click` 事件：点击侧边栏项时触发（Items 模式），参数包含 `item` 和 `index`
- `itemclick` 事件：子组件上的点击事件（子组件模式）
- 事件触发顺序：`item-click`/`itemclick` → `change` → `update:modelValue`

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:133-140, 189-192, 248-256, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:71-74, 153-161

---

## 高级用法

### 前置钩子

使用 `beforeChange` 钩子在切换前执行验证或确认操作。

```vue
<template>
  <view class="demo-sidebar">
    <wd-text title="切换前确认" />
    <wd-sidebar v-model="activeKey" :before-change="handleBeforeChange">
      <wd-sidebar-item label="首页" value="1" />
      <wd-sidebar-item label="个人中心" value="2" />
      <wd-sidebar-item label="设置" value="3" />
      <wd-sidebar-item label="退出登录" value="4" />
    </wd-sidebar>

    <view class="tip">点击"退出登录"会弹出确认对话框</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarBeforeChangeOption } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')

const handleBeforeChange = (option: SidebarBeforeChangeOption) => {
  const { value, resolve } = option

  // 退出登录需要确认
  if (value === '4') {
    uni.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          resolve(true)  // 允许切换
          // 这里可以执行退出登录逻辑
          uni.showToast({
            title: '已退出登录',
            icon: 'success',
          })
        } else {
          resolve(false)  // 取消切换
        }
      },
    })
  } else {
    resolve(true)  // 其他项直接允许切换
  }
}
</script>

```

**异步验证示例:**

```vue
<template>
  <view class="demo-sidebar">
    <wd-text title="异步验证" />
    <wd-sidebar v-model="activeKey" :before-change="handleBeforeChange">
      <wd-sidebar-item label="公开内容" value="1" />
      <wd-sidebar-item label="VIP 内容" value="2" />
      <wd-sidebar-item label="专属内容" value="3" />
    </wd-sidebar>

    <view class="tip">切换到 VIP/专属内容会进行权限验证</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarBeforeChangeOption } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')

const handleBeforeChange = async (option: SidebarBeforeChangeOption) => {
  const { value, resolve } = option

  // VIP 和专属内容需要验证权限
  if (value === '2' || value === '3') {
    uni.showLoading({ title: '验证中...' })

    try {
      // 模拟异步权限验证
      await new Promise((resolveAsync) => setTimeout(resolveAsync, 1000))

      // 模拟权限验证结果
      const hasPermission = Math.random() > 0.5

      uni.hideLoading()

      if (hasPermission) {
        resolve(true)
        uni.showToast({
          title: '验证通过',
          icon: 'success',
        })
      } else {
        resolve(false)
        uni.showToast({
          title: '权限不足',
          icon: 'none',
        })
      }
    } catch (error) {
      uni.hideLoading()
      resolve(false)
      uni.showToast({
        title: '验证失败',
        icon: 'none',
      })
    }
  } else {
    resolve(true)
  }
}
</script>

```

**使用说明:**
- `beforeChange` 是一个函数，接收 `option` 参数
- `option` 包含 `value`（目标值）和 `resolve`（回调函数）
- 调用 `resolve(true)` 允许切换，`resolve(false)` 取消切换
- 可以在 beforeChange 中执行异步操作（如网络请求、权限验证等）
- 常用于需要用户确认、权限验证、数据保存提示等场景

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:101-112, 127, 169-182

### 自定义内容插槽

使用插槽自定义侧边栏项的内容。

```vue
<template>
  <view class="demo-sidebar">
    <wd-text title="自定义图标插槽" />
    <wd-sidebar v-model="activeKey1">
      <wd-sidebar-item label="首页" value="1">
        <template #icon>
          <view class="custom-icon" style="background: #ff6b6b;">
            <wd-icon name="home" color="#fff" size="32" />
          </view>
        </template>
      </wd-sidebar-item>
      <wd-sidebar-item label="分类" value="2">
        <template #icon>
          <view class="custom-icon" style="background: #4ecb73;">
            <wd-icon name="category" color="#fff" size="32" />
          </view>
        </template>
      </wd-sidebar-item>
      <wd-sidebar-item label="购物车" value="3">
        <template #icon>
          <view class="custom-icon" style="background: #ffa940;">
            <wd-icon name="cart" color="#fff" size="32" />
          </view>
        </template>
      </wd-sidebar-item>
    </wd-sidebar>

    <wd-text title="Items 模式自定义内容" custom-style="margin-top: 32rpx" />
    <wd-sidebar v-model="activeKey2" :items="items">
      <template #item-0="{ item, index, active }">
        <view class="custom-item" :class="{ 'is-active': active }">
          <wd-icon name="home" size="40" />
          <text class="label">{{ item.label }}</text>
          <text class="desc">首页导航</text>
        </view>
      </template>
      <template #item-1="{ item, index, active }">
        <view class="custom-item" :class="{ 'is-active': active }">
          <wd-icon name="category" size="40" />
          <text class="label">{{ item.label }}</text>
          <text class="desc">分类浏览</text>
        </view>
      </template>
    </wd-sidebar>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey1 = ref('1')
const activeKey2 = ref('1')

const items: SidebarItem[] = [
  { label: '首页', value: '1', useSlot: true },
  { label: '分类', value: '2', useSlot: true },
  { label: '购物车', value: '3' },
  { label: '我的', value: '4' },
]
</script>

```

**使用说明:**
- 子组件模式支持 `icon` 插槽自定义图标
- Items 模式设置 `useSlot: true` 启用自定义内容插槽
- 默认插槽名为 `item-${index}`，可通过 `slotName` 自定义
- 插槽接收 `item`、`index`、`active` 参数
- 自定义图标插槽可通过 `useIconSlot` 和 `iconSlotName` 实现

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:13-38, 85-92, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:8-11

### 配合内容区域使用

Sidebar 常用于左侧导航，配合右侧内容区域使用。

```vue
<template>
  <view class="demo-sidebar">
    <wd-sidebar v-model="activeCategory" :items="categories" />

    <view class="content-area">
      <view class="content-header">
        <text class="title">{{ currentCategory?.label }}</text>
      </view>

      <scroll-view class="content-body" scroll-y>
        <view v-for="item in currentProducts" :key="item.id" class="product-item">
          <image class="product-image" :src="item.image" mode="aspectFill" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-price">¥{{ item.price }}</text>
          </view>
        </view>
        <view v-if="currentProducts.length === 0" class="empty">
          暂无商品
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeCategory = ref('1')

const categories: SidebarItem[] = [
  { label: '手机数码', value: '1', badge: 10 },
  { label: '电脑办公', value: '2', badge: 5 },
  { label: '家用电器', value: '3' },
  { label: '服饰鞋包', value: '4', badge: 20 },
  { label: '食品饮料', value: '5' },
  { label: '图书音像', value: '6', badge: 3 },
]

// 模拟商品数据
const products = {
  '1': [
    { id: 1, name: 'iPhone 15 Pro', price: 7999, image: '/static/phone.jpg' },
    { id: 2, name: 'iPad Pro', price: 6999, image: '/static/ipad.jpg' },
  ],
  '2': [
    { id: 3, name: 'MacBook Pro', price: 12999, image: '/static/laptop.jpg' },
    { id: 4, name: 'Dell XPS', price: 8999, image: '/static/laptop2.jpg' },
  ],
  '3': [
    { id: 5, name: '小米电视', price: 3999, image: '/static/tv.jpg' },
  ],
  '4': [
    { id: 6, name: '运动鞋', price: 299, image: '/static/shoes.jpg' },
    { id: 7, name: 'T恤', price: 99, image: '/static/tshirt.jpg' },
  ],
  '5': [],
  '6': [
    { id: 8, name: '编程书籍', price: 79, image: '/static/book.jpg' },
  ],
}

const currentCategory = computed(() => {
  return categories.find(cat => cat.value === activeCategory.value)
})

const currentProducts = computed(() => {
  return products[activeCategory.value as keyof typeof products] || []
})
</script>

```

**使用说明:**
- Sidebar 固定宽度，内容区域占据剩余空间
- 通过 v-model 绑定当前分类
- 根据选中的分类动态显示对应内容
- 适用于商品分类、文章分类、设置页面等场景

### 动态侧边栏

根据数据动态生成侧边栏项，支持增删改。

```vue
<template>
  <view class="demo-sidebar">
    <wd-sidebar v-model="activeKey" :items="items" />

    <view class="actions">
      <wd-button size="small" type="primary" @click="addItem">
        添加分类
      </wd-button>
      <wd-button size="small" type="danger" @click="removeItem">
        删除当前分类
      </wd-button>
      <wd-button size="small" type="warning" @click="updateItem">
        更新当前分类
      </wd-button>
      <wd-button size="small" type="success" @click="toggleBadge">
        切换徽标
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')
const items = ref<SidebarItem[]>([
  { label: '分类1', value: '1' },
  { label: '分类2', value: '2' },
  { label: '分类3', value: '3' },
])

let itemCounter = 3

const addItem = () => {
  itemCounter++
  items.value.push({
    label: `分类${itemCounter}`,
    value: `${itemCounter}`,
  })
  activeKey.value = `${itemCounter}`
}

const removeItem = () => {
  if (items.value.length <= 1) {
    uni.showToast({
      title: '至少保留一个分类',
      icon: 'none',
    })
    return
  }

  const index = items.value.findIndex(item => item.value === activeKey.value)
  if (index !== -1) {
    items.value.splice(index, 1)
    // 删除后选中第一个
    activeKey.value = items.value[0].value
  }
}

const updateItem = () => {
  const index = items.value.findIndex(item => item.value === activeKey.value)
  if (index !== -1) {
    items.value[index].label = `分类${items.value[index].value}（已更新）`
  }
}

const toggleBadge = () => {
  const index = items.value.findIndex(item => item.value === activeKey.value)
  if (index !== -1) {
    const currentItem = items.value[index]
    if (currentItem.badge) {
      delete currentItem.badge
    } else {
      currentItem.badge = Math.floor(Math.random() * 100)
    }
  }
}
</script>

```

**使用说明:**
- Items 模式支持动态修改，响应式更新
- 添加/删除侧边栏项时需要管理 activeKey
- 删除当前选中项后应切换到其他项
- 动态修改 label、badge 等属性会立即生效

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:160-162

---

## API

### Sidebar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customStyle | 自定义根节点样式 | `string` | `''` |
| customClass | 自定义根节点样式类 | `string` | `''` |
| items | 侧边栏项数据数组（Items 模式） | `SidebarItem[]` | `[]` |
| modelValue / v-model | 当前导航项的值 | `number \| string` | `0` |
| beforeChange | 在改变前执行的钩子函数 | `SidebarBeforeChange` | - |

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:116-128, 143-148

### SidebarItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customStyle | 自定义根节点样式 | `string` | `''` |
| customClass | 自定义根节点样式类 | `string` | `''` |
| label | 当前选项标题 | `string` | - |
| value | 当前选项的值，唯一标识 | `number \| string` | - |
| badge | 徽标显示值 | `string \| number \| null` | `null` |
| badgeProps | 徽标属性，透传给 Badge 组件 | `Record<string, any>` | - |
| icon | 图标名称 | `string` | - |
| isDot | 是否点状徽标 | `boolean` | `false` |
| max | 徽标最大值 | `number` | `99` |
| disabled | 是否禁用 | `boolean` | `false` |

参考: src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:44-66, 77-82

### SidebarItem 类型（Items 模式）

```typescript
/**
 * 侧边栏项配置接口
 */
export interface SidebarItem {
  /** 当前选项标题 */
  label: string
  /** 当前选项的值，唯一标识 */
  value: number | string
  /** 徽标显示值 */
  badge?: string | number | null
  /** 徽标属性，透传给 Badge 组件 */
  badgeProps?: Record<string, any>
  /** 图标 */
  icon?: string
  /** 是否点状徽标 */
  isDot?: boolean
  /** 徽标最大值 */
  max?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否使用自定义内容插槽 */
  useSlot?: boolean
  /** 自定义内容插槽名称，默认为 item-{index} */
  slotName?: string
  /** 是否使用图标插槽 */
  useIconSlot?: boolean
  /** 图标插槽名称，默认为 icon-{index} */
  iconSlotName?: string

  /** 自定义数据，点击时会传递 */
  [key: string]: any
}
```

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:68-96

### Sidebar Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 绑定值变化时触发 | `value: number \| string` |
| change | 选中项变化时触发 | `{ value: number \| string, label: string }` |
| item-click | 点击侧边栏项时触发（Items 模式） | `item: SidebarItem, index: number` |

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:133-140, 189-192, 248-256

### SidebarItem Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| itemclick | 点击侧边栏项时触发 | - |

参考: src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:71-74, 157

### Sidebar Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 默认插槽，子组件模式下放置 `wd-sidebar-item` 组件 | - |
| item-${index} | Items 模式下的自定义内容插槽，${index} 为侧边栏项索引 | `{ item: SidebarItem, index: number, active: boolean }` |
| icon-${index} | Items 模式下的自定义图标插槽 | `{ item: SidebarItem, index: number }` |
| [自定义插槽名] | Items 模式下通过 `slotName` / `iconSlotName` 指定的自定义插槽 | `{ item: SidebarItem, index: number, active?: boolean }` |

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:13-38

### SidebarItem Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 侧边栏项内容（包含徽标） | - |
| icon | 自定义图标 | - |

参考: src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:8-11

### 类型定义

```typescript
/**
 * 侧边栏项配置接口
 */
export interface SidebarItem {
  /** 当前选项标题 */
  label: string
  /** 当前选项的值，唯一标识 */
  value: number | string
  /** 徽标显示值 */
  badge?: string | number | null
  /** 徽标属性，透传给 Badge 组件 */
  badgeProps?: Record<string, any>
  /** 图标 */
  icon?: string
  /** 是否点状徽标 */
  isDot?: boolean
  /** 徽标最大值 */
  max?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否使用自定义内容插槽 */
  useSlot?: boolean
  /** 自定义内容插槽名称，默认为 item-{index} */
  slotName?: string
  /** 是否使用图标插槽 */
  useIconSlot?: boolean
  /** 图标插槽名称，默认为 icon-{index} */
  iconSlotName?: string

  /** 自定义数据，点击时会传递 */
  [key: string]: any
}

/**
 * Sidebar切换前的选项接口
 */
export interface SidebarBeforeChangeOption {
  /** 目标值 */
  value: number | string
  resolve: (pass: boolean) => void
}

/**
 * Sidebar切换前的钩子函数类型
 */
export type SidebarBeforeChange = (option: SidebarBeforeChangeOption) => void

/**
 * 侧边栏组件属性接口
 */
interface WdSidebarProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 侧边栏项数据数组 */
  items?: SidebarItem[]
  /** 当前导航项的索引 */
  modelValue?: number | string
  /** 在改变前执行的函数 */
  beforeChange?: SidebarBeforeChange
}

/**
 * 侧边栏组件事件接口
 */
interface WdSidebarEmits {
  /** 更新选中值 */
  'update:modelValue': [value: number | string]
  /** 选中项变化时触发 */
  change: [event: { value: number | string; label: string }]
  /** 点击侧边栏项时触发 */
  'item-click': [item: SidebarItem, index: number]
}

/**
 * 侧边栏项组件属性接口
 */
interface WdSidebarItemProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 当前选项标题 */
  label: string
  /** 当前选项的值，唯一标识 */
  value: number | string
  /** 徽标显示值 */
  badge?: string | number | null
  /** 徽标属性，透传给 Badge 组件 */
  badgeProps?: Record<string, any>
  /** 图标 */
  icon?: string
  /** 是否点状徽标 */
  isDot?: boolean
  /** 徽标最大值 */
  max?: number
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 侧边栏项组件事件接口
 */
interface WdSidebarItemEmits {
  /** 点击侧边栏项时触发 */
  itemclick: []
}
```

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:68-140, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:44-74

---

## 主题定制

### CSS 变量

Sidebar 组件提供了以下 CSS 变量用于主题定制:

```scss
// 侧边栏容器
$-sidebar-width: 210rpx;                                // 侧边栏宽度
$-sidebar-height: 100%;                                  // 侧边栏高度
$-sidebar-bg: #f5f7fa;                                   // 侧边栏背景色

// 侧边栏项
$-sidebar-font-size: 28rpx;                              // 侧边栏项字体大小
$-sidebar-color: #323233;                                // 侧边栏项文字颜色
$-sidebar-item-height: 88rpx;                            // 侧边栏项最小高度
$-sidebar-item-line-height: 40rpx;                       // 侧边栏项行高
$-sidebar-hover-bg: #e8e8e8;                             // 侧边栏项悬停背景色
$-sidebar-disabled-color: #c8c9cc;                       // 侧边栏项禁用颜色

// 激活项
$-sidebar-active-bg: #fff;                               // 激活项背景色
$-sidebar-active-color: #4d80f0;                         // 激活项文字颜色
$-sidebar-active-border-width: 6rpx;                     // 激活项边框宽度
$-sidebar-active-border-height: 32rpx;                   // 激活项边框高度
$-sidebar-border-radius: 24rpx;                          // 前后缀圆角大小

// 图标
$-sidebar-icon-size: 32rpx;                              // 图标大小

// 暗色主题
.wot-theme-dark {
  $-dark-background: #1a1a1a;
  $-dark-background2: #232323;
  $-dark-background4: #383838;
  $-dark-color: #e5e5e5;
  $-dark-color-gray: #555;
}
```

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:259-379, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:164-262

### 自定义样式

**基础样式定制:**

```vue
<template>
  <view class="custom-sidebar">
    <wd-sidebar
      v-model="activeKey"
      :items="items"
      custom-class="my-sidebar"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')

const items: SidebarItem[] = [
  { label: '分类1', value: '1' },
  { label: '分类2', value: '2' },
  { label: '分类3', value: '3' },
]
</script>

```

**深色主题:**

```vue
<template>
  <view class="dark-sidebar wot-theme-dark">
    <wd-sidebar v-model="activeKey" :items="items" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')

const items: SidebarItem[] = [
  { label: '分类1', value: '1' },
  { label: '分类2', value: '2' },
  { label: '分类3', value: '3' },
]
</script>

```

**扁平风格:**

```vue
<template>
  <view class="flat-sidebar">
    <wd-sidebar
      v-model="activeKey"
      :items="items"
      custom-class="flat-style"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')

const items: SidebarItem[] = [
  { label: '分类1', value: '1', icon: 'home' },
  { label: '分类2', value: '2', icon: 'category' },
  { label: '分类3', value: '3', icon: 'cart' },
]
</script>

```

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:259-379

---

## 最佳实践

### 1. 选择合适的使用模式

**推荐做法:**

```vue
<!-- ✅ 静态侧边栏使用子组件模式 -->
<wd-sidebar v-model="activeKey">
  <wd-sidebar-item label="首页" value="1" icon="home" />
  <wd-sidebar-item label="分类" value="2" icon="category" />
  <wd-sidebar-item label="购物车" value="3" icon="cart" />
</wd-sidebar>

<!-- ✅ 动态侧边栏使用 Items 模式 -->
<wd-sidebar v-model="activeCategory" :items="categories" />
```

**不推荐做法:**

```vue
<!-- ❌ 动态数据使用子组件模式，难以维护 -->
<wd-sidebar v-model="activeKey">
  <wd-sidebar-item
    v-for="item in categories"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  />
</wd-sidebar>

<!-- ❌ 静态内容使用 Items 模式，代码冗余 -->
<wd-sidebar v-model="activeKey" :items="staticItems" />
```

**说明:**
- 子组件模式适合侧边栏项固定、数量较少的场景
- Items 模式适合数据动态变化、从后端获取的场景
- 根据实际需求选择合适的模式

### 2. 合理使用 beforeChange 钩子

**推荐做法:**

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarBeforeChangeOption } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')

// ✅ 在需要确认、验证的场景使用 beforeChange
const handleBeforeChange = (option: SidebarBeforeChangeOption) => {
  const { value, resolve } = option

  // 需要保存数据时提示用户
  if (hasUnsavedData.value) {
    uni.showModal({
      title: '提示',
      content: '有未保存的数据，是否切换？',
      success: (res) => {
        resolve(res.confirm)
      },
    })
  } else {
    resolve(true)
  }
}
</script>

<template>
  <wd-sidebar v-model="activeKey" :before-change="handleBeforeChange">
    <!-- ... -->
  </wd-sidebar>
</template>
```

**不推荐做法:**

```vue
<script lang="ts" setup>
// ❌ 简单切换使用 beforeChange，增加复杂度
const handleBeforeChange = (option: SidebarBeforeChangeOption) => {
  option.resolve(true)  // 直接放行，没有实际作用
}

// ❌ 在 beforeChange 中执行耗时操作但不显示加载状态
const handleBeforeChange = async (option: SidebarBeforeChangeOption) => {
  // 没有 loading 提示
  await someAsyncOperation()
  option.resolve(true)
}
</script>
```

**说明:**
- beforeChange 用于需要用户确认、权限验证、数据保存等场景
- 简单切换无需使用 beforeChange
- 异步操作应显示加载状态

### 3. 徽标使用规范

**推荐做法:**

```vue
<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

// ✅ 动态计算徽标值
const unreadCounts = ref({
  message: 5,
  notification: 10,
  todo: 3,
})

const items = computed<SidebarItem[]>(() => [
  {
    label: '消息',
    value: '1',
    badge: unreadCounts.value.message || null,  // 0 不显示
  },
  {
    label: '通知',
    value: '2',
    badge: unreadCounts.value.notification,
  },
  {
    label: '待办',
    value: '3',
    badge: unreadCounts.value.todo || null,
  },
])
</script>
```

**不推荐做法:**

```vue
<script lang="ts" setup>
// ❌ 徽标值写死，无法动态更新
const items: SidebarItem[] = [
  { label: '消息', value: '1', badge: 5 },
  { label: '通知', value: '2', badge: 10 },
]

// ❌ 使用0作为徽标值
const items: SidebarItem[] = [
  { label: '消息', value: '1', badge: 0 },  // 应该不显示徽标
]
</script>
```

**说明:**
- 徽标值应该动态计算
- 值为 0 或 null 时不显示徽标
- 超过 max 值显示 `${max}+`

### 4. 配合路由使用

**推荐做法:**

```vue
<script lang="ts" setup>
import { ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const activeKey = ref('1')

// ✅ 页面加载时从路由获取当前分类
onLoad((options) => {
  if (options.category) {
    activeKey.value = options.category
  }
})

// ✅ 切换分类时更新路由
watch(activeKey, (newValue) => {
  uni.navigateTo({
    url: `/pages/category/index?category=${newValue}`,
  })
})
</script>

<template>
  <wd-sidebar v-model="activeKey" :items="categories" />
</template>
```

**不推荐做法:**

```vue
<script lang="ts" setup>
// ❌ 切换后不更新路由，刷新页面后状态丢失
const activeKey = ref('1')

// ❌ 直接在点击事件中跳转，绕过 v-model
const handleClick = (item: SidebarItem) => {
  uni.navigateTo({
    url: `/pages/category/index?category=${item.value}`,
  })
}
</script>
```

**说明:**
- 侧边栏状态应该与路由保持同步
- 支持浏览器前进后退
- 支持页面刷新后恢复状态

### 5. 性能优化

**推荐做法:**

```vue
<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

// ✅ 静态侧边栏使用常量
const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: '分类1', value: '1' },
  { label: '分类2', value: '2' },
  { label: '分类3', value: '3' },
]

// ✅ 使用 shallowRef 减少响应式开销
const items = shallowRef(SIDEBAR_ITEMS)
const activeKey = ref('1')
</script>

<template>
  <wd-sidebar v-model="activeKey" :items="items" />
</template>
```

**不推荐做法:**

```vue
<script lang="ts" setup>
// ❌ 内联创建数组，每次渲染都重新创建
</script>

<template>
  <wd-sidebar
    v-model="activeKey"
    :items="[
      { label: '分类1', value: '1' },
      { label: '分类2', value: '2' },
    ]"
  />
</template>
```

**说明:**
- 静态数据使用常量
- 动态数据使用 ref 或 shallowRef
- 避免内联创建复杂对象

---

## 常见问题

### 1. 为什么切换侧边栏项后内容没有更新？

**问题原因:**
- v-model 绑定值未正确更新
- 内容组件没有监听侧边栏变化
- 数据未重新加载

**解决方案:**

```vue
<template>
  <view class="page">
    <wd-sidebar v-model="activeCategory" :items="categories" @change="handleChange" />

    <view class="content">
      <!-- 使用 key 强制重新渲染 -->
      <CategoryContent :key="activeCategory" :category-id="activeCategory" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeCategory = ref('1')
const categories: SidebarItem[] = [
  { label: '分类1', value: '1' },
  { label: '分类2', value: '2' },
]

const handleChange = (event: { value: string | number; label: string }) => {
  console.log('切换到:', event)
  // 在这里可以执行数据加载等操作
  loadCategoryData(event.value)
}

const loadCategoryData = (categoryId: string | number) => {
  // 加载分类数据
}
</script>
```

**说明:**
- 监听 `change` 事件处理分类切换
- 为内容组件添加 `key` 强制重新渲染
- 检查 v-model 绑定是否正确

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:189-192

### 2. 如何实现侧边栏的二级菜单？

**问题原因:**
- Sidebar 组件本身不支持多级菜单
- 需要自定义实现展开/收起逻辑

**解决方案:**

```vue
<template>
  <view class="page">
    <wd-sidebar v-model="activeKey" :items="flatMenus">
      <template #item-0="{ item, active }">
        <view class="menu-item" :class="{ 'is-active': active }">
          <text>{{ item.label }}</text>
        </view>
      </template>
      <!-- 其他自定义项 -->
    </wd-sidebar>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')
const expandedKeys = ref<string[]>([])

// 原始多级菜单数据
const menus = [
  {
    label: '数码产品',
    value: '1',
    children: [
      { label: '手机', value: '1-1' },
      { label: '电脑', value: '1-2' },
    ],
  },
  {
    label: '服装鞋包',
    value: '2',
    children: [
      { label: '男装', value: '2-1' },
      { label: '女装', value: '2-2' },
    ],
  },
]

// 展开的菜单
const flatMenus = computed<SidebarItem[]>(() => {
  const result: SidebarItem[] = []

  menus.forEach((menu) => {
    // 添加一级菜单
    result.push({
      label: menu.label,
      value: menu.value,
      useSlot: true,
    })

    // 如果展开，添加二级菜单
    if (expandedKeys.value.includes(menu.value)) {
      menu.children.forEach((child) => {
        result.push({
          label: `  ${child.label}`,  // 缩进显示
          value: child.value,
        })
      })
    }
  })

  return result
})

const toggleExpand = (key: string) => {
  const index = expandedKeys.value.indexOf(key)
  if (index !== -1) {
    expandedKeys.value.splice(index, 1)
  } else {
    expandedKeys.value.push(key)
  }
}
</script>
```

**说明:**
- Sidebar 不直接支持多级菜单
- 可以通过动态生成扁平数据实现伪二级菜单
- 或者使用其他多级菜单组件

### 3. 为什么禁用的侧边栏项还能点击？

**问题原因:**
- 自定义插槽中的元素拦截了点击事件
- 事件冒泡被阻止
- 禁用状态未正确传递

**解决方案:**

```vue
<template>
  <wd-sidebar v-model="activeKey" :items="items">
    <template #item-0="{ item, active }">
      <view
        class="custom-item"
        :class="{ 'is-disabled': item.disabled }"
        @click.stop="handleCustomClick(item)"
      >
        {{ item.label }}
      </view>
    </template>
  </wd-sidebar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')

const items: SidebarItem[] = [
  { label: '分类1', value: '1', disabled: true, useSlot: true },
  { label: '分类2', value: '2' },
]

const handleCustomClick = (item: SidebarItem) => {
  // 自定义插槽中需要手动检查禁用状态
  if (item.disabled) {
    return
  }
  // 处理点击逻辑
}
</script>

```

**说明:**
- 使用自定义插槽时需要手动处理禁用状态
- 通过 `pointer-events: none` 阻止点击
- 或在点击事件中检查 `disabled` 属性

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:249, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:153-154

### 4. 如何动态修改侧边栏项的样式？

**问题原因:**
- 需要根据不同条件显示不同样式
- 静态样式无法满足需求

**解决方案:**

```vue
<template>
  <wd-sidebar v-model="activeKey" :items="items">
    <template #item-0="{ item, active }">
      <view class="custom-item" :style="getItemStyle(item, active)">
        <wd-icon v-if="item.icon" :name="item.icon" :color="getIconColor(item, active)" />
        <text>{{ item.label }}</text>
      </view>
    </template>
    <template #item-1="{ item, active }">
      <view class="custom-item" :style="getItemStyle(item, active)">
        <wd-icon v-if="item.icon" :name="item.icon" :color="getIconColor(item, active)" />
        <text>{{ item.label }}</text>
      </view>
    </template>
  </wd-sidebar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')

const items: SidebarItem[] = [
  {
    label: '重要',
    value: '1',
    icon: 'warning',
    useSlot: true,
    color: '#ff6b6b',
  },
  {
    label: '普通',
    value: '2',
    icon: 'info',
    useSlot: true,
    color: '#4d80f0',
  },
]

const getItemStyle = (item: SidebarItem, active: boolean) => {
  if (active && item.color) {
    return {
      background: `${item.color}20`,
      borderLeft: `4rpx solid ${item.color}`,
    }
  }
  return {}
}

const getIconColor = (item: SidebarItem, active: boolean) => {
  return active && item.color ? item.color : '#666'
}
</script>

```

**说明:**
- 使用自定义插槽实现动态样式
- 通过 `:style` 绑定动态计算的样式
- 将样式数据存储在 item 的自定义属性中

### 5. 如何实现侧边栏的滚动定位？

**问题原因:**
- 侧边栏项过多时，选中的项可能不在可视区域
- 需要自动滚动到选中项

**解决方案:**

```vue
<template>
  <scroll-view
    :scroll-y="true"
    :scroll-into-view="scrollIntoView"
    class="sidebar-scroll"
  >
    <wd-sidebar v-model="activeKey" :items="items" @change="handleChange" />
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { SidebarItem } from '@/wd/components/wd-sidebar/wd-sidebar.vue'

const activeKey = ref('1')
const scrollIntoView = ref('')

const items: SidebarItem[] = Array.from({ length: 20 }, (_, i) => ({
  label: `分类${i + 1}`,
  value: `${i + 1}`,
}))

const handleChange = (event: { value: string | number }) => {
  // 滚动到选中项
  scrollIntoView.value = `item-${event.value}`
}

// 监听 activeKey 变化，自动滚动
watch(activeKey, (newValue) => {
  scrollIntoView.value = `item-${newValue}`
})
</script>

```

**说明:**
- 使用 `scroll-view` 包裹侧边栏
- 通过 `scroll-into-view` 属性滚动到指定元素
- 需要为每个侧边栏项设置 id

---

## 注意事项

1. **value 唯一性**：每个侧边栏项的 `value` 必须唯一，否则会导致选中状态异常。重复的 value 会导致无法正确识别当前选中项。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:72, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:53

2. **label 必填**：侧边栏项必须设置 `label` 属性，这是显示给用户的文字。如果使用自定义插槽，可以不设置 label，但需要在插槽中提供内容。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:70, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:51

3. **beforeChange 异步处理**：在 `beforeChange` 钩子中执行异步操作时，必须等待操作完成后再调用 `resolve`，否则可能导致切换时机不正确。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:169-182

4. **禁用项不触发事件**：禁用的侧边栏项点击后不会触发 `change` 事件，也不会更新 `modelValue`，但会触发 `item-click` 事件（Items 模式）。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:249, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:153-154

5. **徽标值为 0**：当 `badge` 值为 `0` 时，徽标会显示为 0。如果不想显示，应该设置为 `null` 或不设置 badge 属性。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:74, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:55, 80

6. **插槽使用限制**：子组件模式只支持 `icon` 插槽。Items 模式支持自定义内容插槽和图标插槽，但需要设置 `useSlot` 或 `useIconSlot` 为 `true`。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:85-92, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:8

7. **圆角效果**：激活项的前一项和后一项会自动添加圆角效果（前缀项右下圆角，后缀项右上圆角），这是组件的默认设计。如果不需要，可以通过样式覆盖。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:218-220, 352-358

8. **高度设置**：Sidebar 组件本身高度为 100%，需要为父容器设置具体高度，否则侧边栏可能无法正常显示。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:302

9. **动态修改 items**：动态修改 `items` 数组后，组件会响应式更新。但如果修改的是当前选中项，需要确保新的 items 中仍然存在该 value，否则会自动选中第一项。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:160-162

10. **badgeProps 优先级**：当同时设置 `badgeProps` 和 `badge`、`isDot`、`max` 属性时，badgeProps 中的相同属性优先级更高。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:229-241, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:94-107

11. **事件触发顺序**：点击侧边栏项时，事件触发顺序为：`item-click`/`itemclick` → beforeChange（如果设置）→ `change` → `update:modelValue`。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:248-256, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:153-161

12. **样式隔离**：组件使用 `styleIsolation: 'shared'` 模式，自定义样式时需要注意样式作用域和优先级。使用 `:deep()` 深度选择器可以修改组件内部样式。

参考: src/wd/components/wd-sidebar/wd-sidebar.vue:61, src/wd/components/wd-sidebar-item/wd-sidebar-item.vue:32

---

## 总结

Sidebar 侧边栏组件是一个功能完善、使用灵活的垂直导航组件。通过双模式支持、图标集成、徽标提示、前置钩子等特性，可以满足各类侧边导航场景的需求。

**使用建议:**

- 静态侧边栏优先使用子组件模式
- 动态侧边栏使用 Items 模式
- 重要操作使用 beforeChange 钩子
- 合理使用徽标提示未读消息
- 配合路由实现状态持久化

**适用场景:**

- 商品分类导航
- 设置页面菜单
- 文章/内容分类
- 多Tab页面切换
- 筛选条件侧边栏

**性能优化:**

- 静态数据使用常量定义
- 动态数据使用 ref 或 shallowRef
- 避免频繁修改 items 数组
- 合理使用插槽，避免过度自定义

**最佳体验:**

- 提供清晰的视觉层次
- 禁用状态给予明确反馈
- 徽标信息及时更新
- 配合内容区域提供完整体验
- 响应路由变化保持状态同步
