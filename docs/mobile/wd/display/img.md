# Img 图片

## 介绍

Img 是一个增强版的图片组件,在 UniApp 原生 image 组件的基础上提供了更丰富的功能和更好的用户体验。它不仅支持单张图片展示,还能智能处理多张图片的显示、预览和交互,是构建现代移动应用图片展示功能的理想选择。

**核心特性:**

- **多图片支持** - 支持单张和多张图片展示,自动识别逗号分隔的图片URL
- **智能显示模式** - 提供单图模式和多图网格布局,支持最大显示数量限制
- **图片预览** - 内置图片预览功能,支持多图片滑动浏览
- **长按操作** - 提供保存图片、预览图片、复制链接等快捷操作
- **加载状态管理** - 完整的加载状态跟踪,支持自定义加载和错误插槽
- **灵活的显示模式** - 支持 15 种图片裁剪和缩放模式
- **圆角和圆形** - 支持自定义圆角大小和完全圆形显示
- **懒加载** - 支持图片懒加载,优化页面性能
- **Base64 支持** - 智能识别 Base64 图片,自动处理为单张图片

## 基本用法

### 单张图片

最基础的用法,显示一张图片:

```vue
<template>
  <view class="demo">
    <wd-img
      src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
      width="200"
      height="200"
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `src` 属性指定图片URL
- `width` 和 `height` 设置图片尺寸,默认单位为px
- 图片会自动居中显示

### 多张图片

支持通过逗号分隔的字符串显示多张图片:

```vue
<template>
  <view class="demo">
    <wd-img
      :src="imageUrls"
      width="375"
      height="200"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageUrls = ref('https://unpkg.com/wot-design-uni-assets/redpanda.jpg,https://unpkg.com/wot-design-uni-assets/elephant.jpg,https://unpkg.com/wot-design-uni-assets/panda.jpg')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**技术实现:**
- 组件会自动将逗号分隔的字符串解析为图片数组
- 多张图片以网格布局显示
- 自动计算每张图片的尺寸以填充容器

### 单图模式

当有多张图片时,只显示第一张,并在右上角显示图片总数:

```vue
<template>
  <view class="demo">
    <wd-img
      :src="multiImages"
      width="200"
      height="200"
      single-mode
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const multiImages = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg',
  'https://unpkg.com/wot-design-uni-assets/bear.jpg'
].join(','))
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `single-mode` 属性启用单图模式
- 只显示第一张图片,其他图片被隐藏
- 右上角显示数字角标,表示总图片数量
- 适用于朋友圈、动态等场景

### 图片填充模式

支持 15 种图片裁剪和缩放模式:

```vue
<template>
  <view class="demo">
    <!-- 缩放模式 -->
    <view class="mode-group">
      <text class="label">缩放模式</text>
      <wd-img
        src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
        width="150"
        height="150"
        mode="scaleToFill"
      />
      <text class="mode-name">scaleToFill</text>
    </view>

    <view class="mode-group">
      <wd-img
        src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
        width="150"
        height="150"
        mode="aspectFit"
      />
      <text class="mode-name">aspectFit</text>
    </view>

    <view class="mode-group">
      <wd-img
        src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
        width="150"
        height="150"
        mode="aspectFill"
      />
      <text class="mode-name">aspectFill</text>
    </view>

    <!-- 裁剪模式 -->
    <view class="mode-group">
      <text class="label">裁剪模式</text>
      <wd-img
        src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
        width="150"
        height="150"
        mode="top"
      />
      <text class="mode-name">top</text>
    </view>

    <view class="mode-group">
      <wd-img
        src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
        width="150"
        height="150"
        mode="center"
      />
      <text class="mode-name">center</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.mode-group {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.mode-name {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
</style>
```

**模式说明:**

**缩放模式:**
- `scaleToFill` - 不保持纵横比缩放图片,使图片完全适应容器
- `aspectFit` - 保持纵横比缩放图片,使图片的长边能完全显示
- `aspectFill` - 保持纵横比缩放图片,使图片的短边能完全显示,裁剪长边
- `widthFix` - 宽度不变,高度自动变化,保持原图宽高比
- `heightFix` - 高度不变,宽度自动变化,保持原图宽高比

**裁剪模式:**
- `top` - 不缩放图片,只显示图片的顶部区域
- `bottom` - 不缩放图片,只显示图片的底部区域
- `center` - 不缩放图片,只显示图片的中间区域
- `left` - 不缩放图片,只显示图片的左边区域
- `right` - 不缩放图片,只显示图片的右边区域
- `top left` - 不缩放图片,只显示图片的左上区域
- `top right` - 不缩放图片,只显示图片的右上区域
- `bottom left` - 不缩放图片,只显示图片的左下区域
- `bottom right` - 不缩放图片,只显示图片的右下区域

### 圆角和圆形

支持自定义圆角或显示为圆形:

```vue
<template>
  <view class="demo">
    <!-- 圆角 -->
    <wd-img
      src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
      width="150"
      height="150"
      radius="16"
    />

    <!-- 圆形 -->
    <wd-img
      src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
      width="150"
      height="150"
      round
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
  display: flex;
  gap: 32rpx;
}
</style>
```

**使用说明:**
- `radius` 属性设置圆角大小,默认单位为px
- `round` 属性设置为圆形,会覆盖 radius 设置
- 圆形模式使用 `border-radius: 50%`

### 图片预览

启用图片预览功能,点击图片可以全屏预览:

```vue
<template>
  <view class="demo">
    <!-- 单张图片预览 -->
    <wd-img
      src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
      width="200"
      height="200"
      enable-preview
    />

    <!-- 多张图片预览 -->
    <wd-img
      :src="imageList"
      width="375"
      height="200"
      enable-preview
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const imageList = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg'
].join(','))
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**技术实现:**
- 使用 `uni.previewImage()` API 实现预览
- 单张图片预览时直接打开
- 多张图片支持左右滑动切换
- 支持双指缩放和保存图片

