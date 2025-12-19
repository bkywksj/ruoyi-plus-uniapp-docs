---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/circle
---

# Circle 环形进度条

## 介绍

Circle 环形进度条是一个基于 Canvas 绑制的圆环形进度展示组件，支持进度渐变动画、渐变色、自定义样式等特性。适用于展示任务进度、文件上传进度、评分、技能图谱、仪表盘等场景。

**核心特性:**

- **Canvas 绑制** - 基于 Canvas API 实现高性能圆环绘制，支持微信小程序 Canvas 2D API
- **渐变动画** - 内置动画引擎，支持进度变化时的平滑过渡动画效果
- **渐变色** - 支持通过对象格式定义多色渐变进度条
- **自定义样式** - 支持设置尺寸、颜色、端点形状、线宽等多种样式
- **自定义内容** - 支持通过插槽自定义中心内容，满足复杂展示需求
- **双向绑定** - 支持 v-model 双向绑定进度值
- **跨平台兼容** - 完美适配 H5、微信小程序、支付宝小程序、App 等多端

**技术实现:**

组件采用 Canvas 绑制技术，核心绘制流程如下：

1. **坐标计算** - 将 rpx 单位转换为 px，计算圆心坐标和半径
2. **轨道绘制** - 绑制底层轨道圆环（layerColor）
3. **进度绘制** - 根据进度值计算弧度，绘制进度圆弧
4. **动画控制** - 通过定时器实现进度值的平滑过渡

关键数学计算：
- 起始角度：`-Math.PI / 2`（12点钟方向）
- 完整圆周：`2 * Math.PI`
- 进度弧度：`PERIMETER * (progress / 100)`
- 圆心坐标：`canvasSize / 2`
- 圆环半径：`position - strokeWidth / 2`

## 基本用法

### 基础用法

通过 `v-model` 绑定进度值，取值范围为 0-100。组件会自动将超出范围的值修正到有效区间。

```vue
<template>
  <view class="demo">
    <wd-circle v-model="progress" />
    <view class="controls">
      <wd-button size="small" @click="decrease">减少</wd-button>
      <wd-button size="small" type="primary" @click="increase">增加</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)

const increase = () => {
  progress.value = Math.min(100, progress.value + 10)
}

const decrease = () => {
  progress.value = Math.max(0, progress.value - 10)
}
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}

.controls {
  display: flex;
  gap: 24rpx;
}
</style>
```

**使用说明:**
- 进度值范围为 0-100，超出范围会被自动修正
- 组件内部维护 `currentValue` 作为动画过渡值
- 当进度为 0 时，会渲染一个小圆点而非空白

### 自定义颜色

通过 `color` 设置进度条颜色，`layer-color` 设置轨道颜色。

```vue
<template>
  <view class="demo">
    <!-- 成功绿色 -->
    <wd-circle v-model="progress" color="#07c160" layer-color="#e8e8e8" />

    <!-- 警告橙色 -->
    <wd-circle v-model="progress" color="#ff976a" layer-color="#fff3e8" />

    <!-- 危险红色 -->
    <wd-circle v-model="progress" color="#ee0a24" layer-color="#ffeaea" />

    <!-- 主题蓝色 -->
    <wd-circle v-model="progress" color="#1989fa" layer-color="#e8f3ff" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 32rpx;
}
</style>
```

**颜色配置:**
- `color` - 进度条颜色，默认为 `#4d80f0`
- `layer-color` - 轨道颜色，默认为 `#EBEEF5`
- 建议轨道颜色使用进度条颜色的浅色变体

### 渐变色

`color` 属性支持传入对象格式来定义渐变色，键为百分比位置，值为对应颜色。

```vue
<template>
  <view class="demo">
    <!-- 橙红渐变 -->
    <wd-circle v-model="progress" :color="orangeGradient">
      <text class="progress-text">{{ progress }}%</text>
    </wd-circle>

    <!-- 蓝绿渐变 -->
    <wd-circle v-model="progress" :color="blueGradient">
      <text class="progress-text">{{ progress }}%</text>
    </wd-circle>

    <!-- 紫粉渐变 -->
    <wd-circle v-model="progress" :color="purpleGradient">
      <text class="progress-text">{{ progress }}%</text>
    </wd-circle>

    <!-- 多色彩虹渐变 -->
    <wd-circle v-model="progress" :color="rainbowGradient">
      <text class="progress-text">{{ progress }}%</text>
    </wd-circle>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)

// 橙红渐变
const orangeGradient = {
  '0%': '#ffd01e',
  '100%': '#ee0a24'
}

// 蓝绿渐变
const blueGradient = {
  '0%': '#1989fa',
  '100%': '#07c160'
}

// 紫粉渐变
const purpleGradient = {
  '0%': '#7232dd',
  '100%': '#ee0a24'
}

// 彩虹渐变
const rainbowGradient = {
  '0%': '#ff0000',
  '25%': '#ffff00',
  '50%': '#00ff00',
  '75%': '#00ffff',
  '100%': '#0000ff'
}
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 32rpx;
}

.progress-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
</style>
```

**渐变色原理:**

组件使用 Canvas 的 `createLinearGradient` 创建线性渐变：

