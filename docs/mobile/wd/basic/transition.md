---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/basic/transition
---

# Transition 过渡动画

## 介绍

Transition 是 WD UI 提供的过渡动画组件,用于在元素显示和隐藏时添加平滑的过渡效果。组件基于 CSS3 transition 和 transform 属性实现,提供了丰富的内置动画类型和灵活的自定义能力,帮助开发者轻松实现各种视觉效果。

在移动端应用开发中,适当的过渡动画可以显著提升用户体验,使界面交互更加流畅自然。Transition 组件封装了复杂的动画状态管理逻辑,开发者只需关注业务逻辑,无需处理繁琐的 CSS 类名切换和动画生命周期控制。

**核心特性:**

- **丰富的内置动画** - 提供 11 种预设动画类型,包括淡入淡出、滑动、缩放等常见效果
- **灵活的动画配置** - 支持自定义动画时长、缓动函数,可分别设置进入和离开动画的持续时间
- **完整的生命周期** - 提供 before-enter、enter、after-enter、before-leave、leave、after-leave 等 7 个生命周期钩子
- **自定义 CSS 类名** - 支持完全自定义进入和离开动画的 CSS 类名,实现任意动画效果
- **动画组合** - 支持数组形式组合多个动画类型,创造更复杂的过渡效果
- **懒渲染优化** - 支持懒渲染模式,只在首次显示时才渲染内容,优化性能
- **精确的状态控制** - 基于 Promise 的状态管理,确保动画状态切换的准确性和可中断性
- **TypeScript 支持** - 完整的类型定义,提供优秀的开发体验和类型安全

参考: src/wd/components/wd-transition/wd-transition.vue:1-458

## 基本用法

### 基础动画

最基本的用法是通过 `show` 属性控制组件的显示和隐藏,组件会自动应用默认的淡入淡出动画:

```vue
<template>
  <view class="demo">
    <wd-button type="primary" @click="visible = !visible">
      {{ visible ? '隐藏' : '显示' }}
    </wd-button>

    <wd-transition :show="visible">
      <view class="content-box">
        这是一个带动画的内容区域
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
</script>

```

**使用说明:**
- `show` 属性控制组件的显示状态,为 `true` 时执行进入动画,为 `false` 时执行离开动画
- 默认使用 `fade` 淡入淡出动画,动画持续时间为 300ms
- 组件内容通过默认插槽传入,可以是任意 Vue 组件或 HTML 元素

参考: src/wd/components/wd-transition/wd-transition.vue:3-11

### 淡入淡出动画

Transition 提供了 5 种淡入淡出动画,通过 `name` 属性指定动画类型:

```vue
<template>
  <view class="demo">
    <view class="button-group">
      <wd-button size="small" @click="show1 = !show1">fade</wd-button>
      <wd-button size="small" @click="show2 = !show2">fade-up</wd-button>
      <wd-button size="small" @click="show3 = !show3">fade-down</wd-button>
      <wd-button size="small" @click="show4 = !show4">fade-left</wd-button>
      <wd-button size="small" @click="show5 = !show5">fade-right</wd-button>
    </view>

    <!-- 基础淡入淡出 -->
    <wd-transition name="fade" :show="show1">
      <view class="animation-box">淡入淡出 (fade)</view>
    </wd-transition>

    <!-- 向上淡入淡出 -->
    <wd-transition name="fade-up" :show="show2">
      <view class="animation-box">向上淡入淡出 (fade-up)</view>
    </wd-transition>

    <!-- 向下淡入淡出 -->
    <wd-transition name="fade-down" :show="show3">
      <view class="animation-box">向下淡入淡出 (fade-down)</view>
    </wd-transition>

    <!-- 向左淡入淡出 -->
    <wd-transition name="fade-left" :show="show4">
      <view class="animation-box">向左淡入淡出 (fade-left)</view>
    </wd-transition>

    <!-- 向右淡入淡出 -->
    <wd-transition name="fade-right" :show="show5">
      <view class="animation-box">向右淡入淡出 (fade-right)</view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show1 = ref(false)
const show2 = ref(false)
const show3 = ref(false)
const show4 = ref(false)
const show5 = ref(false)
</script>

```

**动画效果说明:**
- **fade**: 纯粹的淡入淡出效果,只改变透明度 (opacity: 0 → 1)
- **fade-up**: 从下方淡入,离开时向下淡出 (translate3d(0, 100%, 0) + opacity)
- **fade-down**: 从上方淡入,离开时向上淡出 (translate3d(0, -100%, 0) + opacity)
- **fade-left**: 从左侧淡入,离开时向左淡出 (translate3d(-100%, 0, 0) + opacity)
- **fade-right**: 从右侧淡入,离开时向右淡出 (translate3d(100%, 0, 0) + opacity)

**技术实现:**
- 使用 `transform: translate3d()` 实现位移动画,开启 GPU 硬件加速
- 结合 `opacity` 实现透明度变化
- 使用 `transition-property` 同时过渡 transform 和 opacity 属性

参考: src/wd/components/wd-transition/wd-transition.vue:354-444

### 滑动动画

滑动动画类似淡入淡出,但不改变透明度,只有位移效果,适合全屏或大面积内容的切换:

```vue
<template>
  <view class="demo">
    <view class="button-group">
      <wd-button size="small" @click="show1 = !show1">slide-up</wd-button>
      <wd-button size="small" @click="show2 = !show2">slide-down</wd-button>
      <wd-button size="small" @click="show3 = !show3">slide-left</wd-button>
      <wd-button size="small" @click="show4 = !show4">slide-right</wd-button>
    </view>

    <!-- 向上滑入 -->
    <wd-transition name="slide-up" :show="show1">
      <view class="slide-panel slide-up-panel">
        <view class="panel-header">
          <text class="panel-title">底部弹窗</text>
          <wd-icon name="close" @click="show1 = false" />
        </view>
        <view class="panel-content">向上滑入动画,常用于底部弹窗、菜单等场景</view>
      </view>
    </wd-transition>

    <!-- 向下滑入 -->
    <wd-transition name="slide-down" :show="show2">
      <view class="slide-panel slide-down-panel">
        <view class="panel-header">
          <text class="panel-title">顶部通知</text>
          <wd-icon name="close" @click="show2 = false" />
        </view>
        <view class="panel-content">向下滑入动画,常用于顶部通知、提示等场景</view>
      </view>
    </wd-transition>

    <!-- 向左滑入 -->
    <wd-transition name="slide-left" :show="show3">
      <view class="slide-panel slide-side-panel">
        <view class="panel-header">
          <text class="panel-title">右侧抽屉</text>
          <wd-icon name="close" @click="show3 = false" />
        </view>
        <view class="panel-content">向左滑入动画,常用于右侧抽屉、侧边栏等场景</view>
      </view>
    </wd-transition>

    <!-- 向右滑入 -->
    <wd-transition name="slide-right" :show="show4">
      <view class="slide-panel slide-side-panel" style="left: 0;">
        <view class="panel-header">
          <text class="panel-title">左侧抽屉</text>
          <wd-icon name="close" @click="show4 = false" />
        </view>
        <view class="panel-content">向右滑入动画,常用于左侧导航、菜单等场景</view>
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show1 = ref(false)
const show2 = ref(false)
const show3 = ref(false)
const show4 = ref(false)
</script>

```

**动画效果说明:**
- **slide-up**: 从底部滑入,离开时向底部滑出,适合底部弹窗、操作面板
- **slide-down**: 从顶部滑入,离开时向顶部滑出,适合顶部通知、下拉菜单
- **slide-left**: 从右侧滑入,离开时向右侧滑出,适合右侧抽屉
- **slide-right**: 从左侧滑入,离开时向左侧滑出,适合左侧导航

**技术实现:**
- 使用 `transform: translate3d()` 实现位移动画
- 不改变透明度,只有位移效果
- 使用 `transition-property: transform` 仅过渡 transform 属性

参考: src/wd/components/wd-transition/wd-transition.vue:393-456

### 缩放动画

缩放动画通过改变元素的缩放比例和透明度,创造出放大或缩小的视觉效果:

```vue
<template>
  <view class="demo">
    <view class="button-group">
      <wd-button size="small" @click="show1 = !show1">zoom-in</wd-button>
      <wd-button size="small" @click="show2 = !show2">zoom-out</wd-button>
    </view>

    <!-- 缩小进入 -->
    <wd-transition name="zoom-in" :show="show1">
      <view class="zoom-box">
        <view class="zoom-content">
          <wd-icon name="success" size="48" color="#52c41a" />
          <text class="zoom-title">缩小进入 (zoom-in)</text>
          <text class="zoom-desc">从 0.8 倍放大到 1 倍,适合提示、对话框等场景</text>
        </view>
      </view>
    </wd-transition>

    <!-- 放大进入 -->
    <wd-transition name="zoom-out" :show="show2">
      <view class="zoom-box">
        <view class="zoom-content">
          <wd-icon name="warning" size="48" color="#faad14" />
          <text class="zoom-title">放大进入 (zoom-out)</text>
          <text class="zoom-desc">从 1.2 倍缩小到 1 倍,适合特殊效果、强调显示</text>
        </view>
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show1 = ref(false)
const show2 = ref(false)
</script>

```

**动画效果说明:**
- **zoom-in**: 从 0.8 倍缩放到 1 倍,配合透明度变化,效果为缩小进入
- **zoom-out**: 从 1.2 倍缩放到 1 倍,配合透明度变化,效果为放大进入

**技术实现:**
- 使用 `transform: scale()` 实现缩放效果
- 结合 `opacity` 实现透明度变化
- 使用 `transition-property: opacity, transform` 同时过渡两个属性

**使用场景:**
- **zoom-in**: 对话框、模态框、提示框、成功/失败提示等
- **zoom-out**: 特殊强调效果、游戏化交互、奖励提示等

参考: src/wd/components/wd-transition/wd-transition.vue:417-444

### 自定义动画时长

通过 `duration` 属性可以自定义动画的持续时间,支持统一设置或分别设置进入和离开动画的时长:

```vue
<template>
  <view class="demo">
    <wd-button @click="show1 = !show1">快速动画 (100ms)</wd-button>
    <wd-transition name="fade" :show="show1" :duration="100">
      <view class="animation-box">快速动画效果</view>
    </wd-transition>

    <wd-button @click="show2 = !show2">慢速动画 (1000ms)</wd-button>
    <wd-transition name="fade" :show="show2" :duration="1000">
      <view class="animation-box">慢速动画效果</view>
    </wd-transition>

    <wd-button @click="show3 = !show3">不同进入/离开时长</wd-button>
    <wd-transition
      name="slide-up"
      :show="show3"
      :duration="{ enter: 500, leave: 300 }"
    >
      <view class="animation-box">
        进入动画 500ms,离开动画 300ms
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show1 = ref(false)
const show2 = ref(false)
const show3 = ref(false)
</script>

```

