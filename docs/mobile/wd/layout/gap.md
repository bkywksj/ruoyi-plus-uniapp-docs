---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/layout/gap
---

# Gap 间隙槽

## 介绍

Gap 间隙槽组件是一个轻量级的布局辅助组件,用于在页面中创建固定高度的间隔空间。该组件常用于代替 margin 或 padding 实现元素间距,或作为占位元素使用,特别适合在列表、卡片等垂直布局场景中快速创建统一的间距。

**核心特性:**

- **简洁高效** - 组件实现极其简洁(仅62行源码),无额外开销,性能卓越
- **高度可控** - 支持任意高度设置,默认15rpx,可使用数字或带单位的字符串
- **背景定制** - 支持自定义背景颜色,默认透明,可实现分隔效果
- **安全区适配** - 内置底部安全区支持,自动适配 iPhone X 等全面屏设备
- **灵活复用** - 可在页面任意位置使用,支持多次复用创建多个间距
- **样式扩展** - 支持 customClass 和 customStyle 实现高度自定义
- **虚拟节点** - 启用 virtualHost,不会在 DOM 中创建额外包装元素,保持结构简洁
- **单位自动转换** - 高度值自动添加单位,数字默认转为 rpx,字符串保持原样

参考: src/wd/components/wd-gap/wd-gap.vue:1-62

## 基本用法

### 基础间距

使用默认高度(15rpx)创建简单的垂直间距。

```vue
<template>
  <view class="demo">
    <view class="card">卡片1</view>
    <wd-gap />
    <view class="card">卡片2</view>
    <wd-gap />
    <view class="card">卡片3</view>
  </view>
</template>

<script lang="ts" setup>
// 基础用法无需额外逻辑
</script>

```

**使用说明:**
- Gap 组件默认高度为 15rpx
- 组件渲染为一个空的 view 元素,通过 height 属性控制高度
- 默认背景透明,不影响页面背景
- 可在任意元素之间插入,实现间距效果

参考: src/wd/components/wd-gap/wd-gap.vue:2-6, 44

### 自定义高度

通过 `height` 属性设置不同的间距高度。

```vue
<template>
  <view class="demo">
    <!-- 小间距 10rpx -->
    <view class="section">
      <text class="title">小间距 (10rpx)</text>
      <view class="card">卡片1</view>
      <wd-gap :height="10" />
      <view class="card">卡片2</view>
    </view>

    <!-- 中间距 20rpx -->
    <view class="section">
      <text class="title">中间距 (20rpx)</text>
      <view class="card">卡片1</view>
      <wd-gap :height="20" />
      <view class="card">卡片2</view>
    </view>

    <!-- 大间距 40rpx -->
    <view class="section">
      <text class="title">大间距 (40rpx)</text>
      <view class="card">卡片1</view>
      <wd-gap :height="40" />
      <view class="card">卡片2</view>
    </view>

    <!-- 超大间距 80rpx -->
    <view class="section">
      <text class="title">超大间距 (80rpx)</text>
      <view class="card">卡片1</view>
      <wd-gap :height="80" />
      <view class="card">卡片2</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 自定义高度无需额外逻辑
</script>

```

**使用说明:**
- height 属性支持数字类型,默认单位为 rpx
- 数字会自动调用 `addUnit` 工具函数添加 rpx 单位
- 推荐高度范围: 10-80rpx,根据设计规范选择
- 可以使用带单位的字符串: `height="20px"`, `height="1rem"`

**技术实现:**
- height 通过内联样式直接设置到 view 元素
- 使用 `addUnit` 函数处理单位转换
- 通过 `isDef` 判断是否设置了 height 属性

参考: src/wd/components/wd-gap/wd-gap.vue:35, 5

### 不同单位

height 属性支持多种 CSS 单位格式。

