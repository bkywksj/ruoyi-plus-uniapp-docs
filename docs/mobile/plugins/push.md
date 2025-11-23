# 推送插件

## 介绍

推送插件为 RuoYi-Plus-UniApp 提供完整的消息推送能力,支持 App 端原生推送、小程序订阅消息、H5 Web Push 等多种推送方式。通过统一的推送管理接口,开发者可以轻松实现消息推送、角标管理、通知点击处理等功能,确保用户及时收到重要信息通知。

插件支持个推、极光、小米、华为、OPPO、vivo 等主流推送服务商,同时也支持微信小程序的订阅消息和服务通知。提供了完整的推送生命周期管理,包括注册、接收、展示、点击处理等环节,帮助开发者构建专业的消息推送体验。

**核心特性:**

- **多平台支持** - 支持 App、小程序、H5 等多端推送
- **多厂商兼容** - 支持个推、极光、小米、华为等主流推送通道
- **订阅消息** - 支持小程序订阅消息和服务通知
- **消息处理** - 完整的消息接收、展示、点击处理流程
- **角标管理** - 支持应用角标数字设置和清除
- **静默推送** - 支持静默推送用于后台数据同步

## 平台支持

| 功能 | App | H5 | 微信小程序 | 支付宝小程序 | 说明 |
|------|-----|-----|-----------|-------------|------|
| 原生推送 | ✅ | ❌ | ❌ | ❌ | 仅 App 支持 |
| 订阅消息 | ❌ | ❌ | ✅ | ✅ | 小程序专属 |
| Web Push | ❌ | ⚠️ | ❌ | ❌ | 需浏览器支持 |
| 角标管理 | ✅ | ❌ | ❌ | ❌ | 仅 App 支持 |
| 静默推送 | ✅ | ❌ | ❌ | ❌ | 仅 App 支持 |

## 推送配置

### App 端配置

在 `manifest.json` 中配置推送服务:

```json
{
  "app-plus": {
    "distribute": {
      "sdkConfigs": {
        "push": {
          "unipush": {
            "appid": "你的 UniPush AppID",
            "icons": {
              "small": {
                "ldpi": "static/push/icon-ldpi.png",
                "mdpi": "static/push/icon-mdpi.png",
                "hdpi": "static/push/icon-hdpi.png",
                "xhdpi": "static/push/icon-xhdpi.png"
              }
            }
          }
        }
      }
    },
    "modules": {
      "Push": {}
    }
  }
}
```

### 厂商通道配置

配置各厂商推送通道以提高到达率:

```json
{
  "app-plus": {
    "distribute": {
      "sdkConfigs": {
        "push": {
          "unipush": {
            "appid": "你的 AppID",
            "hms": {
              "appid": "华为 AppID",
              "client_secret": "华为 Client Secret"
            },
            "mi": {
              "appid": "小米 AppID",
              "appkey": "小米 AppKey"
            },
            "oppo": {
              "appid": "OPPO AppID",
              "appkey": "OPPO AppKey",
              "appsecret": "OPPO AppSecret"
            },
            "vivo": {
              "appid": "vivo AppID",
              "appkey": "vivo AppKey"
            },
            "meizu": {
              "appid": "魅族 AppID",
              "appkey": "魅族 AppKey"
            }
          }
        }
      }
    }
  }
}
```

## 基本用法

### 获取推送标识

获取设备的推送唯一标识(CID/ClientID):

```vue
<template>
  <view class="push-demo">
    <wd-button @click="getClientId">获取推送标识</wd-button>
    <view class="cid-info" v-if="clientId">
      <text>ClientID:</text>
      <text class="cid">{{ clientId }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const clientId = ref('')

// 获取推送标识
const getClientId = () => {
  // #ifdef APP-PLUS
  const cid = plus.push.getClientInfo().clientid
  if (cid) {
    clientId.value = cid
    console.log('ClientID:', cid)

    // 上报到服务器
    reportClientIdToServer(cid)
  } else {
    uni.showToast({ title: '获取推送标识失败', icon: 'error' })
  }
  // #endif

  // #ifndef APP-PLUS
  uni.showToast({ title: '当前平台不支持原生推送', icon: 'none' })
  // #endif
}

// 上报 ClientID 到服务器
const reportClientIdToServer = async (cid: string) => {
  try {
    await uni.request({
      url: '/api/user/bindPush',
      method: 'POST',
      data: { clientId: cid }
    })
    console.log('推送标识已上报')
  } catch (error) {
    console.error('上报失败:', error)
  }
}

onMounted(() => {
  // #ifdef APP-PLUS
  // 等待推送模块就绪
  setTimeout(getClientId, 1000)
  // #endif
})
</script>

<style lang="scss" scoped>
.push-demo {
  padding: 32rpx;
}

.cid-info {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;

  text {
    display: block;
    font-size: 26rpx;
    color: #666;
  }

  .cid {
    font-size: 24rpx;
    color: #333;
    word-break: break-all;
  }
}
</style>
```

