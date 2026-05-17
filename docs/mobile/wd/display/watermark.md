---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/display/watermark
---

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

## 实现原理

### Canvas 绘制原理

水印组件基于 Canvas 技术实现,通过以下步骤生成水印图案:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Watermark 渲染流程                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   初始化     │ -> │  Canvas绑定  │ -> │  获取DPR     │  │
│  │   组件参数   │    │  获取上下文  │    │  设备像素比  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │          │
│         v                   v                   v          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              计算画布尺寸 (考虑DPR缩放)               │  │
│  │          canvasWidth = (width + gutterX) * dpr       │  │
│  │          canvasHeight = (height + gutterY) * dpr     │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐              │
│         v                 v                 v              │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐         │
│  │  图片水印  │   │  文字水印  │   │  空白水印  │         │
│  │  drawImage │   │  fillText  │   │   (跳过)   │         │
│  └────────────┘   └────────────┘   └────────────┘         │
│         │                 │                                 │
│         v                 v                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              应用旋转变换 (rotate)                    │  │
│  │         ctx.translate(centerX, centerY)              │  │
│  │         ctx.rotate(rotate * Math.PI / 180)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           v                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              导出为 DataURL                           │  │
│  │         canvasToTempFilePath (小程序)                │  │
│  │         canvas.toDataURL() (H5)                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           v                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              设置为背景图片 (background-image)        │  │
│  │         使用 repeat 平铺整个区域                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 设备像素比适配

组件会自动获取设备像素比(DPR),确保水印在高清屏幕上清晰显示:

```typescript
// 获取设备像素比
const getDevicePixelRatio = (): number => {
  // H5 环境
  // #ifdef H5
  return window.devicePixelRatio || 1
  // #endif

  // 小程序环境
  // #ifndef H5
  const systemInfo = uni.getSystemInfoSync()
  return systemInfo.pixelRatio || 1
  // #endif
}

// 计算实际画布尺寸
const dpr = getDevicePixelRatio()
const actualWidth = (props.width + props.gutterX) * dpr
const actualHeight = (props.height + props.gutterY) * dpr
```

**适配规则:**

| 设备类型 | DPR | 画布倍率 | 显示效果 |
|---------|-----|---------|---------|
| 普通屏幕 | 1x | 1倍 | 正常清晰 |
| 高清屏幕 | 2x | 2倍 | 高清显示 |
| 超高清屏幕 | 3x | 3倍 | 超清显示 |

### 跨平台 Canvas API 差异

不同平台的 Canvas API 存在差异,组件内部进行了统一封装:

```typescript
// 平台差异处理示例
const bindCanvas = async () => {
  // #ifdef H5
  // H5 使用标准 DOM API
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  const ctx = canvas.getContext('2d')
  // #endif

  // #ifdef MP-WEIXIN
  // 微信小程序使用 2D Canvas
  const query = uni.createSelectorQuery().in(instance)
  query.select(`#${canvasId}`)
    .fields({ node: true, size: true })
    .exec((res) => {
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
    })
  // #endif

  // #ifdef MP-ALIPAY || MP-DINGTALK
  // 支付宝/钉钉使用旧版 Canvas API
  const ctx = uni.createCanvasContext(canvasId, instance)
  // #endif
}
```

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

### 案例2: 图片预览水印

为图片预览添加版权保护水印:

```vue
<template>
  <view class="image-gallery">
    <!-- 图片水印 -->
    <wd-watermark
      :content="`© ${copyright.owner} ${copyright.year}`"
      :opacity="0.2"
      :size="24"
      color="#ffffff"
      :rotate="-30"
    />

    <!-- 图片列表 -->
    <view class="gallery-grid">
      <view
        v-for="(item, index) in imageList"
        :key="index"
        class="gallery-item"
        @click="previewImage(index)"
      >
        <image :src="item.thumbnail" mode="aspectFill" class="gallery-image" />
        <view class="image-info">
          <text class="image-title">{{ item.title }}</text>
          <text class="image-desc">{{ item.description }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 版权信息
const copyright = ref({
  owner: 'RuoYi Plus',
  year: new Date().getFullYear()
})

// 图片列表
const imageList = ref([
  {
    thumbnail: 'https://example.com/image1_thumb.jpg',
    url: 'https://example.com/image1.jpg',
    title: '产品图片1',
    description: '高清产品展示图'
  },
  {
    thumbnail: 'https://example.com/image2_thumb.jpg',
    url: 'https://example.com/image2.jpg',
    title: '产品图片2',
    description: '产品细节图'
  }
])

// 预览图片
const previewImage = (index: number) => {
  uni.previewImage({
    current: index,
    urls: imageList.value.map(item => item.url)
  })
}
</script>

<style lang="scss" scoped>
.image-gallery {
  position: relative;
  padding: 32rpx;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.gallery-item {
  border-radius: 16rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.gallery-image {
  width: 100%;
  height: 240rpx;
}

.image-info {
  padding: 16rpx;
}

.image-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.image-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
</style>
```

### 案例3: 电商商品水印

为电商商品页添加品牌水印:

```vue
<template>
  <view class="product-detail">
    <!-- 品牌Logo水印 -->
    <wd-watermark
      :image="brandLogo"
      :image-width="120"
      :image-height="40"
      :opacity="0.15"
      :width="300"
      :height="200"
      :gutter-x="80"
      :gutter-y="60"
    />

    <!-- 商品轮播图 -->
    <swiper class="product-swiper" :autoplay="true" :interval="3000" indicator-dots>
      <swiper-item v-for="(image, index) in product.images" :key="index">
        <image :src="image" mode="aspectFill" class="swiper-image" />
      </swiper-item>
    </swiper>

    <!-- 商品信息 -->
    <view class="product-info">
      <view class="price-row">
        <text class="price">¥{{ product.price }}</text>
        <text class="original-price">¥{{ product.originalPrice }}</text>
        <wd-tag type="danger" size="small">{{ product.discount }}折</wd-tag>
      </view>

      <text class="product-title">{{ product.title }}</text>
      <text class="product-desc">{{ product.description }}</text>

      <view class="product-tags">
        <wd-tag v-for="tag in product.tags" :key="tag" type="primary" plain size="small">
          {{ tag }}
        </wd-tag>
      </view>
    </view>

    <!-- 购买按钮 -->
    <view class="action-bar">
      <wd-button type="warning" block @click="addToCart">加入购物车</wd-button>
      <wd-button type="danger" block @click="buyNow">立即购买</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 品牌Logo
const brandLogo = ref('https://example.com/brand-logo.png')

// 商品信息
const product = ref({
  title: '【新品首发】高端智能手表 Pro Max',
  description: '全新升级,健康监测,超长续航',
  price: 1999,
  originalPrice: 2999,
  discount: 6.7,
  images: [
    'https://example.com/product1.jpg',
    'https://example.com/product2.jpg',
    'https://example.com/product3.jpg'
  ],
  tags: ['新品', '包邮', '7天退换']
})

// 加入购物车
const addToCart = () => {
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}

// 立即购买
const buyNow = () => {
  uni.navigateTo({ url: '/pages/order/confirm' })
}
</script>

<style lang="scss" scoped>
.product-detail {
  position: relative;
  min-height: 100vh;
  background: #f5f5f5;
}

.product-swiper {
  height: 750rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.product-info {
  background: #fff;
  padding: 32rpx;
  margin-top: 16rpx;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.price {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.original-price {
  font-size: 28rpx;
  color: #999;
  text-decoration: line-through;
}

.product-title {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-top: 24rpx;
  line-height: 1.5;
}

.product-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-top: 12rpx;
}

.product-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 24rpx;
  flex-wrap: wrap;
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
}
</style>
```

### 案例4: 合同签署水印

为电子合同添加签署信息水印:

```vue
<template>
  <view class="contract-viewer">
    <!-- 签署水印 -->
    <wd-watermark
      :content="signatureInfo"
      :opacity="0.12"
      :size="22"
      :rotate="-35"
      color="#1890ff"
      :width="280"
      :height="150"
    />

    <!-- 合同头部 -->
    <view class="contract-header">
      <text class="contract-title">{{ contract.title }}</text>
      <view class="contract-meta">
        <text>合同编号: {{ contract.no }}</text>
        <text>签署日期: {{ contract.signDate }}</text>
      </view>
    </view>

    <!-- 合同内容 -->
    <scroll-view scroll-y class="contract-content">
      <rich-text :nodes="contract.content" />
    </scroll-view>

    <!-- 签署信息 -->
    <view class="signature-section">
      <view class="signature-item">
        <text class="label">甲方签章:</text>
        <image v-if="signatures.partyA" :src="signatures.partyA" class="signature-image" />
        <text v-else class="unsigned">未签署</text>
      </view>
      <view class="signature-item">
        <text class="label">乙方签章:</text>
        <image v-if="signatures.partyB" :src="signatures.partyB" class="signature-image" />
        <text v-else class="unsigned">未签署</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <wd-button type="primary" block @click="signContract">
        确认签署
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

// 合同信息
const contract = ref({
  title: '房屋租赁合同',
  no: 'HT-2024-001234',
  signDate: '2024-12-01',
  content: `
    <h3>第一条 房屋基本情况</h3>
    <p>出租人出租的房屋位于北京市朝阳区...</p>
    <h3>第二条 租赁期限</h3>
    <p>租赁期限自2024年1月1日起至2024年12月31日止...</p>
  `
})

// 签章信息
const signatures = ref({
  partyA: 'https://example.com/signature_a.png',
  partyB: ''
})

// 用户信息
const userInfo = ref({
  name: '李四',
  idCard: '110***********1234',
  signTime: '2024-12-01 10:30:00'
})

// 生成签署水印内容
const signatureInfo = computed(() => {
  return `${userInfo.value.name} ${userInfo.value.signTime}`
})

// 签署合同
const signContract = () => {
  uni.showModal({
    title: '确认签署',
    content: '签署后合同将生效,是否确认?',
    success: (res) => {
      if (res.confirm) {
        // 执行签署逻辑
        uni.showToast({ title: '签署成功', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.contract-viewer {
  position: relative;
  min-height: 100vh;
  background: #fff;
}

.contract-header {
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
}

.contract-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.contract-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #999;
}

.contract-content {
  height: calc(100vh - 500rpx);
  padding: 32rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: #333;
}

.signature-section {
  display: flex;
  justify-content: space-around;
  padding: 32rpx;
  border-top: 1rpx solid #eee;
}

.signature-item {
  text-align: center;
}

.signature-image {
  width: 200rpx;
  height: 100rpx;
  margin-top: 16rpx;
}

.unsigned {
  color: #999;
  font-size: 26rpx;
  margin-top: 16rpx;
}

.action-buttons {
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}
</style>
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

### 4. 颜色与背景对比

根据背景色选择合适的水印颜色:

```vue
<script lang="ts" setup>
import { ref, computed } from 'vue'

// 背景模式
const isDarkMode = ref(false)

// 根据背景动态调整水印颜色
const watermarkColor = computed(() => {
  return isDarkMode.value ? '#ffffff' : '#000000'
})

// 深色背景透明度更低
const watermarkOpacity = computed(() => {
  return isDarkMode.value ? 0.1 : 0.15
})
</script>

<template>
  <view :class="{ 'dark-bg': isDarkMode }">
    <wd-watermark
      content="水印"
      :color="watermarkColor"
      :opacity="watermarkOpacity"
    />
    <!-- 内容 -->
  </view>
</template>

<style lang="scss" scoped>
.dark-bg {
  background: #1a1a1a;
  color: #fff;
}
</style>
```

### 5. 性能优化

避免频繁重绘水印:

```vue
<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { debounce } from '@/utils/common'

const userInfo = ref({ name: '张三', id: 'U10086' })

// ✅ 使用 computed 缓存水印内容,避免不必要的重绘
const watermarkText = computed(() => {
  return `${userInfo.value.name} ${userInfo.value.id}`
})

// ❌ 不推荐: 在模板中直接拼接字符串
// <wd-watermark :content="`${userInfo.name} ${userInfo.id}`" />
</script>

<template>
  <!-- ✅ 使用 computed 缓存的值 -->
  <wd-watermark :content="watermarkText" />
</template>
```

### 6. 多场景水印配置

根据不同场景使用不同配置:

```typescript
// watermark-config.ts
export const watermarkPresets = {
  // 机密文档
  confidential: {
    opacity: 0.15,
    rotate: -30,
    size: 24,
    color: '#ff4d4f',
    width: 150,
    height: 100,
    gutterX: 30,
    gutterY: 30
  },

  // 内部使用
  internal: {
    opacity: 0.12,
    rotate: -25,
    size: 22,
    color: '#1890ff',
    width: 200,
    height: 150,
    gutterX: 50,
    gutterY: 50
  },

  // 品牌展示
  brand: {
    opacity: 0.08,
    rotate: -20,
    size: 32,
    color: '#8c8c8c',
    width: 300,
    height: 200,
    gutterX: 80,
    gutterY: 80
  },

  // 草稿
  draft: {
    opacity: 0.2,
    rotate: -45,
    size: 48,
    color: '#faad14',
    width: 400,
    height: 300,
    gutterX: 100,
    gutterY: 100
  }
}

// 使用示例
// <wd-watermark content="机密" v-bind="watermarkPresets.confidential" />
```

### 7. 水印安全防护

增强水印的安全性:

```vue
<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 水印内容加密处理
const encodeWatermark = (text: string): string => {
  // 添加隐藏字符用于溯源
  const invisibleChars = '\u200b\u200c\u200d\ufeff'
  const encoded = text.split('').map((char, index) => {
    return char + invisibleChars[index % 4]
  }).join('')
  return encoded
}

const userInfo = ref({ name: '张三', id: 'U10086' })

const watermarkText = computed(() => {
  const plainText = `${userInfo.value.name} ${userInfo.value.id}`
  return encodeWatermark(plainText)
})

// 防止水印被删除 - 定期检查水印是否存在
let checkInterval: number

onMounted(() => {
  // #ifdef H5
  checkInterval = setInterval(() => {
    const watermark = document.querySelector('.wd-watermark')
    if (!watermark) {
      console.warn('水印被移除,重新添加')
      // 触发重新渲染
    }
  }, 2000)
  // #endif
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>
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

### 6. 水印内容过长导致显示不全

**问题原因:**
- 水印区域宽度不足以容纳完整内容
- 字体大小过大

**解决方案:**

```vue
<script lang="ts" setup>
import { computed } from 'vue'

const longContent = '这是一段很长的水印内容需要处理'

// 方案1: 截取内容
const truncatedContent = computed(() => {
  const maxLength = 15
  if (longContent.length > maxLength) {
    return longContent.slice(0, maxLength) + '...'
  }
  return longContent
})

// 方案2: 拆分为多行
const multiLineContent = computed(() => {
  return longContent.slice(0, 10) + '\n' + longContent.slice(10)
})
</script>

<template>
  <!-- 方案1: 增加宽度 -->
  <wd-watermark :content="longContent" :width="400" :size="20" />

  <!-- 方案2: 减小字号 -->
  <wd-watermark :content="longContent" :size="16" />

  <!-- 方案3: 截取内容 -->
  <wd-watermark :content="truncatedContent" />
</template>
```

### 7. 动态切换水印内容不更新

**问题原因:**
- 使用非响应式数据作为水印内容
- 水印组件内部缓存了旧值

**解决方案:**

```vue
<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue'

const userInfo = ref({ name: '张三' })
const showWatermark = ref(true)

// ✅ 使用 computed 确保响应式更新
const watermarkContent = computed(() => {
  return userInfo.value.name
})

// 强制刷新水印的方法
const refreshWatermark = async () => {
  showWatermark.value = false
  await nextTick()
  showWatermark.value = true
}

// 监听变化时刷新
watch(userInfo, () => {
  refreshWatermark()
}, { deep: true })
</script>

<template>
  <wd-watermark v-if="showWatermark" :content="watermarkContent" />
</template>
```

### 8. 小程序真机预览水印不显示

**问题原因:**
- Canvas 在真机上的渲染时机问题
- 组件挂载时 Canvas 节点尚未就绪

**解决方案:**

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const showWatermark = ref(false)

onMounted(() => {
  // 延迟显示水印,确保 Canvas 节点已就绪
  setTimeout(() => {
    showWatermark.value = true
  }, 100)
})
</script>

<template>
  <wd-watermark v-if="showWatermark" content="水印" />
</template>
```

### 9. 水印与 fixed 定位元素冲突

**问题原因:**
- 全屏水印使用 fixed 定位,可能与其他 fixed 元素层级冲突

**解决方案:**

```vue
<template>
  <view class="page">
    <!-- 水印层级设置为较低值 -->
    <wd-watermark content="水印" :z-index="100" />

    <!-- 导航栏等 fixed 元素使用更高层级 -->
    <view class="nav-bar">导航栏</view>

    <!-- 弹出层使用最高层级 -->
    <wd-popup v-model="showPopup" :z-index="1000">
      弹出内容
    </wd-popup>
  </view>
</template>

<style lang="scss" scoped>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 500; /* 高于水印 */
}
</style>
```

### 10. 打印或截图时水印不显示

**问题原因:**
- 打印时 Canvas 生成的背景图可能不被打印
- 截图时可能只捕获部分图层

**解决方案:**

```vue
<script lang="ts" setup>
import { ref } from 'vue'

// 打印前处理
const handlePrint = () => {
  // 1. 临时将水印转换为 DOM 元素
  // 2. 执行打印
  // 3. 恢复水印组件

  // 或使用 CSS 打印样式
  window.print()
}
</script>

<style>
/* 打印样式 - 确保水印可见 */
@media print {
  .wd-watermark {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
```

## 主题定制

### CSS 变量

水印组件支持以下 CSS 变量进行样式定制:

```scss
:root {
  // 水印容器
  --wd-watermark-position: fixed;
  --wd-watermark-top: 0;
  --wd-watermark-left: 0;
  --wd-watermark-width: 100%;
  --wd-watermark-height: 100%;
  --wd-watermark-pointer-events: none;

  // 局部水印
  --wd-watermark-local-position: absolute;
}
```

### 暗黑模式

水印在暗黑模式下的推荐配置:

```vue
<script lang="ts" setup>
import { computed } from 'vue'

// 检测暗黑模式
const isDark = computed(() => {
  // #ifdef H5
  return window.matchMedia('(prefers-color-scheme: dark)').matches
  // #endif
  // #ifndef H5
  return false
  // #endif
})

// 暗黑模式水印配置
const darkModeConfig = computed(() => ({
  color: isDark.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
  opacity: isDark.value ? 0.1 : 0.15
}))
</script>

<template>
  <wd-watermark
    content="水印"
    :color="darkModeConfig.color"
    :opacity="darkModeConfig.opacity"
  />
</template>
```

## 性能优化

### 减少重绘次数

水印组件在以下情况会触发重绘:
- props 发生变化
- 组件重新挂载
- 窗口尺寸变化(H5)

优化建议:

```vue
<script lang="ts" setup>
import { ref, computed, shallowRef } from 'vue'

// ✅ 使用 shallowRef 减少深层响应式开销
const watermarkConfig = shallowRef({
  content: '水印',
  opacity: 0.15,
  rotate: -25
})

// ✅ 避免在循环或高频更新中修改水印配置
// ❌ 不推荐
// setInterval(() => {
//   watermarkConfig.value.content = new Date().toLocaleString()
// }, 1000)

// ✅ 推荐: 仅在必要时更新
const updateWatermark = () => {
  watermarkConfig.value = {
    ...watermarkConfig.value,
    content: '新内容'
  }
}
</script>
```

### 大页面优化

对于内容很长的页面,建议使用局部水印:

```vue
<template>
  <view class="long-page">
    <!-- ❌ 全屏水印在长页面中性能较差 -->
    <!-- <wd-watermark content="水印" /> -->

    <!-- ✅ 使用多个局部水印 -->
    <view class="section">
      <wd-watermark content="水印" :full-screen="false" />
      <view class="section-content">第一部分内容...</view>
    </view>

    <view class="section">
      <wd-watermark content="水印" :full-screen="false" />
      <view class="section-content">第二部分内容...</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.section {
  position: relative;
  min-height: 100vh;
}
</style>
```

## 注意事项

1. **父容器定位**: 局部水印时,父容器必须设置 `position: relative`
2. **平台差异**: `fontStyle`、`fontWeight`、`fontFamily` 仅在 H5 和微信小程序中生效
3. **图片格式**: 钉钉小程序仅支持网络图片,不支持 Base64
4. **层级控制**: 合理设置 `z-index` 避免与其他 fixed 元素冲突
5. **性能考虑**: 避免频繁更新水印内容,使用 computed 缓存
6. **安全提示**: 水印可被技术手段去除,重要内容应结合服务端保护
