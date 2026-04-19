---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/display/swiper
---

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
      :list="imageList"
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
    current: productImages.value[currentImage.value]
  })
}
</script>

```

**实现要点:**
- 关闭自动播放,手动控制
- 下方显示缩略图,点击切换
- 点击大图预览
- 当前图片缩略图高亮显示

### 案例3: 图片画廊

支持缩略图联动的图片画廊:

```vue
<template>
  <view class="gallery-page">
    <!-- 主图轮播 -->
    <wd-swiper
      v-model:current="currentIndex"
      :list="galleryImages"
      height="600"
      :autoplay="false"
      :indicator="false"
      image-mode="aspectFit"
      @click="handlePreview"
    />

    <!-- 缩略图列表 -->
    <scroll-view
      scroll-x
      :scroll-into-view="`thumb-${currentIndex}`"
      class="thumbnail-scroll"
    >
      <view class="thumbnail-container">
        <view
          v-for="(img, index) in galleryImages"
          :id="`thumb-${index}`"
          :key="index"
          :class="['thumb-item', { active: currentIndex === index }]"
          @click="currentIndex = index"
        >
          <image :src="img" class="thumb-image" mode="aspectFill" />
        </view>
      </view>
    </scroll-view>

    <!-- 图片计数 -->
    <view class="gallery-counter">
      <text class="counter-text">{{ currentIndex + 1 }} / {{ galleryImages.length }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const galleryImages = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg',
  'https://unpkg.com/wot-design-uni-assets/bear.jpg',
  'https://unpkg.com/wot-design-uni-assets/tiger.jpg'
])

const currentIndex = ref(0)

// 预览大图
const handlePreview = () => {
  uni.previewImage({
    urls: galleryImages.value,
    current: galleryImages.value[currentIndex.value]
  })
}
</script>

```

**实现要点:**
- 主图和缩略图通过 `v-model:current` 双向绑定
- 缩略图使用 `scroll-into-view` 自动滚动到当前项
- 关闭自动播放,用户手动控制
- 点击主图预览大图

### 案例4: 短视频播放

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
| `custom-prev-image-class` | 自定义上一个图片类名 | `string` | `''` |
| `custom-next-image-class` | 自定义下一个图片类名 | `string` | `''` |
| `custom-item-class` | 自定义swiper子项类名 | `string` | `''` |
| `custom-prev-class` | 自定义上一个子项类名 | `string` | `''` |
| `custom-next-class` | 自定义下一个子项类名 | `string` | `''` |
| `custom-text-class` | 自定义文字标题类名 | `string` | `''` |
| `custom-text-style` | 自定义文字标题样式 | `string` | `''` |

### SwiperList 类型

```typescript
/**
 * 资源类型
 */
type SwiperItemType = 'image' | 'video'

/**
 * 轮播项接口
 */
interface SwiperList {
  /** 允许任意额外属性 */
  [key: string]: any

  /** 图片、视频等资源地址 */
  value?: string
  /** 视频资源的封面图片 */
  poster?: string
  /** 资源文件类型,可选值:'image' | 'video' */
  type?: SwiperItemType
  /** 标题文字,显示在轮播项右上角 */
  text?: string
}
```

**类型说明:**
- 当 `list` 为字符串数组时,组件会自动根据 URL 后缀判断类型
- 当 `list` 为对象数组时,可以通过 `type` 字段明确指定资源类型
- `poster` 仅对视频类型有效,用于设置视频封面
- `text` 会显示在轮播项的右上角位置

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
| `default` | 自定义每个轮播项的内容（覆盖内置的 `image` / `video` / `text` 渲染） | `{ item: any; index: number }` |
| `indicator` | 自定义指示器内容 | `{ current: number; total: number }` |

**默认插槽示例：**

```vue
<wd-swiper :list="list">
  <template #default="{ item, index }">
    <view class="custom-item" @click="handleClick(index, item)">
      <image :src="item.cover" mode="aspectFill" />
      <view class="overlay">{{ item.title }}</view>
    </view>
  </template>
</wd-swiper>
```

### WdSwiperNavProps 类型

指示器配置对象:

```typescript
/**
 * 指示器类型
 * dots - 点状指示器
 * dots-bar - 条状指示器(激活项拉伸为条形)
 * fraction - 分式指示器(显示 1/3 格式)
 */
type SwiperIndicatorType = 'dots' | 'dots-bar' | 'fraction'

/**
 * 轮播导航组件属性接口
 */
