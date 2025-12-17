# 导航组件

导航组件用于页面导航和内容切换，提供导航栏、标签栏、标签页、索引栏、分页器等核心功能。

## 组件列表

| 组件 | 说明 |
|------|------|
| Navbar | 导航栏，页面顶部导航 |
| Tabbar | 标签栏，底部标签导航 |
| Tabs | 标签页，内容切换 |
| Sidebar | 侧边栏，侧边导航 |
| IndexBar | 索引栏，字母索引 |
| Pagination | 分页器，数据分页 |
| Segmented | 分段器，分段选择 |
| Backtop | 返回顶部 |

---

## Navbar 导航栏

导航栏组件用于页面顶部导航，支持标题、左右操作按钮、胶囊组件、自动返回等功能。

### 基本用法

```vue
<template>
  <!-- 基本标题 -->
  <wd-navbar title="页面标题" />

  <!-- 返回按钮 -->
  <wd-navbar title="详情页" show-back />

  <!-- 左侧自定义 -->
  <wd-navbar title="页面标题" left-icon="close" left-text="关闭" @click-left="handleClose" />

  <!-- 右侧操作 -->
  <wd-navbar title="页面标题" right-icon="search" @click-right="handleSearch" />
</template>

<script lang="ts" setup>
const handleClose = () => uni.navigateBack()
const handleSearch = () => console.log('搜索')
</script>
```

### 自定义插槽

```vue
<template>
  <wd-navbar>
    <template #left>
      <wd-icon name="scan" size="40rpx" />
    </template>
    <template #title>
      <view class="flex items-center">
        <image src="/static/logo.png" class="w-48rpx h-48rpx mr-12rpx" />
        <text>应用名称</text>
      </view>
    </template>
    <template #right>
      <wd-icon name="more" size="40rpx" />
    </template>
  </wd-navbar>
</template>
```

### 胶囊模式

```vue
<template>
  <wd-navbar title="胶囊导航" capsule show-back show-home @back="handleBack" @back-home="handleBackHome" />
</template>

<script lang="ts" setup>
const handleBack = () => uni.navigateBack()
const handleBackHome = () => uni.switchTab({ url: '/pages/index/index' })
</script>
```

### 自定义样式

```vue
<template>
  <wd-navbar title="自定义样式" bg-color="#1989fa" title-color="#fff" left-icon-color="#fff" :bordered="false" />
</template>
```

### Navbar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标题文字 | `string` | - |
| title-size | 标题字体大小 | `string \| number` | - |
| title-bold | 标题是否加粗 | `boolean` | `false` |
| title-color | 标题颜色 | `string` | - |
| left-text | 左侧文字 | `string` | - |
| left-icon | 左侧图标 | `string` | - |
| left-icon-size | 左侧图标大小 | `string \| number` | `32` |
| left-icon-color | 左侧图标颜色 | `string` | - |
| left-disabled | 是否禁用左侧按钮 | `boolean` | `false` |
| right-text | 右侧文字 | `string` | - |
| right-icon | 右侧图标 | `string` | - |
| right-icon-size | 右侧图标大小 | `string \| number` | `32` |
| right-icon-color | 右侧图标颜色 | `string` | - |
| right-disabled | 是否禁用右侧按钮 | `boolean` | `false` |
| bg-color | 背景颜色 | `string` | - |
| height | 导航栏高度 | `string \| number` | - |
| bordered | 是否显示下边框 | `boolean` | `false` |
| fixed | 是否固定在顶部 | `boolean` | `true` |
| placeholder | 是否生成占位元素 | `boolean` | `true` |
| z-index | 层级 | `number` | `99` |
| safe-area-inset-top | 是否适配顶部安全区 | `boolean` | `true` |
| capsule | 是否显示胶囊组件 | `boolean` | `false` |
| show-back | 是否显示返回按钮 | `boolean` | `false` |
| show-home | 是否显示首页按钮 | `boolean` | `false` |
| auto-back | 是否自动处理返回操作 | `boolean` | `true` |
| auto-hide-in-wechat-h5 | 在微信公众号H5中自动隐藏 | `boolean` | `true` |
| status-bar-text-style | 状态栏文字颜色 | `'dark' \| 'light'` | `'dark'` |

