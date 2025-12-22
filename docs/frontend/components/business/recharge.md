# ARecharge 充值组件

## 介绍

ARecharge 是一个企业级在线充值组件，提供完整的扫码支付充值功能。组件封装了从金额选择、订单创建、支付二维码生成到支付状态查询的完整支付流程，支持微信支付和支付宝两种主流支付方式。

**核心特性:**

- **多支付方式** - 支持微信支付和支付宝扫码支付，可灵活切换
- **完整支付流程** - 封装订单创建、支付生成、状态轮询的完整闭环
- **二维码自动生成** - 自动调用后端 API 生成支付二维码，支持刷新重新获取
- **支付状态监控** - 内置支付状态查询机制，支持重试策略
- **退款功能** - 超级管理员可直接发起订单退款
- **AModal 集成** - 基于 AModal 组件构建，继承其所有特性
- **TypeScript 支持** - 完整的类型定义，提供良好的开发体验

## 架构设计

### 组件结构

```
┌─────────────────────────────────────────────────────────┐
│                     ARecharge                            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │                   AModal                         │   │
│  │  title="在线充值(系统自动充值)"                  │   │
│  │  mode="dialog" size="large"                      │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │           充值金额选择区                    │ │   │
│  │  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐  │ │   │
│  │  │  │ 0.01元│ │ 0.02元│ │ 10元  │ │ 100元 │  │ │   │
│  │  │  └───────┘ └───────┘ └───────┘ └───────┘  │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │           支付方式选择区                    │ │   │
│  │  │  ┌─────────────┐  ┌─────────────┐         │ │   │
│  │  │  │ 微信支付    │  │ 支付宝支付  │         │ │   │
│  │  │  │ (已选中)    │  │             │         │ │   │
│  │  │  └─────────────┘  └─────────────┘         │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │           支付二维码区                      │ │   │
│  │  │         ┌─────────────┐                    │ │   │
│  │  │         │             │                    │ │   │
│  │  │         │   QR Code   │                    │ │   │
│  │  │         │             │                    │ │   │
│  │  │         └─────────────┘                    │ │   │
│  │  │           重新获取                          │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  [支付遇到问题]  [退款(管理员)]  [我已完成支付] │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 支付流程架构

```
用户操作                    前端组件                     后端 API
   │                           │                           │
   │ 1. 选择充值金额            │                           │
   ├──────────────────────────>│                           │
   │                           │ 2. createOrder()          │
   │                           ├──────────────────────────>│
   │                           │                           │ 创建订单
   │                           │<──────────────────────────┤ 返回 orderNo
   │                           │ 3. createPayment()        │
   │                           ├──────────────────────────>│
   │                           │                           │ 生成支付
   │                           │<──────────────────────────┤ 返回二维码
   │ 4. 显示二维码              │                           │
   │<──────────────────────────┤                           │
   │                           │                           │
   │ 5. 扫码支付                │                           │
   │ ═════════════════════════════════════════════════════>│
   │                           │                           │
   │ 6. 点击"我已完成支付"      │                           │
   ├──────────────────────────>│                           │
   │                           │ 7. queryOrderStatus()     │
   │                           ├──────────────────────────>│
   │                           │                           │ 查询支付状态
   │                           │<──────────────────────────┤
   │                           │                           │
   │ 8. 触发 success 事件       │                           │
   │<──────────────────────────┤                           │
```

### 状态管理

```typescript
// 核心响应式状态
const buttonLoading = ref(false)      // 确认支付按钮加载状态
const refundLoading = ref(false)      // 退款按钮加载状态
const goodsId = ref<number | string>() // 选中的商品ID
const orderNo = ref<string>()          // 当前订单号
const qrCodeUrl = ref<string>()        // 支付二维码URL
const paymentMethod = ref<'wechat' | 'alipay'>('wechat') // 支付方式

// 计算属性
const dialogVisible = computed({...})  // 对话框显示状态 (v-model)
const selectedGoods = computed(...)    // 当前选中的商品
const paymentMethodText = computed(...) // 支付方式显示文本
```

## 基础用法

### 最简用法

最基础的充值组件使用方式，通过 `v-model` 控制对话框显示：

```vue
<template>
  <div class="recharge-demo">
    <el-button type="primary" @click="openRecharge">
      <el-icon><Wallet /></el-icon>
      充值
    </el-button>

    <ARecharge
      v-model="showRecharge"
      @success="handleRechargeSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showRecharge = ref(false)

const openRecharge = () => {
  showRecharge.value = true
}