### 监听推送消息

监听推送消息的接收和点击:

```typescript
// utils/push.ts
export const initPushListener = () => {
  // #ifdef APP-PLUS
  // 监听推送消息接收
  plus.push.addEventListener('receive', (msg: any) => {
    console.log('收到推送消息:', msg)

    // 处理透传消息
    if (msg.type === 'receive') {
      handleTransparentMessage(msg.payload)
    }

    // 处理通知消息
    if (msg.type === 'click') {
      handleNotificationClick(msg.payload)
    }
  }, false)

  // 监听推送消息点击
  plus.push.addEventListener('click', (msg: any) => {
    console.log('点击推送消息:', msg)
    handleNotificationClick(msg.payload)
  }, false)
  // #endif
}

// 处理透传消息
const handleTransparentMessage = (payload: any) => {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload

    // 根据消息类型处理
    switch (data.type) {
      case 'order':
        // 刷新订单数据
        uni.$emit('refreshOrder', data)
        break
      case 'message':
        // 更新消息未读数
        uni.$emit('updateUnreadCount', data.count)
        break
      default:
        console.log('未知消息类型:', data.type)
    }
  } catch (error) {
    console.error('解析透传消息失败:', error)
  }
}

// 处理通知点击
const handleNotificationClick = (payload: any) => {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload

    // 根据消息类型跳转
    switch (data.type) {
      case 'order':
        uni.navigateTo({
          url: `/pages/order/detail?id=${data.orderId}`
        })
        break
      case 'message':
        uni.navigateTo({
          url: '/pages/message/index'
        })
        break
      case 'activity':
        uni.navigateTo({
          url: `/pages/activity/detail?id=${data.activityId}`
        })
        break
      default:
        // 默认跳转首页
        uni.switchTab({ url: '/pages/index/index' })
    }
  } catch (error) {
    console.error('处理通知点击失败:', error)
    uni.switchTab({ url: '/pages/index/index' })
  }
}
```

### 在 App.vue 中初始化

```vue
<script lang="ts" setup>
import { onLaunch } from '@dcloudio/uni-app'
import { initPushListener } from '@/utils/push'

onLaunch(() => {
  // 初始化推送监听
  initPushListener()

  // #ifdef APP-PLUS
  // 检查是否有冷启动推送消息
  const launchInfo = plus.runtime.arguments
  if (launchInfo) {
    try {
      const data = JSON.parse(launchInfo)
      if (data.type) {
        // 延迟处理,等待页面加载完成
        setTimeout(() => {
          handleNotificationClick(data)
        }, 1000)
      }
    } catch (e) {
      // 非推送消息参数
    }
  }
  // #endif
})
</script>
```

## 小程序订阅消息

### 请求订阅

请求用户订阅消息:

```vue
<template>
  <view class="subscribe-demo">
    <wd-button @click="requestSubscribe">订阅消息</wd-button>
  </view>
</template>

<script lang="ts" setup>
// 订阅消息模板 ID
const TEMPLATE_IDS = [
  'template_id_1',  // 订单状态通知
  'template_id_2',  // 发货通知
  'template_id_3'   // 活动提醒
]

// 请求订阅
const requestSubscribe = () => {
  // #ifdef MP-WEIXIN
  uni.requestSubscribeMessage({
    tmplIds: TEMPLATE_IDS,
    success: (res) => {
      console.log('订阅结果:', res)

      // 检查每个模板的订阅状态
      const subscribed = TEMPLATE_IDS.filter(id => res[id] === 'accept')
      const rejected = TEMPLATE_IDS.filter(id => res[id] === 'reject')

      if (subscribed.length > 0) {
        uni.showToast({
          title: `成功订阅 ${subscribed.length} 条`,
          icon: 'success'
        })

        // 上报订阅状态
        reportSubscribeStatus(res)
      }

      if (rejected.length > 0) {
        console.log('用户拒绝订阅:', rejected)
      }
    },
    fail: (error) => {
      console.error('订阅失败:', error)

      if (error.errCode === 20004) {
        // 用户关闭了订阅消息
        uni.showModal({
          title: '订阅提示',
          content: '您已关闭订阅消息,请在设置中开启',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({})
            }
          }
        })
      }
    }
  })
  // #endif

  // #ifdef MP-ALIPAY
  my.requestSubscribeMessage({
    entityIds: TEMPLATE_IDS,
    success: (res) => {
      console.log('订阅结果:', res)
    }
  })
  // #endif
}

// 上报订阅状态
const reportSubscribeStatus = async (status: Record<string, string>) => {
  try {
    await uni.request({
      url: '/api/subscribe/report',
      method: 'POST',
      data: { status }
    })
  } catch (error) {
    console.error('上报订阅状态失败:', error)
  }
}
</script>
```

