# 分享插件

## 介绍

分享插件是 RuoYi-Plus-UniApp 框架的小程序分享功能封装，提供了跨平台的统一分享解决方案。该插件基于 Composable 组合式函数模式设计，采用页面级单例模式，支持微信小程序、支付宝小程序、百度小程序、QQ小程序等多个平台。

**核心特性：**

- **多平台支持** - 支持微信、支付宝、百度、QQ等主流小程序平台
- **页面级单例** - 同一页面内多个组件共享同一个分享实例，不同页面间状态隔离
- **动态配置** - 支持根据接口数据动态设置分享标题、图片和路径参数
- **朋友圈分享** - 支持微信朋友圈分享，可按页面配置是否允许
- **自动携带参数** - 自动携带当前页面参数和用户邀请ID，支持分销溯源
- **生命周期集成** - 自动绑定 `onShareAppMessage` 和 `onShareTimeline` 生命周期
- **主动触发分享** - 支持通过自定义按钮主动触发系统分享菜单

## 基本用法

### 引入与初始化

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

// 使用默认配置
const {
  shareConfig,          // 当前分享配置（只读）
  pageConfig,           // 页面配置（只读）
  setShareData,         // 动态设置分享数据
  triggerShare,         // 主动触发分享
  resetShareConfig,     // 重置分享配置
  canShareToTimeline,   // 检查是否支持朋友圈分享
  handleShareAppMessage,// 处理分享到好友
  handleShareTimeline,  // 处理分享到朋友圈
} = useShare()
</script>
```

**初始化说明：**

- `useShare()` 会在 `onLoad` 时自动初始化分享配置
- 自动绑定 `onShareAppMessage` 和 `onShareTimeline` 生命周期
- 同一页面内多次调用 `useShare()` 返回同一个实例
- 页面卸载时自动清理分享实例

### 自定义页面分享配置

可以在调用 `useShare()` 时传入自定义配置：

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

// 自定义分享配置
const { shareConfig, setShareData } = useShare({
  title: '精彩活动等你来',
  imageUrl: '/static/images/share/activity.png',
  enableTimeline: true // 允许分享到朋友圈
})
</script>
```

**配置优先级：**

配置按以下优先级合并（后者覆盖前者）：

1. **默认配置** - 系统内置的默认分享配置
2. **页面配置** - `PAGE_SHARE_CONFIG` 中定义的页面级配置
3. **自定义配置** - 调用 `useShare()` 时传入的配置
4. **动态数据** - 通过 `setShareData()` 设置的动态数据

### 动态设置分享数据

在获取到页面数据后，可以动态设置分享内容：

```vue
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useShare } from '@/composables/useShare'

const { setShareData } = useShare()

// 商品详情数据
const goodsData = ref<any>(null)

// 获取商品详情
const fetchGoodsDetail = async (goodsId: string) => {
  const [err, data] = await http.get(`/goods/detail/${goodsId}`)

  if (!err && data) {
    goodsData.value = data

    // 动态设置分享内容
    setShareData({
      title: `【推荐】${data.goodsName}`,
      imageUrl: data.mainImage,
      extraParams: {
        goodsId: data.id,
        skuId: data.defaultSkuId
      }
    })
  }
}

onMounted(() => {
  // 假设从路由获取商品ID
  const goodsId = getCurrentPages().pop()?.options?.goodsId
  if (goodsId) {
    fetchGoodsDetail(goodsId)
  }
})
</script>
```

**动态数据参数：**

```typescript
interface ShareData {
  /** 动态标题 */
  title?: string
  /** 动态图片 */
  imageUrl?: string
  /** 额外的路径参数 */
  extraParams?: Record<string, any>
  /** 是否覆盖现有路径参数 */
  overridePath?: boolean
}
```

### 主动触发分享

通过自定义按钮触发系统分享菜单：

```vue
<template>
  <view class="share-buttons">
    <!-- 微信小程序使用 open-type="share" -->
    <!-- #ifdef MP-WEIXIN -->
    <button open-type="share" class="share-btn">
      <text>分享给好友</text>
    </button>
    <!-- #endif -->

    <!-- 其他平台使用 triggerShare -->
    <!-- #ifndef MP-WEIXIN -->
    <button @tap="handleShareClick" class="share-btn">
      <text>分享</text>
    </button>
    <!-- #endif -->

    <!-- 通用的自定义分享按钮 -->
    <view class="custom-share" @tap="handleShareClick">
      <wd-icon name="share" size="40rpx" />
      <text>分享</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

const { triggerShare } = useShare()

const handleShareClick = () => {
  triggerShare()
}
</script>

```

