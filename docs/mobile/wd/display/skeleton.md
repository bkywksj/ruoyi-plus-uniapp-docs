---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/display/skeleton
---

# Skeleton 骨架屏

## 介绍

Skeleton 骨架屏组件用于在内容加载过程中展示占位图形组合,通过展示页面的大致结构,减少用户等待时的焦虑感,提升用户体验。它支持多种预设主题、灵活的自定义布局、动态加载动画,是现代应用加载状态的最佳实践方案。

骨架屏是一种优化用户体验的技术手段,与传统的加载动画(如转圈、进度条)不同,骨架屏通过预先展示内容的大致形状和位置,让用户对即将加载的内容有一个预期,从而降低感知等待时间。这种方式特别适用于内容结构相对固定的页面,如列表页、详情页、用户资料页等。

**核心特性:**

- **预设主题** - 提供文本(text)、头像(avatar)、段落(paragraph)、图片(image)四种常用主题,开箱即用
- **自定义布局** - 支持灵活配置行列、尺寸、间距等,可精确模拟真实内容结构
- **加载动画** - 内置渐变(gradient)和闪烁(flashed)两种动画效果,增强加载感知
- **加载状态控制** - 通过 loading 属性控制显示骨架屏或真实内容,实现无缝切换
- **多种形状** - 支持文本(text)、矩形(rect)、圆形(circle)三种基础形状
- **暗黑模式** - 自动适配暗黑模式主题,无需额外配置
- **零侵入** - 通过插槽机制无缝切换加载和内容状态,不影响原有代码结构
- **高度可定制** - 支持自定义背景色、圆角、间距等样式属性
- **嵌套布局** - 支持多层嵌套数组实现复杂的多列布局
- **响应式更新** - 监听配置变化,自动重新渲染骨架屏结构

## 设计理念

### 为什么使用骨架屏

骨架屏相比传统加载方式具有以下优势:

1. **降低感知等待时间** - 研究表明,当用户看到页面结构的预览时,会感觉加载时间更短
2. **减少布局跳变** - 预先占位可以避免内容加载后的布局偏移(CLS)
3. **提升用户信心** - 让用户知道内容正在加载,而不是页面出错
4. **增强视觉连贯性** - 骨架屏到真实内容的过渡更加自然

### 组件架构

组件采用 Vue 3 Composition API 实现,主要包含以下核心模块:

**1. 属性定义模块**

定义组件接收的所有属性,包括主题、行列配置、加载状态、动画类型等。使用 TypeScript 接口确保类型安全。

**2. 主题预设模块**

内置四种主题的默认配置,当用户未提供自定义 `rowCol` 配置时,根据 `theme` 属性自动应用对应的预设布局。

**3. 配置解析模块**

将用户配置的 `rowCol` 数组解析为可渲染的数据结构,支持数字、对象、数组三种配置方式,并计算每个元素的类名和样式。

**4. 样式计算模块**

根据配置项计算每个骨架元素的具体样式,包括尺寸、间距、背景色、圆角等,自动处理单位转换。

**5. 动画系统**

提供渐变和闪烁两种动画效果,基于 CSS3 @keyframes 实现,性能优异。

### 渲染流程

```
props.rowCol 变化
       ↓
监听器触发 (watch)
       ↓
应用主题预设或自定义配置
       ↓
rowCols.value 更新
       ↓
parsedRowCols 计算属性重新计算
       ↓
为每个元素生成 class 和 style
       ↓
v-for 渲染骨架屏元素
```

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

### 6. 嵌套数组配置无效

**问题描述:**
使用嵌套数组配置多列布局时,显示不正确或报错。

**问题原因:**
- 嵌套层级过深
- 配置格式错误

**解决方案:**
```vue
<!-- ✅ 正确的嵌套配置 -->
<wd-skeleton
  :row-col="[
    [
      { type: 'circle', size: '64rpx', marginRight: '16rpx' },
      { width: '200rpx', height: '32rpx' }
    ]
  ]"
/>

<!-- ❌ 错误:三层嵌套 -->
<wd-skeleton
  :row-col="[
    [
      [{ width: '100rpx' }]  // 不支持三层嵌套
    ]
  ]"
/>
```