```vue
<template>
  <view class="demo">
    <!-- rpx 单位 -->
    <view class="section">
      <text class="title">rpx 单位</text>
      <view class="card">使用 rpx 单位,响应式适配</view>
      <wd-gap :height="30" />
      <view class="card">间距 30rpx</view>
    </view>

    <!-- px 单位 -->
    <view class="section">
      <text class="title">px 单位</text>
      <view class="card">使用 px 单位,固定像素</view>
      <wd-gap height="15px" />
      <view class="card">间距 15px</view>
    </view>

    <!-- vh 单位 -->
    <view class="section">
      <text class="title">vh 单位</text>
      <view class="card">使用 vh 单位,相对视口高度</view>
      <wd-gap height="5vh" />
      <view class="card">间距 5vh</view>
    </view>

    <!-- rem 单位 -->
    <view class="section">
      <text class="title">rem 单位</text>
      <view class="card">使用 rem 单位,相对根字体</view>
      <wd-gap height="1rem" />
      <view class="card">间距 1rem</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 单位设置无需额外逻辑
</script>

```

**使用说明:**
- **数字**: 自动转换为 rpx 单位,如 `height="30"` → `height: 30rpx`
- **带单位字符串**: 保持原样,如 `height="15px"` → `height: 15px`
- **推荐使用**: rpx 单位,实现跨设备响应式适配
- **vh 单位**: 适合创建占据视口高度比例的间距
- **rem/em**: 适合需要根据字体大小动态调整的场景

参考: src/wd/components/wd-gap/wd-gap.vue:35, addUnit函数

### 背景颜色

通过 `bg-color` 属性设置间隙槽的背景颜色,实现分隔效果。

```vue
<template>
  <view class="demo">
    <!-- 透明背景(默认) -->
    <view class="section">
      <text class="title">透明背景(默认)</text>
      <view class="card">卡片1</view>
      <wd-gap :height="20" />
      <view class="card">卡片2</view>
    </view>

    <!-- 灰色背景 -->
    <view class="section">
      <text class="title">灰色背景</text>
      <view class="card">卡片1</view>
      <wd-gap :height="20" bg-color="#f5f5f5" />
      <view class="card">卡片2</view>
    </view>

    <!-- 主题色背景 -->
    <view class="section">
      <text class="title">主题色背景</text>
      <view class="card white">卡片1</view>
      <wd-gap :height="20" bg-color="#4dabf7" />
      <view class="card white">卡片2</view>
    </view>

    <!-- 渐变背景 -->
    <view class="section">
      <text class="title">渐变背景</text>
      <view class="card">卡片1</view>
      <wd-gap
        :height="30"
        bg-color="linear-gradient(to right, #667eea 0%, #764ba2 100%)"
      />
      <view class="card">卡片2</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 背景颜色无需额外逻辑
</script>

```

**使用说明:**
- bg-color 默认为 `transparent`,背景透明
- 支持任何有效的 CSS 颜色值:
  - 十六进制: `#f5f5f5`
  - RGB/RGBA: `rgb(245, 245, 245)`, `rgba(0, 0, 0, 0.1)`
  - 颜色名称: `red`, `blue`, `transparent`
  - 渐变: `linear-gradient(...)`, `radial-gradient(...)`
- 背景色可用于创建视觉分隔效果
- 配合不同高度,可实现分隔线效果

**技术实现:**
- bg-color 通过内联样式设置 `background` 属性
- 使用 `isDef` 判断是否设置了 bgColor
- 未设置时不添加 background 样式,使用默认透明背景

参考: src/wd/components/wd-gap/wd-gap.vue:31, 42, 5

### 底部安全区

通过 `safe-area-bottom` 属性自动适配底部安全区,适用于全面屏设备。

```vue
<template>
  <view class="demo">
    <view class="content">
      <text class="title">页面内容</text>
      <view class="card" v-for="item in 10" :key="item">
        列表项 {{ item }}
      </view>
    </view>

    <!-- 底部固定栏 -->
    <view class="footer">
      <view class="button-group">
        <button class="btn btn-default">取消</button>
        <button class="btn btn-primary">确定</button>
      </view>
      <!-- 底部安全区间隙 -->
      <wd-gap safe-area-bottom bg-color="#fff" />
    </view>
  </view>
</template>

<script lang="ts" setup>
// 底部安全区无需额外逻辑
</script>

```

**使用说明:**
- safe-area-bottom 默认为 false,不开启安全区
- 开启后自动添加底部安全区高度(env(safe-area-inset-bottom))
- 主要用于页面底部固定栏、tabbar、底部按钮等场景
- iPhone X 及以上机型底部安全区约 34px
- Android 全面屏设备可能有不同的安全区高度
- 配合 bg-color 使用,确保安全区区域有背景色填充

