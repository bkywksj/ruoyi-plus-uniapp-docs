# to Promise 错误处理

## 介绍

`to` 是一套完整的 Promise 错误处理工具函数集，采用 `[error, data]` 元组模式（也称为 Go-style 错误处理）来简化异步操作的错误处理。该模式避免了繁琐的 try-catch 嵌套，让异步代码更加清晰、简洁和可读。

在移动端应用开发中，异步操作无处不在：网络请求、本地存储、表单验证、支付流程等。传统的 try-catch 处理方式容易导致代码嵌套过深、错误处理分散、类型推断困难等问题。`to` 工具函数集提供了一种优雅的解决方案。

**核心特性:**

- **元组返回** - 返回 `[error, data]` 格式，统一错误处理方式，避免 try-catch 嵌套
- **类型安全** - 完整的 TypeScript 泛型支持，保证类型推断正确
- **表单验证** - 专门为 wd-form 等移动端表单组件优化的验证函数
- **条件执行** - 支持条件判断后执行 Promise，适用于权限控制等场景
- **自动重试** - 内置重试机制，处理移动端网络不稳定导致的临时性失败
- **错误统一** - 自动将非 Error 类型的异常转换为标准 Error 对象

**工具函数概览:**

```text
┌─────────────────────────────────────────────────────────────────┐
│                    to 工具函数集架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │     to      │    │  toValidate │    │    toIf     │         │
│  │  基础函数    │    │  表单验证    │    │  条件执行    │         │
│  │  99% 场景   │    │  wd-form    │    │  权限控制    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────┐                                               │
│  │ toWithRetry │                                               │
│  │  自动重试    │                                               │
│  │  网络不稳定  │                                               │
│  └─────────────┘                                               │
│                                                                 │
│  所有函数返回统一格式: [Error | null, T | null]                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**与传统方式对比:**

```typescript
// ❌ 传统 try-catch 方式 - 嵌套深、代码冗长
async function fetchUserData(userId: string) {
  try {
    const user = await api.getUser(userId)
    try {
      const orders = await api.getUserOrders(userId)
      try {
        const payments = await api.getUserPayments(userId)
        return { user, orders, payments }
      } catch (paymentError) {
        console.error('获取支付记录失败', paymentError)
        return { user, orders, payments: [] }
      }
    } catch (orderError) {
      console.error('获取订单失败', orderError)
      return { user, orders: [], payments: [] }
    }
  } catch (userError) {
    console.error('获取用户失败', userError)
    throw userError
  }
}

// ✅ 使用 to 函数 - 扁平化、清晰易读
async function fetchUserData(userId: string) {
  const [userError, user] = await to(api.getUser(userId))
  if (userError) {
    console.error('获取用户失败', userError)
    throw userError
  }

  const [orderError, orders] = await to(api.getUserOrders(userId))
  if (orderError) {
    console.error('获取订单失败', orderError)
  }

  const [paymentError, payments] = await to(api.getUserPayments(userId))
  if (paymentError) {
    console.error('获取支付记录失败', paymentError)
  }

  return {
    user,
    orders: orders ?? [],
    payments: payments ?? [],
  }
}
```

## 设计原理

### 元组模式优势

`[error, data]` 元组模式源自 Go 语言的错误处理哲学，它有以下优势：

1. **显式错误处理** - 强制开发者考虑错误情况，不会忘记处理异常
2. **扁平化代码** - 避免 try-catch 嵌套，代码更易阅读
3. **类型推断友好** - TypeScript 能够正确推断成功和失败时的类型
4. **统一返回格式** - 所有异步操作返回相同格式，便于组合和处理

```text
┌─────────────────────────────────────────────────────────────────┐
│                      元组模式流程图                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     Promise                    to()                  Result     │
│  ┌───────────┐           ┌───────────┐          ┌───────────┐  │
│  │           │           │           │          │           │  │
│  │  成功时    │  ──────▶  │   包装    │  ──────▶  │ [null, T] │  │
│  │  返回 T   │           │   处理    │          │           │  │
│  │           │           │           │          │           │  │
│  └───────────┘           └───────────┘          └───────────┘  │
│                               │                                 │
│  ┌───────────┐               │                  ┌───────────┐  │
│  │           │               │                  │           │  │
│  │  失败时    │  ──────▶     ▼         ──────▶  │ [Error,   │  │
│  │  throw    │           捕获异常               │  null]    │  │
│  │           │                                  │           │  │
│  └───────────┘                                  └───────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 错误转换机制

所有 to 函数都会自动将非 Error 类型的异常转换为标准 Error 对象：

```typescript
// 源码实现
export const to = async <T>(promise: Promise<T>): Promise<[Error | null, T | null]> => {
  try {
    const data = await promise
    return [null, data]
  } catch (error) {
    // 关键：统一转换为 Error 类型
    return [error instanceof Error ? error : new Error(String(error)), null]
  }
}
```

这确保了：
- 字符串类型的错误会被转换：`throw 'error'` → `new Error('error')`
- 对象类型的错误会被转换：`throw { code: 500 }` → `new Error('[object Object]')`
- Error 实例保持原样：`throw new Error('...')` → 原样返回

## 基本用法

### to 函数

将 Promise 包装为 `[error, data]` 元组，这是最核心的函数，99% 的场景都会用到。

```typescript
import { to } from '@/utils/to'

// 基本用法
const fetchUser = async (id: string) => {
  const [error, user] = await to(api.getUser(id))

  if (error) {
    console.error('获取用户失败:', error.message)
    return null
  }

  return user
}
```

**使用说明:**

- 成功时：`error` 为 `null`，`data` 为 Promise 返回值
- 失败时：`error` 为 Error 对象，`data` 为 `null`
- TypeScript 会正确推断 `data` 的类型