## 分享配置

### 默认分享配置

系统提供了默认的分享配置，当页面没有自定义配置时使用：

```typescript
const DEFAULT_SHARE: ShareConfig = {
  title: '发现更多精彩',
  path: '/pages/index/index',
  imageUrl: '',
}
```

### 页面级分享配置

可以在 `PAGE_SHARE_CONFIG` 中为不同页面配置分享信息：

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
  // 用户中心配置 - 私密页面，不允许分享到朋友圈
  '/pages/user/profile': {
    title: '个人中心',
    imageUrl: '',
    enableTimeline: false,
  },
  // 文章详情页配置
  '/pages/article/detail': {
    title: '文章详情',
    imageUrl: '',
    enableTimeline: true,
  },
}
```

**配置项说明：**

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `title` | `string` | 分享标题 |
| `imageUrl` | `string` | 分享图片地址 |
| `enableTimeline` | `boolean` | 是否允许分享到朋友圈 |

### 分享路径参数

分享时会自动处理路径参数：

1. **当前页面参数** - 自动携带当前页面的查询参数
2. **用户邀请ID** - 自动添加 `pid` 参数（当前用户ID），用于分销溯源
3. **额外参数** - 通过 `setShareData` 的 `extraParams` 添加

```typescript
// 假设当前页面 /pages/goods/detail?goodsId=123
// 用户ID为 10086

// 最终分享路径：
// /pages/goods/detail?goodsId=123&pid=10086

// 如果设置了 extraParams:
setShareData({
  extraParams: {
    skuId: 'sku_001',
    source: 'share'
  }
})
// 最终分享路径：
// /pages/goods/detail?goodsId=123&skuId=sku_001&source=share&pid=10086
```

### 覆盖路径参数

使用 `overridePath` 可以完全覆盖现有路径参数：

```typescript
setShareData({
  extraParams: {
    activityId: 'act_001'
  },
  overridePath: true // 不携带当前页面的其他参数
})
// 最终分享路径：
// /pages/goods/detail?activityId=act_001&pid=10086
```

## 平台适配

### 微信小程序

微信小程序支持分享到好友和分享到朋友圈两种方式：

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

const { canShareToTimeline, handleShareAppMessage, handleShareTimeline } = useShare({
  enableTimeline: true
})

// 分享配置会自动绑定到 onShareAppMessage 和 onShareTimeline
// 无需手动 defineExpose
</script>
```

**微信分享按钮：**

```vue
<template>
  <!-- 使用 open-type="share" 触发分享 -->
  <button open-type="share">分享给好友</button>
</template>
```

### 支付宝小程序

支付宝小程序使用 `my.showSharePanel` 显示分享面板：

```typescript
// #ifdef MP-ALIPAY
my.showSharePanel({
  title: shareConfig.value.title,
  content: shareConfig.value.title,
  url: shareConfig.value.path,
})
// #endif
```

### 百度小程序

百度小程序使用 `swan.openShare` 触发分享：

```typescript
// #ifdef MP-BAIDU
swan.openShare({
  title: shareConfig.value.title,
  content: shareConfig.value.title,
  imageUrl: shareConfig.value.imageUrl,
  path: shareConfig.value.path,
})
// #endif
```

### QQ小程序

QQ小程序使用 `qq.showShareMenu` 显示分享菜单：

```typescript
// #ifdef MP-QQ
qq.showShareMenu({
  showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment'],
})
// #endif
```

## API

### useShare 返回值

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| `shareConfig` | `Readonly<Ref<ShareConfig>>` | 当前分享配置（只读） |
| `pageConfig` | `Readonly<Ref<PageShareConfig>>` | 页面配置（只读） |
| `setShareData` | `(data: ShareData) => void` | 动态设置分享数据 |
| `triggerShare` | `() => void` | 主动触发系统分享菜单 |
| `resetShareConfig` | `() => void` | 重置分享配置为默认值 |
| `canShareToTimeline` | `() => boolean` | 检查是否支持分享到朋友圈 |
| `handleShareAppMessage` | `() => ShareEventResult` | 处理分享到好友事件 |
| `handleShareTimeline` | `() => ShareEventResult \| null` | 处理分享到朋友圈事件 |

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

