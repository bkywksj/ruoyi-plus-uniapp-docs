# 支付插件

## 介绍

支付插件是 RuoYi-Plus-UniApp 框架的核心业务组件之一，提供了跨平台的统一支付解决方案。该插件基于 Composable 组合式函数模式设计，支持微信支付、支付宝支付和余额支付三种支付方式，能够自动识别运行平台并选择最优的支付交易类型。

**核心特性：**

- **多平台支持** - 支持 App、H5、微信小程序、支付宝小程序等多种运行环境
- **多支付方式** - 集成微信支付、支付宝支付、余额支付三种主流支付渠道
- **自动平台适配** - 根据运行环境自动选择合适的交易类型（JSAPI、APP、H5、NATIVE等）
- **统一 API** - 提供统一的支付接口，屏蔽不同平台的差异
- **订单管理** - 支持创建订单并支付、支付已有订单、订单状态轮询等功能
- **类型安全** - 完整的 TypeScript 类型定义，提供良好的开发体验
- **错误处理** - 统一的错误处理和用户提示机制

## 支付方式

### 微信支付

支持以下平台和交易类型：

| 平台 | 交易类型 | 说明 |
|------|----------|------|
| 微信小程序 | JSAPI | 小程序内支付 |
| 微信公众号 H5 | JSAPI | 微信内网页支付 |
| App | APP | 原生 App 支付 |
| 普通 H5 | H5 | 浏览器跳转微信支付 |
| PC/其他 | NATIVE | 扫码支付 |

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { createOrderAndPay, getPlatformInfo } = usePayment()

// 查看当前平台支持情况
const platformInfo = getPlatformInfo()
console.log('支持微信支付:', platformInfo.supportsWechatPay)
console.log('推荐交易类型:', platformInfo.recommendedTradeTypes.wechat)

// 发起微信支付
const payWithWechat = async () => {
  const [err, result] = await createOrderAndPay({
    orderData: {
      goodsId: '1001',
      price: '99.00',
      quantity: 1,
      goodsName: '测试商品'
    },
    paymentMethod: PaymentMethod.WECHAT
    // tradeType 会自动根据平台选择
  })

  if (!err && result) {
    console.log('支付成功:', result)
  }
}
</script>
```

**技术实现：**

- 微信小程序使用 `uni.requestPayment` 调用微信支付
- 微信公众号 H5 使用 WeixinJSBridge 调用 `getBrandWCPayRequest`
- App 端使用 `uni.requestPayment` 配合 `provider: 'wxpay'`
- 自动检测微信环境，非微信环境会提示错误

### 支付宝支付

支持以下平台和交易类型：

| 平台 | 交易类型 | 说明 |
|------|----------|------|
| 支付宝小程序 | APP | 小程序内支付 |
| App | APP | 原生 App 支付 |
| H5 | WAP | 手机浏览器支付 |
| PC | PAGE | 网页支付 |

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { createOrderAndPay, getPlatformInfo } = usePayment()

// 查看当前平台支持情况
const platformInfo = getPlatformInfo()
console.log('支持支付宝:', platformInfo.supportsAlipayPay)
console.log('推荐交易类型:', platformInfo.recommendedTradeTypes.alipay)

// 发起支付宝支付
const payWithAlipay = async () => {
  const [err, result] = await createOrderAndPay({
    orderData: {
      goodsId: '1001',
      price: '99.00',
      quantity: 1,
      goodsName: '测试商品'
    },
    paymentMethod: PaymentMethod.ALIPAY,
    returnUrl: 'https://your-domain.com/pay/callback' // H5 支付需要
  })

  if (!err && result) {
    console.log('支付成功:', result)
  }
}
</script>
```

**技术实现：**

- 支付宝小程序使用 `uni.requestPayment` 配合 `provider: 'alipay'`
- H5 端通过跳转支付链接 `payUrl` 实现支付
- App 端使用原生支付能力
- H5 支付完成后会跳转到 `returnUrl`

### 余额支付

余额支付是平台内部的虚拟货币支付方式，所有平台都支持。

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { createOrderAndPay } = usePayment()