interface WdSwiperNavProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 指示器类型 */
  type?: SwiperIndicatorType
  /** 当前轮播在哪一项(下标) */
  current?: number
  /** 总共的项数 */
  total?: number
  /** 轮播滑动方向 */
  direction?: 'horizontal' | 'vertical'
  /** 指示器位置 */
  indicatorPosition?: IndicatorPositionType
  /** 小于这个数字不会显示导航器,默认2 */
  minShowNum?: number
  /** 是否显示两侧的控制按钮 */
  showControls?: boolean
}
```

**配置示例:**

```typescript
// 点状指示器(默认)
:indicator="{ type: 'dots' }"

// 条状指示器
:indicator="{ type: 'dots-bar' }"

// 分式指示器 + 显示控制按钮
:indicator="{ type: 'fraction', showControls: true }"

// 隐藏指示器
:indicator="false"

// 设置最小显示数量
:indicator="{ minShowNum: 3 }"
```

### DirectionType 类型

```typescript
/**
 * 轮播滑动方向
 * horizontal - 水平方向(默认)
 * vertical - 垂直方向
 */
type DirectionType = 'horizontal' | 'vertical'
```

### AdjustHeightType 类型

```typescript
/**
 * 高度调整类型(仅支付宝小程序支持)
 * first - 第一个滑块的高度
 * current - 实时的当前滑块高度
 * highest - 高度最大的滑块(默认)
 * none - 不根据滑块调整高度
 */
type AdjustHeightType = 'first' | 'current' | 'highest' | 'none'
```

### ImageMode 类型

```typescript
/**
 * 图片裁剪、缩放模式
 */
type ImageMode =
  | 'scaleToFill'    // 不保持纵横比缩放,使图片完全适应
  | 'aspectFit'      // 保持纵横比缩放,使图片长边能完全显示
  | 'aspectFill'     // 保持纵横比缩放,使图片短边能完全显示(默认)
  | 'widthFix'       // 宽度不变,高度自动变化
  | 'heightFix'      // 高度不变,宽度自动变化
  | 'top'            // 不缩放,只显示顶部区域
  | 'bottom'         // 不缩放,只显示底部区域
  | 'center'         // 不缩放,只显示中间区域
  | 'left'           // 不缩放,只显示左边区域
  | 'right'          // 不缩放,只显示右边区域
  | 'top left'       // 不缩放,只显示左上区域
  | 'top right'      // 不缩放,只显示右上区域
  | 'bottom left'    // 不缩放,只显示左下区域
  | 'bottom right'   // 不缩放,只显示右下区域
```

## 主题定制

### CSS 变量

组件提供了以下 CSS 变量用于主题定制:

```scss
// Swiper 轮播容器
--wot-swiper-radius: 16rpx;                    // 轮播圆角
--wot-swiper-item-padding: 0;                  // 轮播项内边距
--wot-swiper-item-text-color: #ffffff;         // 文字颜色
--wot-swiper-item-text-fs: 28rpx;              // 文字大小

// 指示器点
--wot-swiper-nav-dot-size: 12rpx;              // 点的大小
--wot-swiper-nav-dot-color: rgba(255, 255, 255, 0.5);  // 点的颜色
--wot-swiper-nav-dot-active-color: #ffffff;    // 激活点的颜色
--wot-swiper-nav-dots-bar-active-width: 40rpx; // 条状激活宽度

// 分式指示器
--wot-swiper-nav-fraction-height: 48rpx;       // 分式高度
--wot-swiper-nav-fraction-bg-color: rgba(0, 0, 0, 0.3);  // 分式背景色
--wot-swiper-nav-fraction-color: #ffffff;      // 分式文字颜色
--wot-swiper-nav-fraction-font-size: 24rpx;    // 分式字体大小

// 控制按钮
--wot-swiper-nav-btn-size: 48rpx;              // 按钮大小
--wot-swiper-nav-btn-bg-color: rgba(0, 0, 0, 0.3);  // 按钮背景色
--wot-swiper-nav-btn-color: #ffffff;           // 按钮图标颜色
```

### 暗黑模式

组件会自动适配暗黑模式,无需额外配置。在暗黑模式下,组件会自动调整颜色以保持良好的视觉效果。

### 自定义样式示例

#### 自定义指示器颜色

```vue
<template>
  <view class="custom-swiper">
    <wd-swiper
      :list="imageList"
      height="350"
      custom-indicator-class="my-indicator"
    />
  </view>
</template>

```

#### 自定义图片圆角

```vue
<template>
  <view class="custom-swiper">
    <wd-swiper
      :list="imageList"
      height="350"
      custom-image-class="rounded-image"
    />
  </view>
