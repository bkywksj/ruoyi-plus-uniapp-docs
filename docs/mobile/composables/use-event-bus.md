# useEventBus 事件总线

## 介绍

`useEventBus` 是事件总线组合函数，提供组件间的事件通信功能，支持发布订阅模式的事件管理。此组合函数集成了 Vue 生命周期，自动处理事件监听器的清理，避免内存泄漏。

**核心特性:**

- **发布订阅模式** - 支持事件的监听、触发和移除
- **自动清理** - 组件卸载时自动清理所有监听器
- **一次性监听** - 支持只执行一次后自动移除的事件监听
- **事件常量** - 预定义事件名称常量，避免拼写错误
- **类型安全** - 完整的 TypeScript 类型支持

## 基本用法

### 监听事件

```typescript
import { useEventBus } from '@/composables/useEventBus'

const { on, EventNames } = useEventBus()

// 监听设备列表刷新事件
on(EventNames.PAGE_REFRESH, () => {
  console.log('页面刷新')
  loadData()
})

// 监听用户登录事件
on(EventNames.USER_LOGIN, (userData) => {
  console.log('用户登录:', userData)
})
```

### 触发事件

```typescript
import { useEventBus } from '@/composables/useEventBus'

const { emit, EventNames } = useEventBus()

// 触发页面刷新事件
emit(EventNames.PAGE_REFRESH)

// 触发事件并传递数据
emit(EventNames.USER_LOGIN, { userId: '123', userName: 'admin' })
```

### 一次性监听

```typescript
import { useEventBus } from '@/composables/useEventBus'

const { once, EventNames } = useEventBus()

// 只监听一次用户登录事件
once(EventNames.USER_LOGIN, (userData) => {
  console.log('用户首次登录:', userData)
})
```

### 移除监听

```typescript
import { useEventBus } from '@/composables/useEventBus'

const { on, off, EventNames } = useEventBus()

// 定义回调函数
const handleLogout = () => {
  console.log('用户退出登录')
}

// 添加监听
const unsubscribe = on(EventNames.USER_LOGOUT, handleLogout)

// 方式一：使用返回的取消函数
unsubscribe()

// 方式二：使用 off 方法
off(EventNames.USER_LOGOUT, handleLogout)

// 方式三：移除某事件的所有监听器
off(EventNames.USER_LOGOUT)
```

## 跨页面通信

### 设备列表页面

```vue
<script lang="ts" setup>
import { useEventBus } from '@/composables/useEventBus'
import { onMounted } from 'vue'

const { on, emit, EventNames } = useEventBus()

const deviceList = ref([])

// 监听设备列表刷新事件
on(EventNames.PAGE_REFRESH, () => {
  loadDeviceList()
})

// 删除设备后触发事件
const deleteDevice = async (deviceId: string) => {
  await deleteDeviceApi(deviceId)

  // 通知其他页面刷新
  emit(EventNames.PAGE_REFRESH)
}

onMounted(() => {
  loadDeviceList()
})
</script>
```

### 设备添加页面

```vue
<script lang="ts" setup>
import { useEventBus } from '@/composables/useEventBus'

const { emit, EventNames } = useEventBus()

// 设备添加成功后通知其他页面
const onAddSuccess = (newDevice) => {
  // 触发刷新事件
  emit(EventNames.PAGE_REFRESH)

  // 返回上一页
  uni.navigateBack()
}
</script>
```

## 预定义事件

### 事件名称常量

```typescript
export const EventNames = {
  // 页面相关事件
  /** 页面返回 */
  PAGE_BACK: 'pageBack',
  /** Tab 切换 */
  TAB_CHANGED: 'tabChanged',
  /** 页面刷新 */
  PAGE_REFRESH: 'pageRefresh',

  // 用户相关事件
  /** 用户登录成功 */
  USER_LOGIN: 'userLogin',
  /** 用户退出登录 */
  USER_LOGOUT: 'userLogout',
  /** 用户信息更新 */
  USER_PROFILE_UPDATED: 'userProfileUpdated',

  // 网络和系统事件
  /** 网络状态变更 */
  NETWORK_STATUS_CHANGED: 'networkStatusChanged',
  /** API 请求错误 */
  API_ERROR: 'apiError',
} as const
```

### 事件数据类型

```typescript
export interface EventPayloads {
  /** Tab 切换事件数据 */
  [EventNames.TAB_CHANGED]: {
    from: number
    to: number
  }

  /** 网络状态变更事件数据 */
  [EventNames.NETWORK_STATUS_CHANGED]: {
    isConnected: boolean
    networkType?: string
  }
}
```

## API

### useEventBus 返回值

