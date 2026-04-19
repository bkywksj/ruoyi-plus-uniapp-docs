---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/slideVerify
---

# SlideVerify 滑动验证

## 介绍

SlideVerify 滑动验证组件要求用户手动将滑块拖动到轨道末端，以完成简单的"我不是机器人"验证。相比传统的字符验证码，它的交互摩擦更低、在移动端更友好，常被用作登录、注册、发送短信验证码前的前置防刷手段。组件完全基于 `touchstart`/`touchmove`/`touchend` 手势实现，兼容 H5、微信小程序、支付宝小程序与 App，不依赖任何服务端图片切片。

**核心特性:**

- **纯手势实现** - 基于原生触摸事件，无需远程接口与图片资源，开箱即用
- **自定义轨道与滑块** - 支持自定义宽度、高度、轨道背景色、滑过激活色、滑块图标
- **验证完成反馈** - 验证成功后自动替换图标与文本，无需业务方再维护一套状态
- **回弹动画** - 拖动过程中松手且未完成时，滑块自动回弹到起点，并提供 300ms 过渡
- **精细事件流** - 提供 `change`（拖动过程）、`success`（完成）、`fail`（失败）三类事件
- **容错容差** - 通过 `tolerance` 允许离终点一定像素范围内也判定为成功，解决触屏抖动造成的边界问题
- **公开 `reset` 方法** - 通过 `ref` 调用重置方法，便于在"短信发送失败"等业务场景重新验证
- **可被插槽扩展** - 提示文字、成功文案、滑块图标、成功图标全部开放插槽自定义

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:1-297

## 基本用法

### 最小化示例

默认样式下只需监听 `success` 事件即可获得验证通过的回调。

```vue
<template>
  <view class="demo">
    <wd-slide-verify @success="handleSuccess" />
    <view v-if="verified" class="demo-tip">已通过验证，可以继续操作</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const verified = ref(false)

function handleSuccess() {
  verified.value = true
  uni.showToast({ title: '验证通过', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.demo-tip {
  margin-top: 24rpx;
  color: #52c41a;
}
</style>
```

**使用说明:**

- 默认轨道宽度 `600rpx`、高度 `80rpx`，提示文字为"请滑动验证"
- 滑块到达轨道末端（容差范围内）时触发 `success`
- 滑动未完成并松手时触发 `fail`，滑块自动回弹到起点

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:102-136, 249-266

### 自定义尺寸

通过 `width` 和 `height` 自定义轨道尺寸，`width` 支持百分比（如 `'100%'`）。

```vue
<template>
  <view class="demo">
    <wd-slide-verify width="100%" :height="100" />
    <wd-slide-verify :width="500" :height="60" text="短滑块验证" />
    <wd-slide-verify :width="700" :height="120" text="大号滑块" />
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
</style>
```

**使用说明:**

- `width` 数字时单位为 rpx，也支持字符串（`'100%'` / `'400px'` 等 CSS 合法值）
- 推荐高度 ≥ `60rpx`，否则手指触控点容易偏离滑块
- 滑块按钮的宽度会自动等于轨道高度（保持正方形）

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:70-76, 182-200

### 自定义颜色

```vue
<template>
  <view class="demo">
    <wd-slide-verify
      background-color="#f0f2f5"
      active-background-color="#1890ff"
    />
    <wd-slide-verify
      background-color="#fff2e8"
      active-background-color="#fa541c"
      text="向右滑动完成验证"
    />
    <wd-slide-verify
      background-color="#1e1e1e"
      active-background-color="#722ed1"
      text="暗色主题"
    />
  </view>
</template>
```

**使用说明:**

- `backgroundColor` 控制未滑过区域的底色
- `activeBackgroundColor` 控制已滑过区域的填充颜色，同时被应用到成功图标的圆形底
- 两个颜色值支持任何 CSS 合法颜色，包括 `rgba`、渐变字符串

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:83-87, 183-188, 202-208

