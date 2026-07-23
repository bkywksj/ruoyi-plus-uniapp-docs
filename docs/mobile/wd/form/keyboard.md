---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/keyboard
---

# Keyboard 虚拟键盘

## 介绍

Keyboard 虚拟键盘组件是一个功能完善的数字输入组件,专为移动端设计,用于输入数字、密码、身份证号、车牌号、金额等需要自定义键盘的场景。组件基于 Popup 实现,提供流畅的弹出动画和触摸反馈。

**核心特性:**

- **多种键盘模式** - 支持默认数字键盘、自定义布局键盘、车牌号专用键盘三种模式
- **车牌号输入** - 内置全国34个省份简称和车牌字母数字键盘(自动排除I、O字母)
- **随机键盘** - 支持随机排列按键顺序,提升密码输入安全性
- **额外按键** - 支持配置1-2个额外按键,满足小数点、X(身份证)等输入需求
- **安全区域** - 自动适配 iPhone X 等设备的底部安全区域
- **触摸反馈** - 按键具有触摸激活状态和滑动取消机制
- **灵活配置** - 支持自定义标题、按钮文字、最大长度等
- **暗黑模式** - 内置暗黑主题样式支持

## 平台兼容性

| 平台 | 支持情况 | 说明 |
|------|----------|------|
| 微信小程序 | 是 | 完全支持 |
| 支付宝小程序 | 是 | 完全支持 |
| 百度小程序 | 是 | 完全支持 |
| 字节小程序 | 是 | 完全支持 |
| QQ小程序 | 是 | 完全支持 |
| H5 | 是 | 完全支持 |
| App | 是 | 完全支持 |

## 基本用法

### 默认键盘

最基础的数字键盘,包含0-9数字和删除键。

```vue
<template>
  <view class="page">
    <wd-cell
      title="默认键盘"
      :value="value1 || '点击输入'"
      is-link
      @click="showKeyboard1 = true"
    />

    <wd-keyboard
      v-model="value1"
      :visible="showKeyboard1"
      @close="showKeyboard1 = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const showKeyboard1 = ref(false)
</script>
```

**使用说明:**

- 通过 `v-model` 双向绑定输入值
- 通过 `visible` 控制键盘显示/隐藏
- 点击键盘外部区域或删除键右侧完成键可关闭键盘
- 默认键盘布局为标准九宫格,左下角为空位/额外按键,右下角为删除键

### 带标题键盘

通过 `title` 属性设置键盘标题,提示用户输入内容。

```vue
<template>
  <view class="page">
    <wd-cell
      title="支付密码"
      :value="password ? '******' : '点击设置'"
      is-link
      @click="showKeyboard = true"
    />

    <wd-keyboard
      v-model="password"
      :visible="showKeyboard"
      title="请输入6位支付密码"
      :maxlength="6"
      @close="showKeyboard = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const password = ref('')
const showKeyboard = ref(false)

watch(password, (val) => {
  if (val.length === 6) {
    showKeyboard.value = false
    // 处理密码验证
    console.log('密码输入完成:', val)
  }
})
</script>
```

### 自定义标题插槽

通过 `title` 插槽可以完全自定义标题区域。

```vue
<template>
  <view class="page">
    <wd-keyboard
      v-model="value"
      :visible="show"
      @close="show = false"
    >
      <template #title>
        <view class="custom-title">
          <wd-icon name="shield-check" size="32rpx" />
          <text>安全键盘</text>
        </view>
      </template>
    </wd-keyboard>
  </view>
</template>

<style lang="scss" scoped>
.custom-title {
  display: flex;
  align-items: center;
  gap: 8rpx;

  text {
    font-size: 28rpx;
    color: #333;
  }
}
</style>
```

### 自定义模式

设置 `mode="custom"` 启用自定义模式,右侧会显示独立的删除键和完成键列。

```vue
<template>
  <view class="page">
    <wd-cell
      title="自定义模式"
      :value="value2 || '点击输入'"
      is-link
      @click="showKeyboard2 = true"
    />

    <wd-keyboard
      v-model="value2"
      :visible="showKeyboard2"
      mode="custom"
      close-text="完成"
      @close="showKeyboard2 = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value2 = ref('')
const showKeyboard2 = ref(false)
</script>
```

**自定义模式特点:**