### 替代 try-catch

```typescript
import { to } from '@/utils/to'

// ❌ 传统写法 - 需要声明变量在外部
let user: User | null = null
try {
  user = await api.getUser(id)
  console.log(user)
} catch (error) {
  console.error(error)
}
// user 的类型是 User | null，不够精确

// ✅ to 写法 - 解构赋值更清晰
const [error, user] = await to(api.getUser(id))
if (error) {
  console.error(error)
} else {
  console.log(user) // TypeScript 知道这里 user 不为 null
}
```

### 泛型指定

当需要明确返回类型时，可以指定泛型参数：

```typescript
import { to } from '@/utils/to'

interface User {
  id: string
  name: string
  avatar: string
}

// 明确泛型类型
const [error, user] = await to<User>(api.getUser(id))

if (user) {
  // TypeScript 知道 user 是 User 类型
  console.log(user.name)
  console.log(user.avatar)
}
```

### 链式调用

多个异步操作的顺序执行：

```typescript
import { to } from '@/utils/to'

const processOrder = async (orderId: string) => {
  // 步骤1: 获取订单
  const [orderError, order] = await to(api.getOrder(orderId))
  if (orderError) {
    return { success: false, message: '获取订单失败', error: orderError }
  }

  // 步骤2: 获取用户
  const [userError, user] = await to(api.getUser(order.userId))
  if (userError) {
    return { success: false, message: '获取用户失败', error: userError }
  }

  // 步骤3: 验证库存
  const [stockError, stockInfo] = await to(api.checkStock(order.items))
  if (stockError) {
    return { success: false, message: '检查库存失败', error: stockError }
  }

  if (!stockInfo.available) {
    return { success: false, message: '库存不足' }
  }

  // 步骤4: 处理支付
  const [payError, payResult] = await to(api.processPayment(order, user))
  if (payError) {
    return { success: false, message: '支付处理失败', error: payError }
  }

  // 步骤5: 更新订单状态
  const [updateError] = await to(api.updateOrderStatus(orderId, 'paid'))
  if (updateError) {
    // 支付成功但更新失败，记录日志但不影响用户
    console.error('更新订单状态失败', updateError)
  }

  return { success: true, data: payResult }
}
```

### 自定义错误处理

```typescript
import { to } from '@/utils/to'

// 带默认值的错误处理
const getUserOrDefault = async (id: string) => {
  const [error, user] = await to(api.getUser(id))

  // 错误时返回默认用户（访客模式）
  if (error) {
    console.warn('获取用户失败，使用访客模式:', error.message)
    return {
      id: '0',
      name: '访客',
      role: 'guest',
      isGuest: true,
    }
  }

  return { ...user, isGuest: false }
}

// 错误转换为业务异常
class BusinessError extends Error {
  code: string
  originalError?: Error

  constructor(message: string, code: string, originalError?: Error) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
    this.originalError = originalError
  }
}

const fetchData = async () => {
  const [error, data] = await to(api.getData())

  if (error) {
    // 转换为业务错误，保留原始错误信息
    throw new BusinessError(
      '数据加载失败，请稍后重试',
      'DATA_LOAD_ERROR',
      error
    )
  }

  return data
}
```

## 表单验证

### toValidate 函数

专门为 wd-form 等移动端表单组件设计的验证函数，将表单验证结果转换为 `[error, boolean]` 格式。

```typescript
import { toValidate } from '@/utils/to'

const formRef = ref<any>(null)

const handleSubmit = async () => {
  // 验证表单
  const [error, isValid] = await toValidate(formRef)

  if (error) {
    // error.message 包含具体的验证错误信息
    uni.showToast({
      title: error.message,
      icon: 'none',
    })
    return
  }

  if (!isValid) {
    return
  }

  // 验证通过，提交表单
  const [submitError] = await to(api.submitForm(formData.value))
  if (submitError) {
    uni.showToast({
      title: '提交失败: ' + submitError.message,
      icon: 'none',
    })
    return
  }

  uni.showToast({ title: '提交成功' })
  uni.navigateBack()
}
```

**toValidate 源码实现:**

```typescript
export const toValidate = async (formRef: Ref<any>): Promise<[Error | null, boolean]> => {
  if (!formRef || !formRef.value) {
    return [new Error('表单引用不存在'), false]
  }

  try {
    // 调用 wd-form 的 validate 方法
    // 返回格式: { valid: boolean, errors: ErrorMessage[] }
    const result = await formRef.value.validate()

    if (!result.valid && result.errors?.length > 0) {
      // 提取所有错误信息，合并为一个字符串
      const errorMessage = result.errors
        .map((error: any) => error.message)
        .filter(Boolean)
        .join(', ')

      return [new Error(errorMessage || '表单验证失败'), false]
    }

    return [null, result.valid]
  } catch (error) {
    return [error instanceof Error ? error : new Error('表单验证异常'), false]
  }
}
```

### 完整表单示例

