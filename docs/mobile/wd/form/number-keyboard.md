---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/numberKeyboard
---

# NumberKeyboard 数字键盘

## 介绍

NumberKeyboard 数字键盘是专门用于数字输入的虚拟键盘组件,适用于支付密码、验证码、金额输入、身份证号等场景。相比功能更全面的 Keyboard 组件,NumberKeyboard 更专注于纯数字输入场景,提供更简洁的 API 和更优化的交互体验。

**核心特性:**

- **双模式支持** - 提供 default(默认)和 custom(自定义)两种键盘模式,满足不同场景需求
- **随机键盘** - 支持随机排列数字按键顺序,增强密码输入安全性,防止键盘记录攻击
- **额外按键** - 支持配置小数点、X(身份证)、00等额外功能按键,灵活适配业务场景
- **触摸反馈** - 基于 useTouch 组合式函数实现流畅的按键触摸反馈效果
- **安全区适配** - 自动适配 iPhone X 等设备的底部安全区域
- **主题定制** - 提供丰富的 CSS 变量支持深色模式和品牌定制
- **弹出层集成** - 基于 wd-popup 组件实现,支持蒙层、锁定滚动等特性

**技术实现:**

组件基于 `wd-popup` 弹出层实现底部滑入效果,内部按键使用独立的 `WdKey` 子组件渲染。按键布局采用 Flexbox 弹性布局,default 模式为 4×3 网格,custom 模式在右侧增加一列侧边栏放置删除键和完成键。随机键盘功能使用 Fisher-Yates 洗牌算法确保均匀随机分布。

## 平台兼容性

| 平台 | 支持情况 | 说明 |
|------|----------|------|
| 微信小程序 | 是 完全支持 | 推荐使用 |
| 支付宝小程序 | 是 完全支持 | - |
| H5 | 是 完全支持 | - |
| App (iOS) | 是 完全支持 | - |
| App (Android) | 是 完全支持 | - |
| 抖音小程序 | 是 完全支持 | - |
| QQ小程序 | 是 完全支持 | - |

## 基本用法

### 默认键盘

最基础的数字键盘用法,通过 `v-model` 双向绑定输入值,`visible` 控制显示隐藏。

```vue
<template>
  <view class="demo">
    <wd-cell title="数字键盘" :value="value || '请输入'" @click="show = true" />
    <wd-number-keyboard
      v-model="value"
      :visible="show"
      @close="show = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
</script>
```

**使用说明:**

- `v-model` 绑定的值为字符串类型,每次按键会追加对应字符
- 点击键盘外部区域或删除键右侧的空白键会触发 `close` 事件
- 默认模式下,键盘底部左侧为额外按键位(默认空白),右侧为删除键

### 带标题键盘

通过 `title` 属性设置键盘顶部标题,用于提示用户当前输入的内容类型。

```vue
<template>
  <view class="demo">
    <wd-cell title="支付密码" :value="password ? '******' : '请输入'" @click="show = true" />
    <wd-number-keyboard
      v-model="password"
      :visible="show"
      title="请输入支付密码"
      :maxlength="6"
      @close="show = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password = ref('')
const show = ref(false)
</script>
```

**使用说明:**

- 设置 `title` 后,键盘顶部会显示标题栏
- 标题栏右侧会自动显示"完成"按钮(default 模式)
- 可通过 `title` 插槽自定义标题区域内容

### 自定义标题插槽

使用 `title` 插槽可以完全自定义标题区域的内容和样式。

```vue
<template>
  <view class="demo">
    <wd-cell title="自定义标题" :value="value || '请输入'" @click="show = true" />
    <wd-number-keyboard
      v-model="value"
      :visible="show"
      @close="show = false"
    >
      <template #title>
        <view class="custom-title">
          <wd-icon name="shield-check" size="36rpx" color="#1989fa" />
          <text class="title-text">安全键盘</text>
          <text class="title-tip">已启用安全输入模式</text>
        </view>
      </template>
    </wd-number-keyboard>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
</script>

<style lang="scss" scoped>
.custom-title {
  display: flex;
  align-items: center;
  gap: 12rpx;

  .title-text {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  .title-tip {
    font-size: 24rpx;
    color: #999;
    margin-left: auto;
  }
}
</style>
```

