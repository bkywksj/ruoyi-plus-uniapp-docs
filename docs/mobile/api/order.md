# 商城订单与支付 API

## 介绍

RuoYi-Plus-UniApp 移动端提供了一套完整且强大的商城订单与支付 API,涵盖订单创建、支付处理、订单查询、状态管理等核心电商功能。该模块基于统一支付接口设计,支持微信支付、支付宝支付和余额支付三种支付方式,并针对 UniApp 跨平台特性进行了优化。

**核心特性:**

- **多支付方式** - 支持微信支付(JSAPI/Native/APP/H5)、支付宝支付(WAP/PAGE)、余额支付三种支付方式
- **统一支付接口** - 提供统一的支付接口,自动根据平台和支付方式选择合适的交易类型
- **订单全流程管理** - 从订单创建、支付、状态查询到取消的完整生命周期管理
- **实时状态轮询** - 支持订单支付状态实时查询,确保支付结果准确性
- **类型安全** - 完整的 TypeScript 类型定义,包含所有请求参数和响应数据
- **错误处理** - 完善的错误处理机制,包含支付失败、超时、取消等各种场景
- **平台适配** - 自动适配 H5、微信小程序、支付宝小程序、APP 等不同平台的支付流程
- **订单列表** - 支持分页查询用户订单列表,包含多种筛选条件
- **订单详情** - 支持根据订单号查询订单详细信息
- **SKU 规格支持** - 支持单规格和多规格商品订单

参考: src/api/common/mall/order/orderApi.ts:1-81

## API 列表

### 1. getSupportedPaymentMethods - 获取支持的支付方式

**接口说明:**

获取当前系统支持的支付方式列表。该接口无需认证,可在用户未登录时调用,用于在支付页面展示可用的支付方式选项。

**请求方式:** GET

**请求路径:** `/common/mall/order/supportedPaymentMethods`

**请求参数:** 无

**响应数据类型:**

```typescript
interface PaymentMethod {
  /** 支付方式代码 */
  code: 'wechat' | 'alipay' | 'balance'
  /** 支付方式名称 */
  name: string
  /** 支付方式图标 */
  icon?: string
  /** 是否可用 */
  enabled: boolean
  /** 支持的平台 */
  platforms?: string[]
  /** 描述信息 */
  description?: string
}
```

参考: src/api/common/mall/order/orderApi.ts:14-22

**完整使用示例:**

```vue
<template>
  <view class="payment-methods">
    <view class="title">选择支付方式</view>

    <view class="method-list">
      <view
        v-for="method in paymentMethods"
        :key="method.code"
        class="method-item"
        :class="{ active: selectedMethod === method.code, disabled: !method.enabled }"
        @click="selectMethod(method)"
      >
        <view class="method-icon">
          <image v-if="method.icon" :src="method.icon" mode="aspectFit" />
          <wd-icon v-else :name="getDefaultIcon(method.code)" size="48rpx" />
        </view>

        <view class="method-info">
          <view class="method-name">{{ method.name }}</view>
          <view v-if="method.description" class="method-desc">
            {{ method.description }}
          </view>
        </view>

        <view class="method-status">
          <wd-icon
            v-if="selectedMethod === method.code"
            name="check-circle"
            color="#07c160"
            size="40rpx"
          />
          <view v-else-if="!method.enabled" class="disabled-badge">不可用</view>
        </view>
      </view>
    </view>

    <view v-if="selectedMethod" class="action-bar">
      <wd-button type="primary" block @click="confirmPayment">
        确认支付
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getSupportedPaymentMethods } from '@/api/common/mall/order/orderApi'
import type { PaymentMethod } from '@/api/common/mall/order/orderTypes'
import { to } from '@/utils/to'
import { isH5, isMp, isWechat, isAlipay } from '@/utils/platform'

// 支付方式列表
const paymentMethods = ref<PaymentMethod[]>([])

// 选中的支付方式
const selectedMethod = ref<'wechat' | 'alipay' | 'balance' | ''>('')

// 获取默认图标
const getDefaultIcon = (code: string) => {
  const iconMap: Record<string, string> = {
    wechat: 'wechat-pay',
    alipay: 'alipay',
    balance: 'wallet',
  }
  return iconMap[code] || 'payment'
}

// 加载支付方式
const loadPaymentMethods = async () => {
  const [error, data] = await to(getSupportedPaymentMethods())

  if (error) {
    uni.showToast({
      title: '获取支付方式失败',
      icon: 'none',
    })
    return
  }

  // 根据当前平台过滤可用的支付方式
  paymentMethods.value = data.filter((method) => {
    // H5 平台
    if (isH5()) {
      return method.platforms?.includes('h5')
    }

    // 微信小程序
    if (isWechat()) {
      return method.platforms?.includes('mp-weixin')
    }

    // 支付宝小程序
    if (isAlipay()) {
      return method.platforms?.includes('mp-alipay')
    }

    // APP
    return method.platforms?.includes('app')
  })

  // 自动选择第一个可用的支付方式
  const firstEnabled = paymentMethods.value.find((m) => m.enabled)
  if (firstEnabled) {
    selectedMethod.value = firstEnabled.code
  }
}

// 选择支付方式
const selectMethod = (method: PaymentMethod) => {
  if (!method.enabled) {
    uni.showToast({
      title: '该支付方式暂不可用',
      icon: 'none',
    })
    return
  }

  selectedMethod.value = method.code
}

// 确认支付
const confirmPayment = () => {
  if (!selectedMethod.value) {
    uni.showToast({
      title: '请选择支付方式',
      icon: 'none',
    })
    return
  }

  // 返回选中的支付方式
  uni.$emit('paymentMethodSelected', selectedMethod.value)
}

onMounted(() => {
  loadPaymentMethods()
})
</script>

<style lang="scss" scoped>
.payment-methods {
  padding: 32rpx;

  .title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 24rpx;
  }

  .method-list {
    .method-item {
      display: flex;
      align-items: center;
      padding: 24rpx;
      background: #fff;
      border-radius: 12rpx;
      margin-bottom: 16rpx;
      border: 2rpx solid #e5e5e5;
      transition: all 0.3s;

      &.active {
        border-color: #07c160;
        background: #f0f9ff;
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .method-icon {
        width: 80rpx;
        height: 80rpx;
        margin-right: 24rpx;

        image {
          width: 100%;
          height: 100%;
        }
      }

      .method-info {
        flex: 1;

        .method-name {
          font-size: 30rpx;
          font-weight: 500;
          margin-bottom: 8rpx;
        }

        .method-desc {
          font-size: 24rpx;
          color: #999;
        }
      }

      .method-status {
        .disabled-badge {
          padding: 4rpx 12rpx;
          background: #f5f5f5;
          border-radius: 4rpx;
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }

  .action-bar {
    margin-top: 48rpx;
  }
}
</style>
```

**使用说明:**
- 该接口无需认证,可在用户未登录时调用
- 返回的支付方式列表根据系统配置动态生成
- 建议根据当前平台过滤可用的支付方式(如微信小程序只显示微信支付)
- 可以添加平台判断逻辑,自动选择最合适的默认支付方式
- 支付方式的 enabled 字段表示是否可用,不可用时应禁止选择
- 建议缓存支付方式列表,避免重复请求

参考: src/api/common/mall/order/orderApi.ts:14-22

### 2. createOrder - 创建订单

**接口说明:**

创建一个新订单。该接口需要用户登录认证,用于在用户确认购买商品后创建订单记录。创建成功后返回订单详情,包括订单号、订单金额等信息,用于后续支付流程。

**请求方式:** POST

**请求路径:** `/common/mall/order/createOrder`

**请求参数类型:**

```typescript
interface CreateOrderBo {
  /** 商品ID(SPU) */
  goodsId: string | number
  /** SKU ID(规格) - 多规格商品必填 */
  skuId?: string | number
  /** SKU名称(如:红色-S码) */
  skuName?: string
  /** 规格值JSON(如:{"颜色":"红色","尺码":"S"}) */
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
```

**响应数据类型:**

```typescript
interface CreateOrderVo {
  /** 订单ID */
  id: string | number
  /** 订单编号 */
  orderNo: string
  /** 商品ID(SPU) */
  goodsId: string | number
  /** SKU ID(规格) */
  skuId?: string | number
  /** SKU名称(如:红色-S码) */
  skuName?: string
  /** 规格值JSON */
  specValues?: string
  /** 商品名称 */
  goodsName: string
  /** 商品图片 */
  goodsImg?: string
  /** 商品价格 */
  price: string | number
  /** 购买数量 */
  quantity: number
  /** 订单总金额 */
  totalAmount: number
  /** 订单状态 */
  orderStatus: string
  /** 订单状态名称 */
  orderStatusName: string
  /** 买家备注 */
  buyerRemark?: string
  /** 创建时间 */
  createTime: string
}
```

参考: src/api/common/mall/order/orderTypes.ts:244-300

**完整使用示例:**