```vue
<template>
  <view class="form-page">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-cell-group>
        <wd-input
          v-model="formData.username"
          label="用户名"
          prop="username"
          placeholder="请输入用户名"
        />
        <wd-input
          v-model="formData.phone"
          label="手机号"
          prop="phone"
          placeholder="请输入手机号"
        />
        <wd-input
          v-model="formData.email"
          label="邮箱"
          prop="email"
          placeholder="请输入邮箱"
        />
      </wd-cell-group>
    </wd-form>

    <view class="actions">
      <wd-button type="primary" block :loading="loading" @click="handleSubmit">
        提交
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { to, toValidate } from '@/utils/to'

const formRef = ref<any>(null)
const loading = ref(false)

const formData = reactive({
  username: '',
  phone: '',
  email: '',
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度在 3-20 个字符' },
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '邮箱格式不正确' },
  ],
}

const handleSubmit = async () => {
  // 1. 验证表单
  const [validError, isValid] = await toValidate(formRef)

  if (validError) {
    uni.showToast({
      title: validError.message,
      icon: 'none',
      duration: 2000,
    })
    return
  }

  if (!isValid) {
    return
  }

  // 2. 提交数据
  loading.value = true

  const [submitError, result] = await to(api.register(formData))

  loading.value = false

  if (submitError) {
    uni.showModal({
      title: '注册失败',
      content: submitError.message || '请稍后重试',
      showCancel: false,
    })
    return
  }

  // 3. 处理成功
  uni.showToast({ title: '注册成功' })

  // 延迟跳转，让用户看到成功提示
  setTimeout(() => {
    uni.redirectTo({ url: '/pages/login/index' })
  }, 1500)
}
</script>

<style lang="scss" scoped>
.form-page {
  padding: 32rpx;
}

.actions {
  margin-top: 48rpx;
  padding: 0 32rpx;
}
</style>
```

### 多表单验证

当页面有多个表单需要同时验证时：

```typescript
import { to, toValidate } from '@/utils/to'

const userFormRef = ref<any>(null)
const addressFormRef = ref<any>(null)
const paymentFormRef = ref<any>(null)

const validateAllForms = async () => {
  // 并行验证所有表单
  const results = await Promise.all([
    toValidate(userFormRef),
    toValidate(addressFormRef),
    toValidate(paymentFormRef),
  ])

  // 检查是否有任何错误
  const errors = results
    .filter(([error]) => error)
    .map(([error]) => error!.message)

  if (errors.length > 0) {
    uni.showModal({
      title: '请检查表单',
      content: errors.join('\n'),
      showCancel: false,
    })
    return false
  }

  // 检查是否全部验证通过
  const allValid = results.every(([, isValid]) => isValid)
  return allValid
}

const handleCheckout = async () => {
  const isAllValid = await validateAllForms()

  if (!isAllValid) {
    return
  }

  // 所有表单验证通过，继续结算流程
  const [error, result] = await to(api.checkout({
    user: userFormData.value,
    address: addressFormData.value,
    payment: paymentFormData.value,
  }))

  if (error) {
    uni.showToast({ title: '结算失败', icon: 'none' })
    return
  }

  uni.navigateTo({ url: `/pages/order/success?orderId=${result.orderId}` })
}
```

## 条件执行

### toIf 函数

根据条件决定是否执行 Promise，条件不满足时直接返回 `[null, null]`。适用于权限控制、网络状态检查等场景。

```typescript
import { toIf } from '@/utils/to'

// 条件为真时执行
const maybeRefresh = async (shouldRefresh: boolean) => {
  const [error, data] = await toIf(
    shouldRefresh,
    api.refreshData()  // 只有 shouldRefresh 为 true 时才会执行
  )

  if (error) {
    console.error('刷新失败:', error)
    return null
  }

  // shouldRefresh 为 false 时，data 为 null
  return data
}
```

**toIf 源码实现:**

```typescript
export const toIf = async <T>(
  condition: boolean,
  promise: Promise<T> | Promise<[Error | null, T | null]>,
): Promise<[Error | null, T | null]> => {
  // 条件不满足，直接返回
  if (!condition) {
    return [null, null]
  }

  try {
    const result = await promise

    // 检查是否已经是 to() 格式 [Error | null, T | null]
    if (Array.isArray(result) && result.length === 2) {
      return result as [Error | null, T | null]
    }

    // 原始数据，包装为 to() 格式
    return [null, result as T]
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null]
  }
}
```

### 缓存与刷新策略

```typescript
import { toIf } from '@/utils/to'

const loadData = async (forceRefresh = false) => {
  // 检查缓存
  const cached = uni.getStorageSync('data_cache')
  const cacheTime = uni.getStorageSync('data_cache_time')
  const isExpired = !cacheTime || Date.now() - cacheTime > 5 * 60 * 1000 // 5分钟过期

  // 有有效缓存且不强制刷新时，不调用 API
  const shouldFetch = !cached || isExpired || forceRefresh

  const [error, freshData] = await toIf(
    shouldFetch,
    api.getData()
  )

  if (error) {
    console.warn('获取数据失败，使用缓存:', error.message)
    return cached // 降级使用缓存
  }

  if (freshData) {
    // 更新缓存
    uni.setStorageSync('data_cache', freshData)
    uni.setStorageSync('data_cache_time', Date.now())
    return freshData
  }

  return cached
}
```

### 权限控制

```typescript
import { toIf } from '@/utils/to'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 根据权限加载敏感数据
const loadSensitiveData = async (userId: string) => {
  const hasPermission = userStore.hasPermission('read:sensitive')

  const [error, sensitiveData] = await toIf(
    hasPermission,
    api.getSensitiveData(userId)
  )

  if (error) {
    console.error('加载敏感数据失败:', error.message)
    return null
  }

  if (sensitiveData) {
    return sensitiveData
  }

  // 没有权限，返回脱敏数据
  console.log('权限不足，返回脱敏数据')
  return await api.getPublicData(userId)
}

// 根据网络状态同步数据
const syncData = async (localData: any) => {
  // 检查网络状态
  const networkInfo = await uni.getNetworkType()
  const isOnline = networkInfo.networkType !== 'none'

  const [error, syncResult] = await toIf(
    isOnline,
    api.syncToCloud(localData)
  )

  if (error) {
    // 同步失败，标记待同步
    uni.setStorageSync('pending_sync', localData)
    return { synced: false, reason: 'error' }
  }

  if (syncResult) {
    // 同步成功，清除待同步标记
    uni.removeStorageSync('pending_sync')
    return { synced: true, result: syncResult }
  }

  // 离线状态，标记待同步
  uni.setStorageSync('pending_sync', localData)
  return { synced: false, reason: 'offline' }
}
```

