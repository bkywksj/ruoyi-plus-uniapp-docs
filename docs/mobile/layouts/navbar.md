# 导航栏配置

## 介绍

导航栏（Navbar）是移动端应用中最常见的顶部导航组件，用于展示页面标题、提供返回操作和快捷功能入口。RuoYi-Plus-UniApp 项目基于 WD UI 组件库的 `wd-navbar` 组件实现顶部导航栏功能，支持丰富的自定义配置，能够满足各种移动端应用的导航需求。

导航栏组件采用了智能化的设计理念，不仅支持基础的标题和按钮展示，还内置了自动返回、胶囊导航、状态栏适配、微信公众号 H5 自动隐藏等高级功能。组件会根据当前运行环境和页面历史自动调整显示内容，为开发者提供了开箱即用的导航体验。

**核心特性：**

- **智能返回** - 自动检测页面历史，支持自动返回和回到首页功能
- **胶囊导航** - 小程序风格的胶囊按钮，包含返回和首页双功能
- **状态栏适配** - 自动适配各种设备的状态栏高度和安全区域
- **微信 H5 优化** - 在微信公众号 H5 环境下自动隐藏导航栏
- **丰富的样式定制** - 支持自定义标题样式、背景色、图标颜色等
- **固定定位** - 支持固定在顶部，并自动生成占位元素防止内容被遮挡
- **双侧按钮** - 支持左右两侧的图标和文字按钮配置
- **暗黑模式** - 完整支持暗黑主题，自动切换配色

## 基本用法

### 简单标题

最简单的用法是只设置标题文字。

```vue
<template>
  <view class="page">
    <wd-navbar title="页面标题" />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// 无需额外配置
</script>
```

**使用说明：**

- `title` 属性设置导航栏标题
- 默认导航栏固定在顶部并生成占位元素
- 自动适配状态栏高度

### 带返回按钮

通过 `show-back` 属性显示返回按钮。

```vue
<template>
  <view class="page">
    <wd-navbar title="详情页" show-back />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// 无需额外配置，点击返回按钮自动执行 uni.navigateBack()
</script>
```

**使用说明：**

- `show-back` 开启后自动显示返回按钮
- 组件会自动检测是否有历史页面可以返回
- 如果没有历史页面，会自动显示首页按钮
- 配合 `auto-back` 属性（默认 true）自动执行返回操作

### 自定义左侧内容

通过 `left-icon` 和 `left-text` 属性自定义左侧按钮。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="自定义左侧"
      left-icon="left"
      left-text="返回"
      @click-left="handleBack"
    />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
const handleBack = () => {
  console.log('点击返回按钮')
  uni.navigateBack()
}
</script>
```

**使用说明：**

- `left-icon` 设置左侧图标名称
- `left-text` 设置左侧文字
- 可以同时设置图标和文字
- 通过 `@click-left` 监听左侧按钮点击事件

### 自定义右侧内容

通过 `right-icon` 和 `right-text` 属性自定义右侧按钮。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="自定义右侧"
      show-back
      right-icon="more"
      @click-right="handleMore"
    />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
const handleMore = () => {
  console.log('点击更多按钮')
  uni.showActionSheet({
    itemList: ['分享', '收藏', '举报'],
    success: (res) => {
      console.log('选择了:', res.tapIndex)
    },
  })
}
</script>
```

**使用说明：**

- `right-icon` 设置右侧图标名称
- `right-text` 设置右侧文字
- 通过 `@click-right` 监听右侧按钮点击事件
- 可以同时设置左侧和右侧按钮

### 双侧按钮组合

同时配置左右两侧的按钮。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="编辑页面"
      left-icon="left"
      left-text="取消"
      right-text="保存"
      @click-left="handleCancel"
      @click-right="handleSave"
    />
    <view class="content">表单内容</view>
  </view>
</template>

<script lang="ts" setup>
const handleCancel = () => {
  uni.showModal({
    title: '提示',
    content: '确定要放弃编辑吗？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    },
  })
}

