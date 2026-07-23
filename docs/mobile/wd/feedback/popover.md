---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/popover
---

# Popover 气泡

## 介绍

`Popover` 气泡组件用于展示弹出式的提示信息或操作菜单。相比 Tooltip,Popover 更适合展示复杂内容或操作列表,支持普通模式和菜单模式两种展示形式。组件基于 `usePopover` 组合式函数实现弹出层定位计算,通过 Map 数据结构存储 12 种位置的样式映射,支持动态偏移量和箭头指示器,并集成队列管理系统实现互斥控制(同时只显示一个气泡)。

**核心特性:**

- **双模式支持** - 普通模式(normal)展示文本内容,菜单模式(menu)展示操作列表
- **多方位弹出** - 支持 12 种弹出位置(top/bottom/left/right 及其 start/end 变体)
- **箭头指示器** - 智能计算箭头位置,支持显示/隐藏控制
- **队列管理** - 基于 `clickoutside` 模块实现互斥显示,打开新气泡自动关闭其他
- **受控模式** - 支持 `v-model` 双向绑定控制显示状态
- **自定义内容** - 通过 `content` 插槽完全自定义气泡内容
- **动画过渡** - 内置 fade 淡入淡出动画,过渡时长 200ms
- **暗黑模式** - 完整的暗黑主题适配,通过 `.wot-theme-dark` 类名切换

**技术实现要点:**

- 使用 `getRect` 获取目标元素和弹出层的尺寸信息
- 通过 Map 数据结构预定义 12 种位置的 CSS 样式计算规则
- 箭头尺寸固定为 9px,用于计算偏移量
- 集成 `wd-transition` 组件实现平滑动画效果
- 通过 `inject` 注入队列管理,支持嵌套使用

## 平台兼容性

| 平台 | 支持情况 | 特殊说明 |
|------|----------|----------|
| 微信小程序 | 是 完全支持 | - |
| 支付宝小程序 | 是 完全支持 | - |
| H5 | 是 完全支持 | - |
| App (iOS) | 是 完全支持 | - |
| App (Android) | 是 完全支持 | - |
| 抖音小程序 | 是 完全支持 | - |

## 基本用法

### 普通模式

默认为普通模式(`mode="normal"`),通过 `content` 属性设置文本内容。点击触发元素显示/隐藏气泡。

```vue
<template>
  <view class="demo">
    <wd-popover content="这是一段普通文本提示">
      <wd-button>点击显示</wd-button>
    </wd-popover>
  </view>
</template>
```

**使用说明:**

- 默认插槽中的元素为触发元素,点击触发显示/隐藏
- `content` 在普通模式下必须为字符串类型
- 默认弹出位置为底部(`placement="bottom"`)

### 菜单模式

设置 `mode="menu"` 启用菜单模式,`content` 传入菜单项数组。点击菜单项会触发 `menuclick` 事件并自动关闭气泡。

```vue
<template>
  <view class="demo">
    <wd-popover mode="menu" :content="menuList" @menuclick="handleMenuClick">
      <wd-button>菜单模式</wd-button>
    </wd-popover>
  </view>
</template>

<script lang="ts" setup>
import type { MenuItem } from '@/wd'

const menuList: MenuItem[] = [
  { content: '选项一' },
  { content: '选项二' },
  { content: '选项三' }
]

const handleMenuClick = ({ item, index }: { item: MenuItem; index: number }) => {
  console.log('点击菜单项:', item.content, '索引:', index)
  uni.showToast({
    title: item.content,
    icon: 'none'
  })
}
</script>
```

**使用说明:**

- 菜单模式下 `content` 必须为对象数组
- 每个菜单项包含 `content`(显示文本)和可选的 `iconClass`(图标)
- 点击菜单项后气泡自动关闭,无需手动处理

### 带图标的菜单

菜单项支持 `iconClass` 属性设置图标名称,图标显示在文本左侧。

```vue
<template>
  <view class="demo">
    <wd-popover mode="menu" :content="iconMenuList" @menuclick="handleMenuClick">
      <wd-button>带图标菜单</wd-button>
    </wd-popover>
  </view>
</template>

<script lang="ts" setup>
import type { MenuItem } from '@/wd'

const iconMenuList: MenuItem[] = [
  { content: '编辑', iconClass: 'edit' },
  { content: '删除', iconClass: 'delete' },
  { content: '分享', iconClass: 'share' },
  { content: '收藏', iconClass: 'star' }
]

const handleMenuClick = ({ item, index }: { item: MenuItem; index: number }) => {
  switch (index) {
    case 0:
      console.log('执行编辑操作')
      break
    case 1:
      console.log('执行删除操作')
      break
    case 2:
      console.log('执行分享操作')
      break
    case 3:
      console.log('执行收藏操作')
      break
  }
}
</script>
```

