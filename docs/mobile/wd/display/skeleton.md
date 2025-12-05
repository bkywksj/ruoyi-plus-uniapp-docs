# Skeleton 骨架屏

## 介绍

Skeleton 骨架屏组件用于在内容加载过程中展示占位图形组合,通过展示页面的大致结构,减少用户等待时的焦虑感,提升用户体验。它支持多种预设主题、灵活的自定义布局、动态加载动画,是现代应用加载状态的最佳实践方案。

**核心特性:**

- **预设主题** - 提供文本、头像、段落、图片四种常用主题
- **自定义布局** - 支持灵活配置行列、尺寸、间距等
- **加载动画** - 内置渐变和闪烁两种动画效果
- **加载状态控制** - 通过 loading 属性控制显示骨架屏或真实内容
- **多种形状** - 支持文本、矩形、圆形三种基础形状
- **暗黑模式** - 自动适配暗黑模式主题
- **零侵入** - 通过插槽无缝切换加载和内容状态

## 基本用法

### 文本骨架

最基础的文本骨架屏:

```vue
<template>
  <view class="demo">
    <wd-skeleton :loading="loading">
      <view class="content">
        <text>这是加载完成后的内容</text>
      </view>
    </wd-skeleton>

    <wd-button @click="toggleLoading" type="primary">
      {{ loading ? '加载完成' : '开始加载' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(true)

const toggleLoading = () => {
  loading.value = !loading.value
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.content {
  padding: 32rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}
</style>
```

**使用说明:**
- `loading` 控制显示状态,true 显示骨架屏,false 显示内容
- 默认使用 text 主题,显示两行文本骨架
- 内容通过默认插槽传入

### 头像骨架

显示圆形头像骨架:

```vue
<template>
  <view class="demo">
    <wd-skeleton theme="avatar" :loading="loading">
      <view class="user-info">
        <image src="https://unpkg.com/wot-design-uni-assets/avatar.jpg" class="avatar" />
      </view>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(true)

setTimeout(() => {
  loading.value = false
}, 3000)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
}
</style>
```

**使用说明:**
- `theme="avatar"` 使用头像主题
- 显示圆形占位符,默认128rpx
- 适用于用户头像、个人信息等场景

### 段落骨架

显示多行段落文本骨架:

```vue
<template>
  <view class="demo">
    <wd-skeleton theme="paragraph" :loading="loading">
      <view class="article">
        <text class="title">文章标题</text>
        <text class="content">
          这是一段很长的文章内容,用于展示段落骨架屏的效果。
          骨架屏可以让用户在等待内容加载时,提前看到页面的大致结构,
          从而减少等待的焦虑感,提升用户体验。
        </text>
      </view>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(true)

setTimeout(() => {
  loading.value = false
}, 3000)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.article {
  padding: 32rpx;
  background: #fff;
  border-radius: 8rpx;
}

.title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #666;
}
</style>
```

**使用说明:**
- `theme="paragraph"` 使用段落主题
- 显示4行文本骨架,最后一行宽度为55%
- 适用于文章、评论、描述等多行文本场景

### 图片骨架

显示矩形图片骨架:

```vue
<template>
  <view class="demo">
    <wd-skeleton theme="image" :loading="loading">
      <image
        src="https://unpkg.com/wot-design-uni-assets/redpanda.jpg"
        class="image"
        mode="aspectFill"
      />
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(true)

setTimeout(() => {
  loading.value = false
}, 3000)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.image {
  width: 128rpx;
  height: 128rpx;
  border-radius: 8rpx;
}
</style>
```

**使用说明:**
- `theme="image"` 使用图片主题
- 显示矩形占位符,默认128rpx
- 适用于缩略图、产品图等图片加载场景

### 渐变动画

添加渐变加载动画效果:

```vue
<template>
  <view class="demo">
    <wd-skeleton animation="gradient" :loading="true">
      <view class="content">内容</view>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `animation="gradient"` 启用渐变动画
- 从左到右的光泽扫过效果
- 动画周期1.5秒,延迟2秒后开始无限循环
- 增强加载感知,提升视觉体验

### 闪烁动画

添加闪烁加载动画效果:

```vue
<template>
  <view class="demo">
    <wd-skeleton animation="flashed" :loading="true">
      <view class="content">内容</view>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `animation="flashed"` 启用闪烁动画
- 透明度从1到0.3再到1的循环变化
- 动画周期2秒,延迟2秒后开始无限循环
- 适用于需要明显加载提示的场景

