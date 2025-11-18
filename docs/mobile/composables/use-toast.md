# useToast 轻提示

## 介绍

`useToast` 是一个专为 UniApp 应用设计的轻量级消息提示 Composable,提供了优雅、灵活的全局消息提示功能。它基于 WD UI 的 Toast 组件,通过 Vue 3 Composition API 封装,为开发者提供了便捷的消息展示能力。

`useToast` 采用全局队列管理机制,支持同时显示多个 Toast 提示,并自动处理位置堆叠、层级管理和生命周期。它提供了五种预设的消息类型(成功、错误、警告、信息、加载),满足各种业务场景下的提示需求。

**核心特性:**

- **全局队列管理** - 基于 Map 数据结构管理所有活跃的 Toast 实例,支持多实例并发显示,自动维护队列状态
- **自动堆叠布局** - 智能计算每个 Toast 的垂直偏移量,同位置的多个 Toast 自动堆叠排列,避免重叠覆盖
- **层级自动管理** - 基于 BASE_Z_INDEX(1000)自动分配 zIndex,确保后显示的 Toast 始终在上层
- **单例模式缓存** - 每个 selector 对应唯一的 Toast 实例,通过全局缓存避免重复创建,提升性能
- **五种预设方法** - 提供 loading、success、error、warning、info 五种常用消息类型,开箱即用
- **自动关闭定时器** - 支持配置显示时长,到期自动关闭并清理资源,可设置 duration=0 实现手动关闭
- **位置动态更新** - Toast 关闭时自动重新计算剩余实例的偏移量,保持布局整齐
- **TypeScript 支持** - 完整的类型定义,包括 ToastOptions 接口、Toast 接口、类型别名等
- **平台兼容性** - 支持 H5、微信小程序、App 等多个 UniApp 平台,统一的 API 调用方式

## 基本用法

### 简单文本提示

最基础的用法是直接传入字符串作为提示内容:

```vue
<template>
  <view class="demo">
    <wd-button @click="showToast">显示提示</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showToast = () => {
  toast.show('这是一条简单的提示消息')
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `useToast()` 返回一个 Toast 实例对象,包含所有可用的方法
- `show()` 方法接受字符串参数时,会使用默认配置显示提示
- 默认显示时长为 2000ms(2秒),自动关闭
- 默认位置为 `middle-top`(中部偏上)

### 成功提示

使用 `success()` 方法显示成功消息,自动带有成功图标:

```vue
<template>
  <view class="demo">
    <wd-button type="success" @click="handleSuccess">
      提交表单
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleSuccess = async () => {
  // 模拟异步操作
  await submitForm()

  // 显示成功提示
  toast.success('提交成功')
}

const submitForm = () => {
  return new Promise(resolve => setTimeout(resolve, 1000))
}
</script>
```

**使用说明:**
- `success()` 方法预设了成功图标(iconName: 'success')
- 默认显示时长为 1500ms,比普通提示稍短
- 适用于操作成功、保存完成等场景
- 图标颜色默认为绿色,与成功语义一致

### 错误提示

使用 `error()` 方法显示错误消息:

```vue
<template>
  <view class="demo">
    <wd-button type="error" @click="handleDelete">
      删除数据
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleDelete = async () => {
  try {
    await deleteData()
    toast.success('删除成功')
  } catch (error) {
    // 显示错误提示
    toast.error('删除失败,请稍后重试')
  }
}

const deleteData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Network error')), 1000)
  })
}
</script>
```

**使用说明:**
- `error()` 方法预设了错误图标(iconName: 'error')
- 默认显示时长为 2000ms
- 适用于操作失败、网络错误、表单验证失败等场景
- 图标颜色默认为红色,醒目提示用户

### 警告提示

使用 `warning()` 方法显示警告消息:

```vue
<template>
  <view class="demo">
    <wd-button type="warning" @click="handleWarning">
      检查库存
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleWarning = () => {
  const stock = 5

  if (stock < 10) {
    toast.warning('库存不足,请及时补货')
  }
}
</script>
```

**使用说明:**
- `warning()` 方法预设了警告图标(iconName: 'warning')
- 默认显示时长为 2000ms
- 适用于风险提示、库存不足、权限受限等场景
- 图标颜色默认为橙色,表达警示含义

### 信息提示

使用 `info()` 方法显示普通信息:

```vue
<template>
  <view class="demo">
    <wd-button @click="handleInfo">
      查看帮助
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleInfo = () => {
  toast.info('长按列表项可进行更多操作')
}
</script>
```

**使用说明:**
- `info()` 方法预设了信息图标(iconName: 'info')
- 默认显示时长为 2000ms
- 适用于功能说明、操作提示、帮助信息等场景
- 图标颜色默认为蓝色,表达中性信息

### 加载提示

使用 `loading()` 方法显示加载状态,需要手动关闭:

```vue
<template>
  <view class="demo">
    <wd-button @click="handleLoad">
      加载数据
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleLoad = async () => {
  // 显示加载提示
  toast.loading('加载中...')

  try {
    await fetchData()

    // 关闭加载提示
    toast.close()

    // 显示成功提示
    toast.success('加载完成')
  } catch (error) {
    toast.close()
    toast.error('加载失败')
  }
}

const fetchData = () => {
  return new Promise(resolve => setTimeout(resolve, 2000))
}
</script>
```

**使用说明:**
- `loading()` 方法预设了加载图标(iconName: 'loading')和遮罩层(cover: true)
- 默认 duration 为 0,不会自动关闭,需要调用 `toast.close()` 手动关闭
- 遮罩层会阻止用户操作,防止重复提交
- 适用于数据加载、文件上传、网络请求等耗时操作
- 加载图标支持两种样式: `outline`(默认)和 `ring`

### 自定义配置

通过传入配置对象,自定义 Toast 的显示效果:

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomToast">
      自定义提示
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'
import type { ToastOptions } from '@/wd'

const toast = useToast()

const showCustomToast = () => {
  const options: ToastOptions = {
    msg: '自定义样式的提示消息',
    duration: 3000,
    position: 'bottom',
    iconName: 'success',
    iconSize: 48,
    iconColor: '#00c853',
    direction: 'horizontal',
  }

  toast.show(options)
}
</script>
```

**使用说明:**
- 所有预设方法(success、error等)都支持传入配置对象
- 传入对象时,会与预设配置进行深度合并
- `duration` 控制显示时长,单位为毫秒
- `position` 可选值: `top`、`middle-top`、`middle`、`bottom`
- `direction` 控制图标和文字的排列方向: `vertical`(垂直)或 `horizontal`(水平)
- `iconSize` 和 `iconColor` 可自定义图标大小和颜色

### 多个 Toast 堆叠

系统自动处理多个 Toast 的堆叠显示:

```vue
<template>
  <view class="demo">
    <wd-button @click="showMultipleToasts">
      显示多条提示
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showMultipleToasts = () => {
  // 连续显示多条提示
  toast.info('第一条消息')

  setTimeout(() => {
    toast.success('第二条消息')
  }, 500)

  setTimeout(() => {
    toast.warning('第三条消息')
  }, 1000)
}
</script>
```

