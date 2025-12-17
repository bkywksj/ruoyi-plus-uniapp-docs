---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/popup
---

# Popup 弹出层

## 介绍

Popup 是一个功能完善的弹出层组件,用于展示弹窗、信息提示、操作面板等内容。该组件基于 Overlay 遮罩层和 Transition 过渡动画组件实现,支持多个方向弹出、自定义动画、圆角样式等特性,是构建 ActionSheet、Dialog、Toast 等复杂弹窗组件的基础。

**核心特性:**

- **多方向弹出** - 支持 center、top、right、bottom、left 五个方向弹出
- **过渡动画** - 根据弹出方向自动匹配合适的过渡动画,也支持自定义动画
- **遮罩控制** - 支持显示/隐藏遮罩层,支持点击遮罩关闭
- **关闭按钮** - 可配置显示关闭按钮,支持标题内和无标题两种位置
- **圆角样式** - 根据弹出方向自动计算圆角位置,也支持自定义圆角大小
- **标题支持** - 可设置标题文本,标题区域固定不随内容滚动
- **懒渲染** - 支持懒渲染模式,首次显示时才渲染内容
- **安全区域** - 支持 iPhone X 等机型的底部安全区域适配
- **滚动锁定** - 弹出时可锁定背景页面滚动
- **暗黑模式** - 内置暗黑模式样式适配

## 基本用法

### 基础用法

最基础的用法,从底部弹出内容:

```vue
<template>
  <view class="demo">
    <wd-button @click="showPopup = true">打开弹出层</wd-button>

    <wd-popup v-model="showPopup" position="bottom">
      <view class="popup-content">
        <text>这是弹出层内容</text>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showPopup = ref(false)
</script>

```

**使用说明:**
- 使用 `v-model` 控制弹出层的显示和隐藏
- `position` 属性设置弹出方向,默认为 `center`
- 弹出层内容通过默认插槽传入

### 弹出位置

通过 `position` 属性设置弹出层的弹出位置:

```vue
<template>
  <view class="demo">
    <wd-button @click="showCenter">居中弹出</wd-button>
    <wd-button @click="showTop">顶部弹出</wd-button>
    <wd-button @click="showBottom">底部弹出</wd-button>
    <wd-button @click="showLeft">左侧弹出</wd-button>
    <wd-button @click="showRight">右侧弹出</wd-button>

    <!-- 居中弹出 -->
    <wd-popup v-model="centerVisible" position="center">
      <view class="popup-center">
        <text>居中弹出的内容</text>
        <text>适合展示提示信息</text>
      </view>
    </wd-popup>

    <!-- 顶部弹出 -->
    <wd-popup v-model="topVisible" position="top">
      <view class="popup-top">
        <text>顶部弹出的内容,适合展示通知、搜索框等</text>
      </view>
    </wd-popup>

    <!-- 底部弹出 -->
    <wd-popup v-model="bottomVisible" position="bottom">
      <view class="popup-bottom">
        <text>底部弹出的内容</text>
        <text>适合展示操作面板、选择器等</text>
      </view>
    </wd-popup>

    <!-- 左侧弹出 -->
    <wd-popup v-model="leftVisible" position="left">
      <view class="popup-side">
        <text>左侧弹出的内容</text>
        <text>适合展示侧边栏菜单</text>
      </view>
    </wd-popup>

    <!-- 右侧弹出 -->
    <wd-popup v-model="rightVisible" position="right">
      <view class="popup-side">
        <text>右侧弹出的内容</text>
        <text>适合展示侧边栏菜单</text>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const centerVisible = ref(false)
const topVisible = ref(false)
const bottomVisible = ref(false)
const leftVisible = ref(false)
const rightVisible = ref(false)

const showCenter = () => { centerVisible.value = true }
const showTop = () => { topVisible.value = true }
const showBottom = () => { bottomVisible.value = true }
const showLeft = () => { leftVisible.value = true }
const showRight = () => { rightVisible.value = true }
</script>

```

**使用说明:**
- `center`: 居中弹出,使用缩放+淡入动画,适合提示框、确认框
- `top`: 顶部弹出,使用向下滑入动画,适合通知栏、搜索框
- `bottom`: 底部弹出,使用向上滑入动画,适合操作面板、选择器
- `left`: 左侧弹出,使用向右滑入动画,适合侧边栏菜单
- `right`: 右侧弹出,使用向左滑入动画,适合侧边栏菜单

