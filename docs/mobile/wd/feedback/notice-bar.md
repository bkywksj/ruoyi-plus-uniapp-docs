# NoticeBar 通知栏

## 介绍

NoticeBar 是一个通知栏组件,用于在页面顶部或指定位置展示通知信息。该组件支持水平滚动和垂直轮播两种展示模式,提供了 warning、info、danger 三种预设类型,广泛应用于系统公告、活动通知、消息提醒等场景。

**核心特性:**

- **三种通知类型** - 支持 warning(警告)、info(信息)、danger(危险)三种类型,自动应用对应的主题色
- **双向滚动** - 支持水平滚动和垂直轮播两种滚动方向,适应不同展示需求
- **文本轮播** - 支持传入文本数组,实现多条通知自动轮播切换
- **可关闭** - 支持显示关闭按钮,允许用户手动关闭通知栏
- **多行显示** - 支持开启换行模式,展示较长的通知内容
- **自定义图标** - 支持自定义前缀图标,也可通过插槽完全自定义
- **自定义样式** - 支持自定义文字颜色、背景颜色,满足个性化需求
- **速度控制** - 支持自定义滚动速度和延迟时间
- **手动控制** - 暴露 reset 方法,支持手动重置动画
- **事件回调** - 支持点击、关闭、轮播切换等事件回调
- **暗黑模式** - 内置暗黑模式样式适配

## 基本用法

### 基础用法

最基础的用法,显示一条通知信息:

```vue
<template>
  <view class="demo">
    <wd-notice-bar text="这是一条通知消息,请注意查看。" />
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**

- `text` 属性设置通知文本内容
- 默认类型为 warning,显示橙色样式
- 当文本超出容器宽度时会自动开启水平滚动

### 通知类型

通过 `type` 属性设置通知类型:

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">警告类型:</text>
      <wd-notice-bar type="warning" text="这是一条警告通知" />
    </view>

    <view class="item">
      <text class="label">信息类型:</text>
      <wd-notice-bar type="info" text="这是一条信息通知" />
    </view>

    <view class="item">
      <text class="label">危险类型:</text>
      <wd-notice-bar type="danger" text="这是一条危险通知" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}
</style>
```

**使用说明:**

- `warning` - 警告类型,橙色主题,用于一般提醒
- `info` - 信息类型,蓝色主题,用于普通信息通知
- `danger` - 危险类型,红色主题,用于重要警告或错误提示

### 可关闭通知

通过 `closable` 属性显示关闭按钮:

```vue
<template>
  <view class="demo">
    <wd-notice-bar
      v-if="visible"
      text="这是一条可关闭的通知消息"
      closable
      @close="handleClose"
    />

    <wd-button v-else @click="visible = true">显示通知</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(true)

const handleClose = () => {
  visible.value = false
  uni.showToast({ title: '通知已关闭', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**

- 设置 `closable` 后,通知栏右侧会显示关闭图标
- 点击关闭图标会触发 `close` 事件
- 需要手动控制通知栏的显示隐藏

### 禁用滚动

通过 `scrollable` 属性控制是否开启滚动:

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">开启滚动 (默认):</text>
      <wd-notice-bar text="这是一条很长的通知消息,当文本超出容器宽度时会自动开启水平滚动效果。" />
    </view>

    <view class="item">
      <text class="label">禁用滚动:</text>
      <wd-notice-bar
        text="这是一条很长的通知消息,禁用滚动后文本会被截断。"
        :scrollable="false"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}
</style>
```

**使用说明:**

- `scrollable` 默认为 `true`,超长文本会自动滚动
- 设为 `false` 时,超长文本会被截断显示省略号

### 多行显示

通过 `wrapable` 属性开启多行显示模式:

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">单行显示 (默认):</text>
      <wd-notice-bar
        text="这是一条很长的通知消息,默认情况下会单行显示并滚动。"
        :scrollable="false"
      />
    </view>

    <view class="item">
      <text class="label">多行显示:</text>
      <wd-notice-bar
        text="这是一条很长的通知消息,开启 wrapable 后可以多行显示完整内容,不会被截断也不会滚动。"
        wrapable
        :scrollable="false"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}
