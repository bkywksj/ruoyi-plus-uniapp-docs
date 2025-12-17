---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/toast
---

# Toast 轻提示

## 介绍

Toast 轻提示是一个轻量级的消息通知组件,用于向用户显示简短的提示信息、操作结果反馈、加载状态等场景。组件支持函数式调用,提供丰富的图标类型和位置选项,可灵活应用于各种业务场景。

**核心特性:**

- **函数式调用** - 通过 `useToast` 组合函数进行调用,无需在模板中声明组件
- **多图标类型** - 内置 success、error、warning、info、loading 五种状态图标,支持自定义图标
- **灵活定位** - 支持 top、middle-top、middle、bottom 四种位置,满足不同展示需求
- **SVG 图标** - 内置图标使用 SVG 实现,高清无锯齿,支持自定义尺寸和颜色
- **自动关闭** - 支持设置显示时长,到期自动关闭,loading 类型默认不自动关闭
- **多实例管理** - 支持同时显示多个 Toast,自动计算偏移位置避免重叠
- **遮罩层支持** - 可选遮罩层,防止用户在 Toast 显示期间进行其他操作
- **动画过渡** - 使用 fade 淡入淡出动画,视觉效果流畅自然
- **双向排列** - 支持 horizontal(水平)和 vertical(垂直)两种图标与文本排列方式
- **自定义样式** - 支持 customStyle 和 customClass 进行样式定制
- **回调函数** - 提供 opened 和 closed 回调,方便在展示和关闭时执行自定义逻辑
- **响应式配置** - 基于 Vue 3 响应式系统,配置变化即时生效

参考: src/wd/components/wd-toast/wd-toast.vue:1-522

## 基本用法

### 基础提示

最简单的使用方式,通过 `useToast` 函数调用显示文本提示。

```vue
<template>
  <view class="demo">
    <wd-button @click="showToast">显示基础提示</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showToast = () => {
  toast.show('这是一条提示消息')
}
</script>

```

**默认配置:**
- **显示时长**: 2000ms (2秒)
- **位置**: middle-top(中上部)
- **无图标**: 纯文本提示
- **自动关闭**: 2秒后自动关闭

参考: src/wd/components/wd-toast/useToast.ts:51-54

### 成功提示

显示操作成功的提示,内置绿色对勾图标。

```vue
<template>
  <view class="demo">
    <wd-button type="success" @click="showSuccess">操作成功</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showSuccess = () => {
  toast.success('操作成功!')
}
</script>

```

**成功提示特点:**
- **图标**: 绿色圆形对勾图标
- **默认时长**: 1500ms (1.5秒)
- **适用场景**: 表单提交成功、数据保存成功、删除成功等

参考: src/wd/components/wd-toast/useToast.ts:303-307

### 错误提示

显示操作失败或错误的提示,内置红色叉号图标。

```vue
<template>
  <view class="demo">
    <wd-button type="error" @click="showError">操作失败</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showError = () => {
  toast.error('操作失败,请重试')
}
</script>

```

**错误提示特点:**
- **图标**: 红色圆形叉号图标
- **默认时长**: 2000ms (2秒)
- **适用场景**: 表单验证失败、网络请求失败、操作权限不足等

参考: src/wd/components/wd-toast/useToast.ts:310-314

### 警告提示

显示警告信息,内置橙色感叹号图标。

```vue
<template>
  <view class="demo">
    <wd-button type="warning" @click="showWarning">警告提示</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showWarning = () => {
  toast.warning('请注意数据安全')
}
</script>

```

**警告提示特点:**
- **图标**: 橙色圆形感叹号图标
- **默认时长**: 2000ms (2秒)
- **适用场景**: 数据即将过期、操作风险提示、配额即将用尽等

参考: src/wd/components/wd-toast/useToast.ts:316-321

### 信息提示

显示一般信息,内置灰色信息图标。

```vue
<template>
  <view class="demo">
    <wd-button type="info" @click="showInfo">信息提示</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showInfo = () => {
  toast.info('这是一条普通信息')
}
</script>

```

**信息提示特点:**
- **图标**: 灰色圆形信息图标
- **默认时长**: 2000ms (2秒)
- **适用场景**: 功能说明、提示文案、中性通知等

参考: src/wd/components/wd-toast/useToast.ts:323-328

### 加载提示

显示加载状态,内置旋转动画,默认不自动关闭,需手动关闭。