```vue
<template>
  <view class="order-confirm">
    <!-- 商品信息 -->
    <view class="goods-info">
      <image :src="goods.img" class="goods-image" mode="aspectFill" />
      <view class="goods-details">
        <view class="goods-name">{{ goods.name }}</view>
        <view v-if="selectedSku" class="goods-spec">
          规格: {{ selectedSku.skuName }}
        </view>
        <view class="goods-price">
          <text class="price">¥{{ currentPrice }}</text>
          <text v-if="goods.originalPrice" class="original-price">
            ¥{{ goods.originalPrice }}
          </text>
        </view>
      </view>
    </view>

    <!-- 数量选择 -->
    <view class="quantity-selector">
      <text class="label">购买数量</text>
      <wd-stepper v-model="quantity" :min="1" :max="maxStock" />
    </view>

    <!-- 买家备注 -->
    <view class="remark-section">
      <wd-input
        v-model="buyerRemark"
        placeholder="选填,可以告诉卖家您的特殊需求"
        type="textarea"
        :maxlength="200"
        show-word-limit
      />
    </view>

    <!-- 订单金额 -->
    <view class="amount-info">
      <view class="amount-row">
        <text class="label">商品金额</text>
        <text class="value">¥{{ goodsAmount }}</text>
      </view>
      <view class="amount-row total">
        <text class="label">实付金额</text>
        <text class="value">¥{{ totalAmount }}</text>
      </view>
    </view>

    <!-- 提交订单 -->
    <view class="action-bar">
      <wd-button
        type="primary"
        block
        :loading="creating"
        :disabled="!canSubmit"
        @click="handleCreateOrder"
      >
        提交订单
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { createOrder } from '@/api/common/mall/order/orderApi'
import type { CreateOrderBo, CreateOrderVo } from '@/api/common/mall/order/orderTypes'
import type { GoodsVo, GoodsSkuVo } from '@/api/common/mall/goods/goodsTypes'
import { to } from '@/utils/to'

interface Props {
  /** 商品信息 */
  goods: GoodsVo
  /** 选中的SKU */
  selectedSku?: GoodsSkuVo
}

const props = defineProps<Props>()

// 购买数量
const quantity = ref(1)

// 买家备注
const buyerRemark = ref('')

// 是否正在创建订单
const creating = ref(false)

// 当前价格
const currentPrice = computed(() => {
  if (props.selectedSku) {
    return props.selectedSku.price
  }
  return props.goods.price
})

// 最大库存
const maxStock = computed(() => {
  if (props.selectedSku) {
    return props.selectedSku.stock
  }
  return props.goods.stock
})

// 商品金额
const goodsAmount = computed(() => {
  return (Number(currentPrice.value) * quantity.value).toFixed(2)
})

// 实付金额
const totalAmount = computed(() => {
  // 这里可以加入优惠券、运费等计算
  return goodsAmount.value
})

// 是否可以提交
const canSubmit = computed(() => {
  return quantity.value > 0 && quantity.value <= maxStock.value && !creating.value
})

// 创建订单
const handleCreateOrder = async () => {
  if (!canSubmit.value) {
    return
  }

  // 库存检查
  if (quantity.value > maxStock.value) {
    uni.showToast({
      title: '库存不足',
      icon: 'none',
    })
    return
  }

  creating.value = true

  // 构建订单数据
  const orderData: CreateOrderBo = {
    goodsId: props.goods.id,
    goodsName: props.goods.name,
    goodsImg: props.goods.img,
    price: currentPrice.value,
    quantity: quantity.value,
    buyerRemark: buyerRemark.value || undefined,
  }

  // 多规格商品需要传递SKU信息
  if (props.selectedSku) {
    orderData.skuId = props.selectedSku.id
    orderData.skuName = props.selectedSku.skuName
    orderData.specValues = props.selectedSku.specValues
  }

  const [error, data] = await to(createOrder(orderData))

  creating.value = false

  if (error) {
    uni.showToast({
      title: error.message || '创建订单失败',
      icon: 'none',
    })
    return
  }

  // 订单创建成功
  uni.showToast({
    title: '订单创建成功',
    icon: 'success',
  })

  // 跳转到支付页面
  setTimeout(() => {
    uni.navigateTo({
      url: `/pages/order/payment?orderNo=${data.orderNo}`,
    })
  }, 1500)
}
</script>

<style lang="scss" scoped>
.order-confirm {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;

  .goods-info {
    display: flex;
    padding: 32rpx;
    background: #fff;
    margin-bottom: 16rpx;

    .goods-image {
      width: 160rpx;
      height: 160rpx;
      border-radius: 12rpx;
      margin-right: 24rpx;
    }

    .goods-details {
      flex: 1;

      .goods-name {
        font-size: 30rpx;
        font-weight: 500;
        margin-bottom: 12rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .goods-spec {
        font-size: 26rpx;
        color: #666;
        margin-bottom: 12rpx;
      }

      .goods-price {
        display: flex;
        align-items: baseline;

        .price {
          font-size: 36rpx;
          font-weight: 600;
          color: #ff4d4f;
          margin-right: 12rpx;
        }

        .original-price {
          font-size: 24rpx;
          color: #999;
          text-decoration: line-through;
        }
      }
    }
  }

  .quantity-selector {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    background: #fff;
    margin-bottom: 16rpx;

    .label {
      font-size: 30rpx;
    }
  }

  .remark-section {
    padding: 32rpx;
    background: #fff;
    margin-bottom: 16rpx;
  }

  .amount-info {
    padding: 32rpx;
    background: #fff;
    margin-bottom: 16rpx;

    .amount-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24rpx;

      &:last-child {
        margin-bottom: 0;
      }

      &.total {
        padding-top: 24rpx;
        border-top: 2rpx solid #e5e5e5;

        .label {
          font-size: 32rpx;
          font-weight: 600;
        }

        .value {
          font-size: 36rpx;
          font-weight: 600;
          color: #ff4d4f;
        }
      }

      .label {
        font-size: 30rpx;
        color: #666;
      }

      .value {
        font-size: 30rpx;
        font-weight: 500;
      }
    }
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16rpx 32rpx;
    background: #fff;
    border-top: 2rpx solid #e5e5e5;
    z-index: 100;
  }
}
</style>
```

**使用说明:**
- 创建订单前应先检查库存是否充足
- 多规格商品必须传递 skuId、skuName 和 specValues
- 单规格商品只需传递 goodsId 即可
- buyerRemark 为买家备注,可选填
- 订单创建成功后应立即跳转到支付页面,避免用户重复创建订单
- 创建失败时应提示用户具体的失败原因(如库存不足、商品下架等)
- 建议在创建订单前进行二次确认,避免误操作

参考: src/api/common/mall/order/orderApi.ts:24-31

### 3. createPayment - 统一支付接口

**接口说明:**

统一支付接口,支持微信支付、支付宝支付和余额支付。该接口会根据支付方式和平台自动选择合适的交易类型,并返回支付所需的参数。调用该接口后,需要根据返回的支付参数调起对应平台的支付组件。

**请求方式:** POST

**请求路径:** `/common/mall/order/createPayment`

**请求参数类型:**

```typescript
interface PaymentRequest {
  /** 订单编号 */
  orderNo: string
  /** 支付方式 */
  paymentMethod: 'wechat' | 'alipay' | 'balance'
  /** 应用ID - 微信支付必填 */
  appId?: string
  /** 交易类型 - 自动根据平台判断,也可手动指定 */
  tradeType?: TradeType
  /** 微信openId - 微信JSAPI支付必填 */
  openId?: string
  /** 支付密码 - 余额支付必填 */
  payPassword?: string
  /** 返回地址 - H5支付时使用 */
  returnUrl?: string
}

enum TradeType {
  // 微信支付类型
  JSAPI = 'JSAPI',     // 微信小程序/公众号支付
  NATIVE = 'NATIVE',   // 扫码支付
  APP = 'APP',         // APP支付
  H5 = 'H5',           // H5支付

  // 支付宝支付类型
  WAP = 'WAP',         // 手机网站支付
  PAGE = 'PAGE',       // PC网站支付
}
```

**响应数据类型:**

```typescript
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
  /** 预支付ID - 微信支付返回 */
  prepayId?: string
  /** 支付参数 - 用于调起支付组件 */
  payInfo?: Record<string, string>
  /** 二维码链接 - Native支付返回 */
  codeUrl?: string
  /** 二维码Base64 - Native支付返回 */
  qrCodeBase64?: string
  /** 支付链接 - H5支付返回 */
  payUrl?: string
  /** 支付表单 - 支付宝支付返回 */
  payForm?: string
  /** 支付状态 */
  tradeState?: string
  /** 支付时间 */
  payTime?: string
  /** 过期时间 */
  expireTime?: string
}
```

参考: src/api/common/mall/order/orderTypes.ts:316-370

**完整使用示例:**

