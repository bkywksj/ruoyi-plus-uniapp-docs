# Logger 日志收集器

## 介绍

`logger` 是 RuoYi-Plus-UniApp 移动端的前端日志收集器，用于在开发环境中实时收集和上报前端日志。通过重写 console 方法，自动收集所有日志输出并定时批量发送到后端，帮助开发者快速定位和排查问题。该工具与后端 WebSocket 推送系统无缝集成，支持在管理后台实时监控移动端日志输出。

**核心特性:**

- **无侵入式收集** - 重写 console 方法，保留原有功能的同时自动收集日志
- **批量发送** - 日志先存入队列，定时批量发送，减少网络请求
- **重复过滤** - 自动过滤重复日志，避免刷屏和资源浪费
- **错误监听** - 自动捕获未处理的错误和 Promise 异常
- **跨平台支持** - 同时支持 H5 和小程序/APP 环境
- **开发环境专用** - 仅在开发环境启用，不影响生产环境性能
- **WebSocket 推送** - 后端通过 WebSocket 实时推送日志到管理后台
- **超管专属** - 日志仅推送给超级管理员，保障信息安全

## 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           日志收集系统架构                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        移动端 (plus-uniapp)                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ console.log │  │ console.info│  │console.warn │  │console.error│ │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │   │
│  │         │                │                │               │          │   │
│  │         └────────────────┴────────────────┴───────────────┘          │   │
│  │                                   │                                   │   │
│  │                    ┌──────────────▼──────────────┐                   │   │
│  │                    │      Logger 收集器          │                   │   │
│  │                    │  ┌─────────────────────┐    │                   │   │
│  │                    │  │ • 重写 console 方法  │    │                   │   │
│  │                    │  │ • 格式化日志内容     │    │                   │   │
│  │                    │  │ • 过滤重复日志       │    │                   │   │
│  │                    │  │ • 获取页面路径       │    │                   │   │
│  │                    │  └─────────────────────┘    │                   │   │
│  │                    └──────────────┬──────────────┘                   │   │
│  │                                   │                                   │   │
│  │                    ┌──────────────▼──────────────┐                   │   │
│  │                    │       日志队列              │                   │   │
│  │                    │  MAX_QUEUE_SIZE: 200        │                   │   │
│  │                    └──────────────┬──────────────┘                   │   │
│  │                                   │                                   │   │
│  │                    ┌──────────────▼──────────────┐                   │   │
│  │                    │     定时发送器              │                   │   │
│  │                    │  SEND_INTERVAL: 2000ms      │                   │   │
│  │                    │  MAX_BATCH_SIZE: 50         │                   │   │
│  │                    └──────────────┬──────────────┘                   │   │
│  └───────────────────────────────────┼──────────────────────────────────┘   │
│                                      │                                       │
│                         HTTP POST /system/devLog/collect                     │
│                                      │                                       │
│  ┌───────────────────────────────────▼──────────────────────────────────┐   │
│  │                        后端 (ruoyi-modules)                           │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                   DevLogController                               │ │   │
│  │  │  @Profile({"dev", "test"})  // 仅开发/测试环境                   │ │   │
│  │  │  @SaIgnore                  // 无需登录                          │ │   │
│  │  └──────────────────────────────┬──────────────────────────────────┘ │   │
│  │                                 │                                     │   │
│  │                  ┌──────────────▼──────────────┐                     │   │
│  │                  │   WebSocketUtils.publish    │                     │   │
│  │                  │   目标: SUPER_ADMIN_ID      │                     │   │
│  │                  └──────────────┬──────────────┘                     │   │
│  └─────────────────────────────────┼────────────────────────────────────┘   │
│                                    │                                         │
│                          WebSocket 推送                                      │
│                                    │                                         │
│  ┌─────────────────────────────────▼────────────────────────────────────┐   │
│  │                       管理后台 (plus-ui)                              │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │              日志监控页面 (log-monitor.vue)                      │ │   │
│  │  │  • 实时显示前端日志                                              │ │   │
│  │  │  • 按级别过滤 (log/info/warn/error)                             │ │   │
│  │  │  • 按页面路径过滤                                               │ │   │
│  │  │  • 日志搜索                                                     │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 日志收集流程图

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           日志收集完整流程                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  开发者调用 console.log('消息')                                           │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────┐                                 │
│  │  重写的 console.log 方法被触发       │                                 │
│  └──────────────────┬──────────────────┘                                 │
│                     │                                                    │
│         ┌───────────┴───────────┐                                        │
│         ▼                       ▼                                        │
│  ┌─────────────┐      ┌─────────────────────────┐                        │
│  │调用原始方法  │      │     收集日志内容         │                        │
│  │保持控制台输出│      │                         │                        │
│  └─────────────┘      └───────────┬─────────────┘                        │
│                                   │                                      │
│                                   ▼                                      │
│                     ┌─────────────────────────────┐                      │
│                     │    格式化日志参数            │                      │
│                     │  • 对象 → JSON.stringify    │                      │
│                     │  • 多参数 → 空格连接         │                      │
│                     └───────────┬─────────────────┘                      │
│                                 │                                        │
│                                 ▼                                        │
│                     ┌─────────────────────────────┐     ┌──────────┐     │
│                     │   过滤 devLog 系统消息      │────▶│ 丢弃日志 │     │
│                     │   (避免无限循环)            │ 是  └──────────┘     │
│                     └───────────┬─────────────────┘                      │
│                                 │ 否                                     │
│                                 ▼                                        │
│                     ┌─────────────────────────────┐     ┌──────────┐     │
│                     │   检查是否重复日志          │────▶│ 丢弃日志 │     │
│                     │   MAX_REPEAT: 3             │ >3  └──────────┘     │
│                     └───────────┬─────────────────┘                      │
│                                 │ ≤3                                     │
│                                 ▼                                        │
│                     ┌─────────────────────────────┐                      │
│                     │   获取当前页面路径          │                      │
│                     │   getCurrentRoute()         │                      │
│                     └───────────┬─────────────────┘                      │
│                                 │                                        │
│                                 ▼                                        │
│                     ┌─────────────────────────────┐                      │
│                     │   构造 LogItem 对象         │                      │
│                     │  { level, message,          │                      │
│                     │    timestamp, path }        │                      │
│                     └───────────┬─────────────────┘                      │
│                                 │                                        │
│                                 ▼                                        │
│                     ┌─────────────────────────────┐     ┌──────────┐     │
│                     │   队列是否已满?              │────▶│移除最旧  │     │
│                     │   queue.length ≥ 200        │ 是  │的日志    │     │
│                     └───────────┬─────────────────┘     └────┬─────┘     │
│                                 │ 否                         │           │
│                                 ◀────────────────────────────┘           │
│                                 │                                        │
│                                 ▼                                        │
│                     ┌─────────────────────────────┐                      │
│                     │   添加到队列                 │                      │
│                     │   queue.push(logItem)       │                      │
│                     └───────────┬─────────────────┘                      │
│                                 │                                        │
│                                 ▼                                        │
│                     ┌─────────────────────────────┐                      │
│                     │   等待定时器触发            │                      │
│                     │   (每 2000ms)               │                      │
│                     └───────────┬─────────────────┘                      │
│                                 │                                        │
│                                 ▼                                        │
│                     ┌─────────────────────────────┐                      │
│                     │   批量发送到后端            │                      │
│                     │   POST /system/devLog/collect│                     │
│                     └─────────────────────────────┘                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

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