```vue
<template>
  <view class="demo">
    <wd-button @click="showLoading">显示加载</wd-button>
    <wd-button @click="hideLoading" custom-style="margin-left: 16rpx;">关闭加载</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showLoading = () => {
  toast.loading('加载中...')
}

const hideLoading = () => {
  toast.close()
}
</script>

```

**加载提示特点:**
- **图标**: 蓝色旋转加载动画
- **默认时长**: 0 (不自动关闭)
- **遮罩层**: 默认开启,阻止用户操作
- **适用场景**: 数据请求、文件上传、异步处理等

参考: src/wd/components/wd-toast/useToast.ts:293-299

### 自定义显示时长

通过 `duration` 选项设置 Toast 显示时长,单位为毫秒。

```vue
<template>
  <view class="demo">
    <wd-button @click="show3s">显示 3 秒</wd-button>
    <wd-button @click="show5s" custom-style="margin-left: 16rpx;">显示 5 秒</wd-button>
    <wd-button @click="showForever" custom-style="margin-left: 16rpx;">不自动关闭</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const show3s = () => {
  toast.show({
    msg: '显示 3 秒后关闭',
    duration: 3000,
  })
}

const show5s = () => {
  toast.show({
    msg: '显示 5 秒后关闭',
    duration: 5000,
  })
}

const showForever = () => {
  toast.show({
    msg: '不会自动关闭,需手动关闭',
    duration: 0,
  })
}
</script>

```

**时长说明:**
- **duration > 0**: 指定时长后自动关闭,单位 ms
- **duration = 0**: 不自动关闭,需调用 `toast.close()` 手动关闭
- **默认值**: 普通提示 2000ms,成功提示 1500ms,加载提示 0

参考: src/wd/components/wd-toast/useToast.ts:270-274

### 位置设置

Toast 支持四种位置:top(顶部)、middle-top(中上部)、middle(中部)、bottom(底部)。

```vue
<template>
  <view class="demo">
    <view class="demo-group">
      <text class="demo-title">位置设置</text>
      <wd-button @click="showTop">顶部</wd-button>
      <wd-button @click="showMiddleTop" custom-style="margin-left: 16rpx;">中上部</wd-button>
    </view>

    <view class="demo-group">
      <wd-button @click="showMiddle">中部</wd-button>
      <wd-button @click="showBottom" custom-style="margin-left: 16rpx;">底部</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showTop = () => {
  toast.show({
    msg: '显示在顶部',
    position: 'top',
  })
}

const showMiddleTop = () => {
  toast.show({
    msg: '显示在中上部(默认)',
    position: 'middle-top',
  })
}

const showMiddle = () => {
  toast.show({
    msg: '显示在中部',
    position: 'middle',
  })
}

const showBottom = () => {
  toast.show({
    msg: '显示在底部',
    position: 'bottom',
  })
}
</script>

```

**位置说明:**
- **top**: 距离顶部 -40vh,适合不干扰主要内容的提示
- **middle-top**: 距离顶部 -18.8vh,默认位置,视觉平衡
- **middle**: 屏幕正中,适合重要提示
- **bottom**: 距离底部 40vh,适合底部操作反馈

参考: src/wd/components/wd-toast/wd-toast.vue:496-506

## 高级用法

### 垂直排列

通过 `direction` 选项设置图标和文本垂直排列。

```vue
<template>
  <view class="demo">
    <wd-button @click="showVertical">垂直排列</wd-button>
    <wd-button @click="showHorizontal" custom-style="margin-left: 16rpx;">水平排列(默认)</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showVertical = () => {
  toast.success({
    msg: '操作成功',
    direction: 'vertical',
  })
}

const showHorizontal = () => {
  toast.success({
    msg: '操作成功',
    direction: 'horizontal',
  })
}
</script>

```

**排列方式:**
- **horizontal**: 图标和文本水平排列,图标在左,文本在右
- **vertical**: 图标和文本垂直排列,图标在上,文本在下

参考: src/wd/components/wd-toast/wd-toast.vue:440-465

### 自定义图标

使用自定义图标替代内置图标。

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomIcon">自定义图标</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showCustomIcon = () => {
  toast.show({
    msg: '使用自定义图标',
    iconClass: 'wd-icon-star-on',
    iconSize: 42,
  })
}
</script>