### 显示标题

通过 `title` 属性设置弹出层标题:

```vue
<template>
  <view class="demo">
    <wd-button @click="showPopup = true">带标题的弹出层</wd-button>

    <wd-popup
      v-model="showPopup"
      position="bottom"
      title="选择城市"
      closable
    >
      <view class="city-list">
        <view
          v-for="city in cities"
          :key="city"
          class="city-item"
          @click="selectCity(city)"
        >
          {{ city }}
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showPopup = ref(false)
const cities = ref(['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉'])

const selectCity = (city: string) => {
  console.log('选择了:', city)
  showPopup.value = false
}
</script>

```

**使用说明:**
- 设置 `title` 后,弹出层顶部会显示标题栏
- 标题栏固定在顶部,内容区域可独立滚动
- 配合 `closable` 属性可在标题栏显示关闭按钮

### 关闭按钮

通过 `closable` 属性显示关闭按钮:

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithTitle = true">标题内关闭按钮</wd-button>
    <wd-button @click="showWithoutTitle = true">无标题关闭按钮</wd-button>

    <!-- 有标题时,关闭按钮在标题栏右侧 -->
    <wd-popup
      v-model="showWithTitle"
      position="bottom"
      title="提示"
      closable
    >
      <view class="popup-content">
        <text>关闭按钮在标题栏右侧</text>
      </view>
    </wd-popup>

    <!-- 无标题时,关闭按钮在右上角 -->
    <wd-popup
      v-model="showWithoutTitle"
      position="center"
      closable
    >
      <view class="popup-content">
        <text>关闭按钮在右上角</text>
        <text>点击可关闭弹出层</text>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showWithTitle = ref(false)
const showWithoutTitle = ref(false)
</script>

```

**使用说明:**
- 有标题时,关闭按钮显示在标题栏右侧
- 无标题时,关闭按钮显示在弹出层右上角
- 关闭按钮使用旋转45度的加号图标实现

### 自定义圆角

通过 `radius` 属性自定义圆角大小:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSmall = true">小圆角</wd-button>
    <wd-button @click="showLarge = true">大圆角</wd-button>
    <wd-button @click="showNone = true">无圆角</wd-button>

    <wd-popup v-model="showSmall" position="bottom" :radius="8">
      <view class="popup-content">
        <text>8rpx 小圆角</text>
      </view>
    </wd-popup>

    <wd-popup v-model="showLarge" position="bottom" :radius="32">
      <view class="popup-content">
        <text>32rpx 大圆角</text>
      </view>
    </wd-popup>

    <wd-popup v-model="showNone" position="bottom" :radius="0">
      <view class="popup-content">
        <text>无圆角</text>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSmall = ref(false)
const showLarge = ref(false)
const showNone = ref(false)
</script>

```

**使用说明:**
- `radius` 属性支持数值(默认单位 rpx)和字符串(带单位)
- 圆角会根据弹出位置自动应用到正确的角:
  - `center`: 四个角都有圆角
  - `top`: 下方两个角有圆角
  - `bottom`: 上方两个角有圆角
  - `left`: 右方两个角有圆角
  - `right`: 左方两个角有圆角
- 默认圆角大小为 16rpx

### 自定义动画

通过 `transition` 属性自定义过渡动画:

```vue
<template>
  <view class="demo">
    <wd-button @click="showFade = true">淡入淡出</wd-button>
    <wd-button @click="showZoom = true">缩放动画</wd-button>
    <wd-button @click="showSlide = true">滑动动画</wd-button>

    <!-- 淡入淡出 -->
    <wd-popup v-model="showFade" position="center" transition="fade">
      <view class="popup-content">
        <text>淡入淡出动画</text>
      </view>
    </wd-popup>

    <!-- 缩放动画 -->
    <wd-popup v-model="showZoom" position="center" transition="zoom-in">
      <view class="popup-content">
        <text>缩放动画</text>
      </view>
    </wd-popup>

    <!-- 滑动动画 -->
    <wd-popup v-model="showSlide" position="center" transition="slide-up">
      <view class="popup-content">
        <text>向上滑入动画</text>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showFade = ref(false)
const showZoom = ref(false)
const showSlide = ref(false)
</script>

```

**使用说明:**
- 支持的动画类型: `fade`、`zoom-in`、`slide-up`、`slide-down`、`slide-left`、`slide-right`
- 不设置 `transition` 时,会根据 `position` 自动选择合适的动画
- `duration` 属性可控制动画持续时间,默认 300ms