- 键盘分为左右两部分:左侧为数字区,右侧为功能区
- 右侧功能区包含删除键(上)和完成键(下)
- 完成键占据较大高度,方便点击
- 可通过 `close-text` 自定义完成键文字
- 支持配置两个额外按键

### 额外按键

通过 `extra-key` 属性配置额外按键,支持字符串或字符串数组。

```vue
<template>
  <view class="page">
    <!-- 单个额外按键(小数点) -->
    <wd-cell title="金额输入" :value="amount || '0.00'" is-link @click="show1 = true" />
    <wd-keyboard
      v-model="amount"
      :visible="show1"
      extra-key="."
      @close="show1 = false"
    />

    <!-- 两个额外按键(自定义模式) -->
    <wd-cell title="金额精确输入" :value="amount2 || '0.00'" is-link @click="show2 = true" />
    <wd-keyboard
      v-model="amount2"
      :visible="show2"
      mode="custom"
      :extra-key="['00', '.']"
      close-text="确定"
      @close="show2 = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const amount = ref('')
const amount2 = ref('')
const show1 = ref(false)
const show2 = ref(false)
</script>
```

**额外按键配置规则:**

| 模式 | 配置方式 | 布局效果 |
|------|----------|----------|
| default | `extra-key="."` | 左下角显示小数点 |
| default | `extra-key="X"` | 左下角显示X(身份证) |
| custom | `extra-key="."` | 数字0占据两格宽度,小数点在右 |
| custom | `:extra-key="['00', '.']"` | 左00,中0,右小数点 |

### 身份证键盘

配置 `extra-key="X"` 实现身份证号输入,结合 `maxlength="18"` 限制长度。

```vue
<template>
  <view class="page">
    <wd-cell title="身份证号" :value="idCard || '请输入'" is-link @click="show = true" />

    <wd-keyboard
      v-model="idCard"
      :visible="show"
      title="请输入身份证号"
      extra-key="X"
      :maxlength="18"
      @close="show = false"
    />

    <!-- 显示格式化后的身份证号 -->
    <view v-if="idCard" class="id-preview">
      {{ formatIdCard(idCard) }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const idCard = ref('')
const show = ref(false)

// 格式化身份证号显示
const formatIdCard = (id: string) => {
  if (id.length <= 6) return id
  if (id.length <= 14) return `${id.slice(0, 6)} ${id.slice(6)}`
  return `${id.slice(0, 6)} ${id.slice(6, 14)} ${id.slice(14)}`
}
</script>
```

### 车牌号键盘

设置 `mode="car"` 启用车牌号专用键盘,支持中文省份简称和字母数字切换。

```vue
<template>
  <view class="page">
    <view class="car-number-display">
      <view
        v-for="(char, index) in 8"
        :key="index"
        :class="['car-char', { active: index === carNumber.length }]"
        @click="show = true"
      >
        <text>{{ carNumber[index] || '' }}</text>
        <view v-if="index === 1" class="dot">·</view>
      </view>
    </view>

    <wd-keyboard
      v-model="carNumber"
      :visible="show"
      mode="car"
      title="请输入车牌号"
      :maxlength="8"
      @close="show = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const carNumber = ref('')
const show = ref(false)
</script>

<style lang="scss" scoped>
.car-number-display {
  display: flex;
  justify-content: center;
  gap: 8rpx;
  padding: 32rpx;

  .car-char {
    position: relative;
    width: 64rpx;
    height: 80rpx;
    border: 2rpx solid #ddd;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 500;

    &.active {
      border-color: #1989fa;
      background: #e8f4ff;
    }

    .dot {
      position: absolute;
      right: -12rpx;
      font-size: 40rpx;
      color: #333;
    }
  }
}
</style>
```

**车牌号键盘特点:**

1. **两种键盘状态**: 省份简称键盘和字母数字键盘
2. **省份简称**: 包含全国34个省份/地区简称(京沪粤津冀豫云辽黑湘皖鲁苏浙赣鄂桂甘晋陕蒙吉闽贵渝川青琼宁挂藏港澳新使学)
3. **字母数字**: 不包含I和O(车牌号规则中不使用这两个字母)
4. **自动切换**: 输入省份简称后自动切换到字母数字键盘
5. **手动切换**: 点击"ABC/返回"按钮可手动切换键盘

**车牌号格式说明:**

