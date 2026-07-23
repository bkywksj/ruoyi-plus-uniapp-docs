---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/navigation/navbar
---

# Navbar 导航栏

## 介绍

Navbar (导航栏) 是一个页面顶部导航组件,为页面提供导航功能。组件支持固定定位、自定义标题、左右两侧按钮、胶囊模式等功能,并针对微信公众号 H5 环境进行了特殊优化。导航栏会自动适配状态栏高度,支持安全区域,并提供了丰富的自定义选项和智能的自动返回功能。

**核心特性:**

- **固定定位** - 支持固定在页面顶部,自动生成占位元素
- **胶囊模式** - 内置胶囊组件,支持返回和首页按钮
- **状态栏适配** - 自动适配不同平台的状态栏高度
- **自动返回** - 智能识别返回按钮,自动执行 navigateBack
- **样式定制** - 支持自定义标题、图标、颜色等样式
- **插槽支持** - 提供标题、左侧、右侧、胶囊插槽
- **微信H5优化** - 在微信公众号 H5 环境下自动隐藏自定义导航栏
- **安全区域** - 支持顶部安全区域适配,兼容刘海屏

参考: src/wd/components/wd-navbar/wd-navbar.vue:1-753

## 基本用法

### 基础导航栏

最简单的用法,只设置标题。

```vue
<template>
  <view class="demo">
    <wd-navbar title="页面标题" />

    <view class="content">
      <view class="text">页面内容</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 基础用法无需额外配置
</script>

```

**使用说明:**
- 导航栏默认固定在页面顶部 (fixed: true)
- 自动适配状态栏高度
- 自动生成占位元素,避免内容被遮挡

参考: src/wd/components/wd-navbar/wd-navbar.vue:194, 197

### 带返回按钮

显示返回按钮,点击自动返回上一页。

```vue
<template>
  <view class="demo">
    <wd-navbar
      title="页面标题"
      left-icon="left"
      left-text="返回"
    />

    <view class="content">
      <view class="text">点击左侧返回按钮会自动返回上一页</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 组件会自动识别返回按钮并执行 uni.navigateBack
</script>

```

**使用说明:**
- 设置 `left-icon="left"` 显示返回图标
- 组件会自动识别返回按钮(图标或文字)
- 点击时自动执行 `uni.navigateBack()`
- 可通过 `auto-back="false"` 禁用自动返回,改为手动处理

**技术实现:**
```typescript
const shouldAutoBack = computed(() => {
  const backTexts = ['返回', '后退']
  const backIcons = ['back', 'left']
  return backTexts.includes(finalLeftText.value) || backIcons.includes(finalLeftIcon.value)
})
```

参考: src/wd/components/wd-navbar/wd-navbar.vue:354-361, 557-594

### 胶囊模式

使用胶囊组件,显示返回和首页按钮。

```vue
<template>
  <view class="demo">
    <!-- 显示返回和首页 -->
    <wd-navbar
      title="胶囊导航栏"
      capsule
      :show-back="true"
      :show-home="true"
      @back="handleBack"
      @back-home="handleBackHome"
    />

    <view class="content">
      <view class="text">胶囊模式提供返回和首页按钮</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleBack = () => {
  console.log('返回事件')
}

const handleBackHome = () => {
  console.log('首页事件')
}
</script>

```

**使用说明:**
- 设置 `capsule="true"` 启用胶囊模式
- `show-back` 控制是否显示返回按钮
- `show-home` 控制是否显示首页按钮
- 胶囊组件会自动处理返回和跳转首页逻辑

参考: src/wd/components/wd-navbar/wd-navbar.vue:152-157, 12-23
参考: src/wd/components/wd-navbar-capsule/wd-navbar-capsule.vue:1-297

### 右侧按钮

添加右侧按钮,常用于分享、搜索等操作。

```vue
<template>
  <view class="demo">
    <wd-navbar
      title="页面标题"
      left-icon="left"
      right-icon="search"
      @click-right="handleSearch"
    />

    <view class="content">
      <view class="text">点击右侧搜索图标</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleSearch = () => {
  console.log('触发搜索')
  uni.navigateTo({
    url: '/pages/search/index'
  })
}
</script>

```

**使用说明:**
- `right-icon` 设置右侧图标
- `right-text` 设置右侧文字
- 监听 `click-right` 事件处理点击

参考: src/wd/components/wd-navbar/wd-navbar.vue:125-134, 53-68, 600-604