**使用说明:**
- `duration` 可以是数字(单位毫秒),统一设置进入和离开动画时长
- `duration` 可以是对象 `{ enter: number, leave: number }`,分别设置进入和离开动画时长
- 建议时长范围: 100-500ms,过短会显得生硬,过长会影响用户体验

**技术实现:**
- 组件内部根据 `duration` 的类型判断是统一时长还是分别设置
- 通过 CSS `transition-duration` 属性控制动画时长
- 离开动画结束后使用定时器确保生命周期回调正确触发

参考: src/wd/components/wd-transition/wd-transition.vue:213-224,273-280

### 动画组合

`name` 属性支持数组形式,可以组合多个动画类型,创造更复杂的过渡效果:

```vue
<template>
  <view class="demo">
    <wd-button @click="show1 = !show1">淡入 + 向上滑入</wd-button>
    <wd-transition :name="['fade', 'slide-up']" :show="show1">
      <view class="combination-box">
        <text class="title">组合动画 1</text>
        <text class="desc">同时应用淡入淡出和向上滑动效果</text>
      </view>
    </wd-transition>

    <wd-button @click="show2 = !show2">淡入 + 缩放</wd-button>
    <wd-transition :name="['fade', 'zoom-in']" :show="show2" :duration="500">
      <view class="combination-box">
        <text class="title">组合动画 2</text>
        <text class="desc">同时应用淡入淡出和缩放效果,打造更平滑的视觉体验</text>
      </view>
    </wd-transition>

    <wd-button @click="show3 = !show3">向右滑入 + 淡入</wd-button>
    <wd-transition :name="['slide-right', 'fade']" :show="show3">
      <view class="combination-box">
        <text class="title">组合动画 3</text>
        <text class="desc">向右滑入同时淡入,适合侧边栏、抽屉等场景</text>
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show1 = ref(false)
const show2 = ref(false)
const show3 = ref(false)
</script>

```

**使用说明:**
- `name` 属性传入数组时,会同时应用所有指定的动画效果
- 数组中的动画类型会按顺序叠加 CSS 类名
- 适合创造更丰富的视觉效果,但不要过度使用,避免动画过于复杂

**技术实现:**
- 通过 `getClassNames` 方法处理数组形式的 `name` 属性
- 循环遍历数组,依次添加每个动画类型的 CSS 类名
- 多个动画的 `transition-property` 会合并生效

参考: src/wd/components/wd-transition/wd-transition.vue:177-203

## 自定义动画

### 自定义 CSS 类名

通过自定义 CSS 类名,可以实现任意动画效果,不受内置动画类型限制:

```vue
<template>
  <view class="demo">
    <wd-button @click="show1 = !show1">旋转进入</wd-button>
    <wd-transition
      :show="show1"
      enter-class="custom-enter"
      enter-active-class="custom-enter-active"
      enter-to-class="custom-enter-to"
      leave-class="custom-leave"
      leave-active-class="custom-leave-active"
      leave-to-class="custom-leave-to"
    >
      <view class="custom-box">
        <wd-icon name="star" size="48" color="#faad14" />
        <text>360° 旋转进入动画</text>
      </view>
    </wd-transition>

    <wd-button @click="show2 = !show2">弹跳进入</wd-button>
    <wd-transition
      :show="show2"
      enter-class="bounce-enter"
      enter-active-class="bounce-enter-active"
      enter-to-class="bounce-enter-to"
      leave-class="bounce-leave"
      leave-active-class="bounce-leave-active"
      leave-to-class="bounce-leave-to"
      :duration="600"
    >
      <view class="custom-box">
        <wd-icon name="gift" size="48" color="#f56c6c" />
        <text>弹跳进入动画</text>
      </view>
    </wd-transition>

    <wd-button @click="show3 = !show3">3D 翻转</wd-button>
    <wd-transition
      :show="show3"
      enter-class="flip-enter"
      enter-active-class="flip-enter-active"
      enter-to-class="flip-enter-to"
      leave-class="flip-leave"
      leave-active-class="flip-leave-active"
      leave-to-class="flip-leave-to"
      :duration="500"
    >
      <view class="custom-box">
        <wd-icon name="refresh" size="48" color="#52c41a" />
        <text>3D 翻转动画</text>
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show1 = ref(false)
const show2 = ref(false)
const show3 = ref(false)
</script>

```

**自定义类名说明:**
- **enter-class**: 进入动画的起始状态,定义元素进入前的样式
- **enter-active-class**: 进入动画的激活状态,定义过渡效果(transition 属性)
- **enter-to-class**: 进入动画的结束状态,定义元素进入后的样式
- **leave-class**: 离开动画的起始状态,定义元素离开前的样式
- **leave-active-class**: 离开动画的激活状态,定义过渡效果
- **leave-to-class**: 离开动画的结束状态,定义元素离开后的样式

**技术实现:**
- 自定义类名会与内置动画类名合并,自定义类名优先级更高
- 支持所有 CSS3 transform、opacity、filter 等动画属性
- 建议使用 `cubic-bezier` 缓动函数创造更自然的动画效果

参考: src/wd/components/wd-transition/wd-transition.vue:65-75,177-203

### 完全自定义动画

不使用 `name` 属性,只通过自定义 CSS 类名实现完全自定义的动画效果:

```vue
<template>
  <view class="demo">
    <wd-button @click="show = !show">心跳动画</wd-button>

    <wd-transition
      :show="show"
      enter-class="heartbeat-enter"
      enter-active-class="heartbeat-enter-active"
      enter-to-class="heartbeat-enter-to"
      leave-class="heartbeat-leave"
      leave-active-class="heartbeat-leave-active"
      leave-to-class="heartbeat-leave-to"
      :duration="800"
    >
      <view class="heartbeat-box">
        <wd-icon name="heart-fill" size="64" color="#f56c6c" />
        <text class="heartbeat-text">❤️ 心跳效果 ❤️</text>
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
</script>

```

**使用说明:**
- 可以使用 CSS `animation` 和 `@keyframes` 创建更复杂的动画效果
- 不依赖内置动画类型,完全由开发者控制动画细节
- 适合特殊场景的动画需求,如游戏化交互、品牌特色动画等

参考: src/wd/components/wd-transition/wd-transition.vue:177-203

## 高级特性

### 懒渲染

通过 `lazy-render` 属性开启懒渲染模式,组件内容只在首次显示时才渲染,可以优化初始渲染性能:

```vue
<template>
  <view class="demo">
    <view class="info-box">
      <text>当前时间: {{ currentTime }}</text>
      <text>弹窗内容渲染时间: {{ modalRenderTime || '未渲染' }}</text>
    </view>

    <wd-button @click="show1 = !show1">普通模式(立即渲染)</wd-button>
    <wd-transition name="fade" :show="show1">
      <view class="modal-content">
        <text>普通模式</text>
        <text>组件内容在页面加载时就已经渲染,即使未显示</text>
      </view>
    </wd-transition>

    <wd-button @click="show2 = !show2">懒渲染模式</wd-button>
    <wd-transition name="fade" :show="show2" :lazy-render="true">
      <view class="modal-content">
        <text>懒渲染模式</text>
        <text>组件内容只在首次显示时才渲染,优化性能</text>
        <text>渲染时间: {{ modalRenderTime }}</text>
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const show1 = ref(false)
const show2 = ref(false)
const currentTime = ref('')
const modalRenderTime = ref('')

// 更新当前时间
setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString()
}, 1000)

// 监听 show2 变化,记录首次渲染时间
watch(show2, (newVal) => {
  if (newVal && !modalRenderTime.value) {
    modalRenderTime.value = new Date().toLocaleTimeString()
  }
})
</script>

```

**使用说明:**
- `lazy-render` 设置为 `true` 时,组件内容只在 `show` 首次变为 `true` 时才渲染
- 适合内容较多、渲染成本较高的场景,如复杂表单、图表、长列表等
- 一旦渲染后,即使 `show` 变为 `false`,内容也会保留在 DOM 中(通过 CSS 隐藏)

**技术实现:**
- 使用 `inited` 状态标记是否已经初始化渲染
- 通过 `v-if="!lazyRender || inited"` 控制内容的条件渲染
- 首次进入动画时设置 `inited.value = true`

参考: src/wd/components/wd-transition/wd-transition.vue:4,58,118,228

### 销毁控制

通过 `destroy` 属性控制动画结束后是否销毁子节点,默认为 `true`:

```vue
<template>
  <view class="demo">
    <view class="info-box">
      <text>打开开发者工具查看 DOM 结构变化</text>
    </view>

    <wd-button @click="show1 = !show1">销毁模式 (destroy=true)</wd-button>
    <wd-transition name="fade" :show="show1" :destroy="true">
      <view class="content-box">
        <text>销毁模式</text>
        <text>离开动画结束后,元素会通过 display:none 隐藏</text>
        <text>DOM 节点保留,但不占用渲染资源</text>
      </view>
    </wd-transition>

    <wd-button @click="show2 = !show2">保留模式 (destroy=false)</wd-button>
    <wd-transition name="fade" :show="show2" :destroy="false">
      <view class="content-box">
        <text>保留模式</text>
        <text>离开动画结束后,元素仍然可见(通过 opacity:0 隐藏)</text>
        <text>适合需要保持布局空间的场景</text>
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show1 = ref(false)
const show2 = ref(false)
</script>

```

**使用说明:**
- `destroy` 设置为 `true` 时,离开动画结束后元素会通过 `display: none` 隐藏
- `destroy` 设置为 `false` 时,离开动画结束后元素仍然保持在文档流中
- 默认值为 `true`,推荐大多数场景使用

**技术实现:**
- 通过 `display` 状态和 `destroy` 属性控制元素的显示和隐藏
- 使用内联样式动态设置 `display: none`
- 离开动画结束后根据 `destroy` 属性决定是否设置 `display.value = false`

参考: src/wd/components/wd-transition/wd-transition.vue:6,62,105,167-169

### 生命周期钩子

Transition 组件提供了完整的动画生命周期钩子,可以在动画的各个阶段执行自定义逻辑:

```vue
<template>
  <view class="demo">
    <view class="log-box">
      <text class="log-title">动画生命周期日志:</text>
      <text
        v-for="(log, index) in logs"
        :key="index"
        class="log-item"
      >
        {{ log }}
      </text>
    </view>

    <wd-button @click="show = !show">
      {{ show ? '隐藏' : '显示' }}
    </wd-button>

    <wd-transition
      name="slide-up"
      :show="show"
      :duration="500"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @before-leave="onBeforeLeave"
      @leave="onLeave"
      @after-leave="onAfterLeave"
      @click="onClick"
    >
      <view class="lifecycle-box">
        <text class="title">生命周期示例</text>
        <text class="desc">点击切换按钮查看生命周期日志输出</text>
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const logs = ref<string[]>([])

// 添加日志
const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${message}`)
  // 保留最近 10 条日志
  if (logs.value.length > 10) {
    logs.value.pop()
  }
}