// 发起余额支付
const payWithBalance = async () => {
  const [err, result] = await createOrderAndPay({
    orderData: {
      goodsId: '1001',
      price: '99.00',
      quantity: 1,
      goodsName: '测试商品'
    },
    paymentMethod: PaymentMethod.BALANCE,
    payPassword: '123456' // 支付密码
  })

  if (!err && result) {
    console.log('余额支付成功:', result)
  }
}
</script>
```

**使用说明：**

- 余额支付需要传入 `payPassword` 支付密码
- 余额不足时后端会返回错误
- 所有平台都支持余额支付

## 基本用法

### 引入与初始化

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod, TradeType } from '@/api/common/mall/order/orderTypes'

// 创建支付实例
const {
  loading,           // 加载状态（只读）
  availableMethods,  // 可用支付方式（只读）
  createOrderAndPay, // 创建订单并支付
  payOrder,          // 支付已有订单
  queryOrderStatus,  // 查询订单状态
  pollOrderStatus,   // 轮询订单状态
  getTradeType,      // 获取推荐交易类型
  fetchAvailableMethods, // 刷新可用支付方式
  getPlatformInfo,   // 获取平台信息
} = usePayment()
</script>
```

**初始化说明：**

- `usePayment()` 会在初始化时自动获取可用的支付方式
- 可用支付方式会根据当前平台自动过滤
- `loading` 和 `availableMethods` 是只读响应式引用

### 创建订单并支付

这是最常用的支付方式，一次调用完成订单创建和支付发起。

```vue
<template>
  <view class="checkout">
    <view class="goods-info">
      <image :src="goods.image" mode="aspectFill" />
      <view class="info">
        <text class="name">{{ goods.name }}</text>
        <text class="price">¥{{ goods.price }}</text>
      </view>
    </view>

    <view class="payment-methods">
      <view
        v-for="method in availableMethods"
        :key="method"
        class="method-item"
        :class="{ active: selectedMethod === method }"
        @tap="selectedMethod = method"
      >
        <text>{{ getMethodName(method) }}</text>
      </view>
    </view>

    <button
      :loading="loading"
      :disabled="loading"
      @tap="handlePay"
    >
      立即支付
    </button>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { loading, availableMethods, createOrderAndPay } = usePayment()

const goods = ref({
  id: '1001',
  name: '精品商品',
  price: '99.00',
  image: '/static/goods/1.png'
})

const selectedMethod = ref<PaymentMethod>(PaymentMethod.WECHAT)

const getMethodName = (method: PaymentMethod) => {
  const names = {
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.ALIPAY]: '支付宝',
    [PaymentMethod.BALANCE]: '余额支付'
  }
  return names[method] || method
}

const handlePay = async () => {
  const [err, result] = await createOrderAndPay({
    orderData: {
      goodsId: goods.value.id,
      price: goods.value.price,
      quantity: 1,
      goodsName: goods.value.name,
      goodsImg: goods.value.image,
      buyerRemark: '请尽快发货'
    },
    paymentMethod: selectedMethod.value
  })

  if (!err && result) {
    // 支付成功，跳转到订单详情
    uni.redirectTo({
      url: `/pages/order/detail?orderNo=${result.orderData.orderNo}`
    })
  }
}
</script>

```

### 支付已有订单

当订单已创建但未支付时，可以使用 `payOrder` 方法继续支付。

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { payOrder, loading } = usePayment()

// 支付已有订单
const continuePayOrder = async (orderNo: string, method: PaymentMethod) => {
  const [err, result] = await payOrder({
    orderNo,
    paymentMethod: method,
    // 可选参数
    appId: 'wx1234567890',  // 微信 appId（如需指定）
    openId: 'oXXXX',        // 微信 openId（JSAPI 支付需要）
    returnUrl: 'https://your-domain.com/pay/callback' // H5 支付回调
  })

  if (!err && result) {
    console.log('支付成功:', result.paymentData)
  }
}
</script>
```

**使用场景：**

- 用户取消支付后重新支付
- 订单超时未支付，用户点击继续支付
- 订单列表中的"去支付"按钮

### 查询订单状态

支付完成后可能需要查询订单的最新状态。

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { usePayment } from '@/composables/usePayment'

const { queryOrderStatus, pollOrderStatus } = usePayment()

const orderStatus = ref<string>('')
const isPaid = ref(false)

// 单次查询订单状态
const checkOrderStatus = async (orderNo: string) => {
  const [err, data] = await queryOrderStatus(orderNo)

  if (!err && data) {
    orderStatus.value = data.orderStatusName
    isPaid.value = data.isPaid

    if (data.isPaid) {
      console.log('订单已支付，支付时间:', data.paymentTime)
    }
  }
}

// 轮询查询订单状态（适用于支付后确认）
const waitForPayment = async (orderNo: string) => {
  const [err, result] = await pollOrderStatus(orderNo, 3) // 最多轮询 3 次

  if (!err && result) {
    const [queryErr, data] = result
    if (!queryErr && data?.isPaid) {
      console.log('支付确认成功')
      // 跳转到支付成功页面
    }
  }
}
</script>
```