const handleSave = () => {
  console.log('保存数据')
  uni.showToast({ title: '保存成功', icon: 'success' })
}
</script>
```

**使用说明：**

- 左侧显示"取消"按钮，右侧显示"保存"按钮
- 这种布局常用于编辑页面、表单页面
- 可以根据需要调整按钮文字和图标

## 胶囊导航

### 基本胶囊模式

胶囊模式提供了小程序风格的导航按钮，包含返回和首页两个功能。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="胶囊导航"
      capsule
      show-back
      show-home
      @back="handleBack"
      @back-home="handleBackHome"
    />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
const handleBack = () => {
  console.log('返回上一页')
}

const handleBackHome = () => {
  console.log('回到首页')
}
</script>
```

**使用说明：**

- `capsule` 开启胶囊模式
- `show-back` 显示返回按钮
- `show-home` 显示首页按钮
- 胶囊内的按钮会根据配置自动显示

### 仅显示返回按钮

胶囊模式下只显示返回按钮。

```vue
<template>
  <view class="page">
    <wd-navbar title="详情页" capsule show-back />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// 点击返回按钮自动执行 uni.navigateBack()
</script>
```

**使用说明：**

- 只设置 `show-back` 时只显示返回按钮
- 组件会自动检测页面历史
- 如果没有历史页面，会自动切换为首页按钮

### 自定义胶囊内容

通过插槽自定义胶囊区域内容。

```vue
<template>
  <view class="page">
    <wd-navbar title="自定义胶囊" capsule>
      <template #capsule>
        <view class="custom-capsule">
          <wd-icon name="scan" size="40" @click="handleScan" />
          <view class="divider" />
          <wd-icon name="search" size="40" @click="handleSearch" />
        </view>
      </template>
    </wd-navbar>
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
const handleScan = () => {
  uni.scanCode({
    success: (res) => {
      console.log('扫码结果:', res.result)
    },
  })
}

const handleSearch = () => {
  uni.navigateTo({ url: '/pages/search/search' })
}
</script>

```

**使用说明：**

- 使用 `#capsule` 插槽自定义胶囊内容
- 可以放置任意自定义组件
- 适合实现扫码、搜索等快捷功能入口

## 标题样式定制

### 标题字体样式

通过属性自定义标题的字体样式。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="自定义标题"
      title-size="36"
      title-bold
      title-color="#1890ff"
      title-family="PingFang SC, Microsoft YaHei"
    />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// 标题样式完全自定义
</script>
```

**使用说明：**

- `title-size` 设置标题字体大小，默认使用组件预设值
- `title-bold` 设置标题是否加粗
- `title-color` 设置标题颜色
- `title-family` 设置标题字体族

### 使用标题插槽

通过插槽完全自定义标题区域。

```vue
<template>
  <view class="page">
    <wd-navbar show-back>
      <template #title>
        <view class="custom-title" @click="handleTitleClick">
          <wd-text text="当前城市" size="24" />
          <view class="city-selector">
            <wd-text text="北京" size="32" bold />
            <wd-icon name="arrow-down" size="24" />
          </view>
        </view>
      </template>
    </wd-navbar>
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
const handleTitleClick = () => {
  uni.navigateTo({ url: '/pages/city/select' })
}
</script>

```

**使用说明：**

- 使用 `#title` 插槽自定义标题区域
- 可以实现城市选择、频道切换等复杂交互
- 自定义内容会居中显示

## 背景样式

### 自定义背景色

通过 `bg-color` 属性设置导航栏背景色。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="渐变背景"
      bg-color="linear-gradient(to right, #4F86FD, #5D6EFF)"
      title-color="#ffffff"
      left-icon-color="#ffffff"
      show-back
      status-bar-text-style="light"
    />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// 渐变背景需要配合浅色文字和状态栏样式
</script>
```

**使用说明：**

- `bg-color` 支持纯色、渐变等 CSS 背景值
- 深色背景需要配合 `status-bar-text-style="light"` 设置状态栏文字为白色
- 同时调整 `title-color` 和 `left-icon-color` 保持对比度

### 透明背景

实现滚动渐变透明效果。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="透明效果"
      :bg-color="`rgba(255, 255, 255, ${opacity})`"
      show-back
    />
    <scroll-view scroll-y class="content" @scroll="handleScroll">
      <!-- 页面内容 -->
      <view v-for="i in 50" :key="i" class="item">
        列表项 {{ i }}
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const opacity = ref(0)

const handleScroll = (e: any) => {
  const scrollTop = e.detail.scrollTop
  // 在 0-100px 滚动距离内从透明变为不透明
  opacity.value = Math.min(scrollTop / 100, 1)
}
</script>

```