### 自定义模式

设置 `mode="custom"` 启用自定义模式,右侧会显示独立的删除键和完成键列。

```vue
<template>
  <view class="demo">
    <wd-cell title="自定义模式" :value="value || '请输入'" @click="show = true" />
    <wd-number-keyboard
      v-model="value"
      :visible="show"
      mode="custom"
      close-text="确定"
      @close="handleClose"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)

const handleClose = () => {
  show.value = false
  if (value.value) {
    console.log('输入的值:', value.value)
  }
}
</script>
```

**使用说明:**

- custom 模式下,键盘右侧会显示一个侧边栏
- 侧边栏上方为删除键,下方为完成键
- 完成键的文本通过 `close-text` 属性配置
- 删除键的文本通过 `delete-text` 属性配置

### 额外按键配置

通过 `extra-key` 属性配置额外按键,支持字符串或字符串数组。

```vue
<template>
  <view class="demo">
    <!-- 单个额外按键:小数点 -->
    <wd-cell title="金额输入" :value="amount || '0.00'" @click="showAmount = true" />
    <wd-number-keyboard
      v-model="amount"
      :visible="showAmount"
      extra-key="."
      @close="showAmount = false"
    />

    <!-- 两个额外按键:00和小数点(需要custom模式) -->
    <wd-cell title="大额金额" :value="bigAmount || '0.00'" @click="showBigAmount = true" />
    <wd-number-keyboard
      v-model="bigAmount"
      :visible="showBigAmount"
      mode="custom"
      :extra-key="['00', '.']"
      close-text="确定"
      @close="showBigAmount = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const amount = ref('')
const bigAmount = ref('')
const showAmount = ref(false)
const showBigAmount = ref(false)
</script>
```

**额外按键规则:**

| 模式 | extra-key 类型 | 效果 |
|------|---------------|------|
| default | `string` | 左下角显示该按键 |
| custom | `string` | 左下角显示该按键,0键变宽 |
| custom | `string[]` (1个) | 左下角显示该按键,0键变宽 |
| custom | `string[]` (2个) | 第一个在左下角,第二个在右下角,0在中间 |

### 身份证键盘

配置 `extra-key="X"` 实现身份证号输入键盘。

```vue
<template>
  <view class="demo">
    <wd-cell title="身份证号" :value="idCard || '请输入'" @click="show = true" />
    <wd-number-keyboard
      v-model="idCard"
      :visible="show"
      title="请输入身份证号"
      extra-key="X"
      :maxlength="18"
      @close="show = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const idCard = ref('')
const show = ref(false)

// 身份证号格式校验
watch(idCard, (val) => {
  if (val.length === 18) {
    const isValid = validateIdCard(val)
    console.log('身份证号校验:', isValid ? '有效' : '无效')
  }
})

const validateIdCard = (id: string): boolean => {
  const reg = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  return reg.test(id)
}
</script>
```

### 随机键盘

设置 `random-key-order` 属性可随机排列数字按键顺序,每次显示时都会重新随机,适用于密码输入等安全场景。

```vue
<template>
  <view class="demo">
    <wd-cell title="安全密码" :value="password ? '******' : '请输入'" @click="show = true" />
    <wd-number-keyboard
      v-model="password"
      :visible="show"
      title="请输入安全密码"
      random-key-order
      :maxlength="6"
      @close="handleClose"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const password = ref('')
const show = ref(false)

// 密码输入完成自动提交
watch(password, (val) => {
  if (val.length === 6) {
    handleSubmit()
  }
})

const handleClose = () => {
  show.value = false
}

const handleSubmit = () => {
  console.log('提交密码:', password.value)
  show.value = false
  password.value = ''
}
</script>
```

**随机算法说明:**

组件内部使用 Fisher-Yates 洗牌算法实现随机排列:

```typescript
const shuffleArray = <T,>(arr: T[]): T[] => {
  const newArr = [...arr]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}
```

该算法保证每种排列出现的概率相等,是密码学安全的随机算法。

### 最大长度限制

