---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/countDown
---

# CountDown 倒计时

## 介绍

CountDown 倒计时组件用于实时展示倒计时数值,支持毫秒精度。适用于秒杀活动、验证码倒计时、限时优惠、考试计时、抢购活动等需要精确时间控制的场景。

**核心特性:**

- **毫秒精度** - 支持毫秒级别的倒计时显示,适用于高精度计时场景
- **格式化输出** - 支持自定义时间格式,DD(天)/HH(时)/mm(分)/ss(秒)/SSS(毫秒)灵活组合
- **手动控制** - 提供 start(开始)、pause(暂停)、reset(重置) 三个控制方法
- **自定义渲染** - 支持插槽自定义倒计时样式,实现个性化展示效果
- **自动开始** - 支持配置是否自动开始倒计时
- **事件回调** - 提供 change(变化) 和 finish(结束) 事件监听
- **跨平台兼容** - 基于 requestAnimationFrame 和 setTimeout 兼容 H5 和小程序平台
- **暗黑模式** - 支持暗黑主题适配

**技术实现:**

组件基于 `useCountDown` 组合式函数实现,内部使用 `useRaf` 管理动画帧:
- H5 环境使用原生 `requestAnimationFrame` 实现高精度计时
- 小程序环境使用 `setTimeout` 以 30fps 模拟动画帧
- 组件卸载时自动清理定时器,防止内存泄漏

## 基本用法

### 基础用法

通过 `time` 属性设置倒计时时长,单位为毫秒。组件默认会自动开始倒计时。

```vue
<template>
  <view class="demo">
    <!-- 60秒倒计时 -->
    <wd-count-down :time="60000" />

    <!-- 30分钟倒计时 -->
    <wd-count-down :time="30 * 60 * 1000" />

    <!-- 2小时倒计时 -->
    <wd-count-down :time="2 * 60 * 60 * 1000" />
  </view>
</template>
```

**使用说明:**
- `time` 属性接收毫秒值,1秒 = 1000毫秒
- 默认格式为 `HH:mm:ss`,显示时:分:秒
- 组件会自动开始倒计时,无需手动调用 start 方法

### 自定义格式

通过 `format` 属性设置时间格式。支持的格式占位符包括 DD(天)、HH(时)、mm(分)、ss(秒)、S/SS/SSS(毫秒)。

```vue
<template>
  <view class="demo">
    <!-- 显示天数 -->
    <wd-count-down :time="time" format="DD 天 HH 时 mm 分 ss 秒" />

    <!-- 只显示时分秒 -->
    <wd-count-down :time="time" format="HH:mm:ss" />

    <!-- 只显示分秒 -->
    <wd-count-down :time="time" format="mm 分 ss 秒" />

    <!-- 只显示秒数 -->
    <wd-count-down :time="60000" format="ss 秒" />

    <!-- 显示毫秒(需要开启 millisecond) -->
    <wd-count-down :time="time" format="HH:mm:ss.SSS" millisecond />

    <!-- 显示两位毫秒 -->
    <wd-count-down :time="time" format="mm:ss.SS" millisecond />
  </view>
</template>

<script lang="ts" setup>
// 30小时
const time = 30 * 60 * 60 * 1000
</script>
```

**格式说明:**
| 占位符 | 说明 | 示例 |
|--------|------|------|
| DD | 天数(补零) | 01, 02, 10 |
| HH | 小时(补零) | 00, 01, 23 |
| mm | 分钟(补零) | 00, 01, 59 |
| ss | 秒数(补零) | 00, 01, 59 |
| S | 毫秒(1位) | 0-9 |
| SS | 毫秒(2位) | 00-99 |
| SSS | 毫秒(3位) | 000-999 |

**格式化规则:**
- 如果格式中不包含 DD,天数会被转换为小时累加
- 如果格式中不包含 HH,小时会被转换为分钟累加
- 如果格式中不包含 mm,分钟会被转换为秒数累加
- 如果格式中不包含 ss,秒数会被转换为毫秒累加

### 毫秒级渲染

设置 `millisecond` 属性开启毫秒级渲染。开启后,倒计时会以更高频率更新(H5 环境约 60fps,小程序约 30fps)。

