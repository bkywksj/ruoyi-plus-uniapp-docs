# useEventBus 事件总线

## 介绍

`useEventBus` 是事件总线组合函数，提供组件间的事件通信功能，支持发布订阅模式的事件管理。此组合函数集成了 Vue 生命周期，自动处理事件监听器的清理，避免内存泄漏。

**核心特性:**

- **发布订阅模式** - 支持事件的监听、触发和移除，实现组件解耦
- **自动清理** - 组件卸载时自动清理所有监听器，防止内存泄漏
- **一次性监听** - 支持只执行一次后自动移除的事件监听
- **事件常量** - 预定义事件名称常量，避免拼写错误
- **全局单例** - 全局共享一个事件总线实例，支持跨页面通信
- **类型安全** - 完整的 TypeScript 类型支持，提供良好的代码提示
- **错误隔离** - 单个回调异常不影响其他监听器执行

**平台兼容性:**

| 平台 | 支持情况 | 备注 |
|------|---------|------|
| H5 | 是 完全支持 | - |
| 微信小程序 | 是 完全支持 | - |
| 支付宝小程序 | 是 完全支持 | - |
| 百度小程序 | 是 完全支持 | - |
| QQ小程序 | 是 完全支持 | - |
| 字节跳动小程序 | 是 完全支持 | - |
| App (Android/iOS) | 是 完全支持 | - |

## 架构设计

### 整体架构

事件总线系统采用发布订阅模式，由以下部分组成：

```text
┌─────────────────────────────────────────────────────────┐
│                     应用层                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │            useEventBus() Composable               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │  │
│  │  │ on() 监听   │  │ emit() 发送 │  │ off() 移除│  │  │
│  │  └─────────────┘  └─────────────┘  └───────────┘  │  │
│  │  ┌─────────────┐  ┌─────────────────────────────┐  │  │
│  │  │ once() 单次 │  │ onUnmounted() 自动清理     │  │  │
│  │  └─────────────┘  └─────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     核心层                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │              EventBus 类 (单例)                    │  │
│  │                                                   │  │
│  │  events: {                                        │  │
│  │    'userLogin': [callback1, callback2],          │  │
│  │    'pageRefresh': [callback3],                   │  │
│  │    'networkChanged': [callback4, callback5]      │  │
│  │  }                                               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     常量层                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │              EventNames 常量                      │  │
│  │  - PAGE_BACK, TAB_CHANGED, PAGE_REFRESH          │  │
│  │  - USER_LOGIN, USER_LOGOUT, USER_PROFILE_UPDATED │  │
│  │  - NETWORK_STATUS_CHANGED, API_ERROR             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 事件流程图

```text
发布者                     事件总线                      订阅者
  │                          │                           │
  │  emit('userLogin', data) │                           │
  │─────────────────────────>│                           │
  │                          │                           │
  │                          │  遍历 'userLogin' 回调列表 │
  │                          │──────────────────────────>│
  │                          │                           │
  │                          │                 callback1(data)
  │                          │                           │
  │                          │                 callback2(data)
  │                          │                           │
  │                          │<──────────────────────────│
  │                          │       执行完成            │
  │<─────────────────────────│                           │
  │       返回 true          │                           │
```

### 生命周期集成

```text
组件创建
    │
    ▼
setup() 执行
    │
    ├─► useEventBus() 调用
    │       │
    │       ├─► 创建 unsubscribers 数组
    │       │
    │       ├─► on() 监听事件
    │       │       │
    │       │       └─► 添加到 eventBus.events
    │       │       └─► unsubscribers.push(unsubscribe)
    │       │
    │       └─► once() 一次性监听
    │               │
    │               └─► 包装回调函数
    │               └─► unsubscribers.push(unsubscribe)
    │
    ▼
组件运行中...
    │
    ├─► emit() 触发事件
    │       │
    │       └─► 执行所有监听回调
    │
    ▼
组件卸载
    │
    ├─► onUnmounted() 触发
    │       │
    │       └─► 遍历 unsubscribers
    │       └─► 执行每个 unsubscribe()
    │       └─► 清空 unsubscribers 数组
    │
    ▼
