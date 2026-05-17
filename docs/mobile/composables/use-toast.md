# useToast 轻提示

## 介绍

`useToast` 是一个专为 UniApp 应用设计的轻量级消息提示 Composable，提供了优雅、灵活的全局消息提示功能。该组合式函数采用了先进的队列管理和单例缓存机制，确保在复杂的多实例场景下也能保持稳定可靠的表现。

**核心特性:**

- **全局队列管理** - 基于 Map 数据结构管理所有活跃的 Toast 实例，支持多实例并发显示
- **自动堆叠布局** - 智能计算每个 Toast 的垂直偏移量，相同位置的多个 Toast 自动堆叠，避免重叠覆盖
- **层级自动管理** - 基于 BASE_Z_INDEX(1000) 自动分配 zIndex，后显示的 Toast 层级更高
- **单例模式缓存** - 每个 selector 对应唯一的 Toast 实例，通过 Map 缓存确保实例唯一性
- **五种预设方法** - 提供 loading、success、error、warning、info 五种常用消息类型，开箱即用
- **自动关闭定时器** - 支持配置显示时长，可设置 duration=0 实现手动关闭
- **响应式配置** - 基于 Vue 3 的 ref 响应式系统，配置变更自动触发视图更新
- **TypeScript 支持** - 完整的类型定义，提供良好的开发体验
- **平台兼容性** - 支持 H5、微信小程序、App 等多个 UniApp 平台

**技术实现亮点:**

- **唯一ID生成**: 使用时间戳 + 随机字符串生成全局唯一的 Toast ID
- **偏移量计算**: 根据相同位置的活跃 Toast 数量动态计算垂直偏移
- **自动清理机制**: 关闭时自动清理定时器和从活跃队列中移除实例
- **深度合并配置**: 使用 deepMerge 工具函数合并默认配置和用户配置

## 平台兼容性

| 平台 | 支持情况 | 备注 |
|------|----------|------|
| H5 | ✅ 完全支持 | 所有功能正常 |
| 微信小程序 | ✅ 完全支持 | 需注意原生组件层级 |
| 支付宝小程序 | ✅ 完全支持 | - |
| 百度小程序 | ✅ 完全支持 | - |
| 抖音小程序 | ✅ 完全支持 | - |
| QQ小程序 | ✅ 完全支持 | - |
| 快手小程序 | ✅ 完全支持 | - |
| 京东小程序 | ✅ 完全支持 | - |
| App (iOS) | ✅ 完全支持 | - |
| App (Android) | ✅ 完全支持 | - |

## 基本用法

### 简单文本提示

最基本的用法是直接传入字符串作为提示消息：

```vue
<template>
  <view class="demo">
    <wd-button @click="showToast">显示提示</wd-button>
    <!-- 必须在页面中放置 wd-toast 组件 -->
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showToast = () => {
  toast.show('这是一条简单的提示消息')
}
</script>
```

**使用说明:**

- 必须在页面模板中放置 `<wd-toast />` 组件
- `useToast()` 返回的实例可以直接调用 `show()` 方法
- 字符串参数会自动转换为 `{ msg: '...' }` 配置对象

### 预设类型提示

组件提供了五种预设的提示类型，每种类型都有对应的图标和默认时长：

```vue
<template>
  <view class="demo">
    <wd-button @click="showSuccess">成功</wd-button>
    <wd-button @click="showError">错误</wd-button>
    <wd-button @click="showWarning">警告</wd-button>
    <wd-button @click="showInfo">信息</wd-button>
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// 成功提示 - 绿色对勾图标，默认1500ms
const showSuccess = () => {
  toast.success('提交成功')
}

// 错误提示 - 红色叉号图标，默认2000ms
const showError = () => {
  toast.error('删除失败，请稍后重试')
}

// 警告提示 - 橙色感叹号图标，默认2000ms
const showWarning = () => {
  toast.warning('库存不足，请及时补货')
}

// 信息提示 - 蓝色信息图标，默认2000ms
const showInfo = () => {
  toast.info('长按列表项可进行更多操作')
}
</script>
```

**预设类型默认配置:**

| 类型 | 图标 | 默认时长 | 其他配置 |
|------|------|----------|----------|
| success | 绿色对勾 | 1500ms | - |
| error | 红色叉号 | 2000ms | - |
| warning | 橙色感叹号 | 2000ms | - |
| info | 蓝色信息 | 2000ms | - |
| loading | 加载动画 | 0 (不自动关闭) | cover: true |