```vue
<template>
  <view class="payment-page">
    <!-- 订单信息 -->
    <view class="order-info">
      <view class="order-no">订单号: {{ orderNo }}</view>
      <view class="order-amount">
        <text class="label">支付金额</text>
        <text class="amount">¥{{ orderAmount }}</text>
      </view>
    </view>

    <!-- 支付方式选择 -->
    <view class="payment-methods">
      <view class="title">选择支付方式</view>
      <view
        v-for="method in availableMethods"
        :key="method.code"
        class="method-item"
        :class="{ active: selectedMethod === method.code }"
        @click="selectedMethod = method.code"
      >
        <wd-icon :name="method.icon" size="48rpx" />
        <text class="method-name">{{ method.name }}</text>
        <wd-icon
          v-if="selectedMethod === method.code"
          name="check-circle"
          color="#07c160"
          size="40rpx"
        />
      </view>
    </view>

    <!-- 余额支付密码输入 -->
    <view v-if="selectedMethod === 'balance'" class="password-section">
      <wd-input
        v-model="payPassword"
        type="password"
        placeholder="请输入支付密码"
        :maxlength="6"
      />
    </view>

    <!-- 支付按钮 -->
    <view class="action-bar">
      <wd-button
        type="primary"
        block
        :loading="paying"
        :disabled="!canPay"
        @click="handlePay"
      >
        {{ paying ? '支付中...' : `确认支付 ¥${orderAmount}` }}
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { createPayment, queryOrderStatus } from '@/api/common/mall/order/orderApi'
import type { PaymentRequest, PaymentResponse, OrderStatusVo } from '@/api/common/mall/order/orderTypes'
import { to } from '@/utils/to'
import { isH5, isWechat, isAlipay, isApp } from '@/utils/platform'

interface Props {
  /** 订单号 */
  orderNo: string
  /** 订单金额 */
  orderAmount: string | number
}

const props = defineProps<Props>()

// 可用的支付方式
const availableMethods = ref<Array<{ code: string; name: string; icon: string }>>([])

// 选中的支付方式
const selectedMethod = ref<'wechat' | 'alipay' | 'balance'>('wechat')

// 支付密码(余额支付使用)
const payPassword = ref('')

// 是否正在支付
const paying = ref(false)

// 轮询定时器
let pollTimer: number | null = null

// 是否可以支付
const canPay = computed(() => {
  if (paying.value) {
    return false
  }

  if (selectedMethod.value === 'balance' && !payPassword.value) {
    return false
  }

  return true
})

// 初始化可用支付方式
const initPaymentMethods = () => {
  const methods: Array<{ code: string; name: string; icon: string }> = []

  // 微信平台
  if (isWechat()) {
    methods.push({
      code: 'wechat',
      name: '微信支付',
      icon: 'wechat-pay',
    })
  }

  // 支付宝平台
  if (isAlipay()) {
    methods.push({
      code: 'alipay',
      name: '支付宝',
      icon: 'alipay',
    })
  }

  // H5 和 APP 支持多种支付方式
  if (isH5() || isApp()) {
    methods.push(
      {
        code: 'wechat',
        name: '微信支付',
        icon: 'wechat-pay',
      },
      {
        code: 'alipay',
        name: '支付宝',
        icon: 'alipay',
      },
    )
  }

  // 余额支付(所有平台都支持)
  methods.push({
    code: 'balance',
    name: '余额支付',
    icon: 'wallet',
  })

  availableMethods.value = methods

  // 默认选择第一个
  if (methods.length > 0) {
    selectedMethod.value = methods[0].code as 'wechat' | 'alipay' | 'balance'
  }
}

// 获取交易类型
const getTradeType = () => {
  if (selectedMethod.value === 'wechat') {
    if (isWechat()) {
      return 'JSAPI'
    }
    if (isApp()) {
      return 'APP'
    }
    if (isH5()) {
      return 'H5'
    }
  }

  if (selectedMethod.value === 'alipay') {
    if (isH5()) {
      return 'WAP'
    }
    return 'PAGE'
  }

  return undefined
}

// 发起支付
const handlePay = async () => {
  if (!canPay.value) {
    return
  }

  paying.value = true

  // 构建支付请求参数
  const paymentData: PaymentRequest = {
    orderNo: props.orderNo,
    paymentMethod: selectedMethod.value,
    tradeType: getTradeType(),
  }

  // 微信支付需要 openId
  if (selectedMethod.value === 'wechat' && isWechat()) {
    // #ifdef MP-WEIXIN
    const loginRes = await uni.login()
    if (loginRes[1]?.code) {
      // 这里需要调用后端接口用 code 换取 openId
      // paymentData.openId = await getOpenIdByCode(loginRes[1].code)
    }
    // #endif
  }

  // 余额支付需要支付密码
  if (selectedMethod.value === 'balance') {
    paymentData.payPassword = payPassword.value
  }

  // H5 支付需要返回地址
  if (isH5()) {
    paymentData.returnUrl = window.location.href
  }

  const [error, data] = await to(createPayment(paymentData))

  if (error) {
    paying.value = false
    uni.showToast({
      title: error.message || '支付失败',
      icon: 'none',
    })
    return
  }

  // 根据支付方式调起支付
  if (selectedMethod.value === 'wechat') {
    await handleWechatPay(data)
  } else if (selectedMethod.value === 'alipay') {
    await handleAlipay(data)
  } else if (selectedMethod.value === 'balance') {
    await handleBalancePay(data)
  }
}

// 微信支付
const handleWechatPay = async (paymentRes: PaymentResponse) => {
  if (!paymentRes.success) {
    paying.value = false
    uni.showToast({
      title: paymentRes.message || '支付失败',
      icon: 'none',
    })
    return
  }

  // #ifdef MP-WEIXIN
  // 微信小程序支付
  const [payError] = await to(
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: paymentRes.payInfo?.timeStamp || '',
      nonceStr: paymentRes.payInfo?.nonceStr || '',
      package: paymentRes.payInfo?.package || '',
      signType: paymentRes.payInfo?.signType || 'MD5',
      paySign: paymentRes.payInfo?.paySign || '',
    }),
  )

  paying.value = false

  if (payError) {
    uni.showToast({
      title: '支付已取消',
      icon: 'none',
    })
    return
  }

  // 支付成功,开始轮询订单状态
  startPollingOrderStatus()
  // #endif

  // #ifdef H5
  // H5 跳转到微信支付页面
  if (paymentRes.payUrl) {
    window.location.href = paymentRes.payUrl
  }
  // #endif

  // #ifdef APP-PLUS
  // APP 调起微信支付
  const [payError] = await to(
    uni.requestPayment({
      provider: 'wxpay',
      orderInfo: paymentRes.payInfo,
    }),
  )

  paying.value = false

  if (payError) {
    uni.showToast({
      title: '支付已取消',
      icon: 'none',
    })
    return
  }

  startPollingOrderStatus()
  // #endif
}

// 支付宝支付
const handleAlipay = async (paymentRes: PaymentResponse) => {
  if (!paymentRes.success) {
    paying.value = false
    uni.showToast({
      title: paymentRes.message || '支付失败',
      icon: 'none',
    })
    return
  }

  // #ifdef MP-ALIPAY
  // 支付宝小程序支付
  const [payError] = await to(
    uni.requestPayment({
      provider: 'alipay',
      orderInfo: paymentRes.payInfo?.orderString || '',
    }),
  )

  paying.value = false

  if (payError) {
    uni.showToast({
      title: '支付已取消',
      icon: 'none',
    })
    return
  }

  startPollingOrderStatus()
  // #endif

  // #ifdef H5
  // H5 支付宝支付
  if (paymentRes.payForm) {
    // 将支付表单插入页面并提交
    const div = document.createElement('div')
    div.innerHTML = paymentRes.payForm
    document.body.appendChild(div)
    const form = div.querySelector('form')
    if (form) {
      form.submit()
    }
  }
  // #endif
}

// 余额支付
const handleBalancePay = async (paymentRes: PaymentResponse) => {
  paying.value = false

  if (!paymentRes.success) {
    uni.showToast({
      title: paymentRes.message || '支付失败',
      icon: 'none',
    })
    return
  }

  // 余额支付直接成功
  uni.showToast({
    title: '支付成功',
    icon: 'success',
  })

  setTimeout(() => {
    uni.navigateTo({
      url: `/pages/order/detail?orderNo=${props.orderNo}`,
    })
  }, 1500)
}

// 开始轮询订单状态
const startPollingOrderStatus = () => {
  let pollCount = 0
  const maxPollCount = 30 // 最多轮询30次(30秒)

  pollTimer = setInterval(async () => {
    pollCount++

    const [error, status] = await to(queryOrderStatus(props.orderNo))

    if (error || pollCount >= maxPollCount) {
      clearInterval(pollTimer!)
      paying.value = false

      if (error) {
        uni.showToast({
          title: '查询支付状态失败',
          icon: 'none',
        })
      } else {
        uni.showToast({
          title: '支付结果查询超时,请稍后在订单列表查看',
          icon: 'none',
        })
      }
      return
    }

    if (status.isPaid) {
      clearInterval(pollTimer!)
      paying.value = false

      uni.showToast({
        title: '支付成功',
        icon: 'success',
      })

      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/order/detail?orderNo=${props.orderNo}`,
        })
      }, 1500)
    }
  }, 1000) as unknown as number
}

onMounted(() => {
  initPaymentMethods()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
})
</script>

<style lang="scss" scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;

  .order-info {
    padding: 32rpx;
    background: #fff;
    margin-bottom: 16rpx;

    .order-no {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 24rpx;
    }

    .order-amount {
      display: flex;
      align-items: baseline;
      justify-content: center;

      .label {
        font-size: 28rpx;
        color: #666;
        margin-right: 16rpx;
      }

      .amount {
        font-size: 48rpx;
        font-weight: 600;
        color: #ff4d4f;
      }
    }
  }

  .payment-methods {
    padding: 32rpx;
    background: #fff;
    margin-bottom: 16rpx;

    .title {
      font-size: 30rpx;
      font-weight: 500;
      margin-bottom: 24rpx;
    }

    .method-item {
      display: flex;
      align-items: center;
      padding: 24rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      margin-bottom: 16rpx;
      border: 2rpx solid transparent;
      transition: all 0.3s;

      &:last-child {
        margin-bottom: 0;
      }

      &.active {
        border-color: #07c160;
        background: #f0f9ff;
      }

      .method-name {
        flex: 1;
        margin-left: 16rpx;
        font-size: 30rpx;
      }
    }
  }

  .password-section {
    padding: 32rpx;
    background: #fff;
    margin-bottom: 16rpx;
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16rpx 32rpx;
    background: #fff;
    border-top: 2rpx solid #e5e5e5;
    z-index: 100;
  }
}
</style>
```

**使用说明:**
- 支付前应先创建订单,获得订单号
- 微信小程序支付需要获取用户的 openId
- 余额支付需要用户输入支付密码
- H5 支付会跳转到第三方支付页面,支付完成后通过回调返回
- 小程序支付使用 uni.requestPayment 调起支付组件
- 支付成功后应通过轮询方式查询订单状态,确保支付结果准确
- 建议设置支付超时时间,避免无限轮询
- 支付失败或取消后应给予用户明确提示

参考: src/api/common/mall/order/orderApi.ts:33-40

### 4. queryOrderStatus - 查询订单状态

**接口说明:**

查询订单的支付状态。该接口通常用于支付完成后轮询订单状态,确认支付是否成功。返回的数据包含订单状态、是否已支付、支付时间等信息。

**请求方式:** GET

**请求路径:** `/common/mall/order/queryOrderStatus`

**请求参数:**
- `orderNo` (string, 必填) - 订单编号

**响应数据类型:**

```typescript
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

参考: src/api/common/mall/order/orderTypes.ts:302-314

**完整使用示例:**

