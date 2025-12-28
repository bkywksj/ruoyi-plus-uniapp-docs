# useSubscribe 订阅消息

## 介绍

`useSubscribe` 是 RuoYi-Plus-UniApp 移动端的小程序订阅消息管理 Composable，用于在微信小程序中请求用户授权订阅消息模板，并管理订阅记录。通过统一的接口简化订阅消息的开发流程。

**核心特性:**

- **模板管理** - 从服务器获取订阅模板配置，支持缓存优化
- **灵活订阅** - 支持通过模板ID或标题关键词订阅
- **记录追踪** - 自动记录订阅状态，支持检查是否已订阅
- **批量订阅** - 支持一次性订阅所有可用模板
- **平台兼容** - 自动判断运行环境，非小程序环境优雅降级

## 基本用法

### 引入与初始化

```typescript
import { useSubscribe } from '@/composables/useSubscribe'

// 使用默认配置（使用系统配置的 appid）
const {
  templates,
  loading,
  loadTemplates,
  subscribe,
  subscribeAll,
  isSubscribed
} = useSubscribe()

// 指定 appid
const subscribeStore = useSubscribe('wx1234567890abcdef')
```

### 加载模板配置

```typescript
import { useSubscribe } from '@/composables/useSubscribe'

const { templates, loading, loadTemplates } = useSubscribe()

// 页面加载时获取模板
onMounted(async () => {
  await loadTemplates()
  console.log('可用模板:', templates.value)
})

// 强制刷新模板（忽略缓存）
const refreshTemplates = async () => {
  await loadTemplates(true)
}
```

### 订阅单个消息

```typescript
import { useSubscribe } from '@/composables/useSubscribe'

const { subscribe } = useSubscribe()

// 通过模板ID订阅
const subscribeById = async () => {
  const result = await subscribe('Abc123TemplateId')

  if (result.success) {
    console.log('订阅成功的模板:', result.subscribedIds)
  } else {
    console.log('订阅失败:', result.errMsg)
  }
}

// 通过模板标题订阅
const subscribeByTitle = async () => {
  const result = await subscribe('订单发货')

  if (result.success) {
    uni.showToast({ title: '订阅成功' })
  }
}
```

### 订阅多个消息

```typescript
import { useSubscribe } from '@/composables/useSubscribe'

const { subscribe } = useSubscribe()

// 同时订阅多个模板
const subscribeMultiple = async () => {
  const result = await subscribe([
    '订单发货',    // 标题关键词
    '支付成功',    // 标题关键词
    'TemplateId3'  // 模板ID
  ])

  console.log('订阅成功:', result.subscribedIds)
  console.log('用户拒绝:', result.rejectedIds)
  console.log('订阅失败:', result.failedIds)
}
```

### 订阅所有可用模板

```typescript
import { useSubscribe } from '@/composables/useSubscribe'

const { subscribeAll } = useSubscribe()

// 一键订阅所有模板
const handleSubscribeAll = async () => {
  const result = await subscribeAll()

  if (result.success) {
    uni.showToast({
      title: `成功订阅 ${result.subscribedIds.length} 个消息`
    })
  }
}
```

### 检查订阅状态

```typescript
import { useSubscribe } from '@/composables/useSubscribe'

const { isSubscribed, loadTemplates } = useSubscribe()

onMounted(async () => {
  await loadTemplates()

  // 检查是否已订阅
  if (isSubscribed('订单发货')) {
    console.log('已订阅订单发货通知')
  } else {
    // 提示用户订阅
    showSubscribeDialog()
  }
})
```

## 实际应用场景

### 订单支付后引导订阅

```vue
<template>
  <view class="payment-success">
    <wd-icon name="check-circle" size="80" color="#52c41a" />
    <text class="title">支付成功</text>

    <view class="subscribe-tip" v-if="!hasSubscribed">
      <text>订阅消息，及时获取物流动态</text>
      <wd-button type="primary" @click="handleSubscribe">
        订阅发货通知
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useSubscribe } from '@/composables/useSubscribe'

const { subscribe, isSubscribed, loadTemplates } = useSubscribe()

const hasSubscribed = ref(false)

onMounted(async () => {
  await loadTemplates()
  hasSubscribed.value = isSubscribed('订单发货')
})

const handleSubscribe = async () => {
  const result = await subscribe('订单发货')

  if (result.success) {
    hasSubscribed.value = true
    uni.showToast({ title: '订阅成功' })
  } else if (result.rejectedIds.length > 0) {
    uni.showToast({ title: '您已拒绝订阅', icon: 'none' })
  }
}
</script>
```

