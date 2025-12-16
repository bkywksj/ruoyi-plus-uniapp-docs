# Curtain 幕帘

## 介绍

Curtain 幕帘组件是一种特殊的弹窗组件,主要用于展示公告类的图片弹窗。它通常用于应用首页的活动广告、运营公告、促销信息等场景。幕帘组件以图片为主要展示内容,通过居中弹出的方式吸引用户注意,同时提供灵活的关闭按钮位置配置和丰富的交互事件支持。

与普通的 Modal 模态框不同,幕帘组件更加轻量化,专注于图片展示场景。它基于 Popup 弹出层组件构建,继承了完整的过渡动画效果,并针对图片弹窗场景进行了专门优化。幕帘组件会自动计算图片的宽高比例,确保图片以正确的比例显示,不会出现拉伸或压缩的情况。

**核心特性:**

- **图片弹窗** - 专为图片展示场景设计,支持网络图片地址,自动计算图片宽高比保持正确的显示比例
- **灵活的关闭按钮位置** - 支持 7 种关闭按钮位置配置,包括内嵌、顶部、底部以及四个角落位置
- **页面跳转支持** - 支持配置点击图片后的跳转链接,可跳转到应用内任意页面
- **完整的生命周期事件** - 提供进入前、进入中、进入后、离开前、离开中、离开后等完整的动画生命周期事件
- **自定义关闭按钮** - 通过插槽支持完全自定义关闭按钮的样式和行为
- **遮罩层控制** - 支持配置点击遮罩层是否关闭幕帘,提供灵活的交互控制
- **层级控制** - 支持自定义 z-index 层级,确保在复杂页面中正确显示
- **缩放动画** - 使用 zoom-in 缩放动画效果,视觉体验流畅自然

## 基本用法

### 简单使用

最基本的幕帘用法,通过 `v-model` 控制显示隐藏,`src` 设置图片地址。

```vue
<template>
  <view class="container">
    <wd-button @click="show = true">显示幕帘</wd-button>

    <wd-curtain
      v-model="show"
      :src="imageUrl"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
</script>
```

**使用说明:**

- `v-model` 用于双向绑定幕帘的显示状态,`true` 显示,`false` 隐藏
- `src` 属性必须使用网络图片地址,不支持本地图片路径
- 幕帘默认居中显示,并带有半透明遮罩层背景
- 点击关闭按钮可关闭幕帘,默认关闭按钮位于图片内部右上角

### 设置图片宽度

通过 `width` 属性设置幕帘图片的宽度,高度会根据图片实际比例自动计算。

```vue
<template>
  <view class="container">
    <wd-button @click="showSmall = true">小尺寸幕帘</wd-button>
    <wd-button @click="showMedium = true">中等尺寸幕帘</wd-button>
    <wd-button @click="showLarge = true">大尺寸幕帘</wd-button>

    <!-- 小尺寸 -->
    <wd-curtain
      v-model="showSmall"
      :src="imageUrl"
      :width="400"
    />

    <!-- 中等尺寸(默认) -->
    <wd-curtain
      v-model="showMedium"
      :src="imageUrl"
      :width="560"
    />

    <!-- 大尺寸 -->
    <wd-curtain
      v-model="showLarge"
      :src="imageUrl"
      :width="680"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSmall = ref(false)
const showMedium = ref(false)
const showLarge = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
</script>
```

**使用说明:**

- `width` 属性值为数字类型,单位会自动转换为 rpx
- 组件内部会根据图片实际加载后的宽高比自动计算高度
- 默认宽度为 560rpx,适合大多数移动端场景
- 建议根据实际图片素材的尺寸选择合适的宽度

### 带跳转链接

通过 `to` 属性设置点击图片后跳转的页面路径。

```vue
<template>
  <view class="container">
    <wd-button type="primary" @click="show = true">显示活动幕帘</wd-button>

    <wd-curtain
      v-model="show"
      :src="activityImage"
      :to="activityPage"
      :width="600"
      @click="handleClick"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const activityImage = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
const activityPage = ref('/pages/activity/index')

const handleClick = () => {
  console.log('用户点击了活动图片,即将跳转到活动页面')
}
</script>
```

**使用说明:**

- `to` 属性接受页面路径字符串,使用 `uni.navigateTo` 进行跳转
- 点击图片时会先触发 `click` 事件,然后执行跳转,最后关闭幕帘
- 跳转路径需要是应用内已注册的页面路径
- 适用于活动广告、促销公告等需要引导用户跳转的场景

## 关闭按钮位置

### 位置类型

Curtain 组件支持 7 种关闭按钮位置,通过 `close-position` 属性设置。

