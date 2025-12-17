---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/statusTip
---

# StatusTip 缺省提示

## 介绍

StatusTip 缺省提示组件用于页面中的兜底占位展示,适用于空数据、网络错误、搜索无结果等场景。组件内置多种预设图片,也支持自定义图片和文案。

**核心特性:**

- **预设图片** - 内置多种常用场景的缺省图片
- **自定义图片** - 支持传入自定义图片 URL
- **自定义尺寸** - 支持自定义图片尺寸
- **插槽支持** - 支持通过插槽自定义图片内容

## 基本用法

### 预设图片

组件内置了多种预设图片类型。

```vue
<template>
  <!-- 网络错误 -->
  <wd-status-tip image="network" tip="网络异常，请检查网络设置" />

  <!-- 搜索无结果 -->
  <wd-status-tip image="search" tip="抱歉，没有找到相关内容" />

  <!-- 内容为空 -->
  <wd-status-tip image="content" tip="暂无内容" />

  <!-- 收藏为空 -->
  <wd-status-tip image="collect" tip="暂无收藏" />

  <!-- 评论为空 -->
  <wd-status-tip image="comment" tip="暂无评论" />

  <!-- 通用缺省 -->
  <wd-status-tip image="halo" tip="暂无数据" />

  <!-- 消息为空 -->
  <wd-status-tip image="message" tip="暂无消息" />
</template>
```

### 自定义图片

传入图片 URL 使用自定义图片。

```vue
<template>
  <wd-status-tip
    image="https://example.com/empty.png"
    tip="自定义缺省图片"
  />
</template>
```

### 自定义图片尺寸

通过 `image-size` 设置图片尺寸。

```vue
<template>
  <!-- 数字格式(同时设置宽高) -->
  <wd-status-tip image="network" tip="网络异常" :image-size="200" />

  <!-- 字符串格式 -->
  <wd-status-tip image="network" tip="网络异常" image-size="400rpx" />

  <!-- 对象格式(分别设置宽高) -->
  <wd-status-tip
    image="network"
    tip="网络异常"
    :image-size="{ width: 300, height: 200 }"
  />
</template>
```

### 自定义图片内容

通过 `image` 插槽自定义图片内容。

```vue
<template>
  <wd-status-tip tip="加载失败">
    <template #image>
      <wd-icon name="warning-fill" size="120" color="#ff976a" />
    </template>
  </wd-status-tip>
</template>
```

### 图片裁剪模式

通过 `image-mode` 设置图片的裁剪、缩放模式。

```vue
<template>
  <wd-status-tip
    image="network"
    tip="网络异常"
    image-mode="aspectFit"
  />
</template>
```

### 自定义图片路径前缀

通过 `url-prefix` 自定义预设图片的路径前缀。

```vue
<template>
  <wd-status-tip
    image="network"
    tip="网络异常"
    url-prefix="https://your-cdn.com/images/"
  />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| image | 缺省图片类型或图片 URL | `'search' \| 'network' \| 'content' \| 'collect' \| 'comment' \| 'halo' \| 'message' \| string` | `network` |
| image-size | 图片大小 | `string \| number \| { width: string \| number, height: string \| number }` | - |
| tip | 提示文案 | `string` | - |
| image-mode | 图片裁剪、缩放模式 | `string` | `aspectFill` |
| url-prefix | 图片路径前缀 | `string` | CDN 地址 |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Slots

| 名称 | 说明 |
|------|------|
| image | 自定义图片内容 |

### 预设图片类型

| 类型 | 说明 |
|------|------|
| search | 搜索无结果 |
| network | 网络错误 |
| content | 内容为空 |
| collect | 收藏为空 |
| comment | 评论为空 |
| halo | 通用缺省 |
| message | 消息为空 |

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-statustip-padding | 内边距 | `64rpx 0` |
| --wd-statustip-fs | 文字大小 | `28rpx` |
| --wd-statustip-color | 文字颜色 | `#909399` |
| --wd-statustip-line-height | 文字行高 | `40rpx` |

## 最佳实践

### 1. 列表空状态

```vue
<template>
  <view class="list-page">
    <template v-if="list.length > 0">
      <view v-for="item in list" :key="item.id">{{ item.title }}</view>
    </template>
    <wd-status-tip v-else image="content" tip="暂无数据">
      <template #image>
        <view class="empty-icon">📭</view>
      </template>
    </wd-status-tip>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const list = ref([])
</script>
```

### 2. 网络错误页面

```vue
<template>
  <view class="error-page">
    <wd-status-tip image="network" tip="网络连接失败，请检查网络设置" />
    <wd-button type="primary" @click="retry">重新加载</wd-button>
  </view>
</template>

<script lang="ts" setup>
const retry = () => {
  // 重新加载逻辑
}
</script>
```

### 3. 搜索无结果

```vue
<template>
  <view class="search-result">
    <template v-if="searchResult.length > 0">
      <!-- 搜索结果列表 -->
    </template>
    <wd-status-tip
      v-else
      image="search"
      :tip="`没有找到"${keyword}"相关内容`"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const keyword = ref('关键词')
const searchResult = ref([])
</script>
```

## 常见问题

### 1. 如何更换预设图片?

可以通过 `url-prefix` 属性更换预设图片的路径前缀,图片文件名需要与预设类型对应(如 `network.png`)。

### 2. 自定义图片不显示?

检查图片 URL 是否正确,以及图片是否支持跨域访问。

### 3. 如何添加操作按钮?

可以在组件外部添加按钮:

```vue
<template>
  <view class="status-page">
    <wd-status-tip image="network" tip="网络异常" />
    <wd-button @click="retry">重试</wd-button>
  </view>
</template>
```

### 4. 如何居中显示?

组件默认会占满容器宽度并居中显示。如需垂直居中,可以设置父容器:

```vue
<template>
  <view class="center-container">
    <wd-status-tip image="content" tip="暂无数据" />
  </view>
</template>

<style>
.center-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```