清理完成
```

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

// 监听用户登录事件（带数据）
on(EventNames.USER_LOGIN, (userData) => {
  console.log('用户登录:', userData)
  updateUserState(userData)
})

// 监听多个事件
on(EventNames.USER_LOGOUT, () => {
  console.log('用户退出')
  clearUserState()
})

on(EventNames.NETWORK_STATUS_CHANGED, ({ isConnected }) => {
  console.log('网络状态:', isConnected ? '已连接' : '已断开')
})
```

### 触发事件

```typescript
import { useEventBus } from '@/composables/useEventBus'

const { emit, EventNames } = useEventBus()

// 触发无数据事件
emit(EventNames.PAGE_REFRESH)

// 触发事件并传递数据
emit(EventNames.USER_LOGIN, {
  userId: '123',
  userName: 'admin',
  token: 'xxx'
})

// 触发网络状态变更事件
emit(EventNames.NETWORK_STATUS_CHANGED, {
  isConnected: true,
  networkType: 'wifi'
})

// 触发 Tab 切换事件
emit(EventNames.TAB_CHANGED, {
  from: 0,
  to: 1
})
```

### 一次性监听

```typescript
import { useEventBus } from '@/composables/useEventBus'

const { once, EventNames } = useEventBus()

// 只监听一次用户登录事件
once(EventNames.USER_LOGIN, (userData) => {
  console.log('用户首次登录:', userData)
  showWelcomeMessage()
})

// 只监听一次页面刷新
once(EventNames.PAGE_REFRESH, () => {
  console.log('首次刷新完成')
})

// 等待某个事件发生后执行初始化
once('app:ready', () => {
  initializeApp()
})
```

### 移除监听

```typescript
import { useEventBus } from '@/composables/useEventBus'

const { on, off, EventNames } = useEventBus()

// 定义回调函数
const handleLogout = () => {
  console.log('用户退出登录')
  clearLocalData()
}

// 添加监听
const unsubscribe = on(EventNames.USER_LOGOUT, handleLogout)

// 方式一：使用返回的取消函数（推荐）
unsubscribe()

// 方式二：使用 off 方法（需要传入相同的回调引用）
off(EventNames.USER_LOGOUT, handleLogout)

// 方式三：移除某事件的所有监听器
off(EventNames.USER_LOGOUT)
```

### 获取监听器数量

```typescript
import { useEventBus } from '@/composables/useEventBus'

const { on, getListenerCount, EventNames } = useEventBus()

// 添加监听
on(EventNames.PAGE_REFRESH, () => {})
on(EventNames.PAGE_REFRESH, () => {})

// 获取监听器数量
const count = getListenerCount(EventNames.PAGE_REFRESH)
console.log('PAGE_REFRESH 监听器数量:', count) // 2

// 用于调试内存泄漏
if (count > 10) {
  console.warn('监听器数量过多，可能存在内存泄漏')
}
```

## 跨页面通信

### 设备列表页面

```vue
<template>
  <view class="device-list">
    <wd-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <view
        v-for="device in deviceList"
        :key="device.id"
        class="device-item"
        @click="toDeviceDetail(device.id)"
      >
        <text class="device-name">{{ device.name }}</text>
        <wd-icon name="delete" @click.stop="deleteDevice(device.id)" />
      </view>
    </wd-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useEventBus } from '@/composables/useEventBus'

const { on, emit, EventNames } = useEventBus()

const deviceList = ref([])
const refreshing = ref(false)

// 加载设备列表
const loadDeviceList = async () => {
  try {
    const data = await fetchDeviceListApi()
    deviceList.value = data
  } finally {
    refreshing.value = false
  }
}

// 监听设备列表刷新事件
on(EventNames.PAGE_REFRESH, () => {
  console.log('收到刷新事件，重新加载数据')
  loadDeviceList()
})

// 监听设备添加事件
on('device:added', (newDevice) => {
  console.log('新设备添加:', newDevice)
  deviceList.value.unshift(newDevice)
})

// 删除设备
const deleteDevice = async (deviceId: string) => {
  await deleteDeviceApi(deviceId)

  // 本地移除
  deviceList.value = deviceList.value.filter(d => d.id !== deviceId)

  // 通知其他页面
  emit('device:deleted', { deviceId })
}

// 下拉刷新
const onRefresh = () => {
  loadDeviceList()
}

// 跳转详情
const toDeviceDetail = (id: string) => {
  uni.navigateTo({ url: `/pages/device/detail?id=${id}` })
}

onMounted(() => {
  loadDeviceList()
})
</script>
```