```vue
<template>
  <view class="container">
    <!-- 位置选择按钮 -->
    <view class="position-buttons">
      <view class="row">
        <wd-button size="small" @click="showPosition('top-left')">左上</wd-button>
        <wd-button size="small" @click="showPosition('top')">顶部</wd-button>
        <wd-button size="small" @click="showPosition('top-right')">右上</wd-button>
      </view>
      <view class="row">
        <wd-button size="small" @click="showPosition('inset')">内嵌</wd-button>
      </view>
      <view class="row">
        <wd-button size="small" @click="showPosition('bottom-left')">左下</wd-button>
        <wd-button size="small" @click="showPosition('bottom')">底部</wd-button>
        <wd-button size="small" @click="showPosition('bottom-right')">右下</wd-button>
      </view>
    </view>

    <!-- 各位置的幕帘 -->
    <wd-curtain
      v-model="shows.inset"
      :src="imageUrl"
      close-position="inset"
      :width="480"
    />

    <wd-curtain
      v-model="shows.top"
      :src="imageUrl"
      close-position="top"
      :width="480"
    />

    <wd-curtain
      v-model="shows.bottom"
      :src="imageUrl"
      close-position="bottom"
      :width="480"
    />

    <wd-curtain
      v-model="shows['top-left']"
      :src="imageUrl"
      close-position="top-left"
      :width="480"
    />

    <wd-curtain
      v-model="shows['top-right']"
      :src="imageUrl"
      close-position="top-right"
      :width="480"
    />

    <wd-curtain
      v-model="shows['bottom-left']"
      :src="imageUrl"
      close-position="bottom-left"
      :width="480"
    />

    <wd-curtain
      v-model="shows['bottom-right']"
      :src="imageUrl"
      close-position="bottom-right"
      :width="480"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

type ClosePosition = 'inset' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')

const shows = reactive<Record<ClosePosition, boolean>>({
  inset: false,
  top: false,
  bottom: false,
  'top-left': false,
  'top-right': false,
  'bottom-left': false,
  'bottom-right': false
})

const showPosition = (position: ClosePosition) => {
  shows[position] = true
}
</script>

```

**位置说明:**

| 位置值 | 说明 | 适用场景 |
|--------|------|----------|
| `inset` | 内嵌在图片内部右上角(默认) | 通用场景,关闭按钮不遮挡主要内容 |
| `top` | 图片上方居中 | 图片内容需要完整展示时 |
| `bottom` | 图片下方居中 | 图片内容需要完整展示时 |
| `top-left` | 图片左上角外部 | 关闭按钮需要醒目时 |
| `top-right` | 图片右上角外部 | 关闭按钮需要醒目时 |
| `bottom-left` | 图片左下角外部 | 特殊设计需求 |
| `bottom-right` | 图片右下角外部 | 特殊设计需求 |

### 内嵌位置(默认)

关闭按钮位于图片内部右上角,这是默认位置。

```vue
<template>
  <view class="container">
    <wd-button @click="show = true">内嵌关闭按钮</wd-button>

    <wd-curtain
      v-model="show"
      :src="imageUrl"
      close-position="inset"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
</script>
```

**技术实现:**

内嵌位置的关闭按钮使用绝对定位,位于图片内部右上角,距离边缘 10px,带有 6px 的内边距以增加点击区域。

### 顶部位置

关闭按钮位于图片正上方居中位置。

```vue
<template>
  <view class="container">
    <wd-button @click="show = true">顶部关闭按钮</wd-button>

    <wd-curtain
      v-model="show"
      :src="imageUrl"
      close-position="top"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
</script>
```

**技术实现:**

顶部位置使用 `top: -62px` 和 `left: 50%` 配合负的左边距实现水平居中,确保关闭按钮在图片上方且不遮挡图片内容。

### 底部位置

关闭按钮位于图片正下方居中位置。

```vue
<template>
  <view class="container">
    <wd-button @click="show = true">底部关闭按钮</wd-button>

    <wd-curtain
      v-model="show"
      :src="imageUrl"
      close-position="bottom"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
</script>
```

**技术实现:**

底部位置使用 `bottom: -62px` 和 `left: 50%` 配合负的左边距实现水平居中,关闭按钮位于图片下方。

### 四角位置

关闭按钮位于图片四个角落的外部位置。

```vue
<template>
  <view class="container">
    <view class="button-group">
      <wd-button size="small" @click="showTopLeft = true">左上角</wd-button>
      <wd-button size="small" @click="showTopRight = true">右上角</wd-button>
    </view>
    <view class="button-group">
      <wd-button size="small" @click="showBottomLeft = true">左下角</wd-button>
      <wd-button size="small" @click="showBottomRight = true">右下角</wd-button>
    </view>

    <wd-curtain
      v-model="showTopLeft"
      :src="imageUrl"
      close-position="top-left"
      :width="480"
    />

    <wd-curtain
      v-model="showTopRight"
      :src="imageUrl"
      close-position="top-right"
      :width="480"
    />

    <wd-curtain
      v-model="showBottomLeft"
      :src="imageUrl"
      close-position="bottom-left"
      :width="480"
    />

    <wd-curtain
      v-model="showBottomRight"
      :src="imageUrl"
      close-position="bottom-right"
      :width="480"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showTopLeft = ref(false)
const showTopRight = ref(false)
const showBottomLeft = ref(false)
const showBottomRight = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
</script>
```

**技术实现:**

四角位置使用绝对定位实现,top 位置使用 `top: -62px`,bottom 位置使用 `bottom: -62px`,left 位置使用 `left: -6px`,right 位置使用 `right: -6px`。

## 高级配置

### 点击遮罩关闭

通过 `close-on-click-modal` 属性控制点击遮罩层是否关闭幕帘。

```vue
<template>
  <view class="container">
    <wd-button @click="showDefault = true">默认(点击遮罩不关闭)</wd-button>
    <wd-button type="warning" @click="showModal = true">点击遮罩可关闭</wd-button>

    <!-- 默认: 点击遮罩不关闭 -->
    <wd-curtain
      v-model="showDefault"
      :src="imageUrl"
      :close-on-click-modal="false"
    />

    <!-- 点击遮罩可关闭 -->
    <wd-curtain
      v-model="showModal"
      :src="imageUrl"
      :close-on-click-modal="true"
      @click-modal="handleClickModal"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showDefault = ref(false)
const showModal = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')

const handleClickModal = () => {
  console.log('用户点击了遮罩层')
}
</script>
```