```typescript
// 内部实现
const LinearColor = context.createLinearGradient(canvasSize, 0, 0, 0)
Object.keys(props.color)
  .sort((a, b) => parseFloat(a) - parseFloat(b))
  .map(key => LinearColor.addColorStop(
    parseFloat(key) / 100,
    props.color[key]
  ))
```

**使用技巧:**
- 渐变方向为从右到左（水平渐变）
- 百分比键会自动排序，无需按顺序定义
- 支持多个色标，实现复杂渐变效果

### 自定义尺寸

通过 `size` 设置圆环直径，单位为 rpx。

```vue
<template>
  <view class="demo">
    <wd-circle v-model="progress" :size="100">
      <text class="text-small">{{ progress }}%</text>
    </wd-circle>

    <wd-circle v-model="progress" :size="150">
      <text class="text-medium">{{ progress }}%</text>
    </wd-circle>

    <wd-circle v-model="progress" :size="200">
      <text class="text-large">{{ progress }}%</text>
    </wd-circle>

    <wd-circle v-model="progress" :size="280">
      <text class="text-xlarge">{{ progress }}%</text>
    </wd-circle>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 32rpx;
}

.text-small {
  font-size: 20rpx;
}

.text-medium {
  font-size: 24rpx;
}

.text-large {
  font-size: 32rpx;
}

.text-xlarge {
  font-size: 40rpx;
  font-weight: bold;
}
</style>
```

**尺寸计算:**

组件内部会根据平台进行不同的尺寸处理：

```typescript
// Canvas 实际尺寸计算
const canvasSize = computed(() => {
  let size = rpxToPx(props.size)
  // 支付宝小程序需要乘以像素比
  // #ifdef MP-ALIPAY
  size = size * pixelRatio.value
  // #endif
  return size
})
```

### 自定义宽度

通过 `stroke-width` 设置进度条宽度，单位为 rpx。

```vue
<template>
  <view class="demo">
    <!-- 细线条 -->
    <wd-circle v-model="progress" :stroke-width="6">
      <text>细</text>
    </wd-circle>

    <!-- 默认宽度 -->
    <wd-circle v-model="progress" :stroke-width="20">
      <text>中</text>
    </wd-circle>

    <!-- 粗线条 -->
    <wd-circle v-model="progress" :stroke-width="40">
      <text>粗</text>
    </wd-circle>

    <!-- 超粗线条 -->
    <wd-circle v-model="progress" :stroke-width="60">
      <text>超粗</text>
    </wd-circle>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 32rpx;
}
</style>
```

**注意事项:**
- 线宽过大可能导致中心区域过小
- 建议 `strokeWidth` 不超过 `size / 4`
- 圆环半径计算：`radius = (size / 2) - (strokeWidth / 2)`

### 端点形状

通过 `stroke-linecap` 设置进度条端点的形状。

```vue
<template>
  <view class="demo">
    <!-- 方形端点（直接截断） -->
    <view class="item">
      <wd-circle v-model="progress" stroke-linecap="butt" />
      <text class="label">butt</text>
    </view>

    <!-- 圆形端点（默认，圆润过渡） -->
    <view class="item">
      <wd-circle v-model="progress" stroke-linecap="round" />
      <text class="label">round</text>
    </view>

    <!-- 正方形端点（延伸半个线宽） -->
    <view class="item">
      <wd-circle v-model="progress" stroke-linecap="square" />
      <text class="label">square</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(50)
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  justify-content: space-around;
  gap: 32rpx;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.label {
  font-size: 24rpx;
  color: #666;
}
</style>
```

**端点形状说明:**

| 类型 | 说明 | 视觉效果 |
|------|------|----------|
| `butt` | 方形端点 | 直接在端点位置截断，无延伸 |
| `round` | 圆形端点 | 在端点位置添加半圆，视觉更圆润 |
| `square` | 正方形端点 | 在端点位置延伸半个线宽的正方形 |

### 显示文字

通过 `text` 属性设置中心显示的文字。

```vue
<template>
  <view class="demo">
    <!-- 显示百分比 -->
    <wd-circle v-model="progress" :text="`${progress}%`" />

    <!-- 显示进度状态 -->
    <wd-circle v-model="progress" :text="statusText" :color="statusColor" />

    <!-- 显示自定义文字 -->
    <wd-circle v-model="score" text="优秀" color="#07c160" />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const progress = ref(70)
const score = ref(90)

const statusText = computed(() => {
  if (progress.value >= 100) return '已完成'
  if (progress.value >= 50) return '进行中'
  return '待开始'
})

const statusColor = computed(() => {
  if (progress.value >= 100) return '#07c160'
  if (progress.value >= 50) return '#1989fa'
  return '#ee0a24'
})
</script>
```

**text 属性特点:**
- 简单文字展示时推荐使用
- 自动居中显示
- 颜色由 CSS 变量 `--wot-circle-text-color` 控制
- 复杂内容建议使用插槽

### 自定义内容

通过默认插槽自定义中心显示的内容，优先级高于 `text` 属性。