### 设备添加页面

```vue
<template>
  <view class="device-add">
    <wd-form :model="form" ref="formRef">
      <wd-cell-group>
        <wd-input
          label="设备名称"
          v-model="form.name"
          placeholder="请输入设备名称"
          prop="name"
        />
        <wd-input
          label="设备编号"
          v-model="form.code"
          placeholder="请输入设备编号"
          prop="code"
        />
        <wd-picker
          label="设备类型"
          v-model="form.type"
          :columns="typeOptions"
          prop="type"
        />
      </wd-cell-group>
    </wd-form>

    <view class="footer">
      <wd-button type="primary" block @click="onSubmit">
        添加设备
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useEventBus } from '@/composables/useEventBus'

const { emit, EventNames } = useEventBus()

const formRef = ref()
const form = reactive({
  name: '',
  code: '',
  type: ''
})

const typeOptions = [
  { label: '传感器', value: 'sensor' },
  { label: '控制器', value: 'controller' },
  { label: '网关', value: 'gateway' }
]

// 提交表单
const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    const newDevice = await addDeviceApi(form)

    // 触发设备添加事件
    emit('device:added', newDevice)

    // 触发列表刷新事件
    emit(EventNames.PAGE_REFRESH)

    // 提示成功
    uni.showToast({
      title: '添加成功',
      icon: 'success'
    })

    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.showToast({
      title: error.message || '添加失败',
      icon: 'none'
    })
  }
}
</script>
```

### 设备详情页面

```vue
<template>
  <view class="device-detail">
    <view v-if="device" class="info-card">
      <text class="name">{{ device.name }}</text>
      <text class="code">编号: {{ device.code }}</text>
      <text class="type">类型: {{ device.typeName }}</text>
    </view>

    <view class="actions">
      <wd-button type="primary" @click="editDevice">编辑</wd-button>
      <wd-button type="error" @click="confirmDelete">删除</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useEventBus } from '@/composables/useEventBus'

const { on, emit, EventNames } = useEventBus()

const props = defineProps<{
  id: string
}>()

const device = ref(null)

// 加载设备详情
const loadDeviceDetail = async () => {
  device.value = await fetchDeviceDetailApi(props.id)
}

// 监听设备删除事件（其他页面删除了此设备）
on('device:deleted', ({ deviceId }) => {
  if (deviceId === props.id) {
    uni.showToast({
      title: '设备已被删除',
      icon: 'none'
    })
    uni.navigateBack()
  }
})

// 监听设备更新事件
on('device:updated', (updatedDevice) => {
  if (updatedDevice.id === props.id) {
    device.value = updatedDevice
  }
})

// 删除确认
const confirmDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除此设备吗？',
    success: async (res) => {
      if (res.confirm) {
        await deleteDeviceApi(props.id)

        // 触发删除事件
        emit('device:deleted', { deviceId: props.id })

        // 触发列表刷新
        emit(EventNames.PAGE_REFRESH)

        uni.navigateBack()
      }
    }
  })
}

// 编辑设备
const editDevice = () => {
  uni.navigateTo({
    url: `/pages/device/edit?id=${props.id}`
  })
}

onMounted(() => {
  loadDeviceDetail()
})
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

// 类型推断
type EventNameType = typeof EventNames[keyof typeof EventNames]
// 结果: 'pageBack' | 'tabChanged' | 'pageRefresh' | ...
```

### 事件数据类型

