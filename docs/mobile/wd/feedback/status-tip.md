---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/statusTip
---

# StatusTip 缺省提示

## 介绍

StatusTip 缺省提示组件用于页面中的兜底占位展示，适用于空数据、网络错误、搜索无结果等场景。组件内置多种预设图片，也支持自定义图片和文案，是提升用户体验的重要组件。

**核心特性:**

- **预设图片** - 内置 7 种常用场景的缺省图片（search、network、content、collect、comment、halo、message）
- **自定义图片** - 支持传入自定义图片 URL，满足个性化需求
- **自定义尺寸** - 支持数字、字符串、对象三种格式设置图片尺寸
- **插槽支持** - 支持通过 image 插槽完全自定义图片内容
- **图片模式** - 支持 13 种图片裁剪、缩放模式
- **CDN 配置** - 支持自定义图片路径前缀，可使用自有 CDN
- **暗色主题** - 完美支持暗色主题，自动适配背景和文字颜色
- **TypeScript** - 完整的类型定义，提供良好的开发体验

## 基本用法

### 预设图片

组件内置了 7 种预设图片类型，覆盖常见的空状态场景。

```vue
<template>
  <view class="demo-page">
    <!-- 网络错误 -->
    <view class="demo-item">
      <wd-status-tip image="network" tip="网络异常，请检查网络设置" />
    </view>

    <!-- 搜索无结果 -->
    <view class="demo-item">
      <wd-status-tip image="search" tip="抱歉，没有找到相关内容" />
    </view>

    <!-- 内容为空 -->
    <view class="demo-item">
      <wd-status-tip image="content" tip="暂无内容" />
    </view>

    <!-- 收藏为空 -->
    <view class="demo-item">
      <wd-status-tip image="collect" tip="暂无收藏" />
    </view>

    <!-- 评论为空 -->
    <view class="demo-item">
      <wd-status-tip image="comment" tip="暂无评论" />
    </view>

    <!-- 通用缺省 -->
    <view class="demo-item">
      <wd-status-tip image="halo" tip="暂无数据" />
    </view>

    <!-- 消息为空 -->
    <view class="demo-item">
      <wd-status-tip image="message" tip="暂无消息" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo-page {
  padding: 32rpx;
}

.demo-item {
  margin-bottom: 40rpx;
  background-color: #f8f8f8;
  border-radius: 16rpx;
}
</style>
```

**预设图片说明:**

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `network` | 网络错误 | 网络请求失败、断网、服务器异常 |
| `search` | 搜索无结果 | 搜索结果为空、筛选无匹配 |
| `content` | 内容为空 | 列表为空、文章为空 |
| `collect` | 收藏为空 | 收藏列表为空、关注为空 |
| `comment` | 评论为空 | 评论列表为空、留言为空 |
| `halo` | 通用缺省 | 通用空状态、默认缺省 |
| `message` | 消息为空 | 消息列表为空、通知为空 |

### 自定义图片

传入图片 URL 使用自定义图片，支持网络图片和本地图片。

```vue
<template>
  <view class="demo-page">
    <!-- 网络图片 -->
    <wd-status-tip
      image="https://example.com/custom-empty.png"
      tip="自定义网络图片"
    />

    <!-- 本地图片 -->
    <wd-status-tip
      image="/static/images/empty-custom.png"
      tip="自定义本地图片"
    />

    <!-- Base64 图片 -->
    <wd-status-tip
      :image="base64Image"
      tip="Base64 编码图片"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const base64Image = ref('data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...')
</script>
```

**图片来源说明:**

- **网络图片**: 以 `http://` 或 `https://` 开头的完整 URL
- **本地图片**: 以 `/static/` 开头的静态资源路径
- **Base64**: 以 `data:image/` 开头的 Base64 编码图片
- **预设类型**: 使用内置的 7 种预设类型名称

### 自定义图片尺寸

通过 `image-size` 设置图片尺寸，支持三种格式。