### 一次性订阅策略

每次使用功能时引导订阅:

```vue
<template>
  <view class="order-demo">
    <wd-button type="primary" @click="submitOrder">提交订单</wd-button>
  </view>
</template>

<script lang="ts" setup>
// 订单相关模板
const ORDER_TEMPLATES = [
  'order_status_template',   // 订单状态变更
  'delivery_template'        // 发货通知
]

// 提交订单
const submitOrder = async () => {
  // 先请求订阅
  // #ifdef MP-WEIXIN
  try {
    await requestOrderSubscribe()
  } catch (e) {
    // 订阅失败不影响下单
  }
  // #endif

  // 提交订单
  await doSubmitOrder()
}

// 请求订单相关订阅
const requestOrderSubscribe = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.requestSubscribeMessage({
      tmplIds: ORDER_TEMPLATES,
      success: () => resolve(),
      fail: (error) => reject(error)
    })
    // #endif
    // #ifndef MP-WEIXIN
    resolve()
    // #endif
  })
}

// 执行下单
const doSubmitOrder = async () => {
  // 提交订单逻辑
  uni.showLoading({ title: '提交中...' })

  try {
    // await orderApi.submit(orderData)
    uni.hideLoading()
    uni.showToast({ title: '下单成功', icon: 'success' })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '下单失败', icon: 'error' })
  }
}
</script>
```

## 角标管理

### 设置角标数字

```typescript
// utils/badge.ts

/**
 * 设置应用角标数字
 */
export const setBadgeNumber = (num: number) => {
  // #ifdef APP-PLUS
  plus.runtime.setBadgeNumber(num)
  // #endif
}

/**
 * 清除角标
 */
export const clearBadge = () => {
  // #ifdef APP-PLUS
  plus.runtime.setBadgeNumber(0)
  // #endif
}

/**
 * 增加角标数字
 */
export const increaseBadge = (increment: number = 1) => {
  // #ifdef APP-PLUS
  // 获取当前角标数(需要自己维护)
  const current = uni.getStorageSync('badgeNumber') || 0
  const newNum = current + increment
  uni.setStorageSync('badgeNumber', newNum)
  plus.runtime.setBadgeNumber(newNum)
  // #endif
}
```

### 使用示例

```vue
<script lang="ts" setup>
import { onMounted } from 'vue'
import { setBadgeNumber, clearBadge } from '@/utils/badge'

onMounted(() => {
  // 获取未读消息数并设置角标
  fetchUnreadCount()
})

// 获取未读数
const fetchUnreadCount = async () => {
  try {
    const res = await uni.request({
      url: '/api/message/unreadCount'
    })
    const count = res.data.data
    setBadgeNumber(count)
  } catch (error) {
    console.error('获取未读数失败:', error)
  }
}

// 标记已读时清除角标
const markAsRead = async () => {
  try {
    await uni.request({
      url: '/api/message/markAllRead',
      method: 'POST'
    })
    clearBadge()
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}
</script>
```

## 高级用法

### 封装推送 Composable

