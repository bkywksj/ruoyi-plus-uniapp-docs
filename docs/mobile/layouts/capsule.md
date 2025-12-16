# 胶囊组件

## 介绍

胶囊组件（Navbar Capsule）是移动端应用中常见的导航辅助组件，通常与导航栏配合使用，提供返回和首页两个快捷操作入口。RuoYi-Plus-UniApp 项目基于 WD UI 组件库实现了 `wd-navbar-capsule` 组件，采用小程序风格的胶囊设计，外观简洁美观，交互体验友好。

胶囊组件采用了灵活的设计理念，支持单按钮和双按钮两种模式，能够根据页面需求自动切换显示内容。组件内置了自动返回和自动回首页功能，开发者无需手动处理导航逻辑，大大简化了开发流程。同时，组件还支持丰富的样式定制，包括图标、颜色、背景、边框等，能够满足各种设计需求。

**核心特性：**

- **双按钮模式** - 同时显示返回按钮和首页按钮，中间带有分隔线
- **单按钮模式** - 仅显示返回或首页按钮，自动隐藏边框和分隔线
- **自动导航** - 内置自动返回上一页和自动返回首页功能
- **智能降级** - 当自动导航失败时，触发事件让外部处理
- **禁用状态** - 支持单独禁用返回或首页按钮
- **样式定制** - 支持自定义图标、颜色、背景色、边框色
- **暗黑模式** - 完整支持暗黑主题，自动切换配色
- **过渡动画** - 按钮状态切换带有平滑过渡效果

## 基本用法

### 默认双按钮模式

最基本的用法是同时显示返回和首页两个按钮。

```vue
<template>
  <view class="page">
    <wd-navbar title="页面标题" capsule />
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// 默认显示返回和首页按钮
// 点击返回按钮自动执行 uni.navigateBack()
// 点击首页按钮自动跳转到首页
</script>
```

**使用说明：**

- 在 `wd-navbar` 组件上设置 `capsule` 属性即可开启胶囊模式
- 默认同时显示返回按钮（左侧）和首页按钮（右侧）
- 两个按钮之间有竖向分隔线
- 胶囊外边框为圆角矩形

### 独立使用胶囊组件

胶囊组件也可以独立使用，不依赖导航栏。

```vue
<template>
  <view class="page">
    <!-- 自定义导航区域 -->
    <view class="custom-nav">
      <wd-navbar-capsule
        :show-back="true"
        :show-home="true"
        @back="handleBack"
        @back-home="handleBackHome"
      />
      <view class="nav-title">自定义导航</view>
    </view>
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
const handleBack = () => {
  console.log('返回按钮点击')
  // 自定义返回逻辑
}

const handleBackHome = () => {
  console.log('首页按钮点击')
  // 自定义回首页逻辑
}
</script>

```

**使用说明：**

- 直接使用 `wd-navbar-capsule` 组件
- 通过 `show-back` 和 `show-home` 控制按钮显示
- 监听 `back` 和 `back-home` 事件处理点击

## 单按钮模式

### 仅显示返回按钮

当只需要返回功能时，可以只显示返回按钮。

```vue
<template>
  <view class="page">
    <wd-navbar title="详情页">
      <template #capsule>
        <wd-navbar-capsule :show-back="true" :show-home="false" />
      </template>
    </wd-navbar>
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// 单按钮模式下，胶囊边框和分隔线自动隐藏
// 样式更加简洁
</script>
```

**使用说明：**

- 设置 `show-back="true"` 和 `show-home="false"`
- 单按钮模式下自动应用 `is-single-mode` 样式类
- 边框和分隔线自动隐藏
- 图标靠左对齐

### 仅显示首页按钮

当页面没有上一页可返回时，可以只显示首页按钮。

```vue
<template>
  <view class="page">
    <wd-navbar title="分享页面">
      <template #capsule>
        <wd-navbar-capsule :show-back="false" :show-home="true" />
      </template>
    </wd-navbar>
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// 适用于从外部链接打开的页面
// 没有历史记录，只能回到首页
</script>
```

**使用说明：**