**技术实现:**
- 通过添加 CSS 类名 `wd-gap--safe` 实现
- 使用 CSS 的 `env()` 和 `constant()` 函数获取安全区高度
- `padding-bottom: env(safe-area-inset-bottom)`
- 兼容旧版 iOS 使用 `constant(safe-area-inset-bottom)`

参考: src/wd/components/wd-gap/wd-gap.vue:4, 33, 56-59

## 高级用法

### 列表间距

在列表项之间使用 Gap 组件创建统一间距。

```vue
<template>
  <view class="demo">
    <view class="list">
      <view
        v-for="item in products"
        :key="item.id"
        class="product-card"
        @click="handleProductClick(item)"
      >
        <image :src="item.image" class="product-image" mode="aspectFill" />
        <view class="product-info">
          <text class="product-name">{{ item.name }}</text>
          <view class="product-footer">
            <text class="product-price">¥{{ item.price }}</text>
            <text class="product-sales">已售{{ item.sales }}</text>
          </view>
        </view>
      </view>

      <!-- 在每个列表项之间插入间隙 -->
      <template v-for="(item, index) in products" :key="`gap-${index}`">
        <wd-gap v-if="index < products.length - 1" :height="16" />
      </template>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Product {
  id: number
  name: string
  price: number
  sales: number
  image: string
}

const products = ref<Product[]>([
  {
    id: 1,
    name: '无线蓝牙耳机 降噪版',
    price: 299,
    sales: 1280,
    image: 'https://via.placeholder.com/200',
  },
  {
    id: 2,
    name: '智能手环 Pro',
    price: 199,
    sales: 856,
    image: 'https://via.placeholder.com/200',
  },
  {
    id: 3,
    name: '充电宝 20000mAh',
    price: 89,
    sales: 2453,
    image: 'https://via.placeholder.com/200',
  },
  {
    id: 4,
    name: '无线充电器 快充版',
    price: 79,
    sales: 643,
    image: 'https://via.placeholder.com/200',
  },
])

const handleProductClick = (item: Product) => {
  console.log('点击了商品:', item.name)
  uni.navigateTo({
    url: `/pages/product/detail?id=${item.id}`,
  })
}
</script>

```

**使用说明:**
- 使用 v-if 条件渲染,避免在最后一项后添加间隙
- 统一的间距值保持视觉一致性
- 相比 margin-bottom,Gap 组件更灵活,易于调整
- 支持动态列表,间距自动适配

参考: src/wd/components/wd-gap/wd-gap.vue:2-6

### 分隔线效果

结合小高度和背景色,实现分隔线效果。

```vue
<template>
  <view class="demo">
    <!-- 细线分隔 -->
    <view class="section">
      <text class="title">细线分隔 (1rpx)</text>
      <view class="item">选项1</view>
      <wd-gap :height="1" bg-color="#eee" />
      <view class="item">选项2</view>
      <wd-gap :height="1" bg-color="#eee" />
      <view class="item">选项3</view>
    </view>

    <!-- 粗线分隔 -->
    <view class="section">
      <text class="title">粗线分隔 (4rpx)</text>
      <view class="item">选项1</view>
      <wd-gap :height="4" bg-color="#4dabf7" />
      <view class="item">选项2</view>
      <wd-gap :height="4" bg-color="#4dabf7" />
      <view class="item">选项3</view>
    </view>

    <!-- 区块分隔 -->
    <view class="section">
      <text class="title">区块分隔 (20rpx)</text>
      <view class="block">区块1</view>
      <wd-gap :height="20" bg-color="#f5f5f5" />
      <view class="block">区块2</view>
      <wd-gap :height="20" bg-color="#f5f5f5" />
      <view class="block">区块3</view>
    </view>

    <!-- 渐变分隔 -->
    <view class="section">
      <text class="title">渐变分隔 (3rpx)</text>
      <view class="item">选项1</view>
      <wd-gap
        :height="3"
        bg-color="linear-gradient(to right, transparent, #4dabf7, transparent)"
      />
      <view class="item">选项2</view>
      <wd-gap
        :height="3"
        bg-color="linear-gradient(to right, transparent, #4dabf7, transparent)"
      />
      <view class="item">选项3</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 分隔线效果无需额外逻辑
</script>

```

