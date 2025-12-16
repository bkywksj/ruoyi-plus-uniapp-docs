# Notify 消息通知

## 介绍

Notify 是一个消息通知组件,用于在页面顶部或底部展示通知信息。该组件基于 Popup 弹出层实现,支持函数式调用,提供了 primary、success、danger、warning 四种类型,广泛应用于操作反馈、系统通知、消息提醒等场景。

**核心特性:**

- **四种通知类型** - 支持 primary(主要)、success(成功)、danger(危险)、warning(警告)四种类型
- **函数式调用** - 通过 `useNotify` 组合函数提供简洁的 API
- **自动关闭** - 支持设置展示时长,到时后自动消失
- **手动关闭** - 支持 duration 设为 0 保持显示,手动调用 close 关闭
- **位置可选** - 支持 top(顶部)和 bottom(底部)两个位置
- **安全区域** - 自动适配状态栏和导航栏高度,避免内容被遮挡
- **自定义样式** - 支持自定义文字颜色、背景颜色
- **多实例支持** - 通过 selector 参数支持页面内多个独立的通知实例
- **回调事件** - 支持点击回调、打开回调、关闭回调
- **插槽内容** - 支持通过默认插槽自定义通知内容

## 基本用法

### 基础用法

最基础的用法,显示一条危险类型的通知:

```vue
<template>
  <view class="demo">
    <wd-button @click="showNotify">显示通知</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showNotify = () => {
  notify.show('这是一条通知消息')
}
</script>

```

**使用说明:**

- 需要在模板中放置 `<wd-notify />` 组件
- 通过 `useNotify()` 获取通知实例
- 直接传入字符串即可显示通知,默认类型为 danger

### 通知类型

提供四种类型的通知,使用对应方法即可:

```vue
<template>
  <view class="demo">
    <wd-button @click="showPrimary">主要通知</wd-button>
    <wd-button @click="showSuccess">成功通知</wd-button>
    <wd-button @click="showDanger">危险通知</wd-button>
    <wd-button @click="showWarning">警告通知</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showPrimary = () => {
  notify.primary('主要通知信息')
}

const showSuccess = () => {
  notify.success('操作成功')
}

const showDanger = () => {
  notify.danger('操作失败,请重试')
}

const showWarning = () => {
  notify.warning('警告:余额不足')
}
</script>
```

**使用说明:**

- `primary` - 主要类型,蓝色背景,用于一般信息提示
- `success` - 成功类型,绿色背景,用于成功提示
- `danger` - 危险类型,红色背景,用于错误或危险提示
- `warning` - 警告类型,橙色背景,用于警告提示

### 自定义时长

通过 `duration` 属性设置通知显示时长:

```vue
<template>
  <view class="demo">
    <wd-button @click="showShort">短时通知 (1秒)</wd-button>
    <wd-button @click="showLong">长时通知 (10秒)</wd-button>
    <wd-button @click="showPermanent">常驻通知</wd-button>
    <wd-button @click="closeNotify">关闭通知</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showShort = () => {
  notify.success({
    message: '1秒后消失',
    duration: 1000
  })
}

const showLong = () => {
  notify.success({
    message: '10秒后消失',
    duration: 10000
  })
}

const showPermanent = () => {
  notify.warning({
    message: '点击关闭按钮手动关闭',
    duration: 0 // 设为 0 不自动关闭
  })
}

const closeNotify = () => {
  notify.close()
}
</script>
```

**使用说明:**

- `duration` 单位为毫秒,默认值为 3000 (3秒)
- 设为 0 时通知不会自动关闭,需要手动调用 `close()` 方法
- 调用 `close()` 可立即关闭当前通知

### 自定义颜色

通过 `color` 和 `background` 自定义通知样式:

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomColor">自定义颜色</wd-button>
    <wd-button @click="showGradient">渐变背景</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showCustomColor = () => {
  notify.show({
    message: '自定义颜色通知',
    color: '#fff',
    background: '#722ed1'
  })
}

