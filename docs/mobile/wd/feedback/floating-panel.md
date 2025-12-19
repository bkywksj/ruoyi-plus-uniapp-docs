---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/floatingPanel
---

# FloatingPanel 浮动面板

## 介绍

FloatingPanel 浮动面板是一种高级交互组件,它固定在页面底部,用户可以通过上下拖动面板来浏览内容。这种交互模式常见于地图导航、音乐播放器、外卖配送详情等场景,让用户在不离开当前视图的情况下访问更多信息,提供了一种优雅的分层内容展示方式。

**核心特性:**

- **拖拽交互** - 支持触摸手势拖拽控制面板高度,基于 `useTouch` Composable 实现
- **锚点吸附** - 支持自定义多个锚点高度,拖拽释放后自动吸附到最近的锚点
- **边界阻尼** - 超出边界时应用阻尼效果(DAMP=0.2),提供自然的拖拽体验
- **平滑动画** - 内置 cubic-bezier 缓动动画,过渡流畅自然
- **内容滚动** - 内容区域支持独立的 scroll-view 滚动
- **安全区域** - 支持 iPhone X 等异形屏底部安全区域适配
- **暗黑模式** - 支持亮色/暗色主题自动切换
- **受控模式** - 支持 `v-model:height` 双向绑定,可程序化控制高度

**技术实现:**

组件核心使用 `useTouch` Composable 处理触摸手势,通过 `closest` 工具函数计算最近锚点,结合 CSS `transform: translateY()` 实现高性能动画。边界阻尼算法确保超出边界时的自然反馈,面板底部使用 `::after` 伪元素延伸背景,避免过度拖拽时露出空白。

## 基本用法

### 基础用法

最简单的用法,面板默认使用 `[100, windowHeight * 0.6]` 作为锚点。

```vue
<template>
  <view class="page">
    <view class="content">页面内容</view>
    <wd-floating-panel>
      <view class="panel-content">
        <view v-for="i in 20" :key="i" class="panel-item">
          列表项 {{ i }}
        </view>
      </view>
    </wd-floating-panel>
  </view>
</template>

<style lang="scss" scoped>
.panel-content {
  padding: 32rpx;
}
.panel-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eee;
}
</style>
```

**默认行为:**
- 最小高度: 100px
- 最大高度: 窗口高度的 60%
- 初始显示最小高度

### 自定义锚点

通过 `anchors` 属性设置自定义锚点数组,支持多个锚点位置。

```vue
<template>
  <wd-floating-panel :anchors="[100, 300, 500]">
    <view class="panel-content">
      面板内容
    </view>
  </wd-floating-panel>
</template>
```

**锚点规则:**
- 锚点数组必须至少包含 2 个值
- 数组第一个值为最小高度
- 数组最后一个值为最大高度
- 中间值为中间锚点,拖拽释放时会吸附到最近的锚点

### 三级锚点示例

适用于需要展示摘要、详情、完整内容三种状态的场景。

```vue
<template>
  <view class="page">
    <wd-floating-panel :anchors="[80, 250, 500]">
      <view class="panel-content">
        <!-- 最小状态显示简要信息 -->
        <view class="summary">
          <text class="title">订单配送中</text>
          <text class="subtitle">预计 15 分钟送达</text>
        </view>

        <!-- 中间状态显示骑手信息 -->
        <view class="rider-info">
          <image class="avatar" src="/static/rider.png" />
          <view class="info">
            <text class="name">骑手小李</text>
            <text class="phone">138****8888</text>
          </view>
          <wd-button type="primary" size="small">联系骑手</wd-button>
        </view>

        <!-- 完整展开显示配送路线 -->
        <view class="route-list">
          <view v-for="step in routeSteps" :key="step.id" class="route-step">
            <view class="step-dot" />
            <view class="step-content">
              <text class="step-title">{{ step.title }}</text>
              <text class="step-time">{{ step.time }}</text>
            </view>
          </view>
        </view>
      </view>
    </wd-floating-panel>
  </view>
</template>

<script lang="ts" setup>
const routeSteps = [
  { id: 1, title: '商家已出餐', time: '12:30' },
  { id: 2, title: '骑手已取餐', time: '12:35' },
  { id: 3, title: '骑手配送中', time: '12:40' },
  { id: 4, title: '即将送达', time: '预计 12:50' },
]
</script>
```

### 受控高度

通过 `v-model:height` 双向绑定控制面板高度,可实现程序化控制。

