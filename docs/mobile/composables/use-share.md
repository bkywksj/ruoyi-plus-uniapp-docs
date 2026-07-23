# useShare 分享功能

## 介绍

`useShare` 是小程序分享功能组合函数，采用**页面级单例模式**实现。支持微信小程序、支付宝小程序、百度小程序、QQ小程序等多平台的分享功能，同一页面内共享分享状态，不同页面间隔离状态。

**核心特性:**

- **多平台支持** - 统一API适配微信、支付宝、百度、QQ小程序等多个平台
- **页面级单例** - 同一页面内多个组件共享同一个分享实例，避免重复创建
- **动态配置** - 支持动态设置分享标题、图片、路径等，适应各种业务场景
- **朋友圈分享** - 支持配置是否允许分享到朋友圈（微信小程序特有）
- **自动参数** - 自动携带用户ID等参数，支持分销追踪和来源统计
- **生命周期集成** - 自动注册 `onLoad`、`onShareAppMessage`、`onShareTimeline` 生命周期
- **优先级合并** - 支持默认配置、页面配置、自定义配置三级优先级合并
- **参数构建** - 智能构建分享URL参数，支持覆盖和扩展模式

## 架构设计

### 整体架构

```text
┌─────────────────────────────────────────────────────────────────┐
│                      useShare 分享系统架构                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    页面级实例管理层                         │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │         pageShareInstances (Map)                    │ │  │
│  │  │                                                     │ │  │
│  │  │  '/pages/index/index'  ──► ShareInstance1           │ │  │
│  │  │  '/pages/product/detail' ──► ShareInstance2         │ │  │
│  │  │  '/pages/article/detail' ──► ShareInstance3         │ │  │
│  │  │                                                     │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    分享实例核心层                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │           createShareInstance()                     │ │  │
│  │  │                                                     │ │  │
│  │  │  ┌────────────┐ ┌────────────┐ ┌─────────────────┐ │ │  │
│  │  │  │shareConfig │ │pageConfig  │ │dynamicShareData │ │ │  │
│  │  │  │  (ref)     │ │  (ref)     │ │     (ref)       │ │ │  │
│  │  │  └────────────┘ └────────────┘ └─────────────────┘ │ │  │
│  │  │                                                     │ │  │
│  │  │  ┌────────────────────────────────────────────────┐│ │  │
│  │  │  │              核心方法                           ││ │  │
│  │  │  │ • initShareConfig()  初始化分享配置             ││ │  │
│  │  │  │ • setShareData()     动态设置分享数据           ││ │  │
│  │  │  │ • buildShareParams() 构建分享参数               ││ │  │
│  │  │  │ • handleShareAppMessage() 分享到好友            ││ │  │
│  │  │  │ • handleShareTimeline()   分享到朋友圈          ││ │  │
│  │  │  │ • triggerShare()     触发分享菜单               ││ │  │
│  │  │  │ • resetShareConfig() 重置配置                   ││ │  │
│  │  │  └────────────────────────────────────────────────┘│ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    平台适配层                               │  │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐       │  │
│  │  │微信小程序│ │支付宝小程序│ │百度小程序│ │QQ小程序 │       │  │
│  │  │MP-WEIXIN│ │MP-ALIPAY │ │MP-BAIDU │ │ MP-QQ   │       │  │
│  │  └─────────┘ └──────────┘ └─────────┘ └─────────┘       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 页面级单例模式

```text
页面级单例模式工作流程：