## 核心实现原理

### Logger 类完整实现

Logger 类是日志收集器的核心，采用单例模式实现：

```typescript
/** 日志项 */
interface LogItem {
  /** 日志级别 */
  level: 'log' | 'info' | 'warn' | 'error'
  /** 日志内容 */
  message: string
  /** 时间戳 */
  timestamp: number
  /** 页面路径 */
  path: string
  /** 用户信息(可选) */
  userId?: string
}

/** 日志收集器类 */
class Logger {
  /** 日志队列 */
  private queue: LogItem[] = []

  /** 定时器 */
  private timer: any = null

  /** 批量发送间隔(ms) */
  private readonly SEND_INTERVAL = 2000

  /** 单次最大发送数量 */
  private readonly MAX_BATCH_SIZE = 50

  /** 队列最大长度 */
  private readonly MAX_QUEUE_SIZE = 200

  /** 是否已初始化 */
  private isInitialized = false

  /** 原始console方法 */
  private readonly originalConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  }

  /** 重复日志过滤 */
  private lastMessage = ''
  private repeatCount = 0
  private readonly MAX_REPEAT = 3
}
```

### console 方法重写机制

Logger 通过保存原始 console 方法引用，然后重写 console 方法来实现无侵入式收集：

```typescript
/**
 * 重写console方法
 */
private overrideConsole() {
  // 重写 console.log
  console.log = (...args: any[]) => {
    this.originalConsole.log(...args)  // 保持原有输出
    this.collect('log', args)           // 收集日志
  }

  // 重写 console.info
  console.info = (...args: any[]) => {
    this.originalConsole.info(...args)
    this.collect('info', args)
  }

  // 重写 console.warn
  console.warn = (...args: any[]) => {
    this.originalConsole.warn(...args)
    this.collect('warn', args)
  }

  // 重写 console.error
  console.error = (...args: any[]) => {
    this.originalConsole.error(...args)
    this.collect('error', args)
  }
}
```