const handleRechargeSuccess = () => {
  console.log('充值成功！')
  // 刷新用户余额等操作
  refreshUserBalance()
}

const refreshUserBalance = async () => {
  // 重新获取用户余额数据
  // const [err, data] = await getUserBalance()
  // if (!err) {
  //   userBalance.value = data.balance
  // }
}
</script>
```

**使用说明:**
- 使用 `v-model` 双向绑定控制对话框显示/隐藏
- 监听 `success` 事件处理充值成功后的业务逻辑
- 充值成功后通常需要刷新用户余额或其他相关数据

### 用户中心集成

在用户中心页面集成充值功能，展示当前余额并提供充值入口：

```vue
<template>
  <div class="user-center">
    <!-- 余额卡片 -->
    <el-card class="balance-card" shadow="hover">
      <div class="balance-header">
        <div class="balance-info">
          <span class="balance-label">当前余额</span>
          <span class="balance-amount">¥{{ formatBalance(userBalance) }}</span>
        </div>
        <el-button type="primary" size="large" @click="showRecharge = true">
          <el-icon><Plus /></el-icon>
          立即充值
        </el-button>
      </div>

      <!-- 余额明细快捷入口 -->
      <div class="balance-actions">
        <el-button text @click="viewBalanceHistory">
          <el-icon><Clock /></el-icon>
          余额明细
        </el-button>
        <el-button text @click="viewOrderHistory">
          <el-icon><List /></el-icon>
          充值记录
        </el-button>
      </div>
    </el-card>

    <!-- 充值组件 -->
    <ARecharge
      v-model="showRecharge"
      @success="handleRechargeComplete"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showMsgSuccess } from '@/utils/modal'

const router = useRouter()
const showRecharge = ref(false)
const userBalance = ref(0)

// 格式化余额显示
const formatBalance = (balance: number) => {
  return balance.toFixed(2)
}

// 充值成功处理
const handleRechargeComplete = () => {
  getUserBalance()
  showMsgSuccess('充值成功，余额已更新！')
}

// 获取用户余额
const getUserBalance = async () => {
  // const [err, data] = await getUserBalanceApi()
  // if (!err) {
  //   userBalance.value = data.balance
  // }
}

// 查看余额明细
const viewBalanceHistory = () => {
  router.push('/user/balance-history')
}

// 查看充值记录
const viewOrderHistory = () => {
  router.push('/user/recharge-history')
}

onMounted(() => {
  getUserBalance()
})
</script>

<style scoped lang="scss">
.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-label {
  font-size: 14px;
  opacity: 0.8;
}

.balance-amount {
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 1px;
}

.balance-actions {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);

  .el-button {
    color: rgba(255, 255, 255, 0.9);

    &:hover {
      color: white;
    }
  }
}
</style>
```

## 高级用法

### 与统计卡片集成

在管理后台首页，将充值功能与统计卡片结合使用：

```vue
<template>
  <el-row :gutter="16">
    <el-col :xs="24" :sm="12" :md="8" :lg="6">
      <AStatsCard
        title="总用户数"
        :value="coreStats.totalUsers"
        description="较昨日"
        icon="user"
        :trend="{ value: coreStats.userGrowthRate, isUp: coreStats.userGrowthRate > 0 }"
        showAction
        action-icon="recharge"
        actionIconColor="#6D93FF"
        @action="openRechargeDialog"
        clickable
        @click="goToUserManagement"
      />
    </el-col>
  </el-row>

  <!-- 充值组件 -->
  <ARecharge
    v-model="showRecharge"
    @success="handleRechargeSuccess"
  />
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showRecharge = ref(false)

const coreStats = reactive({
  totalUsers: 1234,
  userGrowthRate: 5.2
})

const openRechargeDialog = () => {
  showRecharge.value = true
}

const handleRechargeSuccess = () => {
  // 刷新统计数据
  refreshDashboardStats()
}

const goToUserManagement = () => {
  router.push('/system/user')
}

const refreshDashboardStats = async () => {
  // 重新加载仪表盘统计数据
}
</script>
```

### 监听对话框状态变化

监听充值对话框的开启和关闭，执行相应的初始化或清理操作：

```vue
<template>
  <ARecharge
    v-model="dialogVisible"
    @success="handleSuccess"
    @update:model-value="handleDialogChange"
  />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const dialogVisible = ref(false)

// 方式一：通过事件监听
const handleDialogChange = (visible: boolean) => {
  if (visible) {
    console.log('充值对话框已打开')
    // 初始化操作：记录打开时间、埋点统计等
    trackRechargeDialogOpen()
  } else {
    console.log('充值对话框已关闭')
    // 清理操作：重置表单、取消轮询等
    cleanupRechargeState()
  }
}