```vue
<template>
  <view class="demo">
    <!-- 毫秒精度显示 -->
    <wd-count-down :time="60000" format="ss:SSS" millisecond />

    <!-- 带小数点的毫秒显示 -->
    <wd-count-down :time="60000" format="ss.SS" millisecond />

    <!-- 完整时间带毫秒 -->
    <wd-count-down :time="3600000" format="HH:mm:ss.SSS" millisecond />
  </view>
</template>
```

**注意事项:**
- 毫秒级渲染会增加性能开销,仅在需要时开启
- 不开启 `millisecond` 时,即使格式中包含毫秒占位符也不会实时更新
- H5 环境使用 requestAnimationFrame,更新频率约 60fps
- 小程序环境使用 setTimeout 模拟,更新频率约 30fps

### 手动控制

通过 ref 获取组件实例,调用 start、pause、reset 方法手动控制倒计时。

```vue
<template>
  <view class="demo">
    <wd-count-down
      ref="countDownRef"
      :time="60000"
      :auto-start="false"
      format="mm:ss"
      @finish="handleFinish"
    />
    <view class="controls">
      <wd-button size="small" @click="start">开始</wd-button>
      <wd-button size="small" @click="pause">暂停</wd-button>
      <wd-button size="small" @click="reset">重置</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CountDownInstance } from '@/wd'

const countDownRef = ref<CountDownInstance>()

// 开始倒计时
const start = () => {
  countDownRef.value?.start()
}

// 暂停倒计时
const pause = () => {
  countDownRef.value?.pause()
}

// 重置倒计时(会根据 auto-start 决定是否自动开始)
const reset = () => {
  countDownRef.value?.reset()
}

// 倒计时结束回调
const handleFinish = () => {
  uni.showToast({ title: '倒计时结束', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.controls {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}
</style>
```

**方法说明:**
- `start()`: 开始倒计时,如果已在运行则无效果
- `pause()`: 暂停倒计时,保持当前剩余时间
- `reset()`: 重置倒计时到初始时间,若 `auto-start` 为 true 则自动开始

### 自定义样式

通过默认插槽自定义倒计时样式。插槽提供 `current` 参数,包含当前时间数据。

```vue
<template>
  <view class="demo">
    <wd-count-down :time="time">
      <template #default="{ current }">
        <view class="custom-count-down">
          <view class="time-block">{{ padZero(current.hours) }}</view>
          <view class="time-colon">:</view>
          <view class="time-block">{{ padZero(current.minutes) }}</view>
          <view class="time-colon">:</view>
          <view class="time-block">{{ padZero(current.seconds) }}</view>
        </view>
      </template>
    </wd-count-down>
  </view>
</template>

<script lang="ts" setup>
// 30分钟
const time = 30 * 60 * 1000

// 补零函数
const padZero = (num: number, length = 2) => {
  return String(num).padStart(length, '0')
}
</script>

<style lang="scss" scoped>
.custom-count-down {
  display: flex;
  align-items: center;
}

.time-block {
  min-width: 48rpx;
  padding: 8rpx 12rpx;
  background: linear-gradient(135deg, #ee0a24 0%, #ff6b6b 100%);
  color: #fff;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
}

.time-colon {
  padding: 0 8rpx;
  color: #ee0a24;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
```

**current 对象属性:**
| 属性 | 说明 | 类型 |
|------|------|------|
| days | 天数 | `number` |
| hours | 小时数 | `number` |
| minutes | 分钟数 | `number` |
| seconds | 秒数 | `number` |
| milliseconds | 毫秒数 | `number` |
| total | 总剩余毫秒数 | `number` |

### 监听变化

通过 `change` 事件监听倒计时变化,通过 `finish` 事件监听倒计时结束。

```vue
<template>
  <view class="demo">
    <wd-count-down
      :time="60000"
      @change="handleChange"
      @finish="handleFinish"
    />
    <view class="info">
      <text>剩余: {{ remainText }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TimeData } from '@/wd'

const remainText = ref('')

const handleChange = (current: TimeData) => {
  remainText.value = `${current.minutes}分${current.seconds}秒`
  console.log('剩余时间:', current)
}

const handleFinish = () => {
  remainText.value = '已结束'
  console.log('倒计时结束')
  uni.showToast({ title: '倒计时结束', icon: 'none' })
}
</script>
```

**事件触发频率:**
- 普通模式(未开启 millisecond):每秒触发一次 change 事件
- 毫秒模式(开启 millisecond):H5 约 60次/秒,小程序约 30次/秒