```vue
<template>
  <view class="demo-page">
    <!-- 数字格式：同时设置宽高，单位为 px -->
    <wd-status-tip
      image="network"
      tip="200px 正方形"
      :image-size="200"
    />

    <!-- 字符串格式：支持 rpx、px、% 等单位 -->
    <wd-status-tip
      image="network"
      tip="400rpx 正方形"
      image-size="400rpx"
    />

    <!-- 对象格式：分别设置宽高 -->
    <wd-status-tip
      image="network"
      tip="宽300高200"
      :image-size="{ width: 300, height: 200 }"
    />

    <!-- 对象格式带单位 -->
    <wd-status-tip
      image="network"
      tip="宽50%高240rpx"
      :image-size="{ width: '50%', height: '240rpx' }"
    />
  </view>
</template>
```

**尺寸格式说明:**

| 格式 | 示例 | 说明 |
|------|------|------|
| 数字 | `:image-size="200"` | 同时设置宽高为 200px |
| 字符串 | `image-size="400rpx"` | 同时设置宽高为 400rpx |
| 对象 | `:image-size="{ width: 300, height: 200 }"` | 分别设置宽高 |

### 自定义图片内容

通过 `image` 插槽自定义图片内容，可以使用图标、Lottie 动画等。

```vue
<template>
  <view class="demo-page">
    <!-- 使用图标 -->
    <wd-status-tip tip="加载失败">
      <template #image>
        <wd-icon name="warning-fill" size="120" color="#ff976a" />
      </template>
    </wd-status-tip>

    <!-- 使用 emoji -->
    <wd-status-tip tip="暂无数据">
      <template #image>
        <view class="emoji-icon">📭</view>
      </template>
    </wd-status-tip>

    <!-- 使用自定义组件 -->
    <wd-status-tip tip="正在加载...">
      <template #image>
        <wd-loading size="80px" />
      </template>
    </wd-status-tip>

    <!-- 使用 Lottie 动画 -->
    <wd-status-tip tip="搜索中...">
      <template #image>
        <lottie-animation
          src="/static/lottie/searching.json"
          :width="200"
          :height="200"
        />
      </template>
    </wd-status-tip>
  </view>
</template>

<style lang="scss" scoped>
.emoji-icon {
  font-size: 120rpx;
  text-align: center;
}
</style>
```

### 图片裁剪模式

通过 `image-mode` 设置图片的裁剪、缩放模式，支持 13 种模式。

```vue
<template>
  <view class="demo-page">
    <!-- 保持纵横比缩放，完整显示图片 -->
    <wd-status-tip
      image="network"
      tip="aspectFit 模式"
      image-mode="aspectFit"
    />

    <!-- 保持纵横比缩放，填满容器 -->
    <wd-status-tip
      image="network"
      tip="aspectFill 模式（默认）"
      image-mode="aspectFill"
    />

    <!-- 宽度不变，高度自动 -->
    <wd-status-tip
      image="network"
      tip="widthFix 模式"
      image-mode="widthFix"
    />

    <!-- 居中显示，不缩放 -->
    <wd-status-tip
      image="network"
      tip="center 模式"
      image-mode="center"
    />
  </view>
</template>
```

**图片模式说明:**

| 模式 | 说明 |
|------|------|
| `scaleToFill` | 缩放模式，不保持纵横比缩放图片，使图片的宽高完全拉伸至填满 image 元素 |
| `aspectFit` | 缩放模式，保持纵横比缩放图片，使图片的长边能完全显示出来 |
| `aspectFill` | 缩放模式，保持纵横比缩放图片，只保证图片的短边能完全显示出来（默认） |
| `widthFix` | 缩放模式，宽度不变，高度自动变化，保持原图宽高比不变 |
| `heightFix` | 缩放模式，高度不变，宽度自动变化，保持原图宽高比不变 |
| `top` | 裁剪模式，不缩放图片，只显示图片的顶部区域 |
| `bottom` | 裁剪模式，不缩放图片，只显示图片的底部区域 |
| `center` | 裁剪模式，不缩放图片，只显示图片的中间区域 |
| `left` | 裁剪模式，不缩放图片，只显示图片的左边区域 |
| `right` | 裁剪模式，不缩放图片，只显示图片的右边区域 |
| `top left` | 裁剪模式，不缩放图片，只显示图片的左上边区域 |
| `top right` | 裁剪模式，不缩放图片，只显示图片的右上边区域 |
| `bottom left` | 裁剪模式，不缩放图片，只显示图片的左下边区域 |
| `bottom right` | 裁剪模式，不缩放图片，只显示图片的右下边区域 |

