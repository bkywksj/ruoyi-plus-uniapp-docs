# usePayment

## 介绍

`usePayment` 是 RuoYi-Plus-UniApp 框架提供的统一支付管理组合式函数,专门用于处理移动端的多平台支付业务。它封装了微信支付、支付宝支付、余额支付等多种支付方式,并提供跨平台、跨端的自动适配能力,让开发者无需关心底层平台差异,即可快速实现完整的支付功能。

usePayment 通过智能平台检测机制,能够自动识别当前运行环境(H5、微信小程序、支付宝小程序、APP 等),并选择对应的支付调用方式。同时提供了完整的支付流程管理,包括订单创建、支付发起、状态查询、结果轮询等功能,极大简化了支付业务的开发复杂度。

**核心特性:**

- **多支付方式支持** - 集成微信支付、支付宝支付、余额支付三大主流支付方式
- **全平台适配** - 支持 H5(公众号/普通 H5)、微信小程序、支付宝小程序、APP(Android/iOS)等所有 UniApp 支持的平台
- **智能平台检测** - 自动识别当前运行环境,无需手动判断平台类型
- **自动交易类型选择** - 根据平台和支付方式自动选择最优交易类型(JSAPI/APP/H5/WAP/NATIVE/PAGE)
- **完整支付流程** - 提供从订单创建到支付完成的全流程管理
- **状态轮询机制** - 支持订单支付状态的轮询查询,确保支付结果准确
- **错误处理** - 统一的错误处理机制,清晰的错误提示
- **TypeScript 类型安全** - 完整的类型定义,提供良好的开发体验
- **平台能力查询** - 提供当前平台支付能力的查询接口
- **加载状态管理** - 响应式的支付loading状态,方便UI交互
- **支付方式过滤** - 根据平台能力自动过滤不支持的支付方式
- **条件编译优化** - 使用 UniApp 条件编译,确保不同平台的代码体积最优

## 基本用法

### 默认使用

最简单的使用方式,直接调用 usePayment 获取支付相关功能:

```vue
<template>
  <view class="payment-page">
    <view class="payment-info">
      <text class="label">订单金额:</text>
      <text class="amount">¥ 99.00</text>
    </view>

    <view class="payment-methods">
      <view
        v-for="method in availableMethods"
        :key="method"
        class="method-item"
        @click="handlePay(method)"
      >
        <text>{{ getMethodName(method) }}</text>
      </view>
    </view>

    <wd-button
      type="primary"
      :loading="loading"
      block
      @click="handleSubmit"
    >
      {{ loading ? '支付中...' : '立即支付' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

// 获取支付功能
const { loading, availableMethods, createOrderAndPay } = usePayment()

// 当前选择的支付方式
const selectedMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)

// 获取支付方式名称
const getMethodName = (method: PaymentMethod) => {
  const names = {
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.ALIPAY]: '支付宝支付',
    [PaymentMethod.BALANCE]: '余额支付',
  }
  return names[method] || '未知支付方式'
}

// 处理支付
const handlePay = (method: PaymentMethod) => {
  selectedMethod.value = method
}

// 提交支付
const handleSubmit = async () => {
  // 创建订单数据
  const orderData = {
    productId: '123',
    quantity: 1,
    totalAmount: 9900, // 单位:分
  }

  // 发起支付
  const [err, result] = await createOrderAndPay({
    orderData,
    paymentMethod: selectedMethod.value,
  })

  if (!err && result) {
    console.log('支付成功:', result)
    // 跳转到支付成功页面
    uni.navigateTo({
      url: '/pages/order/success',
    })
  } else {
    console.error('支付失败:', err)
  }
}
</script>

<style lang="scss" scoped>
.payment-page {
  padding: 32rpx;
}

.payment-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.amount {
  color: #ff4757;
  font-size: 40rpx;
  font-weight: bold;
}

.payment-methods {
  margin-bottom: 32rpx;
}

.method-item {
  padding: 24rpx;
  margin-bottom: 16rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}
</style>
```

**使用说明:**

- `usePayment()` 返回支付相关的状态和方法
- `availableMethods` 是根据当前平台自动过滤后的可用支付方式列表
- `loading` 是响应式的支付loading状态
- `createOrderAndPay` 是创建订单并支付的核心方法
- 框架会自动识别平台并选择正确的支付方式

### 支付已有订单

对于已经创建好的订单,可以直接调用 `payOrder` 方法发起支付:

```vue
<template>
  <view class="order-detail">
    <view class="order-info">
      <text class="order-no">订单号: {{ orderNo }}</text>
      <text class="order-amount">¥ {{ orderAmount }}</text>
    </view>

    <view class="payment-section">
      <text class="section-title">选择支付方式</text>
      <wd-radio-group v-model="selectedMethod">
        <wd-radio
          v-for="method in availableMethods"
          :key="method"
          :value="method"
        >
          {{ getMethodName(method) }}
        </wd-radio>
      </wd-radio-group>
    </view>

    <wd-button
      type="primary"
      :loading="loading"
      block
      @click="handlePayOrder"
    >
      确认支付
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

// Props
const props = defineProps<{
  orderNo: string
  orderAmount: number
}>()

// 获取支付功能
const { loading, availableMethods, payOrder } = usePayment()

// 当前选择的支付方式
const selectedMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)

// 获取支付方式名称
const getMethodName = (method: PaymentMethod) => {
  const names = {
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.ALIPAY]: '支付宝支付',
    [PaymentMethod.BALANCE]: '余额支付',
  }
  return names[method]
}

// 支付订单
const handlePayOrder = async () => {
  const [err, result] = await payOrder({
    orderNo: props.orderNo,
    paymentMethod: selectedMethod.value,
  })

  if (!err && result) {
    console.log('支付成功:', result)
    // 支付成功处理
    uni.showToast({
      title: '支付成功',
      icon: 'success',
    })
  } else {
    console.error('支付失败:', err)
  }
}
</script>
```

**使用说明:**

- `payOrder` 方法用于支付已存在的订单
- 只需提供订单号和支付方式即可
- 适用于订单列表中的待支付订单场景
- 同样支持所有平台和支付方式

### 订单状态查询

支付完成后,需要查询订单状态确认支付结果:

```vue
<template>
  <view class="payment-status">
    <view v-if="checking" class="checking">
      <wd-loading />
      <text>正在确认支付结果...</text>
    </view>

    <view v-else class="result">
      <view v-if="paymentSuccess" class="success">
        <wd-icon name="check-circle" size="100rpx" color="#52c41a" />
        <text class="title">支付成功</text>
        <text class="order-no">订单号: {{ orderNo }}</text>
      </view>

      <view v-else class="failed">
        <wd-icon name="close-circle" size="100rpx" color="#ff4757" />
        <text class="title">支付失败</text>
        <text class="message">{{ errorMessage }}</text>
      </view>
    </view>

    <wd-button type="primary" block @click="handleReturn">
      返回首页
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { usePayment } from '@/composables/usePayment'

// Props
const props = defineProps<{
  orderNo: string
}>()

// 获取支付功能
const { queryOrderStatus } = usePayment()

// 状态
const checking = ref(true)
const paymentSuccess = ref(false)
const errorMessage = ref('')

// 查询订单状态
const checkOrderStatus = async () => {
  const [err, status] = await queryOrderStatus(props.orderNo)

  checking.value = false

  if (!err && status) {
    paymentSuccess.value = status.paid
    if (!status.paid) {
      errorMessage.value = status.message || '支付未完成'
    }
  } else {
    errorMessage.value = err?.message || '查询失败'
  }
}

// 返回首页
const handleReturn = () => {
  uni.switchTab({
    url: '/pages/home/index',
  })
}

// 页面加载时查询状态
onMounted(() => {
  checkOrderStatus()
})
</script>

<style lang="scss" scoped>
.payment-status {
  padding: 64rpx 32rpx;
  text-align: center;
}

.checking {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.result {
  margin-bottom: 64rpx;
}

.success,
.failed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
}

.order-no {
  color: #666;
  font-size: 28rpx;
}

.message {
  color: #ff4757;
  font-size: 28rpx;
}
</style>
```

**使用说明:**

- `queryOrderStatus` 用于单次查询订单状态
- 适合在支付回调页面使用
- 返回订单的支付状态信息
- 可根据状态结果进行UI展示

### 状态轮询查询

对于某些支付方式,支付状态可能会延迟更新,此时需要轮询查询:

```vue
<template>
  <view class="payment-polling">
    <view class="polling-animation">
      <wd-loading size="80rpx" />
      <text class="polling-text">正在确认支付结果...</text>
      <text class="polling-hint">请稍候,最多尝试 {{ maxRetries }} 次</text>
      <text class="polling-count">已尝试: {{ attemptCount }} 次</text>
    </view>

    <wd-button plain @click="handleCancel">
      取消查询
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { usePayment } from '@/composables/usePayment'

// Props
const props = defineProps<{
  orderNo: string
}>()

// 获取支付功能
const { pollOrderStatus } = usePayment()

// 状态
const maxRetries = ref(5)
const attemptCount = ref(0)
const polling = ref(false)

// 轮询查询订单状态
const startPolling = async () => {
  if (polling.value) return

  polling.value = true

  // 使用轮询方法,最多重试5次
  const [err, [statusErr, status]] = await pollOrderStatus(
    props.orderNo,
    maxRetries.value,
  )

  polling.value = false

  if (!err && !statusErr && status) {
    // 查询成功
    if (status.paid) {
      uni.showToast({
        title: '支付成功',
        icon: 'success',
      })
      // 跳转到成功页面
      uni.navigateTo({
        url: `/pages/order/success?orderNo=${props.orderNo}`,
      })
    } else {
      uni.showModal({
        title: '支付未完成',
        content: status.message || '请确认支付状态',
        confirmText: '重新查询',
        success: (res) => {
          if (res.confirm) {
            startPolling()
          }
        },
      })
    }
  } else {
    // 查询失败
    uni.showModal({
      title: '查询失败',
      content: err?.message || '无法确认支付状态',
      confirmText: '重新查询',
      success: (res) => {
        if (res.confirm) {
          startPolling()
        }
      },
    })
  }
}

// 取消查询
const handleCancel = () => {
  polling.value = false
  uni.navigateBack()
}

// 页面加载时开始轮询
onMounted(() => {
  startPolling()
})
</script>

<style lang="scss" scoped>
.payment-polling {
  padding: 64rpx 32rpx;
}

.polling-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 64rpx;
}

.polling-text {
  font-size: 32rpx;
  font-weight: bold;
}

.polling-hint {
  color: #999;
  font-size: 28rpx;
}

.polling-count {
  color: #666;
  font-size: 28rpx;
}
</style>
```

**使用说明:**

- `pollOrderStatus` 方法提供轮询查询功能
- 第二个参数是最大重试次数,默认为2次
- 每次查询间隔2秒
- 适用于支付回调后需要确认结果的场景
- 返回轮询结果和最终的订单状态

### 获取平台信息

了解当前平台的支付能力,用于UI展示和功能控制:

```vue
<template>
  <view class="platform-info">
    <view class="info-section">
      <text class="section-title">当前平台</text>
      <text class="section-value">{{ platformInfo.platform }}</text>
    </view>

    <view class="info-section">
      <text class="section-title">支付能力</text>
      <view class="capabilities">
        <view class="capability-item">
          <text>微信支付</text>
          <wd-icon
            :name="platformInfo.supportsWechatPay ? 'check' : 'close'"
            :color="platformInfo.supportsWechatPay ? '#52c41a' : '#ccc'"
          />
        </view>
        <view class="capability-item">
          <text>支付宝支付</text>
          <wd-icon
            :name="platformInfo.supportsAlipayPay ? 'check' : 'close'"
            :color="platformInfo.supportsAlipayPay ? '#52c41a' : '#ccc'"
          />
        </view>
        <view class="capability-item">
          <text>余额支付</text>
          <wd-icon
            :name="platformInfo.supportsBalancePay ? 'check' : 'close'"
            :color="platformInfo.supportsBalancePay ? '#52c41a' : '#ccc'"
          />
        </view>
      </view>
    </view>

    <view class="info-section">
      <text class="section-title">运行环境</text>
      <view class="environment">
        <text>微信环境: {{ platformInfo.isWechatEnvironment ? '是' : '否' }}</text>
        <text>支付宝环境: {{ platformInfo.isAlipayEnvironment ? '是' : '否' }}</text>
        <text>开发工具: {{ platformInfo.isInDevTools ? '是' : '否' }}</text>
      </view>
    </view>

    <view class="info-section">
      <text class="section-title">推荐交易类型</text>
      <view class="trade-types">
        <text>微信: {{ platformInfo.recommendedTradeTypes.wechat }}</text>
        <text>支付宝: {{ platformInfo.recommendedTradeTypes.alipay }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { usePayment } from '@/composables/usePayment'

// 获取支付功能
const { getPlatformInfo } = usePayment()

// 获取平台信息
const platformInfo = computed(() => getPlatformInfo())
</script>

<style lang="scss" scoped>
.platform-info {
  padding: 32rpx;
}

.info-section {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.section-title {
  display: block;
  margin-bottom: 16rpx;
  color: #333;
  font-size: 32rpx;
  font-weight: bold;
}

.section-value {
  color: #666;
  font-size: 28rpx;
}

.capabilities,
.environment,
.trade-types {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.capability-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
```

**使用说明:**

- `getPlatformInfo` 返回当前平台的完整信息
- 包括平台类型、支付能力、运行环境、推荐交易类型等
- 可用于调试和功能展示
- 返回的信息是响应式的,会根据环境变化自动更新

### 自定义交易类型

某些场景下需要手动指定交易类型,而不是使用自动选择:

```vue
<template>
  <view class="custom-payment">
    <view class="form-item">
      <text class="label">支付方式</text>
      <wd-select v-model="paymentMethod">
        <wd-option value="WECHAT" label="微信支付" />
        <wd-option value="ALIPAY" label="支付宝支付" />
      </wd-select>
    </view>

    <view class="form-item">
      <text class="label">交易类型</text>
      <wd-select v-model="tradeType">
        <wd-option
          v-for="type in availableTradeTypes"
          :key="type.value"
          :value="type.value"
          :label="type.label"
        />
      </wd-select>
    </view>

    <view class="form-item" v-if="needsOpenId">
      <text class="label">OpenID</text>
      <wd-input v-model="openId" placeholder="请输入OpenID" />
    </view>

    <wd-button
      type="primary"
      :loading="loading"
      block
      @click="handleCustomPay"
    >
      确认支付
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { usePayment } from '@/composables/usePayment'
import {
  PaymentMethod,
  TradeType,
} from '@/api/common/mall/order/orderTypes'

// 获取支付功能
const { loading, payOrder } = usePayment()

// Props
const props = defineProps<{
  orderNo: string
}>()

// 状态
const paymentMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)
const tradeType = ref<TradeType>(TradeType.JSAPI)
const openId = ref('')
const appId = ref('wx1234567890')

// 可用的交易类型
const availableTradeTypes = computed(() => {
  if (paymentMethod.value === PaymentMethod.WECHAT) {
    return [
      { value: TradeType.JSAPI, label: 'JSAPI(公众号/小程序)' },
      { value: TradeType.APP, label: 'APP支付' },
      { value: TradeType.H5, label: 'H5支付' },
      { value: TradeType.NATIVE, label: 'Native扫码支付' },
    ]
  } else {
    return [
      { value: TradeType.APP, label: 'APP支付' },
      { value: TradeType.WAP, label: 'WAP支付' },
      { value: TradeType.PAGE, label: 'PAGE支付' },
    ]
  }
})

// 是否需要OpenID
const needsOpenId = computed(() => {
  return (
    paymentMethod.value === PaymentMethod.WECHAT &&
    tradeType.value === TradeType.JSAPI
  )
})

// 自定义支付
const handleCustomPay = async () => {
  const params: any = {
    orderNo: props.orderNo,
    paymentMethod: paymentMethod.value,
    tradeType: tradeType.value,
  }

  // JSAPI支付需要OpenID和AppID
  if (needsOpenId.value) {
    if (!openId.value) {
      uni.showToast({
        title: '请输入OpenID',
        icon: 'none',
      })
      return
    }
    params.openId = openId.value
    params.appId = appId.value
  }

  const [err, result] = await payOrder(params)

  if (!err && result) {
    uni.showToast({
      title: '支付成功',
      icon: 'success',
    })
  }
}
</script>

<style lang="scss" scoped>
.custom-payment {
  padding: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  margin-bottom: 12rpx;
  color: #333;
  font-size: 28rpx;
}
</style>
```

**使用说明:**

- 可以手动指定 `tradeType` 参数覆盖自动选择
- JSAPI 支付需要提供 `openId` 和 `appId`
- 不同的交易类型适用于不同的场景
- 微信支付支持: JSAPI、APP、H5、NATIVE
- 支付宝支付支持: APP、WAP、PAGE

## 高级用法

### 微信公众号支付(JSAPI)

微信公众号环境下的支付实现,需要获取用户的 OpenID:

```vue
<template>
  <view class="wechat-official-pay">
    <view class="order-info">
      <text class="label">订单金额:</text>
      <text class="amount">¥ {{ orderAmount }}</text>
    </view>

    <view class="user-info" v-if="userInfo">
      <text class="label">支付用户:</text>
      <text class="name">{{ userInfo.nickname }}</text>
    </view>

    <wd-button
      type="primary"
      :loading="loading || checking"
      :disabled="!openId"
      block
      @click="handleWechatPay"
    >
      {{ getButtonText() }}
    </wd-button>

    <view class="tips">
      <text>· 请在微信中打开</text>
      <text>· 确保已授权获取OpenID</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod, TradeType } from '@/api/common/mall/order/orderTypes'
import { getWechatOpenId, getWechatUserInfo } from '@/api/wechat'

// Props
const props = defineProps<{
  orderNo: string
  orderAmount: number
}>()

// 获取支付功能
const { loading, payOrder, getPlatformInfo } = usePayment()

// 平台信息
const platformInfo = computed(() => getPlatformInfo())

// 状态
const checking = ref(false)
const openId = ref('')
const appId = ref('wx1234567890abcdef') // 从配置中获取
const userInfo = ref<any>(null)

// 按钮文字
const getButtonText = () => {
  if (checking.value) return '正在获取授权...'
  if (loading.value) return '支付中...'
  if (!openId.value) return '未获取OpenID'
  return '确认支付'
}

// 获取OpenID
const fetchOpenId = async () => {
  checking.value = true

  try {
    // 从URL参数或缓存中获取
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options || {}

    if (options.code) {
      // 通过code换取OpenID
      const [err, data] = await getWechatOpenId(options.code)
      if (!err && data) {
        openId.value = data.openId
        // 获取用户信息
        const [userErr, userData] = await getWechatUserInfo(data.openId)
        if (!userErr && userData) {
          userInfo.value = userData
        }
      }
    } else {
      // 从缓存中读取
      const cachedOpenId = uni.getStorageSync('wechat_openid')
      if (cachedOpenId) {
        openId.value = cachedOpenId
      } else {
        // 跳转授权
        redirectToAuth()
      }
    }
  } finally {
    checking.value = false
  }
}

// 跳转授权页面
const redirectToAuth = () => {
  const redirectUri = encodeURIComponent(window.location.href)
  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId.value}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect`
  window.location.href = authUrl
}

// 微信支付
const handleWechatPay = async () => {
  if (!openId.value) {
    uni.showToast({
      title: '请先授权',
      icon: 'none',
    })
    return
  }

  // 检查是否在微信环境
  if (!platformInfo.value.isWechatEnvironment) {
    uni.showModal({
      title: '提示',
      content: '请在微信中打开',
      showCancel: false,
    })
    return
  }

  const [err, result] = await payOrder({
    orderNo: props.orderNo,
    paymentMethod: PaymentMethod.WECHAT,
    tradeType: TradeType.JSAPI,
    appId: appId.value,
    openId: openId.value,
  })

  if (!err && result) {
    // 支付成功后查询订单状态
    setTimeout(() => {
      uni.navigateTo({
        url: `/pages/order/result?orderNo=${props.orderNo}`,
      })
    }, 1000)
  } else {
    console.error('支付失败:', err)
  }
}

// 页面加载时获取OpenID
onMounted(() => {
  fetchOpenId()
})
</script>

<style lang="scss" scoped>
.wechat-official-pay {
  padding: 32rpx;
}

.order-info,
.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.amount {
  color: #ff4757;
  font-size: 40rpx;
  font-weight: bold;
}

.tips {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 24rpx;
  color: #999;
  font-size: 24rpx;
  text-align: center;
}
</style>
```

**技术实现:**

- 微信公众号支付使用 JSAPI 模式
- 需要通过 OAuth2.0 获取用户 OpenID
- 使用 `WeixinJSBridge.invoke('getBrandWCPayRequest')` 调起支付
- 支付参数包括: appId、timeStamp、nonceStr、package、signType、paySign
- 自动检测 WeixinJSBridge 是否加载完成,未加载时等待 WeixinJSBridgeReady 事件

### 微信小程序支付

微信小程序环境下的支付实现:

```vue
<template>
  <view class="mp-weixin-pay">
    <view class="order-summary">
      <view class="summary-item">
        <text class="label">商品名称</text>
        <text class="value">{{ productName }}</text>
      </view>
      <view class="summary-item">
        <text class="label">订单金额</text>
        <text class="value amount">¥ {{ orderAmount }}</text>
      </view>
      <view class="summary-item">
        <text class="label">订单号</text>
        <text class="value">{{ orderNo }}</text>
      </view>
    </view>

    <wd-button
      type="primary"
      :loading="loading"
      block
      @click="handleMpPay"
    >
      立即支付
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

// Props
const props = defineProps<{
  orderNo: string
  orderAmount: number
  productName: string
}>()

// 获取支付功能
const { loading, payOrder, pollOrderStatus } = usePayment()

// 微信小程序支付
const handleMpPay = async () => {
  // 发起支付
  const [err, result] = await payOrder({
    orderNo: props.orderNo,
    paymentMethod: PaymentMethod.WECHAT,
    // 小程序环境会自动使用JSAPI交易类型
  })

  if (!err && result) {
    // 支付调用成功,轮询查询结果
    const [pollErr, [statusErr, status]] = await pollOrderStatus(
      props.orderNo,
      3, // 最多查询3次
    )

    if (!pollErr && !statusErr && status?.paid) {
      // 支付成功
      uni.showModal({
        title: '支付成功',
        content: '感谢您的购买',
        showCancel: false,
        success: () => {
          uni.redirectTo({
            url: '/pages/order/list',
          })
        },
      })
    } else {
      // 支付状态未确认
      uni.showModal({
        title: '提示',
        content: '支付结果确认中,请稍后在订单列表查看',
        showCancel: false,
      })
    }
  } else {
    // 支付失败或取消
    console.error('支付失败:', err)
  }
}
</script>

<style lang="scss" scoped>
.mp-weixin-pay {
  padding: 32rpx;
}