### 动画时长

通过 `duration` 属性设置动画持续时间:

```vue
<template>
  <view class="demo">
    <wd-button @click="showFast = true">快速动画 (150ms)</wd-button>
    <wd-button @click="showNormal = true">正常动画 (300ms)</wd-button>
    <wd-button @click="showSlow = true">慢速动画 (500ms)</wd-button>

    <wd-popup v-model="showFast" position="bottom" :duration="150">
      <view class="popup-content">
        <text>150ms 快速动画</text>
      </view>
    </wd-popup>

    <wd-popup v-model="showNormal" position="bottom" :duration="300">
      <view class="popup-content">
        <text>300ms 正常动画</text>
      </view>
    </wd-popup>

    <wd-popup v-model="showSlow" position="bottom" :duration="500">
      <view class="popup-content">
        <text>500ms 慢速动画</text>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showFast = ref(false)
const showNormal = ref(false)
const showSlow = ref(false)
</script>

```

### 遮罩层控制

通过 `modal` 属性控制是否显示遮罩层:

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithModal = true">有遮罩</wd-button>
    <wd-button @click="showWithoutModal = true">无遮罩</wd-button>

    <!-- 有遮罩层 -->
    <wd-popup v-model="showWithModal" position="bottom" :modal="true">
      <view class="popup-content">
        <text>有遮罩层</text>
        <text>点击遮罩可关闭</text>
      </view>
    </wd-popup>

    <!-- 无遮罩层 -->
    <wd-popup v-model="showWithoutModal" position="bottom" :modal="false" closable>
      <view class="popup-content">
        <text>无遮罩层</text>
        <text>需要点击关闭按钮关闭</text>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showWithModal = ref(false)
const showWithoutModal = ref(false)
</script>

```

**使用说明:**
- `modal` 默认为 `true`,显示遮罩层
- 无遮罩层时,建议配合 `closable` 提供关闭方式
- 遮罩层样式可通过 `modal-style` 属性自定义

### 禁止点击遮罩关闭

通过 `close-on-click-modal` 属性控制点击遮罩是否关闭:

```vue
<template>
  <view class="demo">
    <wd-button @click="showPopup = true">打开弹出层</wd-button>

    <wd-popup
      v-model="showPopup"
      position="center"
      :close-on-click-modal="false"
      closable
    >
      <view class="popup-content">
        <text>点击遮罩不会关闭</text>
        <text>请点击关闭按钮关闭</text>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showPopup = ref(false)
</script>

```

**使用说明:**
- `close-on-click-modal` 默认为 `true`
- 设置为 `false` 时点击遮罩不会关闭弹出层
- 适用于需要用户明确操作才能关闭的场景

### 自定义层级

通过 `z-index` 属性设置弹出层的层级:

```vue
<template>
  <view class="demo">
    <wd-button @click="showFirst = true">打开第一个弹出层</wd-button>

    <wd-popup v-model="showFirst" position="center" :z-index="100">
      <view class="popup-content">
        <text>第一层弹出层 (z-index: 100)</text>
        <wd-button size="small" @click="showSecond = true">打开第二层</wd-button>
      </view>
    </wd-popup>

    <wd-popup v-model="showSecond" position="center" :z-index="200">
      <view class="popup-content">
        <text>第二层弹出层 (z-index: 200)</text>
        <wd-button size="small" @click="showSecond = false">关闭</wd-button>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showFirst = ref(false)
const showSecond = ref(false)
</script>

```

**使用说明:**
- `z-index` 默认为 100
- 多层弹出层叠加时,后弹出的应设置更高的层级
- 层级同时应用于遮罩层和弹出层内容

### 安全区域适配

通过 `safe-area-inset-bottom` 属性适配底部安全区域:

```vue
<template>
  <view class="demo">
    <wd-button @click="showPopup = true">底部弹出(安全区域)</wd-button>

    <wd-popup
      v-model="showPopup"
      position="bottom"
      safe-area-inset-bottom
    >
      <view class="popup-content">
        <text>底部弹出层</text>
        <text>已适配 iPhone X 底部安全区域</text>
        <wd-button type="primary" block @click="showPopup = false">
          确定
        </wd-button>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showPopup = ref(false)
</script>