通过 `maxlength` 属性限制输入的最大字符数。

```vue
<template>
  <view class="demo">
    <!-- 6位验证码 -->
    <wd-cell title="验证码" :value="code || '请输入'" @click="showCode = true" />
    <wd-number-keyboard
      v-model="code"
      :visible="showCode"
      title="请输入6位验证码"
      :maxlength="6"
      @close="showCode = false"
    />

    <!-- 11位手机号 -->
    <wd-cell title="手机号" :value="phone || '请输入'" @click="showPhone = true" />
    <wd-number-keyboard
      v-model="phone"
      :visible="showPhone"
      title="请输入手机号"
      :maxlength="11"
      @close="showPhone = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const code = ref('')
const phone = ref('')
const showCode = ref(false)
const showPhone = ref(false)
</script>
```

### 显示蒙层

设置 `modal` 属性显示背景蒙层,阻止用户与页面其他区域交互。

```vue
<template>
  <view class="demo">
    <wd-cell title="带蒙层键盘" :value="value || '请输入'" @click="show = true" />
    <wd-number-keyboard
      v-model="value"
      :visible="show"
      modal
      @close="show = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
</script>
```

**使用说明:**

- 默认情况下键盘无蒙层,用户可以与页面其他区域交互
- 设置 `modal` 后会显示半透明蒙层
- 可通过 `hide-on-click-outside` 控制点击蒙层是否关闭键盘

### 禁止点击外部关闭

设置 `hide-on-click-outside` 为 `false` 可禁止点击键盘外部区域关闭。

```vue
<template>
  <view class="demo">
    <wd-cell title="必须完成输入" :value="value || '请输入'" @click="show = true" />
    <wd-number-keyboard
      v-model="value"
      :visible="show"
      mode="custom"
      close-text="完成"
      :hide-on-click-outside="false"
      modal
      @close="handleClose"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()
const value = ref('')
const show = ref(false)

const handleClose = () => {
  if (value.value.length < 6) {
    toast.warning('请输入完整的6位密码')
    return
  }
  show.value = false
}
</script>
```

### 完成按钮加载状态

设置 `close-button-loading` 可显示完成按钮的加载状态,适用于需要异步验证的场景。

```vue
<template>
  <view class="demo">
    <wd-cell title="异步验证" :value="value || '请输入'" @click="show = true" />
    <wd-number-keyboard
      v-model="value"
      :visible="show"
      mode="custom"
      close-text="验证"
      :close-button-loading="loading"
      :hide-on-click-outside="!loading"
      @close="handleVerify"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()
const value = ref('')
const show = ref(false)
const loading = ref(false)

const handleVerify = async () => {
  if (value.value.length < 6) {
    toast.warning('请输入6位验证码')
    return
  }

  loading.value = true

  try {
    // 模拟异步验证
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (value.value === '123456') {
          resolve(true)
        } else {
          reject(new Error('验证码错误'))
        }
      }, 1500)
    })

    toast.success('验证成功')
    show.value = false
    value.value = ''
  } catch (error) {
    toast.error('验证码错误,请重试')
    value.value = ''
  } finally {
    loading.value = false
  }
}
</script>
```

### 隐藏删除键

设置 `show-delete-key` 为 `false` 可隐藏删除键,适用于一次性输入不允许修改的场景。

```vue
<template>
  <view class="demo">
    <wd-cell title="抽奖号码" :value="lotteryNum || '请输入'" @click="show = true" />
    <wd-number-keyboard
      v-model="lotteryNum"
      :visible="show"
      title="输入5位抽奖号码"
      :show-delete-key="false"
      :maxlength="5"
      @close="show = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const lotteryNum = ref('')
const show = ref(false)

watch(lotteryNum, (val) => {
  if (val.length === 5) {
    show.value = false
    console.log('抽奖号码:', val)
  }
})
</script>
```

### 自定义层级

通过 `z-index` 属性设置键盘的层级,解决与其他弹层组件的层级冲突。

```vue
<template>
  <view class="demo">
    <wd-cell title="高层级键盘" :value="value || '请输入'" @click="show = true" />
    <wd-number-keyboard
      v-model="value"
      :visible="show"
      :z-index="2000"
      @close="show = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
</script>
```