### 自定义图标

```vue
<template>
  <view class="demo">
    <!-- 使用不同的滑块图标 -->
    <wd-slide-verify
      icon="double-arrow-right"
      :icon-size="48"
    />

    <!-- 成功后使用自定义图标 -->
    <wd-slide-verify
      success-icon="success"
      :success-icon-size="32"
      active-background-color="#13c2c2"
    />

    <!-- 同时替换两个图标 -->
    <wd-slide-verify
      icon="arrow-right"
      success-icon="thumb-up"
      active-background-color="#eb2f96"
    />
  </view>
</template>
```

**使用说明:**

- `icon` 使用 WD UI 图标体系中的任意名称
- 图标大小支持数字（rpx）或带单位字符串
- 若默认图标不够用，可通过 `icon` / `success-icon` 插槽完全自定义

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:29-38, 88-94, 130-133

## 进阶用法

### 通过 ref 重置验证

在某些业务场景（如短信发送失败、表单重置）中，需要让用户重新验证。

```vue
<template>
  <view class="demo">
    <wd-slide-verify ref="slideRef" @success="onSuccess" />
    <wd-button type="primary" :disabled="!verified" @click="sendSms">
      发送短信验证码
    </wd-button>
    <wd-button plain @click="handleReset">重置验证</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SlideVerifyInstance } from '@/wd/components/wd-slide-verify/wd-slide-verify.vue'

const slideRef = ref<SlideVerifyInstance>()
const verified = ref(false)

function onSuccess() {
  verified.value = true
}

function handleReset() {
  slideRef.value?.reset()
  verified.value = false
}

async function sendSms() {
  try {
    await requestSendSms()
    uni.showToast({ title: '已发送' })
  }
  catch {
    uni.showToast({ title: '发送失败，请重试', icon: 'none' })
    handleReset()  // 失败时重置验证，强制用户重新滑动
  }
}

declare function requestSendSms(): Promise<void>
</script>
```

**使用说明:**

- `reset()` 会清除内部的 `isPass`、`isDragging`、`currentPosition` 状态，并播放回弹动画
- 调用 `reset()` 后不会自动再次触发 `fail` 事件
- 组件卸载前会自动清理内部定时器，不必手动处理

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:111-119, 268-293

### 监听滑动进度

`change` 事件在拖动过程中频繁触发，可用于实时展示进度条或统计滑动轨迹。

```vue
<template>
  <view class="demo">
    <wd-slide-verify
      @change="onChange"
      @success="onSuccess"
      @fail="onFail"
    />
    <view class="demo-meta">
      <text>当前偏移: {{ currentPercent }}%</text>
      <text>最近一次: {{ lastResult }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const currentPercent = ref(0)
const lastResult = ref('-')

function onChange({ offsetX, percent }: { offsetX: number, percent: number }) {
  currentPercent.value = percent
  // offsetX 为拖动的实际像素值，可用于做更精细的动画
}

function onSuccess() {
  lastResult.value = 'success'
}

function onFail() {
  lastResult.value = 'fail'
}
</script>
```

**使用说明:**

- `change.percent` 是 `0` 到 `100` 的整数，已在组件内四舍五入
- `change.offsetX` 为像素值，可能受不同平台的 DPR 影响
- `change` 不会在 `fail`/`success` 之后继续触发

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:56-65, 239-247

### 禁用状态

业务请求未就绪时（如用户未勾选协议），可以禁用组件。

```vue
<template>
  <view class="demo">
    <wd-checkbox v-model="agreed">我已阅读并同意服务协议</wd-checkbox>
    <wd-slide-verify :disabled="!agreed" text="请先勾选协议" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const agreed = ref(false)
</script>
```

**使用说明:**

- `disabled` 时不响应任何触摸事件，`pointer-events: none`
- 组件内部会给根节点加 `is-disabled` 类，透明度变为禁用默认值（由 CSS 变量控制）
- 验证成功后 `isPass` 为 true，也会进入"不可操作"的计算态

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:166-181, 400-404