## 高级用法

### 秒杀活动倒计时

实现电商秒杀活动的倒计时展示,支持自定义样式和结束提示。

```vue
<template>
  <view class="seckill-container">
    <view class="seckill-header">
      <text class="seckill-title">⚡ 限时秒杀</text>
      <text class="seckill-subtitle">距离活动结束还剩</text>
    </view>

    <wd-count-down :time="activityTime" @finish="handleFinish">
      <template #default="{ current }">
        <view class="seckill-time">
          <view class="time-item">
            <view class="time-value">{{ padZero(current.hours) }}</view>
            <view class="time-label">时</view>
          </view>
          <view class="time-separator">:</view>
          <view class="time-item">
            <view class="time-value">{{ padZero(current.minutes) }}</view>
            <view class="time-label">分</view>
          </view>
          <view class="time-separator">:</view>
          <view class="time-item">
            <view class="time-value">{{ padZero(current.seconds) }}</view>
            <view class="time-label">秒</view>
          </view>
        </view>
      </template>
    </wd-count-down>

    <wd-button type="primary" block :disabled="finished">
      {{ finished ? '活动已结束' : '立即抢购' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 2小时后结束
const activityTime = ref(2 * 60 * 60 * 1000)
const finished = ref(false)

const padZero = (num: number) => String(num).padStart(2, '0')

const handleFinish = () => {
  finished.value = true
  uni.showToast({ title: '活动已结束', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.seckill-container {
  padding: 32rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee0a24 100%);
  border-radius: 16rpx;
}

.seckill-header {
  text-align: center;
  margin-bottom: 24rpx;
}

.seckill-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.seckill-subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.seckill-time {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24rpx;
}

.time-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-value {
  min-width: 64rpx;
  height: 64rpx;
  line-height: 64rpx;
  background: #fff;
  color: #ee0a24;
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  border-radius: 8rpx;
}

.time-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.time-separator {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin: 0 12rpx;
}
</style>
```

### 验证码倒计时按钮

实现发送验证码后的倒计时按钮,防止重复发送。

```vue
<template>
  <view class="code-container">
    <wd-input v-model="phone" placeholder="请输入手机号" />
    <wd-button
      size="small"
      :type="counting ? 'default' : 'primary'"
      :disabled="counting || !isValidPhone"
      @click="sendCode"
    >
      <template v-if="counting">
        <wd-count-down
          ref="countDownRef"
          :time="60000"
          format="ss"
          @finish="handleFinish"
        />
        <text>秒后重发</text>
      </template>
      <template v-else>获取验证码</template>
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { CountDownInstance } from '@/wd'

const phone = ref('')
const counting = ref(false)
const countDownRef = ref<CountDownInstance>()

// 验证手机号格式
const isValidPhone = computed(() => {
  return /^1[3-9]\d{9}$/.test(phone.value)
})

// 发送验证码
const sendCode = async () => {
  if (!isValidPhone.value) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    // 调用发送验证码接口
    // await sendSmsCode(phone.value)

    counting.value = true
    uni.showToast({ title: '验证码已发送', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '发送失败,请重试', icon: 'none' })
  }
}

// 倒计时结束
const handleFinish = () => {
  counting.value = false
}
</script>

<style lang="scss" scoped>
.code-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
</style>
```

### 服务端时间同步

从服务端获取结束时间,计算倒计时时长,确保多端时间一致。

```vue
<template>
  <view class="demo">
    <wd-count-down
      v-if="remainTime > 0"
      :time="remainTime"
      format="DD天HH时mm分ss秒"
      @finish="handleFinish"
    />
    <view v-else class="expired">活动已结束</view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const remainTime = ref(0)

// 从服务端获取活动结束时间
const fetchActivityEndTime = async () => {
  try {
    // 模拟接口返回
    const response = await new Promise<{ endTime: number; serverTime: number }>(
      (resolve) => {
        setTimeout(() => {
          resolve({
            endTime: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2天后
            serverTime: Date.now(),
          })
        }, 100)
      }
    )

    // 计算本地与服务端的时间差
    const timeDiff = Date.now() - response.serverTime

    // 计算剩余时间(考虑时间差)
    remainTime.value = response.endTime - Date.now() + timeDiff

    if (remainTime.value < 0) {
      remainTime.value = 0
    }
  } catch (error) {
    console.error('获取活动时间失败', error)
  }
}

const handleFinish = () => {
  uni.showToast({ title: '活动已结束', icon: 'none' })
}

onMounted(() => {
  fetchActivityEndTime()
})
</script>
```

