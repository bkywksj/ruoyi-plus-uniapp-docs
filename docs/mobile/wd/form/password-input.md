# PasswordInput 密码输入框

## 介绍

PasswordInput 密码输入框组件是一个专业的网格式密码输入控件,采用分格显示的方式,为用户提供清晰、安全的密码输入体验。组件广泛应用于支付密码、交易密码、短信验证码等需要高安全性和良好视觉反馈的输入场景。

组件采用 Vue 3 Composition API 和 TypeScript 构建,内置数字键盘支持,也可配合外部键盘使用。支持明文/密文切换、光标闪烁动画、错误提示等丰富功能。通过网格化的输入框设计,每个字符独立显示,让用户清晰地看到已输入的位数,有效避免输入错误。

**核心特性:**

- **网格式布局** - 采用独立网格显示每个字符,清晰直观,用户可以准确掌握输入进度
- **密文保护** - 支持通过 `mask` 属性显示圆点遮罩,保护密码隐私,防止旁人窥视
- **内置键盘** - 集成数字键盘组件,点击输入框自动弹出键盘,无需额外配置
- **外部键盘支持** - 通过 `useExternalKeyboard` 属性支持使用外部自定义键盘,灵活适配复杂场景
- **光标动画** - 聚焦状态下显示闪烁光标动画,明确指示当前输入位置
- **灵活长度** - 通过 `length` 属性自定义输入框数量,支持4位、6位等常见密码长度
- **间距定制** - 通过 `gutter` 属性自定义格子间距,适配不同 UI 设计
- **信息提示** - 支持 `info` 和 `errorInfo` 属性显示提示文字和错误信息
- **背景色定制** - 通过 `bgColor` 属性自定义格子背景色,匹配整体设计风格
- **键盘配置** - 提供丰富的键盘配置选项,包括标题、层级、蒙层、安全区域等

参考: src/wd/components/wd-password-input/wd-password-input.vue:1-66

## 基本用法

### 基础密码输入

最简单的用法,默认4位密码输入,显示圆点遮罩。

```vue
<template>
  <view class="demo">
    <wd-password-input v-model="password" />
    <view class="result">已输入: {{ password.length }}/4 位</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password = ref('')
</script>

```

**使用说明:**
- 组件默认长度为 4 位,适合支付密码等场景
- 点击输入框自动弹出内置数字键盘
- 默认不显示密文遮罩,直接显示输入的数字
- 输入完成后点击键盘"完成"按钮关闭键盘

参考: src/wd/components/wd-password-input/wd-password-input.vue:114-134

### 密文显示

使用 `mask` 属性开启密文显示,用圆点代替数字。

```vue
<template>
  <view class="demo">
    <wd-password-input v-model="password" mask />
    <view class="tip">输入的密码已加密显示</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password = ref('')
</script>

```

**使用说明:**
- `mask` 为 `true` 时,输入的数字显示为圆点
- 圆点样式可通过 CSS 变量定制
- 适用于支付密码、交易密码等高安全性场景

参考: src/wd/components/wd-password-input/wd-password-input.vue:79-80

### 自定义长度

使用 `length` 属性自定义密码位数。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">4位密码:</view>
      <wd-password-input v-model="password1" :length="4" mask />
    </view>

    <view class="demo-item">
      <view class="label">6位密码:</view>
      <wd-password-input v-model="password2" :length="6" mask />
    </view>

    <view class="demo-item">
      <view class="label">8位密码:</view>
      <wd-password-input v-model="password3" :length="8" mask />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password1 = ref('')
const password2 = ref('')
const password3 = ref('')
</script>

```

**使用说明:**
- `length` 默认为 4,可设置为任意正整数
- 常用长度: 4位(支付密码)、6位(交易密码、验证码)、8位(登录密码)
- 长度越长,单个格子宽度会自动调整以适应屏幕

参考: src/wd/components/wd-password-input/wd-password-input.vue:87-88

### 自定义间距

使用 `gutter` 属性自定义格子之间的间距。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">默认间距(24rpx):</view>
      <wd-password-input v-model="password1" mask />
    </view>

    <view class="demo-item">
      <view class="label">小间距(12rpx):</view>
      <wd-password-input v-model="password2" :gutter="12" mask />
    </view>

    <view class="demo-item">
      <view class="label">大间距(40rpx):</view>
      <wd-password-input v-model="password3" :gutter="40" mask />
    </view>

    <view class="demo-item">
      <view class="label">无间距(0):</view>
      <wd-password-input v-model="password4" :gutter="0" mask />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password1 = ref('')
const password2 = ref('')
const password3 = ref('')
const password4 = ref('')
</script>

```