.order-summary {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.label {
  color: #666;
  font-size: 28rpx;
}

.value {
  color: #333;
  font-size: 28rpx;
}

.amount {
  color: #ff4757;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
```

**技术实现:**

- 微信小程序使用 `uni.requestPayment` API
- provider 设置为 'wxpay'
- 支付参数: timeStamp、nonceStr、package、signType、paySign
- 支付完成后建议轮询查询确认支付结果
- 用户取消支付时 errMsg 包含 'cancel' 关键字

### 支付宝H5支付

支付宝H5支付通过跳转到支付宝支付页面完成:

```vue
<template>
  <view class="alipay-h5-pay">
    <view class="payment-info">
      <view class="info-row">
        <text class="label">支付方式</text>
        <text class="value">支付宝支付</text>
      </view>
      <view class="info-row">
        <text class="label">支付金额</text>
        <text class="value amount">¥ {{ orderAmount }}</text>
      </view>
      <view class="info-row">
        <text class="label">订单号</text>
        <text class="value">{{ orderNo }}</text>
      </view>
    </view>

    <wd-button
      type="primary"
      :loading="loading"
      block
      @click="handleAlipayH5Pay"
    >
      跳转支付宝支付
    </wd-button>

    <view class="tips">
      <text>· 点击按钮后将跳转到支付宝</text>
      <text>· 支付完成后请返回确认结果</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

// Props
const props = defineProps<{
  orderNo: string
  orderAmount: number
}>()

// 获取支付功能
const { loading, payOrder, queryOrderStatus } = usePayment()

// 是否从支付宝返回
const returnedFromAlipay = ref(false)

// 支付宝H5支付
const handleAlipayH5Pay = async () => {
  // 设置返回URL(支付完成后跳转)
  const returnUrl = encodeURIComponent(
    window.location.origin + window.location.pathname + '?from=alipay',
  )

  const [err, result] = await payOrder({
    orderNo: props.orderNo,
    paymentMethod: PaymentMethod.ALIPAY,
    returnUrl,
  })

  if (!err && result) {
    // H5支付会自动跳转,这里不需要处理
    console.log('跳转支付宝支付页面')
  } else {
    console.error('发起支付失败:', err)
  }
}

// 检查支付结果
const checkPaymentResult = async () => {
  const [err, status] = await queryOrderStatus(props.orderNo)

  if (!err && status?.paid) {
    uni.showModal({
      title: '支付成功',
      content: '感谢您的支付',
      showCancel: false,
      success: () => {
        uni.redirectTo({
          url: '/pages/order/success',
        })
      },
    })
  } else {
    uni.showModal({
      title: '提示',
      content: '未检测到支付成功,请在订单列表查看',
      confirmText: '查看订单',
      cancelText: '重新支付',
      success: (res) => {
        if (res.confirm) {
          uni.redirectTo({
            url: '/pages/order/list',
          })
        } else {
          returnedFromAlipay.value = false
        }
      },
    })
  }
}

// 页面显示时检查是否从支付宝返回
onShow(() => {
  // #ifdef H5
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('from') === 'alipay' && !returnedFromAlipay.value) {
    returnedFromAlipay.value = true
    checkPaymentResult()
  }
  // #endif
})
</script>

<style lang="scss" scoped>
.alipay-h5-pay {
  padding: 32rpx;
}

.payment-info {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
}

.label {
  color: #666;
}

.value {
  color: #333;
}

.amount {
  color: #1890ff;
  font-size: 36rpx;
  font-weight: bold;
}

.tips {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 24rpx;
  color: #999;
  font-size: 24rpx;
  text-align: center;
}
</style>
```

**技术实现:**

- 支付宝H5支付通过 `window.location.href` 跳转到支付宝支付页面
- 需要提供 `returnUrl` 参数,支付完成后跳转回来
- 使用 `onShow` 生命周期检测页面返回
- 返回后查询订单状态确认支付结果
- 支付URL由后端返回的 `payUrl` 字段提供

### 余额支付

使用账户余额进行支付:

```vue
<template>
  <view class="balance-pay">
    <view class="balance-info">
      <text class="label">账户余额</text>
      <text class="balance">¥ {{ accountBalance }}</text>
    </view>

    <view class="order-info">
      <view class="info-row">
        <text class="label">订单金额</text>
        <text class="amount">¥ {{ orderAmount }}</text>
      </view>
      <view class="info-row">
        <text class="label">支付后余额</text>
        <text :class="['remaining', { insufficient: isInsufficient }]">
          ¥ {{ remainingBalance }}
        </text>
      </view>
    </view>

    <view class="password-section" v-if="!isInsufficient">
      <text class="section-title">请输入支付密码</text>
      <wd-password-input
        v-model="payPassword"
        :length="6"
        @complete="handlePasswordComplete"
      />
    </view>

    <view class="insufficient-tip" v-else>
      <wd-icon name="warning" color="#ff4757" size="48rpx" />
      <text>余额不足,请选择其他支付方式或充值</text>
    </view>

    <wd-button
      type="primary"
      :loading="loading"
      :disabled="isInsufficient || !isPasswordComplete"
      block
      @click="handleBalancePay"
    >
      {{ isInsufficient ? '余额不足' : '确认支付' }}
    </wd-button>

    <wd-button plain block @click="handleRecharge" v-if="isInsufficient">
      立即充值
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'
import { getAccountBalance } from '@/api/user/account'

// Props
const props = defineProps<{
  orderNo: string
  orderAmount: number
}>()

// 获取支付功能
const { loading, payOrder } = usePayment()

// 状态
const accountBalance = ref(0)
const payPassword = ref('')
const isPasswordComplete = ref(false)

// 计算余额是否充足
const isInsufficient = computed(() => {
  return accountBalance.value < props.orderAmount
})

// 支付后余额
const remainingBalance = computed(() => {
  return Math.max(0, accountBalance.value - props.orderAmount)
})

// 获取账户余额
const fetchBalance = async () => {
  const [err, data] = await getAccountBalance()
  if (!err && data) {
    accountBalance.value = data.balance
  }
}

// 密码输入完成
const handlePasswordComplete = () => {
  isPasswordComplete.value = true
}

// 余额支付
const handleBalancePay = async () => {
  if (!isPasswordComplete.value) {
    uni.showToast({
      title: '请输入支付密码',
      icon: 'none',
    })
    return
  }

  const [err, result] = await payOrder({
    orderNo: props.orderNo,
    paymentMethod: PaymentMethod.BALANCE,
    payPassword: payPassword.value,
  })

  if (!err && result) {
    uni.showModal({
      title: '支付成功',
      content: `已使用余额支付 ¥${props.orderAmount}`,
      showCancel: false,
      success: () => {
        uni.redirectTo({
          url: '/pages/order/success',
        })
      },
    })
  } else {
    // 密码错误,清空重新输入
    payPassword.value = ''
    isPasswordComplete.value = false
  }
}

// 跳转充值
const handleRecharge = () => {
  uni.navigateTo({
    url: '/pages/user/recharge',
  })
}

// 初始化
onMounted(() => {
  fetchBalance()
})
</script>

<style lang="scss" scoped>
.balance-pay {
  padding: 32rpx;
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  margin-bottom: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  color: #fff;
}

.balance {
  font-size: 48rpx;
  font-weight: bold;
}

.order-info {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
}

.amount {
  color: #ff4757;
  font-size: 32rpx;
  font-weight: bold;
}

.remaining {
  color: #52c41a;
  font-size: 28rpx;

  &.insufficient {
    color: #ff4757;
  }
}

.password-section {
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  margin-bottom: 16rpx;
  color: #333;
  font-size: 28rpx;
}

.insufficient-tip {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: #fff3f3;
  border-radius: 8rpx;
  color: #ff4757;
  font-size: 28rpx;
}
</style>
```

**技术实现:**

- 余额支付需要用户输入支付密码
- 检查账户余额是否充足
- `PaymentMethod.BALANCE` 标识余额支付方式
- 传递 `payPassword` 参数进行密码验证
- 支付成功后立即返回结果,无需轮询查询

### APP环境支付

APP环境下支持微信和支付宝支付:

```vue
<template>
  <view class="app-payment">
    <view class="order-info">
      <text class="order-no">订单: {{ orderNo }}</text>
      <text class="amount">¥ {{ orderAmount }}</text>
    </view>

    <view class="payment-methods">
      <view
        v-for="method in supportedMethods"
        :key="method.value"
        :class="['method-card', { active: selectedMethod === method.value }]"
        @click="selectMethod(method.value)"
      >
        <wd-icon :name="method.icon" size="64rpx" :color="method.color" />
        <text class="method-name">{{ method.name }}</text>
        <wd-icon
          v-if="selectedMethod === method.value"
          name="check-circle"
          color="#52c41a"
          size="40rpx"
          class="check-icon"
        />
      </view>
    </view>

    <wd-button
      type="primary"
      :loading="loading"
      block
      @click="handleAppPay"
    >
      确认支付
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

// Props
const props = defineProps<{
  orderNo: string
  orderAmount: number
}>()

// 获取支付功能
const { loading, payOrder, getPlatformInfo } = usePayment()

// 平台信息
const platformInfo = computed(() => getPlatformInfo())

// 选中的支付方式
const selectedMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)

// 支持的支付方式
const supportedMethods = computed(() => {
  const methods = []

  if (platformInfo.value.supportsWechatPay) {
    methods.push({
      value: PaymentMethod.WECHAT,
      name: '微信支付',
      icon: 'wechat',
      color: '#09bb07',
    })
  }

  if (platformInfo.value.supportsAlipayPay) {
    methods.push({
      value: PaymentMethod.ALIPAY,
      name: '支付宝支付',
      icon: 'alipay',
      color: '#1890ff',
    })
  }

  if (platformInfo.value.supportsBalancePay) {
    methods.push({
      value: PaymentMethod.BALANCE,
      name: '余额支付',
      icon: 'wallet',
      color: '#ff9800',
    })
  }

  return methods
})

// 选择支付方式
const selectMethod = (method: PaymentMethod) => {
  selectedMethod.value = method
}

// APP支付
const handleAppPay = async () => {
  const [err, result] = await payOrder({
    orderNo: props.orderNo,
    paymentMethod: selectedMethod.value,
    // APP环境会自动选择APP交易类型
  })

  if (!err && result) {
    // APP支付成功
    uni.showModal({
      title: '支付成功',
      content: '订单支付完成',
      showCancel: false,
      success: () => {
        uni.navigateBack()
      },
    })
  } else {
    console.error('支付失败:', err)
  }
}

// 初始化
onMounted(() => {
  // 默认选择第一个支持的支付方式
  if (supportedMethods.value.length > 0) {
    selectedMethod.value = supportedMethods.value[0].value
  }
})
</script>