**使用说明：**

- 动态计算 `bg-color` 的透明度
- 监听页面滚动事件更新透明度
- 实现头部渐变显示效果

### 项目中的透明导航栏

RuoYi-Plus-UniApp 项目在"我的"页面中使用了透明导航栏效果：

```vue
<template>
  <view class="min-h-[100vh] bg-#FFFCF5 pb-10">
    <wd-navbar
      :bg-color="`rgba(255,252,245,${scrollTop / 60})`"
      :title="t('app.my.title')"
    />

    <!-- 页面内容 -->
    <view class="relative pt-10">
      <!-- 用户信息和功能列表 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const { scrollTop } = useScroll()
</script>
```

**使用说明：**

- 使用 `useScroll` Composable 获取全局滚动位置
- 根据滚动距离动态计算背景透明度
- 背景色与页面背景色保持一致，实现无缝过渡

## 状态栏适配

### 状态栏文字颜色

通过 `status-bar-text-style` 属性设置状态栏文字颜色。

```vue
<template>
  <view class="page">
    <!-- 深色状态栏文字（用于浅色背景） -->
    <wd-navbar
      title="浅色背景"
      status-bar-text-style="dark"
    />
  </view>
</template>

<script lang="ts" setup>
// dark: 黑色文字，适用于浅色背景
// light: 白色文字，适用于深色背景
</script>
```

**使用说明：**

- `dark` - 黑色状态栏文字，适用于浅色背景
- `light` - 白色状态栏文字，适用于深色背景
- 组件会自动调用 `uni.setNavigationBarColor` 设置状态栏颜色

### 安全区域适配

默认自动适配顶部安全区域。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="安全区域"
      safe-area-inset-top
    />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// safe-area-inset-top 默认为 true
// 自动添加状态栏高度的 padding-top
</script>
```

**使用说明：**

- `safe-area-inset-top` 默认为 `true`
- 自动获取系统状态栏高度
- 在导航栏顶部添加等高的内边距
- 确保内容不会被状态栏遮挡

## 固定定位

### 固定在顶部

默认导航栏固定在页面顶部。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="固定导航栏"
      fixed
      placeholder
      show-back
    />
    <view class="content" style="height: 2000rpx">
      长内容区域，可滚动...
    </view>
  </view>
</template>

<script lang="ts" setup>
// fixed 和 placeholder 默认都为 true
</script>
```

**使用说明：**

- `fixed` 默认为 `true`，导航栏固定在顶部
- `placeholder` 默认为 `true`，生成等高占位元素
- 占位高度会自动计算（包含状态栏高度）

### 非固定定位

将 `fixed` 设置为 `false`，导航栏随页面滚动。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="非固定导航栏"
      :fixed="false"
      show-back
    />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// 非固定模式下导航栏会随页面内容滚动
</script>
```

**使用说明：**

- 非固定定位时导航栏会随页面滚动
- 适用于特殊布局需求
- 此时 `placeholder` 属性无效

### 自定义层级

通过 `z-index` 属性设置导航栏层级。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="自定义层级"
      :z-index="999"
      show-back
    />
    <view class="content">
      <!-- 包含弹窗等高层级元素 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
// z-index 默认为 99
// 可根据页面其他元素的层级进行调整
</script>
```

**使用说明：**

- `z-index` 默认值为 `99`
- 固定定位时实际 z-index 为 `500`（在样式中设置）
- 如果页面有其他高层级元素，可适当调整

## 边框显示

### 显示底部边框

通过 `bordered` 属性显示导航栏底部边框。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="显示边框"
      bordered
      show-back
    />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// bordered 默认为 false
</script>
```

**使用说明：**

- `bordered` 默认为 `false`
- 开启后显示 1px 的底部边框
- 边框使用半像素技术实现，更加细腻

### 隐藏底部边框

默认情况下不显示边框。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="无边框"
      :bordered="false"
      show-back
    />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// 无边框导航栏，视觉更简洁
</script>
```

**使用说明：**

