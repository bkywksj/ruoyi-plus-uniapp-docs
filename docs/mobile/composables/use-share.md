# useShare 分享功能

## 介绍

`useShare` 是小程序分享功能组合函数，采用页面级单例模式实现。支持微信小程序、支付宝小程序等多平台的分享功能，同一页面内共享分享状态，不同页面间隔离状态。

**核心特性:**

- **多平台支持** - 支持微信、支付宝、百度、QQ小程序等多平台
- **页面级单例** - 同一页面内多个组件共享同一个分享实例
- **动态配置** - 支持动态设置分享标题、图片、路径等
- **朋友圈分享** - 支持配置是否允许分享到朋友圈
- **自动参数** - 自动携带用户ID等参数，支持分销追踪

## 基本用法

### 基础使用

在页面中使用 `useShare` 启用分享功能：

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

// 使用默认配置
const { handleShareAppMessage, handleShareTimeline } = useShare()

// 暴露分享方法给页面
defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
</script>
```

### 自定义分享配置

通过传入配置对象自定义分享内容：

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

const { handleShareAppMessage, handleShareTimeline } = useShare({
  title: '精彩内容等你发现',
  imageUrl: '/static/share-cover.png',
  enableTimeline: true, // 允许分享到朋友圈
})

defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
</script>
```

### 动态设置分享数据

根据接口返回的数据动态设置分享内容：

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'
import { onMounted } from 'vue'

const { setShareData, handleShareAppMessage, handleShareTimeline } = useShare()

onMounted(async () => {
  // 获取商品详情
  const product = await fetchProductDetail(productId)

  // 动态设置分享数据
  setShareData({
    title: product.name,
    imageUrl: product.coverImage,
    extraParams: {
      productId: product.id,
      source: 'share'
    }
  })
})

defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
</script>
```

### 主动触发分享

通过按钮点击主动触发系统分享菜单：

```vue
<template>
  <wd-button @click="onShareClick">分享给好友</wd-button>
</template>

<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

const { triggerShare } = useShare()

const onShareClick = () => {
  triggerShare()
}
</script>
```

### 检查朋友圈分享权限

判断当前页面是否允许分享到朋友圈：

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

const { canShareToTimeline } = useShare()

// 检查是否可以分享到朋友圈
if (canShareToTimeline()) {
  console.log('当前页面允许分享到朋友圈')
} else {
  console.log('当前页面不允许分享到朋友圈')
}
</script>
```

### 重置分享配置

将分享配置重置为默认值：

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

const { resetShareConfig } = useShare()

// 在某些场景下重置分享配置
const handleReset = () => {
  resetShareConfig()
}
</script>
```

## 分享配置

### 页面分享配置

可以在组件内部的 `PAGE_SHARE_CONFIG` 中预设各页面的分享配置：

```typescript
const PAGE_SHARE_CONFIG: Record<string, PageShareConfig> = {
  // 首页配置
  '/pages/index/index': {
    title: '首页',
    imageUrl: '',
    enableTimeline: true,
  },
  // 产品详情页配置
  '/pages/product/detail': {
    title: '产品详情',
    imageUrl: '',
    enableTimeline: true,
  },
  // 用户中心 - 私密页面，不允许分享到朋友圈
  '/pages/user/profile': {
    title: '个人中心',
    imageUrl: '',
    enableTimeline: false,
  },
}
```

### 默认分享配置

当页面没有自定义配置时使用默认配置：

```typescript
const DEFAULT_SHARE: ShareConfig = {
  title: '发现更多精彩',
  path: '/pages/index/index',
  imageUrl: '',
}
```

## API

### useShare 参数

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customConfig | 自定义页面分享配置 | `PageShareConfig` | - |

### useShare 返回值

| 属性/方法 | 说明 | 类型 |
|-----------|------|------|
| shareConfig | 当前分享配置（只读） | `Readonly<Ref<ShareConfig>>` |
| pageConfig | 页面配置（只读） | `Readonly<Ref<PageShareConfig>>` |
| setShareData | 动态设置分享数据 | `(data: ShareData) => void` |
| triggerShare | 主动触发分享菜单 | `() => void` |
| resetShareConfig | 重置分享配置 | `() => void` |
| canShareToTimeline | 检查是否支持朋友圈分享 | `() => boolean` |
| handleShareAppMessage | 处理分享到好友 | `() => ShareEventResult` |
| handleShareTimeline | 处理分享到朋友圈 | `() => ShareEventResult \| null` |

### 类型定义

```typescript
/**
 * 分享配置接口
 */