**图标说明:**

- 图标使用 `wd-icon` 组件渲染
- 图标尺寸为 36rpx,右边距 10rpx
- 支持所有 `wd-icon` 可用的图标名称

### 弹出位置

通过 `placement` 属性设置弹出位置,支持 12 种位置。

```vue
<template>
  <view class="demo-placement">
    <!-- 上方 -->
    <view class="row">
      <wd-popover content="top-start" placement="top-start">
        <wd-button size="small">上左</wd-button>
      </wd-popover>
      <wd-popover content="top" placement="top">
        <wd-button size="small">上中</wd-button>
      </wd-popover>
      <wd-popover content="top-end" placement="top-end">
        <wd-button size="small">上右</wd-button>
      </wd-popover>
    </view>

    <!-- 下方 -->
    <view class="row">
      <wd-popover content="bottom-start" placement="bottom-start">
        <wd-button size="small">下左</wd-button>
      </wd-popover>
      <wd-popover content="bottom" placement="bottom">
        <wd-button size="small">下中</wd-button>
      </wd-popover>
      <wd-popover content="bottom-end" placement="bottom-end">
        <wd-button size="small">下右</wd-button>
      </wd-popover>
    </view>

    <!-- 左侧 -->
    <view class="row">
      <wd-popover content="left-start" placement="left-start">
        <wd-button size="small">左上</wd-button>
      </wd-popover>
      <wd-popover content="left" placement="left">
        <wd-button size="small">左中</wd-button>
      </wd-popover>
      <wd-popover content="left-end" placement="left-end">
        <wd-button size="small">左下</wd-button>
      </wd-popover>
    </view>

    <!-- 右侧 -->
    <view class="row">
      <wd-popover content="right-start" placement="right-start">
        <wd-button size="small">右上</wd-button>
      </wd-popover>
      <wd-popover content="right" placement="right">
        <wd-button size="small">右中</wd-button>
      </wd-popover>
      <wd-popover content="right-end" placement="right-end">
        <wd-button size="small">右下</wd-button>
      </wd-popover>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo-placement {
  padding: 100rpx 32rpx;

  .row {
    display: flex;
    justify-content: space-around;
    margin-bottom: 40rpx;
  }
}
</style>
```

**位置说明:**

| 位置 | 说明 |
|------|------|
| `top` | 上方居中 |
| `top-start` | 上方左对齐 |
| `top-end` | 上方右对齐 |
| `bottom` | 下方居中 |
| `bottom-start` | 下方左对齐 |
| `bottom-end` | 下方右对齐 |
| `left` | 左侧居中 |
| `left-start` | 左侧上对齐 |
| `left-end` | 左侧下对齐 |
| `right` | 右侧居中 |
| `right-start` | 右侧上对齐 |
| `right-end` | 右侧下对齐 |

### 偏移量设置

通过 `offset` 属性调整气泡位置的偏移量。

```vue
<template>
  <view class="demo">
    <!-- 单一偏移量 -->
    <wd-popover content="偏移10px" placement="bottom" :offset="10">
      <wd-button>偏移 10</wd-button>
    </wd-popover>

    <!-- 负偏移量 -->
    <wd-popover content="负偏移" placement="bottom" :offset="-10">
      <wd-button>偏移 -10</wd-button>
    </wd-popover>
  </view>
</template>
```

**偏移量计算原理:**

- 偏移量用于调整气泡相对于触发元素的距离
- 正值表示远离触发元素,负值表示靠近
- 对于 `top/bottom` 位置,偏移量影响水平方向
- 对于 `left/right` 位置,偏移量影响垂直方向

### 受控模式

通过 `v-model` 控制气泡的显示状态,实现完全受控。

```vue
<template>
  <view class="demo">
    <wd-popover v-model="visible" content="受控模式的气泡">
      <wd-button>{{ visible ? '点击关闭' : '点击打开' }}</wd-button>
    </wd-popover>

    <!-- 外部控制 -->
    <view class="controls">
      <wd-button type="primary" size="small" @click="visible = true">
        外部打开
      </wd-button>
      <wd-button type="error" size="small" @click="visible = false">
        外部关闭
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
</script>

<style lang="scss" scoped>
.controls {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}
</style>
```

**使用说明:**

- `v-model` 实现双向绑定,组件内部状态变化会同步到外部
- 可以通过外部按钮或逻辑控制气泡显示
- 受控模式下点击触发元素仍然有效

### 显示关闭按钮

设置 `show-close` 显示关闭按钮,点击关闭按钮关闭气泡。