<style lang="scss" scoped>
.app-payment {
  padding: 32rpx;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 32rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.order-no {
  color: #666;
  font-size: 28rpx;
}

.amount {
  color: #ff4757;
  font-size: 40rpx;
  font-weight: bold;
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.method-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 32rpx 24rpx;
  background: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  transition: all 0.3s;

  &.active {
    border-color: #52c41a;
    background: #f6ffed;
  }
}

.method-name {
  font-size: 28rpx;
}

.check-icon {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
}
</style>
```

**技术实现:**

- APP环境使用 `uni.requestPayment` API
- 微信APP支付需要配置 `orderInfo` 参数,包含 appid、noncestr、package、partnerid、prepayid、timestamp、sign
- 支付宝APP支付使用 `payForm` 或 `payUrl` 参数
- 交易类型自动选择为 `TradeType.APP`
- 支付结果通过 success/fail 回调返回

### 完整支付流程

一个完整的支付流程示例,包含订单创建、支付、状态确认:

```vue
<template>
  <view class="complete-payment-flow">
    <!-- 步骤指示器 -->
    <view class="steps">
      <view
        v-for="(step, index) in steps"
        :key="index"
        :class="['step-item', { active: currentStep >= index, current: currentStep === index }]"
      >
        <view class="step-number">{{ index + 1 }}</view>
        <text class="step-title">{{ step }}</text>
      </view>
    </view>

    <!-- 步骤1: 商品信息 -->
    <view v-if="currentStep === 0" class="step-content">
      <view class="product-card">
        <image :src="product.image" class="product-image" />
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-price">¥ {{ product.price }}</text>
        </view>
      </view>

      <view class="quantity-selector">
        <text class="label">购买数量</text>
        <wd-stepper v-model="quantity" :min="1" :max="99" />
      </view>

      <view class="total-amount">
        <text class="label">总计</text>
        <text class="amount">¥ {{ totalAmount }}</text>
      </view>

      <wd-button type="primary" block @click="nextStep">
        下一步
      </wd-button>
    </view>

    <!-- 步骤2: 选择支付方式 -->
    <view v-if="currentStep === 1" class="step-content">
      <view class="payment-methods">
        <view
          v-for="method in availableMethods"
          :key="method"
          :class="['payment-method', { active: selectedMethod === method }]"
          @click="selectPaymentMethod(method)"
        >
          <view class="method-info">
            <wd-icon :name="getMethodIcon(method)" size="48rpx" />
            <text class="method-name">{{ getMethodName(method) }}</text>
          </view>
          <wd-radio :value="method" :model-value="selectedMethod" />
        </view>
      </view>

      <view class="action-buttons">
        <wd-button plain @click="prevStep">上一步</wd-button>
        <wd-button type="primary" @click="handleCreateOrder">
          创建订单并支付
        </wd-button>
      </view>
    </view>

    <!-- 步骤3: 支付中 -->
    <view v-if="currentStep === 2" class="step-content">
      <view class="paying-animation">
        <wd-loading size="100rpx" />
        <text class="paying-text">正在支付中...</text>
        <text class="paying-hint">请在支付页面完成付款</text>
      </view>
    </view>

    <!-- 步骤4: 支付结果 -->
    <view v-if="currentStep === 3" class="step-content">
      <view v-if="paymentSuccess" class="payment-result success">
        <wd-icon name="check-circle" size="120rpx" color="#52c41a" />
        <text class="result-title">支付成功</text>
        <text class="result-message">订单已完成支付</text>
        <text class="order-no">订单号: {{ createdOrderNo }}</text>

        <wd-button type="primary" block @click="viewOrder">
          查看订单
        </wd-button>
      </view>

      <view v-else class="payment-result failed">
        <wd-icon name="close-circle" size="120rpx" color="#ff4757" />
        <text class="result-title">支付失败</text>
        <text class="result-message">{{ errorMessage }}</text>

        <view class="action-buttons">
          <wd-button plain @click="retryPayment">重新支付</wd-button>
          <wd-button type="primary" @click="viewOrder">查看订单</wd-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

// 获取支付功能
const {
  loading,
  availableMethods,
  createOrderAndPay,
  pollOrderStatus,
} = usePayment()

// 商品信息
const product = ref({
  id: '123',
  name: '测试商品',
  price: 99.00,
  image: '/static/images/product.jpg',
})

// 状态
const currentStep = ref(0)
const quantity = ref(1)
const selectedMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)
const createdOrderNo = ref('')
const paymentSuccess = ref(false)
const errorMessage = ref('')

// 步骤
const steps = ['选择商品', '选择支付方式', '支付中', '支付完成']

// 总金额
const totalAmount = computed(() => {
  return (product.value.price * quantity.value).toFixed(2)
})

// 获取支付方式图标
const getMethodIcon = (method: PaymentMethod) => {
  const icons = {
    [PaymentMethod.WECHAT]: 'wechat',
    [PaymentMethod.ALIPAY]: 'alipay',
    [PaymentMethod.BALANCE]: 'wallet',
  }
  return icons[method]
}

// 获取支付方式名称
const getMethodName = (method: PaymentMethod) => {
  const names = {
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.ALIPAY]: '支付宝支付',
    [PaymentMethod.BALANCE]: '余额支付',
  }
  return names[method]
}

// 选择支付方式
const selectPaymentMethod = (method: PaymentMethod) => {
  selectedMethod.value = method
}

// 下一步
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 创建订单并支付
const handleCreateOrder = async () => {
  // 进入支付中状态
  currentStep.value = 2

  // 构建订单数据
  const orderData = {
    productId: product.value.id,
    productName: product.value.name,
    quantity: quantity.value,
    totalAmount: Math.round(parseFloat(totalAmount.value) * 100), // 转换为分
  }

  // 创建订单并支付
  const [err, result] = await createOrderAndPay({
    orderData,
    paymentMethod: selectedMethod.value,
  })

  if (!err && result) {
    // 支付调用成功
    createdOrderNo.value = result.orderData.orderNo

    // 轮询查询支付结果
    const [pollErr, [statusErr, status]] = await pollOrderStatus(
      result.orderData.orderNo,
      5, // 最多查询5次
    )

    if (!pollErr && !statusErr && status?.paid) {
      // 支付成功
      paymentSuccess.value = true
    } else {
      // 支付失败或未确认
      paymentSuccess.value = false
      errorMessage.value = status?.message || '支付未完成'
    }
  } else {
    // 创建订单或支付失败
    paymentSuccess.value = false
    errorMessage.value = err?.message || '支付失败'
  }

  // 进入结果页
  currentStep.value = 3
}

// 重新支付
const retryPayment = () => {
  currentStep.value = 1
  errorMessage.value = ''
}

// 查看订单
const viewOrder = () => {
  uni.redirectTo({
    url: `/pages/order/detail?orderNo=${createdOrderNo.value}`,
  })
}
</script>

<style lang="scss" scoped>
.complete-payment-flow {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;
}

.steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  flex: 1;

  &.active .step-number {
    background: #52c41a;
    color: #fff;
  }

  &.current .step-number {
    background: #1890ff;
  }
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  background: #e0e0e0;
  border-radius: 50%;
  color: #666;
  font-size: 24rpx;
}

.step-title {
  color: #666;
  font-size: 24rpx;
}

.step-content {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
}

.product-card {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
}

.product-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.product-name {
  font-size: 32rpx;
  font-weight: bold;
}

.product-price {
  color: #ff4757;
  font-size: 36rpx;
  font-weight: bold;
}

.quantity-selector,
.total-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-top: 1rpx solid #f0f0f0;
}

.total-amount {
  .amount {
    color: #ff4757;
    font-size: 40rpx;
    font-weight: bold;
  }
}

.payment-methods {
  margin-bottom: 24rpx;
}

.payment-method {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  border: 2rpx solid transparent;

  &.active {
    border-color: #1890ff;
    background: #e6f7ff;
  }
}

.method-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.method-name {
  font-size: 28rpx;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16rpx;
}

.paying-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding: 64rpx 0;
}

.paying-text {
  font-size: 32rpx;
  font-weight: bold;
}

.paying-hint {
  color: #999;
  font-size: 28rpx;
}

.payment-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 64rpx 0;
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
}

.result-message {
  color: #666;
  font-size: 28rpx;
}

.order-no {
  color: #999;
  font-size: 24rpx;
}
</style>
```

**完整流程说明:**

1. **选择商品** - 用户选择商品和数量
2. **选择支付方式** - 根据平台能力展示可用支付方式
3. **创建订单并支付** - 调用 `createOrderAndPay` 一次性完成
4. **轮询查询结果** - 使用 `pollOrderStatus` 确认支付状态
5. **展示结果** - 根据支付结果跳转到对应页面

### 错误处理和重试

完善的错误处理机制:

```vue
<template>
  <view class="payment-with-error-handling">
    <view class="payment-form">
      <wd-cell-group>
        <wd-cell title="订单金额" :value="`¥ ${orderAmount}`" />
        <wd-cell title="支付方式">
          <template #value>
            <wd-select v-model="selectedMethod">
              <wd-option
                v-for="method in availableMethods"
                :key="method"
                :value="method"
                :label="getMethodName(method)"
              />
            </wd-select>
          </template>
        </wd-cell>
      </wd-cell-group>
    </view>

    <wd-button
      type="primary"
      :loading="loading"
      block
      @click="handlePayWithRetry"
    >
      {{ loading ? '支付中...' : '确认支付' }}
    </wd-button>

    <!-- 错误提示 -->
    <wd-message-box
      v-model="showError"
      title="支付失败"
      :content="errorDetails"
      confirm-button-text="重试"
      cancel-button-text="取消"
      @confirm="retryPayment"
      @cancel="cancelPayment"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

// Props
const props = defineProps<{
  orderNo: string
  orderAmount: number
}>()

// 获取支付功能
const { loading, availableMethods, payOrder } = usePayment()

// 状态
const selectedMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)
const showError = ref(false)
const errorDetails = ref('')
const retryCount = ref(0)
const maxRetries = 3