- 无边框设计更加简洁现代
- 适合与页面内容无缝衔接的场景

## 禁用按钮

### 禁用左侧按钮

通过 `left-disabled` 禁用左侧按钮。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="禁用左侧"
      left-icon="left"
      left-text="返回"
      left-disabled
      @click-left="handleBack"
    />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
const handleBack = () => {
  // 禁用状态下不会触发
  console.log('点击返回')
}
</script>
```

**使用说明：**

- `left-disabled` 禁用左侧按钮
- 禁用时按钮透明度降低
- 点击事件不会触发

### 禁用右侧按钮

通过 `right-disabled` 禁用右侧按钮。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="表单页面"
      show-back
      right-text="提交"
      :right-disabled="!isFormValid"
      @click-right="handleSubmit"
    />
    <view class="content">
      <wd-input v-model="formData.name" label="姓名" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const formData = ref({ name: '' })

const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0
})

const handleSubmit = () => {
  console.log('提交表单:', formData.value)
}
</script>
```

**使用说明：**

- `right-disabled` 禁用右侧按钮
- 可以动态控制禁用状态
- 常用于表单验证场景

## 微信公众号 H5 适配

### 自动隐藏导航栏

在微信公众号 H5 环境下自动隐藏导航栏。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="微信 H5"
      auto-hide-in-wechat-h5
    />
    <view class="content">
      在微信公众号中访问时，导航栏会自动隐藏，
      标题会设置到微信内置导航栏上。
    </view>
  </view>
</template>

<script lang="ts" setup>
// auto-hide-in-wechat-h5 默认为 true
// 组件会自动检测是否在微信公众号 H5 环境
</script>
```

**使用说明：**

- `auto-hide-in-wechat-h5` 默认为 `true`
- 组件自动检测是否在微信公众号 H5 环境
- 在微信环境下隐藏自定义导航栏
- 自动调用 `uni.setNavigationBarTitle` 设置标题

### 禁用自动隐藏

如果需要在微信公众号 H5 中也显示自定义导航栏：

```vue
<template>
  <view class="page">
    <wd-navbar
      title="始终显示"
      :auto-hide-in-wechat-h5="false"
      show-back
    />
    <view class="content">
      即使在微信公众号中也显示自定义导航栏
    </view>
  </view>
</template>

<script lang="ts" setup>
// 禁用自动隐藏，始终显示自定义导航栏
</script>
```

**使用说明：**

- 设置 `auto-hide-in-wechat-h5` 为 `false`
- 自定义导航栏始终显示
- 注意可能与微信内置导航栏重叠

## 自定义高度

### 设置导航栏高度

通过 `height` 属性自定义导航栏高度。

```vue
<template>
  <view class="page">
    <wd-navbar
      title="自定义高度"
      height="100rpx"
      show-back
    />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// height 属性设置导航栏内容区高度（不含状态栏）
</script>
```

**使用说明：**

- `height` 设置导航栏内容区高度
- 不包含状态栏高度
- 支持 rpx、px 等单位
- 默认高度由组件样式定义

## 项目中的实现

### 基础页面导航栏

RuoYi-Plus-UniApp 项目中最常见的导航栏用法：

```vue
<template>
  <view class="min-h-[100vh]">
    <wd-navbar title="首页" />

    <!-- 页面内容 -->
    <wd-swiper :list="swiperList" custom-class="m-2" />

    <!-- 金刚区 -->
    <wd-row custom-class="p-2 bg-white mx-4 rounded-xl" :gutter="16">
      <wd-col v-for="(item, index) in menuList" :key="index" :span="6">
        <view class="flex flex-col items-center py-2" @click="handleMenuClick(item)">
          <wd-icon :name="item.icon" size="60" :color="item.color" />
          <wd-text custom-class="mt-2" :text="item.title" />
        </view>
      </wd-col>
    </wd-row>

    <!-- 商品列表 -->
    <wd-paging
      ref="paging"
      :fetch="pageGoods"
      :params="queryParams"
      :tabs="tabsConfig"
    >
      <!-- 列表项模板 -->
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 轮播图数据
const swiperList = ref<string[]>([])