### 加载提示

加载提示默认不自动关闭，需要手动调用 `close()` 方法。加载状态通常用于异步操作期间：

```vue
<template>
  <view class="demo">
    <wd-button @click="handleLoad">加载数据</wd-button>
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleLoad = async () => {
  // 显示加载提示
  toast.loading('加载中...')

  try {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 关闭加载提示
    toast.close()

    // 显示成功提示
    toast.success('加载完成')
  } catch (error) {
    // 关闭加载提示
    toast.close()

    // 显示错误提示
    toast.error('加载失败')
  }
}
</script>
```

**注意事项:**

- loading 类型的 duration 默认为 0，不会自动关闭
- 必须在操作完成后手动调用 `toast.close()` 关闭
- 建议使用 try-finally 结构确保 loading 被正确关闭

### 自定义配置

可以传入配置对象来自定义 Toast 的各项属性：

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomToast">自定义配置</wd-button>
    <wd-toast />
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
    zIndex: 2000,
  }

  toast.show(options)
}
</script>
```

### 不同位置的 Toast

支持四种位置显示 Toast，通过 position 属性控制：

```vue
<template>
  <view class="demo">
    <wd-button @click="showTop">顶部</wd-button>
    <wd-button @click="showMiddleTop">中上部</wd-button>
    <wd-button @click="showMiddle">中部</wd-button>
    <wd-button @click="showBottom">底部</wd-button>
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// 顶部显示
const showTop = () => {
  toast.show({ msg: '顶部提示', position: 'top' })
}

// 中上部显示（默认位置）
const showMiddleTop = () => {
  toast.show({ msg: '中上提示', position: 'middle-top' })
}

// 中部显示
const showMiddle = () => {
  toast.show({ msg: '中部提示', position: 'middle' })
}

// 底部显示
const showBottom = () => {
  toast.show({ msg: '底部提示', position: 'bottom' })
}
</script>
```

**位置说明:**

| 位置 | 说明 | transform 偏移 |
|------|------|----------------|
| top | 顶部 | translate3d(0, -40vh, 0) |
| middle-top | 中上部(默认) | translate3d(0, -18.8vh, 0) |
| middle | 中部 | translate3d(0, 0, 0) |
| bottom | 底部 | translate3d(0, 40vh, 0) |

### 排列方向

支持水平和垂直两种图标与文字的排列方向：

```vue
<template>
  <view class="demo">
    <wd-button @click="showHorizontal">水平排列</wd-button>
    <wd-button @click="showVertical">垂直排列</wd-button>
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// 水平排列（默认）
const showHorizontal = () => {
  toast.success({
    msg: '水平排列的提示',
    direction: 'horizontal',
  })
}

// 垂直排列
const showVertical = () => {
  toast.success({
    msg: '垂直排列的提示',
    direction: 'vertical',
  })
}
</script>
```

## 高级用法

### 多实例管理

使用 selector 参数创建多个独立的 Toast 实例，每个实例可以独立控制：

```vue
<template>
  <view class="demo">
    <wd-button @click="showMainToast">主要提示</wd-button>
    <wd-button @click="showSecondaryToast">次要提示</wd-button>

    <!-- 默认实例 -->
    <wd-toast />
    <!-- 命名实例 -->
    <wd-toast selector="main" />
    <wd-toast selector="secondary" />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

// 创建不同的实例
const mainToast = useToast('main')
const secondaryToast = useToast('secondary')

const showMainToast = () => {
  mainToast.success('主要操作成功')
}