### 自定义行数

使用 rowCol 自定义行数:

```vue
<template>
  <view class="demo">
    <wd-skeleton :row-col="[1, 1, 1, 1, 1]" :loading="true" />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `row-col` 数组长度表示行数
- 数字 `1` 表示一行默认文本骨架
- 上例显示5行文本骨架

### 自定义宽度

自定义每行的宽度:

```vue
<template>
  <view class="demo">
    <wd-skeleton
      :row-col="[
        { width: '100%' },
        { width: '80%' },
        { width: '60%' }
      ]"
      :loading="true"
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- 对象形式配置每行的宽度
- 支持百分比和具体数值
- 实现渐变宽度效果

### 自定义高度

自定义骨架屏元素的高度:

```vue
<template>
  <view class="demo">
    <wd-skeleton
      :row-col="[
        { height: '64rpx' },
        { height: '48rpx' },
        { height: '32rpx' }
      ]"
      :loading="true"
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `height` 属性设置高度
- 默认单位rpx
- 可以创建不同高度的骨架元素

### 复杂布局

组合多种元素创建复杂布局:

```vue
<template>
  <view class="demo">
    <wd-skeleton
      :row-col="[
        [
          { type: 'circle', size: '128rpx', marginRight: '32rpx' },
          [
            { width: '200rpx', height: '32rpx', marginBottom: '16rpx' },
            { width: '150rpx', height: '28rpx' }
          ]
        ],
        { height: '32rpx', marginTop: '32rpx' },
        { height: '32rpx' },
        { width: '70%', height: '32rpx' }
      ]"
      animation="gradient"
      :loading="true"
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**布局说明:**
- 第一行: 左侧圆形头像 + 右侧两行文本
- 后续三行: 标题和内容骨架
- 使用嵌套数组实现多列布局
- 适用于用户卡片、文章列表等复杂场景

### 圆形元素

创建圆形骨架元素:

```vue
<template>
  <view class="demo">
    <wd-skeleton
      :row-col="[
        [
          { type: 'circle', size: '96rpx' },
          { type: 'circle', size: '96rpx' },
          { type: 'circle', size: '96rpx' }
        ]
      ]"
      :loading="true"
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `type="circle"` 创建圆形元素
- `size` 同时设置宽高
- 适用于头像列表、图标组等场景

### 矩形元素

创建矩形骨架元素:

```vue
<template>
  <view class="demo">
    <wd-skeleton
      :row-col="[
        [
          { type: 'rect', width: '200rpx', height: '200rpx' },
          { type: 'rect', width: '200rpx', height: '200rpx' },
          { type: 'rect', width: '200rpx', height: '200rpx' }
        ]
      ]"
      :loading="true"
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `type="rect"` 创建矩形元素
- 分别设置 `width` 和 `height`
- 适用于图片网格、商品列表等场景

### 自定义间距

设置元素之间的间距:

```vue
<template>
  <view class="demo">
    <wd-skeleton
      :row-col="[
        [
          { type: 'circle', size: '96rpx', marginRight: '24rpx' },
          { type: 'circle', size: '96rpx', marginRight: '24rpx' },
          { type: 'circle', size: '96rpx' }
        ]
      ]"
      :loading="true"
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `marginRight` 设置右外边距
- `marginLeft` 设置左外边距
- `margin` 设置所有外边距
- 默认单位rpx

### 自定义圆角

设置骨架元素的圆角:

```vue
<template>
  <view class="demo">
    <wd-skeleton
      :row-col="[
        { type: 'rect', width: '100%', height: '200rpx', borderRadius: '16rpx' },
        { type: 'rect', width: '100%', height: '100rpx', borderRadius: '8rpx' }
      ]"
      :loading="true"
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `borderRadius` 设置圆角大小
- 默认单位rpx
- 可以实现卡片、按钮等不同圆角效果

### 自定义背景色

自定义骨架元素的背景颜色:

```vue
<template>
  <view class="demo">
    <wd-skeleton
      :row-col="[
        { backgroundColor: '#e3f2fd', height: '64rpx' },
        { backgroundColor: '#bbdefb', height: '64rpx' },
        { backgroundColor: '#90caf9', height: '64rpx' }
      ]"
      :loading="true"
    />
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `backgroundColor` 设置背景色
- 支持十六进制、RGB等CSS颜色值
- 可以创建品牌色骨架屏

## 实战案例

### 案例1: 用户列表加载

用户列表的加载骨架:

```vue
<template>
  <view class="user-list">
    <wd-skeleton
      v-for="index in 5"
      :key="index"
      :row-col="userSkeletonConfig"
      animation="gradient"
      :loading="loading"
      class="user-item"
    >
      <view class="user-card">
        <image :src="users[index - 1]?.avatar" class="avatar" />
        <view class="info">
          <text class="name">{{ users[index - 1]?.name }}</text>
          <text class="desc">{{ users[index - 1]?.desc }}</text>
        </view>
        <wd-button size="small">关注</wd-button>
      </view>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface User {
  avatar: string
  name: string
  desc: string
}

