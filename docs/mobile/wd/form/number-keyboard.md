---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/numberKeyboard
---

# NumberKeyboard 数字键盘

## 介绍

NumberKeyboard 数字键盘是专门用于数字输入的虚拟键盘组件,适用于支付密码、验证码、金额输入等场景。相比 Keyboard 组件,NumberKeyboard 更专注于数字输入场景。

**核心特性:**

- **数字专用** - 专为数字输入设计
- **双模式** - 支持默认模式和自定义模式
- **随机键盘** - 支持随机排列按键顺序
- **自定义按键** - 支持配置额外功能按键

## 基本用法

### 默认键盘

```vue
<template>
  <wd-cell title="数字键盘" :value="value" @click="show = true" />
  <wd-number-keyboard
    v-model="value"
    :visible="show"
    @close="show = false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
</script>
```

### 带标题键盘

通过 `title` 属性设置键盘标题。

```vue
<template>
  <wd-number-keyboard
    v-model="value"
    :visible="show"
    title="请输入支付密码"
    @close="show = false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
</script>
```

### 自定义模式

设置 `mode="custom"` 启用自定义模式,右侧会显示删除键和完成键。

```vue
<template>
  <wd-number-keyboard
    v-model="value"
    :visible="show"
    mode="custom"
    close-text="完成"
    @close="show = false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
</script>
```

### 额外按键

通过 `extra-key` 属性配置额外按键。

```vue
<template>
  <!-- 单个额外按键(小数点) -->
  <wd-number-keyboard
    v-model="value"
    :visible="show"
    extra-key="."
    @close="show = false"
  />

  <!-- 两个额外按键(自定义模式) -->
  <wd-number-keyboard
    v-model="value"
    :visible="show"
    mode="custom"
    :extra-key="['00', '.']"
    @close="show = false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
</script>
```

### 身份证键盘

配置 `extra-key="X"` 实现身份证号输入。

```vue
<template>
  <wd-number-keyboard
    v-model="idCard"
    :visible="show"
    extra-key="X"
    :maxlength="18"
    @close="show = false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const idCard = ref('')
const show = ref(false)
</script>
```

### 随机键盘

设置 `random-key-order` 随机排列按键顺序,增强安全性。

```vue
<template>
  <wd-number-keyboard
    v-model="value"
    :visible="show"
    random-key-order
    @close="show = false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
</script>
```

### 最大长度限制

通过 `maxlength` 限制输入长度。

```vue
<template>
  <wd-number-keyboard
    v-model="code"
    :visible="show"
    :maxlength="6"
    @close="show = false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const code = ref('')
const show = ref(false)
</script>
```

### 显示蒙层

设置 `modal` 显示背景蒙层。

```vue
<template>
  <wd-number-keyboard
    v-model="value"
    :visible="show"
    modal
    @close="show = false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
</script>
```

### 完成按钮加载状态

设置 `close-button-loading` 显示完成按钮的加载状态。

```vue
<template>
  <wd-number-keyboard
    v-model="value"
    :visible="show"
    mode="custom"
    close-text="确定"
    :close-button-loading="loading"
    @close="handleClose"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const show = ref(false)
const loading = ref(false)

const handleClose = async () => {
  loading.value = true
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 1000))
  loading.value = false
  show.value = false
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `string` | - |
| visible | 是否显示 | `boolean` | `false` |
| title | 键盘标题 | `string` | - |
| mode | 键盘模式 | `'default' \| 'custom'` | `default` |
| maxlength | 最大输入长度 | `number` | `Infinity` |
| z-index | 键盘层级 | `number` | `100` |
| show-delete-key | 是否显示删除键 | `boolean` | `true` |
| random-key-order | 是否随机排列按键 | `boolean` | `false` |
| close-text | 完成按钮文本 | `string` | `完成` |
| delete-text | 删除按钮文本 | `string` | `删除` |
| close-button-loading | 完成按钮加载状态 | `boolean` | `false` |
| modal | 是否显示蒙层 | `boolean` | `false` |
| hide-on-click-outside | 点击外部是否关闭 | `boolean` | `true` |
| lock-scroll | 是否锁定滚动 | `boolean` | `true` |
| safe-area-inset-bottom | 是否适配底部安全区域 | `boolean` | `true` |
| extra-key | 额外按键 | `string \| string[]` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| input | 按键输入时触发 | `text: string` |
| delete | 删除按键时触发 | - |
| close | 关闭键盘时触发 | - |

### Slots

| 名称 | 说明 |
|------|------|
| title | 自定义标题区域 |

### 类型定义

```typescript
/**
 * 键盘模式
 */
type KeyboardMode = 'default' | 'custom'
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-number-keyboard-background | 键盘背景色 | `#f2f3f5` |
| --wd-number-keyboard-title-height | 标题栏高度 | `88rpx` |
| --wd-number-keyboard-title-color | 标题颜色 | `#333333` |
| --wd-number-keyboard-title-font-size | 标题字号 | `28rpx` |
| --wd-number-keyboard-close-color | 关闭按钮颜色 | `#1989fa` |
| --wd-number-keyboard-close-font-size | 关闭按钮字号 | `28rpx` |

## 最佳实践

### 1. 支付密码输入

```vue
<template>
  <view class="payment">
    <view class="password-dots">
      <view v-for="i in 6" :key="i" class="dot" :class="{ filled: password.length >= i }" />
    </view>
    <wd-number-keyboard
      v-model="password"
      :visible="true"
      :maxlength="6"
      random-key-order
      @close="handlePay"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const password = ref('')

watch(password, (val) => {
  if (val.length === 6) {
    handlePay()
  }
})

const handlePay = () => {
  if (password.value.length === 6) {
    console.log('提交支付密码:', password.value)
  }
}
</script>

<style lang="scss" scoped>
.password-dots {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  padding: 48rpx;
}
.dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  &.filled {
    background: #333;
  }
}
</style>
```

### 2. 金额输入

```vue
<template>
  <view class="amount-input">
    <text class="currency">¥</text>
    <text class="amount">{{ amount || '0.00' }}</text>
  </view>
  <wd-number-keyboard
    v-model="amount"
    :visible="show"
    mode="custom"
    :extra-key="['.']"
    close-text="确定"
    @close="handleConfirm"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const amount = ref('')
const show = ref(true)

const handleConfirm = () => {
  console.log('金额:', parseFloat(amount.value) || 0)
}
</script>
```

### 3. 验证码输入

```vue
<template>
  <view class="code-input">
    <view v-for="i in 4" :key="i" class="code-item">
      {{ code[i - 1] || '' }}
    </view>
  </view>
  <wd-number-keyboard
    v-model="code"
    :visible="true"
    :maxlength="4"
  />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const code = ref('')

watch(code, (val) => {
  if (val.length === 4) {
    console.log('验证码:', val)
  }
})
</script>
```

## 常见问题

### 1. NumberKeyboard 和 Keyboard 的区别?

- NumberKeyboard: 专为数字输入设计,只支持 default 和 custom 模式
- Keyboard: 功能更全面,额外支持车牌号输入模式(car)

### 2. 如何清空输入值?

直接将 v-model 绑定的值设为空字符串:

```typescript
value.value = ''
```

### 3. 随机键盘顺序什么时候会改变?

每次键盘显示时,按键顺序都会重新随机排列。