### 自定义图片路径前缀

通过 `url-prefix` 自定义预设图片的路径前缀，可以使用自有 CDN。

```vue
<template>
  <view class="demo-page">
    <!-- 使用自有 CDN -->
    <wd-status-tip
      image="network"
      tip="使用自有 CDN"
      url-prefix="https://cdn.example.com/status-images/"
    />

    <!-- 使用本地静态资源 -->
    <wd-status-tip
      image="network"
      tip="使用本地资源"
      url-prefix="/static/status/"
    />
  </view>
</template>
```

**CDN 配置说明:**

- 默认使用 npmmirror CDN：`https://registry.npmmirror.com/wot-design-uni-assets/*/files/`
- 自定义 CDN 时，图片文件名需要与预设类型对应（如 `network.png`、`search.png`）
- 图片格式统一为 PNG

### 暗色主题

组件自动适配暗色主题，无需额外配置。

```vue
<template>
  <view class="demo-page" :class="{ 'wot-theme-dark': isDark }">
    <wd-status-tip image="content" tip="暂无数据" />

    <wd-button @click="toggleTheme">
      切换主题：{{ isDark ? '暗色' : '亮色' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>
```

**暗色主题样式:**

- 背景色自动切换为暗色背景 `$-dark-background2`
- 文字颜色自动切换为暗色文字 `$-dark-color3`

## 高级用法

### 结合操作按钮

StatusTip 通常需要配合操作按钮使用，让用户可以重试或进行其他操作。

```vue
<template>
  <view class="status-container">
    <wd-status-tip image="network" tip="网络连接失败，请检查网络设置" />
    <view class="action-buttons">
      <wd-button type="primary" size="medium" @click="handleRetry">
        重新加载
      </wd-button>
      <wd-button size="medium" @click="handleGoHome">
        返回首页
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleRetry = () => {
  // 重新加载逻辑
  uni.showLoading({ title: '加载中...' })
  setTimeout(() => {
    uni.hideLoading()
    // 重新请求数据
  }, 1500)
}

const handleGoHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
}
</style>
```

### 动态状态切换

根据加载状态动态显示不同的缺省提示。

```vue
<template>
  <view class="page-container">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <wd-loading size="60px" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 加载失败 -->
    <template v-else-if="error">
      <wd-status-tip image="network" :tip="error" />
      <wd-button type="primary" @click="loadData">重试</wd-button>
    </template>

    <!-- 数据为空 -->
    <template v-else-if="list.length === 0">
      <wd-status-tip image="content" tip="暂无数据" />
      <wd-button type="primary" @click="loadData">刷新</wd-button>
    </template>

    <!-- 正常显示数据 -->
    <template v-else>
      <view v-for="item in list" :key="item.id" class="list-item">
        {{ item.title }}
      </view>
    </template>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface ListItem {
  id: number
  title: string
}

const loading = ref(false)
const error = ref('')
const list = ref<ListItem[]>([])

const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    // 模拟 API 请求
    const response = await fetchData()
    list.value = response.data
  } catch (err: any) {
    error.value = err.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const fetchData = () => {
  return new Promise<{ data: ListItem[] }>((resolve, reject) => {
    setTimeout(() => {
      // 模拟成功或失败
      if (Math.random() > 0.3) {
        resolve({ data: [{ id: 1, title: '数据项 1' }] })
      } else {
        reject(new Error('网络请求失败'))
      }
    }, 1000)
  })
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.loading-text {
  color: #909399;
  font-size: 28rpx;
}

.list-item {
  width: 100%;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}
</style>
```

### 分页列表空状态

在分页列表中使用，区分首页为空和加载更多为空的情况。