**配置规则:**
- 第一层数组表示行
- 第二层数组表示列
- 不支持更深层级的嵌套

### 7. 暗黑模式下颜色不正确

**问题描述:**
在暗黑模式下,骨架屏背景色与页面不协调。

**问题原因:**
- 使用了固定的颜色值
- 没有使用 CSS 变量

**解决方案:**
```vue
<!-- ✅ 使用 CSS 变量适配暗黑模式 -->
<style lang="scss">
:deep(.wd-skeleton__col) {
  // 使用 CSS 变量,自动适配主题
  background-color: var(--wot-skeleton-background-color);
}
</style>

<!-- ✅ 或者针对暗黑模式单独设置 -->
<style lang="scss">
.wot-theme-dark {
  :deep(.wd-skeleton__col) {
    background-color: #3a3a3a;
  }
}
</style>
```

### 8. 动画延迟问题

**问题描述:**
动画开始有明显的延迟,用户需要等待一段时间才能看到动画效果。

**问题原因:**
- 组件内置了 2 秒的动画延迟(`animation-delay: 2s`)
- 这是为了避免快速加载时动画闪烁

**解决方案:**
```vue
<!-- ✅ 通过自定义样式移除延迟 -->
<wd-skeleton
  animation="gradient"
  custom-class="no-delay-skeleton"
  :loading="true"
/>

<style lang="scss">
:deep(.no-delay-skeleton) {
  .wd-skeleton--animation-gradient::after {
    animation-delay: 0s !important;
  }
  .wd-skeleton--animation-flashed {
    animation-delay: 0s !important;
  }
}
</style>
```

## 进阶用法

### 动态骨架屏配置

根据数据类型动态生成骨架屏配置:

```vue
<template>
  <view class="demo">
    <wd-skeleton :row-col="skeletonConfig" animation="gradient" :loading="loading">
      <view class="content-list">
        <view v-for="item in list" :key="item.id" class="content-item">
          {{ item.title }}
        </view>
      </view>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface ContentItem {
  id: number
  title: string
  type: 'image' | 'text' | 'card'
}

const loading = ref(true)
const list = ref<ContentItem[]>([])
const contentType = ref<'image' | 'text' | 'card'>('card')

// 根据内容类型动态生成骨架屏配置
const skeletonConfig = computed(() => {
  const configs = {
    image: [
      { type: 'rect', width: '100%', height: '400rpx', borderRadius: '8rpx' },
      { width: '60%', height: '32rpx', marginTop: '16rpx' }
    ],
    text: [
      { height: '48rpx', marginBottom: '16rpx' },
      { height: '32rpx' },
      { height: '32rpx' },
      { width: '70%', height: '32rpx' }
    ],
    card: [
      [
        { type: 'circle', size: '96rpx', marginRight: '24rpx' },
        [
          { width: '200rpx', height: '32rpx', marginBottom: '12rpx' },
          { width: '300rpx', height: '28rpx' }
        ]
      ],
      { type: 'rect', width: '100%', height: '200rpx', marginTop: '24rpx', borderRadius: '8rpx' }
    ]
  }
  return configs[contentType.value] || configs.card
})

// 模拟加载
setTimeout(() => {
  list.value = [
    { id: 1, title: '内容1', type: 'card' },
    { id: 2, title: '内容2', type: 'card' }
  ]
  loading.value = false
}, 2000)
</script>

```

**实现要点:**
- 使用 `computed` 根据数据类型动态生成配置
- 预定义多种布局模板
- 支持运行时切换骨架屏样式

### 骨架屏工厂函数

创建可复用的骨架屏配置工厂:

