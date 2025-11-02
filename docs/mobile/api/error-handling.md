# 错误处理

## 介绍

RuoYi-Plus-UniApp 移动端提供了一套完整且强大的异步错误处理工具集,核心是 `to` 系列函数。这些工具函数将 Promise 和可能抛出异常的代码转换为 `[error, data]` 格式,避免使用传统的 try-catch,让代码更加简洁、可读和易于维护。

**核心特性:**

- **统一的错误处理模式** - 将所有异步操作转换为统一的 `[error, data]` 格式,避免 try-catch 的嵌套地狱
- **类型安全** - 完整的 TypeScript 类型定义,提供智能提示和编译时类型检查
- **零学习成本** - API 设计简洁直观,符合 JavaScript/TypeScript 开发者的使用习惯
- **功能丰富** - 提供 9 个专用工具函数,覆盖基础异常处理、表单验证、批量请求、超时控制、重试机制等多个场景
- **移动端优化** - 针对移动端网络不稳定、用户操作频繁等特点进行优化
- **表单验证支持** - 专门支持 WD UI 等移动端 UI 库的表单验证
- **条件执行** - 支持根据条件决定是否执行异步操作,避免不必要的网络请求
- **串行并行控制** - 支持串行和并行执行多个异步操作,灵活控制执行顺序
- **默认值支持** - 支持失败时使用默认值,提高应用的容错能力

参考: src/utils/to.ts:1-297

## 工具函数列表

### 1. to - 基础异步异常处理

**函数说明:**

将任何 Promise 转换为 `[error, data]` 格式,避免使用 try-catch。这是最常用的函数,99% 的异步错误处理场景都会用到。

**函数签名:**

```typescript
function to<T>(promise: Promise<T>): Promise<[Error | null, T | null]>
```

**参数说明:**
- `promise` (Promise<T>, 必填) - 要执行的 Promise 对象

**返回值:**
- `Promise<[Error | null, T | null]>` - 包含错误和数据的元组
  - 成功时: `[null, data]`
  - 失败时: `[error, null]`

参考: src/utils/to.ts:40-80

**完整使用示例:**

```vue
<template>
  <view class="user-profile">
    <view v-if="loading" class="loading">
      <wd-loading />
    </view>

    <view v-else-if="error" class="error">
      <wd-icon name="error" size="80rpx" color="#ff4d4f" />
      <text class="error-message">{{ error }}</text>
      <wd-button type="primary" @click="loadUserInfo">
        重新加载
      </wd-button>
    </view>

    <view v-else-if="userInfo" class="user-info">
      <image :src="userInfo.avatar" class="avatar" />
      <text class="nickname">{{ userInfo.nickName }}</text>
      <text class="email">{{ userInfo.email }}</text>

      <wd-button type="primary" block @click="handleUpdateProfile">
        编辑资料
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getUserInfo, updateUserProfile } from '@/api/system/core/user/userApi'
import type { SysUserVo, SysUserProfileBo } from '@/api/system/core/user/userTypes'
import { to } from '@/utils/to'

// 用户信息
const userInfo = ref<SysUserVo | null>(null)

// 加载状态
const loading = ref(false)

// 错误信息
const error = ref('')

// 加载用户信息
const loadUserInfo = async () => {
  loading.value = true
  error.value = ''

  // 使用 to 函数处理异步错误
  const [err, data] = await to(getUserInfo())

  loading.value = false

  if (err) {
    // 错误处理
    error.value = err.message || '获取用户信息失败'
    console.error('获取用户信息失败:', err)

    // 显示错误提示
    uni.showToast({
      title: error.value,
      icon: 'none',
    })
    return
  }

  // 成功处理
  userInfo.value = data
}

// 更新用户资料
const handleUpdateProfile = async () => {
  if (!userInfo.value) {
    return
  }

  // 构建更新数据
  const profileData: SysUserProfileBo = {
    nickName: '新昵称',
    email: 'new@example.com',
    phonenumber: '13800138000',
  }

  // 使用 to 函数处理更新操作
  const [err] = await to(updateUserProfile(profileData))

  if (err) {
    uni.showToast({
      title: err.message || '更新失败',
      icon: 'none',
    })
    return
  }

  uni.showToast({
    title: '更新成功',
    icon: 'success',
  })

  // 重新加载用户信息
  loadUserInfo()
}

// 组件挂载时加载用户信息
onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.user-profile {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400rpx;
  }

  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400rpx;

    .error-message {
      margin: 24rpx 0;
      font-size: 28rpx;
      color: #666;
    }
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48rpx 32rpx;
    background: #fff;
    border-radius: 12rpx;

    .avatar {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      margin-bottom: 24rpx;
    }

    .nickname {
      font-size: 36rpx;
      font-weight: 600;
      margin-bottom: 12rpx;
    }

    .email {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 48rpx;
    }
  }
}
</style>
```

