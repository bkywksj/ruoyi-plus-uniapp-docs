# Logger 日志收集器

## 介绍

`logger` 是 RuoYi-Plus-UniApp 移动端的前端日志收集器，用于在开发环境中实时收集和上报前端日志。通过重写 console 方法，自动收集所有日志输出并定时批量发送到后端，帮助开发者快速定位和排查问题。

**核心特性:**

- **无侵入式收集** - 重写 console 方法，保留原有功能的同时自动收集日志
- **批量发送** - 日志先存入队列，定时批量发送，减少网络请求
- **重复过滤** - 自动过滤重复日志，避免刷屏和资源浪费
- **错误监听** - 自动捕获未处理的错误和 Promise 异常
- **跨平台支持** - 同时支持 H5 和小程序/APP 环境
- **开发环境专用** - 仅在开发环境启用，不影响生产环境性能

## 基本用法

### 初始化日志收集器

```typescript
import { logger } from '@/utils/logger'

// 在 App.vue 中初始化
onLaunch(() => {
  // 启用日志收集（仅开发环境生效）
  logger.init(true)
})
```

### 正常使用 console

初始化后，正常使用 console 即可，日志会自动被收集：

```typescript
// 这些日志都会被自动收集
console.log('普通日志')
console.info('信息日志')
console.warn('警告日志')
console.error('错误日志')

// 支持多参数
console.log('用户信息:', { id: 1, name: '张三' })

// 支持对象自动序列化
console.log({ action: 'login', userId: 123 })
```

### 手动刷新日志

```typescript
import { logger } from '@/utils/logger'

// 立即发送队列中的日志
logger.flush()
```

### 停止日志收集

```typescript
import { logger } from '@/utils/logger'

// 停止收集并发送剩余日志
logger.stop()
```

## 实际应用场景

### 应用启动时初始化

```vue
<!-- App.vue -->
<script lang="ts" setup>
import { logger } from '@/utils/logger'

onLaunch(() => {
  // 根据配置决定是否启用日志收集
  const enableLogger = import.meta.env.VITE_ENABLE_LOGGER === 'true'
  logger.init(enableLogger)

  console.log('应用启动完成')
})

onHide(() => {
  // 应用切换到后台时，发送剩余日志
  logger.flush()
})
</script>
```

### 页面级日志追踪

```vue
<template>
  <view class="page">
    <wd-button @click="handleSubmit">提交</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('[OrderPage] 页面加载完成')
})

const handleSubmit = async () => {
  console.log('[OrderPage] 开始提交订单')

  try {
    const result = await submitOrder()
    console.log('[OrderPage] 订单提交成功:', result)
  } catch (error) {
    console.error('[OrderPage] 订单提交失败:', error)
  }
}
</script>
```

### 接口请求日志

```typescript
// 在请求拦截器中记录日志
http.interceptors.request.use((config) => {
  console.log('[HTTP] 请求:', config.method?.toUpperCase(), config.url)
  return config
})

// 在响应拦截器中记录日志
http.interceptors.response.use(
  (response) => {
    console.log('[HTTP] 响应:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('[HTTP] 请求失败:', error.config?.url, error.message)
    return Promise.reject(error)
  }
)
```

### 状态变更追踪

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  const setUserInfo = (info: UserInfo) => {
    console.log('[UserStore] 设置用户信息:', info.userId)
    userInfo.value = info
  }

  const logout = () => {
    console.log('[UserStore] 用户登出')
    userInfo.value = null
  }

  return { userInfo, setUserInfo, logout }
})
```

### 性能监控日志

```typescript
// 记录页面加载性能
const measurePageLoad = () => {
  const startTime = Date.now()

  onMounted(() => {
    const loadTime = Date.now() - startTime
    console.log('[Performance] 页面加载耗时:', loadTime, 'ms')

    if (loadTime > 3000) {
      console.warn('[Performance] 页面加载时间过长，请优化')
    }
  })
}