```

**使用说明:**
- 在 iPhone X 等有底部安全区域的设备上,会自动增加底部内边距
- 主要用于 `position="bottom"` 的弹出层
- 组件会自动获取设备信息计算安全距离

### 懒渲染

通过 `lazy-render` 属性控制是否懒渲染:

```vue
<template>
  <view class="demo">
    <wd-button @click="showPopup = true">打开弹出层</wd-button>

    <!-- 懒渲染:首次显示时才渲染内容 -->
    <wd-popup v-model="showPopup" position="bottom" :lazy-render="true">
      <view class="popup-content">
        <text>懒渲染模式</text>
        <text>首次显示时才渲染内容</text>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showPopup = ref(false)
</script>

```

**使用说明:**
- `lazy-render` 默认为 `true`,首次显示时才渲染内容
- 可以提升页面初始化性能
- 设置为 `false` 时,弹出层内容会立即渲染

### 关闭时销毁

通过 `hide-when-close` 属性控制关闭时是否隐藏内容:

```vue
<template>
  <view class="demo">
    <wd-button @click="showPopup = true">打开弹出层</wd-button>

    <!-- 关闭时隐藏内容 (display: none) -->
    <wd-popup v-model="showPopup" position="bottom" :hide-when-close="true">
      <view class="popup-content">
        <text>关闭时会隐藏内容</text>
        <text>使用 display: none</text>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showPopup = ref(false)
</script>

```

**使用说明:**
- `hide-when-close` 默认为 `true`
- 设置为 `true` 时,关闭弹出层会使用 `display: none` 隐藏
- 可以保持组件状态,再次打开时不需要重新渲染

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 控制弹出层显示/隐藏 | `boolean` | `false` |
| position | 弹出位置 | `'center' \| 'top' \| 'right' \| 'bottom' \| 'left'` | `'center'` |
| title | 标题文本 | `string` | - |
| closable | 是否显示关闭按钮 | `boolean` | `false` |
| radius | 圆角大小 | `string \| number` | `16` |
| transition | 过渡动画类型 | `TransitionName` | - |
| duration | 动画持续时间,单位毫秒 | `number \| boolean` | `300` |
| modal | 是否显示遮罩层 | `boolean` | `true` |
| close-on-click-modal | 点击遮罩是否关闭 | `boolean` | `true` |
| z-index | 层级 | `number` | `100` |
| lazy-render | 是否懒渲染 | `boolean` | `true` |
| hide-when-close | 关闭时是否隐藏内容 | `boolean` | `true` |
| modal-style | 遮罩层自定义样式 | `string` | `''` |
| safe-area-inset-bottom | 是否适配底部安全区域 | `boolean` | `false` |
| lock-scroll | 是否锁定背景滚动 | `boolean` | `true` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-header-class | 自定义标题区域样式类 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 显示状态变化时触发 | `value: boolean` |
| close | 关闭时触发 | - |
| click-modal | 点击遮罩时触发 | - |
| before-enter | 进入动画开始前触发 | - |
| enter | 进入动画开始时触发 | - |
| after-enter | 进入动画结束后触发 | - |
| before-leave | 离开动画开始前触发 | - |
| leave | 离开动画开始时触发 | - |
| after-leave | 离开动画结束后触发 | - |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 弹出层内容 |

### 类型定义

```typescript
/**
 * 弹出层位置类型
 */
export type PopupType = 'center' | 'top' | 'right' | 'bottom' | 'left'

/**
 * 过渡动画名称类型
 */
export type TransitionName =
  | 'fade'
  | 'zoom-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'

/** 弹出层组件属性接口 */
interface WdPopupProps {
  customStyle?: string
  customClass?: string
  customHeaderClass?: string
  title?: string
  radius?: string | number
  transition?: TransitionName
  closable?: boolean
  position?: PopupType
  closeOnClickModal?: boolean
  duration?: number | boolean
  modal?: boolean
  zIndex?: number
  hideWhenClose?: boolean
  modalStyle?: string
  safeAreaInsetBottom?: boolean
  modelValue?: boolean
  lazyRender?: boolean
  lockScroll?: boolean
}
```

## 最佳实践

### 1. 根据场景选择弹出位置

```vue
<!-- ✅ 操作面板从底部弹出 -->
<wd-popup v-model="show" position="bottom">
  <view class="action-panel">
    <!-- 操作按钮列表 -->
  </view>
</wd-popup>

<!-- ✅ 提示信息从中间弹出 -->
<wd-popup v-model="show" position="center">
  <view class="alert-content">
    <!-- 提示内容 -->
  </view>