```vue
<template>
  <view class="order-status">
    <view class="status-icon">
      <wd-icon
        v-if="orderStatus?.isPaid"
        name="check-circle"
        color="#07c160"
        size="120rpx"
      />
      <wd-icon
        v-else
        name="time-circle"
        color="#faad14"
        size="120rpx"
      />
    </view>

    <view class="status-text">
      <text class="status-name">
        {{ orderStatus?.orderStatusName || '查询中...' }}
      </text>
      <text v-if="orderStatus?.paymentTime" class="payment-time">
        支付时间: {{ orderStatus.paymentTime }}
      </text>
    </view>

    <view class="order-info">
      <text class="order-no">订单号: {{ orderNo }}</text>
    </view>

    <view class="actions">
      <wd-button v-if="orderStatus?.isPaid" type="primary" @click="goToOrderDetail">
        查看订单详情
      </wd-button>
      <wd-button v-else type="default" @click="goBack">
        返回
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { queryOrderStatus } from '@/api/common/mall/order/orderApi'
import type { OrderStatusVo } from '@/api/common/mall/order/orderTypes'
import { to } from '@/utils/to'

interface Props {
  /** 订单号 */
  orderNo: string
  /** 是否自动轮询 */
  autoPolling?: boolean
  /** 轮询间隔(毫秒) */
  pollingInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoPolling: true,
  pollingInterval: 2000,
})

// 订单状态
const orderStatus = ref<OrderStatusVo | null>(null)

// 轮询定时器
let pollTimer: number | null = null

// 轮询次数
let pollCount = 0

// 最大轮询次数
const maxPollCount = 30

// 查询订单状态
const loadOrderStatus = async () => {
  const [error, data] = await to(queryOrderStatus(props.orderNo))

  if (error) {
    uni.showToast({
      title: '查询失败',
      icon: 'none',
    })
    return
  }

  orderStatus.value = data

  // 如果已支付,停止轮询
  if (data.isPaid && pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null

    uni.showToast({
      title: '支付成功',
      icon: 'success',
    })
  }

  // 超过最大轮询次数,停止轮询
  if (pollCount >= maxPollCount && pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null

    uni.showModal({
      title: '提示',
      content: '查询支付状态超时,请稍后在订单列表查看',
      showCancel: false,
    })
  }
}

// 开始轮询
const startPolling = () => {
  if (!props.autoPolling) {
    return
  }

  pollTimer = setInterval(() => {
    pollCount++
    loadOrderStatus()
  }, props.pollingInterval) as unknown as number
}

// 停止轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 查看订单详情
const goToOrderDetail = () => {
  uni.redirectTo({
    url: `/pages/order/detail?orderNo=${props.orderNo}`,
  })
}

onMounted(() => {
  loadOrderStatus()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style lang="scss" scoped>
.order-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 64rpx 32rpx;
  background: #fff;

  .status-icon {
    margin-bottom: 32rpx;
  }

  .status-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 48rpx;

    .status-name {
      font-size: 36rpx;
      font-weight: 600;
      margin-bottom: 16rpx;
    }

    .payment-time {
      font-size: 28rpx;
      color: #666;
    }
  }

  .order-info {
    margin-bottom: 64rpx;

    .order-no {
      font-size: 28rpx;
      color: #999;
    }
  }

  .actions {
    width: 100%;
  }
}
</style>
```

**使用说明:**
- 支付完成后应立即调用该接口查询支付状态
- 建议使用轮询方式查询,间隔 1-2 秒
- 设置最大轮询次数(如30次),避免无限轮询
- 查询到已支付状态后应立即停止轮询
- 查询超时后应提示用户稍后在订单列表查看
- 该接口也可用于订单详情页面的状态刷新

参考: src/api/common/mall/order/orderApi.ts:42-51

### 5. getOrderByOrderNo - 根据订单号获取订单信息

**接口说明:**

根据订单号获取订单的完整信息。该接口用于订单详情页面,返回订单的所有字段信息,包括商品信息、收货信息、物流信息等。

**请求方式:** GET

**请求路径:** `/common/mall/order/getOrderByOrderNo`

**请求参数:**
- `orderNo` (string, 必填) - 订单编号

**响应数据类型:**

```typescript
interface OrderVo {
  /** 订单ID */
  id: string | number
  /** 订单编号 */
  orderNo: string
  /** 用户ID */
  userId: string | number
  /** 商品ID(SPU) */
  goodsId: string | number
  /** SKU ID(规格) */
  skuId: string | number
  /** SKU名称(如:红色-S码) */
  skuName: string
  /** 规格值JSON */
  specValues: string
  /** 商品名称 */
  goodsName: string
  /** 商品图片 */
  goodsImg: string
  /** 商品价格 */
  price: string
  /** 购买数量 */
  quantity: number
  /** 订单总金额 */
  totalAmount: string
  /** 实付金额 */
  actualAmount: string
  /** 订单状态 */
  orderStatus: string
  /** 支付方式 */
  paymentMethod: string
  /** 支付时间 */
  paymentTime: string
  /** 交易流水号 */
  transactionId: string | number
  /** 买家备注 */
  buyerRemark: string
  /** 订单扩展信息 */
  orderExtInfo: string
  /** 收货信息 */
  receiverInfo: string
  /** 物流信息 */
  shippingInfo: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 备注 */
  remark: string
}
```

参考: src/api/common/mall/order/orderTypes.ts:169-242

**完整使用示例:**

```vue
<template>
  <view class="order-detail">
    <!-- 订单状态 -->
    <view class="status-section">
      <view class="status-icon">
        <wd-icon :name="statusIcon" :color="statusColor" size="80rpx" />
      </view>
      <view class="status-text">{{ statusText }}</view>
      <view v-if="order && order.paymentTime" class="status-time">
        {{ order.paymentTime }}
      </view>
    </view>

    <!-- 商品信息 -->
    <view v-if="order" class="goods-section">
      <view class="section-title">商品信息</view>
      <view class="goods-item">
        <image :src="order.goodsImg" class="goods-image" mode="aspectFill" />
        <view class="goods-info">
          <view class="goods-name">{{ order.goodsName }}</view>
          <view v-if="order.skuName" class="goods-spec">
            规格: {{ order.skuName }}
          </view>
          <view class="goods-price">
            <text class="price">¥{{ order.price }}</text>
            <text class="quantity">x{{ order.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view v-if="order" class="order-section">
      <view class="section-title">订单信息</view>
      <view class="info-row">
        <text class="label">订单编号</text>
        <text class="value">{{ order.orderNo }}</text>
      </view>
      <view class="info-row">
        <text class="label">创建时间</text>
        <text class="value">{{ order.createTime }}</text>
      </view>
      <view class="info-row">
        <text class="label">支付方式</text>
        <text class="value">{{ paymentMethodText }}</text>
      </view>
      <view v-if="order.transactionId" class="info-row">
        <text class="label">交易流水号</text>
        <text class="value">{{ order.transactionId }}</text>
      </view>
      <view v-if="order.buyerRemark" class="info-row">
        <text class="label">买家备注</text>
        <text class="value">{{ order.buyerRemark }}</text>
      </view>
    </view>

    <!-- 金额信息 -->
    <view v-if="order" class="amount-section">
      <view class="section-title">金额信息</view>
      <view class="amount-row">
        <text class="label">商品金额</text>
        <text class="value">¥{{ order.totalAmount }}</text>
      </view>
      <view class="amount-row total">
        <text class="label">实付金额</text>
        <text class="value">¥{{ order.actualAmount }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view v-if="order" class="action-bar">
      <wd-button
        v-if="order.orderStatus === 'pending'"
        type="default"
        @click="handleCancelOrder"
      >
        取消订单
      </wd-button>
      <wd-button
        v-if="order.orderStatus === 'pending'"
        type="primary"
        @click="handlePayAgain"
      >
        继续支付
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { getOrderByOrderNo, cancelOrder } from '@/api/common/mall/order/orderApi'
import type { OrderVo } from '@/api/common/mall/order/orderTypes'
import { to } from '@/utils/to'

interface Props {
  /** 订单号 */
  orderNo: string
}

const props = defineProps<Props>()

// 订单信息
const order = ref<OrderVo | null>(null)

// 订单状态图标
const statusIcon = computed(() => {
  if (!order.value) {
    return 'time-circle'
  }

  const iconMap: Record<string, string> = {
    pending: 'time-circle',
    paid: 'check-circle',
    delivered: 'logistics',
    completed: 'success',
    cancelled: 'close-circle',
    refunded: 'refund',
  }

  return iconMap[order.value.orderStatus] || 'time-circle'
})

// 订单状态颜色
const statusColor = computed(() => {
  if (!order.value) {
    return '#faad14'
  }

  const colorMap: Record<string, string> = {
    pending: '#faad14',
    paid: '#1890ff',
    delivered: '#52c41a',
    completed: '#07c160',
    cancelled: '#999',
    refunded: '#ff4d4f',
  }

  return colorMap[order.value.orderStatus] || '#faad14'
})

// 订单状态文本
const statusText = computed(() => {
  if (!order.value) {
    return '加载中...'
  }

  const textMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    delivered: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
  }

  return textMap[order.value.orderStatus] || '未知状态'
})

// 支付方式文本
const paymentMethodText = computed(() => {
  if (!order.value || !order.value.paymentMethod) {
    return '-'
  }

  const textMap: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    balance: '余额支付',
  }

  return textMap[order.value.paymentMethod] || order.value.paymentMethod
})

// 加载订单详情
const loadOrderDetail = async () => {
  const [error, data] = await to(getOrderByOrderNo(props.orderNo))

  if (error) {
    uni.showToast({
      title: '获取订单详情失败',
      icon: 'none',
    })
    return
  }

  order.value = data
}

// 取消订单
const handleCancelOrder = async () => {
  const [confirmError] = await to(
    uni.showModal({
      title: '提示',
      content: '确定要取消该订单吗?',
    }),
  )

  if (confirmError) {
    return
  }

  const [error] = await to(cancelOrder(props.orderNo))

  if (error) {
    uni.showToast({
      title: '取消订单失败',
      icon: 'none',
    })
    return
  }

  uni.showToast({
    title: '订单已取消',
    icon: 'success',
  })

  // 重新加载订单详情
  setTimeout(() => {
    loadOrderDetail()
  }, 1500)
}

// 继续支付
const handlePayAgain = () => {
  uni.navigateTo({
    url: `/pages/order/payment?orderNo=${props.orderNo}&orderAmount=${order.value?.actualAmount}`,
  })
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style lang="scss" scoped>
.order-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;

  .status-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48rpx 32rpx;
    background: #fff;
    margin-bottom: 16rpx;

    .status-icon {
      margin-bottom: 16rpx;
    }

    .status-text {
      font-size: 32rpx;
      font-weight: 600;
      margin-bottom: 8rpx;
    }

    .status-time {
      font-size: 26rpx;
      color: #999;
    }
  }

  .goods-section,
  .order-section,
  .amount-section {
    padding: 32rpx;
    background: #fff;
    margin-bottom: 16rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: 600;
      margin-bottom: 24rpx;
      padding-bottom: 16rpx;
      border-bottom: 2rpx solid #e5e5e5;
    }
  }

  .goods-section {
    .goods-item {
      display: flex;

      .goods-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 12rpx;
        margin-right: 24rpx;
      }

      .goods-info {
        flex: 1;

        .goods-name {
          font-size: 30rpx;
          font-weight: 500;
          margin-bottom: 12rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .goods-spec {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 12rpx;
        }

        .goods-price {
          display: flex;
          align-items: baseline;
          justify-content: space-between;

          .price {
            font-size: 32rpx;
            font-weight: 600;
            color: #ff4d4f;
          }

          .quantity {
            font-size: 28rpx;
            color: #666;
          }
        }
      }
    }
  }

  .order-section,
  .amount-section {
    .info-row,
    .amount-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-size: 28rpx;
        color: #666;
      }

      .value {
        font-size: 28rpx;
        color: #333;
        text-align: right;
        max-width: 400rpx;
        word-break: break-all;
      }
    }

    .amount-row.total {
      padding-top: 20rpx;
      border-top: 2rpx solid #e5e5e5;

      .label {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
      }

      .value {
        font-size: 36rpx;
        font-weight: 600;
        color: #ff4d4f;
      }
    }
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: 16rpx;
    padding: 16rpx 32rpx;
    background: #fff;
    border-top: 2rpx solid #e5e5e5;
    z-index: 100;
  }
}
</style>
```