// 方式二：通过 watch 监听
watch(dialogVisible, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    // 从关闭到打开
    console.log('对话框从关闭变为打开')
  }
  if (!newVal && oldVal) {
    // 从打开到关闭
    console.log('对话框从打开变为关闭')
  }
})

const handleSuccess = () => {
  console.log('充值成功')
}

const trackRechargeDialogOpen = () => {
  // 埋点统计：用户打开充值对话框
}

const cleanupRechargeState = () => {
  // 清理状态
}
</script>
```

### 与购买流程集成

在商品购买页面，当用户余额不足时引导充值：

```vue
<template>
  <div class="purchase-page">
    <!-- 商品信息 -->
    <el-card class="product-card">
      <template #header>
        <div class="product-header">
          <h3>{{ product.name }}</h3>
          <el-tag :type="product.stock > 0 ? 'success' : 'danger'">
            {{ product.stock > 0 ? '有货' : '缺货' }}
          </el-tag>
        </div>
      </template>

      <div class="product-content">
        <el-image :src="product.image" fit="cover" />
        <div class="product-info">
          <p class="product-description">{{ product.description }}</p>
          <div class="price-info">
            <span class="current-price">¥{{ product.price }}</span>
            <span class="original-price" v-if="product.originalPrice">
              ¥{{ product.originalPrice }}
            </span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 账户信息 -->
    <el-card class="account-card">
      <div class="account-info">
        <div class="balance-row">
          <span>账户余额</span>
          <span class="balance-value">¥{{ userBalance.toFixed(2) }}</span>
        </div>
        <div class="need-pay-row" v-if="needAmount > 0">
          <span>还需支付</span>
          <span class="need-pay-value">¥{{ needAmount.toFixed(2) }}</span>
        </div>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button
        v-if="canPurchase"
        type="primary"
        size="large"
        :loading="purchasing"
        @click="handlePurchase"
      >
        立即购买 (余额支付)
      </el-button>

      <template v-else>
        <el-button
          type="warning"
          size="large"
          @click="showRecharge = true"
        >
          <el-icon><Wallet /></el-icon>
          去充值 (差 ¥{{ needAmount.toFixed(2) }})
        </el-button>
        <el-button
          size="large"
          @click="handleDirectPay"
        >
          直接支付
        </el-button>
      </template>
    </div>

    <!-- 充值组件 -->
    <ARecharge
      v-model="showRecharge"
      @success="handleRechargeSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { showMsgSuccess, showMsgWarning, showConfirm } from '@/utils/modal'

const showRecharge = ref(false)
const purchasing = ref(false)
const userBalance = ref(50.00)

const product = ref({
  id: '1001',
  name: 'VIP 年度会员',
  description: '享受全平台 VIP 特权，包含所有高级功能',
  price: 199.00,
  originalPrice: 299.00,
  image: '/images/vip-membership.png',
  stock: 100
})

// 计算是否可以购买
const canPurchase = computed(() => {
  return userBalance.value >= product.value.price
})

// 计算还需支付金额
const needAmount = computed(() => {
  const diff = product.value.price - userBalance.value
  return diff > 0 ? diff : 0
})

// 处理购买
const handlePurchase = async () => {
  if (!canPurchase.value) {
    showMsgWarning('余额不足，请先充值')
    return
  }

  const [confirmErr] = await showConfirm(
    `确认使用余额支付 ¥${product.value.price} 购买 ${product.value.name}？`
  )
  if (confirmErr) return

  purchasing.value = true
  try {
    // 调用购买 API
    // const [err] = await purchaseProduct(product.value.id)
    // if (!err) {
    //   showMsgSuccess('购买成功！')
    //   refreshUserBalance()
    // }
  } finally {
    purchasing.value = false
  }
}

// 直接支付（不使用余额）
const handleDirectPay = () => {
  // 跳转到支付页面或打开支付对话框
  console.log('直接支付')
}

// 充值成功处理
const handleRechargeSuccess = () => {
  refreshUserBalance()
  showMsgSuccess('充值成功！现在可以购买了')
}

// 刷新用户余额
const refreshUserBalance = async () => {
  // const [err, data] = await getUserBalance()
  // if (!err) {
  //   userBalance.value = data.balance
  // }
}

onMounted(() => {
  refreshUserBalance()
})
</script>