const showGradient = () => {
  notify.show({
    message: '渐变背景通知',
    color: '#fff',
    background: 'linear-gradient(90deg, #ff6b6b, #feca57)'
  })
}
</script>
```

**使用说明:**

- `color` 设置文字颜色
- `background` 设置背景颜色,支持渐变色

### 弹出位置

通过 `position` 属性设置通知弹出位置:

```vue
<template>
  <view class="demo">
    <wd-button @click="showTop">顶部弹出</wd-button>
    <wd-button @click="showBottom">底部弹出</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showTop = () => {
  notify.success({
    message: '顶部通知',
    position: 'top'
  })
}

const showBottom = () => {
  notify.success({
    message: '底部通知',
    position: 'bottom'
  })
}
</script>
```

### 换行显示

消息内容支持 `\n` 换行符:

```vue
<template>
  <view class="demo">
    <wd-button @click="showMultiLine">多行通知</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showMultiLine = () => {
  notify.warning({
    message: '第一行内容\n第二行内容\n第三行内容',
    duration: 5000
  })
}
</script>
```

## 安全区域

### 自动适配

组件默认自动计算安全距离,会获取导航栏高度,确保通知不被遮挡:

```vue
<template>
  <view class="demo">
    <wd-navbar title="页面标题" />
    <wd-button @click="showNotify">显示通知</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showNotify = () => {
  // 自动适配导航栏高度
  notify.success('自动适配安全区域')
}
</script>
```

**使用说明:**

- 组件会自动获取页面中 `.wd-navbar` 的高度
- 如果没有导航栏,会使用状态栏高度 + 默认导航栏高度

### 手动设置安全距离

通过 `autoSafeTop` 和 `safeHeight` 手动控制安全距离:

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomSafe">自定义安全距离</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showCustomSafe = () => {
  notify.success({
    message: '自定义安全距离',
    autoSafeTop: false, // 关闭自动计算
    safeHeight: 200 // 手动设置距离 (rpx)
  })
}
</script>
```

### 额外偏移量

通过 `offsetTop` 设置额外的偏移量:

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithOffset">带偏移的通知</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showWithOffset = () => {
  notify.success({
    message: '向下偏移 50rpx',
    offsetTop: 50 // 额外偏移量 (rpx)
  })
}
</script>
```

## 回调事件

### 点击回调

通过 `onClick` 监听点击事件:

```vue
<template>
  <view class="demo">
    <wd-button @click="showClickable">可点击通知</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showClickable = () => {
  notify.warning({
    message: '点击查看详情',
    duration: 0,
    onClick: () => {
      uni.showToast({ title: '点击了通知', icon: 'none' })
      notify.close()
    }
  })
}
</script>
```

### 打开和关闭回调

通过 `onOpened` 和 `onClosed` 监听动画完成事件:

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithCallback">带回调的通知</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showWithCallback = () => {
  notify.success({
    message: '操作成功',
    duration: 2000,
    onOpened: () => {
      console.log('通知已显示')
    },
    onClosed: () => {
      console.log('通知已关闭')
      // 可以在这里执行后续逻辑
    }
  })
}
</script>
```

## 高级用法

### 自定义层级

通过 `zIndex` 设置通知层级:

```vue
<template>
  <view class="demo">
    <wd-button @click="showHighZIndex">高层级通知</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

const showHighZIndex = () => {
  notify.success({
    message: '高层级通知',
    zIndex: 9999
  })
}
</script>
```

### 多实例支持

通过 `selector` 参数支持页面内多个独立的通知实例:

```vue
<template>
  <view class="demo">
    <wd-button @click="showNotify1">通知实例1</wd-button>
    <wd-button @click="showNotify2">通知实例2</wd-button>

    <!-- 两个独立的通知实例 -->
    <wd-notify selector="notify1" />
    <wd-notify selector="notify2" />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

// 创建两个独立的通知实例
const notify1 = useNotify('notify1')
const notify2 = useNotify('notify2')

const showNotify1 = () => {
  notify1.primary('这是通知实例1')
}

const showNotify2 = () => {
  notify2.success('这是通知实例2')
}
</script>
```