**使用说明:**

- 默认值为 `false`,点击遮罩层不会关闭幕帘
- 设置为 `true` 时,点击遮罩层会触发 `click-modal` 事件并关闭幕帘
- 无论是否开启此选项,都可以监听 `click-modal` 事件

### 设置层级

通过 `z-index` 属性设置幕帘的层级,确保在复杂页面中正确显示。

```vue
<template>
  <view class="container">
    <wd-button @click="showNormal = true">普通层级(100)</wd-button>
    <wd-button type="primary" @click="showHigh = true">高层级(200)</wd-button>

    <!-- 普通层级 -->
    <wd-curtain
      v-model="showNormal"
      :src="imageUrl"
      :z-index="100"
    />

    <!-- 高层级 -->
    <wd-curtain
      v-model="showHigh"
      :src="imageUrl"
      :z-index="200"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showNormal = ref(false)
const showHigh = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
</script>
```

**使用说明:**

- 默认 z-index 值为 100
- 当页面中有其他弹出层组件时,可以通过设置更高的 z-index 确保幕帘在最上层
- 建议根据实际页面层级情况合理设置

### 关闭时隐藏

通过 `hide-when-close` 属性控制关闭时是否使用 `display: none` 隐藏组件。

```vue
<template>
  <view class="container">
    <wd-button @click="showHide = true">关闭时隐藏(默认)</wd-button>
    <wd-button @click="showKeep = true">关闭时保留DOM</wd-button>

    <!-- 关闭时隐藏 -->
    <wd-curtain
      v-model="showHide"
      :src="imageUrl"
      :hide-when-close="true"
    />

    <!-- 关闭时保留DOM -->
    <wd-curtain
      v-model="showKeep"
      :src="imageUrl"
      :hide-when-close="false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showHide = ref(false)
const showKeep = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
</script>
```

**使用说明:**

- 默认值为 `true`,关闭时组件使用 `display: none` 隐藏
- 设置为 `false` 时,关闭后组件 DOM 仍然保留在页面中
- 保留 DOM 可以提升再次打开时的性能,但会占用一定内存

## 自定义关闭按钮

### 使用插槽自定义

通过 `close` 插槽可以完全自定义关闭按钮的样式和行为。

```vue
<template>
  <view class="container">
    <wd-button @click="show = true">自定义关闭按钮</wd-button>

    <wd-curtain v-model="show" :src="imageUrl" :width="560">
      <template #close>
        <view class="custom-close" @click="handleClose">
          关闭
        </view>
      </template>
    </wd-curtain>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')

const handleClose = () => {
  show.value = false
  console.log('自定义关闭按钮被点击')
}
</script>

```

**使用说明:**

- 使用 `close` 插槽时,需要自己处理关闭逻辑,即在点击事件中设置 `v-model` 绑定的值为 `false`
- 自定义关闭按钮需要自己设置定位样式
- 默认的关闭图标将不会显示

### 图标关闭按钮

使用自定义图标作为关闭按钮。

```vue
<template>
  <view class="container">
    <wd-button @click="show = true">图标关闭按钮</wd-button>

    <wd-curtain v-model="show" :src="imageUrl" :width="560">
      <template #close>
        <view class="icon-close" @click="handleClose">
          ✕
        </view>
      </template>
    </wd-curtain>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')

const handleClose = () => {
  show.value = false
}
</script>

```

### 渐变色关闭按钮

使用渐变色和阴影效果的关闭按钮。

```vue
<template>
  <view class="container">
    <wd-button type="success" @click="show = true">渐变色关闭按钮</wd-button>

    <wd-curtain v-model="show" :src="imageUrl" :width="560">
      <template #close>
        <view class="gradient-close" @click="handleClose">
          ×
        </view>
      </template>
    </wd-curtain>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')

const handleClose = () => {
  show.value = false
}
</script>

```

### 自定义关闭按钮样式类

通过 `custom-close-class` 和 `custom-close-style` 属性自定义默认关闭按钮的样式。

```vue
<template>
  <view class="container">
    <wd-button @click="showClass = true">自定义类名</wd-button>
    <wd-button @click="showStyle = true">自定义样式</wd-button>

    <!-- 使用自定义类名 -->
    <wd-curtain
      v-model="showClass"
      :src="imageUrl"
      custom-close-class="my-close-icon"
    />

    <!-- 使用自定义样式 -->
    <wd-curtain
      v-model="showStyle"
      :src="imageUrl"
      custom-close-style="color: #ff4d4f; font-size: 48rpx;"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showClass = ref(false)
const showStyle = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
</script>

<style lang="scss">
// 注意: 需要使用非 scoped 样式或 :deep() 选择器
.my-close-icon {
  color: #52c41a !important;
  font-size: 40rpx !important;
}
</style>
```

**使用说明:**

- `custom-close-class` 用于添加自定义 CSS 类名
- `custom-close-style` 用于添加内联样式
- 这两个属性会应用到默认的关闭图标上
- 如果使用 `close` 插槽,这两个属性将不生效

## 事件处理

### 生命周期事件

Curtain 组件提供完整的动画生命周期事件。

