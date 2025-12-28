# useWxShare 微信分享

## 介绍

`useWxShare` 是 RuoYi-Plus-UniApp 移动端的微信H5分享组合函数，用于在微信公众号H5环境中实现自定义分享功能。通过封装微信JS-SDK的调用流程，提供简洁的API来配置分享标题、描述、图片和链接。

**核心特性:**

- **自动SDK管理** - 自动加载微信JS-SDK，无需手动引入脚本
- **签名自动获取** - 自动从后端获取JS-SDK签名配置
- **一键分享** - 提供 `share` 方法，一步完成初始化和配置
- **双API兼容** - 同时支持新版和旧版微信分享接口
- **平台检测** - 自动检测运行环境，非微信环境优雅降级
- **状态追踪** - 提供 `isReady` 和 `error` 状态，便于UI展示

## 基本用法

### 引入与初始化

```typescript
import { useWxShare } from '@/composables/useWxShare'

// 获取分享实例
const { isReady, error, share } = useWxShare()
```

### 一键分享（推荐）

使用 `share` 方法可以一步完成SDK初始化和分享配置：

```vue
<template>
  <view class="share-page">
    <view v-if="error" class="error-tip">
      {{ error }}
    </view>
    <view v-else class="content">
      <text>分享状态: {{ isReady ? '已就绪' : '初始化中...' }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useWxShare } from '@/composables/useWxShare'

const { isReady, error, share } = useWxShare()

onMounted(async () => {
  // 配置分享内容
  const success = await share({
    title: '欢迎使用RuoYi-Plus',
    desc: '一款优秀的企业级前后端分离框架',
    imgUrl: 'https://example.com/logo.png',
    link: window.location.href
  })

  if (success) {
    console.log('分享配置成功')
  } else {
    console.log('分享配置失败:', error.value)
  }
})
</script>
```

### 分步初始化

如果需要更精细的控制，可以分步进行初始化和配置：

```vue
<script lang="ts" setup>
import { onMounted, watch } from 'vue'
import { useWxShare } from '@/composables/useWxShare'

const { isReady, error, initSdk, setShare } = useWxShare()

onMounted(async () => {
  // 第一步：初始化SDK
  const success = await initSdk({ debug: false })

  if (!success) {
    console.error('SDK初始化失败:', error.value)
    return
  }

  // 第二步：配置分享内容
  setShare({
    title: '分享标题',
    desc: '分享描述内容',
    imgUrl: 'https://example.com/share.jpg'
  })
})

// 监听页面数据变化，动态更新分享内容
watch(pageData, (newData) => {
  if (isReady.value) {
    setShare({
      title: newData.title,
      desc: newData.description,
      imgUrl: newData.coverImage
    })
  }
})
</script>
```

## 实际应用场景

### 商品详情页分享

```vue
<template>
  <view class="product-detail">
    <image :src="product.image" class="product-image" />
    <view class="product-info">
      <text class="product-name">{{ product.name }}</text>
      <text class="product-price">¥{{ product.price }}</text>
    </view>

    <!-- 分享提示 -->
    <view v-if="isReady" class="share-tip">
      <wd-icon name="share" />
      <text>点击右上角分享给好友</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useWxShare } from '@/composables/useWxShare'

interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
}

const props = defineProps<{
  productId: string
}>()

const product = ref<Product>({
  id: '',
  name: '',
  price: 0,
  image: '',
  description: ''
})

const { isReady, share } = useWxShare()

// 分享链接带上商品ID
const shareLink = computed(() => {
  const baseUrl = window.location.origin
  return `${baseUrl}/pages/product/detail?id=${props.productId}`
})

onMounted(async () => {
  // 加载商品数据
  await loadProduct()

  // 配置分享
  await share({
    title: `【限时特惠】${product.value.name}`,
    desc: product.value.description || '快来看看这个好物！',
    imgUrl: product.value.image,
    link: shareLink.value,
    success: () => {
      console.log('用户分享成功')
      // 可以记录分享统计
      reportShareEvent(props.productId)
    }
  })
})

const loadProduct = async () => {
  // 加载商品数据...
}

const reportShareEvent = (productId: string) => {
  // 上报分享事件...
}
</script>
```

### 文章详情页分享