### 自定义文字与插槽

所有文字和图标区域都开放了插槽，可完全自定义。

```vue
<template>
  <view class="demo">
    <wd-slide-verify text="拖动完成验证" success-text="已验证">
      <template #icon>
        <view class="custom-icon">
          <wd-icon name="arrow-right" size="44" color="#1890ff" />
        </view>
      </template>

      <template #success-icon>
        <view class="custom-success-icon">
          <wd-icon name="check-bold" size="32" color="#fff" />
        </view>
      </template>

      <template #text>
        <view class="custom-text">
          <wd-icon name="arrow-right" size="24" color="#8c8c8c" />
          <text>请按住拖动到最右侧</text>
        </view>
      </template>

      <template #success-text>
        <text class="custom-success-text">✓ 验证通过</text>
      </template>
    </wd-slide-verify>
  </view>
</template>

<style lang="scss" scoped>
.custom-icon,
.custom-success-icon {
  width: 80%;
  height: 80%;
  border-radius: 12rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
}
.custom-text {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #8c8c8c;
}
.custom-success-text {
  color: #fff;
  font-weight: 500;
  font-size: 28rpx;
}
</style>
```

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:5-38

### 集成到登录流程

```vue
<template>
  <view class="login">
    <wd-input v-model="mobile" placeholder="请输入手机号" prefix-icon="phone" />

    <wd-slide-verify
      ref="slideRef"
      @success="handleVerified"
      @fail="slideRef?.reset"
    />

    <wd-button
      type="primary"
      block
      :loading="sending"
      :disabled="!verified || !mobile"
      @click="sendCode"
    >
      {{ sending ? '发送中...' : '获取验证码' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SlideVerifyInstance } from '@/wd/components/wd-slide-verify/wd-slide-verify.vue'

const mobile = ref('')
const sending = ref(false)
const verified = ref(false)
const slideRef = ref<SlideVerifyInstance>()

function handleVerified() {
  verified.value = true
}

async function sendCode() {
  if (!verified.value) {
    uni.showToast({ title: '请先完成滑动验证', icon: 'none' })
    return
  }
  sending.value = true
  try {
    await requestSmsCode(mobile.value)
    uni.showToast({ title: '已发送' })
  }
  catch {
    uni.showToast({ title: '发送失败，请重试', icon: 'none' })
    slideRef.value?.reset()
    verified.value = false
  }
  finally {
    sending.value = false
  }
}

declare function requestSmsCode(mobile: string): Promise<void>
</script>
```

### 与表单验证结合