**使用说明:**
- **细线**: 1-2rpx 高度 + 浅色背景,实现细分隔线
- **粗线**: 3-5rpx 高度 + 深色背景,实现强调分隔线
- **区块**: 10-30rpx 高度 + 背景色,实现区域分隔
- **渐变**: 2-4rpx 高度 + 渐变背景,实现渐变分隔效果
- 相比 border,Gap 组件可以实现更多样的分隔效果

参考: src/wd/components/wd-gap/wd-gap.vue:31, 35

### 占位元素

在页面底部使用 Gap 组件作为占位元素,避免内容被底部栏遮挡。

```vue
<template>
  <view class="demo">
    <!-- 页面内容 -->
    <view class="content">
      <view class="card" v-for="item in 15" :key="item">
        <text>列表项 {{ item }}</text>
      </view>
    </view>

    <!-- 底部占位,避免被底部栏遮挡 -->
    <wd-gap :height="160" />

    <!-- 底部固定栏 -->
    <view class="bottom-bar">
      <view class="action-buttons">
        <button class="btn btn-cart">
          <wd-icon name="cart-outlined" size="24px" />
          <text>加入购物车</text>
        </button>
        <button class="btn btn-buy">
          <text>立即购买</text>
        </button>
      </view>
      <!-- 底部安全区 -->
      <wd-gap safe-area-bottom bg-color="#fff" />
    </view>
  </view>
</template>

<script lang="ts" setup>
// 占位元素无需额外逻辑
</script>

```

**使用说明:**
- 占位高度 = 底部栏高度 + 安全区高度
- 底部栏高度通常为 100-160rpx
- 需要根据实际底部栏高度调整占位高度
- 配合 fixed 定位的底部栏使用
- 确保页面滚动时,底部内容不被遮挡

**技术实现:**
- Gap 组件作为普通元素,占据文档流空间
- 底部栏使用 fixed 定位,脱离文档流
- 通过 Gap 占位,预留底部栏所需空间

参考: src/wd/components/wd-gap/wd-gap.vue:2-6

### 自定义样式

通过 `custom-class` 和 `custom-style` 实现高度自定义。

```vue
<template>
  <view class="demo">
    <!-- 自定义类名 -->
    <view class="section">
      <text class="title">自定义类名</text>
      <view class="card">卡片1</view>
      <wd-gap :height="30" custom-class="custom-gap" />
      <view class="card">卡片2</view>
    </view>

    <!-- 自定义样式 -->
    <view class="section">
      <text class="title">自定义样式</text>
      <view class="card">卡片1</view>
      <wd-gap
        :height="40"
        custom-style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20rpx;
          margin: 0 32rpx;
        "
      />
      <view class="card">卡片2</view>
    </view>

    <!-- 组合自定义 -->
    <view class="section">
      <text class="title">组合自定义</text>
      <view class="card">卡片1</view>
      <wd-gap
        :height="50"
        bg-color="#fff7e6"
        custom-class="dotted-gap"
        custom-style="border: 2rpx dashed #ffa94d;"
      />
      <view class="card">卡片2</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 自定义样式无需额外逻辑
</script>

```

**使用说明:**
- custom-class: 添加自定义 CSS 类名,需要使用 `:deep()` 深度选择器
- custom-style: 直接添加内联样式,优先级最高
- 可以同时使用 bg-color、custom-class、custom-style
- 样式优先级: custom-style > custom-class > bg-color
- 支持所有 CSS 属性:边框、圆角、阴影、动画等

参考: src/wd/components/wd-gap/wd-gap.vue:26-28, 5

### 响应式间距

根据屏幕尺寸动态调整间距高度。

