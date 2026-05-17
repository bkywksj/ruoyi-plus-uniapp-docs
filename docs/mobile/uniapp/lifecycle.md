# 生命周期

## 概述

uni-app 的生命周期分为三类：
1. **应用生命周期**（App.vue）
2. **页面生命周期**（页面 .vue 文件）
3. **组件生命周期**（组件 .vue 文件）

## 应用生命周期

### 应用生命周期钩子

在 `App.vue` 中使用，管理整个应用的生命周期。

```vue
<script setup lang="ts">
// 应用启动
onLaunch((options) => {
  console.log('App Launch', options)
})

// 应用显示
onShow((options) => {
  console.log('App Show', options)
})

// 应用隐藏
onHide(() => {
  console.log('App Hide')
})

// 应用错误
onError((error) => {
  console.error('App Error', error)
})

// 页面未找到
onPageNotFound((res) => {
  console.log('Page Not Found', res)
})

// uni-app 主题切换
onThemeChange((res) => {
  console.log('Theme Change', res.theme)
})

// 未处理的 Promise 拒绝
onUnhandledRejection((res) => {
  console.warn('Unhandled Rejection', res)
})
</script>
```

### onLaunch

**触发时机**：应用初始化完成时触发（全局只触发一次）

**参数说明**：

```typescript
interface LaunchOptions {
  path: string          // 启动页面路径
  query: object        // 启动页面参数
  scene: number        // 启动场景值（小程序）
  shareTicket: string  // 分享票据（小程序）
  referrerInfo: object // 来源信息（小程序）
}
```

**使用场景**：

```vue
<script setup lang="ts">
onLaunch(async (options) => {
  console.log('启动路径:', options.path)
  console.log('启动参数:', options.query)

  // 1. 初始化应用配置
  await initializeApp()

  // 2. 检查更新
  checkUpdate()

  // 3. 初始化第三方SDK
  initThirdPartySDK()
})
</script>
```

**项目实践**：

```typescript
onLaunch(async () => {
  // 1. 初始化系统功能配置
  await featureStore.initFeatures()

  // 2. 初始化应用（租户ID、自动登录、WebSocket）
  await initializeApp()

  // 3. 检查应用更新
  checkUpdate()
})
```

### onShow

**触发时机**：
- 应用启动时
- 从后台切换到前台时

**参数说明**：与 onLaunch 相同

**使用场景**：

```vue
<script setup lang="ts">
onShow((options) => {
  console.log('应用显示')

  // 1. 刷新页面数据
  refreshData()

  // 2. 重连 WebSocket
  reconnectWebSocket()

  // 3. 检查登录状态
  checkLoginStatus()
})
</script>
```

**项目实践**：

```typescript
let isFirstLaunch = true

onShow(() => {
  console.log('👁️ 应用显示 - App Show')

  // 首次启动跳过（onLaunch 已处理）
  if (isFirstLaunch) {
    isFirstLaunch = false
    return
  }

  // 重新连接 WebSocket
  if (webSocket.initialize()) {
    webSocket.connect()
  }
})
```

### onHide

**触发时机**：应用从前台切换到后台时

**使用场景**：

```vue
<script setup lang="ts">
onHide(() => {
  console.log('应用隐藏')

  // 1. 保存应用状态
  saveAppState()

  // 2. 清理定时器
  clearTimers()

  // 3. 断开 WebSocket
  disconnectWebSocket()
})
</script>
```

### onError

**触发时机**：应用发生 JavaScript 错误时

**使用场景**：

```vue
<script setup lang="ts">
onError((error) => {
  console.error('应用错误:', error)

  // 1. 错误上报
  reportError(error)

  // 2. 用户提示
  showErrorToast('应用出现错误，请稍后重试')
})
</script>
```

### onPageNotFound

**触发时机**：页面不存在时（小程序、App）

**使用场景**：

```vue
<script setup lang="ts">
onPageNotFound((res) => {
  console.warn('页面未找到:', res.path)

  // 重定向到首页
  uni.redirectTo({
    url: '/pages/index/index'
  })
})
</script>
```