**使用说明:**
- 该接口返回订单的完整信息,包含所有字段
- 订单状态包括: pending(待支付)、paid(已支付)、delivered(已发货)、completed(已完成)、cancelled(已取消)、refunded(已退款)
- receiverInfo 和 shippingInfo 字段为 JSON 字符串,需要解析后使用
- 订单详情页面应支持下拉刷新,实时更新订单状态
- 根据订单状态显示不同的操作按钮(取消订单、继续支付、确认收货等)
- 建议添加订单号复制功能,方便用户联系客服

参考: src/api/common/mall/order/orderApi.ts:53-62

### 6. getUserOrderList - 查询订单列表

**接口说明:**

分页查询当前用户的订单列表。该接口用于订单列表页面,支持多种筛选条件,如订单状态、商品名称等。返回的是分页数据,包含订单总数和当前页的订单列表。

**请求方式:** GET

**请求路径:** `/common/mall/order/pageOrders`

**请求参数类型:**

```typescript
interface OrderQuery extends PageQuery {
  /** 订单ID */
  id?: string | number
  /** 订单编号 */
  orderNo?: string
  /** 用户ID */
  userId?: string | number
  /** 商品ID(SPU) */
  goodsId?: string | number
  /** SKU ID(规格) */
  skuId?: string | number
  /** SKU名称(如:红色-S码) */
  skuName?: string
  /** 规格值JSON */
  specValues?: string
  /** 商品名称 */
  goodsName?: string
  /** 商品图片 */
  goodsImg?: string
  /** 商品价格 */
  price?: string
  /** 购买数量 */
  quantity?: number
  /** 订单总金额 */
  totalAmount?: string
  /** 实付金额 */
  actualAmount?: string
  /** 订单状态 */
  orderStatus?: string
  /** 支付方式 */
  paymentMethod?: string
  /** 支付时间 */
  paymentTime?: string
  /** 交易流水号 */
  transactionId?: string | number
  /** 买家备注 */
  buyerRemark?: string
  /** 订单扩展信息 */
  orderExtInfo?: string
  /** 收货信息 */
  receiverInfo?: string
  /** 物流信息 */
  shippingInfo?: string
  /** 创建时间 */
  createTime?: string
}
```

**响应数据类型:**

```typescript
PageResult<OrderVo>
```

参考: src/api/common/mall/order/orderTypes.ts:32-98

**完整使用示例:**

```vue
<template>
  <view class="order-list">
    <!-- 状态筛选 -->
    <view class="status-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentStatus === tab.value }"
        @click="handleStatusChange(tab.value)"
      >
        {{ tab.label }}
        <view v-if="tab.badge > 0" class="badge">{{ tab.badge }}</view>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view
      class="order-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view v-if="orders.length > 0" class="orders">
        <view
          v-for="order in orders"
          :key="order.id"
          class="order-item"
          @click="goToOrderDetail(order.orderNo)"
        >
          <!-- 订单头部 -->
          <view class="order-header">
            <view class="order-no">订单号: {{ order.orderNo }}</view>
            <view class="order-status" :style="{ color: getStatusColor(order.orderStatus) }">
              {{ getStatusText(order.orderStatus) }}
            </view>
          </view>

          <!-- 商品信息 -->
          <view class="order-goods">
            <image :src="order.goodsImg" class="goods-image" mode="aspectFill" />
            <view class="goods-info">
              <view class="goods-name">{{ order.goodsName }}</view>
              <view v-if="order.skuName" class="goods-spec">
                规格: {{ order.skuName }}
              </view>
              <view class="goods-price">
                <text class="price">¥{{ order.price }}</text>
                <text class="quantity">x{{ order.quantity }}</text>
              </view>
            </view>
          </view>

          <!-- 订单金额 -->
          <view class="order-amount">
            <text class="label">实付金额:</text>
            <text class="amount">¥{{ order.actualAmount }}</text>
          </view>

          <!-- 操作按钮 -->
          <view class="order-actions">
            <wd-button
              v-if="order.orderStatus === 'pending'"
              size="small"
              type="default"
              @click.stop="handleCancelOrder(order.orderNo)"
            >
              取消订单
            </wd-button>
            <wd-button
              v-if="order.orderStatus === 'pending'"
              size="small"
              type="primary"
              @click.stop="handlePayAgain(order.orderNo, order.actualAmount)"
            >
              继续支付
            </wd-button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty">
        <wd-icon name="list" size="120rpx" color="#ccc" />
        <text class="empty-text">暂无订单</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore" class="load-more">
        <text>{{ loading ? '加载中...' : '上拉加载更多' }}</text>
      </view>
      <view v-else-if="orders.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { getUserOrderList, cancelOrder } from '@/api/common/mall/order/orderApi'
import type { OrderQuery, OrderVo } from '@/api/common/mall/order/orderTypes'
import { to } from '@/utils/to'

// 状态标签
const statusTabs = ref([
  { label: '全部', value: '', badge: 0 },
  { label: '待支付', value: 'pending', badge: 0 },
  { label: '已支付', value: 'paid', badge: 0 },
  { label: '已发货', value: 'delivered', badge: 0 },
  { label: '已完成', value: 'completed', badge: 0 },
])

// 当前状态
const currentStatus = ref('')

// 订单列表
const orders = ref<OrderVo[]>([])

// 查询参数
const queryParams = reactive<OrderQuery>({
  pageNum: 1,
  pageSize: 10,
  orderStatus: undefined,
})

// 是否正在加载
const loading = ref(false)

// 是否正在刷新
const refreshing = ref(false)

// 是否还有更多
const hasMore = ref(true)

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    delivered: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
  }
  return textMap[status] || '未知'
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: '#faad14',
    paid: '#1890ff',
    delivered: '#52c41a',
    completed: '#07c160',
    cancelled: '#999',
    refunded: '#ff4d4f',
  }
  return colorMap[status] || '#333'
}

// 加载订单列表
const loadOrders = async (append = false) => {
  if (loading.value) {
    return
  }

  loading.value = true

  const [error, data] = await to(getUserOrderList(queryParams))

  loading.value = false
  refreshing.value = false

  if (error) {
    uni.showToast({
      title: '获取订单列表失败',
      icon: 'none',
    })
    return
  }

  if (append) {
    orders.value = [...orders.value, ...data.rows]
  } else {
    orders.value = data.rows
  }

  // 判断是否还有更多
  hasMore.value = orders.value.length < data.total
}

// 状态切换
const handleStatusChange = (status: string) => {
  currentStatus.value = status
  queryParams.orderStatus = status || undefined
  queryParams.pageNum = 1
  orders.value = []
  loadOrders()
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  queryParams.pageNum = 1
  orders.value = []
  loadOrders()
}

// 加载更多
const onLoadMore = () => {
  if (!hasMore.value || loading.value) {
    return
  }

  queryParams.pageNum!++
  loadOrders(true)
}

// 取消订单
const handleCancelOrder = async (orderNo: string) => {
  const [confirmError] = await to(
    uni.showModal({
      title: '提示',
      content: '确定要取消该订单吗?',
    }),
  )

  if (confirmError) {
    return
  }

  const [error] = await to(cancelOrder(orderNo))

  if (error) {
    uni.showToast({
      title: '取消订单失败',
      icon: 'none',
    })
    return
  }

  uni.showToast({
    title: '订单已取消',
    icon: 'success',
  })

  // 刷新列表
  setTimeout(() => {
    onRefresh()
  }, 1500)
}

// 继续支付
const handlePayAgain = (orderNo: string, amount: string) => {
  uni.navigateTo({
    url: `/pages/order/payment?orderNo=${orderNo}&orderAmount=${amount}`,
  })
}

// 查看订单详情
const goToOrderDetail = (orderNo: string) => {
  uni.navigateTo({
    url: `/pages/order/detail?orderNo=${orderNo}`,
  })
}

onMounted(() => {
  loadOrders()
})
</script>

<style lang="scss" scoped>
.order-list {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;

  .status-tabs {
    display: flex;
    background: #fff;
    border-bottom: 2rpx solid #e5e5e5;

    .tab-item {
      position: relative;
      flex: 1;
      padding: 24rpx 0;
      text-align: center;
      font-size: 28rpx;
      color: #666;
      transition: all 0.3s;

      &.active {
        color: #07c160;
        font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background: #07c160;
          border-radius: 2rpx;
        }
      }

      .badge {
        position: absolute;
        top: 16rpx;
        right: 20rpx;
        min-width: 32rpx;
        height: 32rpx;
        line-height: 32rpx;
        padding: 0 8rpx;
        background: #ff4d4f;
        color: #fff;
        font-size: 20rpx;
        border-radius: 16rpx;
        text-align: center;
      }
    }
  }

  .order-scroll {
    flex: 1;
    overflow-y: auto;
  }

  .orders {
    padding: 16rpx;

    .order-item {
      background: #fff;
      border-radius: 12rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16rpx;
        border-bottom: 2rpx solid #e5e5e5;
        margin-bottom: 16rpx;

        .order-no {
          font-size: 26rpx;
          color: #666;
        }

        .order-status {
          font-size: 28rpx;
          font-weight: 500;
        }
      }

      .order-goods {
        display: flex;
        margin-bottom: 16rpx;

        .goods-image {
          width: 120rpx;
          height: 120rpx;
          border-radius: 8rpx;
          margin-right: 16rpx;
        }

        .goods-info {
          flex: 1;

          .goods-name {
            font-size: 28rpx;
            margin-bottom: 8rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .goods-spec {
            font-size: 24rpx;
            color: #666;
            margin-bottom: 8rpx;
          }

          .goods-price {
            display: flex;
            align-items: baseline;
            justify-content: space-between;

            .price {
              font-size: 28rpx;
              font-weight: 600;
              color: #ff4d4f;
            }

            .quantity {
              font-size: 24rpx;
              color: #666;
            }
          }
        }
      }

      .order-amount {
        display: flex;
        justify-content: flex-end;
        align-items: baseline;
        padding: 16rpx 0;
        border-top: 2rpx solid #e5e5e5;
        margin-bottom: 16rpx;

        .label {
          font-size: 26rpx;
          color: #666;
          margin-right: 8rpx;
        }

        .amount {
          font-size: 32rpx;
          font-weight: 600;
          color: #ff4d4f;
        }
      }

      .order-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16rpx;
      }
    }
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;

    .empty-text {
      margin-top: 24rpx;
      font-size: 28rpx;
      color: #999;
    }
  }

  .load-more,
  .no-more {
    padding: 32rpx 0;
    text-align: center;
    font-size: 26rpx;
    color: #999;
  }
}
</style>
```

