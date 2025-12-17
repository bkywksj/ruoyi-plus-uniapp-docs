---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/countDown
---

# CountDown 倒计时

## 介绍

CountDown 倒计时组件用于实时展示倒计时数值,支持毫秒精度。适用于秒杀活动、验证码倒计时、限时优惠等场景。

**核心特性:**

- **毫秒精度** - 支持毫秒级别的倒计时显示
- **格式化输出** - 支持自定义时间格式
- **手动控制** - 提供开始、暂停、重置方法
- **自定义渲染** - 支持插槽自定义倒计时样式

## 基本用法

### 基础用法

通过 `time` 属性设置倒计时时长(毫秒)。

```vue
<template>
  <wd-count-down :time="60000" />
</template>
```

### 自定义格式

通过 `format` 属性设置时间格式。

```vue
<template>
  <!-- 显示天数 -->
  <wd-count-down :time="time" format="DD 天 HH:mm:ss" />

  <!-- 只显示分秒 -->
  <wd-count-down :time="time" format="mm:ss" />

  <!-- 显示毫秒 -->
  <wd-count-down :time="time" format="HH:mm:ss:SSS" millisecond />
</template>

<script lang="ts" setup>
const time = 30 * 60 * 60 * 1000 // 30小时
</script>
```

### 毫秒级渲染

设置 `millisecond` 属性开启毫秒级渲染。

```vue
<template>
  <wd-count-down :time="60000" format="ss:SSS" millisecond />
</template>
```

### 手动控制

通过 ref 获取组件实例,调用 start、pause、reset 方法。

```vue
<template>
  <wd-count-down
    ref="countDownRef"
    :time="60000"
    :auto-start="false"
    @finish="handleFinish"
  />
  <view class="controls">
    <wd-button @click="start">开始</wd-button>
    <wd-button @click="pause">暂停</wd-button>
    <wd-button @click="reset">重置</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const countDownRef = ref()

const start = () => countDownRef.value?.start()
const pause = () => countDownRef.value?.pause()
const reset = () => countDownRef.value?.reset()

const handleFinish = () => {
  uni.showToast({ title: '倒计时结束', icon: 'none' })
}
</script>
```

### 自定义样式

通过插槽自定义倒计时样式。

```vue
<template>
  <wd-count-down :time="time">
    <template #default="{ current }">
      <view class="custom-count-down">
        <view class="block">{{ current.hours }}</view>
        <view class="colon">:</view>
        <view class="block">{{ current.minutes }}</view>
        <view class="colon">:</view>
        <view class="block">{{ current.seconds }}</view>
      </view>
    </template>
  </wd-count-down>
</template>

<script lang="ts" setup>
const time = 30 * 60 * 1000 // 30分钟
</script>

<style lang="scss" scoped>
.custom-count-down {
  display: flex;
  align-items: center;
}
.block {
  padding: 8rpx 16rpx;
  background: #ee0a24;
  color: #fff;
  border-radius: 8rpx;
  font-size: 32rpx;
}
.colon {
  padding: 0 8rpx;
  color: #ee0a24;
}
</style>
```

### 监听变化

通过 `change` 事件监听倒计时变化。

```vue
<template>
  <wd-count-down :time="60000" @change="handleChange" @finish="handleFinish" />
</template>

<script lang="ts" setup>
const handleChange = (current) => {
  console.log('剩余时间:', current)
}

const handleFinish = () => {
  console.log('倒计时结束')
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| time | 倒计时时长(毫秒) | `number` | - |
| format | 时间格式 | `string` | `HH:mm:ss` |
| millisecond | 是否开启毫秒级渲染 | `boolean` | `false` |
| auto-start | 是否自动开始 | `boolean` | `true` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 倒计时变化时触发 | `current: TimeData` |
| finish | 倒计时结束时触发 | - |

### Slots

| 名称 | 说明 | 参数 |
|------|------|------|
| default | 自定义内容 | `{ current: TimeData }` |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| start | 开始倒计时 | - | - |
| pause | 暂停倒计时 | - | - |
| reset | 重置倒计时 | - | - |

### 类型定义

```typescript
/**
 * 时间数据
 */
interface TimeData {
  /** 天数 */
  days: number
  /** 小时数 */
  hours: number
  /** 分钟数 */
  minutes: number
  /** 秒数 */
  seconds: number
  /** 毫秒数 */
  milliseconds: number
}
```

### 格式说明

| 占位符 | 说明 |
|--------|------|
| DD | 天数 |
| HH | 小时(补零) |
| mm | 分钟(补零) |
| ss | 秒数(补零) |
| S | 毫秒(1位) |
| SS | 毫秒(2位) |
| SSS | 毫秒(3位) |

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-count-down-text-color | 文字颜色 | `#333333` |
| --wd-count-down-font-size | 字体大小 | `28rpx` |
| --wd-count-down-line-height | 行高 | `40rpx` |

## 最佳实践

### 1. 秒杀活动

```vue
<template>
  <view class="seckill">
    <view class="seckill-title">距离活动结束还剩</view>
    <wd-count-down :time="activityTime" @finish="handleFinish">
      <template #default="{ current }">
        <view class="seckill-time">
          <view class="time-block">{{ padZero(current.hours) }}</view>
          <text class="time-colon">:</text>
          <view class="time-block">{{ padZero(current.minutes) }}</view>
          <text class="time-colon">:</text>
          <view class="time-block">{{ padZero(current.seconds) }}</view>
        </view>
      </template>
    </wd-count-down>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activityTime = ref(2 * 60 * 60 * 1000) // 2小时

const padZero = (num: number) => String(num).padStart(2, '0')

const handleFinish = () => {
  uni.showToast({ title: '活动已结束', icon: 'none' })
}
</script>
```

### 2. 验证码倒计时

```vue
<template>
  <wd-button
    :disabled="counting"
    @click="sendCode"
  >
    <template v-if="counting">
      <wd-count-down
        ref="countDownRef"
        :time="60000"
        format="ss"
        @finish="counting = false"
      />
      <text>秒后重发</text>
    </template>
    <template v-else>获取验证码</template>
  </wd-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const counting = ref(false)
const countDownRef = ref()

const sendCode = () => {
  // 发送验证码
  counting.value = true
}
</script>
```

## 常见问题

### 1. 倒计时不准确?

确保使用毫秒作为时间单位。如果需要更高精度,设置 `millisecond` 为 `true`。

### 2. 如何实现服务端时间同步?

从服务端获取结束时间戳,计算与当前时间的差值:

```typescript
const serverEndTime = 1700000000000 // 服务端结束时间戳
const time = serverEndTime - Date.now()
```

### 3. 页面切换后倒计时不准确?

组件内部使用 requestAnimationFrame,在页面隐藏时会暂停。建议在 onShow 时重新计算剩余时间。