// 进入前触发
const onBeforeEnter = () => {
  addLog('🔵 before-enter: 进入动画开始前')
}

// 进入时触发
const onEnter = () => {
  addLog('🟢 enter: 进入动画开始')
}

// 进入后触发
const onAfterEnter = () => {
  addLog('✅ after-enter: 进入动画结束')
}

// 离开前触发
const onBeforeLeave = () => {
  addLog('🟡 before-leave: 离开动画开始前')
}

// 离开时触发
const onLeave = () => {
  addLog('🟠 leave: 离开动画开始')
}

// 离开后触发
const onAfterLeave = () => {
  addLog('🔴 after-leave: 离开动画结束')
}

// 点击事件
const onClick = () => {
  addLog('👆 click: 点击了动画内容')
}
</script>

```

**生命周期说明:**

| 钩子 | 触发时机 | 说明 |
|------|---------|------|
| before-enter | 进入动画开始前 | 元素即将进入,可以进行进入前的准备工作 |
| enter | 进入动画开始 | 进入动画开始执行,此时进入类名已应用 |
| after-enter | 进入动画结束 | 进入动画完全结束,元素已完全显示 |
| before-leave | 离开动画开始前 | 元素即将离开,可以进行离开前的准备工作 |
| leave | 离开动画开始 | 离开动画开始执行,此时离开类名已应用 |
| after-leave | 离开动画结束 | 离开动画完全结束,元素已完全隐藏 |
| click | 点击元素 | 点击动画内容时触发 |

**使用场景:**
- **before-enter**: 记录日志、数据初始化、动画前置条件检查
- **enter**: 开始加载数据、显示 loading 状态
- **after-enter**: 数据加载完成、聚焦输入框、启动定时器
- **before-leave**: 保存表单数据、停止定时器
- **leave**: 清理资源、取消请求
- **after-leave**: 重置状态、释放内存、触发下一步操作

参考: src/wd/components/wd-transition/wd-transition.vue:81-96,154-170,209-243,263-302

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| show | 是否展示组件 | `boolean` | `false` |
| name | 动画类型,支持数组组合 | `TransitionName \| TransitionName[]` | - |
| duration | 动画执行时间(毫秒),支持对象分别设置进入和离开时长 | `number \| { enter: number; leave: number }` | `300` |
| lazy-render | 弹层内容懒渲染,触发展示时才渲染内容 | `boolean` | `false` |
| destroy | 是否在动画结束时销毁子节点(display: none) | `boolean` | `true` |
| enter-class | 进入过渡的开始状态自定义类名 | `string` | `''` |
| enter-active-class | 进入过渡的激活状态自定义类名 | `string` | `''` |
| enter-to-class | 进入过渡的结束状态自定义类名 | `string` | `''` |
| leave-class | 离开过渡的开始状态自定义类名 | `string` | `''` |
| leave-active-class | 离开过渡的激活状态自定义类名 | `string` | `''` |
| leave-to-class | 离开过渡的结束状态自定义类名 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

参考: src/wd/components/wd-transition/wd-transition.vue:47-76,99-112

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击时触发 | - |
| before-enter | 进入前触发 | - |
| enter | 进入时触发 | - |
| after-enter | 进入后触发 | - |
| before-leave | 离开前触发 | - |
| leave | 离开时触发 | - |
| after-leave | 离开后触发 | - |

参考: src/wd/components/wd-transition/wd-transition.vue:81-96

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 默认插槽,需要添加过渡效果的内容 |

参考: src/wd/components/wd-transition/wd-transition.vue:10

### 类型定义

```typescript
/**
 * 过渡动画类型
 */
export type TransitionName =
  | 'fade'           // 淡入淡出
  | 'fade-down'      // 向下淡入淡出
  | 'fade-left'      // 向左淡入淡出
  | 'fade-right'     // 向右淡入淡出
  | 'fade-up'        // 向上淡入淡出
  | 'slide-down'     // 向下滑动
  | 'slide-left'     // 向左滑动
  | 'slide-right'    // 向右滑动
  | 'slide-up'       // 向上滑动
  | 'zoom-in'        // 缩小进入
  | 'zoom-out'       // 放大进入

/**
 * 过渡组件属性接口
 */
interface WdTransitionProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 是否展示组件 */
  show?: boolean
  /** 动画执行时间,单位毫秒 */
  duration?: Record<string, number> | number | boolean
  /** 弹层内容懒渲染,触发展示时才渲染内容 */
  lazyRender?: boolean
  /** 动画类型 */
  name?: TransitionName | TransitionName[]
  /** 是否在动画结束时销毁子节点(display: none) */
  destroy?: boolean

  /** 进入过渡的开始状态 */
  enterClass?: string
  /** 进入过渡的激活状态 */
  enterActiveClass?: string
  /** 进入过渡的结束状态 */
  enterToClass?: string
  /** 离开过渡的开始状态 */
  leaveClass?: string
  /** 离开过渡的激活状态 */
  leaveActiveClass?: string
  /** 离开过渡的结束状态 */
  leaveToClass?: string
}

/**
 * 过渡组件事件接口
 */