**使用说明:**

- `selector` 参数用于区分不同的通知实例
- 组件和 useNotify 的 selector 必须一致
- 多实例可以同时显示

### 自定义内容

通过默认插槽自定义通知内容:

```vue
<template>
  <view class="demo">
    <wd-button @click="visible = true">自定义内容</wd-button>

    <wd-notify v-model:visible="visible" type="warning">
      <view class="custom-notify">
        <wd-icon name="warning" size="36rpx" />
        <text class="custom-text">自定义通知内容</text>
      </view>
    </wd-notify>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
</script>

```

### 组件式调用

除了函数式调用,也可以使用组件式调用:

```vue
<template>
  <view class="demo">
    <wd-button @click="visible = true">显示通知</wd-button>

    <wd-notify
      v-model:visible="visible"
      type="success"
      message="组件式调用通知"
      :duration="3000"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
</script>
```

### 结合业务场景

在实际业务中的使用示例:

```vue
<template>
  <view class="demo">
    <wd-button @click="submitForm">提交表单</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

// 模拟 API 请求
const submitApi = (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Math.random() > 0.5)
    }, 1000)
  })
}

const submitForm = async () => {
  try {
    const success = await submitApi()

    if (success) {
      notify.success({
        message: '提交成功',
        onClosed: () => {
          // 返回上一页
          uni.navigateBack()
        }
      })
    } else {
      notify.danger('提交失败,请重试')
    }
  } catch (error) {
    notify.danger('网络错误,请检查网络连接')
  }
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model:visible | 控制通知显示/隐藏 | `boolean` | `false` |
| type | 通知类型 | `'primary' \| 'success' \| 'danger' \| 'warning'` | `'danger'` |
| message | 通知消息内容 | `string` | `''` |
| duration | 显示时长(ms),设为 0 不自动关闭 | `number` | `3000` |
| position | 弹出位置 | `'top' \| 'bottom'` | `'top'` |
| color | 文字颜色 | `string` | - |
| background | 背景颜色 | `string` | - |
| z-index | 通知层级 | `number` | `1000` |
| auto-safe-top | 是否自动计算安全距离 | `boolean` | `true` |
| safe-height | 安全距离(rpx),autoSafeTop 为 false 时生效 | `number` | `0` |
| offset-top | 额外偏移量(rpx) | `number` | `0` |
| selector | 选择器,用于多实例 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| on-click | 点击回调函数 | `(event: MouseEvent) => void` | - |
| on-opened | 完全展示后的回调函数 | `() => void` | - |
| on-closed | 完全关闭时的回调函数 | `() => void` | - |

### useNotify 方法

通过 `useNotify(selector?: string)` 获取通知实例,返回以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| show | 显示通知 | `options: NotifyOptions \| string` | - |
| primary | 显示主要类型通知 | `options: NotifyOptions \| string` | - |
| success | 显示成功类型通知 | `options: NotifyOptions \| string` | - |
| danger | 显示危险类型通知 | `options: NotifyOptions \| string` | - |
| warning | 显示警告类型通知 | `options: NotifyOptions \| string` | - |
| close | 关闭通知 | - | - |

### NotifyOptions

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 通知类型 | `NotifyType` | `'danger'` |
| message | 通知消息内容 | `string` | `''` |
| duration | 显示时长(ms) | `number` | `3000` |
| position | 弹出位置 | `'top' \| 'bottom'` | `'top'` |
| color | 文字颜色 | `string` | - |
| background | 背景颜色 | `string` | - |
| zIndex | 通知层级 | `number` | `1000` |
| autoSafeTop | 是否自动计算安全距离 | `boolean` | `true` |
| safeHeight | 安全距离(rpx) | `number` | `0` |
| offsetTop | 额外偏移量(rpx) | `number` | `0` |
| onClick | 点击回调函数 | `(event: MouseEvent) => void` | - |
| onOpened | 完全展示后的回调函数 | `() => void` | - |
| onClosed | 完全关闭时的回调函数 | `() => void` | - |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义通知内容,会替换 message |

### 类型定义

```typescript
/**
 * 通知类型
 */