const showSecondaryToast = () => {
  secondaryToast.info('次要信息')
}
</script>
```

**多实例机制说明:**

- 每个 selector 对应唯一的 Toast 实例（单例模式）
- 通过 Map 数据结构 `toastOptionsCache` 缓存实例
- 不同 selector 的 Toast 完全独立，互不干扰
- 相同 selector 多次调用 `useToast()` 返回同一实例

### 加载状态切换

在异步操作中平滑切换加载状态和结果提示：

```vue
<template>
  <view class="demo">
    <wd-button @click="handleUpload">上传文件</wd-button>
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleUpload = async () => {
  // 显示自定义加载样式
  toast.loading({
    msg: '正在上传...',
    loadingType: 'ring',  // 使用环形加载动画
    loadingColor: '#1890ff',
    loadingSize: 50,
  })

  try {
    // 模拟上传
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.3 ? resolve(true) : reject(new Error('上传失败'))
      }, 2000)
    })

    // 先关闭 loading
    toast.close()

    // 显示成功提示
    toast.success({
      msg: '上传成功',
      duration: 2000,
    })
  } catch (error) {
    // 先关闭 loading
    toast.close()

    // 显示错误提示
    toast.error({
      msg: '上传失败，请重试',
      duration: 3000,
    })
  }
}
</script>
```

### 回调函数

利用 opened 和 closed 回调函数执行特定操作：

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithCallback">显示带回调的提示</wd-button>
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()
const isToastVisible = ref(false)

const showWithCallback = () => {
  toast.show({
    msg: '带回调的提示消息',
    duration: 2000,
    iconName: 'success',
    opened: () => {
      console.log('Toast 已完全展示')
      isToastVisible.value = true
      // 可以在这里执行动画、统计等操作
    },
    closed: () => {
      console.log('Toast 已完全关闭')
      isToastVisible.value = false
      // 可以在这里执行后续操作，如跳转页面
    },
  })
}
</script>
```

**回调时机说明:**

- `opened`: 在 Toast 进入动画完成后触发
- `closed`: 在 Toast 离开动画完成后触发
- 回调函数在组件内部通过 `handleAfterEnter` 和 `handleAfterLeave` 处理

### 遮罩层控制

使用 cover 属性显示遮罩层，阻止用户与页面交互：

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithCover">显示带遮罩的提示</wd-button>
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showWithCover = () => {
  // 带遮罩的提示（阻止用户操作）
  toast.show({
    msg: '这是一条重要提示',
    duration: 3000,
    cover: true,  // 显示透明遮罩
    iconName: 'warning',
  })
}

// loading 默认自带遮罩
const showLoading = () => {
  toast.loading('处理中...')  // cover 默认为 true
}
</script>
```

**遮罩层实现:**

```html
<!-- 组件内部使用 wd-overlay 实现遮罩 -->
<wd-overlay
  v-if="cover"
  :z-index="zIndex"
  lock-scroll
  :show="show"
  custom-style="background-color: transparent; pointer-events: auto;"
/>
```

### 自定义图标

除了内置图标外，还可以使用自定义图标：

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomIcon">自定义图标</wd-button>
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showCustomIcon = () => {
  // 使用自定义图标类名
  toast.show({
    msg: '自定义图标提示',
    iconClass: 'custom-icon-star',
    iconSize: 42,
    classPrefix: 'custom-icon',
    duration: 2000,
  })
}
</script>

<style>
/* 自定义图标样式 */
.custom-icon-star {
  /* 图标样式定义 */
}
</style>
```

### 动态时长计算

根据消息长度动态计算显示时长：

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

/**
 * 根据消息长度计算合适的显示时长
 * @param msg 消息内容
 * @returns 显示时长(ms)
 */
const calculateDuration = (msg: string): number => {
  // 基础时长 2000ms
  // 每10个字符增加 500ms
  // 最大不超过 5000ms
  return Math.min(2000 + Math.floor(msg.length / 10) * 500, 5000)
}

const showDynamicToast = (msg: string) => {
  toast.show({
    msg,
    duration: calculateDuration(msg),
  })
}

// 使用示例
showDynamicToast('这是一条很长的提示消息，内容比较多，需要更长的显示时间让用户能够完整阅读')
</script>
```

### 队列管理与堆叠显示

同一位置的多个 Toast 会自动堆叠显示：

```vue
<template>
  <view class="demo">
    <wd-button @click="showMultiple">显示多个 Toast</wd-button>
    <wd-toast selector="toast1" />
    <wd-toast selector="toast2" />
    <wd-toast selector="toast3" />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast1 = useToast('toast1')
const toast2 = useToast('toast2')
const toast3 = useToast('toast3')

const showMultiple = () => {
  // 同一位置的多个 Toast 会自动堆叠
  toast1.success({
    msg: '第一条消息',
    position: 'top',
    duration: 5000,
  })

  setTimeout(() => {
    toast2.info({
      msg: '第二条消息',
      position: 'top',
      duration: 4000,
    })
  }, 500)

  setTimeout(() => {
    toast3.warning({
      msg: '第三条消息',
      position: 'top',
      duration: 3000,
    })
  }, 1000)
}
</script>
```

**堆叠机制说明:**

- 每个 Toast 高度为 TOAST_HEIGHT = 60px
- 相同位置的 Toast 根据显示顺序计算垂直偏移
- 偏移量 = 活跃 Toast 数量 × TOAST_HEIGHT
- 当某个 Toast 关闭时，自动更新其他 Toast 的偏移量

### 表单验证集成

在表单验证场景中使用 Toast：

```vue
<template>
  <view class="demo">
    <wd-cell-group>
      <wd-input
        v-model="form.username"
        label="用户名"
        placeholder="请输入用户名"
      />
      <wd-input
        v-model="form.password"
        label="密码"
        type="password"
        placeholder="请输入密码"
      />
    </wd-cell-group>
    <wd-button block @click="handleSubmit">提交</wd-button>
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()