```

**自定义图标说明:**
- **iconClass**: 图标类名,支持字体图标或 Iconify 图标
- **iconSize**: 图标尺寸,默认与内置图标一致
- **classPrefix**: 图标类名前缀,默认 `wd-icon`

参考: src/wd/components/wd-toast/wd-toast.vue:41-47

### 遮罩层

开启遮罩层,阻止用户在 Toast 显示期间进行其他操作。

```vue
<template>
  <view class="demo">
    <view class="demo-group">
      <wd-button @click="withCover">带遮罩层</wd-button>
      <wd-button @click="withoutCover" custom-style="margin-left: 16rpx;">无遮罩层</wd-button>
    </view>

    <view class="counter">
      <text>计数器: {{ count }}</text>
      <wd-button @click="count++" custom-style="margin-left: 16rpx;">点击 +1</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()
const count = ref(0)

const withCover = () => {
  toast.loading({
    msg: '加载中...(无法点击计数器)',
    cover: true,
  })

  setTimeout(() => {
    toast.close()
  }, 3000)
}

const withoutCover = () => {
  toast.show({
    msg: '提示中...(可以点击计数器)',
    cover: false,
    duration: 3000,
  })
}
</script>

```

**遮罩层说明:**
- **cover: true**: 显示半透明遮罩层,阻止用户操作,loading 默认开启
- **cover: false**: 无遮罩层,用户可以继续操作页面

参考: src/wd/components/wd-toast/wd-toast.vue:3-9

### 加载类型

Loading 图标支持两种类型:ring(环形)和 outline(外边框)。

```vue
<template>
  <view class="demo">
    <wd-button @click="showRing">环形加载</wd-button>
    <wd-button @click="showOutline" custom-style="margin-left: 16rpx;">外边框加载</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showRing = () => {
  toast.loading({
    msg: '环形加载中...',
    loadingType: 'ring',
  })

  setTimeout(() => {
    toast.close()
  }, 3000)
}

const showOutline = () => {
  toast.loading({
    msg: '外边框加载中...',
    loadingType: 'outline',
  })

  setTimeout(() => {
    toast.close()
  }, 3000)
}
</script>

```

**加载类型说明:**
- **ring**: 环形加载动画,带渐变效果,视觉丰富
- **outline**: 外边框加载动画,简洁清晰

参考: src/wd/components/wd-toast/wd-toast.vue:19-25

### 自定义加载样式

自定义 Loading 图标的颜色和尺寸。

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomLoading">自定义加载样式</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showCustomLoading = () => {
  toast.loading({
    msg: '正在上传...',
    loadingColor: '#00C851',
    loadingSize: 60,
    loadingType: 'ring',
  })

  setTimeout(() => {
    toast.close()
  }, 3000)
}
</script>

```

**加载样式选项:**
- **loadingColor**: 加载图标颜色,默认 `#4D80F0`
- **loadingSize**: 加载图标尺寸,默认 45
- **loadingType**: 加载图标类型,默认 `outline`

参考: src/wd/components/wd-toast/wd-toast.vue:217-218

### 回调函数

在 Toast 完全展示或关闭时执行回调函数。

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithCallback">显示带回调的提示</wd-button>

    <view class="log-area">
      <text class="log-title">回调日志:</text>
      <view v-for="(log, index) in logs" :key="index" class="log-item">
        {{ log }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()
const logs = ref<string[]>([])

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push(`[${timestamp}] ${message}`)
}

const showWithCallback = () => {
  toast.show({
    msg: '提示消息',
    duration: 2000,
    opened: () => {
      addLog('Toast 已完全展示')
    },
    closed: () => {
      addLog('Toast 已完全关闭')
    },
  })
}
</script>

```

**回调说明:**
- **opened**: Toast 完全展示后触发(fade 动画结束)
- **closed**: Toast 完全关闭后触发(fade 动画结束)

参考: src/wd/components/wd-toast/wd-toast.vue:404-419

### 多实例管理

同时显示多个 Toast,通过 selector 区分不同实例。

```vue
<template>
  <view class="demo">
    <view class="demo-group">
      <wd-button @click="showToast1">显示 Toast 1</wd-button>
      <wd-button @click="showToast2" custom-style="margin-left: 16rpx;">显示 Toast 2</wd-button>
      <wd-button @click="showToast3" custom-style="margin-left: 16rpx;">显示 Toast 3</wd-button>
    </view>

    <view class="demo-group">
      <wd-button @click="closeToast1">关闭 Toast 1</wd-button>
      <wd-button @click="closeToast2" custom-style="margin-left: 16rpx;">关闭 Toast 2</wd-button>
      <wd-button @click="closeToast3" custom-style="margin-left: 16rpx;">关闭 Toast 3</wd-button>
    </view>

    <!-- Toast 组件声明 -->
    <wd-toast selector="toast1" />
    <wd-toast selector="toast2" />
    <wd-toast selector="toast3" />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