- 设置 `show-back="false"` 和 `show-home="true"`
- 适用于从分享链接、扫码等外部入口进入的页面
- 点击首页按钮直接跳转到应用首页

### 在导航栏中配置

通过导航栏的属性直接控制胶囊按钮显示。

```vue
<template>
  <view class="page">
    <!-- 只显示返回按钮 -->
    <wd-navbar title="只有返回" capsule show-back :show-home="false" />

    <!-- 只显示首页按钮 -->
    <wd-navbar title="只有首页" capsule :show-back="false" show-home />

    <!-- 两个都显示 -->
    <wd-navbar title="完整胶囊" capsule show-back show-home />
  </view>
</template>

<script lang="ts" setup>
// 通过 navbar 的属性直接控制
// capsule: 开启胶囊模式
// show-back: 显示返回按钮
// show-home: 显示首页按钮
</script>
```

**使用说明：**

- `capsule` 属性开启胶囊模式
- `show-back` 控制返回按钮
- `show-home` 控制首页按钮
- 可以组合使用

## 自定义图标

### 更换图标

通过 `back-icon` 和 `home-icon` 属性自定义按钮图标。

```vue
<template>
  <view class="page">
    <wd-navbar title="自定义图标">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="true"
          :show-home="true"
          back-icon="arrow-left"
          home-icon="house"
        />
      </template>
    </wd-navbar>
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// back-icon 默认为 "left"
// home-icon 默认为 "home"
// 可以使用 WD UI 图标库中的任意图标
</script>
```

**使用说明：**

- `back-icon` 设置返回按钮图标，默认为 `left`
- `home-icon` 设置首页按钮图标，默认为 `home`
- 支持 WD UI 图标库中的所有图标名称

### 自定义图标大小

通过 `icon-size` 属性设置图标大小。

```vue
<template>
  <view class="page">
    <wd-navbar title="自定义图标大小">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="true"
          :show-home="true"
          icon-size="48rpx"
        />
      </template>
    </wd-navbar>
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// icon-size 支持数字或字符串
// 数字默认单位为 rpx
// 字符串可以指定单位，如 "24px"、"48rpx"
</script>
```

**使用说明：**

- `icon-size` 设置图标大小
- 支持数字（默认 rpx）和字符串（可指定单位）
- 默认大小由组件样式变量定义

### 自定义图标颜色

通过 `icon-color` 属性设置图标颜色。

```vue
<template>
  <view class="page">
    <wd-navbar title="自定义图标颜色" bg-color="#1890ff">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="true"
          :show-home="true"
          icon-color="#ffffff"
        />
      </template>
    </wd-navbar>
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// 深色背景时需要设置浅色图标
// icon-color 设置两个图标的颜色
</script>
```

**使用说明：**

- `icon-color` 设置图标颜色
- 深色背景时建议设置浅色图标
- 颜色值支持十六进制、RGB、RGBA 等格式

## 自定义样式

### 自定义背景色

通过 `bg-color` 属性设置胶囊背景色。

```vue
<template>
  <view class="page">
    <wd-navbar title="自定义背景" bg-color="transparent">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="true"
          :show-home="true"
          bg-color="rgba(0, 0, 0, 0.1)"
          icon-color="#333333"
        />
      </template>
    </wd-navbar>
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// bg-color 设置胶囊背景色
// 可以使用半透明效果
</script>
```

**使用说明：**

- `bg-color` 设置胶囊背景色
- 支持纯色、渐变、透明等 CSS 颜色值
- 配合 `icon-color` 保持视觉协调

### 自定义边框颜色

通过 `border-color` 属性设置胶囊边框颜色。

```vue
<template>
  <view class="page">
    <wd-navbar title="自定义边框">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="true"
          :show-home="true"
          border-color="#1890ff"
          icon-color="#1890ff"
        />
      </template>
    </wd-navbar>
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// border-color 设置胶囊边框和分隔线颜色
// 通过 CSS 变量 --capsule-border-color 实现
</script>
```

**使用说明：**

- `border-color` 设置边框和分隔线颜色
- 通过 CSS 变量实现，影响边框和中间分隔线
- 单按钮模式下边框不显示

### 完全自定义样式

通过 `custom-style` 和 `custom-class` 实现完全自定义。