### 带验证的执行

```typescript
import { toIf } from '@/utils/to'

// 验证通过后执行
const submitForm = async (form: FormData) => {
  const isValid = validateForm(form)

  const [error, result] = await toIf(isValid, api.submit(form))

  if (!isValid) {
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return { success: false, reason: 'validation' }
  }

  if (error) {
    uni.showToast({ title: '提交失败', icon: 'none' })
    return { success: false, reason: 'api_error', error }
  }

  uni.showToast({ title: '提交成功' })
  return { success: true, data: result }
}

// 会员专属功能
const accessPremiumFeature = async (featureId: string) => {
  const userStore = useUserStore()
  const isPremium = userStore.userInfo?.vipLevel > 0

  const [error, featureData] = await toIf(
    isPremium,
    api.getPremiumFeature(featureId)
  )

  if (!isPremium) {
    // 引导升级
    uni.showModal({
      title: '会员专属',
      content: '该功能仅对会员开放，是否立即升级？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/vip/upgrade' })
        }
      },
    })
    return null
  }

  if (error) {
    uni.showToast({ title: '功能加载失败', icon: 'none' })
    return null
  }

  return featureData
}
```

## 自动重试

### toWithRetry 函数

失败时自动重试，适用于移动端网络不稳定的场景。支持自定义重试次数和重试间隔。

```typescript
import { toWithRetry } from '@/utils/to'

// 默认重试 2 次，间隔 1 秒
const fetchWithRetry = async () => {
  const [error, data] = await toWithRetry(() => api.getData())

  if (error) {
    console.error('重试后仍然失败:', error)
    return null
  }

  return data
}

// 自定义重试次数和间隔
const [error, data] = await toWithRetry(
  () => api.getData(),
  5,    // 重试 5 次
  2000  // 间隔 2 秒
)
```

**toWithRetry 源码实现:**

```typescript
export const toWithRetry = async <T>(
  promiseFactory: (() => Promise<T>) | (() => Promise<[Error | null, T | null]>),
  maxRetries: number = 2,
  retryDelay: number = 1000
): Promise<[Error | null, T | null]> => {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await promiseFactory()

      // 检查返回值是否是 to() 包装后的格式
      if (Array.isArray(result) && result.length === 2) {
        const [error, data] = result as [Error | null, T | null]
        if (!error) {
          if (attempt > 0) {
            console.log(`操作在第 ${attempt + 1} 次尝试时成功`)
          }
          return [null, data]
        }
        lastError = error
      } else {
        // 直接返回的数据，表示成功
        if (attempt > 0) {
          console.log(`操作在第 ${attempt + 1} 次尝试时成功`)
        }
        return [null, result as T]
      }
    } catch (error) {
      lastError = error as Error
    }

    // 如果不是最后一次尝试，等待后重试
    if (attempt < maxRetries) {
      console.warn(`第 ${attempt + 1} 次尝试失败，${retryDelay}ms 后重试:`, lastError.message)
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
    }
  }

  return [lastError, null]
}
```

### 文件上传重试

```typescript
import { toWithRetry } from '@/utils/to'

const uploadFile = async (file: File) => {
  // 显示上传进度
  uni.showLoading({ title: '上传中...' })

  const [error, result] = await toWithRetry(
    () => api.uploadFile(file),
    3,    // 重试 3 次
    2000  // 间隔 2 秒
  )

  uni.hideLoading()

  if (error) {
    uni.showModal({
      title: '上传失败',
      content: '网络不稳定，请检查网络后重试',
      showCancel: false,
    })
    return null
  }

  uni.showToast({ title: '上传成功' })
  return result
}

// 批量上传，每个文件独立重试
const uploadFiles = async (files: File[]) => {
  const results = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    uni.showLoading({ title: `上传中 (${i + 1}/${files.length})` })

    const [error, result] = await toWithRetry(
      () => api.uploadFile(file),
      3,
      1000
    )

    if (error) {
      results.push({
        file: file.name,
        success: false,
        error: error.message,
      })
    } else {
      results.push({
        file: file.name,
        success: true,
        url: result.url,
      })
    }
  }

  uni.hideLoading()

  // 统计结果
  const successCount = results.filter((r) => r.success).length
  const failCount = results.length - successCount

  uni.showToast({
    title: `上传完成: ${successCount}成功, ${failCount}失败`,
    icon: 'none',
    duration: 3000,
  })

  return results
}
```

### 支付状态轮询

```typescript
import { toWithRetry } from '@/utils/to'

// 支付后轮询查询支付结果
const checkPaymentStatus = async (orderId: string) => {
  uni.showLoading({ title: '查询支付结果...' })

  const [error, status] = await toWithRetry(
    async () => {
      const res = await api.getPaymentStatus(orderId)

      // 如果状态是 pending，抛出错误触发重试
      if (res.status === 'pending') {
        throw new Error('支付处理中')
      }

      return res
    },
    10,   // 最多查询 10 次
    3000  // 每 3 秒查询一次
  )

  uni.hideLoading()

  if (error) {
    // 超时或查询失败
    uni.showModal({
      title: '支付结果查询超时',
      content: '请稍后在订单列表中查看支付结果',
      showCancel: false,
      success: () => {
        uni.redirectTo({ url: '/pages/order/list' })
      },
    })
    return null
  }

  if (status.status === 'success') {
    uni.showToast({ title: '支付成功' })
    uni.redirectTo({ url: `/pages/order/success?orderId=${orderId}` })
  } else if (status.status === 'failed') {
    uni.showModal({
      title: '支付失败',
      content: status.message || '请重新发起支付',
      showCancel: false,
    })
  }

  return status
}
```