<style scoped lang="scss">
.purchase-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.product-card {
  margin-bottom: 16px;

  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
    }
  }

  .product-content {
    display: flex;
    gap: 16px;

    .el-image {
      width: 120px;
      height: 120px;
      border-radius: 8px;
    }
  }

  .price-info {
    margin-top: 12px;

    .current-price {
      font-size: 24px;
      font-weight: bold;
      color: var(--el-color-danger);
    }

    .original-price {
      margin-left: 8px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      text-decoration: line-through;
    }
  }
}

.account-card {
  margin-bottom: 16px;

  .account-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .balance-row,
  .need-pay-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .balance-value {
    font-size: 18px;
    font-weight: bold;
    color: var(--el-color-success);
  }

  .need-pay-value {
    font-size: 18px;
    font-weight: bold;
    color: var(--el-color-danger);
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .el-button {
    width: 100%;
  }
}
</style>
```

### 自定义充值金额列表

组件内部可以自定义充值金额选项，支持动态配置：

```vue
<template>
  <ARecharge
    v-model="showRecharge"
    @success="handleSuccess"
  />
</template>

<script lang="ts" setup>
// 组件内部 goodsList 可以从后端动态获取
// 默认配置示例:
const defaultGoodsList = [
  { id: 1, name: '1分钱', price: '0.01' },   // 测试用
  { id: 2, name: '2分钱', price: '0.02' },   // 测试用
  { id: 3, name: '10元', price: '10.00' },
  { id: 4, name: '50元', price: '50.00' },
  { id: 5, name: '100元', price: '100.00' },
  { id: 6, name: '500元', price: '500.00' },
  { id: 7, name: '1000元', price: '1000.00' }
]

// 生产环境推荐配置:
const productionGoodsList = [
  { id: 1, name: '10元', price: '10.00' },
  { id: 2, name: '50元', price: '50.00' },
  { id: 3, name: '100元', price: '100.00' },
  { id: 4, name: '200元', price: '200.00' },
  { id: 5, name: '500元', price: '500.00' },
  { id: 6, name: '1000元', price: '1000.00' }
]
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| model-value / v-model | 控制对话框是否显示 | `boolean` | — | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 对话框显示状态变化时触发 | `(visible: boolean) => void` |
| success | 充值支付成功时触发 | `() => void` |

### 内部状态

组件内部维护以下响应式状态：

| 状态 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| buttonLoading | 确认支付按钮加载状态 | `boolean` | `false` |
| refundLoading | 退款按钮加载状态 | `boolean` | `false` |
| goodsId | 选中的商品/金额 ID | `number \| string \| undefined` | `undefined` |
| orderNo | 当前订单编号 | `string \| undefined` | `undefined` |
| qrCodeUrl | 支付二维码 Base64 URL | `string \| undefined` | `undefined` |
| paymentMethod | 当前选择的支付方式 | `'wechat' \| 'alipay'` | `'wechat'` |

### 内部方法

| 方法 | 说明 | 参数 |
|------|------|------|
| initGoodsList | 初始化商品列表（可从后端获取） | — |
| selectPaymentMethod | 选择支付方式并刷新二维码 | `method: 'wechat' \| 'alipay'` |
| handleCreateOrder | 创建订单并生成支付二维码 | `goods: GoodsItem` |
| handlePaymentConfirm | 确认支付完成，查询支付状态 | — |
| handlePaymentProblem | 处理支付问题（复制客服联系方式） | — |
| handleRefund | 发起退款（仅超级管理员） | — |

## 类型定义

### GoodsItem 商品接口

```typescript
/**
 * 商品数据接口
 * @description 定义充值金额选项的数据结构
 */
export interface GoodsItem {
  /** 商品ID - 唯一标识符 */
  id: number | string

  /** 商品价格 - 字符串格式，如 "10.00" */
  price: string

  /** 商品名称 - 可选，用于显示和订单备注 */
  name?: string
}
```

### CreateOrderBo 创建订单请求

```typescript
/**
 * 创建订单请求类型
 * @description 调用 createOrder API 时的请求参数
 */
export interface CreateOrderBo {
  /** 商品ID */
  goodsId: string | number

  /** 商品名称 */
  goodsName?: string

  /** 商品图片 */
  goodsImg?: string

  /** 商品价格 - 字符串或数字格式 */
  price: string | number

  /** 购买数量 */
  quantity: number

  /** 买家备注 */
  buyerRemark?: string

  /** 备注 */
  remark?: string
}
```

### CreateOrderVo 创建订单响应

```typescript
/**
 * 创建订单响应类型
 * @description createOrder API 的返回数据结构
 */
export interface CreateOrderVo {
  /** 订单ID */
  id: string | number

  /** 订单编号 - 用于后续支付和查询 */
  orderNo: string

  /** 商品ID */
  goodsId: string | number

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

### PaymentRequest 支付请求

```typescript
/**
 * 支付请求类型
 * @description 调用 createPayment API 时的请求参数
 */
export interface PaymentRequest {
  /** 订单编号 */
  orderNo: string

  /** 支付方式 */
  paymentMethod: 'wechat' | 'alipay' | 'balance'

  /** 应用ID - 可选 */
  appId?: string

  /** 交易类型 */
  tradeType?: 'JSAPI' | 'NATIVE' | 'APP' | 'H5' | 'WAP' | 'PAGE'

  /** 微信 openId - JSAPI 支付时需要 */
  openId?: string

  /** 支付密码 - 余额支付时需要 */
  payPassword?: string

  /** 返回地址 - H5 支付时需要 */
  returnUrl?: string
}
```

### PaymentResponse 支付响应

```typescript
/**
 * 支付响应类型
 * @description createPayment API 的返回数据结构
 */
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

  /** 预支付ID - 微信支付使用 */
  prepayId?: string

  /** 支付参数 - 小程序/APP 支付使用 */
  payInfo?: Record<string, string>

  /** 二维码链接 - NATIVE 支付使用 */
  codeUrl?: string

  /** 二维码 Base64 - 直接显示的二维码图片 */
  qrCodeBase64?: string

  /** 支付链接 - H5 支付使用 */
  payUrl?: string

  /** 支付表单 - PC 网页支付使用 */
  payForm?: string

  /** 支付状态 */
  tradeState?: string

  /** 支付时间 */
  payTime?: string

  /** 过期时间 */
  expireTime?: string
}
```

### OrderStatusVo 订单状态查询响应

```typescript
/**
 * 订单状态查询响应
 * @description queryOrderStatus API 的返回数据结构
 */
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
```

## API 接口

### 订单相关 API

组件内部使用以下 API 接口：

```typescript
import {
  createOrder,
  createPayment,
  queryOrderStatus,
  refundOrder
} from '@/api/business/mall/order/orderApi'