interface WdTransitionEmits {
  /** 点击时触发 */
  click: []
  /** 进入前触发 */
  'before-enter': []
  /** 进入时触发 */
  enter: []
  /** 离开前触发 */
  'before-leave': []
  /** 离开时触发 */
  leave: []
  /** 离开后触发 */
  'after-leave': []
  /** 进入后触发 */
  'after-enter': []
}
```

参考: src/wd/components/wd-transition/wd-transition.vue:28-96

## 内置动画类型

### 淡入淡出系列

淡入淡出动画通过改变透明度和位置实现,视觉效果柔和平滑:

| 动画类型 | 效果描述 | CSS 实现 | 使用场景 |
|---------|---------|----------|---------|
| `fade` | 纯粹的淡入淡出 | `opacity: 0 → 1` | 提示信息、轻量级内容 |
| `fade-up` | 从下方淡入 | `translate3d(0, 100%, 0) + opacity` | 底部弹窗、操作菜单 |
| `fade-down` | 从上方淡入 | `translate3d(0, -100%, 0) + opacity` | 顶部通知、下拉菜单 |
| `fade-left` | 从左侧淡入 | `translate3d(-100%, 0, 0) + opacity` | 左侧内容切换 |
| `fade-right` | 从右侧淡入 | `translate3d(100%, 0, 0) + opacity` | 右侧内容切换、步骤切换 |

参考: src/wd/components/wd-transition/wd-transition.vue:354-444

### 滑动系列

滑动动画只改变位置,不改变透明度,适合大面积内容的切换:

| 动画类型 | 效果描述 | CSS 实现 | 使用场景 |
|---------|---------|----------|---------|
| `slide-up` | 向上滑入 | `translate3d(0, 100%, 0)` | 底部操作面板、筛选器 |
| `slide-down` | 向下滑入 | `translate3d(0, -100%, 0)` | 顶部搜索框、筛选条件 |
| `slide-left` | 向左滑入 | `translate3d(-100%, 0, 0)` | 右侧抽屉、详情页 |
| `slide-right` | 向右滑入 | `translate3d(100%, 0, 0)` | 左侧导航、侧边栏 |

参考: src/wd/components/wd-transition/wd-transition.vue:393-456

### 缩放系列

缩放动画通过改变元素的缩放比例和透明度,创造出放大或缩小的视觉效果:

| 动画类型 | 效果描述 | CSS 实现 | 使用场景 |
|---------|---------|----------|---------|
| `zoom-in` | 从 0.8 倍放大到 1 倍 | `scale(0.8) → scale(1) + opacity` | 对话框、模态框、提示框 |
| `zoom-out` | 从 1.2 倍缩小到 1 倍 | `scale(1.2) → scale(1) + opacity` | 特殊强调、游戏化效果 |

参考: src/wd/components/wd-transition/wd-transition.vue:417-444

## 最佳实践

### 1. 选择合适的动画类型

根据内容的位置、交互方式选择合适的动画类型:

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐: 底部内容使用 slide-up 或 fade-up -->
    <wd-transition name="slide-up" :show="showBottom">
      <view class="bottom-panel">底部操作面板</view>
    </wd-transition>

    <!-- ✅ 推荐: 模态框使用 zoom-in -->
    <wd-transition name="zoom-in" :show="showModal">
      <view class="modal-dialog">提示对话框</view>
    </wd-transition>

    <!-- ✅ 推荐: 侧边栏使用 slide-right 或 slide-left -->
    <wd-transition name="slide-right" :show="showSidebar">
      <view class="sidebar">侧边导航</view>
    </wd-transition>

    <!-- ❌ 不推荐: 底部内容使用 slide-down(方向不符) -->
    <wd-transition name="slide-down" :show="showBottom">
      <view class="bottom-panel">底部面板</view>
    </wd-transition>
  </view>
</template>
```

**选择原则:**
- 动画方向应与内容位置一致
- 重要提示使用 zoom-in,视觉冲击力强
- 大面积内容使用 slide 系列,不改变透明度
- 小面积内容使用 fade 系列,视觉效果柔和

### 2. 合理设置动画时长

动画时长应根据内容大小和复杂度调整:

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐: 小提示使用短动画 -->
    <wd-transition name="fade" :show="showToast" :duration="200">
      <view class="toast">操作成功</view>
    </wd-transition>

    <!-- ✅ 推荐: 模态框使用中等动画 -->
    <wd-transition name="zoom-in" :show="showDialog" :duration="300">
      <view class="dialog">确认对话框</view>
    </wd-transition>

    <!-- ✅ 推荐: 大面积内容使用稍长动画 -->
    <wd-transition name="slide-up" :show="showPanel" :duration="400">
      <view class="panel">详细内容面板</view>
    </wd-transition>

    <!-- ✅ 推荐: 进入慢、离开快 -->
    <wd-transition
      name="slide-up"
      :show="showSheet"
      :duration="{ enter: 400, leave: 300 }"
    >
      <view class="action-sheet">操作菜单</view>
    </wd-transition>

    <!-- ❌ 不推荐: 动画过长,影响体验 -->
    <wd-transition name="fade" :show="showToast" :duration="1000">
      <view class="toast">操作成功</view>
    </wd-transition>
  </view>
</template>
```

**时长建议:**
- 小提示、Toast: 150-250ms
- 模态框、对话框: 250-350ms
- 大面积内容、抽屉: 350-500ms
- 一般情况下,离开动画应比进入动画快 50-100ms

### 3. 使用懒渲染优化性能

对于渲染成本较高的内容,使用 `lazy-render` 优化性能:

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐: 复杂内容使用懒渲染 -->
    <wd-transition name="slide-up" :show="show1" :lazy-render="true">
      <view class="complex-panel">
        <!-- 包含大量数据、图表、长列表等 -->
        <ComplexChart :data="chartData" />
        <LongList :items="listItems" />
      </view>
    </wd-transition>

    <!-- ✅ 推荐: 简单内容不使用懒渲染 -->
    <wd-transition name="fade" :show="show2">
      <view class="simple-toast">操作成功</view>
    </wd-transition>

    <!-- ❌ 不推荐: 复杂内容不使用懒渲染 -->
    <wd-transition name="slide-up" :show="show3">
      <view class="complex-panel">
        <!-- 页面加载时就渲染,影响初始性能 -->
        <ComplexChart :data="chartData" />
      </view>
    </wd-transition>
  </view>
</template>
```