### 日志格式化与过滤

日志收集时会进行格式化和重复过滤：

```typescript
/**
 * 收集日志
 */
private collect(level: LogItem['level'], args: any[]) {
  // 格式化日志内容
  const message = args
    .map((arg) => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2)
        } catch {
          return String(arg)
        }
      }
      return String(arg)
    })
    .join(' ')

  // 过滤掉开发日志相关的系统消息（避免无限循环）
  if (message.includes('devLog')) {
    return
  }

  // 过滤重复日志
  if (message === this.lastMessage) {
    this.repeatCount++
    if (this.repeatCount > this.MAX_REPEAT) {
      return
    }
    if (this.repeatCount === this.MAX_REPEAT) {
      // 添加重复提示
      this.addToQueue({
        level,
        message: `${message} (重复 ${this.repeatCount} 次，后续重复日志已忽略)`,
        timestamp: Date.now(),
        path: this.getCurrentPath(),
      })
      return
    }
  } else {
    this.lastMessage = message
    this.repeatCount = 1
  }

  // 添加到队列
  this.addToQueue({
    level,
    message,
    timestamp: Date.now(),
    path: this.getCurrentPath(),
  })
}
```

### 全局错误监听

Logger 会自动捕获未处理的错误，支持 H5 和小程序/APP 两种环境：

```typescript
/**
 * 监听全局错误
 */
private listenErrors() {
  // #ifdef H5
  // 监听未捕获的错误
  window.addEventListener('error', (event) => {
    this.collect('error', [
      `未捕获的错误: ${event.message}`,
      `文件: ${event.filename}:${event.lineno}:${event.colno}`,
    ])
  })

  // 监听Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    this.collect('error', ['未处理的Promise错误:', event.reason])
  })
  // #endif

  // #ifndef H5
  // 小程序/App环境使用 uni.onError 和 uni.onUnhandledRejection
  uni.onError((error) => {
    this.collect('error', [`未捕获的错误: ${error}`])
  })

  uni.onUnhandledRejection((event) => {
    this.collect('error', ['未处理的Promise错误:', event.reason])
  })
  // #endif
}
```

## 后端集成

### DevLogController 控制器

后端通过 `DevLogController` 接收日志并通过 WebSocket 推送：

```java
@Profile({"dev", "test"})  // 仅在开发和测试环境启用
@Slf4j
@Validated
@RestController
@RequestMapping("/system/devLog")
public class DevLogController {

    /**
     * 收集前端日志
     * 接收前端发送的批量日志，通过WebSocket推送给监控页面（仅发送给超管）
     * 无需登录即可访问，方便收集未登录状态的日志
     */
    @SaIgnore
    @PostMapping("/collect")
    public R<Void> collect(@Validated @RequestBody DevLogBo bo) {
        log.debug("收到前端日志 {} 条", bo.getLogs().size());

        // 构造日志消息DTO
        DevLogMessageDto messageDto = DevLogMessageDto.of(bo.getLogs());

        // 只发送给超级管理员
        WebSocketMessageDto wsMessageDto = WebSocketMessageDto.of(
            List.of(TenantConstants.SUPER_ADMIN_ID),
            JsonUtils.toJsonString(messageDto)
        );
        WebSocketUtils.publishMessage(wsMessageDto);

        return R.ok();
    }
}
```

### DevLogBo 请求对象

```java
@Data
public class DevLogBo implements Serializable {

    /**
     * 日志列表
     */
    @Valid
    @NotEmpty(message = "日志列表不能为空")
    private List<LogItem> logs;

    /**
     * 日志项
     */
    @Data
    public static class LogItem implements Serializable {
        /** 日志级别 */
        private String level;
        /** 日志内容 */
        private String message;
        /** 时间戳 */
        private Long timestamp;
        /** 页面路径 */
        private String path;
        /** 用户ID(可选) */
        private String userId;
    }
}
```

### DevLogMessageDto WebSocket 消息

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DevLogMessageDto implements Serializable {

    /** 消息类型 */
    private String type = "devLog";

    /** 日志列表 */
    private List<DevLogBo.LogItem> logs;

    /**
     * 创建开发日志消息
     */
    public static DevLogMessageDto of(List<DevLogBo.LogItem> logs) {
        return new DevLogMessageDto("devLog", logs);
    }
}
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

### 用户行为追踪