## 页面生命周期

### 页面生命周期钩子

在页面 `.vue` 文件中使用。

```vue
<script setup lang="ts">
// 页面加载
onLoad((options) => {
  console.log('Page Load', options)
})

// 页面显示
onShow(() => {
  console.log('Page Show')
})

// 页面初次渲染完成
onReady(() => {
  console.log('Page Ready')
})

// 页面隐藏
onHide(() => {
  console.log('Page Hide')
})

// 页面卸载
onUnload(() => {
  console.log('Page Unload')
})

// 下拉刷新
onPullDownRefresh(() => {
  console.log('Pull Down Refresh')
})

// 上拉触底
onReachBottom(() => {
  console.log('Reach Bottom')
})

// 页面滚动
onPageScroll((event) => {
  console.log('Page Scroll', event.scrollTop)
})

// 用户点击右上角分享
onShareAppMessage(() => {
  return {
    title: '分享标题',
    path: '/pages/index/index'
  }
})

// 用户点击右上角分享到朋友圈
onShareTimeline(() => {
  return {
    title: '分享到朋友圈的标题'
  }
})

// 页面尺寸变化
onResize((res) => {
  console.log('Page Resize', res.size)
})

// Tab 点击
onTabItemTap((item) => {
  console.log('Tab Item Tap', item.index)
})

// 监听用户点击页面内转发按钮
onAddToFavorites(() => {
  return {
    title: '收藏标题',
    imageUrl: '/static/logo.png'
  }
})
</script>
```

### onLoad

**触发时机**：页面加载时触发（只触发一次）

**参数说明**：页面参数对象

**使用场景**：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const detail = ref(null)

onLoad((options) => {
  const id = options.id
  console.log('页面参数 ID:', id)

  // 1. 获取页面参数
  // 2. 加载页面数据
  loadPageData(id)
})

const loadPageData = async (id: string) => {
  const res = await api.getDetail(id)
  detail.value = res.data
}
</script>
```

### onShow

**触发时机**：
- 页面显示/切入前台时触发
- 从其他页面返回时触发

**使用场景**：

```vue
<script setup lang="ts">
onShow(() => {
  console.log('页面显示')

  // 1. 刷新页面数据
  refreshData()

  // 2. 检查登录状态
  checkLogin()
})
</script>
```

**onLoad 与 onShow 的区别**：

| 生命周期 | 触发次数 | 使用场景 |
|---------|---------|---------|
| onLoad | 页面加载时触发一次 | 获取页面参数、初始化数据 |
| onShow | 每次页面显示时触发 | 刷新数据、检查状态 |

### onReady

**触发时机**：页面初次渲染完成时触发（只触发一次）

**使用场景**：

```vue
<script setup lang="ts">
onReady(() => {
  console.log('页面渲染完成')

  // 1. 获取节点信息
  const query = uni.createSelectorQuery()
  query.select('#container').boundingClientRect((data) => {
    console.log('容器高度:', data.height)
  }).exec()

  // 2. 设置导航栏
  uni.setNavigationBarTitle({
    title: '页面标题'
  })
})
</script>
```

### onHide

**触发时机**：页面隐藏/切入后台时触发

**使用场景**：

```vue
<script setup lang="ts">
onHide(() => {
  console.log('页面隐藏')

  // 1. 停止音视频播放
  stopMedia()

  // 2. 保存表单数据
  saveFormData()
})
</script>
```

### onUnload

**触发时机**：页面卸载时触发

**使用场景**：

```vue
<script setup lang="ts">
let timer: number | null = null

onLoad(() => {
  // 启动定时器
  timer = setInterval(() => {
    console.log('定时任务')
  }, 1000)
})

onUnload(() => {
  console.log('页面卸载')

  // 清理定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  // 清理其他资源
  cleanup()
})
</script>
```

### 下拉刷新

**配置**：

```typescript
// pages.config.ts 或 definePage
{
  style: {
    enablePullDownRefresh: true,
    backgroundTextStyle: 'dark'
  }
}
```

**使用**：

```vue
<script setup lang="ts">
const dataList = ref([])