| 属性/方法 | 说明 | 类型 |
|-----------|------|------|
| EventNames | 事件名称常量 | `typeof EventNames` |
| on | 监听事件（自动清理） | `(event: string, callback: EventCallback) => () => void` |
| once | 一次性监听事件（自动清理） | `(event: string, callback: EventCallback) => () => void` |
| off | 移除事件监听器 | `(event: string, callback?: EventCallback) => void` |
| emit | 发送事件 | `(event: string, ...args: any[]) => boolean` |
| getListenerCount | 获取事件监听器数量 | `(event: string) => number` |

### 类型定义

```typescript
interface EventCallback {
  (...args: any[]): void
}

interface EventMap {
  [key: string]: EventCallback[]
}
```

## EventBus 类

### 内部实现

```typescript
class EventBus {
  private events: EventMap = {}

  /**
   * 监听事件
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    return () => this.off(event, callback)
  }

  /**
   * 移除事件监听
   */
  off(event: string, callback?: EventCallback): void {
    if (!this.events[event]) return

    if (callback) {
      const index = this.events[event].indexOf(callback)
      if (index > -1) {
        this.events[event].splice(index, 1)
      }
    } else {
      delete this.events[event]
    }
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event] || this.events[event].length === 0) {
      return false
    }

    const callbacks = [...this.events[event]]
    callbacks.forEach((callback) => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`事件 ${event} 的回调执行出错:`, error)
      }
    })

    return true
  }

  /**
   * 只监听一次事件
   */
  once(event: string, callback: EventCallback): () => void {
    const onceWrapper = (...args: any[]) => {
      callback(...args)
      this.off(event, onceWrapper)
    }
    return this.on(event, onceWrapper)
  }

  /**
   * 获取指定事件的监听器数量
   */
  getListenerCount(event: string): number {
    return this.events[event]?.length || 0
  }

  /**
   * 清除所有事件监听器
   */
  clear(): void {
    this.events = {}
  }
}
```

## 最佳实践

### 1. 用户状态同步

```typescript
// 登录页面
const { emit, EventNames } = useEventBus()

const handleLoginSuccess = (user) => {
  // 触发用户登录事件
  emit(EventNames.USER_LOGIN, user)
}

// 其他页面监听用户状态
const { on, EventNames } = useEventBus()

on(EventNames.USER_LOGIN, (user) => {
  // 更新本地用户状态
  updateLocalUserState(user)
})

on(EventNames.USER_LOGOUT, () => {
  // 清除本地数据
  clearLocalData()
})
```

### 2. 网络状态监听

```typescript
// App.vue 中监听网络状态
const { emit, EventNames } = useEventBus()

uni.onNetworkStatusChange((res) => {
  emit(EventNames.NETWORK_STATUS_CHANGED, {
    isConnected: res.isConnected,
    networkType: res.networkType
  })
})

// 组件中响应网络变化
const { on, EventNames } = useEventBus()

on(EventNames.NETWORK_STATUS_CHANGED, ({ isConnected }) => {
  if (!isConnected) {
    showOfflineToast()
  }
})
```

### 3. Tab 切换联动

```typescript
// TabBar 页面
const { emit, EventNames } = useEventBus()

const onTabChange = (from: number, to: number) => {
  emit(EventNames.TAB_CHANGED, { from, to })
}

// 子组件响应 Tab 切换
const { on, EventNames } = useEventBus()

on(EventNames.TAB_CHANGED, ({ from, to }) => {
  if (to === 1) {
    // 切换到当前 Tab 时刷新数据
    refreshData()
  }
})
```

### 4. 调试监听器数量

```typescript
const { getListenerCount, EventNames } = useEventBus()

// 检查事件监听器数量，用于调试内存泄漏
console.log('PAGE_REFRESH 监听器数量:', getListenerCount(EventNames.PAGE_REFRESH))
```

## 常见问题

### 1. 事件监听器未被清理？

`useEventBus` 会在组件卸载时自动清理通过 `on` 和 `once` 注册的监听器。如果直接使用全局 `eventBus` 实例，需要手动清理。

### 2. 事件触发顺序？

事件按照监听器注册的顺序依次执行。如果某个回调抛出异常，不会影响其他回调的执行。

### 3. 如何自定义事件名称？

可以直接使用字符串作为事件名称，但建议在 `EventNames` 中定义常量：

```typescript
// 扩展事件名称
const MyEventNames = {
  ...EventNames,
  CUSTOM_EVENT: 'customEvent',
} as const

const { on, emit } = useEventBus()

on(MyEventNames.CUSTOM_EVENT, (data) => {
  console.log('自定义事件:', data)
})

emit(MyEventNames.CUSTOM_EVENT, { key: 'value' })
```

### 4. 事件数据类型检查？

通过 `EventPayloads` 接口定义事件数据类型，获得更好的类型提示：

```typescript
interface EventPayloads {
  [EventNames.USER_LOGIN]: {
    userId: string
    userName: string
  }
}
```