```vue
<template>
  <view class="demo">
    <wd-popover content="带关闭按钮的气泡" show-close>
      <wd-button>显示关闭按钮</wd-button>
    </wd-popover>

    <!-- 配合长内容使用 -->
    <wd-popover
      show-close
      content="这是一段比较长的提示文本,用户可以点击右上角的关闭按钮来关闭气泡。"
    >
      <wd-button>长文本带关闭</wd-button>
    </wd-popover>
  </view>
</template>
```

**关闭按钮说明:**

- 关闭按钮位于气泡右上角
- 按钮尺寸为 24rpx,使用 `scale(0.5)` 缩放
- 点击关闭按钮触发 `close` 事件

### 隐藏箭头

设置 `visible-arrow` 为 `false` 隐藏箭头指示器。

```vue
<template>
  <view class="demo">
    <wd-popover content="无箭头气泡" :visible-arrow="false">
      <wd-button>隐藏箭头</wd-button>
    </wd-popover>

    <!-- 菜单模式无箭头 -->
    <wd-popover
      mode="menu"
      :content="menuList"
      :visible-arrow="false"
      @menuclick="handleMenuClick"
    >
      <wd-button>菜单无箭头</wd-button>
    </wd-popover>
  </view>
</template>

<script lang="ts" setup>
const menuList = [
  { content: '选项一' },
  { content: '选项二' },
  { content: '选项三' }
]

const handleMenuClick = ({ item, index }) => {
  console.log('点击:', item.content)
}
</script>
```

**箭头说明:**

- 箭头使用 CSS 伪元素实现正方形旋转效果
- 箭头尺寸由 `$-popover-arrow-size` 变量控制
- 隐藏箭头后偏移计算会调整(`arrowSize` 变为 0)

### 自定义内容

通过 `content` 插槽自定义气泡内容,需设置 `use-content-slot` 为 `true`。

```vue
<template>
  <view class="demo">
    <wd-popover use-content-slot>
      <template #content>
        <view class="custom-popover">
          <image src="/static/avatar.png" class="avatar" mode="aspectFill" />
          <view class="info">
            <text class="name">用户昵称</text>
            <text class="desc">这是用户的个人简介信息</text>
          </view>
        </view>
      </template>
      <wd-button>自定义内容</wd-button>
    </wd-popover>
  </view>
</template>

<style lang="scss" scoped>
.custom-popover {
  display: flex;
  align-items: center;
  padding: 24rpx;
  min-width: 300rpx;

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .info {
    margin-left: 20rpx;
    display: flex;
    flex-direction: column;

    .name {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }

    .desc {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }
}
</style>
```

**自定义内容说明:**

- 必须设置 `use-content-slot` 才能使用内容插槽
- 插槽内容完全自定义,可以放置任意组件
- 注意控制内容宽度,避免超出屏幕

### 禁用状态

设置 `disabled` 禁用气泡,禁用后点击触发元素不会显示气泡。

```vue
<template>
  <view class="demo">
    <wd-popover content="禁用状态" disabled>
      <wd-button disabled>禁用的气泡</wd-button>
    </wd-popover>

    <!-- 动态禁用 -->
    <wd-popover content="动态禁用" :disabled="isDisabled">
      <wd-button>{{ isDisabled ? '已禁用' : '正常状态' }}</wd-button>
    </wd-popover>

    <wd-button @click="isDisabled = !isDisabled">
      切换禁用状态
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDisabled = ref(false)
</script>
```

### 方法调用

通过 ref 获取组件实例,调用 `open`/`close` 方法控制显示。

```vue
<template>
  <view class="demo">
    <wd-popover ref="popoverRef" content="方法控制的气泡">
      <wd-button>目标元素</wd-button>
    </wd-popover>

    <view class="controls">
      <wd-button type="primary" @click="handleOpen">打开</wd-button>
      <wd-button type="error" @click="handleClose">关闭</wd-button>
      <wd-button @click="handleToggle">切换</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { PopoverInstance } from '@/wd'

const popoverRef = ref<PopoverInstance>()
const isOpen = ref(false)

const handleOpen = () => {
  popoverRef.value?.open()
  isOpen.value = true
}

const handleClose = () => {
  popoverRef.value?.close()
  isOpen.value = false
}

const handleToggle = () => {
  if (isOpen.value) {
    handleClose()
  } else {
    handleOpen()
  }
}
</script>

<style lang="scss" scoped>
.controls {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}
</style>
```

### 事件监听

监听气泡的打开、关闭和状态变化事件。