const form = reactive({
  username: '',
  password: '',
})

const validateForm = (): boolean => {
  if (!form.username.trim()) {
    toast.warning('请输入用户名')
    return false
  }

  if (form.username.length < 3) {
    toast.warning('用户名至少3个字符')
    return false
  }

  if (!form.password) {
    toast.warning('请输入密码')
    return false
  }

  if (form.password.length < 6) {
    toast.warning('密码至少6个字符')
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  toast.loading('提交中...')

  try {
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.close()
    toast.success('登录成功')
  } catch (error) {
    toast.close()
    toast.error('登录失败')
  }
}
</script>
```

## 架构与实现

### 核心架构

`useToast` 采用了模块化的设计，主要包含以下几个核心部分：

```text
┌─────────────────────────────────────────────────────────────┐
│                        useToast                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ toastOptionsCache│    │    activeToastInstances        │ │
│  │   (Map 缓存)     │    │       (活跃实例队列)            │ │
│  └────────┬────────┘    └──────────────┬──────────────────┘ │
│           │                            │                    │
│           v                            v                    │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │  getToastOption │    │    calculateToastOffset         │ │
│  │   (获取/创建)    │    │       (计算偏移)                 │ │
│  └────────┬────────┘    └──────────────┬──────────────────┘ │
│           │                            │                    │
│           v                            v                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Toast 实例 (show/close/success/error...)   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 实例管理机制

```typescript
/**
 * Toast 实例信息接口
 */
interface ToastInstance {
  id: string           // 唯一标识符
  selector: string     // 选择器
  option: ToastOptionRef  // 响应式配置引用
  zIndex: number       // 层级
  offsetY: number      // 垂直偏移量
  timer?: ReturnType<typeof setTimeout>  // 自动关闭定时器
}

// 全局缓存 - 确保同一 selector 对应唯一实例
const toastOptionsCache = new Map<string, ToastOptionRef>()

// 活跃实例队列 - 用于管理偏移位置
const activeToastInstances = new Map<string, ToastInstance>()
```

### 唯一ID生成

```typescript
/**
 * 生成唯一的 Toast 实例 ID
 * 格式: toast_时间戳_随机字符串
 */
const generateToastId = (): string => {
  return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
```

### 偏移量计算

```typescript
// 常量定义
const TOAST_HEIGHT = 60    // Toast 基础高度(px)
const BASE_Z_INDEX = 1000  // 基础层级

/**
 * 计算 Toast 的偏移位置和层级
 */
const calculateToastOffset = (position: string) => {
  // 1. 过滤相同位置且正在显示的 Toast
  const samePositionToasts = Array.from(activeToastInstances.values())
    .filter((instance) => {
      const instancePosition = instance.option.value.position || 'middle-top'
      const isVisible = instance.option.value.show === true
      return instancePosition === position && isVisible
    })
    .sort((a, b) => a.zIndex - b.zIndex)

  // 2. 计算偏移量 = 活跃数量 × 高度
  const offsetY = samePositionToasts.length * TOAST_HEIGHT

  // 3. 计算层级 = 基础层级 + 活跃总数
  const zIndex = BASE_Z_INDEX + activeToastInstances.size

  return { offsetY, zIndex }
}
```

### 显示流程

```typescript
const show = (option: ToastOptions | string) => {
  // 1. 关闭当前 selector 的旧 Toast
  const currentToastId = toastOption.value._toastId
  if (currentToastId && activeToastInstances.has(currentToastId)) {
    close(currentToastId)
  }

  // 2. 合并配置
  const options = deepMerge(
    defaultOptions,
    typeof option === 'string' ? { msg: option } : option,
  )

  // 3. 计算偏移和层级
  cleanupClosedToasts()
  const { offsetY, zIndex } = calculateToastOffset(options.position || 'middle-top')

  // 4. 生成唯一 ID
  const toastId = generateToastId()

  // 5. 创建实例并添加到队列
  const toastInstance: ToastInstance = {
    id: toastId,
    selector,
    option: toastOption,
    zIndex,
    offsetY,
  }
  activeToastInstances.set(toastId, toastInstance)

  // 6. 更新配置触发显示
  toastOption.value = { ...options, show: true, zIndex, _offsetY: offsetY, _toastId: toastId }

  // 7. 设置自动关闭定时器
  if (options.duration && options.duration > 0) {
    toastInstance.timer = setTimeout(() => close(toastId), options.duration)
  }
}
```

## API

### useToast()

创建或获取 Toast 实例。

```typescript
function useToast(selector?: string): Toast
```

**参数:**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| selector | 选择器，用于支持多实例 | `string` | `''` |

**返回值方法:**

| 方法 | 说明 | 类型 |
|------|------|------|
| show | 显示 Toast | `(option: ToastOptions \| string) => void` |
| success | 显示成功 Toast | `(option: ToastOptions \| string) => void` |
| error | 显示错误 Toast | `(option: ToastOptions \| string) => void` |
| warning | 显示警告 Toast | `(option: ToastOptions \| string) => void` |
| info | 显示信息 Toast | `(option: ToastOptions \| string) => void` |
| loading | 显示加载 Toast | `(option: ToastOptions \| string) => void` |
| close | 关闭当前 Toast | `() => void` |

### 预设配置

各预设方法的默认配置：

| 方法 | iconName | duration | cover | 说明 |
|------|----------|----------|-------|------|
| success | `'success'` | `1500` | `false` | 绿色对勾图标 |
| error | `'error'` | `2000` | `false` | 红色叉号图标 |
| warning | `'warning'` | `2000` | `false` | 橙色感叹号图标 |
| info | `'info'` | `2000` | `false` | 蓝色信息图标 |
| loading | `'loading'` | `0` | `true` | 加载动画 |

### ToastOptions

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| msg | 提示信息 | `string` | - |
| duration | 显示时长(ms)，0表示不自动关闭 | `number` | `2000` |
| direction | 图标和文字排列方向 | `'vertical' \| 'horizontal'` | `'horizontal'` |
| iconName | 图标名称 | `ToastIconType` | `''` |
| iconSize | 图标大小 | `number` | `42` |
| iconColor | 图标颜色 | `string` | - |
| loadingType | 加载图标类型 | `'outline' \| 'ring'` | `'outline'` |
| loadingColor | 加载图标颜色 | `string` | `'#4D80F0'` |
| loadingSize | 加载图标大小 | `number` | `45` |
| position | Toast 位置 | `ToastPositionType` | `'middle-top'` |
| zIndex | 层级 | `number` | `1000` |
| cover | 是否显示遮罩层 | `boolean` | `false` |
| iconClass | 图标自定义类名 | `string` | `''` |
| classPrefix | 图标类名前缀 | `string` | `'wd-icon'` |
| opened | 完全展示后的回调 | `() => void` | - |
| closed | 完全关闭后的回调 | `() => void` | - |

### WdToastProps

wd-toast 组件的 Props：

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customStyle | 自定义根节点样式 | `string` | `''` |
| customClass | 自定义根节点类名 | `string` | `''` |
| selector | 选择器 | `string` | `''` |
| msg | 提示信息 | `string` | `''` |
| direction | 排列方向 | `ToastDirection` | `'horizontal'` |
| iconName | 图标名称 | `ToastIconType` | `''` |
| iconSize | 图标大小 | `number` | - |
| loadingType | 加载类型 | `ToastLoadingType` | `'outline'` |
| loadingColor | 加载颜色 | `string` | `'#4D80F0'` |
| loadingSize | 加载大小 | `number` | `45` |
| iconColor | 图标颜色 | `string` | - |
| position | 位置 | `ToastPositionType` | `'middle-top'` |
| zIndex | 层级 | `number` | `1000` |
| cover | 是否显示遮罩层 | `boolean` | `false` |
| iconClass | 图标自定义类名 | `string` | `''` |
| classPrefix | 类名前缀 | `string` | `'wd-icon'` |
| opened | 展示后回调 | `() => void` | - |
| closed | 关闭后回调 | `() => void` | - |

### 工具函数

| 函数 | 说明 | 参数 |
|------|------|------|
| `getToastOption(selector?)` | 获取或创建指定 selector 的 Toast 配置 | `selector?: string` |
| `getToastOptionKey(selector)` | 获取 Toast 选项的注入键 | `selector: string` |
| `clearToastOption(selector?)` | 清理指定 selector 的 Toast 配置缓存 | `selector?: string` |
| `clearAllToastOptions()` | 清理所有 Toast 配置缓存 | - |
| `cleanupClosedToasts()` | 清理已关闭的 Toast 实例 | - |

## 类型定义

```typescript
/**
 * 图标类型
 */
type ToastIconType = 'success' | 'error' | 'warning' | 'loading' | 'info' | ''

/**
 * 位置类型
 */
type ToastPositionType = 'top' | 'middle-top' | 'middle' | 'bottom'

/**
 * 排列方向
 */
type ToastDirection = 'vertical' | 'horizontal'

/**
 * 加载图标类型
 */
type ToastLoadingType = 'outline' | 'ring'

/**
 * Toast 配置选项接口
 */
interface ToastOptions {
  /** 提示信息 */
  msg?: string
  /** 显示时长，单位ms */
  duration?: number
  /** 排列方向 */
  direction?: ToastDirection
  /** 图标名称 */
  iconName?: ToastIconType
  /** 图标大小 */
  iconSize?: number
  /** 加载类型 */
  loadingType?: ToastLoadingType
  /** 加载颜色 */
  loadingColor?: string
  /** 加载大小 */
  loadingSize?: number
  /** 图标颜色 */
  iconColor?: string
  /** 位置 */
  position?: ToastPositionType
  /** 是否显示 */
  show?: boolean
  /** 层级 */
  zIndex?: number
  /** 是否存在遮罩层 */
  cover?: boolean
  /** 图标类名 */
  iconClass?: string
  /** 类名前缀 */
  classPrefix?: string
  /** 完全展示后的回调函数 */
  opened?: () => void
  /** 完全关闭时的回调函数 */
  closed?: () => void
  /** 内部使用：Y轴偏移量 */
  _offsetY?: number
  /** 内部使用：Toast实例ID */
  _toastId?: string
}

/**
 * Toast 实例接口
 */
interface Toast {
  /** 打开Toast */
  show: (toastOptions: ToastOptions | string) => void
  /** 成功提示 */
  success: (toastOptions: ToastOptions | string) => void
  /** 错误提示 */
  error: (toastOptions: ToastOptions | string) => void
  /** 常规提示 */
  info: (toastOptions: ToastOptions | string) => void
  /** 警告提示 */
  warning: (toastOptions: ToastOptions | string) => void
  /** 加载提示 */
  loading: (toastOptions: ToastOptions | string) => void
  /** 关闭Toast */
  close: () => void
}

/**
 * Toast 选项的响应式引用类型
 */
type ToastOptionRef = Ref<ToastOptions>

/**
 * Toast 实例信息
 */
interface ToastInstance {
  id: string
  selector: string
  option: ToastOptionRef
  zIndex: number
  offsetY: number
  timer?: ReturnType<typeof setTimeout>
}

/**
 * 常量定义
 */
const TOAST_HEIGHT = 60     // Toast 基础高度(px)
const BASE_Z_INDEX = 1000   // 基础层级

/**
 * 默认配置选项
 */
const defaultOptions: ToastOptions = {
  duration: 2000,
  show: false,
}
```

## 主题定制

### CSS 变量

Toast 组件支持以下 CSS 变量进行主题定制：

```scss
// Toast 组件 CSS 变量
$-toast-max-width: 70%;              // 最大宽度
$-toast-padding: 12px 20px;          // 内边距
$-toast-bg: rgba(0, 0, 0, 0.8);      // 背景色
$-toast-radius: 8px;                 // 圆角
$-toast-color: #ffffff;              // 文字颜色
$-toast-fs: 14px;                    // 字体大小
$-toast-line-height: 1.5;            // 行高
$-toast-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);  // 阴影

// 图标相关
$-toast-icon-size: 42px;             // 图标大小
$-toast-icon-margin-right: 8px;      // 图标右边距(水平)
$-toast-icon-margin-bottom: 8px;     // 图标下边距(垂直)

// 加载相关
$-toast-loading-padding: 20px;       // 纯加载状态内边距
$-toast-loading-margin-bottom: 8px;  // 加载图标下边距

// 带图标样式
$-toast-with-icon-min-width: 120px;  // 带图标最小宽度
```

### 暗黑模式

Toast 组件自动适配暗黑模式，在 `.wot-theme-dark` 类下会应用暗黑主题样式：

```scss
.wot-theme-dark {
  .wd-toast {
    background-color: rgba(50, 50, 50, 0.9);
    color: #e0e0e0;
  }
}
```

### 自定义样式

通过 customClass 和 customStyle 自定义样式：

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomStyle">自定义样式</wd-button>
    <wd-toast custom-class="my-toast" />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showCustomStyle = () => {
  toast.success({
    msg: '自定义样式提示',
    duration: 2000,
  })
}
</script>

<style>
.my-toast {
  background-color: rgba(0, 100, 200, 0.9) !important;
  border-radius: 20px !important;
}
</style>
```

## 最佳实践

### 1. 合理选择提示类型

根据操作结果选择合适的提示类型，提升用户体验：

```typescript
// ✅ 正确：根据操作结果选择类型
const handleSave = async () => {
  try {
    await saveData()
    toast.success('保存成功')  // 成功用 success
  } catch (error) {
    toast.error('保存失败')    // 失败用 error
  }
}

// ✅ 正确：使用适当的提示类型
toast.warning('库存不足')     // 警告信息
toast.info('点击查看详情')     // 普通信息

// ❌ 错误：所有场景都用 show
toast.show('删除成功')        // 应该用 toast.success()
toast.show('操作失败')        // 应该用 toast.error()
```

### 2. 正确管理 loading 状态

使用 try-finally 确保 loading 被正确关闭：

```typescript
// ✅ 正确：使用 try-finally
const handleSubmit = async () => {
  toast.loading('提交中...')
  try {
    await submitForm()
    toast.success('提交成功')
  } catch (error) {
    toast.error('提交失败')
  } finally {
    toast.close()  // 确保关闭
  }
}

// ❌ 错误：可能导致 loading 无法关闭
const handleSubmit = async () => {
  toast.loading('提交中...')
  await submitForm()  // 如果抛出异常，loading 永远不会关闭
  toast.close()
}
```

### 3. 避免 Toast 滥用

批量操作使用统一提示，避免频繁显示：

```typescript
// ✅ 正确：批量操作后统一提示
const handleBatchDelete = async (items: any[]) => {
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

// ❌ 错误：循环中频繁显示
items.forEach(item => {
  toast.success(`删除 ${item.name} 成功`)  // 可能堆叠几十个
})
```

### 4. 合理设置显示时长

根据消息内容长度设置合适的显示时长：

```typescript
// 短消息：使用默认时长
toast.success('保存成功')  // 默认 1500ms

// 长消息：延长时长
toast.info({
  msg: '您的订单已提交，预计1-2个工作日内发货，请保持手机畅通',
  duration: 4000,
})

// 动态计算时长
const showDynamic = (msg: string) => {
  const duration = Math.min(2000 + Math.floor(msg.length / 10) * 500, 5000)
  toast.show({ msg, duration })
}
```

### 5. 使用多实例隔离

不同功能模块使用不同的 selector：

```typescript
// ✅ 正确：不同功能模块使用不同实例
const formToast = useToast('form')
const uploadToast = useToast('upload')

// 表单和上传可以独立控制，互不干扰
formToast.loading('提交中...')
uploadToast.loading('上传中...')

// 分别关闭
formToast.close()
uploadToast.close()
```

### 6. 页面卸载时清理

在页面卸载时清理 Toast 资源：

```typescript
import { onUnmounted } from 'vue'
import { useToast, clearToastOption } from '@/wd'

const toast = useToast('myPage')

onUnmounted(() => {
  toast.close()
  clearToastOption('myPage')
})
```

### 7. 配合路由使用

页面跳转时关闭 Toast：

```typescript
import { useRouter } from 'vue-router'
import { useToast } from '@/wd'

const router = useRouter()
const toast = useToast()

const handleNavigate = () => {
  toast.close()  // 跳转前关闭 Toast
  router.push('/next-page')
}
```

### 8. 错误处理统一封装

封装统一的错误处理函数：

```typescript
import { useToast } from '@/wd'

const toast = useToast()

interface ApiError {
  code: number
  message: string
}

const handleError = (error: ApiError) => {
  const errorMessages: Record<number, string> = {
    401: '登录已过期，请重新登录',
    403: '没有操作权限',
    404: '资源不存在',
    500: '服务器错误，请稍后重试',
  }

  const msg = errorMessages[error.code] || error.message || '操作失败'
  toast.error(msg)
}

// 使用
try {
  await apiCall()
} catch (error) {
  handleError(error as ApiError)
}
```

## 常见问题

### 1. Toast 不显示

**原因**: 未在页面中放置 `<wd-toast />` 组件

**解决方案**:

```vue
<template>
  <view class="page">
    <!-- 页面内容 -->

    <!-- 必须放置 wd-toast 组件 -->
    <wd-toast />

    <!-- 如果使用命名实例，需要放置对应的组件 -->
    <wd-toast selector="main" />
  </view>
</template>
```

### 2. loading Toast 无法关闭

**原因**: 忘记调用 `close()` 或异常未捕获导致 `close()` 未执行

**解决方案**: 使用 try-finally 确保关闭

```typescript
toast.loading('加载中...')
try {
  await fetchData()
  toast.success('加载成功')
} catch (error) {
  toast.error('加载失败')
} finally {
  toast.close()  // 无论成功失败都会执行
}
```

### 3. 多个 Toast 重叠显示

**原因**: 相同 selector 的 Toast 组件放置多次

**解决方案**: 每个 selector 只放置一次组件

```vue
<template>
  <view class="page">
    <!-- ✅ 正确：每个 selector 只有一个 -->
    <wd-toast />
    <wd-toast selector="form" />

    <!-- ❌ 错误：重复放置 -->
    <wd-toast />
    <wd-toast />
  </view>
</template>
```

### 4. 小程序平台层级问题

**原因**: 小程序原生组件(map、video、canvas)层级高于普通元素

**解决方案**: 提高 zIndex 或使用 cover

```typescript
toast.success({
  msg: '操作成功',
  zIndex: 99999,  // 提高层级
  cover: true,    // 遮罩层可覆盖原生组件
})
```

### 5. TypeScript 类型错误

**原因**: 类型导入不正确

**解决方案**: 正确导入类型

```typescript
import { useToast } from '@/wd'
import type { Toast, ToastOptions, ToastIconType, ToastPositionType } from '@/wd'

const toast: Toast = useToast()

const options: ToastOptions = {
  msg: '类型安全的配置',
  duration: 3000,
  position: 'top',
  iconName: 'success',
}

toast.show(options)
```

### 6. 快速连续显示 Toast 时闪烁

**原因**: 快速切换 Toast 时动画未完成

**解决方案**: 先关闭再显示，或使用延迟

```typescript
// 方法1：先关闭再显示
const showNewToast = () => {
  toast.close()
  setTimeout(() => {
    toast.success('新提示')
  }, 100)
}

// 方法2：使用不同实例
const toast1 = useToast('toast1')
const toast2 = useToast('toast2')

toast1.close()
toast2.success('新提示')
```

### 7. 自定义图标不显示

**原因**: iconClass 或 classPrefix 配置错误

**解决方案**: 检查图标类名和前缀

```typescript
// 确保图标类名存在
toast.show({
  msg: '自定义图标',
  iconClass: 'my-icon',        // 确保这个类名存在
  classPrefix: 'custom-icon',   // 确保前缀正确
})
```

```css
/* 确保图标样式已定义 */
.custom-icon-my-icon {
  background-image: url('...');
  /* ... */
}
```

### 8. 回调函数不执行

**原因**: 回调函数未正确传递或 Toast 被意外关闭

**解决方案**: 检查回调函数定义和 Toast 生命周期

```typescript
toast.show({
  msg: '带回调的提示',
  duration: 2000,
  opened: () => {
    console.log('Toast 已展示')  // 进入动画完成后执行
  },
  closed: () => {
    console.log('Toast 已关闭')  // 离开动画完成后执行
    // 如果在 duration 结束前手动调用 close()，也会触发
  },
})
```

## 总结

`useToast` 核心使用要点:

1. **创建实例**: `const toast = useToast()` 或 `useToast('selector')`
2. **显示提示**: 根据场景选择 `success/error/warning/info/loading`
3. **关闭 loading**: 必须手动调用 `toast.close()`
4. **页面配置**: 必须放置 `<wd-toast />` 组件
5. **多实例隔离**: 不同功能模块使用不同 selector
6. **异常处理**: 使用 try-finally 确保 loading 正确关闭
7. **合理时长**: 根据消息长度设置合适的 duration
8. **避免滥用**: 批量操作使用统一提示

**架构特点:**

- **单例模式**: 每个 selector 对应唯一实例
- **队列管理**: 基于 Map 管理活跃实例
- **自动堆叠**: 相同位置自动计算偏移
- **响应式**: 基于 Vue 3 ref 响应式系统
- **类型安全**: 完整的 TypeScript 类型定义
