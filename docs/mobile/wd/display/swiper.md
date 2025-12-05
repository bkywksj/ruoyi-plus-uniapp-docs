# Swiper 轮播图

## 介绍

Swiper 是一个功能强大的轮播组件,支持图片和视频资源的轮播展示。它提供了丰富的配置选项和灵活的自定义能力,支持水平和垂直方向滑动、多种指示器样式、自动播放、循环播放等特性,是实现轮播图、广告banner、产品展示等场景的理想选择。

**核心特性:**

- **多资源支持** - 同时支持图片和视频资源,自动识别资源类型
- **灵活的滑动方向** - 支持水平和垂直两个方向的滑动
- **丰富的指示器** - 提供点状、条状、分式三种指示器样式,支持8个位置
- **控制按钮** - 可选的左右切换按钮,支持手动控制
- **自动播放** - 支持自动播放和循环播放,可配置间隔时间
- **视频控制** - 支持视频自动播放、循环播放、静音、切换停止等功能
- **多项显示** - 支持同时显示多个轮播项
- **前后边距** - 支持设置前后边距,实现卡片式轮播效果
- **自定义动画** - 支持5种缓动函数,可自定义动画效果
- **文字标题** - 支持在轮播项上显示文字标题

## 基本用法

### 图片轮播

最基础的图片轮播:

```vue
<template>
  <view class="demo">
    <wd-swiper :list="imageList" height="350" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `list` 接收字符串数组,每个元素是图片URL
- `height` 设置轮播高度,默认单位为rpx
- 默认开启自动播放和循环播放
- 底部显示点状指示器

### 视频轮播

轮播视频资源:

```vue
<template>
  <view class="demo">
    <wd-swiper :list="videoList" height="400" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const videoList = ref([
  'https://example.com/video1.mp4',
  'https://example.com/video2.mp4'
])
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**技术实现:**
- 组件自动识别视频URL(根据扩展名 .mp4, .avi, .mov 等)
- 视频默认自动播放、循环播放、静音
- 切换轮播项时自动停止上一个视频播放

### 图片和视频混合

混合展示图片和视频:

```vue
<template>
  <view class="demo">
    <wd-swiper :list="mixedList" height="400" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface SwiperItem {
  value: string
  type?: 'image' | 'video'
  poster?: string
  text?: string
}

const mixedList = ref<SwiperItem[]>([
  {
    value: 'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
    type: 'image',
    text: '图片标题'
  },
  {
    value: 'https://example.com/video.mp4',
    type: 'video',
    poster: 'https://example.com/poster.jpg',
    text: '视频标题'
  }
])
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- 使用对象数组时可以明确指定 `type` 类型
- `poster` 设置视频封面图
- `text` 设置轮播项标题,显示在右上角
- `value` 是资源URL的默认字段名

### 垂直方向

设置为垂直方向滑动:

```vue
<template>
  <view class="demo">
    <wd-swiper
      :list="imageList"
      height="400"
      direction="vertical"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `direction="vertical"` 设置为垂直滑动
- 指示器会自动调整为垂直布局
- 适用于抖音式的上下滑动场景

### 指示器类型

支持三种指示器样式:

```vue
<template>
  <view class="demo">
    <!-- 点状指示器 -->
    <view class="section">
      <text class="label">点状指示器 (dots)</text>
      <wd-swiper
        :list="imageList"
        height="300"
        :indicator="{ type: 'dots' }"
      />
    </view>

    <!-- 条状指示器 -->
    <view class="section">
      <text class="label">条状指示器 (dots-bar)</text>
      <wd-swiper
        :list="imageList"
        height="300"
        :indicator="{ type: 'dots-bar' }"
      />
    </view>

    <!-- 分式指示器 -->
    <view class="section">
      <text class="label">分式指示器 (fraction)</text>
      <wd-swiper
        :list="imageList"
        height="300"
        :indicator="{ type: 'fraction' }"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}
</style>
```