### 锁定滚动

通过 `lock-scroll` 属性控制键盘显示时是否锁定页面滚动。

```vue
<template>
  <view class="demo">
    <!-- 默认锁定滚动 -->
    <wd-number-keyboard
      v-model="value1"
      :visible="show1"
      lock-scroll
      @close="show1 = false"
    />

    <!-- 不锁定滚动 -->
    <wd-number-keyboard
      v-model="value2"
      :visible="show2"
      :lock-scroll="false"
      @close="show2 = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const show1 = ref(false)
const show2 = ref(false)
</script>
```

### 底部安全区适配

通过 `safe-area-inset-bottom` 属性控制是否适配 iPhone X 等设备的底部安全区域。

```vue
<template>
  <view class="demo">
    <wd-number-keyboard
      v-model="value"
      :visible="show"
      safe-area-inset-bottom
      @close="show = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
</script>
```

## 高级用法

### 与 PasswordInput 组合

NumberKeyboard 常与密码输入框组件配合使用,实现完整的密码输入体验。

```vue
<template>
  <view class="payment-page">
    <view class="payment-header">
      <text class="amount-label">支付金额</text>
      <text class="amount-value">¥ 99.00</text>
    </view>

    <view class="password-section">
      <text class="password-label">请输入支付密码</text>
      <view class="password-dots">
        <view
          v-for="i in 6"
          :key="i"
          class="dot-item"
          :class="{ filled: password.length >= i }"
        />
      </view>
    </view>

    <wd-number-keyboard
      v-model="password"
      :visible="showKeyboard"
      random-key-order
      :maxlength="6"
      :hide-on-click-outside="false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()
const password = ref('')
const showKeyboard = ref(false)

onMounted(() => {
  // 自动显示键盘
  showKeyboard.value = true
})

watch(password, (val) => {
  if (val.length === 6) {
    handlePayment()
  }
})

const handlePayment = async () => {
  toast.loading('支付中...')

  try {
    // 模拟支付请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('支付成功')
    showKeyboard.value = false
  } catch (error) {
    toast.error('支付失败')
    password.value = ''
  }
}
</script>

<style lang="scss" scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.payment-header {
  padding: 60rpx 32rpx;
  background: #fff;
  text-align: center;

  .amount-label {
    display: block;
    font-size: 28rpx;
    color: #999;
    margin-bottom: 16rpx;
  }

  .amount-value {
    font-size: 64rpx;
    font-weight: 600;
    color: #333;
  }
}

.password-section {
  padding: 48rpx 32rpx;
  background: #fff;
  margin-top: 24rpx;

  .password-label {
    display: block;
    font-size: 28rpx;
    color: #666;
    text-align: center;
    margin-bottom: 32rpx;
  }
}

.password-dots {
  display: flex;
  justify-content: center;
  gap: 24rpx;

  .dot-item {
    width: 80rpx;
    height: 80rpx;
    border: 2rpx solid #ddd;
    border-radius: 8rpx;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;

    &.filled::after {
      content: '';
      width: 24rpx;
      height: 24rpx;
      border-radius: 50%;
      background: #333;
    }
  }
}
</style>
```

### 金额输入组件封装

封装一个专用的金额输入组件,支持格式化显示和小数位限制。