**使用说明:**
- `gutter` 默认值为 24rpx,提供适中的间距
- 值可以是数字(单位 rpx)或字符串(如 `'24rpx'`, `'1em'`)
- 间距影响整体视觉效果,建议根据格子大小和屏幕宽度调整

参考: src/wd/components/wd-password-input/wd-password-input.vue:85-86

### 自定义背景色

使用 `bg-color` 属性自定义格子背景色。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">默认背景色:</view>
      <wd-password-input v-model="password1" mask />
    </view>

    <view class="demo-item">
      <view class="label">白色背景:</view>
      <wd-password-input v-model="password2" bg-color="#FFFFFF" mask />
    </view>

    <view class="demo-item">
      <view class="label">浅蓝背景:</view>
      <wd-password-input v-model="password3" bg-color="#E3F2FD" mask />
    </view>

    <view class="demo-item">
      <view class="label">浅绿背景:</view>
      <wd-password-input v-model="password4" bg-color="#E8F5E9" mask />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password1 = ref('')
const password2 = ref('')
const password3 = ref('')
const password4 = ref('')
</script>

```

**使用说明:**
- `bg-color` 默认为 `#F8F8F8`,浅灰色背景
- 支持任意 CSS 颜色值:十六进制、RGB、颜色名称等
- 背景色应与页面背景形成对比,确保格子清晰可见

参考: src/wd/components/wd-password-input/wd-password-input.vue:91-92

### 提示信息

使用 `info` 和 `error-info` 属性显示提示和错误信息。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">普通提示:</view>
      <wd-password-input
        v-model="password1"
        info="请输入6位支付密码"
        :length="6"
        mask
      />
    </view>

    <view class="demo-item">
      <view class="label">错误提示:</view>
      <wd-password-input
        v-model="password2"
        error-info="密码错误,请重新输入"
        :length="6"
        mask
      />
    </view>

    <view class="demo-item">
      <view class="label">动态提示:</view>
      <wd-password-input
        v-model="password3"
        :info="currentInfo"
        :error-info="currentError"
        :length="6"
        mask
        @blur="validatePassword"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const password1 = ref('')
const password2 = ref('123456')
const password3 = ref('')
const currentError = ref('')

const currentInfo = computed(() => {
  if (currentError.value) return ''
  if (password3.value.length === 0) {
    return '请输入6位支付密码'
  }
  if (password3.value.length < 6) {
    return `还需输入 ${6 - password3.value.length} 位`
  }
  return ''
})

const validatePassword = () => {
  if (password3.value.length === 6 && password3.value !== '888888') {
    currentError.value = '密码错误,请重新输入'
  } else {
    currentError.value = ''
  }
}
</script>

```

**使用说明:**
- `info` 显示灰色的普通提示信息
- `error-info` 显示红色的错误信息,优先级高于 `info`
- 两个属性同时存在时,只显示 `error-info`
- 可以配合验证逻辑动态显示不同提示

参考: src/wd/components/wd-password-input/wd-password-input.vue:82-84

### 键盘配置

自定义内置键盘的各项配置。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">自定义键盘标题:</view>
      <wd-password-input
        v-model="password1"
        keyboard-title="请输入支付密码"
        :length="6"
        mask
      />
    </view>

    <view class="demo-item">
      <view class="label">自定义按钮文字:</view>
      <wd-password-input
        v-model="password2"
        keyboard-close-text="确定"
        keyboard-delete-text="清除"
        :length="6"
        mask
      />
    </view>

    <view class="demo-item">
      <view class="label">显示蒙层:</view>
      <wd-password-input
        v-model="password3"
        :keyboard-modal="true"
        :length="6"
        mask
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password1 = ref('')
const password2 = ref('')
const password3 = ref('')
</script>

```

**使用说明:**
- `keyboard-title` 设置键盘顶部标题文字
- `keyboard-close-text` 自定义确认按钮文字,默认为"完成"
- `keyboard-delete-text` 自定义删除按钮文字,默认为"删除"
- `keyboard-modal` 控制是否显示蒙层,默认为 `false`
- 更多键盘配置见 API 文档

参考: src/wd/components/wd-password-input/wd-password-input.vue:96-111

## 高级用法