export type NotifyType = 'primary' | 'success' | 'danger' | 'warning'

/**
 * 位置类型
 */
type NotifyPosition = 'top' | 'bottom'

/**
 * Notify 配置选项接口
 */
export interface NotifyOptions {
  /** 类型,可选值为 primary success danger warning */
  type?: NotifyType
  /** 字体颜色 */
  color?: string
  /** 将组件的 z-index 层级设置为一个固定值 */
  zIndex?: number
  /** 展示文案,支持通过\n换行 */
  message?: string
  /** 展示时长(ms),值为 0 时,notify 不会消失 */
  duration?: number
  /** 弹出位置,可选值为 top bottom */
  position?: NotifyPosition
  /** 顶部安全高度(rpx),当 autoSafeTop 为 false 时生效 */
  safeHeight?: number
  /** 背景颜色 */
  background?: string
  /** 是否显示 */
  visible?: boolean
  /** 是否自动计算安全距离(默认 true) */
  autoSafeTop?: boolean
  /** 额外的偏移量(rpx) */
  offsetTop?: number
  /** 点击回调函数 */
  onClick?: (event: MouseEvent) => void
  /** 完全关闭时的回调函数 */
  onClosed?: () => void
  /** 完全展示后的回调函数 */
  onOpened?: () => void
}
```

## 主题定制

### CSS 变量

组件提供以下 CSS 变量,可用于自定义样式:

```scss
// 内边距
$-notify-padding: 14rpx 30rpx;
// 字体大小
$-notify-font-size: 28rpx;
// 行高
$-notify-line-height: 40rpx;
// 文字颜色
$-notify-text-color: #ffffff;

// 主要类型背景色
$-notify-primary-background: #1890ff;
// 成功类型背景色
$-notify-success-background: #52c41a;
// 危险类型背景色
$-notify-danger-background: #ff4d4f;
// 警告类型背景色
$-notify-warning-background: #fa8c16;
```

### 自定义主题

可以通过 SCSS 变量覆盖默认样式:

```scss
// 在项目的全局样式文件中
$-notify-primary-background: #722ed1; // 自定义主要类型背景色
$-notify-font-size: 30rpx; // 自定义字体大小

@import '@/wd/components/wd-notify/wd-notify.vue';
```

## 最佳实践

### 1. 选择合适的类型

根据场景选择合适的通知类型:

```vue
<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

// ✅ 成功操作用 success
const handleSuccess = () => {
  notify.success('保存成功')
}

// ✅ 失败或错误用 danger
const handleError = () => {
  notify.danger('保存失败,请重试')
}

// ✅ 警告提示用 warning
const handleWarning = () => {
  notify.warning('账户余额不足')
}

// ✅ 一般信息用 primary
const handleInfo = () => {
  notify.primary('您有一条新消息')
}
</script>
```

### 2. 合理设置显示时长

根据内容复杂度设置合适的显示时长:

```vue
<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

// ✅ 简短提示用较短时间
const showShortMessage = () => {
  notify.success({
    message: '成功',
    duration: 1500
  })
}

// ✅ 较长内容用较长时间
const showLongMessage = () => {
  notify.warning({
    message: '您的会员即将到期,请及时续费以免影响使用',
    duration: 5000
  })
}

// ✅ 需要用户处理的用常驻
const showActionRequired = () => {
  notify.danger({
    message: '网络连接失败,点击重试',
    duration: 0,
    onClick: () => {
      retryConnection()
      notify.close()
    }
  })
}
</script>
```

### 3. 利用回调处理后续逻辑

在通知关闭后执行后续操作:

```vue
<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

// ✅ 成功后跳转
const submitAndRedirect = async () => {
  await submitData()

  notify.success({
    message: '提交成功',
    onClosed: () => {
      uni.navigateBack()
    }
  })
}