### 网络请求自动重试

```typescript
import { toWithRetry } from '@/utils/to'

// 封装带重试的请求函数
const requestWithRetry = async <T>(
  requestFn: () => Promise<T>,
  options: {
    retries?: number
    delay?: number
    showLoading?: boolean
    loadingText?: string
  } = {}
) => {
  const {
    retries = 3,
    delay = 1000,
    showLoading = false,
    loadingText = '加载中...',
  } = options

  if (showLoading) {
    uni.showLoading({ title: loadingText })
  }

  const [error, data] = await toWithRetry(requestFn, retries, delay)

  if (showLoading) {
    uni.hideLoading()
  }

  return [error, data] as const
}

// 使用示例
const loadUserData = async () => {
  const [error, user] = await requestWithRetry(
    () => api.getUserInfo(),
    {
      retries: 3,
      delay: 2000,
      showLoading: true,
      loadingText: '加载用户信息...',
    }
  )

  if (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
    return null
  }

  return user
}
```

## 实际应用场景

### 表单提交流程

```typescript
import { to, toValidate } from '@/utils/to'

const handleSubmit = async () => {
  // 1. 表单验证
  const [validError, isValid] = await toValidate(formRef)
  if (validError || !isValid) {
    uni.showToast({
      title: validError?.message || '请填写完整',
      icon: 'none',
    })
    return
  }

  // 2. 显示加载状态
  loading.value = true

  // 3. 提交数据
  const [submitError, result] = await to(api.submitForm(formData.value))

  // 4. 隐藏加载状态
  loading.value = false

  // 5. 处理结果
  if (submitError) {
    uni.showModal({
      title: '提交失败',
      content: submitError.message || '请稍后重试',
      showCancel: false,
    })
    return
  }

  // 6. 成功处理
  uni.showToast({ title: '提交成功' })
  uni.navigateBack()
}
```

### 登录流程

```typescript
import { to, toWithRetry } from '@/utils/to'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const handleLogin = async () => {
  // 1. 获取验证码
  const [captchaError, captcha] = await to(api.getCaptcha())
  if (captchaError) {
    uni.showToast({ title: '获取验证码失败', icon: 'none' })
    refreshCaptcha() // 刷新验证码
    return
  }

  // 更新验证码 UUID
  captchaUuid.value = captcha.uuid

  // 2. 登录请求（带重试，处理网络波动）
  loading.value = true

  const [loginError, loginResult] = await toWithRetry(
    () => api.login({
      username: form.username,
      password: form.password,
      captcha: form.captcha,
      uuid: captchaUuid.value,
    }),
    2, // 失败重试 2 次
    1500
  )

  if (loginError) {
    loading.value = false
    refreshCaptcha() // 登录失败刷新验证码
    uni.showToast({
      title: loginError.message || '登录失败',
      icon: 'none',
    })
    return
  }

  // 3. 保存 Token
  userStore.setToken(loginResult.token)

  // 4. 获取用户信息
  const [userError, userInfo] = await to(api.getUserInfo())
  if (userError) {
    console.warn('获取用户信息失败，使用基础信息')
    // 使用 token 中的基础信息
    userStore.setUserInfo({ username: form.username })
  } else {
    userStore.setUserInfo(userInfo)
  }

  // 5. 获取菜单权限（可选）
  const [menuError, menus] = await to(api.getUserMenus())
  if (!menuError && menus) {
    userStore.setMenus(menus)
  }

  loading.value = false

  // 6. 跳转首页
  uni.switchTab({ url: '/pages/index/index' })
}
```

### 并行请求

```typescript
import { to } from '@/utils/to'

const loadPageData = async () => {
  loading.value = true

  // 并行发起多个请求
  const [
    [userError, user],
    [ordersError, orders],
    [messagesError, messages],
    [noticesError, notices],
  ] = await Promise.all([
    to(api.getUserInfo()),
    to(api.getOrders({ page: 1, pageSize: 5 })),
    to(api.getMessages({ unread: true })),
    to(api.getNotices()),
  ])

  loading.value = false

  // 分别处理每个请求的结果
  if (!userError) {
    userData.value = user
  } else {
    console.warn('获取用户信息失败:', userError.message)
  }

  if (!ordersError) {
    orderList.value = orders.list
    orderTotal.value = orders.total
  } else {
    console.warn('获取订单失败:', ordersError.message)
  }

  if (!messagesError) {
    messageList.value = messages
    unreadCount.value = messages.length
  } else {
    console.warn('获取消息失败:', messagesError.message)
  }

  if (!noticesError) {
    noticeList.value = notices
  } else {
    console.warn('获取公告失败:', noticesError.message)
  }

  // 全部失败时显示错误提示
  if (userError && ordersError && messagesError && noticesError) {
    uni.showModal({
      title: '加载失败',
      content: '网络连接异常，请检查网络后重试',
      confirmText: '重试',
      success: (res) => {
        if (res.confirm) {
          loadPageData()
        }
      },
    })
  }
}
```

### 购物车结算