### 使用外部键盘

通过 `use-external-keyboard` 属性使用外部自定义键盘。

```vue
<template>
  <view class="demo">
    <wd-password-input
      v-model="password"
      use-external-keyboard
      :focused="isFocused"
      :length="6"
      mask
      info="请输入支付密码"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- 自定义键盘 -->
    <wd-number-keyboard
      v-model="password"
      v-model:visible="keyboardVisible"
      :maxlength="6"
      title="请输入支付密码"
      @close="handleKeyboardClose"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password = ref('')
const isFocused = ref(false)
const keyboardVisible = ref(false)

const handleFocus = () => {
  isFocused.value = true
  keyboardVisible.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

const handleKeyboardClose = () => {
  keyboardVisible.value = false
  isFocused.value = false
}
</script>

```

**技术实现:**
- 设置 `use-external-keyboard` 为 `true` 禁用内置键盘
- 通过 `focused` 属性控制输入框聚焦状态,显示光标
- 监听 `focus` 事件显示自定义键盘
- 监听 `blur` 事件隐藏键盘并更新聚焦状态
- 外部键盘的 `v-model` 需要绑定到同一个密码变量

参考: src/wd/components/wd-password-input/wd-password-input.vue:94-95

### 支付密码验证

实现完整的支付密码输入和验证流程。

```vue
<template>
  <view class="demo">
    <view class="payment-info">
      <text class="amount">¥ 199.00</text>
      <text class="desc">确认支付</text>
    </view>

    <wd-password-input
      v-model="password"
      :info="infoText"
      :error-info="errorText"
      :length="6"
      mask
      @blur="handlePasswordComplete"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

const password = ref('')
const errorText = ref('')
const isValidating = ref(false)

const infoText = computed(() => {
  if (errorText.value) return ''
  if (password.value.length === 0) {
    return '请输入6位支付密码'
  }
  if (password.value.length < 6) {
    return `还需输入 ${6 - password.value.length} 位`
  }
  return ''
})

// 监听密码输入,自动验证
watch(password, (newValue) => {
  // 清空之前的错误
  if (newValue.length < 6) {
    errorText.value = ''
  }

  // 输入完成自动验证
  if (newValue.length === 6 && !isValidating.value) {
    validatePassword()
  }
})

const validatePassword = async () => {
  if (isValidating.value) return

  isValidating.value = true
  errorText.value = ''

  // 模拟API验证
  uni.showLoading({ title: '验证中...', mask: true })

  try {
    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 模拟验证(正确密码为 888888)
    if (password.value === '888888') {
      uni.hideLoading()
      uni.showToast({ title: '支付成功', icon: 'success' })
      // 支付成功后的逻辑
      setTimeout(() => {
        password.value = ''
      }, 1500)
    } else {
      uni.hideLoading()
      errorText.value = '密码错误,请重新输入'
      // 自动清空密码
      setTimeout(() => {
        password.value = ''
        errorText.value = ''
      }, 1500)
    }
  } catch (error) {
    uni.hideLoading()
    errorText.value = '验证失败,请重试'
  } finally {
    isValidating.value = false
  }
}

const handlePasswordComplete = () => {
  if (password.value.length === 6 && !errorText.value) {
    // 键盘关闭时的处理
  }
}
</script>

```

**技术实现:**
- 使用 `watch` 监听密码输入,输入完6位自动触发验证
- 验证过程显示 loading,提升用户体验
- 验证失败后自动清空密码并显示错误提示
- 使用 `isValidating` 标志防止重复验证
- 实际项目中应调用后端接口进行验证

参考: src/wd/components/wd-password-input/wd-password-input.vue:164-178

### 验证码输入

使用 PasswordInput 实现验证码输入功能。