```vue
<template>
  <view class="demo">
    <!-- 评分展示 -->
    <wd-circle v-model="score" :color="scoreColor">
      <view class="score-content">
        <text class="value">{{ (score / 10).toFixed(1) }}</text>
        <text class="unit">分</text>
      </view>
    </wd-circle>

    <!-- 图标 + 文字 -->
    <wd-circle v-model="progress" color="#07c160">
      <view class="icon-content">
        <wd-icon name="check" size="48rpx" color="#07c160" />
        <text class="label">已完成</text>
      </view>
    </wd-circle>

    <!-- 多行内容 -->
    <wd-circle v-model="steps" :color="stepsColor">
      <view class="steps-content">
        <text class="value">{{ steps * 100 }}</text>
        <text class="label">今日步数</text>
        <text class="target">目标 10000</text>
      </view>
    </wd-circle>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const score = ref(85)
const progress = ref(100)
const steps = ref(68)

const scoreColor = computed(() => {
  const s = score.value / 10
  if (s >= 9) return '#07c160'
  if (s >= 7) return '#1989fa'
  if (s >= 6) return '#ff976a'
  return '#ee0a24'
})

const stepsColor = computed(() => {
  if (steps.value >= 100) return '#07c160'
  if (steps.value >= 60) return '#1989fa'
  return '#ff976a'
})
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 32rpx;
}

.score-content {
  display: flex;
  align-items: baseline;
  justify-content: center;

  .value {
    font-size: 56rpx;
    font-weight: bold;
    color: #333;
  }

  .unit {
    font-size: 24rpx;
    color: #666;
    margin-left: 4rpx;
  }
}

.icon-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  .label {
    font-size: 24rpx;
    color: #07c160;
  }
}

.steps-content {
  display: flex;
  flex-direction: column;
  align-items: center;

  .value {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }

  .label {
    font-size: 24rpx;
    color: #666;
    margin-top: 4rpx;
  }

  .target {
    font-size: 20rpx;
    color: #999;
  }
}
</style>
```

### 动画速度

通过 `speed` 设置动画速度，单位为 rate/s（每秒变化的进度值）。设置为 0 则无动画效果。

```vue
<template>
  <view class="demo">
    <!-- 无动画（瞬间变化） -->
    <view class="item">
      <wd-circle v-model="progress" :speed="0" />
      <text class="label">无动画</text>
    </view>

    <!-- 慢速动画 -->
    <view class="item">
      <wd-circle v-model="progress" :speed="20" />
      <text class="label">慢速 (20)</text>
    </view>

    <!-- 默认速度 -->
    <view class="item">
      <wd-circle v-model="progress" :speed="50" />
      <text class="label">默认 (50)</text>
    </view>

    <!-- 快速动画 -->
    <view class="item">
      <wd-circle v-model="progress" :speed="100" />
      <text class="label">快速 (100)</text>
    </view>
  </view>

  <view class="controls">
    <wd-button @click="reset">重置</wd-button>
    <wd-button type="primary" @click="complete">完成</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(0)

const reset = () => {
  progress.value = 0
}

const complete = () => {
  progress.value = 100
}
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 32rpx;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.label {
  font-size: 24rpx;
  color: #666;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-top: 32rpx;
}
</style>
```

**动画原理:**

组件通过定时器实现平滑动画：

```typescript
// 动画核心逻辑
const STEP = 1 // 每步进度增量

const run = () => {
  interval.value = setTimeout(() => {
    if (currentValue.value !== props.modelValue) {
      if (Math.abs(currentValue.value - props.modelValue) < STEP) {
        currentValue.value = props.modelValue
      } else if (currentValue.value < props.modelValue) {
        currentValue.value += STEP
      } else {
        currentValue.value -= STEP
      }
      drawCircle(currentValue.value)
      run()
    } else {
      clearTimeInterval()
    }
  }, 1000 / props.speed)
}
```

**速度参考:**
- `speed = 0` - 无动画，瞬间完成
- `speed = 20` - 慢速，0→100 需要 5 秒
- `speed = 50` - 默认，0→100 需要 2 秒
- `speed = 100` - 快速，0→100 需要 1 秒
- `speed > 1000` - 视为无动画

### 逆时针方向

设置 `clockwise` 为 `false` 使进度逆时针增长。

```vue
<template>
  <view class="demo">
    <!-- 顺时针（默认） -->
    <view class="item">
      <wd-circle v-model="progress" :clockwise="true">
        <text>顺时针</text>
      </wd-circle>
    </view>

    <!-- 逆时针 -->
    <view class="item">
      <wd-circle v-model="progress" :clockwise="false">
        <text>逆时针</text>
      </wd-circle>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  justify-content: space-around;
  gap: 48rpx;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
```

**绘制方向原理:**

```typescript
// Canvas arc 方法的最后一个参数控制方向
context.arc(
  position,           // 圆心 x
  position,           // 圆心 y
  radius,             // 半径
  beginAngle,         // 起始角度
  endAngle,           // 结束角度
  !props.clockwise    // true=逆时针, false=顺时针
)
```

### 填充颜色

通过 `fill` 设置圆环内部填充颜色。