### 自定义预览图片

可以指定不同的预览图片,实现缩略图和大图分离:

```vue
<template>
  <view class="demo">
    <wd-img
      src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg?imageView2/1/w/200/h/200"
      preview-src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
      width="200"
      height="200"
      enable-preview
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `src` 显示缩略图,节省流量
- `preview-src` 预览时加载高清大图
- 如果不设置 `preview-src`,则预览时使用 `src`
- 适用于需要优化加载性能的场景

### 长按操作

启用长按图片显示操作菜单:

```vue
<template>
  <view class="demo">
    <wd-img
      src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
      width="200"
      height="200"
      enable-longpress
      @longpress="handleLongpress"
    />
  </view>
</template>

<script lang="ts" setup>
// 长按事件处理
const handleLongpress = (event: Event, imageList: string[], currentIndex: number) => {
  console.log('长按图片', { imageList, currentIndex })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**默认长按菜单包含:**
- **保存图片** - 保存到相册
- **预览图片** - 全屏预览
- **复制链接** - 复制图片URL到剪贴板

**技术实现:**
- 使用 `uni.showActionSheet()` 显示操作菜单
- 使用 `uni.saveImageToPhotosAlbum()` 保存图片
- 使用 `uni.previewImage()` 预览图片
- 使用 `uni.setClipboardData()` 复制链接

### 自定义长按操作

可以自定义长按时的操作:

```vue
<template>
  <view class="demo">
    <wd-img
      src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
      width="200"
      height="200"
      enable-longpress
      :on-longpress="customLongpress"
    />
  </view>
</template>

<script lang="ts" setup>
// 自定义长按处理函数
const customLongpress = (event: Event, imageList: string[], currentIndex: number) => {
  uni.showActionSheet({
    itemList: ['设为头像', '发送给朋友', '识别二维码'],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          uni.showToast({ title: '设为头像', icon: 'success' })
          break
        case 1:
          uni.showToast({ title: '发送给朋友', icon: 'success' })
          break
        case 2:
          uni.showToast({ title: '识别二维码', icon: 'success' })
          break
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `on-longpress` 属性传入自定义处理函数
- 函数接收三个参数: 事件对象、图片列表、当前索引
- 可以完全自定义操作菜单内容

### 最大显示数量

限制多图片模式下最多显示的图片数量:

```vue
<template>
  <view class="demo">
    <wd-img
      :src="manyImages"
      width="375"
      height="300"
      :max-display="6"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const manyImages = ref([
  'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
  'https://unpkg.com/wot-design-uni-assets/elephant.jpg',
  'https://unpkg.com/wot-design-uni-assets/panda.jpg',
  'https://unpkg.com/wot-design-uni-assets/bear.jpg',
  'https://unpkg.com/wot-design-uni-assets/cat.jpg',
  'https://unpkg.com/wot-design-uni-assets/dog.jpg',
  'https://unpkg.com/wot-design-uni-assets/lion.jpg',
  'https://unpkg.com/wot-design-uni-assets/tiger.jpg'
].join(','))
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**技术实现:**
- `max-display` 设置最大显示数量,默认为 9
- 超出部分不显示,最后一张图片右上角显示 `+N`
- `+N` 表示还有多少张图片未显示
- 适用于朋友圈、商品详情等场景

### 懒加载

启用图片懒加载,优化页面性能:

```vue
<template>
  <view class="demo">
    <scroll-view scroll-y style="height: 100vh;">
      <view v-for="index in 20" :key="index" class="image-item">
        <wd-img
          :src="`https://unpkg.com/wot-design-uni-assets/image-${index}.jpg`"
          width="375"
          height="200"
          lazy-load
        />
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.image-item {
  margin-bottom: 32rpx;
}
</style>
```

**使用说明:**
- `lazy-load` 启用懒加载
- 图片进入视口时才开始加载
- 减少首屏加载时间
- 节省流量和内存

### 加载状态插槽

自定义加载中和加载失败的显示内容:

```vue
<template>
  <view class="demo">
    <wd-img
      src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
      width="200"
      height="200"
    >
      <template #loading>
        <view class="custom-loading">
          <wd-loading />
          <text class="loading-text">加载中...</text>
        </view>
      </template>

      <template #error>
        <view class="custom-error">
          <wd-icon name="image-error" size="48" />
          <text class="error-text">加载失败</text>
        </view>
      </template>
    </wd-img>
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.custom-loading,
.custom-error {
  width: 200rpx;
  height: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.loading-text,
.error-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}
</style>
```

**使用说明:**
- `loading` 插槽自定义加载中显示
- `error` 插槽自定义加载失败显示
- 插槽内容会完全替换默认显示
- 可以使用 Loading 组件、Icon 组件等

### 监听加载事件

监听图片的加载成功和失败事件:

```vue
<template>
  <view class="demo">
    <wd-img
      src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
      width="200"
      height="200"
      @load="handleLoad"
      @error="handleError"
    />

    <text class="status">{{ statusText }}</text>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const statusText = ref('加载中...')

// 加载成功
const handleLoad = (event: any) => {
  console.log('图片加载成功', event)
  statusText.value = '加载成功'
}

// 加载失败
const handleError = (event: any) => {
  console.error('图片加载失败', event)
  statusText.value = '加载失败'
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.status {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
```

**使用说明:**
- `load` 事件在图片加载成功时触发
- `error` 事件在图片加载失败时触发
- 事件参数包含 UniApp 的原始事件对象
- 多图片模式下事件参数包含图片索引

### 自定义样式

使用自定义样式类定制组件外观:

```vue
<template>
  <view class="demo">
    <wd-img
      src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
      width="200"
      height="200"
      custom-class="custom-img"
      custom-image="custom-image"
      custom-style="border: 4rpx solid #1890ff; box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.1);"
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

:deep(.custom-img) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 8rpx;
}

:deep(.custom-image) {
  border-radius: 16rpx;
}
</style>
```

**使用说明:**
- `custom-class` 自定义根节点样式类
- `custom-image` 自定义图片元素样式类
- `custom-style` 自定义内联样式
- 使用 `:deep()` 穿透样式隔离

## 实战案例

### 案例1: 商品图片展示

电商商品详情页的图片展示:

```vue
<template>
  <view class="product-detail">
    <!-- 主图轮播 -->
    <view class="main-images">
      <wd-img
        :src="product.images"
        width="750"
        height="750"
        mode="aspectFill"
        enable-preview
      />
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <text class="product-name">{{ product.name }}</text>
      <text class="product-price">¥{{ product.price }}</text>
    </view>

    <!-- 详情图片 -->
    <view class="detail-images">
      <view v-for="(img, index) in detailImages" :key="index" class="detail-image">
        <wd-img
          :src="img"
          width="750"
          height="auto"
          mode="widthFix"
          lazy-load
        />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 商品数据
const product = ref({
  name: '经典红熊猫玩偶',
  price: '199.00',
  images: [
    'https://unpkg.com/wot-design-uni-assets/redpanda.jpg',
    'https://unpkg.com/wot-design-uni-assets/redpanda-2.jpg',
    'https://unpkg.com/wot-design-uni-assets/redpanda-3.jpg'
  ].join(',')
})

// 详情图片
const detailImages = ref([
  'https://unpkg.com/wot-design-uni-assets/detail-1.jpg',
  'https://unpkg.com/wot-design-uni-assets/detail-2.jpg',
  'https://unpkg.com/wot-design-uni-assets/detail-3.jpg'
])
</script>

<style lang="scss" scoped>
.product-detail {
  background: #fff;
}

.main-images {
  background: #f5f5f5;
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

.detail-images {
  margin-top: 32rpx;
}

.detail-image {
  margin-bottom: 16rpx;
}
</style>
```

**实现要点:**
- 主图使用多图展示,支持预览
- `aspectFill` 模式确保图片充满容器
- 详情图使用 `widthFix` 模式,宽度固定高度自适应
- 详情图启用懒加载,优化性能

### 案例2: 朋友圈动态

类似微信朋友圈的图片展示:

```vue
<template>
  <view class="moments">
    <view v-for="moment in moments" :key="moment.id" class="moment-item">
      <!-- 用户信息 -->
      <view class="user-info">
        <wd-img
          :src="moment.avatar"
          width="80"
          height="80"
          round
        />
        <view class="user-details">
          <text class="user-name">{{ moment.userName }}</text>
          <text class="post-time">{{ moment.time }}</text>
        </view>
      </view>

      <!-- 动态内容 -->
      <text class="content">{{ moment.content }}</text>

      <!-- 图片展示 -->
      <view v-if="moment.images" class="images">
        <wd-img
          :src="moment.images"
          width="700"
          height="400"
          :max-display="9"
          mode="aspectFill"
          enable-preview
          enable-longpress
        />
      </view>

      <!-- 互动按钮 -->
      <view class="actions">
        <text class="action-btn">👍 点赞</text>
        <text class="action-btn">💬 评论</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Moment {
  id: number
  userName: string
  avatar: string
  time: string
  content: string
  images?: string
}

const moments = ref<Moment[]>([
  {
    id: 1,
    userName: '张三',
    avatar: 'https://unpkg.com/wot-design-uni-assets/avatar-1.jpg',
    time: '2小时前',
    content: '今天天气真好,出去拍了几张照片~',
    images: [
      'https://unpkg.com/wot-design-uni-assets/photo-1.jpg',
      'https://unpkg.com/wot-design-uni-assets/photo-2.jpg',
      'https://unpkg.com/wot-design-uni-assets/photo-3.jpg',
      'https://unpkg.com/wot-design-uni-assets/photo-4.jpg'
    ].join(',')
  },
  {
    id: 2,
    userName: '李四',
    avatar: 'https://unpkg.com/wot-design-uni-assets/avatar-2.jpg',
    time: '5小时前',
    content: '美食分享~',
    images: 'https://unpkg.com/wot-design-uni-assets/food.jpg'
  }
])
</script>

<style lang="scss" scoped>
.moments {
  background: #f5f5f5;
  min-height: 100vh;
}

.moment-item {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.user-details {
  margin-left: 24rpx;
  flex: 1;
}

.user-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.content {
  display: block;
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 24rpx;
}

.images {
  margin-bottom: 24rpx;
}

.actions {
  display: flex;
  gap: 32rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  font-size: 26rpx;
  color: #666;
}
</style>
```

**实现要点:**
- 头像使用圆形显示
- 动态图片最多显示9张,超出显示 `+N`
- 支持点击预览和长按操作
- `aspectFill` 模式确保图片按比例填充

### 案例3: 相册网格

图片相册网格布局:

```vue
<template>
  <view class="photo-album">
    <view class="album-header">
      <text class="album-title">我的相册</text>
      <text class="photo-count">共 {{ photos.length }} 张</text>
    </view>

    <view class="photo-grid">
      <view v-for="(photo, index) in photos" :key="index" class="photo-item">
        <wd-img
          :src="photo.url"
          width="230"
          height="230"
          mode="aspectFill"
          radius="8"
          enable-preview
          :preview-src="allPhotos"
          lazy-load
          @click="handlePhotoClick(index)"
        />

        <!-- 选择遮罩 -->
        <view v-if="selectMode" class="select-overlay" @click.stop="toggleSelect(index)">
          <view :class="['checkbox', { checked: photo.selected }]">
            <wd-icon v-if="photo.selected" name="check" size="32" color="#fff" />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view v-if="selectMode" class="bottom-bar">
      <text class="selected-count">已选择 {{ selectedCount }} 张</text>
      <view class="actions">
        <wd-button size="small" @click="deleteSelected">删除</wd-button>
        <wd-button type="primary" size="small" @click="confirmSelect">确定</wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Photo {
  url: string
  selected: boolean
}

// 相册照片
const photos = ref<Photo[]>([
  { url: 'https://unpkg.com/wot-design-uni-assets/photo-1.jpg', selected: false },
  { url: 'https://unpkg.com/wot-design-uni-assets/photo-2.jpg', selected: false },
  { url: 'https://unpkg.com/wot-design-uni-assets/photo-3.jpg', selected: false },
  { url: 'https://unpkg.com/wot-design-uni-assets/photo-4.jpg', selected: false },
  { url: 'https://unpkg.com/wot-design-uni-assets/photo-5.jpg', selected: false },
  { url: 'https://unpkg.com/wot-design-uni-assets/photo-6.jpg', selected: false }
])

// 选择模式
const selectMode = ref(false)

// 所有图片URL(用于预览)
const allPhotos = computed(() => photos.value.map(p => p.url).join(','))

// 已选择数量
const selectedCount = computed(() => photos.value.filter(p => p.selected).length)

// 点击照片
const handlePhotoClick = (index: number) => {
  if (!selectMode.value) {
    // 非选择模式下,预览图片
    // enable-preview 会自动处理预览
  } else {
    // 选择模式下,切换选择状态
    toggleSelect(index)
  }
}

// 切换选择状态
const toggleSelect = (index: number) => {
  photos.value[index].selected = !photos.value[index].selected
}

// 删除选中照片
const deleteSelected = () => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除 ${selectedCount.value} 张照片吗?`,
    success: (res) => {
      if (res.confirm) {
        photos.value = photos.value.filter(p => !p.selected)
        selectMode.value = false
      }
    }
  })
}

// 确认选择
const confirmSelect = () => {
  const selected = photos.value.filter(p => p.selected)
  console.log('选中的照片:', selected)
  uni.showToast({
    title: `已选择 ${selected.length} 张`,
    icon: 'success'
  })
  selectMode.value = false
}
</script>

<style lang="scss" scoped>
.photo-album {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 120rpx;
}

.album-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.album-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.photo-count {
  font-size: 24rpx;
  color: #999;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8rpx;
  padding: 8rpx;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
}

.select-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox {
  width: 48rpx;
  height: 48rpx;
  border: 2rpx solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);

  &.checked {
    background: #1890ff;
    border-color: #1890ff;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
}

.selected-count {
  font-size: 28rpx;
  color: #666;
}

.actions {
  display: flex;
  gap: 16rpx;
}
</style>
```

**实现要点:**
- 使用 Grid 布局实现3列网格
- 图片使用 `aspectFill` 模式填充正方形容器
- 支持选择模式和预览模式切换
- 预览时从当前点击的图片开始
- 使用懒加载优化大量图片的性能

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `src` | 图片链接,支持单张图片字符串或多张图片逗号分隔的字符串 | `string` | - |
| `preview-src` | 预览图片链接,如果不设置则使用 src | `string` | - |
| `width` | 宽度,默认单位为px | `string \| number` | `200` |
| `height` | 高度,默认单位为px | `string \| number` | `200` |
| `mode` | 图片填充模式 | `ImageMode` | `'scaleToFill'` |
| `round` | 是否显示为圆形 | `boolean` | `false` |
| `radius` | 圆角大小,默认单位为px | `string \| number` | - |
| `lazy-load` | 是否懒加载 | `boolean` | `false` |
| `enable-preview` | 是否允许预览 | `boolean` | `false` |
| `show-menu-by-longpress` | 开启长按图片显示识别小程序码菜单,仅在微信小程序平台有效 | `boolean` | `false` |
| `max-display` | 多图片时最大显示数量,超出部分显示 +N | `number` | `9` |
| `single-mode` | 多张图片时是否启用单图模式(只显示第一张) | `boolean` | `false` |
| `enable-longpress` | 是否启用长按图片选项功能 | `boolean` | `false` |
| `on-longpress` | 自定义长按处理函数 | `(event: Event, imageList: string[], currentIndex: number) => void` | - |
| `custom-style` | 自定义根节点样式 | `string` | `''` |
| `custom-class` | 自定义根节点样式类 | `string` | `''` |
| `custom-image` | 自定义图片样式类 | `string` | `''` |

### ImageMode 类型

```typescript
type ImageMode =
  // 缩放模式
  | 'scaleToFill'    // 不保持纵横比缩放图片,使图片完全适应
  | 'aspectFit'      // 保持纵横比缩放图片,使图片的长边能完全显示
  | 'aspectFill'     // 保持纵横比缩放图片,只保证图片的短边能完全显示
  | 'widthFix'       // 宽度不变,高度自动变化,保持原图宽高比
  | 'heightFix'      // 高度不变,宽度自动变化,保持原图宽高比
  // 裁剪模式
  | 'top'            // 不缩放图片,只显示图片的顶部区域
  | 'bottom'         // 不缩放图片,只显示图片的底部区域
  | 'center'         // 不缩放图片,只显示图片的中间区域
  | 'left'           // 不缩放图片,只显示图片的左边区域
  | 'right'          // 不缩放图片,只显示图片的右边区域
  | 'top left'       // 不缩放图片,只显示图片的左上区域
  | 'top right'      // 不缩放图片,只显示图片的右上区域
  | 'bottom left'    // 不缩放图片,只显示图片的左下区域
  | 'bottom right'   // 不缩放图片,只显示图片的右下区域
```

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `load` | 图片加载成功时触发 | `event: any, index?: number` |
| `error` | 图片加载失败时触发 | `event: any, index?: number` |
| `click` | 点击图片时触发 | `event: MouseEvent, index?: number` |
| `longpress` | 长按图片时触发,可用于显示图片选项菜单 | `event: Event, imageList: string[], currentIndex: number` |

**事件参数说明:**
- 单张图片模式下, `index` 参数为 `undefined` 或 `0`
- 多张图片模式下, `index` 表示当前操作的图片索引
- `longpress` 事件的 `imageList` 参数包含所有图片URL数组
- `longpress` 事件的 `currentIndex` 参数表示当前长按的图片索引

### Slots

| 插槽名 | 说明 |
|--------|------|
| `loading` | 自定义图片加载中的显示内容 |
| `error` | 自定义图片加载失败的显示内容 |

**插槽使用说明:**
- 插槽内容只在单张图片模式下生效
- 多张图片模式下暂不支持自定义插槽
- 插槽会完全替换默认的显示内容

### 类型定义

```typescript
/**
 * 图片组件属性接口
 */
interface WdImgProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 自定义图片样式类 */
  customImage?: string
  /** 图片链接,支持单张图片字符串或多张图片逗号分隔的字符串 */
  src?: string
  /** 预览图片链接,如果不设置则使用 src */
  previewSrc?: string
  /** 是否显示为圆形 */
  round?: boolean
  /** 图片填充模式 */
  mode?: ImageMode
  /** 是否懒加载 */
  lazyLoad?: boolean
  /** 宽度,默认单位为px */
  width?: string | number
  /** 高度,默认单位为px */
  height?: string | number
  /** 圆角大小,默认单位为px */
  radius?: string | number
  /** 是否允许预览 */
  enablePreview?: boolean
  /** 开启长按图片显示识别小程序码菜单,仅在微信小程序平台有效 */
  showMenuByLongpress?: boolean
  /** 多图片时最大显示数量,超出部分显示 +N */
  maxDisplay?: number
  /** 多张图片时是否启用单图模式(只显示第一张) */
  singleMode?: boolean
  /** 是否启用长按图片选项功能 */
  enableLongpress?: boolean
  /** 自定义长按处理函数 */
  onLongpress?: (event: Event, imageList: string[], currentIndex: number) => void
}

/**
 * 图片组件事件接口
 */
interface WdImgEmits {
  /** 图片加载失败时触发 */
  error: [event: any, index?: number]
  /** 点击图片时触发 */
  click: [event: MouseEvent, index?: number]
  /** 图片加载成功时触发 */
  load: [event: any, index?: number]
  /** 长按图片时触发 */
  longpress: [event: Event, imageList: string[], currentIndex: number]
}
```

## 最佳实践

### 1. 合理选择图片模式

根据场景选择合适的图片显示模式:

```vue
<!-- ✅ 头像使用 aspectFill + round -->
<wd-img
  :src="avatar"
  width="80"
  height="80"
  mode="aspectFill"
  round
/>

<!-- ✅ 商品主图使用 aspectFill -->
<wd-img
  :src="productImage"
  width="375"
  height="375"
  mode="aspectFill"
/>

<!-- ✅ 详情图使用 widthFix -->
<wd-img
  :src="detailImage"
  width="750"
  mode="widthFix"
/>

<!-- ❌ 头像不要使用 scaleToFill -->
<wd-img
  :src="avatar"
  width="80"
  height="80"
  mode="scaleToFill"
  round
/>
```

### 2. 优化图片加载性能

使用缩略图和懒加载提升性能:

```vue
<!-- ✅ 列表使用缩略图 + 懒加载 -->
<wd-img
  :src="thumbnailUrl"
  :preview-src="originalUrl"
  width="200"
  height="200"
  lazy-load
  enable-preview
/>

<!-- ✅ 长列表使用懒加载 -->
<scroll-view scroll-y>
  <view v-for="item in list" :key="item.id">
    <wd-img :src="item.image" lazy-load />
  </view>
</scroll-view>

<!-- ❌ 不要在首屏加载大量原图 -->
<view v-for="item in list" :key="item.id">
  <wd-img :src="item.largeImage" />
</view>
```

### 3. 正确处理多图片

多图片场景使用逗号分隔或数组:

```vue
<!-- ✅ 使用逗号分隔的字符串 -->
<wd-img
  :src="`${img1},${img2},${img3}`"
  enable-preview
/>

<!-- ✅ 使用数组 join -->
<wd-img
  :src="imageList.join(',')"
  enable-preview
/>

<!-- ✅ 限制显示数量 -->
<wd-img
  :src="manyImages"
  :max-display="9"
/>

<!-- ❌ 不要手动遍历渲染多张图片 -->
<view v-for="img in images" :key="img">
  <wd-img :src="img" />
</view>
```

### 4. 合理使用长按功能

启用长按功能时提供明确的视觉反馈:

```vue
<!-- ✅ 启用长按并监听事件 -->
<wd-img
  :src="image"
  enable-longpress
  @longpress="handleLongpress"
/>

<!-- ✅ 自定义长按菜单 -->
<wd-img
  :src="image"
  enable-longpress
  :on-longpress="customLongpress"
/>

<!-- ❌ 不要同时使用 enable-longpress 和 show-menu-by-longpress -->
<wd-img
  :src="image"
  enable-longpress
  show-menu-by-longpress
/>
```

## 常见问题

### 1. 图片显示变形

**问题描述:**
图片显示时出现拉伸或压缩变形。

**问题原因:**
- 使用了 `scaleToFill` 模式且图片宽高比与容器不一致
- 容器尺寸设置不合理

**解决方案:**
```vue
<!-- ✅ 使用 aspectFill 或 aspectFit 保持比例 -->
<wd-img
  :src="image"
  width="200"
  height="200"
  mode="aspectFill"
/>

<!-- ✅ 使用 widthFix 自适应高度 -->
<wd-img
  :src="image"
  width="750"
  mode="widthFix"
/>
```

### 2. 多图片预览时只显示一张

**问题描述:**
设置了多张图片,但预览时只能看到一张。

**问题原因:**
- `src` 格式不正确,未使用逗号分隔
- 图片URL中包含逗号导致解析错误

**解决方案:**
```vue
<!-- ✅ 正确的多图片格式 -->
<wd-img
  :src="'image1.jpg,image2.jpg,image3.jpg'"
  enable-preview
/>

<!-- ✅ 使用数组 join -->
<wd-img
  :src="images.join(',')"
  enable-preview
/>

<!-- ❌ 错误的格式 -->
<wd-img
  :src="['image1.jpg', 'image2.jpg']"
  enable-preview
/>
```

### 3. 长按保存图片失败

**问题描述:**
长按图片选择保存,但保存失败。

**问题原因:**
- 没有相册访问权限
- 图片URL是跨域资源
- 图片URL格式不支持

**解决方案:**
```vue
<template>
  <wd-img
    :src="image"
    enable-longpress
    :on-longpress="handleSaveImage"
  />
</template>

<script lang="ts" setup>
const handleSaveImage = (event: Event, imageList: string[], currentIndex: number) => {
  const imageUrl = imageList[currentIndex]

  // 先下载图片到本地
  uni.downloadFile({
    url: imageUrl,
    success: (res) => {
      // 再保存到相册
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => {
          uni.showToast({ title: '保存成功', icon: 'success' })
        },
        fail: (err) => {
          if (err.errMsg.includes('auth')) {
            // 提示用户授权
            uni.showModal({
              title: '需要相册权限',
              content: '保存图片需要访问您的相册,请允许授权',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  uni.openSetting()
                }
              }
            })
          }
        }
      })
    }
  })
}
</script>
```

### 4. 图片加载很慢

**问题描述:**
图片加载时间过长,影响用户体验。

**问题原因:**
- 图片尺寸过大
- 未使用CDN加速
- 未启用懒加载

**解决方案:**
```vue
<!-- ✅ 使用缩略图 + 懒加载 -->
<wd-img
  :src="thumbnailUrl"
  :preview-src="originalUrl"
  width="200"
  height="200"
  lazy-load
  enable-preview
>
  <template #loading>
    <view class="loading">
      <wd-loading />
    </view>
  </template>
</wd-img>

<!-- ✅ 使用图片CDN服务 -->
<wd-img
  :src="`https://cdn.example.com/image.jpg?imageView2/1/w/400/h/400`"
  lazy-load
/>
```

### 5. 多图片显示布局错乱

**问题描述:**
多张图片显示时布局不整齐或间距不均匀。

**问题原因:**
- 容器宽高设置不合理
- 图片数量和容器尺寸不匹配
- 未考虑间距

**解决方案:**
```vue
<!-- ✅ 设置合适的容器尺寸 -->
<wd-img
  :src="multiImages"
  width="375"
  height="250"
  :max-display="9"
  mode="aspectFill"
/>

<!-- ✅ 使用 custom-class 调整布局 -->
<wd-img
  :src="multiImages"
  width="700"
  height="400"
  custom-class="custom-multi-img"
/>

<style>
:deep(.custom-multi-img) {
  .wd-img__multi-container {
    gap: 16rpx; /* 调整图片间距 */
  }
}
</style>
```