// 金刚区数据
const menuList = ref([
  { title: '外卖', icon: 'goods', color: '#ff6b6b' },
  { title: '超市', icon: 'cart', color: '#4ecdc4' },
  // ...
])
</script>
```

**使用说明：**

- 首页使用最简单的导航栏配置
- 只设置标题，无返回按钮
- 配合下方内容组件构建完整页面

### 详情页导航栏

详情页面通常需要返回按钮和更多操作：

```vue
<template>
  <view class="page">
    <wd-navbar
      title="商品详情"
      show-back
      right-icon="share"
      @click-right="handleShare"
    />

    <scroll-view scroll-y class="content">
      <!-- 商品详情内容 -->
      <view class="goods-info">
        <wd-img :src="goods.image" width="100%" mode="widthFix" />
        <view class="goods-title">{{ goods.name }}</view>
        <view class="goods-price">￥{{ goods.price }}</view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <wd-button type="primary" block @click="handleBuy">
        立即购买
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const goods = ref({
  image: '/static/goods.jpg',
  name: '商品名称',
  price: '99.00',
})

const handleShare = () => {
  // 分享功能
  uni.showShareMenu({
    withShareTicket: true,
  })
}

const handleBuy = () => {
  // 购买功能
}
</script>
```

**使用说明：**

- 详情页需要返回按钮
- 右侧可添加分享、收藏等操作
- 配合底部操作栏构建完整详情页

### 用户中心透明导航栏

"我的"页面使用透明渐变导航栏：

```vue
<template>
  <view class="min-h-[100vh] bg-#FFFCF5 pb-10">
    <wd-navbar
      :bg-color="`rgba(255,252,245,${scrollTop / 60})`"
      :title="t('app.my.title')"
    />

    <!-- 背景装饰 -->
    <view class="relative">
      <view
        class="absolute top-0 h-35 w-35 rounded-full filter-blur-lg -left-10"
        style="background: linear-gradient(120deg, #f3f4f600 0%, #ffedda 100%)"
      />
    </view>

    <!-- 用户信息头部 -->
    <view class="relative pt-10">
      <view class="flex flex-col items-center justify-center">
        <wd-icon
          v-if="!userStore.userInfo?.avatar"
          custom-class="bg-#f8f6f8 rounded-full p-6"
          name="user"
          size="80"
          @click="handleUserInfo"
        />
        <wd-img
          v-else
          :src="userStore.userInfo?.avatar"
          width="128"
          height="128"
          round
          @click="handleUserInfo"
        />
        <wd-text
          size="36"
          :text="userStore.userInfo?.nickName || '昵称'"
          @click="handleUserInfo"
        />
      </view>
    </view>

    <!-- 功能菜单 -->
    <wd-cell-group custom-class="mt-2 mx-3" title="我的订单">
      <wd-grid :items="orderTypes" clickable @item-click="handleOrderClick" />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const userStore = useUserStore()