```typescript
/**
 * 事件数据类型定义
 * 定义各个事件携带的数据结构，提供更好的类型提示
 */
export interface EventPayloads {
  /** Tab 切换事件数据 */
  [EventNames.TAB_CHANGED]: {
    from: number
    to: number
  }

  /** 网络状态变更事件数据 */
  [EventNames.NETWORK_STATUS_CHANGED]: {
    isConnected: boolean
    networkType?: 'wifi' | '2g' | '3g' | '4g' | '5g' | 'ethernet' | 'unknown' | 'none'
  }

  /** 用户登录事件数据 */
  [EventNames.USER_LOGIN]: {
    userId: string
    userName: string
    token?: string
    avatar?: string
  }

  /** 用户信息更新事件数据 */
  [EventNames.USER_PROFILE_UPDATED]: {
    userId: string
    changes: Partial<{
      userName: string
      avatar: string
      phone: string
      email: string
    }>
  }

  /** API 错误事件数据 */
  [EventNames.API_ERROR]: {
    url: string
    method: string
    status: number
    message: string
  }
}
```

### 扩展事件名称

```typescript
// 业务模块扩展事件
const BusinessEventNames = {
  // 设备相关
  DEVICE_ADDED: 'device:added',
  DEVICE_UPDATED: 'device:updated',
  DEVICE_DELETED: 'device:deleted',
  DEVICE_STATUS_CHANGED: 'device:statusChanged',

  // 订单相关
  ORDER_CREATED: 'order:created',
  ORDER_PAID: 'order:paid',
  ORDER_SHIPPED: 'order:shipped',
  ORDER_COMPLETED: 'order:completed',
  ORDER_CANCELLED: 'order:cancelled',

  // 消息相关
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_READ: 'message:read',
  UNREAD_COUNT_CHANGED: 'message:unreadCountChanged',
} as const

// 合并事件名称
export const AllEventNames = {
  ...EventNames,
  ...BusinessEventNames,
} as const
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

### EventBus 类方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| on(event, callback) | 监听事件 | 取消监听函数 |
| off(event, callback?) | 移除监听，不传 callback 移除所有 | void |
| emit(event, ...args) | 触发事件 | boolean (是否执行无错误) |
| once(event, callback) | 一次性监听 | 取消监听函数 |
| getListenerCount(event) | 获取监听器数量 | number |
| clear() | 清除所有事件监听 | void |

### 类型定义

```typescript
/**
 * 事件回调函数类型
 */
interface EventCallback {
  (...args: any[]): void
}

/**
 * 事件映射表类型
 */
interface EventMap {
  [key: string]: EventCallback[]
}

/**
 * EventBus 类
 */
class EventBus {
  private events: EventMap

  on(event: string, callback: EventCallback): () => void
  off(event: string, callback?: EventCallback): void
  emit(event: string, ...args: any[]): boolean
  once(event: string, callback: EventCallback): () => void
  getListenerCount(event: string): number
  clear(): void
}

/**
 * useEventBus 返回值类型
 */
interface UseEventBusReturn {
  EventNames: typeof EventNames
  on: (event: string, callback: EventCallback) => () => void
  once: (event: string, callback: EventCallback) => () => void
  off: (event: string, callback?: EventCallback) => void
  emit: (event: string, ...args: any[]) => boolean
  getListenerCount: (event: string) => number
}
```

## EventBus 类

### 完整实现

```typescript
class EventBus {
  private events: EventMap = {}

  /**
   * 监听事件
   * @param event 事件名称
   * @param callback 事件回调函数
   * @returns 返回取消监听的函数
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
   * @param event 事件名称
   * @param callback 可选，指定的回调函数，不传则移除该事件的所有监听器
   */
  off(event: string, callback?: EventCallback): void {
    if (!this.events[event]) return

    if (callback) {
      const index = this.events[event].indexOf(callback)
      if (index > -1) {
        this.events[event].splice(index, 1)
        // 如果该事件没有监听器了，删除事件键
        if (this.events[event].length === 0) {
          delete this.events[event]
        }
      }
    } else {
      delete this.events[event]
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 传递给监听器的参数
   * @returns 返回是否成功执行（无错误）
   */
  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event] || this.events[event].length === 0) {
      return false
    }