```vue
<template>
  <view class="demo">
    <wd-popover
      content="事件监听示例"
      @open="handleOpen"
      @close="handleClose"
      @change="handleChange"
    >
      <wd-button>事件监听</wd-button>
    </wd-popover>

    <view class="status">
      当前状态: {{ status }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const status = ref('已关闭')

const handleOpen = () => {
  console.log('气泡打开')
  status.value = '已打开'
}

const handleClose = () => {
  console.log('气泡关闭')
  status.value = '已关闭'
}

const handleChange = ({ show }: { show: boolean }) => {
  console.log('状态变化:', show)
}
</script>
```

## 高级用法

### 操作菜单

创建常见的操作菜单,通常放置在列表项或更多按钮上。

```vue
<template>
  <view class="demo">
    <view class="list-item">
      <view class="item-content">
        <text class="title">列表项标题</text>
        <text class="desc">列表项描述信息</text>
      </view>
      <wd-popover
        mode="menu"
        :content="actionMenu"
        placement="bottom-end"
        @menuclick="handleAction"
      >
        <wd-icon name="more" size="48rpx" color="#666" />
      </wd-popover>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { MenuItem } from '@/wd'

const actionMenu: MenuItem[] = [
  { content: '编辑', iconClass: 'edit' },
  { content: '复制', iconClass: 'copy' },
  { content: '移动', iconClass: 'folder' },
  { content: '删除', iconClass: 'delete' }
]

const handleAction = ({ item, index }: { item: MenuItem; index: number }) => {
  const actions = ['edit', 'copy', 'move', 'delete']
  console.log(`执行 ${actions[index]} 操作`)

  switch (index) {
    case 0:
      uni.showToast({ title: '编辑功能', icon: 'none' })
      break
    case 1:
      uni.showToast({ title: '复制成功', icon: 'success' })
      break
    case 2:
      uni.showToast({ title: '移动功能', icon: 'none' })
      break
    case 3:
      uni.showModal({
        title: '确认删除',
        content: '删除后无法恢复',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
      break
  }
}
</script>

<style lang="scss" scoped>
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;

  .item-content {
    display: flex;
    flex-direction: column;

    .title {
      font-size: 32rpx;
      color: #333;
    }

    .desc {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }
}
</style>
```

### 用户信息卡片

创建悬浮用户信息卡片。

```vue
<template>
  <view class="demo">
    <text>文章作者: </text>
    <wd-popover use-content-slot placement="bottom-start">
      <template #content>
        <view class="user-card">
          <image :src="userInfo.avatar" class="avatar" mode="aspectFill" />
          <view class="info">
            <text class="name">{{ userInfo.name }}</text>
            <text class="role">{{ userInfo.role }}</text>
            <text class="bio">{{ userInfo.bio }}</text>
          </view>
          <view class="actions">
            <wd-button size="small" type="primary" @click="handleFollow">
              {{ userInfo.isFollowed ? '已关注' : '关注' }}
            </wd-button>
            <wd-button size="small" @click="handleMessage">私信</wd-button>
          </view>
        </view>
      </template>
      <text class="username">@{{ userInfo.name }}</text>
    </wd-popover>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const userInfo = reactive({
  avatar: '/static/avatar.png',
  name: '张三',
  role: '高级前端工程师',
  bio: '热爱技术,专注于移动端开发和跨平台解决方案。',
  isFollowed: false
})

const handleFollow = () => {
  userInfo.isFollowed = !userInfo.isFollowed
  uni.showToast({
    title: userInfo.isFollowed ? '关注成功' : '已取消关注',
    icon: 'success'
  })
}

const handleMessage = () => {
  uni.showToast({ title: '私信功能', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.username {
  color: #1890ff;
  cursor: pointer;
}

.user-card {
  padding: 24rpx;
  min-width: 400rpx;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    display: block;
    margin: 0 auto;
  }

  .info {
    text-align: center;
    margin-top: 16rpx;

    .name {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      display: block;
    }

    .role {
      font-size: 24rpx;
      color: #666;
      margin-top: 8rpx;
      display: block;
    }

    .bio {
      font-size: 24rpx;
      color: #999;
      margin-top: 12rpx;
      display: block;
      line-height: 1.5;
    }
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 20rpx;
    margin-top: 24rpx;
  }
}
</style>
```

### 筛选菜单

创建下拉筛选菜单,常用于列表页面的筛选功能。