```vue
<template>
  <view class="controls">
    <wd-button @click="height = 100">收起</wd-button>
    <wd-button @click="height = 300">中间</wd-button>
    <wd-button @click="height = 500">展开</wd-button>
  </view>
  <wd-floating-panel v-model:height="height" :anchors="[100, 300, 500]">
    <view class="panel-content">
      当前高度: {{ height }}
    </view>
  </wd-floating-panel>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const height = ref(100)
</script>
```

**受控模式特点:**
- 高度变化会同步更新到外部变量
- 可以通过修改变量程序化设置高度
- 高度值会自动吸附到最近的锚点

### 监听高度变化

通过 `height-change` 事件监听拖拽结束后的高度变化。

```vue
<template>
  <wd-floating-panel
    :anchors="[100, 300, 500]"
    @height-change="handleHeightChange"
  >
    <view class="panel-content">面板内容</view>
  </wd-floating-panel>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const currentAnchor = ref('min')

const handleHeightChange = ({ height }: { height: number }) => {
  console.log('面板高度变化:', height)

  // 根据高度判断当前锚点状态
  if (height <= 100) {
    currentAnchor.value = 'min'
  } else if (height <= 300) {
    currentAnchor.value = 'mid'
  } else {
    currentAnchor.value = 'max'
  }
}
</script>
```

### 安全区域适配

设置 `safe-area-inset-bottom` 适配 iPhone X 等异形屏底部安全区域。

```vue
<template>
  <wd-floating-panel safe-area-inset-bottom>
    <view class="panel-content">面板内容</view>
  </wd-floating-panel>
</template>
```

**适配原理:**
- 使用 `constant(safe-area-inset-bottom)` 兼容 iOS 11.0-11.2
- 使用 `env(safe-area-inset-bottom)` 兼容 iOS 11.2+
- 底部自动添加安全区域 padding

### 自定义动画时长

通过 `duration` 设置吸附动画时长,单位毫秒。

```vue
<template>
  <!-- 快速动画 -->
  <wd-floating-panel :duration="150">
    <view class="panel-content">快速吸附</view>
  </wd-floating-panel>

  <!-- 慢速动画 -->
  <wd-floating-panel :duration="500">
    <view class="panel-content">缓慢吸附</view>
  </wd-floating-panel>
</template>
```

**动画曲线:**
组件使用 `cubic-bezier(0.18, 0.89, 0.32, 1.28)` 贝塞尔曲线,提供略带回弹效果的自然过渡。

### 禁用内容拖拽

设置 `content-draggable` 为 `false`,仅允许通过头部拖拽条拖拽面板。

```vue
<template>
  <wd-floating-panel :content-draggable="false">
    <view class="panel-content">
      只能通过顶部拖拽条拖拽面板,
      内容区域可以正常滚动而不会触发面板拖拽
    </view>
  </wd-floating-panel>
</template>
```

**使用场景:**
- 内容区域有复杂的滚动交互
- 需要避免内容滚动与面板拖拽冲突
- 用户需要精确控制内容区域的滚动行为

### 隐藏滚动条

设置 `show-scrollbar` 为 `false` 隐藏内容区域的滚动条。

```vue
<template>
  <wd-floating-panel :show-scrollbar="false">
    <view class="panel-content">
      <view v-for="i in 20" :key="i">列表项 {{ i }}</view>
    </view>
  </wd-floating-panel>
</template>
```

### 完全收起

将锚点数组的第一个值设置为 0,实现完全收起效果。

```vue
<template>
  <wd-floating-panel :anchors="[0, 300, 500]">
    <view class="panel-content">
      可以完全收起的面板
    </view>
  </wd-floating-panel>
</template>
```

**注意:** 完全收起时只显示头部拖拽条区域。

## 高级用法

### 地图导航场景

典型的地图导航应用,面板显示路线信息和导航控制。