```vue
<template>
  <view class="container">
    <wd-button type="primary" @click="show = true">打开幕帘</wd-button>

    <!-- 事件日志 -->
    <view class="event-log">
      <view class="log-title">事件日志:</view>
      <scroll-view scroll-y class="log-content">
        <view
          v-for="(log, index) in eventLogs"
          :key="index"
          class="log-item"
        >
          <text class="log-time">[{{ log.time }}]</text>
          <text class="log-message">{{ log.message }}</text>
        </view>
      </scroll-view>
      <wd-button size="small" @click="clearLogs">清空日志</wd-button>
    </view>

    <wd-curtain
      v-model="show"
      :src="imageUrl"
      :close-on-click-modal="true"
      @beforeenter="onBeforeEnter"
      @enter="onEnter"
      @afterenter="onAfterEnter"
      @beforeleave="onBeforeLeave"
      @leave="onLeave"
      @afterleave="onAfterLeave"
      @close="onClose"
      @closed="onClosed"
      @click-modal="onClickModal"
      @click="onClick"
      @load="onLoad"
      @error="onError"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface EventLog {
  time: string
  message: string
}

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
const eventLogs = ref<EventLog[]>([])

// 添加日志
const addLog = (message: string) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  eventLogs.value.unshift({ time, message })
  if (eventLogs.value.length > 20) {
    eventLogs.value = eventLogs.value.slice(0, 20)
  }
}

// 清空日志
const clearLogs = () => {
  eventLogs.value = []
  addLog('日志已清空')
}

// 进入前
const onBeforeEnter = () => {
  addLog('beforeenter: 幕帘开始进入')
}

// 进入中
const onEnter = () => {
  addLog('enter: 幕帘进入动画执行中')
}

// 进入后
const onAfterEnter = () => {
  addLog('afterenter: 幕帘进入动画完成')
}

// 离开前
const onBeforeLeave = () => {
  addLog('beforeleave: 幕帘开始离开')
}

// 离开中
const onLeave = () => {
  addLog('leave: 幕帘离开动画执行中')
}

// 离开后
const onAfterLeave = () => {
  addLog('afterleave: 幕帘离开动画完成')
}

// 关闭时
const onClose = () => {
  addLog('close: 幕帘关闭')
}

// 关闭完成
const onClosed = () => {
  addLog('closed: 幕帘关闭完成')
}

// 点击遮罩
const onClickModal = () => {
  addLog('click-modal: 点击了遮罩层')
}

// 点击图片
const onClick = () => {
  addLog('click: 点击了幕帘图片')
}

// 图片加载完成
const onLoad = () => {
  addLog('load: 图片加载完成')
}

// 图片加载错误
const onError = () => {
  addLog('error: 图片加载失败')
}
</script>

```

**事件触发顺序:**

1. 打开幕帘时: `load`(图片加载完成) → `beforeenter` → `enter` → `afterenter`
2. 关闭幕帘时: `close` → `beforeleave` → `leave` → `afterleave` → `closed`
3. 点击图片时: `click` → `close` → 后续关闭流程
4. 点击遮罩时(开启 closeOnClickModal): `click-modal` → `close` → 后续关闭流程

### 图片加载事件

监听图片的加载状态。

```vue
<template>
  <view class="container">
    <wd-button @click="show = true">显示幕帘</wd-button>

    <view v-if="loadStatus" class="status">
      图片状态: {{ loadStatus }}
    </view>

    <wd-curtain
      v-model="show"
      :src="imageUrl"
      @load="handleLoad"
      @error="handleError"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
const loadStatus = ref('')

const handleLoad = () => {
  loadStatus.value = '加载成功 ✓'
  console.log('幕帘图片加载成功')
}

const handleError = () => {
  loadStatus.value = '加载失败 ✗'
  console.log('幕帘图片加载失败')
}
</script>
```

**使用说明:**

- `load` 事件在图片加载完成时触发,此时组件会获取图片的实际宽高比
- `error` 事件在图片加载失败时触发,可以在此处理降级逻辑
- 图片加载状态内部使用 `imgSucc` 响应式变量记录

### 点击事件处理

处理图片点击和遮罩点击事件。