### 自定义样式

自定义导航栏的背景色、标题样式、图标颜色等。

```vue
<template>
  <view class="demo">
    <wd-navbar
      title="自定义导航栏"
      bg-color="#4d80f0"
      title-color="#fff"
      left-icon="left"
      left-icon-color="#fff"
      right-text="分享"
      right-icon-color="#fff"
      @click-right="handleShare"
    />

    <view class="content">
      <view class="text">自定义背景色和文字颜色</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleShare = () => {
  console.log('分享')
}
</script>

```

**使用说明:**
- `bg-color` 设置背景色
- `title-color` 设置标题颜色
- `left-icon-color` 设置左侧图标颜色
- `right-icon-color` 设置右侧图标颜色

参考: src/wd/components/wd-navbar/wd-navbar.vue:136-139, 110-112, 120-121, 131-132

### 使用插槽

通过插槽自定义标题、左侧、右侧内容。

```vue
<template>
  <view class="demo">
    <wd-navbar>
      <template #left>
        <view class="custom-left" @click="handleBack">
          <wd-icon name="left" size="32rpx" />
          <text class="left-text">返回</text>
        </view>
      </template>

      <template #title>
        <view class="custom-title">
          <image
            class="title-logo"
            src="/static/logo.png"
            mode="aspectFit"
          />
          <text>自定义标题</text>
        </view>
      </template>

      <template #right>
        <view class="custom-right">
          <wd-icon name="search" size="32rpx" @click="handleSearch" />
          <wd-icon
            name="more"
            size="32rpx"
            style="margin-left: 24rpx;"
            @click="handleMore"
          />
        </view>
      </template>
    </wd-navbar>

    <view class="content">
      <view class="text">使用插槽完全自定义导航栏</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleBack = () => {
  uni.navigateBack()
}

const handleSearch = () => {
  console.log('搜索')
}

const handleMore = () => {
  console.log('更多')
}
</script>

```

**使用说明:**
- `#left` 插槽自定义左侧内容
- `#title` 插槽自定义标题内容
- `#right` 插槽自定义右侧内容
- `#capsule` 插槽自定义胶囊内容

参考: src/wd/components/wd-navbar/wd-navbar.vue:31-43, 46-50, 58-68

## 进阶用法

### 禁用按钮

禁用左侧或右侧按钮,按钮会降低透明度且无法点击。

```vue
<template>
  <view class="demo">
    <wd-navbar
      title="禁用按钮"
      left-icon="left"
      :left-disabled="leftDisabled"
      right-text="保存"
      :right-disabled="rightDisabled"
      @click-right="handleSave"
    />

    <view class="content">
      <wd-button @click="toggleLeft">切换左侧禁用</wd-button>
      <wd-button @click="toggleRight" style="margin-top: 20rpx;">
        切换右侧禁用
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const leftDisabled = ref(false)
const rightDisabled = ref(true)

const toggleLeft = () => {
  leftDisabled.value = !leftDisabled.value
}

const toggleRight = () => {
  rightDisabled.value = !rightDisabled.value
}

const handleSave = () => {
  console.log('保存')
}
</script>

```

**使用说明:**
- `left-disabled` 禁用左侧按钮
- `right-disabled` 禁用右侧按钮
- 禁用时透明度降低,无法点击
- 常用于表单未填写完整时禁用提交按钮

参考: src/wd/components/wd-navbar/wd-navbar.vue:122-123, 133-134, 558, 601

### 监听高度

监听导航栏高度计算完成事件,获取精确高度。

```vue
<template>
  <view class="demo">
    <wd-navbar
      title="获取高度"
      left-icon="left"
      @height-ready="handleHeightReady"
    />

    <view class="content">
      <view class="info">导航栏高度: {{ navbarHeight }}rpx</view>
      <view class="tip">包含状态栏高度的完整导航栏高度</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const navbarHeight = ref(0)

const handleHeightReady = (height: number) => {
  navbarHeight.value = height
  console.log('导航栏高度:', height)
}
</script>

```

**使用说明:**
- 监听 `height-ready` 事件获取导航栏高度
- 高度包含状态栏高度
- 单位为 rpx
- 适用于需要根据导航栏高度调整布局的场景

参考: src/wd/components/wd-navbar/wd-navbar.vue:178-179, 404, 448, 484

### 不显示占位

固定定位但不生成占位元素,内容从顶部开始。

