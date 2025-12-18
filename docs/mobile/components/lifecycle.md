# 组件生命周期

## 介绍

本文档详细介绍 RuoYi-Plus-UniApp 项目中 Vue 3 组件和 UniApp 页面的生命周期，包括各个钩子函数的执行时机、使用场景和注意事项。

**核心内容:**

- **Vue 3 组件生命周期** - setup、挂载、更新、卸载阶段
- **UniApp 页面生命周期** - onLoad、onShow、onHide 等
- **UniApp 应用生命周期** - onLaunch、onShow、onHide
- **生命周期执行顺序** - 各钩子的执行时序
- **常见使用场景** - 数据获取、事件监听、资源清理

## Vue 3 组件生命周期

### 生命周期图示

```
创建阶段
    │
    ▼
┌─────────────┐
│   setup()   │ ← 组合式 API 入口
└─────────────┘
    │
    ▼
┌─────────────┐
│ onBeforeMount│ ← 挂载前
└─────────────┘
    │
    ▼
┌─────────────┐
│  onMounted  │ ← 挂载完成（可访问 DOM）
└─────────────┘
    │
    ▼
更新阶段 ←──────────┐
    │               │
    ▼               │
┌─────────────┐     │
│onBeforeUpdate│    │ ← 数据变化触发
└─────────────┘     │
    │               │
    ▼               │
┌─────────────┐     │
│  onUpdated  │ ────┘
└─────────────┘
    │
    ▼
卸载阶段
    │
    ▼
┌─────────────┐
│onBeforeUnmount│ ← 卸载前
└─────────────┘
    │
    ▼
┌─────────────┐
│ onUnmounted │ ← 卸载完成
└─────────────┘
```

### setup 阶段

`setup` 是组合式 API 的入口，在组件实例创建时执行：

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

// setup 阶段执行的代码
console.log('setup 执行')

// 响应式数据初始化
const count = ref(0)
const user = ref(null)

// 计算属性定义
const doubleCount = computed(() => count.value * 2)

// 方法定义
const increment = () => {
  count.value++
}

// 注意：此时无法访问 DOM
// document.querySelector('.xxx') // 可能为 null
</script>
```

**执行时机：**
- 在 `beforeCreate` 和 `created` 之间执行
- Props 已解析完成
- 无法访问 DOM 元素

**适合的操作：**
- 响应式数据初始化
- 计算属性定义
- 方法定义
- 组合式函数调用

### onBeforeMount

组件挂载到 DOM 之前调用：

```vue
<script lang="ts" setup>
import { onBeforeMount } from 'vue'

onBeforeMount(() => {
  console.log('组件即将挂载')
  // 此时 DOM 还未渲染
})
</script>
```

**执行时机：**
- setup 执行完成后
- 模板编译完成
- DOM 尚未创建

**适合的操作：**
- 挂载前的最后准备
- 很少使用

### onMounted

组件挂载完成后调用：

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const chartRef = ref<HTMLElement | null>(null)
const listData = ref([])

onMounted(() => {
  console.log('组件已挂载')

  // 可以访问 DOM 元素
  console.log(chartRef.value)

  // 初始化第三方库
  initChart()

  // 获取数据
  fetchData()

  // 添加事件监听
  window.addEventListener('resize', handleResize)
})

const initChart = () => {
  if (chartRef.value) {
    // 初始化图表
  }
}

const fetchData = async () => {
  const res = await api.getList()
  listData.value = res.data
}

const handleResize = () => {
  // 处理窗口大小变化
}
</script>

<template>
  <view ref="chartRef" class="chart"></view>
</template>
```

**执行时机：**
- DOM 已渲染完成
- 子组件也已挂载
- 可以访问 DOM 元素

**适合的操作：**
- 访问/操作 DOM
- 初始化第三方库
- 发起 API 请求
- 添加事件监听
- 启动定时器

### onBeforeUpdate

响应式数据变化导致重新渲染前调用：

```vue
<script lang="ts" setup>
import { ref, onBeforeUpdate } from 'vue'

const count = ref(0)

onBeforeUpdate(() => {
  console.log('组件即将更新')
  console.log('当前 DOM 中的值:', document.querySelector('.count')?.textContent)
  console.log('新的数据值:', count.value)
})
</script>

<template>
  <view class="count">{{ count }}</view>
  <button @click="count++">增加</button>
</template>
```