**使用说明:**
- 相同位置的多个 Toast 会自动垂直堆叠,不会重叠
- 每个 Toast 的偏移量自动计算: `offsetY = index * TOAST_HEIGHT(60px)`
- zIndex 自动递增,确保后显示的 Toast 在上层
- Toast 关闭时,下方的 Toast 会自动上移,填补空隙
- 全局队列管理确保所有 Toast 的位置始终正确

### 不同位置的 Toast

在不同位置显示 Toast:

```vue
<template>
  <view class="demo">
    <wd-button @click="showTop">顶部提示</wd-button>
    <wd-button @click="showMiddle">中部提示</wd-button>
    <wd-button @click="showBottom">底部提示</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showTop = () => {
  toast.show({
    msg: '顶部提示消息',
    position: 'top',
  })
}

const showMiddle = () => {
  toast.show({
    msg: '中部提示消息',
    position: 'middle',
  })
}

const showBottom = () => {
  toast.show({
    msg: '底部提示消息',
    position: 'bottom',
  })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  wd-button {
    margin-bottom: 24rpx;
  }
}
</style>
```

**使用说明:**
- `position` 支持四个位置: `top`(顶部)、`middle-top`(中上)、`middle`(中部)、`bottom`(底部)
- 不同位置的 Toast 独立堆叠,互不影响
- 默认位置为 `middle-top`,平衡了可见性和遮挡问题
- 顶部适合全局通知,底部适合操作反馈,中部适合重要提示

## 高级用法

### 多实例管理

使用 selector 参数创建多个独立的 Toast 实例:

```vue
<template>
  <view class="demo">
    <wd-button @click="showMainToast">
      主要提示
    </wd-button>
    <wd-button @click="showSecondaryToast">
      次要提示
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

// 创建主要提示实例
const mainToast = useToast('main')

// 创建次要提示实例
const secondaryToast = useToast('secondary')

const showMainToast = () => {
  mainToast.success('主要操作成功')
}

const showSecondaryToast = () => {
  secondaryToast.info('次要信息')
}
</script>
```

**技术实现:**
- `useToast(selector)` 通过 selector 参数区分不同实例
- 每个 selector 对应唯一的缓存 key: `__TOAST_OPTION__${selector}`
- 全局缓存 Map(`toastOptionsCache`)确保相同 selector 返回同一实例
- 不同 selector 的 Toast 可以独立控制,互不干扰
- 适用于复杂页面中需要区分不同来源的提示场景

### 自定义图标

使用自定义图标或自定义图标类:

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomIcon">
      自定义图标
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showCustomIcon = () => {
  toast.show({
    msg: '使用自定义图标',
    iconName: 'wd-icon-star-on',
    iconSize: 56,
    iconColor: '#ff9800',
    iconClass: 'custom-icon-class',
  })
}
</script>

<style lang="scss" scoped>
.custom-icon-class {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
```

**使用说明:**
- `iconName` 可以是预设图标名称或自定义图标类名
- `iconSize` 控制图标大小,单位为 rpx
- `iconColor` 控制图标颜色,支持十六进制、rgb、rgba 等
- `iconClass` 可添加自定义 CSS 类,实现动画等效果
- `classPrefix` 可自定义图标类名前缀,默认为 `wd-icon`

### 加载状态切换

展示加载状态的完整生命周期管理:

```vue
<template>
  <view class="demo">
    <wd-button @click="handleUpload">
      上传文件
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleUpload = async () => {
  // 步骤1: 显示加载提示
  toast.loading({
    msg: '正在上传...',
    loadingType: 'ring',
    loadingColor: '#1890ff',
  })

  try {
    // 模拟上传过程
    await uploadFile()

    // 步骤2: 关闭加载提示
    toast.close()

    // 步骤3: 显示成功提示
    toast.success({
      msg: '上传成功',
      duration: 2000,
    })
  } catch (error) {
    // 错误处理
    toast.close()
    toast.error({
      msg: '上传失败,请重试',
      duration: 3000,
    })
  }
}

const uploadFile = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 3000)
  })
}
</script>
```

**技术实现:**
- loading() 默认 duration 为 0,不会自动关闭
- cover 选项为 true 时,显示遮罩层阻止用户操作
- loadingType 支持两种样式: `outline`(轮廓线)和 `ring`(圆环)
- loadingColor 和 loadingSize 可自定义加载图标样式
- 关闭 loading 后立即显示其他类型的 Toast,实现状态切换

### 回调函数

监听 Toast 的打开和关闭事件:

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithCallbacks">
      带回调的提示
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'
import { ref } from 'vue'

const toast = useToast()
const logText = ref('')

const showWithCallbacks = () => {
  toast.show({
    msg: '带回调的提示消息',
    duration: 2000,
    opened: () => {
      console.log('Toast 已完全展示')
      logText.value = 'Toast opened'
      // 可以在这里执行一些副作用
      // 例如: 埋点统计、状态更新等
    },
    closed: () => {
      console.log('Toast 已完全关闭')
      logText.value = 'Toast closed'
      // 可以在这里执行清理工作
      // 例如: 重置状态、启用按钮等
    },
  })
}
</script>
```

**使用说明:**
- `opened` 回调在 Toast 完全展示后触发(动画结束)
- `closed` 回调在 Toast 完全关闭后触发(动画结束并从 DOM 移除)
- 回调函数适合处理埋点、状态更新、清理工作等副作用
- 两个回调都是可选的,按需使用

### 动态时长控制

根据消息内容长度动态调整显示时长:

```vue
<template>
  <view class="demo">
    <wd-button @click="showShortMsg">短消息</wd-button>
    <wd-button @click="showLongMsg">长消息</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const calculateDuration = (msg: string): number => {
  // 基础时长 2000ms
  const baseDuration = 2000
  // 每10个字符增加500ms
  const extraDuration = Math.floor(msg.length / 10) * 500
  // 最长不超过5000ms
  return Math.min(baseDuration + extraDuration, 5000)
}

const showShortMsg = () => {
  const msg = '操作成功'
  toast.success({
    msg,
    duration: calculateDuration(msg), // 2000ms
  })
}

const showLongMsg = () => {
  const msg = '您的操作已成功提交,系统正在处理中,预计需要1-2分钟完成,请稍后刷新查看结果'
  toast.info({
    msg,
    duration: calculateDuration(msg), // 4500ms
  })
}
</script>
```

**技术实现:**
- 根据消息长度计算合适的显示时长
- 短消息使用默认时长,长消息适当延长
- 设置最大时长限制,避免提示停留过久
- 提升用户体验,确保用户有足够时间阅读消息

### 防抖处理

防止用户频繁触发导致 Toast 堆叠过多:

```vue
<template>
  <view class="demo">
    <wd-button @click="handleClick">
      快速点击测试
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'
import { ref } from 'vue'

const toast = useToast()
const isShowing = ref(false)

const handleClick = () => {
  // 防抖: 如果已经有 Toast 在显示,则忽略
  if (isShowing.value) {
    return
  }

  isShowing.value = true

  toast.success({
    msg: '操作成功',
    duration: 2000,
    closed: () => {
      // Toast 关闭后重置状态
      isShowing.value = false
    },
  })
}
</script>
```

**技术实现:**
- 使用标志变量控制 Toast 的显示状态
- Toast 显示时设置标志为 true,阻止重复触发
- 利用 closed 回调重置标志,允许下次显示
- 有效防止用户快速点击导致多个 Toast 堆叠

### 遮罩层控制

为重要提示添加遮罩层,防止用户操作:

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithCover">
      带遮罩的提示
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showWithCover = () => {
  toast.show({
    msg: '这是一条重要提示',
    duration: 3000,
    cover: true, // 显示遮罩层
    iconName: 'warning',
  })
}
</script>
```

**使用说明:**
- `cover: true` 时,Toast 下方会显示半透明遮罩层
- 遮罩层会阻止用户点击页面其他元素
- 适用于重要提示、警告信息、强制阅读的场景
- loading() 方法默认开启遮罩层
- 遮罩层随 Toast 一起消失,无需手动管理

### 横向布局

图标和文字横向排列:

```vue
<template>
  <view class="demo">
    <wd-button @click="showHorizontal">
      横向布局
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showHorizontal = () => {
  toast.success({
    msg: '保存成功',
    direction: 'horizontal', // 横向布局
    iconSize: 40,
  })
}
</script>
```

**使用说明:**
- `direction` 属性控制图标和文字的排列方向
- `vertical`(默认): 图标在上,文字在下,垂直排列
- `horizontal`: 图标在左,文字在右,横向排列
- 横向布局适合图标较小、文字较短的场景
- 垂直布局适合图标较大、需要突出显示的场景

## API

### useToast()

创建或获取 Toast 实例。

**函数签名:**

```typescript
function useToast(selector?: string): Toast
```

**参数:**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| selector | 实例选择器,用于创建多个独立的 Toast 实例 | `string` | `''` |

**返回值:**

返回一个 `Toast` 实例对象,包含以下方法:

| 方法 | 说明 | 类型 |
|------|------|------|
| show | 显示 Toast | `(option: ToastOptions \| string) => void` |
| success | 显示成功 Toast | `(option: ToastOptions \| string) => void` |
| error | 显示错误 Toast | `(option: ToastOptions \| string) => void` |
| warning | 显示警告 Toast | `(option: ToastOptions \| string) => void` |
| info | 显示信息 Toast | `(option: ToastOptions \| string) => void` |
| loading | 显示加载 Toast | `(option: ToastOptions \| string) => void` |
| close | 关闭当前 Toast | `() => void` |

**使用示例:**

```typescript
import { useToast } from '@/wd'

// 创建默认实例
const toast = useToast()

// 创建命名实例
const mainToast = useToast('main')
const secondaryToast = useToast('secondary')
```

### show()

显示一个通用 Toast。

**方法签名:**

```typescript
show(option: ToastOptions | string): void
```

**参数:**

| 参数 | 说明 | 类型 |
|------|------|------|
| option | Toast 配置选项或消息字符串 | `ToastOptions \| string` |

**使用示例:**

```typescript
// 字符串方式
toast.show('这是一条消息')

// 对象方式
toast.show({
  msg: '这是一条消息',
  duration: 3000,
  position: 'top',
})
```

### success()

显示成功 Toast,预设成功图标和绿色配色。

**方法签名:**

```typescript
success(option: ToastOptions | string): void
```

**预设配置:**

```typescript
{
  iconName: 'success',
  duration: 1500,
}
```

**使用示例:**

```typescript
// 字符串方式
toast.success('操作成功')

// 对象方式,可覆盖预设配置
toast.success({
  msg: '保存成功',
  duration: 2000,
  position: 'bottom',
})
```

### error()

显示错误 Toast,预设错误图标和红色配色。

**方法签名:**

```typescript
error(option: ToastOptions | string): void
```

**预设配置:**

```typescript
{
  iconName: 'error',
  duration: 2000,
}
```

**使用示例:**

```typescript
// 字符串方式
toast.error('操作失败')

// 对象方式
toast.error({
  msg: '网络错误,请重试',
  duration: 3000,
})
```

### warning()

显示警告 Toast,预设警告图标和橙色配色。

**方法签名:**

```typescript
warning(option: ToastOptions | string): void
```

**预设配置:**

```typescript
{
  iconName: 'warning',
  duration: 2000,
}
```

**使用示例:**

```typescript
// 字符串方式
toast.warning('库存不足')

// 对象方式
toast.warning({
  msg: '权限不足,请联系管理员',
  duration: 3000,
  position: 'middle',
})
```

### info()

显示信息 Toast,预设信息图标和蓝色配色。

**方法签名:**

```typescript
info(option: ToastOptions | string): void
```

**预设配置:**

```typescript
{
  iconName: 'info',
  duration: 2000,
}
```

**使用示例:**

```typescript
// 字符串方式
toast.info('这是一条提示信息')

// 对象方式
toast.info({
  msg: '长按列表项可进行更多操作',
  duration: 3000,
})
```

### loading()

显示加载 Toast,预设加载图标、遮罩层,不自动关闭。

**方法签名:**

```typescript
loading(option: ToastOptions | string): void
```

**预设配置:**

```typescript
{
  iconName: 'loading',
  duration: 0,        // 不自动关闭
  cover: true,        // 显示遮罩层
}
```

**使用示例:**

```typescript
// 字符串方式
toast.loading('加载中...')

// 对象方式
toast.loading({
  msg: '正在提交...',
  loadingType: 'ring',
  loadingColor: '#1890ff',
})

// 需要手动关闭
setTimeout(() => {
  toast.close()
}, 3000)
```

### close()

关闭当前 selector 的 Toast。

**方法签名:**

```typescript
close(): void
```

**使用示例:**

```typescript
// 显示 loading
toast.loading('处理中...')

// 1秒后关闭
setTimeout(() => {
  toast.close()
}, 1000)
```

### ToastOptions

Toast 配置选项接口。

**类型定义:**

```typescript
interface ToastOptions {
  /** 提示信息 */
  msg?: string

  /** 显示时长,单位ms,0 表示不自动关闭 */
  duration?: number

  /** 图标和文字的排列方向 */
  direction?: 'vertical' | 'horizontal'

  /** 图标名称 */
  iconName?: 'success' | 'error' | 'warning' | 'loading' | 'info' | ''

  /** 图标大小,单位 rpx */
  iconSize?: number

  /** 加载图标类型 */
  loadingType?: 'outline' | 'ring'

  /** 加载图标颜色 */
  loadingColor?: string

  /** 加载图标大小,单位 rpx */
  loadingSize?: number

  /** 图标颜色 */
  iconColor?: string

  /** Toast 位置 */
  position?: 'top' | 'middle-top' | 'middle' | 'bottom'

  /** 是否显示 */
  show?: boolean