</wd-popup>

<!-- ✅ 侧边菜单从左/右弹出 -->
<wd-popup v-model="show" position="left">
  <view class="side-menu">
    <!-- 菜单内容 -->
  </view>
</wd-popup>
```

### 2. 重要操作禁止点击遮罩关闭

```vue
<!-- ✅ 确认对话框禁止点击遮罩关闭 -->
<wd-popup v-model="show" position="center" :close-on-click-modal="false">
  <view class="confirm-dialog">确定要删除吗?</view>
</wd-popup>
```

### 3. 底部弹出层启用安全区域

```vue
<!-- ✅ 底部弹出层适配 iPhone X -->
<wd-popup v-model="show" position="bottom" safe-area-inset-bottom>
  <view class="bottom-panel">内容</view>
</wd-popup>
```

## 常见问题

### 1. 弹出层内容无法滚动

**问题原因:**
- 未设置弹出层最大高度
- `lock-scroll` 锁定了滚动

**解决方案:**

```vue
<!-- 设置最大高度 -->
<wd-popup
  v-model="show"
  position="bottom"
  custom-style="max-height: 70vh;"
>
  <view class="scrollable-content">
    <!-- 长内容 -->
  </view>
</wd-popup>
```

### 2. 多层弹出层关闭顺序问题

**解决方案:**
为每层弹出层设置递增的 `z-index`,并按打开顺序的逆序关闭。

### 3. iPhone X 底部被遮挡

**解决方案:**
对底部弹出的弹出层启用 `safe-area-inset-bottom`:

```vue
<wd-popup v-model="show" position="bottom" safe-area-inset-bottom>
  <!-- 内容 -->
</wd-popup>
```

### 4. 弹出层位置不正确

将 Popup 组件放在页面根层级,避免被父容器的 `transform` 属性影响。

### 5. 关闭动画不流畅

适当增加 `duration` 时间,简化弹出层内容结构。

### 6. 弹出层层级被覆盖

**问题原因:**
- 页面中存在其他高层级元素
- 多个弹出层使用了相同的 z-index

**解决方案:**
```vue
<!-- 设置更高的 z-index -->
<wd-popup v-model="show" :z-index="999">
  <!-- 内容 -->
</wd-popup>
```

### 7. 圆角效果不生效

**问题原因:**
- 内容区域有背景色覆盖了圆角
- 圆角值设置过小

**解决方案:**
```vue
<template>
  <wd-popup v-model="show" position="bottom" :radius="24">
    <!-- 内容不要设置背景色,或保持与弹出层背景一致 -->
    <view class="content">
      内容区域
    </view>
  </wd-popup>
</template>

```

## 主题定制

### CSS 变量

Popup 组件支持以下 CSS 变量进行主题定制:

```scss
// 关闭按钮变量
$-popup-close-color: #909399 !default;      // 关闭按钮颜色
$-popup-close-size: 40rpx !default;         // 关闭按钮大小

// 标题区域变量
$-action-sheet-title-height: 116rpx !default; // 标题高度

// 暗黑模式变量
$-dark-background2: #1d1d1d !default;       // 暗黑背景色
$-dark-color: rgba(255, 255, 255, 0.9) !default; // 暗黑文字色
```

### 自定义主题示例

```vue
<template>
  <wd-popup
    v-model="showPopup"
    position="bottom"
    custom-class="custom-popup"
    custom-header-class="custom-header"
    title="自定义主题"
    closable
  >
    <view class="popup-content">
      自定义主题的弹出层
    </view>
  </wd-popup>
</template>