### Navbar Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| back | 点击返回按钮时触发 | - |
| back-home | 点击首页按钮时触发 | - |
| click-left | 点击左侧区域时触发 | - |
| click-right | 点击右侧区域时触发 | - |
| height-ready | 导航栏高度计算完成时触发 | `height: number` |

### Navbar Slots

| 名称 | 说明 |
|------|------|
| left | 自定义左侧内容 |
| title | 自定义标题内容 |
| right | 自定义右侧内容 |
| capsule | 自定义胶囊组件 |

---

## Tabbar 标签栏

底部标签栏组件，用于在不同页面之间进行切换。

### 基本用法

```vue
<template>
  <!-- 子组件模式 -->
  <wd-tabbar v-model="active">
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="category" title="分类" />
    <wd-tabbar-item icon="cart" title="购物车" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>
</template>

<script lang="ts" setup>
const active = ref(0)
</script>
```

### 数据驱动模式

```vue
<template>
  <wd-tabbar v-model="active" :items="tabbarItems" @change="handleChange" />
</template>

<script lang="ts" setup>
const active = ref(0)
const tabbarItems = ref([
  { icon: 'home', title: '首页', name: 'home' },
  { icon: 'category', title: '分类', name: 'category' },
  { icon: 'cart', title: '购物车', name: 'cart', value: 3 },
  { icon: 'user', title: '我的', name: 'mine' },
])
const handleChange = (value: string | number) => console.log('切换到:', value)
</script>
```

### 徽标与样式

```vue
<template>
  <!-- 徽标显示 -->
  <wd-tabbar v-model="active">
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="message" title="消息" :value="5" />
    <wd-tabbar-item icon="cart" title="购物车" :value="99" :max="99" />
    <wd-tabbar-item icon="user" title="我的" is-dot />
  </wd-tabbar>

  <!-- 自定义颜色 -->
  <wd-tabbar v-model="active" active-color="#07c160" inactive-color="#999">
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>

  <!-- 圆形样式 -->
  <wd-tabbar v-model="active" shape="round">
    <wd-tabbar-item icon="home" title="首页" />
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>
</template>
```

### Tabbar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前选中标签的索引或名称 | `number \| string` | `0` |
| items | 标签栏配置列表 | `WdTabbarItemProps[]` | `[]` |
| fixed | 是否固定在底部 | `boolean` | `true` |
| bordered | 是否显示顶部边框 | `boolean` | `true` |
| safe-area-inset-bottom | 是否适配底部安全区 | `boolean` | `true` |
| shape | 标签栏形状 | `'default' \| 'round'` | `'default'` |
| active-color | 激活标签的颜色 | `string` | - |
| inactive-color | 未激活标签的颜色 | `string` | - |
| placeholder | 是否生成占位元素 | `boolean` | `true` |
| z-index | 层级 | `number` | `99` |

### Tabbar Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 切换标签时触发 | `value: number \| string` |

### TabbarItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 标签名称 | `string \| number` | - |
| icon | 图标名称 | `string` | - |
| active-icon | 激活时的图标名称 | `string` | - |
| title | 标题文字 | `string` | - |
| value | 徽标显示值 | `string \| number` | - |
| is-dot | 是否显示小红点 | `boolean` | `false` |
| max | 徽标最大值 | `number` | `99` |

---

## Tabs 标签页

标签页组件用于在不同的内容区域之间进行切换。

### 基本用法