**使用说明:**
- 支持按订单状态筛选订单列表
- 支持下拉刷新和上拉加载更多
- 建议每页加载 10-20 条订单
- 可以根据商品名称、订单号等条件进行搜索
- 订单列表应显示订单的关键信息(商品、金额、状态等)
- 根据订单状态显示不同的操作按钮
- 点击订单项跳转到订单详情页面

参考: src/api/common/mall/order/orderApi.ts:64-71

### 7. cancelOrder - 取消订单

**接口说明:**

取消指定订单。该接口只能取消待支付状态的订单,已支付的订单需要通过退款流程处理。取消成功后,订单状态会变更为已取消,相关库存会释放。

**请求方式:** POST

**请求路径:** `/common/mall/order/cancelOrder`

**请求参数:**
- `orderNo` (string, 必填) - 订单编号

**响应数据:** void

参考: src/api/common/mall/order/orderApi.ts:73-80

**完整使用示例:**

```vue
<template>
  <view class="cancel-order">
    <view class="order-info">
      <text class="title">确定取消订单吗?</text>
      <view class="order-no">订单号: {{ orderNo }}</view>
    </view>

    <view class="cancel-reasons">
      <view class="reason-title">请选择取消原因</view>
      <view
        v-for="(reason, index) in cancelReasons"
        :key="index"
        class="reason-item"
        :class="{ active: selectedReason === index }"
        @click="selectedReason = index"
      >
        <text>{{ reason }}</text>
        <wd-icon
          v-if="selectedReason === index"
          name="check"
          color="#07c160"
          size="36rpx"
        />
      </view>
    </view>

    <view class="tips">
      <view class="tip-item">
        <wd-icon name="info" color="#faad14" size="32rpx" />
        <text>取消后订单将无法恢复</text>
      </view>
      <view class="tip-item">
        <wd-icon name="info" color="#faad14" size="32rpx" />
        <text>如已支付,款项将原路退回</text>
      </view>
    </view>

    <view class="actions">
      <wd-button type="default" @click="handleBack">
        返回
      </wd-button>
      <wd-button
        type="primary"
        :loading="cancelling"
        :disabled="selectedReason === -1"
        @click="handleConfirm"
      >
        确认取消
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { cancelOrder } from '@/api/common/mall/order/orderApi'
import { to } from '@/utils/to'

interface Props {
  /** 订单号 */
  orderNo: string
}

const props = defineProps<Props>()

// 取消原因列表
const cancelReasons = [
  '不想买了',
  '信息填写错误,重新拍',
  '商品价格较贵',
  '重复下单',
  '其他原因',
]

// 选中的取消原因
const selectedReason = ref(-1)

// 是否正在取消
const cancelling = ref(false)

// 返回
const handleBack = () => {
  uni.navigateBack()
}

// 确认取消
const handleConfirm = async () => {
  if (selectedReason.value === -1) {
    uni.showToast({
      title: '请选择取消原因',
      icon: 'none',
    })
    return
  }

  // 二次确认
  const [confirmError] = await to(
    uni.showModal({
      title: '提示',
      content: '确定要取消该订单吗?',
    }),
  )

  if (confirmError) {
    return
  }

  cancelling.value = true

  const [error] = await to(cancelOrder(props.orderNo))

  cancelling.value = false

  if (error) {
    uni.showToast({
      title: error.message || '取消订单失败',
      icon: 'none',
    })
    return
  }

  uni.showToast({
    title: '订单已取消',
    icon: 'success',
  })

  // 返回并刷新订单列表
  setTimeout(() => {
    uni.navigateBack()
    uni.$emit('orderCancelled', props.orderNo)
  }, 1500)
}
</script>

<style lang="scss" scoped>
.cancel-order {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;

  .order-info {
    padding: 32rpx;
    background: #fff;
    border-radius: 12rpx;
    margin-bottom: 16rpx;
    text-align: center;

    .title {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      margin-bottom: 16rpx;
    }

    .order-no {
      font-size: 26rpx;
      color: #666;
    }
  }

  .cancel-reasons {
    padding: 32rpx;
    background: #fff;
    border-radius: 12rpx;
    margin-bottom: 16rpx;

    .reason-title {
      font-size: 30rpx;
      font-weight: 600;
      margin-bottom: 24rpx;
    }

    .reason-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx 16rpx;
      background: #f5f5f5;
      border-radius: 8rpx;
      margin-bottom: 16rpx;
      border: 2rpx solid transparent;
      transition: all 0.3s;

      &:last-child {
        margin-bottom: 0;
      }

      &.active {
        border-color: #07c160;
        background: #f0f9ff;
      }

      text {
        font-size: 28rpx;
      }
    }
  }

  .tips {
    padding: 32rpx;
    background: #fffbe6;
    border-radius: 12rpx;
    margin-bottom: 32rpx;

    .tip-item {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      text {
        margin-left: 12rpx;
        font-size: 26rpx;
        color: #666;
      }
    }
  }

  .actions {
    display: flex;
    gap: 16rpx;
  }
}
</style>
```

**使用说明:**
- 只能取消待支付状态的订单
- 已支付的订单需要通过退款流程处理
- 取消前应进行二次确认,避免误操作
- 取消成功后应释放订单占用的库存
- 建议提供取消原因选项,用于数据分析
- 取消成功后应通知订单列表刷新

参考: src/api/common/mall/order/orderApi.ts:73-80

## 类型定义

### 支付方式枚举

```typescript
/** 支付方式枚举 */
export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  BALANCE = 'balance',
}
```

参考: src/api/common/mall/order/orderTypes.ts:1-6

### 订单状态枚举

```typescript
/** 支付状态枚举 */
export enum OrderStatus {
  PENDING = 'pending',       // 待支付
  PAID = 'paid',             // 已支付
  DELIVERED = 'delivered',   // 已发货
  COMPLETED = 'completed',   // 已完成
  CANCELLED = 'cancelled',   // 已取消
  REFUNDED = 'refunded',     // 已退款
}
```

参考: src/api/common/mall/order/orderTypes.ts:8-16

### 交易类型枚举

```typescript
/** 交易类型枚举 */
export enum TradeType {
  // 微信支付类型
  JSAPI = 'JSAPI',       // 微信小程序/公众号支付
  NATIVE = 'NATIVE',     // 扫码支付
  APP = 'APP',           // APP支付
  H5 = 'H5',             // H5支付

  // 支付宝支付类型
  WAP = 'WAP',           // 手机网站支付
  PAGE = 'PAGE',         // PC网站支付
}
```

参考: src/api/common/mall/order/orderTypes.ts:18-29

### 完整类型定义文件