```vue
<template>
  <view class="demo">
    <wd-navbar
      title="无占位导航栏"
      left-icon="left"
      :fixed="true"
      :placeholder="false"
      bg-color="rgba(255, 255, 255, 0.9)"
    />

    <view class="banner">
      <image
        src="https://via.placeholder.com/750x400"
        mode="widthFix"
        class="banner-image"
      />
    </view>

    <view class="content">
      <view class="text">内容从顶部开始，导航栏悬浮在上方</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// placeholder 为 false 时不生成占位元素
</script>

```

**使用说明:**
- 设置 `placeholder="false"` 不生成占位元素
- 导航栏会悬浮在内容之上
- 常用于头图场景,实现沉浸式效果
- 建议配合半透明背景色使用

参考: src/wd/components/wd-navbar/wd-navbar.vue:145-146, 408-410

### 自定义高度

自定义导航栏的高度。

```vue
<template>
  <view class="demo">
    <wd-navbar
      title="自定义高度"
      left-icon="left"
      height="120"
      title-size="36"
      :title-bold="true"
    />

    <view class="content">
      <view class="text">增加导航栏高度,适用于需要突出标题的页面</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// height 单位为 rpx
</script>

```

**使用说明:**
- `height` 设置导航栏高度,单位 rpx
- 可同时调整 `title-size` 和 `title-bold` 优化标题显示
- 自定义高度不包含状态栏高度

参考: src/wd/components/wd-navbar/wd-navbar.vue:138-139, 106-112

### 显示边框

显示导航栏底部边框。

```vue
<template>
  <view class="demo">
    <wd-navbar
      title="带边框导航栏"
      left-icon="left"
      :bordered="true"
    />

    <view class="content">
      <view class="text">导航栏底部显示 0.5px 细线</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// bordered 为 true 时显示底部边框
</script>

```

**使用说明:**
- 设置 `bordered="true"` 显示底部边框
- 边框使用 0.5px 细线实现
- 默认颜色为 #ebedf0

参考: src/wd/components/wd-navbar/wd-navbar.vue:141, 7, 739-741

### 调整层级

调整导航栏的 z-index 层级。

```vue
<template>
  <view class="demo">
    <wd-navbar
      title="高层级导航栏"
      left-icon="left"
      :z-index="1000"
    />

    <view class="content">
      <view class="text">设置更高的 z-index,确保在其他悬浮元素之上</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 默认 z-index 为 99
</script>

```

**使用说明:**
- `z-index` 设置导航栏层级
- 默认值为 99
- 仅在 `fixed="true"` 时生效

参考: src/wd/components/wd-navbar/wd-navbar.vue:147-148, 196, 8

### 关闭安全区域

关闭顶部安全区域适配。

```vue
<template>
  <view class="demo">
    <wd-navbar
      title="无安全区导航栏"
      left-icon="left"
      :safe-area-inset-top="false"
    />

    <view class="content">
      <view class="text">不适配状态栏高度,导航栏紧贴屏幕顶部</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// safe-area-inset-top 默认为 true
</script>

```

**使用说明:**
- `safe-area-inset-top` 控制是否适配状态栏
- 默认值为 true,会自动加上状态栏高度
- 设置为 false 时导航栏会紧贴屏幕顶部

参考: src/wd/components/wd-navbar/wd-navbar.vue:149-150, 197, 8

### 单胶囊模式

胶囊组件只显示返回或首页按钮。

```vue
<template>
  <view class="demo">
    <!-- 只显示返回按钮 -->
    <wd-navbar
      title="只有返回"
      capsule
      :show-back="true"
      :show-home="false"
    />

    <view class="divider"></view>

    <!-- 只显示首页按钮 -->
    <wd-navbar
      title="只有首页"
      capsule
      :show-back="false"
      :show-home="true"
    />

    <view class="content">
      <view class="text">胶囊组件支持只显示单个按钮</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 单按钮模式会自动调整样式
</script>

```

**使用说明:**
- 只显示返回或首页按钮时,胶囊会自动调整样式
- 隐藏边框和中间分隔线
- 图标靠左对齐

参考: src/wd/components/wd-navbar-capsule/wd-navbar-capsule.vue:109-117, 248-271

## API