| 类型 | 格式 | 长度 | 示例 |
|------|------|------|------|
| 普通车牌 | 省+字母+5位 | 7位 | 京A12345 |
| 新能源车牌 | 省+字母+6位 | 8位 | 京AD12345 |

### 随机键盘

设置 `random-key-order` 随机排列按键顺序,适用于密码输入等安全场景。

```vue
<template>
  <view class="page">
    <view class="password-box">
      <view
        v-for="i in 6"
        :key="i"
        :class="['password-dot', { filled: password.length >= i }]"
      />
    </view>

    <wd-keyboard
      v-model="password"
      :visible="show"
      title="请输入支付密码"
      :maxlength="6"
      random-key-order
      modal
      @close="handleClose"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const password = ref('')
const show = ref(true)

watch(password, (val) => {
  if (val.length === 6) {
    // 验证密码
    verifyPassword(val)
  }
})

const handleClose = () => {
  show.value = false
}

const verifyPassword = (pwd: string) => {
  console.log('验证密码:', pwd)
  // 验证逻辑...
}
</script>

<style lang="scss" scoped>
.password-box {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  padding: 48rpx 32rpx;

  .password-dot {
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid #ddd;
    border-radius: 50%;
    background: #fff;

    &.filled {
      background: #333;
    }
  }
}
</style>
```

**随机键盘说明:**

- 每次显示键盘时,1-9的数字会随机排列
- 0和功能键位置保持不变
- 适用于支付密码、银行密码等安全敏感场景
- 可有效防止通过按键位置猜测密码

### 最大长度限制

通过 `maxlength` 限制输入长度,达到最大长度后无法继续输入。

```vue
<template>
  <view class="page">
    <!-- 验证码输入 -->
    <view class="code-input">
      <view v-for="i in 4" :key="i" class="code-item">
        {{ code[i - 1] || '' }}
      </view>
    </view>

    <wd-keyboard
      v-model="code"
      :visible="show"
      :maxlength="4"
      title="请输入验证码"
      @close="show = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const code = ref('')
const show = ref(true)

watch(code, (val) => {
  if (val.length === 4) {
    show.value = false
    // 自动提交验证
    submitCode(val)
  }
})

const submitCode = (code: string) => {
  console.log('提交验证码:', code)
}
</script>
```

### 显示蒙层

设置 `modal` 显示背景蒙层,使键盘更加突出。

```vue
<template>
  <view class="page">
    <wd-keyboard
      v-model="value"
      :visible="show"
      modal
      title="带蒙层的键盘"
      @close="show = false"
    />
  </view>
</template>
```

**蒙层相关属性:**

| 属性 | 说明 | 默认值 |
|------|------|--------|
| `modal` | 是否显示蒙层 | `false` |
| `hide-on-click-outside` | 点击蒙层是否关闭 | `true` |
| `lock-scroll` | 是否锁定页面滚动 | `true` |

### 禁用点击外部关闭

设置 `hide-on-click-outside="false"` 可禁用点击外部关闭功能。

```vue
<template>
  <view class="page">
    <wd-keyboard
      v-model="value"
      :visible="show"
      modal
      :hide-on-click-outside="false"
      close-text="完成"
      @close="show = false"
    />
  </view>
</template>
```

### 完成按钮加载状态

设置 `close-button-loading` 可以显示完成按钮的加载状态,用于异步操作场景。

```vue
<template>
  <view class="page">
    <wd-keyboard
      v-model="value"
      :visible="show"
      mode="custom"
      close-text="提交"
      :close-button-loading="submitting"
      @close="handleSubmit"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
const submitting = ref(false)

const handleSubmit = async () => {
  if (!value.value) return

  submitting.value = true
  try {
    // 模拟异步提交
    await new Promise(resolve => setTimeout(resolve, 1500))
    show.value = false
    uni.showToast({ title: '提交成功', icon: 'success' })
  } finally {
    submitting.value = false
  }
}
</script>
```

### 自定义删除键文字

通过 `delete-text` 自定义删除键显示的文字。

```vue
<template>
  <view class="page">
    <!-- 默认显示删除图标 -->
    <wd-keyboard v-model="value1" :visible="show1" @close="show1 = false" />

    <!-- 自定义删除文字 -->
    <wd-keyboard
      v-model="value2"
      :visible="show2"
      delete-text="删除"
      @close="show2 = false"
    />
  </view>
</template>
```