```typescript
// 追踪用户关键行为
const trackUserBehavior = {
  // 页面浏览
  pageView: (pageName: string) => {
    console.log('[Track] 页面浏览:', pageName)
  },

  // 按钮点击
  buttonClick: (buttonName: string, context?: object) => {
    console.log('[Track] 按钮点击:', buttonName, context || '')
  },

  // 表单提交
  formSubmit: (formName: string, success: boolean) => {
    if (success) {
      console.log('[Track] 表单提交成功:', formName)
    } else {
      console.warn('[Track] 表单提交失败:', formName)
    }
  },

  // 错误发生
  error: (errorType: string, errorMessage: string) => {
    console.error('[Track] 错误:', errorType, errorMessage)
  }
}

// 使用示例
trackUserBehavior.pageView('商品详情页')
trackUserBehavior.buttonClick('加入购物车', { productId: 123 })
trackUserBehavior.formSubmit('订单提交', true)
```

### 调试复杂业务流程

```typescript
// 购物车业务流程调试
const addToCart = async (product: Product) => {
  console.log('[Cart] 开始添加商品:', {
    productId: product.id,
    name: product.name,
    price: product.price
  })

  // 1. 检查库存
  console.log('[Cart] 检查库存...')
  const stock = await checkStock(product.id)
  console.log('[Cart] 库存数量:', stock)

  if (stock <= 0) {
    console.warn('[Cart] 库存不足，无法添加')
    return false
  }

  // 2. 检查购物车限制
  console.log('[Cart] 检查购物车限制...')
  const cartItems = await getCartItems()
  console.log('[Cart] 当前购物车商品数:', cartItems.length)

  if (cartItems.length >= 99) {
    console.warn('[Cart] 购物车已满')
    return false
  }

  // 3. 添加到购物车
  console.log('[Cart] 添加到购物车...')
  try {
    const result = await addCartItem(product)
    console.log('[Cart] 添加成功:', result)
    return true
  } catch (error) {
    console.error('[Cart] 添加失败:', error)
    return false
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
3. 标记为未初始化状态

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

**响应格式:**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
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

## 性能优化

### 1. 批量发送减少请求

日志不是实时发送，而是先存入队列，每 2 秒批量发送一次：

```typescript
// 不推荐：每条日志单独发送
console.log('日志1')  // 发送请求
console.log('日志2')  // 发送请求
console.log('日志3')  // 发送请求

// 实际实现：批量发送
console.log('日志1')  // 入队
console.log('日志2')  // 入队
console.log('日志3')  // 入队
// 2秒后一次性发送
```

### 2. 重复日志过滤

相同内容的日志只收集 3 次，避免循环日志刷屏：

```typescript
// 这种情况只会收集 3 条日志
for (let i = 0; i < 100; i++) {
  console.log('重复消息')  // 第 4 次起被过滤
}
```

### 3. 队列长度限制

队列最多存储 200 条日志，超出后丢弃最旧的：

```typescript
// 内部实现
private addToQueue(log: LogItem) {
  if (this.queue.length >= this.MAX_QUEUE_SIZE) {
    this.queue.shift()  // 移除最旧的
  }
  this.queue.push(log)
}
```

### 4. 异步发送不阻塞

日志发送是异步的，不会阻塞主线程：

```typescript
private async sendLogs() {
  if (this.queue.length === 0) return

  const logs = this.queue.splice(0, this.MAX_BATCH_SIZE)

  try {
    await http.post('/system/devLog/collect', { logs })
  } catch (err) {
    // 发送失败不影响原功能
    this.originalConsole.error('[Logger] 日志发送失败:', err)
  }
}
```

### 5. 生产环境自动禁用

```typescript
init(enable: boolean = false) {
  // 非开发环境不启用
  if (import.meta.env.PROD || !enable) {
    this.originalConsole.log('[Logger] 日志收集器未启用')
    return
  }
  // ...
}
```

## 安全考虑

### 1. 仅开发/测试环境启用

后端通过 `@Profile` 注解限制仅在开发和测试环境启用：

```java
@Profile({"dev", "test"})  // 生产环境不会加载此控制器
public class DevLogController {
  // ...
}
```

### 2. 超管专属推送

日志仅通过 WebSocket 推送给超级管理员：

```java
WebSocketMessageDto wsMessageDto = WebSocketMessageDto.of(
    List.of(TenantConstants.SUPER_ADMIN_ID),  // 只发给超管
    JsonUtils.toJsonString(messageDto)
);
```

### 3. 无需登录访问

收集接口使用 `@SaIgnore` 跳过认证，方便收集未登录状态的日志：

```java
@SaIgnore  // 无需登录即可访问
@PostMapping("/collect")
public R<Void> collect(@Validated @RequestBody DevLogBo bo) {
  // ...
}
```

### 4. 敏感信息过滤

开发者应避免在日志中输出敏感信息：

```typescript
// ✅ 推荐 - 脱敏处理
console.log('[User] 登录:', { userId: user.id, phone: maskPhone(user.phone) })