**指示器类型:**
- `dots` - 圆点指示器,激活的点高亮显示
- `dots-bar` - 条状指示器,激活的点拉伸为条形
- `fraction` - 分式指示器,显示 "1/3" 格式的页码

### 指示器位置

支持8个位置放置指示器:

```vue
<template>
  <view class="demo">
    <!-- 上方位置 -->
    <wd-swiper
      :list="imageList"
      height="300"
      indicator-position="top"
    />

    <!-- 左上角 -->
    <wd-swiper
      :list="imageList"
      height="300"
      indicator-position="top-left"
    />

    <!-- 右上角 -->
    <wd-swiper
      :list="imageList"
      height="300"
      indicator-position="top-right"
    />

    <!-- 底部居中 (默认) -->
    <wd-swiper
      :list="imageList"
      height="300"
      indicator-position="bottom"
    />

    <!-- 左下角 -->
    <wd-swiper
      :list="imageList"
      height="300"
      indicator-position="bottom-left"
    />

    <!-- 右下角 -->
    <wd-swiper
      :list="imageList"
      height="300"
      indicator-position="bottom-right"
    />

    <!-- 左侧居中 -->
    <wd-swiper
      :list="imageList"
      height="300"
      indicator-position="left"
    />

    <!-- 右侧居中 -->
    <wd-swiper
      :list="imageList"
      height="300"
      indicator-position="right"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])
</script>
```

**位置说明:**
- `top-left` - 左上角
- `top` - 上方居中
- `top-right` - 右上角
- `left` - 左侧居中
- `right` - 右侧居中
- `bottom-left` - 左下角
- `bottom` - 底部居中(默认)
- `bottom-right` - 右下角

### 控制按钮

显示左右切换按钮:

```vue
<template>
  <view class="demo">
    <wd-swiper
      :list="imageList"
      height="350"
      :indicator="{ showControls: true }"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `indicator.showControls` 开启控制按钮
- 左右两侧显示圆形按钮
- 点击按钮可切换到上一个/下一个轮播项
- 适用于PC端或需要手动控制的场景

### 自定义指示器

使用插槽自定义指示器样式:

```vue
<template>
  <view class="demo">
    <wd-swiper :list="imageList" height="350">
      <template #indicator="{ current, total }">
        <view class="custom-indicator">
          <text class="indicator-text">{{ current + 1 }} / {{ total }}</text>
        </view>
      </template>
    </wd-swiper>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.custom-indicator {
  position: absolute;
  right: 32rpx;
  bottom: 32rpx;
  background: rgba(0, 0, 0, 0.6);
  padding: 8rpx 24rpx;
  border-radius: 32rpx;
}

.indicator-text {
  color: #fff;
  font-size: 24rpx;
}
</style>
```

**插槽参数:**
- `current` - 当前页索引(从0开始)
- `total` - 总页数

### 前后边距

设置前后边距实现卡片式效果:

```vue
<template>
  <view class="demo">
    <wd-swiper
      :list="imageList"
      height="300"
      previous-margin="60"
      next-margin="60"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `previous-margin` 设置前边距,默认单位rpx
- `next-margin` 设置后边距,默认单位rpx
- 边距内可以看到相邻的轮播项
- 实现类似卡片堆叠的视觉效果

### 同时显示多项

同时显示多个轮播项:

```vue
<template>
  <view class="demo">
    <wd-swiper
      :list="imageList}
      height="300"
      :display-multiple-items="2"
      previous-margin="32"
      next-margin="32"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg',
  'https://unpkg.com/wot-design-uni-assets/bear.jpg'
])
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `display-multiple-items` 设置同时显示的数量
- 通常配合边距使用,展示相邻项
- 适用于商品列表、图片画廊等场景

### 关闭自动播放

手动控制轮播,关闭自动播放:

```vue
<template>
  <view class="demo">
    <wd-swiper
      :list="imageList"
      height="350"
      :autoplay="false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `autoplay="false"` 关闭自动播放