/**
 * 创建订单
 * @param data 订单信息
 * @returns 订单创建结果
 */
export const createOrder = (data: CreateOrderBo): Result<CreateOrderVo> => {
  return http.post<CreateOrderVo>('/common/mall/order/createOrder', data)
}

/**
 * 统一支付接口
 * @param data 支付请求数据
 * @returns 支付结果（包含二维码等信息）
 */
export const createPayment = (data: PaymentRequest): Result<PaymentResponse> => {
  return http.post<PaymentResponse>('/common/mall/order/createPayment', data)
}

/**
 * 查询订单状态
 * @param orderNo 订单号
 * @returns 订单状态信息
 */
export const queryOrderStatus = (orderNo: string): Result<OrderStatusVo> => {
  return http.get<OrderStatusVo>('/common/mall/order/queryOrderStatus', {
    orderNo
  })
}

/**
 * 订单退款（仅超级管理员）
 * @param orderNo 订单号
 * @returns 退款结果
 */
export const refundOrder = (orderNo: string): Result<void> => {
  return http.post<void>('/common/mall/order/refundOrder', { orderNo })
}
```

## 支付流程详解

### 1. 选择充值金额

用户点击金额按钮时，触发 `watch(goodsId)` 监听器：

```typescript
// 监听商品ID变化，自动创建订单
watch(goodsId, (val) => {
  if (val && selectedGoods.value.id) {
    handleCreateOrder(selectedGoods.value)
  }
})
```

### 2. 创建订单

调用 `createOrder` API 创建充值订单：

```typescript
const handleCreateOrder = async (goods: GoodsItem): Promise<void> => {
  // 构建订单数据
  const createOrderData: CreateOrderBo = {
    goodsId: goods.id,
    goodsName: goods.name || `充值${goods.price}元`,
    price: goods.price,
    quantity: 1,
    buyerRemark: '在线充值'
  }

  // 创建订单
  const [err, data] = await createOrder(createOrderData)
  if (!err && data) {
    orderNo.value = data.orderNo

    // 创建订单成功后，发起支付
    const paymentData = {
      orderNo: data.orderNo,
      paymentMethod: paymentMethod.value,
      tradeType: 'NATIVE' as const  // 扫码支付
    }

    const [payErr, payData] = await createPayment(paymentData)
    if (!payErr && payData?.success) {
      // 显示二维码
      qrCodeUrl.value = payData.qrCodeBase64 || ''
    }
  }
}
```

### 3. 生成支付二维码

后端返回 Base64 格式的二维码图片，直接显示在页面上：

```vue
<el-row type="flex" justify="center" v-if="qrCodeUrl">
  <div class="flex flex-col items-center">
    <span class="-mb-2 z-1">
      {{ paymentMethodText }}扫码，支付{{ Number(selectedGoods.price) }}元
    </span>
    <el-image :src="qrCodeUrl" class="w-50 h-50" />
    <span
      class="text-blue-500 cursor-pointer text-sm"
      @click="handleCreateOrder(selectedGoods)"
    >
      重新获取
    </span>
  </div>