### Navbar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `title` | 标题文字 | `string` | `''` |
| `title-family` | 标题字体 | `string` | `'Microsoft YaHei, SimHei, PingFang SC, sans-serif'` |
| `title-size` | 标题字体大小 | `string \| number` | `''` |
| `title-bold` | 标题是否加粗 | `boolean` | `false` |
| `title-color` | 标题颜色 | `string` | `''` |
| `left-text` | 左侧文案 | `string` | `''` |
| `left-icon` | 左侧图标名称 | `string` | `''` |
| `left-icon-size` | 左侧图标大小 | `string \| number` | `32` |
| `left-icon-color` | 左侧图标颜色 | `string` | `''` |
| `left-disabled` | 是否禁用左侧按钮 | `boolean` | `false` |
| `right-text` | 右侧文案 | `string` | `''` |
| `right-icon` | 右侧图标名称 | `string` | `''` |
| `right-icon-size` | 右侧图标大小 | `string \| number` | `32` |
| `right-icon-color` | 右侧图标颜色 | `string` | `''` |
| `right-disabled` | 是否禁用右侧按钮 | `boolean` | `false` |
| `bg-color` | 导航栏背景色 | `string` | `''` |
| `height` | 导航栏高度,单位 rpx | `string \| number` | `''` |
| `bordered` | 是否显示下边框 | `boolean` | `false` |
| `fixed` | 是否固定到顶部 | `boolean` | `true` |
| `placeholder` | 固定时是否生成占位元素 | `boolean` | `true` |
| `z-index` | 导航栏层级 | `number` | `99` |
| `safe-area-inset-top` | 是否开启顶部安全区适配 | `boolean` | `true` |
| `capsule` | 是否显示胶囊组件 | `boolean` | `false` |
| `show-back` | 胶囊是否显示返回按钮 | `boolean` | `false` |
| `show-home` | 胶囊是否显示首页按钮 | `boolean` | `false` |
| `auto-back` | 是否自动处理返回操作 | `boolean` | `true` |
| `auto-hide-in-wechat-h5` | 是否在微信公众号 H5 环境下自动隐藏 | `boolean` | `true` |
| `status-bar-text-style` | 状态栏字体颜色 | `'dark' \| 'light'` | `'dark'` |
| `custom-class` | 自定义根节点样式类 | `string` | `''` |
| `custom-style` | 自定义根节点内联样式 | `string` | `''` |

参考: src/wd/components/wd-navbar/wd-navbar.vue:94-164, 183-205

### Navbar Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `back` | 返回事件,胶囊返回按钮或自动返回触发 | `-` |
| `back-home` | 首页按钮点击时触发 | `-` |
| `click-left` | 点击左侧按钮时触发 | `-` |
| `click-right` | 点击右侧按钮时触发 | `-` |
| `height-ready` | 导航栏高度计算完成时触发 | `height: number` |

参考: src/wd/components/wd-navbar/wd-navbar.vue:169-180

### Navbar Slots

| 插槽名 | 说明 |
|--------|------|
| `title` | 自定义标题内容 |
| `left` | 自定义左侧内容 |
| `right` | 自定义右侧内容 |
| `capsule` | 自定义胶囊内容 |

参考: src/wd/components/wd-navbar/wd-navbar.vue:14, 31, 58

### NavbarCapsule Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `show-back` | 是否显示返回按钮 | `boolean` | `true` |
| `show-home` | 是否显示首页按钮 | `boolean` | `true` |
| `back-icon` | 返回按钮图标名称 | `string` | `'left'` |
| `home-icon` | 首页按钮图标名称 | `string` | `'home'` |
| `icon-size` | 图标大小 | `string \| number` | `''` |
| `icon-color` | 图标颜色 | `string` | `''` |
| `bg-color` | 胶囊背景色 | `string` | `''` |
| `border-color` | 胶囊边框颜色 | `string` | `''` |
| `auto-back` | 是否自动返回上一页 | `boolean` | `true` |
| `auto-home` | 是否自动返回首页 | `boolean` | `true` |
| `back-disabled` | 是否禁用返回按钮 | `boolean` | `false` |
| `home-disabled` | 是否禁用首页按钮 | `boolean` | `false` |
| `custom-class` | 自定义根节点样式类 | `string` | `''` |
| `custom-style` | 自定义根节点内联样式 | `string` | `''` |

参考: src/wd/components/wd-navbar-capsule/wd-navbar-capsule.vue:42-77, 90-101

### NavbarCapsule Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `back` | 点击返回按钮时触发 | `-` |
| `back-home` | 点击首页按钮时触发 | `-` |