```typescript
// composables/usePush.ts
import { ref, onMounted, onUnmounted } from 'vue'

export interface PushMessage {
  title: string
  content: string
  payload: any
  type: 'notification' | 'transparent'
}

export const usePush = () => {
  const clientId = ref('')
  const lastMessage = ref<PushMessage | null>(null)
  const unreadCount = ref(0)

  /**
   * 初始化推送
   */
  const init = () => {
    // #ifdef APP-PLUS
    // 获取 ClientID
    const cid = plus.push.getClientInfo().clientid
    if (cid) {
      clientId.value = cid
    }

    // 监听消息
    plus.push.addEventListener('receive', onReceive, false)
    plus.push.addEventListener('click', onClick, false)
    // #endif
  }

  /**
   * 接收消息
   */
  const onReceive = (msg: any) => {
    console.log('收到推送:', msg)

    lastMessage.value = {
      title: msg.title || '',
      content: msg.content || '',
      payload: msg.payload,
      type: msg.type === 'receive' ? 'transparent' : 'notification'
    }

    // 更新未读数
    unreadCount.value++

    // 触发事件
    uni.$emit('pushReceived', lastMessage.value)
  }

  /**
   * 点击消息
   */
  const onClick = (msg: any) => {
    console.log('点击推送:', msg)

    const payload = typeof msg.payload === 'string'
      ? JSON.parse(msg.payload)
      : msg.payload

    // 触发事件
    uni.$emit('pushClicked', payload)

    // 处理跳转
    handleNavigation(payload)
  }

  /**
   * 处理跳转
   */
  const handleNavigation = (payload: any) => {
    if (!payload?.url) return

    if (payload.url.startsWith('/pages/')) {
      if (payload.isTab) {
        uni.switchTab({ url: payload.url })
      } else {
        uni.navigateTo({ url: payload.url })
      }
    }
  }

  /**
   * 创建本地通知
   */
  const createLocalNotification = (options: {
    title: string
    content: string
    payload?: any
    delay?: number
  }) => {
    // #ifdef APP-PLUS
    plus.push.createMessage(
      options.content,
      options.payload ? JSON.stringify(options.payload) : undefined,
      {
        title: options.title,
        delay: options.delay
      }
    )
    // #endif
  }

  /**
   * 清除所有通知
   */
  const clearNotifications = () => {
    // #ifdef APP-PLUS
    plus.push.clear()
    // #endif
  }

  /**
   * 设置角标
   */
  const setBadge = (num: number) => {
    unreadCount.value = num
    // #ifdef APP-PLUS
    plus.runtime.setBadgeNumber(num)
    // #endif
  }

  /**
   * 清除角标
   */
  const clearBadge = () => {
    unreadCount.value = 0
    // #ifdef APP-PLUS
    plus.runtime.setBadgeNumber(0)
    // #endif
  }

  /**
   * 销毁
   */
  const destroy = () => {
    // #ifdef APP-PLUS
    plus.push.removeEventListener('receive', onReceive)
    plus.push.removeEventListener('click', onClick)
    // #endif
  }

  onMounted(init)
  onUnmounted(destroy)

  return {
    clientId,
    lastMessage,
    unreadCount,
    createLocalNotification,
    clearNotifications,
    setBadge,
    clearBadge
  }
}
```

### 使用推送 Composable

```vue
<template>
  <view class="push-manager-demo">
    <view class="info">
      <text>ClientID: {{ clientId || '未获取' }}</text>
      <text>未读消息: {{ unreadCount }}</text>
    </view>

    <view class="actions">
      <wd-button @click="sendLocalNotification">发送本地通知</wd-button>
      <wd-button @click="clearNotifications">清除通知</wd-button>
      <wd-button @click="clearBadge">清除角标</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { usePush } from '@/composables/usePush'

const {
  clientId,
  unreadCount,
  createLocalNotification,
  clearNotifications,
  clearBadge
} = usePush()

// 发送本地通知
const sendLocalNotification = () => {
  createLocalNotification({
    title: '测试通知',
    content: '这是一条本地推送消息',
    payload: {
      type: 'test',
      url: '/pages/message/index'
    },
    delay: 3  // 3秒后显示
  })

  uni.showToast({ title: '3秒后显示通知', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.push-manager-demo {
  padding: 32rpx;
}

.info {
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;

  text {
    display: block;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 8rpx;
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
</style>
```

### 推送标签管理

```typescript
// utils/pushTag.ts

/**
 * 设置用户标签
 */
export const setUserTags = (tags: string[]) => {
  // #ifdef APP-PLUS
  // 使用 UniPush 设置标签
  const cid = plus.push.getClientInfo().clientid
  if (cid) {
    // 调用服务端接口设置标签
    uni.request({
      url: '/api/push/setTags',
      method: 'POST',
      data: {
        clientId: cid,
        tags
      }
    })
  }
  // #endif
}

/**
 * 根据用户属性设置标签
 */
export const setTagsByUser = (user: {
  gender?: string
  city?: string
  vipLevel?: number
  interests?: string[]
}) => {
  const tags: string[] = []

  if (user.gender) {
    tags.push(`gender_${user.gender}`)
  }

  if (user.city) {
    tags.push(`city_${user.city}`)
  }

  if (user.vipLevel) {
    tags.push(`vip_${user.vipLevel}`)
  }

  if (user.interests) {
    user.interests.forEach(interest => {
      tags.push(`interest_${interest}`)
    })
  }

  setUserTags(tags)
}
```

## API 参考

### usePush 返回值

