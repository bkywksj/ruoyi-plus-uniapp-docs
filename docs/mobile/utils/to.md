# to Promise 错误处理

## 介绍

`to` 是 Promise 错误处理工具，采用 `[error, data]` 元组模式简化异步操作的错误处理。该模式避免了繁琐的 try-catch 嵌套，让异步代码更加清晰易读。

**核心特性:**

- **元组返回** - 返回 `[error, data]` 格式，统一错误处理方式
- **类型安全** - 完整的 TypeScript 泛型支持
- **条件执行** - 支持条件判断后执行 Promise
- **自动重试** - 内置重试机制，处理临时性失败
- **验证集成** - 集成数据验证功能

## 基本用法

### to 函数

将 Promise 包装为 `[error, data]` 元组：

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

// 替代 try-catch
// 传统写法
try {
  const user = await api.getUser(id)
  console.log(user)
} catch (error) {
  console.error(error)
}

// to 写法
const [error, user] = await to(api.getUser(id))
if (error) {
  console.error(error)
} else {
  console.log(user)
}
```

### 链式调用

多个异步操作的顺序执行：

```typescript
import { to } from '@/utils/to'

const processOrder = async (orderId: string) => {
  // 获取订单
  const [orderError, order] = await to(api.getOrder(orderId))
  if (orderError) {
    return { success: false, message: '获取订单失败' }
  }

  // 获取用户
  const [userError, user] = await to(api.getUser(order.userId))
  if (userError) {
    return { success: false, message: '获取用户失败' }
  }

  // 处理支付
  const [payError, payResult] = await to(api.processPayment(order, user))
  if (payError) {
    return { success: false, message: '支付处理失败' }
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

  // 错误时返回默认用户
  if (error) {
    return {
      id: '0',
      name: '访客',
      role: 'guest'
    }
  }

  return user
}

// 错误转换
const fetchData = async () => {
  const [error, data] = await to(api.getData())

  if (error) {
    // 转换为业务错误
    throw new BusinessError('数据加载失败', error)
  }

  return data
}
```

## 条件执行

### toIf 函数

根据条件决定是否执行 Promise：

```typescript
import { toIf } from '@/utils/to'

// 条件为真时执行
const maybeRefresh = async (shouldRefresh: boolean) => {
  const [error, data] = await toIf(
    shouldRefresh,
    () => api.refreshData()
  )

  if (error) {
    console.error('刷新失败:', error)
    return null
  }

  // shouldRefresh 为 false 时，data 为 undefined
  return data
}

// 实际应用
const loadData = async (forceRefresh = false) => {
  // 检查缓存
  const cached = cache.get('data')

  // 有缓存且不强制刷新时，不调用 API
  const [error, freshData] = await toIf(
    !cached || forceRefresh,
    () => api.getData()
  )

  if (error) {
    return cached // 降级使用缓存
  }

  if (freshData) {
    cache.set('data', freshData)
    return freshData
  }

  return cached
}
```

### 带验证的执行

```typescript
import { toIf } from '@/utils/to'

// 验证通过后执行
const submitForm = async (form: FormData) => {
  const isValid = validateForm(form)

  const [error, result] = await toIf(isValid, () => api.submit(form))

  if (!isValid) {
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return
  }

  if (error) {
    uni.showToast({ title: '提交失败', icon: 'none' })
    return
  }

  uni.showToast({ title: '提交成功' })
}
```

## 自动重试

### toWithRetry 函数

失败时自动重试：

```typescript
import { toWithRetry } from '@/utils/to'

// 默认重试 3 次
const fetchWithRetry = async () => {
  const [error, data] = await toWithRetry(() => api.getData())

  if (error) {
    console.error('重试 3 次后仍然失败:', error)
    return null
  }

  return data
}

// 自定义重试次数
const [error, data] = await toWithRetry(
  () => api.getData(),
  5 // 重试 5 次
)

// 自定义重试间隔
const [error, data] = await toWithRetry(
  () => api.getData(),
  3,    // 重试次数
  1000  // 间隔 1 秒
)
```

### 重试场景示例

```typescript
import { toWithRetry } from '@/utils/to'

// 网络请求重试
const uploadFile = async (file: File) => {
  const [error, result] = await toWithRetry(
    () => api.uploadFile(file),
    3,    // 重试 3 次
    2000  // 间隔 2 秒
  )

  if (error) {
    uni.showToast({
      title: '上传失败，请检查网络',
      icon: 'none'
    })
    return null
  }

  return result
}

// 支付状态查询（轮询重试）
const checkPaymentStatus = async (orderId: string) => {
  const [error, status] = await toWithRetry(
    async () => {
      const res = await api.getPaymentStatus(orderId)
      // 未完成时抛出错误触发重试
      if (res.status === 'pending') {
        throw new Error('支付未完成')
      }
      return res
    },
    10,   // 最多查询 10 次
    3000  // 每 3 秒查询一次
  )

  return status
}
```

## 数据验证

### toValidate 函数

执行 Promise 并验证返回数据：

```typescript
import { toValidate } from '@/utils/to'

// 带验证的数据获取
const getValidUser = async (id: string) => {
  const [error, user] = await toValidate(
    api.getUser(id),
    (data) => data && data.id && data.name // 验证函数
  )

  if (error) {
    // error 可能是请求错误或验证失败
    console.error('获取用户失败或数据无效')
    return null
  }

  return user // 保证数据符合验证条件
}

// 复杂验证
interface Order {
  id: string
  items: Array<{ id: string; quantity: number }>
  total: number
}

const getValidOrder = async (orderId: string) => {
  const [error, order] = await toValidate<Order>(
    api.getOrder(orderId),
    (data) => {
      if (!data?.id) return false
      if (!Array.isArray(data.items) || data.items.length === 0) return false
      if (typeof data.total !== 'number' || data.total <= 0) return false
      return true
    }
  )

  return error ? null : order
}
```

## 实际应用场景

### 表单提交

```typescript
import { to } from '@/utils/to'

const handleSubmit = async () => {
  // 表单验证
  const valid = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  const [error, result] = await to(api.submitForm(formData))

  loading.value = false

  if (error) {
    uni.showModal({
      title: '提交失败',
      content: error.message || '请稍后重试',
      showCancel: false
    })
    return
  }

  uni.showToast({ title: '提交成功' })
  uni.navigateBack()
}
```

### 登录流程

```typescript
import { to, toWithRetry } from '@/utils/to'

const handleLogin = async () => {
  // 1. 获取验证码
  const [captchaError, captcha] = await to(api.getCaptcha())
  if (captchaError) {
    uni.showToast({ title: '获取验证码失败', icon: 'none' })
    return
  }

  // 2. 登录请求（带重试）
  const [loginError, loginResult] = await toWithRetry(
    () => api.login({
      username: form.username,
      password: form.password,
      captcha: form.captcha,
      uuid: captcha.uuid
    }),
    2 // 失败重试 2 次
  )

  if (loginError) {
    uni.showToast({ title: loginError.message || '登录失败', icon: 'none' })
    return
  }

  // 3. 获取用户信息
  const [userError, userInfo] = await to(api.getUserInfo())
  if (userError) {
    console.warn('获取用户信息失败，使用默认值')
  }

  // 4. 保存状态
  userStore.setToken(loginResult.token)
  userStore.setUserInfo(userInfo || {})

  uni.switchTab({ url: '/pages/index/index' })
}
```

### 并行请求

```typescript
import { to } from '@/utils/to'

const loadPageData = async () => {
  // 并行发起多个请求
  const [
    [userError, user],
    [ordersError, orders],
    [messagesError, messages]
  ] = await Promise.all([
    to(api.getUserInfo()),
    to(api.getOrders()),
    to(api.getMessages())
  ])

  // 分别处理每个请求的结果
  if (!userError) {
    userData.value = user
  }

  if (!ordersError) {
    orderList.value = orders
  }

  if (!messagesError) {
    messageList.value = messages
  }

  // 全部失败时显示错误
  if (userError && ordersError && messagesError) {
    showError('数据加载失败')
  }
}
```

### 文件上传

```typescript
import { to, toWithRetry } from '@/utils/to'

const uploadImages = async (files: File[]) => {
  const results = []

  for (const file of files) {
    // 单个文件上传，失败重试
    const [error, result] = await toWithRetry(
      () => api.uploadFile(file),
      3,
      1000
    )

    if (error) {
      results.push({
        file: file.name,
        success: false,
        error: error.message
      })
    } else {
      results.push({
        file: file.name,
        success: true,
        url: result.url
      })
    }
  }

  // 统计结果
  const successCount = results.filter(r => r.success).length
  const failCount = results.length - successCount

  uni.showToast({
    title: `上传完成: ${successCount}成功, ${failCount}失败`,
    icon: 'none'
  })

  return results
}
```

## API

### 函数列表

| 函数 | 说明 | 参数 |
|------|------|------|
| to | Promise 错误处理 | `<T>(promise: Promise<T>)` |
| toIf | 条件执行 Promise | `<T>(condition: boolean, fn: () => Promise<T>)` |
| toValidate | 带验证的 Promise | `<T>(promise: Promise<T>, validator: (data: T) => boolean)` |
| toWithRetry | 带重试的 Promise | `<T>(fn: () => Promise<T>, retries?: number, delay?: number)` |

### 类型定义

```typescript
/**
 * Promise 结果元组类型
 */
type ToResult<T> = [Error, null] | [null, T]

/**
 * 包装 Promise，返回 [error, data] 元组
 * @param promise 要执行的 Promise
 * @returns [error, data] 元组
 */
function to<T>(promise: Promise<T>): Promise<ToResult<T>>

/**
 * 条件执行 Promise
 * @param condition 执行条件
 * @param fn 返回 Promise 的函数
 * @returns [error, data] 元组，条件为 false 时返回 [null, undefined]
 */
function toIf<T>(
  condition: boolean,
  fn: () => Promise<T>
): Promise<ToResult<T | undefined>>

/**
 * 执行 Promise 并验证结果
 * @param promise 要执行的 Promise
 * @param validator 验证函数
 * @returns [error, data] 元组，验证失败时 error 为验证错误
 */
function toValidate<T>(
  promise: Promise<T>,
  validator: (data: T) => boolean
): Promise<ToResult<T>>

/**
 * 带重试的 Promise 执行
 * @param fn 返回 Promise 的函数
 * @param retries 重试次数，默认 3
 * @param delay 重试间隔(ms)，默认 1000
 * @returns [error, data] 元组
 */
function toWithRetry<T>(
  fn: () => Promise<T>,
  retries?: number,
  delay?: number
): Promise<ToResult<T>>
```

## 最佳实践

### 1. 统一错误处理

```typescript
// 封装通用请求函数
const request = async <T>(
  fn: () => Promise<T>,
  errorMessage = '操作失败'
): Promise<T | null> => {
  const [error, data] = await to(fn())

  if (error) {
    uni.showToast({
      title: error.message || errorMessage,
      icon: 'none'
    })
    return null
  }

  return data
}

// 使用
const user = await request(
  () => api.getUser(id),
  '获取用户失败'
)
```

### 2. 类型安全使用

```typescript
interface User {
  id: string
  name: string
}

// 明确泛型类型
const [error, user] = await to<User>(api.getUser(id))

if (user) {
  // TypeScript 知道 user 是 User 类型
  console.log(user.name)
}
```

### 3. 错误分类处理

```typescript
const handleError = (error: Error) => {
  if (error.name === 'NetworkError') {
    uni.showToast({ title: '网络连接失败', icon: 'none' })
  } else if (error.name === 'AuthError') {
    uni.redirectTo({ url: '/pages/login/index' })
  } else {
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

const [error, data] = await to(api.getData())
if (error) {
  handleError(error)
}
```

## 常见问题

### 1. error 和 data 的类型推断？

TypeScript 会自动推断类型，但需要进行 null 检查：

```typescript
const [error, data] = await to(api.getData())

// 错误：data 可能为 null
console.log(data.name) // ❌

// 正确：先检查
if (data) {
  console.log(data.name) // ✅
}
```

### 2. 如何处理非 Error 类型的错误？

```typescript
const [error, data] = await to(
  promise.catch(err => {
    // 统一转换为 Error
    if (err instanceof Error) {
      throw err
    }
    throw new Error(String(err))
  })
)
```

### 3. toWithRetry 什么时候停止重试？

- 请求成功时立即返回
- 达到最大重试次数后返回最后一次的错误
- 每次重试之间会等待指定的延迟时间