// 记录接口响应时间
const measureApiCall = async (name: string, apiCall: () => Promise<any>) => {
  const startTime = Date.now()
  console.log(`[API] ${name} 开始请求`)

  try {
    const result = await apiCall()
    const duration = Date.now() - startTime
    console.log(`[API] ${name} 完成，耗时: ${duration}ms`)
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[API] ${name} 失败，耗时: ${duration}ms`, error)
    throw error
  }
}
```

## API 详解

### logger.init

初始化日志收集器。

```typescript
logger.init(enable?: boolean): void
```

**参数说明:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enable` | `boolean` | `false` | 是否启用日志收集 |

**启用条件:**
- 必须是开发环境（`import.meta.env.PROD` 为 `false`）
- `enable` 参数为 `true`
- 尚未初始化过

**使用示例:**

```typescript
// 基本使用
logger.init(true)

// 根据环境变量控制
logger.init(import.meta.env.VITE_ENABLE_LOGGER === 'true')

// 根据用户角色控制（如仅管理员启用）
logger.init(userStore.isAdmin)
```

### logger.stop

停止日志收集器。

```typescript
logger.stop(): void
```

**功能说明:**
1. 清除定时发送任务
2. 发送队列中剩余的日志
3. 恢复原始 console 方法（注意：当前实现不会恢复）

**使用示例:**

```typescript
// 应用退出时停止
onUnload(() => {
  logger.stop()
})

// 用户登出时停止
const logout = () => {
  logger.stop()
  // 其他登出逻辑...
}
```

### logger.flush

手动发送队列中的日志。

```typescript
logger.flush(): void
```

**使用场景:**
- 重要操作完成后立即上报
- 页面切换前确保日志发送
- 应用进入后台前发送

**使用示例:**

```typescript
// 支付完成后立即上报日志
const handlePaySuccess = () => {
  console.log('[Payment] 支付成功')
  logger.flush()  // 立即发送
}

// 页面隐藏前发送
onHide(() => {
  logger.flush()
})
```

## 类型定义

### LogItem

```typescript
/**
 * 日志项
 */
interface LogItem {
  /**
   * 日志级别
   * - log: 普通日志
   * - info: 信息日志
   * - warn: 警告日志
   * - error: 错误日志
   */
  level: 'log' | 'info' | 'warn' | 'error'

  /**
   * 日志内容
   * 多个参数会被合并为一个字符串
   * 对象会被 JSON.stringify 序列化
   */
  message: string

  /**
   * 时间戳
   * 日志产生的时间（毫秒级）
   */
  timestamp: number

  /**
   * 页面路径
   * 日志产生时的当前页面路径
   */
  path: string

  /**
   * 用户信息（可选）
   * 可用于关联用户身份
   */
  userId?: string
}
```

### Logger 类

```typescript
/**
 * 日志收集器类
 */
class Logger {
  /**
   * 初始化日志收集器
   * @param enable 是否启用，默认 false
   */
  init(enable?: boolean): void

  /**
   * 停止日志收集
   * 会清除定时器并发送剩余日志
   */
  stop(): void

  /**
   * 手动发送队列中的日志
   */
  flush(): void
}
```

## 配置参数

Logger 类内置了以下配置参数（常量）：

| 参数 | 值 | 说明 |
|------|-----|------|
| `SEND_INTERVAL` | `2000` | 批量发送间隔（毫秒） |
| `MAX_BATCH_SIZE` | `50` | 单次最大发送数量 |
| `MAX_QUEUE_SIZE` | `200` | 队列最大长度 |
| `MAX_REPEAT` | `3` | 相同日志最大重复次数 |

**配置说明:**

- **SEND_INTERVAL**: 每 2 秒检查队列并发送日志
- **MAX_BATCH_SIZE**: 每次最多发送 50 条日志
- **MAX_QUEUE_SIZE**: 队列最多存储 200 条日志，超出后丢弃最旧的
- **MAX_REPEAT**: 相同内容的日志最多收集 3 次，避免刷屏

## 后端接口

日志收集器会将日志发送到后端接口：

**请求地址:** `POST /system/devLog/collect`

**请求参数:**

```typescript
interface DevLogRequest {
  logs: LogItem[]
}
```

**请求示例:**

```json
{
  "logs": [
    {
      "level": "log",
      "message": "[UserStore] 设置用户信息: 123",
      "timestamp": 1703750400000,
      "path": "/pages/index/index"
    },
    {
      "level": "error",
      "message": "[HTTP] 请求失败: /api/user/info Network Error",
      "timestamp": 1703750401000,
      "path": "/pages/user/profile"
    }
  ]
}
```

## 工作原理

### 初始化流程

```
init(true)
    ↓
检查环境（仅开发环境）
    ↓
检查是否已初始化
    ↓
重写 console 方法
    ↓
启动定时发送任务
    ↓
注册全局错误监听
    ↓
初始化完成
```

### 日志收集流程

```
console.log('消息')
    ↓
调用原始 console.log（保持控制台输出）
    ↓
格式化日志内容（对象转 JSON）
    ↓
过滤系统消息（避免循环）
    ↓
检查重复日志
    ↓
获取当前页面路径
    ↓
添加到队列
    ↓
（定时器触发）批量发送
```

### 错误监听

**H5 环境:**
```typescript
// 监听未捕获的错误
window.addEventListener('error', (event) => {
  // 收集错误信息
})

// 监听 Promise 错误
window.addEventListener('unhandledrejection', (event) => {
  // 收集 Promise 错误
})
```

**小程序/APP 环境:**
```typescript
// 监听未捕获的错误
uni.onError((error) => {
  // 收集错误信息
})

// 监听 Promise 错误
uni.onUnhandledRejection((event) => {
  // 收集 Promise 错误
})
```

## 最佳实践

### 1. 使用统一的日志前缀

```typescript
// ✅ 推荐 - 使用模块前缀便于筛选
console.log('[UserModule] 用户登录成功')
console.log('[OrderModule] 订单创建完成')
console.log('[PayModule] 支付回调处理')

// ❌ 不推荐 - 没有前缀难以追踪
console.log('用户登录成功')
console.log('订单创建完成')
```

### 2. 记录关键业务节点

```typescript
// ✅ 推荐 - 记录关键操作
const submitOrder = async () => {
  console.log('[Order] 开始提交订单', { productId, quantity })

  try {
    const order = await createOrder()
    console.log('[Order] 订单创建成功', { orderId: order.id })

    const payment = await initiatePayment(order.id)
    console.log('[Order] 支付发起成功', { paymentId: payment.id })

    return order
  } catch (error) {
    console.error('[Order] 订单提交失败', error)
    throw error
  }
}
```

### 3. 避免敏感信息

```typescript
// ✅ 推荐 - 脱敏处理
console.log('[User] 用户登录:', { userId: user.id, phone: maskPhone(user.phone) })

// ❌ 不推荐 - 暴露敏感信息
console.log('[User] 用户登录:', { password: user.password, token: user.token })

// 脱敏函数示例
const maskPhone = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
```

### 4. 控制日志量

```typescript
// ✅ 推荐 - 合理的日志级别
console.log('[Init] 应用启动')  // 重要节点
console.info('[Config] 配置加载完成')  // 信息性日志
console.warn('[Cache] 缓存即将过期')  // 警告信息
console.error('[API] 请求失败', error)  // 错误信息

// ❌ 不推荐 - 在循环中大量输出
for (let i = 0; i < 1000; i++) {
  console.log('处理项:', i)  // 会产生大量日志
}

// ✅ 推荐 - 汇总输出
console.log('批量处理完成，共处理:', 1000, '项')
```

### 5. 在关键时机刷新日志

```typescript
// 支付成功后立即上报
const onPaySuccess = () => {
  console.log('[Pay] 支付成功，订单号:', orderId)
  logger.flush()  // 确保日志立即发送
}

// 错误发生时立即上报
const onCriticalError = (error: Error) => {
  console.error('[Critical] 严重错误:', error)
  logger.flush()  // 确保错误日志立即发送
}
```

## 常见问题

### 1. 日志没有被收集

**问题原因:**
- 未调用 `logger.init(true)` 初始化
- 在生产环境中运行
- `enable` 参数为 `false`

**解决方案:**

```typescript
// 检查初始化
logger.init(true)

// 确认环境
console.log('当前环境:', import.meta.env.MODE)
console.log('是否生产环境:', import.meta.env.PROD)
```

### 2. 日志发送失败

**问题原因:**
- 后端接口未实现
- 网络问题
- 接口地址错误

**解决方案:**

```typescript
// 日志发送失败不会影响应用运行
// 失败信息会输出到原始 console
// 检查后端接口是否正常
```

### 3. 重复日志被过滤

**问题原因:**
- 相同内容的日志超过 3 次会被忽略
- 这是为了避免刷屏

**解决方案:**

```typescript
// 如果需要记录多次，添加唯一标识
for (let i = 0; i < 10; i++) {
  console.log(`[Loop] 第 ${i + 1} 次处理`)  // 每次内容不同，不会被过滤
}
```

### 4. 对象显示为 [object Object]

**问题原因:**
- 某些复杂对象无法被 JSON.stringify

**解决方案:**

```typescript
// Logger 已内置 JSON.stringify 处理
// 对于循环引用的对象，会显示 [object Object]

// 手动处理复杂对象
const safeLog = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

console.log('[Data]', safeLog(complexObject))
```

### 5. 页面路径获取失败

**问题原因:**
- 在应用启动早期，路由尚未初始化
- getCurrentRoute() 可能返回空

**解决方案:**

```typescript
// Logger 已内置容错处理
// 获取失败时 path 为空字符串
// 不影响日志收集功能
```

## 注意事项

1. **仅开发环境使用** - 生产环境自动禁用，不影响性能
2. **不记录敏感信息** - 避免在日志中输出密码、token 等
3. **控制日志量** - 避免在循环中大量输出日志
4. **需要后端支持** - 确保后端实现了 `/system/devLog/collect` 接口
5. **不影响原功能** - 发送失败不会影响应用正常运行