</template>

```

#### 卡片缩放效果

```vue
<template>
  <view class="card-swiper">
    <wd-swiper
      :list="imageList"
      height="400"
      previous-margin="60"
      next-margin="60"
      custom-item-class="swiper-item"
      custom-prev-class="prev-item"
      custom-next-class="next-item"
    />
  </view>
</template>

```

#### 自定义分式指示器

```vue
<template>
  <view class="fraction-swiper">
    <wd-swiper
      :list="imageList"
      height="350"
      :indicator="{ type: 'fraction' }"
      indicator-position="bottom-right"
      custom-indicator-class="custom-fraction"
    />
  </view>
</template>

```

#### 全局主题配置

```scss
// 在全局样式文件中配置
page {
  // 主色调指示器
  --wot-swiper-nav-dot-active-color: #1890ff;
  --wot-swiper-nav-dot-color: rgba(24, 144, 255, 0.3);

  // 更大的圆角
  --wot-swiper-radius: 24rpx;

  // 更大的指示器
  --wot-swiper-nav-dot-size: 16rpx;
  --wot-swiper-nav-dots-bar-active-width: 48rpx;
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
  :list="banners"
  height="200"
/>
```

**高度设置建议:**
- 首页 Banner: 通常为 `375rpx` - `750rpx`
- 商品图片: 建议使用 `750rpx`(1:1 比例)
- 全屏视频: 使用 `100vh`

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
  :list="promotions"
  :interval="6000"
/>

<!-- ❌ 间隔太短用户看不清 -->
<wd-swiper
  :list="images"
  :interval="1000"
/>
```

**间隔时间建议:**
- 广告 Banner: 3000-5000ms
- 产品展示: 4000-6000ms
- 文字较多: 6000-8000ms

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

**视频轮播建议:**
- 关闭自动轮播,让用户控制观看节奏
- 开启 `stop-previous-video` 避免多个视频同时播放
- 首次加载时可使用 `muted` 静音以允许自动播放
- 提供封面图 `poster` 优化首屏加载体验

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

**指示器选择建议:**
- 3-5 项: 点状指示器 `dots`
- 5-10 项: 条状指示器 `dots-bar`
- 10+ 项: 分式指示器 `fraction`
- 全屏视频: 隐藏指示器或使用自定义

### 5. 图片加载优化

优化图片加载体验:

```vue
<template>
  <wd-swiper
    :list="optimizedList"
    height="350"
    image-mode="aspectFill"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// ✅ 使用合适尺寸的图片
const optimizedList = ref([
  'https://cdn.example.com/banner1@750w.jpg',  // 2x 屏幕宽度
  'https://cdn.example.com/banner2@750w.jpg',
  'https://cdn.example.com/banner3@750w.jpg'
])

// ✅ 使用 CDN 并开启图片压缩
// 图片宽度建议: 750px - 1500px (适配不同设备)
</script>
```

**图片优化建议:**
- 使用适当分辨率的图片(750px - 1500px 宽)
- 优先使用 WebP 格式
- 使用 CDN 加速
- 开启懒加载(首屏外的图片)

### 6. 无障碍支持

提升轮播组件的无障碍体验:

```vue
<template>
  <view
    role="region"
    aria-label="轮播图"
    aria-roledescription="carousel"
  >
    <wd-swiper
      :list="accessibleList"
      height="350"
      :autoplay="false"
      :indicator="{ showControls: true }"
      @change="handleChange"
    />
    <!-- 屏幕阅读器提示 -->
    <view class="sr-only" aria-live="polite">
      第 {{ currentIndex + 1 }} 张，共 {{ accessibleList.length }} 张
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface AccessibleItem {
  value: string
  text: string
  alt: string
}

const accessibleList = ref<AccessibleItem[]>([
  { value: '/banner1.jpg', text: '新品上市', alt: '新品上市宣传图' },
  { value: '/banner2.jpg', text: '限时优惠', alt: '限时优惠活动图' }
])

const currentIndex = ref(0)

const handleChange = ({ current }: { current: number }) => {
  currentIndex.value = current
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
```

**无障碍建议:**
- 关闭自动播放或提供暂停按钮
- 提供控制按钮方便键盘操作
- 使用 `aria-live` 播报当前状态
- 为图片提供描述文字

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

### 6. 微信小程序中轮播抖动

**问题描述:**
在微信小程序中,轮播切换时出现轻微抖动或闪烁。

**问题原因:**
- 微信小程序 swiper 组件的已知问题
- 图片尺寸不一致
- CSS 样式冲突

**解决方案:**
```vue
<!-- ✅ 组件已内置 scroll-view 包裹解决抖动问题 -->
<wd-swiper
  :list="images"
  height="350"
  image-mode="aspectFill"
/>

<!-- ✅ 确保图片尺寸一致 -->
<script setup>
// 使用统一尺寸的图片
const images = ref([
  'https://cdn.example.com/banner1-750x350.jpg',
  'https://cdn.example.com/banner2-750x350.jpg',
  'https://cdn.example.com/banner3-750x350.jpg'
])
</script>
```

### 7. 动态更新 list 不生效

**问题描述:**
动态修改 `list` 数据后,轮播内容没有更新。

**问题原因:**
- 响应式数据更新问题
- 直接修改数组元素而非替换整个数组

**解决方案:**
```vue
<template>
  <wd-swiper :list="imageList" :key="listKey" height="350" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref<string[]>([])
const listKey = ref(0)

// ✅ 正确方式: 替换整个数组
const updateList = (newImages: string[]) => {
  imageList.value = [...newImages]
}

// ✅ 如果需要强制刷新,可以更新 key
const forceRefresh = (newImages: string[]) => {
  imageList.value = newImages
  listKey.value++
}

// ❌ 错误方式: 直接修改数组
const wrongUpdate = () => {
  imageList.value[0] = 'new-image.jpg'  // 可能不会触发更新
}
</script>
```

### 8. 切换到后台后自动播放停止

**问题描述:**
小程序切换到后台后,轮播自动播放停止,返回前台后不会恢复。

**问题原因:**
- 小程序生命周期导致定时器暂停
- 页面隐藏时 swiper 组件停止工作

**解决方案:**
```vue
<template>
  <wd-swiper
    v-model:current="currentIndex"
    :list="images"
    :autoplay="isAutoplay"
    height="350"
  />
</template>

<script lang="ts" setup>
import { ref, onShow, onHide } from 'vue'

const images = ref([/* ... */])
const currentIndex = ref(0)
const isAutoplay = ref(true)

// 页面显示时恢复自动播放
onShow(() => {
  isAutoplay.value = true
})

// 页面隐藏时暂停自动播放
onHide(() => {
  isAutoplay.value = false
})
</script>
```

### 9. 自定义指示器样式不生效

**问题描述:**
通过 `custom-indicator-class` 设置的样式不生效。

**问题原因:**
- scoped 样式隔离
- 选择器优先级不够
- 类名未正确传递

**解决方案:**
```vue
<template>
  <view class="swiper-wrapper">
    <wd-swiper
      :list="images"
      height="350"
      custom-indicator-class="my-indicator"
    />
  </view>
</template>


<!-- 或者使用全局样式 -->
<style lang="scss">
// ✅ 全局样式不受 scoped 限制
.my-indicator {
  .wd-swiper-nav__item--dots {
    width: 20rpx;
    height: 20rpx;
  }
}
</style>
```

### 10. 轮播项点击事件不触发

**问题描述:**
给轮播项绑定的点击事件不触发或触发不稳定。

**问题原因:**
- 滑动和点击事件冲突
- 事件冒泡问题
- 视频组件层级问题

**解决方案:**
```vue
<template>
  <wd-swiper
    :list="images"
    height="350"
    @click="handleClick"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images = ref([/* ... */])

// ✅ 使用组件提供的 click 事件
const handleClick = ({ index, item }: { index: number; item: any }) => {
  console.log('点击了第', index + 1, '项')

  // 跳转或其他操作
  if (item.link) {
    uni.navigateTo({ url: item.link })
  }
}
</script>
```

### 11. 支付宝小程序高度自适应问题

**问题描述:**
在支付宝小程序中,轮播高度无法自适应内容。

**问题原因:**
- 支付宝小程序 swiper 组件的特殊行为
- 需要使用专属属性配置

**解决方案:**
```vue
<!-- ✅ 使用支付宝小程序专属属性 -->
<wd-swiper
  :list="images"
  adjust-height="current"
  :adjust-vertical-height="true"
/>

<!-- 或者根据最高项设置高度 -->
<wd-swiper
  :list="images"
  adjust-height="highest"
/>
```

**属性说明:**
- `adjust-height="first"`: 使用第一个滑块高度
- `adjust-height="current"`: 使用当前滑块高度(实时)
- `adjust-height="highest"`: 使用最高滑块高度
- `adjust-height="none"`: 不自动调整高度