// 创建三个不同的 Toast 实例
const toast1 = useToast('toast1')
const toast2 = useToast('toast2')
const toast3 = useToast('toast3')

const showToast1 = () => {
  toast1.success({
    msg: '这是 Toast 1',
    duration: 0,
  })
}

const showToast2 = () => {
  toast2.warning({
    msg: '这是 Toast 2',
    duration: 0,
  })
}

const showToast3 = () => {
  toast3.info({
    msg: '这是 Toast 3',
    duration: 0,
  })
}

const closeToast1 = () => {
  toast1.close()
}

const closeToast2 = () => {
  toast2.close()
}

const closeToast3 = () => {
  toast3.close()
}
</script>

```

**多实例说明:**
- 通过 `selector` 区分不同的 Toast 实例
- 每个实例独立管理,互不影响
- 同位置的多个 Toast 会自动计算偏移,避免重叠

参考: src/wd/components/wd-toast/useToast.ts:142-157

### 位置偏移计算

多个相同位置的 Toast 会自动计算偏移量,避免重叠显示。

```vue
<template>
  <view class="demo">
    <wd-button @click="showMultiple">连续显示多个 Toast</wd-button>
    <wd-button @click="closeAll" custom-style="margin-left: 16rpx;">关闭所有</wd-button>

    <!-- 声明多个 Toast 组件 -->
    <wd-toast v-for="index in 5" :key="index" :selector="`toast-${index}`" />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toasts = Array.from({ length: 5 }, (_, i) => useToast(`toast-${i + 1}`))

const showMultiple = () => {
  toasts.forEach((toast, index) => {
    setTimeout(() => {
      toast.success({
        msg: `提示 ${index + 1}`,
        duration: 0,
        position: 'middle-top',
      })
    }, index * 200)
  })
}

const closeAll = () => {
  toasts.forEach((toast) => {
    toast.close()
  })
}
</script>

```

**偏移计算逻辑:**
- 基础高度为 60rpx(TOAST_HEIGHT)
- 第 1 个 Toast: offsetY = 0
- 第 2 个 Toast: offsetY = 60rpx
- 第 3 个 Toast: offsetY = 120rpx
- 以此类推,每个增加 60rpx

参考: src/wd/components/wd-toast/useToast.ts:78-92

### 异步操作提示

在异步操作过程中显示加载提示,完成后显示结果。

```vue
<template>
  <view class="demo">
    <wd-button @click="handleSubmit">提交数据</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleSubmit = async () => {
  // 显示加载提示
  toast.loading('正在提交...')

  try {
    // 模拟异步请求
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 模拟成功或失败
    const isSuccess = Math.random() > 0.3

    // 关闭加载提示
    toast.close()

    // 显示结果
    if (isSuccess) {
      toast.success('提交成功!')
    } else {
      toast.error('提交失败,请重试')
    }
  } catch (error) {
    toast.close()
    toast.error('网络错误')
  }
}
</script>

```

**异步操作模式:**
1. 操作开始时显示 loading 提示
2. 操作进行中,用户无法进行其他操作(遮罩层)
3. 操作完成后关闭 loading
4. 根据结果显示成功或失败提示

参考: src/wd/components/wd-toast/useToast.ts:293-299

### 动态更新内容

在 Toast 显示过程中动态更新内容。

```vue
<template>
  <view class="demo">
    <wd-button @click="startCountdown">倒计时提示</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()

const startCountdown = () => {
  let count = 5

  // 显示初始提示
  toast.show({
    msg: `倒计时: ${count} 秒`,
    duration: 0,
  })

  // 每秒更新一次
  const timer = setInterval(() => {
    count--

    if (count > 0) {
      toast.show({
        msg: `倒计时: ${count} 秒`,
        duration: 0,
      })
    } else {
      clearInterval(timer)
      toast.success('倒计时结束!')
    }
  }, 1000)
}
</script>