```vue
<template>
  <view class="amount-input">
    <view class="amount-display" @click="showKeyboard = true">
      <text class="currency">¥</text>
      <text class="value">{{ displayAmount }}</text>
      <view v-if="showKeyboard" class="cursor" />
    </view>

    <wd-number-keyboard
      v-model="inputValue"
      :visible="showKeyboard"
      mode="custom"
      :extra-key="['.']"
      close-text="确定"
      @input="handleInput"
      @delete="handleDelete"
      @close="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue?: number
  maxAmount?: number
  decimalPlaces?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  maxAmount: 999999.99,
  decimalPlaces: 2,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'confirm': [value: number]
}>()

const inputValue = ref('')
const showKeyboard = ref(false)

// 格式化显示金额
const displayAmount = computed(() => {
  if (!inputValue.value) return '0.00'

  const parts = inputValue.value.split('.')
  const intPart = parts[0] || '0'
  const decPart = parts[1] || ''

  // 整数部分添加千分位
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  if (inputValue.value.includes('.')) {
    return `${formattedInt}.${decPart}`
  }
  return formattedInt
})

// 处理输入
const handleInput = (text: string) => {
  const currentValue = inputValue.value

  // 小数点处理
  if (text === '.') {
    if (currentValue.includes('.')) return
    if (!currentValue) {
      inputValue.value = '0.'
      return
    }
  }

  // 小数位数限制
  if (currentValue.includes('.')) {
    const decPart = currentValue.split('.')[1]
    if (decPart && decPart.length >= props.decimalPlaces) return
  }

  // 最大金额限制
  const newValue = currentValue + text
  const numValue = parseFloat(newValue)
  if (numValue > props.maxAmount) return

  inputValue.value = newValue
}

// 处理删除
const handleDelete = () => {
  inputValue.value = inputValue.value.slice(0, -1)
}

// 确认输入
const handleConfirm = () => {
  showKeyboard.value = false
  const numValue = parseFloat(inputValue.value) || 0
  emit('update:modelValue', numValue)
  emit('confirm', numValue)
}

// 同步外部值
watch(() => props.modelValue, (val) => {
  if (val) {
    inputValue.value = val.toString()
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.amount-input {
  padding: 32rpx;
}

.amount-display {
  display: flex;
  align-items: baseline;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #eee;

  .currency {
    font-size: 36rpx;
    color: #333;
    margin-right: 8rpx;
  }

  .value {
    font-size: 56rpx;
    font-weight: 600;
    color: #333;
  }

  .cursor {
    width: 4rpx;
    height: 48rpx;
    background: #1989fa;
    margin-left: 4rpx;
    animation: blink 1s infinite;
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
```

### 验证码输入组件

封装验证码输入组件,支持自动聚焦和完成回调。

```vue
<template>
  <view class="code-input">
    <view class="code-boxes" @click="showKeyboard = true">
      <view
        v-for="i in length"
        :key="i"
        class="code-box"
        :class="{ active: code.length === i - 1 && showKeyboard }"
      >
        <text v-if="code[i - 1]">{{ mask ? '●' : code[i - 1] }}</text>
      </view>
    </view>

    <wd-number-keyboard
      v-model="code"
      :visible="showKeyboard"
      :maxlength="length"
      @close="showKeyboard = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'

interface Props {
  length?: number
  mask?: boolean
  autoFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  length: 6,
  mask: false,
  autoFocus: true,
})

const emit = defineEmits<{
  'complete': [code: string]
  'change': [code: string]
}>()

const code = ref('')
const showKeyboard = ref(false)

onMounted(() => {
  if (props.autoFocus) {
    showKeyboard.value = true
  }
})

watch(code, (val) => {
  emit('change', val)

  if (val.length === props.length) {
    emit('complete', val)
    showKeyboard.value = false
  }
})

// 暴露清空方法
const clear = () => {
  code.value = ''
}

defineExpose({ clear })
</script>

<style lang="scss" scoped>
.code-boxes {
  display: flex;
  justify-content: center;
  gap: 16rpx;
}

.code-box {
  width: 88rpx;
  height: 96rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 500;
  color: #333;
  background: #fff;
  transition: border-color 0.2s;

  &.active {
    border-color: #1989fa;

    &::after {
      content: '';
      width: 4rpx;
      height: 40rpx;
      background: #1989fa;
      animation: blink 1s infinite;
    }
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
```

### 监听输入事件

组件提供 `input` 和 `delete` 事件,可以监听每一次按键操作。