onPullDownRefresh(async () => {
  console.log('下拉刷新')

  try {
    // 重新加载数据
    const res = await api.getList()
    dataList.value = res.data
  } finally {
    // 停止下拉刷新
    uni.stopPullDownRefresh()
  }
})
</script>
```

### 上拉加载

**配置**：

```typescript
{
  style: {
    onReachBottomDistance: 50  // 距底部50px时触发
  }
}
```

**使用**：

```vue
<script setup lang="ts">
const dataList = ref([])
const pageNum = ref(1)
const hasMore = ref(true)

onReachBottom(async () => {
  if (!hasMore.value) return

  console.log('上拉加载更多')

  pageNum.value++
  const res = await api.getList({ pageNum: pageNum.value })

  if (res.data.length === 0) {
    hasMore.value = false
  } else {
    dataList.value.push(...res.data)
  }
})
</script>
```

### 页面分享

**微信小程序分享到好友**：

```vue
<script setup lang="ts">
onShareAppMessage((options) => {
  console.log('分享来源:', options.from)  // button | menu

  return {
    title: '分享标题',
    path: '/pages/detail/detail?id=123',
    imageUrl: '/static/share.png'
  }
})
</script>
```

**微信小程序分享到朋友圈**：

```vue
<script setup lang="ts">
onShareTimeline(() => {
  return {
    title: '朋友圈标题',
    query: 'id=123',
    imageUrl: '/static/share.png'
  }
})
</script>
```

## 组件生命周期

组件使用 Vue 3 的生命周期钩子。

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'

// 组件挂载
onMounted(() => {
  console.log('Component Mounted')
})

// 组件卸载前
onBeforeUnmount(() => {
  console.log('Component Before Unmount')
})

// 监听 props 变化
const props = defineProps<{ userId: string }>()

watch(() => props.userId, (newId) => {
  console.log('User ID changed:', newId)
})
</script>
```

### Vue 3 组件生命周期

| 选项式 API | 组合式 API | 说明 |
|-----------|-----------|------|
| beforeCreate | - | setup() 本身 |
| created | - | setup() 本身 |
| beforeMount | onBeforeMount | 挂载前 |
| mounted | onMounted | 挂载完成 |
| beforeUpdate | onBeforeUpdate | 更新前 |
| updated | onUpdated | 更新完成 |
| beforeUnmount | onBeforeUnmount | 卸载前 |
| unmounted | onUnmounted | 卸载完成 |

## 生命周期执行顺序

### 应用启动流程

```text
App.vue: onLaunch
  ↓
App.vue: onShow
  ↓
首页: onLoad
  ↓
首页: onShow
  ↓
首页: onReady
```

### 页面跳转流程

**navigateTo（保留当前页）**：

```text
新页面: onLoad
  ↓
当前页: onHide
  ↓
新页面: onShow
  ↓
新页面: onReady
```

**返回上一页**：

```text
当前页: onUnload
  ↓
上一页: onShow
```

**redirectTo（关闭当前页）**：

```text
当前页: onUnload
  ↓
新页面: onLoad
  ↓
新页面: onShow
  ↓
新页面: onReady
```

**switchTab（切换 TabBar）**：

```text
当前页: onHide
  ↓
TabBar页: onShow（如已加载）
或
TabBar页: onLoad → onShow → onReady（首次加载）
```

## 实际应用示例

### 示例 1：列表页（分页加载）

```vue
<script setup lang="ts">
import { ref } from 'vue'

const dataList = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)

// 加载数据
const loadData = async (isRefresh = false) => {
  if (loading.value) return

  loading.value = true

  try {
    if (isRefresh) {
      pageNum.value = 1
      dataList.value = []
    }

    const res = await api.getList({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })

    if (isRefresh) {
      dataList.value = res.data.list
    } else {
      dataList.value.push(...res.data.list)
    }

    total.value = res.data.total
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

// 页面加载
onLoad(() => {
  loadData()
})

// 下拉刷新
onPullDownRefresh(() => {
  loadData(true)
})

// 上拉加载
onReachBottom(() => {
  if (dataList.value.length >= total.value) {
    return
  }

  pageNum.value++
  loadData()
})
</script>

<template>
  <view class="list-page">
    <view v-for="item in dataList" :key="item.id" class="list-item">
      {{ item.name }}
    </view>
  </view>
</template>
```