// 获取支付方式名称
const getMethodName = (method: PaymentMethod) => {
  const names = {
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.ALIPAY]: '支付宝支付',
    [PaymentMethod.BALANCE]: '余额支付',
  }
  return names[method]
}

// 支付处理
const handlePayWithRetry = async () => {
  try {
    const [err, result] = await payOrder({
      orderNo: props.orderNo,
      paymentMethod: selectedMethod.value,
    })

    if (err) {
      handlePaymentError(err)
    } else if (result) {
      // 支付成功
      retryCount.value = 0
      uni.showToast({
        title: '支付成功',
        icon: 'success',
      })
      uni.redirectTo({
        url: '/pages/order/success',
      })
    }
  } catch (error) {
    handlePaymentError(error as Error)
  }
}

// 处理支付错误
const handlePaymentError = (error: Error) => {
  console.error('支付错误:', error)

  // 根据错误类型提供不同的提示和处理
  let errorMessage = error.message

  if (errorMessage.includes('网络')) {
    errorDetails.value = '网络连接失败，请检查网络后重试'
  } else if (errorMessage.includes('余额不足')) {
    errorDetails.value = '账户余额不足，请选择其他支付方式或充值'
  } else if (errorMessage.includes('密码错误')) {
    errorDetails.value = '支付密码错误，请重新输入'
  } else if (errorMessage.includes('取消')) {
    // 用户取消,不显示错误
    return
  } else {
    errorDetails.value = `支付失败: ${errorMessage}`
  }

  showError.value = true
}

// 重试支付
const retryPayment = () => {
  showError.value = false

  if (retryCount.value < maxRetries) {
    retryCount.value++
    console.log(`第 ${retryCount.value} 次重试支付`)
    handlePayWithRetry()
  } else {
    uni.showModal({
      title: '提示',
      content: `已重试 ${maxRetries} 次，请稍后再试或联系客服`,
      showCancel: false,
    })
    retryCount.value = 0
  }
}