```vue
<template>
  <scroll-view
    class="list-container"
    scroll-y
    @scrolltolower="loadMore"
  >
    <!-- 列表内容 -->
    <view v-for="item in list" :key="item.id" class="list-item">
      {{ item.title }}
    </view>

    <!-- 首页为空 -->
    <wd-status-tip
      v-if="list.length === 0 && !loading"
      image="content"
      tip="暂无数据"
    />

    <!-- 加载更多状态 -->
    <view v-if="list.length > 0" class="load-more">
      <wd-loading v-if="loadingMore" size="40px" />
      <text v-else-if="noMore" class="no-more-text">没有更多了</text>
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const list = ref<any[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const noMore = ref(false)
const page = ref(1)

const loadMore = async () => {
  if (loadingMore.value || noMore.value) return

  loadingMore.value = true
  page.value++

  try {
    const newData = await fetchPage(page.value)
    if (newData.length === 0) {
      noMore.value = true
    } else {
      list.value.push(...newData)
    }
  } finally {
    loadingMore.value = false
  }
}

const fetchPage = (pageNum: number) => {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      if (pageNum > 3) {
        resolve([])
      } else {
        resolve([
          { id: pageNum * 10 + 1, title: `第 ${pageNum} 页数据 1` },
          { id: pageNum * 10 + 2, title: `第 ${pageNum} 页数据 2` },
        ])
      }
    }, 1000)
  })
}
</script>
```

### 搜索结果空状态

搜索场景的空状态处理。

```vue
<template>
  <view class="search-page">
    <!-- 搜索栏 -->
    <wd-search
      v-model="keyword"
      placeholder="搜索商品"
      @search="handleSearch"
      @clear="handleClear"
    />

    <!-- 搜索结果 -->
    <view class="search-result">
      <!-- 未搜索时的推荐 -->
      <template v-if="!hasSearched">
        <view class="section-title">热门搜索</view>
        <view class="hot-tags">
          <wd-tag
            v-for="tag in hotTags"
            :key="tag"
            @click="searchByTag(tag)"
          >
            {{ tag }}
          </wd-tag>
        </view>
      </template>

      <!-- 搜索中 -->
      <template v-else-if="searching">
        <wd-loading size="60px" />
      </template>

      <!-- 搜索无结果 -->
      <template v-else-if="searchResult.length === 0">
        <wd-status-tip
          image="search"
          :tip="`没有找到"${keyword}"相关内容`"
        />
        <view class="search-suggestion">
          <text class="suggestion-title">搜索建议：</text>
          <text class="suggestion-item">• 检查输入是否正确</text>
          <text class="suggestion-item">• 尝试使用其他关键词</text>
          <text class="suggestion-item">• 减少筛选条件</text>
        </view>
      </template>

      <!-- 搜索结果列表 -->
      <template v-else>
        <view
          v-for="item in searchResult"
          :key="item.id"
          class="result-item"
        >
          {{ item.name }}
        </view>
      </template>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const keyword = ref('')
const hasSearched = ref(false)
const searching = ref(false)
const searchResult = ref<any[]>([])
const hotTags = ref(['手机', '电脑', '耳机', '相机', '手表'])

const handleSearch = async () => {
  if (!keyword.value.trim()) return

  hasSearched.value = true
  searching.value = true
  searchResult.value = []

  try {
    // 模拟搜索
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // 模拟无结果
    searchResult.value = []
  } finally {
    searching.value = false
  }
}

const handleClear = () => {
  hasSearched.value = false
  searchResult.value = []
}

const searchByTag = (tag: string) => {
  keyword.value = tag
  handleSearch()
}
</script>

<style lang="scss" scoped>
.search-page {
  padding: 32rpx;
}

.search-result {
  margin-top: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 24rpx;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.search-suggestion {
  margin-top: 32rpx;
  padding: 24rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
}

.suggestion-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.suggestion-item {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| image | 缺省图片类型或图片 URL | `'search' \| 'network' \| 'content' \| 'collect' \| 'comment' \| 'halo' \| 'message' \| string` | `'network'` |
| image-size | 图片大小，支持数字、字符串、对象格式 | `string \| number \| ImageSize` | - |
| tip | 提示文案 | `string` | - |
| image-mode | 图片裁剪、缩放模式 | `ImageMode` | `'aspectFill'` |
| url-prefix | 图片路径前缀，用于自定义 CDN | `string` | CDN 地址 |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Slots

| 名称 | 说明 |
|------|------|
| image | 自定义图片内容，使用此插槽时 image 属性无效 |

### 预设图片类型

| 类型 | 说明 | 建议使用场景 |
|------|------|--------------|
| `search` | 搜索无结果 | 搜索页面、筛选无结果 |
| `network` | 网络错误 | 网络请求失败、断网 |
| `content` | 内容为空 | 列表为空、详情为空 |
| `collect` | 收藏为空 | 收藏夹为空、关注列表 |
| `comment` | 评论为空 | 评论区为空、留言板 |
| `halo` | 通用缺省 | 其他空状态场景 |
| `message` | 消息为空 | 消息中心、通知列表 |

## 类型定义

### ImageSize

```typescript
/**
 * 图片尺寸配置
 */