┌─────────────────────────────────────────────────────────────────┐
│                    页面 A: /pages/product/detail                │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ Component1   │    │ Component2   │    │   Component3     │  │
│  │              │    │              │    │                  │  │
│  │ useShare()   │    │ useShare()   │    │   useShare()     │  │
│  │      │       │    │      │       │    │       │          │  │
│  └──────┼───────┘    └──────┼───────┘    └───────┼──────────┘  │
│         │                   │                    │              │
│         └───────────────────┼────────────────────┘              │
│                             ▼                                   │
│                   ┌─────────────────────┐                       │
│                   │   共享同一个实例    │                       │
│                   │  ShareInstance_A    │                       │
│                   │                     │                       │
│                   │ shareConfig: {...}  │                       │
│                   │ pageConfig: {...}   │                       │
│                   └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    页面 B: /pages/article/detail                │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐                          │
│  │ Component1   │    │ Component2   │                          │
│  │              │    │              │                          │
│  │ useShare()   │    │ useShare()   │                          │
│  │      │       │    │      │       │                          │
│  └──────┼───────┘    └──────┼───────┘                          │
│         │                   │                                   │
│         └───────────────────┘                                   │
│                   ▼                                             │
│         ┌─────────────────────┐                                 │
│         │   独立的实例        │     ← 与页面A完全隔离            │
│         │  ShareInstance_B    │                                 │
│         │                     │                                 │
│         │ shareConfig: {...}  │                                 │
│         │ pageConfig: {...}   │                                 │
│         └─────────────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 配置优先级合并

```text
配置优先级（从高到低）：

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    ┌─────────────────────────────────────────┐                  │
│    │   动态设置 (dynamicShareData)            │  ← 最高优先级   │
│    │   setShareData({ title, imageUrl })     │                  │
│    └─────────────────────────────────────────┘                  │
│                         ▼                                       │
│    ┌─────────────────────────────────────────┐                  │
│    │   自定义配置 (customConfig)              │  ← 初始化时传入 │
│    │   useShare({ title: '自定义标题' })     │                  │
│    └─────────────────────────────────────────┘                  │
│                         ▼                                       │
│    ┌─────────────────────────────────────────┐                  │
│    │   页面配置 (PAGE_SHARE_CONFIG)          │  ← 预设配置      │
│    │   PAGE_SHARE_CONFIG['/pages/xxx']       │                  │
│    └─────────────────────────────────────────┘                  │
│                         ▼                                       │
│    ┌─────────────────────────────────────────┐                  │
│    │   默认配置 (DEFAULT_SHARE)              │  ← 兜底配置      │
│    │   { title: '发现更多精彩', ... }        │                  │
│    └─────────────────────────────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

合并结果示例：

DEFAULT_SHARE:        { title: '发现更多精彩', imageUrl: '' }
PAGE_SHARE_CONFIG:    { title: '产品详情', enableTimeline: true }
customConfig:         { imageUrl: '/static/custom.png' }
dynamicShareData:     { title: '【推荐】iPhone 15' }

最终配置:             {
                        title: '【推荐】iPhone 15',      ← 动态设置
                        imageUrl: '/static/custom.png',  ← 自定义配置
                        enableTimeline: true             ← 页面配置
                      }
```

### 分享流程

```text
分享流程时序图：

┌────────┐     ┌──────────┐     ┌───────────┐     ┌──────────┐
│  用户  │     │   页面   │     │ useShare  │     │ 小程序API │
└───┬────┘     └────┬─────┘     └─────┬─────┘     └────┬─────┘
    │               │                 │                 │
    │  进入页面     │                 │                 │
    │──────────────►│                 │                 │
    │               │    onLoad       │                 │
    │               │────────────────►│                 │
    │               │                 │ initShareConfig │
    │               │                 │────────────────►│
    │               │                 │                 │
    │               │   setShareData  │                 │
    │               │────────────────►│                 │
    │               │                 │                 │
    │  点击分享按钮  │                 │                 │
    │──────────────►│                 │                 │
    │               │ onShareAppMessage                 │
    │               │────────────────►│                 │
    │               │                 │handleShareAppMessage
    │               │                 │────────────────►│
    │               │                 │                 │ 弹出分享面板
    │               │                 │◄────────────────│
    │               │◄────────────────│                 │
    │◄──────────────│                 │                 │
    │               │                 │                 │
```

## 平台兼容性

### 功能支持矩阵