```vue
<template>
  <view class="container">
    <wd-button @click="show = true">显示幕帘</wd-button>

    <wd-curtain
      v-model="show"
      :src="imageUrl"
      :close-on-click-modal="true"
      @click="handleClick"
      @click-modal="handleClickModal"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')

const handleClick = () => {
  console.log('点击了幕帘图片')
  // 可以在这里执行自定义逻辑,比如统计点击数据
  uni.showToast({
    title: '点击了图片',
    icon: 'none'
  })
}

const handleClickModal = () => {
  console.log('点击了遮罩层')
  uni.showToast({
    title: '点击了遮罩',
    icon: 'none'
  })
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model-value / v-model | 绑定值,控制幕帘显示隐藏 | `boolean` | `false` |
| src | 幕帘图片地址,必须使用网络地址 | `string` | - |
| width | 幕帘图片宽度,单位 rpx | `number` | `560` |
| close-position | 关闭按钮位置 | `ClosePosition` | `'inset'` |
| to | 幕帘图片点击跳转链接 | `string` | - |
| close-on-click-modal | 点击遮罩是否关闭 | `boolean` | `false` |
| hide-when-close | 关闭时是否隐藏(display: none) | `boolean` | `true` |
| z-index | 设置层级 | `number` | `100` |
| custom-style | 自定义根节点样式 | `string` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-close-class | 自定义关闭按钮的类名 | `string` | - |
| custom-close-style | 自定义关闭按钮的样式 | `string` | - |
| value | 绑定值(已废弃,请使用 modelValue) | `boolean` | `false` |

### ClosePosition 关闭按钮位置

| 值 | 说明 |
|------|------|
| `inset` | 内嵌在图片内部右上角(默认) |
| `top` | 图片上方居中 |
| `bottom` | 图片下方居中 |
| `top-left` | 图片左上角外部 |
| `top-right` | 图片右上角外部 |
| `bottom-left` | 图片左下角外部 |
| `bottom-right` | 图片右下角外部 |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| beforeenter | 进入前触发 | - |
| enter | 进入时触发 | - |
| afterenter | 进入后触发 | - |
| beforeleave | 离开前触发 | - |
| leave | 离开时触发 | - |
| afterleave | 离开后触发 | - |
| close | 关闭时触发 | - |
| closed | 关闭后触发(动画结束) | - |
| click-modal | 点击遮罩时触发 | - |
| click | 点击图片时触发 | - |
| load | 图片加载完成时触发 | - |
| error | 图片加载错误时触发 | - |
| update:modelValue | 绑定值变化时触发 | `value: boolean` |

### Slots

| 名称 | 说明 |
|------|------|
| close | 自定义关闭按钮 |

### 类型定义

```typescript
/**
 * 关闭按钮位置类型
 */
type ClosePosition =
  | 'inset'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

/**
 * 幕帘组件属性接口
 */
interface WdCurtainProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 绑定值，展示/关闭幕帘（已废弃，请使用 modelValue） */
  value?: boolean
  /** 绑定值，展示/关闭幕帘 */
  modelValue?: boolean
  /** 关闭按钮位置 */
  closePosition?: ClosePosition
  /** 幕帘图片地址，必须使用网络地址 */
  src?: string
  /** 幕帘图片点击链接 */
  to?: string
  /** 幕帘图片宽度 */
  width?: number
  /** 点击遮罩是否关闭 */
  closeOnClickModal?: boolean
  /** 是否当关闭时将弹出层隐藏（display: none) */
  hideWhenClose?: boolean
  /** 设置层级 */
  zIndex?: number
  /** 自定义关闭按钮的类名 */
  customCloseClass?: string
  /** 自定义关闭按钮的样式 */
  customCloseStyle?: string
}

/**
 * 幕帘组件事件接口
 */
interface WdCurtainEmits {
  /** 进入前触发 */
  beforeenter: []
  /** 进入时触发 */
  enter: []
  /** 进入后触发 */
  afterenter: []
  /** 离开前触发 */
  beforeleave: []
  /** 离开时触发 */
  leave: []
  /** 离开后触发 */
  afterleave: []
  /** 关闭时触发 */
  close: []
  /** 关闭后触发 */
  closed: []
  /** 点击遮罩时触发 */
  'click-modal': []
  /** 图片加载完成时触发 */
  load: []
  /** 图片加载错误时触发 */
  error: []
  /** 点击图片时触发 */
  click: []
  /** 更新绑定值 */
  'update:modelValue': [value: boolean]
}
```

## 主题定制

### CSS 变量

Curtain 组件提供以下 CSS 变量用于自定义主题样式。

| CSS 变量 | 说明 | 默认值 |
|----------|------|--------|
| `--wot-curtain-content-radius` | 内容区域圆角 | `48rpx` |
| `--wot-curtain-content-close-color` | 关闭按钮颜色 | `#ffffff` |
| `--wot-curtain-content-close-fs` | 关闭按钮字体大小 | `$-fs-big` |

### 自定义主题示例

```vue
<template>
  <view class="container">
    <wd-button @click="show = true">自定义主题幕帘</wd-button>

    <wd-curtain
      v-model="show"
      :src="imageUrl"
      custom-class="custom-curtain"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')
</script>

<style lang="scss">
.custom-curtain {
  // 自定义圆角
  --wot-curtain-content-radius: 24rpx;
  // 自定义关闭按钮颜色
  --wot-curtain-content-close-color: #ff4d4f;
  // 自定义关闭按钮大小
  --wot-curtain-content-close-fs: 48rpx;
}
</style>
```

### 使用 ConfigProvider 全局配置

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="container">
      <wd-button @click="show = true">显示幕帘</wd-button>

      <wd-curtain
        v-model="show"
        :src="imageUrl"
      />
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const show = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')

const themeVars = reactive({
  curtainContentRadius: '32rpx',
  curtainContentCloseColor: '#52c41a',
  curtainContentCloseFs: '40rpx'
})
</script>
```

### 暗黑模式适配

```vue
<template>
  <view class="container" :class="{ 'dark-mode': isDark }">
    <wd-button @click="toggleTheme">切换主题</wd-button>
    <wd-button @click="show = true">显示幕帘</wd-button>

    <wd-curtain
      v-model="show"
      :src="imageUrl"
      custom-class="theme-curtain"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const isDark = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>

<style lang="scss">
// 亮色模式
.theme-curtain {
  --wot-curtain-content-close-color: #ffffff;
}