// 取消支付
const cancelPayment = () => {
  showError.value = false
  retryCount.value = 0
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.payment-with-error-handling {
  padding: 32rpx;
}

.payment-form {
  margin-bottom: 32rpx;
}
</style>
```

**错误处理策略:**

- 网络错误 - 提示检查网络,支持重试
- 余额不足 - 提示充值或更换支付方式
- 密码错误 - 提示重新输入
- 用户取消 - 静默处理,不显示错误
- 其他错误 - 显示具体错误信息
- 最多重试3次,超过次数提示联系客服

## API

### UsePaymentReturn

`usePayment` 返回的对象类型定义:

```typescript
interface UsePaymentReturn {
  // 响应式状态
  loading: Readonly<Ref<boolean>>
  availableMethods: Readonly<Ref<PaymentMethod[]>>

  // 核心支付方法
  createOrderAndPay: (params: CreateOrderAndPayParams) => Promise<[Error | null, CreateOrderAndPayResult | null]>
  payOrder: (params: PayOrderParams) => Promise<[Error | null, PayOrderResult | null]>

  // 查询方法
  queryOrderStatus: (orderNo: string) => Promise<[Error | null, OrderStatusVo | null]>
  pollOrderStatus: (orderNo: string, maxRetries?: number) => Promise<[Error, [Error, OrderStatusVo]]>

  // 工具方法
  getTradeType: (paymentMethod: PaymentMethod) => TradeType
  fetchAvailableMethods: () => Promise<[Error | null, PaymentMethod[] | null]>
  getPlatformInfo: () => PlatformInfo
}
```

### 状态属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `loading` | `Readonly<Ref<boolean>>` | 支付loading状态,只读响应式 |
| `availableMethods` | `Readonly<Ref<PaymentMethod[]>>` | 当前平台可用的支付方式列表,只读响应式 |

### createOrderAndPay

创建订单并立即发起支付。

**类型签名:**

```typescript
function createOrderAndPay(
  params: CreateOrderAndPayParams
): Promise<[Error | null, CreateOrderAndPayResult | null]>
```

**参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `params.orderData` | `CreateOrderBo` | 是 | 订单数据对象 |
| `params.paymentMethod` | `PaymentMethod` | 是 | 支付方式 |
| `params.tradeType` | `TradeType` | 否 | 交易类型,不提供则自动选择 |
| `params.appId` | `string` | 否 | 应用ID,JSAPI支付时必填 |
| `params.openId` | `string` | 否 | 用户OpenID,JSAPI支付时必填 |
| `params.payPassword` | `string` | 否 | 支付密码,余额支付时必填 |
| `params.returnUrl` | `string` | 否 | 支付完成后的返回URL,H5支付可用 |

**返回值:**

```typescript
[Error | null, {
  orderData: any // 创建的订单数据
  paymentData: PaymentResponse // 支付响应数据
} | null]
```

**使用示例:**

```typescript
const { createOrderAndPay } = usePayment()

const [err, result] = await createOrderAndPay({
  orderData: {
    productId: '123',
    quantity: 1,
    totalAmount: 9900,
  },
  paymentMethod: PaymentMethod.WECHAT,
})

if (!err && result) {
  console.log('订单创建成功:', result.orderData)
  console.log('支付发起成功:', result.paymentData)
}
```

### payOrder

支付已存在的订单。

**类型签名:**

```typescript
function payOrder(
  params: PayOrderParams
): Promise<[Error | null, PayOrderResult | null]>
```

**参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `params.orderNo` | `string` | 是 | 订单号 |
| `params.paymentMethod` | `PaymentMethod` | 是 | 支付方式 |
| `params.tradeType` | `TradeType` | 否 | 交易类型,不提供则自动选择 |
| `params.appId` | `string` | 否 | 应用ID,JSAPI支付时必填 |
| `params.openId` | `string` | 否 | 用户OpenID,JSAPI支付时必填 |
| `params.payPassword` | `string` | 否 | 支付密码,余额支付时必填 |
| `params.returnUrl` | `string` | 否 | 支付完成后的返回URL,H5支付可用 |

**返回值:**

```typescript
[Error | null, {
  paymentData: PaymentResponse // 支付响应数据
} | null]
```

**使用示例:**

```typescript
const { payOrder } = usePayment()

const [err, result] = await payOrder({
  orderNo: 'ORDER123456',
  paymentMethod: PaymentMethod.ALIPAY,
})

if (!err && result) {
  console.log('支付发起成功:', result.paymentData)
}
```

### queryOrderStatus

单次查询订单支付状态。

**类型签名:**

```typescript
function queryOrderStatus(
  orderNo: string
): Promise<[Error | null, OrderStatusVo | null]>
```

**参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `orderNo` | `string` | 是 | 订单号 |

**返回值:**

```typescript
[Error | null, {
  orderNo: string // 订单号
  paid: boolean // 是否已支付
  paymentMethod?: PaymentMethod // 支付方式
  payTime?: string // 支付时间
  message?: string // 状态消息
} | null]
```

**使用示例:**

```typescript
const { queryOrderStatus } = usePayment()

const [err, status] = await queryOrderStatus('ORDER123456')

if (!err && status) {
  if (status.paid) {
    console.log('订单已支付:', status.payTime)
  } else {
    console.log('订单未支付:', status.message)
  }
}
```

### pollOrderStatus

轮询查询订单支付状态,支持重试机制。

**类型签名:**

```typescript
function pollOrderStatus(
  orderNo: string,
  maxRetries?: number
): Promise<[Error, [Error, OrderStatusVo]]>
```

**参数:**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `orderNo` | `string` | 是 | - | 订单号 |
| `maxRetries` | `number` | 否 | 2 | 最大重试次数 |

**返回值:**

```typescript
[Error, [Error, OrderStatusVo]]
```

**使用示例:**

```typescript
const { pollOrderStatus } = usePayment()

// 最多查询5次,每次间隔2秒
const [err, [statusErr, status]] = await pollOrderStatus('ORDER123456', 5)

if (!err && !statusErr && status) {
  if (status.paid) {
    console.log('支付成功')
  } else {
    console.log('支付未完成')
  }
}
```

### getTradeType

根据支付方式和当前平台自动选择最优交易类型。

**类型签名:**

```typescript
function getTradeType(paymentMethod: PaymentMethod): TradeType
```

**参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `paymentMethod` | `PaymentMethod` | 是 | 支付方式 |

**返回值:**

`TradeType` - 推荐的交易类型

**使用示例:**

```typescript
const { getTradeType } = usePayment()

const tradeType = getTradeType(PaymentMethod.WECHAT)
console.log('推荐交易类型:', tradeType)
// 微信小程序: JSAPI
// APP: APP
// H5(微信): JSAPI
// H5(非微信): H5
```

**交易类型选择规则:**

微信支付:
- 微信小程序 → `TradeType.JSAPI`
- APP → `TradeType.APP`
- 微信公众号H5 → `TradeType.JSAPI`
- 普通H5 → `TradeType.H5`
- 其他 → `TradeType.NATIVE`

支付宝支付:
- 支付宝小程序 → `TradeType.APP`
- APP → `TradeType.APP`
- H5 → `TradeType.WAP`
- 其他 → `TradeType.PAGE`

### fetchAvailableMethods

主动获取当前平台支持的支付方式列表。

**类型签名:**

```typescript
function fetchAvailableMethods(): Promise<[Error | null, PaymentMethod[] | null]>
```

**返回值:**

```typescript
[Error | null, PaymentMethod[] | null]
```

**使用示例:**

```typescript
const { fetchAvailableMethods } = usePayment()

const [err, methods] = await fetchAvailableMethods()

if (!err && methods) {
  console.log('可用支付方式:', methods)
  // ['WECHAT', 'ALIPAY', 'BALANCE']
}
```

### getPlatformInfo

获取当前平台的详细信息和支付能力。

**类型签名:**

```typescript
function getPlatformInfo(): PlatformInfo
```

**返回值:**

```typescript
interface PlatformInfo {
  platform: string // 平台名称
  supportsWechatPay: boolean // 是否支持微信支付
  supportsAlipayPay: boolean // 是否支持支付宝支付
  supportsBalancePay: boolean // 是否支持余额支付
  isWechatEnvironment: boolean // 是否在微信环境
  isAlipayEnvironment: boolean // 是否在支付宝环境
  isInDevTools: boolean // 是否在开发工具中
  recommendedTradeTypes: {
    wechat: TradeType // 微信支付推荐交易类型
    alipay: TradeType // 支付宝支付推荐交易类型
  }
}
```

**使用示例:**

```typescript
const { getPlatformInfo } = usePayment()

const info = getPlatformInfo()
console.log('当前平台:', info.platform)
console.log('支持微信支付:', info.supportsWechatPay)
console.log('支持支付宝支付:', info.supportsAlipayPay)
console.log('微信推荐交易类型:', info.recommendedTradeTypes.wechat)
```

## 类型定义

### PaymentMethod

支付方式枚举:

```typescript
/**
 * 支付方式枚举
 */
export enum PaymentMethod {
  /** 微信支付 */
  WECHAT = 'WECHAT',
  /** 支付宝支付 */
  ALIPAY = 'ALIPAY',
  /** 余额支付 */
  BALANCE = 'BALANCE',
}
```

### TradeType

交易类型枚举:

```typescript
/**
 * 交易类型枚举
 */
export enum TradeType {
  /** JSAPI支付(公众号/小程序) */
  JSAPI = 'JSAPI',
  /** APP支付 */
  APP = 'APP',
  /** H5支付 */
  H5 = 'H5',
  /** Native扫码支付 */
  NATIVE = 'NATIVE',
  /** WAP支付(支付宝) */
  WAP = 'WAP',
  /** PAGE支付(支付宝) */
  PAGE = 'PAGE',
}
```

### CreateOrderBo

创建订单请求对象:

```typescript
/**
 * 创建订单业务对象
 */
export interface CreateOrderBo {
  /** 商品ID */
  productId: string
  /** 商品名称 */
  productName?: string
  /** 购买数量 */
  quantity: number
  /** 订单总金额(单位:分) */
  totalAmount: number
  /** 备注信息 */
  remark?: string
  /** 其他扩展字段 */
  [key: string]: any
}
```

### PaymentRequest

支付请求对象:

```typescript
/**
 * 支付请求参数
 */
export interface PaymentRequest {
  /** 订单号 */
  orderNo: string
  /** 支付方式 */
  paymentMethod: PaymentMethod
  /** 交易类型 */
  tradeType: TradeType
  /** 应用ID(JSAPI支付必填) */
  appId?: string
  /** 用户OpenID(JSAPI支付必填) */
  openId?: string
  /** 支付密码(余额支付必填) */
  payPassword?: string
  /** 返回URL(H5支付可用) */
  returnUrl?: string
}
```

### PaymentResponse

支付响应对象:

```typescript
/**
 * 支付响应数据
 */
export interface PaymentResponse {
  /** 是否成功 */
  success: boolean
  /** 响应消息 */
  message?: string
  /** 支付信息(微信/支付宝) */
  payInfo?: Record<string, string>
  /** 支付表单(支付宝) */
  payForm?: string
  /** 支付URL(支付宝H5) */
  payUrl?: string
  /** 二维码URL(Native支付) */
  qrCodeUrl?: string
}
```

### OrderStatusVo

订单状态视图对象:

```typescript
/**
 * 订单状态视图对象
 */
export interface OrderStatusVo {
  /** 订单号 */
  orderNo: string
  /** 是否已支付 */
  paid: boolean
  /** 支付方式 */
  paymentMethod?: PaymentMethod
  /** 支付时间 */
  payTime?: string
  /** 订单状态 */
  status?: string
  /** 状态消息 */
  message?: string
}
```

## 平台适配

### 支付方式与平台对应关系

| 支付方式 | H5 | 微信小程序 | 支付宝小程序 | APP | 说明 |
|---------|-----|-----------|-------------|-----|------|
| 微信支付 | ✅ | ✅ | ❌ | ✅ | H5需在微信环境 |
| 支付宝支付 | ✅ | ❌ | ✅ | ✅ | H5可直接使用 |
| 余额支付 | ✅ | ✅ | ✅ | ✅ | 所有平台支持 |

### 交易类型与平台对应关系

**微信支付:**

| 平台 | 交易类型 | 说明 |
|------|---------|------|
| 微信公众号H5 | JSAPI | 需要OpenID |
| 微信小程序 | JSAPI | 自动获取用户信息 |
| 普通H5 | H5 | 跳转微信H5支付页面 |
| APP | APP | 调用微信APP支付SDK |
| PC扫码 | NATIVE | 生成支付二维码 |

**支付宝支付:**

| 平台 | 交易类型 | 说明 |
|------|---------|------|
| H5 | WAP | 跳转支付宝支付页面 |
| 支付宝小程序 | APP | 小程序内支付 |
| APP | APP | 调用支付宝APP支付SDK |
| PC | PAGE | 生成支付页面 |

### 条件编译说明

usePayment 使用 UniApp 条件编译来确保不同平台的代码最优:

```typescript
// H5平台特有代码
// #ifdef H5
declare global {
  interface Window {
    WeixinJSBridge?: {...}
  }
}
// #endif

// 微信小程序特有代码
// #ifdef MP-WEIXIN
uni.requestPayment({
  provider: 'wxpay',
  ...
})
// #endif

// APP特有代码
// #ifdef APP
uni.requestPayment({
  provider: 'wxpay',
  orderInfo: {...},
  ...
})
// #endif
```

## 最佳实践

### 1. 使用平台检测自动选择支付方式

不要硬编码支付方式,应该根据平台能力自动过滤:

```typescript
// ❌ 不推荐
const paymentMethods = [PaymentMethod.WECHAT, PaymentMethod.ALIPAY]

// ✅ 推荐
const { availableMethods } = usePayment()
// availableMethods 已经根据平台自动过滤
```

### 2. 优先使用自动交易类型

让框架自动选择交易类型,除非有特殊需求:

```typescript
// ❌ 不推荐
const tradeType = PLATFORM.isMpWeixin ? TradeType.JSAPI : TradeType.H5

// ✅ 推荐
const { payOrder } = usePayment()
await payOrder({
  orderNo: '123',
  paymentMethod: PaymentMethod.WECHAT,
  // 不传 tradeType,自动选择
})
```

### 3. 支付后使用轮询确认结果

支付调用成功不代表支付完成,应轮询查询确认:

```typescript
// ✅ 推荐
const { payOrder, pollOrderStatus } = usePayment()

const [err, result] = await payOrder({...})

if (!err && result) {
  // 轮询查询支付结果
  const [pollErr, [statusErr, status]] = await pollOrderStatus(orderNo, 5)

  if (!pollErr && !statusErr && status?.paid) {
    // 确认支付成功
    handlePaymentSuccess()
  }
}
```

### 4. 完善的错误处理

区分不同的错误类型,提供友好提示:

```typescript
// ✅ 推荐
const [err, result] = await payOrder({...})

if (err) {
  if (err.message.includes('取消')) {
    // 用户取消,静默处理
    return
  } else if (err.message.includes('网络')) {
    // 网络错误,提示重试
    showRetryDialog()
  } else {
    // 其他错误,显示具体信息
    uni.showToast({ title: err.message, icon: 'none' })
  }
}
```

### 5. 微信公众号支付需要获取OpenID

JSAPI支付必须提供OpenID和AppID:

```typescript
// ✅ 推荐
const openId = await getWechatOpenId()
const appId = 'wx1234567890'

await payOrder({
  orderNo: '123',
  paymentMethod: PaymentMethod.WECHAT,
  tradeType: TradeType.JSAPI,
  openId,
  appId,
})
```

### 6. H5支付需要设置返回URL

支付宝H5支付完成后会跳转,需要处理返回:

```typescript
// ✅ 推荐
const returnUrl = encodeURIComponent(
  window.location.origin + '/pages/payment/result'
)

await payOrder({
  orderNo: '123',
  paymentMethod: PaymentMethod.ALIPAY,
  returnUrl,
})

// 在返回页面查询支付状态
onShow(() => {
  if (isFromPayment()) {
    checkPaymentResult()
  }
})
```

### 7. 使用loading状态优化用户体验

利用响应式的loading状态控制UI:

```typescript
// ✅ 推荐
const { loading, payOrder } = usePayment()

// 在模板中使用
<wd-button :loading="loading" @click="handlePay">
  {{ loading ? '支付中...' : '确认支付' }}
</wd-button>
```

## 常见问题

### 1. 微信公众号支付报错"WeixinJSBridge is not defined"

**问题原因:**

- 不在微信环境中打开
- WeixinJSBridge 未加载完成
- 页面加载过快,微信环境未初始化

**解决方案:**

usePayment 已自动处理此问题,会等待 WeixinJSBridge 加载完成:

```typescript
// 框架内部已实现
if (!PLATFORM.hasWeixinJSBridge()) {
  document.addEventListener('WeixinJSBridgeReady', onReady, false)
} else {
  invokeWechatPay(payInfo, callback)
}
```

如果仍然报错,检查是否在微信环境:

```typescript
const { getPlatformInfo } = usePayment()
const info = getPlatformInfo()

if (!info.isWechatEnvironment) {
  uni.showModal({
    title: '提示',
    content: '请在微信中打开',
  })
}
```

### 2. 支付宝H5支付完成后无法返回

**问题原因:**

- 未设置 `returnUrl` 参数
- `returnUrl` 编码不正确
- 返回URL不可访问

**解决方案:**

正确设置返回URL并进行编码:

```typescript
const returnUrl = encodeURIComponent(
  window.location.origin + window.location.pathname + '?from=alipay'
)

await payOrder({
  orderNo: '123',
  paymentMethod: PaymentMethod.ALIPAY,
  returnUrl,
})
```

在页面中监听返回:

```typescript
onShow(() => {
  // #ifdef H5
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('from') === 'alipay') {
    checkPaymentResult()
  }
  // #endif
})
```

### 3. APP环境支付失败

**问题原因:**

- 未配置支付SDK
- 支付参数格式不正确
- 签名验证失败
- 应用未在支付平台注册

**解决方案:**

确保APP已正确配置支付SDK和参数:

**manifest.json 配置:**

```json
{
  "app-plus": {
    "distribute": {
      "sdkConfigs": {
        "payment": {
          "weixin": {
            "appid": "wx1234567890",
            "UniversalLinks": "https://yourdomain.com/uni-link/"
          },
          "alipay": {}
        }
      }
    }
  }
}
```

检查后端返回的支付参数是否正确:

```typescript
const [err, result] = await payOrder({...})