```vue
<template>
  <wd-tabs v-model="activeTab">
    <wd-tab title="标签1">内容1</wd-tab>
    <wd-tab title="标签2">内容2</wd-tab>
    <wd-tab title="标签3">内容3</wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
const activeTab = ref(0)
</script>
```

### 数据驱动模式

```vue
<template>
  <wd-tabs v-model="activeTab" :items="tabItems">
    <template #default="{ item }">
      <view class="tab-content">{{ item.title }} 的内容</view>
    </template>
  </wd-tabs>
</template>

<script lang="ts" setup>
const tabItems = [
  { title: '推荐', name: 'recommend' },
  { title: '热门', name: 'hot' },
  { title: '最新', name: 'latest' },
]
</script>
```

### 滑动与动画

```vue
<template>
  <!-- 滑动切换 -->
  <wd-tabs v-model="activeTab" swipeable>
    <wd-tab title="标签1">内容1</wd-tab>
    <wd-tab title="标签2">内容2</wd-tab>
  </wd-tabs>

  <!-- 粘性布局 -->
  <wd-tabs v-model="activeTab" sticky :offset-top="0">
    <wd-tab title="标签1">
      <view style="height: 800rpx;">长内容1</view>
    </wd-tab>
  </wd-tabs>

  <!-- 切换动画 -->
  <wd-tabs v-model="activeTab" animated :duration="300">
    <wd-tab title="标签1">内容1</wd-tab>
    <wd-tab title="标签2">内容2</wd-tab>
  </wd-tabs>
</template>
```

### 自定义样式

```vue
<template>
  <!-- 自定义颜色 -->
  <wd-tabs v-model="activeTab" color="#1989fa" inactive-color="#999">
    <wd-tab title="标签1">内容1</wd-tab>
  </wd-tabs>

  <!-- 底部条样式 -->
  <wd-tabs v-model="activeTab" line-width="40" line-height="4">
    <wd-tab title="标签1">内容1</wd-tab>
  </wd-tabs>
</template>
```

### 禁用与导航地图

```vue
<template>
  <!-- 禁用标签 -->
  <wd-tabs v-model="activeTab" @disabled="handleDisabled">
    <wd-tab title="标签1">内容1</wd-tab>
    <wd-tab title="标签2" disabled>内容2</wd-tab>
  </wd-tabs>

  <!-- 导航地图（标签数量超过 map-num 时显示） -->
  <wd-tabs v-model="activeTab" :map-num="6" map-title="全部分类">
    <wd-tab v-for="i in 12" :key="i" :title="`标签${i}`">内容{{ i }}</wd-tab>
  </wd-tabs>
</template>
```

### Tabs Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前激活标签的索引或名称 | `number \| string` | `0` |
| items | 标签页数据数组 | `TabItem[]` | `[]` |
| slidable-num | 标签数超过阈值可滑动 | `number` | `6` |
| slidable | 滚动导航模式 | `'auto' \| 'always'` | `'auto'` |
| map-num | 标签数超过阈值显示导航地图 | `number` | `10` |
| map-title | 导航地图的标题 | `string` | - |
| sticky | 是否开启粘性布局 | `boolean` | `false` |
| offset-top | 粘性布局吸顶位置 | `number` | `0` |
| swipeable | 是否开启手势滑动 | `boolean` | `false` |
| auto-line-width | 是否自动调整底部条宽度 | `boolean` | `false` |
| line-width | 底部条宽度 | `string \| number` | - |
| line-height | 底部条高度 | `string \| number` | - |
| color | 激活标签颜色 | `string` | - |
| inactive-color | 非激活标签颜色 | `string` | - |
| animated | 是否开启切换动画 | `boolean` | `false` |
| duration | 切换动画时长（ms） | `number` | `300` |

### Tabs Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 切换标签时触发 | `{ index: number, name: string \| number }` |
| click | 点击标签时触发 | `{ index: number, name: string \| number }` |
| disabled | 点击禁用标签时触发 | `{ index: number, name: string \| number }` |