| 功能 | 微信小程序 | 支付宝小程序 | 百度小程序 | QQ小程序 | 字节小程序 | H5 |
|------|:----------:|:------------:|:----------:|:--------:|:----------:|:--:|
| 分享到好友 | 是 | 是 | 是 | 是 | 是 | 否 |
| 分享到朋友圈 | 是 | 否 | 否 | 是 | 否 | 否 |
| 主动触发分享 | 是 | 是 | 是 | 是 | 是 | 否 |
| 自定义分享图片 | 是 | 是 | 是 | 是 | 是 | 否 |
| 分享回调 | 是 | 是 | 是 | 是 | 是 | 否 |
| 携带参数 | 是 | 是 | 是 | 是 | 是 | 否 |

### 平台特性说明

| 平台 | 特性说明 | 注意事项 |
|------|---------|---------|
| 微信小程序 | 支持分享到好友和朋友圈 | 需要在 `app.json` 中配置 `"enableShareTimeline": true` |
| 支付宝小程序 | 使用 `my.showSharePanel` API | 分享图片需要是完整的 URL |
| 百度小程序 | 使用 `swan.openShare` API | 部分功能需要百度账号登录 |
| QQ小程序 | 支持多种分享渠道 | 可分享到 QQ、QQ空间、微信好友、朋友圈 |
| 字节小程序 | 基本分享功能 | 抖音/头条平台差异处理 |

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

**说明:**
- `useShare` 会自动注册 `onLoad`、`onShareAppMessage`、`onShareTimeline` 生命周期
- 但仍需通过 `defineExpose` 暴露方法，确保页面能正确调用
- 页面级单例模式确保同一页面只创建一个分享实例

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

**配置项说明:**
- `title`: 分享标题，显示在分享卡片上
- `imageUrl`: 分享图片，建议尺寸 5:4
- `enableTimeline`: 是否允许分享到朋友圈（仅微信小程序有效）

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

**使用场景:**
- 商品详情页：根据商品信息设置分享标题和图片
- 文章详情页：根据文章内容设置分享文案
- 活动页面：根据活动配置设置分享内容

### 主动触发分享

通过按钮点击主动触发系统分享菜单：

```vue
<template>
  <view class="share-buttons">
    <wd-button @click="onShareClick" icon="share">
      分享给好友
    </wd-button>

    <wd-button
      v-if="canShare"
      @click="onShareClick"
      type="success"
    >
      分享到朋友圈
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useShare } from '@/composables/useShare'

const { triggerShare, canShareToTimeline } = useShare()

// 检查是否可以分享到朋友圈
const canShare = computed(() => canShareToTimeline())

const onShareClick = () => {
  triggerShare()
}
</script>
```

**触发分享的方式:**

| 方式 | 说明 | 适用场景 |
|------|------|---------|
| 右上角菜单 | 用户点击小程序右上角「...」按钮 | 通用场景 |
| `open-type="share"` | 按钮组件原生分享能力 | 需要明确分享入口 |
| `triggerShare()` | 代码主动触发分享菜单 | 自定义分享按钮 |

### 检查朋友圈分享权限

判断当前页面是否允许分享到朋友圈：

```vue
<template>
  <view class="share-tips">
    <text v-if="canShare">支持分享到朋友圈</text>
    <text v-else>仅支持分享给好友</text>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useShare } from '@/composables/useShare'

const { canShareToTimeline } = useShare()

const canShare = computed(() => canShareToTimeline())
</script>
```

### 重置分享配置

将分享配置重置为默认值：

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'
import { onShow, onHide } from '@dcloudio/uni-app'

const { setShareData, resetShareConfig } = useShare()

// 页面显示时设置特定分享
onShow(() => {
  setShareData({
    title: '限时活动进行中',
    imageUrl: '/static/activity-share.png'
  })
})