```typescript
import { to, toValidate } from '@/utils/to'

const handleCheckout = async () => {
  // 1. 验证购物车
  if (cartItems.value.length === 0) {
    uni.showToast({ title: '购物车是空的', icon: 'none' })
    return
  }

  // 2. 验证地址表单
  const [addressError, addressValid] = await toValidate(addressFormRef)
  if (addressError || !addressValid) {
    uni.showToast({ title: '请完善收货地址', icon: 'none' })
    return
  }

  // 3. 创建订单
  loading.value = true

  const [orderError, order] = await to(
    api.createOrder({
      items: cartItems.value,
      address: addressData.value,
      remark: remark.value,
    })
  )

  if (orderError) {
    loading.value = false
    uni.showToast({ title: '创建订单失败', icon: 'none' })
    return
  }

  // 4. 发起支付
  const [payError, payParams] = await to(api.getPayParams(order.orderId))

  if (payError) {
    loading.value = false
    // 订单已创建，跳转到订单详情
    uni.redirectTo({ url: `/pages/order/detail?id=${order.orderId}` })
    return
  }

  // 5. 调用支付
  const [wxPayError] = await to(
    new Promise((resolve, reject) => {
      uni.requestPayment({
        ...payParams,
        success: resolve,
        fail: reject,
      })
    })
  )

  loading.value = false

  if (wxPayError) {
    // 用户取消或支付失败
    if (wxPayError.message.includes('cancel')) {
      uni.showToast({ title: '已取消支付', icon: 'none' })
    } else {
      uni.showToast({ title: '支付失败', icon: 'none' })
    }
    uni.redirectTo({ url: `/pages/order/detail?id=${order.orderId}` })
    return
  }

  // 6. 支付成功
  uni.showToast({ title: '支付成功' })
  uni.redirectTo({ url: `/pages/order/success?id=${order.orderId}` })
}
```

### 数据同步

```typescript
import { to, toIf, toWithRetry } from '@/utils/to'

// 本地数据同步到云端
const syncLocalData = async () => {
  // 获取待同步的本地数据
  const pendingData = uni.getStorageSync('pending_sync_data') || []

  if (pendingData.length === 0) {
    return { synced: 0, failed: 0 }
  }

  // 检查网络状态
  const networkInfo = await uni.getNetworkType()
  const isOnline = networkInfo.networkType !== 'none'

  if (!isOnline) {
    return { synced: 0, failed: 0, reason: 'offline' }
  }

  let synced = 0
  let failed = 0
  const remaining = []

  for (const item of pendingData) {
    const [error] = await toWithRetry(
      () => api.syncData(item),
      2, // 每条数据重试 2 次
      1000
    )

    if (error) {
      failed++
      remaining.push(item) // 保留失败的数据
    } else {
      synced++
    }
  }

  // 更新待同步数据
  if (remaining.length > 0) {
    uni.setStorageSync('pending_sync_data', remaining)
  } else {
    uni.removeStorageSync('pending_sync_data')
  }

  return { synced, failed }
}

// 启动时自动同步
const onAppShow = async () => {
  const result = await syncLocalData()

  if (result.synced > 0) {
    console.log(`成功同步 ${result.synced} 条数据`)
  }

  if (result.failed > 0) {
    console.warn(`${result.failed} 条数据同步失败，将在下次启动时重试`)
  }
}
```

## API

### 函数列表

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `to` | Promise 错误处理 | `promise: Promise<T>` | `Promise<[Error \| null, T \| null]>` |
| `toValidate` | 表单验证 | `formRef: Ref<any>` | `Promise<[Error \| null, boolean]>` |
| `toIf` | 条件执行 Promise | `condition: boolean, promise: Promise<T>` | `Promise<[Error \| null, T \| null]>` |
| `toWithRetry` | 带重试的 Promise | `fn: () => Promise<T>, retries?: number, delay?: number` | `Promise<[Error \| null, T \| null]>` |

### 完整类型定义

```typescript
/**
 * Promise 结果元组类型
 * 第一个元素是错误，第二个元素是数据
 * 两者互斥：有错误时数据为 null，有数据时错误为 null
 */
type ToResult<T> = [Error, null] | [null, T]

/**
 * 包装 Promise，返回 [error, data] 元组
 *
 * @template T Promise 返回的数据类型
 * @param promise 要执行的 Promise
 * @returns 包含错误和数据的元组
 *
 * @example
 * const [error, user] = await to(api.getUser(id))
 * if (error) {
 *   console.error(error.message)
 *   return
 * }
 * console.log(user.name)
 */
declare function to<T>(promise: Promise<T>): Promise<ToResult<T>>

/**
 * 表单验证专用函数
 *
 * @param formRef 表单引用（wd-form 组件实例）
 * @returns [错误信息, 是否验证通过]
 *
 * @example
 * const [error, isValid] = await toValidate(formRef)
 * if (error) {
 *   uni.showToast({ title: error.message, icon: 'none' })
 *   return
 * }
 */
declare function toValidate(
  formRef: Ref<{
    validate: () => Promise<{ valid: boolean; errors?: Array<{ message: string }> }>
  }>
): Promise<[Error | null, boolean]>

/**
 * 条件执行 Promise
 *
 * @template T Promise 返回的数据类型
 * @param condition 执行条件，为 false 时直接返回 [null, null]
 * @param promise 要执行的 Promise，支持原始 Promise 和 to() 包装的 Promise
 * @returns 包含错误和数据的元组
 *
 * @example
 * const [error, data] = await toIf(hasPermission, api.loadData())
 * if (data) {
 *   // 有权限且请求成功
 * }
 */
declare function toIf<T>(
  condition: boolean,
  promise: Promise<T> | Promise<ToResult<T>>
): Promise<[Error | null, T | null]>

/**
 * 带重试机制的 Promise 执行
 *
 * @template T Promise 返回的数据类型
 * @param promiseFactory 返回 Promise 的工厂函数
 * @param maxRetries 最大重试次数，默认 2
 * @param retryDelay 重试间隔（毫秒），默认 1000
 * @returns 包含错误和数据的元组
 *
 * @example
 * const [error, data] = await toWithRetry(
 *   () => api.unstableRequest(),
 *   3,    // 重试 3 次
 *   2000  // 间隔 2 秒
 * )
 */
declare function toWithRetry<T>(
  promiseFactory: (() => Promise<T>) | (() => Promise<ToResult<T>>),
  maxRetries?: number,
  retryDelay?: number
): Promise<ToResult<T>>
```