### 设置页面管理订阅

```vue
<template>
  <view class="subscribe-settings">
    <wd-cell-group title="消息订阅">
      <wd-cell
        v-for="template in templates"
        :key="template.templateId"
        :title="template.title"
        :label="template.remark"
      >
        <template #right-icon>
          <wd-switch
            :model-value="subscribeStatus[template.templateId]"
            @change="(val) => handleToggle(template.templateId, val)"
          />
        </template>
      </wd-cell>
    </wd-cell-group>

    <view class="actions">
      <wd-button type="primary" block @click="handleSubscribeAll">
        一键订阅全部
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useSubscribe } from '@/composables/useSubscribe'

const {
  templates,
  loadTemplates,
  subscribe,
  subscribeAll,
  isSubscribed
} = useSubscribe()

const subscribeStatus = reactive<Record<string, boolean>>({})

onMounted(async () => {
  await loadTemplates()

  // 初始化订阅状态
  templates.value.forEach((t) => {
    subscribeStatus[t.templateId] = isSubscribed(t.templateId)
  })
})

const handleToggle = async (templateId: string, value: boolean) => {
  if (value) {
    const result = await subscribe(templateId)
    subscribeStatus[templateId] = result.success
  }
  // 注意：小程序不支持取消订阅，只能由用户在系统设置中关闭
}

const handleSubscribeAll = async () => {
  const result = await subscribeAll()

  result.subscribedIds.forEach((id) => {
    subscribeStatus[id] = true
  })

  uni.showToast({
    title: `成功订阅 ${result.subscribedIds.length} 个`,
    icon: result.subscribedIds.length > 0 ? 'success' : 'none'
  })
}
</script>
```

### 结合业务场景按需订阅

```typescript
import { useSubscribe } from '@/composables/useSubscribe'

// 订单相关订阅
export function useOrderSubscribe() {
  const { subscribe, isSubscribed, markSubscribeSent } = useSubscribe()

  // 下单时订阅发货通知
  const subscribeShipping = async () => {
    if (!isSubscribed('订单发货')) {
      await subscribe('订单发货')
    }
  }

  // 订单发货后标记已发送
  const onOrderShipped = (orderId: string) => {
    markSubscribeSent('订单发货')
    // 后端会发送订阅消息
  }

  return {
    subscribeShipping,
    onOrderShipped
  }
}

// 活动相关订阅
export function useActivitySubscribe() {
  const { subscribe, subscribeAll } = useSubscribe()

  // 报名活动时订阅提醒
  const subscribeActivity = async () => {
    return await subscribe(['活动开始', '活动结束'])
  }

  return {
    subscribeActivity
  }
}
```

## API 详解

### 参数

```typescript
const useSubscribe: (appid?: string) => SubscribeComposable
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `appid` | `string` | 否 | 小程序 AppID，默认使用系统配置 |

### 返回值

#### templates

订阅模板配置列表。

```typescript
const templates: ComputedRef<TemplateConfig[]>

interface TemplateConfig {
  /** 模板ID */
  templateId: string
  /** 模板标题 */
  title: string
  /** 模板备注 */
  remark?: string
}
```

#### loading

模板加载状态。

```typescript
const loading: ComputedRef<boolean>
```

#### availableTemplateIds

可用的模板ID列表。

```typescript
const availableTemplateIds: ComputedRef<string[]>
```

### 方法

#### loadTemplates

加载订阅模板配置。

```typescript
const loadTemplates: (forceRefresh?: boolean) => Promise<void>
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `forceRefresh` | `boolean` | `false` | 是否强制刷新（忽略缓存） |

**功能说明:**
- 优先从缓存读取（5分钟有效期）
- 缓存失效时从服务器获取
- 强制刷新时跳过缓存

#### findTemplates

根据关键词查找模板。

```typescript
const findTemplates: (...keywords: string[]) => TemplateConfig[]
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `keywords` | `string[]` | 关键词数组，匹配标题或备注 |

**使用示例:**

```typescript
// 查找包含"订单"的模板
const orderTemplates = findTemplates('订单')