**轮询说明：**

- `pollOrderStatus` 默认最多轮询 2 次，间隔 2 秒
- 适用于支付回调可能延迟的场景
- 使用 `toWithRetry` 工具函数实现重试逻辑

### 获取平台信息

获取当前运行环境的详细信息，用于调试或展示。

```vue
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { usePayment } from '@/composables/usePayment'

const { getPlatformInfo } = usePayment()

const platformInfo = ref<any>(null)

onMounted(() => {
  platformInfo.value = getPlatformInfo()
  console.log('平台信息:', platformInfo.value)
})

// platformInfo 结构：
// {
//   platform: 'mp-weixin',           // 当前平台
//   supportsWechatPay: true,         // 是否支持微信支付
//   supportsAlipayPay: false,        // 是否支持支付宝
//   supportsBalancePay: true,        // 是否支持余额支付
//   isWechatEnvironment: true,       // 是否微信环境
//   isAlipayEnvironment: false,      // 是否支付宝环境
//   isInDevTools: true,              // 是否在开发工具中
//   recommendedTradeTypes: {         // 推荐交易类型
//     wechat: 'JSAPI',
//     alipay: 'APP'
//   }
// }
</script>
```

## 支付流程

### 完整支付流程

```
┌─────────────────────────────────────────────────────────┐
│                     用户发起支付                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              1. 创建订单 (createOrder)                   │
│                    后端返回订单信息                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              2. 创建支付 (createPayment)                 │
│                  后端返回支付参数                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              3. 调用平台支付                              │
│     微信: WeixinJSBridge / uni.requestPayment           │
│     支付宝: uni.requestPayment / 跳转链接                 │
│     余额: 直接完成                                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              4. 支付结果处理                              │
│        成功: 跳转成功页 / 失败: 提示错误                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              5. 查询订单状态（可选）                       │
│                  确认支付是否到账                         │
└─────────────────────────────────────────────────────────┘
```

### 微信公众号 H5 支付流程

微信公众号 H5 支付需要特殊处理 WeixinJSBridge：

```typescript
// 支付流程示意
const callWechatH5Pay = async (paymentResponse: PaymentResponse): Promise<boolean> => {
  return new Promise((resolve) => {
    // 1. 检查是否在微信环境
    if (!PLATFORM.isWechatEnvironment()) {
      toast.error('请在微信中打开')
      resolve(false)
      return
    }

    const payInfo = paymentResponse.payInfo

    // 2. 检查 WeixinJSBridge 是否准备好
    if (!PLATFORM.hasWeixinJSBridge()) {
      // 等待 WeixinJSBridge 加载
      document.addEventListener('WeixinJSBridgeReady', () => {
        invokeWechatPay(payInfo, resolve)
      }, false)

      // 设置超时
      setTimeout(() => {
        toast.error('支付环境初始化失败')
        resolve(false)
      }, 10000)
    } else {
      // 3. 直接调用支付
      invokeWechatPay(payInfo, resolve)
    }
  })
}

// 调用微信支付
const invokeWechatPay = (payInfo: Record<string, string>, callback: Function) => {
  window.WeixinJSBridge.invoke(
    'getBrandWCPayRequest',
    {
      appId: payInfo.appId,
      timeStamp: payInfo.timeStamp,
      nonceStr: payInfo.nonceStr,
      package: payInfo.package,
      signType: payInfo.signType,
      paySign: payInfo.paySign,
    },
    (res) => {
      if (res.err_msg === 'get_brand_wcpay_request:ok') {
        callback(true)
      } else {
        callback(false)
      }
    }
  )
}
```

## API

### usePayment 返回值

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| `loading` | `Readonly<Ref<boolean>>` | 支付加载状态 |
| `availableMethods` | `Readonly<Ref<PaymentMethod[]>>` | 当前平台可用的支付方式 |
| `createOrderAndPay` | `Function` | 创建订单并支付 |
| `payOrder` | `Function` | 支付已有订单 |
| `queryOrderStatus` | `Function` | 查询订单状态 |
| `pollOrderStatus` | `Function` | 轮询查询订单状态 |
| `getTradeType` | `Function` | 获取推荐的交易类型 |
| `fetchAvailableMethods` | `Function` | 刷新可用支付方式 |
| `getPlatformInfo` | `Function` | 获取平台详细信息 |