```vue
<template>
  <view class="map-page">
    <!-- 地图区域 -->
    <map
      class="map"
      :latitude="location.latitude"
      :longitude="location.longitude"
      :markers="markers"
      :polyline="polyline"
      show-location
    />

    <!-- 浮动面板 -->
    <wd-floating-panel
      v-model:height="panelHeight"
      :anchors="[120, 350, 600]"
      safe-area-inset-bottom
      @height-change="onPanelChange"
    >
      <view class="route-panel">
        <!-- 最小状态: 简要信息 -->
        <view class="route-header">
          <view class="destination">
            <wd-icon name="location" size="40rpx" color="#4D80F0" />
            <view class="dest-info">
              <text class="dest-name">{{ destination.name }}</text>
              <text class="dest-distance">
                {{ routeInfo.distance }} · 约{{ routeInfo.duration }}
              </text>
            </view>
          </view>
          <view class="eta">
            <text class="eta-time">{{ routeInfo.arrivalTime }}</text>
            <text class="eta-label">预计到达</text>
          </view>
        </view>

        <!-- 中间状态: 导航控制 -->
        <view v-if="panelHeight > 150" class="route-actions">
          <wd-button
            type="primary"
            block
            @click="startNavigation"
          >
            开始导航
          </wd-button>
          <view class="action-row">
            <wd-button plain @click="shareRoute">
              <wd-icon name="share" />
              分享
            </wd-button>
            <wd-button plain @click="addFavorite">
              <wd-icon name="star" />
              收藏
            </wd-button>
            <wd-button plain @click="showAlternatives">
              <wd-icon name="more" />
              更多
            </wd-button>
          </view>
        </view>

        <!-- 完整状态: 路线详情 -->
        <view v-if="panelHeight > 380" class="route-steps">
          <view class="steps-header">
            <text class="steps-title">路线详情</text>
            <text class="steps-count">共 {{ steps.length }} 步</text>
          </view>
          <view
            v-for="(step, index) in steps"
            :key="index"
            class="step-item"
          >
            <view class="step-icon">
              <wd-icon :name="step.icon" size="36rpx" />
            </view>
            <view class="step-content">
              <text class="step-instruction">{{ step.instruction }}</text>
              <text class="step-road">{{ step.road }}</text>
            </view>
            <text class="step-distance">{{ step.distance }}</text>
          </view>
        </view>
      </view>
    </wd-floating-panel>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const panelHeight = ref(120)

const location = reactive({
  latitude: 39.9042,
  longitude: 116.4074,
})

const destination = reactive({
  name: '北京天安门',
  address: '北京市东城区东长安街',
})

const routeInfo = reactive({
  distance: '3.2公里',
  duration: '15分钟',
  arrivalTime: '14:35',
})

const steps = ref([
  { icon: 'arrow-up', instruction: '向北出发', road: '朝阳路', distance: '200m' },
  { icon: 'arrow-right', instruction: '右转', road: '建国门大街', distance: '1.5km' },
  { icon: 'arrow-left', instruction: '左转', road: '东长安街', distance: '800m' },
  { icon: 'location', instruction: '到达目的地', road: '天安门广场', distance: '' },
])

const onPanelChange = ({ height }: { height: number }) => {
  // 根据面板高度调整地图显示
  console.log('面板高度:', height)
}

const startNavigation = () => {
  uni.showToast({ title: '开始导航', icon: 'none' })
}

const shareRoute = () => {
  uni.showShareMenu({ withShareTicket: true })
}

const addFavorite = () => {
  uni.showToast({ title: '已收藏', icon: 'success' })
}

const showAlternatives = () => {
  uni.showActionSheet({
    itemList: ['驾车', '步行', '骑行', '公交'],
  })
}
</script>

<style lang="scss" scoped>
.map-page {
  height: 100vh;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.route-panel {
  padding: 0 32rpx;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
}

.destination {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.dest-info {
  display: flex;
  flex-direction: column;
}

.dest-name {
  font-size: 32rpx;
  font-weight: 500;
}

.dest-distance {
  font-size: 24rpx;
  color: #666;
}

.eta {
  text-align: right;
}

.eta-time {
  font-size: 40rpx;
  font-weight: 600;
  color: #4D80F0;
}

.eta-label {
  font-size: 22rpx;
  color: #999;
}

.route-actions {
  padding: 24rpx 0;
  border-top: 1rpx solid #eee;
}

.action-row {
  display: flex;
  justify-content: space-around;
  margin-top: 24rpx;
}

.route-steps {
  padding: 24rpx 0;
  border-top: 1rpx solid #eee;
}

.steps-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.steps-title {
  font-size: 28rpx;
  font-weight: 500;
}

.steps-count {
  font-size: 24rpx;
  color: #999;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.step-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f5ff;
  border-radius: 50%;
  margin-right: 20rpx;
}

.step-content {
  flex: 1;
}

.step-instruction {
  font-size: 28rpx;
  display: block;
}

.step-road {
  font-size: 24rpx;
  color: #999;
}

.step-distance {
  font-size: 24rpx;
  color: #666;
}
</style>
```

### 音乐播放器

实现迷你播放条与完整播放器的切换效果。