  /** 层级 */
  zIndex?: number

  /** 是否存在遮罩层 */
  cover?: boolean

  /** 图标自定义类名 */
  iconClass?: string

  /** 图标类名前缀 */
  classPrefix?: string

  /** 完全展示后的回调 */
  opened?: () => void

  /** 完全关闭时的回调 */
  closed?: () => void

  /** 内部使用: Y轴偏移量 */
  _offsetY?: number

  /** 内部使用: Toast实例ID */
  _toastId?: string
}
```

**属性说明:**

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| msg | 提示信息 | `string` | - |
| duration | 显示时长,单位ms,0表示不自动关闭 | `number` | `2000` |
| direction | 图标和文字排列方向 | `'vertical' \| 'horizontal'` | `'vertical'` |
| iconName | 图标名称 | `'success' \| 'error' \| 'warning' \| 'loading' \| 'info' \| ''` | `''` |
| iconSize | 图标大小,单位rpx | `number` | `42` |
| loadingType | 加载图标类型 | `'outline' \| 'ring'` | `'outline'` |
| loadingColor | 加载图标颜色 | `string` | `'#4D80F0'` |
| loadingSize | 加载图标大小,单位rpx | `number` | `42` |
| iconColor | 图标颜色 | `string` | - |
| position | Toast位置 | `'top' \| 'middle-top' \| 'middle' \| 'bottom'` | `'middle-top'` |
| show | 是否显示 | `boolean` | `false` |
| zIndex | 层级 | `number` | `1000` |
| cover | 是否显示遮罩层 | `boolean` | `false` |
| iconClass | 图标自定义类名 | `string` | `''` |
| classPrefix | 图标类名前缀 | `string` | `'wd-icon'` |
| opened | 完全展示后的回调函数 | `() => void` | - |
| closed | 完全关闭后的回调函数 | `() => void` | - |
| _offsetY | 内部使用:Y轴偏移量 | `number` | `0` |
| _toastId | 内部使用:Toast实例ID | `string` | - |

### Toast

Toast 实例接口。

**类型定义:**

```typescript
interface Toast {
  /** 显示 Toast */
  show: (toastOptions: ToastOptions | string) => void

  /** 显示成功 Toast */
  success: (toastOptions: ToastOptions | string) => void

  /** 显示错误 Toast */
  error: (toastOptions: ToastOptions | string) => void

  /** 显示信息 Toast */
  info: (toastOptions: ToastOptions | string) => void

  /** 显示警告 Toast */
  warning: (toastOptions: ToastOptions | string) => void

  /** 显示加载 Toast */
  loading: (toastOptions: ToastOptions | string) => void

  /** 关闭 Toast */
  close: () => void
}
```

### 工具函数

#### getToastOption()

获取或创建指定 selector 的 Toast 配置选项,确保单例。

**函数签名:**

```typescript
function getToastOption(selector?: string): Ref<ToastOptions>
```

**参数:**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| selector | 实例选择器 | `string` | `''` |

**返回值:**

返回该 selector 对应的响应式 Toast 配置对象。

**使用示例:**

```typescript
import { getToastOption } from '@/wd'

// 获取默认实例的配置
const defaultOption = getToastOption()

// 获取命名实例的配置
const mainOption = getToastOption('main')

// 直接修改配置
defaultOption.value = {
  msg: '新消息',
  show: true,
}
```

#### clearToastOption()

清理指定 selector 的 Toast 配置缓存。

**函数签名:**

```typescript
function clearToastOption(selector?: string): void
```

**参数:**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| selector | 实例选择器 | `string` | `''` |

**使用示例:**

```typescript
import { clearToastOption } from '@/wd'

// 清理默认实例
clearToastOption()

// 清理命名实例
clearToastOption('main')
```

#### clearAllToastOptions()

清理所有 Toast 配置缓存和活跃实例。

**函数签名:**

```typescript
function clearAllToastOptions(): void
```

**使用示例:**

```typescript
import { clearAllToastOptions } from '@/wd'

// 清理所有 Toast 缓存
clearAllToastOptions()
```

#### cleanupClosedToasts()

清理已经关闭的 Toast 实例。

**函数签名:**

```typescript
function cleanupClosedToasts(): void
```

**使用说明:**
- 自动遍历活跃 Toast 队列,移除已关闭的实例
- 清理实例的定时器,释放资源
- 系统内部自动调用,开发者通常无需手动调用

**使用示例:**

```typescript
import { cleanupClosedToasts } from '@/wd'

// 手动触发清理
cleanupClosedToasts()
```

## 类型定义

### 核心类型

```typescript
/**
 * 图标类型枚举
 */
type ToastIconType =
  | 'success'   // 成功图标(绿色对勾)
  | 'error'     // 错误图标(红色叉号)
  | 'warning'   // 警告图标(橙色感叹号)
  | 'loading'   // 加载图标(动画旋转)
  | 'info'      // 信息图标(蓝色i)
  | ''          // 无图标

/**
 * 位置类型枚举
 */
type ToastPositionType =
  | 'top'        // 顶部
  | 'middle-top' // 中上部(默认)
  | 'middle'     // 正中部
  | 'bottom'     // 底部

/**
 * 排列方向类型
 */
type ToastDirection =
  | 'vertical'   // 垂直排列(图标在上,文字在下)
  | 'horizontal' // 横向排列(图标在左,文字在右)

/**
 * 加载图标类型
 */
type ToastLoadingType =
  | 'outline'    // 轮廓线样式
  | 'ring'       // 圆环样式
```

### 内部类型

```typescript
/**
 * Toast 选项的响应式引用类型
 */
type ToastOptionRef = Ref<ToastOptions>

/**
 * Toast 实例信息(内部使用)
 */
interface ToastInstance {
  /** 唯一实例ID */
  id: string

  /** 实例选择器 */
  selector: string

  /** 响应式配置选项 */
  option: ToastOptionRef

  /** 层级索引 */
  zIndex: number

  /** Y轴偏移量 */
  offsetY: number

  /** 自动关闭定时器 */
  timer?: ReturnType<typeof setTimeout>
}
```

### 常量定义

```typescript
/**
 * useToast 使用的缓存 key 前缀
 */
const toastDefaultOptionKey = '__TOAST_OPTION__'

/**
 * Toast 基础高度(包括间距),单位 px
 */
const TOAST_HEIGHT = 60

/**
 * Toast 基础 zIndex 层级
 */
const BASE_Z_INDEX = 1000

/**
 * 默认配置选项
 */
const defaultOptions: ToastOptions = {
  duration: 2000,
  show: false,
}
```

### 完整导入示例

```typescript
import {
  useToast,
  getToastOption,
  clearToastOption,
  clearAllToastOptions,
  cleanupClosedToasts,
} from '@/wd'

import type {
  Toast,
  ToastOptions,
} from '@/wd'

// 创建 Toast 实例
const toast = useToast()

// 使用类型注解
const options: ToastOptions = {
  msg: '类型安全的配置',
  duration: 3000,
  position: 'top',
}

