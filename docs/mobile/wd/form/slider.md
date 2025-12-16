# Slider 滑块

## 介绍

Slider 滑块组件是一个用于在连续或离散的数值范围内进行选择的交互式组件。通过拖动滑块,用户可以直观地设置数值,广泛应用于音量调节、亮度控制、价格筛选、范围选择等场景。组件提供了流畅的触摸交互体验,支持单滑块和双滑块两种模式,能够满足各种数值输入需求。

Slider 组件采用触摸事件处理和实时计算的方式实现滑动效果。组件内部通过精确的位置计算和步进值对齐,确保滑块值的准确性。无论是设置单个数值还是选择一个范围,Slider 组件都能提供优秀的交互体验和视觉反馈。

**核心特性:**

- **双模式支持** - 支持单滑块模式(选择单个值)和双滑块模式(选择范围),通过 modelValue 类型自动识别
- **步进值对齐** - 支持自定义步进值,滑块值自动对齐到最近的步进倍数,确保数值规范性
- **范围限制** - 可设置最小值和最大值,滑块值自动限制在有效范围内,防止无效输入
- **触摸拖动** - 流畅的触摸拖动体验,支持拖动开始、拖动中、拖动结束三个阶段的事件监听
- **实时反馈** - 拖动过程中实时显示当前值,提供直观的视觉反馈
- **自定义颜色** - 支持自定义激活和未激活状态的进度条颜色,满足不同的设计需求
- **禁用状态** - 提供禁用功能,禁用状态下滑块不可拖动,进度条显示半透明效果
- **暗色主题** - 内置暗色主题适配,自动调整文字和背景颜色以适应深色模式

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:1-546

## 基本用法

### 基础滑块

最简单的滑块用法,通过 v-model 绑定滑块值。

```vue
<template>
  <view class="demo">
    <view class="demo-title">基础滑块</view>
    <wd-slider v-model="value" />
    <view class="demo-text">当前值: {{ value }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(50)
</script>

```

**使用说明:**
- 使用 `v-model` 绑定当前滑块值
- 滑块值为数字类型,默认范围为 0 到 100
- 拖动滑块可以改变数值,松开后值会自动对齐到步进值
- 滑块上方会显示当前值的标签

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:133

### 双滑块模式

通过传入数组值启用双滑块模式,用于选择范围。

```vue
<template>
  <view class="demo">
    <view class="demo-title">双滑块模式</view>
    <wd-slider v-model="range" />
    <view class="demo-text">
      选择范围: {{ range[0] }} - {{ range[1] }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const range = ref([20, 80])
</script>

```

**使用说明:**
- 当 `v-model` 绑定的值为数组时,自动启用双滑块模式
- 数组第一个元素为左滑块的值,第二个元素为右滑块的值
- 两个滑块都可以独立拖动,但左滑块不能超过右滑块
- 进度条会显示在两个滑块之间的区域

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:339

### 自定义范围

通过 min 和 max 属性自定义滑块的取值范围。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义范围</view>

    <view class="demo-block">
      <view class="demo-label">价格范围: 0 - 1000 元</view>
      <wd-slider v-model="price" :min="0" :max="1000" />
      <view class="demo-text">当前价格: {{ price }} 元</view>
    </view>

    <view class="demo-block">
      <view class="demo-label">年龄范围: 18 - 65 岁</view>
      <wd-slider v-model="age" :min="18" :max="65" />
      <view class="demo-text">当前年龄: {{ age }} 岁</view>
    </view>

    <view class="demo-block">
      <view class="demo-label">温度范围: -20 - 40 °C</view>
      <wd-slider v-model="temperature" :min="-20" :max="40" />
      <view class="demo-text">当前温度: {{ temperature }} °C</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const price = ref(500)
const age = ref(30)
const temperature = ref(25)
</script>