const loading = ref(true)
const users = ref<User[]>([])

// 用户骨架配置
const userSkeletonConfig = [
  [
    { type: 'circle', size: '96rpx', marginRight: '24rpx' },
    [
      { width: '200rpx', height: '32rpx', marginBottom: '12rpx' },
      { width: '300rpx', height: '28rpx' }
    ],
    { type: 'rect', width: '120rpx', height: '60rpx', borderRadius: '8rpx', marginLeft: 'auto' }
  ]
]

// 模拟加载数据
setTimeout(() => {
  users.value = [
    { avatar: '...', name: '张三', desc: '前端开发工程师' },
    { avatar: '...', name: '李四', desc: 'UI设计师' },
    { avatar: '...', name: '王五', desc: '产品经理' }
  ]
  loading.value = false
}, 3000)
</script>

<style lang="scss" scoped>
.user-list {
  padding: 32rpx;
}

.user-item {
  margin-bottom: 24rpx;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 8rpx;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.info {
  flex: 1;
}

.name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.desc {
  font-size: 24rpx;
  color: #999;
}
</style>
```

**实现要点:**
- 使用 v-for 循环渲染多个骨架
- 左侧圆形头像 + 中间文本信息 + 右侧按钮
- 使用 `marginLeft: 'auto'` 实现按钮右对齐
- 加载完成后自动切换到真实内容

### 案例2: 文章详情加载

文章详情页的加载骨架:

```vue
<template>
  <view class="article-detail">
    <wd-skeleton :row-col="articleSkeletonConfig" animation="gradient" :loading="loading">
      <view class="article">
        <!-- 标题 -->
        <text class="title">{{ article.title }}</text>

        <!-- 作者信息 -->
        <view class="author-info">
          <image :src="article.avatar" class="avatar" />
          <view class="author-details">
            <text class="author-name">{{ article.author }}</text>
            <text class="publish-time">{{ article.time }}</text>
          </view>
        </view>

        <!-- 封面图 -->
        <image :src="article.cover" class="cover" mode="aspectFill" />

        <!-- 内容 -->
        <text class="content">{{ article.content }}</text>

        <!-- 操作栏 -->
        <view class="actions">
          <view class="action-item">
            <wd-icon name="thumb-up" />
            <text>{{ article.likes }}</text>
          </view>
          <view class="action-item">
            <wd-icon name="chat" />
            <text>{{ article.comments }}</text>
          </view>
          <view class="action-item">
            <wd-icon name="share" />
            <text>分享</text>
          </view>
        </view>
      </view>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Article {
  title: string
  avatar: string
  author: string
  time: string
  cover: string
  content: string
  likes: number
  comments: number
}

const loading = ref(true)
const article = ref<Article>({} as Article)

// 文章骨架配置
const articleSkeletonConfig = [
  // 标题
  { width: '80%', height: '48rpx', marginBottom: '32rpx' },

  // 作者信息行
  [
    { type: 'circle', size: '64rpx', marginRight: '16rpx' },
    [
      { width: '150rpx', height: '28rpx', marginBottom: '8rpx' },
      { width: '200rpx', height: '24rpx' }
    ]
  ],

  // 封面图
  { type: 'rect', width: '100%', height: '400rpx', marginTop: '32rpx', marginBottom: '32rpx', borderRadius: '8rpx' },

  // 内容段落
  { height: '32rpx', marginBottom: '16rpx' },
  { height: '32rpx', marginBottom: '16rpx' },
  { height: '32rpx', marginBottom: '16rpx' },
  { width: '60%', height: '32rpx', marginBottom: '48rpx' },

  // 操作栏
  [
    { width: '100rpx', height: '48rpx' },
    { width: '100rpx', height: '48rpx' },
    { width: '100rpx', height: '48rpx' }
  ]
]

// 模拟加载文章
setTimeout(() => {
  article.value = {
    title: '深入理解骨架屏组件的设计与实现',
    avatar: 'https://unpkg.com/wot-design-uni-assets/avatar.jpg',
    author: '技术博主',
    time: '2024-01-01 10:00',
    cover: 'https://unpkg.com/wot-design-uni-assets/article-cover.jpg',
    content: '骨架屏是提升用户体验的重要手段...',
    likes: 128,
    comments: 45
  }
  loading.value = false
}, 3000)
</script>

<style lang="scss" scoped>
.article-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 32rpx;
}