```vue
<template>
  <wd-form :model="formData" :rules="rules">
    <wd-form-item label="滑动验证" prop="verified">
      <wd-slide-verify @success="onVerified" @fail="onVerifiedFail" />
    </wd-form-item>

    <wd-button type="primary" @click="submit">提交</wd-button>
  </wd-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const formData = reactive({
  verified: false,
})

const rules = {
  verified: [
    { required: true, message: '请完成滑动验证' },
    {
      validator: (_rule: any, value: boolean) =>
        value ? Promise.resolve() : Promise.reject('请完成滑动验证'),
    },
  ],
}

function onVerified() {
  formData.verified = true
}

function onVerifiedFail() {
  formData.verified = false
}

function submit() {
  if (!formData.verified) {
    uni.showToast({ title: '请先完成滑动验证', icon: 'none' })
    return
  }
  // 提交表单...
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| width | 轨道宽度，数字时单位为 rpx，也支持百分比字符串 | `number \| string` | `600` |
| height | 轨道高度，数字时单位为 rpx | `number \| string` | `80` |
| tolerance | 验证成功的容差像素（滑块距终点在该范围内也判定为成功） | `number` | `10` |
| text | 未验证时的提示文案 | `string` | `'请滑动验证'` |
| success-text | 验证成功后的提示文案 | `string` | `'验证成功'` |
| disabled | 是否禁用 | `boolean` | `false` |
| background-color | 轨道背景色 | `string` | `'#F5F7FA'` |
| active-background-color | 滑过区域（已验证部分）的激活颜色，同时应用到成功图标底圆 | `string` | `'#49C75F'` |
| icon | 未验证时的滑块图标名 | `string` | `'arrow-right'` |
| success-icon | 验证成功后滑块的图标名 | `string` | `'check'` |
| icon-size | 滑块图标大小 | `number \| string` | `40` |
| success-icon-size | 成功图标大小 | `number \| string` | `24` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:67-99, 121-136

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|---------|
| success | 验证成功时触发 | - |
| fail | 拖动未到达终点即松手时触发 | - |
| change | 拖动过程中触发（高频事件） | `{ offsetX: number; percent: number }` |

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:101-111, 239-266

### Slots

| 插槽名 | 说明 |
|--------|------|
| text | 未验证时的背景提示区域（替换默认的 text 文本） |
| success-text | 验证成功时的文本区域（替换默认的 successText 文本） |
| icon | 未验证时滑块内部的图标区域 |
| success-icon | 验证成功时滑块内部的图标区域 |

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:5-38

### Methods

通过 `ref` 获取实例后可调用：

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| reset | 重置验证状态（清除 `isPass`、`currentPosition`，播放回弹动画） | - | `void` |

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:113-119, 268-293

### 类型定义

```typescript
/** 滑动验证变化事件参数 */
interface SlideVerifyChangeEvent {
  /** 当前滑块偏移量（像素） */
  offsetX: number
  /** 当前进度百分比（0-100 整数） */
  percent: number
}

/** 滑动验证组件属性接口 */
interface WdSlideVerifyProps {
  width?: number | string
  height?: number | string
  tolerance?: number
  text?: string
  successText?: string
  disabled?: boolean
  backgroundColor?: string
  activeBackgroundColor?: string
  icon?: string
  successIcon?: string
  iconSize?: number | string
  successIconSize?: number | string
  customStyle?: string
  customClass?: string
}

/** 滑动验证组件事件接口 */
interface WdSlideVerifyEmits {
  success: []
  fail: []
  change: [event: SlideVerifyChangeEvent]
}

/** 组件暴露方法 */
interface WdSlideVerifyExpose {
  reset: () => void
}

/** 组件实例类型 */
export type SlideVerifyInstance = ComponentPublicInstance<WdSlideVerifyProps, WdSlideVerifyExpose>
```

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:56-119, 294-296

## 主题定制

### CSS 变量

```scss
// 基础文案
--wot-slide-verify-text-color: #999;         // 未验证时的提示文字色
--wot-slide-verify-text-size: 28rpx;         // 文字大小
--wot-slide-verify-success-text-color: #fff; // 验证成功的文案色

// 滑块按钮
--wot-slide-verify-button-bg: #fff;          // 滑块底色
--wot-slide-verify-button-color: #4D80F0;    // 滑块图标色
--wot-slide-verify-button-shadow: rgba(0,0,0,0.12); // 滑块阴影

// 禁用态
--wot-slide-verify-disabled-opacity: 0.5;    // 禁用时的透明度
```

### 全局主题

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <wd-slide-verify />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const themeVars = {
  slideVerifyButtonBg: '#1890ff',
  slideVerifyButtonColor: '#fff',
  slideVerifyButtonShadow: 'rgba(24, 144, 255, 0.24)',
}
</script>
```

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:299-411

## 最佳实践

### 1. 验证成功后禁用按钮直到 reset

```vue
<!-- ✅ 推荐 -->
<wd-slide-verify @success="verified = true" />
<wd-button :disabled="!verified" @click="submit">提交</wd-button>

<!-- ❌ 不推荐：用户可能绕过验证直接点按钮 -->
<wd-slide-verify />
<wd-button @click="submit">提交</wd-button>
```