```vue
<template>
  <view class="demo">
    <view class="code-header">
      <text class="title">验证码已发送至</text>
      <text class="phone">188****8888</text>
    </view>

    <wd-password-input
      v-model="code"
      :length="6"
      :mask="false"
      info="请输入6位验证码"
      :error-info="errorText"
    />

    <view class="resend-wrapper">
      <text class="resend-text" @click="handleResend">
        {{ countdown > 0 ? `${countdown}秒后重新发送` : '重新发送验证码' }}
      </text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const code = ref('')
const errorText = ref('')
const countdown = ref(60)
let timer: ReturnType<typeof setInterval> | null = null

// 监听验证码输入
watch(code, (newValue) => {
  errorText.value = ''

  // 输入完成自动验证
  if (newValue.length === 6) {
    verifyCode()
  }
})

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  if (timer) clearInterval(timer)

  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer!)
      timer = null
    }
  }, 1000)
}

// 重新发送
const handleResend = () => {
  if (countdown.value > 0) return

  uni.showLoading({ title: '发送中...' })

  // 模拟发送验证码
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    startCountdown()
  }, 1000)
}

// 验证验证码
const verifyCode = async () => {
  uni.showLoading({ title: '验证中...', mask: true })

  try {
    // 模拟验证
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 正确验证码为 666666
    if (code.value === '666666') {
      uni.hideLoading()
      uni.showToast({ title: '验证成功', icon: 'success' })
      // 验证成功后的逻辑
    } else {
      uni.hideLoading()
      errorText.value = '验证码错误,请重新输入'
      setTimeout(() => {
        code.value = ''
        errorText.value = ''
      }, 1500)
    }
  } catch (error) {
    uni.hideLoading()
    errorText.value = '验证失败,请重试'
  }
}

// 组件加载时开始倒计时
startCountdown()
</script>

```

**使用说明:**
- 验证码场景通常不使用密文遮罩,设置 `mask` 为 `false`
- 验证码长度常见为 4 位或 6 位
- 提供倒计时和重新发送功能,优化用户体验
- 输入完成自动验证,无需手动提交

参考: src/wd/components/wd-password-input/wd-password-input.vue:79-80

### 设置支付密码

实现设置和确认支付密码的完整流程。

```vue
<template>
  <view class="demo">
    <view class="step-indicator">
      <view
        v-for="item in steps"
        :key="item.step"
        class="step-item"
        :class="{ active: currentStep >= item.step }"
      >
        <view class="step-number">{{ item.step }}</view>
        <text class="step-text">{{ item.text }}</text>
      </view>
    </view>

    <view v-if="currentStep === 1" class="step-content">
      <text class="step-title">设置支付密码</text>
      <wd-password-input
        v-model="password1"
        :length="6"
        mask
        info="请输入6位支付密码"
      />
    </view>

    <view v-if="currentStep === 2" class="step-content">
      <text class="step-title">确认支付密码</text>
      <wd-password-input
        v-model="password2"
        :length="6"
        mask
        info="请再次输入支付密码"
        :error-info="errorText"
      />
    </view>

    <view v-if="currentStep === 3" class="step-content success">
      <wd-icon name="success-fill" size="120rpx" color="#52c41a" />
      <text class="success-text">支付密码设置成功</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const currentStep = ref(1)
const password1 = ref('')
const password2 = ref('')
const errorText = ref('')

const steps = [
  { step: 1, text: '设置密码' },
  { step: 2, text: '确认密码' },
  { step: 3, text: '设置成功' }
]

// 监听第一次输入
watch(password1, (newValue) => {
  if (newValue.length === 6) {
    // 输入完成,进入第二步
    setTimeout(() => {
      currentStep.value = 2
    }, 300)
  }
})

// 监听第二次输入
watch(password2, (newValue) => {
  errorText.value = ''

  if (newValue.length === 6) {
    // 验证两次密码是否一致
    if (newValue === password1.value) {
      // 密码一致,提交设置
      submitPassword()
    } else {
      // 密码不一致
      errorText.value = '两次密码不一致,请重新输入'
      setTimeout(() => {
        password2.value = ''
        errorText.value = ''
      }, 1500)
    }
  }
})

const submitPassword = async () => {
  uni.showLoading({ title: '设置中...', mask: true })

  try {
    // 模拟提交到服务器
    await new Promise((resolve) => setTimeout(resolve, 1000))

    uni.hideLoading()
    currentStep.value = 3

    // 3秒后返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 3000)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '设置失败,请重试', icon: 'none' })
  }
}
</script>

```

**技术实现:**
- 使用 `currentStep` 控制显示不同步骤
- 第一次输入完成自动进入第二步
- 第二次输入完成自动验证并提交
- 两次密码不一致时清空第二次输入并提示
- 设置成功后自动返回上一页