```vue
<template>
  <view class="page">
    <wd-navbar title="完全自定义">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="true"
          :show-home="true"
          custom-class="my-capsule"
          custom-style="box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);"
        />
      </template>
    </wd-navbar>
    <view class="content">页面内容</view>
  </view>
</template>

<script lang="ts" setup>
// custom-class 添加自定义样式类
// custom-style 添加内联样式
</script>

<style lang="scss">
.my-capsule {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  :deep(.wd-navbar-capsule__icon) {
    color: #ffffff !important;
  }
}
</style>
```

**使用说明：**

- `custom-class` 添加自定义 CSS 类
- `custom-style` 添加内联样式
- 使用 `:deep()` 穿透修改内部样式

## 自动导航

### 自动返回上一页

默认情况下，点击返回按钮会自动执行 `uni.navigateBack()`。

```vue
<template>
  <view class="page">
    <wd-navbar title="自动返回">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="true"
          :show-home="false"
          :auto-back="true"
        />
      </template>
    </wd-navbar>
    <view class="content">点击返回按钮自动返回上一页</view>
  </view>
</template>

<script lang="ts" setup>
// auto-back 默认为 true
// 点击返回按钮自动调用 uni.navigateBack()
// 如果没有上一页，会触发 back 事件
</script>
```

**使用说明：**

- `auto-back` 默认为 `true`，开启自动返回
- 自动调用 `uni.navigateBack()` 返回上一页
- 如果没有历史页面，会触发 `back` 事件

### 自动回到首页

默认情况下，点击首页按钮会自动跳转到首页。

```vue
<template>
  <view class="page">
    <wd-navbar title="自动回首页">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="false"
          :show-home="true"
          :auto-home="true"
        />
      </template>
    </wd-navbar>
    <view class="content">点击首页按钮自动跳转首页</view>
  </view>
</template>

<script lang="ts" setup>
// auto-home 默认为 true
// 点击首页按钮自动调用 uni.redirectTo() 跳转到 /pages/index/index
// 如果跳转失败，会触发 back-home 事件
</script>
```

**使用说明：**

- `auto-home` 默认为 `true`，开启自动回首页
- 自动调用 `uni.redirectTo()` 跳转到 `/pages/index/index`
- 如果跳转失败，会触发 `back-home` 事件

### 禁用自动导航

需要自定义导航逻辑时，可以禁用自动导航。

```vue
<template>
  <view class="page">
    <wd-navbar title="手动导航">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="true"
          :show-home="true"
          :auto-back="false"
          :auto-home="false"
          @back="handleBack"
          @back-home="handleBackHome"
        />
      </template>
    </wd-navbar>
    <view class="content">自定义导航逻辑</view>
  </view>
</template>

<script lang="ts" setup>
const handleBack = () => {
  // 自定义返回逻辑
  // 例如：检查是否有未保存的数据
  uni.showModal({
    title: '提示',
    content: '确定要离开吗？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    },
  })
}

const handleBackHome = () => {
  // 自定义回首页逻辑
  // 例如：清除临时数据后跳转
  uni.switchTab({
    url: '/pages/index/index',
  })
}
</script>
```

**使用说明：**

- 设置 `auto-back="false"` 禁用自动返回
- 设置 `auto-home="false"` 禁用自动回首页
- 监听 `back` 和 `back-home` 事件实现自定义逻辑

## 禁用状态

### 禁用返回按钮

通过 `back-disabled` 禁用返回按钮。

```vue
<template>
  <view class="page">
    <wd-navbar title="禁用返回">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="true"
          :show-home="true"
          :back-disabled="true"
        />
      </template>
    </wd-navbar>
    <view class="content">返回按钮已禁用</view>
  </view>
</template>

<script lang="ts" setup>
// back-disabled 禁用返回按钮
// 禁用时按钮透明度降低，点击无效
</script>
```

**使用说明：**

- `back-disabled` 禁用返回按钮
- 禁用状态下按钮透明度降低
- 点击不会触发任何操作

### 禁用首页按钮

通过 `home-disabled` 禁用首页按钮。