```

**动态更新说明:**
- 调用 `toast.show()` 会更新当前 Toast 的内容
- 适用于进度提示、倒计时等场景
- 更新时保持其他配置不变

参考: src/wd/components/wd-toast/useToast.ts:222-275

## API

### Toast 方法

通过 `useToast` 获取 Toast 实例,支持以下方法:

| 方法名 | 说明 | 参数 |
|--------|------|------|
| show | 显示 Toast | `ToastOptions \| string` |
| success | 成功提示 | `ToastOptions \| string` |
| error | 错误提示 | `ToastOptions \| string` |
| warning | 警告提示 | `ToastOptions \| string` |
| info | 信息提示 | `ToastOptions \| string` |
| loading | 加载提示 | `ToastOptions \| string` |
| close | 关闭 Toast | - |

参考: src/wd/components/wd-toast/wd-toast.vue:143-164

### ToastOptions

Toast 配置选项接口:

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| msg | 提示信息 | `string` | `''` |
| duration | 显示时长,单位 ms,0 为不自动关闭 | `number` | `2000` |
| position | 位置 | `'top' \| 'middle-top' \| 'middle' \| 'bottom'` | `'middle-top'` |
| direction | 排列方向 | `'vertical' \| 'horizontal'` | `'horizontal'` |
| iconName | 图标名称 | `'success' \| 'error' \| 'warning' \| 'loading' \| 'info' \| ''` | `''` |
| iconSize | 图标大小 | `number` | - |
| iconClass | 自定义图标类名 | `string` | `''` |
| classPrefix | 图标类名前缀 | `string` | `'wd-icon'` |
| loadingType | 加载类型 | `'outline' \| 'ring'` | `'outline'` |
| loadingColor | 加载颜色 | `string` | `'#4D80F0'` |
| loadingSize | 加载大小 | `number` | `45` |
| zIndex | 层级 | `number` | `1000` |
| cover | 是否显示遮罩层 | `boolean` | `false` |
| opened | 完全展示后的回调 | `() => void` | - |
| closed | 完全关闭后的回调 | `() => void` | - |

参考: src/wd/components/wd-toast/wd-toast.vue:99-138

### 组件 Props

Toast 组件属性(用于模板声明):

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| selector | 选择器,用于多实例场景 | `string` | `''` |
| msg | 提示信息 | `string` | `''` |
| direction | 排列方向 | `'vertical' \| 'horizontal'` | `'horizontal'` |
| iconName | 图标名称 | `ToastIconType` | `''` |
| iconSize | 图标大小 | `number` | - |
| loadingType | 加载类型 | `'outline' \| 'ring'` | `'outline'` |
| loadingColor | 加载颜色 | `string` | `'#4D80F0'` |
| loadingSize | 加载大小 | `number` | `45` |
| iconClass | 自定义图标类名 | `string` | `''` |
| classPrefix | 图标类名前缀 | `string` | `'wd-icon'` |
| position | 位置 | `ToastPositionType` | `'middle-top'` |
| zIndex | 层级 | `number` | `1000` |
| cover | 是否显示遮罩层 | `boolean` | `false` |
| opened | 完全展示后的回调 | `() => void` | - |
| closed | 完全关闭后的回调 | `() => void` | - |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-toast/wd-toast.vue:169-206

### 类型定义

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
 * 排列方向类型
 */
type ToastDirection = 'vertical' | 'horizontal'

/**
 * 加载类型
 */
type ToastLoadingType = 'outline' | 'ring'

/**
 * Toast 配置选项接口
 */
export interface ToastOptions {
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
  /** 类名前缀，用于使用自定义图标 */
  classPrefix?: string
  /** 完全展示后的回调函数 */
  opened?: () => void
  /** 完全关闭时的回调函数 */
  closed?: () => void
}

/**
 * Toast 实例接口
 */
export interface Toast {
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
```

参考: src/wd/components/wd-toast/wd-toast.vue:76-164

## 最佳实践

### 1. 合理选择提示类型

根据业务场景选择合适的 Toast 类型:

```vue
<template>
  <view class="demo">
    <!-- ✅ 好的做法: 根据操作结果选择类型 -->
    <wd-button @click="handleSave">保存</wd-button>
    <wd-button @click="handleDelete" custom-style="margin-left: 16rpx;">删除</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleSave = async () => {
  toast.loading('保存中...')

  try {
    await saveData()
    toast.close()
    toast.success('保存成功!') // ✅ 成功用 success
  } catch (error) {
    toast.close()
    toast.error('保存失败') // ✅ 失败用 error
  }
}

const handleDelete = async () => {
  // ✅ 危险操作先警告
  toast.warning('确定要删除吗?')
}

const saveData = () => {
  return new Promise((resolve) => setTimeout(resolve, 1000))
}
</script>
```

**类型使用建议:**
- **success**: 操作成功、数据保存成功、提交成功
- **error**: 操作失败、验证失败、网络错误
- **warning**: 危险操作提示、数据即将过期
- **info**: 功能说明、提示文案、一般通知
- **loading**: 数据加载、文件上传、异步处理

参考: src/wd/components/wd-toast/useToast.ts:293-328

### 2. 设置合适的显示时长

根据提示内容长度设置合理的显示时长:

```vue
<template>
  <view class="demo">
    <wd-button @click="shortMsg">短消息</wd-button>
    <wd-button @click="longMsg" custom-style="margin-left: 16rpx;">长消息</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const shortMsg = () => {
  // ✅ 短消息 1.5-2 秒
  toast.success({
    msg: '操作成功',
    duration: 1500,
  })
}

const longMsg = () => {
  // ✅ 长消息 3-5 秒
  toast.info({
    msg: '您的账号将于 2024 年 12 月 31 日到期,请及时续费',
    duration: 4000,
  })
}
</script>
```

**时长建议:**
- 短消息(1-5 字): 1000-1500ms
- 中等消息(6-15 字): 2000-3000ms
- 长消息(15+ 字): 3000-5000ms
- 加载提示: 0 (不自动关闭)

参考: src/wd/components/wd-toast/useToast.ts:51-54

### 3. 加载提示要手动关闭

Loading 类型的 Toast 默认不自动关闭,必须手动调用 `close()`:

```vue
<template>
  <view class="demo">
    <!-- ✅ 好的做法: 加载完成后关闭 -->
    <wd-button @click="goodExample">正确方式</wd-button>

    <!-- ❌ 不好的做法: 忘记关闭 loading -->
    <wd-button @click="badExample" custom-style="margin-left: 16rpx;">错误方式</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const goodExample = async () => {
  toast.loading('加载中...')

  try {
    await fetchData()
    toast.close() // ✅ 记得关闭
    toast.success('加载成功')
  } catch (error) {
    toast.close() // ✅ 错误时也要关闭
    toast.error('加载失败')
  }
}

const badExample = async () => {
  toast.loading('加载中...')
  await fetchData()
  // ❌ 忘记关闭,loading 会一直显示
  toast.success('加载成功') // 这会叠加显示
}

const fetchData = () => {
  return new Promise((resolve) => setTimeout(resolve, 1000))
}
</script>
```

**Loading 使用要点:**
- 异步操作开始时显示 loading
- 无论成功还是失败,都要关闭 loading
- 使用 try-catch 确保异常时也能关闭
- 关闭后再显示结果提示

参考: src/wd/components/wd-toast/useToast.ts:293-299

### 4. 避免频繁提示

避免短时间内连续显示多个 Toast,影响用户体验:

```vue
<template>
  <view class="demo">
    <!-- ✅ 好的做法: 合并提示 -->
    <wd-button @click="goodExample">合并提示</wd-button>

    <!-- ❌ 不好的做法: 频繁提示 -->
    <wd-button @click="badExample" custom-style="margin-left: 16rpx;">频繁提示</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const goodExample = () => {
  // ✅ 合并多个操作结果为一条提示
  const results = [
    { name: '文件1', success: true },
    { name: '文件2', success: true },
    { name: '文件3', success: false },
  ]

  const failedCount = results.filter((r) => !r.success).length

  if (failedCount === 0) {
    toast.success('全部上传成功')
  } else {
    toast.warning(`成功 ${results.length - failedCount} 个,失败 ${failedCount} 个`)
  }
}

const badExample = () => {
  // ❌ 连续显示多个 Toast
  toast.success('文件1 上传成功')
  setTimeout(() => toast.success('文件2 上传成功'), 100)
  setTimeout(() => toast.error('文件3 上传失败'), 200)
}
</script>
```