// 查找多个关键词
const templates = findTemplates('发货', '支付', '退款')
```

#### subscribe

订阅消息模板。

```typescript
const subscribe: (templateIdsOrTitles: string | string[]) => Promise<SubscribeResult>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `templateIdsOrTitles` | `string \| string[]` | 模板ID或标题关键词 |

**返回值:**

```typescript
interface SubscribeResult {
  /** 是否有成功订阅的模板 */
  success: boolean
  /** 成功订阅的模板ID */
  subscribedIds: string[]
  /** 订阅失败的模板ID */
  failedIds: string[]
  /** 用户拒绝的模板ID */
  rejectedIds: string[]
  /** 错误信息 */
  errMsg: string
}
```

**使用示例:**

```typescript
// 单个订阅
const result = await subscribe('订单发货')

// 批量订阅
const result = await subscribe(['订单发货', '支付成功', 'TemplateId'])

// 处理结果
if (result.success) {
  console.log('订阅成功:', result.subscribedIds)
}
if (result.rejectedIds.length > 0) {
  console.log('用户拒绝:', result.rejectedIds)
}
```

#### subscribeAll

订阅所有可用模板。

```typescript
const subscribeAll: () => Promise<SubscribeResult>
```

**使用示例:**

```typescript
const result = await subscribeAll()
console.log(`共订阅 ${result.subscribedIds.length} 个模板`)
```

#### isSubscribed

检查是否已订阅（且未发送）。

```typescript
const isSubscribed: (templateIdOrTitle: string) => boolean
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `templateIdOrTitle` | `string` | 模板ID或标题关键词 |

**使用示例:**

```typescript
if (isSubscribed('订单发货')) {
  console.log('用户已订阅发货通知')
}
```

#### markSubscribeSent

标记订阅消息已发送。

```typescript
const markSubscribeSent: (templateId: string) => void
```

**使用说明:**

当后端发送订阅消息后调用此方法，用于更新本地记录状态。

```typescript
// 订单发货后标记已发送
markSubscribeSent('TemplateId123')
```

#### clearSubscribeRecords

清理所有订阅记录。

```typescript
const clearSubscribeRecords: () => void
```

## 类型定义

### TemplateConfig

```typescript
/**
 * 订阅模板配置
 */
interface TemplateConfig {
  /** 模板ID */
  templateId: string
  /** 模板标题 */
  title: string
  /** 模板备注说明 */
  remark?: string
}
```

### SubscribeResult

```typescript
/**
 * 订阅结果
 */
interface SubscribeResult {
  /** 是否有成功订阅的模板 */
  success: boolean
  /** 成功订阅的模板ID列表 */
  subscribedIds: string[]
  /** 订阅失败的模板ID列表 */
  failedIds: string[]
  /** 用户拒绝订阅的模板ID列表 */
  rejectedIds: string[]
  /** 错误信息 */
  errMsg: string
}
```

### SubscribeRecord

```typescript
/**
 * 本地订阅记录
 */
interface SubscribeRecord {
  /** 模板ID */
  templateId: string
  /** 订阅时间戳 */
  subscribedAt: number
  /** 是否已发送消息 */
  sent: boolean
}
```

### SubscribeComposable

```typescript
interface SubscribeComposable {
  /** 模板配置列表 */
  templates: ComputedRef<TemplateConfig[]>
  /** 加载状态 */
  loading: ComputedRef<boolean>
  /** 可用的模板ID列表 */
  availableTemplateIds: ComputedRef<string[]>
  /** 加载模板配置 */
  loadTemplates: (forceRefresh?: boolean) => Promise<void>
  /** 查找模板 */
  findTemplates: (...keywords: string[]) => TemplateConfig[]
  /** 订阅消息 */
  subscribe: (templateIdsOrTitles: string | string[]) => Promise<SubscribeResult>
  /** 订阅所有消息 */
  subscribeAll: () => Promise<SubscribeResult>
  /** 检查是否已订阅 */
  isSubscribed: (templateIdOrTitle: string) => boolean
  /** 标记已发送 */
  markSubscribeSent: (templateId: string) => void
  /** 清理订阅记录 */
  clearSubscribeRecords: () => void
}
```

## 最佳实践

### 1. 在关键业务节点引导订阅

```typescript
// 订单支付成功后
const onPaymentSuccess = async () => {
  // 先显示支付成功
  uni.showToast({ title: '支付成功' })

  // 延迟引导订阅（避免打断用户体验）
  setTimeout(async () => {
    const result = await subscribe(['订单发货', '订单完成'])

    if (result.rejectedIds.length > 0) {
      // 用户拒绝，可以稍后再次引导
      saveRejectedRecord()
    }
  }, 1500)
}
```

### 2. 避免频繁弹出订阅弹窗

```typescript
import { useSubscribe } from '@/composables/useSubscribe'
import { cache } from '@/utils/cache'