const { scrollTop } = useScroll()
</script>
```

**使用说明：**

- 使用 `useScroll` 获取滚动位置
- 动态计算背景透明度实现渐变效果
- 背景色与页面背景保持一致
- 配合装饰性背景元素增强视觉效果

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customStyle | 自定义根节点样式 | `string` | `''` |
| customClass | 自定义根节点样式类 | `string` | `''` |
| title | 标题文字 | `string` | - |
| titleFamily | 标题字体家族 | `string` | `'Microsoft YaHei, SimHei, PingFang SC, sans-serif'` |
| titleSize | 标题字体大小 | `string \| number` | - |
| titleBold | 标题是否加粗 | `boolean` | `false` |
| titleColor | 标题颜色 | `string` | - |
| leftText | 左侧文字 | `string` | - |
| leftIcon | 左侧图标名称 | `string` | - |
| leftIconSize | 左侧图标大小 | `string \| number` | `32` |
| leftIconColor | 左侧图标颜色 | `string` | - |
| leftDisabled | 是否禁用左侧按钮 | `boolean` | `false` |
| rightText | 右侧文字 | `string` | - |
| rightIcon | 右侧图标名称 | `string` | - |
| rightIconSize | 右侧图标大小 | `string \| number` | `32` |
| rightIconColor | 右侧图标颜色 | `string` | - |
| rightDisabled | 是否禁用右侧按钮 | `boolean` | `false` |
| bgColor | 导航栏背景色 | `string` | - |
| height | 导航栏高度 | `string \| number` | - |
| bordered | 是否显示底部边框 | `boolean` | `false` |
| fixed | 是否固定在顶部 | `boolean` | `true` |
| placeholder | 是否生成占位元素 | `boolean` | `true` |
| zIndex | 导航栏 z-index | `number` | `99` |
| safeAreaInsetTop | 是否开启顶部安全区适配 | `boolean` | `true` |
| statusBarTextStyle | 状态栏文字颜色 | `'dark' \| 'light'` | `'dark'` |
| capsule | 是否显示胶囊组件 | `boolean` | `false` |
| showBack | 是否显示返回按钮 | `boolean` | `false` |
| showHome | 是否显示首页按钮 | `boolean` | `false` |
| autoBack | 是否自动处理返回操作 | `boolean` | `true` |
| autoHideInWechatH5 | 是否在微信公众号H5中自动隐藏 | `boolean` | `true` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| back | 点击返回按钮时触发 | - |
| back-home | 点击首页按钮时触发 | - |
| click-left | 点击左侧按钮时触发 | - |
| click-right | 点击右侧按钮时触发 | - |
| height-ready | 导航栏高度计算完成时触发 | `height: number` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 标题区域内容（已废弃，请使用 title 插槽） |
| title | 自定义标题区域内容 |
| left | 自定义左侧区域内容 |
| right | 自定义右侧区域内容 |
| capsule | 自定义胶囊区域内容 |

### 类型定义

```typescript
/**
 * 状态栏文字样式类型
 */
type StatusBarTextStyle = 'dark' | 'light'

/**
 * 导航栏组件属性接口
 */
interface WdNavbarProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 状态栏字体颜色 dark-黑色 light-白色 */
  statusBarTextStyle?: StatusBarTextStyle

  /** 标题文字 */
  title?: string
  /** 标题字体家族 */
  titleFamily?: string
  /** 标题字体大小 */
  titleSize?: string | number
  /** 标题字体粗细 */
  titleBold?: boolean
  /** 标题字体颜色 */
  titleColor?: string

  /** 左侧文案 */
  leftText?: string
  /** 左侧图标名称 */
  leftIcon?: string
  /** 左侧图标大小 */
  leftIconSize?: string | number
  /** 左侧图标颜色 */
  leftIconColor?: string
  /** 是否禁用左侧按钮 */
  leftDisabled?: boolean

  /** 右侧文案 */
  rightText?: string
  /** 右侧图标名称 */
  rightIcon?: string
  /** 右侧图标大小 */
  rightIconSize?: string | number
  /** 右侧图标颜色 */
  rightIconColor?: string
  /** 是否禁用右侧按钮 */
  rightDisabled?: boolean

  /** 导航栏背景色 */
  bgColor?: string
  /** 导航栏高度 */
  height?: string | number
  /** 是否显示下边框 */
  bordered?: boolean

  /** 是否固定到顶部 */
  fixed?: boolean
  /** 是否生成占位元素 */
  placeholder?: boolean
  /** 导航栏 z-index */
  zIndex?: number
  /** 是否开启顶部安全区适配 */
  safeAreaInsetTop?: boolean

  /** 是否显示胶囊组件 */
  capsule?: boolean
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 是否显示首页按钮 */
  showHome?: boolean

  /** 是否自动处理返回操作 */
  autoBack?: boolean
  /** 是否在微信公众号H5中自动隐藏 */
  autoHideInWechatH5?: boolean
}

/**
 * 导航栏组件事件接口
 */
interface WdNavbarEmits {
  /** 返回事件 */
  'back': []
  /** 首页按钮点击时触发 */
  'back-home': []
  /** 点击左侧按钮时触发 */
  'click-left': []
  /** 点击右侧按钮时触发 */
  'click-right': []
  /** 导航栏高度计算完成时触发 */
  'height-ready': [height: number]
}
```

## 主题定制

### CSS 变量

导航栏组件使用以下 CSS 变量，可通过 ConfigProvider 组件进行全局定制：

```scss
// 导航栏高度
$-navbar-height: 88rpx;

// 导航栏背景色
$-navbar-background: #ffffff;