### 导入方式

```typescript
// 推荐：按需导入
import { to, toValidate, toIf, toWithRetry } from '@/utils/to'

// 或者全部导入
import * as toUtils from '@/utils/to'
```

## 最佳实践

### 1. 统一错误处理

封装通用请求函数，统一处理错误提示：

```typescript
import { to } from '@/utils/to'

interface RequestOptions {
  showError?: boolean
  errorMessage?: string
  showLoading?: boolean
  loadingText?: string
}

const request = async <T>(
  fn: () => Promise<T>,
  options: RequestOptions = {}
): Promise<T | null> => {
  const {
    showError = true,
    errorMessage = '操作失败',
    showLoading = false,
    loadingText = '加载中...',
  } = options

  if (showLoading) {
    uni.showLoading({ title: loadingText })
  }

  const [error, data] = await to(fn())

  if (showLoading) {
    uni.hideLoading()
  }

  if (error) {
    if (showError) {
      uni.showToast({
        title: error.message || errorMessage,
        icon: 'none',
      })
    }
    return null
  }

  return data
}

// 使用
const user = await request(
  () => api.getUser(id),
  {
    errorMessage: '获取用户失败',
    showLoading: true,
  }
)
```

### 2. 类型安全使用

始终明确泛型类型，获得完整的类型推断：

```typescript
interface User {
  id: string
  name: string
  avatar: string
  phone: string
}

// ✅ 明确泛型类型
const [error, user] = await to<User>(api.getUser(id))

if (user) {
  // TypeScript 知道 user 是 User 类型
  console.log(user.name)
  console.log(user.phone)
}

// ✅ 复杂类型
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

const [error, response] = await to<ApiResponse<User[]>>(api.getUsers())

if (response) {
  // TypeScript 知道 response.data 是 User[]
  response.data.forEach((user) => {
    console.log(user.name)
  })
}
```

### 3. 错误分类处理

根据错误类型进行不同处理：

```typescript
// 定义错误类型
class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

class BusinessError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
  }
}

// 统一错误处理函数
const handleError = (error: Error) => {
  if (error.name === 'NetworkError') {
    uni.showModal({
      title: '网络异常',
      content: '请检查网络连接后重试',
      showCancel: false,
    })
  } else if (error.name === 'AuthError') {
    uni.showModal({
      title: '登录已过期',
      content: '请重新登录',
      showCancel: false,
      success: () => {
        uni.redirectTo({ url: '/pages/login/index' })
      },
    })
  } else if (error instanceof BusinessError) {
    uni.showToast({
      title: error.message,
      icon: 'none',
    })
  } else {
    uni.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none',
    })
  }
}

// 使用
const [error, data] = await to(api.getData())
if (error) {
  handleError(error)
  return
}
```

### 4. 合理使用重试

只对幂等操作和网络临时故障使用重试：

```typescript
// ✅ 适合重试：查询操作
const [error, data] = await toWithRetry(
  () => api.getOrderStatus(orderId),
  3,
  2000
)

// ✅ 适合重试：幂等的更新操作
const [error, result] = await toWithRetry(
  () => api.updateReadStatus(messageId, true),
  2,
  1000
)

// ❌ 不适合重试：非幂等操作
// 可能导致重复提交
const [error, order] = await toWithRetry(
  () => api.createOrder(orderData), // 不要重试！
  3,
  1000
)

// ✅ 非幂等操作使用普通 to
const [error, order] = await to(api.createOrder(orderData))
if (error) {
  // 手动处理重试逻辑，先检查是否已创建
  const [checkError, existingOrder] = await to(api.checkPendingOrder())
  if (existingOrder) {
    return existingOrder
  }
  // 真正失败，提示用户
  uni.showToast({ title: '创建订单失败', icon: 'none' })
}
```

### 5. 组合使用工具函数

灵活组合多个工具函数：

```typescript
import { to, toIf, toWithRetry, toValidate } from '@/utils/to'

const handleOrderSubmit = async () => {
  // 1. 表单验证
  const [validError, isValid] = await toValidate(formRef)
  if (validError || !isValid) {
    return
  }

  // 2. 条件检查库存（仅当是实物商品时）
  const [stockError, stockInfo] = await toIf(
    orderData.value.type === 'physical',
    api.checkStock(orderData.value.items)
  )
  if (stockError) {
    uni.showToast({ title: '库存检查失败', icon: 'none' })
    return
  }
  if (stockInfo && !stockInfo.available) {
    uni.showToast({ title: '库存不足', icon: 'none' })
    return
  }

  // 3. 创建订单（不重试）
  const [orderError, order] = await to(api.createOrder(orderData.value))
  if (orderError) {
    uni.showToast({ title: '创建订单失败', icon: 'none' })
    return
  }

  // 4. 支付（带重试，处理网络波动）
  const [payError, payResult] = await toWithRetry(
    () => api.initPayment(order.orderId),
    2,
    1000
  )
  if (payError) {
    // 订单已创建，跳转到订单详情
    uni.redirectTo({ url: `/pages/order/detail?id=${order.orderId}` })
    return
  }

  // 5. 调起支付
  // ...
}
```

### 6. 避免过度使用

不是所有异步操作都需要 to 函数：