```vue
<template>
  <view class="demo">
    <wd-cell title="事件监听" :value="value || '请输入'" @click="show = true" />
    <view class="event-log">
      <text v-for="(log, index) in logs" :key="index">{{ log }}</text>
    </view>

    <wd-number-keyboard
      v-model="value"
      :visible="show"
      @input="handleInput"
      @delete="handleDelete"
      @close="handleClose"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
const logs = ref<string[]>([])

const addLog = (msg: string) => {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
  if (logs.value.length > 10) {
    logs.value.pop()
  }
}

const handleInput = (text: string) => {
  addLog(`输入: ${text}`)
}

const handleDelete = () => {
  addLog('删除')
}

const handleClose = () => {
  addLog('关闭键盘')
  show.value = false
}
</script>

<style lang="scss" scoped>
.event-log {
  padding: 24rpx;
  background: #f5f5f5;
  max-height: 300rpx;
  overflow-y: auto;

  text {
    display: block;
    font-size: 24rpx;
    color: #666;
    line-height: 1.8;
  }
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `string` | `''` |
| visible | 是否显示键盘 | `boolean` | `false` |
| title | 键盘标题 | `string` | - |
| mode | 键盘模式 | `'default' \| 'custom'` | `'default'` |
| maxlength | 最大输入长度 | `number` | `Infinity` |
| z-index | 键盘层级 | `number` | `100` |
| show-delete-key | 是否显示删除键 | `boolean` | `true` |
| random-key-order | 是否随机排列按键 | `boolean` | `false` |
| close-text | 完成按钮文本 | `string` | `'完成'` |
| delete-text | 删除按钮文本 | `string` | `'删除'` |
| close-button-loading | 完成按钮加载状态 | `boolean` | `false` |
| modal | 是否显示蒙层 | `boolean` | `false` |
| hide-on-click-outside | 点击外部是否关闭 | `boolean` | `true` |
| lock-scroll | 是否锁定滚动 | `boolean` | `true` |
| safe-area-inset-bottom | 是否适配底部安全区域 | `boolean` | `true` |
| extra-key | 额外按键 | `string \| string[]` | - |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `value: string` |
| update:visible | 显示状态变化时触发 | `visible: boolean` |
| input | 按键输入时触发 | `text: string` |
| delete | 删除按键时触发 | - |
| close | 关闭键盘时触发 | - |

### Slots

| 名称 | 说明 |
|------|------|
| title | 自定义标题区域内容 |

### 类型定义

```typescript
/**
 * 键盘模式类型
 */
type KeyboardMode = 'default' | 'custom'

/**
 * 按键类型
 */
type NumberKeyType = '' | 'delete' | 'extra' | 'close'

/**
 * 按键接口
 */
interface Key {
  /** 按键文本 */
  text?: number | string
  /** 按键类型 */
  type?: NumberKeyType
  /** 是否占两个按键宽度 */
  wider?: boolean
}

/**
 * 数字键盘组件属性接口
 */
interface WdNumberKeyboardProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 是否可见 */
  visible?: boolean
  /** 绑定的值 */
  modelValue?: string
  /** 标题 */
  title?: string
  /** 键盘模式 */
  mode?: KeyboardMode
  /** 层级 */
  zIndex?: number
  /** 最大长度 */
  maxlength?: number
  /** 是否显示删除键 */
  showDeleteKey?: boolean
  /** 是否随机键盘按键顺序 */
  randomKeyOrder?: boolean
  /** 确认按钮文本 */
  closeText?: string
  /** 删除按钮文本 */
  deleteText?: string
  /** 关闭按钮是否显示加载状态 */
  closeButtonLoading?: boolean
  /** 是否显示蒙层 */
  modal?: boolean
  /** 是否在点击外部时收起键盘 */
  hideOnClickOutside?: boolean
  /** 是否锁定滚动 */
  lockScroll?: boolean
  /** 是否在底部安全区域内 */
  safeAreaInsetBottom?: boolean
  /** 额外按键 */
  extraKey?: string | string[]
}

/**
 * 数字键盘按键组件属性接口
 */
interface WdKeyProps {
  /** 按键类型 */
  type?: NumberKeyType
  /** 按键文本 */
  text?: string | number
  /** 是否为宽按键 */
  wider?: boolean
  /** 是否为大按键 */
  large?: boolean
  /** 是否显示加载状态 */
  loading?: boolean
}

/**
 * 数字键盘按键组件事件接口
 */
interface WdKeyEmits {
  /** 按键按下时触发 */
  press: [text: string | number, type: NumberKeyType]
}
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