// 页面隐藏时重置
onHide(() => {
  resetShareConfig()
})
</script>
```

## 分享配置

### 页面分享配置

可以在组件内部的 `PAGE_SHARE_CONFIG` 中预设各页面的分享配置：

```typescript
/**
 * 页面分享配置映射表
 * 键为页面路径，值为该页面的分享配置
 */
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
  // 文章详情页配置
  '/pages/article/detail': {
    title: '文章详情',
    imageUrl: '',
    enableTimeline: true,
  },
  // 可继续添加其他页面配置...
} as const
```

### 默认分享配置

当页面没有自定义配置时使用默认配置：

```typescript
/**
 * 默认分享配置
 * 当页面没有自定义配置时使用
 */
const DEFAULT_SHARE: ShareConfig = {
  title: '发现更多精彩',
  path: '/pages/index/index',
  imageUrl: '',
} as const
```

### 配置项详解

| 配置项 | 类型 | 必填 | 说明 |
|--------|------|:----:|------|
| title | `string` | 是 | 分享标题，显示在分享卡片顶部 |
| path | `string` | 是 | 分享路径，用户点击卡片后跳转的页面 |
| imageUrl | `string` | 否 | 分享图片URL，为空时使用截图 |
| enableTimeline | `boolean` | 否 | 是否允许分享到朋友圈，默认 `true` |

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

### 内部工具函数

```typescript
/**
 * 构建 URL 查询参数字符串
 * @param params - 参数对象
 * @returns 格式化的查询字符串，如 "?id=123&type=product"
 */
const buildQueryString = (params: Record<string, any>): string => {
  // 过滤掉空值参数
  if (!params || Object.keys(params).length === 0) return ''

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')

  return queryString ? `?${queryString}` : ''
}

/**
 * 获取当前页面完整信息
 * @returns 页面路径和参数
 */
const getCurrentPageInfo = (): { path: string; query: Record<string, any> } => {
  try {
    const currentRoute = getCurrentRoute()
    return {
      path: currentRoute.path,
      query: currentRoute.query,
    }
  } catch (error) {
    console.warn('获取当前页面信息失败:', error)
    return {
      path: DEFAULT_SHARE.path,
      query: {},
    }
  }
}

/**
 * 构建分享参数
 * @param baseParams - 基础参数
 * @param extraParams - 额外参数
 * @param overridePath - 是否覆盖现有路径
 * @returns 合并后的分享参数
 */
const buildShareParams = (
  baseParams: Record<string, any> = {},
  extraParams: Record<string, any> = {},
  overridePath: boolean = false,
): Record<string, any> => {
  const userId = userStore.userInfo?.userId
  const finalBaseParams = overridePath ? {} : baseParams

  return {
    ...finalBaseParams,
    ...extraParams,
    ...(userId && { pid: userId }), // 只在有用户ID时添加
  }
}
```

## 平台适配

### 微信小程序

```typescript
// 微信小程序分享菜单配置
// #ifdef MP-WEIXIN
const shareMenuOptions: any = {
  withShareTicket: true,
  menus: ['shareAppMessage'],
}

// 根据页面配置决定是否显示朋友圈选项
if (pageConfig.value.enableTimeline !== false) {
  shareMenuOptions.menus.push('shareTimeline')
}