- 用户只能手动滑动切换
- 通常配合控制按钮使用

### 自定义间隔时间

设置轮播间隔时间:

```vue
<template>
  <view class="demo">
    <wd-swiper
      :list="imageList"
      height="350"
      :interval="3000"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `interval` 设置自动切换间隔,单位毫秒
- 默认值为 5000ms (5秒)
- 配合 `duration` 可以调整切换速度

### 自定义切换动画

设置缓动函数控制切换动画:

```vue
<template>
  <view class="demo">
    <!-- 线性动画 -->
    <wd-swiper
      :list="imageList"
      height="300"
      easing-function="linear"
    />

    <!-- 缓入动画 -->
    <wd-swiper
      :list="imageList"
      height="300"
      easing-function="easeInCubic"
    />

    <!-- 缓出动画 -->
    <wd-swiper
      :list="imageList"
      height="300"
      easing-function="easeOutCubic"
    />

    <!-- 缓入缓出动画 -->
    <wd-swiper
      :list="imageList"
      height="300"
      easing-function="easeInOutCubic"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])
</script>
```

**缓动函数:**
- `default` - 默认动画
- `linear` - 线性动画,匀速运动
- `easeInCubic` - 缓入动画,慢速开始加速结束
- `easeOutCubic` - 缓出动画,快速开始减速结束
- `easeInOutCubic` - 缓入缓出,慢速开始和结束

### 监听事件

监听轮播切换和点击事件:

```vue
<template>
  <view class="demo">
    <wd-swiper
      :list="imageList"
      height="350"
      @change="handleChange"
      @animationfinish="handleAnimationFinish"
      @click="handleClick"
    />

    <view class="info">
      <text>当前页: {{ currentIndex + 1 }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])

const currentIndex = ref(0)

// 切换事件
const handleChange = ({ current, source }: { current: number; source: string }) => {
  console.log('切换到:', current, '来源:', source)
  currentIndex.value = current
}

// 动画结束事件
const handleAnimationFinish = ({ current, source }: { current: number; source: string }) => {
  console.log('动画结束:', current)
}

// 点击事件
const handleClick = ({ index, item }: { index: number; item: any }) => {
  console.log('点击:', index, item)
  uni.showToast({
    title: `点击了第 ${index + 1} 项`,
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.info {
  margin-top: 32rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
}
</style>
```

**事件说明:**
- `change` - 切换时触发,参数包含当前索引和来源(autoplay/touch/nav)
- `animationfinish` - 动画结束时触发
- `click` - 点击轮播项时触发,参数包含索引和数据项

### 程序控制

通过 v-model 或 current 属性控制轮播:

```vue
<template>
  <view class="demo">
    <wd-swiper
      v-model:current="currentPage"
      :list="imageList"
      height="350"
    />

    <view class="controls">
      <wd-button @click="prev">上一页</wd-button>
      <wd-button @click="next">下一页</wd-button>
      <wd-button @click="goTo(0)">跳转到第1页</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
])

const currentPage = ref(0)

// 上一页
const prev = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  } else {
    currentPage.value = imageList.value.length - 1
  }
}

// 下一页
const next = () => {
  if (currentPage.value < imageList.value.length - 1) {
    currentPage.value++
  } else {
    currentPage.value = 0
  }
}