```vue
<template>
  <view class="demo">
    <view class="filter-bar">
      <wd-popover
        v-model="filterVisible"
        mode="menu"
        :content="filterOptions"
        placement="bottom-start"
        @menuclick="handleFilter"
      >
        <view class="filter-btn">
          <text>{{ currentFilter }}</text>
          <wd-icon :name="filterVisible ? 'arrow-up' : 'arrow-down'" size="24rpx" />
        </view>
      </wd-popover>

      <wd-popover
        v-model="sortVisible"
        mode="menu"
        :content="sortOptions"
        placement="bottom-end"
        @menuclick="handleSort"
      >
        <view class="filter-btn">
          <text>{{ currentSort }}</text>
          <wd-icon :name="sortVisible ? 'arrow-up' : 'arrow-down'" size="24rpx" />
        </view>
      </wd-popover>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { MenuItem } from '@/wd'

const filterVisible = ref(false)
const sortVisible = ref(false)

const currentFilter = ref('全部状态')
const currentSort = ref('最新优先')

const filterOptions: MenuItem[] = [
  { content: '全部状态' },
  { content: '待处理' },
  { content: '处理中' },
  { content: '已完成' },
  { content: '已取消' }
]

const sortOptions: MenuItem[] = [
  { content: '最新优先' },
  { content: '最早优先' },
  { content: '价格升序' },
  { content: '价格降序' }
]

const handleFilter = ({ item }: { item: MenuItem }) => {
  currentFilter.value = item.content
  console.log('筛选条件:', item.content)
}

const handleSort = ({ item }: { item: MenuItem }) => {
  currentSort.value = item.content
  console.log('排序方式:', item.content)
}
</script>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  justify-content: space-between;
  padding: 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #333;
  font-size: 28rpx;
}
</style>
```

### 互斥显示

同一页面多个气泡互斥显示,打开一个自动关闭其他。

```vue
<template>
  <view class="demo">
    <view class="popover-group">
      <wd-popover content="气泡 A" placement="bottom">
        <wd-button>气泡 A</wd-button>
      </wd-popover>

      <wd-popover content="气泡 B" placement="bottom">
        <wd-button>气泡 B</wd-button>
      </wd-popover>

      <wd-popover content="气泡 C" placement="bottom">
        <wd-button>气泡 C</wd-button>
      </wd-popover>
    </view>

    <text class="hint">点击任意按钮,其他已打开的气泡会自动关闭</text>
  </view>
</template>

<style lang="scss" scoped>
.popover-group {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.hint {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 24rpx;
}
</style>
```

**互斥原理:**

组件内部通过队列管理实现互斥:

1. 组件挂载时通过 `pushToQueue` 加入队列
2. 显示时调用 `closeOther` 关闭其他组件
3. 卸载时通过 `removeFromQueue` 从队列移除

### 自定义样式

通过 `custom-class`、`custom-pop`、`custom-arrow` 自定义样式。

```vue
<template>
  <view class="demo">
    <!-- 自定义弹出层样式 -->
    <wd-popover
      content="自定义样式的气泡"
      custom-pop="custom-pop-style"
    >
      <wd-button>自定义样式</wd-button>
    </wd-popover>

    <!-- 自定义箭头样式 -->
    <wd-popover
      content="自定义箭头"
      custom-arrow="custom-arrow-style"
    >
      <wd-button>自定义箭头</wd-button>
    </wd-popover>
  </view>
</template>

<style lang="scss">
// 注意: 自定义样式需要在全局样式或非 scoped 样式中定义

.custom-pop-style {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: #fff !important;
}

.custom-arrow-style {
  // 自定义箭头颜色
}
</style>
```

### 结合表单使用

在表单中使用气泡提供字段说明。

```vue
<template>
  <view class="demo">
    <wd-cell-group>
      <wd-cell title="用户名" title-width="200rpx">
        <template #title>
          <view class="cell-title">
            <text>用户名</text>
            <wd-popover content="用户名长度4-16位,支持字母、数字、下划线" placement="top">
              <wd-icon name="question" size="32rpx" color="#999" />
            </wd-popover>
          </view>
        </template>
        <wd-input v-model="form.username" placeholder="请输入用户名" />
      </wd-cell>

      <wd-cell title="密码" title-width="200rpx">
        <template #title>
          <view class="cell-title">
            <text>密码</text>
            <wd-popover
              use-content-slot
              placement="top"
            >
              <template #content>
                <view class="password-tips">
                  <text class="tip-title">密码要求:</text>
                  <text class="tip-item">• 长度8-20位</text>
                  <text class="tip-item">• 必须包含字母和数字</text>
                  <text class="tip-item">• 可包含特殊字符</text>
                </view>
              </template>
              <wd-icon name="question" size="32rpx" color="#999" />
            </wd-popover>
          </view>
        </template>
        <wd-input v-model="form.password" type="password" placeholder="请输入密码" />
      </wd-cell>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  username: '',
  password: ''
})
</script>

<style lang="scss" scoped>
.cell-title {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.password-tips {
  padding: 16rpx;

  .tip-title {
    font-weight: bold;
    display: block;
    margin-bottom: 12rpx;
  }

  .tip-item {
    display: block;
    font-size: 24rpx;
    color: #666;
    line-height: 1.8;
  }
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 控制气泡显示状态 | `boolean` | `false` |
| mode | 展示模式 | `'normal' \| 'menu'` | `'normal'` |
| content | 显示内容(普通模式为字符串,菜单模式为数组) | `string \| MenuItem[]` | - |
| placement | 弹出位置 | `PlacementType` | `'bottom'` |
| offset | 偏移量 | `number` | `0` |
| visible-arrow | 是否显示箭头 | `boolean` | `true` |
| use-content-slot | 是否使用 content 插槽 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| show-close | 是否显示关闭按钮 | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-arrow | 自定义箭头样式类 | `string` | `''` |
| custom-pop | 自定义弹出层样式类 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 显示状态更新时触发(用于 v-model) | `value: boolean` |
| change | 显示状态变化时触发 | `{ show: boolean }` |
| open | 打开时触发 | - |
| close | 关闭时触发 | - |
| menuclick | 菜单项点击时触发(仅菜单模式) | `{ item: MenuItem, index: number }` |

### Slots

| 名称 | 说明 |
|------|------|
| default | 触发气泡的元素 |
| content | 自定义气泡内容(需设置 `use-content-slot`) |

### Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开气泡 | - | - |
| close | 关闭气泡 | - | - |

### 类型定义

```typescript
/**
 * 弹出位置类型
 * 支持 12 种位置,由主方向(top/bottom/left/right)和对齐方式(start/end)组合
 */