```vue
<template>
  <view class="demo">
    <!-- 无填充（默认） -->
    <wd-circle v-model="progress">
      <text>无填充</text>
    </wd-circle>

    <!-- 浅灰填充 -->
    <wd-circle v-model="progress" fill="#f5f5f5">
      <text>浅灰</text>
    </wd-circle>

    <!-- 浅蓝填充 -->
    <wd-circle v-model="progress" fill="#e8f3ff" color="#1989fa">
      <text>浅蓝</text>
    </wd-circle>

    <!-- 浅绿填充 -->
    <wd-circle v-model="progress" fill="#e8fff3" color="#07c160">
      <text>浅绿</text>
    </wd-circle>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 32rpx;
}
</style>
```

**填充效果:**
- `fill` 会填充圆环内部区域
- 建议使用进度条颜色的浅色变体
- 可以增强视觉层次感

## 高级用法

### 文件上传进度

结合实际业务场景，展示文件上传进度。

```vue
<template>
  <view class="upload-demo">
    <wd-circle
      v-model="uploadProgress"
      :size="240"
      :color="uploadColor"
      :speed="0"
    >
      <view class="upload-content">
        <wd-icon
          v-if="uploadStatus === 'idle'"
          name="upload"
          size="64rpx"
          color="#999"
        />
        <wd-icon
          v-else-if="uploadStatus === 'success'"
          name="check"
          size="64rpx"
          color="#07c160"
        />
        <wd-icon
          v-else-if="uploadStatus === 'error'"
          name="close"
          size="64rpx"
          color="#ee0a24"
        />
        <text v-else class="progress-value">{{ uploadProgress }}%</text>
        <text class="status-text">{{ statusText }}</text>
      </view>
    </wd-circle>

    <view class="actions">
      <wd-button
        v-if="uploadStatus === 'idle'"
        type="primary"
        @click="startUpload"
      >
        开始上传
      </wd-button>
      <wd-button
        v-else-if="uploadStatus === 'uploading'"
        type="warning"
        @click="cancelUpload"
      >
        取消上传
      </wd-button>
      <wd-button v-else @click="resetUpload">重新上传</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

const uploadProgress = ref(0)
const uploadStatus = ref<UploadStatus>('idle')
let uploadTimer: any = null

const uploadColor = computed(() => {
  switch (uploadStatus.value) {
    case 'success': return '#07c160'
    case 'error': return '#ee0a24'
    default: return '#1989fa'
  }
})

const statusText = computed(() => {
  switch (uploadStatus.value) {
    case 'idle': return '点击上传'
    case 'uploading': return '上传中...'
    case 'success': return '上传成功'
    case 'error': return '上传失败'
  }
})

const startUpload = () => {
  uploadStatus.value = 'uploading'
  uploadProgress.value = 0

  // 模拟上传过程
  uploadTimer = setInterval(() => {
    if (uploadProgress.value < 100) {
      uploadProgress.value += Math.random() * 10
      uploadProgress.value = Math.min(100, Math.round(uploadProgress.value))
    } else {
      clearInterval(uploadTimer)
      // 模拟成功或失败
      uploadStatus.value = Math.random() > 0.2 ? 'success' : 'error'
    }
  }, 200)
}

const cancelUpload = () => {
  clearInterval(uploadTimer)
  uploadStatus.value = 'idle'
  uploadProgress.value = 0
}

const resetUpload = () => {
  uploadStatus.value = 'idle'
  uploadProgress.value = 0
}
</script>

<style lang="scss" scoped>
.upload-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48rpx;
  padding: 48rpx;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;

  .progress-value {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
  }

  .status-text {
    font-size: 24rpx;
    color: #666;
  }
}

.actions {
  display: flex;
  gap: 24rpx;
}
</style>
```

### 技能图谱

使用多个环形进度条展示技能熟练度。

```vue
<template>
  <view class="skills-demo">
    <view class="skills-header">
      <text class="title">技能图谱</text>
    </view>

    <view class="skills-grid">
      <view
        v-for="skill in skills"
        :key="skill.name"
        class="skill-item"
      >
        <wd-circle
          v-model="skill.level"
          :size="160"
          :color="skill.color"
          :stroke-width="12"
        >
          <view class="skill-content">
            <text class="level">{{ skill.level }}%</text>
            <text class="name">{{ skill.name }}</text>
          </view>
        </wd-circle>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

interface Skill {
  name: string
  level: number
  color: string | Record<string, string>
}

const skills = reactive<Skill[]>([
  {
    name: 'Vue.js',
    level: 90,
    color: { '0%': '#42b883', '100%': '#35495e' }
  },
  {
    name: 'TypeScript',
    level: 85,
    color: { '0%': '#3178c6', '100%': '#235a97' }
  },
  {
    name: 'UniApp',
    level: 80,
    color: { '0%': '#2b9939', '100%': '#1a5e23' }
  },
  {
    name: 'Node.js',
    level: 75,
    color: { '0%': '#68a063', '100%': '#3c873a' }
  },
  {
    name: 'React',
    level: 70,
    color: { '0%': '#61dafb', '100%': '#21a1c4' }
  },
  {
    name: 'Python',
    level: 65,
    color: { '0%': '#ffd43b', '100%': '#306998' }
  }
])
</script>

<style lang="scss" scoped>
.skills-demo {
  padding: 32rpx;
}

.skills-header {
  margin-bottom: 32rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 32rpx;
  justify-content: center;
}

.skill-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.skill-content {
  display: flex;
  flex-direction: column;
  align-items: center;

  .level {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
  }

  .name {
    font-size: 20rpx;
    color: #666;
    margin-top: 4rpx;
  }
}
</style>
```