### 示例 2：详情页（带参数）

```vue
<script setup lang="ts">
import { ref } from 'vue'

const detail = ref(null)
const loading = ref(true)

// 加载详情
const loadDetail = async (id: string) => {
  loading.value = true

  try {
    const res = await api.getDetail(id)
    detail.value = res.data
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 页面加载
onLoad((options) => {
  const id = options.id
  if (id) {
    loadDetail(id)
  }
})

// 设置分享
onShareAppMessage(() => {
  return {
    title: detail.value?.title || '详情页',
    path: `/pages/detail/detail?id=${detail.value?.id}`
  }
})
</script>
```

### 示例 3：表单页（保存草稿）

```vue
<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  title: '',
  content: ''
})

// 从缓存恢复草稿
onLoad(() => {
  const draft = uni.getStorageSync('form_draft')
  if (draft) {
    formData.value = JSON.parse(draft)
  }
})

// 页面隐藏时保存草稿
onHide(() => {
  uni.setStorageSync('form_draft', JSON.stringify(formData.value))
})

// 提交成功后清除草稿
const handleSubmit = async () => {
  await api.submit(formData.value)

  // 清除草稿
  uni.removeStorageSync('form_draft')

  uni.navigateBack()
}
</script>
```

## 最佳实践

### 1. 合理使用 onLoad 和 onShow

```vue
<script setup lang="ts">
// ✅ 推荐：在 onLoad 获取参数，初始化数据
onLoad((options) => {
  const id = options.id
  loadData(id)
})

// ✅ 推荐：在 onShow 刷新数据
onShow(() => {
  refreshData()
})

// ❌ 不推荐：在 onShow 中获取路由参数
onShow(() => {
  // 路由参数在 onShow 中无法获取
})
</script>
```

### 2. 及时清理资源

```vue
<script setup lang="ts">
let timer: number | null = null
let socketTask: any = null

onLoad(() => {
  // 创建定时器
  timer = setInterval(() => {}, 1000)

  // 创建 WebSocket
  socketTask = uni.connectSocket({})
})

onUnload(() => {
  // ✅ 清理定时器
  if (timer) {
    clearInterval(timer)
  }

  // ✅ 关闭 WebSocket
  if (socketTask) {
    socketTask.close()
  }
})
</script>
```

### 3. 避免重复请求

```vue
<script setup lang="ts">
let loading = false

const loadData = async () => {
  if (loading) return  // ✅ 防止重复请求

  loading = true
  try {
    await api.getData()
  } finally {
    loading = false
  }
}

onPullDownRefresh(() => {
  loadData()
})
</script>
```

## 常见问题

### 1. onShow 和 onLoad 的区别？

**onLoad**：
- 页面加载时触发一次
- 可以获取页面参数
- 适合初始化数据

**onShow**：
- 每次页面显示时触发
- 无法获取页面参数
- 适合刷新数据

### 2. 页面返回如何刷新上一页？

**方法 1：使用 onShow**

```vue
<!-- 列表页 -->
<script setup lang="ts">
onShow(() => {
  // 每次显示都刷新
  loadData()
})
</script>
```

**方法 2：使用事件通信**

```typescript
// 详情页保存后
uni.$emit('refreshList')

// 列表页监听
onMounted(() => {
  uni.$on('refreshList', () => {
    loadData()
  })
})

onUnmounted(() => {
  uni.$off('refreshList')
})
```

### 3. 生命周期中可以使用 async/await 吗？

可以，但要注意错误处理：

```vue
<script setup lang="ts">
onLoad(async (options) => {
  try {
    await loadData(options.id)
  } catch (error) {
    console.error('加载失败:', error)
  }
})
</script>
```
