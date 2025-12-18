---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/display/skeleton
---

# Skeleton 骨架屏

## 介绍

Skeleton 骨架屏组件用于在内容加载过程中展示占位图形，通过展示页面的大致结构，减少用户等待的焦虑感。

**核心特性:**

- **预设主题** - 提供 text、avatar、paragraph、image 四种主题
- **自定义布局** - 支持灵活配置行列、尺寸、间距等
- **加载动画** - 内置 gradient(渐变)和 flashed(闪烁)两种动画
- **加载状态控制** - 通过 loading 属性控制显示骨架屏或真实内容
- **多种形状** - 支持 text、rect、circle 三种基础形状
- **暗黑模式** - 自动适配暗黑模式主题

## 基本用法

### 文本骨架

默认使用 text 主题：

```vue
<template>
  <view class="demo">
    <wd-skeleton :loading="loading">
      <view class="content">
        <text>这是加载完成后的内容</text>
      </view>
    </wd-skeleton>

    <wd-button @click="loading = !loading" type="primary">
      {{ loading ? '加载完成' : '开始加载' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(true)
</script>
```

**说明:**
- `loading` 控制显示状态，true 显示骨架屏，false 显示内容
- 默认使用 text 主题，显示两行文本骨架

### 头像骨架

```vue
<template>
  <wd-skeleton theme="avatar" :loading="loading">
    <image src="https://example.com/avatar.jpg" class="avatar" />
  </wd-skeleton>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(true)
setTimeout(() => loading.value = false, 3000)
</script>
```

### 段落骨架

```vue
<template>
  <wd-skeleton theme="paragraph" :loading="loading">
    <view class="article">
      <text>文章内容...</text>
    </view>
  </wd-skeleton>
</template>
```

显示 4 行文本骨架，最后一行宽度为 55%。

### 图片骨架

```vue
<template>
  <wd-skeleton theme="image" :loading="loading">
    <image src="https://example.com/photo.jpg" mode="aspectFill" />
  </wd-skeleton>
</template>
```

## 动画效果

### 渐变动画

```vue
<template>
  <wd-skeleton animation="gradient" :loading="true" />
</template>
```

从左到右的光泽扫过效果，动画周期 1.5 秒。

### 闪烁动画

```vue
<template>
  <wd-skeleton animation="flashed" :loading="true" />
</template>
```

透明度循环变化效果，动画周期 2 秒。

## 自定义配置

### 自定义行数

```vue
<template>
  <wd-skeleton :row-col="[1, 1, 1, 1, 1]" :loading="true" />
</template>
```

数组长度表示行数，数字 `1` 表示一行默认文本骨架。

### 自定义宽度和高度

```vue
<template>
  <wd-skeleton
    :row-col="[
      { width: '100%', height: '48rpx' },
      { width: '80%', height: '32rpx' },
      { width: '60%', height: '32rpx' }
    ]"
    :loading="true"
  />
</template>
```

### 圆形元素

```vue
<template>
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
</template>
```

### 矩形元素

```vue
<template>
  <wd-skeleton
    :row-col="[
      { type: 'rect', width: '100%', height: '200rpx', borderRadius: '8rpx' }
    ]"
    :loading="true"
  />
</template>
```

### 自定义间距和圆角

```vue
<template>
  <wd-skeleton
    :row-col="[
      [
        { type: 'circle', size: '96rpx', marginRight: '24rpx' },
        { type: 'circle', size: '96rpx', marginRight: '24rpx' },
        { type: 'circle', size: '96rpx' }
      ],
      { type: 'rect', width: '100%', height: '200rpx', borderRadius: '16rpx', marginTop: '24rpx' }
    ]"
    :loading="true"
  />
</template>
```

### 自定义背景色

```vue
<template>
  <wd-skeleton
    :row-col="[
      { backgroundColor: '#e3f2fd', height: '64rpx' },
      { backgroundColor: '#bbdefb', height: '64rpx' },
      { backgroundColor: '#90caf9', height: '64rpx' }
    ]"
    :loading="true"
  />
</template>
```

## 复杂布局

使用嵌套数组实现多列布局：

```vue
<template>
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
</template>
```

**布局说明:**
- 第一行：左侧圆形头像 + 右侧两行文本
- 后续三行：标题和内容骨架
- 使用嵌套数组实现多列布局

## 实战案例

### 用户列表