```vue
<template>
  <view class="music-page">
    <!-- 歌曲列表 -->
    <view class="song-list">
      <view
        v-for="song in songs"
        :key="song.id"
        class="song-item"
        @click="playSong(song)"
      >
        <image :src="song.cover" class="song-cover" />
        <view class="song-info">
          <text class="song-name">{{ song.name }}</text>
          <text class="song-artist">{{ song.artist }}</text>
        </view>
      </view>
    </view>

    <!-- 浮动播放器 -->
    <wd-floating-panel
      v-model:height="panelHeight"
      :anchors="[80, 450]"
      :content-draggable="false"
    >
      <!-- 迷你播放条 -->
      <view v-if="panelHeight <= 100" class="mini-player">
        <image :src="currentSong.cover" class="mini-cover" />
        <view class="mini-info">
          <text class="mini-name">{{ currentSong.name }}</text>
          <text class="mini-artist">{{ currentSong.artist }}</text>
        </view>
        <view class="mini-controls">
          <wd-icon
            :name="isPlaying ? 'pause' : 'play'"
            size="48rpx"
            @click.stop="togglePlay"
          />
          <wd-icon name="list" size="48rpx" @click.stop="showPlaylist" />
        </view>
      </view>

      <!-- 完整播放器 -->
      <view v-else class="full-player">
        <!-- 专辑封面 -->
        <view class="album-container">
          <image
            :src="currentSong.cover"
            class="album-cover"
            :class="{ rotating: isPlaying }"
          />
        </view>

        <!-- 歌曲信息 -->
        <view class="song-detail">
          <text class="song-title">{{ currentSong.name }}</text>
          <text class="song-subtitle">{{ currentSong.artist }} - {{ currentSong.album }}</text>
        </view>

        <!-- 进度条 -->
        <view class="progress-container">
          <text class="time current">{{ formatTime(currentTime) }}</text>
          <wd-slider
            v-model="progress"
            :max="100"
            hide-label
            @change="seekTo"
          />
          <text class="time total">{{ formatTime(duration) }}</text>
        </view>

        <!-- 控制按钮 -->
        <view class="player-controls">
          <wd-icon name="loop" size="48rpx" @click="toggleMode" />
          <wd-icon name="skip-previous" size="56rpx" @click="playPrev" />
          <view class="play-btn" @click="togglePlay">
            <wd-icon
              :name="isPlaying ? 'pause-circle-fill' : 'play-circle-fill'"
              size="96rpx"
              color="#4D80F0"
            />
          </view>
          <wd-icon name="skip-next" size="56rpx" @click="playNext" />
          <wd-icon name="list" size="48rpx" @click="showPlaylist" />
        </view>
      </view>
    </wd-floating-panel>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

interface Song {
  id: number
  name: string
  artist: string
  album: string
  cover: string
}

const panelHeight = ref(80)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(240)
const progress = ref(0)

const songs = ref<Song[]>([
  { id: 1, name: '晴天', artist: '周杰伦', album: '叶惠美', cover: '/static/album1.jpg' },
  { id: 2, name: '稻香', artist: '周杰伦', album: '魔杰座', cover: '/static/album2.jpg' },
  { id: 3, name: '七里香', artist: '周杰伦', album: '七里香', cover: '/static/album3.jpg' },
])

const currentSong = reactive<Song>({
  id: 1,
  name: '晴天',
  artist: '周杰伦',
  album: '叶惠美',
  cover: '/static/album1.jpg',
})

const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

const playSong = (song: Song) => {
  Object.assign(currentSong, song)
  isPlaying.value = true
  panelHeight.value = 450
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const playPrev = () => {
  uni.showToast({ title: '上一首', icon: 'none' })
}

const playNext = () => {
  uni.showToast({ title: '下一首', icon: 'none' })
}

const toggleMode = () => {
  uni.showToast({ title: '切换播放模式', icon: 'none' })
}

const showPlaylist = () => {
  uni.showToast({ title: '播放列表', icon: 'none' })
}

const seekTo = (value: number) => {
  currentTime.value = (value / 100) * duration.value
}
</script>

<style lang="scss" scoped>
.music-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 100rpx;
}

.song-list {
  padding: 24rpx;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.song-cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  margin-right: 24rpx;
}

.song-info {
  flex: 1;
}

.song-name {
  font-size: 30rpx;
  font-weight: 500;
  display: block;
}

.song-artist {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

/* 迷你播放器 */
.mini-player {
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  height: 80rpx;
}

.mini-cover {
  width: 60rpx;
  height: 60rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.mini-info {
  flex: 1;
}

.mini-name {
  font-size: 28rpx;
  display: block;
}

.mini-artist {
  font-size: 22rpx;
  color: #999;
}

.mini-controls {
  display: flex;
  gap: 32rpx;
}

/* 完整播放器 */
.full-player {
  padding: 40rpx 32rpx;
  text-align: center;
}

.album-container {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.album-cover {
  width: 400rpx;
  height: 400rpx;
  border-radius: 50%;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

.album-cover.rotating {
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.song-detail {
  margin-bottom: 40rpx;
}

.song-title {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
}

.song-subtitle {
  font-size: 26rpx;
  color: #999;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.time {
  font-size: 24rpx;
  color: #999;
  width: 80rpx;
}

.time.current {
  text-align: right;
}

.time.total {
  text-align: left;
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 48rpx;
}

.play-btn {
  margin: 0 16rpx;
}
</style>
```