uni.showShareMenu(shareMenuOptions)
// #endif
```

**微信小程序配置要求:**

1. 在 `app.json` 或 `manifest.json` 中开启朋友圈分享：
```json
{
  "mp-weixin": {
    "setting": {
      "enableShareTimeline": true
    }
  }
}
```

2. 分享图片要求：
   - 好友分享：图片比例 5:4，最大宽度 500px
   - 朋友圈分享：正方形图片，最小 120×120px

### 支付宝小程序

```typescript
// 支付宝小程序分享面板
// #ifdef MP-ALIPAY
// @ts-expect-error - 支付宝小程序特有 API
my.showSharePanel({
  title: shareConfig.value.title,
  content: shareConfig.value.title,
  url: shareConfig.value.path,
})
// #endif
```

**支付宝小程序注意事项:**
- 分享图片需要是完整的 HTTPS URL
- 不支持朋友圈分享
- `content` 字段为分享描述

### 百度小程序

```typescript
// 百度小程序分享
// #ifdef MP-BAIDU
// @ts-expect-error - 百度小程序特有 API
swan.openShare({
  title: shareConfig.value.title,
  content: shareConfig.value.title,
  imageUrl: shareConfig.value.imageUrl,
  path: shareConfig.value.path,
})
// #endif
```

### QQ小程序

```typescript
// QQ小程序分享菜单
// #ifdef MP-QQ
// @ts-expect-error - QQ小程序特有 API
qq.showShareMenu({
  showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment'],
})
// #endif
```

**QQ小程序分享渠道:**
- `qq`: 分享给QQ好友
- `qzone`: 分享到QQ空间
- `wechatFriends`: 分享给微信好友
- `wechatMoment`: 分享到朋友圈

## 最佳实践

### 1. 商品分享带参数追踪

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
        inviteCode: 'ABC123',  // 邀请码
        source: 'share',       // 来源标识
        timestamp: Date.now()  // 分享时间戳
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

### 2. 文章分享带预览图

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'
import { ref, watch } from 'vue'

const article = ref<Article | null>(null)

const { setShareData, handleShareAppMessage, handleShareTimeline } = useShare({
  enableTimeline: true
})

// 监听文章数据变化，动态更新分享配置
watch(article, (newArticle) => {
  if (newArticle) {
    setShareData({
      title: newArticle.title,
      imageUrl: newArticle.cover || '/static/default-article.png',
      extraParams: {
        articleId: newArticle.id,
        category: newArticle.category
      }
    })
  }
}, { immediate: true })

// 加载文章
const loadArticle = async (id: string) => {
  article.value = await fetchArticleDetail(id)
}

defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
</script>
```

### 3. 私密页面禁止朋友圈分享

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

// 订单详情页 - 禁止分享到朋友圈，但允许分享给好友
const { handleShareAppMessage, handleShareTimeline, shareConfig } = useShare({
  title: '订单详情',
  enableTimeline: false  // 禁止朋友圈分享
})

// 可以查看当前配置
console.log('分享配置:', shareConfig.value)

defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
</script>
```

### 4. 活动页面动态分享

```vue
<template>
  <view class="activity-page">
    <view class="activity-content">
      <!-- 活动内容 -->
    </view>

    <view class="share-area">
      <wd-button
        type="primary"
        @click="shareToFriend"
        icon="share"
      >
        分享给好友领优惠
      </wd-button>

      <wd-button
        v-if="canShareTimeline"
        @click="shareToTimeline"
        icon="moments"
      >
        分享到朋友圈
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useShare } from '@/composables/useShare'

interface Activity {
  id: string
  title: string
  coverImage: string
  shareText: string
  enableMoments: boolean
}

const activity = ref<Activity | null>(null)

const {
  setShareData,
  triggerShare,
  canShareToTimeline,
  handleShareAppMessage,
  handleShareTimeline
} = useShare()

const canShareTimeline = computed(() => {
  return canShareToTimeline() && activity.value?.enableMoments
})

onMounted(async () => {
  // 加载活动数据
  activity.value = await fetchActivityDetail()

  // 设置分享配置
  if (activity.value) {
    setShareData({
      title: activity.value.shareText || activity.value.title,
      imageUrl: activity.value.coverImage,
      extraParams: {
        activityId: activity.value.id,
        from: 'activity_share'
      }
    })
  }
})

const shareToFriend = () => {
  triggerShare()
}

const shareToTimeline = () => {
  // 朋友圈分享逻辑
  triggerShare()
}

defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
</script>
```

### 5. 分销追踪分享

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { setShareData, handleShareAppMessage, handleShareTimeline } = useShare()

// 分销分享配置
const setupDistributionShare = (product: Product) => {
  setShareData({
    title: `我发现了一个好物：${product.name}`,
    imageUrl: product.shareImage || product.mainImage,
    extraParams: {
      productId: product.id,
      // pid 会自动添加（当前用户ID）
      // 以下是额外的分销参数
      distributorId: userStore.userInfo?.distributorId,
      shareTime: Date.now(),
      channel: 'miniapp'
    }
  })
}

defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
</script>
```

### 6. 条件分享配置

```vue
<script lang="ts" setup>
import { useShare } from '@/composables/useShare'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

const userStore = useUserStore()

// 根据用户身份决定分享配置
const shareConfig = computed(() => {
  const isVip = userStore.userInfo?.vipLevel > 0

  return {
    title: isVip
      ? '我是VIP用户，邀请你一起加入'
      : '发现一个好应用，分享给你',
    enableTimeline: isVip, // 只有VIP用户可以分享到朋友圈
  }
})

const { handleShareAppMessage, handleShareTimeline } = useShare(shareConfig.value)

defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
</script>
```

## 常见问题

### 1. 分享参数丢失？

**问题原因:**
- `extraParams` 未正确设置
- 参数值为空或 undefined
- 参数被 URL 编码影响

**解决方案:**

```typescript
// 确保在 setShareData 中正确设置 extraParams
setShareData({
  title: '分享标题',
  extraParams: {
    id: '123',
    source: 'share',
    // 避免使用空值
    category: category || 'default'
  }
})

// 调试：查看最终分享配置
console.log('分享配置:', shareConfig.value)
```

### 2. 朋友圈分享不显示？

**问题原因:**
- `enableTimeline` 设置为 `false`
- 小程序未开启朋友圈分享权限
- 页面配置中禁用了朋友圈分享

**解决方案:**

```typescript
// 1. 检查配置
const { canShareToTimeline, pageConfig } = useShare()
console.log('是否支持朋友圈:', canShareToTimeline())
console.log('页面配置:', pageConfig.value)

// 2. 确保 enableTimeline 为 true
useShare({
  enableTimeline: true
})

// 3. 检查 manifest.json 配置
// "mp-weixin": { "setting": { "enableShareTimeline": true } }
```

### 3. 多个组件共享状态？

**问题说明:**
`useShare` 采用页面级单例模式，同一页面内多次调用返回相同实例，共享分享状态。

**工作原理:**

```typescript
// 页面级实例存储
const pageShareInstances = new Map()

export const useShare = (customConfig?: PageShareConfig) => {
  const pageKey = getPageKey()

  // 检查是否已存在该页面的分享实例
  if (!pageShareInstances.has(pageKey)) {
    const instance = createShareInstance(customConfig)
    pageShareInstances.set(pageKey, instance)

    // 清理机制：页面卸载时清除实例
    onUnmounted(() => {
      pageShareInstances.delete(pageKey)
    })
  }

  return pageShareInstances.get(pageKey)
}
```

**使用建议:**
- 第一个调用 `useShare` 的组件传入自定义配置
- 后续组件直接调用 `useShare()` 获取共享实例
- 通过 `setShareData` 动态更新分享数据

### 4. 自动携带用户ID？

**实现原理:**

分享时会自动在参数中添加 `pid`（用户ID），用于分销追踪：

```typescript
const buildShareParams = (baseParams, extraParams, overridePath) => {
  const userId = userStore.userInfo?.userId
  const finalBaseParams = overridePath ? {} : baseParams

  return {
    ...finalBaseParams,
    ...extraParams,
    ...(userId && { pid: userId }) // 只在有用户ID时添加
  }
}
```

**接收分享参数:**

```typescript
// 在目标页面的 onLoad 中接收
onLoad((options) => {
  if (options?.pid) {
    // 记录推荐人ID
    console.log('推荐人ID:', options.pid)
    // 可以存储到本地或上报服务器
  }
})
```

### 5. 分享图片不显示？

**问题原因:**
- 图片URL格式错误
- 图片尺寸不符合要求
- 网络图片无法访问