**执行时机：**
- 响应式数据变化后
- DOM 更新之前

**适合的操作：**
- 访问更新前的 DOM 状态
- 很少使用

### onUpdated

DOM 更新完成后调用：

```vue
<script lang="ts" setup>
import { ref, onUpdated } from 'vue'

const messages = ref<string[]>([])
const listRef = ref<HTMLElement | null>(null)

onUpdated(() => {
  console.log('组件已更新')

  // 列表更新后滚动到底部
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight
  }
})

const addMessage = (msg: string) => {
  messages.value.push(msg)
}
</script>

<template>
  <view ref="listRef" class="message-list">
    <view v-for="msg in messages" :key="msg">{{ msg }}</view>
  </view>
</template>
```

**执行时机：**
- 任何响应式数据变化导致的 DOM 更新后
- 可能多次触发

**适合的操作：**
- 访问更新后的 DOM
- 执行依赖 DOM 的操作

**注意事项：**
- 不要在此修改响应式数据（可能导致无限循环）

### onBeforeUnmount

组件卸载之前调用：

```vue
<script lang="ts" setup>
import { onBeforeUnmount } from 'vue'

onBeforeUnmount(() => {
  console.log('组件即将卸载')

  // 清理工作
  // 此时组件实例仍然可用
})
</script>
```

**执行时机：**
- 组件即将被卸载
- 组件实例仍然完全可用

**适合的操作：**
- 准备清理工作

### onUnmounted

组件卸载完成后调用：

```vue
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const timer = ref<number | null>(null)

onMounted(() => {
  // 启动定时器
  timer.value = setInterval(() => {
    console.log('定时任务')
  }, 1000)

  // 添加事件监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  console.log('组件已卸载')

  // 清除定时器
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }

  // 移除事件监听
  window.removeEventListener('resize', handleResize)

  // 断开 WebSocket 连接
  // ws.close()

  // 取消未完成的请求
  // abortController.abort()
})

const handleResize = () => {
  // 处理窗口大小变化
}
</script>
```

**执行时机：**
- 组件完全卸载
- 所有子组件已卸载
- 所有响应式效果已停止

**适合的操作：**
- 清除定时器
- 移除事件监听
- 取消订阅
- 断开连接
- 释放资源

## UniApp 页面生命周期

### 页面生命周期钩子

```vue
<script lang="ts" setup>
import { onLoad, onShow, onHide, onUnload, onReady } from '@dcloudio/uni-app'
import { onMounted, onUnmounted } from 'vue'

// Vue 生命周期
onMounted(() => {
  console.log('1. Vue onMounted')
})

// UniApp 页面生命周期
onLoad((options) => {
  console.log('2. 页面加载', options)
  // options 包含页面参数
  // 如：pages/detail/detail?id=123
  // options = { id: '123' }
})

onReady(() => {
  console.log('3. 页面初次渲染完成')
})

onShow(() => {
  console.log('4. 页面显示')
})

onHide(() => {
  console.log('5. 页面隐藏')
})

onUnload(() => {
  console.log('6. 页面卸载')
})

onUnmounted(() => {
  console.log('7. Vue onUnmounted')
})
</script>
```

### onLoad

页面加载时触发：

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const detailId = ref('')
const detailData = ref(null)

onLoad((options) => {
  // 获取页面参数
  if (options?.id) {
    detailId.value = options.id
    loadDetail(options.id)
  }

  // 处理场景值（小程序）
  if (options?.scene) {
    handleScene(options.scene)
  }
})

const loadDetail = async (id: string) => {
  const res = await api.getDetail(id)
  detailData.value = res.data
}

const handleScene = (scene: string) => {
  // 处理扫码等场景
  const params = decodeURIComponent(scene)
  console.log('场景参数:', params)
}
</script>
```

**执行时机：**
- 页面加载时
- 仅执行一次（页面被缓存时不再触发）

**参数：**
- `options`: 页面路径参数

### onShow

页面显示时触发：

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const cartCount = ref(0)

onShow(() => {
  console.log('页面显示')

  // 每次显示时刷新数据
  refreshCartCount()

  // 检查登录状态
  checkLoginStatus()
})

const refreshCartCount = async () => {
  const res = await api.getCartCount()
  cartCount.value = res.data
}

const checkLoginStatus = () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    // 未登录处理
  }
}
</script>
```