toast.show(options)
```

## 技术原理

### 单例模式实现

`useToast` 通过全局 Map 缓存确保每个 selector 对应唯一实例:

```typescript
// 全局缓存 Map
const toastOptionsCache = new Map<string, ToastOptionRef>()

export const getToastOption = (selector: string = ''): ToastOptionRef => {
  const key = getToastOptionKey(selector) // __TOAST_OPTION__${selector}

  // 检查缓存
  if (toastOptionsCache.has(key)) {
    return toastOptionsCache.get(key)!
  }

  // 创建新实例
  const newOption = ref<ToastOptions>({ ...defaultOptions })

  // 缓存新实例
  toastOptionsCache.set(key, newOption)

  return newOption
}
```

**单例优势:**
- 避免重复创建,节省内存
- 确保同一 selector 的 Toast 互斥显示
- 提升性能,减少响应式对象数量

### 全局队列管理

系统维护一个全局 Map 存储所有活跃的 Toast 实例:

```typescript
// 全局活跃实例队列
const activeToastInstances = new Map<string, ToastInstance>()

// 显示 Toast 时添加到队列
const show = (option: ToastOptions | string) => {
  const toastId = generateToastId()

  const toastInstance: ToastInstance = {
    id: toastId,
    selector,
    option: toastOption,
    zIndex,
    offsetY,
  }

  // 添加到活跃队列
  activeToastInstances.set(toastId, toastInstance)
}