### Tab Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标签标题 | `string` | - |
| name | 标签名称 | `string \| number` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| lazy | 是否开启懒加载 | `boolean` | `true` |
| badge-props | 徽标属性透传 | `object` | - |

### Tabs Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| setActive | 设置激活的标签页 | `(value: string \| number, init?: boolean, setScroll?: boolean) => void` |
| scrollIntoView | 滚动到当前激活标签 | `() => void` |
| updateLineStyle | 更新底部指示线样式 | `(animation?: boolean) => Promise<void>` |

---

## Sidebar 侧边栏

侧边栏导航组件，用于在不同内容区域之间进行切换。

### 基本用法

```vue
<template>
  <view class="flex h-screen">
    <wd-sidebar v-model="activeKey">
      <wd-sidebar-item title="分类1" />
      <wd-sidebar-item title="分类2" />
      <wd-sidebar-item title="分类3" />
    </wd-sidebar>
    <view class="flex-1 p-32rpx">当前选中: {{ activeKey }}</view>
  </view>
</template>

<script lang="ts" setup>
const activeKey = ref(0)
</script>
```

### 徽标与禁用

```vue
<template>
  <wd-sidebar v-model="activeKey">
    <wd-sidebar-item title="分类1" />
    <wd-sidebar-item title="分类2" is-dot />
    <wd-sidebar-item title="分类3" :value="5" />
    <wd-sidebar-item title="分类4" disabled />
  </wd-sidebar>
</template>
```

### Sidebar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前选中项的索引 | `number` | `0` |

### Sidebar Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 切换选项时触发 | `value: number` |

### SidebarItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 选项标题 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| is-dot | 是否显示小红点 | `boolean` | `false` |
| value | 徽标显示值 | `string \| number` | - |
| max | 徽标最大值 | `number` | - |

---

## IndexBar 索引栏

索引栏组件，用于联系人列表、城市选择等场景的快速定位导航。

### 基本用法

```vue
<template>
  <wd-index-bar>
    <wd-index-anchor index="A" />
    <wd-cell title="阿里巴巴" />
    <wd-cell title="爱奇艺" />

    <wd-index-anchor index="B" />
    <wd-cell title="百度" />
    <wd-cell title="哔哩哔哩" />

    <wd-index-anchor index="C" />
    <wd-cell title="腾讯" />
  </wd-index-bar>
</template>
```

### 自定义索引

```vue
<template>
  <wd-index-bar :index-list="['热门', 'A', 'B', 'C', 'D']">
    <wd-index-anchor index="热门" />
    <wd-cell title="北京" />
    <wd-cell title="上海" />

    <wd-index-anchor index="A" />
    <wd-cell title="安庆" />
  </wd-index-bar>
</template>
```

### IndexBar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| index-list | 索引字符列表 | `string[]` | `A-Z` |
| sticky | 是否开启锚点吸顶 | `boolean` | `true` |
| sticky-offset-top | 吸顶偏移量 | `number` | `0` |
| highlight-color | 高亮颜色 | `string` | - |

### IndexBar Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| select | 点击索引时触发 | `index: string` |
| change | 当前高亮索引变化时触发 | `index: string` |

### IndexAnchor Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| index | 索引字符 | `string \| number` | - |

---

## Pagination 分页器

分页器组件，用于数据分页展示。

### 基本用法

```vue
<template>
  <!-- 默认多页模式 -->
  <wd-pagination v-model="current" :total="100" :page-size="10" @change="handleChange" />

  <!-- 简单模式 -->
  <wd-pagination v-model="current" :total="100" mode="simple" />

  <!-- 显示总数 -->
  <wd-pagination v-model="current" :total="100" show-total />

  <!-- 自定义按钮 -->
  <wd-pagination v-model="current" :total="100">
    <template #prev><text>上一页</text></template>
    <template #next><text>下一页</text></template>
  </wd-pagination>
</template>

<script lang="ts" setup>
const current = ref(1)
const handleChange = (page: number) => console.log('当前页:', page)
</script>
```