**使用说明:**
- `to` 函数总是返回一个元组 `[error, data]`,成功时 error 为 null,失败时 data 为 null
- 使用数组解构获取错误和数据: `const [err, data] = await to(promise)`
- 优先判断错误,如果有错误则提前 return,避免后续代码执行
- 错误对象是 Error 实例,可以通过 `err.message` 获取错误信息
- 相比 try-catch,代码更加简洁,逻辑更加清晰

参考: src/utils/to.ts:40-80

### 2. toValidate - 表单验证专用

**函数说明:**

专门处理 WD UI 表单验证,将对象响应转换为数组格式。在表单密集的移动端应用中使用频率很高。该函数会自动调用表单的 validate 方法,并将验证结果转换为统一的 `[error, isValid]` 格式。

**函数签名:**

```typescript
function toValidate(formRef: Ref<any>): Promise<[Error | null, boolean]>
```

**参数说明:**
- `formRef` (Ref<any>, 必填) - 表单引用对象,通常是 wd-form 组件的 ref

**返回值:**
- `Promise<[Error | null, boolean]>` - 验证结果元组
  - 成功且通过验证: `[null, true]`
  - 成功但验证失败: `[Error, false]` - error.message 包含验证错误信息
  - 表单引用不存在: `[Error, false]` - error.message 为 '表单引用不存在'

参考: src/utils/to.ts:82-151

**完整使用示例:**

```vue
<template>
  <view class="login-page">
    <view class="login-form">
      <wd-form ref="formRef" :model="formData" :rules="rules">
        <wd-form-item label="手机号" prop="phone">
          <wd-input
            v-model="formData.phone"
            type="number"
            placeholder="请输入手机号"
            :maxlength="11"
          />
        </wd-form-item>

        <wd-form-item label="密码" prop="password">
          <wd-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </wd-form-item>

        <wd-form-item label="验证码" prop="code">
          <view class="code-input">
            <wd-input
              v-model="formData.code"
              type="number"
              placeholder="请输入验证码"
              :maxlength="6"
            />
            <wd-button
              size="small"
              :disabled="countdown > 0"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
            </wd-button>
          </view>
        </wd-form-item>
      </wd-form>

      <wd-button
        type="primary"
        block
        :loading="submitting"
        @click="handleSubmit"
      >
        登录
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { login, sendSmsCode } from '@/api/system/auth/authApi'
import { to, toValidate } from '@/utils/to'
import { isChinesePhoneNumber } from '@/utils/validators'

// 表单引用
const formRef = ref()

// 表单数据
const formData = reactive({
  phone: '',
  password: '',
  code: '',
})

// 表单验证规则
const rules = {
  phone: [
    { required: true, message: '请输入手机号' },
    {
      validator: (value: string) => isChinesePhoneNumber(value),
      message: '请输入正确的手机号',
    },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { minlength: 6, message: '密码长度不能少于6位' },
  ],
  code: [
    { required: true, message: '请输入验证码' },
    { pattern: /^\d{6}$/, message: '验证码必须为6位数字' },
  ],
}

// 提交状态
const submitting = ref(false)

// 倒计时
const countdown = ref(0)

// 发送验证码
const handleSendCode = async () => {
  // 验证手机号
  if (!formData.phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none',
    })
    return
  }

  if (!isChinesePhoneNumber(formData.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none',
    })
    return
  }

  // 发送验证码
  const [err] = await to(sendSmsCode(formData.phone))

  if (err) {
    uni.showToast({
      title: err.message || '发送失败',
      icon: 'none',
    })
    return
  }

  uni.showToast({
    title: '验证码已发送',
    icon: 'success',
  })

  // 开始倒计时
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 提交表单
const handleSubmit = async () => {
  // 使用 toValidate 验证表单
  const [err, isValid] = await toValidate(formRef)

  if (err || !isValid) {
    // 验证失败,错误信息已经由 WD UI 自动显示
    // 也可以手动显示错误提示
    if (err) {
      uni.showToast({
        title: err.message,
        icon: 'none',
      })
    }
    return
  }

  // 验证通过,提交登录
  submitting.value = true

  const [loginErr, loginData] = await to(
    login({
      phone: formData.phone,
      password: formData.password,
      code: formData.code,
    }),
  )

  submitting.value = false

  if (loginErr) {
    uni.showToast({
      title: loginErr.message || '登录失败',
      icon: 'none',
    })
    return
  }

  // 登录成功
  uni.showToast({
    title: '登录成功',
    icon: 'success',
  })

  // 跳转到首页
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/index/index',
    })
  }, 1500)
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  padding: 64rpx 32rpx;
  background: #f5f5f5;

  .login-form {
    padding: 48rpx 32rpx;
    background: #fff;
    border-radius: 12rpx;

    .code-input {
      display: flex;
      gap: 16rpx;
    }
  }
}
</style>
```