// 导航栏文字颜色
$-navbar-color: #333333;

// 标题字体大小
$-navbar-title-font-size: 34rpx;

// 标题字体粗细
$-navbar-title-font-weight: 500;

// 描述文字颜色
$-navbar-desc-font-color: #666666;

// 描述文字大小
$-navbar-desc-font-size: 28rpx;

// 返回箭头大小
$-navbar-arrow-size: 40rpx;

// 禁用状态透明度
$-navbar-disabled-opacity: 0.5;

// 胶囊高度
$-navbar-capsule-height: 64rpx;

// 胶囊图标大小
$-navbar-capsule-icon-size: 40rpx;
```

### 暗黑模式

导航栏组件支持暗黑模式，在暗黑主题下会自动应用暗色背景和文字颜色：

```scss
.wot-theme-dark {
  .wd-navbar {
    background-color: $-dark-background;

    .wd-navbar__title {
      color: $-dark-color;
    }

    .wd-navbar__text {
      color: $-dark-color;
    }

    :deep(.wd-navbar__icon) {
      color: $-dark-color;
    }
  }
}
```

### 自定义主题示例

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <wd-navbar title="自定义主题" show-back />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const themeVars = ref({
  navbarBackground: '#1a1a1a',
  navbarColor: '#ffffff',
  navbarTitleFontSize: '36rpx',
  navbarTitleFontWeight: '600',
})
</script>
```

## 最佳实践

### 1. 合理使用自动返回功能

利用 `auto-back` 和 `show-back` 属性简化返回逻辑：

```vue
<template>
  <!-- 推荐：使用自动返回 -->
  <wd-navbar title="详情页" show-back />

  <!-- 不推荐：手动处理返回 -->
  <wd-navbar
    title="详情页"
    left-icon="left"
    @click-left="() => uni.navigateBack()"
  />
</template>

<script lang="ts" setup>
// 组件会自动处理返回逻辑
// 包括检测是否有历史页面、自动切换为首页按钮等
</script>
```

### 2. 透明导航栏的正确实现

使用 `useScroll` Composable 获取滚动位置：

```vue
<template>
  <view class="page">
    <wd-navbar
      :title="showTitle ? '页面标题' : ''"
      :bg-color="`rgba(255, 255, 255, ${opacity})`"
      show-back
    />
    <scroll-view scroll-y class="content">
      <!-- 页面内容 -->
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const { scrollTop } = useScroll()

// 透明度计算
const opacity = computed(() => Math.min(scrollTop.value / 100, 1))

// 标题显示条件
const showTitle = computed(() => scrollTop.value > 50)
</script>
```

### 3. 表单页面的保存按钮状态

动态控制保存按钮的禁用状态：

```vue
<template>
  <wd-navbar
    title="编辑信息"
    show-back
    right-text="保存"
    :right-disabled="!canSave"
    @click-right="handleSave"
  />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const formData = ref({ name: '', phone: '' })
const isSubmitting = ref(false)

// 表单验证
const canSave = computed(() => {
  return formData.value.name.trim().length > 0 &&
         /^1\d{10}$/.test(formData.value.phone) &&
         !isSubmitting.value
})

const handleSave = async () => {
  if (!canSave.value) return

  isSubmitting.value = true
  try {
    // 保存逻辑
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

### 4. 监听高度变化

使用 `height-ready` 事件获取导航栏高度：

```vue
<template>
  <wd-navbar
    title="页面标题"
    show-back
    @height-ready="handleHeightReady"
  />
  <view :style="{ marginTop: navbarHeight + 'rpx' }">
    <!-- 特殊布局内容 -->
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const navbarHeight = ref(0)

const handleHeightReady = (height: number) => {
  navbarHeight.value = height
  console.log('导航栏高度:', height, 'rpx')
}
</script>
```

## 常见问题

### 1. 导航栏遮挡页面内容

**问题原因：**

- 固定定位时未生成占位元素
- 页面内容未预留顶部空间

**解决方案：**

确保 `fixed` 和 `placeholder` 都设置为 `true`（默认值）：

```vue
<wd-navbar
  title="页面标题"
  fixed
  placeholder
  show-back