    // 复制回调数组，防止在遍历时修改
    const callbacks = [...this.events[event]]
    let hasError = false

    callbacks.forEach((callback) => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`事件 ${event} 的回调执行出错:`, error)
        hasError = true
      }
    })

    return !hasError
  }

  /**
   * 只监听一次事件
   * @param event 事件名称
   * @param callback 事件回调函数
   * @returns 返回取消监听的函数
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
   * @param event 事件名称
   * @returns 监听器数量
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

// 全局事件总线实例（单例）
const eventBus = new EventBus()
```

### useEventBus 实现

```typescript
import { onUnmounted } from 'vue'

export function useEventBus() {
  // 存储当前组件注册的所有取消函数
  const unsubscribers: (() => void)[] = []

  /**
   * 自动清理版本的事件监听
   * 组件卸载时会自动清理此监听器
   */
  const on = (event: string, callback: EventCallback) => {
    const unsubscribe = eventBus.on(event, callback)
    unsubscribers.push(unsubscribe)
    return unsubscribe
  }

  /**
   * 自动清理版本的一次性事件监听
   * 组件卸载时会自动清理此监听器（如果还未触发）
   */
  const once = (event: string, callback: EventCallback) => {
    const unsubscribe = eventBus.once(event, callback)
    unsubscribers.push(unsubscribe)
    return unsubscribe
  }

  // 组件卸载时自动清理所有监听器
  onUnmounted(() => {
    unsubscribers.forEach((fn) => fn())
    unsubscribers.length = 0
  })

  return {
    EventNames,
    on,
    once,
    off: eventBus.off.bind(eventBus),
    emit: eventBus.emit.bind(eventBus),
    getListenerCount: eventBus.getListenerCount.bind(eventBus),
  }
}
```

## 最佳实践

### 1. 用户状态同步

```vue
<!-- 登录页面 -->
<script lang="ts" setup>
import { useEventBus } from '@/composables/useEventBus'
import { useUserStore } from '@/stores/user'

const { emit, EventNames } = useEventBus()
const userStore = useUserStore()

const handleLoginSuccess = async (loginData) => {
  // 保存用户信息
  await userStore.setUserInfo(loginData)

  // 触发用户登录事件，通知所有页面
  emit(EventNames.USER_LOGIN, {
    userId: loginData.userId,
    userName: loginData.userName,
    token: loginData.token,
    avatar: loginData.avatar
  })

  // 跳转首页
  uni.switchTab({ url: '/pages/index/index' })
}

const handleLogout = () => {
  // 清除用户信息
  userStore.clearUserInfo()

  // 触发退出事件
  emit(EventNames.USER_LOGOUT)

  // 跳转登录页
  uni.reLaunch({ url: '/pages/login/login' })
}
</script>
```

```vue
<!-- 个人中心页面 -->
<script lang="ts" setup>
import { ref } from 'vue'
import { useEventBus } from '@/composables/useEventBus'

const { on, EventNames } = useEventBus()

const userInfo = ref(null)

// 监听用户登录事件
on(EventNames.USER_LOGIN, (user) => {
  console.log('用户登录:', user)
  userInfo.value = user
  loadUserData()
})

// 监听用户信息更新事件
on(EventNames.USER_PROFILE_UPDATED, ({ userId, changes }) => {
  if (userInfo.value?.userId === userId) {
    userInfo.value = { ...userInfo.value, ...changes }
  }
})

// 监听退出登录事件
on(EventNames.USER_LOGOUT, () => {
  userInfo.value = null
})
</script>
```

### 2. 网络状态监听

```vue
<!-- App.vue -->
<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { useEventBus } from '@/composables/useEventBus'

const { emit, EventNames } = useEventBus()

// 网络状态变化回调
const onNetworkChange = (res: UniApp.OnNetworkStatusChangeSuccess) => {
  emit(EventNames.NETWORK_STATUS_CHANGED, {
    isConnected: res.isConnected,
    networkType: res.networkType
  })

  // 断网提示
  if (!res.isConnected) {
    uni.showToast({
      title: '网络连接已断开',
      icon: 'none',
      duration: 3000
    })
  }
}