**使用说明:**
- `toValidate` 专门用于 WD UI 表单验证,自动调用表单的 validate 方法
- 验证失败时,error.message 包含所有验证错误信息,用逗号分隔
- 配合 WD UI 的表单验证规则,可以实现复杂的表单验证逻辑
- 返回的 isValid 为 true 时表示验证通过,为 false 时表示验证失败
- 如果表单引用不存在,会返回 `[Error, false]`,error.message 为 '表单引用不存在'

参考: src/utils/to.ts:82-151

### 3. toIf - 条件执行

**函数说明:**

只有满足条件时才执行 Promise,否则直接返回 `[null, null]`。支持传入原始 Promise 和已用 to() 包装的 Promise。用于移动端特定场景的条件性操作,避免不必要的网络请求。

**函数签名:**

```typescript
function toIf<T>(
  condition: boolean,
  promise: Promise<T> | Promise<[Error | null, T | null]>
): Promise<[Error | null, T | null]>
```

**参数说明:**
- `condition` (boolean, 必填) - 执行条件,为 true 时执行 promise
- `promise` (Promise<T> | Promise<[Error | null, T | null]>, 必填) - 要执行的 Promise,支持原始 Promise 和 to() 包装的 Promise

**返回值:**
- `Promise<[Error | null, T | null]>` - 包含错误和数据的元组
  - 条件为 true 且成功: `[null, data]`
  - 条件为 true 但失败: `[error, null]`
  - 条件为 false: `[null, null]`

参考: src/utils/to.ts:153-214

**完整使用示例:**

