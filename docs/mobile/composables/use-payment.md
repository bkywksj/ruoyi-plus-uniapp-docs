# usePayment

## 介绍

`usePayment` 是 RuoYi-Plus-UniApp 框架提供的统一支付管理组合式函数,专门用于处理移动端的多平台支付业务。它封装了微信支付、支付宝支付、余额支付等多种支付方式,并提供跨平台、跨端的自动适配能力,让开发者无需关心底层平台差异,即可快速实现完整的支付功能。

usePayment 通过智能平台检测机制,能够自动识别当前运行环境(H5、微信小程序、支付宝小程序、APP 等),并选择对应的支付调用方式。同时提供了完整的支付流程管理,包括订单创建、支付发起、状态查询、结果轮询等功能,极大简化了支付业务的开发复杂度。

**核心特性:**

- **多支付方式支持** - 集成微信支付、支付宝支付、余额支付三大主流支付方式
- **全平台适配** - 支持 H5、微信小程序、支付宝小程序、APP 等所有 UniApp 支持的平台
- **智能平台检测** - 自动识别当前运行环境,无需手动判断平台类型
- **自动交易类型选择** - 根据平台和支付方式自动选择最优交易类型
- **完整支付流程** - 提供从订单创建到支付完成的全流程管理
- **状态轮询机制** - 支持订单支付状态的轮询查询,确保支付结果准确
- **TypeScript 类型安全** - 完整的类型定义,提供良好的开发体验

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
        @click="selectedMethod = method"
      >
        <text>{{ getMethodName(method) }}</text>
      </view>
    </view>

    <wd-button type="primary" :loading="loading" block @click="handleSubmit">
      {{ loading ? '支付中...' : '立即支付' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { loading, availableMethods, createOrderAndPay } = usePayment()
const selectedMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)

const getMethodName = (method: PaymentMethod) => {
  const names = {
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.ALIPAY]: '支付宝支付',
    [PaymentMethod.BALANCE]: '余额支付',
  }
  return names[method] || '未知支付方式'
}

const handleSubmit = async () => {
  const orderData = {
    productId: '123',
    quantity: 1,
    totalAmount: 9900, // 单位:分
  }

  const [err, result] = await createOrderAndPay({
    orderData,
    paymentMethod: selectedMethod.value,
  })

  if (!err && result) {
    uni.navigateTo({ url: '/pages/order/success' })
  }
}
</script>
```

- `usePayment()` 返回支付相关的状态和方法
- `availableMethods` 是根据当前平台自动过滤后的可用支付方式列表
- `loading` 是响应式的支付loading状态
- `createOrderAndPay` 是创建订单并支付的核心方法

### 支付已有订单

对于已经创建好的订单,可以直接调用 `payOrder` 方法发起支付:

```vue
<template>
  <view class="order-detail">
    <view class="order-info">
      <text class="order-no">订单号: {{ orderNo }}</text>
      <text class="order-amount">¥ {{ orderAmount }}</text>
    </view>

    <wd-radio-group v-model="selectedMethod">
      <wd-radio v-for="method in availableMethods" :key="method" :value="method">
        {{ getMethodName(method) }}
      </wd-radio>
    </wd-radio-group>

    <wd-button type="primary" :loading="loading" block @click="handlePayOrder">
      确认支付
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const props = defineProps<{
  orderNo: string
  orderAmount: number
}>()

const { loading, availableMethods, payOrder } = usePayment()
const selectedMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)

const getMethodName = (method: PaymentMethod) => {
  const names = {
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.ALIPAY]: '支付宝支付',
    [PaymentMethod.BALANCE]: '余额支付',
  }
  return names[method]
}