```vue
<template>
  <view class="demo">
    <view class="card" v-for="item in 5" :key="item">
      <text>卡片 {{ item }}</text>
    </view>
    <!-- 响应式间距 -->
    <template v-for="(item, index) in 4" :key="`gap-${index}`">
      <wd-gap :height="gapHeight" />
    </template>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const gapHeight = ref(20)

onMounted(() => {
  // 获取屏幕信息
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.screenWidth

  // 根据屏幕宽度调整间距
  if (screenWidth < 375) {
    gapHeight.value = 10 // 小屏手机
  } else if (screenWidth < 768) {
    gapHeight.value = 20 // 普通手机
  } else if (screenWidth < 1024) {
    gapHeight.value = 30 // 平板竖屏
  } else {
    gapHeight.value = 40 // 平板横屏/桌面
  }
})
</script>

```

**使用说明:**
- 使用 uni.getSystemInfoSync() 获取屏幕信息
- 根据 screenWidth 动态设置 gapHeight
- 推荐间距范围:
  - 小屏手机 (< 375px): 10rpx
  - 普通手机 (375-768px): 20rpx
  - 平板竖屏 (768-1024px): 30rpx
  - 平板横屏/桌面 (≥ 1024px): 40rpx
- 使用响应式变量,确保间距适配不同设备

参考: src/wd/components/wd-gap/wd-gap.vue:35

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| height | 间隙高度,支持数字(默认rpx)或带单位字符串 | `string \| number` | `15` |
| bg-color | 背景颜色 | `string` | `'transparent'` |
| safe-area-bottom | 是否开启底部安全区 | `boolean` | `false` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-gap/wd-gap.vue:24-36

### Events

Gap 组件无事件。

### Slots

Gap 组件无插槽。

### 类型定义

```typescript
/**
 * 间距组件属性接口
 */
interface WdGapProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 背景颜色 */
  bgColor?: string
  /** 是否开启底部安全区 */
  safeAreaBottom?: boolean
  /** 高度 */
  height?: string | number
}
```

参考: src/wd/components/wd-gap/wd-gap.vue:21-36

## 主题定制

Gap 组件本身没有主题变量,样式完全由 Props 控制。

### 自定义样式示例

```vue
<template>
  <view class="demo">
    <!-- 使用 custom-class 定制样式 -->
    <wd-gap :height="30" custom-class="custom-gap" />
  </view>
</template>

<script lang="ts" setup>
// 主题定制无需额外逻辑
</script>

```

参考: src/wd/components/wd-gap/wd-gap.vue:48-61

## 最佳实践

### 1. 选择合适的高度

根据布局场景选择合适的间距高度。

```vue
<!-- ✅ 推荐: 列表项间距使用小间距 -->
<view class="list">
  <view class="item">列表项1</view>
  <wd-gap :height="12" />
  <view class="item">列表项2</view>
</view>

<!-- ✅ 推荐: 卡片间距使用中间距 -->
<view class="cards">
  <view class="card">卡片1</view>
  <wd-gap :height="24" />
  <view class="card">卡片2</view>
</view>

<!-- ✅ 推荐: 区块间距使用大间距 -->
<view class="sections">
  <view class="section">区块1</view>
  <wd-gap :height="48" />
  <view class="section">区块2</view>
</view>

<!-- ❌ 不推荐: 间距过小,元素过于紧凑 -->
<view class="cards">
  <view class="card">卡片1</view>
  <wd-gap :height="2" />
  <view class="card">卡片2</view>
  <!-- 间距太小,视觉不清晰 -->
</view>

<!-- ❌ 不推荐: 间距过大,浪费空间 -->
<view class="list">
  <view class="item">列表项1</view>
  <wd-gap :height="100" />
  <view class="item">列表项2</view>
  <!-- 间距过大,用户需要过度滚动 -->
</view>
```

### 2. 统一间距规范

在同一页面中使用统一的间距规范,保持视觉一致性。

```vue
<script lang="ts" setup>
// ✅ 推荐: 定义统一的间距变量
const SPACING = {
  xs: 8,   // 超小间距
  sm: 12,  // 小间距
  md: 20,  // 中间距
  lg: 32,  // 大间距
  xl: 48,  // 超大间距
}
</script>

<template>
  <view class="page">
    <!-- 使用统一的间距变量 -->
    <view class="section">区块1</view>
    <wd-gap :height="SPACING.lg" />
    <view class="section">区块2</view>
    <wd-gap :height="SPACING.lg" />
    <view class="section">区块3</view>
  </view>
</template>

<!-- ❌ 不推荐: 随意设置间距值 -->
<template>
  <view class="page">
    <view class="section">区块1</view>
    <wd-gap :height="25" />
    <view class="section">区块2</view>
    <wd-gap :height="37" />
    <view class="section">区块3</view>
    <!-- 间距不统一,视觉混乱 -->
  </view>
</template>
```