```vue
<template>
  <view class="demo">
    <!-- 使用工厂函数生成配置 -->
    <wd-skeleton
      :row-col="createUserCardSkeleton()"
      animation="gradient"
      :loading="loading"
    >
      <view class="user-card">
        <image :src="user.avatar" class="avatar" />
        <text class="name">{{ user.name }}</text>
      </view>
    </wd-skeleton>

    <wd-skeleton
      :row-col="createProductSkeleton({ imageHeight: '300rpx', rows: 3 })"
      animation="gradient"
      :loading="loading"
    >
      <view class="product-card">
        <image :src="product.image" class="product-image" />
        <text class="product-name">{{ product.name }}</text>
      </view>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 用户卡片骨架配置工厂
const createUserCardSkeleton = () => [
  [
    { type: 'circle', size: '96rpx', marginRight: '24rpx' },
    [
      { width: '200rpx', height: '32rpx', marginBottom: '12rpx' },
      { width: '150rpx', height: '28rpx' }
    ]
  ]
]

// 商品卡片骨架配置工厂
interface ProductSkeletonOptions {
  imageHeight?: string
  rows?: number
}

const createProductSkeleton = (options: ProductSkeletonOptions = {}) => {
  const { imageHeight = '200rpx', rows = 2 } = options
  const textRows = Array(rows).fill(null).map((_, index) => ({
    width: index === rows - 1 ? '60%' : '100%',
    height: '32rpx',
    marginBottom: index === rows - 1 ? '0' : '12rpx'
  }))

  return [
    { type: 'rect', width: '100%', height: imageHeight, borderRadius: '8rpx', marginBottom: '16rpx' },
    ...textRows
  ]
}

// 文章骨架配置工厂
const createArticleSkeleton = (paragraphs: number = 4) => {
  const paragraphRows = Array(paragraphs).fill(null).map((_, index) => ({
    width: index === paragraphs - 1 ? '55%' : '100%',
    height: '32rpx'
  }))

  return [
    // 标题
    { width: '80%', height: '48rpx', marginBottom: '24rpx' },
    // 作者信息
    [
      { type: 'circle', size: '64rpx', marginRight: '16rpx' },
      [
        { width: '120rpx', height: '28rpx', marginBottom: '8rpx' },
        { width: '180rpx', height: '24rpx' }
      ]
    ],
    // 封面图
    { type: 'rect', width: '100%', height: '400rpx', marginTop: '24rpx', marginBottom: '24rpx', borderRadius: '8rpx' },
    // 段落
    ...paragraphRows
  ]
}

const loading = ref(true)
const user = ref({ avatar: '', name: '' })
const product = ref({ image: '', name: '' })

setTimeout(() => {
  user.value = { avatar: 'https://example.com/avatar.jpg', name: '张三' }
  product.value = { image: 'https://example.com/product.jpg', name: '商品名称' }
  loading.value = false
}, 2000)
</script>

```

**工厂函数优势:**
- 配置可复用,避免重复代码
- 支持参数化定制
- 便于统一管理和维护
- 确保骨架屏风格一致

### 条件渲染优化

优化骨架屏的条件渲染逻辑:

```vue
<template>
  <view class="demo">
    <!-- 方式1: 使用组件内置的 loading 控制 -->
    <wd-skeleton :row-col="config" :loading="loading">
      <view class="content">{{ data }}</view>
    </wd-skeleton>

    <!-- 方式2: 使用 v-if 分离骨架屏和内容 -->
    <template v-if="loading">
      <wd-skeleton :row-col="config" :loading="true" />
    </template>
    <template v-else>
      <view class="content">{{ data }}</view>
    </template>

    <!-- 方式3: 使用 v-show 保持 DOM 结构(适用于频繁切换) -->
    <view v-show="loading">
      <wd-skeleton :row-col="config" :loading="true" />
    </view>
    <view v-show="!loading" class="content">
      {{ data }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(true)
const data = ref('')
const config = [1, 1, 1]

// 加载数据
setTimeout(() => {
  data.value = '加载完成的内容'
  loading.value = false
}, 2000)
</script>
```

**方式对比:**

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 内置 loading | 代码简洁,无缝切换 | 无法完全自定义切换逻辑 | 大多数场景 |
| v-if 分离 | 完全控制渲染逻辑 | 代码较冗余 | 需要复杂切换逻辑 |
| v-show | 切换性能好 | 始终保持 DOM | 频繁切换场景 |