参考: src/wd/components/wd-navbar-capsule/wd-navbar-capsule.vue:82-87

### 类型定义

```typescript
/**
 * 导航栏组件属性接口
 */
interface WdNavbarProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 状态栏字体颜色 */
  statusBarTextStyle?: 'dark' | 'light'
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
  /** 导航栏高度,单位 rpx */
  height?: string | number
  /** 是否显示下边框 */
  bordered?: boolean
  /** 是否固定到顶部 */
  fixed?: boolean
  /** 固定时是否生成占位元素 */
  placeholder?: boolean
  /** 导航栏层级 */
  zIndex?: number
  /** 是否开启顶部安全区适配 */
  safeAreaInsetTop?: boolean
  /** 是否显示胶囊组件 */
  capsule?: boolean
  /** 胶囊是否显示返回按钮 */
  showBack?: boolean
  /** 胶囊是否显示首页按钮 */
  showHome?: boolean
  /** 是否自动处理返回操作 */
  autoBack?: boolean
  /** 是否在微信公众号H5环境下自动隐藏 */
  autoHideInWechatH5?: boolean
}

/**
 * 导航栏胶囊组件属性接口
 */
interface WdNavbarCapsuleProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 是否显示首页按钮 */
  showHome?: boolean
  /** 返回按钮图标名称 */
  backIcon?: string
  /** 首页按钮图标名称 */
  homeIcon?: string
  /** 图标大小 */
  iconSize?: string | number
  /** 图标颜色 */
  iconColor?: string
  /** 胶囊背景色 */
  bgColor?: string
  /** 胶囊边框颜色 */
  borderColor?: string
  /** 是否自动返回上一页 */
  autoBack?: boolean
  /** 是否自动返回首页 */
  autoHome?: boolean
  /** 是否禁用返回按钮 */
  backDisabled?: boolean
  /** 是否禁用首页按钮 */
  homeDisabled?: boolean
}
```

参考: src/wd/components/wd-navbar/wd-navbar.vue:91-164
参考: src/wd/components/wd-navbar-capsule/wd-navbar-capsule.vue:39-77

## 主题定制

### CSS 变量

Navbar 组件支持通过 CSS 变量进行主题定制:

```scss
// 导航栏变量
$-navbar-height: 88rpx;                    // 导航栏高度
$-navbar-background: #fff;                  // 导航栏背景色
$-navbar-color: #000;                       // 导航栏文字颜色
$-navbar-title-font-weight: 500;            // 标题字重
$-navbar-title-font-size: 34rpx;            // 标题字体大小
$-navbar-desc-font-size: 28rpx;             // 描述文字大小
$-navbar-desc-font-color: #333;             // 描述文字颜色
$-navbar-arrow-size: 32rpx;                 // 箭头图标大小
$-navbar-disabled-opacity: 0.4;             // 禁用状态透明度

// 胶囊变量
$-navbar-capsule-width: 174rpx;             // 胶囊宽度
$-navbar-capsule-height: 64rpx;             // 胶囊高度
$-navbar-capsule-border-radius: 32rpx;      // 胶囊圆角
$-navbar-capsule-border-color: rgba(0, 0, 0, 0.1); // 胶囊边框颜色
$-navbar-capsule-icon-size: 32rpx;          // 胶囊图标大小
```

### 暗黑模式

Navbar 组件支持暗黑模式:

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

    .wd-navbar__icon {
      color: $-dark-color;
    }
  }

  .wd-navbar-capsule {
    &::before {
      border: 1px solid $-dark-border-color;
    }

    &::after {
      background: $-dark-border-color;
    }

    .wd-navbar-capsule__icon {
      color: $-dark-color;
    }
  }
}
```

参考: src/wd/components/wd-navbar/wd-navbar.vue:627-643
参考: src/wd/components/wd-navbar-capsule/wd-navbar-capsule.vue:170-205

## 最佳实践

### 1. 合理使用固定定位

<Ok/> **推荐做法:**
```vue
<template>
  <!-- 大多数页面使用固定定位 + 占位 -->
  <wd-navbar
    title="页面标题"
    :fixed="true"
    :placeholder="true"
  />
</template>
```

<No/> **不推荐做法:**
```vue
<template>
  <!-- 不必要地禁用固定定位 -->
  <wd-navbar
    title="页面标题"
    :fixed="false"
  />