### 商品详情

电商场景下的商品详情展示。

```vue
<template>
  <view class="product-page">
    <!-- 商品图片 -->
    <swiper
      class="product-swiper"
      :indicator-dots="true"
      :autoplay="true"
    >
      <swiper-item v-for="(img, index) in product.images" :key="index">
        <image :src="img" mode="aspectFill" class="product-image" />
      </swiper-item>
    </swiper>

    <!-- 浮动面板 -->
    <wd-floating-panel
      v-model:height="panelHeight"
      :anchors="[180, 400, 700]"
      safe-area-inset-bottom
    >
      <view class="product-panel">
        <!-- 价格和标题 -->
        <view class="price-section">
          <view class="price">
            <text class="currency">¥</text>
            <text class="amount">{{ product.price }}</text>
            <text class="original">¥{{ product.originalPrice }}</text>
          </view>
          <view class="sales">
            <text>月销 {{ product.sales }}</text>
            <text class="divider">|</text>
            <text>好评率 {{ product.rating }}%</text>
          </view>
        </view>

        <view class="title-section">
          <text class="title">{{ product.title }}</text>
          <text class="subtitle">{{ product.subtitle }}</text>
        </view>

        <!-- 规格选择 -->
        <view v-if="panelHeight > 200" class="spec-section">
          <view class="section-title">
            <text>规格</text>
            <text class="selected-spec">已选: {{ selectedSpec }}</text>
          </view>
          <view class="spec-list">
            <view
              v-for="spec in product.specs"
              :key="spec.id"
              class="spec-item"
              :class="{ active: selectedSpecId === spec.id }"
              @click="selectSpec(spec)"
            >
              {{ spec.name }}
            </view>
          </view>
        </view>

        <!-- 商品详情 -->
        <view v-if="panelHeight > 450" class="detail-section">
          <view class="section-title">商品详情</view>
          <view class="detail-content">
            <rich-text :nodes="product.description" />
          </view>
        </view>

        <!-- 底部购买栏 -->
        <view class="buy-bar">
          <view class="icons">
            <view class="icon-item">
              <wd-icon name="shop" size="44rpx" />
              <text>店铺</text>
            </view>
            <view class="icon-item">
              <wd-icon name="chat" size="44rpx" />
              <text>客服</text>
            </view>
            <view class="icon-item" @click="toggleFavorite">
              <wd-icon
                :name="isFavorite ? 'star-fill' : 'star'"
                size="44rpx"
                :color="isFavorite ? '#ff6b00' : ''"
              />
              <text>收藏</text>
            </view>
          </view>
          <view class="buttons">
            <wd-button type="warning" @click="addToCart">加入购物车</wd-button>
            <wd-button type="primary" @click="buyNow">立即购买</wd-button>
          </view>
        </view>
      </view>
    </wd-floating-panel>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const panelHeight = ref(180)
const isFavorite = ref(false)
const selectedSpecId = ref(1)
const selectedSpec = ref('白色 M码')

const product = reactive({
  title: '2024春季新款纯棉T恤男装',
  subtitle: '舒适透气 | 多色可选 | 百搭休闲',
  price: 99,
  originalPrice: 199,
  sales: '2.5万',
  rating: 98,
  images: [
    '/static/product1.jpg',
    '/static/product2.jpg',
    '/static/product3.jpg',
  ],
  specs: [
    { id: 1, name: '白色 M码' },
    { id: 2, name: '白色 L码' },
    { id: 3, name: '黑色 M码' },
    { id: 4, name: '黑色 L码' },
  ],
  description: '<p>商品详情内容...</p>',
})

const selectSpec = (spec: { id: number; name: string }) => {
  selectedSpecId.value = spec.id
  selectedSpec.value = spec.name
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  uni.showToast({
    title: isFavorite.value ? '已收藏' : '已取消',
    icon: 'none',
  })
}

const addToCart = () => {
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}

const buyNow = () => {
  uni.navigateTo({ url: '/pages/order/confirm' })
}
</script>

<style lang="scss" scoped>
.product-page {
  height: 100vh;
  background: #f8f8f8;
}

.product-swiper {
  height: 750rpx;
}

.product-image {
  width: 100%;
  height: 100%;
}

.product-panel {
  padding: 0 32rpx;
}

.price-section {
  padding: 24rpx 0;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.currency {
  font-size: 28rpx;
  color: #ff4d4f;
}

.amount {
  font-size: 48rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.original {
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 16rpx;
}

.sales {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.divider {
  margin: 0 16rpx;
}

.title-section {
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #eee;
}

.title {
  font-size: 32rpx;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.subtitle {
  font-size: 24rpx;
  color: #999;
}

.section-title {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  font-weight: 500;
  padding: 24rpx 0 16rpx;
}

.selected-spec {
  font-size: 24rpx;
  color: #999;
  font-weight: 400;
}

.spec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.spec-item {
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: 2rpx solid transparent;
}

.spec-item.active {
  background: #e6f0ff;
  border-color: #4D80F0;
  color: #4D80F0;
}

.detail-section {
  padding: 24rpx 0;
  border-top: 1rpx solid #eee;
}

.buy-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-top: 1rpx solid #eee;
  margin-top: 24rpx;
}

.icons {
  display: flex;
  gap: 32rpx;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20rpx;
  color: #666;
}

.buttons {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}
</style>
```

