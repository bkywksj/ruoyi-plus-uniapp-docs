# Watermark 水印

## 介绍

Watermark 是一个功能完善的水印组件,用于在页面或组件上添加指定的图片或文字水印,可用于版权保护、品牌宣传、防截图等场景。该组件基于 Canvas 技术实现,支持文字水印和图片水印两种类型,能够自动适配不同平台和设备像素比,确保水印在各种环境下都能清晰显示。

**核心特性:**

- **双模式支持** - 支持文字水印和图片水印两种模式,满足不同场景需求
- **全屏覆盖** - 支持全屏水印模式,使用 fixed 定位覆盖整个页面
- **自定义旋转** - 支持设置水印旋转角度,默认 -25 度倾斜显示
- **间距控制** - 支持设置 X/Y 轴间距,灵活控制水印密度
- **字体定制** - 支持自定义字体颜色、大小、样式、粗细、字体系列
- **透明度控制** - 支持设置水印透明度,避免过度影响内容展示
- **层级控制** - 支持自定义 z-index,确保水印正确叠加
- **跨平台适配** - 自动适配 H5、小程序等不同平台的 Canvas API
- **高清支持** - 自动获取设备像素比,确保高清屏幕显示清晰

## 基本用法

### 文字水印

最基础的用法,在页面上显示文字水印:

```vue
<template>
  <view class="demo">
    <wd-watermark content="RuoYi Plus" />

    <!-- 页面内容 -->
    <view class="content">
      <text>这是页面内容,水印会覆盖在内容上方</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**使用说明:**
- `content` 属性设置水印文字内容
- 水印默认全屏显示,使用 fixed 定位
- 父容器需要设置 `position: relative` 以便正确定位
- 水印不会响应点击事件,不影响页面交互

### 图片水印

使用图片作为水印:

```vue
<template>
  <view class="demo">
    <wd-watermark
      image="https://unpkg.com/wot-design-uni-assets/logo.png"
      :image-width="100"
      :image-height="100"
    />

    <view class="content">
      <text>这是带有图片水印的页面内容</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**使用说明:**
- `image` 属性设置水印图片URL,支持网络图片和 Base64
- `image-width` 和 `image-height` 设置图片尺寸,单位为 rpx
- 图片水印优先级高于文字水印,同时设置时只显示图片
- 钉钉小程序仅支持网络图片,不支持 Base64

### 局部水印

将水印限制在特定容器内:

```vue
<template>
  <view class="demo">
    <!-- 带水印的卡片 -->
    <view class="card">
      <wd-watermark content="机密文件" :full-screen="false" />
      <view class="card-content">
        <text class="title">重要文件</text>
        <text class="desc">这是一份重要的机密文件内容...</text>
      </view>
    </view>

    <!-- 不带水印的普通内容 -->
    <view class="normal-content">
      <text>这是普通内容,没有水印覆盖</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**使用说明:**
- 设置 `full-screen="false"` 可以禁用全屏模式
- 局部水印使用 absolute 定位,相对于父容器
- 父容器需要设置 `position: relative` 和 `overflow: hidden`

### 自定义颜色和透明度

调整水印的颜色和透明度:

```vue
<template>
  <view class="demo">
    <!-- 红色水印 -->
    <view class="card">
      <wd-watermark content="机密" color="#ff4d4f" :opacity="0.3" :full-screen="false" />
      <view class="card-content">
        <text>红色半透明水印</text>
      </view>
    </view>

    <!-- 蓝色水印 -->
    <view class="card">
      <wd-watermark content="内部使用" color="#1890ff" :opacity="0.2" :full-screen="false" />
      <view class="card-content">
        <text>蓝色低透明度水印</text>
      </view>
    </view>

    <!-- 深色水印 -->
    <view class="card dark-card">
      <wd-watermark content="CONFIDENTIAL" color="#ffffff" :opacity="0.15" :full-screen="false" />
      <view class="card-content">
        <text style="color: #fff;">深色背景白色水印</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**使用说明:**
- `color` 属性设置水印颜色,支持任意 CSS 颜色值
- `opacity` 属性设置透明度,取值范围 0-1
- 建议透明度设置在 0.1-0.5 之间,避免过度影响内容阅读

### 自定义旋转角度

调整水印的旋转角度:

```vue
<template>
  <view class="demo">
    <!-- 默认角度 -25° -->
    <view class="card">
      <wd-watermark content="默认角度" :rotate="-25" :full-screen="false" />
      <view class="card-content">
        <text>旋转角度: -25°</text>
      </view>
    </view>

    <!-- 水平显示 -->
    <view class="card">
      <wd-watermark content="水平显示" :rotate="0" :full-screen="false" />
      <view class="card-content">
        <text>旋转角度: 0°</text>
      </view>
    </view>

    <!-- 垂直显示 -->
    <view class="card">
      <wd-watermark content="垂直" :rotate="-90" :full-screen="false" />
      <view class="card-content">
        <text>旋转角度: -90°</text>
      </view>
    </view>

    <!-- 正向倾斜 -->
    <view class="card">
      <wd-watermark content="正向倾斜" :rotate="25" :full-screen="false" />
      <view class="card-content">
        <text>旋转角度: 25°</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**使用说明:**
- `rotate` 属性设置旋转角度,单位为度
- 负值为逆时针旋转,正值为顺时针旋转
- 默认值为 -25 度,是常见的水印倾斜角度

### 调整水印密度

通过间距和尺寸控制水印密度:

```vue
<template>
  <view class="demo">
    <!-- 稀疏水印 -->
    <view class="card">
      <wd-watermark
        content="稀疏"
        :width="300"
        :height="300"
        :gutter-x="100"
        :gutter-y="100"
        :full-screen="false"
      />
      <view class="card-content">
        <text>稀疏水印 - 大间距</text>
      </view>
    </view>

    <!-- 密集水印 -->
    <view class="card">
      <wd-watermark
        content="密集"
        :width="100"
        :height="100"
        :gutter-x="20"
        :gutter-y="20"
        :full-screen="false"
      />
      <view class="card-content">
        <text>密集水印 - 小间距</text>
      </view>
    </view>

    <!-- 默认密度 -->
    <view class="card">
      <wd-watermark content="默认" :full-screen="false" />
      <view class="card-content">
        <text>默认密度</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**使用说明:**
- `width` 和 `height` 设置单个水印区域的尺寸,单位为 rpx
- `gutter-x` 和 `gutter-y` 设置水印之间的间距,单位为 rpx
- 减小尺寸和间距可以增加水印密度
- 增大尺寸和间距可以使水印更稀疏

### 自定义字体样式

调整水印的字体样式:

```vue
<template>
  <view class="demo">
    <!-- 大号粗体 -->
    <view class="card">
      <wd-watermark
        content="大号粗体"
        :size="40"
        font-weight="bold"
        :full-screen="false"
      />
      <view class="card-content">
        <text>大号粗体水印</text>
      </view>
    </view>

    <!-- 小号细体 -->
    <view class="card">
      <wd-watermark
        content="小号细体"
        :size="20"
        font-weight="300"
        :full-screen="false"
      />
      <view class="card-content">
        <text>小号细体水印</text>
      </view>
    </view>

    <!-- 斜体 -->
    <view class="card">
      <wd-watermark
        content="斜体样式"
        font-style="italic"
        :full-screen="false"
      />
      <view class="card-content">
        <text>斜体水印</text>
      </view>
    </view>

    <!-- 自定义字体 -->
    <view class="card">
      <wd-watermark
        content="Arial Font"
        font-family="Arial"
        :full-screen="false"
      />
      <view class="card-content">
        <text>自定义字体</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**使用说明:**
- `size` 属性设置字体大小,单位为 rpx,默认 28rpx
- `font-weight` 属性设置字体粗细,支持数值或关键字
- `font-style` 属性设置字体样式,可选 normal、italic、oblique
- `font-family` 属性设置字体系列,默认 PingFang SC
- 注意: fontStyle、fontWeight、fontFamily 仅在微信小程序和 H5 中生效

### 自定义层级

调整水印的层叠顺序:

```vue
<template>
  <view class="demo">
    <wd-watermark content="底层水印" :z-index="10" />

    <view class="content">
      <!-- 弹出层会覆盖水印 -->
      <wd-popup v-model="showPopup" position="center">
        <view class="popup-content">
          <text>弹出层内容</text>
          <text>水印不会覆盖弹出层</text>
        </view>
      </wd-popup>

      <wd-button @click="showPopup = true">打开弹出层</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showPopup = ref(false)
</script>