</style>
```

**使用说明:**

- 开启 `wrapable` 时建议同时设置 `scrollable` 为 `false`
- 多行模式适合展示较长的通知内容

### 自定义前缀图标

通过 `prefix` 属性设置前缀图标:

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">默认图标:</text>
      <wd-notice-bar text="默认显示警告图标" />
    </view>

    <view class="item">
      <text class="label">铃铛图标:</text>
      <wd-notice-bar prefix="bell" text="这是一条消息通知" />
    </view>

    <view class="item">
      <text class="label">音量图标:</text>
      <wd-notice-bar prefix="volume" text="这是一条语音通知" />
    </view>

    <view class="item">
      <text class="label">无图标:</text>
      <wd-notice-bar prefix="" text="不显示前缀图标" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}
</style>
```

**使用说明:**

- `prefix` 设置为图标名称可自定义前缀图标
- 设置为空字符串 `""` 可隐藏前缀图标
- 图标名称参考 Icon 图标组件

## 自定义样式

### 自定义颜色

通过 `color` 和 `backgroundColor` 自定义通知栏样式:

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">自定义文字颜色:</text>
      <wd-notice-bar
        text="自定义文字颜色为紫色"
        color="#722ed1"
      />
    </view>

    <view class="item">
      <text class="label">自定义背景颜色:</text>
      <wd-notice-bar
        text="自定义背景颜色为绿色"
        color="#52c41a"
        background-color="#f6ffed"
      />
    </view>

    <view class="item">
      <text class="label">渐变背景:</text>
      <wd-notice-bar
        text="支持渐变背景色"
        color="#fff"
        background-color="linear-gradient(90deg, #ff6b6b, #feca57)"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}
</style>
```

**使用说明:**

- `color` 同时设置文字和图标的颜色
- `backgroundColor` 设置背景颜色,支持渐变色
- 自定义颜色会覆盖类型预设的颜色

### 配合类型使用

结合类型和自定义样式:

```vue
<template>
  <view class="demo">
    <view class="item">
      <wd-notice-bar
        type="info"
        text="信息类型配合自定义颜色"
        color="#1890ff"
        background-color="#e6f7ff"
        closable
      />
    </view>

    <view class="item">
      <wd-notice-bar
        type="danger"
        text="危险类型配合深色背景"
        color="#fff"
        background-color="#ff4d4f"
        closable
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.item {
  margin-bottom: 32rpx;
}
</style>
```

## 插槽使用

### 前缀插槽

通过 `prefix` 插槽自定义前缀内容:

```vue
<template>
  <view class="demo">
    <wd-notice-bar text="自定义前缀内容">
      <template #prefix>
        <view class="custom-prefix">
          <image
            class="prefix-image"
            src="https://example.com/icon.png"
            mode="aspectFit"
          />
        </view>
      </template>
    </wd-notice-bar>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.custom-prefix {
  margin-right: 16rpx;
}

.prefix-image {
  width: 36rpx;
  height: 36rpx;
}
</style>
```

### 后缀插槽

通过 `suffix` 插槽自定义后缀内容:

```vue
<template>
  <view class="demo">
    <wd-notice-bar text="自定义后缀内容,点击查看详情">
      <template #suffix>
        <view class="custom-suffix" @click="handleViewMore">
          <text class="suffix-text">查看详情</text>
          <wd-icon name="arrow-right" size="28rpx" />
        </view>
      </template>
    </wd-notice-bar>
  </view>
</template>

