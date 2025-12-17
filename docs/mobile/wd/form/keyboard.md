---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/keyboard
---

# Keyboard 虚拟键盘

## 介绍

Keyboard 虚拟键盘组件用于输入数字、密码、身份证或车牌号等场景。支持多种键盘模式,可自定义按键布局和样式。

**核心特性:**

- **多种模式** - 支持默认、自定义、车牌号三种键盘模式
- **随机键盘** - 支持随机排列按键顺序
- **自定义按键** - 支持添加额外功能按键
- **车牌输入** - 内置车牌号省份简称和字母键盘

## 基本用法

### 默认键盘

```vue
<template>
  <wd-cell title="默认键盘" :value="value1" @click="showKeyboard1 = true" />
  <wd-keyboard
    v-model="value1"
    :visible="showKeyboard1"
    @close="showKeyboard1 = false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const showKeyboard1 = ref(false)
</script>
```

### 带标题键盘

通过 `title` 属性设置键盘标题。

```vue
<template>
  <wd-keyboard
    v-model="value"
    :visible="show"
    title="请输入密码"
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
  <wd-keyboard
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
  <!-- 单个额外按键 -->
  <wd-keyboard
    v-model="value"
    :visible="show"
    extra-key="."
    @close="show = false"
  />

  <!-- 两个额外按键(自定义模式) -->
  <wd-keyboard
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
  <wd-keyboard
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

### 车牌号键盘

设置 `mode="car"` 启用车牌号键盘。

```vue
<template>
  <wd-keyboard
    v-model="carNumber"
    :visible="show"
    mode="car"
    :maxlength="8"
    @close="show = false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const carNumber = ref('')
const show = ref(false)
</script>
```

### 随机键盘

设置 `random-key-order` 随机排列按键顺序。

```vue
<template>
  <wd-keyboard
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

### 最大长度

通过 `maxlength` 限制输入长度。

```vue
<template>
  <wd-keyboard
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
  <wd-keyboard
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

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `string` | - |
| visible | 是否显示 | `boolean` | `false` |
| title | 键盘标题 | `string` | - |
| mode | 键盘模式 | `'default' \| 'custom' \| 'car'` | `default` |
| maxlength | 最大输入长度 | `number` | `Infinity` |
| z-index | 键盘层级 | `number` | `100` |
| show-delete-key | 是否显示删除键 | `boolean` | `true` |
| random-key-order | 是否随机排列按键 | `boolean` | `false` |
| close-text | 完成按钮文本 | `string` | - |
| delete-text | 删除按钮文本 | `string` | - |
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
type KeyboardMode = 'default' | 'custom' | 'car'
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

## 最佳实践

### 1. 密码输入

```vue
<template>
  <view class="password-input">
    <view class="password-box">
      <view v-for="i in 6" :key="i" class="password-item">
        <text v-if="password.length >= i">●</text>
      </view>
    </view>
    <wd-keyboard
      v-model="password"
      :visible="show"
      :maxlength="6"
      random-key-order
      @close="show = false"
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
    console.log('密码:', val)
  }
})
</script>
```

### 2. 金额输入

```vue
<template>
  <wd-keyboard
    v-model="amount"
    :visible="show"
    mode="custom"
    :extra-key="['.', '00']"
    close-text="确定"
    @close="handleClose"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const amount = ref('')
const show = ref(false)

const handleClose = () => {
  show.value = false
  console.log('金额:', amount.value)
}
</script>
```

### 3. 车牌号输入

```vue
<template>
  <view class="car-input">
    <view class="car-number">
      <view v-for="(char, index) in 8" :key="index" class="car-char">
        {{ carNumber[index] || '' }}
      </view>
    </view>
    <wd-keyboard
      v-model="carNumber"
      :visible="show"
      mode="car"
      :maxlength="8"
      @close="show = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const carNumber = ref('')
const show = ref(true)
</script>
```

## 常见问题

### 1. 键盘模式区别?

- `default`: 标准数字键盘,左下角为额外按键,右下角为删除键
- `custom`: 自定义模式,右侧显示删除键和完成键
- `car`: 车牌号键盘,包含省份简称和字母数字切换

### 2. 如何实现身份证输入?

设置 `extra-key="X"` 并将 `maxlength` 设为 18。

### 3. 车牌号键盘不能输入数字?

车牌号键盘首位是省份简称,输入后会自动切换到字母数字键盘。