```typescript
// ❌ 过度使用：简单的本地操作
const [error, value] = await to(Promise.resolve(computeValue()))

// ✅ 直接调用
const value = computeValue()

// ❌ 过度使用：不需要处理错误的场景
const [error, _] = await to(analytics.track('page_view'))

// ✅ 忽略错误的场景，直接调用不处理
analytics.track('page_view').catch(() => {})

// ❌ 过度使用：已经有错误边界的场景
const [error, data] = await to(
  tryCatch(() => riskyOperation()) // 已经有错误处理
)

// ✅ 选择一种错误处理方式
const data = await tryCatch(() => riskyOperation())
// 或者
const [error, data] = await to(riskyOperation())
```

## 常见问题

### 1. error 和 data 的类型推断？

TypeScript 会自动推断类型，但需要进行 null 检查：

```typescript
const [error, data] = await to(api.getData())

// ❌ 错误：data 可能为 null
console.log(data.name)

// ✅ 正确：先检查
if (data) {
  console.log(data.name)
}

// ✅ 或使用类型守卫
if (!error && data) {
  // 这里 TypeScript 知道 data 不为 null
  console.log(data.name)
}

// ✅ 使用可选链
console.log(data?.name)
```

### 2. 如何处理非 Error 类型的错误？

to 函数会自动转换，但如果需要保留原始错误：

```typescript
// 方式1：自定义包装
const [error, data] = await to(
  promise.catch((err) => {
    // 保留原始错误信息
    const error = new Error(typeof err === 'string' ? err : JSON.stringify(err))
    ;(error as any).originalError = err
    throw error
  })
)

if (error) {
  console.log('原始错误:', (error as any).originalError)
}

// 方式2：使用自定义错误类
class ApiError extends Error {
  code: number
  details: any

  constructor(response: any) {
    super(response.message || '请求失败')
    this.name = 'ApiError'
    this.code = response.code
    this.details = response.details
  }
}

const [error, data] = await to(
  api.getData().catch((err) => {
    throw new ApiError(err)
  })
)

if (error instanceof ApiError) {
  console.log('错误码:', error.code)
  console.log('详情:', error.details)
}
```

### 3. toWithRetry 什么时候停止重试？

重试机制遵循以下规则：

- 请求成功时立即返回结果
- 达到最大重试次数后返回最后一次的错误
- 每次重试之间会等待指定的延迟时间
- 重试计数从 0 开始，`maxRetries=2` 表示最多执行 3 次（1 次初始 + 2 次重试）

```typescript
// maxRetries=2 的执行流程：
// 第 1 次尝试（attempt=0）失败 -> 等待 1000ms
// 第 2 次尝试（attempt=1）失败 -> 等待 1000ms
// 第 3 次尝试（attempt=2）失败 -> 返回错误
```

### 4. toValidate 返回的 error 是什么？

error 包含表单验证的错误信息：

```typescript
const [error, isValid] = await toValidate(formRef)

// error.message 格式：所有验证错误用逗号连接
// 例如："用户名不能为空, 手机号格式不正确"

if (error) {
  // 可以直接显示
  uni.showToast({ title: error.message, icon: 'none' })

  // 或者解析单独处理
  const errors = error.message.split(', ')
  errors.forEach((err) => console.log(err))
}
```

### 5. 如何在 to 中添加超时控制？

可以封装一个带超时的版本：

```typescript
const toWithTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = '请求超时'
): Promise<[Error | null, T | null]> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
  })

  return to(Promise.race([promise, timeoutPromise]))
}

// 使用
const [error, data] = await toWithTimeout(
  api.slowRequest(),
  5000, // 5秒超时
  '请求超时，请稍后重试'
)

if (error?.message.includes('超时')) {
  // 处理超时情况
}
```

### 6. 如何串行执行多个 Promise？

可以封装一个串行执行函数：

```typescript
const toSequence = async <T>(
  operations: Array<() => Promise<T>>
): Promise<[Error | null, T[]]> => {
  const results: T[] = []

  for (const operation of operations) {
    const [error, data] = await to(operation())
    if (error) {
      return [error, results]
    }
    if (data !== null) {
      results.push(data)
    }
  }

  return [null, results]
}

// 使用
const [error, results] = await toSequence([
  () => api.step1(),
  () => api.step2(),
  () => api.step3(),
])

if (error) {
  console.log('执行到第', results.length + 1, '步时失败')
}
```

### 7. toIf 条件不满足时如何区分？

条件不满足时返回 `[null, null]`，可以通过检查 data 区分：

```typescript
const [error, data] = await toIf(condition, api.getData())

if (error) {
  // 请求执行了但失败了
  console.log('请求失败:', error.message)
} else if (data === null) {
  // 两种可能：
  // 1. 条件不满足，请求未执行
  // 2. 请求执行了但返回 null
  if (!condition) {
    console.log('条件不满足，跳过请求')
  } else {
    console.log('请求返回空数据')
  }
} else {
  // 请求成功且有数据
  console.log('数据:', data)
}
```

### 8. 如何记录请求日志？

可以封装带日志的版本：

```typescript
const toWithLog = async <T>(
  promise: Promise<T>,
  label: string = 'Request'
): Promise<[Error | null, T | null]> => {
  const startTime = Date.now()
  console.log(`[${label}] 开始执行`)

  const [error, data] = await to(promise)
  const duration = Date.now() - startTime

  if (error) {
    console.error(`[${label}] 失败 (${duration}ms):`, error.message)
  } else {
    console.log(`[${label}] 成功 (${duration}ms)`)
  }

  return [error, data]
}

// 使用
const [error, user] = await toWithLog(
  api.getUser(id),
  '获取用户信息'
)
// 控制台输出：
// [获取用户信息] 开始执行
// [获取用户信息] 成功 (123ms)
```