const SUBSCRIBE_PROMPT_KEY = 'last_subscribe_prompt'
const PROMPT_INTERVAL = 24 * 60 * 60 * 1000 // 24小时

const { subscribe, isSubscribed } = useSubscribe()

// 检查是否应该提示订阅
const shouldPromptSubscribe = () => {
  // 已订阅则不提示
  if (isSubscribed('订单发货')) {
    return false
  }

  // 检查上次提示时间
  const lastPrompt = cache.get<number>(SUBSCRIBE_PROMPT_KEY)
  if (lastPrompt && Date.now() - lastPrompt < PROMPT_INTERVAL) {
    return false
  }

  return true
}

// 引导订阅
const promptSubscribe = async () => {
  if (!shouldPromptSubscribe()) return

  cache.set(SUBSCRIBE_PROMPT_KEY, Date.now())

  const result = await subscribe('订单发货')
  return result.success
}
```

### 3. 批量订阅优化

```typescript
// 分批订阅（小程序每次最多订阅3个模板）
const batchSubscribe = async (templateIds: string[]) => {
  const batchSize = 3
  const results: SubscribeResult[] = []

  for (let i = 0; i < templateIds.length; i += batchSize) {
    const batch = templateIds.slice(i, i + batchSize)
    const result = await subscribe(batch)
    results.push(result)

    // 如果用户取消了，停止后续订阅
    if (result.rejectedIds.length === batch.length) {
      break
    }
  }

  return results
}
```

## 常见问题

### 1. 非微信小程序环境调用报错

**问题原因：** `uni.requestSubscribeMessage` 仅在微信小程序中可用

**解决方案：** Composable 内部已处理，非小程序环境会返回失败结果

```typescript
const result = await subscribe('订单发货')

if (!result.success && result.errMsg === '当前环境不支持订阅消息') {
  // 非小程序环境，可以引导用户使用小程序
  console.log('请在微信小程序中使用此功能')
}
```

### 2. 模板ID不存在

**问题原因：** 服务器未配置该模板或模板已下架

**解决方案：**

```typescript
const result = await subscribe('不存在的模板')

if (result.errMsg === '未找到匹配的订阅模板') {
  // 刷新模板配置
  await loadTemplates(true)
  // 重试或提示用户
}
```

### 3. 用户总是拒绝订阅

**问题原因：** 用户在系统设置中关闭了订阅消息权限

**解决方案：**

```typescript
const result = await subscribe('订单发货')

if (result.rejectedIds.length > 0) {
  uni.showModal({
    title: '订阅提示',
    content: '您已关闭订阅消息，可在"设置-订阅消息"中重新开启',
    confirmText: '去设置',
    success: (res) => {
      if (res.confirm) {
        uni.openSetting()
      }
    }
  })
}
```

### 4. 订阅记录丢失

**问题原因：** 用户清除了小程序缓存

**解决方案：** 订阅记录仅用于本地判断，实际发送由后端控制

```typescript
// 后端应该维护订阅记录
// 本地记录仅作为 UI 显示参考
const { isSubscribed, clearSubscribeRecords } = useSubscribe()

// 用户重新登录时可以清理本地记录
const onUserLogin = () => {
  clearSubscribeRecords()
}
```

### 5. 缓存导致模板更新不及时

**问题原因：** 模板配置有5分钟缓存

**解决方案：**

```typescript
// 强制刷新模板配置
await loadTemplates(true)

// 或在设置页面提供刷新按钮
const handleRefresh = async () => {
  uni.showLoading({ title: '刷新中...' })
  await loadTemplates(true)
  uni.hideLoading()
  uni.showToast({ title: '刷新成功' })
}
```