### 键盘整体样式

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-number-keyboard-background | 键盘背景色 | `#f2f3f5` |

### 标题栏样式

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-number-keyboard-title-height | 标题栏高度 | `88rpx` |
| --wd-number-keyboard-title-color | 标题颜色 | `#333333` |
| --wd-number-keyboard-title-font-size | 标题字号 | `28rpx` |

### 关闭按钮样式

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-number-keyboard-close-color | 关闭按钮颜色 | `#1989fa` |
| --wd-number-keyboard-close-font-size | 关闭按钮字号 | `28rpx` |
| --wd-number-keyboard-close-padding | 关闭按钮内边距 | `0 32rpx` |

### 按键样式

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-number-keyboard-key-height | 按键高度 | `108rpx` |
| --wd-number-keyboard-key-font-size | 按键字号 | `48rpx` |
| --wd-number-keyboard-key-background | 按键背景色 | `#ffffff` |
| --wd-number-keyboard-key-border-radius | 按键圆角 | `16rpx` |
| --wd-number-keyboard-key-active-color | 按键激活背景色 | `#ebedf0` |
| --wd-number-keyboard-delete-font-size | 删除键字号 | `28rpx` |

### 完成按钮样式

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-number-keyboard-button-text-color | 完成按钮文字颜色 | `#ffffff` |
| --wd-number-keyboard-button-background | 完成按钮背景色 | `#1989fa` |
| --wd-number-keyboard-button-active-opacity | 完成按钮激活透明度 | `0.8` |

### 图标样式

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-number-keyboard-icon-size | 图标大小 | `44rpx` |

### 自定义主题示例

```vue
<template>
  <view class="custom-keyboard-demo">
    <wd-number-keyboard
      v-model="value"
      :visible="show"
      mode="custom"
      close-text="支付"
      custom-class="payment-keyboard"
      @close="show = false"
    />
  </view>
</template>

<style lang="scss">
.payment-keyboard {
  --wd-number-keyboard-background: #f8f8f8;
  --wd-number-keyboard-key-background: #fff;
  --wd-number-keyboard-key-border-radius: 12rpx;
  --wd-number-keyboard-button-background: #ff6b00;
  --wd-number-keyboard-close-color: #ff6b00;
}
</style>
```

### 暗黑模式

组件已内置暗黑模式支持,当页面添加 `.wot-theme-dark` 类名时自动切换:

```scss
.wot-theme-dark {
  .wd-number-keyboard {
    background: $-dark-background5;
  }

  .wd-number-keyboard__header {
    color: $-dark-color;
  }

  .wd-key {
    background: $-dark-background2;
    color: $-dark-color;

    &:active {
      background-color: $-dark-background4;
    }
  }
}
```

## 最佳实践

### 1. 支付密码输入

```vue
<template>
  <view class="payment">
    <!-- 使用随机键盘增强安全性 -->
    <wd-number-keyboard
      v-model="password"
      :visible="true"
      title="请输入支付密码"
      random-key-order
      :maxlength="6"
      :hide-on-click-outside="false"
      modal
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const password = ref('')

// 6位密码自动提交
watch(password, (val) => {
  if (val.length === 6) {
    submitPayment(val)
  }
})

const submitPayment = async (pwd: string) => {
  // 提交支付
}
</script>
```

**要点:**
- 使用 `random-key-order` 随机键盘防止键盘记录
- 设置 `maxlength="6"` 限制密码长度
- 使用 `modal` 和 `hide-on-click-outside="false"` 强制用户完成输入
- 监听密码长度自动提交

### 2. 金额输入

```vue
<template>
  <wd-number-keyboard
    v-model="amount"
    :visible="show"
    mode="custom"
    :extra-key="['.']"
    close-text="确定"
    @input="validateAmount"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const amount = ref('')

// 金额格式校验
const validateAmount = (text: string) => {
  // 只允许一个小数点
  if (text === '.' && amount.value.includes('.')) {
    return
  }

  // 小数点后最多2位
  const parts = amount.value.split('.')
  if (parts[1] && parts[1].length >= 2) {
    return
  }
}
</script>
```