```

**使用说明:**
- `z-index` 属性设置水印层级,默认 1100
- 降低 z-index 可以让其他高层级元素覆盖水印
- 增加 z-index 可以确保水印始终显示在最上层

### 动态水印

根据用户信息动态生成水印:

```vue
<template>
  <view class="demo">
    <wd-watermark :content="watermarkText" />

    <view class="content">
      <text class="title">动态水印示例</text>
      <text class="info">当前用户: {{ userInfo.name }}</text>
      <text class="info">用户ID: {{ userInfo.id }}</text>
      <text class="info">时间: {{ currentTime }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

// 用户信息
const userInfo = ref({
  name: '张三',
  id: 'U10086'
})

// 当前时间
const currentTime = ref('')

// 动态生成水印内容
const watermarkText = computed(() => {
  return `${userInfo.value.name} ${userInfo.value.id}`
})

// 格式化时间
const formatTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

onMounted(() => {
  currentTime.value = formatTime()
})
</script>

```

**使用说明:**
- 使用 computed 动态生成水印内容
- 水印会随着响应式数据的变化自动更新
- 可以包含用户名、ID、时间等信息用于溯源

### 多行水印

实现多行文字水印效果:

```vue
<template>
  <view class="demo">
    <!-- 第一行水印 -->
    <wd-watermark
      content="RuoYi Plus"
      :width="200"
      :height="120"
      :gutter-y="60"
      :z-index="1100"
    />

    <!-- 第二行水印(偏移显示) -->
    <wd-watermark
      content="内部使用"
      :width="200"
      :height="120"
      :gutter-y="60"
      :z-index="1100"
      custom-style="margin-top: 60rpx;"
    />

    <view class="content">
      <text>多行水印效果</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**使用说明:**
- 通过叠加多个水印组件实现多行效果
- 使用 `custom-style` 调整水印位置偏移
- 多个水印层级相同时会正确叠加显示

## 实战案例

### 案例1: 文档保护水印

为机密文档添加水印保护:

```vue
<template>
  <view class="document-viewer">
    <!-- 用户信息水印 -->
    <wd-watermark
      :content="`${userInfo.name} ${userInfo.phone}`"
      :opacity="0.15"
      :rotate="-30"
      color="#666"
    />

    <!-- 文档头部 -->
    <view class="doc-header">
      <text class="doc-title">{{ document.title }}</text>
      <view class="doc-meta">
        <text class="meta-item">作者: {{ document.author }}</text>
        <text class="meta-item">日期: {{ document.date }}</text>
        <wd-tag type="danger" size="small">机密</wd-tag>
      </view>
    </view>

    <!-- 文档内容 -->
    <view class="doc-content">
      <rich-text :nodes="document.content" />
    </view>

    <!-- 文档页脚 -->
    <view class="doc-footer">
      <text class="footer-text">本文档仅供内部使用,禁止外传</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 用户信息
const userInfo = ref({
  name: '张三',
  phone: '138****8888'
})

// 文档信息
const document = ref({
  title: '2024年度财务报告',
  author: '财务部',
  date: '2024-12-01',
  content: '<p>这是文档的详细内容...</p><p>包含重要的财务数据...</p>'
})
</script>

```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| content | 水印文字内容 | `string` | `''` |
| image | 水印图片地址,支持网络图片和 Base64 | `string` | `''` |
| image-width | 图片宽度,单位 rpx | `number` | `200` |
| image-height | 图片高度,单位 rpx | `number` | `200` |
| width | 单个水印区域宽度,单位 rpx | `number` | `200` |
| height | 单个水印区域高度,单位 rpx | `number` | `200` |
| gutter-x | X轴间距,单位 rpx | `number` | `0` |
| gutter-y | Y轴间距,单位 rpx | `number` | `0` |
| full-screen | 是否全屏显示 | `boolean` | `true` |
| color | 水印文字颜色 | `string` | `'#8c8c8c'` |
| size | 水印字体大小,单位 rpx | `number` | `28` |
| font-style | 字体样式(仅微信和H5) | `string` | `'normal'` |
| font-weight | 字体粗细(仅微信和H5) | `number \| string` | `'normal'` |
| font-family | 字体系列(仅微信和H5) | `string` | `'PingFang SC'` |
| rotate | 旋转角度 | `number` | `-25` |
| z-index | 层级 | `number` | `1100` |
| opacity | 透明度,取值 0-1 | `number` | `0.5` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### 类型定义

```typescript
/**
 * 水印组件属性接口
 */
interface WdWatermarkProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 显示内容 */
  content?: string
  /** 显示图片的地址,支持网络图片和base64(钉钉小程序仅支持网络图片) */
  image?: string
  /** 图片高度,单位rpx */
  imageHeight?: number
  /** 图片宽度,单位rpx */
  imageWidth?: number

  /** X轴间距,单位rpx */
  gutterX?: number
  /** Y轴间距,单位rpx */
  gutterY?: number
  /** canvas画布宽度,单位rpx */
  width?: number
  /** canvas画布高度,单位rpx */
  height?: number

  /** 是否为全屏水印 */
  fullScreen?: boolean
  /** 水印字体颜色 */
  color?: string
  /** 水印字体大小,单位rpx */
  size?: number
  /** 水印字体样式(仅微信和h5支持),可选值: normal、italic、oblique */
  fontStyle?: string
  /** 水印字体的粗细(仅微信和h5支持) */
  fontWeight?: number | string
  /** 水印字体系列(仅微信和h5支持) */
  fontFamily?: string
  /** 水印旋转角度 */
  rotate?: number
  /** 自定义层级 */
  zIndex?: number
  /** 自定义透明度,取值 0~1 */
  opacity?: number
}
```

## 最佳实践

### 1. 选择合适的透明度

根据使用场景选择合适的透明度:

```vue
<!-- ✅ 推荐: 文档类内容使用较低透明度 -->
<wd-watermark content="机密文件" :opacity="0.15" />

<!-- ✅ 推荐: 图片类内容使用中等透明度 -->
<wd-watermark image="/logo.png" :opacity="0.3" />

<!-- ❌ 不推荐: 过高透明度影响阅读 -->
<wd-watermark content="水印" :opacity="0.8" />
```

### 2. 合理设置水印密度

根据内容重要性调整水印密度:

```vue
<!-- ✅ 高度机密: 密集水印 -->
<wd-watermark
  content="绝密"
  :width="80"
  :height="80"
  :gutter-x="10"
  :gutter-y="10"
/>

<!-- ✅ 一般内容: 适中密度 -->
<wd-watermark
  content="内部使用"
  :width="200"
  :height="200"
/>

<!-- ✅ 品牌展示: 稀疏水印 -->
<wd-watermark
  image="/logo.png"
  :width="400"
  :height="400"
  :gutter-x="100"
  :gutter-y="100"
/>
```

### 3. 动态水印用于溯源

包含用户信息的水印便于追踪泄露源:

```vue
<script lang="ts" setup>
import { computed } from 'vue'

const userInfo = {
  name: '张三',
  id: 'U10086',
  time: new Date().toLocaleString()
}

// 包含用户信息和时间戳
const watermarkText = computed(() => {
  return `${userInfo.name} ${userInfo.id} ${userInfo.time}`
})
</script>

<template>
  <wd-watermark :content="watermarkText" :size="20" />
</template>
```

## 常见问题

### 1. 水印不显示

**问题原因:**
- 父容器没有设置 `position: relative`
- 水印层级被其他元素覆盖
- Canvas 绑定错误

**解决方案:**

```vue
<template>
  <!-- ✅ 父容器必须设置相对定位 -->
  <view class="container">
    <wd-watermark content="水印" />
    <view class="content">内容</view>
  </view>
</template>

<style>
.container {
  position: relative; /* 必须 */
}
</style>
```

### 2. 图片水印加载失败

**问题原因:**
- 图片地址跨域限制
- 钉钉小程序不支持 Base64
- 图片地址无效

**解决方案:**

```vue
<script lang="ts" setup>
// ✅ 确保图片支持跨域
const imageUrl = 'https://cdn.example.com/logo.png'

// ✅ 钉钉小程序使用网络图片
// #ifdef MP-DINGTALK
const logoUrl = 'https://example.com/logo.png'
// #endif

// #ifndef MP-DINGTALK
const logoUrl = 'data:image/png;base64,...' // 其他平台可用 Base64
// #endif
</script>
```

### 3. 字体样式不生效

**问题原因:**
- fontStyle、fontWeight、fontFamily 仅在微信和 H5 中生效
- 其他小程序平台不支持这些属性

**解决方案:**

```vue
<!-- 在其他小程序中,只能使用 size 和 color -->
<wd-watermark
  content="水印"
  :size="32"
  color="#666"
/>

<!-- 仅在 H5 或微信小程序中使用字体样式 -->
<!-- #ifdef H5 || MP-WEIXIN -->
<wd-watermark
  content="水印"
  font-style="italic"
  font-weight="bold"
  font-family="Arial"
/>
<!-- #endif -->
```

### 4. 水印影响页面交互

组件默认设置了 `pointer-events: none`,水印不会影响页面交互。如有问题检查是否有其他样式覆盖。

### 5. 水印在不同设备显示大小不一致

组件已自动处理设备像素比适配。使用 rpx 单位可确保在不同设备上保持一致的视觉大小。