参考: src/wd/components/wd-password-input/wd-password-input.vue:164-178

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定的值 | `string` | `''` |
| mask | 是否隐藏密码内容 | `boolean` | `false` |
| info | 输入框下方文字提示 | `string` | `''` |
| error-info | 输入框下方错误提示 | `string` | `''` |
| gutter | 输入框格子之间的间距 | `number \| string` | `24` |
| length | 密码最大长度 | `number` | `4` |
| focused | 是否已聚焦,聚焦时会显示光标 | `boolean` | `true` |
| bg-color | 输入框背景色 | `string` | `'#F8F8F8'` |
| use-external-keyboard | 是否使用外部键盘 | `boolean` | `false` |
| keyboard-title | 键盘标题 | `string` | `''` |
| keyboard-z-index | 键盘层级 | `number` | `100` |
| keyboard-close-text | 键盘确认按钮文本 | `string` | `'完成'` |
| keyboard-delete-text | 键盘删除按钮文本 | `string` | `'删除'` |
| keyboard-modal | 键盘是否显示蒙层 | `boolean` | `false` |
| keyboard-hide-on-click-outside | 键盘是否在点击外部时收起 | `boolean` | `true` |
| keyboard-lock-scroll | 键盘是否锁定滚动 | `boolean` | `true` |
| keyboard-safe-area-inset-bottom | 键盘是否在底部安全区域内 | `boolean` | `true` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-password-input/wd-password-input.vue:71-112

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | v-model 值变化时触发 | `value: string` |
| focus | 输入框获得焦点时触发 | `event: Event` |
| blur | 输入框失去焦点时触发 | - |

参考: src/wd/components/wd-password-input/wd-password-input.vue:136

### 类型定义

```typescript
/**
 * 密码输入框组件属性接口
 */
interface WdPasswordInputProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 绑定的值 */
  modelValue?: string
  /** 是否隐藏密码内容 */
  mask?: boolean
  /** 输入框下方文字提示 */
  info?: string
  /** 输入框下方错误提示 */
  errorInfo?: string
  /** 输入框格子之间的间距,如 20rpx 2em,默认单位为 rpx */
  gutter?: string | number
  /** 密码最大长度 */
  length?: number
  /** 是否已聚焦,聚焦时会显示光标 */
  focused?: boolean
  /** 输入框背景色 */
  bgColor?: string

  /** 是否使用外部键盘,为 true 时不显示内置键盘 */
  useExternalKeyboard?: boolean
  /** 键盘标题 */
  keyboardTitle?: string
  /** 键盘层级 */
  keyboardZIndex?: number
  /** 键盘确认按钮文本 */
  keyboardCloseText?: string
  /** 键盘删除按钮文本 */
  keyboardDeleteText?: string
  /** 键盘是否显示蒙层 */
  keyboardModal?: boolean
  /** 键盘是否在点击外部时收起 */
  keyboardHideOnClickOutside?: boolean
  /** 键盘是否锁定滚动 */
  keyboardLockScroll?: boolean
  /** 键盘是否在底部安全区域内 */
  keyboardSafeAreaInsetBottom?: boolean
}
```

参考: src/wd/components/wd-password-input/wd-password-input.vue:68-112

## 主题定制

PasswordInput 组件提供了丰富的 CSS 变量用于主题定制,支持浅色和深色两种主题模式。

### CSS 变量

```scss
// 密码输入框组件变量
$-password-input-margin: 32rpx;                  // 外边距
$-password-input-text-color: #262626;            // 文字颜色
$-password-input-font-size: 40rpx;               // 文字大小
$-password-input-radius: 8rpx;                   // 圆角大小
$-password-input-dot-size: 16rpx;                // 圆点大小
$-password-input-dot-color: #262626;             // 圆点颜色
$-password-input-cursor-width: 2rpx;             // 光标宽度
$-password-input-cursor-height: 40rpx;           // 光标高度
$-password-input-cursor-color: #4d80f0;          // 光标颜色
$-password-input-cursor-duration: 1s;            // 光标闪烁时长
$-password-input-info-font-size: 28rpx;          // 提示文字大小
$-password-input-info-color: #999999;            // 提示文字颜色
$-password-input-error-info-color: #fa4350;      // 错误提示颜色

// 深色主题变量
$-dark-background2: #2a2a2a;                     // 深色背景
$-dark-color: #ffffff;                            // 深色文字
$-dark-color2: #ff6b6b;                           // 深色错误色
```

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-password-input
      v-model="password"
      custom-class="custom-password-input"
      :length="6"
      mask
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password = ref('')
</script>