// ✅ 失败后聚焦输入框
const validateAndFocus = () => {
  if (!isValid) {
    notify.danger({
      message: '请填写必填项',
      onClosed: () => {
        // 聚焦到第一个错误字段
        focusFirstError()
      }
    })
  }
}
</script>
```

### 4. 避免频繁弹出

不要在短时间内频繁弹出通知:

```vue
<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

// ❌ 避免在循环中频繁弹出
const badExample = () => {
  for (let i = 0; i < 10; i++) {
    notify.success(`操作 ${i} 成功`) // 会造成视觉混乱
  }
}

// ✅ 汇总后统一提示
const goodExample = () => {
  const results = processMultipleItems()
  const successCount = results.filter(r => r.success).length
  notify.success(`${successCount} 项操作成功`)
}
</script>
```

### 5. 搭配加载状态使用

在异步操作中搭配加载状态:

```vue
<template>
  <view class="demo">
    <wd-button :loading="loading" @click="handleSubmit">提交</wd-button>
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true

  try {
    await submitApi()
    notify.success('提交成功')
  } catch (error) {
    notify.danger('提交失败')
  } finally {
    loading.value = false
  }
}
</script>
```

## 常见问题

### 1. 通知无法显示

**问题原因:**
- 没有在模板中放置 `<wd-notify />` 组件
- useNotify 的 selector 与组件的 selector 不匹配

**解决方案:**

```vue
<template>
  <view>
    <!-- ✅ 必须在模板中放置组件 -->
    <wd-notify />

    <!-- 使用 selector 时要保持一致 -->
    <wd-notify selector="custom" />
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

// ✅ 默认实例
const notify = useNotify()

// ✅ 自定义 selector 要与组件一致
const customNotify = useNotify('custom')
</script>
```

### 2. 通知被导航栏遮挡

**问题原因:**
- 没有使用 WdNavbar 组件
- autoSafeTop 被设为 false 但没有设置 safeHeight

**解决方案:**

```vue
<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

// ✅ 使用 WdNavbar 会自动适配
// 或手动设置安全距离
const showNotify = () => {
  notify.success({
    message: '通知消息',
    autoSafeTop: false,
    safeHeight: 180 // 根据实际导航栏高度设置
  })
}
</script>
```

### 3. 通知无法手动关闭

**问题原因:**
- 没有保存 useNotify 实例的引用
- 使用了错误的 selector

**解决方案:**

```vue
<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

// ✅ 保存实例引用
const notify = useNotify()

const showNotify = () => {
  notify.warning({
    message: '常驻通知',
    duration: 0
  })
}

// ✅ 使用同一个实例关闭
const closeNotify = () => {
  notify.close()
}
</script>
```

### 4. 多个通知重叠显示

**问题原因:**
- 使用了多个 selector 创建多个实例
- 快速连续调用 show 方法

**解决方案:**

```vue
<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

// ✅ 新通知会自动关闭旧通知
const showNotify1 = () => {
  notify.success('通知1')
}

const showNotify2 = () => {
  // 会自动关闭通知1,显示通知2
  notify.success('通知2')
}

// ✅ 如果需要同时显示多个,使用多实例
const notify1 = useNotify('n1')
const notify2 = useNotify('n2')
</script>

<template>
  <view>
    <wd-notify selector="n1" />
    <wd-notify selector="n2" />
  </view>
</template>
```

### 5. 回调函数不执行

**问题原因:**
- 回调函数命名错误
- 函数式调用时使用了 Props 格式的回调名

**解决方案:**

```vue
<script lang="ts" setup>
import { useNotify } from '@/wd/components/wd-notify/useNotify'

const notify = useNotify()

// ✅ 函数式调用使用 camelCase
notify.success({
  message: '成功',
  onClick: () => console.log('点击'),
  onOpened: () => console.log('打开'),
  onClosed: () => console.log('关闭')
})
</script>

<template>
  <!-- ✅ 组件式调用使用 kebab-case -->
  <wd-notify
    :visible="visible"
    message="消息"
    @click="handleClick"
    @opened="handleOpened"
    @closed="handleClosed"
  />
</template>
```