**使用场景:**
- 包含大量 DOM 节点的内容
- 需要请求数据才能展示的内容
- 包含复杂计算或渲染的组件
- 可能长时间不显示的内容

### 4. 利用生命周期钩子

合理使用生命周期钩子处理数据加载、资源清理等逻辑:

```vue
<template>
  <view class="demo">
    <wd-transition
      name="slide-up"
      :show="showPanel"
      @before-enter="onBeforeEnter"
      @after-enter="onAfterEnter"
      @before-leave="onBeforeLeave"
      @after-leave="onAfterLeave"
    >
      <view class="data-panel">
        <view v-if="loading" class="loading">加载中...</view>
        <view v-else class="data-content">{{ data }}</view>
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showPanel = ref(false)
const loading = ref(false)
const data = ref('')
let timer: NodeJS.Timeout | null = null

// ✅ 推荐: 进入前准备数据
const onBeforeEnter = () => {
  loading.value = true
}

// ✅ 推荐: 进入后加载数据
const onAfterEnter = async () => {
  // 模拟数据加载
  await new Promise(resolve => setTimeout(resolve, 1000))
  data.value = '加载的数据内容'
  loading.value = false

  // 启动定时器
  timer = setInterval(() => {
    console.log('定时器运行中')
  }, 1000)
}

// ✅ 推荐: 离开前停止定时器
const onBeforeLeave = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// ✅ 推荐: 离开后重置状态
const onAfterLeave = () => {
  data.value = ''
  loading.value = false
}
</script>
```

**生命周期使用建议:**
- **before-enter**: 初始化状态、显示 loading
- **after-enter**: 加载数据、聚焦输入框、启动定时器
- **before-leave**: 停止定时器、取消请求
- **after-leave**: 重置状态、清理资源

### 5. 组合动画创造更好的效果

使用数组组合多个动画类型,创造更丰富的视觉效果:

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐: 淡入 + 滑动,视觉效果更柔和 -->
    <wd-transition :name="['fade', 'slide-up']" :show="show1">
      <view class="panel">底部面板</view>
    </wd-transition>

    <!-- ✅ 推荐: 淡入 + 缩放,模态框效果更好 -->
    <wd-transition :name="['fade', 'zoom-in']" :show="show2">
      <view class="modal">对话框</view>
    </wd-transition>

    <!-- ❌ 不推荐: 过度组合,动画过于复杂 -->
    <wd-transition :name="['fade', 'slide-up', 'zoom-in']" :show="show3">
      <view class="panel">过度复杂的动画</view>
    </wd-transition>
  </view>
</template>
```

**组合建议:**
- 最多组合 2 个动画类型
- fade 可以与任何动画组合,增加柔和感
- slide + zoom 组合不推荐,效果冲突
- 测试实际效果,避免过度设计

参考: src/wd/components/wd-transition/wd-transition.vue:177-203

## 常见问题

### 1. 动画不生效

**问题原因:**
- `show` 属性未正确绑定响应式数据
- 动画时长设置为 0 或过小
- CSS 样式被覆盖或优先级不足
- 在小程序中使用了不支持的 CSS 属性

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ❌ 错误: show 使用了静态值 -->
    <wd-transition name="fade" :show="false">
      <view class="content">内容</view>
    </wd-transition>

    <!-- ✅ 正确: show 绑定响应式数据 -->
    <wd-transition name="fade" :show="visible">
      <view class="content">内容</view>
    </wd-transition>

    <!-- ❌ 错误: 动画时长为 0 -->
    <wd-transition name="fade" :show="visible" :duration="0">
      <view class="content">内容</view>
    </wd-transition>

    <!-- ✅ 正确: 设置合理的动画时长 -->
    <wd-transition name="fade" :show="visible" :duration="300">
      <view class="content">内容</view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// ✅ 正确: 使用 ref 创建响应式数据
const visible = ref(false)
</script>

```

参考: src/wd/components/wd-transition/wd-transition.vue:54,56,320-326

### 2. 离开动画不执行

**问题原因:**
- `destroy` 设置为 `false`,但期望完全隐藏元素
- 进入动画还未完成就触发离开动画
- 生命周期钩子中有异常导致动画中断

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐: 使用默认的 destroy=true -->
    <wd-transition name="fade" :show="show1">
      <view class="content">内容</view>
    </wd-transition>

    <!-- ✅ 确保动画完成后再切换状态 -->
    <wd-button @click="handleToggle">切换</wd-button>
    <wd-transition
      name="fade"
      :show="show2"
      :duration="300"
      @after-leave="onAfterLeave"
    >
      <view class="content">内容</view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show1 = ref(false)
const show2 = ref(false)
let isAnimating = false

// ✅ 推荐: 防止动画执行过程中频繁切换
const handleToggle = () => {
  if (isAnimating) return
  isAnimating = true
  show2.value = !show2.value
}

const onAfterLeave = () => {
  isAnimating = false
}