### 与 Popup 联动

结合 Popup 实现更复杂的交互效果。

```vue
<template>
  <view class="page">
    <wd-floating-panel
      v-model:height="panelHeight"
      :anchors="[100, 400]"
    >
      <view class="panel-content">
        <wd-button @click="showFilter = true">打开筛选</wd-button>
        <view class="list">
          <view v-for="i in 10" :key="i" class="list-item">
            列表项 {{ i }}
          </view>
        </view>
      </view>
    </wd-floating-panel>

    <!-- 筛选弹窗 -->
    <wd-popup v-model="showFilter" position="bottom" round>
      <view class="filter-popup">
        <view class="filter-header">
          <text>筛选条件</text>
          <wd-icon name="close" @click="showFilter = false" />
        </view>
        <view class="filter-content">
          <!-- 筛选内容 -->
        </view>
        <wd-button type="primary" block @click="applyFilter">
          确定
        </wd-button>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const panelHeight = ref(100)
const showFilter = ref(false)

const applyFilter = () => {
  showFilter.value = false
  // 应用筛选条件
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model:height | 面板显示高度(px) | `number` | `0` |
| anchors | 自定义锚点数组(px) | `number[]` | `[100, windowHeight * 0.6]` |
| duration | 动画时长(毫秒) | `number \| string` | `300` |
| content-draggable | 是否允许内容区域拖拽 | `boolean` | `true` |
| safe-area-inset-bottom | 是否设置底部安全距离 | `boolean` | `false` |
| show-scrollbar | 是否显示滚动条 | `boolean` | `true` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:height | 高度更新时触发(用于 v-model) | `height: number` |
| height-change | 拖拽结束且高度变化时触发 | `{ height: number }` |

### Slots

| 名称 | 说明 |
|------|------|
| default | 面板内容 |

### 类型定义

```typescript
/**
 * 浮动面板组件属性接口
 */
interface WdFloatingPanelProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 面板的显示高度(px) */
  height?: number
  /** 设置自定义锚点数组(px)，默认 [100, windowHeight * 0.6] */
  anchors?: number[]
  /** 是否设置底部安全距离(iPhone X类型机型) */
  safeAreaInsetBottom?: boolean
  /** 是否显示滚动条 */
  showScrollbar?: boolean
  /** 动画时长(毫秒) */
  duration?: string | number
  /** 是否允许内容区域拖拽 */
  contentDraggable?: boolean
}

/**
 * 浮动面板组件事件接口
 */
interface WdFloatingPanelEmits {
  /** 高度更新时触发 */
  'update:height': [value: number]
  /** 高度变化完成时触发 */
  'height-change': [data: { height: number }]
}