// ❌ 不推荐 - 暴露敏感信息
console.log('[User] 登录:', { password: user.password, token: user.token })
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

### 6. 结构化日志内容

```typescript
// ✅ 推荐 - 结构化日志
console.log('[Order] 创建订单', {
  userId: user.id,
  productId: product.id,
  quantity: 2,
  totalPrice: 199.00,
  createTime: new Date().toISOString()
})

// ❌ 不推荐 - 拼接字符串
console.log('[Order] 创建订单 用户:' + user.id + ' 商品:' + product.id)
```

### 7. 使用日志级别区分重要性

```typescript
// 普通流程日志
console.log('[Flow] 进入商品详情页')

// 信息性日志
console.info('[Info] 加载了 10 条商品评论')

// 警告日志（需要关注但不是错误）
console.warn('[Warn] 商品库存不足 5 件')

// 错误日志（需要处理的问题）
console.error('[Error] 支付接口调用失败', error)
```

### 8. 添加上下文信息

```typescript
// ✅ 推荐 - 包含足够的上下文
console.log('[Order] 订单状态变更', {
  orderId: order.id,
  from: order.status,
  to: 'paid',
  operator: currentUser.id,
  time: Date.now()
})

// ❌ 不推荐 - 信息不足
console.log('[Order] 状态变更')
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

// 确认后端是否启用了 dev/test profile
// application.yml 中的 spring.profiles.active
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
- 循环引用的对象会序列化失败

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

### 6. WebSocket 推送收不到

**问题原因:**
- 未使用超级管理员账号登录
- WebSocket 连接断开
- 后端未启用 dev/test profile

**解决方案:**

```typescript
// 1. 确认使用超级管理员账号登录管理后台
// 2. 检查 WebSocket 连接状态
// 3. 确认后端配置：spring.profiles.active=dev
```

### 7. 日志顺序混乱

**问题原因:**
- 日志是批量发送的，可能与产生顺序不完全一致
- 网络延迟可能导致后发的日志先到达

**解决方案:**

```typescript
// 每条日志都有 timestamp 字段
// 在管理后台按 timestamp 排序即可恢复顺序

// 或者在日志中添加序号
let logIndex = 0
console.log(`[${++logIndex}] 第一条日志`)
console.log(`[${++logIndex}] 第二条日志`)
```

### 8. 内存占用过高

**问题原因:**
- 队列积压过多日志
- 发送失败导致日志堆积

**解决方案:**

```typescript
// Logger 已限制队列最大长度为 200
// 超出会自动丢弃最旧的日志

// 如果仍然担心内存问题，可以：
// 1. 减少日志输出频率
// 2. 手动调用 logger.flush() 清空队列
// 3. 在适当时机调用 logger.stop() 停止收集
```

## 调试技巧

### 1. 检查 Logger 状态

```typescript
// 在控制台检查 Logger 是否正常工作
console.log('[Test] 测试日志')

// 如果看到 "[Logger] 日志收集器已启动" 说明正常
// 如果看到 "[Logger] 日志收集器未启用" 检查环境和参数
```

### 2. 查看发送的日志

```typescript
// 在后端日志中可以看到
// "收到前端日志 X 条"
// 如果没有收到，检查网络连接
```

### 3. 测试 WebSocket 推送

```typescript
// 在管理后台打开日志监控页面
// 然后在移动端触发日志
console.log('[Test] WebSocket 推送测试')
// 2秒后应该在管理后台看到这条日志
```

### 4. 手动触发发送

```typescript
// 立即发送队列中的日志
import { logger } from '@/utils/logger'
logger.flush()
```

## 注意事项

1. **仅开发环境使用** - 生产环境自动禁用，不影响性能
2. **不记录敏感信息** - 避免在日志中输出密码、token 等
3. **控制日志量** - 避免在循环中大量输出日志
4. **需要后端支持** - 确保后端实现了 `/system/devLog/collect` 接口
5. **不影响原功能** - 发送失败不会影响应用正常运行
6. **超管专属** - 日志仅推送给超级管理员，普通用户看不到
7. **环境限制** - 后端需要配置 `dev` 或 `test` profile 才能接收日志
8. **网络依赖** - 日志发送需要网络连接，离线时日志会堆积在队列中