### 与下拉刷新结合

骨架屏与下拉刷新功能结合:

```vue
<template>
  <scroll-view
    scroll-y
    refresher-enabled
    :refresher-triggered="refreshing"
    @refresherrefresh="onRefresh"
    class="scroll-container"
  >
    <!-- 首次加载显示骨架屏 -->
    <template v-if="firstLoading">
      <wd-skeleton
        v-for="n in 5"
        :key="`skeleton-${n}`"
        :row-col="itemConfig"
        animation="gradient"
        :loading="true"
        class="list-item"
      />
    </template>

    <!-- 数据列表 -->
    <template v-else>
      <view v-for="item in list" :key="item.id" class="list-item">
        <image :src="item.avatar" class="avatar" />
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="desc">{{ item.desc }}</text>
        </view>
      </view>
    </template>
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface ListItem {
  id: number
  avatar: string
  name: string
  desc: string
}

const firstLoading = ref(true)
const refreshing = ref(false)
const list = ref<ListItem[]>([])

const itemConfig = [
  [
    { type: 'circle', size: '96rpx', marginRight: '24rpx' },
    [
      { width: '200rpx', height: '32rpx', marginBottom: '12rpx' },
      { width: '300rpx', height: '28rpx' }
    ]
  ]
]

// 加载数据
const loadData = async () => {
  // 模拟接口请求
  await new Promise(resolve => setTimeout(resolve, 1500))
  return [
    { id: 1, avatar: '...', name: '用户1', desc: '描述信息1' },
    { id: 2, avatar: '...', name: '用户2', desc: '描述信息2' },
    { id: 3, avatar: '...', name: '用户3', desc: '描述信息3' }
  ]
}

// 首次加载
onMounted(async () => {
  list.value = await loadData()
  firstLoading.value = false
})

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  // 刷新时不显示骨架屏,使用原生刷新动画
  list.value = await loadData()
  refreshing.value = false
}
</script>

```

**使用要点:**
- 首次加载显示骨架屏
- 下拉刷新使用原生刷新动画
- 区分首次加载和刷新状态

### 与分页加载结合

骨架屏与分页加载功能结合:

```vue
<template>
  <scroll-view
    scroll-y
    @scrolltolower="onLoadMore"
    class="scroll-container"
  >
    <!-- 首次加载骨架屏 -->
    <template v-if="firstLoading">
      <wd-skeleton
        v-for="n in pageSize"
        :key="`skeleton-first-${n}`"
        :row-col="itemConfig"
        animation="gradient"
        :loading="true"
        class="list-item"
      />
    </template>

    <!-- 数据列表 -->
    <template v-else>
      <view v-for="item in list" :key="item.id" class="list-item">
        <text class="item-text">{{ item.title }}</text>
      </view>

      <!-- 加载更多骨架屏 -->
      <template v-if="loadingMore">
        <wd-skeleton
          v-for="n in pageSize"
          :key="`skeleton-more-${n}`"
          :row-col="itemConfig"
          animation="flashed"
          :loading="true"
          class="list-item"
        />
      </template>

      <!-- 加载完成提示 -->
      <view v-if="noMore" class="no-more">
        没有更多数据了
      </view>
    </template>
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface ListItem {
  id: number
  title: string
}

const pageSize = 10
const currentPage = ref(1)
const firstLoading = ref(true)
const loadingMore = ref(false)
const noMore = ref(false)
const list = ref<ListItem[]>([])

const itemConfig = [
  { height: '48rpx', marginBottom: '16rpx' },
  { width: '60%', height: '32rpx' }
]

// 加载数据
const loadData = async (page: number) => {
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 模拟分页数据
  const totalPages = 3
  if (page > totalPages) {
    return []
  }

  return Array(pageSize).fill(null).map((_, index) => ({
    id: (page - 1) * pageSize + index + 1,
    title: `列表项 ${(page - 1) * pageSize + index + 1}`
  }))
}

// 首次加载
onMounted(async () => {
  list.value = await loadData(1)
  firstLoading.value = false
})

// 加载更多
const onLoadMore = async () => {
  if (loadingMore.value || noMore.value) return

  loadingMore.value = true
  currentPage.value++

  const newData = await loadData(currentPage.value)

  if (newData.length === 0) {
    noMore.value = true
  } else {
    list.value = [...list.value, ...newData]
  }

  loadingMore.value = false
}
</script>

```

