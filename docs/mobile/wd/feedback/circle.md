---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/circle
---

# Circle 环形进度条

## 介绍

Circle 环形进度条是一个圆环形的进度展示组件,支持进度渐变动画。适用于展示任务进度、文件上传进度、评分等场景。

**核心特性:**

- **渐变动画** - 支持进度变化时的平滑动画效果
- **渐变色** - 支持自定义渐变色进度条
- **自定义样式** - 支持设置尺寸、颜色、端点形状等
- **自定义内容** - 支持通过插槽自定义中心内容

## 基本用法

### 基础用法

通过 `v-model` 绑定进度值,取值范围为 0-100。

```vue
<template>
  <wd-circle v-model="progress" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>
```

### 自定义颜色

通过 `color` 设置进度条颜色,`layer-color` 设置轨道颜色。

```vue
<template>
  <wd-circle v-model="progress" color="#07c160" layer-color="#e8e8e8" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>
```

### 渐变色

`color` 属性支持传入对象格式来定义渐变色。

```vue
<template>
  <wd-circle v-model="progress" :color="gradientColor" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
const gradientColor = {
  '0%': '#ffd01e',
  '100%': '#ee0a24'
}
</script>
```

### 自定义尺寸

通过 `size` 设置圆环直径,单位为 rpx。

```vue
<template>
  <wd-circle v-model="progress" :size="120" />
  <wd-circle v-model="progress" :size="200" />
  <wd-circle v-model="progress" :size="280" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>
```

### 自定义宽度

通过 `stroke-width` 设置进度条宽度,单位为 rpx。

```vue
<template>
  <wd-circle v-model="progress" :stroke-width="10" />
  <wd-circle v-model="progress" :stroke-width="30" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>
```

### 端点形状

通过 `stroke-linecap` 设置进度条端点的形状。

```vue
<template>
  <wd-circle v-model="progress" stroke-linecap="butt" />
  <wd-circle v-model="progress" stroke-linecap="round" />
  <wd-circle v-model="progress" stroke-linecap="square" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>
```

### 显示文字

通过 `text` 属性设置中心显示的文字。

```vue
<template>
  <wd-circle v-model="progress" :text="`${progress}%`" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>
```

### 自定义内容

通过默认插槽自定义中心显示的内容。

```vue
<template>
  <wd-circle v-model="progress">
    <view class="custom-content">
      <text class="value">{{ progress }}</text>
      <text class="unit">分</text>
    </view>
  </wd-circle>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>

<style lang="scss" scoped>
.custom-content {
  display: flex;
  align-items: baseline;
  justify-content: center;

  .value {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
  }

  .unit {
    font-size: 24rpx;
    color: #666;
    margin-left: 4rpx;
  }
}
</style>
```

### 动画速度

通过 `speed` 设置动画速度,单位为 rate/s。设置为 0 则无动画效果。

```vue
<template>
  <wd-circle v-model="progress" :speed="100" />
  <wd-circle v-model="progress" :speed="0" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>
```

### 逆时针方向

设置 `clockwise` 为 `false` 使进度逆时针增长。

```vue
<template>
  <wd-circle v-model="progress" :clockwise="false" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>
```

### 填充颜色

通过 `fill` 设置圆环内部填充颜色。

```vue
<template>
  <wd-circle v-model="progress" fill="#f5f5f5" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(70)
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前进度,取值范围 0-100 | `number` | `0` |
| size | 圆环直径,单位 rpx | `number` | `200` |
| color | 进度条颜色,支持渐变色对象 | `string \| Record<string, string>` | `#4d80f0` |
| layer-color | 轨道颜色 | `string` | `#EBEEF5` |
| fill | 填充颜色 | `string` | - |
| speed | 动画速度,单位 rate/s,0为无动画 | `number` | `50` |
| text | 中心显示的文字 | `string` | - |
| stroke-width | 进度条宽度,单位 rpx | `number` | `20` |
| stroke-linecap | 进度条端点形状 | `'butt' \| 'round' \| 'square'` | `round` |
| clockwise | 是否顺时针方向增长 | `boolean` | `true` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Slots

| 名称 | 说明 |
|------|------|
| default | 自定义中心内容,优先级高于 text 属性 |

### 类型定义

```typescript
/**
 * 进度条端点形状
 */
type StrokeLinecapType = 'butt' | 'round' | 'square'
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-circle-text-color | 中心文字颜色 | `#333333` |

## 最佳实践

### 1. 任务进度展示

```vue
<template>
  <view class="task-progress">
    <wd-circle v-model="progress" :color="progressColor">
      <view class="progress-content">
        <text class="value">{{ progress }}%</text>
        <text class="label">已完成</text>
      </view>
    </wd-circle>
    <wd-button size="small" @click="addProgress">增加进度</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const progress = ref(30)

const progressColor = computed(() => {
  if (progress.value < 30) return '#ee0a24'
  if (progress.value < 70) return '#ff976a'
  return '#07c160'
})

const addProgress = () => {
  progress.value = Math.min(100, progress.value + 10)
}
</script>
```

### 2. 评分展示

```vue
<template>
  <wd-circle
    v-model="score"
    :color="{ '0%': '#ffd01e', '100%': '#ff976a' }"
    :size="160"
  >
    <view class="score-content">
      <text class="score">{{ (score / 10).toFixed(1) }}</text>
      <text class="label">综合评分</text>
    </view>
  </wd-circle>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score = ref(85) // 代表 8.5 分
</script>
```

## 常见问题

### 1. 进度条不显示?

检查 `v-model` 的值是否在 0-100 范围内。超出范围会被自动修正。

### 2. 动画不流畅?

适当调整 `speed` 属性值。过高的速度值可能导致动画过快。

### 3. 微信小程序中显示异常?

组件已针对微信小程序的 Canvas 2D API 进行了适配。如仍有问题,请确保使用最新版本的组件。

### 4. 如何实现倒计时效果?

可以结合定时器实现:

```vue
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const progress = ref(100)
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    if (progress.value > 0) {
      progress.value--
    } else {
      clearInterval(timer)
    }
  }, 100)
})

onUnmounted(() => {
  timer && clearInterval(timer)
})
</script>
```