<style lang="scss">
.custom-password-input {
  // 自定义颜色
  --wot-password-input-text-color: #1890ff;
  --wot-password-input-dot-color: #1890ff;
  --wot-password-input-cursor-color: #1890ff;
  --wot-password-input-error-info-color: #ff4d4f;

  // 自定义尺寸
  --wot-password-input-font-size: 48rpx;
  --wot-password-input-dot-size: 20rpx;
  --wot-password-input-cursor-height: 48rpx;
  --wot-password-input-info-font-size: 32rpx;

  // 自定义圆角
  --wot-password-input-radius: 16rpx;
}
</style>
```

### 深色模式

组件自动支持深色模式,在 `wot-theme-dark` 类名下应用深色主题样式。

```vue
<template>
  <view :class="['page', { 'wot-theme-dark': isDark }]">
    <wd-password-input v-model="password" :length="6" mask />
    <wd-button @click="toggleTheme">切换主题</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password = ref('')
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>
```

参考: src/wd/components/wd-password-input/wd-password-input.vue:225-248

## 最佳实践

### 1. 根据场景选择密文模式

根据使用场景决定是否启用密文遮罩。

```vue
<!-- ✅ 推荐:支付密码使用密文 -->
<wd-password-input
  v-model="payPassword"
  :length="6"
  mask
  info="请输入支付密码"
/>

<!-- ✅ 推荐:验证码不使用密文 -->
<wd-password-input
  v-model="verifyCode"
  :length="6"
  :mask="false"
  info="请输入验证码"
/>

<!-- ❌ 不推荐:验证码使用密文 -->
<wd-password-input
  v-model="verifyCode"
  :length="6"
  mask
/>
```

**建议:**
- 支付密码、交易密码等敏感信息使用密文遮罩
- 验证码、邀请码等非敏感信息不使用密文,方便用户确认
- 用户可能需要核对的场景不建议使用密文

参考: src/wd/components/wd-password-input/wd-password-input.vue:79-80

### 2. 合理设置密码长度

根据安全需求和使用场景选择合适的长度。

```vue
<!-- ✅ 推荐:支付密码6位 -->
<wd-password-input
  v-model="payPassword"
  :length="6"
  mask
/>

<!-- ✅ 推荐:验证码6位 -->
<wd-password-input
  v-model="code"
  :length="6"
  :mask="false"
/>

<!-- ✅ 推荐:简单密码4位 -->
<wd-password-input
  v-model="pinCode"
  :length="4"
  mask
/>

<!-- ❌ 不推荐:长度过长 -->
<wd-password-input
  v-model="password"
  :length="12"
  mask
/>
```

**建议:**
- 常用长度: 4位(PIN码)、6位(支付密码/验证码)
- 长度过长会导致格子过小,影响体验
- 长度应与安全需求匹配,避免过度设计

参考: src/wd/components/wd-password-input/wd-password-input.vue:87-88

### 3. 提供清晰的提示信息

使用 `info` 和 `error-info` 提供明确的操作指引。

```vue
<script lang="ts" setup>
import { ref, computed } from 'vue'

const password = ref('')
const errorText = ref('')

// ✅ 推荐:动态提示
const infoText = computed(() => {
  if (errorText.value) return ''
  if (password.value.length === 0) {
    return '请输入6位支付密码'
  }
  if (password.value.length < 6) {
    return `还需输入 ${6 - password.value.length} 位`
  }
  return '密码输入完成'
})

// ❌ 不推荐:静态提示
const staticInfo = '请输入密码'
</script>

<template>
  <!-- ✅ 推荐:动态提示 -->
  <wd-password-input
    v-model="password"
    :info="infoText"
    :error-info="errorText"
    :length="6"
    mask
  />

  <!-- ❌ 不推荐:没有提示 -->
  <wd-password-input
    v-model="password"
    :length="6"
    mask
  />
</template>
```

**建议:**
- 提供输入进度提示,让用户知道还需输入几位
- 验证失败时显示明确的错误原因
- 避免使用过于模糊的提示文字

参考: src/wd/components/wd-password-input/wd-password-input.vue:82-84

### 4. 输入完成自动验证

监听密码输入,完成后自动验证,提升体验。

```vue
<script lang="ts" setup>
import { ref, watch } from 'vue'

const password = ref('')
const errorText = ref('')
const isValidating = ref(false)

// ✅ 推荐:自动验证
watch(password, (newValue) => {
  errorText.value = ''

  if (newValue.length === 6 && !isValidating.value) {
    validatePassword()
  }
})