</el-row>
```

### 4. 确认支付

用户完成扫码支付后，点击"我已完成支付"按钮：

```typescript
const handlePaymentConfirm = async (): Promise<void> => {
  if (!qrCodeUrl.value || !orderNo.value) {
    showMsgWarning('请选择充值金额')
    return
  }

  buttonLoading.value = true

  // 使用 toWithRetry 查询支付状态（支持重试）
  const [err] = await toWithRetry(
    () => queryOrderStatus(orderNo.value),
    0  // 重试次数，0 表示不重试
  )

  if (!err) {
    showMsgSuccess('支付成功')
    emit('success')  // 触发成功事件
  }

  buttonLoading.value = false
}
```

### 5. 支付状态轮询（可选）

如需自动轮询支付状态，可以增加重试次数：

```typescript
// 轮询3次，每次间隔2秒
const [err] = await toWithRetry(
  () => queryOrderStatus(orderNo.value),
  3,     // 最大重试次数
  2000   // 重试间隔（毫秒）
)
```

## 支付方式

### 微信支付

微信扫码支付（NATIVE 模式）：

- 后端调用微信支付统一下单接口
- 返回 `code_url` 并转换为二维码图片
- 用户使用微信扫一扫完成支付

```typescript
const paymentData = {
  orderNo: orderNo,
  paymentMethod: 'wechat',
  tradeType: 'NATIVE'
}
```

### 支付宝支付

支付宝扫码支付：

- 后端调用支付宝当面付接口
- 返回二维码链接并转换为图片
- 用户使用支付宝扫一扫完成支付

```typescript
const paymentData = {
  orderNo: orderNo,
  paymentMethod: 'alipay',
  tradeType: 'NATIVE'
}
```

### 支付方式切换

用户可以在支付前切换支付方式：

```typescript
const selectPaymentMethod = (method: 'wechat' | 'alipay') => {
  paymentMethod.value = method
  // 切换支付方式时，重新生成支付二维码
  if (selectedGoods.value.id) {
    handleCreateOrder(selectedGoods.value)
  }
}
```

## 安全机制

### 订单安全

1. **订单唯一性** - 每个订单都有唯一的 `orderNo`
2. **金额校验** - 后端严格校验支付金额与订单金额
3. **状态追踪** - 完整的订单状态流转（待支付 → 已支付 → 已完成）
4. **重复支付防护** - 同一订单不能重复支付

### 支付安全

1. **官方接口** - 使用微信/支付宝官方支付接口
2. **签名验证** - 支付请求和回调都有签名验证
3. **HTTPS 加密** - 所有支付请求都通过 HTTPS 传输
4. **二维码时效** - 支付二维码有过期时间

### 权限控制

退款功能仅对超级管理员开放：

```vue
<el-button
  v-superadmin
  v-if="orderNo"
  type="danger"
  :loading="refundLoading"
  @click="handleRefund"
>
  退款