### 隐藏删除键

设置 `show-delete-key="false"` 可以隐藏删除键。

```vue
<template>
  <view class="page">
    <wd-keyboard
      v-model="value"
      :visible="show"
      :show-delete-key="false"
      @close="show = false"
    />
  </view>
</template>
```

### 监听输入事件

组件提供了 `input`、`delete`、`close` 事件用于监听用户操作。

```vue
<template>
  <view class="page">
    <wd-keyboard
      v-model="value"
      :visible="show"
      @input="handleInput"
      @delete="handleDelete"
      @close="handleClose"
    />

    <view class="event-log">
      <text v-for="(log, i) in logs" :key="i">{{ log }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
const logs = ref<string[]>([])

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${msg}`)
  if (logs.value.length > 10) logs.value.pop()
}

const handleInput = (text: string) => {
  addLog(`输入: ${text}`)
}

const handleDelete = () => {
  addLog('删除')
}

const handleClose = () => {
  show.value = false
  addLog('关闭')
}
</script>
```

## 高级用法

### 密码支付场景

完整的密码支付流程实现。

```vue
<template>
  <view class="payment-page">
    <view class="payment-header">
      <text class="amount">¥ {{ amount }}</text>
      <text class="desc">向 {{ merchant }} 付款</text>
    </view>

    <view class="password-input" @click="showKeyboard = true">
      <view
        v-for="i in 6"
        :key="i"
        :class="['pwd-item', { filled: password.length >= i }]"
      >
        <view v-if="password.length >= i" class="pwd-dot" />
      </view>
    </view>

    <text class="hint" @click="handleForget">忘记密码?</text>

    <wd-keyboard
      v-model="password"
      :visible="showKeyboard"
      :maxlength="6"
      title="请输入支付密码"
      modal
      random-key-order
      :hide-on-click-outside="false"
      @close="showKeyboard = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const amount = ref('128.00')
const merchant = ref('测试商户')
const password = ref('')
const showKeyboard = ref(true)

watch(password, (val) => {
  if (val.length === 6) {
    handlePayment(val)
  }
})

const handlePayment = async (pwd: string) => {
  showKeyboard.value = false

  uni.showLoading({ title: '支付中...' })

  try {
    // 模拟支付请求
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (pwd === '123456') {
          resolve(true)
        } else {
          reject(new Error('密码错误'))
        }
      }, 1500)
    })

    uni.hideLoading()
    uni.showToast({ title: '支付成功', icon: 'success' })

  } catch (error) {
    uni.hideLoading()
    password.value = ''
    showKeyboard.value = true
    uni.showToast({ title: '密码错误,请重试', icon: 'none' })
  }
}

const handleForget = () => {
  uni.navigateTo({ url: '/pages/forget-password/index' })
}
</script>

<style lang="scss" scoped>
.payment-page {
  padding: 48rpx 32rpx;
  text-align: center;

  .payment-header {
    margin-bottom: 48rpx;

    .amount {
      display: block;
      font-size: 56rpx;
      font-weight: 600;
      color: #333;
    }

    .desc {
      font-size: 28rpx;
      color: #666;
      margin-top: 8rpx;
    }
  }

  .password-input {
    display: flex;
    justify-content: center;
    gap: 16rpx;
    padding: 32rpx;
    background: #f5f5f5;
    border-radius: 12rpx;

    .pwd-item {
      width: 80rpx;
      height: 80rpx;
      background: #fff;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .pwd-dot {
        width: 24rpx;
        height: 24rpx;
        background: #333;
        border-radius: 50%;
      }
    }
  }

  .hint {
    display: inline-block;
    margin-top: 32rpx;
    font-size: 28rpx;
    color: #1989fa;
  }
}
</style>
```

### 金额输入组件

带格式化显示的金额输入实现。

```vue
<template>
  <view class="amount-input-page">
    <view class="amount-display">
      <text class="currency">¥</text>
      <text class="value">{{ displayAmount }}</text>
    </view>

    <wd-keyboard
      v-model="inputValue"
      :visible="show"
      mode="custom"
      :extra-key="['.', '00']"
      close-text="确定"
      @input="handleInput"
      @delete="handleDelete"
      @close="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const inputValue = ref('')
const show = ref(true)