```vue
<template>
  <view class="user-list">
    <wd-skeleton
      v-for="index in 5"
      :key="index"
      :row-col="userSkeletonConfig"
      animation="gradient"
      :loading="loading"
    >
      <view class="user-card">
        <image :src="users[index - 1]?.avatar" class="avatar" />
        <view class="info">
          <text class="name">{{ users[index - 1]?.name }}</text>
          <text class="desc">{{ users[index - 1]?.desc }}</text>
        </view>
      </view>
    </wd-skeleton>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(true)
const users = ref([])

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

setTimeout(() => {
  users.value = [
    { avatar: '...', name: '张三', desc: '前端开发' },
    { avatar: '...', name: '李四', desc: 'UI设计师' }
  ]
  loading.value = false
}, 3000)
</script>
```

### 文章详情

```vue
<template>
  <wd-skeleton :row-col="articleConfig" animation="gradient" :loading="loading">
    <view class="article">
      <text class="title">{{ article.title }}</text>
      <view class="author-info">
        <image :src="article.avatar" class="avatar" />
        <text class="name">{{ article.author }}</text>
      </view>
      <image :src="article.cover" class="cover" />
      <text class="content">{{ article.content }}</text>
    </view>
  </wd-skeleton>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(true)
const article = ref({})

const articleConfig = [
  { width: '80%', height: '48rpx', marginBottom: '32rpx' },
  [
    { type: 'circle', size: '64rpx', marginRight: '16rpx' },
    [
      { width: '150rpx', height: '28rpx', marginBottom: '8rpx' },
      { width: '200rpx', height: '24rpx' }
    ]
  ],
  { type: 'rect', width: '100%', height: '400rpx', marginTop: '32rpx', marginBottom: '32rpx', borderRadius: '8rpx' },
  { height: '32rpx', marginBottom: '16rpx' },
  { height: '32rpx', marginBottom: '16rpx' },
  { width: '60%', height: '32rpx' }
]

setTimeout(() => {
  article.value = {
    title: '文章标题',
    avatar: '...',
    author: '作者',
    cover: '...',
    content: '文章内容...'
  }
  loading.value = false
}, 3000)
</script>
```

### 与分页加载结合

```vue
<template>
  <scroll-view scroll-y @scrolltolower="onLoadMore">
    <!-- 首次加载骨架屏 -->
    <template v-if="firstLoading">
      <wd-skeleton
        v-for="n in pageSize"
        :key="`skeleton-${n}`"
        :row-col="itemConfig"
        animation="gradient"
        :loading="true"
      />
    </template>

    <!-- 数据列表 -->
    <template v-else>
      <view v-for="item in list" :key="item.id">
        {{ item.title }}
      </view>

      <!-- 加载更多骨架屏 -->
      <template v-if="loadingMore">
        <wd-skeleton
          v-for="n in pageSize"
          :key="`more-${n}`"
          :row-col="itemConfig"
          animation="flashed"
          :loading="true"
        />
      </template>

      <view v-if="noMore" class="no-more">没有更多了</view>
    </template>
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const pageSize = 10
const firstLoading = ref(true)
const loadingMore = ref(false)
const noMore = ref(false)
const list = ref([])

const itemConfig = [
  { height: '48rpx', marginBottom: '16rpx' },
  { width: '60%', height: '32rpx' }
]

onMounted(async () => {
  list.value = await loadData(1)
  firstLoading.value = false
})

const onLoadMore = async () => {
  if (loadingMore.value || noMore.value) return
  loadingMore.value = true
  // 加载更多...
  loadingMore.value = false
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| theme | 骨架图风格 | `'text' \| 'avatar' \| 'paragraph' \| 'image'` | `'text'` |
| row-col | 行列配置 | `SkeletonRowCol[]` | `[]` |
| loading | 是否为加载状态 | `boolean` | `true` |
| animation | 动画效果 | `'gradient' \| 'flashed' \| ''` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 加载完成后显示的内容 |

### 类型定义

```typescript
/** 骨架屏行列配置类型 */
type SkeletonRowCol = number | SkeletonRowColObj | Array<SkeletonRowColObj>

/** 骨架屏行列对象配置 */
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
  /** 上外边距 */
  marginTop?: string | number
  /** 下外边距 */
  marginBottom?: string | number
  /** 圆角半径 */
  borderRadius?: string | number
  /** 背景颜色 */
  backgroundColor?: string
  /** 背景色(同 backgroundColor) */
  background?: string
}
```

**配置方式:**

```typescript
// 1. 数字类型：一行默认文本骨架
rowCol: [1, 1, 1]

// 2. 对象类型：单行自定义配置
rowCol: [
  { width: '80%', height: '32rpx' }
]

// 3. 数组类型：多列布局
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
[1, 1, 1, { width: '55%' }]