interface ImageSize {
  /** 宽度，支持数字（单位 px）或字符串（带单位） */
  width: number | string
  /** 高度，支持数字（单位 px）或字符串（带单位） */
  height: number | string
}
```

### ImageMode

```typescript
/**
 * 图片裁剪、缩放模式
 */
type ImageMode =
  | 'scaleToFill'   // 不保持纵横比缩放，拉伸填满
  | 'aspectFit'     // 保持纵横比，完整显示
  | 'aspectFill'    // 保持纵横比，填满容器（默认）
  | 'widthFix'      // 宽度不变，高度自动
  | 'heightFix'     // 高度不变，宽度自动
  | 'top'           // 顶部区域
  | 'bottom'        // 底部区域
  | 'center'        // 中间区域
  | 'left'          // 左边区域
  | 'right'         // 右边区域
  | 'top left'      // 左上区域
  | 'top right'     // 右上区域
  | 'bottom left'   // 左下区域
  | 'bottom right'  // 右下区域
```

### WdStatusTipProps

```typescript
/**
 * StatusTip 组件属性
 */
interface WdStatusTipProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 缺省图片类型或图片 URL */
  image?: 'search' | 'network' | 'content' | 'collect' | 'comment' | 'halo' | 'message' | string
  /** 图片大小 */
  imageSize?: string | number | ImageSize
  /** 提示文案 */
  tip?: string
  /** 图片裁剪、缩放模式 */
  imageMode?: ImageMode
  /** 图片路径前缀 */
  urlPrefix?: string
}
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `--wd-statustip-padding` | 内边距 | `64rpx 0` |
| `--wd-statustip-fs` | 文字大小 | `28rpx` |
| `--wd-statustip-color` | 文字颜色 | `#909399` |
| `--wd-statustip-line-height` | 文字行高 | `40rpx` |

### 自定义主题示例

```vue
<template>
  <view class="custom-status-tip">
    <wd-status-tip image="content" tip="暂无数据" />
  </view>
</template>

<style lang="scss" scoped>
.custom-status-tip {
  --wd-statustip-padding: 100rpx 32rpx;
  --wd-statustip-fs: 32rpx;
  --wd-statustip-color: #606266;
  --wd-statustip-line-height: 48rpx;
}
</style>
```

## 最佳实践

### 1. 根据场景选择合适的预设图片

```vue
<script lang="ts" setup>
// ✅ 推荐：根据具体场景选择
// 网络错误用 network
<wd-status-tip image="network" tip="网络异常" />

// 搜索无结果用 search
<wd-status-tip image="search" tip="搜索无结果" />

// ❌ 不推荐：所有场景都用 halo
<wd-status-tip image="halo" tip="网络异常" />
</script>
```

### 2. 配合操作按钮提供解决方案

```vue
<template>
  <!-- ✅ 推荐：提供操作按钮 -->
  <view class="status-wrapper">
    <wd-status-tip image="network" tip="网络连接失败" />
    <wd-button type="primary" @click="retry">重新加载</wd-button>
  </view>

  <!-- ❌ 不推荐：只显示错误信息，不提供解决方案 -->
  <wd-status-tip image="network" tip="网络连接失败" />
</template>
```

### 3. 提示文案要具体明确

```vue
<script lang="ts" setup>
// ✅ 推荐：具体明确的提示
<wd-status-tip image="network" tip="网络连接失败，请检查 WiFi 或移动数据" />
<wd-status-tip image="search" :tip="`没有找到"${keyword}"相关商品`" />

// ❌ 不推荐：模糊的提示
<wd-status-tip image="network" tip="错误" />
<wd-status-tip image="search" tip="无结果" />
</script>
```