**避免频繁提示建议:**
- 批量操作合并为一条结果提示
- 使用防抖限制提示频率
- 相同内容不要重复提示

参考: src/wd/components/wd-toast/useToast.ts:222-275

### 5. 多实例合理使用

只有在确实需要同时显示多个 Toast 时才使用多实例:

```vue
<template>
  <view class="demo">
    <!-- ✅ 好的做法: 不同模块使用不同实例 -->
    <wd-button @click="moduleA">模块 A 操作</wd-button>
    <wd-button @click="moduleB" custom-style="margin-left: 16rpx;">模块 B 操作</wd-button>

    <wd-toast selector="moduleA" />
    <wd-toast selector="moduleB" />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

// ✅ 不同功能模块使用独立实例
const toastA = useToast('moduleA')
const toastB = useToast('moduleB')

const moduleA = () => {
  toastA.success('模块 A 操作成功')
}

const moduleB = () => {
  toastB.success('模块 B 操作成功')
}
</script>
```

**多实例使用场景:**
- 不同功能模块需要独立的 Toast
- 需要同时显示不同类型的提示
- 长时间的 loading 和短时提示需要共存

**注意事项:**
- 大部分场景使用单实例即可
- 过多实例会导致屏幕拥挤
- 记得在模板中声明对应的 `<wd-toast>`

参考: src/wd/components/wd-toast/useToast.ts:142-157

## 常见问题

### 1. Toast 不显示或显示不正常

**问题原因:**
- 忘记在模板中声明 `<wd-toast>` 组件
- 多实例场景下 selector 不匹配
- z-index 层级被其他元素覆盖

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-button @click="showToast">显示提示</wd-button>

    <!-- ✅ 必须在模板中声明组件 -->
    <wd-toast />

    <!-- ✅ 多实例时 selector 要匹配 -->
    <wd-toast selector="custom" />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

// ✅ 默认实例
const toast = useToast()

// ✅ 自定义实例,selector 匹配
const customToast = useToast('custom')

const showToast = () => {
  toast.show('这是提示')
}
</script>

```

**检查清单:**
- 确认模板中有 `<wd-toast>` 组件
- 确认 selector 与 useToast 参数一致
- 检查是否有其他元素 z-index 超过 1000
- 使用开发工具检查 DOM 中是否有 Toast 元素

参考: src/wd/components/wd-toast/wd-toast.vue:10-53

### 2. Loading 提示无法关闭

**问题原因:**
- 忘记调用 `toast.close()`
- 多实例时关闭了错误的实例
- 异常情况下未关闭 loading

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-button @click="handleRequest">发送请求</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleRequest = async () => {
  // 显示 loading
  toast.loading('请求中...')

  try {
    await sendRequest()
    toast.close() // ✅ 成功时关闭
    toast.success('请求成功')
  } catch (error) {
    toast.close() // ✅ 失败时也要关闭
    toast.error('请求失败')
  }
}

const sendRequest = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟随机成功/失败
      Math.random() > 0.5 ? resolve(true) : reject(new Error('Failed'))
    }, 1000)
  })
}
</script>
```

**关闭 Loading 要点:**
- 在 finally 块中关闭更保险
- 确保所有分支都调用 close
- 多实例时确认关闭正确的实例

参考: src/wd/components/wd-toast/useToast.ts:188-217

### 3. 多个 Toast 重叠显示

**问题原因:**
- 快速连续显示多个 Toast
- 位置计算未生效
- 实例管理出现问题

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-button @click="showSequential">依次显示</wd-button>

    <!-- 声明多个 Toast 实例 -->
    <wd-toast v-for="index in 3" :key="index" :selector="`toast-${index}`" />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

// ✅ 创建多个独立实例
const toast1 = useToast('toast-1')
const toast2 = useToast('toast-2')
const toast3 = useToast('toast-3')

const showSequential = () => {
  // ✅ 使用不同实例避免冲突
  toast1.success({
    msg: '提示 1',
    duration: 0,
    position: 'middle-top',
  })

  setTimeout(() => {
    toast2.warning({
      msg: '提示 2',
      duration: 0,
      position: 'middle-top',
    })
  }, 100)

  setTimeout(() => {
    toast3.info({
      msg: '提示 3',
      duration: 0,
      position: 'middle-top',
    })
  }, 200)
}
</script>
```

**避免重叠建议:**
- 使用多个独立的 Toast 实例
- 确保 selector 不同
- 相同位置的 Toast 会自动计算偏移

参考: src/wd/components/wd-toast/useToast.ts:78-135

### 4. Toast 内容不更新

**问题原因:**
- 响应式失效
- 使用了缓存的配置对象
- 组件未正确监听配置变化

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-button @click="updateMessage">更新消息</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()
const count = ref(0)

const updateMessage = () => {
  count.value++

  // ✅ 每次调用 show 会更新内容
  toast.show({
    msg: `点击了 ${count.value} 次`,
    duration: 0,
  })
}
</script>
```