// image 主题
[
  { type: 'rect', height: '128rpx', width: '128rpx' }
]
```

## 主题定制

### CSS 变量

```scss
$-skeleton-background-color: #f2f3f5;              // 背景色
$-skeleton-row-margin-bottom: 24rpx;               // 行间距
$-skeleton-text-height-default: 32rpx;             // 文本默认高度
$-skeleton-border-radius-text: 8rpx;               // 文本圆角
$-skeleton-rect-height-default: 128rpx;            // 矩形默认高度
$-skeleton-border-radius-rect: 16rpx;              // 矩形圆角
$-skeleton-circle-height-default: 64rpx;           // 圆形默认尺寸
$-skeleton-border-radius-circle: 50%;              // 圆形圆角
```

### 暗黑模式

```scss
.wot-theme-dark {
  .wd-skeleton__col {
    background-color: $-dark-background4;
  }
}
```

### 自定义样式

```scss
:deep(.wd-skeleton) {
  .wd-skeleton__col {
    background-color: #e3f2fd;
  }
}

// 自定义动画速度
:deep(.wd-skeleton--animation-gradient::after) {
  animation-duration: 1s !important;
}
```

## 最佳实践

### 1. 选择合适的主题

```vue
<!-- ✅ 用户信息用 avatar -->
<wd-skeleton theme="avatar" />

<!-- ✅ 文章内容用 paragraph -->
<wd-skeleton theme="paragraph" />

<!-- ✅ 图片加载用 image -->
<wd-skeleton theme="image" />
```

### 2. 骨架屏贴近真实布局

```vue
<!-- ✅ 结构相似 -->
<wd-skeleton
  :row-col="[
    { height: '48rpx' },
    { height: '32rpx' },
    { type: 'rect', height: '200rpx' }
  ]"
/>

<!-- ❌ 结构差异大 -->
<wd-skeleton theme="text" />
```

### 3. 根据加载时间选择动画

```vue
<!-- ✅ 加载时间长用动画 -->
<wd-skeleton animation="gradient" :loading="true" />

<!-- ✅ 加载时间短不用动画 -->
<wd-skeleton :loading="true" />
```

### 4. 配合真实加载状态

```vue
<wd-skeleton :loading="isLoading">
  <view class="content">{{ data }}</view>
</wd-skeleton>

<script setup>
const isLoading = ref(true)

onMounted(async () => {
  data.value = await fetchData()
  isLoading.value = false
})
</script>
```

## 常见问题

### 1. 骨架屏与真实内容高度不一致

**原因:** 骨架屏配置与实际内容结构不匹配

**解决方案:**
```vue
<wd-skeleton
  :row-col="[
    { height: '48rpx' },
    { height: '200rpx' }
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

**原因:** 骨架屏元素过多或低端设备性能不足

**解决方案:**
```vue
<!-- ✅ 减少元素或禁用动画 -->
<wd-skeleton :row-col="[1, 1, 1]" animation="" />
```

### 3. 自定义样式不生效

**原因:** CSS 优先级问题

**解决方案:**
```vue
<wd-skeleton custom-class="custom-skeleton" />

<style>
:deep(.custom-skeleton .wd-skeleton__col) {
  background-color: #e3f2fd !important;
}
</style>
```

### 4. 骨架屏闪现

**原因:** 数据加载很快时骨架屏一闪而过

**解决方案:**
```typescript
const MIN_LOADING_TIME = 500

onMounted(async () => {
  const startTime = Date.now()
  data.value = await fetchData()

  const elapsed = Date.now() - startTime
  if (elapsed < MIN_LOADING_TIME) {
    await new Promise(r => setTimeout(r, MIN_LOADING_TIME - elapsed))
  }

  showSkeleton.value = false
})
```

### 5. 嵌套数组配置无效

**原因:** 嵌套层级过深

**解决方案:**
```vue
<!-- ✅ 正确：最多两层嵌套 -->
<wd-skeleton
  :row-col="[
    [
      { type: 'circle', size: '64rpx' },
      { width: '200rpx', height: '32rpx' }
    ]
  ]"
/>

<!-- ❌ 错误：三层嵌套不支持 -->
<wd-skeleton
  :row-col="[
    [
      [{ width: '100rpx' }]
    ]
  ]"
/>
```

### 6. 动画延迟问题

**原因:** 组件内置 2 秒动画延迟

**解决方案:**
```scss
:deep(.no-delay-skeleton) {
  .wd-skeleton--animation-gradient::after {
    animation-delay: 0s !important;
  }
}
```

## 总结

Skeleton 骨架屏核心要点：

1. **主题选择** - 四种预设主题：text、avatar、paragraph、image
2. **配置方式** - 数字(行数)、对象(单行)、数组(多列)
3. **动画效果** - gradient(渐变)、flashed(闪烁)
4. **布局实现** - 嵌套数组实现多列布局，最多两层
5. **状态控制** - loading 属性控制骨架屏与内容切换