### 数据仪表盘

创建数据仪表盘展示多维度指标。

```vue
<template>
  <view class="dashboard-demo">
    <view class="dashboard-header">
      <text class="title">运营数据</text>
      <text class="date">{{ currentDate }}</text>
    </view>

    <view class="metrics-grid">
      <view class="metric-card">
        <wd-circle
          v-model="metrics.completion"
          :size="180"
          :color="getMetricColor(metrics.completion)"
        >
          <view class="metric-content">
            <text class="value">{{ metrics.completion }}%</text>
            <text class="label">完成率</text>
          </view>
        </wd-circle>
        <text class="metric-desc">目标: 100%</text>
      </view>

      <view class="metric-card">
        <wd-circle
          v-model="metrics.satisfaction"
          :size="180"
          :color="getMetricColor(metrics.satisfaction)"
        >
          <view class="metric-content">
            <text class="value">{{ metrics.satisfaction }}%</text>
            <text class="label">满意度</text>
          </view>
        </wd-circle>
        <text class="metric-desc">目标: 95%</text>
      </view>

      <view class="metric-card">
        <wd-circle
          v-model="metrics.efficiency"
          :size="180"
          :color="getMetricColor(metrics.efficiency)"
        >
          <view class="metric-content">
            <text class="value">{{ metrics.efficiency }}%</text>
            <text class="label">效率</text>
          </view>
        </wd-circle>
        <text class="metric-desc">目标: 90%</text>
      </view>

      <view class="metric-card">
        <wd-circle
          v-model="metrics.quality"
          :size="180"
          :color="getMetricColor(metrics.quality)"
        >
          <view class="metric-content">
            <text class="value">{{ metrics.quality }}%</text>
            <text class="label">质量</text>
          </view>
        </wd-circle>
        <text class="metric-desc">目标: 98%</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { reactive, computed } from 'vue'

const currentDate = computed(() => {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日`
})

const metrics = reactive({
  completion: 87,
  satisfaction: 92,
  efficiency: 78,
  quality: 95
})

const getMetricColor = (value: number) => {
  if (value >= 90) {
    return { '0%': '#52c41a', '100%': '#237804' }
  } else if (value >= 70) {
    return { '0%': '#1890ff', '100%': '#096dd9' }
  } else if (value >= 50) {
    return { '0%': '#faad14', '100%': '#d48806' }
  } else {
    return { '0%': '#ff4d4f', '100%': '#cf1322' }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-demo {
  padding: 32rpx;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .date {
    font-size: 28rpx;
    color: #999;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.metric-content {
  display: flex;
  flex-direction: column;
  align-items: center;

  .value {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .label {
    font-size: 24rpx;
    color: #666;
    margin-top: 4rpx;
  }
}

.metric-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 16rpx;
}
</style>
```

### 倒计时效果

结合定时器实现倒计时效果。

```vue
<template>
  <view class="countdown-demo">
    <wd-circle
      v-model="progress"
      :size="280"
      :speed="0"
      :color="countdownColor"
      :clockwise="false"
    >
      <view class="countdown-content">
        <text class="time">{{ formatTime }}</text>
        <text class="label">{{ statusLabel }}</text>
      </view>
    </wd-circle>

    <view class="controls">
      <wd-button
        v-if="!isRunning"
        type="primary"
        @click="startCountdown"
      >
        开始
      </wd-button>
      <wd-button
        v-else
        type="warning"
        @click="pauseCountdown"
      >
        暂停
      </wd-button>
      <wd-button @click="resetCountdown">重置</wd-button>
    </view>

    <view class="presets">
      <text class="presets-label">快捷设置:</text>
      <view class="presets-buttons">
        <wd-button size="small" plain @click="setDuration(60)">1分钟</wd-button>
        <wd-button size="small" plain @click="setDuration(180)">3分钟</wd-button>
        <wd-button size="small" plain @click="setDuration(300)">5分钟</wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onUnmounted } from 'vue'

const totalSeconds = ref(60) // 总秒数
const remainingSeconds = ref(60) // 剩余秒数
const isRunning = ref(false)
let timer: any = null

// 进度值 (0-100)
const progress = computed(() => {
  return Math.round((remainingSeconds.value / totalSeconds.value) * 100)
})

// 格式化时间显示
const formatTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 状态标签
const statusLabel = computed(() => {
  if (remainingSeconds.value === 0) return '时间到!'
  if (isRunning.value) return '倒计时中'
  return '已暂停'
})

// 颜色根据剩余时间变化
const countdownColor = computed(() => {
  const ratio = remainingSeconds.value / totalSeconds.value
  if (ratio > 0.5) return '#1989fa'
  if (ratio > 0.2) return '#ff976a'
  return '#ee0a24'
})

const startCountdown = () => {
  if (remainingSeconds.value === 0) {
    remainingSeconds.value = totalSeconds.value
  }
  isRunning.value = true
  timer = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      clearInterval(timer)
      isRunning.value = false
    }
  }, 1000)
}

const pauseCountdown = () => {
  clearInterval(timer)
  isRunning.value = false
}