### Pagination Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前页码 | `number` | `1` |
| total | 数据总数 | `number` | `0` |
| page-size | 每页数量 | `number` | `10` |
| mode | 显示模式 | `'multi' \| 'simple'` | `'multi'` |
| show-total | 是否显示总数 | `boolean` | `false` |
| prev-text | 上一页按钮文字 | `string` | - |
| next-text | 下一页按钮文字 | `string` | - |
| hide-on-single-page | 只有一页时是否隐藏 | `boolean` | `false` |

### Pagination Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 页码变化时触发 | `page: number` |

### Pagination Slots

| 名称 | 说明 |
|------|------|
| prev | 自定义上一页按钮 |
| next | 自定义下一页按钮 |

---

## Segmented 分段器

分段器组件，用于在几个选项中进行切换选择。

### 基本用法

```vue
<template>
  <wd-segmented v-model="activeValue" :options="options" @change="handleChange" />
</template>

<script lang="ts" setup>
const activeValue = ref('day')
const options = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' },
]
const handleChange = (value: string) => console.log('选中:', value)
</script>
```

### 禁用与样式

```vue
<template>
  <!-- 禁用选项 -->
  <wd-segmented v-model="activeValue" :options="[
    { label: '选项1', value: '1' },
    { label: '选项2', value: '2', disabled: true },
    { label: '选项3', value: '3' },
  ]" />

  <!-- 自定义颜色 -->
  <wd-segmented v-model="activeValue" :options="options" active-color="#1989fa" />
</template>
```

### Segmented Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前选中值 | `string \| number` | - |
| options | 选项数组 | `SegmentedOption[]` | `[]` |
| disabled | 是否整体禁用 | `boolean` | `false` |
| active-color | 激活颜色 | `string` | - |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |

### Segmented Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选项变化时触发 | `value: string \| number` |

### SegmentedOption 类型

```typescript
interface SegmentedOption {
  label: string
  value: string | number
  disabled?: boolean
}
```

---

## Backtop 返回顶部

返回顶部按钮，当页面滚动超过一定距离时显示。

### 基本用法

```vue
<template>
  <scroll-view scroll-y @scroll="onScroll" style="height: 100vh;">
    <view v-for="i in 100" :key="i" class="p-20rpx">内容项 {{ i }}</view>
    <wd-backtop :scroll-top="scrollTop" @click="handleBacktop" />
  </scroll-view>
</template>

<script lang="ts" setup>
const scrollTop = ref(0)

const onScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}

const handleBacktop = () => {
  uni.pageScrollTo({ scrollTop: 0, duration: 300 })
}
</script>
```

### 自定义样式

```vue
<template>
  <!-- 自定义位置 -->
  <wd-backtop :scroll-top="scrollTop" :right="60" :bottom="200" @click="handleBacktop" />

  <!-- 显示时机 -->
  <wd-backtop :scroll-top="scrollTop" :top="300" @click="handleBacktop" />

  <!-- 方形样式 -->
  <wd-backtop :scroll-top="scrollTop" shape="square" @click="handleBacktop" />

  <!-- 自定义内容 -->
  <wd-backtop :scroll-top="scrollTop" @click="handleBacktop">
    <view class="flex flex-col items-center text-20rpx">
      <wd-icon name="arrow-up" />
      <text>顶部</text>
    </view>
  </wd-backtop>
</template>
```

### Backtop Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| scroll-top | 页面滚动距离（必填） | `number` | - |
| top | 显示按钮的滚动阈值（rpx） | `number` | `600` |
| duration | 滚动动画时长（ms） | `number` | `100` |
| z-index | 层级 | `number` | `99` |
| shape | 按钮形状 | `'circle' \| 'square'` | `'circle'` |
| right | 距离屏幕右边距离（rpx） | `number` | `40` |
| bottom | 距离屏幕底部距离（rpx） | `number` | `200` |