export type PlacementType =
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
 * 弹出框模式
 */
type PopoverMode = 'menu' | 'normal'

/**
 * 菜单项类型
 */
interface MenuItem {
  /** 菜单项内容 */
  content: string
  /** 图标类名 */
  iconClass?: string
}

/**
 * 气泡组件属性接口
 */
interface WdPopoverProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 自定义箭头样式类 */
  customArrow?: string
  /** 自定义弹出层样式类 */
  customPop?: string
  /** 是否显示 popover 箭头 */
  visibleArrow?: boolean
  /** 显示的内容，也可以通过 slot#content 传入 */
  content?: string | MenuItem[]
  /** 指定 popover 的放置位置 */
  placement?: PlacementType
  /** 偏移量 */
  offset?: number
  /** 是否使用内容插槽 */
  useContentSlot?: boolean
  /** 是否禁用 popover */
  disabled?: boolean
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 控制 popover 的显示状态 */
  modelValue?: boolean
  /** 当前显示的模式 */
  mode?: PopoverMode
}

/**
 * 气泡组件事件接口
 */
interface WdPopoverEmits {
  /** 显示状态更新时触发 */
  'update:modelValue': [value: boolean]
  /** 菜单项点击时触发 */
  menuclick: [{ item: MenuItem; index: number }]
  /** 显示状态变化时触发 */
  change: [{ show: boolean }]
  /** 打开时触发 */
  open: []
  /** 关闭时触发 */
  close: []
}

/**
 * 气泡组件暴露的方法接口
 */
interface WdPopoverExpose {
  /** 打开 popover */
  open: () => void
  /** 关闭 popover */
  close: () => void
}

/**
 * Popover 组件实例类型
 */
type PopoverInstance = ComponentPublicInstance<WdPopoverProps, WdPopoverExpose>
```

## 主题定制

### CSS 变量

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `--wd-popover-bg` | 背景颜色 | `#ffffff` |
| `--wd-popover-color` | 文字颜色 | `#333333` |
| `--wd-popover-fs` | 字体大小 | `28rpx` |
| `--wd-popover-padding` | 内边距 | `24rpx` |
| `--wd-popover-radius` | 圆角大小 | `8rpx` |
| `--wd-popover-line-height` | 行高 | `40rpx` |
| `--wd-popover-z-index` | 层级 | `500` |
| `--wd-popover-box-shadow` | 阴影 | `0 4rpx 20rpx rgba(0, 0, 0, 0.1)` |
| `--wd-popover-arrow-size` | 箭头尺寸 | `9px` |
| `--wd-popover-border-color` | 菜单分隔线颜色 | `#f0f0f0` |

### 主题定制示例

```vue
<template>
  <view class="custom-theme">
    <wd-popover content="自定义主题">
      <wd-button>自定义主题</wd-button>
    </wd-popover>
  </view>
</template>

<style lang="scss" scoped>
.custom-theme {
  // 浅蓝色主题
  --wd-popover-bg: #e6f7ff;
  --wd-popover-color: #1890ff;
  --wd-popover-radius: 16rpx;
  --wd-popover-box-shadow: 0 8rpx 32rpx rgba(24, 144, 255, 0.2);
}
</style>
```

### 暗黑模式

组件内置暗黑模式支持,通过 `.wot-theme-dark` 类名自动切换:

```scss
// 暗黑模式下的默认样式
.wot-theme-dark .wd-popover__pos {
  background: rgb(75, 76, 77);
  color: var(--wd-dark-color);
  box-shadow: 0 4rpx 20rpx 0 rgba(75, 76, 77, 0.1);
}

.wot-theme-dark .wd-popover__menu {
  background: rgb(75, 76, 77);
}

.wot-theme-dark .wd-popover__inner {
  background-color: rgb(75, 76, 77);
}
```

## 最佳实践

### 1. 合理选择模式

```typescript
// ✅ 简单文本提示使用普通模式
<wd-popover content="这是一段提示文字">
  <wd-button>普通提示</wd-button>
</wd-popover>

// ✅ 操作列表使用菜单模式
<wd-popover mode="menu" :content="menuList">
  <wd-button>操作菜单</wd-button>
</wd-popover>

// ✅ 复杂内容使用自定义插槽
<wd-popover use-content-slot>
  <template #content>
    <view class="complex-content">...</view>
  </template>
  <wd-button>复杂内容</wd-button>
</wd-popover>

// ❌ 避免在普通模式传入数组
<wd-popover :content="menuList">  // 会报错
  <wd-button>错误用法</wd-button>
</wd-popover>
```

### 2. 正确选择弹出位置

```typescript
// ✅ 根据触发元素位置选择
// 顶部导航栏 → bottom 或 bottom-start
<wd-popover placement="bottom-start">

// 底部工具栏 → top 或 top-start
<wd-popover placement="top-start">

// 列表项右侧更多按钮 → bottom-end 或 left
<wd-popover placement="bottom-end">

// ✅ 考虑屏幕边缘
// 靠近左边缘的元素 → 使用 *-start
// 靠近右边缘的元素 → 使用 *-end
```

### 3. 菜单项设计

```typescript
// ✅ 菜单项数量适中(3-6个)
const goodMenu = [
  { content: '编辑', iconClass: 'edit' },
  { content: '删除', iconClass: 'delete' },
  { content: '分享', iconClass: 'share' }
]

// ❌ 菜单项过多(超过8个考虑使用其他组件)
const badMenu = [
  { content: '选项1' },
  { content: '选项2' },
  // ... 10+ 选项
]

// ✅ 图标保持一致性
const consistentMenu = [
  { content: '查看', iconClass: 'view' },      // 都有图标
  { content: '编辑', iconClass: 'edit' },
  { content: '删除', iconClass: 'delete' }
]

// ❌ 图标不一致
const inconsistentMenu = [
  { content: '查看', iconClass: 'view' },
  { content: '编辑' },                          // 缺少图标
  { content: '删除', iconClass: 'delete' }
]
```

### 4. 性能优化

```typescript
// ✅ 避免在 v-for 中创建大量气泡
// 对于长列表,考虑共用一个气泡实例
<template>
  <view v-for="item in list" :key="item.id">
    <text @click="showPopover(item)">{{ item.name }}</text>
  </view>

  <!-- 共用一个气泡 -->
  <wd-popover
    ref="sharedPopover"
    v-model="popoverVisible"
    :content="currentContent"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const popoverVisible = ref(false)
const currentContent = ref('')

const showPopover = (item) => {
  currentContent.value = item.description
  popoverVisible.value = true
}
</script>
```

### 5. 无障碍访问

```typescript
// ✅ 为触发元素提供清晰的视觉提示
<wd-popover content="点击获取帮助">
  <wd-button>
    <wd-icon name="question" />
    <text>帮助</text>
  </wd-button>
</wd-popover>

// ✅ 重要操作使用确认对话框而非气泡
// 气泡适合提示信息,不适合重要操作确认
```

## 常见问题

### 1. 菜单项点击后气泡不关闭?

组件默认点击菜单项后会自动关闭,如果没有关闭,检查以下情况:

**原因 1**: 事件处理中阻止了冒泡

```typescript
// ❌ 错误:阻止了事件冒泡
const handleMenuClick = (e) => {
  e.stopPropagation()  // 这会阻止气泡关闭
}

// ✅ 正确:不阻止冒泡
const handleMenuClick = ({ item, index }) => {
  // 正常处理逻辑
}
```

**原因 2**: 使用了受控模式但未处理状态

```typescript
// ❌ 错误:v-model 但未在事件中更新
<wd-popover v-model="visible" mode="menu" :content="menu">

// ✅ 正确:组件内部会自动更新 v-model
// 或者在 menuclick 中手动处理
const handleMenuClick = () => {
  visible.value = false
}
```

### 2. 自定义内容样式不生效?

**原因**: 忘记设置 `use-content-slot` 属性