</el-button>
```

## 错误处理

### 订单创建失败

```typescript
const [err, data] = await createOrder(createOrderData)
if (err || !data) {
  showMsgWarning('创建订单失败')
  return
}
```

### 支付二维码生成失败

```typescript
const [payErr, payData] = await createPayment(paymentData)
if (payErr || !payData?.success) {
  showMsgWarning(payData?.message || '生成支付二维码失败')
  return
}
```

### 支付状态查询失败

```typescript
const [err] = await toWithRetry(() => queryOrderStatus(orderNo.value), 0)
if (err) {
  // 查询失败，但不一定是支付失败
  // 可能是网络问题，建议用户稍后查看订单
  showMsgWarning('查询支付状态失败，请稍后查看订单')
}
```

### 支付遇到问题

提供客服联系方式：

```typescript
const handlePaymentProblem = async () => {
  copy('770492966', '已复制qq/wx: 770492966, 请添加联系~')
}
```

## 样式定制

### 支付方式卡片

```scss
.payment-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: var(--el-bg-color);

  span {
    color: var(--el-text-color-regular);
  }

  &:hover {
    background-color: var(--el-fill-color-light);
    box-shadow: 0 2px 4px var(--el-box-shadow-light);
  }

  &.active {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    box-shadow: 0 2px 4px var(--el-box-shadow-light);

    span {
      color: var(--el-color-primary);
    }
  }
}
```

### 暗黑模式适配

组件使用 Element Plus 的 CSS 变量，自动支持暗黑模式：

- `--el-bg-color` - 背景色
- `--el-fill-color-light` - 悬停背景色
- `--el-color-primary` - 主题色
- `--el-color-primary-light-9` - 主题色浅色
- `--el-text-color-regular` - 文本颜色
- `--el-box-shadow-light` - 阴影

## 最佳实践

### 1. 充值成功后刷新数据

充值成功后，务必刷新相关数据：

```typescript
const handleRechargeSuccess = () => {
  // 1. 刷新用户余额
  refreshUserBalance()

  // 2. 刷新用户信息（可能包含会员等级等）
  refreshUserInfo()

  // 3. 刷新统计数据（如果在管理后台）
  refreshDashboardStats()

  // 4. 显示成功提示
  showMsgSuccess('充值成功！')
}
```

### 2. 处理网络不稳定

在网络不稳定的环境下，增加重试机制：

```typescript
// 使用 toWithRetry 处理支付状态查询
const [err] = await toWithRetry(
  () => queryOrderStatus(orderNo.value),
  3,     // 重试3次
  2000   // 间隔2秒
)
```

### 3. 提供多种支付入口

在不同场景提供充值入口，提高转化率：

```vue
<!-- 方式1：顶部导航栏 -->
<template #header>
  <el-button @click="showRecharge = true">充值</el-button>
</template>

<!-- 方式2：余额不足时引导 -->
<el-alert v-if="balanceInsufficient" type="warning">
  余额不足，<el-link @click="showRecharge = true">立即充值</el-link>
</el-alert>

<!-- 方式3：统计卡片快捷操作 -->
<AStatsCard showAction @action="showRecharge = true" />
```

### 4. 记录充值行为

埋点统计充值行为，用于数据分析：

```typescript
const handleRechargeSuccess = () => {
  // 埋点：充值成功
  trackEvent('recharge_success', {
    amount: selectedGoods.value.price,
    paymentMethod: paymentMethod.value,
    orderNo: orderNo.value
  })
}

watch(dialogVisible, (visible) => {
  if (visible) {
    // 埋点：打开充值弹窗
    trackEvent('recharge_dialog_open')
  }
})
```

### 5. 优雅处理对话框关闭

用户关闭对话框时，保持良好的用户体验：

```typescript
// 支付过程中禁止关闭
// 组件内部已通过 :loading="buttonLoading" 实现

// 外部可以监听关闭事件做清理
watch(dialogVisible, (visible) => {
  if (!visible) {
    // 清理临时数据
    // 如果有未完成的订单，可以提示用户
  }
})
```

### 6. 测试环境使用小额

开发测试时使用小额金额：

```typescript
// 测试环境默认商品列表
const testGoodsList = [
  { id: 1, name: '1分钱', price: '0.01' },
  { id: 2, name: '2分钱', price: '0.02' }
]
```

### 7. 退款权限控制

退款是敏感操作，务必做好权限控制：

```vue
<!-- 使用 v-superadmin 指令限制退款权限 -->
<el-button v-superadmin @click="handleRefund">退款</el-button>
```

### 8. 二维码过期处理

提供重新获取二维码的功能：

```vue
<span @click="handleCreateOrder(selectedGoods)">
  重新获取
</span>
```

## 常见问题

### 1. 二维码不显示

**问题原因:**
- 后端未正确返回二维码数据
- 图片 Base64 格式不正确
- 网络请求失败

**解决方案:**

```typescript
// 检查返回数据
const [payErr, payData] = await createPayment(paymentData)
console.log('支付响应:', payData)

if (!payData?.qrCodeBase64) {
  console.error('未返回二维码数据')
  showMsgWarning('生成二维码失败，请重试')
  return
}