### createOrderAndPay 参数

```typescript
interface CreateOrderAndPayParams {
  /** 订单数据 */
  orderData: CreateOrderBo
  /** 支付方式 */
  paymentMethod: PaymentMethod
  /** 交易类型（可选，不提供则自动选择） */
  tradeType?: TradeType
  /** 应用ID */
  appId?: string
  /** 微信 openId */
  openId?: string
  /** 支付密码（余额支付） */
  payPassword?: string
  /** 返回地址（H5 支付） */
  returnUrl?: string
}
```

### payOrder 参数

```typescript
interface PayOrderParams {
  /** 订单编号 */
  orderNo: string
  /** 支付方式 */
  paymentMethod: PaymentMethod
  /** 交易类型（可选） */
  tradeType?: TradeType
  /** 应用ID */
  appId?: string
  /** 微信 openId */
  openId?: string
  /** 支付密码 */
  payPassword?: string
  /** 返回地址 */
  returnUrl?: string
}
```

### 类型定义

```typescript
/** 支付方式枚举 */
enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  BALANCE = 'balance',
}

/** 交易类型枚举 */
enum TradeType {
  // 微信支付类型
  JSAPI = 'JSAPI',    // 公众号/小程序
  NATIVE = 'NATIVE',  // 扫码支付
  APP = 'APP',        // App 支付
  H5 = 'H5',          // H5 支付

  // 支付宝支付类型
  WAP = 'WAP',        // 手机网页
  PAGE = 'PAGE',      // 电脑网页
}

/** 订单状态枚举 */
enum OrderStatus {
  PENDING = 'pending',       // 待支付
  PAID = 'paid',            // 已支付
  DELIVERED = 'delivered',  // 已发货
  COMPLETED = 'completed',  // 已完成
  CANCELLED = 'cancelled',  // 已取消
  REFUNDED = 'refunded',    // 已退款
}

/** 创建订单请求 */
interface CreateOrderBo {
  /** 商品ID */
  goodsId: string | number
  /** SKU ID */
  skuId?: string | number
  /** SKU名称 */
  skuName?: string
  /** 规格值JSON */
  specValues?: string
  /** 商品名称 */
  goodsName?: string
  /** 商品图片 */
  goodsImg?: string
  /** 商品价格 */
  price: string | number
  /** 购买数量 */
  quantity: number
  /** 买家备注 */
  buyerRemark?: string
  /** 备注 */
  remark?: string
}

/** 支付响应 */
interface PaymentResponse {
  /** 是否成功 */
  success: boolean
  /** 响应消息 */
  message: string
  /** 错误码 */
  errorCode?: string
  /** 商户订单号 */
  outTradeNo: string
  /** 原始订单号 */
  orderNo: string
  /** 支付方式 */
  paymentMethod: string
  /** 支付金额 */
  totalAmount: number
  /** 第三方交易号 */
  transactionId?: string
  /** 预支付ID */
  prepayId?: string
  /** 支付参数（微信 JSAPI） */
  payInfo?: Record<string, string>
  /** 二维码链接 */
  codeUrl?: string
  /** 二维码Base64 */
  qrCodeBase64?: string
  /** 支付链接 */
  payUrl?: string
  /** 支付表单 */
  payForm?: string
  /** 支付状态 */
  tradeState?: string
  /** 支付时间 */
  payTime?: string
  /** 过期时间 */
  expireTime?: string
}

/** 订单状态查询响应 */
interface OrderStatusVo {
  /** 订单编号 */
  orderNo: string
  /** 订单状态 */
  orderStatus: string
  /** 订单状态名称 */
  orderStatusName: string
  /** 支付时间 */
  paymentTime?: string
  /** 是否已支付 */
  isPaid: boolean
}
```

## 平台适配

### 平台检测

插件使用 `PLATFORM` 工具检测当前运行环境：