const handlePayOrder = async () => {
  const [err, result] = await payOrder({
    orderNo: props.orderNo,
    paymentMethod: selectedMethod.value,
  })

  if (!err && result) {
    uni.showToast({ title: '支付成功', icon: 'success' })
  }
}
</script>
```

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
      </view>
      <view v-else class="failed">
        <wd-icon name="close-circle" size="100rpx" color="#ff4757" />
        <text class="title">支付失败</text>
        <text class="message">{{ errorMessage }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { usePayment } from '@/composables/usePayment'

const props = defineProps<{ orderNo: string }>()
const { queryOrderStatus } = usePayment()

const checking = ref(true)
const paymentSuccess = ref(false)
const errorMessage = ref('')

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

onMounted(() => checkOrderStatus())
</script>
```

### 状态轮询查询

对于某些支付方式,支付状态可能会延迟更新,此时需要轮询查询:

```vue
<template>
  <view class="payment-polling">
    <view class="polling-animation">
      <wd-loading size="80rpx" />
      <text class="polling-text">正在确认支付结果...</text>
      <text class="polling-hint">请稍候,最多尝试 {{ maxRetries }} 次</text>
    </view>
    <wd-button plain @click="handleCancel">取消查询</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { usePayment } from '@/composables/usePayment'

const props = defineProps<{ orderNo: string }>()
const { pollOrderStatus } = usePayment()

const maxRetries = ref(5)
const polling = ref(false)

const startPolling = async () => {
  if (polling.value) return
  polling.value = true

  const [err, [statusErr, status]] = await pollOrderStatus(props.orderNo, maxRetries.value)
  polling.value = false

  if (!err && !statusErr && status?.paid) {
    uni.showToast({ title: '支付成功', icon: 'success' })
    uni.navigateTo({ url: `/pages/order/success?orderNo=${props.orderNo}` })
  } else {
    uni.showModal({
      title: '支付未完成',
      content: status?.message || '请确认支付状态',
      confirmText: '重新查询',
      success: (res) => { if (res.confirm) startPolling() },
    })
  }
}

const handleCancel = () => {
  polling.value = false
  uni.navigateBack()
}

onMounted(() => startPolling())
</script>
```

- `pollOrderStatus` 方法提供轮询查询功能
- 第二个参数是最大重试次数,默认为2次
- 每次查询间隔2秒

### 获取平台信息

了解当前平台的支付能力,用于UI展示和功能控制:

```vue
<script lang="ts" setup>
import { computed } from 'vue'
import { usePayment } from '@/composables/usePayment'

const { getPlatformInfo } = usePayment()
const platformInfo = computed(() => getPlatformInfo())

// platformInfo 包含:
// - platform: 平台名称
// - supportsWechatPay: 是否支持微信支付
// - supportsAlipayPay: 是否支持支付宝支付
// - supportsBalancePay: 是否支持余额支付
// - isWechatEnvironment: 是否在微信环境
// - isAlipayEnvironment: 是否在支付宝环境
// - isInDevTools: 是否在开发工具中
// - recommendedTradeTypes: 推荐交易类型
</script>
```

### 自定义交易类型

某些场景下需要手动指定交易类型:

```vue
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod, TradeType } from '@/api/common/mall/order/orderTypes'

const { loading, payOrder } = usePayment()
const props = defineProps<{ orderNo: string }>()

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

// 是否需要OpenID(JSAPI支付需要)
const needsOpenId = computed(() => {
  return paymentMethod.value === PaymentMethod.WECHAT && tradeType.value === TradeType.JSAPI
})

const handleCustomPay = async () => {
  const params: any = {
    orderNo: props.orderNo,
    paymentMethod: paymentMethod.value,
    tradeType: tradeType.value,
  }

  if (needsOpenId.value) {
    params.openId = openId.value
    params.appId = appId.value
  }

  const [err, result] = await payOrder(params)
  if (!err && result) {
    uni.showToast({ title: '支付成功', icon: 'success' })
  }
}
</script>
```

## 高级用法

### 微信公众号支付(JSAPI)

微信公众号环境下的支付实现,需要获取用户的 OpenID:

```vue
<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod, TradeType } from '@/api/common/mall/order/orderTypes'
import { getWechatOpenId } from '@/api/wechat'

const props = defineProps<{ orderNo: string; orderAmount: number }>()
const { loading, payOrder, getPlatformInfo } = usePayment()

const platformInfo = computed(() => getPlatformInfo())
const openId = ref('')
const appId = ref('wx1234567890abcdef')

// 获取OpenID
const fetchOpenId = async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}

  if (options.code) {
    // 通过code换取OpenID
    const [err, data] = await getWechatOpenId(options.code)
    if (!err && data) openId.value = data.openId
  } else {
    // 从缓存中读取或跳转授权
    const cachedOpenId = uni.getStorageSync('wechat_openid')
    if (cachedOpenId) {
      openId.value = cachedOpenId
    } else {
      redirectToAuth()
    }
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
  if (!platformInfo.value.isWechatEnvironment) {
    uni.showModal({ title: '提示', content: '请在微信中打开', showCancel: false })
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
    uni.navigateTo({ url: `/pages/order/result?orderNo=${props.orderNo}` })
  }
}

onMounted(() => fetchOpenId())
</script>
```

**技术实现:**
- 微信公众号支付使用 JSAPI 模式
- 需要通过 OAuth2.0 获取用户 OpenID
- 使用 `WeixinJSBridge.invoke('getBrandWCPayRequest')` 调起支付
- 自动检测 WeixinJSBridge 是否加载完成

### 微信小程序支付

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const props = defineProps<{ orderNo: string }>()
const { loading, payOrder, pollOrderStatus } = usePayment()

const handleMpPay = async () => {
  const [err, result] = await payOrder({
    orderNo: props.orderNo,
    paymentMethod: PaymentMethod.WECHAT,
    // 小程序环境会自动使用JSAPI交易类型
  })

  if (!err && result) {
    // 轮询查询结果
    const [pollErr, [statusErr, status]] = await pollOrderStatus(props.orderNo, 3)

    if (!pollErr && !statusErr && status?.paid) {
      uni.showModal({
        title: '支付成功',
        content: '感谢您的购买',
        showCancel: false,
        success: () => uni.redirectTo({ url: '/pages/order/list' }),
      })
    } else {
      uni.showModal({
        title: '提示',
        content: '支付结果确认中,请稍后在订单列表查看',
        showCancel: false,
      })
    }
  }
}
</script>
```

**技术实现:**
- 微信小程序使用 `uni.requestPayment` API,provider 设置为 'wxpay'
- 支付参数: timeStamp、nonceStr、package、signType、paySign
- 用户取消支付时 errMsg 包含 'cancel' 关键字

### 支付宝H5支付

```vue
<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const props = defineProps<{ orderNo: string }>()
const { loading, payOrder, queryOrderStatus } = usePayment()
const returnedFromAlipay = ref(false)

const handleAlipayH5Pay = async () => {
  const returnUrl = encodeURIComponent(
    window.location.origin + window.location.pathname + '?from=alipay'
  )

  const [err, result] = await payOrder({
    orderNo: props.orderNo,
    paymentMethod: PaymentMethod.ALIPAY,
    returnUrl,
  })
  // H5支付会自动跳转到支付宝支付页面
}

const checkPaymentResult = async () => {
  const [err, status] = await queryOrderStatus(props.orderNo)

  if (!err && status?.paid) {
    uni.showModal({
      title: '支付成功',
      showCancel: false,
      success: () => uni.redirectTo({ url: '/pages/order/success' }),
    })
  } else {
    uni.showModal({
      title: '提示',
      content: '未检测到支付成功,请在订单列表查看',
      confirmText: '查看订单',
      cancelText: '重新支付',
      success: (res) => {
        if (res.confirm) uni.redirectTo({ url: '/pages/order/list' })
      },
    })
  }
}

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
```

**技术实现:**
- 支付宝H5支付通过 `window.location.href` 跳转到支付宝支付页面
- 需要提供 `returnUrl` 参数,支付完成后跳转回来
- 使用 `onShow` 生命周期检测页面返回

### 余额支付

```vue
<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'
import { getAccountBalance } from '@/api/user/account'