interface ShareConfig {
  /** 分享标题 */
  title: string
  /** 分享路径，包含参数 */
  path: string
  /** 分享图片地址 */
  imageUrl: string
}

/**
 * 页面分享配置接口
 */
interface PageShareConfig {
  /** 页面分享标题 */
  title?: string
  /** 页面分享图片 */
  imageUrl?: string
  /** 是否允许分享到朋友圈 */
  enableTimeline?: boolean
}

/**
 * 动态设置分享数据的接口
 */
interface ShareData {
  /** 动态标题 */
  title?: string
  /** 动态图片 */
  imageUrl?: string
  /** 额外的路径参数 */
  extraParams?: Record<string, any>
  /** 是否覆盖现有路径 */
  overridePath?: boolean
}

/**
 * 分享事件回调参数
 */
interface ShareEventResult {
  title: string
  path: string
  imageUrl?: string
}
```

## 平台适配

### 微信小程序

```typescript
// 微信小程序分享菜单配置
uni.showShareMenu({
  withShareTicket: true,
  menus: ['shareAppMessage', 'shareTimeline']
})
```

### 支付宝小程序

```typescript
// 支付宝小程序分享面板
my.showSharePanel({
  title: shareConfig.value.title,
  content: shareConfig.value.title,
  url: shareConfig.value.path,
})
```

### 百度小程序

```typescript
// 百度小程序分享
swan.openShare({
  title: shareConfig.value.title,
  content: shareConfig.value.title,
  imageUrl: shareConfig.value.imageUrl,
  path: shareConfig.value.path,
})
```

### QQ小程序

```typescript
// QQ小程序分享菜单
qq.showShareMenu({
  showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment'],
})
```

## 最佳实践

### 1. 商品分享带参数

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'
import { onLoad } from '@dcloudio/uni-app'

const { setShareData, handleShareAppMessage, handleShareTimeline } = useShare()

onLoad(async (options) => {
  const productId = options?.id
  if (productId) {
    const product = await getProductDetail(productId)

    setShareData({
      title: `【推荐】${product.name}`,
      imageUrl: product.mainImage,
      extraParams: {
        id: productId,
        inviteCode: 'ABC123'
      }
    })
  }
})

defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
</script>
```

### 2. 文章分享

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

const { setShareData } = useShare({
  enableTimeline: true
})

// 文章加载完成后设置分享
const onArticleLoaded = (article: Article) => {
  setShareData({
    title: article.title,
    imageUrl: article.cover || '/static/default-article.png',
    extraParams: {
      articleId: article.id
    }
  })
}
</script>
```

### 3. 私密页面禁止朋友圈分享

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

// 订单详情页 - 禁止分享到朋友圈
const { handleShareAppMessage, handleShareTimeline } = useShare({
  title: '订单详情',
  enableTimeline: false
})

defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
</script>
```

## 常见问题

### 1. 分享参数丢失？

确保在 `setShareData` 中正确设置了 `extraParams`：

```typescript
setShareData({
  title: '分享标题',
  extraParams: {
    id: '123',
    source: 'share'
  }
})
```

### 2. 朋友圈分享不显示？

检查 `enableTimeline` 是否设置为 `true`，以及页面配置中是否允许朋友圈分享。

### 3. 多个组件共享状态？

`useShare` 采用页面级单例模式，同一页面内多次调用返回相同实例，共享分享状态。

### 4. 自动携带用户ID？

分享时会自动在参数中添加 `pid`（用户ID），用于分销追踪：

```typescript
// 自动构建分享参数
const buildShareParams = (baseParams, extraParams, overridePath) => {
  const userId = userStore.userInfo?.userId
  return {
    ...finalBaseParams,
    ...extraParams,
    ...(userId && { pid: userId })
  }
}
```