**实现要点:**
- 首次加载使用骨架屏
- 加载更多时在列表底部显示骨架屏
- 加载更多可以使用不同的动画效果(如 flashed)
- 处理加载完成状态

### 骨架屏组件封装

封装通用的骨架屏组件:

```vue
<!-- SkeletonWrapper.vue -->
<template>
  <view class="skeleton-wrapper">
    <wd-skeleton
      :row-col="computedConfig"
      :animation="animation"
      :loading="loading"
      :custom-style="customStyle"
      :custom-class="customClass"
    >
      <slot />
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// 预设配置
const presets = {
  // 用户卡片
  userCard: [
    [
      { type: 'circle', size: '96rpx', marginRight: '24rpx' },
      [
        { width: '200rpx', height: '32rpx', marginBottom: '12rpx' },
        { width: '150rpx', height: '28rpx' }
      ]
    ]
  ],
  // 文章卡片
  articleCard: [
    { height: '48rpx', marginBottom: '16rpx' },
    { height: '32rpx', marginBottom: '12rpx' },
    { width: '70%', height: '32rpx', marginBottom: '24rpx' },
    { type: 'rect', width: '100%', height: '300rpx', borderRadius: '8rpx' }
  ],
  // 商品卡片
  productCard: [
    { type: 'rect', width: '100%', height: '300rpx', borderRadius: '8rpx', marginBottom: '16rpx' },
    { height: '32rpx', marginBottom: '12rpx' },
    { width: '50%', height: '32rpx', marginBottom: '16rpx' },
    { width: '120rpx', height: '40rpx' }
  ],
  // 简单文本
  text: [1, 1, 1],
  // 段落
  paragraph: [1, 1, 1, { width: '55%' }],
  // 头像
  avatar: [{ type: 'circle', size: '128rpx' }],
  // 图片
  image: [{ type: 'rect', width: '100%', height: '200rpx', borderRadius: '8rpx' }]
}

type PresetType = keyof typeof presets

interface Props {
  /** 是否加载中 */
  loading?: boolean
  /** 预设类型 */
  preset?: PresetType
  /** 自定义配置(优先级高于预设) */
  config?: any[]
  /** 动画效果 */
  animation?: 'gradient' | 'flashed' | ''
  /** 自定义样式 */
  customStyle?: string
  /** 自定义类名 */
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: true,
  preset: 'text',
  config: () => [],
  animation: 'gradient',
  customStyle: '',
  customClass: ''
})

// 计算最终配置
const computedConfig = computed(() => {
  // 自定义配置优先
  if (props.config && props.config.length > 0) {
    return props.config
  }
  // 使用预设
  return presets[props.preset] || presets.text
})
</script>

```

**使用封装组件:**

```vue
<template>
  <view class="demo">
    <!-- 使用预设 -->
    <SkeletonWrapper preset="userCard" :loading="loading">
      <view class="user-card">...</view>
    </SkeletonWrapper>

    <!-- 使用自定义配置 -->
    <SkeletonWrapper :config="customConfig" :loading="loading">
      <view class="custom-content">...</view>
    </SkeletonWrapper>

    <!-- 不同动画 -->
    <SkeletonWrapper preset="productCard" animation="flashed" :loading="loading">
      <view class="product-card">...</view>
    </SkeletonWrapper>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import SkeletonWrapper from '@/components/SkeletonWrapper.vue'

const loading = ref(true)
const customConfig = [
  { height: '64rpx', marginBottom: '16rpx' },
  { width: '80%', height: '48rpx' }
]
</script>
```

## 注意事项

### 性能考虑