```vue
<template>
  <view class="page">
    <wd-navbar title="禁用首页">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="true"
          :show-home="true"
          :home-disabled="true"
        />
      </template>
    </wd-navbar>
    <view class="content">首页按钮已禁用</view>
  </view>
</template>

<script lang="ts" setup>
// home-disabled 禁用首页按钮
// 禁用时按钮透明度降低，点击无效
</script>
```

**使用说明：**

- `home-disabled` 禁用首页按钮
- 禁用状态下按钮透明度降低
- 点击不会触发任何操作

### 动态控制禁用状态

根据业务逻辑动态控制按钮禁用状态。

```vue
<template>
  <view class="page">
    <wd-navbar title="动态禁用">
      <template #capsule>
        <wd-navbar-capsule
          :show-back="true"
          :show-home="true"
          :back-disabled="isLoading"
          :home-disabled="isLoading"
        />
      </template>
    </wd-navbar>
    <view class="content">
      <wd-button @click="handleSubmit" :loading="isLoading">
        提交数据
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isLoading = ref(false)

const handleSubmit = async () => {
  isLoading.value = true
  try {
    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 2000))
    uni.showToast({ title: '提交成功', icon: 'success' })
  } finally {
    isLoading.value = false
  }
}
</script>
```

**使用说明：**

- 根据加载状态动态禁用按钮
- 防止用户在操作过程中离开页面
- 操作完成后自动恢复可用状态

## 项目中的实现

### 导航栏中的胶囊组件

RuoYi-Plus-UniApp 项目中，导航栏组件内置了胶囊组件的支持：

```vue
<template>
  <view :style="{ height: addUnit(placeholderHeight) }">
    <view :class="`wd-navbar ${customClass} ${fixed ? 'is-fixed' : ''}`">
      <view class="wd-navbar__content">
        <!-- 胶囊区域插槽 -->
        <view v-if="$slots.capsule || capsule" class="wd-navbar__capsule">
          <!-- 如果有自定义胶囊插槽，优先使用自定义内容 -->
          <slot v-if="$slots.capsule" name="capsule" />
          <!-- 否则使用内置胶囊组件 -->
          <wd-navbar-capsule
            v-else
            :show-back="showBack"
            :show-home="showHome"
            @back="handleCapsuleBack"
            @back-home="handleCapsuleBackHome"
          />
        </view>

        <!-- 标题区域 -->
        <view class="wd-navbar__title">
          <slot name="title">
            <block v-if="title">{{ title }}</block>
          </slot>
        </view>

        <!-- 右侧区域 -->
        <view v-if="rightIcon || rightText || $slots.right" class="wd-navbar__right">
          <slot name="right" />
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import wdNavbarCapsule from '../wd-navbar-capsule/wd-navbar-capsule.vue'

// 处理胶囊返回按钮点击事件
const handleCapsuleBack = () => {
  emit('back')
}

// 处理胶囊首页按钮点击事件
const handleCapsuleBackHome = () => {
  emit('back-home')
}
</script>
```

**实现说明：**

- 导航栏组件内置胶囊组件支持
- 通过 `capsule` 属性开启
- 通过 `#capsule` 插槽自定义胶囊内容
- 事件冒泡到导航栏组件

### 在业务页面中使用

实际业务页面中的胶囊使用示例：

```vue
<template>
  <view class="min-h-[100vh]">
    <!-- 商品详情页导航 -->
    <wd-navbar
      :title="goods.name"
      :bg-color="`rgba(255, 255, 255, ${opacity})`"
      capsule
      show-back
      :show-home="!hasHistory"
      @back="handleBack"
      @back-home="handleBackHome"
    />

    <!-- 商品内容 -->
    <scroll-view scroll-y @scroll="handleScroll">
      <wd-img :src="goods.image" width="100%" mode="widthFix" />
      <view class="goods-info">
        <view class="goods-name">{{ goods.name }}</view>
        <view class="goods-price">¥{{ goods.price }}</view>
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
import { ref, computed, onMounted } from 'vue'

const goods = ref({
  name: '商品名称',
  price: '99.00',
  image: '/static/goods.jpg',
})

// 检查是否有历史记录
const hasHistory = ref(true)

onMounted(() => {
  const pages = getCurrentPages()
  hasHistory.value = pages.length > 1
})

// 滚动透明度
const scrollTop = ref(0)
const opacity = computed(() => Math.min(scrollTop.value / 100, 1))

const handleScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}

const handleBack = () => {
  uni.navigateBack()
}

const handleBackHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const handleBuy = () => {
  // 购买逻辑
}
</script>
```