## 使用场景

### 1. 商品详情页分享

商品详情页需要根据商品信息动态设置分享内容：

```vue
<template>
  <view class="goods-detail">
    <image :src="goods.mainImage" mode="aspectFill" />
    <view class="info">
      <text class="name">{{ goods.name }}</text>
      <text class="price">¥{{ goods.price }}</text>
    </view>

    <button open-type="share" class="share-btn">
      分享赚佣金
    </button>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useShare } from '@/composables/useShare'
import { http } from '@/composables/useHttp'

const { setShareData } = useShare({
  enableTimeline: true
})

const goods = ref<any>({})

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const goodsId = currentPage.options?.goodsId

  if (goodsId) {
    const [err, data] = await http.get(`/goods/detail/${goodsId}`)

    if (!err && data) {
      goods.value = data

      // 设置分享内容
      setShareData({
        title: `【推荐好物】${data.name} 仅需¥${data.price}`,
        imageUrl: data.mainImage,
        extraParams: {
          goodsId: data.id,
          source: 'share'
        }
      })
    }
  }
})
</script>
```

### 2. 文章详情页分享

文章页面分享时携带文章ID和标题：

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useShare } from '@/composables/useShare'

const { setShareData } = useShare({
  enableTimeline: true
})

const article = ref<any>({})

const loadArticle = async (articleId: string) => {
  const [err, data] = await http.get(`/article/${articleId}`)

  if (!err && data) {
    article.value = data

    setShareData({
      title: data.title,
      imageUrl: data.coverImage || '/static/images/share/article-default.png',
      extraParams: {
        articleId: data.id
      }
    })
  }
}
</script>
```

### 3. 活动页面分享

活动页面需要携带活动ID和邀请码：

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useShare } from '@/composables/useShare'

const { setShareData } = useShare()

const activity = ref<any>({})

const loadActivity = async (activityId: string) => {
  const [err, data] = await http.get(`/activity/${activityId}`)

  if (!err && data) {
    activity.value = data

    setShareData({
      title: `${data.name} - 限时优惠，不容错过！`,
      imageUrl: data.shareImage,
      extraParams: {
        activityId: data.id,
        code: data.inviteCode
      },
      overridePath: true // 只携带活动相关参数
    })
  }
}
</script>
```

### 4. 个人中心页（禁止分享到朋友圈）

私密页面不允许分享到朋友圈：

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

// 禁用朋友圈分享
const { canShareToTimeline } = useShare({
  title: '我的个人中心',
  enableTimeline: false
})

// canShareToTimeline() 返回 false
</script>
```

### 5. 邀请好友页面

邀请页面需要携带邀请人信息：

```vue
<template>
  <view class="invite-page">
    <view class="invite-info">
      <text>邀请好友，一起赚钱</text>
      <text class="code">我的邀请码：{{ inviteCode }}</text>
    </view>

    <view class="actions">
      <button open-type="share" class="primary-btn">
        邀请好友
      </button>
      <button @tap="copyInviteLink" class="secondary-btn">
        复制链接
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useShare } from '@/composables/useShare'

const userStore = useUserStore()

const inviteCode = computed(() => userStore.userInfo?.inviteCode || '')

const { setShareData, shareConfig } = useShare()

onMounted(() => {
  setShareData({
    title: `${userStore.userInfo?.nickname}邀请你加入，新人专享福利等你来领`,
    imageUrl: '/static/images/share/invite.png',
    extraParams: {
      inviteCode: inviteCode.value,
      inviter: userStore.userInfo?.userId
    },
    overridePath: true
  })
})

const copyInviteLink = () => {
  // 构建完整链接
  const link = `https://your-domain.com/pages/invite/register?${shareConfig.value.path.split('?')[1] || ''}`

  uni.setClipboardData({
    data: link,
    success: () => {
      uni.showToast({ title: '链接已复制', icon: 'success' })
    }
  })
}
</script>
```

## 最佳实践

### 1. 统一管理页面分享配置

在 `PAGE_SHARE_CONFIG` 中集中管理所有页面的分享配置：

```typescript
// composables/useShare.ts