### 多个倒计时列表

在列表中使用多个倒计时,如秒杀商品列表。

```vue
<template>
  <view class="product-list">
    <view
      v-for="item in products"
      :key="item.id"
      class="product-item"
    >
      <image :src="item.image" class="product-image" />
      <view class="product-info">
        <text class="product-name">{{ item.name }}</text>
        <view class="product-price">
          <text class="price-current">¥{{ item.seckillPrice }}</text>
          <text class="price-original">¥{{ item.originalPrice }}</text>
        </view>
        <wd-count-down
          :time="item.remainTime"
          format="mm:ss"
          @finish="handleItemFinish(item)"
        >
          <template #default="{ current }">
            <view class="countdown-wrapper">
              <text class="countdown-label">剩余</text>
              <text class="countdown-time">
                {{ padZero(current.minutes) }}:{{ padZero(current.seconds) }}
              </text>
            </view>
          </template>
        </wd-count-down>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Product {
  id: number
  name: string
  image: string
  seckillPrice: number
  originalPrice: number
  remainTime: number
  finished?: boolean
}

const products = ref<Product[]>([
  {
    id: 1,
    name: '商品A',
    image: '/static/product1.png',
    seckillPrice: 99,
    originalPrice: 199,
    remainTime: 30 * 60 * 1000,
  },
  {
    id: 2,
    name: '商品B',
    image: '/static/product2.png',
    seckillPrice: 149,
    originalPrice: 299,
    remainTime: 45 * 60 * 1000,
  },
  {
    id: 3,
    name: '商品C',
    image: '/static/product3.png',
    seckillPrice: 199,
    originalPrice: 399,
    remainTime: 60 * 60 * 1000,
  },
])

const padZero = (num: number) => String(num).padStart(2, '0')

const handleItemFinish = (item: Product) => {
  item.finished = true
  console.log(`${item.name} 秒杀已结束`)
}
</script>
```

### 考试倒计时

实现考试场景的倒计时,包含时间预警功能。

```vue
<template>
  <view class="exam-timer" :class="{ warning: isWarning, danger: isDanger }">
    <view class="timer-icon">⏱️</view>
    <wd-count-down
      ref="countDownRef"
      :time="examTime"
      format="HH:mm:ss"
      @change="handleChange"
      @finish="handleFinish"
    />
    <view v-if="isWarning" class="timer-tip">时间不多了!</view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { TimeData } from '@/wd'

// 考试时间: 2小时
const examTime = 2 * 60 * 60 * 1000
const remainSeconds = ref(examTime / 1000)

// 剩余10分钟预警
const isWarning = computed(() => {
  return remainSeconds.value <= 10 * 60 && remainSeconds.value > 5 * 60
})

// 剩余5分钟危险
const isDanger = computed(() => {
  return remainSeconds.value <= 5 * 60
})

const handleChange = (current: TimeData) => {
  remainSeconds.value = current.total / 1000
}

const handleFinish = () => {
  uni.showModal({
    title: '考试结束',
    content: '时间到,系统将自动提交您的答卷',
    showCancel: false,
    success: () => {
      // 自动提交答卷
    },
  })
}
</script>

<style lang="scss" scoped>
.exam-timer {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  transition: all 0.3s;

  &.warning {
    background: #fff7e6;
    color: #fa8c16;
  }

  &.danger {
    background: #fff2f0;
    color: #ff4d4f;
    animation: blink 1s infinite;
  }
}

.timer-icon {
  margin-right: 8rpx;
}

.timer-tip {
  margin-left: 16rpx;
  font-size: 24rpx;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| time | 倒计时时长,单位毫秒 | `number` | - |
| format | 时间格式,支持 DD/HH/mm/ss/S/SS/SSS | `string` | `HH:mm:ss` |
| millisecond | 是否开启毫秒级渲染 | `boolean` | `false` |
| auto-start | 是否自动开始倒计时 | `boolean` | `true` |
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

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| start | 开始倒计时 | - | `void` |
| pause | 暂停倒计时 | - | `void` |
| reset | 重置倒计时,若 auto-start 为 true 则自动开始 | - | `void` |

### 类型定义

```typescript
/**
 * 时间数据接口
 */