```vue
<template>
  <view class="article-page">
    <view class="article-header">
      <text class="article-title">{{ article.title }}</text>
      <text class="article-author">{{ article.author }}</text>
    </view>

    <rich-text :nodes="article.content" class="article-content" />

    <!-- 底部分享按钮 -->
    <view class="article-footer">
      <button class="share-btn" open-type="share">
        <wd-icon name="share" />
        <text>分享文章</text>
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useWxShare } from '@/composables/useWxShare'

const article = ref({
  id: '',
  title: '',
  author: '',
  summary: '',
  cover: '',
  content: ''
})

const { share } = useWxShare()

onMounted(async () => {
  // 加载文章
  await loadArticle()

  // 配置分享
  await share({
    title: article.value.title,
    desc: article.value.summary || '点击查看详情',
    imgUrl: article.value.cover,
    link: `${window.location.origin}/article/${article.value.id}`
  })
})

const loadArticle = async () => {
  // 从API加载文章数据...
}
</script>
```

### 活动邀请页分享

```vue
<template>
  <view class="invite-page">
    <view class="invite-card">
      <image :src="activity.poster" class="poster" />
      <view class="invite-info">
        <text class="activity-name">{{ activity.name }}</text>
        <text class="invite-code">邀请码: {{ inviteCode }}</text>
      </view>
    </view>

    <!-- 分享状态 -->
    <view class="share-status">
      <template v-if="error">
        <wd-icon name="warning" color="#ff4d4f" />
        <text class="error-text">{{ error }}</text>
        <wd-button size="small" @click="retryShare">重试</wd-button>
      </template>
      <template v-else-if="!isReady">
        <wd-loading />
        <text>正在准备分享...</text>
      </template>
      <template v-else>
        <wd-icon name="check-circle" color="#52c41a" />
        <text>分享已就绪，点击右上角分享</text>
      </template>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useWxShare } from '@/composables/useWxShare'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

const activity = ref({
  id: '',
  name: '',
  poster: '',
  description: ''
})

const inviteCode = ref('')

const { isReady, error, share, initSdk, setShare } = useWxShare()

// 生成带邀请码的链接
const generateInviteLink = () => {
  const baseUrl = window.location.origin
  const userId = userStore.userInfo?.userId
  return `${baseUrl}/pages/activity/join?id=${activity.value.id}&inviter=${userId}&code=${inviteCode.value}`
}

const configureShare = async () => {
  await share({
    title: `${userStore.userInfo?.nickName || '好友'}邀请你参加${activity.value.name}`,
    desc: activity.value.description || '快来参加吧！',
    imgUrl: activity.value.poster,
    link: generateInviteLink(),
    success: () => {
      // 记录邀请分享
      recordInviteShare()
    }
  })
}

const retryShare = async () => {
  await configureShare()
}

const recordInviteShare = () => {
  // 记录邀请分享事件...
}

onMounted(async () => {
  // 加载活动信息和生成邀请码
  await loadActivityAndInviteCode()

  // 配置分享
  await configureShare()
})

const loadActivityAndInviteCode = async () => {
  // 加载数据...
}
</script>
```

### 动态更新分享内容

```vue
<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { useWxShare } from '@/composables/useWxShare'

const currentTab = ref(0)
const tabs = ref([
  { title: '首页', desc: '欢迎访问我们的首页', image: '/images/home.jpg' },
  { title: '产品', desc: '查看我们的产品列表', image: '/images/products.jpg' },
  { title: '关于', desc: '了解更多关于我们', image: '/images/about.jpg' }
])

const { isReady, share, setShare } = useWxShare()

onMounted(async () => {
  // 初始化分享
  await share({
    title: tabs.value[0].title,
    desc: tabs.value[0].desc,
    imgUrl: tabs.value[0].image
  })
})

// 切换Tab时更新分享内容
watch(currentTab, (index) => {
  if (isReady.value) {
    const tab = tabs.value[index]
    setShare({
      title: tab.title,
      desc: tab.desc,
      imgUrl: tab.image
    })
  }
})

const onTabChange = (index: number) => {
  currentTab.value = index
}
</script>
```

## API 详解

### 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `isReady` | `Ref<boolean>` | SDK是否就绪 |
| `error` | `Ref<string>` | 错误信息 |
| `initSdk` | `(options?: WxSdkOptions) => Promise<boolean>` | 初始化SDK |
| `setShare` | `(config: WxShareConfig) => void` | 配置分享内容 |
| `share` | `(config: WxShareConfig, options?: WxSdkOptions) => Promise<boolean>` | 一键分享 |

### initSdk

初始化微信JS-SDK。