### 3. 正确使用底部安全区

底部安全区只在页面底部需要占位时使用。

```vue
<!-- ✅ 推荐: 底部固定栏使用安全区 -->
<template>
  <view class="page">
    <view class="content">内容</view>
    <view class="footer">
      <view class="buttons">按钮组</view>
      <wd-gap safe-area-bottom bg-color="#fff" />
    </view>
  </view>
</template>

<!-- ✅ 推荐: 列表底部添加安全区占位 -->
<template>
  <view class="list">
    <view v-for="item in items" :key="item" class="item">
      {{ item }}
    </view>
    <!-- 底部占位 + 安全区 -->
    <wd-gap :height="100" />
    <wd-gap safe-area-bottom />
  </view>
</template>

<!-- ❌ 不推荐: 在页面中间使用安全区 -->
<template>
  <view class="page">
    <view class="section">区块1</view>
    <wd-gap safe-area-bottom />
    <!-- 不应该在中间使用安全区 -->
    <view class="section">区块2</view>
  </view>
</template>

<!-- ❌ 不推荐: 重复设置安全区 -->
<template>
  <view class="page">
    <view class="footer">
      <view class="buttons">按钮组</view>
      <wd-gap safe-area-bottom />
      <wd-gap safe-area-bottom />
      <!-- 重复设置,高度翻倍 -->
    </view>
  </view>
</template>
```

### 4. 背景色的使用场景

根据需求选择是否设置背景色。

```vue
<!-- ✅ 推荐: 透明背景用于纯间距 -->
<wd-gap :height="20" />
<!-- 不影响页面背景 -->

<!-- ✅ 推荐: 有色背景用于分隔线 -->
<wd-gap :height="1" bg-color="#eee" />
<!-- 实现分隔线效果 -->

<!-- ✅ 推荐: 区块分隔使用深色背景 -->
<wd-gap :height="20" bg-color="#f5f5f5" />
<!-- 明确的区域分隔 -->

<!-- ❌ 不推荐: 不必要的背景色 -->
<view class="page" style="background: #fff;">
  <view class="card">卡片1</view>
  <wd-gap :height="20" bg-color="#fff" />
  <!-- 背景色和页面背景相同,多余 -->
  <view class="card">卡片2</view>
</view>

<!-- ❌ 不推荐: 使用 Gap 实现复杂图案 -->
<wd-gap
  :height="100"
  custom-style="background: url(...); background-size: cover;"
/>
<!-- Gap 不适合作为背景图容器 -->
```

### 5. 性能优化

合理使用 Gap 组件,避免过度渲染。

```vue
<!-- ✅ 推荐: 使用条件渲染控制间距 -->
<template>
  <view class="list">
    <template v-for="(item, index) in items" :key="item.id">
      <view class="item">{{ item.name }}</view>
      <wd-gap v-if="index < items.length - 1" :height="16" />
    </template>
  </view>
</template>

<!-- ✅ 推荐: 使用 CSS margin 替代大量 Gap -->
<template>
  <view class="list">
    <view v-for="item in items" :key="item.id" class="item">
      {{ item.name }}
    </view>
  </view>
</template>

<style scoped>
.item + .item {
  margin-top: 16rpx;
}
</style>

<!-- ❌ 不推荐: 过度使用 Gap 组件 -->
<template>
  <view class="list">
    <view v-for="item in 100" :key="item" class="item">
      <wd-gap :height="8" />
      {{ item }}
      <wd-gap :height="8" />
    </view>
    <!-- 创建200个Gap组件,性能开销大 -->
  </view>
</template>

<!-- ❌ 不推荐: 用 Gap 替代 padding -->
<view class="card">
  <wd-gap :height="32" />
  <text>内容</text>
  <wd-gap :height="32" />
  <!-- 应该使用 padding: 32rpx 0 -->
</view>
```

## 常见问题

### 1. 间距高度不生效