```typescript
import PLATFORM from '@/utils/platform'

// 平台类型
PLATFORM.platform      // 'mp-weixin' | 'mp-alipay' | 'h5' | 'app' 等
PLATFORM.isMpWeixin    // 是否微信小程序
PLATFORM.isMpAlipay    // 是否支付宝小程序
PLATFORM.isH5          // 是否 H5
PLATFORM.isApp         // 是否 App

// 微信环境检测
PLATFORM.isWechatOfficialH5     // 是否微信公众号 H5
PLATFORM.isWechatEnvironment()  // 是否在微信内
PLATFORM.hasWeixinJSBridge()    // WeixinJSBridge 是否可用

// 支付宝环境检测
PLATFORM.isAlipayOfficialH5     // 是否支付宝内 H5
PLATFORM.isAlipayEnvironment()  // 是否在支付宝内

// 开发工具检测
PLATFORM.isInDevTools()         // 是否在开发工具中
```

### 交易类型自动选择

插件会根据平台自动选择最合适的交易类型：

```typescript
const getTradeType = (paymentMethod: PaymentMethod): TradeType => {
  if (paymentMethod === PaymentMethod.WECHAT) {
    if (PLATFORM.isMpWeixin) {
      return TradeType.JSAPI          // 微信小程序
    } else if (PLATFORM.isApp) {
      return TradeType.APP            // App
    } else if (PLATFORM.isWechatOfficialH5) {
      return TradeType.JSAPI          // 微信公众号
    } else if (PLATFORM.isH5) {
      return TradeType.H5             // 普通 H5
    } else {
      return TradeType.NATIVE         // 其他（扫码）
    }
  } else if (paymentMethod === PaymentMethod.ALIPAY) {
    if (PLATFORM.isMpAlipay || PLATFORM.isApp) {
      return TradeType.APP            // 小程序/App
    } else if (PLATFORM.isH5) {
      return TradeType.WAP            // H5
    } else {
      return TradeType.PAGE           // 网页
    }
  }
  throw new Error(`不支持的支付方式: ${paymentMethod}`)
}
```

### 支付方式过滤

获取可用支付方式时会根据平台自动过滤：

```typescript
const fetchAvailableMethods = async () => {
  const [err, data] = await getPaymentMethodsApi()
  if (!err && data) {
    const filteredMethods = data.filter((method) => {
      switch (method) {
        case PaymentMethod.WECHAT:
          // 仅在微信小程序、微信公众号、App 中可用
          return PLATFORM.isMpWeixin || PLATFORM.isWechatOfficialH5 || PLATFORM.isApp
        case PaymentMethod.ALIPAY:
          // 在支付宝小程序、支付宝内H5、普通H5、App 中可用
          return PLATFORM.isMpAlipay || PLATFORM.isAlipayOfficialH5 || PLATFORM.isH5 || PLATFORM.isApp
        case PaymentMethod.BALANCE:
          // 所有平台都支持
          return true
        default:
          return false
      }
    })
    availableMethods.value = filteredMethods
  }
}
```

## 最佳实践

### 1. 支付前检查

在发起支付前进行必要的检查：

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'
import { useToast } from '@/wd'

const { availableMethods, createOrderAndPay, getPlatformInfo } = usePayment()
const toast = useToast()

const handlePay = async (paymentMethod: PaymentMethod) => {
  // 1. 检查支付方式是否可用
  if (!availableMethods.value.includes(paymentMethod)) {
    toast.error('当前环境不支持该支付方式')
    return
  }

  // 2. 微信支付额外检查
  if (paymentMethod === PaymentMethod.WECHAT) {
    const platformInfo = getPlatformInfo()
    if (!platformInfo.isWechatEnvironment && !platformInfo.platform.includes('app')) {
      toast.warning('请在微信或App中使用微信支付')
      return
    }
  }

  // 3. 余额支付检查余额
  if (paymentMethod === PaymentMethod.BALANCE) {
    const userBalance = await checkUserBalance()
    if (userBalance < orderAmount) {
      toast.error('余额不足，请充值或选择其他支付方式')
      return
    }
  }

  // 4. 发起支付
  const [err, result] = await createOrderAndPay({
    orderData: {...},
    paymentMethod
  })
}
</script>
```

### 2. 支付结果确认

支付完成后确认订单状态：

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'

const { createOrderAndPay, pollOrderStatus } = usePayment()

const handlePay = async () => {
  const [err, result] = await createOrderAndPay({
    orderData: {...},
    paymentMethod: PaymentMethod.WECHAT
  })

  if (!err && result) {
    // 支付调用成功，轮询确认支付状态
    const [pollErr, pollResult] = await pollOrderStatus(result.orderData.orderNo, 3)

    if (!pollErr && pollResult) {
      const [statusErr, statusData] = pollResult
      if (!statusErr && statusData?.isPaid) {
        // 支付确认成功
        uni.redirectTo({
          url: `/pages/order/success?orderNo=${result.orderData.orderNo}`
        })
      } else {
        // 支付可能未到账，提示用户稍后查看
        uni.showModal({
          title: '支付处理中',
          content: '支付结果处理中，请稍后在订单列表中查看',
          showCancel: false,
          success: () => {
            uni.redirectTo({ url: '/pages/order/list' })
          }
        })
      }
    }
  }
}
</script>
```