// 跳转到指定页
const goTo = (index: number) => {
  currentPage.value = index
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.controls {
  margin-top: 32rpx;
  display: flex;
  gap: 16rpx;
  justify-content: center;
}
</style>
```

**使用说明:**
- 使用 `v-model:current` 双向绑定当前页
- 修改 `current` 值可以切换到指定页
- 超出范围时会自动调整(循环模式下)

## 实战案例

### 案例1: 电商首页轮播

电商首页的广告轮播banner:

```vue
<template>
  <view class="home-page">
    <!-- 轮播banner -->
    <wd-swiper
      :list="bannerList"
      height="750"
      :interval="4000"
      indicator-position="bottom-right"
      :indicator="{ type: 'fraction' }"
      @click="handleBannerClick"
    />

    <!-- 其他内容 -->
    <view class="content">
      <text class="title">热门商品</text>
      <!-- ... -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Banner {
  value: string
  text: string
  link: string
}

const bannerList = ref<Banner[]>([
  {
    value: 'https://unpkg.com/wot-design-uni-assets/banner1.jpg',
    text: '618大促',
    link: '/pages/promotion/618'
  },
  {
    value: 'https://unpkg.com/wot-design-uni-assets/banner2.jpg',
    text: '新品上市',
    link: '/pages/product/new'
  },
  {
    value: 'https://unpkg.com/wot-design-uni-assets/banner3.jpg',
    text: '限时秒杀',
    link: '/pages/seckill/index'
  }
])

// 点击banner
const handleBannerClick = ({ index, item }: { index: number; item: Banner }) => {
  uni.navigateTo({
    url: item.link
  })
}
</script>

<style lang="scss" scoped>
.home-page {
  background: #f5f5f5;
}

.content {
  padding: 32rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
</style>
```

**实现要点:**
- 全屏宽度显示,高度按设计稿比例设置
- 分式指示器显示在右下角
- 点击跳转到对应活动页面
- 4秒自动切换间隔

### 案例2: 商品图片展示

商品详情页的图片展示:

```vue
<template>
  <view class="product-detail">
    <!-- 商品图片轮播 -->
    <wd-swiper
      v-model:current="currentImage"
      :list="productImages"
      height="750"
      :autoplay="false"
      indicator-position="bottom"
      :indicator="{ type: 'dots' }"
      image-mode="aspectFill"
      @click="handlePreview"
    />

    <!-- 缩略图 -->
    <scroll-view scroll-x class="thumbnail-list">
      <view
        v-for="(img, index) in productImages"
        :key="index"
        :class="['thumbnail-item', { active: currentImage === index }]"
        @click="currentImage = index"
      >
        <image :src="img" class="thumbnail-image" mode="aspectFill" />
      </view>
    </scroll-view>

    <!-- 商品信息 -->
    <view class="product-info">
      <text class="product-name">经典红熊猫玩偶</text>
      <text class="product-price">¥199.00</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const productImages = ref([
  'https://unpkg.com/wot-design-uni-assets/product1.jpg',
  'https://unpkg.com/wot-design-uni-assets/product2.jpg',
  'https://unpkg.com/wot-design-uni-assets/product3.jpg',
  'https://unpkg.com/wot-design-uni-assets/product4.jpg'
])

const currentImage = ref(0)

// 预览图片
const handlePreview = () => {
  uni.previewImage({
    urls: productImages.value,
    current: currentImages.value[currentImage.value]
  })
}
</script>

<style lang="scss" scoped>
.product-detail {
  background: #fff;
}

.thumbnail-list {
  white-space: nowrap;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.thumbnail-item {
  display: inline-block;
  width: 120rpx;
  height: 120rpx;
  margin-right: 16rpx;
  border: 2rpx solid transparent;
  border-radius: 8rpx;
  overflow: hidden;

  &.active {
    border-color: #1890ff;
  }
}

.thumbnail-image {
  width: 100%;
  height: 100%;
}

.product-info {
  padding: 32rpx;
}

.product-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.product-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff4d4f;
}
</style>
```

**实现要点:**
- 关闭自动播放,手动控制
- 下方显示缩略图,点击切换
- 点击大图预览
- 当前图片缩略图高亮显示

### 案例3: 短视频播放

类似抖音的短视频上下滑动:

```vue
<template>
  <view class="video-page">
    <wd-swiper
      v-model:current="currentVideo"
      :list="videoList"
      height="100vh"
      direction="vertical"
      :indicator="false"
      :autoplay="false"
      :loop="true"
      :video-loop="false"
      :stop-previous-video="true"
      :stop-autoplay-when-video-play="false"
      @change="handleVideoChange"
    />

    <!-- 右侧操作栏 -->
    <view class="actions">
      <view class="action-item" @click="handleLike">
        <wd-icon name="thumb-up" size="64" color="#fff" />
        <text class="action-text">{{ videoList[currentVideo].likes }}</text>
      </view>

      <view class="action-item" @click="handleComment">
        <wd-icon name="chat" size="64" color="#fff" />
        <text class="action-text">{{ videoList[currentVideo].comments }}</text>
      </view>

      <view class="action-item" @click="handleShare">
        <wd-icon name="share" size="64" color="#fff" />
        <text class="action-text">分享</text>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="video-info">
      <text class="author">@{{ videoList[currentVideo].author }}</text>
      <text class="description">{{ videoList[currentVideo].description }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Video {
  value: string
  type: 'video'
  poster: string
  author: string
  description: string
  likes: number
  comments: number
}

const videoList = ref<Video[]>([
  {
    value: 'https://example.com/video1.mp4',
    type: 'video',
    poster: 'https://example.com/poster1.jpg',
    author: '用户A',
    description: '这是一个精彩的视频 #生活 #分享',
    likes: 1234,
    comments: 56
  },
  {
    value: 'https://example.com/video2.mp4',
    type: 'video',
    poster: 'https://example.com/poster2.jpg',
    author: '用户B',
    description: '记录美好时刻 #旅行 #风景',
    likes: 5678,
    comments: 123
  }
])

const currentVideo = ref(0)

// 视频切换
const handleVideoChange = ({ current }: { current: number }) => {
  console.log('切换到视频:', current)
}

// 点赞
const handleLike = () => {
  videoList.value[currentVideo.value].likes++
  uni.showToast({
    title: '点赞成功',
    icon: 'success'
  })
}

// 评论
const handleComment = () => {
  uni.showToast({
    title: '评论功能',
    icon: 'none'
  })
}

// 分享
const handleShare = () => {
  uni.showShareMenu()
}
</script>

<style lang="scss" scoped>
.video-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
}

.actions {
  position: fixed;
  right: 32rpx;
  bottom: 200rpx;
  z-index: 10;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.action-text {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #fff;
}

.video-info {
  position: fixed;
  left: 32rpx;
  bottom: 100rpx;
  right: 160rpx;
  z-index: 10;
}

.author {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}

.description {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}
</style>
```

**实现要点:**
- 垂直方向滑动
- 全屏显示视频
- 切换时停止上一个视频
- 右侧显示操作按钮
- 底部显示视频信息

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `list` | 图片/视频列表,可以是对象数组或字符串数组 | `SwiperList[] \| string[]` | `[]` |
| `current` | 当前轮播在哪一项(下标),支持 v-model | `number` | `0` |
| `height` | 轮播的高度 | `number \| string` | `350` |
| `autoplay` | 是否自动播放轮播图 | `boolean` | `true` |
| `interval` | 轮播间隔时间,单位毫秒 | `number` | `5000` |
| `duration` | 滑动动画时长,单位毫秒 | `number` | `300` |
| `loop` | 是否循环播放轮播图 | `boolean` | `true` |
| `direction` | 轮播滑动方向,`horizontal`(水平)或`vertical`(垂直) | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `indicator` | 指示器全部配置,可以是布尔值或指示器配置对象 | `boolean \| Partial<WdSwiperNavProps>` | `true` |
| `indicator-position` | 页码信息展示位置 | `IndicatorPositionType` | `'bottom'` |
| `image-mode` | 图片裁剪、缩放的模式 | `ImageMode` | `'aspectFill'` |
| `display-multiple-items` | 同时显示的滑块数量 | `number` | `1` |
| `previous-margin` | 前边距 | `number \| string` | `0` |
| `next-margin` | 后边距 | `number \| string` | `0` |
| `snap-to-edge` | 是否应用边距到第一个、最后一个元素 | `boolean` | `false` |
| `easing-function` | 指定 swiper 切换缓动动画类型 | `EasingType` | `'default'` |
| `value-key` | 选项对象中,value 对应的 key | `string` | `'value'` |
| `text-key` | 选项对象中,标题 text 对应的 key | `string` | `'text'` |
| `video-loop` | 视频是否循环播放 | `boolean` | `true` |
| `muted` | 视频是否静音播放 | `boolean` | `true` |
| `autoplay-video` | 视频是否自动播放 | `boolean` | `true` |
| `stop-previous-video` | 切换轮播项时是否停止上一个视频的播放 | `boolean` | `true` |
| `stop-autoplay-when-video-play` | 视频播放时是否停止自动轮播 | `boolean` | `false` |
| `adjust-height` | 自动以指定滑块的高度为整个容器的高度,仅支付宝小程序支持 | `AdjustHeightType` | `'highest'` |
| `adjust-vertical-height` | vertical 为 true 时强制使 adjust-height 生效,仅支付宝小程序支持 | `boolean` | `false` |
| `custom-style` | 自定义根节点样式 | `string` | `''` |
| `custom-class` | 自定义根节点样式类 | `string` | `''` |
| `custom-indicator-class` | 自定义指示器类名 | `string` | `''` |
| `custom-image-class` | 自定义图片类名 | `string` | `''` |
| `custom-item-class` | 自定义swiper子项类名 | `string` | `''` |
| `custom-text-class` | 自定义文字标题类名 | `string` | `''` |
| `custom-text-style` | 自定义文字标题样式 | `string` | `''` |

### SwiperList 类型

```typescript
/**
 * 轮播项接口
 */
interface SwiperList {
  [key: string]: any

  /** 图片、视频等资源地址 */
  value?: string
  /** 视频资源的封面 */
  poster?: string
  /** 资源文件类型,可选值:'image' | 'video' */
  type?: 'image' | 'video'
  /** 标题文字 */
  text?: string
}
```

### IndicatorPositionType 类型

```typescript
type IndicatorPositionType =
  | 'left'           // 左侧居中
  | 'top-left'       // 左上角
  | 'top'            // 上方居中
  | 'top-right'      // 右上角
  | 'bottom-left'    // 左下角
  | 'bottom'         // 底部居中(默认)
  | 'bottom-right'   // 右下角
  | 'right'          // 右侧居中
```

### EasingType 类型

```typescript
type EasingType =
  | 'default'         // 默认动画
  | 'linear'          // 线性动画
  | 'easeInCubic'     // 缓入动画
  | 'easeOutCubic'    // 缓出动画
  | 'easeInOutCubic'  // 缓入缓出动画
```

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `click` | 点击滑块时触发 | `{ index: number; item: string \| SwiperList }` |
| `change` | 轮播滑块切换时触发 | `{ current: number; source: string }` |
| `animationfinish` | 滑块动画结束时触发 | `{ current: number; source: string }` |
| `update:current` | 当前项更新时触发,用于 v-model | `current: number` |

**事件参数说明:**
- `change` 和 `animationfinish` 的 `source` 参数表示触发来源:
  - `'autoplay'` - 自动播放触发
  - `'touch'` - 用户滑动触发
  - `'nav'` - 点击导航按钮触发

### Slots

| 插槽名 | 说明 | 插槽参数 |
|--------|------|----------|
| `indicator` | 自定义指示器内容 | `{ current: number; total: number }` |

### WdSwiperNavProps 类型

指示器配置对象:

```typescript
interface WdSwiperNavProps {
  /** 指示器类型 */
  type?: 'dots' | 'dots-bar' | 'fraction'
  /** 当前轮播在哪一项(下标) */
  current?: number
  /** 总共的项数 */
  total?: number
  /** 轮播滑动方向 */
  direction?: 'horizontal' | 'vertical'
  /** 指示器位置 */
  indicatorPosition?: IndicatorPositionType
  /** 小于这个数字不会显示导航器 */
  minShowNum?: number
  /** 是否显示两侧的控制按钮 */
  showControls?: boolean
}
```

## 主题定制

### CSS 变量

组件提供了以下 CSS 变量用于主题定制:

```scss
// Swiper 轮播
$-swiper-radius: 8rpx;                      // 轮播圆角
$-swiper-item-padding: 0;                   // 轮播项内边距
$-swiper-item-text-color: #fff;             // 文字颜色
$-swiper-item-text-fs: 28rpx;               // 文字大小

// 指示器
$-swiper-nav-dot-size: 12rpx;               // 点的大小
$-swiper-nav-dot-color: rgba(255, 255, 255, 0.5);        // 点的颜色
$-swiper-nav-dot-active-color: #fff;        // 激活点的颜色
$-swiper-nav-dots-bar-active-width: 32rpx;  // 条状激活宽度

// 分式指示器
$-swiper-nav-fraction-height: 48rpx;        // 分式高度
$-swiper-nav-fraction-bg-color: rgba(0, 0, 0, 0.5);  // 分式背景色
$-swiper-nav-fraction-color: #fff;          // 分式文字颜色
$-swiper-nav-fraction-font-size: 24rpx;     // 分式字体大小

// 控制按钮
$-swiper-nav-btn-size: 64rpx;               // 按钮大小
$-swiper-nav-btn-bg-color: rgba(255, 255, 255, 0.8);  // 按钮背景色
$-swiper-nav-btn-color: #333;               // 按钮图标颜色
```

### 暗黑模式

组件会自动适配暗黑模式,无需额外配置。

### 自定义样式

```scss
// 自定义指示器样式
:deep(.custom-indicator) {
  .wd-swiper-nav__item--dots {
    width: 16rpx;
    height: 16rpx;
    background: rgba(0, 0, 0, 0.3);

    &.is-active {
      background: #1890ff;
    }
  }
}

// 自定义图片样式
:deep(.custom-image) {
  border-radius: 16rpx;
  transform: scale(0.95);
  transition: transform 0.3s ease;

  &:active {
    transform: scale(1);
  }
}
```

## 最佳实践

### 1. 合理设置高度

根据设计稿比例设置轮播高度:

```vue
<!-- ✅ 按比例设置高度 -->
<wd-swiper
  :list="banners"
  height="750"
/>

<!-- ✅ 根据内容自适应 (支付宝小程序) -->
<wd-swiper
  :list="banners"
  adjust-height="current"
/>

<!-- ❌ 高度过小导致图片变形 -->
<wd-swiper
  :list="banners}
  height="200"
/>
```

### 2. 优化自动播放间隔

根据内容类型选择合适的间隔:

```vue
<!-- ✅ 图片轮播3-5秒 -->
<wd-swiper
  :list="images"
  :interval="4000"
/>

<!-- ✅ 重要内容可适当延长 -->
<wd-swiper
  :list="promotions}
  :interval="6000"
/>

<!-- ❌ 间隔太短用户看不清 -->
<wd-swiper
  :list="images"
  :interval="1000"
/>
```

### 3. 视频轮播注意事项

视频轮播需要特别配置:

```vue
<!-- ✅ 视频轮播最佳配置 -->
<wd-swiper
  :list="videos"
  height="100vh"
  :autoplay="false"
  :video-loop="false"
  :stop-previous-video="true"
  :muted="false"
/>

<!-- ❌ 不要在视频轮播中开启自动播放 -->
<wd-swiper
  :list="videos"
  :autoplay="true"
/>
```

### 4. 正确使用指示器

根据场景选择合适的指示器:

```vue
<!-- ✅ 少量图片用点状 -->
<wd-swiper
  :list="images3"
  :indicator="{ type: 'dots' }"
/>

<!-- ✅ 较多图片用分式 -->
<wd-swiper
  :list="images10"
  :indicator="{ type: 'fraction', indicatorPosition: 'bottom-right' }"
/>

<!-- ✅ 视频轮播隐藏指示器 -->
<wd-swiper
  :list="videos"
  :indicator="false"
/>
```

## 常见问题

### 1. 图片高度不一致导致闪烁

**问题描述:**
不同尺寸的图片在切换时出现高度跳变。

**问题原因:**
- 没有设置固定高度
- 图片宽高比不一致
- 未使用合适的 `image-mode`

**解决方案:**
```vue
<!-- ✅ 设置固定高度 + aspectFill 模式 -->
<wd-swiper
  :list="images"
  height="750"
  image-mode="aspectFill"
/>

<!-- ✅ 支付宝小程序使用高度调整 -->
<wd-swiper
  :list="images"
  adjust-height="highest"
/>
```

### 2. 视频无法自动播放

**问题描述:**
设置了 `autoplay-video` 但视频不自动播放。

**问题原因:**
- 部分平台限制视频自动播放
- 视频资源加载失败
- 没有设置静音

**解决方案:**
```vue
<!-- ✅ 设置静音允许自动播放 -->
<wd-swiper
  :list="videos"
  :autoplay-video="true"
  :muted="true"
/>

<!-- ✅ 监听加载事件 -->
<wd-swiper
  :list="videos"
  @change="handleVideoChange"
/>

<script setup>
const handleVideoChange = ({ current }) => {
  // 手动触发视频播放
  const video = uni.createVideoContext(`video-${current}`)
  video.play()
}
</script>
```

### 3. 循环模式下出现空白

**问题描述:**
开启循环后,切换到首尾时出现空白。

**问题原因:**
- 轮播项数量太少
- `display-multiple-items` 设置不当
- 动画时长过长

**解决方案:**
```vue
<!-- ✅ 确保至少3项 -->
<wd-swiper
  :list="images"
  :loop="true"
/>

<!-- ✅ 减少动画时长 -->
<wd-swiper
  :list="images"
  :loop="true"
  :duration="200"
/>

<!-- ✅ 项目太少时关闭循环 -->
<wd-swiper
  :list="images"
  :loop="images.length > 1"
/>
```

### 4. 指示器位置不正确

**问题描述:**
指示器显示位置与预期不符。

**问题原因:**
- 容器样式影响定位
- 自定义样式覆盖了默认样式
- 指示器位置设置错误

**解决方案:**
```vue
<!-- ✅ 使用预定义位置 -->
<wd-swiper
  :list="images"
  indicator-position="bottom-right"
/>

<!-- ✅ 自定义指示器样式 -->
<wd-swiper
  :list="images"
  custom-indicator-class="custom-indicator"
/>

<style>
:deep(.custom-indicator) {
  bottom: 32rpx !important;
  right: 32rpx !important;
}
</style>
```

### 5. 前后边距显示异常

**问题描述:**
设置了 `previous-margin` 和 `next-margin` 但效果不正确。

**问题原因:**
- 容器宽度限制
- 未设置 `display-multiple-items`
- 边距值过大

**解决方案:**
```vue
<!-- ✅ 合理设置边距和显示项数 -->
<wd-swiper
  :list="images"
  :previous-margin="60"
  :next-margin="60"
  :display-multiple-items="1"
/>

<!-- ✅ 启用边距到边缘 -->
<wd-swiper
  :list="images"
  :previous-margin="32"
  :next-margin="32"
  :snap-to-edge="true"
/>
```