**使用说明：**

- 根据页面历史动态显示首页按钮
- 滚动时导航栏透明度渐变
- 胶囊与导航栏样式协调一致

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customStyle | 自定义根节点样式 | `string` | `''` |
| customClass | 自定义根节点样式类 | `string` | `''` |
| showBack | 是否显示返回按钮 | `boolean` | `true` |
| showHome | 是否显示首页按钮 | `boolean` | `true` |
| backIcon | 返回按钮图标名称 | `string` | `'left'` |
| homeIcon | 首页按钮图标名称 | `string` | `'home'` |
| iconSize | 图标大小 | `string \| number` | - |
| iconColor | 图标颜色 | `string` | - |
| bgColor | 胶囊背景色 | `string` | - |
| borderColor | 胶囊边框颜色 | `string` | - |
| autoBack | 是否自动返回上一页 | `boolean` | `true` |
| autoHome | 是否自动返回首页 | `boolean` | `true` |
| backDisabled | 是否禁用返回按钮 | `boolean` | `false` |
| homeDisabled | 是否禁用首页按钮 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| back | 点击返回按钮时触发 | - |
| back-home | 点击首页按钮时触发 | - |

### 类型定义

```typescript
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

  /** 是否自动返回上一页，为false时需要手动监听back事件 */
  autoBack?: boolean
  /** 是否自动返回首页，为false时需要手动监听back-home事件 */
  autoHome?: boolean

  /** 是否禁用返回按钮 */
  backDisabled?: boolean
  /** 是否禁用首页按钮 */
  homeDisabled?: boolean
}

/**
 * 导航栏胶囊组件事件接口
 */
interface WdNavbarCapsuleEmits {
  /** 点击返回按钮时触发 */
  back: []
  /** 点击首页按钮时触发 */
  'back-home': []
}
```

## 主题定制

### CSS 变量

胶囊组件使用以下 CSS 变量，可通过 ConfigProvider 组件进行全局定制：

```scss
// 胶囊宽度（双按钮模式）
$-navbar-capsule-width: 176rpx;

// 胶囊高度
$-navbar-capsule-height: 64rpx;

// 胶囊边框圆角
$-navbar-capsule-border-radius: 32rpx;

// 胶囊边框颜色
$-navbar-capsule-border-color: rgba(0, 0, 0, 0.15);

// 胶囊图标大小
$-navbar-capsule-icon-size: 40rpx;

// 图标颜色
$-navbar-desc-font-color: #666666;

// 禁用状态透明度
$-navbar-disabled-opacity: 0.5;

// 禁用图标颜色
$-color-icon-disabled: #c8c9cc;
```

### 暗黑模式

胶囊组件支持暗黑模式，在暗黑主题下会自动应用以下样式：

```scss
.wot-theme-dark {
  .wd-navbar-capsule {
    // 暗色边框
    &::before {
      border: 1px solid $-dark-border-color;
    }

    // 暗色分隔线
    &::after {
      background: $-dark-border-color;
    }

    // 暗色图标
    :deep(.wd-navbar-capsule__icon) {
      color: $-dark-color;

      // 暗色主题下的禁用状态
      &.is-disabled {
        opacity: $-navbar-disabled-opacity;
        color: $-color-icon-disabled !important;
      }
    }

    // 单按钮模式下隐藏边框和分隔线
    &.is-single-mode {
      &::before {
        display: none;
      }

      &::after {
        display: none;
      }
    }
  }
}
```