```typescript
interface UsePushReturn {
  /** 设备推送标识 */
  clientId: Ref<string>

  /** 最后收到的消息 */
  lastMessage: Ref<PushMessage | null>

  /** 未读消息数 */
  unreadCount: Ref<number>

  /** 创建本地通知 */
  createLocalNotification: (options: LocalNotificationOptions) => void

  /** 清除所有通知 */
  clearNotifications: () => void

  /** 设置角标 */
  setBadge: (num: number) => void

  /** 清除角标 */
  clearBadge: () => void
}
```

### LocalNotificationOptions

```typescript
interface LocalNotificationOptions {
  /** 通知标题 */
  title: string

  /** 通知内容 */
  content: string

  /** 附加数据 */
  payload?: any

  /** 延迟显示(秒) */
  delay?: number
}
```

### PushMessage

```typescript
interface PushMessage {
  /** 消息标题 */
  title: string

  /** 消息内容 */
  content: string

  /** 附加数据 */
  payload: any

  /** 消息类型 */
  type: 'notification' | 'transparent'
}
```

## 最佳实践

### 1. 合理使用订阅消息

```typescript
// 在用户操作节点请求订阅
const submitOrder = async () => {
  // 下单前请求订阅
  await requestSubscribe(['order_status', 'delivery'])

  // 执行下单
  await doSubmitOrder()
}

// 避免频繁打扰用户
const checkSubscribeFrequency = (): boolean => {
  const lastTime = uni.getStorageSync('lastSubscribeTime')
  const now = Date.now()

  // 24小时内只请求一次
  if (lastTime && now - lastTime < 24 * 60 * 60 * 1000) {
    return false
  }

  uni.setStorageSync('lastSubscribeTime', now)
  return true
}
```

### 2. 处理推送权限

```typescript
// 检查推送权限状态
const checkPushPermission = async () => {
  // #ifdef APP-PLUS
  if (plus.os.name === 'Android') {
    // Android 检查通知权限
    const main = plus.android.runtimeMainActivity()
    const NotificationManagerCompat = plus.android.importClass(
      'androidx.core.app.NotificationManagerCompat'
    )
    const enabled = NotificationManagerCompat.from(main).areNotificationsEnabled()

    if (!enabled) {
      showEnableNotificationDialog()
    }
  }
  // #endif
}

// 引导开启通知
const showEnableNotificationDialog = () => {
  uni.showModal({
    title: '通知权限',
    content: '为了及时收到订单通知,请开启通知权限',
    confirmText: '去设置',
    success: (res) => {
      if (res.confirm) {
        openNotificationSettings()
      }
    }
  })
}
```

### 3. 消息去重

```typescript
// 消息去重处理
const processedMessages = new Set<string>()

const handleMessage = (msg: PushMessage) => {
  // 生成消息唯一标识
  const msgId = `${msg.payload?.id || ''}_${Date.now()}`

  // 检查是否已处理
  if (processedMessages.has(msgId)) {
    return
  }

  // 标记为已处理
  processedMessages.add(msgId)

  // 处理消息
  // ...

  // 定期清理(保留最近100条)
  if (processedMessages.size > 100) {
    const arr = Array.from(processedMessages)
    arr.splice(0, arr.length - 100).forEach(id => {
      processedMessages.delete(id)
    })
  }
}
```

## 常见问题

### 1. 收不到推送消息

**原因分析:**
- 通知权限未开启
- ClientID 未上报
- 厂商通道未配置
- 应用被后台杀死

**解决方案:**

```typescript
// 检查推送状态
const checkPushStatus = () => {
  // #ifdef APP-PLUS
  const info = plus.push.getClientInfo()
  console.log('推送信息:', info)

  if (!info.clientid) {
    console.error('ClientID 为空')
    return
  }

  // 检查通知权限
  checkPushPermission()
  // #endif
}
```

### 2. 点击通知不跳转

**原因分析:**
- payload 格式错误
- 页面路径错误
- 应用未启动完成

**解决方案:**

```typescript
// 确保 payload 格式正确
const formatPayload = (data: any): string => {
  return JSON.stringify({
    type: data.type,
    url: data.url,
    params: data.params
  })
}

// 延迟处理跳转
const handleClickWithDelay = (payload: any) => {
  // 等待应用启动完成
  setTimeout(() => {
    handleNavigation(payload)
  }, 500)
}
```

### 3. 角标数字不更新

**原因分析:**
- iOS 需要特殊处理
- 部分 Android 机型不支持

**解决方案:**

```typescript
// 兼容处理角标
const setBadgeCompat = (num: number) => {
  // #ifdef APP-PLUS
  try {
    plus.runtime.setBadgeNumber(num)
  } catch (error) {
    console.error('设置角标失败:', error)
    // 部分机型不支持,静默失败
  }
  // #endif
}
```