interface TimeData {
  /** 总剩余毫秒数 */
  total: number
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

/**
 * 倒计时组件属性接口
 */
interface WdCountDownProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 倒计时时长,单位毫秒 */
  time: number
  /** 是否开启毫秒 */
  millisecond?: boolean
  /** 格式化时间 */
  format?: string
  /** 是否自动开始 */
  autoStart?: boolean
}

/**
 * 倒计时组件事件接口
 */
interface WdCountDownEmits {
  /** 倒计时变化时触发 */
  change: [current: TimeData]
  /** 倒计时结束时触发 */
  finish: []
}

/**
 * 倒计时组件暴露方法接口
 */
interface WdCountDownExpose {
  /** 开始倒计时 */
  start: () => void
  /** 暂停倒计时 */
  pause: () => void
  /** 重设倒计时,若 auto-start 为 true,重设后会自动开始倒计时 */
  reset: () => void
}

/**
 * 倒计时组件实例类型
 */
type CountDownInstance = ComponentPublicInstance<WdCountDownProps, WdCountDownExpose>
```

### useCountDown 组合式函数

组件内部使用的倒计时组合式函数,也可以独立使用:

```typescript
import { useCountDown } from '@/wd/components/composables/useCountDown'

interface UseCountDownOptions {
  /** 倒计时总时间,单位毫秒 */
  time: number
  /** 是否开启毫秒级倒计时 */
  millisecond?: boolean
  /** 倒计时变化时的回调 */
  onChange?: (current: CurrentTime) => void
  /** 倒计时结束时的回调 */
  onFinish?: () => void
}