const resetCountdown = () => {
  clearInterval(timer)
  isRunning.value = false
  remainingSeconds.value = totalSeconds.value
}

const setDuration = (seconds: number) => {
  clearInterval(timer)
  isRunning.value = false
  totalSeconds.value = seconds
  remainingSeconds.value = seconds
}

onUnmounted(() => {
  timer && clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.countdown-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48rpx;
  padding: 48rpx;
}

.countdown-content {
  display: flex;
  flex-direction: column;
  align-items: center;

  .time {
    font-size: 64rpx;
    font-weight: bold;
    color: #333;
    font-family: monospace;
  }

  .label {
    font-size: 24rpx;
    color: #666;
    margin-top: 8rpx;
  }
}

.controls {
  display: flex;
  gap: 24rpx;
}

.presets {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;

  .presets-label {
    font-size: 24rpx;
    color: #666;
  }

  .presets-buttons {
    display: flex;
    gap: 16rpx;
  }
}
</style>
```

### 步数追踪器

健康应用中的步数追踪功能。

```vue
<template>
  <view class="steps-demo">
    <view class="steps-card">
      <wd-circle
        v-model="stepsProgress"
        :size="320"
        :stroke-width="24"
        :color="stepsColor"
        fill="#f8fafc"
      >
        <view class="steps-content">
          <text class="steps-value">{{ currentSteps.toLocaleString() }}</text>
          <text class="steps-label">今日步数</text>
          <view class="steps-target">
            <wd-icon name="target" size="24rpx" color="#999" />
            <text>目标 {{ targetSteps.toLocaleString() }}</text>
          </view>
        </view>
      </wd-circle>

      <view class="steps-stats">
        <view class="stat-item">
          <text class="stat-value">{{ calories }}</text>
          <text class="stat-label">千卡</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ distance }}</text>
          <text class="stat-label">公里</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ duration }}</text>
          <text class="stat-label">分钟</text>
        </view>
      </view>
    </view>

    <view class="achievements">
      <text class="achievements-title">今日成就</text>
      <view class="achievement-list">
        <view
          v-for="achievement in achievements"
          :key="achievement.id"
          :class="['achievement-item', { achieved: achievement.achieved }]"
        >
          <wd-icon
            :name="achievement.achieved ? 'check-circle' : 'circle'"
            :color="achievement.achieved ? '#07c160' : '#ddd'"
          />
          <text>{{ achievement.title }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const currentSteps = ref(6800)
const targetSteps = ref(10000)

const stepsProgress = computed(() => {
  return Math.min(100, Math.round((currentSteps.value / targetSteps.value) * 100))
})

const stepsColor = computed(() => {
  const ratio = currentSteps.value / targetSteps.value
  if (ratio >= 1) {
    return { '0%': '#52c41a', '100%': '#237804' }
  } else if (ratio >= 0.7) {
    return { '0%': '#1890ff', '100%': '#096dd9' }
  } else if (ratio >= 0.4) {
    return { '0%': '#faad14', '100%': '#d48806' }
  }
  return { '0%': '#ff7a45', '100%': '#fa541c' }
})

// 根据步数计算其他数据
const calories = computed(() => Math.round(currentSteps.value * 0.04))
const distance = computed(() => (currentSteps.value * 0.0007).toFixed(1))
const duration = computed(() => Math.round(currentSteps.value / 100))

const achievements = computed(() => [
  { id: 1, title: '完成 1000 步', achieved: currentSteps.value >= 1000 },
  { id: 2, title: '完成 5000 步', achieved: currentSteps.value >= 5000 },
  { id: 3, title: '完成 8000 步', achieved: currentSteps.value >= 8000 },
  { id: 4, title: '达成目标', achieved: currentSteps.value >= targetSteps.value }
])
</script>

<style lang="scss" scoped>
.steps-demo {
  padding: 32rpx;
}

.steps-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.steps-content {
  display: flex;
  flex-direction: column;
  align-items: center;

  .steps-value {
    font-size: 72rpx;
    font-weight: bold;
    color: #333;
  }

  .steps-label {
    font-size: 28rpx;
    color: #666;
    margin-top: 8rpx;
  }

  .steps-target {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-top: 16rpx;
    font-size: 24rpx;
    color: #999;
  }
}

.steps-stats {
  display: flex;
  align-items: center;
  margin-top: 48rpx;
  padding: 24rpx 48rpx;
  background: #f8fafc;
  border-radius: 16rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32rpx;

  .stat-value {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .stat-label {
    font-size: 22rpx;
    color: #999;
    margin-top: 4rpx;
  }
}

.stat-divider {
  width: 2rpx;
  height: 48rpx;
  background: #e8e8e8;
}

.achievements {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;

  .achievements-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
  color: #999;

  &.achieved {
    color: #333;
  }
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前进度，取值范围 0-100 | `number` | `0` |
| size | 圆环直径，单位 rpx | `number` | `200` |
| color | 进度条颜色，支持渐变色对象 | `string \| Record<string, string>` | `#4d80f0` |
| layer-color | 轨道颜色 | `string` | `#EBEEF5` |
| fill | 圆环内部填充颜色 | `string` | - |
| speed | 动画速度，单位 rate/s，0为无动画 | `number` | `50` |
| text | 中心显示的文字 | `string` | - |
| stroke-width | 进度条宽度，单位 rpx | `number` | `20` |
| stroke-linecap | 进度条端点形状 | `'butt' \| 'round' \| 'square'` | `round` |
| clockwise | 是否顺时针方向增长 | `boolean` | `true` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Slots

| 名称 | 说明 |
|------|------|
| default | 自定义中心内容，优先级高于 text 属性 |

### 类型定义

```typescript
/**
 * 进度条端点形状
 */
type StrokeLinecapType = 'butt' | 'round' | 'square'

/**
 * 渐变色定义
 * 键为百分比位置 (如 '0%', '50%', '100%')
 * 值为对应颜色
 */
type GradientColor = Record<string, string>

/**
 * 进度条颜色类型
 */
type CircleColor = string | GradientColor

/**
 * 圆形进度条组件属性接口
 */
interface WdCircleProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 当前进度，取值范围 0-100 */
  modelValue?: number
  /** 圆环直径，默认单位为 rpx */
  size?: number
  /** 进度条颜色，支持字符串或对象格式定义渐变色 */
  color?: CircleColor
  /** 轨道颜色，即进度条背景颜色 */
  layerColor?: string
  /** 填充颜色，设置后会填充整个圆环 */
  fill?: string
  /** 动画速度，单位为 rate/s，设置为 0 则无动画效果 */
  speed?: number
  /** 进度条中心显示的文字内容 */
  text?: string
  /** 进度条宽度，单位 rpx */
  strokeWidth?: number
  /** 进度条端点的形状 */
  strokeLinecap?: StrokeLinecapType
  /** 是否顺时针方向增长进度 */
  clockwise?: boolean
}
```

### 内部常量

```typescript
// 完整圆周角度
const PERIMETER = 2 * Math.PI

// 起始角度（12点钟方向）
const BEGIN_ANGLE = -Math.PI / 2

// 动画每步进度增量
const STEP = 1
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wot-circle-text-color | 中心文字颜色 | `#333333` |

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-circle v-model="progress" text="自定义" />
  </view>
</template>

<style lang="scss" scoped>
.custom-theme {
  // 修改文字颜色
  --wot-circle-text-color: #1989fa;
}
</style>
```

### 暗黑模式适配

```scss
// 暗黑模式下的样式覆盖
@media (prefers-color-scheme: dark) {
  .circle-container {
    --wot-circle-text-color: #ffffff;
  }
}

// 或通过类名控制
.dark-mode {
  --wot-circle-text-color: #e5e5e5;

  .wd-circle {
    // 调整轨道颜色
    :deep(canvas) {
      filter: brightness(0.9);
    }
  }
}
```

## 平台兼容性

### Canvas API 差异

组件针对不同平台进行了适配：

| 平台 | Canvas API | 适配方案 |
|------|-----------|----------|
| H5 | Canvas 2D | 原生支持 |
| 微信小程序 | Canvas 2D | 使用 `canvas2dAdapter` 适配 |
| 支付宝小程序 | 传统 Canvas | 像素比适配 |
| App | 传统 Canvas | 原生支持 |

### canvas2dAdapter 适配器

微信小程序使用 Canvas 2D API，需要通过适配器转换：

```typescript
// Canvas 2D 适配器（部分实现）
export const canvas2dAdapter = (ctx: CanvasRenderingContext2D) => {
  return Object.assign(ctx, {
    setFillStyle: (color) => { ctx.fillStyle = color },
    setStrokeStyle: (color) => { ctx.strokeStyle = color },
    setLineWidth: (width) => { ctx.lineWidth = width },
    setLineCap: (cap) => { ctx.lineCap = cap },
    draw: () => { /* Canvas 2D 实时绘制，无需调用 */ }
  })
}
```

### 像素比处理

支付宝小程序需要特殊处理像素比：

```typescript
// 获取设备像素比
onBeforeMount(() => {
  pixelRatio.value = uni.getSystemInfoSync().pixelRatio
})

// Canvas 尺寸计算
const canvasSize = computed(() => {
  let size = rpxToPx(props.size)
  // #ifdef MP-ALIPAY
  size = size * pixelRatio.value
  // #endif
  return size
})
```

## 最佳实践

### 1. 合理选择动画速度

```typescript
// ✅ 正确：根据进度变化幅度选择速度
const handleProgressChange = (newValue: number, oldValue: number) => {
  const diff = Math.abs(newValue - oldValue)
  // 小幅度变化用快速动画
  if (diff <= 10) {
    speed.value = 100
  }
  // 中等变化用默认速度
  else if (diff <= 50) {
    speed.value = 50
  }
  // 大幅度变化用慢速动画
  else {
    speed.value = 30
  }
}

// ❌ 错误：实时数据用动画
// 频繁更新的数据应禁用动画
<wd-circle v-model="realtimeProgress" :speed="0" />
```

### 2. 优化渐变色性能

```typescript
// ✅ 正确：使用 computed 缓存渐变色配置
const gradientColor = computed(() => ({
  '0%': startColor.value,
  '100%': endColor.value
}))

// ❌ 错误：在模板中创建对象
// 每次渲染都会创建新对象，触发不必要的重绘
<wd-circle :color="{ '0%': '#ff0000', '100%': '#00ff00' }" />
```

### 3. 正确处理边界值

```typescript
// ✅ 正确：确保进度值在有效范围内
const safeProgress = computed(() => {
  return Math.max(0, Math.min(100, rawProgress.value))
})

// 或在更新时处理
const updateProgress = (value: number) => {
  progress.value = Math.max(0, Math.min(100, value))
}
```

### 4. 响应式尺寸适配

```vue
<template>
  <wd-circle
    v-model="progress"
    :size="circleSize"
    :stroke-width="strokeWidth"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// 根据屏幕宽度动态计算尺寸
const circleSize = computed(() => {
  const screenWidth = uni.getSystemInfoSync().screenWidth
  // 小屏幕使用较小尺寸
  if (screenWidth < 375) return 160
  // 中等屏幕使用默认尺寸
  if (screenWidth < 414) return 200
  // 大屏幕使用较大尺寸
  return 240
})

const strokeWidth = computed(() => circleSize.value / 10)
</script>
```

### 5. 内存优化

```typescript
// ✅ 正确：组件卸载时清理定时器
onUnmounted(() => {
  timer && clearInterval(timer)
  timer = null
})

// ✅ 正确：避免创建过多 Circle 实例
// 使用虚拟列表或按需渲染
<template v-for="item in visibleItems">
  <wd-circle :key="item.id" v-model="item.progress" />
</template>
```

## 常见问题

### 1. 进度条不显示?

**问题原因:**
- `v-model` 的值超出 0-100 范围
- `size` 或 `stroke-width` 设置不当
- Canvas 未正确初始化

**解决方案:**

```typescript
// 检查进度值
const progress = ref(70) // 确保在 0-100 之间

// 确保尺寸合理
<wd-circle
  v-model="progress"
  :size="200"
  :stroke-width="20"  // strokeWidth 不应超过 size/4
/>
```

### 2. 动画不流畅?

**问题原因:**
- `speed` 值过高或过低
- 频繁更新进度值
- 页面存在性能问题

**解决方案:**

```typescript
// 适当调整速度
<wd-circle v-model="progress" :speed="50" />

// 频繁更新时禁用动画
<wd-circle v-model="realtimeProgress" :speed="0" />

// 使用防抖更新
import { useDebounceFn } from '@vueuse/core'

const updateProgress = useDebounceFn((value: number) => {
  progress.value = value
}, 100)
```

### 3. 微信小程序中显示异常?

**问题原因:**
- Canvas 2D API 兼容性问题
- 组件尺寸计算错误

**解决方案:**

组件已内置 Canvas 2D 适配，如仍有问题：

```vue
<template>
  <!-- 确保组件有明确的尺寸 -->
  <view class="circle-wrapper">
    <wd-circle v-model="progress" :size="200" />
  </view>
</template>

<style lang="scss" scoped>
.circle-wrapper {
  width: 200rpx;
  height: 200rpx;
}
</style>
```

### 4. 如何实现倒计时效果?

结合定时器实现：

```vue
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const progress = ref(100)
const totalTime = 60 // 总秒数
const remainingTime = ref(60)
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
      progress.value = (remainingTime.value / totalTime) * 100
    } else {
      clearInterval(timer)
    }
  }, 1000)
})