const PAGE_SHARE_CONFIG: Record<string, PageShareConfig> = {
  // ========== 首页模块 ==========
  '/pages/index/index': {
    title: '发现好物',
    imageUrl: '/static/images/share/home.png',
    enableTimeline: true,
  },

  // ========== 商品模块 ==========
  '/pages/goods/list': {
    title: '精选商品',
    imageUrl: '/static/images/share/goods-list.png',
    enableTimeline: true,
  },
  '/pages/goods/detail': {
    title: '商品详情', // 会被动态数据覆盖
    imageUrl: '',
    enableTimeline: true,
  },

  // ========== 文章模块 ==========
  '/pages/article/list': {
    title: '精彩资讯',
    enableTimeline: true,
  },
  '/pages/article/detail': {
    title: '文章详情',
    enableTimeline: true,
  },

  // ========== 用户模块（私密，禁止朋友圈） ==========
  '/pages/user/profile': {
    title: '个人中心',
    enableTimeline: false,
  },
  '/pages/user/orders': {
    title: '我的订单',
    enableTimeline: false,
  },
  '/pages/user/wallet': {
    title: '我的钱包',
    enableTimeline: false,
  },

  // ========== 活动模块 ==========
  '/pages/activity/detail': {
    title: '精彩活动',
    enableTimeline: true,
  },
}
```

### 2. 分享图片规范

**图片尺寸要求：**

- 微信小程序：推荐 5:4 比例，最小 320x256
- 朋友圈分享：推荐 1:1 比例
- 通用建议：500x400 或 800x640

**图片来源优先级：**

```typescript
// 1. 动态数据图片（接口返回）
setShareData({ imageUrl: data.mainImage })

// 2. 页面配置图片
PAGE_SHARE_CONFIG['/pages/xxx'] = { imageUrl: '/static/xxx.png' }

// 3. 默认图片
DEFAULT_SHARE.imageUrl = '/static/images/share/default.png'
```

### 3. 分享数据追踪

在分享时添加埋点统计：

```typescript
const handleShareAppMessage = (): ShareEventResult => {
  const result = {
    title: shareConfig.value.title,
    path: shareConfig.value.path,
    imageUrl: shareConfig.value.imageUrl,
  }

  // 分享埋点
  trackShareEvent({
    type: 'friend',
    page: getCurrentPageInfo().path,
    title: result.title,
    timestamp: Date.now()
  })

  return result
}

// 埋点函数
const trackShareEvent = (data: any) => {
  // 上报到统计平台
  // #ifdef MP-WEIXIN
  wx.reportAnalytics('share_click', data)
  // #endif

  // 或调用自己的埋点接口
  http.post('/analytics/share', data)
}
```

### 4. 分享结果回调处理

微信小程序支持分享结果回调（需要使用 `Promise` 形式）：

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

const { shareConfig } = useShare()

// 在页面中监听分享成功
onShareAppMessage(() => {
  return new Promise((resolve) => {
    resolve({
      title: shareConfig.value.title,
      path: shareConfig.value.path,
      imageUrl: shareConfig.value.imageUrl,
      success: (res) => {
        console.log('分享成功', res)
        // 分享成功后的逻辑，如奖励积分
      },
      fail: (err) => {
        console.log('分享失败', err)
      }
    })
  })
})
</script>
```

### 5. 分享海报生成

结合 Canvas 生成分享海报：

```vue
<template>
  <view class="share-poster">
    <canvas canvas-id="shareCanvas" class="canvas" />
    <image v-if="posterUrl" :src="posterUrl" mode="aspectFit" />

    <view class="actions">
      <button @tap="generatePoster">生成海报</button>
      <button @tap="savePoster" :disabled="!posterUrl">保存到相册</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useShare } from '@/composables/useShare'

const { shareConfig } = useShare()
const posterUrl = ref('')

const generatePoster = async () => {
  const ctx = uni.createCanvasContext('shareCanvas')

  // 绘制背景
  ctx.setFillStyle('#ffffff')
  ctx.fillRect(0, 0, 375, 667)

  // 绘制标题
  ctx.setFontSize(20)
  ctx.setFillStyle('#333333')
  ctx.fillText(shareConfig.value.title, 20, 50)

  // 绘制二维码（需要先生成小程序码）
  // ...

  ctx.draw(true, () => {
    uni.canvasToTempFilePath({
      canvasId: 'shareCanvas',
      success: (res) => {
        posterUrl.value = res.tempFilePath
      }
    })
  })
}

const savePoster = () => {
  if (!posterUrl.value) return

  uni.saveImageToPhotosAlbum({
    filePath: posterUrl.value,
    success: () => {
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '保存失败', icon: 'none' })
    }
  })
}
</script>
```