```typescript
const initSdk: (options?: WxSdkOptions) => Promise<boolean>
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `options` | `WxSdkOptions` | 否 | SDK配置选项 |

**WxSdkOptions:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `debug` | `boolean` | `false` | 是否开启调试模式 |

**返回值:** `Promise<boolean>` - 初始化是否成功

**执行流程:**

1. 检查是否在微信公众号H5环境
2. 动态加载微信JS-SDK（从CDN）
3. 从后端获取JS-SDK签名配置
4. 调用 `wx.config` 配置SDK
5. 等待 `wx.ready` 回调确认初始化完成

**使用示例:**

```typescript
const { initSdk, error } = useWxShare()

const init = async () => {
  // 开启调试模式（开发时使用）
  const success = await initSdk({ debug: true })

  if (success) {
    console.log('SDK初始化成功')
  } else {
    console.error('初始化失败:', error.value)
  }
}
```

### setShare

配置分享内容。调用此方法前需确保SDK已初始化完成。

```typescript
const setShare: (config: WxShareConfig) => void
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `config` | `WxShareConfig` | 是 | 分享配置对象 |

**WxShareConfig:**

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | `string` | 是 | 分享标题 |
| `desc` | `string` | 是 | 分享描述 |
| `imgUrl` | `string` | 是 | 分享图片URL（必须是完整的HTTPS地址） |
| `link` | `string` | 否 | 分享链接（默认当前页面） |
| `success` | `() => void` | 否 | 分享成功回调 |
| `cancel` | `() => void` | 否 | 取消分享回调 |

**使用示例:**

```typescript
const { isReady, setShare } = useWxShare()

// 确保SDK已就绪
if (isReady.value) {
  setShare({
    title: '分享标题',
    desc: '这是分享的描述内容',
    imgUrl: 'https://example.com/share-image.jpg',
    link: 'https://example.com/page',
    success: () => {
      uni.showToast({ title: '分享成功' })
    },
    cancel: () => {
      console.log('用户取消分享')
    }
  })
}
```

### share

一键分享方法，自动完成初始化和配置。这是推荐使用的方法。

```typescript
const share: (config: WxShareConfig, options?: WxSdkOptions) => Promise<boolean>
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `config` | `WxShareConfig` | 是 | 分享配置对象 |
| `options` | `WxSdkOptions` | 否 | SDK配置选项 |

**返回值:** `Promise<boolean>` - 配置是否成功

**执行流程:**

1. 检查SDK是否已初始化
2. 如未初始化，自动调用 `initSdk`
3. 调用 `setShare` 配置分享内容

**使用示例:**

```typescript
const { share, error } = useWxShare()

onMounted(async () => {
  const success = await share({
    title: '精彩内容分享',
    desc: '点击查看详情',
    imgUrl: 'https://example.com/cover.jpg'
  })

  if (!success) {
    console.error('分享配置失败:', error.value)
  }
})
```

## 类型定义

### WxShareConfig

```typescript
/**
 * 分享配置
 */
export interface WxShareConfig {
  /**
   * 分享标题
   * 好友分享和朋友圈分享都会显示
   */
  title: string

  /**
   * 分享描述
   * 仅好友分享显示，朋友圈分享不显示
   */
  desc: string

  /**
   * 分享图片URL
   * 必须是完整的HTTPS地址
   * 建议尺寸: 500x400，大小不超过32KB
   */
  imgUrl: string

  /**
   * 分享链接
   * 默认为当前页面URL
   * 必须与当前页面同域名
   */
  link?: string

  /**
   * 分享成功回调
   * 用户点击分享后触发
   */
  success?: () => void

  /**
   * 取消分享回调
   * 用户取消分享后触发
   */
  cancel?: () => void
}
```

### WxSdkOptions

```typescript
/**
 * SDK配置选项
 */
export interface WxSdkOptions {
  /**
   * 是否开启调试模式
   * 开启后会在页面显示调试信息
   * 仅开发环境使用
   */
  debug?: boolean
}
```

### useWxShare 返回类型

```typescript
interface UseWxShareReturn {
  /** SDK是否就绪 */
  isReady: Ref<boolean>

  /** 错误信息 */
  error: Ref<string>

  /**
   * 初始化SDK
   * @param options SDK配置选项
   * @returns 是否初始化成功
   */
  initSdk: (options?: WxSdkOptions) => Promise<boolean>

  /**
   * 配置分享内容
   * 需在SDK就绪后调用
   * @param config 分享配置
   */
  setShare: (config: WxShareConfig) => void

  /**
   * 一键分享（推荐）
   * 自动初始化SDK并配置分享
   * @param config 分享配置
   * @param options SDK配置选项
   * @returns 是否配置成功
   */
  share: (config: WxShareConfig, options?: WxSdkOptions) => Promise<boolean>
}
```

## 后端接口说明

### 获取JS-SDK签名

分享功能需要后端提供签名接口，接口格式如下：

**请求:**

```typescript
// API 调用
import { getJsApiSignature } from '@/api/app/wxShare/wxShareApi'