<script lang="ts" setup>
const handleViewMore = () => {
  uni.showToast({ title: '查看详情', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.custom-suffix {
  display: flex;
  align-items: center;
  margin-left: 16rpx;
}

.suffix-text {
  font-size: 26rpx;
  margin-right: 8rpx;
}
</style>
```

### 默认插槽

通过默认插槽完全自定义通知内容:

```vue
<template>
  <view class="demo">
    <wd-notice-bar type="info">
      <view class="custom-content">
        <text class="highlight">重要通知:</text>
        <text class="content-text">系统将于今晚 22:00 进行维护升级</text>
      </view>
    </wd-notice-bar>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.custom-content {
  display: flex;
  align-items: center;
}

.highlight {
  color: #ff4d4f;
  font-weight: bold;
  margin-right: 8rpx;
}

.content-text {
  color: inherit;
}
</style>
```

**使用说明:**

- 使用默认插槽时,`text` 属性将被忽略
- 插槽内容不会自动滚动,需要自行处理样式

### 组合使用插槽

同时使用多个插槽:

```vue
<template>
  <view class="demo">
    <wd-notice-bar
      type="warning"
      color="#fa8c16"
      background-color="#fff7e6"
    >
      <template #prefix>
        <wd-icon name="warning-filled" size="36rpx" color="#fa8c16" />
      </template>

      <view class="notice-content">
        <text>距离活动结束还剩</text>
        <text class="countdown">{{ countdown }}</text>
        <text>秒</text>
      </view>

      <template #suffix>
        <wd-button size="small" type="warning" @click="handleJoin">
          立即参与
        </wd-button>
      </template>
    </wd-notice-bar>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const countdown = ref(3600)
let timer: number | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    }
  }, 1000) as unknown as number
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const handleJoin = () => {
  uni.navigateTo({ url: '/pages/activity/index' })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.notice-content {
  display: flex;
  align-items: center;
  font-size: 28rpx;
}

.countdown {
  color: #ff4d4f;
  font-weight: bold;
  margin: 0 8rpx;
}
</style>
```

## 文本轮播

### 水平轮播

传入文本数组实现水平方向的文本轮播:

```vue
<template>
  <view class="demo">
    <wd-notice-bar
      :text="textList"
      direction="horizontal"
      @next="handleNext"
      @click="handleClick"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const textList = ref([
  '第一条通知:系统升级公告',
  '第二条通知:新功能上线通知',
  '第三条通知:活动促销信息'
])

const handleNext = (index: number) => {
  console.log('切换到第', index + 1, '条通知')
}

const handleClick = (result: { index: number; text: string }) => {
  console.log('点击了第', result.index + 1, '条:', result.text)
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**

- `text` 传入字符串数组,实现多条文本轮播
- `direction` 设为 `'horizontal'` 表示水平滚动(默认值)
- 每条文本滚动完毕后自动切换到下一条
- `next` 事件在切换时触发,返回当前索引

### 垂直轮播

设置 `direction` 为 `'vertical'` 实现垂直方向的文本轮播:

```vue
<template>
  <view class="demo">
    <wd-notice-bar
      :text="textList"
      direction="vertical"
      :delay="3"
      @next="handleNext"
      @click="handleClick"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const textList = ref([
  '用户张三刚刚购买了iPhone 15 Pro',
  '用户李四刚刚购买了MacBook Pro',
  '用户王五刚刚购买了AirPods Pro',
  '用户赵六刚刚购买了iPad Pro'
])

const handleNext = (index: number) => {
  console.log('当前显示第', index + 1, '条')
}

const handleClick = (result: { index: number; text: string }) => {
  uni.showToast({ title: result.text, icon: 'none' })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**

- 垂直轮播以淡入淡出或上下滑动的方式切换文本
- `delay` 属性控制每条文本显示的时间(单位:秒)
- 适用于购买记录、中奖名单等场景

### 动态更新文本

支持动态更新轮播文本:

```vue
<template>
  <view class="demo">
    <wd-notice-bar
      :text="dynamicTextList"
      direction="vertical"
      :delay="2"
    />

    <view class="buttons">
      <wd-button size="small" @click="addText">添加通知</wd-button>
      <wd-button size="small" @click="clearText">清空通知</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dynamicTextList = ref([
  '初始通知一',
  '初始通知二'
])

let count = 2

const addText = () => {
  count++
  dynamicTextList.value.push(`新增通知 ${count}`)
}

const clearText = () => {
  dynamicTextList.value = ['暂无通知']
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 32rpx;
}
</style>
```

## 高级配置

### 滚动速度

通过 `speed` 属性控制滚动速度:

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">慢速 (50rpx/s):</text>
      <wd-notice-bar
        text="这是一条慢速滚动的通知消息,滚动速度为 50rpx/s"
        :speed="50"
      />
    </view>

    <view class="item">
      <text class="label">默认速度 (100rpx/s):</text>
      <wd-notice-bar
        text="这是一条默认速度滚动的通知消息,滚动速度为 100rpx/s"
        :speed="100"
      />
    </view>

    <view class="item">
      <text class="label">快速 (200rpx/s):</text>
      <wd-notice-bar
        text="这是一条快速滚动的通知消息,滚动速度为 200rpx/s"
        :speed="200"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}
</style>
```

**使用说明:**

- `speed` 单位为 rpx/秒,默认值为 100
- 值越大滚动越快
- 建议根据文本长度调整速度,确保用户能看清内容

### 延迟时间

通过 `delay` 属性设置开始滚动的延迟时间:

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">无延迟:</text>
      <wd-notice-bar
        text="立即开始滚动"
        :delay="0"
      />
    </view>

    <view class="item">
      <text class="label">延迟 1 秒 (默认):</text>
      <wd-notice-bar
        text="延迟 1 秒后开始滚动"
        :delay="1"
      />
    </view>

    <view class="item">
      <text class="label">延迟 3 秒:</text>
      <wd-notice-bar
        text="延迟 3 秒后开始滚动"
        :delay="3"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}
</style>
```

**使用说明:**

- `delay` 单位为秒,默认值为 1
- 用于控制页面加载后多久开始滚动
- 对于垂直轮播,`delay` 表示每条文本显示的停留时间

### 手动重置动画

通过 ref 调用 `reset` 方法重置动画:

```vue
<template>
  <view class="demo">
    <wd-notice-bar
      ref="noticeBarRef"
      text="点击下方按钮可以重置滚动动画"
      :speed="80"
    />

    <view class="buttons">
      <wd-button @click="resetAnimation">重置动画</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface NoticeBarInstance {
  reset: () => void
}

const noticeBarRef = ref<NoticeBarInstance | null>(null)

const resetAnimation = () => {
  noticeBarRef.value?.reset()
  uni.showToast({ title: '动画已重置', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.buttons {
  margin-top: 32rpx;
}
</style>
```

**使用说明:**

- 通过 `ref` 获取组件实例
- 调用 `reset()` 方法可重置滚动动画到初始状态
- 适用于需要手动控制动画的场景

## 事件监听

### 点击事件

监听通知栏的点击事件:

```vue
<template>
  <view class="demo">
    <wd-notice-bar
      :text="textList"
      direction="vertical"
      @click="handleClick"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const textList = ref([
  '点击查看促销活动详情',
  '点击查看新品上架信息',
  '点击查看会员专享福利'
])

const handleClick = (result: { index: number; text: string }) => {
  uni.showModal({
    title: '通知详情',
    content: result.text,
    showCancel: false
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

- `click` 事件返回包含 `index` 和 `text` 的对象
- `index` 为当前显示文本的索引(从 0 开始)
- `text` 为当前显示的文本内容

### 关闭事件

监听关闭按钮的点击事件:

```vue
<template>
  <view class="demo">
    <wd-notice-bar
      v-if="visible"
      text="这是一条可关闭的通知"
      closable
      @close="handleClose"
    />

    <view v-else class="closed-tip">
      <text>通知已关闭</text>
      <wd-button size="small" @click="visible = true">重新显示</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(true)

const handleClose = () => {
  visible.value = false
  // 可以在这里记录用户关闭行为
  console.log('用户关闭了通知')
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.closed-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}
</style>
```

### 轮播切换事件

监听文本轮播的切换事件:

```vue
<template>
  <view class="demo">
    <wd-notice-bar
      :text="textList"
      direction="vertical"
      :delay="2"
      @next="handleNext"
    />

    <view class="info">
      <text>当前显示: 第 {{ currentIndex + 1 }} 条</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const textList = ref([
  '第一条通知内容',
  '第二条通知内容',
  '第三条通知内容'
])

const currentIndex = ref(0)

const handleNext = (index: number) => {
  currentIndex.value = index
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.info {
  margin-top: 24rpx;
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
```

**使用说明:**

- `next` 事件在每次轮播切换时触发
- 返回当前显示文本的索引

## 实际应用场景

### 系统公告

```vue
<template>
  <view class="page">
    <wd-notice-bar
      v-if="announcement"
      type="warning"
      :text="announcement"
      closable
      @close="hideAnnouncement"
      @click="viewAnnouncement"
    />

    <!-- 页面其他内容 -->
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const announcement = ref('')

onMounted(() => {
  // 模拟获取公告
  fetchAnnouncement()
})

const fetchAnnouncement = async () => {
  // 实际项目中调用接口
  announcement.value = '系统将于 2024-01-15 22:00-24:00 进行维护升级,届时部分功能可能无法使用'
}

const hideAnnouncement = () => {
  announcement.value = ''
  // 可以存储到本地,避免重复显示
  uni.setStorageSync('announcement_closed', true)
}

const viewAnnouncement = () => {
  uni.navigateTo({ url: '/pages/announcement/detail' })
}
</script>
```

### 购买记录滚动

```vue
<template>
  <view class="purchase-bar">
    <wd-notice-bar
      :text="purchaseRecords"
      direction="vertical"
      :delay="3"
      prefix=""
      type=""
      color="#ff4d4f"
      background-color="#fff1f0"
    >
      <template #prefix>
        <image class="avatar" :src="currentAvatar" mode="aspectFill" />
      </template>
    </wd-notice-bar>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface PurchaseRecord {
  avatar: string
  username: string
  product: string
}

const records = ref<PurchaseRecord[]>([
  { avatar: 'https://example.com/avatar1.jpg', username: '张***', product: 'iPhone 15 Pro' },
  { avatar: 'https://example.com/avatar2.jpg', username: '李***', product: 'MacBook Pro' },
  { avatar: 'https://example.com/avatar3.jpg', username: '王***', product: 'AirPods Pro' }
])

const currentIndex = ref(0)

const purchaseRecords = computed(() => {
  return records.value.map(r => `${r.username} 刚刚购买了 ${r.product}`)
})

const currentAvatar = computed(() => {
  return records.value[currentIndex.value]?.avatar || ''
})
</script>

<style lang="scss" scoped>
.purchase-bar {
  margin: 32rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}
</style>
```

### 活动倒计时

```vue
<template>
  <view class="activity-bar">
    <wd-notice-bar
      type=""
      color="#fff"
      background-color="linear-gradient(90deg, #ff6b6b, #feca57)"
    >
      <template #prefix>
        <wd-icon name="gift" size="36rpx" color="#fff" />
      </template>

      <view class="activity-content">
        <text>限时特惠</text>
        <view class="countdown">
          <text class="time-block">{{ hours }}</text>
          <text class="separator">:</text>
          <text class="time-block">{{ minutes }}</text>
          <text class="separator">:</text>
          <text class="time-block">{{ seconds }}</text>
        </view>
        <text>后结束</text>
      </view>

      <template #suffix>
        <view class="go-btn" @click="goActivity">
          <text>去抢购</text>
          <wd-icon name="arrow-right" size="24rpx" color="#fff" />
        </view>
      </template>
    </wd-notice-bar>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const totalSeconds = ref(3661) // 1小时1分1秒
let timer: number | null = null

const hours = computed(() => String(Math.floor(totalSeconds.value / 3600)).padStart(2, '0'))
const minutes = computed(() => String(Math.floor((totalSeconds.value % 3600) / 60)).padStart(2, '0'))
const seconds = computed(() => String(totalSeconds.value % 60).padStart(2, '0'))

onMounted(() => {
  timer = setInterval(() => {
    if (totalSeconds.value > 0) {
      totalSeconds.value--
    }
  }, 1000) as unknown as number
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const goActivity = () => {
  uni.navigateTo({ url: '/pages/activity/index' })
}
</script>

<style lang="scss" scoped>
.activity-bar {
  margin: 32rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.activity-content {
  display: flex;
  align-items: center;
  font-size: 28rpx;
}

.countdown {
  display: flex;
  align-items: center;
  margin: 0 8rpx;
}

.time-block {
  background: rgba(0, 0, 0, 0.3);
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.separator {
  margin: 0 4rpx;
  font-weight: bold;
}

.go-btn {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.3);
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
}
</style>
```

### 消息通知列表

```vue
<template>
  <view class="message-bar">
    <wd-notice-bar
      v-if="messages.length"
      :text="messages"
      direction="vertical"
      :delay="4"
      type="info"
      closable
      @click="handleMessageClick"
      @close="clearMessages"
    >
      <template #prefix>
        <view class="message-badge">
          <wd-icon name="bell" size="32rpx" />
          <view class="badge">{{ messages.length }}</view>
        </view>
      </template>
    </wd-notice-bar>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const messages = ref([
  '您有一条新的系统消息',
  '您的订单已发货,请注意查收',
  '您关注的商品已降价'
])

const handleMessageClick = (result: { index: number; text: string }) => {
  uni.navigateTo({
    url: `/pages/message/detail?index=${result.index}`
  })
}

const clearMessages = () => {
  messages.value = []
}
</script>

<style lang="scss" scoped>
.message-bar {
  margin: 32rpx;
}

.message-badge {
  position: relative;
  margin-right: 16rpx;
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 28rpx;
  height: 28rpx;
  line-height: 28rpx;
  text-align: center;
  font-size: 20rpx;
  color: #fff;
  background: #ff4d4f;
  border-radius: 14rpx;
  padding: 0 6rpx;
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| text | 通知文本内容,传入数组时开启轮播 | `string \| string[]` | - |
| type | 通知类型 | `'warning' \| 'info' \| 'danger' \| ''` | `'warning'` |
| scrollable | 是否开启滚动播放 | `boolean` | `true` |
| delay | 滚动延迟时间,单位秒 | `number` | `1` |
| speed | 滚动速度,单位 rpx/秒 | `number` | `100` |
| closable | 是否显示关闭按钮 | `boolean` | `false` |
| wrapable | 是否开启文本换行 | `boolean` | `false` |
| prefix | 左侧图标名称 | `string` | - |
| color | 文字和图标颜色 | `string` | - |
| background-color | 背景颜色 | `string` | - |
| direction | 滚动方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 关闭按钮点击时触发 | - |
| next | 轮播切换时触发 | `index: number` |
| click | 点击通知栏时触发 | `{ index: number; text: string }` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义通知内容,会替换 text |
| prefix | 自定义左侧内容 |
| suffix | 自定义右侧内容 |

### Methods

通过 ref 可以获取到组件实例并调用以下方法:

| 方法名 | 说明 | 参数 |
|--------|------|------|
| reset | 重置滚动动画 | - |

### 类型定义

```typescript
/**
 * 通知栏类型
 */
export type NoticeBarType = 'warning' | 'info' | 'danger' | ''

/**
 * 滚动方向类型
 */
export type NoticeBarScrollDirection = 'horizontal' | 'vertical'

/**
 * 点击事件返回数据
 */
export interface NoticeBarClickResult {
  /** 当前文本索引 */
  index: number
  /** 当前文本内容 */
  text: string
}

/**
 * 通知栏组件属性接口
 */
export interface WdNoticeBarProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 通知文本内容,传入数组时开启轮播 */
  text?: string | string[]
  /** 通知类型 */
  type?: NoticeBarType
  /** 是否开启滚动播放 */
  scrollable?: boolean
  /** 滚动延迟时间,单位秒 */
  delay?: number
  /** 滚动速度,单位 rpx/秒 */
  speed?: number
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 是否开启文本换行 */
  wrapable?: boolean
  /** 左侧图标名称 */
  prefix?: string
  /** 文字和图标颜色 */
  color?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 滚动方向 */
  direction?: NoticeBarScrollDirection
}

/**
 * 通知栏组件事件接口
 */
export interface WdNoticeBarEmits {
  /** 关闭按钮点击时触发 */
  close: []
  /** 轮播切换时触发 */
  next: [index: number]
  /** 点击通知栏时触发 */
  click: [result: NoticeBarClickResult]
}

/**
 * 通知栏组件暴露的方法
 */
export interface WdNoticeBarExpose {
  /** 重置滚动动画 */
  reset: () => void
}
```

## 主题定制

### CSS 变量

组件提供以下 CSS 变量,可用于自定义样式:

```scss
// 通知栏高度
$-notice-bar-height: 72rpx;
// 内边距
$-notice-bar-padding: 0 24rpx;
// 字体大小
$-notice-bar-font-size: 28rpx;
// 行高
$-notice-bar-line-height: 40rpx;

// 默认/警告类型颜色
$-notice-bar-warning-color: #fa8c16;
$-notice-bar-warning-bg: #fffbe6;

// 信息类型颜色
$-notice-bar-info-color: #1890ff;
$-notice-bar-info-bg: #e6f7ff;

// 危险类型颜色
$-notice-bar-danger-color: #ff4d4f;
$-notice-bar-danger-bg: #fff2f0;

// 图标大小
$-notice-bar-icon-size: 36rpx;
// 图标间距
$-notice-bar-icon-margin: 16rpx;

// 关闭按钮大小
$-notice-bar-close-size: 32rpx;
```

### 自定义样式示例

```vue
<template>
  <view class="demo">
    <wd-notice-bar
      text="自定义样式的通知栏"
      custom-class="custom-notice"
    />
  </view>
</template>

<style lang="scss">
// 自定义通知栏样式
.custom-notice {
  border-radius: 8rpx;
  margin: 0 24rpx;

  :deep(.wd-notice-bar__content) {
    font-weight: bold;
  }

  :deep(.wd-notice-bar__prefix) {
    animation: shake 0.5s ease-in-out infinite;
  }
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}
</style>
```

### 暗黑模式

组件内置暗黑模式支持,在暗黑模式下会自动应用对应样式:

```scss
// 暗黑模式下的样式
.wot-theme-dark {
  .wd-notice-bar {
    &--warning {
      color: $-dark-color;
      background-color: rgba($-notice-bar-warning-color, 0.15);
    }

    &--info {
      color: $-dark-color;
      background-color: rgba($-notice-bar-info-color, 0.15);
    }

    &--danger {
      color: $-dark-color;
      background-color: rgba($-notice-bar-danger-color, 0.15);
    }
  }
}
```

## 最佳实践

### 1. 合理设置滚动参数

根据文本长度和重要程度调整滚动速度和延迟:

```vue
<script lang="ts" setup>
// ✅ 重要通知:较慢速度,确保用户能看清
<wd-notice-bar
  text="重要:系统将于今晚进行维护"
  :speed="60"
  :delay="2"
/>

// ✅ 一般通知:默认速度
<wd-notice-bar
  text="普通通知内容"
  :speed="100"
/>

// ❌ 避免速度过快,用户无法阅读
<wd-notice-bar
  text="重要信息"
  :speed="300"  // 太快了
/>
</script>
```

### 2. 垂直轮播的最佳时机

```vue
<script lang="ts" setup>
// ✅ 适合垂直轮播的场景
// - 购买记录滚动
// - 中奖名单展示
// - 多条独立消息

// ✅ 适合水平滚动的场景
// - 单条长文本
// - 系统公告
// - 活动信息
</script>
```

### 3. 关闭行为处理

```vue
<script lang="ts" setup>
import { ref } from 'vue'

const showNotice = ref(true)

// ✅ 关闭后记录状态,避免重复显示
const handleClose = () => {
  showNotice.value = false

  // 记录到本地存储
  const closedNotices = uni.getStorageSync('closed_notices') || []
  closedNotices.push({
    id: currentNoticeId,
    time: Date.now()
  })
  uni.setStorageSync('closed_notices', closedNotices)
}

// ✅ 页面加载时检查是否已关闭
const checkNoticeStatus = () => {
  const closedNotices = uni.getStorageSync('closed_notices') || []
  const isClosed = closedNotices.some(n => n.id === currentNoticeId)
  showNotice.value = !isClosed
}
</script>
```

### 4. 点击事件处理

```vue
<script lang="ts" setup>
// ✅ 根据点击的通知索引跳转到对应页面
const handleClick = (result: { index: number; text: string }) => {
  const routes = [
    '/pages/notice/detail?id=1',
    '/pages/notice/detail?id=2',
    '/pages/notice/detail?id=3'
  ]

  if (routes[result.index]) {
    uni.navigateTo({ url: routes[result.index] })
  }
}

// ✅ 或者传递完整数据
const notices = ref([
  { id: 1, text: '通知1', url: '/pages/a' },
  { id: 2, text: '通知2', url: '/pages/b' }
])

const handleClick = (result: { index: number }) => {
  const notice = notices.value[result.index]
  if (notice?.url) {
    uni.navigateTo({ url: notice.url })
  }
}
</script>
```

### 5. 动态内容更新

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const noticeText = ref<string[]>([])

// ✅ 异步加载通知内容
onMounted(async () => {
  try {
    const res = await fetchNotices()
    noticeText.value = res.data.map(item => item.content)
  } catch (error) {
    // 加载失败时显示默认内容
    noticeText.value = ['暂无通知']
  }
})

// ✅ 支持实时更新
const refreshNotices = async () => {
  const res = await fetchNotices()
  noticeText.value = res.data.map(item => item.content)
}
</script>
```

## 常见问题

### 1. 文本不滚动

**问题原因:**
- 文本内容未超出容器宽度
- `scrollable` 设置为 `false`
- 开启了 `wrapable` 多行模式

**解决方案:**

```vue
<!-- ✅ 确保 scrollable 为 true -->
<wd-notice-bar
  text="这是一段足够长的文本内容,需要超出容器宽度才会滚动..."
  :scrollable="true"
/>

<!-- ✅ 如果需要强制滚动短文本,可以考虑添加空格 -->
<wd-notice-bar
  :text="text + '    '.repeat(10)"
/>
```

### 2. 垂直轮播不切换

**问题原因:**
- `text` 不是数组
- `direction` 未设置为 `'vertical'`
- `delay` 设置过长

**解决方案:**

```vue
<script lang="ts" setup>
// ✅ 确保 text 是数组
const textList = ref(['通知1', '通知2', '通知3'])
</script>

<template>
  <!-- ✅ 设置 direction 为 vertical -->
  <wd-notice-bar
    :text="textList"
    direction="vertical"
    :delay="3"
  />
</template>
```

### 3. 自定义颜色不生效

**问题原因:**
- `type` 类型的样式优先级较高
- CSS 变量覆盖问题

**解决方案:**

```vue
<!-- ✅ 设置 type 为空字符串,使用纯自定义颜色 -->
<wd-notice-bar
  type=""
  color="#722ed1"
  background-color="#f9f0ff"
  text="自定义颜色通知"
/>

<!-- 或者使用 !important -->
<style lang="scss">
.custom-notice {
  :deep(.wd-notice-bar__content) {
    color: #722ed1 !important;
  }
}
</style>
```

### 4. 页面切换后动画异常

**问题原因:**
- 页面切换时动画未正确暂停/恢复
- 组件生命周期处理不当

**解决方案:**

```vue
<script lang="ts" setup>
import { ref } from 'vue'

interface NoticeBarInstance {
  reset: () => void
}

const noticeBarRef = ref<NoticeBarInstance | null>(null)

// ✅ 页面显示时重置动画
onShow(() => {
  noticeBarRef.value?.reset()
})
</script>

<template>
  <wd-notice-bar ref="noticeBarRef" text="通知内容" />
</template>
```

### 5. 插槽内容不显示

**问题原因:**
- 插槽名称错误
- 同时使用了 `text` 和默认插槽

**解决方案:**

```vue
<!-- ✅ 使用默认插槽时不要设置 text -->
<wd-notice-bar>
  <view class="custom-content">自定义内容</view>
</wd-notice-bar>

<!-- ✅ 正确使用具名插槽 -->
<wd-notice-bar text="通知内容">
  <template #prefix>
    <wd-icon name="bell" />
  </template>
  <template #suffix>
    <text>更多</text>
  </template>
</wd-notice-bar>
```

### 6. 点击事件不触发

**问题原因:**
- 点击了插槽内容但未冒泡
- 关闭按钮拦截了事件

**解决方案:**

```vue
<!-- ✅ 插槽内容使用 @click.stop 阻止冒泡时,需要手动处理 -->
<wd-notice-bar @click="handleNoticeClick">
  <template #suffix>
    <!-- 按钮点击单独处理 -->
    <view @click.stop="handleBtnClick">按钮</view>
  </template>
</wd-notice-bar>

<script lang="ts" setup>
const handleNoticeClick = (result) => {
  // 点击通知栏主体
  console.log('点击通知栏', result)
}

const handleBtnClick = () => {
  // 点击按钮
  console.log('点击按钮')
}
</script>
```

## 注意事项

### 1. 性能优化

- 避免在通知栏中放置复杂的动画或大量 DOM 元素
- 垂直轮播时,建议控制文本数组长度在 10 条以内
- 页面隐藏时组件会自动暂停动画,无需手动处理

### 2. 无障碍

- 重要通知建议同时提供其他提示方式(如弹窗)
- 滚动速度不宜过快,确保用户能够阅读
- 考虑为视障用户提供语音播报

### 3. 多端兼容

- 组件在各端表现一致
- 小程序端注意 CSS 动画性能
- H5 端注意浏览器兼容性

### 4. 使用建议

- 通知栏一般放置在页面顶部
- 同一页面避免出现多个通知栏
- 重要通知使用 `closable` 让用户可以关闭
- 临时性通知考虑使用 Notify 组件替代