// 格式化显示金额
const displayAmount = computed(() => {
  if (!inputValue.value) return '0.00'

  // 处理小数点
  const parts = inputValue.value.split('.')
  const intPart = parts[0] || '0'
  const decPart = parts[1] || ''

  // 整数部分添加千分位
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // 小数部分保留两位
  const formattedDec = decPart.padEnd(2, '0').slice(0, 2)

  return `${formattedInt}.${formattedDec}`
})

const handleInput = (text: string) => {
  const current = inputValue.value

  // 小数点处理
  if (text === '.') {
    if (current.includes('.')) return // 已有小数点
    if (!current) {
      inputValue.value = '0.'
      return
    }
  }

  // 00处理
  if (text === '00') {
    if (!current || current === '0') return // 不能以00开头
    if (current.includes('.')) {
      const decLen = current.split('.')[1].length
      if (decLen >= 2) return // 小数位已满
      if (decLen === 1) {
        inputValue.value = current + '0' // 只添加一个0
        return
      }
    }
  }

  // 小数位限制
  if (current.includes('.')) {
    const decLen = current.split('.')[1].length
    if (decLen >= 2 && text !== '.') return
  }

  // 防止以0开头(除了0.xxx)
  if (current === '0' && text !== '.' && text !== '00') {
    inputValue.value = text
    return
  }
}

const handleDelete = () => {
  // 删除逻辑由v-model自动处理
}

const handleConfirm = () => {
  show.value = false
  const amount = parseFloat(inputValue.value || '0').toFixed(2)
  console.log('确认金额:', amount)
}
</script>

<style lang="scss" scoped>
.amount-input-page {
  .amount-display {
    padding: 64rpx 32rpx;
    text-align: center;

    .currency {
      font-size: 40rpx;
      color: #333;
      vertical-align: top;
    }

    .value {
      font-size: 80rpx;
      font-weight: 600;
      color: #333;
    }
  }
}
</style>
```

### 与输入框联动

键盘与自定义输入框的联动使用。

```vue
<template>
  <view class="form-page">
    <wd-cell-group>
      <wd-cell
        title="手机号"
        :value="phone || '请输入'"
        is-link
        @click="openKeyboard('phone')"
      />
      <wd-cell
        title="验证码"
        :value="code || '请输入'"
        is-link
        @click="openKeyboard('code')"
      />
      <wd-cell
        title="金额"
        :value="amount ? `¥${amount}` : '请输入'"
        is-link
        @click="openKeyboard('amount')"
      />
    </wd-cell-group>

    <!-- 手机号键盘 -->
    <wd-keyboard
      v-model="phone"
      :visible="currentField === 'phone'"
      title="请输入手机号"
      :maxlength="11"
      @close="closeKeyboard"
    />

    <!-- 验证码键盘 -->
    <wd-keyboard
      v-model="code"
      :visible="currentField === 'code'"
      title="请输入验证码"
      :maxlength="6"
      @close="closeKeyboard"
    />

    <!-- 金额键盘 -->
    <wd-keyboard
      v-model="amount"
      :visible="currentField === 'amount'"
      title="请输入金额"
      mode="custom"
      extra-key="."
      close-text="确定"
      @close="closeKeyboard"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const phone = ref('')
const code = ref('')
const amount = ref('')
const currentField = ref<string | null>(null)

const openKeyboard = (field: string) => {
  currentField.value = field
}