### 3. 支付失败重试

提供友好的支付失败处理：

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { useMessage } from '@/wd'

const { payOrder, loading } = usePayment()
const message = useMessage()

const retryCount = ref(0)
const maxRetries = 3

const handlePayRetry = async (orderNo: string, paymentMethod: PaymentMethod) => {
  if (retryCount.value >= maxRetries) {
    message.confirm({
      title: '支付失败',
      content: '多次支付失败，是否联系客服？',
      confirmText: '联系客服',
      cancelText: '稍后重试'
    }).then((action) => {
      if (action === 'confirm') {
        // 跳转客服页面
      }
    })
    return
  }

  retryCount.value++

  const [err, result] = await payOrder({
    orderNo,
    paymentMethod
  })

  if (err) {
    // 分析错误类型
    if (err.message.includes('取消')) {
      // 用户取消，不计入重试次数
      retryCount.value--
    } else if (err.message.includes('余额不足')) {
      // 余额不足，引导充值
      uni.navigateTo({ url: '/pages/wallet/recharge' })
    } else {
      // 其他错误，提示重试
      message.alert({
        title: '支付失败',
        content: `${err.message}，是否重试？`
      }).then(() => {
        handlePayRetry(orderNo, paymentMethod)
      })
    }
  }
}
</script>
```

### 4. 支付方式选择器组件

封装可复用的支付方式选择器：

```vue
<!-- components/PaymentSelector.vue -->
<template>
  <view class="payment-selector">
    <view class="title">选择支付方式</view>
    <view
      v-for="method in availableMethods"
      :key="method"
      class="method-item"
      @tap="selectMethod(method)"
    >
      <view class="left">
        <image :src="getMethodIcon(method)" class="icon" />
        <text class="name">{{ getMethodName(method) }}</text>
      </view>
      <view class="right">
        <view
          class="radio"
          :class="{ active: modelValue === method }"
        />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const props = defineProps<{
  modelValue: PaymentMethod
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PaymentMethod]
}>()

const { availableMethods } = usePayment()

const getMethodName = (method: PaymentMethod) => {
  const names: Record<PaymentMethod, string> = {
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.ALIPAY]: '支付宝',
    [PaymentMethod.BALANCE]: '余额支付'
  }
  return names[method]
}

const getMethodIcon = (method: PaymentMethod) => {
  const icons: Record<PaymentMethod, string> = {
    [PaymentMethod.WECHAT]: '/static/icons/wechat-pay.png',
    [PaymentMethod.ALIPAY]: '/static/icons/alipay.png',
    [PaymentMethod.BALANCE]: '/static/icons/balance.png'
  }
  return icons[method]
}

const selectMethod = (method: PaymentMethod) => {
  emit('update:modelValue', method)
}
</script>

```

### 5. 订单支付倒计时

显示订单支付倒计时：

```vue
<template>
  <view class="countdown">
    <text v-if="remainingTime > 0">
      请在 {{ formatTime(remainingTime) }} 内完成支付
    </text>
    <text v-else class="expired">
      订单已过期
    </text>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  expireTime: string // ISO 时间字符串
}>()

const emit = defineEmits<{
  expired: []
}>()

const remainingTime = ref(0)
let timer: number | null = null

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const updateRemainingTime = () => {
  const expireTimestamp = new Date(props.expireTime).getTime()
  const now = Date.now()
  const diff = Math.floor((expireTimestamp - now) / 1000)

  if (diff <= 0) {
    remainingTime.value = 0
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    emit('expired')
  } else {
    remainingTime.value = diff
  }
}