.article {
  background: #fff;
  border-radius: 8rpx;
  padding: 32rpx;
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  line-height: 1.4;
  margin-bottom: 32rpx;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.author-details {
  flex: 1;
}

.author-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.publish-time {
  font-size: 24rpx;
  color: #999;
}

.cover {
  width: 100%;
  height: 400rpx;
  border-radius: 8rpx;
  margin-bottom: 32rpx;
}

.content {
  font-size: 28rpx;
  line-height: 1.8;
  color: #333;
  margin-bottom: 48rpx;
}

.actions {
  display: flex;
  justify-content: space-around;
  padding-top: 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #666;
}
</style>
```

**实现要点:**
- 完整模拟文章详情页结构
- 标题、作者、封面、内容、操作栏逐一配置
- 使用不同的元素类型和尺寸
- 加载动画增强体验

### 案例3: 商品列表加载

电商商品列表的加载骨架:

```vue
<template>
  <view class="product-list">
    <view class="grid">
      <wd-skeleton
        v-for="index in 6"
        :key="index"
        :row-col="productSkeletonConfig"
        animation="gradient"
        :loading="loading"
        class="product-item"
      >
        <view class="product-card">
          <image :src="products[index - 1]?.image" class="product-image" mode="aspectFill" />
          <view class="product-info">
            <text class="product-name">{{ products[index - 1]?.name }}</text>
            <text class="product-price">¥{{ products[index - 1]?.price }}</text>
          </view>
        </view>
      </wd-skeleton>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Product {
  image: string
  name: string
  price: number
}

const loading = ref(true)
const products = ref<Product[]>([])

// 商品骨架配置
const productSkeletonConfig = [
  // 商品图片
  { type: 'rect', width: '100%', height: '300rpx', borderRadius: '8rpx', marginBottom: '16rpx' },

  // 商品名称
  { width: '100%', height: '32rpx', marginBottom: '12rpx' },
  { width: '60%', height: '32rpx', marginBottom: '16rpx' },

  // 价格
  { width: '120rpx', height: '40rpx' }
]

// 模拟加载商品
setTimeout(() => {
  products.value = [
    { image: '...', name: '经典红熊猫玩偶', price: 199 },
    { image: '...', name: '大象公仔', price: 299 },
    { image: '...', name: '熊猫抱枕', price: 159 }
  ]
  loading.value = false
}, 3000)
</script>

<style lang="scss" scoped>
.product-list {
  padding: 32rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.product-item {
  background: #fff;
  border-radius: 8rpx;
  overflow: hidden;
}

.product-card {
  height: 100%;
}

.product-image {
  width: 100%;
  height: 300rpx;
}

.product-info {
  padding: 16rpx;
}

.product-name {
  display: block;
  font-size: 28rpx;
  line-height: 1.4;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff4d4f;
}
</style>
```

**实现要点:**
- 使用 Grid 布局实现两列商品
- 图片 + 标题 + 价格的标准商品卡片结构
- 多个骨架项同时加载
- 适用于商品列表、图片墙等网格场景

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `theme` | 骨架图风格,有基础、头像组合等类型 | `'text' \| 'avatar' \| 'paragraph' \| 'image'` | `'text'` |
| `row-col` | 用于设置行列数量、宽度高度、间距等 | `SkeletonRowCol[]` | `[]` |
| `loading` | 是否为加载状态,如果是则显示骨架图,如果不是则显示加载完成的内容 | `boolean` | `true` |
| `animation` | 动画效果,有「渐变加载动画」和「闪烁加载动画」两种,值为空则表示没有动画 | `'gradient' \| 'flashed' \| ''` | `''` |
| `custom-style` | 自定义根节点样式 | `string` | `''` |
| `custom-class` | 自定义根节点样式类 | `string` | `''` |

### SkeletonRowCol 类型

```typescript
/**
 * 骨架屏行列配置类型
 */
type SkeletonRowCol = number | SkeletonRowColObj | Array<SkeletonRowColObj>

/**
 * 骨架屏行列对象配置
 */
interface SkeletonRowColObj {
  /** 骨架屏类型 */
  type?: 'rect' | 'circle' | 'text'
  /** 尺寸(同时设置宽高) */
  size?: string | number
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 外边距 */
  margin?: string | number
  /** 左外边距 */
  marginLeft?: string | number
  /** 右外边距 */
  marginRight?: string | number
  /** 圆角半径 */
  borderRadius?: string | number
  /** 背景颜色 */
  backgroundColor?: string
  /** 背景色(同 backgroundColor) */
  background?: string
}
```

**配置说明:**

1. **数字类型**: 表示一行默认文本骨架
   ```typescript
   rowCol: [1, 1, 1] // 三行文本
   ```

2. **对象类型**: 单行自定义配置
   ```typescript
   rowCol: [
     { width: '80%', height: '32rpx' }
   ]
   ```

3. **数组类型**: 多列布局
   ```typescript
   rowCol: [
     [
       { type: 'circle', size: '64rpx' },
       { width: '200rpx', height: '32rpx' }
     ]
   ]
   ```

### 主题预设配置

```typescript
// text 主题(默认)
[
  1,
  [
    { width: '24%', height: '32rpx', marginRight: '32rpx' },
    { width: '76%', height: '32rpx' }
  ]
]

// avatar 主题
[
  { type: 'circle', height: '128rpx', width: '128rpx' }
]

// paragraph 主题
[
  1,
  1,
  1,
  { width: '55%' }
]

// image 主题
[
  { type: 'rect', height: '128rpx', width: '128rpx' }
]
```

### Slots

| 插槽名 | 说明 |
|--------|------|
| `default` | 加载完成后显示的内容 |

**插槽使用:**
- `loading=true` 时显示骨架屏
- `loading=false` 时显示插槽内容
- 实现无缝切换

## 主题定制

### CSS 变量

组件提供了以下 CSS 变量用于主题定制:

```scss
// 骨架屏样式
$-skeleton-background-color: #f2f3f5;              // 背景色
$-skeleton-row-margin-bottom: 24rpx;               // 行间距

// 文本类型
$-skeleton-text-height-default: 32rpx;             // 默认高度
$-skeleton-border-radius-text: 8rpx;               // 圆角

// 矩形类型
$-skeleton-rect-height-default: 128rpx;            // 默认高度
$-skeleton-border-radius-rect: 16rpx;              // 圆角

// 圆形类型
$-skeleton-circle-height-default: 64rpx;           // 默认尺寸
$-skeleton-border-radius-circle: 50%;              // 圆角(圆形)

// 动画
$-skeleton-animation-gradient: rgba(255, 255, 255, 0.5);  // 渐变色
$-skeleton-animation-flashed: #e8eaec;             // 闪烁色
```

### 暗黑模式

组件自动适配暗黑模式:

```scss
.wot-theme-dark {
  .wd-skeleton__col {
    background-color: $-dark-background4;  // 暗黑模式背景色
  }
}
```

### 自定义样式

```scss
// 自定义骨架屏颜色
:deep(.wd-skeleton) {
  .wd-skeleton__col {
    background-color: #e3f2fd;
  }
}

// 自定义动画速度
:deep(.wd-skeleton--animation-gradient::after) {
  animation-duration: 1s !important;
}

// 自定义圆角
:deep(.wd-skeleton__col) {
  border-radius: 16rpx;
}
```

## 最佳实践

### 1. 选择合适的主题

根据内容类型选择预设主题:

```vue
<!-- ✅ 用户信息用 avatar -->
<wd-skeleton theme="avatar" />

<!-- ✅ 文章内容用 paragraph -->
<wd-skeleton theme="paragraph" />

<!-- ✅ 图片加载用 image -->
<wd-skeleton theme="image" />

<!-- ❌ 不要所有场景都用 text -->
<wd-skeleton theme="text" />
```

### 2. 骨架屏要贴近真实布局

尽量让骨架屏结构接近真实内容:

```vue
<!-- ✅ 结构相似 -->
<wd-skeleton
  :row-col="[
    { height: '48rpx' },  // 对应标题
    { height: '32rpx' },  // 对应副标题
    { type: 'rect', height: '200rpx' }  // 对应图片
  ]"
/>

<!-- ❌ 结构差异大 -->
<wd-skeleton theme="text" />
```

### 3. 合理使用动画

根据加载时间选择是否使用动画:

```vue
<!-- ✅ 加载时间长用动画 -->
<wd-skeleton animation="gradient" :loading="true" />

<!-- ✅ 加载时间短不用动画 -->
<wd-skeleton :loading="true" />

<!-- ❌ 闪现加载不要动画 -->
<wd-skeleton animation="gradient" :loading="isLoading" />
```

### 4. 配合实际数据使用

骨架屏应该配合真实加载状态:

```vue
<!-- ✅ 正确使用 -->
<wd-skeleton :loading="isLoading">
  <view class="content">{{ data }}</view>
</wd-skeleton>

<script setup>
const isLoading = ref(true)
const data = ref('')

onMounted(async () => {
  data.value = await fetchData()
  isLoading.value = false
})
</script>

<!-- ❌ 硬编码 loading 状态 -->
<wd-skeleton :loading="true">
  <view class="content">永远不会显示</view>
</wd-skeleton>
```

## 常见问题

### 1. 骨架屏与真实内容高度不一致

**问题描述:**
骨架屏高度和真实内容高度差异大,切换时有跳变。

**问题原因:**
- 骨架屏配置与实际内容结构不匹配
- 没有设置合适的高度

**解决方案:**
```vue
<!-- ✅ 精确配置高度 -->
<wd-skeleton
  :row-col="[
    { height: '48rpx' },  // 对应真实标题高度
    { height: '200rpx' }  // 对应真实图片高度
  ]"
  :loading="loading"