</template>
```

**说明:**
- 固定定位 + 占位是最常见的用法
- 保持导航栏始终可见,提升用户体验
- 占位元素避免内容被遮挡

### 2. 使用胶囊模式

<Ok/> **推荐做法:**
```vue
<template>
  <!-- 需要返回和首页时使用胶囊 -->
  <wd-navbar
    title="页面标题"
    capsule
    :show-back="true"
    :show-home="true"
  />
</template>
```

<No/> **不推荐做法:**
```vue
<template>
  <!-- 手动实现返回和首页逻辑 -->
  <wd-navbar title="页面标题">
    <template #left>
      <view @click="goBack">返回</view>
      <view @click="goHome">首页</view>
    </template>
  </wd-navbar>
</template>
```

**说明:**
- 胶囊模式提供统一的视觉效果
- 自动处理返回和首页逻辑
- 样式符合主流APP设计规范

### 3. 自动返回功能

<Ok/> **推荐做法:**
```vue
<template>
  <!-- 依赖自动返回功能 -->
  <wd-navbar
    title="页面标题"
    left-icon="left"
    :auto-back="true"
  />
</template>
```

<No/> **不推荐做法:**
```vue
<template>
  <!-- 禁用自动返回,手动处理 -->
  <wd-navbar
    title="页面标题"
    left-icon="left"
    :auto-back="false"
    @click-left="handleBack"
  />
</template>

<script lang="ts" setup>
const handleBack = () => {
  uni.navigateBack() // 重复实现已有功能
}
</script>
```

**说明:**
- 自动返回功能已处理大多数场景
- 减少重复代码
- 只有特殊需求时才禁用自动返回

### 4. 样式定制优先级

<Ok/> **推荐做法:**
```vue
<template>
  <!-- 使用Props定制样式 -->
  <wd-navbar
    title="页面标题"
    bg-color="#4d80f0"
    title-color="#fff"
    left-icon="left"
    left-icon-color="#fff"
  />
</template>
```

<No/> **不推荐做法:**
```vue
<template>
  <!-- 过度使用插槽 -->
  <wd-navbar>
    <template #title>
      <view style="color: #fff">页面标题</view>
    </template>
    <template #left>
      <wd-icon name="left" color="#fff" />
    </template>
  </wd-navbar>
</template>
```

**说明:**
- 优先使用 Props 定制样式
- Props 方式更简洁,可维护性更好
- 插槽用于复杂的自定义内容

### 5. 微信H5适配

<Ok/> **推荐做法:**
```vue
<template>
  <!-- 使用默认配置,自动适配微信H5 -->
  <wd-navbar
    title="页面标题"
    left-icon="left"
  />
</template>
```

<No/> **不推荐做法:**
```vue
<template>
  <!-- 禁用自动隐藏 -->
  <wd-navbar
    title="页面标题"
    left-icon="left"
    :auto-hide-in-wechat-h5="false"
  />
</template>
```

**说明:**
- 微信公众号H5环境下,自定义导航栏会与微信导航栏冲突
- 组件默认在该环境下自动隐藏,只设置标题
- 除非有特殊需求,否则不要禁用此功能

## 常见问题

### 1. 导航栏高度丢失

**问题原因:**
- 页面切换时占位高度被重置
- 组件销毁重建导致高度计算时机不对

**解决方案:**

```vue
<template>
  <wd-navbar
    title="页面标题"
    left-icon="left"
    @height-ready="handleHeightReady"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const navbarHeight = ref(0)

const handleHeightReady = (height: number) => {
  navbarHeight.value = height
  // 保存高度供其他地方使用
}
</script>
```

**技术说明:**
```typescript
// 组件会在 onShow 时自动处理高度丢失问题
onShow(() => {
  if (isInitialized.value && props.fixed && props.placeholder) {
    if (!currentHeight || currentHeight === 0) {
      const defaultHeight = pxToRpx(statusBarHeight || 0) + 88
      placeholderHeight.value = defaultHeight
    }
  }
})
```

参考: src/wd/components/wd-navbar/wd-navbar.vue:466-488

### 2. 自动返回不生效

**问题原因:**
- 左侧按钮文字或图标不符合自动识别规则
- 禁用了自动返回功能

**解决方案:**

```vue
<template>
  <!-- 使用标准的返回图标或文字 -->
  <wd-navbar
    title="页面标题"
    left-icon="left"
    left-text="返回"
  />

  <!-- 或者使用 showBack -->
  <wd-navbar
    title="页面标题"
    :show-back="true"
  />