### 2. 失败后立即重置

验证失败时不主动 reset，用户还需要手动再滑一次，容易引起困惑：

```vue
<wd-slide-verify
  ref="slideRef"
  @fail="slideRef?.reset"
/>
```

### 3. 短信发送失败时重置验证

避免用户重复发送：

```typescript
try {
  await requestSendSms()
}
catch {
  slideRef.value?.reset()
  verified.value = false
}
```

### 4. 与计时器配合实现"滑动验证 → 等待 X 秒 → 允许提交"

增加额外防刷层次：

```vue
<script lang="ts" setup>
import { ref } from 'vue'

const verified = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function onVerified() {
  verified.value = true
  countdown.value = 3  // 验证通过后还要等 3 秒
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}
</script>
```

### 5. 不要把滑动验证作为唯一防护

滑动验证只能防止最简单的脚本刷接口，**必须配合**：

- 服务端限流（如同一 IP 每分钟 N 次）
- 手机号/设备号频控
- 风控规则（短时间异常行为判定）

### 6. 在表单中使用显式的 `prop`

为便于表单校验触发，建议包一层 `wd-form-item`：

```vue
<wd-form-item label="验证" prop="verified">
  <wd-slide-verify @success="formData.verified = true" />
</wd-form-item>
```

## 常见问题

### 1. 滑到最右端但没有触发 `success`

**问题原因:**

- `tolerance` 设置过小，轻微抖动导致差距仍然大于容差
- 页面初始化时 `measureSize()` 还未获取到实际宽度
- 轨道被外部容器压缩导致实际渲染宽度小于期望

**解决方案:**

```vue
<!-- 增大容差 -->
<wd-slide-verify :tolerance="20" />

<!-- 确保父容器有明确的宽度 -->
<view style="width: 600rpx;">
  <wd-slide-verify width="100%" />
</view>
```

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:217-223, 249-266

### 2. 禁用状态下样式没变灰

**问题原因:**

- 自定义 `background-color` 覆盖了禁用态的样式
- CSS 变量 `--wot-slide-verify-disabled-opacity` 被其他样式覆盖

**解决方案:**

```vue
<wd-slide-verify
  :disabled="true"
  custom-style="opacity: 0.4;"
/>
```

### 3. 多个组件同时存在时，状态互相影响

**问题原因:**

- 组件内部使用 `uuid()` 生成唯一 rootId，理论上不会相互影响
- 若出现异常，通常是复制粘贴时 ref 引用了同一个变量

**解决方案:**

```vue
<!-- ✅ 每个实例使用独立 ref -->
<wd-slide-verify ref="slideRef1" />
<wd-slide-verify ref="slideRef2" />

<script lang="ts" setup>
const slideRef1 = ref<SlideVerifyInstance>()
const slideRef2 = ref<SlideVerifyInstance>()
</script>
```

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:140-141

### 4. 在 iOS Safari 中滑动页面也跟着滚

**问题原因:**

- `touchmove` 的默认滚动行为未阻止
- 组件本身用了 `@touchmove.prevent`，但外层容器可能捕获了事件

**解决方案:**

```vue
<!-- 包一层容器手动阻止默认滚动 -->
<view
  class="slide-verify-wrapper"
  @touchmove.prevent
>
  <wd-slide-verify />
</view>
```

### 5. 滑块宽度变成矩形而不是正方形

**问题原因:**

- 组件内部会把滑块宽度设置为 `height`（保证正方形）
- 若 `height` 传入了非法值（如 `'100%'`），`addUnit` 无法转换为有效 CSS

**解决方案:**

```vue
<!-- 使用具体数值而非百分比作为高度 -->
<wd-slide-verify :height="80" />
```

参考: src/wd/components/wd-slide-verify/wd-slide-verify.vue:192-200