>
  <view class="content">
    <text class="title">标题</text>  <!-- 48rpx -->
    <image class="cover" />  <!-- 200rpx -->
  </view>
</wd-skeleton>
```

### 2. 动画不流畅

**问题描述:**
渐变或闪烁动画卡顿。

**问题原因:**
- 骨架屏元素过多
- 页面其他部分性能问题
- 低端设备性能不足

**解决方案:**
```vue
<!-- ✅ 减少骨架屏元素 -->
<wd-skeleton
  :row-col="[1, 1, 1]"
  animation="gradient"
/>

<!-- ✅ 使用简单动画或不用动画 -->
<wd-skeleton
  :row-col="complexConfig"
  animation=""
/>

<!-- ❌ 避免过于复杂 -->
<wd-skeleton
  :row-col="[...Array(50)]"
  animation="gradient"
/>
```

### 3. 自定义样式不生效

**问题描述:**
通过 `backgroundColor` 等属性设置的样式不生效。

**问题原因:**
- CSS 优先级问题
- 主题样式覆盖

**解决方案:**
```vue
<!-- ✅ 使用内联样式 -->
<wd-skeleton
  :row-col="[
    { backgroundColor: '#e3f2fd !important' }
  ]"
/>

<!-- ✅ 使用 custom-class -->
<wd-skeleton
  custom-class="custom-skeleton"
  :row-col="[{ height: '48rpx' }]"