onUnmounted(() => {
  timer && clearInterval(timer)
})
</script>
```

### 5. 渐变色不生效?

**问题原因:**
- 渐变色对象格式错误
- 百分比格式不正确

**解决方案:**

```typescript
// ✅ 正确格式
const gradientColor = {
  '0%': '#ff0000',    // 必须是字符串百分比
  '50%': '#00ff00',
  '100%': '#0000ff'
}

// ❌ 错误格式
const wrongGradient = {
  0: '#ff0000',       // 数字键不正确
  '50': '#00ff00',    // 缺少百分号
  100: '#0000ff'
}
```

### 6. 如何实现环形进度条组合?

```vue
<template>
  <view class="multi-circle">
    <!-- 外环 -->
    <wd-circle
      v-model="outerProgress"
      :size="280"
      :stroke-width="16"
      color="#1989fa"
    />
    <!-- 内环（绝对定位） -->
    <view class="inner-circle">
      <wd-circle
        v-model="innerProgress"
        :size="200"
        :stroke-width="16"
        color="#07c160"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.multi-circle {
  position: relative;
  display: inline-block;
}

.inner-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
```

## 总结

Circle 环形进度条是一个功能强大的进度展示组件，核心使用要点：

1. **基础使用** - 通过 `v-model` 绑定 0-100 的进度值
2. **样式定制** - `size`/`stroke-width`/`color`/`layer-color` 控制外观
3. **渐变效果** - `color` 支持对象格式定义渐变色
4. **动画控制** - `speed` 控制动画速度，0 表示无动画
5. **自定义内容** - 使用默认插槽展示复杂内容
6. **方向控制** - `clockwise` 控制进度增长方向
7. **端点形状** - `stroke-linecap` 设置圆环端点样式

**适用场景:**
- 任务/文件上传进度展示
- 评分/得分展示
- 技能图谱/数据仪表盘
- 倒计时/计时器
- 健康数据追踪