// 暗黑模式
.dark-mode {
  .theme-curtain {
    --wot-curtain-content-close-color: #e5e5e5;
  }
}
</style>
```

## 最佳实践

### 1. 活动弹窗场景

在 App 首页展示活动公告,引导用户点击进入活动页面。

```vue
<template>
  <view class="home-page">
    <!-- 页面内容 -->
    <view class="page-content">
      <!-- ... -->
    </view>

    <!-- 活动幕帘 -->
    <wd-curtain
      v-model="showActivity"
      :src="activityImage"
      :to="activityPage"
      :width="600"
      close-position="top"
      @click="handleActivityClick"
      @close="handleActivityClose"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const showActivity = ref(false)
const activityImage = ref('')
const activityPage = ref('')

// 页面加载时获取活动信息
onMounted(async () => {
  try {
    // 从接口获取活动数据
    const activityData = await getActivityInfo()

    if (activityData && activityData.isActive) {
      activityImage.value = activityData.imageUrl
      activityPage.value = activityData.jumpUrl

      // 检查是否今日已展示
      const today = new Date().toDateString()
      const lastShowDate = uni.getStorageSync('activityShowDate')

      if (lastShowDate !== today) {
        // 延迟展示,避免影响页面加载
        setTimeout(() => {
          showActivity.value = true
        }, 1000)
      }
    }
  } catch (error) {
    console.error('获取活动信息失败:', error)
  }
})

// 模拟获取活动信息
const getActivityInfo = () => {
  return Promise.resolve({
    isActive: true,
    imageUrl: 'https://example.com/activity.png',
    jumpUrl: '/pages/activity/index'
  })
}

// 活动点击统计
const handleActivityClick = () => {
  // 上报点击事件
  reportEvent('activity_click', {
    activityId: 'xxx'
  })
}

// 活动关闭处理
const handleActivityClose = () => {
  // 记录今日已展示
  const today = new Date().toDateString()
  uni.setStorageSync('activityShowDate', today)
}

// 上报事件(示例)
const reportEvent = (eventName: string, data: Record<string, any>) => {
  console.log('上报事件:', eventName, data)
}
</script>
```

**最佳实践要点:**

- 延迟展示幕帘,避免影响页面首次渲染性能
- 记录展示日期,避免重复打扰用户
- 上报点击和关闭事件,用于数据分析
- 从接口动态获取活动数据,便于运营配置

### 2. 首次使用引导

新用户首次打开应用时展示引导提示。

```vue
<template>
  <view class="app-container">
    <!-- 应用内容 -->
    <view class="app-content">
      <!-- ... -->
    </view>

    <!-- 新手引导幕帘 -->
    <wd-curtain
      v-model="showGuide"
      :src="guideImages[currentStep]"
      :width="640"
      close-position="bottom"
      :close-on-click-modal="false"
      @click="handleNextStep"
    >
      <template #close>
        <view class="guide-controls">
          <view class="guide-dots">
            <view
              v-for="(_, index) in guideImages"
              :key="index"
              class="dot"
              :class="{ active: index === currentStep }"
            />
          </view>
          <view class="guide-buttons">
            <text v-if="currentStep < guideImages.length - 1" @click.stop="handleSkip">
              跳过
            </text>
            <text @click.stop="handleNextStep">
              {{ currentStep < guideImages.length - 1 ? '下一步' : '开始使用' }}
            </text>
          </view>
        </view>
      </template>
    </wd-curtain>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const showGuide = ref(false)
const currentStep = ref(0)

const guideImages = [
  'https://example.com/guide-1.png',
  'https://example.com/guide-2.png',
  'https://example.com/guide-3.png'
]

onMounted(() => {
  // 检查是否首次使用
  const hasShownGuide = uni.getStorageSync('hasShownGuide')

  if (!hasShownGuide) {
    showGuide.value = true
  }
})

const handleNextStep = () => {
  if (currentStep.value < guideImages.length - 1) {
    currentStep.value++
  } else {
    finishGuide()
  }
}

const handleSkip = () => {
  finishGuide()
}

const finishGuide = () => {
  showGuide.value = false
  currentStep.value = 0
  uni.setStorageSync('hasShownGuide', true)
}
</script>

```

### 3. 公告通知场景

展示系统公告或重要通知。

```vue
<template>
  <view class="container">
    <wd-curtain
      v-model="showNotice"
      :src="noticeImage"
      :width="580"
      close-position="top-right"
      @click="handleNoticeClick"
      @close="handleNoticeClose"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface NoticeInfo {
  id: string
  imageUrl: string
  jumpUrl?: string
  startTime: string
  endTime: string
}

const showNotice = ref(false)
const noticeImage = ref('')
const noticeJumpUrl = ref('')
const currentNotice = ref<NoticeInfo | null>(null)

onMounted(async () => {
  await checkAndShowNotice()
})

const checkAndShowNotice = async () => {
  try {
    // 获取公告列表
    const notices = await getNoticeList()

    // 获取已读公告列表
    const readNotices = uni.getStorageSync('readNotices') || []

    // 找到第一个未读的有效公告
    const now = Date.now()
    const unreadNotice = notices.find((notice: NoticeInfo) => {
      const startTime = new Date(notice.startTime).getTime()
      const endTime = new Date(notice.endTime).getTime()
      return (
        !readNotices.includes(notice.id) &&
        now >= startTime &&
        now <= endTime
      )
    })

    if (unreadNotice) {
      currentNotice.value = unreadNotice
      noticeImage.value = unreadNotice.imageUrl
      noticeJumpUrl.value = unreadNotice.jumpUrl || ''
      showNotice.value = true
    }
  } catch (error) {
    console.error('获取公告失败:', error)
  }
}