if (err) {
  console.error('支付失败:', err)
  console.log('支付参数:', result?.paymentData)
  // 检查 payInfo 是否包含必要字段
}
```

### 4. 小程序支付报错"调用失败"

**问题原因:**

- 小程序未配置支付权限
- AppID与商户号不匹配
- 用户未授权
- 支付参数签名错误

**解决方案:**

**微信小程序:**

1. 确保在微信公众平台配置了支付权限
2. 检查 AppID 和商户号是否匹配
3. 确保用户已登录授权

```typescript
// 检查用户登录状态
import { useAuth } from '@/composables/useAuth'

const { isLoggedIn } = useAuth()

if (!isLoggedIn.value) {
  uni.showModal({
    title: '提示',
    content: '请先登录',
  })
  return
}

// 发起支付
await payOrder({...})
```

**支付宝小程序:**

确保 manifest.json 中配置了正确的 AppID:

```json
{
  "mp-alipay": {
    "appid": "2021xxxxxxxxxxxx"
  }
}
```

### 5. 余额支付报错"密码错误"

**问题原因:**

- 用户输入的支付密码不正确
- 未设置支付密码
- 支付密码已过期需要重置

**解决方案:**

提供清晰的密码输入UI和错误提示:

```typescript
const [err, result] = await payOrder({
  orderNo: '123',
  paymentMethod: PaymentMethod.BALANCE,
  payPassword: password.value,
})

if (err) {
  if (err.message.includes('密码错误')) {
    uni.showModal({
      title: '支付密码错误',
      content: '请重新输入或重置支付密码',
      confirmText: '重置密码',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/user/reset-password',
          })
        }
      },
    })
    // 清空密码输入
    password.value = ''
  }
}
```

### 6. 支付状态查询返回"未支付"但实际已支付

**问题原因:**

- 支付结果通知延迟
- 查询时间过早
- 网络延迟导致状态未同步

**解决方案:**

使用轮询查询机制,增加查询次数和间隔:

```typescript
const { pollOrderStatus } = usePayment()

// 最多查询10次,每次间隔2秒
const [err, [statusErr, status]] = await pollOrderStatus(orderNo, 10)

if (!err && !statusErr) {
  if (status?.paid) {
    // 确认支付成功
    handleSuccess()
  } else {
    // 仍未支付,提示用户手动刷新
    uni.showModal({
      title: '提示',
      content: '支付结果确认中,请稍后在订单列表查看',
    })
  }
}
```

### 7. 如何处理用户取消支付

**问题原因:**

- 用户在支付页面点击取消
- 用户点击返回关闭支付页面
- 支付超时自动取消

**解决方案:**

区分用户取消和支付失败,提供不同的处理:

```typescript
const [err, result] = await payOrder({...})

if (err) {
  // 检查是否是用户取消
  if (
    err.message.includes('cancel') ||
    err.message.includes('取消') ||
    err.message.includes('用户')
  ) {
    // 用户取消,静默处理或简单提示
    uni.showToast({
      title: '已取消支付',
      icon: 'none',
      duration: 1500,
    })
    // 返回上一页或订单列表
    uni.navigateBack()
  } else {
    // 真正的支付失败
    handlePaymentError(err)
  }
}
```

## 使用示例总结

### 快速开始

最简单的支付实现:

```typescript
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { loading, createOrderAndPay } = usePayment()

const handlePay = async () => {
  const [err, result] = await createOrderAndPay({
    orderData: {
      productId: '123',
      quantity: 1,
      totalAmount: 9900,
    },
    paymentMethod: PaymentMethod.WECHAT,
  })

  if (!err && result) {
    uni.showToast({ title: '支付成功', icon: 'success' })
  }
}
```

### 完整流程

包含订单创建、支付、状态确认的完整流程:

```typescript
const {
  loading,
  availableMethods,
  createOrderAndPay,
  pollOrderStatus,
} = usePayment()

const handleCompletePayment = async () => {
  // 1. 创建订单并支付
  const [err, result] = await createOrderAndPay({
    orderData: {...},
    paymentMethod: selectedMethod.value,
  })

  if (err || !result) {
    handleError(err)
    return
  }

  // 2. 轮询查询支付状态
  const orderNo = result.orderData.orderNo
  const [pollErr, [statusErr, status]] = await pollOrderStatus(orderNo, 5)

  // 3. 处理支付结果
  if (!pollErr && !statusErr && status?.paid) {
    handleSuccess(orderNo)
  } else {
    handlePending(orderNo)
  }
}
```

### 多平台适配

自动适配不同平台的支付方式:

```typescript
const { getPlatformInfo, payOrder } = usePayment()

const platformInfo = getPlatformInfo()

// 根据平台能力选择支付方式
const selectPaymentMethod = () => {
  if (platformInfo.isWechatEnvironment && platformInfo.supportsWechatPay) {
    return PaymentMethod.WECHAT
  } else if (platformInfo.supportsAlipayPay) {
    return PaymentMethod.ALIPAY
  } else {
    return PaymentMethod.BALANCE
  }
}

// 发起支付
await payOrder({
  orderNo: '123',
  paymentMethod: selectPaymentMethod(),
  // 自动选择最优交易类型
})
```

### 错误处理

完善的错误处理和重试机制:

```typescript
const { payOrder } = usePayment()

const retryCount = ref(0)
const maxRetries = 3

const handlePayWithRetry = async () => {
  try {
    const [err, result] = await payOrder({...})

    if (err) {
      if (retryCount.value < maxRetries) {
        retryCount.value++
        // 延迟后重试
        setTimeout(handlePayWithRetry, 2000)
      } else {
        // 超过重试次数
        showErrorDialog(err)
      }
    } else {
      // 支付成功
      retryCount.value = 0
      handleSuccess()
    }
  } catch (error) {
    handleException(error)
  }
}
```

通过 usePayment,您可以轻松实现跨平台、多支付方式的统一支付功能,框架会自动处理平台差异和技术细节,让您专注于业务逻辑的实现。