const props = defineProps<{ orderNo: string; orderAmount: number }>()
const { loading, payOrder } = usePayment()

const accountBalance = ref(0)
const payPassword = ref('')
const isInsufficient = computed(() => accountBalance.value < props.orderAmount)

const fetchBalance = async () => {
  const [err, data] = await getAccountBalance()
  if (!err && data) accountBalance.value = data.balance
}

const handleBalancePay = async () => {
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
      success: () => uni.redirectTo({ url: '/pages/order/success' }),
    })
  } else {
    payPassword.value = '' // 密码错误,清空重新输入
  }
}

onMounted(() => fetchBalance())
</script>
```

**技术实现:**
- 余额支付需要用户输入支付密码
- `PaymentMethod.BALANCE` 标识余额支付方式
- 支付成功后立即返回结果,无需轮询查询

### APP环境支付

```vue
<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const props = defineProps<{ orderNo: string }>()
const { loading, payOrder, getPlatformInfo } = usePayment()

const platformInfo = computed(() => getPlatformInfo())
const selectedMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)

const supportedMethods = computed(() => {
  const methods = []
  if (platformInfo.value.supportsWechatPay) {
    methods.push({ value: PaymentMethod.WECHAT, name: '微信支付', icon: 'wechat' })
  }
  if (platformInfo.value.supportsAlipayPay) {
    methods.push({ value: PaymentMethod.ALIPAY, name: '支付宝支付', icon: 'alipay' })
  }
  if (platformInfo.value.supportsBalancePay) {
    methods.push({ value: PaymentMethod.BALANCE, name: '余额支付', icon: 'wallet' })
  }
  return methods
})

const handleAppPay = async () => {
  const [err, result] = await payOrder({
    orderNo: props.orderNo,
    paymentMethod: selectedMethod.value,
    // APP环境会自动选择APP交易类型
  })

  if (!err && result) {
    uni.showModal({
      title: '支付成功',
      showCancel: false,
      success: () => uni.navigateBack(),
    })
  }
}

onMounted(() => {
  if (supportedMethods.value.length > 0) {
    selectedMethod.value = supportedMethods.value[0].value
  }
})
</script>
```

**技术实现:**
- APP环境使用 `uni.requestPayment` API
- 微信APP支付需要配置 `orderInfo` 参数
- 支付宝APP支付使用 `payForm` 或 `payUrl` 参数
- 交易类型自动选择为 `TradeType.APP`

### 完整支付流程

一个完整的支付流程示例,包含订单创建、支付、状态确认:

```vue
<template>
  <view class="complete-payment-flow">
    <!-- 步骤1: 商品信息 -->
    <view v-if="currentStep === 0" class="step-content">
      <view class="product-card">
        <text class="product-name">{{ product.name }}</text>
        <text class="product-price">¥ {{ product.price }}</text>
      </view>
      <wd-stepper v-model="quantity" :min="1" :max="99" />
      <text class="total">总计: ¥ {{ totalAmount }}</text>
      <wd-button type="primary" block @click="currentStep++">下一步</wd-button>
    </view>

    <!-- 步骤2: 选择支付方式 -->
    <view v-if="currentStep === 1" class="step-content">
      <view
        v-for="method in availableMethods"
        :key="method"
        :class="['payment-method', { active: selectedMethod === method }]"
        @click="selectedMethod = method"
      >
        <text>{{ getMethodName(method) }}</text>
      </view>
      <wd-button type="primary" @click="handleCreateOrder">创建订单并支付</wd-button>
    </view>

    <!-- 步骤3: 支付结果 -->
    <view v-if="currentStep === 2" class="step-content">
      <view v-if="paymentSuccess" class="success">
        <wd-icon name="check-circle" size="120rpx" color="#52c41a" />
        <text>支付成功</text>
      </view>
      <view v-else class="failed">
        <wd-icon name="close-circle" size="120rpx" color="#ff4757" />
        <text>{{ errorMessage }}</text>
        <wd-button @click="currentStep = 1">重新支付</wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { loading, availableMethods, createOrderAndPay, pollOrderStatus } = usePayment()

