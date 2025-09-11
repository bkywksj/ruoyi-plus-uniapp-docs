# ARecharge 充值组件

在线充值功能组件，提供微信支付充值功能，生成二维码供用户扫码支付。支持多种充值金额选择和支付状态监控。

## 基础用法

最简单的使用方式：

```vue
<template>
  <div>
    <el-button type="primary" @click="openRecharge">充值</el-button>
    <ARecharge
      v-model="showRecharge"
      @success="handleRechargeSuccess"
    />
  </div>
</template>

<script setup>
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
}
</script>
```

## 在用户中心集成

在用户中心页面中集成充值功能：

```vue
<template>
  <div class="user-center">
    <div class="balance-card">
      <div class="balance-info">
        <span class="balance-label">当前余额</span>
        <span class="balance-amount">¥{{ userBalance }}</span>
      </div>
      <el-button type="primary" @click="showRecharge = true">
        立即充值
      </el-button>
    </div>

    <ARecharge
      v-model="showRecharge"
      @success="handleRechargeComplete"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showRecharge = ref(false)
const userBalance = ref('0.00')

const handleRechargeComplete = () => {
  // 充值成功后刷新余额
  getUserBalance()
  ElMessage.success('充值成功，余额已更新！')
}

const getUserBalance = async () => {
  // 获取最新余额的API调用
  // const [err, data] = await getUserBalanceApi()
  // if (!err) {
  //   userBalance.value = data.balance
  // }
}
</script>

<style scoped>
.balance-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 20px;
}

.balance-info {
  display: flex;
  flex-direction: column;
}

.balance-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.balance-amount {
  font-size: 28px;
  font-weight: bold;
}
</style>
```

## 监听对话框状态变化

监听充值对话框的开启和关闭：

```vue
<template>
  <ARecharge
    v-model="dialogVisible"
    @success="handleSuccess"
    @update:model-value="handleDialogChange"
  />
</template>

<script setup>
const dialogVisible = ref(false)

// 监听对话框开关状态
const handleDialogChange = (visible) => {
  if (visible) {
    console.log('充值对话框已打开')
    // 可以在这里做一些初始化操作
  } else {
    console.log('充值对话框已关闭')
    // 可以在这里做一些清理操作
  }
}

const handleSuccess = () => {
  console.log('充值成功')
}
</script>
```

## 与支付流程集成

完整的支付流程示例：

```vue
<template>
  <div class="payment-flow">
    <!-- 购买商品页面 -->
    <div v-if="!needRecharge" class="product-purchase">
      <div class="product-info">
        <h3>{{ product.name }}</h3>
        <p class="price">价格：¥{{ product.price }}</p>
        <p class="balance">余额：¥{{ userBalance }}</p>
      </div>
      <el-button 
        type="primary" 
        :disabled="userBalance < product.price"
        @click="handlePurchase"
      >
        {{ userBalance >= product.price ? '立即购买' : '余额不足' }}
      </el-button>
      <el-button 
        v-if="userBalance < product.price" 
        type="success" 
        @click="showRecharge = true"
      >
        去充值
      </el-button>
    </div>

    <!-- 充值组件 -->
    <ARecharge
      v-model="showRecharge"
      @success="handleRechargeSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showRecharge = ref(false)
const userBalance = ref(50.00)
const product = ref({
  name: 'VIP会员',
  price: 99.00
})

const needRecharge = computed(() => userBalance.value < product.value.price)

const handlePurchase = () => {
  if (userBalance.value >= product.value.price) {
    // 执行购买逻辑
    console.log('购买成功')
  }
}

const handleRechargeSuccess = () => {
  // 充值成功后刷新余额
  getUserBalance()
  ElMessage.success('充值成功，可以继续购买了！')
}

const getUserBalance = async () => {
  // 模拟获取余额
  // userBalance.value = newBalance
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| model-value | 控制对话框是否显示 | `boolean` | — | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 对话框显示状态变化 | `(visible: boolean)` |
| success | 充值成功 | `()` |

### 商品接口

```typescript
interface GoodsItem {
  /** 商品ID */
  id: number | string
  /** 商品价格 */
  price: string
  /** 商品名称 */
  name?: string
}
```

## 功能特性

### 充值金额选择
- **预设金额**：提供多个预设充值金额选项
- **单选模式**：同时只能选择一个充值金额
- **动态更新**：选择金额后实时更新支付二维码

### 支付流程
- **微信支付**：集成微信扫码支付
- **二维码生成**：自动生成支付二维码
- **支付监控**：实时监控支付状态
- **结果反馈**：支付成功后自动通知

### 用户体验
- **支付指引**：清晰的支付流程指引
- **重新获取**：支付二维码过期时可重新获取
- **问题处理**：提供支付问题的联系方式
- **状态提示**：实时显示支付状态

## 充值流程

1. **选择金额**：用户选择充值金额
2. **创建订单**：系统创建充值订单
3. **生成支付**：调用微信支付API生成二维码
4. **扫码支付**：用户使用微信扫码支付
5. **确认支付**：用户点击"我已完成支付"
6. **查询状态**：系统查询订单支付状态
7. **充值完成**：支付成功后更新用户余额

## 支付安全

### 订单验证
- **订单唯一性**：每个订单都有唯一编号
- **金额校验**：严格校验支付金额
- **状态追踪**：完整的订单状态流转

### 支付验证
- **微信官方**：使用微信官方支付接口
- **实时查询**：支付状态实时查询验证
- **重复防护**：防止重复支付和恶意操作

## 错误处理

### 常见错误场景
- **网络异常**：网络连接失败时的提示和重试
- **支付失败**：支付过程中的各种异常处理
- **订单异常**：订单创建失败的处理
- **二维码失效**：二维码过期时的重新生成

### 用户支持
- **问题反馈**：提供客服联系方式
- **操作指引**：详细的支付操作说明
- **FAQ**：常见问题解答

## 定制化配置

### 充值金额配置
```javascript
// 可以在组件内部修改 goodsList
const goodsList = ref([
  { id: 1, name: '10元', price: '10.00' },
  { id: 2, name: '50元', price: '50.00' },
  { id: 3, name: '100元', price: '100.00' },
  { id: 4, name: '500元', price: '500.00' }
])
```

### 支付方式扩展
- **支付宝**：可扩展支付宝支付
- **银联**：可扩展银联支付
- **其他方式**：可根据需要集成其他支付方式