```vue
<template>
  <view class="sync-page">
    <view class="network-status">
      <wd-icon
        :name="isOnline ? 'wifi' : 'wifi-off'"
        :color="isOnline ? '#07c160' : '#999'"
        size="48rpx"
      />
      <text :class="['status-text', { offline: !isOnline }]">
        {{ isOnline ? '网络正常' : '离线状态' }}
      </text>
    </view>

    <view class="sync-info">
      <text class="label">待同步数据:</text>
      <text class="value">{{ pendingData.length }} 条</text>
    </view>

    <view class="sync-actions">
      <wd-button
        type="primary"
        block
        :loading="syncing"
        :disabled="!isOnline || pendingData.length === 0"
        @click="handleSync"
      >
        {{ syncing ? '同步中...' : '同步到云端' }}
      </wd-button>

      <wd-button type="default" block @click="handleAddData">
        添加测试数据
      </wd-button>
    </view>

    <view v-if="syncResult" class="sync-result">
      <text class="result-text">{{ syncResult }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { syncDataToCloud, loadLocalData } from '@/api/common/sync'
import { to, toIf } from '@/utils/to'

// 网络状态
const isOnline = ref(true)

// 待同步数据
const pendingData = ref<any[]>([])

// 同步状态
const syncing = ref(false)

// 同步结果
const syncResult = ref('')

// 监听网络状态
const watchNetworkStatus = () => {
  uni.onNetworkStatusChange((res) => {
    isOnline.value = res.isConnected

    if (res.isConnected) {
      uni.showToast({
        title: '网络已连接',
        icon: 'success',
      })
    } else {
      uni.showToast({
        title: '网络已断开',
        icon: 'none',
      })
    }
  })

  // 获取初始网络状态
  uni.getNetworkType({
    success: (res) => {
      isOnline.value = res.networkType !== 'none'
    },
  })
}

// 加载本地待同步数据
const loadPendingData = async () => {
  const [err, data] = await to(loadLocalData())

  if (err) {
    console.error('加载本地数据失败:', err)
    return
  }

  pendingData.value = data || []
}

// 同步数据到云端
const handleSync = async () => {
  if (!isOnline.value) {
    uni.showToast({
      title: '请检查网络连接',
      icon: 'none',
    })
    return
  }

  if (pendingData.value.length === 0) {
    uni.showToast({
      title: '没有待同步的数据',
      icon: 'none',
    })
    return
  }

  syncing.value = true
  syncResult.value = ''

  // 使用 toIf 根据网络状态决定是否同步
  const [err, result] = await toIf(
    isOnline.value, // 只有在线时才执行同步
    syncDataToCloud(pendingData.value),
  )

  syncing.value = false

  if (err) {
    // 同步失败
    syncResult.value = `同步失败: ${err.message}`
    uni.showToast({
      title: '同步失败',
      icon: 'none',
    })
    return
  }

  if (result) {
    // 同步成功
    syncResult.value = `同步成功: 已同步 ${pendingData.value.length} 条数据`
    uni.showToast({
      title: '同步成功',
      icon: 'success',
    })

    // 清空待同步数据
    pendingData.value = []
  } else {
    // 条件不满足,跳过同步
    syncResult.value = '离线状态,跳过数据同步'
    uni.showToast({
      title: '离线状态,无法同步',
      icon: 'none',
    })
  }
}

// 添加测试数据
const handleAddData = () => {
  pendingData.value.push({
    id: Date.now(),
    content: '测试数据 ' + new Date().toLocaleTimeString(),
    timestamp: Date.now(),
  })

  uni.showToast({
    title: '数据已添加',
    icon: 'success',
  })
}

onMounted(() => {
  watchNetworkStatus()
  loadPendingData()
})
</script>

<style lang="scss" scoped>
.sync-page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;

  .network-status {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32rpx;
    background: #fff;
    border-radius: 12rpx;
    margin-bottom: 16rpx;

    .status-text {
      margin-left: 16rpx;
      font-size: 30rpx;
      color: #07c160;

      &.offline {
        color: #999;
      }
    }
  }

  .sync-info {
    display: flex;
    justify-content: space-between;
    padding: 32rpx;
    background: #fff;
    border-radius: 12rpx;
    margin-bottom: 16rpx;

    .label {
      font-size: 30rpx;
      color: #666;
    }

    .value {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .sync-actions {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 16rpx;
  }

  .sync-result {
    padding: 32rpx;
    background: #fff;
    border-radius: 12rpx;

    .result-text {
      font-size: 28rpx;
      color: #666;
    }
  }
}
</style>
```

**使用说明:**
- `toIf` 用于条件执行,只有条件为 true 时才执行 Promise
- 条件为 false 时直接返回 `[null, null]`,不会执行 Promise
- 支持传入原始 Promise 和已用 to() 包装的 Promise
- 适用于根据网络状态、权限状态、用户状态等条件决定是否执行操作
- 可以避免不必要的网络请求,提高应用性能

参考: src/utils/to.ts:153-214

### 4. toWithRetry - 自动重试机制

**函数说明:**

提供自动重试机制,适用于移动端网络不稳定场景。支持两种传入方式:直接传入 Promise 工厂函数或传入已经用 to() 包装的函数。

**函数签名:**

```typescript
function toWithRetry<T>(
  promiseFactory: (() => Promise<T>) | (() => Promise<[Error | null, T | null]>),
  maxRetries?: number,
  retryDelay?: number
): Promise<[Error | null, T | null]>
```

**参数说明:**
- `promiseFactory` (Function, 必填) - 返回 Promise 或 [Error | null, T | null] 的工厂函数
- `maxRetries` (number, 可选) - 最大重试次数,默认 2 次
- `retryDelay` (number, 可选) - 重试间隔时间(毫秒),默认 1000ms