/**
 * 锚点边界接口
 */
interface AnchorBoundary {
  /** 最小高度 */
  min: number
  /** 最大高度 */
  max: number
}
```

### 核心工具函数

```typescript
/**
 * 找到数组中最接近目标值的元素
 * @param arr 数值数组
 * @param target 目标值
 * @returns 最接近目标值的元素
 */
export const closest = (arr: number[], target: number): number => {
  return arr.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  )
}
```

### useTouch Composable

```typescript
/**
 * 触摸事件管理组合式函数
 * 提供触摸手势的识别和处理
 */
export const useTouch = () => {
  const direction = ref<string>('')  // 滑动方向: 'horizontal' | 'vertical' | ''
  const deltaX = ref<number>(0)      // 水平位移量
  const deltaY = ref<number>(0)      // 垂直位移量
  const offsetX = ref<number>(0)     // 水平偏移量(绝对值)
  const offsetY = ref<number>(0)     // 垂直偏移量(绝对值)
  const startX = ref<number>(0)      // 起始X坐标
  const startY = ref<number>(0)      // 起始Y坐标

  const touchStart = (event: TouchEvent) => { ... }
  const touchMove = (event: TouchEvent) => { ... }

  return {
    touchStart,
    touchMove,
    direction,
    deltaX,
    deltaY,
    offsetX,
    offsetY,
    startX,
    startY,
  }
}
```

## 主题定制

组件提供了丰富的 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wot-floating-panel-bg | 面板背景色 | `#ffffff` |
| --wot-floating-panel-radius | 面板圆角 | `32rpx` |
| --wot-floating-panel-z-index | 面板层级 | `99` |
| --wot-floating-panel-header-height | 头部高度 | `60rpx` |
| --wot-floating-panel-bar-width | 拖拽条宽度 | `40rpx` |
| --wot-floating-panel-bar-height | 拖拽条高度 | `6rpx` |
| --wot-floating-panel-bar-bg | 拖拽条背景色 | `$-color-gray-5` |
| --wot-floating-panel-bar-radius | 拖拽条圆角 | `8rpx` |
| --wot-floating-panel-content-bg | 内容区背景色 | `#ffffff` |

### 自定义样式示例

```vue
<template>
  <wd-floating-panel class="custom-panel">
    <view class="panel-content">自定义样式</view>
  </wd-floating-panel>
</template>

<style lang="scss">
.custom-panel {
  --wot-floating-panel-bg: #f8f9fa;
  --wot-floating-panel-radius: 48rpx;
  --wot-floating-panel-bar-width: 60rpx;
  --wot-floating-panel-bar-height: 8rpx;
  --wot-floating-panel-bar-bg: #4D80F0;
  --wot-floating-panel-bar-radius: 4rpx;
}
</style>
```

### 暗黑模式

组件内置暗黑模式支持,通过 `wot-theme-dark` 类名自动切换:

```scss
.wot-theme-dark {
  .wd-floating-panel {
    background: $-dark-background2;

    .wd-floating-panel__content {
      background: $-dark-background2;
    }
  }
}
```

## 最佳实践

### 1. 合理设置锚点

```typescript
// ✅ 推荐: 锚点间距适中,用户操作自然
const anchors = [100, 300, 500]

// ❌ 避免: 锚点过多或间距过小
const anchors = [100, 150, 200, 250, 300, 350, 400]

// ✅ 推荐: 根据内容设置锚点
// 最小锚点: 显示摘要信息
// 中间锚点: 显示主要操作
// 最大锚点: 显示完整内容
const anchors = [80, 280, windowHeight * 0.8]
```

### 2. 根据高度渲染不同内容

```vue
<template>
  <wd-floating-panel v-model:height="height" :anchors="[100, 300, 500]">
    <!-- 始终显示的内容 -->
    <view class="header">标题</view>

    <!-- 中等高度时显示 -->
    <view v-if="height > 150" class="actions">
      操作按钮
    </view>

    <!-- 完全展开时显示 -->
    <view v-if="height > 350" class="details">
      详细内容
    </view>
  </wd-floating-panel>
</template>
```

### 3. 处理内容滚动冲突

```vue
<template>
  <!-- 方案1: 禁用内容拖拽 -->
  <wd-floating-panel :content-draggable="false">
    <scroll-view scroll-y class="scroll-content">
      <!-- 可滚动内容 -->
    </scroll-view>
  </wd-floating-panel>

  <!-- 方案2: 使用组件内置scroll-view -->
  <wd-floating-panel>
    <!-- 内容直接放入,自动支持滚动 -->
    <view v-for="i in 50" :key="i">列表项 {{ i }}</view>
  </wd-floating-panel>
</template>
```