/>
```

或者在页面内容区域预留顶部空间：

```vue
<template>
  <view class="page">
    <wd-navbar title="页面标题" show-back />
    <view class="content" style="padding-top: 88rpx">
      页面内容
    </view>
  </view>
</template>
```

### 2. 状态栏文字颜色不正确

**问题原因：**

- 深色背景使用了深色状态栏文字
- 未设置 `status-bar-text-style` 属性

**解决方案：**

根据背景色设置正确的状态栏文字颜色：

```vue
<!-- 深色背景使用浅色文字 -->
<wd-navbar
  title="深色背景"
  bg-color="#1a1a1a"
  title-color="#ffffff"
  status-bar-text-style="light"
/>

<!-- 浅色背景使用深色文字 -->
<wd-navbar
  title="浅色背景"
  bg-color="#ffffff"
  title-color="#333333"
  status-bar-text-style="dark"
/>
```

### 3. 返回按钮点击无反应

**问题原因：**

- 使用了 `left-icon` 但未监听事件
- `auto-back` 被设置为 `false`
- `left-disabled` 被设置为 `true`

**解决方案：**

使用 `show-back` 属性或正确监听事件：

```vue
<!-- 方案1：使用 show-back（推荐） -->
<wd-navbar title="页面标题" show-back />

<!-- 方案2：手动处理返回 -->
<wd-navbar
  title="页面标题"
  left-icon="left"
  :auto-back="false"
  @click-left="handleBack"
/>

<script lang="ts" setup>
const handleBack = () => {
  uni.navigateBack()
}
</script>
```

### 4. 透明导航栏闪烁

**问题原因：**

- 初始滚动位置不为 0
- 透明度计算逻辑问题

**解决方案：**

使用 `useScroll` Composable 并设置默认值：

```vue
<template>
  <wd-navbar
    :bg-color="`rgba(255, 255, 255, ${opacity})`"
    title="页面标题"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'

const { scrollTop, scrollToTop } = useScroll()

// 页面加载时重置滚动位置
onMounted(() => {
  scrollToTop(0)
})

const opacity = computed(() => {
  // 确保初始值为 0
  return Math.min(Math.max(scrollTop.value / 100, 0), 1)
})
</script>
```

### 5. 自定义颜色在暗黑模式下不生效

**问题原因：**

- 暗黑模式样式覆盖了自定义颜色
- CSS 特异性问题

**解决方案：**

使用 `customClass` 添加更高优先级的样式：

```vue
<template>
  <wd-navbar
    title="自定义颜色"
    custom-class="custom-navbar"
    show-back
  />
</template>

<style lang="scss">
.custom-navbar {
  // 使用 !important 确保覆盖暗黑模式样式
  &.wd-navbar {
    background-color: #1890ff !important;
  }

  .wd-navbar__title {
    color: #ffffff !important;
  }

  :deep(.wd-navbar__icon) {
    color: #ffffff !important;
  }
}
</style>
```

### 6. 胶囊按钮显示不正确

**问题原因：**

- 同时使用了胶囊模式和左侧按钮配置
- 未设置 `capsule` 属性

**解决方案：**

胶囊模式和普通模式互斥，选择其一使用：

```vue
<!-- 胶囊模式 -->
<wd-navbar
  title="胶囊导航"
  capsule
  show-back
  show-home
/>

<!-- 普通模式（left-icon 和 capsule 不要同时使用） -->
<wd-navbar
  title="普通导航"
  left-icon="left"
  left-text="返回"
/>
```

### 7. 微信公众号 H5 中标题不显示

**问题原因：**

- `auto-hide-in-wechat-h5` 为 `true`，导航栏被隐藏
- `uni.setNavigationBarTitle` 调用失败

**解决方案：**

检查 `title` 属性是否正确设置：

```vue
<template>
  <wd-navbar
    :title="pageTitle"
    auto-hide-in-wechat-h5
  />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const pageTitle = ref('页面标题')

// 如果标题动态变化，组件会自动更新
watch(pageTitle, (newTitle) => {
  console.log('标题更新:', newTitle)
})
</script>
```

如果需要在微信 H5 中也显示自定义导航栏：

```vue
<wd-navbar
  title="页面标题"
  :auto-hide-in-wechat-h5="false"
/>
```