const url = location.href.split('#')[0]
const [err, config] = await getJsApiSignature(url)
```

**响应:**

```typescript
interface JsApiSignature {
  /** 公众号AppID */
  appId: string
  /** 时间戳 */
  timestamp: string
  /** 随机字符串 */
  nonceStr: string
  /** 签名 */
  signature: string
}
```

**后端实现要点:**

1. 获取 `access_token`（需缓存，有效期2小时）
2. 使用 `access_token` 获取 `jsapi_ticket`（需缓存，有效期2小时）
3. 使用 `jsapi_ticket`、`noncestr`、`timestamp`、`url` 生成签名
4. 签名算法: SHA1(jsapi_ticket=XXX&noncestr=XXX&timestamp=XXX&url=XXX)

## 最佳实践

### 1. 在页面加载时配置分享

```vue
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useWxShare } from '@/composables/useWxShare'

const { share } = useWxShare()

onMounted(async () => {
  // 页面加载后立即配置分享
  // 这样用户随时点击分享都能正常工作
  await share({
    title: '页面标题',
    desc: '页面描述',
    imgUrl: 'https://example.com/image.jpg'
  })
})
</script>
```

### 2. 使用完整的HTTPS图片链接

```typescript
// ✅ 正确 - 完整的HTTPS链接
await share({
  title: '分享',
  desc: '描述',
  imgUrl: 'https://example.com/images/share.jpg'
})

// ❌ 错误 - 相对路径
await share({
  title: '分享',
  desc: '描述',
  imgUrl: '/images/share.jpg'
})

// ❌ 错误 - HTTP链接（部分浏览器不支持）
await share({
  title: '分享',
  desc: '描述',
  imgUrl: 'http://example.com/images/share.jpg'
})
```

### 3. 处理非微信环境

```vue
<template>
  <view class="page">
    <!-- 微信环境显示分享提示 -->
    <view v-if="isWechat && isReady" class="wechat-share-tip">
      点击右上角分享给好友
    </view>

    <!-- 非微信环境显示复制链接 -->
    <view v-else-if="!isWechat" class="copy-link">
      <wd-button @click="copyLink">复制链接</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useWxShare } from '@/composables/useWxShare'
import { isWechatOfficialH5 } from '@/utils/platform'

const isWechat = ref(isWechatOfficialH5)
const { isReady, share } = useWxShare()

onMounted(async () => {
  if (isWechat.value) {
    await share({
      title: '分享标题',
      desc: '分享描述',
      imgUrl: 'https://example.com/image.jpg'
    })
  }
})

const copyLink = () => {
  uni.setClipboardData({
    data: window.location.href,
    success: () => {
      uni.showToast({ title: '链接已复制' })
    }
  })
}
</script>
```

### 4. 封装分享Composable

```typescript
// composables/usePageShare.ts
import { useWxShare } from '@/composables/useWxShare'
import type { WxShareConfig } from '@/composables/useWxShare'

export function usePageShare() {
  const { isReady, error, share } = useWxShare()

  /**
   * 配置商品分享
   */
  const shareProduct = async (product: {
    id: string
    name: string
    price: number
    image: string
  }) => {
    return share({
      title: `【限时特惠】${product.name} ¥${product.price}`,
      desc: '快来看看这个好物！限时优惠中~',
      imgUrl: product.image,
      link: `${window.location.origin}/product/${product.id}`
    })
  }

  /**
   * 配置文章分享
   */
  const shareArticle = async (article: {
    id: string
    title: string
    summary: string
    cover: string
  }) => {
    return share({
      title: article.title,
      desc: article.summary || '点击查看详情',
      imgUrl: article.cover,
      link: `${window.location.origin}/article/${article.id}`
    })
  }

  /**
   * 配置邀请分享
   */
  const shareInvite = async (config: {
    activityName: string
    inviterName: string
    poster: string
    inviteCode: string
  }) => {
    return share({
      title: `${config.inviterName}邀请你参加${config.activityName}`,
      desc: '快来参加吧，丰厚奖励等你拿！',
      imgUrl: config.poster,
      link: `${window.location.origin}/invite?code=${config.inviteCode}`
    })
  }

  return {
    isReady,
    error,
    shareProduct,
    shareArticle,
    shareInvite
  }
}
```

**使用封装后的Composable:**

```vue
<script lang="ts" setup>
import { onMounted } from 'vue'
import { usePageShare } from '@/composables/usePageShare'