### 自定义主题示例

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <wd-navbar title="自定义主题" capsule show-back show-home />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const themeVars = ref({
  navbarCapsuleWidth: '200rpx',
  navbarCapsuleHeight: '72rpx',
  navbarCapsuleBorderRadius: '36rpx',
  navbarCapsuleBorderColor: 'rgba(24, 144, 255, 0.3)',
  navbarCapsuleIconSize: '44rpx',
})
</script>
```

## 最佳实践

### 1. 根据页面类型选择按钮组合

根据页面的入口类型选择合适的按钮组合：

```vue
<template>
  <!-- 普通详情页：显示返回按钮 -->
  <wd-navbar v-if="pageType === 'detail'" title="详情" capsule show-back :show-home="false" />

  <!-- 分享入口页：显示首页按钮 -->
  <wd-navbar v-if="pageType === 'share'" title="分享页" capsule :show-back="false" show-home />

  <!-- 深层级页面：显示返回和首页 -->
  <wd-navbar v-if="pageType === 'deep'" title="深层页面" capsule show-back show-home />

  <!-- 首页：不需要胶囊 -->
  <wd-navbar v-if="pageType === 'home'" title="首页" />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const pageType = ref('detail')

onMounted(() => {
  const pages = getCurrentPages()
  const options = pages[pages.length - 1]?.options || {}

  // 根据页面参数或层级判断类型
  if (pages.length === 1) {
    if (options.from === 'share') {
      pageType.value = 'share'
    } else {
      pageType.value = 'home'
    }
  } else if (pages.length > 3) {
    pageType.value = 'deep'
  } else {
    pageType.value = 'detail'
  }
})
</script>
```

### 2. 处理未保存数据的返回拦截

在表单页面拦截返回操作，提示用户保存数据：

```vue
<template>
  <wd-navbar title="编辑页面">
    <template #capsule>
      <wd-navbar-capsule
        show-back
        :show-home="false"
        :auto-back="false"
        @back="handleBack"
      />
    </template>
  </wd-navbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({ name: '', content: '' })
const originalData = ref({ name: '', content: '' })

// 检查是否有未保存的更改
const hasUnsavedChanges = () => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
}

const handleBack = () => {
  if (hasUnsavedChanges()) {
    uni.showModal({
      title: '提示',
      content: '有未保存的更改，确定要离开吗？',
      confirmText: '离开',
      cancelText: '继续编辑',
      success: (res) => {
        if (res.confirm) {
          uni.navigateBack()
        }
      },
    })
  } else {
    uni.navigateBack()
  }
}
</script>
```

### 3. 配合透明导航栏使用

实现滚动渐变透明效果时，同步调整胶囊样式：

```vue
<template>
  <wd-navbar
    :title="showTitle ? '页面标题' : ''"
    :bg-color="`rgba(255, 255, 255, ${opacity})`"
  >
    <template #capsule>
      <wd-navbar-capsule
        show-back
        :show-home="false"
        :bg-color="`rgba(0, 0, 0, ${0.05 + opacity * 0.05})`"
        :border-color="`rgba(0, 0, 0, ${0.1 + opacity * 0.05})`"
        :icon-color="opacity > 0.5 ? '#333333' : '#ffffff'"
      />
    </template>
  </wd-navbar>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const scrollTop = ref(0)

const opacity = computed(() => Math.min(scrollTop.value / 150, 1))
const showTitle = computed(() => opacity.value > 0.5)
</script>
```

### 4. 小程序与 H5 的适配

根据平台调整胶囊显示策略：

```vue
<template>
  <wd-navbar
    title="跨平台页面"
    :capsule="showCapsule"
    show-back
    :show-home="showHomeButton"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const showCapsule = ref(true)
const showHomeButton = ref(true)

onMounted(() => {
  // #ifdef H5
  // H5 环境下，根据浏览器历史判断
  showHomeButton.value = history.length <= 1
  // #endif

  // #ifdef MP-WEIXIN
  // 小程序环境下，胶囊位置需要避开系统胶囊
  const systemInfo = uni.getSystemInfoSync()
  if (systemInfo.platform === 'ios') {
    // iOS 小程序特殊处理
  }
  // #endif
})
</script>
```

## 常见问题

### 1. 胶囊边框显示不完整

**问题原因：**

- 父容器有 `overflow: hidden` 导致边框被裁切
- 缩放变换影响边框显示

**解决方案：**

确保父容器不会裁切胶囊内容：

```scss
// 检查父容器样式
.parent-container {
  overflow: visible; // 不要使用 hidden
}