// ❌ 不推荐: 快速切换导致动画中断
const handleBadToggle = () => {
  show2.value = true
  setTimeout(() => {
    show2.value = false // 进入动画可能还未完成
  }, 50)
}
</script>
```

**技术原理:**
- 组件内部使用 `AbortablePromise` 管理动画状态
- 快速切换会中断之前的动画 Promise
- 离开动画依赖进入动画完成

参考: src/wd/components/wd-transition/wd-transition.vue:134-148,263-302

### 3. 自定义动画类名不生效

**问题原因:**
- CSS 类名拼写错误
- 样式优先级不足
- 忘记定义 `-active` 类名
- 在小程序中使用了不支持的 CSS 属性

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ❌ 错误: 只定义了 enter-class,没有 enter-active-class -->
    <wd-transition
      :show="show1"
      enter-class="my-enter"
    >
      <view class="content">内容</view>
    </wd-transition>

    <!-- ✅ 正确: 完整定义所有需要的类名 -->
    <wd-transition
      :show="show2"
      enter-class="my-enter"
      enter-active-class="my-enter-active"
      enter-to-class="my-enter-to"
      leave-class="my-leave"
      leave-active-class="my-leave-active"
      leave-to-class="my-leave-to"
    >
      <view class="content">内容</view>
    </wd-transition>
  </view>
</template>

```

参考: src/wd/components/wd-transition/wd-transition.vue:65-75,177-203

### 4. 懒渲染后内容不显示

**问题原因:**
- `lazy-render` 设置为 `true`,但首次 `show` 为 `false`
- 内容依赖的数据在渲染时还未准备好
- 条件渲染 `v-if` 冲突

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ❌ 错误: 懒渲染 + v-if 冲突 -->
    <wd-transition :show="show1" :lazy-render="true">
      <view v-if="dataReady" class="content">{{ data }}</view>
    </wd-transition>

    <!-- ✅ 正确: 懒渲染 + v-show 或条件内容 -->
    <wd-transition
      :show="show2"
      :lazy-render="true"
      @before-enter="loadData"
    >
      <view class="content">
        <view v-if="loading">加载中...</view>
        <view v-else>{{ data }}</view>
      </view>
    </wd-transition>

    <!-- ✅ 正确: 在生命周期钩子中准备数据 -->
    <wd-transition
      :show="show3"
      :lazy-render="true"
      @after-enter="onAfterEnter"
    >
      <view class="content">{{ data }}</view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show1 = ref(false)
const show2 = ref(false)
const show3 = ref(false)
const data = ref('')
const loading = ref(false)

// ✅ 推荐: 在进入前加载数据
const loadData = () => {
  loading.value = true
  // 加载数据逻辑
}

// ✅ 推荐: 在进入后确保数据已准备好
const onAfterEnter = async () => {
  await fetchData()
}

const fetchData = async () => {
  // 模拟数据加载
  await new Promise(resolve => setTimeout(resolve, 1000))
  data.value = '加载的数据'
}
</script>
```

参考: src/wd/components/wd-transition/wd-transition.vue:4,58,118,228

### 5. 在小程序中动画性能差

**问题原因:**
- 使用了复杂的 3D 变换
- 动画时长过长
- 同时运行多个动画
- 动画元素层级过深

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ❌ 不推荐: 在小程序中使用复杂 3D 变换 -->
    <wd-transition
      :show="show1"
      enter-class="complex-3d-enter"
      enter-active-class="complex-3d-active"
    >
      <view class="content">内容</view>
    </wd-transition>

    <!-- ✅ 推荐: 使用简单的 2D 变换 -->
    <wd-transition name="fade" :show="show2" :duration="300">
      <view class="content">内容</view>
    </wd-transition>

    <!-- ✅ 推荐: 使用 translate3d 开启硬件加速 -->
    <wd-transition name="slide-up" :show="show3">
      <view class="content">内容</view>
    </wd-transition>
  </view>
</template>

```

**优化建议:**
- 优先使用内置动画类型
- 避免同时运行多个动画
- 动画时长控制在 300-400ms
- 使用 `translate3d` 代替 `translate` 开启 GPU 加速
- 避免在动画过程中改变 `box-shadow`、`border-radius` 等属性

参考: src/wd/components/wd-transition/wd-transition.vue:354-456

## 注意事项

1. **平台兼容性**
   - 在小程序中,部分复杂动画可能性能不佳,建议优先使用简单动画
   - 不同小程序平台对 CSS3 的支持程度不同,建议在目标平台测试动画效果
   - H5 端支持所有 CSS3 动画,可以使用更复杂的效果

2. **性能优化**
   - 动画持续时间不宜过长,建议在 200-500ms 之间
   - 避免同时运行多个动画,影响性能和视觉效果
   - 对于渲染成本高的内容,使用 `lazy-render` 优化性能
   - 使用 `translate3d` 代替 `translate` 开启硬件加速

3. **动画平滑性**
   - 在 iOS 设备上,3D 变换可能导致闪烁,可添加 `-webkit-backface-visibility: hidden` 修复
   - 自定义动画时,确保初始状态和结束状态的样式定义正确
   - 使用合适的缓动函数,推荐 `ease`、`ease-in-out` 或 `cubic-bezier`

4. **状态管理**
   - 避免在动画执行过程中频繁切换 `show` 状态
   - 使用生命周期钩子而不是 `watch` 监听动画完成
   - 组件内部会自动处理动画中断,无需手动管理

5. **样式隔离**
   - 自定义动画类名可能受到样式隔离影响
   - 如需全局生效,在样式中使用 `::v-deep` 或将样式定义在全局
   - 组件已配置 `styleIsolation: 'shared'`,可以共享全局样式

参考: src/wd/components/wd-transition/wd-transition.vue:19-26