### 4. 程序化控制面板

```typescript
// 展开面板
const expand = () => {
  height.value = anchors[anchors.length - 1]
}

// 收起面板
const collapse = () => {
  height.value = anchors[0]
}

// 切换到指定锚点
const toggleToAnchor = (index: number) => {
  if (index >= 0 && index < anchors.length) {
    height.value = anchors[index]
  }
}
```

### 5. 性能优化

```vue
<template>
  <wd-floating-panel v-model:height="height" :anchors="anchors">
    <!-- 使用 v-show 而非 v-if 避免频繁重建 DOM -->
    <view v-show="height > 200" class="heavy-content">
      复杂内容
    </view>

    <!-- 或使用 keep-alive 缓存组件 -->
    <keep-alive>
      <component :is="currentComponent" />
    </keep-alive>
  </wd-floating-panel>
</template>
```

## 常见问题

### 1. 面板无法拖动?

**可能原因:**
- 组件被其他元素遮挡
- 锚点设置错误
- 触摸事件被阻止

**解决方案:**
```vue
<!-- 确保面板层级足够高 -->
<wd-floating-panel style="--wot-floating-panel-z-index: 999">
  ...
</wd-floating-panel>

<!-- 检查锚点设置 -->
<wd-floating-panel :anchors="[100, 300]">
  ...
</wd-floating-panel>
```

### 2. 内容滚动与面板拖拽冲突?

**解决方案:**
```vue
<!-- 禁用内容区域拖拽 -->
<wd-floating-panel :content-draggable="false">
  <view class="scrollable-content">
    ...
  </view>
</wd-floating-panel>
```

### 3. 如何实现完全收起?

```vue
<!-- 将第一个锚点设为 0 -->
<wd-floating-panel :anchors="[0, 300, 500]">
  ...
</wd-floating-panel>
```

### 4. 动画不流畅?

**可能原因:**
- 内容区域有大量 DOM
- 频繁触发重渲染
- 设备性能不足

**解决方案:**
```vue
<template>
  <!-- 减少动画时长 -->
  <wd-floating-panel :duration="200">
    <!-- 使用虚拟列表优化长列表 -->
    <virtual-list :data="items" />
  </wd-floating-panel>
</template>

<style>
/* 开启 GPU 加速 */
.panel-content {
  transform: translateZ(0);
  will-change: transform;
}
</style>
```

### 5. 小程序端层级问题?

**原因:** 小程序原生组件(map、video、camera)层级高于普通元素

**解决方案:**
```vue
<!-- 提高面板层级 -->
<wd-floating-panel style="--wot-floating-panel-z-index: 9999">
  ...
</wd-floating-panel>

<!-- 或使用 cover-view 覆盖原生组件 -->
<map>
  <cover-view class="map-overlay">
    ...
  </cover-view>
</map>
```

### 6. 如何监听面板状态变化?

```vue
<template>
  <wd-floating-panel
    v-model:height="height"
    :anchors="anchors"
    @height-change="onHeightChange"
  >
    ...
  </wd-floating-panel>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

const height = ref(100)
const anchors = [100, 300, 500]

// 计算当前状态
const panelState = computed(() => {
  if (height.value <= anchors[0]) return 'collapsed'
  if (height.value >= anchors[anchors.length - 1]) return 'expanded'
  return 'partial'
})

// 监听状态变化
watch(panelState, (newState, oldState) => {
  console.log(`面板状态从 ${oldState} 变为 ${newState}`)
})

const onHeightChange = ({ height: h }: { height: number }) => {
  // 拖拽结束后的回调
  console.log('最终高度:', h)
}
</script>
```

## 总结

`FloatingPanel` 浮动面板核心使用要点:

1. **锚点配置** - 使用 `anchors` 设置吸附高度点,至少包含 2 个值
2. **受控模式** - 通过 `v-model:height` 实现双向绑定和程序化控制
3. **内容拖拽** - 使用 `content-draggable` 控制是否允许内容区域触发拖拽
4. **安全区域** - 使用 `safe-area-inset-bottom` 适配异形屏
5. **高度监听** - 通过 `height-change` 事件监听拖拽结束后的高度变化
6. **条件渲染** - 根据当前高度值条件渲染不同层级的内容