### Backtop Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击按钮时触发 | - |

### Backtop Slots

| 名称 | 说明 |
|------|------|
| default | 自定义按钮内容 |

---

## 最佳实践

### 1. Navbar 配置

```vue
<template>
  <wd-navbar
    :title="pageTitle"
    :show-back="canGoBack"
    :show-home="!canGoBack"
    @back="handleBack"
    @back-home="handleBackHome"
  />
</template>

<script lang="ts" setup>
const canGoBack = computed(() => getCurrentPages().length > 1)
const handleBack = () => uni.navigateBack()
const handleBackHome = () => uni.switchTab({ url: '/pages/index/index' })
</script>
```

### 2. Tabbar 页面切换

```vue
<template>
  <wd-tabbar v-model="activePage" :items="tabbarItems" @change="handleTabChange" />
  <view v-show="activePage === 'home'">首页内容</view>
  <view v-show="activePage === 'mine'">我的内容</view>
</template>

<script lang="ts" setup>
const activePage = ref('home')
const tabbarItems = [
  { icon: 'home', title: '首页', name: 'home' },
  { icon: 'user', title: '我的', name: 'mine' },
]
</script>
```

### 3. Tabs 懒加载

```vue
<template>
  <wd-tabs v-model="activeTab" :items="tabItems">
    <template #default="{ item }">
      <template v-if="item.loaded">
        <AsyncContent :type="item.name" />
      </template>
    </template>
  </wd-tabs>
</template>
```

---

## 常见问题

### 1. Navbar 高度计算不正确

使用 `@height-ready` 事件获取准确高度：

```vue
<template>
  <wd-navbar title="标题" @height-ready="onHeightReady" />
</template>

<script lang="ts" setup>
const onHeightReady = (height: number) => {
  console.log('导航栏高度:', height)
}
</script>
```

### 2. Tabbar 切换页面闪烁

使用 `v-show` 替代 `v-if` 避免频繁重建：

```vue
<template>
  <view v-show="active === 0">首页</view>
  <view v-show="active === 1">分类</view>
</template>
```

### 3. Tabs 底部指示线不显示

手动更新指示线样式：

```vue
<script lang="ts" setup>
const tabsRef = ref()

onMounted(() => {
  nextTick(() => {
    tabsRef.value?.updateLineStyle()
  })
})
</script>
```

### 4. Backtop 按钮不显示

确保正确传递 `scroll-top` 值：

```vue
<template>
  <scroll-view scroll-y @scroll="onScroll" style="height: 100vh;">
    <wd-backtop :scroll-top="scrollTop" @click="handleBacktop" />
  </scroll-view>
</template>

<script lang="ts" setup>
const scrollTop = ref(0)
const onScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}
</script>
```

---

## 主题定制

```scss
// Navbar 导航栏
$-navbar-height: 88rpx;
$-navbar-background: #fff;
$-navbar-color: #333;
$-navbar-title-font-size: 32rpx;
$-navbar-capsule-height: 64rpx;

// Tabbar 标签栏
$-tabbar-height: 100rpx;
$-tabbar-active-color: #1989fa;
$-tabbar-inactive-color: #7d7e80;
$-tabbar-item-icon-size: 48rpx;
$-tabbar-item-title-font-size: 24rpx;

// Tabs 标签页
$-tabs-nav-height: 88rpx;
$-tabs-nav-fs: 30rpx;
$-tabs-nav-color: #333;
$-tabs-nav-active-color: #1989fa;
$-tabs-nav-line-height: 6rpx;
$-tabs-nav-line-bg-color: #1989fa;

// Backtop 返回顶部
$-backtop-bg: rgba(255, 255, 255, 0.9);
$-backtop-icon-size: 40rpx;
```