### 4. 合理设置图片尺寸

```vue
<template>
  <!-- ✅ 推荐：适中的图片尺寸 -->
  <wd-status-tip image="content" tip="暂无数据" :image-size="280" />

  <!-- ❌ 不推荐：图片过大或过小 -->
  <wd-status-tip image="content" tip="暂无数据" :image-size="500" />
  <wd-status-tip image="content" tip="暂无数据" :image-size="80" />
</template>
```

### 5. 避免页面多处显示缺省提示

```vue
<template>
  <!-- ✅ 推荐：页面只有一个主要的缺省提示 -->
  <view class="page">
    <wd-status-tip v-if="isEmpty" image="content" tip="暂无数据" />
    <view v-else>正常内容</view>
  </view>

  <!-- ❌ 不推荐：多个区块各自显示缺省提示 -->
  <view class="page">
    <wd-status-tip image="content" tip="区块1为空" />
    <wd-status-tip image="content" tip="区块2为空" />
    <wd-status-tip image="content" tip="区块3为空" />
  </view>
</template>
```

## 常见问题

### 1. 如何更换预设图片？

可以通过 `url-prefix` 属性更换预设图片的路径前缀，图片文件名需要与预设类型对应。

```vue
<template>
  <!-- 使用自有 CDN，图片命名需要是 network.png、search.png 等 -->
  <wd-status-tip
    image="network"
    tip="网络异常"
    url-prefix="https://cdn.example.com/images/status/"
  />
</template>
```

### 2. 自定义图片不显示？

**可能原因:**
- 图片 URL 不正确
- 图片不支持跨域访问
- 图片格式不支持
- 网络问题

**解决方案:**

```vue
<template>
  <!-- 1. 检查 URL 是否正确 -->
  <wd-status-tip
    image="https://example.com/image.png"
    tip="确保 URL 可访问"
  />

  <!-- 2. 使用本地图片 -->
  <wd-status-tip
    image="/static/images/empty.png"
    tip="使用本地图片"
  />

  <!-- 3. 使用插槽自定义 -->
  <wd-status-tip tip="使用插槽">
    <template #image>
      <image src="/static/images/empty.png" mode="aspectFit" />
    </template>
  </wd-status-tip>
</template>
```

### 3. 如何添加操作按钮？

组件本身不包含按钮，需要在组件外部添加。

```vue
<template>
  <view class="status-wrapper">
    <wd-status-tip image="network" tip="网络异常" />
    <view class="button-group">
      <wd-button type="primary" @click="retry">重试</wd-button>
      <wd-button @click="goBack">返回</wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.status-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-group {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
}
</style>
```

### 4. 如何居中显示？

组件默认水平居中，如需垂直居中，需设置父容器样式。

```vue
<template>
  <view class="center-container">
    <wd-status-tip image="content" tip="暂无数据" />
  </view>
</template>

<style lang="scss" scoped>
.center-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

### 5. 暗色主题下图片不适配？

预设图片已适配暗色主题。如果使用自定义图片，需要准备暗色版本。

```vue
<template>
  <wd-status-tip
    :image="isDark ? '/static/empty-dark.png' : '/static/empty-light.png'"
    tip="暂无数据"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
</script>
```

### 6. 如何在列表中使用？

在列表组件中，通常在数据为空时显示缺省提示。

```vue
<template>
  <view class="list-page">
    <!-- 有数据时显示列表 -->
    <template v-if="list.length > 0">
      <view v-for="item in list" :key="item.id" class="list-item">
        {{ item.title }}
      </view>
    </template>

    <!-- 无数据时显示缺省提示 -->
    <wd-status-tip v-else image="content" tip="暂无数据" />
  </view>
</template>
```

## 总结

StatusTip 缺省提示组件是提升用户体验的重要组件，核心要点：

1. **选择合适的预设图片** - 根据具体场景选择对应的预设类型
2. **提供明确的提示文案** - 告诉用户发生了什么，以及如何解决
3. **配合操作按钮** - 提供重试、返回等操作入口
4. **合理设置尺寸** - 图片尺寸适中，不要过大或过小
5. **支持暗色主题** - 组件自动适配暗色主题
6. **自定义扩展** - 通过插槽和 CSS 变量实现个性化定制