const validatePassword = async () => {
  isValidating.value = true

  try {
    // 调用验证接口
    const result = await verifyAPI(password.value)

    if (result.success) {
      uni.showToast({ title: '验证成功', icon: 'success' })
    } else {
      errorText.value = result.message
      setTimeout(() => {
        password.value = ''
        errorText.value = ''
      }, 1500)
    }
  } finally {
    isValidating.value = false
  }
}

// ❌ 不推荐:手动提交
const handleSubmit = () => {
  if (password.value.length !== 6) {
    uni.showToast({ title: '请输入完整密码', icon: 'none' })
    return
  }
  // 验证逻辑
}
</script>
```

**建议:**
- 输入完成自动触发验证,无需点击按钮
- 使用 `isValidating` 标志防止重复验证
- 验证失败后自动清空密码,方便重新输入

参考: src/wd/components/wd-password-input/wd-password-input.vue:164-178

### 5. 错误处理和重试机制

合理处理验证失败的情况,提供重试机会。

```vue
<script lang="ts" setup>
import { ref } from 'vue'

const password = ref('')
const errorText = ref('')
const retryCount = ref(0)
const maxRetry = 3

const validatePassword = async () => {
  try {
    const result = await verifyAPI(password.value)

    if (!result.success) {
      retryCount.value++

      if (retryCount.value >= maxRetry) {
        // ✅ 推荐:达到最大重试次数后提示
        uni.showModal({
          title: '提示',
          content: '密码错误次数过多,请稍后再试',
          showCancel: false,
          success: () => {
            uni.navigateBack()
          }
        })
      } else {
        // ✅ 推荐:显示剩余次数
        errorText.value = `密码错误,还可尝试 ${maxRetry - retryCount.value} 次`
        setTimeout(() => {
          password.value = ''
          errorText.value = ''
        }, 1500)
      }
    } else {
      // 验证成功,重置计数
      retryCount.value = 0
    }
  } catch (error) {
    // ✅ 推荐:网络错误提示
    errorText.value = '网络错误,请稍后重试'
  }
}
</script>
```

**建议:**
- 限制错误重试次数,达到上限后锁定或返回
- 显示剩余尝试次数,让用户心中有数
- 区分密码错误和网络错误,提供不同提示
- 验证失败后清空密码,避免用户修改错误的密码

参考: src/wd/components/wd-password-input/wd-password-input.vue:164-178

## 常见问题

### 1. 键盘无法弹出

**问题描述:**
点击密码输入框,键盘没有弹出。

**问题原因:**
- 设置了 `use-external-keyboard` 为 `true`,禁用了内置键盘
- 页面存在遮罩层,阻止了点击事件
- 在某些平台上触摸事件被拦截

**解决方案:**

确认未设置 `use-external-keyboard`,且没有遮罩层遮挡。

```vue
<template>
  <!-- ✅ 正确:使用内置键盘 -->
  <wd-password-input v-model="password" :length="6" mask />

  <!-- ❌ 错误:禁用了内置键盘但没有外部键盘 -->
  <wd-password-input
    v-model="password"
    use-external-keyboard
    :length="6"
    mask
  />
</template>
```

参考: src/wd/components/wd-password-input/wd-password-input.vue:189-208

### 2. 光标不显示

**问题描述:**
输入框聚焦时,光标没有显示。

**问题原因:**
- 使用外部键盘时,`focused` 属性未正确设置
- 键盘未完全弹出,组件认为未聚焦
- 自定义样式隐藏了光标

**解决方案:**

使用外部键盘时,确保正确管理 `focused` 状态。

```vue
<template>
  <wd-password-input
    v-model="password"
    use-external-keyboard
    :focused="isFocused"
    :length="6"
    mask
    @focus="isFocused = true"
    @blur="isFocused = false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password = ref('')
const isFocused = ref(false)
</script>
```

参考: src/wd/components/wd-password-input/wd-password-input.vue:142-145

### 3. 格子显示不正常

**问题描述:**
格子大小不一致或显示错位。

**问题原因:**
- `gutter` 设置过大,导致格子被挤压
- 容器宽度不够,无法容纳所有格子
- `length` 过大,单个格子宽度过小

**解决方案:**

合理设置 `gutter` 和 `length`,确保格子有足够空间。

```vue
<template>
  <!-- ✅ 正确:6位密码,适中间距 -->
  <wd-password-input
    v-model="password1"
    :length="6"
    :gutter="24"
    mask
  />

  <!-- ✅ 正确:4位密码,较大间距 -->
  <wd-password-input
    v-model="password2"
    :length="4"
    :gutter="32"
    mask
  />

  <!-- ❌ 错误:过大的间距 -->
  <wd-password-input
    v-model="password3"
    :length="6"
    :gutter="100"
    mask
  />