**执行时机：**
- 页面首次显示
- 从其他页面返回
- 从后台切到前台

**适合的操作：**
- 刷新页面数据
- 检查状态变化
- 恢复动画/音视频

### onHide

页面隐藏时触发：

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { onHide } from '@dcloudio/uni-app'

const videoContext = ref(null)

onHide(() => {
  console.log('页面隐藏')

  // 暂停视频播放
  if (videoContext.value) {
    videoContext.value.pause()
  }

  // 保存草稿
  saveDraft()

  // 暂停定位
  stopLocationUpdate()
})

const saveDraft = () => {
  const draft = { /* 草稿数据 */ }
  uni.setStorageSync('draft', draft)
}

const stopLocationUpdate = () => {
  uni.stopLocationUpdate()
}
</script>
```

**执行时机：**
- 跳转到其他页面
- 切到后台
- 页面被覆盖

**适合的操作：**
- 暂停媒体播放
- 保存临时数据
- 停止位置更新

### onUnload

页面卸载时触发：

```vue
<script lang="ts" setup>
import { onUnload } from '@dcloudio/uni-app'

onUnload(() => {
  console.log('页面卸载')

  // 清理资源
  cleanup()

  // 取消请求
  cancelRequests()
})

const cleanup = () => {
  // 清理 WebSocket
  // 清理定时器
  // 移除事件监听
}

const cancelRequests = () => {
  // 取消未完成的网络请求
}
</script>
```

**执行时机：**
- `uni.navigateBack` 返回
- `uni.redirectTo` 重定向
- `uni.reLaunch` 重启应用

### onReady

页面初次渲染完成时触发：

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { onReady } from '@dcloudio/uni-app'

const canvasContext = ref(null)

onReady(() => {
  console.log('页面渲染完成')

  // 可以操作页面元素
  initCanvas()

  // 获取节点信息
  getNodeInfo()
})

const initCanvas = () => {
  canvasContext.value = uni.createCanvasContext('myCanvas')
  // 绑画操作
}

const getNodeInfo = () => {
  uni.createSelectorQuery()
    .select('.my-element')
    .boundingClientRect((rect) => {
      console.log('元素信息:', rect)
    })
    .exec()
}
</script>
```

**执行时机：**
- 页面首次渲染完成
- 仅触发一次

**适合的操作：**
- 操作 Canvas
- 获取节点信息
- 初始化需要 DOM 的第三方库

## UniApp 应用生命周期

### App.vue 中的生命周期

```vue
<!-- App.vue -->
<script lang="ts" setup>
import { onLaunch, onShow, onHide, onError } from '@dcloudio/uni-app'

onLaunch((options) => {
  console.log('应用启动', options)

  // 初始化配置
  initApp()

  // 检查更新（小程序）
  checkUpdate()

  // 获取系统信息
  getSystemInfo()
})

onShow((options) => {
  console.log('应用显示', options)

  // 从后台切回前台
  // 可以处理推送点击等场景
  if (options?.path) {
    handleDeepLink(options)
  }
})

onHide(() => {
  console.log('应用隐藏')

  // 切到后台
  // 保存应用状态
  saveAppState()
})

onError((error) => {
  console.error('应用错误', error)

  // 上报错误
  reportError(error)
})

const initApp = () => {
  // 初始化 SDK
  // 加载全局配置
}

const checkUpdate = () => {
  // #ifdef MP-WEIXIN
  const updateManager = uni.getUpdateManager()
  updateManager.onCheckForUpdate((res) => {
    if (res.hasUpdate) {
      console.log('有新版本')
    }
  })
  updateManager.onUpdateReady(() => {
    uni.showModal({
      title: '更新提示',
      content: '新版本已准备好，是否重启应用？',
      success: (res) => {
        if (res.confirm) {
          updateManager.applyUpdate()
        }
      }
    })
  })
  // #endif
}

const getSystemInfo = () => {
  const systemInfo = uni.getSystemInfoSync()
  console.log('系统信息:', systemInfo)
}

const handleDeepLink = (options: any) => {
  // 处理深度链接
}

const saveAppState = () => {
  // 保存应用状态
}

const reportError = (error: string) => {
  // 上报错误到服务器
}
</script>
```

## 生命周期执行顺序

### 页面首次加载