// 关闭 Toast 时从队列移除
const close = (toastId?: string) => {
  const instance = activeToastInstances.get(toastId)
  if (instance) {
    // 清理定时器
    if (instance.timer) {
      clearTimeout(instance.timer)
    }

    // 从队列移除
    activeToastInstances.delete(toastId)
  }
}
```

**队列优势:**
- 统一管理所有 Toast 实例
- 便于计算偏移量和层级
- 支持自动清理和位置更新

### 偏移量计算

同位置的多个 Toast 自动堆叠,偏移量根据队列中的实例数量计算:

```typescript
const calculateToastOffset = (position: string): { offsetY: number; zIndex: number } => {
  // 过滤相同位置且可见的 Toast
  const samePositionToasts = Array.from(activeToastInstances.values())
    .filter((instance) => {
      const instancePosition = instance.option.value.position || 'middle-top'
      const isVisible = instance.option.value.show === true
      return instancePosition === position && isVisible
    })
    .sort((a, b) => a.zIndex - b.zIndex)

  // 计算偏移量: 每个 Toast 高度 60px
  const offsetY = samePositionToasts.length * TOAST_HEIGHT

  // 计算层级: 基础层级 + 当前队列大小
  const zIndex = BASE_Z_INDEX + activeToastInstances.size

  return { offsetY, zIndex }
}
```

**计算逻辑:**
- `offsetY` = 同位置实例数量 × 60px
- 第一个 Toast: offsetY = 0
- 第二个 Toast: offsetY = 60px
- 第三个 Toast: offsetY = 120px
- 以此类推,形成垂直堆叠效果

### 层级管理

zIndex 基于全局队列大小自动递增:

```typescript
const zIndex = BASE_Z_INDEX + activeToastInstances.size
```

**层级规则:**
- 基础层级: 1000
- 第一个 Toast: 1000
- 第二个 Toast: 1001
- 第三个 Toast: 1002
- 确保后显示的 Toast 始终在上层

### 位置动态更新

Toast 关闭时,自动更新剩余实例的位置:

```typescript
const updateToastOffsets = (position: string) => {
  // 先清理已关闭的实例
  cleanupClosedToasts()

  // 获取相同位置的实例
  const samePositionToasts = Array.from(activeToastInstances.values())
    .filter((instance) => {
      const instancePosition = instance.option.value.position || 'middle-top'
      const isVisible = instance.option.value.show === true
      return instancePosition === position && isVisible
    })
    .sort((a, b) => a.zIndex - b.zIndex)

  // 重新计算每个实例的偏移量
  samePositionToasts.forEach((instance, index) => {
    instance.offsetY = index * TOAST_HEIGHT

    // 触发响应式更新
    instance.option.value = {
      ...instance.option.value,
      _offsetY: instance.offsetY,
      zIndex: instance.zIndex,
    }
  })
}
```

**更新时机:**
- Toast 关闭时
- 显示新 Toast 前
- 确保位置始终正确,无空隙

### 自动清理机制

系统自动清理已关闭的 Toast 实例:

```typescript
export const cleanupClosedToasts = () => {
  for (const [toastId, instance] of activeToastInstances.entries()) {
    // 检查显示状态
    if (instance.option.value.show !== true) {
      // 清理定时器
      if (instance.timer) {
        clearTimeout(instance.timer)
      }

      // 从活跃队列中移除
      activeToastInstances.delete(toastId)
    }
  }
}
```

**清理时机:**
- 计算偏移量前
- 更新位置前
- 防止内存泄漏,释放资源

### 唯一 ID 生成

每个 Toast 实例分配唯一 ID:

```typescript
const generateToastId = (): string => {
  return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
```

**ID 格式:**
- 前缀: `toast_`
- 时间戳: `Date.now()`
- 随机字符串: 7位 36进制
- 示例: `toast_1699876543210_k3j5h2g`

**ID 用途:**
- 唯一标识每个 Toast
- 作为 Map 的 key
- 支持精确关闭指定 Toast

### 配置深度合并

预设方法与自定义配置深度合并:

```typescript
import { deepMerge } from '../common/util'

const createMethod = (toastOptions: ToastOptions) => {
  return (options: ToastOptions | string) => {
    return show(
      deepMerge(
        toastOptions,
        typeof options === 'string' ? { msg: options } : options,
      ) as ToastOptions,
    )
  }
}

// 示例: success 方法
const success = createMethod({
  iconName: 'success',
  duration: 1500,
})
```

**合并规则:**
- 预设配置作为基础
- 用户配置覆盖预设
- 嵌套对象深度合并
- 保留所有有效配置

**合并示例:**

```typescript
// 预设配置
const preset = {
  iconName: 'success',
  duration: 1500,
}

// 用户配置
const custom = {
  msg: '保存成功',
  duration: 3000,
  position: 'top',
}

// 合并结果
const final = {
  iconName: 'success',  // 来自预设
  duration: 3000,        // 用户覆盖
  msg: '保存成功',      // 用户新增
  position: 'top',       // 用户新增
}
```

## 最佳实践

### 1. 合理选择提示类型

根据场景选择合适的 Toast 类型:

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// ✅ 好的做法: 根据操作结果选择类型
const handleSave = async () => {
  try {
    await saveData()
    toast.success('保存成功') // 成功用 success
  } catch (error) {
    toast.error('保存失败')   // 失败用 error
  }
}

// ✅ 好的做法: 警告用 warning
const checkStock = (stock: number) => {
  if (stock < 10) {
    toast.warning('库存不足')
  }
}

// ✅ 好的做法: 提示信息用 info
const showHelp = () => {
  toast.info('长按列表项可查看详情')
}

// ❌ 不好的做法: 所有场景都用 show
const handleDelete = async () => {
  try {
    await deleteData()
    toast.show('删除成功') // 应该用 toast.success()
  } catch (error) {
    toast.show('删除失败') // 应该用 toast.error()
  }
}
</script>
```

**推荐规则:**
- 操作成功 → `success()`
- 操作失败 → `error()`
- 风险提示 → `warning()`
- 普通信息 → `info()`
- 加载状态 → `loading()`
- 通用提示 → `show()`

### 2. 正确管理 loading 状态

确保 loading Toast 正确关闭:

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// ✅ 好的做法: 使用 try-finally 确保关闭
const handleSubmit = async () => {
  toast.loading('提交中...')

  try {
    await submitForm()
    toast.close()
    toast.success('提交成功')
  } catch (error) {
    toast.close()
    toast.error('提交失败')
  }
}

// ✅ 更好的做法: 封装加载逻辑
const withLoading = async <T>(
  fn: () => Promise<T>,
  loadingMsg = '加载中...',
  successMsg?: string,
  errorMsg = '操作失败',
): Promise<T | undefined> => {
  toast.loading(loadingMsg)

  try {
    const result = await fn()
    toast.close()

    if (successMsg) {
      toast.success(successMsg)
    }

    return result
  } catch (error) {
    toast.close()
    toast.error(errorMsg)
    return undefined
  }
}

// 使用封装的加载逻辑
const handleUpload = async () => {
  await withLoading(
    () => uploadFile(),
    '上传中...',
    '上传成功',
    '上传失败',
  )
}

// ❌ 不好的做法: 忘记关闭 loading
const handleBadSubmit = async () => {
  toast.loading('提交中...')

  await submitForm()
  // 忘记调用 toast.close()
  toast.success('提交成功') // loading 仍在显示
}
</script>
```

### 3. 避免 Toast 滥用

防止用户频繁触发导致 Toast 堆叠过多:

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'
import { ref } from 'vue'

const toast = useToast()

// ✅ 好的做法: 使用防抖
const lastToastTime = ref(0)
const TOAST_DEBOUNCE = 1000 // 1秒内只显示一次

const showDebounced = (msg: string) => {
  const now = Date.now()

  if (now - lastToastTime.value < TOAST_DEBOUNCE) {
    return
  }

  lastToastTime.value = now
  toast.info(msg)
}

// ✅ 好的做法: 使用标志控制
const isToastShowing = ref(false)

const showControlled = (msg: string) => {
  if (isToastShowing.value) {
    return
  }

  isToastShowing.value = true

  toast.show({
    msg,
    duration: 2000,
    closed: () => {
      isToastShowing.value = false
    },
  })
}

// ❌ 不好的做法: 循环中频繁显示
const handleBatchDelete = (items: any[]) => {
  items.forEach(item => {
    deleteItem(item)
    toast.success(`删除 ${item.name} 成功`) // 可能堆叠几十个 Toast
  })
}

// ✅ 好的做法: 批量操作后统一提示
const handleBatchDeleteGood = async (items: any[]) => {
  toast.loading('批量删除中...')

  try {
    await Promise.all(items.map(item => deleteItem(item)))
    toast.close()
    toast.success(`成功删除 ${items.length} 条数据`)
  } catch (error) {
    toast.close()
    toast.error('批量删除失败')
  }
}
</script>
```

### 4. 合理设置显示时长

根据消息重要性和长度调整时长:

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// ✅ 好的做法: 短消息用默认时长
const showShort = () => {
  toast.success('保存成功') // 2秒足够
}

// ✅ 好的做法: 长消息延长时长
const showLong = () => {
  toast.info({
    msg: '您的订单已提交,预计1-2个工作日内发货,请注意查收短信通知',
    duration: 4000, // 长消息需要更多阅读时间
  })
}

// ✅ 好的做法: 重要提示延长时长
const showImportant = () => {
  toast.warning({
    msg: '账户余额不足,请及时充值',
    duration: 5000, // 重要提示停留更久
    cover: true,    // 添加遮罩强调重要性
  })
}

// ✅ 好的做法: 动态计算时长
const showDynamic = (msg: string) => {
  const baseDuration = 2000
  const extraDuration = Math.floor(msg.length / 10) * 500
  const duration = Math.min(baseDuration + extraDuration, 5000)

  toast.show({ msg, duration })
}

// ❌ 不好的做法: 长消息用短时长
const showBad = () => {
  toast.info({
    msg: '这是一条很长的提示消息,包含了大量重要信息需要用户仔细阅读',
    duration: 1000, // 时间太短,用户来不及阅读
  })
}
</script>
```

### 5. 使用多实例隔离

在复杂页面中,使用多实例避免相互干扰:

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

// ✅ 好的做法: 不同功能模块使用不同实例
const formToast = useToast('form')      // 表单提示
const uploadToast = useToast('upload')  // 上传提示
const notifyToast = useToast('notify')  // 通知提示

// 表单操作
const handleFormSubmit = async () => {
  formToast.loading('提交中...')

  try {
    await submitForm()
    formToast.close()
    formToast.success('提交成功')
  } catch (error) {
    formToast.close()
    formToast.error('提交失败')
  }
}

// 文件上传(与表单操作并行)
const handleFileUpload = async () => {
  uploadToast.loading('上传中...')

  try {
    await uploadFile()
    uploadToast.close()
    uploadToast.success('上传成功')
  } catch (error) {
    uploadToast.close()
    uploadToast.error('上传失败')
  }
}

// 系统通知(独立显示)
const showNotification = () => {
  notifyToast.info({
    msg: '您有一条新消息',
    position: 'top',
    duration: 3000,
  })
}

// ❌ 不好的做法: 所有功能共用一个实例
const toast = useToast()

const handleBadSubmit = async () => {
  toast.loading('提交中...')
  // 如果此时用户触发上传,会关闭提交的 loading
  await submitForm()
  toast.close()
}
</script>
```

### 6. 适当使用遮罩层

在需要阻止用户操作时使用遮罩层:

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// ✅ 好的做法: 耗时操作使用遮罩
const handleImport = async () => {
  toast.loading({
    msg: '导入中,请勿关闭页面...',
    cover: true, // 阻止用户操作
  })

  try {
    await importData()
    toast.close()
    toast.success('导入成功')
  } catch (error) {
    toast.close()
    toast.error('导入失败')
  }
}

// ✅ 好的做法: 重要提示使用遮罩
const showCritical = () => {
  toast.warning({
    msg: '您的账户存在安全风险,请立即修改密码',
    duration: 5000,
    cover: true, // 强制用户阅读
  })
}

// ✅ 好的做法: 防止重复提交
const handleSubmit = async () => {
  toast.loading({
    msg: '提交中...',
    cover: true, // 阻止重复点击
  })

  await submitForm()
  toast.close()
}

// ❌ 不好的做法: 普通提示使用遮罩
const showBad = () => {
  toast.info({
    msg: '这是一条普通提示',
    cover: true, // 不必要的遮罩,影响用户体验
  })
}
</script>
```

### 7. 合理使用回调函数

利用回调函数处理副作用:

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'
import { ref } from 'vue'

const toast = useToast()
const isSubmitting = ref(false)

// ✅ 好的做法: 使用 opened 回调进行埋点
const handleSave = () => {
  toast.success({
    msg: '保存成功',
    opened: () => {
      // 埋点统计
      trackEvent('save_success_toast_shown')
    },
  })
}

// ✅ 好的做法: 使用 closed 回调重置状态
const handleSubmit = async () => {
  isSubmitting.value = true

  toast.loading({
    msg: '提交中...',
    closed: () => {
      // Toast 关闭后重置状态
      isSubmitting.value = false
    },
  })

  await submitForm()
  toast.close()
}

// ✅ 好的做法: 使用回调链式操作
const handleDelete = async () => {
  toast.loading('删除中...')

  await deleteData()

  toast.close()

  toast.success({
    msg: '删除成功',
    closed: () => {
      // 删除成功提示关闭后刷新列表
      refreshList()
    },
  })
}

// ❌ 不好的做法: 在回调中执行耗时操作
const handleBad = () => {
  toast.success({
    msg: '操作成功',
    opened: async () => {
      // 不要在回调中执行异步操作,会阻塞 UI
      await fetchData()
    },
  })
}
</script>
```

### 8. 优化长文本显示

处理长文本提示:

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// ✅ 好的做法: 长文本使用换行
const showLongText = () => {
  toast.info({
    msg: '您的订单已提交\n预计1-2个工作日内发货\n请注意查收短信通知',
    duration: 4000,
  })
}

// ✅ 好的做法: 长文本简化表达
const showSimplified = () => {
  toast.success('提交成功,请等待审核') // 简洁明了
}

// ✅ 好的做法: 超长文本截断
const showTruncated = (errorMsg: string) => {
  const maxLength = 50
  const msg = errorMsg.length > maxLength
    ? `${errorMsg.substring(0, maxLength)}...`
    : errorMsg

  toast.error({
    msg,
    duration: 3000,
  })
}

// ❌ 不好的做法: 显示冗长的技术错误
const showBad = (error: Error) => {
  toast.error({
    msg: error.stack || error.message, // 显示完整堆栈,用户无法理解
    duration: 2000, // 时间太短,无法阅读
  })
}

// ✅ 好的做法: 友好的错误提示
const showGood = (error: Error) => {
  console.error(error) // 完整错误记录到控制台

  toast.error({
    msg: '操作失败,请稍后重试', // 友好的用户提示
    duration: 3000,
  })
}
</script>
```

## 常见问题

### 1. Toast 不显示或显示不正确

**问题原因:**
- 未在页面中放置 `<wd-toast />` 组件
- selector 不匹配
- zIndex 被其他元素覆盖
- position 被父元素样式影响

**解决方案:**

```vue
<!-- ✅ 在页面根节点添加 Toast 组件 -->
<template>
  <view class="page">
    <!-- 页面内容 -->

    <!-- Toast 组件必须放在页面中 -->
    <wd-toast />

    <!-- 如果使用了命名实例,需要指定 selector -->
    <wd-toast selector="main" />
    <wd-toast selector="secondary" />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

// selector 必须与组件的 selector 属性一致
const mainToast = useToast('main')
const secondaryToast = useToast('secondary')

mainToast.success('主要提示')
secondaryToast.info('次要提示')
</script>
```

**zIndex 问题解决:**

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// 如果 Toast 被其他元素覆盖,提高 zIndex
toast.show({
  msg: '重要提示',
  zIndex: 10000, // 提高层级
})
</script>
```

### 2. 多个 Toast 重叠显示

**问题原因:**
- 相同 selector 的 Toast 组件放置多次
- 未正确使用多实例
- 手动设置了相同的 position 和 zIndex

**解决方案:**

```vue
<!-- ✅ 正确做法: 每个 selector 只放置一次 -->
<template>
  <view class="page">
    <wd-toast />
    <wd-toast selector="main" />
  </view>
</template>

<!-- ❌ 错误做法: 重复放置相同 selector -->
<template>
  <view class="page">
    <wd-toast />
    <wd-toast /> <!-- 重复了,会导致显示异常 -->
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

// ✅ 正确使用多实例
const defaultToast = useToast()      // 对应 <wd-toast />
const mainToast = useToast('main')   // 对应 <wd-toast selector="main" />

defaultToast.success('默认提示')
mainToast.info('主要提示')

// ❌ 不要手动设置相同的 position 和 zIndex
const showBad = () => {
  defaultToast.show({
    msg: '提示1',
    position: 'top',
    zIndex: 1000,
  })

  defaultToast.show({
    msg: '提示2',
    position: 'top',
    zIndex: 1000, // 相同 zIndex 会重叠
  })
}

// ✅ 让系统自动管理 zIndex
const showGood = () => {
  defaultToast.show({
    msg: '提示1',
    position: 'top',
    // 不设置 zIndex,自动管理
  })

  defaultToast.show({
    msg: '提示2',
    position: 'top',
    // 自动递增 zIndex,不会重叠
  })
}
</script>
```

### 3. loading Toast 无法关闭

**问题原因:**
- 忘记调用 `close()` 方法
- 异步操作中异常未捕获
- 使用了不同的 Toast 实例

**解决方案:**

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// ✅ 使用 try-finally 确保关闭
const handleSubmit = async () => {
  toast.loading('提交中...')

  try {
    await submitForm()
    toast.success('提交成功')
  } catch (error) {
    toast.error('提交失败')
  } finally {
    toast.close() // 确保无论成功失败都会关闭
  }
}

// ✅ 更简洁的写法
const handleUpload = async () => {
  toast.loading('上传中...')

  try {
    await uploadFile()
  } finally {
    toast.close()
  }

  toast.success('上传成功')
}

// ❌ 错误做法: 使用不同实例
const handleBad = async () => {
  const toast1 = useToast()
  toast1.loading('加载中...')

  await fetchData()

  const toast2 = useToast() // 虽然是同一个实例,但建议复用变量
  toast2.close()
}

// ✅ 正确做法: 复用同一个实例变量
const handleGood = async () => {
  const toast = useToast()
  toast.loading('加载中...')

  await fetchData()

  toast.close()
}
</script>
```

### 4. Toast 自动关闭时间不准确

**问题原因:**
- 页面切换到后台时,定时器可能暂停
- 设置了 `duration: 0` 但期望自动关闭
- 系统时间异常

**解决方案:**

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'
import { onShow, onHide } from '@dcloudio/uni-app'
import { ref } from 'vue'

const toast = useToast()
const toastStartTime = ref(0)
const toastDuration = ref(0)

// ✅ 确保设置了正确的 duration
const showToast = () => {
  toast.show({
    msg: '3秒后自动关闭',
    duration: 3000, // 明确设置 duration
  })
}

// ✅ 页面切换时处理 Toast
onHide(() => {
  // 页面隐藏时记录剩余时间
  const elapsed = Date.now() - toastStartTime.value
  const remaining = toastDuration.value - elapsed

  if (remaining > 0) {
    // 可以选择关闭或保持
    toast.close()
  }
})

onShow(() => {
  // 页面显示时重新显示 Toast(如果需要)
})

// ❌ 错误做法: duration 设置为 0 但期望自动关闭
const showBad = () => {
  toast.loading('加载中...') // duration 默认为 0,不会自动关闭

  // 3秒后仍未关闭,需要手动调用 close()
}

// ✅ 正确做法: 手动关闭或设置 duration
const showGood = () => {
  // 方案1: 手动关闭
  toast.loading('加载中...')
  setTimeout(() => {
    toast.close()
  }, 3000)

  // 方案2: 设置 duration
  toast.loading({
    msg: '加载中...',
    duration: 3000, // 3秒后自动关闭
  })
}
</script>
```

### 5. 自定义图标不显示

**问题原因:**
- 图标名称错误
- 图标字体文件未加载
- `classPrefix` 设置不正确
- 图标颜色与背景色相同

**解决方案:**

```vue
<template>
  <view class="page">
    <wd-button @click="showCustomIcon">
      自定义图标
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// ✅ 使用 WD 内置图标
const showBuiltinIcon = () => {
  toast.show({
    msg: '内置图标',
    iconName: 'wd-icon-star-on', // WD 图标库中的图标
    iconColor: '#ff9800',
  })
}

// ✅ 使用 UnoCSS 图标
const showUnoIcon = () => {
  toast.show({
    msg: 'Uno 图标',
    iconName: 'i-carbon-checkmark', // UnoCSS 图标
    iconColor: '#4caf50',
    classPrefix: '', // UnoCSS 图标不需要前缀
  })
}

// ✅ 使用自定义字体图标
const showCustomIcon = () => {
  toast.show({
    msg: '自定义图标',
    iconName: 'custom-heart', // 自定义图标类名
    classPrefix: 'my-icon', // 自定义前缀
    iconColor: '#e91e63',
    iconSize: 48,
  })
}

// ❌ 错误做法: 图标名称错误
const showBad = () => {
  toast.show({
    msg: '错误图标',
    iconName: 'wd-icon-not-exist', // 图标不存在
  })
}

// ✅ 调试图标显示
const debugIcon = () => {
  toast.show({
    msg: '调试图标',
    iconName: 'wd-icon-star-on',
    iconColor: '#ff0000', // 使用醒目的颜色
    iconSize: 60,         // 使用较大的尺寸
    iconClass: 'debug-icon', // 添加调试类
  })
}
</script>

<style lang="scss" scoped>
// 自定义图标字体
@font-face {
  font-family: 'my-icon';
  src: url('/static/fonts/my-icon.ttf') format('truetype');
}

.my-icon {
  font-family: 'my-icon' !important;
}

.my-icon-custom-heart::before {
  content: '\e001'; // 字体图标编码
}

// 调试样式
.debug-icon {
  border: 2px solid red; // 添加边框方便查看
}
</style>
```

### 6. 小程序平台 Toast 层级问题

**问题原因:**
- 小程序原生组件(如 map、video)层级高于普通元素
- cover-view 嵌套限制
- 平台差异导致 zIndex 失效

**解决方案:**

```vue
<template>
  <view class="page">
    <!-- 小程序原生组件 -->
    <map class="map" />

    <!-- Toast 组件,使用较高的 zIndex -->
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// ✅ 提高 zIndex
const showToast = () => {
  toast.success({
    msg: '操作成功',
    zIndex: 99999, // 设置非常高的层级
  })
}

// ✅ 在原生组件上方显示时使用遮罩
const showWithCover = () => {
  toast.loading({
    msg: '加载中...',
    cover: true, // 遮罩层可以覆盖原生组件
    zIndex: 99999,
  })
}

// 💡 如果仍无法覆盖,考虑隐藏原生组件
const showCriticalToast = () => {
  // 隐藏 map
  hideMap()

  toast.warning({
    msg: '重要提示',
    closed: () => {
      // Toast 关闭后恢复 map
      showMap()
    },
  })
}
</script>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 400rpx;
}
</style>
```

### 7. 性能问题:频繁创建销毁

**问题原因:**
- 每次调用都创建新的 Toast 实例
- 未复用 Toast 实例
- 大量 Toast 未及时清理

**解决方案:**

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

// ✅ 在组件顶层创建实例,复用
const toast = useToast()

const handleClick = () => {
  toast.success('操作成功')
}

// ❌ 不好的做法: 每次都创建新实例
const handleBad = () => {
  const toast = useToast() // 重复创建
  toast.success('操作成功')
}

// ✅ 如需多实例,也在顶层创建
const formToast = useToast('form')
const uploadToast = useToast('upload')

// ✅ 定期清理(通常不需要,系统自动清理)
import { cleanupClosedToasts } from '@/wd'

const cleanup = () => {
  cleanupClosedToasts()
}

// ✅ 页面卸载时清理所有实例
import { onUnmounted } from 'vue'
import { clearAllToastOptions } from '@/wd'

onUnmounted(() => {
  clearAllToastOptions()
})
</script>
```

### 8. TypeScript 类型错误

**问题原因:**
- 未正确导入类型
- 配置对象类型不匹配
- 泛型使用不当

**解决方案:**

```typescript
// ✅ 正确导入类型
import { useToast } from '@/wd'
import type { Toast, ToastOptions } from '@/wd'

// ✅ 使用类型注解
const toast: Toast = useToast()

const options: ToastOptions = {
  msg: '类型安全的配置',
  duration: 3000,
  position: 'top',
  iconName: 'success',
}

toast.show(options)

// ✅ 函数参数类型
const showToast = (msg: string, options?: Partial<ToastOptions>) => {
  toast.show({
    msg,
    ...options,
  })
}

showToast('提示消息', { duration: 4000 })

// ✅ 回调函数类型
const handleSubmit = async () => {
  toast.loading({
    msg: '提交中...',
    opened: (): void => {
      console.log('Toast opened')
    },
    closed: (): void => {
      console.log('Toast closed')
    },
  })
}

// ❌ 类型错误示例
const showBad = () => {
  toast.show({
    msg: '错误示例',
    position: 'invalid-position', // 类型错误: 不是有效的位置
    iconName: 'invalid-icon',     // 类型错误: 不是有效的图标
    duration: '3000',              // 类型错误: 应该是 number
  })
}

// ✅ 类型断言(谨慎使用)
const showWithAssertion = () => {
  const position = 'top' as const // 类型断言为字面量类型

  toast.show({
    msg: '使用类型断言',
    position,
  })
}

// ✅ 枚举替代字符串字面量
enum ToastPosition {
  Top = 'top',
  MiddleTop = 'middle-top',
  Middle = 'middle',
  Bottom = 'bottom',
}

const showWithEnum = () => {
  toast.show({
    msg: '使用枚举',
    position: ToastPosition.Top,
  })
}
</script>
```