onMounted(() => {
  // 监听网络状态变化
  uni.onNetworkStatusChange(onNetworkChange)

  // 获取初始网络状态
  uni.getNetworkType({
    success: (res) => {
      emit(EventNames.NETWORK_STATUS_CHANGED, {
        isConnected: res.networkType !== 'none',
        networkType: res.networkType
      })
    }
  })
})

onUnmounted(() => {
  // H5 环境下移除监听
  // #ifdef H5
  uni.offNetworkStatusChange(onNetworkChange)
  // #endif
})
</script>
```

```vue
<!-- 需要网络状态的组件 -->
<script lang="ts" setup>
import { ref } from 'vue'
import { useEventBus } from '@/composables/useEventBus'

const { on, EventNames } = useEventBus()

const isOnline = ref(true)
const networkType = ref('')

// 监听网络状态变化
on(EventNames.NETWORK_STATUS_CHANGED, ({ isConnected, networkType: type }) => {
  isOnline.value = isConnected
  networkType.value = type || ''

  if (!isConnected) {
    // 显示离线提示
    showOfflineUI()
  } else {
    // 网络恢复，刷新数据
    refreshData()
  }
})

const showOfflineUI = () => {
  // 显示离线状态 UI
}

const refreshData = () => {
  // 刷新数据
}
</script>
```

### 3. Tab 切换联动

```vue
<!-- TabBar 页面 -->
<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useEventBus } from '@/composables/useEventBus'

const { emit, EventNames } = useEventBus()

const activeTab = ref(0)

// 监听 Tab 切换
watch(activeTab, (newVal, oldVal) => {
  emit(EventNames.TAB_CHANGED, {
    from: oldVal,
    to: newVal
  })
})
</script>
```

```vue
<!-- 子组件响应 Tab 切换 -->
<script lang="ts" setup>
import { ref } from 'vue'
import { useEventBus } from '@/composables/useEventBus'

const { on, EventNames } = useEventBus()

const MY_TAB_INDEX = 1 // 当前组件所在 Tab 索引

// 监听 Tab 切换事件
on(EventNames.TAB_CHANGED, ({ from, to }) => {
  // 切换到当前 Tab 时刷新数据
  if (to === MY_TAB_INDEX) {
    console.log(`从 Tab ${from} 切换到 Tab ${to}`)
    refreshData()
  }

  // 离开当前 Tab 时清理临时状态
  if (from === MY_TAB_INDEX) {
    clearTempState()
  }
})

const refreshData = () => {
  // 刷新数据逻辑
}

const clearTempState = () => {
  // 清理临时状态逻辑
}
</script>
```

### 4. 全局 API 错误处理

```typescript
// http.ts - 请求拦截器
import { useEventBus } from '@/composables/useEventBus'

const { emit, EventNames } = useEventBus()

// 响应拦截器
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 触发 API 错误事件
    emit(EventNames.API_ERROR, {
      url: error.config?.url || '',
      method: error.config?.method || '',
      status: error.response?.status || 0,
      message: error.message || '请求失败'
    })

    return Promise.reject(error)
  }
)
```

```vue
<!-- 全局错误监控组件 -->
<script lang="ts" setup>
import { useEventBus } from '@/composables/useEventBus'

const { on, EventNames } = useEventBus()

// 监听 API 错误
on(EventNames.API_ERROR, ({ url, status, message }) => {
  console.error(`API 错误: ${url}, 状态: ${status}, 消息: ${message}`)

  // 根据错误类型处理
  if (status === 401) {
    // 未授权，跳转登录
    uni.reLaunch({ url: '/pages/login/login' })
  } else if (status === 403) {
    // 无权限
    uni.showToast({ title: '无访问权限', icon: 'none' })
  } else if (status >= 500) {
    // 服务器错误
    uni.showToast({ title: '服务器错误，请稍后重试', icon: 'none' })
  }

  // 上报错误日志
  reportError({ url, status, message })
})
</script>
```

### 5. 消息通知系统

```typescript
// 消息事件扩展
const MessageEventNames = {
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_READ: 'message:read',
  UNREAD_COUNT_CHANGED: 'message:unreadCountChanged',
} as const