// 胶囊使用 200% + scale(0.5) 实现 0.5px 边框
// 确保有足够的空间
.wd-navbar__capsule {
  overflow: visible;
}
```

### 2. 单按钮模式下图标位置不正确

**问题原因：**

- 自定义样式覆盖了组件的单按钮模式样式
- CSS 特异性问题

**解决方案：**

使用正确的选择器覆盖样式：

```scss
.wd-navbar-capsule.is-single-mode {
  // 确保图标靠左
  :deep(.wd-navbar-capsule__icon) {
    flex: none !important;
    width: auto !important;
    margin-right: auto !important;
  }
}
```

### 3. 自动返回失败

**问题原因：**

- 页面是通过 `reLaunch` 或 `redirectTo` 打开的，没有历史记录
- 页面栈为空

**解决方案：**

监听 `back` 事件处理失败情况：

```vue
<template>
  <wd-navbar-capsule
    show-back
    :auto-back="true"
    @back="handleBackFailed"
  />
</template>

<script lang="ts" setup>
const handleBackFailed = () => {
  // 自动返回失败时的处理
  console.log('没有上一页，跳转到首页')
  uni.switchTab({ url: '/pages/index/index' })
}
</script>
```

### 4. 暗黑模式下颜色不生效

**问题原因：**

- 内联样式优先级高于主题样式
- 自定义颜色覆盖了主题颜色

**解决方案：**

使用响应式的颜色值：

```vue
<template>
  <wd-navbar-capsule
    show-back
    show-home
    :icon-color="isDark ? '#ffffff' : '#333333'"
    :border-color="isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'"
  />
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
</script>
```

或者不设置自定义颜色，让组件使用主题变量：

```vue
<template>
  <!-- 不设置 icon-color 和 border-color，使用主题默认值 -->
  <wd-navbar-capsule show-back show-home />
</template>
```

### 5. 点击事件不触发

**问题原因：**

- 按钮被禁用
- 事件被父元素阻止
- 自动导航成功，没有触发事件

**解决方案：**

检查禁用状态和自动导航设置：

```vue
<template>
  <wd-navbar-capsule
    show-back
    show-home
    :back-disabled="false"
    :home-disabled="false"
    :auto-back="false"
    :auto-home="false"
    @back="handleBack"
    @back-home="handleBackHome"
  />
</template>

<script lang="ts" setup>
const handleBack = () => {
  console.log('返回按钮点击') // 确认事件触发
  uni.navigateBack()
}

const handleBackHome = () => {
  console.log('首页按钮点击') // 确认事件触发
  uni.switchTab({ url: '/pages/index/index' })
}
</script>
```

### 6. 与系统胶囊重叠（小程序）

**问题原因：**

- 微信小程序有系统自带的胶囊按钮
- 自定义胶囊可能与系统胶囊重叠

**解决方案：**

获取系统胶囊位置，调整自定义胶囊布局：

```vue
<template>
  <view :style="{ paddingRight: menuButtonWidth + 'px' }">
    <wd-navbar title="小程序页面">
      <template #capsule>
        <wd-navbar-capsule show-back :show-home="false" />
      </template>
    </wd-navbar>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const menuButtonWidth = ref(0)

onMounted(() => {
  // #ifdef MP-WEIXIN
  const menuButton = uni.getMenuButtonBoundingClientRect()
  // 计算需要预留的空间
  menuButtonWidth.value = menuButton.width + 10
  // #endif
})
</script>
```

### 7. 图标显示异常

**问题原因：**

- 图标名称错误
- 图标字体未加载

**解决方案：**

确保使用正确的图标名称：

```vue
<template>
  <!-- 使用 WD UI 内置图标 -->
  <wd-navbar-capsule
    show-back
    show-home
    back-icon="left"
    home-icon="home"
  />

  <!-- 或使用其他可用图标 -->
  <wd-navbar-capsule
    show-back
    show-home
    back-icon="arrow-left"
    home-icon="house"
  />
</template>
```

可用的图标名称请参考 WD UI 图标库文档。