<style lang="scss">
.custom-popup {
  // 自定义背景色
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%) !important;

  // 自定义圆角
  border-radius: 24rpx 24rpx 0 0 !important;

  // 自定义阴影
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.custom-header {
  // 自定义标题样式
  background: transparent !important;
  font-size: 36rpx !important;
  font-weight: 600;
  color: #333 !important;

  // 关闭按钮样式
  :deep(.wd-popup__close-in-header) {
    color: #999;

    &:active {
      color: #666;
    }
  }
}
</style>
```

### 暗黑模式

组件内置暗黑模式支持,在暗黑模式下会自动应用对应样式:

```scss
// 暗黑模式下的样式
.wot-theme-dark {
  .wd-popup-wrapper {
    :deep() {
      .wd-popup {
        background: $-dark-background2;
      }

      .wd-popup__close {
        color: $-dark-color;
      }

      .wd-popup__header {
        background: $-dark-background2;
        color: $-dark-color;
      }
    }
  }
}
```

## 高级用法

### 嵌套弹出层

支持在弹出层内再打开新的弹出层:

```vue
<template>
  <view class="demo">
    <wd-button @click="showFirst = true">打开弹出层</wd-button>

    <!-- 第一层弹出层 -->
    <wd-popup
      v-model="showFirst"
      position="bottom"
      title="选择分类"
      :z-index="100"
      closable
    >
      <view class="category-list">
        <view
          v-for="item in categories"
          :key="item.id"
          class="category-item"
          @click="handleCategory(item)"
        >
          {{ item.name }}
        </view>
      </view>
    </wd-popup>

    <!-- 第二层弹出层 -->
    <wd-popup
      v-model="showSecond"
      position="bottom"
      :title="selectedCategory?.name"
      :z-index="200"
      closable
    >
      <view class="sub-list">
        <view
          v-for="sub in selectedCategory?.children"
          :key="sub.id"
          class="sub-item"
          @click="handleSubCategory(sub)"
        >
          {{ sub.name }}
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showFirst = ref(false)
const showSecond = ref(false)
const selectedCategory = ref<any>(null)

const categories = ref([
  {
    id: 1,
    name: '数码产品',
    children: [
      { id: 11, name: '手机' },
      { id: 12, name: '电脑' },
      { id: 13, name: '平板' }
    ]
  },
  {
    id: 2,
    name: '服装鞋帽',
    children: [
      { id: 21, name: '男装' },
      { id: 22, name: '女装' },
      { id: 23, name: '童装' }
    ]
  }
])

const handleCategory = (item: any) => {
  selectedCategory.value = item
  showSecond.value = true
}

const handleSubCategory = (sub: any) => {
  console.log('选择了:', sub.name)
  showFirst.value = false
  showSecond.value = false
}
</script>

```

### 带表单的弹出层

弹出层中包含表单:

```vue
<template>
  <view class="demo">
    <wd-button @click="showForm = true">打开表单</wd-button>

    <wd-popup
      v-model="showForm"
      position="bottom"
      title="添加地址"
      closable
      :close-on-click-modal="false"
      safe-area-inset-bottom
    >
      <view class="form-content">
        <wd-cell-group>
          <wd-input
            v-model="form.name"
            label="收货人"
            placeholder="请输入收货人姓名"
          />
          <wd-input
            v-model="form.phone"
            label="手机号"
            placeholder="请输入手机号"
            type="number"
          />
          <wd-textarea
            v-model="form.address"
            label="详细地址"
            placeholder="请输入详细地址"
          />
        </wd-cell-group>

        <view class="form-actions">
          <wd-button plain @click="handleCancel">取消</wd-button>
          <wd-button type="primary" @click="handleSubmit">保存</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const showForm = ref(false)

const form = reactive({
  name: '',
  phone: '',
  address: ''
})

const handleCancel = () => {
  showForm.value = false
  // 重置表单
  form.name = ''
  form.phone = ''
  form.address = ''
}

const handleSubmit = () => {
  // 表单验证
  if (!form.name) {
    uni.showToast({ title: '请输入收货人', icon: 'none' })
    return
  }
  if (!form.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }

  // 提交表单
  console.log('提交表单:', form)
  showForm.value = false
}
</script>

```

### 带选项卡的弹出层

在弹出层中使用选项卡切换内容:

```vue
<template>
  <view class="demo">
    <wd-button @click="showTabs = true">带选项卡</wd-button>

    <wd-popup
      v-model="showTabs"
      position="bottom"
      closable
      custom-style="height: 60vh;"
    >
      <wd-tabs v-model="activeTab">
        <wd-tab title="推荐">
          <scroll-view scroll-y class="tab-content">
            <view v-for="i in 20" :key="i" class="list-item">
              推荐内容 {{ i }}
            </view>
          </scroll-view>
        </wd-tab>
        <wd-tab title="最新">
          <scroll-view scroll-y class="tab-content">
            <view v-for="i in 20" :key="i" class="list-item">
              最新内容 {{ i }}
            </view>
          </scroll-view>
        </wd-tab>
        <wd-tab title="热门">
          <scroll-view scroll-y class="tab-content">
            <view v-for="i in 20" :key="i" class="list-item">
              热门内容 {{ i }}
            </view>
          </scroll-view>
        </wd-tab>
      </wd-tabs>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showTabs = ref(false)