</template>
```

参考: src/wd/components/wd-password-input/wd-password-input.vue:148-161

### 4. 提示信息不显示

**问题描述:**
设置了 `info` 或 `error-info` 但没有显示。

**问题原因:**
- `error-info` 和 `info` 同时设置,只显示 `error-info`
- 提示文字与背景色相同,看不见
- 容器高度不够,提示被截断

**解决方案:**

检查优先级和样式设置。

```vue
<template>
  <!-- ✅ 正确:只设置一个 -->
  <wd-password-input
    v-model="password1"
    info="请输入密码"
    :length="6"
    mask
  />

  <!-- ✅ 正确:动态切换 -->
  <wd-password-input
    v-model="password2"
    :info="errorText ? '' : '请输入密码'"
    :error-info="errorText"
    :length="6"
    mask
  />

  <!-- ❌ 错误:同时设置,info不会显示 -->
  <wd-password-input
    v-model="password3"
    info="请输入密码"
    error-info="密码错误"
    :length="6"
    mask
  />
</template>
```

**优先级:**
- `error-info` 优先级高于 `info`
- 两者同时存在时,只显示 `error-info`

参考: src/wd/components/wd-password-input/wd-password-input.vue:26-34

### 5. 外部键盘配合使用问题

**问题描述:**
使用外部键盘时,输入和聚焦状态不同步。

**问题原因:**
- `v-model` 绑定的值不一致
- `focused` 状态未正确管理
- 键盘的 `visible` 和输入框的 `focused` 不同步

**解决方案:**

确保所有状态正确绑定和同步。

```vue
<template>
  <wd-password-input
    v-model="password"
    use-external-keyboard
    :focused="isFocused"
    :length="6"
    mask
    @focus="handleFocus"
    @blur="handleBlur"
  />

  <wd-number-keyboard
    v-model="password"
    v-model:visible="keyboardVisible"
    :maxlength="6"
    @close="handleKeyboardClose"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password = ref('')
const isFocused = ref(false)
const keyboardVisible = ref(false)

// ✅ 正确:同步所有状态
const handleFocus = () => {
  isFocused.value = true
  keyboardVisible.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

const handleKeyboardClose = () => {
  keyboardVisible.value = false
  isFocused.value = false
}

// ❌ 错误:状态不同步
// const handleFocus = () => {
//   keyboardVisible.value = true
//   // 忘记设置 isFocused
// }
</script>
```

**关键点:**
- 密码输入框和键盘的 `v-model` 必须绑定同一个变量
- `focused` 和 `keyboardVisible` 需要保持同步
- 监听所有相关事件,确保状态一致

参考: src/wd/components/wd-password-input/wd-password-input.vue:189-218

## 注意事项

1. **默认聚焦**: 组件默认 `focused` 为 `true`,点击后自动弹出键盘,无需手动控制

2. **内置键盘**: 组件内置数字键盘,默认显示,如需使用外部键盘需设置 `use-external-keyboard` 为 `true`

3. **密码长度**: `length` 属性控制输入框数量,也限制了最大输入长度,输入达到长度后自动停止

4. **提示优先级**: `error-info` 优先级高于 `info`,两者同时存在时只显示 `error-info`

5. **格子间距**: `gutter` 可以是数字(单位 rpx)或字符串(如 `'24rpx'`, `'1em'`),需确保有足够空间

6. **背景色**: `bg-color` 应与页面背景形成对比,确保格子清晰可见

7. **光标显示**: 光标仅在聚焦状态且当前输入位置显示,输入完成后不显示光标

8. **键盘配置**: 键盘相关属性仅在使用内置键盘时生效,外部键盘需自行配置

9. **值的类型**: `v-model` 的值始终为字符串类型,即使输入的是数字

10. **事件触发**: `focus` 事件在点击输入框时触发,`blur` 事件在键盘关闭时触发

11. **响应式**: 确保 `v-model` 绑定的是响应式变量(使用 `ref` 或 `reactive` 创建)

12. **格子样式**: 格子为正方形设计,宽度自动计算,长度过长时单个格子会变小

参考: src/wd/components/wd-password-input/wd-password-input.vue:114-134