**返回值:**
- `Promise<[Error | null, T | null]>` - 包含错误和数据的元组
  - 成功: `[null, data]`
  - 重试后仍失败: `[error, null]`

参考: src/utils/to.ts:216-297

**完整使用示例:**

```vue
<template>
  <view class="payment-status">
    <view class="status-icon">
      <wd-icon
        v-if="checking"
        name="loading"
        size="120rpx"
        color="#1890ff"
      />
      <wd-icon
        v-else-if="isPaid"
        name="check-circle"
        size="120rpx"
        color="#07c160"
      />
      <wd-icon
        v-else
        name="close-circle"
        size="120rpx"
        color="#ff4d4f"
      />
    </view>

    <view class="status-text">
      <text v-if="checking">正在查询支付状态...</text>
      <text v-else-if="isPaid">支付成功</text>
      <text v-else>支付失败</text>
    </view>

    <view v-if="retryInfo" class="retry-info">
      <text>{{ retryInfo }}</text>
    </view>

    <view class="actions">
      <wd-button
        v-if="!checking && !isPaid"
        type="primary"
        @click="handleRetryCheck"
      >
        重新查询
      </wd-button>
      <wd-button
        v-if="isPaid"
        type="primary"
        @click="goToOrderDetail"
      >
        查看订单
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { queryOrderStatus } from '@/api/common/mall/order/orderApi'
import type { OrderStatusVo } from '@/api/common/mall/order/orderTypes'
import { to, toWithRetry } from '@/utils/to'

interface Props {
  /** 订单号 */
  orderNo: string
}

const props = defineProps<Props>()

// 是否正在查询
const checking = ref(false)

// 是否已支付
const isPaid = ref(false)

// 重试信息
const retryInfo = ref('')

// 查询支付状态(带重试)
const checkPaymentStatus = async () => {
  checking.value = true
  retryInfo.value = ''

  // 使用 toWithRetry 自动重试查询
  const [err, status] = await toWithRetry<OrderStatusVo>(
    // Promise 工厂函数
    () => queryOrderStatus(props.orderNo),
    // 最大重试次数: 3次
    3,
    // 重试间隔: 2秒
    2000,
  )

  checking.value = false

  if (err) {
    // 重试3次后仍然失败
    retryInfo.value = `查询失败: ${err.message}`
    uni.showModal({
      title: '查询支付状态失败',
      content: '网络不稳定,已重试3次仍然失败,请稍后手动查询',
      showCancel: false,
    })
    return
  }

  if (status) {
    // 查询成功
    isPaid.value = status.isPaid

    if (status.isPaid) {
      uni.showToast({
        title: '支付成功',
        icon: 'success',
      })
    } else {
      retryInfo.value = `订单状态: ${status.orderStatusName}`
    }
  }
}

// 手动重新查询
const handleRetryCheck = () => {
  checkPaymentStatus()
}

// 跳转到订单详情
const goToOrderDetail = () => {
  uni.redirectTo({
    url: `/pages/order/detail?orderNo=${props.orderNo}`,
  })
}

onMounted(() => {
  checkPaymentStatus()
})
</script>

<style lang="scss" scoped>
.payment-status {
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
    font-size: 36rpx;
    font-weight: 600;
    margin-bottom: 24rpx;
  }

  .retry-info {
    padding: 16rpx 24rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    margin-bottom: 48rpx;

    text {
      font-size: 26rpx;
      color: #666;
    }
  }

  .actions {
    width: 100%;
  }
}
</style>
```

**使用说明:**
- `toWithRetry` 会自动重试失败的 Promise,直到成功或达到最大重试次数
- 第一个参数必须是工厂函数(返回 Promise 的函数),而不是 Promise 本身
- 重试时会在控制台输出重试日志,方便调试
- 适用于网络不稳定、服务器偶发性错误等场景
- 重试间隔可以根据实际情况调整,避免频繁请求
- 支持传入已用 to() 包装的函数,灵活性更高

参考: src/utils/to.ts:216-297

## 最佳实践

### 1. 优先使用 to 而非 try-catch

使用 to 函数可以让代码更加简洁和易读:

```typescript
// ✅ 推荐:使用 to 函数
const loadUserData = async () => {
  const [err, user] = await to(getUserInfo())
  if (err) {
    console.error('获取用户信息失败:', err.message)
    return
  }

  const [postErr, posts] = await to(getUserPosts(user.id))
  if (postErr) {
    console.error('获取用户文章失败:', postErr.message)
    return
  }

  console.log('用户信息:', user)
  console.log('用户文章:', posts)
}

// ❌ 不推荐:使用 try-catch(嵌套地狱)
const loadUserData = async () => {
  try {
    const user = await getUserInfo()

    try {
      const posts = await getUserPosts(user.id)
      console.log('用户信息:', user)
      console.log('用户文章:', posts)
    } catch (postErr) {
      console.error('获取用户文章失败:', postErr.message)
    }
  } catch (err) {
    console.error('获取用户信息失败:', err.message)
  }
}
```

### 2. 表单验证统一使用 toValidate

表单提交前必须使用 toValidate 进行验证:

```typescript
// ✅ 推荐:使用 toValidate 验证表单
const handleSubmit = async () => {
  // 验证表单
  const [err, isValid] = await toValidate(formRef)
  if (err || !isValid) {
    uni.showToast({
      title: err?.message || '请检查表单输入',
      icon: 'none',
    })
    return
  }

  // 提交数据
  const [submitErr] = await to(submitForm(formData))
  if (submitErr) {
    uni.showToast({
      title: submitErr.message || '提交失败',
      icon: 'none',
    })
    return
  }

  uni.showToast({
    title: '提交成功',
    icon: 'success',
  })
}

// ❌ 不推荐:手动验证
const handleSubmit = async () => {
  if (!formData.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!isChinesePhoneNumber(formData.phone)) {
    uni.showToast({ title: '手机号格式错误', icon: 'none' })
    return
  }
  // ... 重复的验证代码
}
```

### 3. 网络请求使用重试机制

对于重要的网络请求,建议使用 toWithRetry 添加重试机制:

```typescript
// ✅ 推荐:关键数据请求使用重试
const loadCriticalData = async () => {
  const [err, data] = await toWithRetry(
    () => fetchCriticalData(),
    3, // 重试3次
    2000, // 间隔2秒
  )

  if (err) {
    uni.showModal({
      title: '加载失败',
      content: '网络不稳定,已自动重试3次仍然失败,请稍后再试',
      showCancel: false,
    })
    return
  }

  return data
}

// ❌ 不推荐:普通请求没有重试
const loadCriticalData = async () => {
  const [err, data] = await to(fetchCriticalData())
  if (err) {
    uni.showToast({ title: '加载失败', icon: 'none' })
    return
  }
  return data
}
```

### 4. 条件请求使用 toIf

避免不必要的网络请求,根据条件执行:

```typescript
// ✅ 推荐:根据条件执行请求
const syncUserData = async () => {
  // 检查网络状态
  const [netErr, netStatus] = await to(uni.getNetworkType())
  const isOnline = !netErr && netStatus.networkType !== 'none'

  // 只有在线时才同步
  const [err, result] = await toIf(
    isOnline,
    to(uploadUserData(userData)),
  )

  if (!result) {
    console.log('离线状态,跳过数据同步')
    return
  }

  if (err) {
    console.error('数据同步失败:', err.message)
    return
  }

  console.log('数据同步成功')
}

// ❌ 不推荐:不检查条件直接请求
const syncUserData = async () => {
  const [err, result] = await to(uploadUserData(userData))
  if (err) {
    console.error('数据同步失败:', err.message)
  }
}
```

### 5. 错误信息友好提示

根据错误类型给出友好的提示信息:

```typescript
// ✅ 推荐:根据错误类型提示
const handleLogin = async () => {
  const [err, data] = await to(login(formData))

  if (err) {
    // 根据错误码给出不同提示
    const errorMessages: Record<string, string> = {
      INVALID_CREDENTIALS: '用户名或密码错误',
      ACCOUNT_LOCKED: '账号已被锁定,请联系管理员',
      NETWORK_ERROR: '网络连接失败,请检查网络设置',
      SERVER_ERROR: '服务器错误,请稍后重试',
    }

    const message = errorMessages[err.code] || err.message || '登录失败'

    uni.showModal({
      title: '登录失败',
      content: message,
      showCancel: false,
    })

    return
  }

  uni.showToast({
    title: '登录成功',
    icon: 'success',
  })
}

// ❌ 不推荐:统一的错误提示
const handleLogin = async () => {
  const [err, data] = await to(login(formData))
  if (err) {
    uni.showToast({
      title: '登录失败',
      icon: 'none',
    })
  }
}
```