const closeKeyboard = () => {
  currentField.value = null
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `string` | `''` |
| visible | 是否显示键盘 | `boolean` | `false` |
| title | 键盘标题 | `string` | - |
| mode | 键盘模式 | `'default' \| 'custom' \| 'car'` | `'default'` |
| maxlength | 最大输入长度 | `number` | `Infinity` |
| z-index | 键盘层级 | `number` | `100` |
| show-delete-key | 是否显示删除键 | `boolean` | `true` |
| random-key-order | 是否随机排列按键顺序 | `boolean` | `false` |
| close-text | 完成按钮文本(default/car模式显示在标题栏右侧,custom模式显示在侧边栏) | `string` | - |
| delete-text | 删除按钮文本,不设置则显示删除图标 | `string` | - |
| close-button-loading | 完成按钮是否显示加载状态 | `boolean` | `false` |
| modal | 是否显示背景蒙层 | `boolean` | `false` |
| hide-on-click-outside | 点击键盘外部是否关闭 | `boolean` | `true` |
| lock-scroll | 是否锁定页面滚动 | `boolean` | `true` |
| safe-area-inset-bottom | 是否适配底部安全区域 | `boolean` | `true` |
| extra-key | 额外按键,default模式支持字符串,custom模式支持字符串数组 | `string \| string[]` | - |
| car-lang | 车牌键盘语言（受控模式），支持 v-model:car-lang | `'zh' \| 'en'` | - |
| auto-switch-lang | 车牌模式下是否自动切换语言：输入第一位后切到英文；删除到空后切回中文 | `boolean` | `true` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

> **车牌键盘文案变更**：切换按钮从 `'ABC'`/`'返回'` 调整为 `'ABC'`/`'省份'`，更直观地表示当前正在输入的内容类型。

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:visible | 键盘显示状态变化时触发 | `visible: boolean` |
| update:modelValue | 绑定值变化时触发 | `value: string` |
| update:carLang | 车牌键盘语言变化时触发（点击切换键或自动切换时） | `value: 'zh' \| 'en'` |
| input | 按键输入时触发 | `text: string` |
| delete | 点击删除键时触发 | - |
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
type KeyboardMode = 'default' | 'custom' | 'car'

/**
 * 按键类型
 * - '': 普通数字按键
 * - 'delete': 删除键
 * - 'extra': 额外功能键
 * - 'close': 关闭/完成键
 */
type KeyType = '' | 'delete' | 'extra' | 'close'

/**
 * 按键接口
 */
interface Key {
  /** 按键文本内容 */
  text?: number | string
  /** 按键类型 */
  type?: KeyType
  /** 是否占用2倍宽度 */
  wider?: boolean
}

/**
 * 键盘组件属性接口
 */
interface WdKeyboardProps {
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
 * 键盘组件事件接口
 */
interface WdKeyboardEmits {
  /** 更新显示状态 */
  'update:visible': [value: boolean]
  /** 输入时触发 */
  input: [text: string]
  /** 关闭时触发 */
  close: []
  /** 删除时触发 */
  delete: []
  /** 更新绑定值 */
  'update:modelValue': [value: string]
}
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-keyboard-background | 键盘背景色 | `#f2f3f5` |
| --wd-keyboard-title-height | 标题栏高度 | `88rpx` |
| --wd-keyboard-title-color | 标题颜色 | `#333333` |
| --wd-keyboard-title-font-size | 标题字号 | `28rpx` |
| --wd-keyboard-close-color | 关闭按钮颜色 | `#1989fa` |
| --wd-keyboard-close-font-size | 关闭按钮字号 | `28rpx` |
| --wd-keyboard-close-padding | 关闭按钮内边距 | `0 32rpx` |
| --wd-keyboard-key-height | 按键高度 | `96rpx` |
| --wd-keyboard-key-font-size | 按键字号 | `48rpx` |
| --wd-keyboard-key-background | 按键背景色 | `#ffffff` |
| --wd-keyboard-key-border-radius | 按键圆角 | `8rpx` |
| --wd-keyboard-key-active-color | 按键激活背景色 | `#ebedf0` |
| --wd-keyboard-delete-font-size | 删除键字号 | `28rpx` |
| --wd-keyboard-icon-size | 图标大小 | `44rpx` |
| --wd-keyboard-button-text-color | 完成按钮文字颜色 | `#ffffff` |
| --wd-keyboard-button-background | 完成按钮背景色 | `#1989fa` |
| --wd-keyboard-button-active-opacity | 完成按钮激活透明度 | `0.8` |

### 自定义主题示例

```vue
<template>
  <view class="custom-keyboard">
    <wd-keyboard v-model="value" :visible="show" @close="show = false" />
  </view>
</template>

<style lang="scss" scoped>
.custom-keyboard {
  // 深色键盘背景
  --wd-keyboard-background: #2c3e50;
  --wd-keyboard-key-background: #34495e;
  --wd-keyboard-key-active-color: #1a252f;
  --wd-keyboard-title-color: #ffffff;

  // 圆形按键
  --wd-keyboard-key-border-radius: 50%;
  --wd-keyboard-key-height: 100rpx;

  // 蓝色完成按钮
  --wd-keyboard-button-background: #3498db;
  --wd-keyboard-close-color: #3498db;
}
</style>
```

### 暗黑模式

组件内置暗黑模式样式,在页面添加 `wot-theme-dark` 类名即可启用:

```vue
<template>
  <view class="wot-theme-dark">
    <wd-keyboard v-model="value" :visible="show" @close="show = false" />
  </view>
</template>
```

## 最佳实践

### 1. 密码输入安全

对于密码输入场景,建议使用随机键盘:

```vue
<template>
  <wd-keyboard
    v-model="password"
    :visible="show"
    :maxlength="6"
    random-key-order
    modal
    :hide-on-click-outside="false"
    @close="show = false"
  />
</template>
```

**安全建议:**
- 使用 `random-key-order` 随机按键顺序
- 使用 `modal` 显示蒙层防止窥屏
- 设置 `:hide-on-click-outside="false"` 防止误关闭
- 配合密码掩码显示(圆点)使用

### 2. 金额输入格式化

金额输入时注意处理小数点:

```typescript
const handleAmountInput = (text: string, currentValue: string) => {
  // 已有小数点不允许再输入
  if (text === '.' && currentValue.includes('.')) return false

  // 小数位不超过2位
  if (currentValue.includes('.')) {
    const decLen = currentValue.split('.')[1].length
    if (decLen >= 2 && text !== '.') return false
  }

  // 不允许以多个0开头
  if (currentValue === '0' && text !== '.') return false

  return true
}
```

### 3. 表单联动

多个输入项使用同一个键盘时,通过状态管理切换:

```vue
<script lang="ts" setup>
type FieldType = 'phone' | 'code' | 'amount' | null

const currentField = ref<FieldType>(null)
const formData = reactive({
  phone: '',
  code: '',
  amount: ''
})

const openKeyboard = (field: FieldType) => {
  currentField.value = field
}
</script>
```

### 4. 输入完成自动关闭

达到最大长度时自动关闭并处理:

```vue
<script lang="ts" setup>
watch(value, (val) => {
  if (val.length >= maxlength) {
    show.value = false
    handleComplete(val)
  }
})
</script>
```

### 5. 车牌号验证

车牌号输入完成后进行格式验证:

```typescript
const validateCarNumber = (number: string) => {
  // 普通车牌: 省+字母+5位字母数字
  const normalReg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{5}$/

  // 新能源车牌: 省+字母+6位
  const newEnergyReg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][DF][A-HJ-NP-Z0-9]{5}$/

  return normalReg.test(number) || newEnergyReg.test(number)
}
```

## 常见问题

### 1. 键盘模式的区别?

| 模式 | 布局 | 特点 | 适用场景 |
|------|------|------|----------|
| `default` | 标准九宫格 | 左下角额外键,右下角删除键 | 普通数字输入 |
| `custom` | 左数字+右功能 | 右侧独立删除和完成按钮 | 金额、需要完成确认 |
| `car` | 10列网格 | 省份简称+字母数字切换 | 车牌号输入 |

### 2. 如何实现身份证输入?

设置 `extra-key="X"` 并将 `maxlength` 设为 18:

```vue
<wd-keyboard extra-key="X" :maxlength="18" />
```

### 3. 车牌号键盘不能输入数字?

车牌号键盘首位是省份简称,输入后会自动切换到字母数字键盘。也可以点击"ABC"按钮手动切换。

### 4. 为什么车牌键盘没有I和O?

根据中国车牌号规则,为避免与数字1和0混淆,车牌号中不使用字母I和O。

### 5. 如何禁止键盘关闭?

设置 `:hide-on-click-outside="false"` 并不显示关闭按钮:

```vue
<wd-keyboard
  :hide-on-click-outside="false"
  :close-text="''"
/>
```

### 6. 键盘遮挡输入框?

调整输入框位置或使用 `z-index` 调整层级:

```vue
<wd-keyboard :z-index="200" />
```

### 7. 如何自定义按键样式?

通过 CSS 变量覆盖默认样式:

```scss
.custom-keyboard {
  --wd-keyboard-key-height: 120rpx;
  --wd-keyboard-key-font-size: 56rpx;
  --wd-keyboard-key-background: #e8e8e8;
}
```

### 8. 键盘显示时页面可以滚动?

默认 `lock-scroll` 为 true 会锁定滚动。如需允许滚动:

```vue
<wd-keyboard :lock-scroll="false" />
```