```vue
<!-- ❌ 错误:未设置 use-content-slot -->
<wd-popover>
  <template #content>
    <view>内容不会显示</view>
  </template>
  <wd-button>触发</wd-button>
</wd-popover>

<!-- ✅ 正确:设置 use-content-slot -->
<wd-popover use-content-slot>
  <template #content>
    <view>内容正常显示</view>
  </template>
  <wd-button>触发</wd-button>
</wd-popover>
```

### 3. 气泡位置不正确?

**原因 1**: 触发元素没有正确的尺寸

```vue
<!-- ❌ 错误:行内元素可能没有正确尺寸 -->
<wd-popover content="提示">
  <text>文字</text>
</wd-popover>

<!-- ✅ 正确:使用块级元素或设置 display -->
<wd-popover content="提示">
  <view class="trigger">文字</view>
</wd-popover>
```

**原因 2**: 父容器有 `overflow: hidden`

```vue
<!-- ❌ 父容器裁剪导致气泡被截断 -->
<view style="overflow: hidden;">
  <wd-popover content="可能被截断" placement="top">
    <wd-button>触发</wd-button>
  </wd-popover>
</view>

<!-- ✅ 移除 overflow 或调整弹出位置 -->
```

**原因 3**: 组件还未完成初始化

```typescript
// 组件需要在 mounted 后获取元素尺寸
// 如果动态创建触发元素,需要等待渲染完成
await nextTick()
popoverRef.value?.open()
```

### 4. 普通模式和菜单模式的区别?

| 特性 | 普通模式(normal) | 菜单模式(menu) |
|------|------------------|----------------|
| content 类型 | `string` | `MenuItem[]` |
| 适用场景 | 文本提示 | 操作列表 |
| 点击行为 | 点击气泡不关闭 | 点击菜单项自动关闭 |
| 支持图标 | 不支持 | 支持 `iconClass` |
| 样式 | 普通文本样式 | 列表样式带分隔线 |

### 5. 如何在气泡中放置按钮?

```vue
<template>
  <wd-popover v-model="visible" use-content-slot>
    <template #content>
      <view class="popover-content">
        <text>确定要删除吗?</text>
        <view class="buttons">
          <wd-button size="small" @click="handleCancel">取消</wd-button>
          <wd-button size="small" type="error" @click="handleConfirm">
            删除
          </wd-button>
        </view>
      </view>
    </template>
    <wd-button>删除</wd-button>
  </wd-popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)

const handleCancel = () => {
  visible.value = false
}

const handleConfirm = () => {
  visible.value = false
  // 执行删除逻辑
}
</script>
```

### 6. 气泡在滚动时位置错乱?

气泡使用 `position: absolute` 定位,滚动时位置可能出现偏移。

**解决方案:**

```typescript
// 方案 1: 滚动时关闭气泡
<scroll-view @scroll="handleScroll">
  <wd-popover ref="popoverRef" content="提示">
    <wd-button>触发</wd-button>
  </wd-popover>
</scroll-view>

const handleScroll = () => {
  popoverRef.value?.close()
}

// 方案 2: 使用固定定位的遮罩层
<wd-popover content="提示" :cover="true">
  <wd-button>触发</wd-button>
</wd-popover>
```

### 7. 如何动态更新气泡内容?

```vue
<template>
  <wd-popover :content="dynamicContent">
    <wd-button @click="updateContent">动态内容</wd-button>
  </wd-popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dynamicContent = ref('初始内容')

const updateContent = () => {
  dynamicContent.value = `更新时间: ${new Date().toLocaleTimeString()}`
}
</script>
```

### 8. TypeScript 类型报错?

```typescript
// ✅ 正确导入类型
import type { PopoverInstance, MenuItem, PlacementType } from '@/wd'

// 组件 ref 类型
const popoverRef = ref<PopoverInstance>()

// 菜单项类型
const menuList: MenuItem[] = [
  { content: '选项一' },
  { content: '选项二' }
]

// 位置类型
const placement: PlacementType = 'bottom-start'
```

## 总结

`Popover` 气泡组件的核心使用要点:

1. **模式选择** - 文本提示用 `normal`,操作列表用 `menu`,复杂内容用插槽
2. **位置设置** - 根据触发元素位置和屏幕边缘选择合适的 `placement`
3. **受控模式** - 需要外部控制时使用 `v-model`,否则组件自行管理
4. **自定义内容** - 使用插槽时必须设置 `use-content-slot`
5. **互斥显示** - 同页面多个气泡自动互斥,无需额外处理
6. **方法调用** - 通过 ref 获取实例调用 `open`/`close` 方法
7. **主题定制** - 使用 CSS 变量自定义样式,支持暗黑模式