/>

<style>
:deep(.custom-skeleton .wd-skeleton__col) {
  background-color: #e3f2fd !important;
}
</style>
```

### 4. 列表骨架屏数量不对

**问题描述:**
使用 v-for 渲染骨架屏,数量显示不正确。

**问题原因:**
- 真实数据数量与骨架屏数量不一致
- loading 状态管理错误

**解决方案:**
```vue
<!-- ✅ 根据实际数量渲染 -->
<template v-if="loading">
  <wd-skeleton
    v-for="n in skeletonCount"
    :key="`skeleton-${n}`"
    :row-col="config"
  />
</template>
<template v-else>
  <view v-for="item in list" :key="item.id">
    {{ item }}
  </view>
</template>

<script setup>
const skeletonCount = ref(5)  // 预估数量
const loading = ref(true)
const list = ref([])

onMounted(async () => {
  list.value = await fetchData()
  loading.value = false
})
</script>
```

### 5. 骨架屏闪现

**问题描述:**
数据加载很快时,骨架屏一闪而过。

**问题原因:**
- 加载时间过短
- 没有设置最小显示时间

**解决方案:**
```vue
<template>
  <wd-skeleton :loading="showSkeleton">
    <view class="content">{{ data }}</view>
  </wd-skeleton>
</template>

<script setup>
const showSkeleton = ref(true)
const data = ref('')

const MIN_LOADING_TIME = 500  // 最小显示500ms

onMounted(async () => {
  const startTime = Date.now()

  // 加载数据
  data.value = await fetchData()

  // 确保骨架屏至少显示500ms
  const elapsed = Date.now() - startTime
  if (elapsed < MIN_LOADING_TIME) {
    await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed))
  }

  showSkeleton.value = false
})
</script>
```