// 消息事件数据类型
interface MessageEventPayloads {
  [MessageEventNames.MESSAGE_RECEIVED]: {
    id: string
    type: 'system' | 'chat' | 'notice'
    title: string
    content: string
    time: number
  }
  [MessageEventNames.MESSAGE_READ]: {
    ids: string[]
  }
  [MessageEventNames.UNREAD_COUNT_CHANGED]: {
    count: number
  }
}
```

```vue
<!-- 消息中心页面 -->
<script lang="ts" setup>
import { ref } from 'vue'
import { useEventBus } from '@/composables/useEventBus'

const { on, emit, EventNames } = useEventBus()

const messages = ref([])
const unreadCount = ref(0)

// 监听新消息
on('message:received', (message) => {
  messages.value.unshift(message)
  unreadCount.value++

  // 触发未读数变化
  emit('message:unreadCountChanged', { count: unreadCount.value })

  // 显示通知
  showNotification(message)
})

// 监听消息已读
on('message:read', ({ ids }) => {
  messages.value.forEach((msg) => {
    if (ids.includes(msg.id)) {
      msg.read = true
    }
  })
  unreadCount.value = messages.value.filter((m) => !m.read).length

  emit('message:unreadCountChanged', { count: unreadCount.value })
})

const showNotification = (message) => {
  uni.showToast({
    title: message.title,
    icon: 'none'
  })
}
</script>
```

### 6. 调试与监控

```typescript
import { useEventBus } from '@/composables/useEventBus'

// 开发环境调试工具
export const useEventBusDebug = () => {
  const { on, emit, getListenerCount, EventNames } = useEventBus()

  // 打印所有事件监听器数量
  const printListenerCounts = () => {
    console.group('事件监听器统计')
    Object.values(EventNames).forEach((eventName) => {
      const count = getListenerCount(eventName)
      if (count > 0) {
        console.log(`${eventName}: ${count} 个监听器`)
      }
    })
    console.groupEnd()
  }

  // 监听所有事件（调试用）
  const watchAllEvents = () => {
    Object.values(EventNames).forEach((eventName) => {
      on(eventName, (...args) => {
        console.log(`[EventBus] ${eventName}`, args)
      })
    })
  }

  // 检测潜在的内存泄漏
  const checkMemoryLeak = () => {
    Object.values(EventNames).forEach((eventName) => {
      const count = getListenerCount(eventName)
      if (count > 10) {
        console.warn(`[内存泄漏警告] 事件 ${eventName} 有 ${count} 个监听器`)
      }
    })
  }

  return {
    printListenerCounts,
    watchAllEvents,
    checkMemoryLeak
  }
}
```

## 常见问题

### 1. 事件监听器未被清理？

**问题原因:**
- 直接使用全局 `eventBus` 实例而非 `useEventBus()`
- 在组件外部注册监听器

**解决方案:**

```typescript
// ❌ 错误：直接使用全局实例
import { eventBus } from '@/composables/useEventBus'
eventBus.on('someEvent', handler) // 不会自动清理

// ✅ 正确：使用 useEventBus 组合函数
import { useEventBus } from '@/composables/useEventBus'
const { on } = useEventBus()
on('someEvent', handler) // 组件卸载时自动清理
```

### 2. 事件触发顺序？

事件按照监听器注册的顺序依次执行。如果某个回调抛出异常，不会影响其他回调的执行。

```typescript
const { on, emit } = useEventBus()

// 按注册顺序执行
on('test', () => console.log('1')) // 第一个执行
on('test', () => console.log('2')) // 第二个执行
on('test', () => { throw new Error('error') }) // 抛出异常但不中断
on('test', () => console.log('3')) // 第三个仍会执行

emit('test')
// 输出: 1, 2, 错误日志, 3
```

### 3. 如何自定义事件名称？

可以直接使用字符串作为事件名称，但建议在 `EventNames` 中定义常量：

```typescript
// 方式1：扩展事件名称常量
const MyEventNames = {
  ...EventNames,
  CUSTOM_EVENT: 'customEvent',
  ANOTHER_EVENT: 'anotherEvent',
} as const