**解决方案:**

```typescript
// 1. 使用完整的 HTTPS URL
setShareData({
  imageUrl: 'https://example.com/share-image.png'
})

// 2. 使用本地图片（需要是静态资源）
setShareData({
  imageUrl: '/static/share-default.png'
})

// 3. 检查图片尺寸
// 微信好友分享：5:4 比例，宽度不超过 500px
// 朋友圈分享：正方形，最小 120×120px

// 4. 提供默认图片兜底
setShareData({
  imageUrl: product.shareImage || product.mainImage || '/static/default-share.png'
})
```

### 6. 分享路径错误？

**问题原因:**
- 路径格式不正确
- 参数编码问题
- 使用了覆盖模式但未传入完整参数

**解决方案:**

```typescript
// 1. 使用 extraParams 而不是手动拼接
// ✅ 正确
setShareData({
  extraParams: {
    id: '123',
    type: 'product'
  }
})

// ❌ 错误 - 不要手动拼接路径
// shareConfig.value.path = '/pages/product/detail?id=123'

// 2. 覆盖模式使用注意
setShareData({
  overridePath: true,  // 清空原有参数
  extraParams: {
    // 需要提供完整的参数
    id: '123',
    source: 'share'
  }
})
```

### 7. 生命周期冲突？

**问题说明:**
`useShare` 内部已注册 `onLoad`、`onShareAppMessage`、`onShareTimeline` 生命周期。

**注意事项:**

```typescript
// useShare 内部已处理
onLoad((options) => {
  initShareConfig(options || {})
})

onShareAppMessage(() => {
  return handleShareAppMessage()
})

onShareTimeline(() => {
  return handleShareTimeline()
})

// 但仍需通过 defineExpose 暴露
defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
```

### 8. TypeScript 类型错误？

**常见类型问题:**

```typescript
// 1. 平台特有 API 类型提示
// 使用 @ts-expect-error 忽略
// @ts-expect-error - 支付宝小程序特有 API
my.showSharePanel({...})

// 2. 返回值类型
const { shareConfig } = useShare()
// shareConfig 是 Readonly<Ref<ShareConfig>>
console.log(shareConfig.value.title)  // 正确
// shareConfig.value.title = 'xxx'    // 错误，只读

// 3. 自定义配置类型
const config: PageShareConfig = {
  title: '自定义标题',
  enableTimeline: true
}
useShare(config)
```

## 注意事项

### 分享图片规范

| 平台 | 分享类型 | 图片比例 | 建议尺寸 | 最大尺寸 |
|------|---------|---------|---------|---------|
| 微信 | 好友分享 | 5:4 | 500×400px | - |
| 微信 | 朋友圈 | 1:1 | 120×120px | - |
| 支付宝 | 好友分享 | 自适应 | 200×200px | 1MB |
| 百度 | 好友分享 | 自适应 | 300×300px | - |
| QQ | 好友分享 | 5:4 | 500×400px | - |

### 分享标题限制

| 平台 | 最大长度 | 超出处理 |
|------|---------|---------|
| 微信小程序 | 无明确限制 | 过长会截断显示 |
| 支付宝小程序 | 128字符 | 自动截断 |
| 百度小程序 | 128字符 | 自动截断 |
| QQ小程序 | 无明确限制 | 过长会截断显示 |

### 性能优化建议

1. **避免频繁调用 setShareData**：批量更新数据时，合并为一次调用
2. **图片预处理**：使用 CDN 加速，确保图片加载速度
3. **参数精简**：只传递必要的参数，减少 URL 长度
4. **延迟加载**：非关键分享数据可延迟设置

```typescript
// ✅ 推荐：合并更新
setShareData({
  title: product.name,
  imageUrl: product.image,
  extraParams: { id: product.id }
})

// ❌ 不推荐：多次更新
setShareData({ title: product.name })
setShareData({ imageUrl: product.image })
setShareData({ extraParams: { id: product.id } })
```