const activeTab = ref(0)
</script>

```

### 筛选面板

实现复杂的筛选功能:

```vue
<template>
  <view class="demo">
    <wd-button @click="showFilter = true">筛选</wd-button>

    <wd-popup
      v-model="showFilter"
      position="right"
      custom-style="width: 80vw; height: 100%;"
    >
      <view class="filter-panel">
        <view class="filter-header">
          <text class="filter-title">筛选条件</text>
          <text class="filter-reset" @click="handleReset">重置</text>
        </view>

        <scroll-view scroll-y class="filter-content">
          <!-- 价格区间 -->
          <view class="filter-section">
            <view class="section-title">价格区间</view>
            <view class="price-range">
              <input
                v-model="filter.minPrice"
                type="number"
                placeholder="最低价"
                class="price-input"
              />
              <text class="price-sep">-</text>
              <input
                v-model="filter.maxPrice"
                type="number"
                placeholder="最高价"
                class="price-input"
              />
            </view>
          </view>

          <!-- 品牌 -->
          <view class="filter-section">
            <view class="section-title">品牌</view>
            <view class="tag-list">
              <view
                v-for="brand in brands"
                :key="brand"
                :class="['tag-item', { active: filter.brands.includes(brand) }]"
                @click="toggleBrand(brand)"
              >
                {{ brand }}
              </view>
            </view>
          </view>

          <!-- 排序 -->
          <view class="filter-section">
            <view class="section-title">排序</view>
            <view class="tag-list">
              <view
                v-for="sort in sortOptions"
                :key="sort.value"
                :class="['tag-item', { active: filter.sort === sort.value }]"
                @click="filter.sort = sort.value"
              >
                {{ sort.label }}
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="filter-footer">
          <wd-button plain @click="showFilter = false">取消</wd-button>
          <wd-button type="primary" @click="handleConfirm">确定</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const showFilter = ref(false)

const filter = reactive({
  minPrice: '',
  maxPrice: '',
  brands: [] as string[],
  sort: 'default'
})

const brands = ref(['苹果', '华为', '小米', '三星', 'OPPO', 'vivo'])

const sortOptions = ref([
  { label: '默认', value: 'default' },
  { label: '价格升序', value: 'price_asc' },
  { label: '价格降序', value: 'price_desc' },
  { label: '销量优先', value: 'sales' }
])

const toggleBrand = (brand: string) => {
  const index = filter.brands.indexOf(brand)
  if (index > -1) {
    filter.brands.splice(index, 1)
  } else {
    filter.brands.push(brand)
  }
}

const handleReset = () => {
  filter.minPrice = ''
  filter.maxPrice = ''
  filter.brands = []
  filter.sort = 'default'
}

const handleConfirm = () => {
  console.log('筛选条件:', filter)
  showFilter.value = false
}
</script>

```

### 图片预览弹出层

实现图片预览功能:

```vue
<template>
  <view class="demo">
    <view class="image-grid">
      <image
        v-for="(img, index) in images"
        :key="index"
        :src="img"
        mode="aspectFill"
        class="grid-image"
        @click="previewImage(index)"
      />
    </view>

    <wd-popup
      v-model="showPreview"
      position="center"
      :modal="true"
      :radius="0"
      custom-style="width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.9);"
      @click-modal="showPreview = false"
    >
      <swiper
        :current="currentIndex"
        class="preview-swiper"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(img, index) in images" :key="index">
          <view class="preview-item">
            <image :src="img" mode="aspectFit" class="preview-image" />
          </view>
        </swiper-item>
      </swiper>

      <view class="preview-indicator">
        {{ currentIndex + 1 }} / {{ images.length }}
      </view>

      <view class="preview-close" @click="showPreview = false">
        <wd-icon name="close" size="48rpx" color="#fff" />
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showPreview = ref(false)
const currentIndex = ref(0)

const images = ref([
  'https://via.placeholder.com/400x300/1890ff/fff?text=Image1',
  'https://via.placeholder.com/400x300/52c41a/fff?text=Image2',
  'https://via.placeholder.com/400x300/faad14/fff?text=Image3',
  'https://via.placeholder.com/400x300/ff4d4f/fff?text=Image4'
])

const previewImage = (index: number) => {
  currentIndex.value = index
  showPreview.value = true
}

const onSwiperChange = (e: any) => {
  currentIndex.value = e.detail.current
}
</script>