## 注意事项

### 1. to 函数的返回值顺序

`to` 函数总是返回 `[error, data]` 格式,错误在前,数据在后:

```typescript
// ✅ 正确
const [err, data] = await to(promise)
if (err) {
  // 错误处理
  return
}
// 使用 data

// ❌ 错误:顺序颠倒
const [data, err] = await to(promise) // 错误!
```

参考: src/utils/to.ts:73-80

### 2. 必须检查错误

使用 to 函数后,必须检查错误,否则可能导致程序逻辑错误:

```typescript
// ✅ 正确:检查错误
const [err, user] = await to(getUserInfo())
if (err) {
  console.error('获取用户失败:', err)
  return
}
console.log('用户信息:', user)

// ❌ 错误:未检查错误
const [err, user] = await to(getUserInfo())
console.log('用户信息:', user) // user 可能为 null!
```

### 3. toWithRetry 必须传入工厂函数

`toWithRetry` 的第一个参数必须是返回 Promise 的函数,而不是 Promise 本身:

```typescript
// ✅ 正确:传入工厂函数
const [err, data] = await toWithRetry(
  () => fetchData(), // 函数
  3,
  1000,
)

// ❌ 错误:直接传入 Promise
const [err, data] = await toWithRetry(
  fetchData(), // Promise,错误!
  3,
  1000,
)
```

参考: src/utils/to.ts:256-260

### 4. toValidate 需要正确的表单引用

`toValidate` 需要传入正确的表单 ref:

```typescript
// ✅ 正确:传入表单 ref
const formRef = ref()
const [err, isValid] = await toValidate(formRef)

// ❌ 错误:传入空引用
const formRef = ref() // 未绑定到表单
const [err, isValid] = await toValidate(formRef) // 返回错误
```

参考: src/utils/to.ts:128-151

### 5. 重试次数和间隔要合理

使用 `toWithRetry` 时,重试次数和间隔要根据实际情况设置:

```typescript
// ✅ 推荐:合理的重试配置
const [err, data] = await toWithRetry(
  () => queryOrderStatus(orderNo),
  3, // 重试3次
  2000, // 间隔2秒
)

// ❌ 不推荐:过度重试
const [err, data] = await toWithRetry(
  () => queryOrderStatus(orderNo),
  100, // 重试100次,太多!
  100, // 间隔100ms,太短!
)
```

参考: src/utils/to.ts:256-297

### 6. toIf 条件应该是布尔值

`toIf` 的第一个参数必须是布尔值:

```typescript
// ✅ 正确:布尔值条件
const isOnline = true
const [err, data] = await toIf(isOnline, syncData())

// ❌ 错误:非布尔值
const networkType = 'wifi'
const [err, data] = await toIf(networkType, syncData()) // 错误!

// ✅ 正确:转换为布尔值
const [err, data] = await toIf(Boolean(networkType), syncData())
```

参考: src/utils/to.ts:193-214

### 7. 错误对象的类型

`to` 函数返回的错误是 Error 实例:

```typescript
const [err, data] = await to(promise)

if (err) {
  console.log(err.message) // ✅ 正确
  console.log(err.code) // ✅ 自定义错误码
  console.log(err.stack) // ✅ 错误堆栈
  console.log(err.toString()) // ✅ 转换为字符串
}
```

参考: src/utils/to.ts:73-80

### 8. 避免过度使用重试

并非所有请求都需要重试,应根据业务场景判断:

```typescript
// ✅ 需要重试的场景
// - 查询支付状态
// - 查询订单状态
// - 同步重要数据
// - 提交关键表单

// ❌ 不需要重试的场景
// - 用户主动取消的请求
// - 验证失败的请求(如密码错误)
// - 资源不存在的请求(404)
// - 权限不足的请求(403)

const [err, data] = await to(checkPassword(password))
if (err) {
  // 密码错误不应该重试
  uni.showToast({ title: '密码错误', icon: 'none' })
  return
}
```

---

通过合理使用这些错误处理工具函数,可以让代码更加简洁、健壮和易于维护,提升移动端应用的稳定性和用户体验。