```

**使用说明:**
- `min` 属性设置滑块的最小值,默认为 0
- `max` 属性设置滑块的最大值,默认为 100
- 滑块值会自动限制在 min 和 max 之间
- min 可以为负数,支持负数范围的选择

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:126-129

### 步进值设置

通过 step 属性设置滑块的步进值。

```vue
<template>
  <view class="demo">
    <view class="demo-title">步进值设置</view>

    <view class="demo-block">
      <view class="demo-label">步进值: 1(默认)</view>
      <wd-slider v-model="value1" :step="1" />
      <view class="demo-text">当前值: {{ value1 }}</view>
    </view>

    <view class="demo-block">
      <view class="demo-label">步进值: 5</view>
      <wd-slider v-model="value2" :step="5" />
      <view class="demo-text">当前值: {{ value2 }}</view>
    </view>

    <view class="demo-block">
      <view class="demo-label">步进值: 10</view>
      <wd-slider v-model="value3" :step="10" />
      <view class="demo-text">当前值: {{ value3 }}</view>
    </view>

    <view class="demo-block">
      <view class="demo-label">步进值: 0.1(小数)</view>
      <wd-slider v-model="value4" :min="0" :max="10" :step="0.1" />
      <view class="demo-text">当前值: {{ value4 }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(50)
const value2 = ref(50)
const value3 = ref(50)
const value4 = ref(5.0)
</script>

```

**使用说明:**
- `step` 属性控制滑块的步进值,默认为 1
- 滑块值会自动对齐到最近的步进倍数
- 支持小数步进值,如 0.1、0.5 等
- 步进值必须大于 0,否则会显示警告并使用 1 作为步进值

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:130-131, 237-251

### 禁用状态

将滑块设置为禁用状态,不可拖动。

```vue
<template>
  <view class="demo">
    <view class="demo-title">禁用状态</view>

    <view class="demo-block">
      <view class="demo-label">正常状态</view>
      <wd-slider v-model="value1" />
    </view>

    <view class="demo-block">
      <view class="demo-label">禁用状态</view>
      <wd-slider v-model="value2" disabled />
    </view>

    <view class="demo-block">
      <view class="demo-label">双滑块禁用</view>
      <wd-slider v-model="range" disabled />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(50)
const value2 = ref(50)
const range = ref([20, 80])
</script>

```

**使用说明:**
- 设置 `disabled` 属性后,滑块不可拖动
- 禁用状态下,滑块按钮会隐藏(visibility: hidden)
- 进度条显示半透明效果(opacity: 0.25)
- 最小最大值标签颜色变浅,表示禁用状态

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:118-119, 356-360, 536-543

### 隐藏标签

通过 hideLabel 和 hideMinMax 属性控制标签的显示。

```vue
<template>
  <view class="demo">
    <view class="demo-title">隐藏标签</view>

    <view class="demo-block">
      <view class="demo-label">显示所有标签(默认)</view>
      <wd-slider v-model="value1" />
    </view>

    <view class="demo-block">
      <view class="demo-label">隐藏当前值标签</view>
      <wd-slider v-model="value2" hide-label />
    </view>

    <view class="demo-block">
      <view class="demo-label">隐藏最小最大值</view>
      <wd-slider v-model="value3" hide-min-max />
    </view>

    <view class="demo-block">
      <view class="demo-label">隐藏所有标签</view>
      <wd-slider v-model="value4" hide-label hide-min-max />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(50)
const value2 = ref(50)
const value3 = ref(50)
const value4 = ref(50)
</script>

```

**使用说明:**
- `hide-label` 属性隐藏滑块上方的当前值标签
- `hide-min-max` 属性隐藏左右两侧的最小最大值标签
- 两个属性可以同时使用,实现完全无标签的简洁样式
- 隐藏标签后,组件高度会相应减小

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:114-117

### 自定义颜色

自定义激活和未激活状态的进度条颜色。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义颜色</view>

    <view class="demo-block">
      <view class="demo-label">默认颜色</view>
      <wd-slider v-model="value1" />
    </view>

    <view class="demo-block">
      <view class="demo-label">红色主题</view>
      <wd-slider
        v-model="value2"
        inactive-color="#FFE0E0"
        active-color="#FF4757"
      />
    </view>

    <view class="demo-block">
      <view class="demo-label">绿色主题</view>
      <wd-slider
        v-model="value3"
        inactive-color="#E0FFE0"
        active-color="#2ECC71"
      />
    </view>

    <view class="demo-block">
      <view class="demo-label">渐变色</view>
      <wd-slider
        v-model="value4"
        inactive-color="#F0F0F0"
        active-color="linear-gradient(90deg, #4A90E2 0%, #357ABD 100%)"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(50)
const value2 = ref(60)
const value3 = ref(70)
const value4 = ref(80)
</script>

```

**使用说明:**
- `inactive-color` 设置未激活部分的背景颜色,默认为 `#e5e5e5`
- `active-color` 设置激活部分的背景颜色,默认为主题色
- 颜色支持纯色值、十六进制、RGB、渐变等 CSS 颜色格式
- 渐变色使用 CSS linear-gradient 语法

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:121-124, 365-371, 393-396

## 高级用法

### 监听拖动事件

监听滑块的拖动开始、拖动中、拖动结束事件。

```vue
<template>
  <view class="demo">
    <view class="demo-title">监听拖动事件</view>

    <wd-slider
      v-model="value"
      @dragstart="handleDragStart"
      @dragmove="handleDragMove"
      @dragend="handleDragEnd"
    />

    <view class="demo-log">
      <view class="demo-log-title">事件日志:</view>
      <view
        v-for="(log, index) in logs"
        :key="index"
        class="demo-log-item"
      >
        {{ log }}
      </view>
      <view v-if="!logs.length" class="demo-log-empty">
        拖动滑块查看事件触发
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(50)
const logs = ref<string[]>([])

const handleDragStart = ({ value }: { value: number }) => {
  addLog(`开始拖动: 初始值 ${value}`)
}

const handleDragMove = ({ value }: { value: number }) => {
  addLog(`拖动中: 当前值 ${value}`)
}

const handleDragEnd = ({ value }: { value: number }) => {
  addLog(`结束拖动: 最终值 ${value}`)
}

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`[${timestamp}] ${message}`)

  // 限制日志数量
  if (logs.value.length > 10) {
    logs.value = logs.value.slice(0, 10)
  }
}
</script>

```

**技术实现:**
- `dragstart` 事件在触摸开始时触发,参数为起始值
- `dragmove` 事件在拖动过程中持续触发,参数为实时值
- `dragend` 事件在触摸结束时触发,参数为最终值
- 事件参数为对象,包含 value 字段,单滑块为数字,双滑块为数组
- 拖动事件在禁用状态下不会触发

**使用说明:**
- dragmove 事件会频繁触发,建议避免在其中执行耗时操作
- 可以在 dragend 事件中处理最终值,如提交数据、保存设置等
- 事件参数通过解构获取: `({ value }) => {}`

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:140-146, 287-333

### 双滑块范围选择

使用双滑块实现范围选择功能。

```vue
<template>
  <view class="demo">
    <view class="demo-title">价格筛选</view>

    <view class="demo-filter">
      <wd-slider
        v-model="priceRange"
        :min="0"
        :max="10000"
        :step="100"
        @dragend="handlePriceChange"
      />

      <view class="filter-info">
        <view class="filter-label">价格区间:</view>
        <view class="filter-value">
          ¥{{ priceRange[0] }} - ¥{{ priceRange[1] }}
        </view>
      </view>

      <button class="btn-search" @click="handleSearch">
        搜索商品
      </button>
    </view>

    <view v-if="searchResult" class="demo-result">
      <view class="result-title">搜索结果:</view>
      <view class="result-text">
        找到价格在 ¥{{ searchResult.min }} - ¥{{ searchResult.max }} 之间的商品
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const priceRange = ref([1000, 5000])
const searchResult = ref<{ min: number; max: number } | null>(null)

const handlePriceChange = ({ value }: { value: number[] }) => {
  console.log('价格范围变更:', value)
}

const handleSearch = () => {
  searchResult.value = {
    min: priceRange.value[0],
    max: priceRange.value[1],
  }
  console.log('搜索商品:', searchResult.value)
}
</script>

```

**技术实现:**
- 双滑块模式下,modelValue 为包含两个元素的数组
- 左滑块值始终 ≤ 右滑块值,组件内部自动处理交叉情况
- 两个滑块可以独立拖动,互不干扰
- 进度条显示在两个滑块之间,直观表示选择范围

**使用说明:**
- 适用于价格筛选、年龄范围、日期区间等场景
- 建议设置合适的步进值,避免范围过于精细
- 可以在 dragend 事件中处理范围变更,如触发搜索等

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:198-209, 382-386

### 音量控制应用

模拟音量控制的完整应用场景。

```vue
<template>
  <view class="demo">
    <view class="demo-title">音量控制</view>

    <view class="demo-player">
      <view class="player-icon">
        <wd-icon
          :name="volumeIcon"
          size="48"
          :color="volume === 0 ? '#C8C9CC' : '#1890FF'"
        />
      </view>

      <view class="player-slider">
        <wd-slider
          v-model="volume"
          :min="0"
          :max="100"
          :step="1"
          active-color="#1890FF"
          inactive-color="#E8E8E8"
          @dragmove="handleVolumeChange"
        />
      </view>

      <view class="player-value">{{ volume }}%</view>
    </view>

    <view class="demo-controls">
      <button
        class="btn-control"
        @click="setVolume(0)"
      >
        静音
      </button>
      <button
        class="btn-control"
        @click="setVolume(50)"
      >
        50%
      </button>
      <button
        class="btn-control"
        @click="setVolume(100)"
      >
        最大
      </button>
    </view>

    <view class="demo-status">
      <view class="status-item">
        <text class="status-label">当前音量:</text>
        <text class="status-value">{{ volume }}%</text>
      </view>
      <view class="status-item">
        <text class="status-label">音量状态:</text>
        <text class="status-value">{{ volumeStatus }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const volume = ref(50)

const volumeIcon = computed(() => {
  if (volume.value === 0) return 'volume-off'
  if (volume.value < 50) return 'volume-down'
  return 'volume-up'
})

const volumeStatus = computed(() => {
  if (volume.value === 0) return '静音'
  if (volume.value < 30) return '低音量'
  if (volume.value < 70) return '中音量'
  return '高音量'
})

const handleVolumeChange = ({ value }: { value: number }) => {
  console.log('音量变更:', value)
  // 这里可以调用实际的音量控制 API
}

const setVolume = (value: number) => {
  volume.value = value
}
</script>

```

**技术实现:**
- 使用单滑块控制音量,范围 0-100
- 根据音量值动态显示不同的图标
- 使用 computed 计算音量状态和对应图标
- dragmove 事件中可以调用系统音量控制 API

**使用说明:**
- 音量控制通常使用 0-100 的范围
- 可以预设快捷按钮,如静音、50%、最大
- 建议步进值设为 1,提供精确控制

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:126-131

### 亮度调节应用

实现屏幕亮度调节功能。

```vue
<template>
  <view class="demo">
    <view class="demo-title">亮度调节</view>

    <view
      class="demo-screen"
      :style="{ opacity: brightness / 100 }"
    >
      <view class="screen-content">
        <wd-icon name="sun" size="64" color="#FFD700" />
        <view class="screen-text">{{ brightness }}%</view>
      </view>
    </view>

    <view class="demo-control">
      <wd-icon name="moon" size="32" color="#C8C9CC" />
      <wd-slider
        v-model="brightness"
        :min="10"
        :max="100"
        :step="5"
        hide-min-max
        active-color="#FFD700"
        @dragend="handleBrightnessChange"
      />
      <wd-icon name="sun" size="32" color="#FFD700" />
    </view>

    <view class="demo-tips">
      <wd-icon name="info" size="28" color="#1890FF" />
      <text class="tips-text">拖动滑块调节屏幕亮度</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const brightness = ref(80)

const handleBrightnessChange = ({ value }: { value: number }) => {
  console.log('亮度变更:', value)
  // 这里可以调用 uni.setScreenBrightness API
  // uni.setScreenBrightness({ value: value / 100 })
}
</script>

```

**技术实现:**
- 亮度范围设置为 10-100,避免完全黑屏
- 使用 CSS opacity 属性模拟亮度效果
- 步进值设为 5,提供合适的调节粒度
- 可以调用 UniApp 的 setScreenBrightness API 实现真实亮度控制

**使用说明:**
- 最小值建议不要设为 0,避免屏幕过暗
- 亮度调节通常使用步进值 5 或 10
- 在 dragend 事件中调用系统 API,避免频繁调用

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:126-131

### 自定义样式类

通过样式类自定义滑块的外观。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义样式类</view>

    <view class="demo-block">
      <view class="demo-label">自定义最小最大值样式</view>
      <wd-slider
        v-model="value1"
        custom-min-class="custom-min"
        custom-max-class="custom-max"
      />
    </view>

    <view class="demo-block">
      <view class="demo-label">自定义根节点样式</view>
      <wd-slider
        v-model="value2"
        custom-class="custom-slider"
        custom-style="padding: 20rpx; background: #F0F9FF; border-radius: 8rpx;"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(50)
const value2 = ref(60)
</script>

```

**使用说明:**
- `custom-class` 为根节点添加自定义样式类
- `custom-style` 为根节点添加内联样式
- `custom-min-class` 自定义最小值标签的样式类
- `custom-max-class` 自定义最大值标签的样式类
- 使用 `:deep()` 穿透样式作用域

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:105-112

### 动态初始化

在某些场景下需要手动初始化滑块宽度。

```vue
<template>
  <view class="demo">
    <view class="demo-title">动态初始化</view>

    <wd-tabs v-model="activeTab" @change="handleTabChange">
      <wd-tab title="音量">
        <view class="tab-content">
          <wd-slider ref="volumeSliderRef" v-model="volume" />
        </view>
      </wd-tab>

      <wd-tab title="亮度">
        <view class="tab-content">
          <wd-slider ref="brightnessSliderRef" v-model="brightness" />
        </view>
      </wd-tab>
    </wd-tabs>

    <view class="demo-tips">
      切换标签页时会自动重新初始化滑块宽度
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import type { SliderInstance } from '@/wd/components/wd-slider/wd-slider.vue'

const activeTab = ref(0)
const volume = ref(50)
const brightness = ref(80)

const volumeSliderRef = ref<SliderInstance>()
const brightnessSliderRef = ref<SliderInstance>()

const handleTabChange = async () => {
  // 等待 DOM 更新完成后重新初始化滑块
  await nextTick()

  if (activeTab.value === 0) {
    volumeSliderRef.value?.initSlider()
  } else {
    brightnessSliderRef.value?.initSlider()
  }
}
</script>

```

**技术实现:**
- 组件暴露 `initSlider` 方法,用于手动初始化滑块宽度
- 在标签页切换、弹窗显示等场景下,可能需要重新初始化
- 使用 ref 获取组件实例,调用 initSlider 方法
- 建议在 nextTick 中调用,确保 DOM 已更新

**使用说明:**
- 组件挂载时会自动初始化,大多数情况下不需要手动调用
- 以下场景可能需要手动初始化:
  - 滑块在隐藏的标签页或弹窗中
  - 父容器宽度动态变化
  - 滑块从 display: none 变为可见
- 调用时机应该在 DOM 更新完成之后

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:153-156, 276-281, 423-425, 427-429

### 表单集成应用

在表单中使用滑块组件。

```vue
<template>
  <view class="demo">
    <view class="demo-title">用户偏好设置</view>

    <view class="demo-form">
      <view class="form-item">
        <view class="form-label">
          <text class="form-required">*</text>
          年龄
        </view>
        <wd-slider
          v-model="formData.age"
          :min="18"
          :max="100"
          :step="1"
        />
        <view v-if="errors.age" class="form-error">{{ errors.age }}</view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="form-required">*</text>
          预算范围 (元)
        </view>
        <wd-slider
          v-model="formData.budget"
          :min="0"
          :max="10000"
          :step="100"
        />
        <view v-if="errors.budget" class="form-error">{{ errors.budget }}</view>
      </view>

      <view class="form-item">
        <view class="form-label">
          接受延迟 (天)
        </view>
        <wd-slider
          v-model="formData.delay"
          :min="0"
          :max="30"
          :step="1"
        />
      </view>

      <view class="form-actions">
        <button class="btn-submit" @click="handleSubmit">提交</button>
        <button class="btn-reset" @click="handleReset">重置</button>
      </view>
    </view>

    <view v-if="submitResult" class="demo-result">
      <view class="result-title">提交成功!</view>
      <view class="result-content">
        <view>年龄: {{ submitResult.age }} 岁</view>
        <view>预算: ¥{{ submitResult.budget[0] }} - ¥{{ submitResult.budget[1] }}</view>
        <view>接受延迟: {{ submitResult.delay }} 天</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

interface FormData {
  age: number
  budget: number[]
  delay: number
}

const formData = reactive<FormData>({
  age: 25,
  budget: [1000, 5000],
  delay: 7,
})

const errors = reactive({
  age: '',
  budget: '',
})

const submitResult = ref<FormData | null>(null)

const validateForm = (): boolean => {
  let isValid = true

  // 清空错误信息
  errors.age = ''
  errors.budget = ''

  // 验证年龄
  if (formData.age < 18) {
    errors.age = '年龄必须大于等于 18 岁'
    isValid = false
  }

  // 验证预算
  if (formData.budget[1] - formData.budget[0] < 500) {
    errors.budget = '预算范围至少相差 500 元'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  // 模拟提交
  submitResult.value = { ...formData }
  console.log('提交表单:', submitResult.value)
}

const handleReset = () => {
  formData.age = 25
  formData.budget = [1000, 5000]
  formData.delay = 7
  errors.age = ''
  errors.budget = ''
  submitResult.value = null
}
</script>

```

**技术实现:**
- 使用 reactive 创建响应式表单数据对象
- 单滑块和双滑块混用,满足不同的输入需求
- 表单验证时检查滑块值是否满足业务规则
- 使用 v-model 双向绑定,自动同步滑块值

**使用说明:**
- Slider 可以很好地集成到表单中
- 单滑块适用于选择单个值,如年龄、延迟天数等
- 双滑块适用于选择范围,如价格区间、日期范围等
- 表单验证时注意检查范围的合理性

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:133

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 滑块的值,单滑块为 number,双滑块为 number[] | `number \| number[]` | `0` |
| min | 最小值 | `number` | `0` |
| max | 最大值 | `number` | `100` |
| step | 步进值,必须大于 0 | `number` | `1` |
| disabled | 是否禁用滑块 | `boolean` | `false` |
| hide-label | 是否隐藏当前值标签 | `boolean` | `false` |
| hide-min-max | 是否隐藏左右的最小最大值 | `boolean` | `false` |
| inactive-color | 进度条未激活的背景颜色 | `string` | `'#e5e5e5'` |
| active-color | 进度条激活的背景颜色 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-min-class | 自定义最小值的样式类名 | `string` | `''` |
| custom-max-class | 自定义最大值的样式类名 | `string` | `''` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:104-134, 159-173

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 滑块值更新时触发,用于 v-model 绑定 | `value: number \| number[]` |
| dragstart | 开始拖动滑块时触发 | `{ value: number \| number[] }` |
| dragmove | 拖动滑块过程中触发 | `{ value: number \| number[] }` |
| dragend | 结束拖动滑块时触发 | `{ value: number \| number[] }` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:139-148

### Slots

Slider 组件不提供插槽。

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| initSlider | 初始化滑块宽度,在容器宽度变化或滑块从隐藏变为可见时调用 | - | `void` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:153-156, 276-281, 427-429

### 类型定义

```typescript
/**
 * 滑块值类型 - 单滑块为数字,双滑块为数组
 */
type SliderValue = number | number[]

/**
 * 滑块拖动事件参数
 */
interface SliderDragEvent {
  /** 当前滑块的值,单滑块模式为数字,双滑块模式为数组 */
  value: SliderValue
}

/**
 * 滑块组件属性接口
 */
interface WdSliderProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 自定义最小值的样式类名 */
  customMinClass?: string
  /** 自定义最大值的样式类名 */
  customMaxClass?: string
  /** 是否隐藏左右的最大最小值 */
  hideMinMax?: boolean
  /** 是否隐藏当前滑块值 */
  hideLabel?: boolean
  /** 是否禁用滑块 */
  disabled?: boolean
  /** 进度条未激活的背景颜色 */
  inactiveColor?: string
  /** 进度条激活的背景颜色 */
  activeColor?: string
  /** 滑块的最大值 */
  max?: number
  /** 滑块的最小值 */
  min?: number
  /** 滑块的步进值 */
  step?: number
  /** 滑块的值,如果为数组,则为双向滑块 */
  modelValue?: SliderValue
}

/**
 * 滑块组件事件接口
 */
interface WdSliderEmits {
  /** 开始拖动滑块时触发 */
  dragstart: [event: SliderDragEvent]
  /** 拖动滑块过程中触发 */
  dragmove: [event: SliderDragEvent]
  /** 结束拖动滑块时触发 */
  dragend: [event: SliderDragEvent]
  /** 更新滑块值时触发,用于v-model绑定 */
  'update:modelValue': [value: SliderValue]
}

/**
 * 滑块组件暴露方法接口
 */
interface WdSliderExpose {
  /** 初始化slider宽度 */
  initSlider: () => void
}

/** 滑块组件实例类型 */
export type SliderInstance = ComponentPublicInstance<WdSliderProps, WdSliderExpose>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:88-156, 432

## 主题定制

### CSS 变量

Slider 组件提供了以下 CSS 变量用于主题定制:

```scss
// 滑块相关变量
$-slider-handle-radius: 28rpx;        // 滑块按钮半径
$-slider-axie-height: 8rpx;           // 进度条高度
$-slider-fs: 24rpx;                   // 字体大小
$-slider-color: #262626;              // 文字颜色
$-slider-line-color: linear-gradient(315deg, rgba(0,184,255,1) 0%, rgba(0,158,253,1) 100%);  // 激活颜色
$-slider-handle-bg: #fff;             // 滑块按钮背景色
$-slider-axie-bg: #e8e8e8;            // 进度条边框颜色
$-slider-disabled-color: #c8c9cc;     // 禁用文字颜色
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:437-458

### 暗色主题

组件内置暗色主题支持,会在 `.wot-theme-dark` 类下自动切换样式:

```scss
.wot-theme-dark {
  .wd-slider {
    // 最小最大值标签颜色
    &__label-min,
    &__label-max {
      color: $-dark-color;
    }

    // 当前值标签
    &__label {
      color: $-dark-color;
      background-color: rgba($-dark-background2, 0.5);
    }

    // 禁用状态
    &--disabled {
      .wd-slider__label-min,
      .wd-slider__label-max {
        color: $-dark-color-gray;
      }
    }
  }
}
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:440-458

## 最佳实践

### 1. 合理设置步进值

根据应用场景选择合适的步进值。

```vue
<!-- ✅ 推荐: 音量控制使用步进值 1 -->
<wd-slider v-model="volume" :min="0" :max="100" :step="1" />

<!-- ✅ 推荐: 价格筛选使用步进值 100 -->
<wd-slider v-model="price" :min="0" :max="10000" :step="100" />

<!-- ✅ 推荐: 评分使用步进值 0.5 -->
<wd-slider v-model="rating" :min="0" :max="5" :step="0.5" />

<!-- ❌ 不推荐: 大范围使用过小的步进值 -->
<wd-slider v-model="price" :min="0" :max="100000" :step="1" />
```

**说明:**
- 步进值应该与数值范围相匹配
- 范围较大时,步进值也应相应增大
- 过小的步进值会导致拖动不够流畅
- 步进值 ≤ 0 会触发警告并使用 1

### 2. 双滑块的初始值设置

正确设置双滑块的初始值。

```vue
<script setup>
import { ref } from 'vue'

// ✅ 推荐: 数组包含两个元素,且左 ≤ 右
const range1 = ref([20, 80])

// ✅ 推荐: 即使顺序颠倒,组件也会自动纠正
const range2 = ref([80, 20])  // 会被处理为 [20, 80]

// ❌ 不推荐: 数组元素少于 2 个
const range3 = ref([50])  // 会触发警告

// ❌ 不推荐: 双滑块使用单个数字
const range4 = ref(50)  // 会被当作单滑块处理
</script>
```

**说明:**
- 双滑块的 modelValue 必须是包含至少 2 个元素的数组
- 左滑块值应该 ≤ 右滑块值,组件会自动处理交叉情况
- 数组元素少于 2 个会触发警告并使用 [min, max]

### 3. 拖动事件的使用场景

根据需求选择合适的拖动事件。

```vue
<template>
  <!-- ✅ 推荐: 音量控制在拖动中实时更新 -->
  <wd-slider v-model="volume" @dragmove="updateVolume" />

  <!-- ✅ 推荐: 网络请求在拖动结束后执行 -->
  <wd-slider v-model="price" @dragend="fetchProducts" />

  <!-- ❌ 不推荐: 在 dragmove 中执行网络请求 -->
  <wd-slider v-model="price" @dragmove="fetchProducts" />
</template>

<script setup>
const updateVolume = ({ value }) => {
  // ✅ 轻量级操作,可以在 dragmove 中执行
  uni.setVolume({ value: value / 100 })
}

const fetchProducts = ({ value }) => {
  // ✅ 网络请求,应该在 dragend 中执行
  fetch(`/api/products?price=${value}`)
}
</script>
```

**说明:**
- dragmove 事件会频繁触发,只适合轻量级操作
- 网络请求、数据处理等耗时操作应该在 dragend 中执行
- dragstart 可用于记录初始状态、显示提示等

### 4. 禁用状态的正确使用

根据场景正确使用禁用状态。

```vue
<template>
  <!-- ✅ 推荐: 权限不足时禁用 -->
  <wd-slider v-model="value" :disabled="!hasPermission" />

  <!-- ✅ 推荐: 表单提交中禁用 -->
  <wd-slider v-model="value" :disabled="isSubmitting" />

  <!-- ❌ 不推荐: 仅展示时使用禁用 -->
  <wd-slider v-model="displayValue" disabled />

  <!-- ✅ 正确: 仅展示时隐藏滑块按钮即可 -->
  <wd-slider v-model="displayValue" disabled hide-label />
</template>
```

**说明:**
- 禁用状态用于临时不可用的场景,如权限不足、提交中等
- 纯展示场景可以使用禁用,但建议隐藏标签以区分
- 禁用状态下进度条会变半透明,注意视觉效果

### 5. 手动初始化的时机

正确处理需要手动初始化的场景。

```vue
<script setup>
import { ref, nextTick } from 'vue'

const sliderRef = ref()
const visible = ref(false)

// ✅ 推荐: 在 DOM 更新后初始化
const showDialog = async () => {
  visible.value = true
  await nextTick()
  sliderRef.value?.initSlider()
}

// ❌ 不推荐: 在 DOM 更新前初始化
const showDialog = () => {
  visible.value = true
  sliderRef.value?.initSlider()  // 此时 DOM 可能还未渲染
}

// ✅ 推荐: 监听容器宽度变化
const handleResize = async () => {
  await nextTick()
  sliderRef.value?.initSlider()
}
</script>
```

**说明:**
- 手动初始化应该在 DOM 更新完成后进行
- 使用 nextTick 确保 DOM 已渲染
- 容器宽度变化、从隐藏变为可见时需要重新初始化
- 大多数情况下不需要手动初始化,组件会自动处理

## 常见问题

### 1. 滑块拖不动或拖动不流畅

**问题原因:**
- 步进值设置过小,导致计算频繁
- 在 dragmove 事件中执行了耗时操作
- 滑块宽度未正确初始化
- 父容器设置了 overflow: hidden 或其他影响触摸的样式

**解决方案:**
```vue
<!-- ❌ 错误: 步进值过小 -->
<wd-slider v-model="price" :min="0" :max="100000" :step="1" />

<!-- ✅ 正确: 使用合适的步进值 -->
<wd-slider v-model="price" :min="0" :max="100000" :step="100" />

<!-- ❌ 错误: 在 dragmove 中执行网络请求 -->
<wd-slider v-model="value" @dragmove="fetchData" />

<!-- ✅ 正确: 在 dragend 中执行 -->
<wd-slider v-model="value" @dragend="fetchData" />

<script setup>
import { ref, onMounted } from 'vue'

const sliderRef = ref()

// ✅ 正确: 手动初始化宽度
onMounted(() => {
  sliderRef.value?.initSlider()
})
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:237-251, 303-324

### 2. 双滑块值不正确

**问题原因:**
- 传入的数组元素少于 2 个
- 数组元素顺序错误(左 > 右)
- 数组元素超出 min-max 范围
- 使用了单个数字而不是数组

**解决方案:**
```vue
<!-- ❌ 错误: 数组元素少于 2 个 -->
<wd-slider v-model="range" />
<script setup>
const range = ref([50])  // 触发警告
</script>

<!-- ✅ 正确: 数组包含至少 2 个元素 -->
<script setup>
const range = ref([20, 80])
</script>

<!-- ❌ 错误: 左值 > 右值 -->
<script setup>
const range = ref([80, 20])  // 会被自动纠正为 [20, 80]
</script>

<!-- ✅ 正确: 确保左值 ≤ 右值 -->
<script setup>
const range = ref([20, 80])
</script>

<!-- ❌ 错误: 值超出范围 -->
<script setup>
const range = ref([-10, 150])  // 超出 0-100 范围
</script>

<!-- ✅ 正确: 值在范围内 -->
<script setup>
const range = ref([20, 80])  // 在 0-100 范围内
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:198-209

### 3. 滑块在弹窗或标签页中显示异常

**问题原因:**
- 滑块初始化时父容器尚未显示,导致宽度计算为 0
- 标签页切换时滑块宽度未重新计算
- 弹窗显示时滑块位置不正确

**解决方案:**
```vue
<template>
  <wd-popup v-model="visible" @opened="handleOpened">
    <wd-slider ref="sliderRef" v-model="value" />
  </wd-popup>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const value = ref(50)
const sliderRef = ref()

// ✅ 正确: 在弹窗打开后初始化
const handleOpened = () => {
  sliderRef.value?.initSlider()
}

// ❌ 错误: 在弹窗打开前初始化
const showPopup = () => {
  visible.value = true
  sliderRef.value?.initSlider()  // 此时弹窗可能还未显示
}
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:276-281, 423-425

### 4. 步进值对齐不准确

**问题原因:**
- 步进值设置为小数,存在浮点数精度问题
- 步进值 ≤ 0
- 步进值与范围不匹配

**解决方案:**
```vue
<!-- ❌ 错误: 步进值 ≤ 0 -->
<wd-slider v-model="value" :step="0" />  <!-- 触发警告,使用 1 -->

<!-- ✅ 正确: 步进值 > 0 -->
<wd-slider v-model="value" :step="1" />

<!-- ❌ 错误: 步进值与范围不匹配 -->
<wd-slider v-model="value" :min="0" :max="100" :step="7" />
<!-- 100 不是 7 的倍数,最大值只能到 98 -->

<!-- ✅ 正确: 步进值是范围的约数 -->
<wd-slider v-model="value" :min="0" :max="100" :step="5" />
<!-- 100 是 5 的倍数,可以到达最大值 -->

<!-- ✅ 正确: 小数步进值使用合适的精度 -->
<wd-slider v-model="value" :min="0" :max="10" :step="0.1" />
```

**技术说明:**
- 组件使用 `Number.parseFloat(...toFixed(10))` 处理浮点数精度
- 步进值 ≤ 0 会触发警告并使用 1
- 建议步进值是范围的约数,确保可以到达最大值

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:237-251

### 5. 自定义颜色不生效

**问题原因:**
- 颜色值格式错误
- 使用了无效的 CSS 颜色值
- 渐变语法错误

**解决方案:**
```vue
<!-- ❌ 错误: 颜色值格式错误 -->
<wd-slider
  v-model="value"
  active-color="red blue"  <!-- 无效的颜色值 -->
/>

<!-- ✅ 正确: 使用有效的颜色值 -->
<wd-slider
  v-model="value"
  active-color="#FF4757"
/>

<!-- ✅ 正确: 使用 RGB -->
<wd-slider
  v-model="value"
  active-color="rgb(255, 71, 87)"
/>

<!-- ❌ 错误: 渐变语法错误 -->
<wd-slider
  v-model="value"
  active-color="gradient(red, blue)"  <!-- 无效的渐变 -->
/>

<!-- ✅ 正确: 使用正确的渐变语法 -->
<wd-slider
  v-model="value"
  active-color="linear-gradient(90deg, #FF6B6B 0%, #FF4757 100%)"
/>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:365-398

## 注意事项

1. **滑块值类型**
   - 单滑块模式下 modelValue 必须是 number 类型
   - 双滑块模式下 modelValue 必须是 number[] 类型
   - 不要在单双滑块之间动态切换类型

2. **范围设置**
   - min 和 max 必须是有效数字
   - min 可以为负数,支持负数范围
   - min 应该 < max,否则滑块行为异常

3. **步进值要求**
   - step 必须大于 0,否则触发警告并使用 1
   - 建议步进值是范围的约数,确保可以到达最大值
   - 小数步进值可能存在浮点数精度问题

4. **双滑块模式**
   - 数组必须包含至少 2 个元素,否则触发警告
   - 左滑块值会自动 ≤ 右滑块值,组件会自动纠正
   - 拖动任意滑块都不能超过另一个滑块

5. **拖动事件**
   - dragmove 事件会频繁触发,避免执行耗时操作
   - 网络请求、数据处理等应该在 dragend 中执行
   - 禁用状态下所有拖动事件都不会触发

6. **禁用状态**
   - 禁用状态下滑块按钮会隐藏
   - 进度条显示半透明效果(opacity: 0.25)
   - 禁用状态不响应任何触摸事件

7. **标签显示**
   - 当前值标签显示在滑块按钮上方
   - 隐藏标签后组件高度会减小
   - hideLabel 和 hideMinMax 可以同时使用

8. **手动初始化**
   - 大多数情况下不需要手动初始化
   - 在弹窗、标签页等场景下可能需要手动调用 initSlider
   - 初始化应该在 DOM 更新完成后进行,使用 nextTick

9. **颜色设置**
   - 颜色支持纯色、十六进制、RGB、渐变等格式
   - 渐变使用 CSS linear-gradient 语法
   - 颜色应用到进度条的 background 属性

10. **性能优化**
    - 避免在 dragmove 事件中执行复杂计算
    - 合理设置步进值,避免过于频繁的计算
    - 列表中使用时注意性能影响

11. **响应式更新**
    - 组件会自动响应 min、max、step 等属性的变化
    - modelValue 变化会自动更新滑块位置
    - 修改 Props 后不需要手动重新初始化

12. **平台兼容性**
    - 组件在 H5、小程序、App 等平台都支持
    - 触摸事件在各平台表现一致
    - 渐变颜色在某些旧版本小程序可能不支持

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-slider/wd-slider.vue:1-546