const { shareProduct } = usePageShare()

const product = {
  id: '123',
  name: '精品商品',
  price: 99.99,
  image: 'https://example.com/product.jpg'
}

onMounted(async () => {
  await shareProduct(product)
})
</script>
```

### 5. 分享统计上报

```typescript
import { useWxShare } from '@/composables/useWxShare'
import { reportEvent } from '@/utils/analytics'

const { share } = useWxShare()

const configureShareWithAnalytics = async () => {
  await share({
    title: '分享标题',
    desc: '分享描述',
    imgUrl: 'https://example.com/image.jpg',
    success: () => {
      // 上报分享成功事件
      reportEvent('share_success', {
        page: 'product_detail',
        product_id: productId,
        share_type: 'wechat'
      })
    },
    cancel: () => {
      // 上报分享取消事件
      reportEvent('share_cancel', {
        page: 'product_detail',
        product_id: productId
      })
    }
  })
}
```

## 常见问题

### 1. 分享图片不显示

**问题原因:**
- 图片URL不是完整的HTTPS地址
- 图片尺寸过大（超过32KB）
- 图片域名未在微信公众号后台配置

**解决方案:**

```typescript
// 1. 确保使用完整的HTTPS链接
const imgUrl = 'https://your-domain.com/images/share.jpg'

// 2. 使用CDN压缩图片
const imgUrl = 'https://cdn.example.com/share.jpg?x-oss-process=image/resize,w_500'

// 3. 在微信公众号后台配置域名
// 公众号设置 -> 功能设置 -> JS接口安全域名
```

### 2. 签名错误 (invalid signature)

**问题原因:**
- URL与签名时使用的URL不一致
- 签名过期
- access_token 或 jsapi_ticket 失效

**解决方案:**

```typescript
// 1. 确保URL一致（不包含hash部分）
const url = location.href.split('#')[0]

// 2. 检查后端签名实现
// - access_token 需要缓存（2小时有效）
// - jsapi_ticket 需要缓存（2小时有效）
// - 签名算法必须正确

// 3. 开启调试模式查看详细错误
const { initSdk } = useWxShare()
await initSdk({ debug: true })
```

### 3. 非微信环境无法使用

**问题原因:**
- 在浏览器或其他App中打开
- 不是微信公众号H5环境

**解决方案:**

```typescript
import { isWechatOfficialH5 } from '@/utils/platform'

// 检测环境并提供替代方案
if (!isWechatOfficialH5) {
  // 显示复制链接按钮
  showCopyLinkButton()
} else {
  // 正常配置微信分享
  await share({ ... })
}
```

### 4. 分享链接打开是空白页

**问题原因:**
- 分享链接域名与当前页面域名不一致
- 分享链接未正确编码

**解决方案:**

```typescript
// 1. 确保分享链接与当前页面同域名
const link = `${window.location.origin}/path/to/page`

// 2. 如果带参数，确保正确编码
const params = encodeURIComponent(JSON.stringify({ id: 123 }))
const link = `${window.location.origin}/page?data=${params}`
```

### 5. 朋友圈分享描述不显示

**问题原因:**
- 微信朋友圈分享本身就不支持描述
- 这是微信的设计，不是bug

**解决方案:**

```typescript
// 朋友圈只显示标题，可以在标题中包含关键信息
await share({
  title: '【限时特惠】商品名称 ¥99.99',  // 标题要包含重要信息
  desc: '这是描述，仅好友分享显示',
  imgUrl: 'https://example.com/image.jpg'
})
```

### 6. SDK加载失败

**问题原因:**
- 网络问题导致CDN加载失败
- JS-SDK URL被拦截

**解决方案:**

```typescript
const { error, initSdk } = useWxShare()

const init = async () => {
  const success = await initSdk()

  if (!success && error.value === 'SDK加载失败') {
    // 提示用户检查网络
    uni.showModal({
      title: '提示',
      content: '网络加载失败，请检查网络后重试',
      confirmText: '重试',
      success: (res) => {
        if (res.confirm) {
          init()  // 重试
        }
      }
    })
  }
}
```

## 注意事项

1. **仅支持微信公众号H5环境** - 小程序、APP、普通浏览器均不支持
2. **需要后端配合** - 必须有后端接口提供JS-SDK签名
3. **域名配置** - 分享链接必须与当前页面同域名，且需在公众号后台配置JS接口安全域名
4. **图片要求** - 必须是HTTPS链接，建议500x400尺寸，不超过32KB
5. **回调限制** - success/cancel回调不一定触发，微信没有保证