const product = ref({ id: '123', name: '测试商品', price: 99.00 })
const currentStep = ref(0)
const quantity = ref(1)
const selectedMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)
const createdOrderNo = ref('')
const paymentSuccess = ref(false)
const errorMessage = ref('')

const totalAmount = computed(() => (product.value.price * quantity.value).toFixed(2))

const getMethodName = (method: PaymentMethod) => {
  const names = {
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.ALIPAY]: '支付宝支付',
    [PaymentMethod.BALANCE]: '余额支付',
  }
  return names[method]
}

const handleCreateOrder = async () => {
  const orderData = {
    productId: product.value.id,
    quantity: quantity.value,
    totalAmount: Math.round(parseFloat(totalAmount.value) * 100),
  }

  const [err, result] = await createOrderAndPay({
    orderData,
    paymentMethod: selectedMethod.value,
  })

  if (!err && result) {
    createdOrderNo.value = result.orderData.orderNo

    // 轮询查询支付结果
    const [pollErr, [statusErr, status]] = await pollOrderStatus(result.orderData.orderNo, 5)

    if (!pollErr && !statusErr && status?.paid) {
      paymentSuccess.value = true
    } else {
      paymentSuccess.value = false
      errorMessage.value = status?.message || '支付未完成'
    }
  } else {
    paymentSuccess.value = false
    errorMessage.value = err?.message || '支付失败'
  }

  currentStep.value = 2
}
</script>
```

### 错误处理和重试

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const props = defineProps<{ orderNo: string }>()
const { loading, payOrder } = usePayment()

const selectedMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)
const retryCount = ref(0)
const maxRetries = 3

const handlePayWithRetry = async () => {
  const [err, result] = await payOrder({
    orderNo: props.orderNo,
    paymentMethod: selectedMethod.value,
  })

  if (err) {
    handlePaymentError(err)
  } else if (result) {
    retryCount.value = 0
    uni.showToast({ title: '支付成功', icon: 'success' })
  }
}

const handlePaymentError = (error: Error) => {
  const errorMessage = error.message

  // 用户取消,静默处理
  if (errorMessage.includes('取消')) return

  // 根据错误类型提供不同提示
  let tip = ''
  if (errorMessage.includes('网络')) {
    tip = '网络连接失败，请检查网络后重试'
  } else if (errorMessage.includes('余额不足')) {
    tip = '账户余额不足，请选择其他支付方式或充值'
  } else if (errorMessage.includes('密码错误')) {
    tip = '支付密码错误，请重新输入'
  } else {
    tip = `支付失败: ${errorMessage}`
  }

  uni.showModal({
    title: '支付失败',
    content: tip,
    confirmText: '重试',
    success: (res) => {
      if (res.confirm && retryCount.value < maxRetries) {
        retryCount.value++
        handlePayWithRetry()
      }
    },
  })
}
</script>
```

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
| `availableMethods` | `Readonly<Ref<PaymentMethod[]>>` | 当前平台可用的支付方式列表 |

### createOrderAndPay

创建订单并立即发起支付。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `params.orderData` | `CreateOrderBo` | 是 | 订单数据对象 |
| `params.paymentMethod` | `PaymentMethod` | 是 | 支付方式 |
| `params.tradeType` | `TradeType` | 否 | 交易类型,不提供则自动选择 |
| `params.appId` | `string` | 否 | 应用ID,JSAPI支付时必填 |
| `params.openId` | `string` | 否 | 用户OpenID,JSAPI支付时必填 |
| `params.payPassword` | `string` | 否 | 支付密码,余额支付时必填 |
| `params.returnUrl` | `string` | 否 | 支付完成后的返回URL |