```

## 注意事项

### 1. 性能优化

- 使用 `lazy-render` 延迟渲染复杂内容
- 弹出层内的长列表使用虚拟滚动
- 避免在弹出层内渲染大量图片

### 2. 交互设计

- 底部弹出层建议启用 `safe-area-inset-bottom`
- 重要操作的弹出层应禁止点击遮罩关闭
- 多层弹出层要注意层级管理

### 3. 无障碍

- 弹出层应有明确的关闭方式
- 标题应简洁明了
- 考虑键盘导航支持

### 4. 多端兼容

- 不同平台的安全区域计算方式不同,组件已做处理
- 微信小程序中部分样式可能需要 `!important` 覆盖
- iOS 设备需要特别注意底部安全区域

## 组件依赖

Popup 组件内部依赖以下组件:

- **wd-overlay** - 遮罩层,提供背景遮罩效果
- **wd-transition** - 过渡动画,提供进入/离开动画
- **wd-icon** - 图标,用于关闭按钮

## 完整示例

### 综合示例

```vue
<template>
  <view class="demo-page">
    <!-- 基础弹出 -->
    <view class="demo-section">
      <view class="demo-title">基础用法</view>
      <view class="demo-buttons">
        <wd-button size="small" @click="showCenter = true">居中</wd-button>
        <wd-button size="small" @click="showTop = true">顶部</wd-button>
        <wd-button size="small" @click="showBottom = true">底部</wd-button>
        <wd-button size="small" @click="showLeft = true">左侧</wd-button>
        <wd-button size="small" @click="showRight = true">右侧</wd-button>
      </view>
    </view>

    <!-- 带标题 -->
    <view class="demo-section">
      <view class="demo-title">带标题</view>
      <wd-button @click="showWithTitle = true">带标题弹出层</wd-button>
    </view>

    <!-- 自定义内容 -->
    <view class="demo-section">
      <view class="demo-title">自定义内容</view>
      <wd-button @click="showCustom = true">自定义内容</wd-button>
    </view>

    <!-- 居中弹出 -->
    <wd-popup v-model="showCenter" position="center">
      <view class="popup-box">
        <text>居中弹出层</text>
      </view>
    </wd-popup>

    <!-- 顶部弹出 -->
    <wd-popup v-model="showTop" position="top">
      <view class="popup-bar">
        <text>顶部弹出层</text>
      </view>
    </wd-popup>

    <!-- 底部弹出 -->
    <wd-popup v-model="showBottom" position="bottom" safe-area-inset-bottom>
      <view class="popup-panel">
        <text>底部弹出层</text>
      </view>
    </wd-popup>

    <!-- 左侧弹出 -->
    <wd-popup v-model="showLeft" position="left">
      <view class="popup-drawer">
        <text>左侧弹出层</text>
      </view>
    </wd-popup>

    <!-- 右侧弹出 -->
    <wd-popup v-model="showRight" position="right">
      <view class="popup-drawer">
        <text>右侧弹出层</text>
      </view>
    </wd-popup>

    <!-- 带标题弹出层 -->
    <wd-popup
      v-model="showWithTitle"
      position="bottom"
      title="选择城市"
      closable
      safe-area-inset-bottom
    >
      <view class="city-list">
        <view
          v-for="city in cities"
          :key="city"
          class="city-item"
          @click="handleSelectCity(city)"
        >
          {{ city }}
        </view>
      </view>
    </wd-popup>

    <!-- 自定义内容弹出层 -->
    <wd-popup
      v-model="showCustom"
      position="center"
      :close-on-click-modal="false"
      closable
    >
      <view class="custom-content">
        <view class="custom-icon">
          <wd-icon name="check-circle" size="96rpx" color="#52c41a" />
        </view>
        <view class="custom-title">操作成功</view>
        <view class="custom-desc">您的订单已提交成功</view>
        <wd-button type="primary" block @click="showCustom = false">
          确定
        </wd-button>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showCenter = ref(false)
const showTop = ref(false)
const showBottom = ref(false)
const showLeft = ref(false)
const showRight = ref(false)
const showWithTitle = ref(false)
const showCustom = ref(false)

const cities = ref([
  '北京', '上海', '广州', '深圳',
  '杭州', '南京', '成都', '武汉'
])

const handleSelectCity = (city: string) => {
  console.log('选择了:', city)
  showWithTitle.value = false
}
</script>

```