```
App onLaunch
    ↓
App onShow
    ↓
Page setup
    ↓
Page onLoad
    ↓
Page onMounted
    ↓
Page onShow
    ↓
Page onReady
```

### 页面跳转

```
当前页面 onHide
    ↓
新页面 setup
    ↓
新页面 onLoad
    ↓
新页面 onMounted
    ↓
新页面 onShow
    ↓
新页面 onReady
```

### 页面返回

```
当前页面 onUnload
    ↓
当前页面 onUnmounted
    ↓
上一页面 onShow
```

### 应用切到后台

```
当前页面 onHide
    ↓
App onHide
```

### 应用切回前台

```
App onShow
    ↓
当前页面 onShow
```

## 常见使用场景

### 数据获取模式

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'

const listData = ref([])
const pageParams = ref<Record<string, string>>({})

// 方式一：onLoad 中获取（仅首次）
onLoad((options) => {
  pageParams.value = options || {}
  fetchData()
})

// 方式二：onShow 中获取（每次显示）
onShow(() => {
  refreshData()
})

// 首次加载
const fetchData = async () => {
  const res = await api.getList(pageParams.value)
  listData.value = res.data
}

// 刷新数据（可能只需要部分数据）
const refreshData = async () => {
  // 只刷新需要实时更新的数据
  const res = await api.getStatus()
  // 更新状态
}
</script>
```

### 资源管理模式

```vue
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'

const timer = ref<number | null>(null)
const ws = ref<WebSocket | null>(null)

// 初始化资源
onMounted(() => {
  // 创建 WebSocket 连接
  ws.value = new WebSocket('wss://example.com')

  // 启动定时器
  timer.value = setInterval(heartbeat, 30000)
})

// 页面显示时恢复
onShow(() => {
  if (ws.value?.readyState === WebSocket.CLOSED) {
    reconnect()
  }
})

// 页面隐藏时暂停
onHide(() => {
  // 可选：暂停某些操作
})

// 清理资源
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  if (ws.value) {
    ws.value.close()
  }
})

const heartbeat = () => {
  ws.value?.send(JSON.stringify({ type: 'ping' }))
}

const reconnect = () => {
  ws.value = new WebSocket('wss://example.com')
}
</script>
```

### 页面状态恢复

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad, onUnload, onShow } from '@dcloudio/uni-app'

const formData = ref({
  title: '',
  content: ''
})

const DRAFT_KEY = 'form_draft'

// 加载草稿
onLoad(() => {
  const draft = uni.getStorageSync(DRAFT_KEY)
  if (draft) {
    formData.value = draft
  }
})

// 页面显示时检查
onShow(() => {
  // 可以检查是否有新的草稿
})

// 页面卸载时保存
onUnload(() => {
  if (formData.value.title || formData.value.content) {
    uni.setStorageSync(DRAFT_KEY, formData.value)
  }
})

// 提交成功后清除草稿
const submit = async () => {
  await api.submit(formData.value)
  uni.removeStorageSync(DRAFT_KEY)
}
</script>
```

## 最佳实践

### 1. 合理选择生命周期

```typescript
// 初始化操作 → onLoad/onMounted
// 每次显示刷新 → onShow
// 资源清理 → onUnload/onUnmounted
// DOM 操作 → onReady/onMounted
```

### 2. 避免在 setup 中执行异步操作

```typescript
// ❌ 不推荐
const data = await fetchData() // setup 中不应直接 await

// ✅ 推荐
onMounted(async () => {
  data.value = await fetchData()
})
```

### 3. 配对使用创建和销毁

```typescript
onMounted(() => {
  window.addEventListener('resize', handler)
  timer = setInterval(tick, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', handler)
  clearInterval(timer)
})
```

## 常见问题

### 1. onLoad 和 onMounted 的区别？

- `onLoad`: UniApp 页面生命周期，可接收页面参数
- `onMounted`: Vue 组件生命周期，组件挂载完成

### 2. 页面缓存时生命周期表现？

使用 `keep-alive` 或 TabBar 页面：
- 首次进入：触发完整生命周期
- 再次进入：仅触发 `onShow`
- 离开：仅触发 `onHide`

### 3. 子组件的生命周期执行顺序？

```
父组件 setup
    ↓
父组件 onBeforeMount
    ↓
子组件 setup
    ↓
子组件 onBeforeMount
    ↓
子组件 onMounted
    ↓
父组件 onMounted
```