**问题原因:**
- 父元素使用了 flex 布局,Gap 被压缩
- Gap 高度被其他样式覆盖
- 单位设置错误

**解决方案:**

```vue
<!-- ✅ 正确: 父元素不使用 flex 布局 -->
<template>
  <view class="container">
    <view class="card">卡片1</view>
    <wd-gap :height="30" />
    <view class="card">卡片2</view>
  </view>
</template>

<style scoped>
.container {
  /* 默认 display: block,Gap 正常占据空间 */
}
</style>

<!-- ✅ 正确: flex 布局中使用 flex-shrink: 0 -->
<template>
  <view class="container">
    <view class="card">卡片1</view>
    <wd-gap :height="30" custom-style="flex-shrink: 0;" />
    <view class="card">卡片2</view>
  </view>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}
</style>

<!-- ❌ 错误: flex 布局压缩 Gap -->
<template>
  <view class="container">
    <view class="card">卡片1</view>
    <wd-gap :height="30" />
    <!-- Gap 被 flex 压缩,高度无效 -->
    <view class="card">卡片2</view>
  </view>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  /* 没有设置 flex-shrink: 0 -->
}
</style>
```

参考: src/wd/components/wd-gap/wd-gap.vue:5

### 2. 底部安全区高度异常

**问题原因:**
- 未设置 bg-color,安全区区域显示为透明
- 底部栏使用了 fixed 定位,Gap 被遮挡
- 多次设置安全区,高度累加

**解决方案:**

```vue
<!-- ✅ 正确: 设置背景色 -->
<template>
  <view class="footer">
    <view class="buttons">按钮组</view>
    <wd-gap safe-area-bottom bg-color="#fff" />
  </view>
</template>

<!-- ✅ 正确: 只在最底部使用一次 -->
<template>
  <view class="page">
    <view class="content">内容</view>
    <view class="footer">
      <view class="buttons">按钮组</view>
      <wd-gap safe-area-bottom bg-color="#fff" />
    </view>
  </view>
</template>

<!-- ❌ 错误: 未设置背景色 -->
<template>
  <view class="footer">
    <view class="buttons">按钮组</view>
    <wd-gap safe-area-bottom />
    <!-- 安全区区域透明,看不出效果 -->
  </view>
</template>

<!-- ❌ 错误: 重复设置安全区 -->
<template>
  <view class="footer">
    <view class="buttons">按钮组</view>
    <wd-gap safe-area-bottom bg-color="#fff" />
    <wd-gap safe-area-bottom bg-color="#fff" />
    <!-- 高度翻倍,底部空白过大 -->
  </view>
</template>
```

参考: src/wd/components/wd-gap/wd-gap.vue:33, 56-59

### 3. 背景色不显示

**问题原因:**
- bg-color 拼写错误或格式错误
- 被其他样式覆盖
- height 为 0,背景色不可见

**解决方案:**

```vue
<!-- ✅ 正确: 使用正确的属性名 -->
<wd-gap :height="20" bg-color="#f5f5f5" />

<!-- ✅ 正确: 设置足够的高度 -->
<wd-gap :height="20" bg-color="#4dabf7" />

<!-- ✅ 正确: 使用 custom-style 提高优先级 -->
<wd-gap
  :height="20"
  bg-color="#f5f5f5"
  custom-style="background: #4dabf7 !important;"
/>

<!-- ❌ 错误: 属性名拼写错误 -->
<wd-gap :height="20" bgcolor="#f5f5f5" />
<!-- 应该是 bg-color,不是 bgcolor -->

<!-- ❌ 错误: 高度为 0 -->
<wd-gap :height="0" bg-color="#f5f5f5" />
<!-- 高度为0,背景色不可见 -->

<!-- ❌ 错误: 颜色格式错误 -->
<wd-gap :height="20" bg-color="blue color" />
<!-- 颜色值格式错误 -->
```

参考: src/wd/components/wd-gap/wd-gap.vue:31, 42, 5

### 4. 列表中间距渲染过多

**问题原因:**
- v-for 循环使用不当,创建了冗余的 Gap 组件
- 未使用条件渲染控制最后一项
- 性能优化不足

**解决方案:**