// 模拟获取公告列表
const getNoticeList = (): Promise<NoticeInfo[]> => {
  return Promise.resolve([
    {
      id: 'notice-001',
      imageUrl: 'https://example.com/notice.png',
      jumpUrl: '/pages/notice/detail?id=001',
      startTime: '2024-01-01',
      endTime: '2024-12-31'
    }
  ])
}

const handleNoticeClick = () => {
  if (noticeJumpUrl.value) {
    uni.navigateTo({
      url: noticeJumpUrl.value
    })
  }
}

const handleNoticeClose = () => {
  // 标记公告已读
  if (currentNotice.value) {
    const readNotices = uni.getStorageSync('readNotices') || []
    readNotices.push(currentNotice.value.id)
    uni.setStorageSync('readNotices', readNotices)
  }
}
</script>
```

### 4. 图片预加载优化

预加载幕帘图片以提升用户体验。

```vue
<template>
  <view class="container">
    <wd-button @click="showCurtain" :loading="isLoading">
      {{ isLoading ? '加载中...' : '显示幕帘' }}
    </wd-button>

    <wd-curtain
      v-model="show"
      :src="imageUrl"
      :width="560"
      @load="handleLoad"
      @error="handleError"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const show = ref(false)
const isLoading = ref(false)
const imageLoaded = ref(false)
const imageUrl = ref('https://img20.360buyimg.com/da/jfs/t1/141592/25/8861/261559/5f68d8c1E33ed78ab/698ad655bfcfbaed.png')

// 页面加载时预加载图片
onMounted(() => {
  preloadImage(imageUrl.value)
})

// 预加载图片
const preloadImage = (url: string) => {
  // 使用 uni.getImageInfo 预加载图片
  uni.getImageInfo({
    src: url,
    success: () => {
      imageLoaded.value = true
      console.log('图片预加载成功')
    },
    fail: (error) => {
      console.error('图片预加载失败:', error)
    }
  })
}

// 显示幕帘
const showCurtain = () => {
  if (imageLoaded.value) {
    // 图片已加载,直接显示
    show.value = true
  } else {
    // 图片未加载,显示加载状态
    isLoading.value = true

    // 等待图片加载完成
    const checkLoaded = setInterval(() => {
      if (imageLoaded.value) {
        clearInterval(checkLoaded)
        isLoading.value = false
        show.value = true
      }
    }, 100)

    // 超时处理
    setTimeout(() => {
      clearInterval(checkLoaded)
      if (!imageLoaded.value) {
        isLoading.value = false
        uni.showToast({
          title: '图片加载失败',
          icon: 'none'
        })
      }
    }, 5000)
  }
}

const handleLoad = () => {
  imageLoaded.value = true
}

const handleError = () => {
  uni.showToast({
    title: '图片加载失败',
    icon: 'none'
  })
}
</script>
```

### 5. 多幕帘队列展示

按顺序展示多个幕帘。

```vue
<template>
  <view class="container">
    <wd-button @click="startCurtainQueue">开始展示幕帘队列</wd-button>

    <wd-curtain
      v-model="currentCurtain.show"
      :src="currentCurtain.src"
      :to="currentCurtain.to"
      :width="currentCurtain.width"
      :close-position="currentCurtain.closePosition"
      @close="handleQueueClose"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

interface CurtainConfig {
  show: boolean
  src: string
  to?: string
  width: number
  closePosition: 'inset' | 'top' | 'bottom'
}

// 幕帘队列配置
const curtainQueue = [
  {
    src: 'https://example.com/curtain-1.png',
    to: '/pages/activity/1',
    width: 560,
    closePosition: 'top' as const
  },
  {
    src: 'https://example.com/curtain-2.png',
    width: 600,
    closePosition: 'bottom' as const
  },
  {
    src: 'https://example.com/curtain-3.png',
    to: '/pages/activity/3',
    width: 580,
    closePosition: 'inset' as const
  }
]

const queueIndex = ref(0)
const currentCurtain = reactive<CurtainConfig>({
  show: false,
  src: '',
  to: undefined,
  width: 560,
  closePosition: 'inset'
})

// 开始展示幕帘队列
const startCurtainQueue = () => {
  queueIndex.value = 0
  showNextCurtain()
}

// 展示下一个幕帘
const showNextCurtain = () => {
  if (queueIndex.value < curtainQueue.length) {
    const config = curtainQueue[queueIndex.value]
    currentCurtain.src = config.src
    currentCurtain.to = config.to
    currentCurtain.width = config.width
    currentCurtain.closePosition = config.closePosition
    currentCurtain.show = true
  }
}

// 处理幕帘关闭
const handleQueueClose = () => {
  queueIndex.value++

  // 延迟展示下一个,避免动画冲突
  setTimeout(() => {
    showNextCurtain()
  }, 300)
}
</script>
```

## 常见问题

### 1. 图片无法显示

**问题原因:**

- 使用了本地图片路径而非网络地址
- 图片 URL 格式错误或资源不存在
- 图片服务器存在跨域限制
- 网络连接问题

**解决方案:**

```vue
<template>
  <view class="container">
    <wd-curtain
      v-model="show"
      :src="validImageUrl"
      @error="handleImageError"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const show = ref(false)
const imageUrl = ref('https://example.com/image.png')
const fallbackUrl = ref('https://example.com/fallback.png')
const hasError = ref(false)