const { on, emit } = useEventBus()

on(MyEventNames.CUSTOM_EVENT, (data) => {
  console.log('自定义事件:', data)
})

emit(MyEventNames.CUSTOM_EVENT, { key: 'value' })

// 方式2：使用命名空间
on('myModule:customEvent', handler)
emit('myModule:customEvent', data)
```

### 4. 事件数据类型检查？

通过 `EventPayloads` 接口定义事件数据类型，获得更好的类型提示：

```typescript
// 定义事件数据类型
interface MyEventPayloads {
  [EventNames.USER_LOGIN]: {
    userId: string
    userName: string
  }
  ['order:created']: {
    orderId: string
    amount: number
  }
}

// 类型安全的事件监听
type TypedEventCallback<T> = (data: T) => void

const onUserLogin = (callback: TypedEventCallback<MyEventPayloads[typeof EventNames.USER_LOGIN]>) => {
  return on(EventNames.USER_LOGIN, callback)
}

// 使用
onUserLogin(({ userId, userName }) => {
  // userId 和 userName 有正确的类型提示
})
```

### 5. 跨页面通信不生效？

**问题原因:**
- 页面已卸载，监听器被清理
- 事件在监听器注册前触发
- 使用了不同的事件名称

**解决方案:**

```typescript
// 1. 确保在目标页面挂载时监听
onMounted(() => {
  on(EventNames.PAGE_REFRESH, handleRefresh)
})

// 2. 对于需要在页面栈中传递的事件，考虑使用 uni.$emit
// 发送
uni.$emit('customEvent', data)
// 接收
uni.$on('customEvent', handler)
// 移除
uni.$off('customEvent', handler)

// 3. 确保事件名称一致
const EVENT_NAME = 'pageRefresh' // 使用常量避免拼写错误
```

### 6. 如何在非组件中使用？

```typescript
// 非组件文件中直接导入全局实例
import { eventBus, EventNames } from '@/composables/useEventBus'

// 注意：需要手动管理清理
const handler = (data) => {
  console.log('收到事件:', data)
}

// 添加监听
const unsubscribe = eventBus.on(EventNames.USER_LOGIN, handler)

// 在适当时机手动移除
unsubscribe()
// 或
eventBus.off(EventNames.USER_LOGIN, handler)
```

### 7. 如何实现事件优先级？

EventBus 默认不支持优先级，但可以通过包装实现：

```typescript
class PriorityEventBus {
  private events: Map<string, Array<{ callback: Function; priority: number }>> = new Map()

  on(event: string, callback: Function, priority = 0) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    const listeners = this.events.get(event)!
    listeners.push({ callback, priority })
    // 按优先级排序（高优先级先执行）
    listeners.sort((a, b) => b.priority - a.priority)

    return () => this.off(event, callback)
  }

  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event)
    if (!listeners) return false

    listeners.forEach(({ callback }) => {
      callback(...args)
    })
    return true
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.events.delete(event)
      return
    }
    const listeners = this.events.get(event)
    if (listeners) {
      const index = listeners.findIndex((l) => l.callback === callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
}
```

### 8. 如何防止事件重复触发？

```typescript
import { ref } from 'vue'
import { useEventBus } from '@/composables/useEventBus'

const { on, emit } = useEventBus()

// 方式1：使用节流
const throttle = (fn: Function, delay: number) => {
  let timer: number | null = null
  return (...args: any[]) => {
    if (timer) return
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

on('scroll', throttle((e) => {
  console.log('滚动事件:', e)
}, 100))

// 方式2：使用防抖
const debounce = (fn: Function, delay: number) => {
  let timer: number | null = null
  return (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

on('search', debounce((keyword) => {
  console.log('搜索:', keyword)
}, 300))

// 方式3：使用标记防止重复
const isProcessing = ref(false)

on('submit', async (data) => {
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    await submitData(data)
  } finally {
    isProcessing.value = false
  }
})
```