</template>
```

**自动识别规则:**
```typescript
const shouldAutoBack = computed(() => {
  const backTexts = ['返回', '后退']
  const backIcons = ['back', 'left']
  return backTexts.includes(finalLeftText.value) || backIcons.includes(finalLeftIcon.value)
})
```

参考: src/wd/components/wd-navbar/wd-navbar.vue:354-361

### 3. 胶囊样式异常

**问题原因:**
- 只显示一个按钮时样式没有正确应用
- 自定义样式覆盖了默认样式

**解决方案:**

```vue
<template>
  <!-- 单按钮模式会自动应用 is-single-mode 类 -->
  <wd-navbar
    title="页面标题"
    capsule
    :show-back="true"
    :show-home="false"
  />
</template>
```

**技术实现:**
```typescript
const getSingleModeClass = () => {
  const showBackOnly = props.showBack && !props.showHome
  const showHomeOnly = !props.showBack && props.showHome
  if (showBackOnly || showHomeOnly) {
    return 'is-single-mode'
  }
  return ''
}
```

参考: src/wd/components/wd-navbar-capsule/wd-navbar-capsule.vue:109-117, 248-271

### 4. 微信H5标题不显示

**问题原因:**
- 在微信公众号H5环境下,导航栏被隐藏但标题设置失败

**解决方案:**

```vue
<template>
  <!-- 确保设置了 title 属性 -->
  <wd-navbar title="页面标题" />
</template>
```

**技术说明:**
```typescript
const setNavigationBarTitle = () => {
  if (props.title && shouldHideInWechatH5.value) {
    uni.setNavigationBarTitle({
      title: props.title,
    })
  }
}

watch(() => props.title, (newTitle) => {
  if (shouldHideInWechatH5.value && newTitle) {
    setNavigationBarTitle()
  }
})
```

参考: src/wd/components/wd-navbar/wd-navbar.vue:384-395, 533-540

### 5. 状态栏颜色异常

**问题原因:**
- `status-bar-text-style` 设置不正确
- 与背景色对比度不够

**解决方案:**

```vue
<template>
  <!-- 浅色背景使用深色文字 -->
  <wd-navbar
    title="页面标题"
    bg-color="#ffffff"
    status-bar-text-style="dark"
  />

  <!-- 深色背景使用浅色文字 -->
  <wd-navbar
    title="页面标题"
    bg-color="#000000"
    status-bar-text-style="light"
  />
</template>
```

**技术实现:**
```typescript
if (props.statusBarTextStyle) {
  uni.setNavigationBarColor({
    frontColor: props.statusBarTextStyle === 'dark' ? '#000000' : '#ffffff',
    backgroundColor: props.bgColor || '#ffffff',
  })
}
```

参考: src/wd/components/wd-navbar/wd-navbar.vue:100-101, 186, 504-509

## 注意事项

1. **固定定位**: 导航栏默认固定在页面顶部,会自动生成占位元素避免内容被遮挡。

2. **状态栏适配**: 组件会自动适配不同平台的状态栏高度,无需手动处理。

3. **自动返回**: 左侧按钮使用返回图标 (left/back) 或返回文字时,会自动执行 `uni.navigateBack()`。

4. **胶囊模式**: 使用胶囊模式时,左侧区域会被胶囊组件占据,不能同时使用左侧插槽。

5. **微信H5优化**: 在微信公众号H5环境下,组件会自动隐藏自定义导航栏,只设置系统标题。

6. **高度单位**: `height` 属性的单位为 rpx,不包含状态栏高度,实际高度 = height + 状态栏高度。

7. **层级管理**: 固定定位时可通过 `z-index` 调整层级,默认为 99。

8. **插槽优先级**: 使用插槽时会覆盖对应的 Props 配置。

9. **禁用状态**: 禁用按钮后透明度降低,无法点击,但仍会渲染在页面上。

10. **边框样式**: 边框使用 0.5px 细线实现,在高分辨率屏幕上显示更精细。

11. **占位计算**: 占位高度通过查询DOM节点计算,可能存在延迟,建议监听 `height-ready` 事件获取准确高度。

12. **安全区域**: `safe-area-inset-top` 控制是否适配刘海屏,默认开启,关闭后导航栏会紧贴屏幕顶部。

参考: src/wd/components/wd-navbar/wd-navbar.vue:1-753
参考: src/wd/components/wd-navbar-capsule/wd-navbar-capsule.vue:1-297