// 使用计算属性处理图片 URL
const validImageUrl = computed(() => {
  // 如果主图加载失败,使用备用图
  if (hasError.value) {
    return fallbackUrl.value
  }

  // 确保是网络地址
  if (!imageUrl.value.startsWith('http')) {
    console.warn('幕帘图片必须使用网络地址')
    return fallbackUrl.value
  }

  return imageUrl.value
})

const handleImageError = () => {
  hasError.value = true
  console.error('幕帘图片加载失败,使用备用图片')
}
</script>
```

**注意事项:**

- Curtain 组件只支持网络图片,不支持本地图片路径
- 确保图片服务器支持跨域访问
- 建议准备备用图片处理加载失败的情况

### 2. 关闭按钮位置不正确

**问题原因:**

- `close-position` 值拼写错误
- 自定义样式覆盖了默认定位
- 图片尺寸影响了关闭按钮显示

**解决方案:**

```vue
<template>
  <view class="container">
    <!-- 确保使用正确的位置值 -->
    <wd-curtain
      v-model="show"
      :src="imageUrl"
      close-position="top-right"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 定义位置类型,避免拼写错误
type ClosePosition = 'inset' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const show = ref(false)
const imageUrl = ref('https://example.com/image.png')
const closePosition = ref<ClosePosition>('top-right')
</script>
```

### 3. 点击图片不跳转

**问题原因:**

- `to` 属性路径配置错误
- 目标页面未在 `pages.json` 中注册
- 页面路径格式不正确

**解决方案:**

```vue
<template>
  <view class="container">
    <wd-curtain
      v-model="show"
      :src="imageUrl"
      :to="jumpUrl"
      @click="handleClick"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://example.com/image.png')

// 确保路径格式正确,以 / 开头
const jumpUrl = ref('/pages/activity/index')

const handleClick = () => {
  console.log('即将跳转到:', jumpUrl.value)

  // 如果自动跳转不生效,可以手动跳转
  // uni.navigateTo({
  //   url: jumpUrl.value,
  //   fail: (err) => {
  //     console.error('跳转失败:', err)
  //   }
  // })
}
</script>
```

**注意事项:**

- 路径必须以 `/` 开头
- 目标页面必须在 `pages.json` 中配置
- tabBar 页面需要使用 `uni.switchTab` 跳转,但组件内部使用的是 `uni.navigateTo`

### 4. 动画效果不流畅

**问题原因:**

- 图片文件过大影响加载
- 页面同时存在大量动画
- 设备性能较低

**解决方案:**

```vue
<template>
  <view class="container">
    <wd-curtain
      v-model="show"
      :src="optimizedImageUrl"
      :width="480"
      :hide-when-close="true"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const show = ref(false)
const imageUrl = ref('https://example.com/large-image.png')

// 使用 CDN 图片处理服务压缩图片
const optimizedImageUrl = computed(() => {
  // 假设使用阿里云 OSS 图片处理
  // 限制宽度为 750px,质量 80%
  return `${imageUrl.value}?x-oss-process=image/resize,w_750/quality,q_80`
})
</script>
```

**优化建议:**

- 控制图片文件大小在 200KB 以内
- 使用 CDN 图片处理服务进行压缩
- 设置 `hide-when-close="true"` 关闭时隐藏 DOM
- 避免同时打开多个幕帘

### 5. 自定义关闭按钮点击无效

**问题原因:**

- 未正确处理点击事件
- 事件冒泡导致多次触发
- 未设置正确的 `v-model` 值

**解决方案:**

```vue
<template>
  <view class="container">
    <wd-curtain v-model="show" :src="imageUrl">
      <template #close>
        <!-- 使用 @click.stop 阻止事件冒泡 -->
        <view class="custom-close" @click.stop="handleClose">
          关闭
        </view>
      </template>
    </wd-curtain>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://example.com/image.png')

const handleClose = () => {
  // 关键: 必须设置 show 为 false
  show.value = false
  console.log('自定义关闭按钮被点击')
}
</script>

```

**关键点:**

- 使用 `@click.stop` 阻止事件冒泡
- 在点击事件中必须设置 `v-model` 绑定的值为 `false`
- 确保自定义关闭按钮有足够的点击区域

### 6. 图片宽高比例不正确

**问题原因:**

- 设置的 `width` 与图片实际宽高比不匹配
- 图片加载完成前无法获取正确尺寸

**解决方案:**

```vue
<template>
  <view class="container">
    <wd-curtain
      v-model="show"
      :src="imageUrl"
      :width="calculatedWidth"
      @load="handleLoad"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
const imageUrl = ref('https://example.com/image.png')
const calculatedWidth = ref(560)

const handleLoad = () => {
  // 图片加载完成后,组件会自动根据图片实际比例计算高度
  // 如果需要调整显示大小,可以修改 width
  console.log('图片加载完成,宽高比已自动计算')
}

// 如果知道图片尺寸,可以预先计算合适的宽度
const preCalculateWidth = (imgWidth: number, imgHeight: number, maxWidth = 640) => {
  // 保持比例,限制最大宽度
  if (imgWidth > maxWidth) {
    return maxWidth
  }
  return imgWidth
}
</script>
```

**说明:**

组件内部会在图片加载完成后自动计算宽高比(`imgScale`),然后根据设置的 `width` 和比例计算出高度,确保图片不会变形。