**内容更新要点:**
- 每次调用 show/success 等方法都会更新内容
- 动态内容要使用响应式变量
- 不要复用配置对象

参考: src/wd/components/wd-toast/useToast.ts:222-275

### 5. 回调函数不执行

**问题原因:**
- 回调函数拼写错误
- this 指向问题
- 回调中的异步操作未正确处理

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithCallback">显示带回调</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showWithCallback = () => {
  toast.show({
    msg: '提示消息',
    duration: 2000,
    // ✅ 使用箭头函数保持 this 指向
    opened: () => {
      console.log('Toast opened')
    },
    closed: () => {
      console.log('Toast closed')
      // ✅ 可以在这里执行后续操作
      performNextAction()
    },
  })
}

const performNextAction = () => {
  console.log('执行下一步操作')
}
</script>
```

**回调使用要点:**
- 使用箭头函数避免 this 问题
- 确认回调名称正确: opened / closed
- 回调在动画完成后执行,不是立即执行

参考: src/wd/components/wd-toast/wd-toast.vue:404-419

## 注意事项

1. **组件声明**: 使用 Toast 前必须在模板中声明 `<wd-toast>` 组件,多实例场景需要为每个实例声明对应的组件。参考: src/wd/components/wd-toast/wd-toast.vue:10-53

2. **Loading 关闭**: loading 类型的 Toast 默认 `duration: 0`,不会自动关闭,必须手动调用 `toast.close()` 关闭,否则会一直显示。参考: src/wd/components/wd-toast/useToast.ts:293-299

3. **selector 匹配**: 多实例场景下,`useToast(selector)` 的 selector 参数必须与 `<wd-toast selector="">` 的 selector 属性完全一致。参考: src/wd/components/wd-toast/useToast.ts:142-157

4. **遮罩层**: loading 类型默认开启遮罩层 `cover: true`,阻止用户操作,其他类型默认 `cover: false`,根据需求设置。参考: src/wd/components/wd-toast/wd-toast.vue:3-9

5. **位置偏移**: 多个相同位置的 Toast 会自动计算偏移量(每个 60rpx),避免重叠,不需要手动设置。参考: src/wd/components/wd-toast/useToast.ts:78-92

6. **SVG 图标**: 内置图标使用 SVG 实现并转换为 base64 格式,部分低版本小程序可能不支持,建议真机测试。参考: src/wd/components/wd-toast/wd-toast.vue:252-265

7. **显示时长**: `duration` 单位为毫秒,默认 2000ms,设置为 0 表示不自动关闭,需要根据提示内容长度合理设置时长。参考: src/wd/components/wd-toast/useToast.ts:51-54

8. **回调时机**: `opened` 和 `closed` 回调在动画完成后执行,不是 Toast 显示/隐藏时立即执行,有约 300ms 的动画延迟。参考: src/wd/components/wd-toast/wd-toast.vue:404-419

9. **层级管理**: Toast 基础 z-index 为 1000,多实例时层级自动递增,确保页面中没有元素 z-index 超过此值导致遮挡。参考: src/wd/components/wd-toast/useToast.ts:47-90

10. **实例缓存**: Toast 实例通过 selector 缓存,相同 selector 的 `useToast()` 返回同一实例,避免重复创建。参考: src/wd/components/wd-toast/useToast.ts:32-157

11. **字符串快捷方式**: 所有方法都支持传入字符串作为快捷方式,如 `toast.success('成功')` 等价于 `toast.success({ msg: '成功' })`。参考: src/wd/components/wd-toast/useToast.ts:276-290

12. **垂直排列**: `direction: 'vertical'` 时图标在上文本在下,适合图标较大或文本较短的场景,默认为 `'horizontal'` 水平排列。参考: src/wd/components/wd-toast/wd-toast.vue:440-465