**要点:**
- 使用 custom 模式配置小数点按键
- 通过 input 事件校验输入格式
- 限制小数位数

### 3. 验证码自动提交

```vue
<template>
  <wd-number-keyboard
    v-model="code"
    :visible="true"
    :maxlength="6"
  />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const code = ref('')

watch(code, (val) => {
  if (val.length === 6) {
    verifyCode(val)
  }
})

const verifyCode = async (code: string) => {
  // 验证码校验
}
</script>
```

**要点:**
- 设置正确的 `maxlength`
- 监听值变化自动提交
- 验证失败时清空重输

### 4. 异步验证处理

```vue
<template>
  <wd-number-keyboard
    v-model="value"
    :visible="show"
    mode="custom"
    :close-button-loading="loading"
    @close="handleVerify"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(false)

const handleVerify = async () => {
  loading.value = true
  try {
    await verifyApi(value.value)
    show.value = false
  } catch (error) {
    // 验证失败处理
  } finally {
    loading.value = false
  }
}
</script>
```

**要点:**
- 使用 `close-button-loading` 显示加载状态
- 在 finally 中重置 loading 状态
- 验证失败给出明确提示

## 常见问题

### 1. NumberKeyboard 和 Keyboard 的区别?

| 特性 | NumberKeyboard | Keyboard |
|------|----------------|----------|
| 定位 | 纯数字输入 | 通用键盘 |
| 模式 | default/custom | default/custom/car |
| 车牌号 | 否 不支持 | 是 支持 |
| API | 更简洁 | 更丰富 |
| 使用场景 | 密码、验证码、金额 | 包含车牌号等 |

**建议:** 如果只需要数字输入,使用 NumberKeyboard;如果需要车牌号输入,使用 Keyboard。

### 2. 如何清空输入值?

直接将 v-model 绑定的值设为空字符串:

```typescript
const value = ref('123456')

// 清空输入
const clearInput = () => {
  value.value = ''
}
```

### 3. 随机键盘顺序什么时候会改变?

每次键盘的 `visible` 从 `false` 变为 `true` 时,如果设置了 `random-key-order`,按键顺序都会重新随机排列。

```vue
<template>
  <!-- 每次打开键盘都会重新随机 -->
  <wd-number-keyboard
    v-model="value"
    :visible="show"
    random-key-order
  />
</template>
```

### 4. 如何限制只能输入整数?

不配置 `extra-key` 属性,默认就是只能输入整数的键盘。

```vue
<template>
  <!-- 只能输入整数 -->
  <wd-number-keyboard
    v-model="value"
    :visible="show"
  />
</template>
```

### 5. 如何实现输入完成后自动关闭?

监听 v-model 的值变化,当达到指定长度时关闭键盘:

```typescript
watch(value, (val) => {
  if (val.length === 6) {
    show.value = false
    // 处理输入完成逻辑
  }
})
```

### 6. 小程序端键盘遮挡输入框怎么办?

确保输入框在页面上方,或者在键盘显示时滚动页面:

```typescript
const showKeyboard = () => {
  show.value = true
  // 滚动页面确保输入框可见
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
}
```

### 7. 如何自定义删除键图标?

目前删除键图标不支持自定义,组件内部使用 `keyboard-delete` 图标。如需自定义,可以通过 CSS 覆盖:

```scss
.wd-key--delete .wd-key__icon {
  // 自定义样式
}
```

### 8. 键盘层级被其他组件覆盖?

通过 `z-index` 属性调整键盘层级:

```vue
<wd-number-keyboard
  :z-index="9999"
  ...
/>
```

## 总结

NumberKeyboard 数字键盘核心使用要点:

1. **基础使用** - 通过 `v-model` 绑定值,`visible` 控制显示
2. **模式选择** - default 模式简洁,custom 模式功能更丰富
3. **额外按键** - 通过 `extra-key` 配置小数点、X等按键
4. **安全输入** - 使用 `random-key-order` 增强密码输入安全性
5. **长度限制** - 使用 `maxlength` 限制输入长度
6. **异步处理** - 使用 `close-button-loading` 处理异步验证
7. **主题定制** - 通过 CSS 变量定制键盘样式