```vue
<!-- ✅ 正确: 使用条件渲染 -->
<template>
  <view class="list">
    <template v-for="(item, index) in items" :key="item.id">
      <view class="item">{{ item.name }}</view>
      <wd-gap v-if="index < items.length - 1" :height="16" />
    </template>
  </view>
</template>

<!-- ✅ 正确: 使用 CSS 选择器 -->
<template>
  <view class="list">
    <view v-for="item in items" :key="item.id" class="item">
      {{ item.name }}
    </view>
  </view>
</template>

<style scoped>
.item + .item {
  margin-top: 16rpx;
}
</style>

<!-- ❌ 错误: 在最后一项后也添加间距 -->
<template>
  <view class="list">
    <template v-for="item in items" :key="item.id">
      <view class="item">{{ item.name }}</view>
      <wd-gap :height="16" />
      <!-- 最后一项后也有间距 -->
    </template>
  </view>
</template>

<!-- ❌ 错误: 创建过多组件实例 -->
<template>
  <view class="list">
    <view v-for="item in 1000" :key="item" class="item">
      <wd-gap :height="8" />
      {{ item }}
      <wd-gap :height="8" />
      <!-- 创建2000个Gap组件 -->
    </view>
  </view>
</template>
```

参考: src/wd/components/wd-gap/wd-gap.vue:2-6

### 5. 自定义样式不生效

**问题原因:**
- 未使用 `:deep()` 深度选择器
- 样式优先级不足
- custom-class 或 custom-style 拼写错误

**解决方案:**

```vue
<!-- ✅ 正确: 使用 :deep() 深度选择器 -->
<template>
  <wd-gap :height="30" custom-class="custom-gap" />
</template>

<style scoped>
:deep(.custom-gap) {
  background: #4dabf7;
  border-radius: 15rpx;
}
</style>

<!-- ✅ 正确: 使用 custom-style -->
<template>
  <wd-gap
    :height="30"
    custom-style="background: #4dabf7; border-radius: 15rpx;"
  />
</template>

<!-- ✅ 正确: 使用 !important 提高优先级 -->
<template>
  <wd-gap
    :height="30"
    bg-color="#f5f5f5"
    custom-style="background: #4dabf7 !important;"
  />
</template>

<!-- ❌ 错误: 未使用 :deep() -->
<template>
  <wd-gap :height="30" custom-class="custom-gap" />
</template>

<style scoped>
.custom-gap {
  background: #4dabf7;
  /* scoped 样式无法穿透,不生效 */
}
</style>

<!-- ❌ 错误: 属性名拼写错误 -->
<template>
  <wd-gap :height="30" customClass="custom-gap" />
  <!-- 应该是 custom-class,不是 customClass -->
</template>
```

参考: src/wd/components/wd-gap/wd-gap.vue:26-28, 4-5

## 注意事项

1. **组件定位**: Gap 组件是纯粹的间距组件,不应该用于承载复杂内容或交互功能。

2. **高度单位**: height 属性接受数字(默认rpx)或字符串(带单位),数字类型会自动调用 addUnit 函数添加 rpx 单位。

3. **虚拟节点**: Gap 组件启用了 virtualHost,不会在 DOM 中创建额外的包装元素,保持 DOM 结构简洁。

4. **flex 布局**: 在 flex 容器中使用 Gap 时,需要设置 `flex-shrink: 0` 防止被压缩。

5. **底部安全区**: safeAreaBottom 只应在页面最底部使用一次,多次使用会累加高度。

6. **背景色设置**: bg-color 默认为 transparent,如需可见的间距区域,必须设置背景色。

7. **性能考虑**: 在长列表中,建议使用 CSS margin 代替大量 Gap 组件,减少组件实例数量。

8. **样式优先级**: custom-style > custom-class > bg-color,注意样式覆盖关系。

9. **响应式设计**: 建议根据屏幕尺寸动态调整间距高度,使用 uni.getSystemInfoSync() 获取设备信息。

10. **替代方案**: 对于简单的间距需求,可以考虑使用 CSS 的 margin、padding 代替 Gap 组件。

11. **无障碍**: Gap 组件不包含语义信息,纯粹用于视觉间距,屏幕阅读器会忽略。

12. **兼容性**: Gap 组件使用标准 CSS,兼容所有 UniApp 支持的平台(H5、小程序、App)。