**返回值:** `[Error | null, { orderData: any; paymentData: PaymentResponse } | null]`

### payOrder

支付已存在的订单。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `params.orderNo` | `string` | 是 | 订单号 |
| `params.paymentMethod` | `PaymentMethod` | 是 | 支付方式 |
| `params.tradeType` | `TradeType` | 否 | 交易类型,不提供则自动选择 |
| `params.appId` | `string` | 否 | 应用ID,JSAPI支付时必填 |
| `params.openId` | `string` | 否 | 用户OpenID,JSAPI支付时必填 |
| `params.payPassword` | `string` | 否 | 支付密码,余额支付时必填 |
| `params.returnUrl` | `string` | 否 | 支付完成后的返回URL |

**返回值:** `[Error | null, { paymentData: PaymentResponse } | null]`

### queryOrderStatus

单次查询订单支付状态。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `orderNo` | `string` | 是 | 订单号 |

**返回值:** `[Error | null, OrderStatusVo | null]`

### pollOrderStatus

轮询查询订单支付状态,支持重试机制。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `orderNo` | `string` | 是 | - | 订单号 |
| `maxRetries` | `number` | 否 | 2 | 最大重试次数 |

**返回值:** `[Error, [Error, OrderStatusVo]]`

### getTradeType

根据支付方式和当前平台自动选择最优交易类型。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `paymentMethod` | `PaymentMethod` | 是 | 支付方式 |

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

**返回值:** `[Error | null, PaymentMethod[] | null]`

### getPlatformInfo

获取当前平台的详细信息和支付能力。

**返回值:**

```typescript
interface PlatformInfo {
  platform: string
  supportsWechatPay: boolean
  supportsAlipayPay: boolean
  supportsBalancePay: boolean
  isWechatEnvironment: boolean
  isAlipayEnvironment: boolean
  isInDevTools: boolean
  recommendedTradeTypes: {
    wechat: TradeType
    alipay: TradeType
  }
}
```

## 类型定义

### PaymentMethod

```typescript
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

```typescript
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

```typescript
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

```typescript
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

```typescript
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

```typescript
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

```typescript
// ✅ 推荐: 使用 availableMethods,已根据平台自动过滤
const { availableMethods } = usePayment()

// ❌ 不推荐: 硬编码支付方式
const paymentMethods = [PaymentMethod.WECHAT, PaymentMethod.ALIPAY]
```

### 2. 优先使用自动交易类型

```typescript
// ✅ 推荐: 不传 tradeType,自动选择
await payOrder({
  orderNo: '123',
  paymentMethod: PaymentMethod.WECHAT,
})

// ❌ 不推荐: 手动判断平台
const tradeType = PLATFORM.isMpWeixin ? TradeType.JSAPI : TradeType.H5
```

### 3. 支付后使用轮询确认结果

```typescript
// ✅ 推荐: 轮询查询支付结果
const [err, result] = await payOrder({...})
if (!err && result) {
  const [pollErr, [statusErr, status]] = await pollOrderStatus(orderNo, 5)
  if (!pollErr && !statusErr && status?.paid) {
    handlePaymentSuccess()
  }
}
```

### 4. 完善的错误处理

```typescript
// ✅ 推荐: 区分错误类型
const [err, result] = await payOrder({...})
if (err) {
  if (err.message.includes('取消')) return // 用户取消,静默处理
  if (err.message.includes('网络')) showRetryDialog()
  else uni.showToast({ title: err.message, icon: 'none' })
}
```

### 5. 微信公众号支付需要获取OpenID

```typescript
// ✅ JSAPI支付必须提供OpenID和AppID
await payOrder({
  orderNo: '123',
  paymentMethod: PaymentMethod.WECHAT,
  tradeType: TradeType.JSAPI,
  openId: await getWechatOpenId(),
  appId: 'wx1234567890',
})
```

### 6. H5支付需要设置返回URL