// 使用示例
const { start, pause, reset, current } = useCountDown({
  time: 60 * 1000,
  millisecond: true,
  onChange: (current) => console.log('剩余:', current.seconds),
  onFinish: () => console.log('结束'),
})
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wot-count-down-text-color | 文字颜色 | `$-color-gray-8` (#333333) |
| --wot-count-down-font-size | 字体大小 | `$-fs-content` (28rpx) |
| --wot-count-down-line-height | 行高 | `40rpx` |

### 自定义样式示例

```vue
<template>
  <view class="custom-countdown">
    <wd-count-down :time="60000" />
  </view>
</template>

<style lang="scss" scoped>
.custom-countdown {
  --wot-count-down-text-color: #1890ff;
  --wot-count-down-font-size: 36rpx;
  --wot-count-down-line-height: 48rpx;
}
</style>
```

### 暗黑模式

组件内置暗黑模式支持。当父元素或全局应用 `wot-theme-dark` 类名时,文字颜色会自动切换为暗黑模式颜色。

```vue
<template>
  <view class="wot-theme-dark">
    <wd-count-down :time="60000" />
  </view>
</template>
```

## 最佳实践

### 1. 选择合适的精度

```typescript
// ✅ 普通场景使用秒级精度(默认)
<wd-count-down :time="60000" />

// ✅ 需要显示毫秒时才开启毫秒精度
<wd-count-down :time="60000" format="ss.SSS" millisecond />

// ❌ 不需要毫秒显示时不要开启 millisecond
<wd-count-down :time="60000" format="mm:ss" millisecond />
```

### 2. 正确处理组件实例

```typescript
// ✅ 使用可选链调用方法
countDownRef.value?.start()
countDownRef.value?.pause()

// ✅ 定义正确的类型
import type { CountDownInstance } from '@/wd'
const countDownRef = ref<CountDownInstance>()

// ❌ 不检查实例是否存在
countDownRef.value.start() // 可能报错
```

### 3. 服务端时间同步

```typescript
// ✅ 使用服务端返回的结束时间计算
const serverEndTime = response.endTime
const serverNow = response.serverTime
const localNow = Date.now()
const timeDiff = localNow - serverNow
const remainTime = serverEndTime - localNow + timeDiff

// ❌ 直接使用本地时间
const remainTime = serverEndTime - Date.now() // 可能不准确
```

### 4. 页面切换处理

```typescript
// ✅ 使用服务端时间或持久化时间
onShow(() => {
  // 重新计算剩余时间
  const endTime = uni.getStorageSync('countdownEndTime')
  if (endTime) {
    const remain = endTime - Date.now()
    if (remain > 0) {
      time.value = remain
    }
  }
})

onHide(() => {
  // 保存结束时间
  const endTime = Date.now() + countDownRef.value?.current.total
  uni.setStorageSync('countdownEndTime', endTime)
})
```

### 5. 避免频繁更新状态

```typescript
// ✅ 只在必要时更新 UI
const handleChange = (current: TimeData) => {
  // 只在特定时间点更新
  if (current.seconds % 10 === 0) {
    updateProgress(current)
  }
}

// ❌ 每次变化都更新大量 UI
const handleChange = (current: TimeData) => {
  heavyUIUpdate(current) // 性能问题
}
```

## 常见问题

### 1. 倒计时不准确?

**问题描述**: 倒计时显示的时间与实际时间有偏差。

**解决方案**:

```typescript
// 1. 确保使用毫秒作为时间单位
const time = 60 * 1000 // 60秒,不是60

// 2. 如需更高精度,开启 millisecond
<wd-count-down :time="time" millisecond />

// 3. 使用服务端时间同步
const remainTime = serverEndTime - serverNow
```

### 2. 页面切换后倒计时不准确?

**问题描述**: 从其他页面返回后,倒计时显示不正确。

**解决方案**:

```typescript
import { onShow } from '@dcloudio/uni-app'

// 保存目标结束时间
const endTime = ref(0)

onShow(() => {
  // 每次显示页面时重新计算剩余时间
  if (endTime.value > 0) {
    const remain = endTime.value - Date.now()
    if (remain > 0) {
      time.value = remain
      countDownRef.value?.reset()
    }
  }
})

// 开始时记录结束时间
const startCountdown = () => {
  endTime.value = Date.now() + initialTime
  time.value = initialTime
}
```

### 3. 如何实现服务端时间同步?

**问题描述**: 需要确保多端倒计时一致。

**解决方案**:

```typescript
// 从服务端获取结束时间和服务器当前时间
const { endTime, serverTime } = await api.getActivityTime()

// 计算本地与服务端的时间差
const timeDiff = Date.now() - serverTime

// 计算本地应显示的剩余时间
const localRemainTime = endTime - Date.now() + timeDiff
```

### 4. 如何在列表中使用多个倒计时?

**问题描述**: 列表中每个项目有独立的倒计时。

**解决方案**:

```vue
<template>
  <view v-for="item in list" :key="item.id">
    <wd-count-down
      :time="item.remainTime"
      @finish="() => handleFinish(item.id)"
    />
  </view>
</template>

<script setup>
// 每个列表项有独立的 remainTime
// 不需要为每个倒计时创建 ref,使用事件回调处理
</script>
```

### 5. 倒计时结束后如何自动刷新?

**问题描述**: 倒计时结束后需要刷新页面或数据。

**解决方案**:

```typescript
const handleFinish = async () => {
  // 显示提示
  uni.showToast({ title: '活动已结束', icon: 'none' })

  // 延迟后刷新数据
  setTimeout(async () => {
    await refreshData()
  }, 1000)

  // 或者返回上一页
  // uni.navigateBack()
}
```

### 6. TypeScript 类型提示不正确?

**问题描述**: 使用 ref 获取组件实例时没有类型提示。

**解决方案**:

```typescript
import type { CountDownInstance } from '@/wd'

// 正确定义类型
const countDownRef = ref<CountDownInstance>()

// 现在有正确的类型提示
countDownRef.value?.start()
countDownRef.value?.pause()
countDownRef.value?.reset()
```

## 总结

CountDown 倒计时组件核心使用要点:

1. **时间单位**: `time` 属性使用毫秒,1秒 = 1000毫秒
2. **格式化**: 使用 `format` 属性自定义显示格式,支持 DD/HH/mm/ss/SSS
3. **毫秒精度**: 需要显示毫秒时,同时设置 `millisecond` 和对应的格式
4. **手动控制**: 通过 ref 获取实例,调用 start/pause/reset 方法
5. **自定义样式**: 使用默认插槽和 `current` 参数实现个性化展示
6. **事件监听**: 使用 `change` 监听变化,`finish` 监听结束
7. **时间同步**: 使用服务端时间确保多端一致
8. **暗黑模式**: 自动适配暗黑主题