## 常见问题

### 1. 分享图片不显示

**问题原因：**
- 图片地址无效或无法访问
- 图片尺寸不符合要求
- 使用了本地路径但未正确引用

**解决方案：**

```typescript
// 1. 使用网络图片时，确保是 HTTPS
setShareData({
  imageUrl: 'https://your-cdn.com/images/share.png'
})

// 2. 使用本地图片时，使用正确的路径
setShareData({
  imageUrl: '/static/images/share/default.png'
})

// 3. 检查图片尺寸，推荐 500x400
// 微信要求：最小 320x256，最大 1M

// 4. 提供默认图片兜底
const getShareImage = (imageUrl?: string) => {
  return imageUrl || '/static/images/share/default.png'
}
```

### 2. 分享路径参数丢失

**问题原因：**
- 参数值为 undefined 或 null
- 参数包含特殊字符未编码
- 路径格式错误

**解决方案：**

```typescript
// 1. 过滤空值参数
const buildQueryString = (params: Record<string, any>): string => {
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')

  return queryString ? `?${queryString}` : ''
}

// 2. 确保参数有效
setShareData({
  extraParams: {
    goodsId: goods.value?.id || '',  // 提供默认值
    source: 'share'
  }
})

// 3. 检查最终路径
console.log('分享路径:', shareConfig.value.path)
```

### 3. 朋友圈分享不生效

**问题原因：**
- 未启用 `enableTimeline`
- `onShareTimeline` 未正确绑定
- 微信版本过低（需要 7.0.12+）

**解决方案：**

```typescript
// 1. 确保启用朋友圈分享
const { canShareToTimeline } = useShare({
  enableTimeline: true
})

// 2. 检查是否支持
if (!canShareToTimeline()) {
  console.warn('当前页面不支持朋友圈分享')
}

// 3. useShare 会自动绑定 onShareTimeline，无需手动处理
// 但需要确保在页面组件中调用 useShare()
```

### 4. 分享后参数被重置

**问题原因：**
- 用户点击分享卡片进入页面后，使用的是分享时的参数
- 页面刷新或重新进入后参数状态不一致

**解决方案：**

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

const { setShareData } = useShare()

// 页面加载时根据 onLoad 参数初始化
// useShare 会自动在 onLoad 时读取参数并初始化分享配置

// 如果需要从分享链接获取邀请人信息
onLoad((options) => {
  if (options?.pid) {
    // 保存邀请人ID
    saveInviterInfo(options.pid)
  }
})

// 动态数据变化时更新分享配置
watch(
  () => goodsData.value,
  (newData) => {
    if (newData) {
      setShareData({
        title: newData.name,
        imageUrl: newData.mainImage
      })
    }
  }
)
</script>
```

### 5. 不同页面分享配置冲突

**问题原因：**
- 页面级单例模式下，切换页面后旧配置未清理
- 多个组件设置了不同的分享数据

**解决方案：**

```typescript
// useShare 采用页面级单例模式，每个页面有独立的实例
// 页面卸载时会自动清理

// 如果需要手动重置
const { resetShareConfig } = useShare()

// 页面卸载前重置
onUnload(() => {
  resetShareConfig()
})

// 或在特定场景下重置
const handleSomeAction = () => {
  resetShareConfig()
  // 重新设置分享数据
  setShareData({ ... })
}
```

### 6. 触发分享菜单失败

**问题原因：**
- 非小程序环境调用
- 用户未授权
- API 调用时机不对

**解决方案：**

```typescript
const { triggerShare } = useShare()

const handleShare = () => {
  try {
    triggerShare()
  } catch (error) {
    console.error('触发分享失败:', error)

    // 提示用户
    uni.showToast({
      title: '分享功能暂不可用',
      icon: 'none'
    })

    // 可以提供备选方案，如复制链接
    uni.showModal({
      title: '提示',
      content: '是否复制分享链接？',
      success: (res) => {
        if (res.confirm) {
          copyShareLink()
        }
      }
    })
  }
}

const copyShareLink = () => {
  const link = `https://your-domain.com${shareConfig.value.path}`
  uni.setClipboardData({
    data: link,
    success: () => {
      uni.showToast({ title: '链接已复制', icon: 'success' })
    }
  })
}
```