```typescript
// ✅ 支付宝H5支付需要处理返回
const returnUrl = encodeURIComponent(window.location.origin + '/pages/payment/result')

await payOrder({
  orderNo: '123',
  paymentMethod: PaymentMethod.ALIPAY,
  returnUrl,
})

// 在返回页面查询支付状态
onShow(() => {
  if (isFromPayment()) checkPaymentResult()
})
```

### 7. 使用loading状态优化用户体验

```typescript
const { loading, payOrder } = usePayment()

// 在模板中使用
<wd-button :loading="loading" @click="handlePay">
  {{ loading ? '支付中...' : '确认支付' }}
</wd-button>
```

## 常见问题

### 1. 微信公众号支付报错"WeixinJSBridge is not defined"

**原因:** 不在微信环境中打开或 WeixinJSBridge 未加载完成。

**解决方案:** usePayment 已自动处理此问题,会等待 WeixinJSBridge 加载完成。如果仍然报错,检查是否在微信环境:

```typescript
const { getPlatformInfo } = usePayment()
const info = getPlatformInfo()

if (!info.isWechatEnvironment) {
  uni.showModal({ title: '提示', content: '请在微信中打开' })
}
```

### 2. 支付宝H5支付完成后无法返回

**原因:** 未设置 `returnUrl` 参数或编码不正确。

**解决方案:**

```typescript
const returnUrl = encodeURIComponent(
  window.location.origin + window.location.pathname + '?from=alipay'
)
await payOrder({ orderNo: '123', paymentMethod: PaymentMethod.ALIPAY, returnUrl })

// 监听返回
onShow(() => {
  // #ifdef H5
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('from') === 'alipay') checkPaymentResult()
  // #endif
})
```

### 3. APP环境支付失败

**原因:** 未配置支付SDK、支付参数格式不正确或签名验证失败。

**解决方案:** 确保 manifest.json 配置正确:

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

### 4. 小程序支付报错"调用失败"

**原因:** 小程序未配置支付权限、AppID与商户号不匹配或用户未授权。

**解决方案:**

1. 确保在微信公众平台配置了支付权限
2. 检查 AppID 和商户号是否匹配
3. 确保用户已登录授权

```typescript
import { useAuth } from '@/composables/useAuth'
const { isLoggedIn } = useAuth()

if (!isLoggedIn.value) {
  uni.showModal({ title: '提示', content: '请先登录' })
  return
}
```

### 5. 余额支付报错"密码错误"

**原因:** 用户输入的支付密码不正确或未设置支付密码。

**解决方案:**

```typescript
const [err, result] = await payOrder({
  orderNo: '123',
  paymentMethod: PaymentMethod.BALANCE,
  payPassword: password.value,
})

if (err?.message.includes('密码错误')) {
  uni.showModal({
    title: '支付密码错误',
    content: '请重新输入或重置支付密码',
    confirmText: '重置密码',
    success: (res) => {
      if (res.confirm) uni.navigateTo({ url: '/pages/user/reset-password' })
    },
  })
  password.value = ''
}
```

### 6. 支付状态查询返回"未支付"但实际已支付

**原因:** 支付结果通知延迟或查询时间过早。

**解决方案:** 使用轮询查询机制,增加查询次数:

```typescript
const { pollOrderStatus } = usePayment()

// 最多查询10次,每次间隔2秒
const [err, [statusErr, status]] = await pollOrderStatus(orderNo, 10)

if (!status?.paid) {
  uni.showModal({
    title: '提示',
    content: '支付结果确认中,请稍后在订单列表查看',
  })
}
```

### 7. 如何处理用户取消支付

**解决方案:** 区分用户取消和支付失败:

```typescript
const [err, result] = await payOrder({...})

if (err) {
  if (err.message.includes('cancel') || err.message.includes('取消')) {
    // 用户取消,静默处理或简单提示
    uni.showToast({ title: '已取消支付', icon: 'none' })
    uni.navigateBack()
  } else {
    // 真正的支付失败
    handlePaymentError(err)
  }
}
```