```typescript
/** 支付方式枚举 */
export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  BALANCE = 'balance',
}

/** 支付状态枚举 */
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/** 交易类型枚举 */
export enum TradeType {
  // 微信支付类型
  JSAPI = 'JSAPI',
  NATIVE = 'NATIVE',
  APP = 'APP',
  H5 = 'H5',

  // 支付宝支付类型
  WAP = 'WAP',
  PAGE = 'PAGE',
}

/** 订单查询类型 */
export interface OrderQuery extends PageQuery {
  /** 订单ID */
  id?: string | number
  /** 订单编号 */
  orderNo?: string
  /** 用户ID */
  userId?: string | number
  /** 商品ID(SPU) */
  goodsId?: string | number
  /** SKU ID(规格) */
  skuId?: string | number
  /** SKU名称(如:红色-S码) */
  skuName?: string
  /** 规格值JSON */
  specValues?: string
  /** 商品名称 */
  goodsName?: string
  /** 商品图片 */
  goodsImg?: string
  /** 商品价格 */
  price?: string
  /** 购买数量 */
  quantity?: number
  /** 订单总金额 */
  totalAmount?: string
  /** 实付金额 */
  actualAmount?: string
  /** 订单状态 */
  orderStatus?: string
  /** 支付方式 */
  paymentMethod?: string
  /** 支付时间 */
  paymentTime?: string
  /** 交易流水号 */
  transactionId?: string | number
  /** 买家备注 */
  buyerRemark?: string
  /** 订单扩展信息 */
  orderExtInfo?: string
  /** 收货信息 */
  receiverInfo?: string
  /** 物流信息 */
  shippingInfo?: string
  /** 创建时间 */
  createTime?: string
}

/** 订单表单类型 */
export interface OrderBo {
  /** 订单ID */
  id?: string | number
  /** 订单编号 */
  orderNo?: string
  /** 用户ID */
  userId?: string | number
  /** 商品ID(SPU) */
  goodsId?: string | number
  /** SKU ID(规格) */
  skuId?: string | number
  /** SKU名称(如:红色-S码) */
  skuName?: string
  /** 规格值JSON */
  specValues?: string
  /** 商品名称 */
  goodsName?: string
  /** 商品图片 */
  goodsImg?: string
  /** 商品价格 */
  price?: string
  /** 购买数量 */
  quantity?: number
  /** 订单总金额 */
  totalAmount?: string
  /** 实付金额 */
  actualAmount?: string
  /** 订单状态 */
  orderStatus?: string
  /** 支付方式 */
  paymentMethod?: string
  /** 支付时间 */
  paymentTime?: string
  /** 交易流水号 */
  transactionId?: string | number
  /** 买家备注 */
  buyerRemark?: string
  /** 订单扩展信息 */
  orderExtInfo?: string
  /** 收货信息 */
  receiverInfo?: string
  /** 物流信息 */
  shippingInfo?: string
  /** 备注 */
  remark?: string
}

/** 订单视图类型 */
export interface OrderVo {
  /** 订单ID */
  id: string | number
  /** 订单编号 */
  orderNo: string
  /** 用户ID */
  userId: string | number
  /** 商品ID(SPU) */
  goodsId: string | number
  /** SKU ID(规格) */
  skuId: string | number
  /** SKU名称(如:红色-S码) */
  skuName: string
  /** 规格值JSON */
  specValues: string
  /** 商品名称 */
  goodsName: string
  /** 商品图片 */
  goodsImg: string
  /** 商品价格 */
  price: string
  /** 购买数量 */
  quantity: number
  /** 订单总金额 */
  totalAmount: string
  /** 实付金额 */
  actualAmount: string
  /** 订单状态 */
  orderStatus: string
  /** 支付方式 */
  paymentMethod: string
  /** 支付时间 */
  paymentTime: string
  /** 交易流水号 */
  transactionId: string | number
  /** 买家备注 */
  buyerRemark: string
  /** 订单扩展信息 */
  orderExtInfo: string
  /** 收货信息 */
  receiverInfo: string
  /** 物流信息 */
  shippingInfo: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 备注 */
  remark: string
}

/** 创建订单请求类型 */
export interface CreateOrderBo {
  /** 商品ID(SPU) */
  goodsId: string | number
  /** SKU ID(规格) */
  skuId?: string | number
  /** SKU名称(如:红色-S码) */
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

/** 创建订单响应类型 */
export interface CreateOrderVo {
  /** 订单ID */
  id: string | number
  /** 订单编号 */
  orderNo: string
  /** 商品ID(SPU) */
  goodsId: string | number
  /** SKU ID(规格) */
  skuId?: string | number
  /** SKU名称(如:红色-S码) */
  skuName?: string
  /** 规格值JSON */
  specValues?: string
  /** 商品名称 */
  goodsName: string
  /** 商品图片 */
  goodsImg?: string
  /** 商品价格 */
  price: string | number
  /** 购买数量 */
  quantity: number
  /** 订单总金额 */
  totalAmount: number
  /** 订单状态 */
  orderStatus: string
  /** 订单状态名称 */
  orderStatusName: string
  /** 买家备注 */
  buyerRemark?: string
  /** 创建时间 */
  createTime: string
}

/** 订单状态查询响应 */
export interface OrderStatusVo {
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

/** 支付请求类型 */
export interface PaymentRequest {
  /** 订单编号 */
  orderNo: string
  /** 支付方式 */
  paymentMethod: 'wechat' | 'alipay' | 'balance'
  /** 应用ID */
  appId?: string
  /** 交易类型 */
  tradeType?: TradeType
  /** 微信openId */
  openId?: string
  /** 支付密码 */
  payPassword?: string
  /** 返回地址 */
  returnUrl?: string
}

/** 支付响应类型 */
export interface PaymentResponse {
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
  /** 支付参数 */
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
```

参考: src/api/common/mall/order/orderTypes.ts:1-370

## 最佳实践

### 1. 订单创建流程

创建订单前应进行完整的数据验证和用户确认:

```typescript
// ✅ 推荐:完整的订单创建流程
const handleCreateOrder = async () => {
  // 1. 数据验证
  if (!selectedSku && goods.specType === '1') {
    uni.showToast({ title: '请选择商品规格', icon: 'none' })
    return
  }

  if (quantity.value <= 0 || quantity.value > maxStock.value) {
    uni.showToast({ title: '购买数量无效', icon: 'none' })
    return
  }

  // 2. 库存二次检查(防止超卖)
  const [stockError, stockData] = await to(checkStock(goodsId, skuId, quantity.value))
  if (stockError || !stockData.available) {
    uni.showToast({ title: '库存不足', icon: 'none' })
    return
  }

  // 3. 用户确认
  const [confirmError] = await to(
    uni.showModal({
      title: '确认下单',
      content: `确定购买 ${goods.name} x${quantity.value}?`,
    }),
  )
  if (confirmError) {
    return
  }

  // 4. 创建订单
  creating.value = true
  const [error, order] = await to(createOrder(orderData))
  creating.value = false

  if (error) {
    uni.showToast({ title: error.message || '创建订单失败', icon: 'none' })
    return
  }

  // 5. 跳转支付
  uni.navigateTo({
    url: `/pages/order/payment?orderNo=${order.orderNo}`,
  })
}

// ❌ 不推荐:缺少验证的创建流程
const handleCreateOrder = async () => {
  const order = await createOrder(orderData)
  uni.navigateTo({ url: `/pages/order/payment?orderNo=${order.orderNo}` })
}
```

### 2. 支付状态轮询策略

支付完成后应使用合理的轮询策略查询订单状态:

```typescript
// ✅ 推荐:带超时和退避的轮询策略
const startPollingOrderStatus = () => {
  let pollCount = 0
  const maxPollCount = 30 // 最多30次
  let pollInterval = 1000 // 初始间隔1秒

  const poll = async () => {
    pollCount++

    const [error, status] = await to(queryOrderStatus(orderNo))

    // 查询失败或超时
    if (error || pollCount >= maxPollCount) {
      clearTimeout(pollTimer)
      showTimeoutMessage()
      return
    }

    // 支付成功
    if (status.isPaid) {
      clearTimeout(pollTimer)
      showSuccessMessage()
      navigateToOrderDetail()
      return
    }

    // 继续轮询,使用退避策略
    if (pollCount > 10) {
      pollInterval = 2000 // 10次后改为2秒
    }

    pollTimer = setTimeout(poll, pollInterval)
  }

  poll()
}

// ❌ 不推荐:无限轮询
const startPollingOrderStatus = () => {
  setInterval(async () => {
    const status = await queryOrderStatus(orderNo)
    if (status.isPaid) {
      // 忘记清除定时器
      navigateToOrderDetail()
    }
  }, 1000)
}
```

### 3. 多平台支付处理

根据不同平台调起对应的支付组件:

```typescript
// ✅ 推荐:完整的多平台支付处理
const handlePay = async (paymentRes: PaymentResponse) => {
  if (!paymentRes.success) {
    uni.showToast({ title: paymentRes.message, icon: 'none' })
    return
  }

  // #ifdef MP-WEIXIN
  // 微信小程序支付
  const [payError] = await to(
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: paymentRes.payInfo?.timeStamp || '',
      nonceStr: paymentRes.payInfo?.nonceStr || '',
      package: paymentRes.payInfo?.package || '',
      signType: paymentRes.payInfo?.signType || 'MD5',
      paySign: paymentRes.payInfo?.paySign || '',
    }),
  )

  if (!payError) {
    startPollingOrderStatus()
  } else {
    uni.showToast({ title: '支付已取消', icon: 'none' })
  }
  // #endif

  // #ifdef MP-ALIPAY
  // 支付宝小程序支付
  const [payError] = await to(
    uni.requestPayment({
      provider: 'alipay',
      orderInfo: paymentRes.payInfo?.orderString || '',
    }),
  )

  if (!payError) {
    startPollingOrderStatus()
  }
  // #endif

  // #ifdef H5
  // H5 跳转支付
  if (paymentRes.payUrl) {
    window.location.href = paymentRes.payUrl
  } else if (paymentRes.payForm) {
    const div = document.createElement('div')
    div.innerHTML = paymentRes.payForm
    document.body.appendChild(div)
    div.querySelector('form')?.submit()
  }
  // #endif
}

// ❌ 不推荐:未区分平台的支付处理
const handlePay = async (paymentRes: PaymentResponse) => {
  uni.requestPayment(paymentRes.payInfo) // 不同平台参数格式不同
}
```