onMounted(() => {
  updateRemainingTime()
  timer = setInterval(updateRemainingTime, 1000) as unknown as number
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

```

## 常见问题

### 1. 微信公众号 H5 支付提示 "请在微信中打开"

**问题原因：**
- 不在微信浏览器内打开页面
- 微信 JS-SDK 未正确初始化

**解决方案：**

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { getPlatformInfo, createOrderAndPay } = usePayment()

const handlePay = async () => {
  const platformInfo = getPlatformInfo()

  // 检查是否在微信环境
  if (!platformInfo.isWechatEnvironment) {
    // 非微信环境，引导用户在微信中打开
    uni.showModal({
      title: '提示',
      content: '请在微信中打开本页面进行支付',
      showCancel: false
    })
    return
  }

  // 在微信中继续支付
  const [err, result] = await createOrderAndPay({
    orderData: {...},
    paymentMethod: PaymentMethod.WECHAT
  })
}
</script>
```

### 2. 微信小程序支付报错 "商户号与 appId 不匹配"

**问题原因：**
- 后端配置的商户号与小程序 appId 未绑定
- 小程序未完成微信支付开通

**解决方案：**

1. 登录微信支付商户平台
2. 产品中心 → AppID 账号管理
3. 关联小程序的 AppID
4. 在小程序后台确认授权

### 3. 支付宝 H5 支付无法返回应用

**问题原因：**
- 未设置 `returnUrl` 参数
- `returnUrl` 不在支付宝配置的回调白名单中

**解决方案：**

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { createOrderAndPay } = usePayment()

const handleAlipayPay = async () => {
  const [err, result] = await createOrderAndPay({
    orderData: {...},
    paymentMethod: PaymentMethod.ALIPAY,
    // 设置支付完成后的返回地址
    returnUrl: `${window.location.origin}/pages/order/pay-result`
  })
}
</script>
```

同时需要在支付宝开放平台配置回调域名白名单。

### 4. 余额支付提示 "支付密码错误"

**问题原因：**
- 用户输入的支付密码不正确
- 未传递 `payPassword` 参数

**解决方案：**

```vue
<template>
  <wd-password-input
    v-model="payPassword"
    :length="6"
    @complete="handlePayPasswordComplete"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { createOrderAndPay } = usePayment()

const payPassword = ref('')

const handlePayPasswordComplete = async (password: string) => {
  const [err, result] = await createOrderAndPay({
    orderData: {...},
    paymentMethod: PaymentMethod.BALANCE,
    payPassword: password
  })

  if (err) {
    if (err.message.includes('密码')) {
      // 清空密码输入
      payPassword.value = ''
      // 提示用户
    }
  }
}
</script>
```

### 5. 支付成功但订单状态未更新

**问题原因：**
- 支付回调通知延迟
- 网络问题导致回调失败

**解决方案：**

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'

const { createOrderAndPay, pollOrderStatus } = usePayment()

const handlePay = async () => {
  const [err, result] = await createOrderAndPay({
    orderData: {...},
    paymentMethod: PaymentMethod.WECHAT
  })

  if (!err && result) {
    // 支付调用成功后，轮询确认状态
    const orderNo = result.orderData.orderNo

    // 等待 2 秒后开始轮询
    await new Promise(resolve => setTimeout(resolve, 2000))

    const [pollErr, pollResult] = await pollOrderStatus(orderNo, 5) // 最多查询 5 次

    if (!pollErr && pollResult) {
      const [statusErr, statusData] = pollResult
      if (statusData?.isPaid) {
        // 确认支付成功
        console.log('订单已支付')
      } else {
        // 提示用户稍后查看
        uni.showToast({
          title: '支付处理中，请稍后查看订单状态',
          icon: 'none',
          duration: 3000
        })
      }
    }
  }
}
</script>
```

### 6. App 端微信支付未安装微信

**问题原因：**
- 用户设备未安装微信客户端
- 微信版本过低

**解决方案：**

```vue
<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { createOrderAndPay, getPlatformInfo, availableMethods } = usePayment()

const handlePay = async () => {
  const platformInfo = getPlatformInfo()

  // App 端检查微信是否安装
  // #ifdef APP
  if (!plus.runtime.isApplicationExist({ pname: 'com.tencent.mm', action: 'weixin://' })) {
    uni.showModal({
      title: '提示',
      content: '未安装微信，请选择其他支付方式',
      showCancel: false
    })
    // 移除微信支付选项
    return
  }
  // #endif

  const [err, result] = await createOrderAndPay({
    orderData: {...},
    paymentMethod: PaymentMethod.WECHAT
  })
}
</script>
```