1. **避免过多骨架元素**
   - 骨架屏元素过多会影响渲染性能
   - 建议单个骨架屏的元素数量控制在 20 个以内
   - 对于长列表,使用虚拟列表技术

2. **合理使用动画**
   - 动画会增加 CPU 和 GPU 负担
   - 在低端设备上考虑禁用动画
   - 避免同时显示大量带动画的骨架屏

3. **及时销毁**
   - 数据加载完成后及时切换到真实内容
   - 避免骨架屏长时间占用内存

### 可访问性

1. **提供加载状态提示**
   - 为屏幕阅读器用户添加 `aria-busy` 属性
   - 提供文字说明加载状态

```vue
<view :aria-busy="loading" aria-label="内容加载中">
  <wd-skeleton :loading="loading">
    <view class="content">{{ data }}</view>
  </wd-skeleton>
</view>
```

2. **避免纯视觉反馈**
   - 考虑添加加载进度提示
   - 为长时间加载提供取消选项

### 设计规范

1. **保持结构一致**
   - 骨架屏结构应尽量接近真实内容
   - 避免加载前后布局跳变

2. **合适的颜色对比**
   - 骨架屏颜色应与背景有一定对比度
   - 避免使用过于突兀的颜色

3. **适当的尺寸**
   - 骨架元素尺寸应与真实内容尺寸接近
   - 避免过大或过小的占位元素

## 平台兼容性

### 各平台表现

| 平台 | 基础功能 | 渐变动画 | 闪烁动画 | 暗黑模式 |
|------|---------|---------|---------|---------|
| H5 | ✅ | ✅ | ✅ | ✅ |
| 微信小程序 | ✅ | ✅ | ✅ | ✅ |
| 支付宝小程序 | ✅ | ✅ | ✅ | ✅ |
| 百度小程序 | ✅ | ✅ | ✅ | ✅ |
| 抖音小程序 | ✅ | ✅ | ✅ | ✅ |
| QQ 小程序 | ✅ | ✅ | ✅ | ✅ |
| App(vue3) | ✅ | ✅ | ✅ | ✅ |

### 平台特殊处理

**微信小程序:**
- 组件配置了 `addGlobalClass: true`,允许使用全局样式
- 配置了 `virtualHost: true`,减少 DOM 层级
- 配置了 `styleIsolation: 'shared'`,支持样式共享

**App 端:**
- 动画效果与 H5 一致
- 支持 nvue 渲染(需额外适配)

### 已知限制

1. **嵌套层级**
   - `rowCol` 配置最多支持两层嵌套
   - 不支持三层或更深层级的嵌套

2. **动画性能**
   - 在低端设备上,大量动画可能导致卡顿
   - 建议在低端设备上禁用动画

3. **样式隔离**
   - 部分平台的样式隔离机制可能影响自定义样式
   - 使用 `:deep()` 或 `!important` 覆盖样式

## 类型定义详解

### 完整类型定义