### 4. 订单列表优化

订单列表应支持下拉刷新和分页加载:

```typescript
// ✅ 推荐:完整的列表加载逻辑
const loadOrders = async (append = false) => {
  if (loading.value) {
    return // 防止重复加载
  }

  loading.value = true

  const [error, data] = await to(getUserOrderList(queryParams))

  loading.value = false
  refreshing.value = false

  if (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
    return
  }

  // 追加或替换数据
  if (append) {
    orders.value = [...orders.value, ...data.rows]
  } else {
    orders.value = data.rows
  }

  // 判断是否还有更多
  hasMore.value = orders.value.length < data.total

  // 缓存订单列表
  cache.set('orderList', orders.value, 5 * 60) // 缓存5分钟
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  queryParams.pageNum = 1
  orders.value = []
  loadOrders()
}

// 加载更多
const onLoadMore = () => {
  if (!hasMore.value || loading.value) {
    return
  }

  queryParams.pageNum!++
  loadOrders(true)
}

// ❌ 不推荐:简单的列表加载
const loadOrders = async () => {
  const data = await getUserOrderList(queryParams)
  orders.value = data.rows // 没有追加逻辑,没有防重复
}
```

### 5. 错误处理和用户提示

提供清晰的错误提示和引导:

```typescript
// ✅ 推荐:详细的错误处理
const handleCreateOrder = async () => {
  const [error, order] = await to(createOrder(orderData))

  if (error) {
    // 根据错误类型给出不同提示
    const errorMessages: Record<string, string> = {
      STOCK_INSUFFICIENT: '商品库存不足,请减少购买数量',
      GOODS_OFFLINE: '商品已下架,无法购买',
      PRICE_CHANGED: '商品价格已变更,请刷新后重试',
      USER_NOT_LOGIN: '请先登录',
    }

    const message = errorMessages[error.code] || error.message || '创建订单失败'

    uni.showModal({
      title: '提示',
      content: message,
      showCancel: error.code === 'USER_NOT_LOGIN',
      cancelText: '取消',
      confirmText: error.code === 'USER_NOT_LOGIN' ? '去登录' : '确定',
      success: (res) => {
        if (res.confirm && error.code === 'USER_NOT_LOGIN') {
          uni.navigateTo({ url: '/pages/login/index' })
        }
      },
    })

    return
  }

  // 成功提示
  uni.showToast({ title: '订单创建成功', icon: 'success' })
  uni.navigateTo({ url: `/pages/order/payment?orderNo=${order.orderNo}` })
}

// ❌ 不推荐:简单的错误提示
const handleCreateOrder = async () => {
  try {
    const order = await createOrder(orderData)
    uni.navigateTo({ url: `/pages/order/payment?orderNo=${order.orderNo}` })
  } catch (error) {
    uni.showToast({ title: '失败', icon: 'none' }) // 提示不明确
  }
}
```

## 注意事项

### 1. 订单创建幂等性

订单创建接口应具备幂等性,避免重复创建订单:

```typescript
// 订单创建前检查是否存在相同的待支付订单
const checkDuplicateOrder = async (goodsId: string | number, skuId?: string | number) => {
  const [error, existingOrders] = await to(
    getUserOrderList({
      goodsId,
      skuId,
      orderStatus: 'pending',
      pageNum: 1,
      pageSize: 1,
    }),
  )

  if (!error && existingOrders.rows.length > 0) {
    const order = existingOrders.rows[0]

    const [confirmError] = await to(
      uni.showModal({
        title: '提示',
        content: '您有相同商品的待支付订单,是否继续支付?',
        confirmText: '去支付',
        cancelText: '重新下单',
      }),
    )

    if (!confirmError) {
      // 跳转到已有订单的支付页面
      uni.navigateTo({
        url: `/pages/order/payment?orderNo=${order.orderNo}`,
      })
      return true
    }
  }

  return false
}
```

参考: src/api/common/mall/order/orderApi.ts:24-31

### 2. 支付安全性

支付密码等敏感信息应进行加密传输:

```typescript
import { encryptByRsa } from '@/utils/crypto'

// 余额支付时加密支付密码
const handleBalancePay = async () => {
  const paymentData: PaymentRequest = {
    orderNo: orderNo.value,
    paymentMethod: 'balance',
    payPassword: encryptByRsa(payPassword.value), // RSA加密
  }

  const [error, data] = await to(createPayment(paymentData))

  // 清除密码
  payPassword.value = ''

  if (error) {
    uni.showToast({ title: '支付失败', icon: 'none' })
    return
  }

  // 处理支付结果...
}
```

参考: src/api/common/mall/order/orderTypes.ts:316-333

### 3. 订单状态流转

订单状态的流转应遵循业务规则:

```typescript
// 订单状态流转规则
const ORDER_STATUS_FLOW = {
  pending: ['paid', 'cancelled'], // 待支付 -> 已支付/已取消
  paid: ['delivered', 'refunded'], // 已支付 -> 已发货/已退款
  delivered: ['completed'], // 已发货 -> 已完成
  completed: [], // 已完成(终态)
  cancelled: [], // 已取消(终态)
  refunded: [], // 已退款(终态)
}

// 检查状态流转是否合法
const canChangeStatus = (currentStatus: string, targetStatus: string): boolean => {
  return ORDER_STATUS_FLOW[currentStatus]?.includes(targetStatus) || false
}

// 使用示例
if (!canChangeStatus('pending', 'delivered')) {
  uni.showToast({ title: '订单状态流转不合法', icon: 'none' })
  return
}
```

参考: src/api/common/mall/order/orderTypes.ts:8-16

### 4. 支付回调处理

H5 支付需要处理支付完成后的页面回调:

```typescript
// pages/order/payment-callback.vue
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options

  // 获取回调参数
  const orderNo = options.orderNo
  const tradeStatus = options.trade_status

  if (tradeStatus === 'TRADE_SUCCESS') {
    // 支付成功,轮询订单状态
    startPollingOrderStatus(orderNo)
  } else if (tradeStatus === 'TRADE_CLOSED') {
    // 支付关闭
    uni.showModal({
      title: '支付失败',
      content: '订单已关闭',
      showCancel: false,
      success: () => {
        uni.navigateBack()
      },
    })
  }
})
```

参考: src/api/common/mall/order/orderTypes.ts:334-370

### 5. 订单超时处理

待支付订单应设置超时时间,超时后自动取消:

```typescript
// 订单倒计时组件
const CountDown = () => {
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30分钟

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // 订单超时,自动取消
          handleOrderTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleOrderTimeout = async () => {
    await cancelOrder(orderNo)

    uni.showModal({
      title: '订单已超时',
      content: '支付超时,订单已自动取消',
      showCancel: false,
      success: () => {
        uni.navigateBack()
      },
    })
  }

  return <text>剩余时间: {formatTime(timeLeft)}</text>
}
```

参考: src/api/common/mall/order/orderTypes.ts:302-314

### 6. 订单金额计算

订单金额计算应在后端完成,前端只做展示:

```typescript
// ❌ 不推荐:在前端计算订单金额
const totalAmount = computed(() => {
  const goodsAmount = Number(goods.price) * quantity.value
  const shippingFee = 10
  const discount = 5
  return goodsAmount + shippingFee - discount // 不安全
})

// ✅ 推荐:后端计算金额,前端只展示
const createOrderData: CreateOrderBo = {
  goodsId: goods.id,
  skuId: selectedSku?.id,
  price: selectedSku?.price || goods.price, // 使用实时价格
  quantity: quantity.value,
  // 不传递 totalAmount 和 actualAmount,由后端计算
}

const [error, order] = await to(createOrder(createOrderData))

if (!error) {
  // 使用后端返回的金额
  totalAmount.value = order.totalAmount
  actualAmount.value = order.actualAmount
}
```

参考: src/api/common/mall/order/orderTypes.ts:244-266

### 7. 库存预扣和释放

创建订单时应预扣库存,支付超时或取消订单时释放库存:

```typescript
// 后端应实现库存预扣机制
// 1. 创建订单时预扣库存
// 2. 支付成功后确认扣减
// 3. 支付超时或取消订单时释放库存

// 前端在取消订单时提示库存释放
const handleCancelOrder = async (orderNo: string) => {
  const [error] = await to(cancelOrder(orderNo))

  if (error) {
    uni.showToast({ title: '取消失败', icon: 'none' })
    return
  }

  uni.showToast({
    title: '订单已取消,库存已释放',
    icon: 'success',
  })
}
```

参考: src/api/common/mall/order/orderApi.ts:73-80

### 8. 订单搜索和筛选

订单列表应支持多种搜索和筛选条件:

```typescript
// 订单搜索
const searchParams = reactive<OrderQuery>({
  pageNum: 1,
  pageSize: 10,
  orderStatus: undefined,
  goodsName: '',
  orderNo: '',
  createTime: '',
})

// 商品名称搜索
const handleGoodsNameSearch = (name: string) => {
  searchParams.goodsName = name
  searchParams.pageNum = 1
  loadOrders()
}

// 订单号搜索
const handleOrderNoSearch = (orderNo: string) => {
  searchParams.orderNo = orderNo
  searchParams.pageNum = 1
  loadOrders()
}

// 按时间筛选
const handleTimeFilter = (timeRange: string[]) => {
  searchParams.params = {
    beginTime: timeRange[0],
    endTime: timeRange[1],
  }
  searchParams.pageNum = 1
  loadOrders()
}
```

参考: src/api/common/mall/order/orderTypes.ts:32-98

---

通过合理使用这些订单与支付 API,可以构建完整、安全、高效的电商交易系统。