// 确保 Base64 格式正确
if (!payData.qrCodeBase64.startsWith('data:image')) {
  qrCodeUrl.value = `data:image/png;base64,${payData.qrCodeBase64}`
} else {
  qrCodeUrl.value = payData.qrCodeBase64
}
```

### 2. 支付成功但状态未更新

**问题原因:**
- 支付回调延迟
- 前端查询过早
- 网络问题

**解决方案:**

```typescript
// 增加查询重试次数和间隔
const [err] = await toWithRetry(
  () => queryOrderStatus(orderNo.value),
  5,     // 重试5次
  3000   // 间隔3秒
)

// 或者提示用户手动刷新
if (err) {
  showMsgWarning('请稍后查看订单状态，或刷新页面')
}
```

### 3. 切换支付方式后二维码不更新

**问题原因:**
- 未正确触发重新生成逻辑

**解决方案:**

```typescript
const selectPaymentMethod = (method: 'wechat' | 'alipay') => {
  paymentMethod.value = method
  // 确保重新生成二维码
  if (selectedGoods.value.id) {
    handleCreateOrder(selectedGoods.value)
  }
}
```

### 4. 退款按钮不显示

**问题原因:**
- 当前用户不是超级管理员
- 没有订单号
- v-superadmin 指令未正确配置

**解决方案:**

```vue
<!-- 检查条件 -->
<el-button
  v-superadmin
  v-if="orderNo"
  type="danger"
>
  退款
</el-button>

<!-- 调试：临时移除权限检查 -->
<el-button v-if="orderNo" type="danger">
  退款（调试）
</el-button>
```

### 5. 充值金额列表为空

**问题原因:**
- 后端接口未返回数据
- 初始化函数未执行

**解决方案:**

```typescript
// 确保 onMounted 中调用初始化
onMounted(() => {
  initGoodsList()
})

// 或使用默认数据
const goodsList = ref<GoodsItem[]>([
  { id: 1, name: '10元', price: '10.00' },
  { id: 2, name: '50元', price: '50.00' }
])

const initGoodsList = async (): Promise<void> => {
  const [err, data] = await listGoods()
  if (!err && data?.length > 0) {
    goodsList.value = data
  }
  // 保留默认数据作为兜底
}
```

### 6. 支付超时

**问题原因:**
- 二维码已过期
- 后端支付服务异常

**解决方案:**

```typescript
// 提供重新获取功能
<span @click="handleCreateOrder(selectedGoods)">
  二维码已过期？点击重新获取
</span>

// 或自动刷新（定时器）
let refreshTimer: number

watch(qrCodeUrl, (newUrl) => {
  if (newUrl) {
    // 设置5分钟后自动刷新
    refreshTimer = window.setTimeout(() => {
      handleCreateOrder(selectedGoods.value)
    }, 5 * 60 * 1000)
  }
})

onUnmounted(() => {
  clearTimeout(refreshTimer)
})
```

### 7. 移动端显示问题

**问题原因:**
- 对话框在移动端显示不完整
- 二维码太小无法扫描

**解决方案:**

```scss
// 移动端适配样式
@media (max-width: 768px) {
  .recharge-dialog {
    :deep(.el-dialog) {
      width: 95% !important;
      margin: 10px auto !important;
    }

    .qrcode-image {
      width: 250px !important;
      height: 250px !important;
    }
  }
}
```

### 8. 并发充值问题

**问题原因:**
- 用户快速多次点击
- 产生多个订单

**解决方案:**

```typescript
// 使用 loading 状态防止重复点击
const handleCreateOrder = async (goods: GoodsItem): Promise<void> => {
  if (buttonLoading.value) return
  buttonLoading.value = true

  try {
    // 创建订单逻辑
  } finally {
    buttonLoading.value = false
  }
}

// 或使用防抖
import { useDebounceFn } from '@vueuse/core'

const handleCreateOrderDebounced = useDebounceFn(handleCreateOrder, 500)
```

## 依赖说明

### 组件依赖

- **AModal** - 对话框组件，提供弹窗容器
- **Icon** - 图标组件，显示支付方式图标
- **Element Plus** - UI 组件库（el-form、el-radio-group、el-button、el-image 等）

### API 依赖

- **createOrder** - 创建订单接口
- **createPayment** - 创建支付接口
- **queryOrderStatus** - 查询订单状态接口
- **refundOrder** - 退款接口（管理员）

### 工具函数依赖

- **toWithRetry** - 带重试的异步执行函数
- **showMsgSuccess** - 成功消息提示
- **showMsgWarning** - 警告消息提示
- **showConfirm** - 确认对话框
- **copy** - 复制到剪贴板

### 指令依赖

- **v-superadmin** - 超级管理员权限指令