```typescript
/**
 * 骨架屏主题类型
 * @description 预设的骨架屏布局风格
 */
type SkeletonTheme = 'text' | 'avatar' | 'paragraph' | 'image'

/**
 * 骨架屏动画类型
 * @description 加载动画效果
 */
type SkeletonAnimation = 'gradient' | 'flashed'

/**
 * 骨架屏元素类型
 * @description 单个骨架元素的形状
 */
type SkeletonType = 'rect' | 'circle' | 'text'

/**
 * 骨架屏行列对象配置
 * @description 单个骨架元素的详细配置
 */
interface SkeletonRowColObj {
  /** 允许扩展属性 */
  [key: string]: any

  /**
   * 骨架屏类型
   * @default 'text'
   */
  type?: SkeletonType

  /**
   * 尺寸(同时设置宽高)
   * @description 支持数字(自动添加 rpx)或带单位的字符串
   * @example 64 或 '64rpx' 或 '32px'
   */
  size?: string | number

  /**
   * 宽度
   * @description 支持数字、百分比、带单位的字符串
   * @example 200 或 '80%' 或 '200rpx'
   */
  width?: string | number

  /**
   * 高度
   * @description 支持数字(自动添加 rpx)或带单位的字符串
   * @example 32 或 '32rpx' 或 '16px'
   */
  height?: string | number

  /**
   * 外边距
   * @description 设置所有方向的外边距
   */
  margin?: string | number

  /**
   * 左外边距
   * @description 支持 'auto' 实现右对齐
   */
  marginLeft?: string | number

  /**
   * 右外边距
   */
  marginRight?: string | number

  /**
   * 上外边距
   */
  marginTop?: string | number

  /**
   * 下外边距
   */
  marginBottom?: string | number

  /**
   * 圆角半径
   * @description 支持数字(自动添加 rpx)或带单位的字符串
   */
  borderRadius?: string | number

  /**
   * 背景颜色
   * @description 支持任意 CSS 颜色值
   */
  backgroundColor?: string

  /**
   * 背景色(同 backgroundColor)
   * @description 简写属性
   */
  background?: string
}

/**
 * 骨架屏行列配置类型
 * @description 支持三种配置方式
 */
type SkeletonRowCol =
  | number                      // 数字:生成默认文本骨架
  | SkeletonRowColObj           // 对象:单列自定义配置
  | Array<SkeletonRowColObj>    // 数组:多列布局配置

/**
 * 骨架屏组件属性接口
 */
interface WdSkeletonProps {
  /**
   * 自定义根节点样式
   * @default ''
   */
  customStyle?: string

  /**
   * 自定义根节点样式类
   * @default ''
   */
  customClass?: string

  /**
   * 骨架图风格,有基础、头像组合等类型
   * @default 'text'
   */
  theme?: SkeletonTheme

  /**
   * 用于设置行列数量、宽度高度、间距等
   * @default []
   * @description 为空时使用 theme 对应的预设配置
   */
  rowCol?: SkeletonRowCol[]

  /**
   * 是否为加载状态
   * @default true
   * @description true 显示骨架图,false 显示插槽内容
   */
  loading?: boolean

  /**
   * 动画效果
   * @default ''
   * @description gradient:渐变动画,flashed:闪烁动画,空字符串:无动画
   */
  animation?: SkeletonAnimation | ''
}

/**
 * 主题预设配置类型
 */
type ThemePresets = Record<SkeletonTheme, SkeletonRowCol[]>

/**
 * 解析后的行列配置(用于渲染)
 */
interface ParsedRowCol extends SkeletonRowColObj {
  /** 计算后的类名数组 */
  class: (string | Record<string, boolean>)[]
  /** 计算后的样式对象 */
  style: Record<string, string>
}
```

### 类型使用示例

```typescript
import type { SkeletonRowCol, SkeletonRowColObj, SkeletonTheme } from '@/types'

// 定义配置
const config: SkeletonRowCol[] = [
  1,  // 数字类型
  { width: '80%', height: '32rpx' },  // 对象类型
  [  // 数组类型(多列)
    { type: 'circle', size: '64rpx' },
    { width: '200rpx', height: '32rpx' }
  ]
]

// 定义单个元素配置
const item: SkeletonRowColObj = {
  type: 'rect',
  width: '100%',
  height: '200rpx',
  borderRadius: '8rpx',
  backgroundColor: '#e3f2fd'
}

// 定义主题
const theme: SkeletonTheme = 'paragraph'

// 在组件中使用
const skeletonConfig = ref<SkeletonRowCol[]>([])
```

### 工具类型

```typescript
/**
 * 提取骨架屏配置中的所有对象类型
 */
type ExtractRowColObj<T> = T extends SkeletonRowColObj ? T : never

/**
 * 骨架屏配置数组类型
 */
type SkeletonRowColArray = SkeletonRowCol[]

/**
 * 可选的骨架屏属性
 */
type OptionalSkeletonProps = Partial<WdSkeletonProps>

/**
 * 骨架屏配置工厂函数类型
 */
type SkeletonConfigFactory<T = void> = T extends void
  ? () => SkeletonRowCol[]
  : (options: T) => SkeletonRowCol[]
```
