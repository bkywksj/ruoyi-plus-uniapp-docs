# InputNumber 计数器

## 介绍

InputNumber 计数器组件是一个专业的数字输入控件,由减号按钮、输入框和加号按钮组成,用于在特定范围内通过点击按钮或直接输入的方式调整数字值。该组件广泛应用于商品数量选择、参数调节、数值配置等场景,提供了精确、便捷的数字输入体验。

组件采用 Vue 3 Composition API 和 TypeScript 构建,具有完善的类型定义和严格的数值校验机制。支持整数和小数输入,可配置步进值、精度、最小/最大值等参数,确保输入值始终符合业务规则。组件还提供了丰富的交互功能,如长按连续调节、实时/失焦更新、禁用控制等,满足各种复杂场景需求。

**核心特性:**

- **双重输入方式** - 支持点击加减按钮调节和键盘直接输入两种方式,灵活适应不同使用场景
- **精确步进控制** - 通过 `step` 和 `stepStrictly` 属性精确控制数值递增/递减的步进值和严格步进模式
- **精度管理** - 支持通过 `precision` 属性设置小数位数,自动处理浮点数精度问题,确保计算准确
- **范围限制** - 通过 `min` 和 `max` 属性限制数值范围,自动禁用超出范围的加减按钮,防止无效操作
- **灵活禁用控制** - 提供整体禁用(`disabled`)、输入框禁用(`disableInput`)、减号禁用(`disableMinus`)、加号禁用(`disablePlus`)四种独立禁用控制
- **长按连续调节** - 开启 `longPress` 后支持长按加减按钮快速连续调节数值,提升大幅度调整效率
- **空值支持** - 通过 `allowNull` 属性允许输入框为空,适配非必填数字输入场景
- **表单集成** - 完整支持 `wd-form` 表单验证、错误提示、标签显示等功能,无缝融入表单体系
- **自定义样式** - 支持自定义输入框宽度、前后置图标、标签配置,满足各种 UI 设计需求
- **值变化拦截** - 提供 `beforeChange` 钩子函数,支持在值变化前执行自定义验证或异步操作

参考: src/wd/components/wd-input-number/wd-input-number.vue:1-112

## 基本用法

### 基础计数器

最简单的用法,默认最小值为 1,步进值为 1。

```vue
<template>
  <view class="demo">
    <wd-input-number v-model="value1" />
    <view class="result">当前值: {{ value1 }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(1)
</script>

```

**使用说明:**
- 组件默认 `min` 为 1,`max` 为 `Number.MAX_SAFE_INTEGER`,`step` 为 1
- 点击减号按钮数值递减,点击加号按钮数值递增
- 当数值达到最小值时减号按钮自动禁用,达到最大值时加号按钮自动禁用
- 可直接在输入框中键入数字,失焦时自动校正到有效范围

参考: src/wd/components/wd-input-number/wd-input-number.vue:229-257

### 设置范围和步进

通过 `min`、`max` 和 `step` 属性设置数值范围和步进值。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">范围 0-10,步进 2:</view>
      <wd-input-number
        v-model="value2"
        :min="0"
        :max="10"
        :step="2"
      />
    </view>

    <view class="demo-item">
      <view class="label">范围 -5 到 5,步进 0.5:</view>
      <wd-input-number
        v-model="value3"
        :min="-5"
        :max="5"
        :step="0.5"
        :precision="1"
      />
    </view>

    <view class="demo-item">
      <view class="label">严格步进模式:</view>
      <wd-input-number
        v-model="value4"
        :min="0"
        :max="100"
        :step="10"
        :step-strictly
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value2 = ref(0)
const value3 = ref(0)
const value4 = ref(0)
</script>

```

**使用说明:**
- `min` 和 `max` 定义数值的有效范围,输入框失焦时自动修正超出范围的值
- `step` 定义每次点击加减按钮的变化量,可以是整数或小数
- `step-strictly` 开启严格步进模式后,输入的值会自动修正为步进值的整数倍
- 严格步进模式下会计算最接近的合法值,确保值始终符合 `min + n * step` 的规则

参考: src/wd/components/wd-input-number/wd-input-number.vue:136-143

### 精度控制

使用 `precision` 属性控制数值的小数位数。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">整数(precision=0):</view>
      <wd-input-number
        v-model="value5"
        :precision="0"
        :min="0"
        :max="100"
      />
    </view>

    <view class="demo-item">
      <view class="label">保留1位小数:</view>
      <wd-input-number
        v-model="value6"
        :precision="1"
        :min="0"
        :max="10"
        :step="0.1"
      />
    </view>

    <view class="demo-item">
      <view class="label">保留2位小数:</view>
      <wd-input-number
        v-model="value7"
        :precision="2"
        :min="0"
        :max="1"
        :step="0.01"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value5 = ref(1)
const value6 = ref(0.0)
const value7 = ref(0.00)
</script>

```

**技术实现:**
- `precision` 值为 0 时只允许整数,值为 1 保留1位小数,以此类推
- 组件内部使用 `formatToPrecision` 函数处理精度,通过 `Math.round` 避免浮点数精度问题
- 输入过程中允许输入中间状态(如 `1.`,`.5`),失焦时自动格式化为指定精度
- 精度设置会影响显示格式,`precision=2` 时值为 1 会显示为 `1.00`

参考: src/wd/components/wd-input-number/wd-input-number.vue:293-296

### 禁用状态

通过多种禁用属性灵活控制组件的交互行为。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">完全禁用:</view>
      <wd-input-number
        v-model="value8"
        disabled
      />
    </view>

    <view class="demo-item">
      <view class="label">仅禁用输入框:</view>
      <wd-input-number
        v-model="value9"
        disable-input
      />
    </view>

    <view class="demo-item">
      <view class="label">禁用减号按钮:</view>
      <wd-input-number
        v-model="value10"
        disable-minus
      />
    </view>

    <view class="demo-item">
      <view class="label">禁用加号按钮:</view>
      <wd-input-number
        v-model="value11"
        disable-plus
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value8 = ref(5)
const value9 = ref(5)
const value10 = ref(5)
const value11 = ref(5)
</script>

```

**使用说明:**
- `disabled` 完全禁用组件,加减按钮和输入框都无法操作
- `disable-input` 仅禁用输入框的键盘输入,但加减按钮仍然可用
- `disable-minus` 仅禁用减号按钮,输入框和加号按钮仍可用
- `disable-plus` 仅禁用加号按钮,输入框和减号按钮仍可用
- 这些属性可以组合使用,实现精细的权限控制

参考: src/wd/components/wd-input-number/wd-input-number.vue:146-153

### 隐藏输入框

使用 `without-input` 属性隐藏中间的输入框,仅保留加减按钮。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">隐藏输入框:</view>
      <wd-input-number
        v-model="value12"
        without-input
        :min="0"
        :max="10"
      />
      <view class="result">当前值: {{ value12 }}</view>
    </view>

    <view class="demo-item">
      <view class="label">隐藏输入框 + 长按:</view>
      <wd-input-number
        v-model="value13"
        without-input
        long-press
        :min="0"
        :max="100"
      />
      <view class="result">当前值: {{ value13 }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value12 = ref(5)
const value13 = ref(0)
</script>

```

**使用说明:**
- `without-input` 适用于不需要直接输入,只需通过按钮调节的场景
- 隐藏输入框后,值的变化只能通过加减按钮进行
- 建议与 `long-press` 属性配合使用,提供长按连续调节功能,提升操作效率
- 此模式下组件宽度会自动调整,只显示两个按钮

参考: src/wd/components/wd-input-number/wd-input-number.vue:154-155

### 长按连续调节

开启 `long-press` 属性后,长按加减按钮可快速连续调节数值。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">长按快速调节:</view>
      <wd-input-number
        v-model="value14"
        long-press
        :min="0"
        :max="1000"
        :step="10"
      />
    </view>

    <view class="demo-item">
      <view class="label">长按 + 大步进:</view>
      <wd-input-number
        v-model="value15"
        long-press
        :min="0"
        :max="10000"
        :step="100"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value14 = ref(0)
const value15 = ref(0)
</script>

```

**技术实现:**
- 长按触发时间为 600ms,即长按 600ms 后开始连续调节
- 连续调节的间隔时间为 250ms,即每 250ms 触发一次加减操作
- 手指离开或滑出按钮区域时停止连续调节
- 长按功能通过 `handleTouchStart` 和 `handleTouchEnd` 事件配合定时器实现

参考: src/wd/components/wd-input-number/wd-input-number.vue:669-685

### 允许空值

使用 `allow-null` 属性允许输入框为空,适用于非必填数字输入场景。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">允许空值:</view>
      <wd-input-number
        v-model="value16"
        allow-null
        placeholder="请输入数字"
        :min="0"
        :max="100"
      />
      <view class="result">当前值: {{ value16 === '' ? '空' : value16 }}</view>
    </view>

    <view class="demo-item">
      <view class="label">不允许空值(默认):</view>
      <wd-input-number
        v-model="value17"
        placeholder="请输入数字"
        :min="0"
        :max="100"
      />
      <view class="result">当前值: {{ value17 }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value16 = ref<string | number>('')
const value17 = ref(0)
</script>

```

**使用说明:**
- `allow-null` 为 `true` 时,清空输入框后 `v-model` 的值为空字符串 `''`
- `allow-null` 为 `false`(默认)时,清空输入框失焦后会自动填充 `min` 值
- 允许空值模式下,需确保业务逻辑能正确处理空字符串值
- 可配合 `placeholder` 属性提示用户输入

参考: src/wd/components/wd-input-number/wd-input-number.vue:159-160

## 高级用法

### 表单集成

InputNumber 组件完整支持 `wd-form` 表单系统,包括标签、验证、错误提示等功能。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-input-number
        v-model="formData.quantity"
        label="商品数量"
        prop="quantity"
        required
        :min="1"
        :max="999"
        :rules="[{ required: true, message: '请输入商品数量' }]"
      />

      <wd-input-number
        v-model="formData.price"
        label="商品单价"
        prop="price"
        required
        :min="0"
        :precision="2"
        :step="0.01"
        :rules="[
          { required: true, message: '请输入商品单价' },
          {
            validator: (value: number) => value > 0,
            message: '单价必须大于0'
          }
        ]"
      />

      <wd-input-number
        v-model="formData.discount"
        label="折扣率"
        label-width="120"
        prop="discount"
        :min="0"
        :max="1"
        :precision="2"
        :step="0.01"
      />

      <wd-input-number
        v-model="formData.stock"
        label="库存数量"
        prop="stock"
        center
        :min="0"
        :max="99999"
      />
    </wd-form>

    <view class="button-group">
      <wd-button type="primary" @click="handleSubmit">提交</wd-button>
      <wd-button @click="handleReset">重置</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd/components/wd-form/wd-form.vue'

const formRef = ref<FormInstance>()

const formData = ref({
  quantity: 1,
  price: 0,
  discount: 0.95,
  stock: 100
})

const rules = {
  quantity: [
    { required: true, message: '请输入商品数量' }
  ],
  price: [
    { required: true, message: '请输入商品单价' }
  ]
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('表单数据:', formData.value)
    uni.showToast({ title: '提交成功', icon: 'success' })
  }
}

const handleReset = () => {
  formRef.value?.reset()
}
</script>

```

**使用说明:**
- 组件会自动继承 `wd-form` 的 `label-width` 配置,也可单独设置
- 通过 `prop` 属性关联表单字段,实现自动验证
- `required` 属性在标签前显示红色星号必填标记
- `center` 属性使标签和输入器垂直居中对齐
- 验证失败时在组件下方显示错误提示信息

参考: src/wd/components/wd-input-number/wd-input-number.vue:175-196

### 自定义图标

使用 `prefix-icon`、`suffix-icon` 属性或插槽自定义前后置图标。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">前置图标:</view>
      <wd-input-number
        v-model="value18"
        label="数量"
        prefix-icon="cart-add"
        :min="0"
        :max="99"
      />
    </view>

    <view class="demo-item">
      <view class="label">后置图标:</view>
      <wd-input-number
        v-model="value19"
        label="金额"
        suffix-icon="gold-coin-fill"
        :min="0"
        :precision="2"
      />
    </view>

    <view class="demo-item">
      <view class="label">图标事件:</view>
      <wd-input-number
        v-model="value20"
        label="库存"
        suffix-icon="warning-fill"
        @clicksuffixicon="handleIconClick"
        :min="0"
      />
    </view>

    <view class="demo-item">
      <view class="label">插槽自定义:</view>
      <wd-input-number
        v-model="value21"
        label="温度"
        :min="-50"
        :max="50"
        :precision="1"
      >
        <template #suffix>
          <text style="font-size: 28rpx; color: #999;">℃</text>
        </template>
      </wd-input-number>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value18 = ref(1)
const value19 = ref(100.00)
const value20 = ref(10)
const value21 = ref(25.0)

const handleIconClick = () => {
  uni.showToast({ title: '库存不足', icon: 'none' })
}
</script>

```

**使用说明:**
- `prefix-icon` 和 `suffix-icon` 支持所有 `wd-icon` 图标名称
- 点击图标会触发 `clickprefixicon` 或 `clicksuffixicon` 事件
- 使用 `prefix`/`suffix` 插槽可自定义更复杂的内容
- 当有 `label` 时,`prefix-icon` 显示在标签内部;无 `label` 时显示在输入器前方

参考: src/wd/components/wd-input-number/wd-input-number.vue:11-36

### 值变化拦截

使用 `before-change` 钩子在值变化前执行验证或异步操作。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">同步验证:</view>
      <wd-input-number
        v-model="value22"
        :min="0"
        :max="100"
        :before-change="handleSyncValidate"
      />
      <view class="tip">只允许输入偶数</view>
    </view>

    <view class="demo-item">
      <view class="label">异步验证:</view>
      <wd-input-number
        v-model="value23"
        :min="0"
        :max="100"
        :before-change="handleAsyncValidate"
      />
      <view class="tip">模拟异步校验(延迟1秒)</view>
    </view>

    <view class="demo-item">
      <view class="label">确认提示:</view>
      <wd-input-number
        v-model="value24"
        :min="0"
        :max="1000"
        :before-change="handleConfirm"
      />
      <view class="tip">超过100时需要确认</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value22 = ref(0)
const value23 = ref(0)
const value24 = ref(0)

// 同步验证:只允许偶数
const handleSyncValidate = (value: number | string): boolean => {
  const num = Number(value)
  if (num % 2 !== 0) {
    uni.showToast({ title: '只允许输入偶数', icon: 'none' })
    return false
  }
  return true
}

// 异步验证
const handleAsyncValidate = (value: number | string): Promise<boolean> => {
  return new Promise((resolve) => {
    uni.showLoading({ title: '验证中...' })
    setTimeout(() => {
      uni.hideLoading()
      const num = Number(value)
      if (num > 50) {
        uni.showToast({ title: '值不能超过50', icon: 'none' })
        resolve(false)
      } else {
        resolve(true)
      }
    }, 1000)
  })
}

// 确认提示
const handleConfirm = (value: number | string): Promise<boolean> => {
  const num = Number(value)
  if (num > 100) {
    return new Promise((resolve) => {
      uni.showModal({
        title: '提示',
        content: `确定要设置为 ${num} 吗?`,
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  }
  return Promise.resolve(true)
}
</script>

```

**技术实现:**
- `beforeChange` 可以返回 `boolean` 或 `Promise<boolean>`
- 返回 `false` 或 Promise resolve `false` 时阻止值变化
- 返回 `true` 或 Promise resolve `true` 时允许值变化
- 组件内部使用 `callInterceptor` 工具函数统一处理同步和异步拦截

参考: src/wd/components/wd-input-number/wd-input-number.vue:553-571

### 实时/失焦更新

通过 `immediate-change` 属性控制值的更新时机。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">实时更新(默认):</view>
      <wd-input-number
        v-model="value25"
        :min="0"
        :max="100"
        :immediate-change="true"
        @change="handleChange1"
      />
      <view class="result">值: {{ value25 }}, 变化次数: {{ count1 }}</view>
    </view>

    <view class="demo-item">
      <view class="label">失焦更新:</view>
      <wd-input-number
        v-model="value26"
        :min="0"
        :max="100"
        :immediate-change="false"
        @change="handleChange2"
        @blur="handleBlur"
      />
      <view class="result">值: {{ value26 }}, 变化次数: {{ count2 }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value25 = ref(0)
const value26 = ref(0)
const count1 = ref(0)
const count2 = ref(0)

const handleChange1 = () => {
  count1.value++
}

const handleChange2 = () => {
  count2.value++
}

const handleBlur = () => {
  console.log('失焦,值为:', value26.value)
}
</script>

```

**使用说明:**
- `immediate-change` 默认为 `true`,输入框每次输入都会触发 `change` 事件
- 设置为 `false` 时,只在失焦时触发一次 `change` 事件
- 失焦更新模式适合需要减少事件触发频率或进行复杂计算的场景
- 无论哪种模式,点击加减按钮都会立即触发 `change` 事件

参考: src/wd/components/wd-input-number/wd-input-number.vue:168-169

### 初始值修正

通过 `update-on-init` 属性控制是否在初始化时自动修正 `v-model` 值。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">自动修正初始值(默认):</view>
      <wd-input-number
        v-model="value27"
        :min="0"
        :max="100"
        :step="10"
        :step-strictly="true"
        :update-on-init="true"
      />
      <view class="tip">初始值13会自动修正为10</view>
    </view>

    <view class="demo-item">
      <view class="label">不修正初始值:</view>
      <wd-input-number
        v-model="value28"
        :min="0"
        :max="100"
        :step="10"
        :step-strictly="true"
        :update-on-init="false"
      />
      <view class="tip">初始值13保持不变,失焦后修正</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value27 = ref(13)
const value28 = ref(13)
</script>

```

**技术实现:**
- `update-on-init` 默认为 `true`,组件初始化时会调用 `formatDisplayValue` 修正值
- 修正规则包括:步进值对齐、范围限制、精度格式化
- 设置为 `false` 时,初始值保持原样,只在用户交互时才修正
- 适用于从服务端获取数据,不希望初始渲染时改变值的场景

参考: src/wd/components/wd-input-number/wd-input-number.vue:438-451

### 自定义输入框宽度

使用 `input-width` 属性自定义输入框的宽度。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">默认宽度(120rpx):</view>
      <wd-input-number v-model="value29" />
    </view>

    <view class="demo-item">
      <view class="label">宽度160rpx:</view>
      <wd-input-number
        v-model="value30"
        :input-width="160"
        :precision="2"
      />
    </view>

    <view class="demo-item">
      <view class="label">宽度200rpx:</view>
      <wd-input-number
        v-model="value31"
        :input-width="200"
        :precision="4"
      />
    </view>

    <view class="demo-item">
      <view class="label">最小宽度80rpx:</view>
      <wd-input-number
        v-model="value32"
        :input-width="80"
        :min="0"
        :max="99"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value29 = ref(100)
const value30 = ref(99.99)
const value31 = ref(3.1416)
const value32 = ref(1)
</script>

```

**使用说明:**
- `input-width` 默认值为 120rpx,可根据数值长度调整
- 值可以是数字(单位 rpx)或字符串(如 `'160rpx'`)
- 建议根据精度和数值范围合理设置宽度,避免显示不完整
- 过窄的宽度可能导致数字显示不全,过宽则浪费空间

参考: src/wd/components/wd-input-number/wd-input-number.vue:156-157

### 输入类型

通过 `input-type` 属性控制输入框的键盘类型。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">数字键盘(digit,默认):</view>
      <wd-input-number
        v-model="value33"
        input-type="digit"
        :min="0"
        :precision="0"
      />
      <view class="tip">纯数字键盘,不支持负号和小数点</view>
    </view>

    <view class="demo-item">
      <view class="label">数字键盘(number):</view>
      <wd-input-number
        v-model="value34"
        input-type="number"
        :min="-100"
        :max="100"
        :precision="2"
      />
      <view class="tip">带负号和小数点的数字键盘</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value33 = ref(0)
const value34 = ref(0.00)
</script>

```

**使用说明:**
- `input-type` 默认为 `'digit'`,调起纯数字键盘,适合整数输入
- 设置为 `'number'` 时,调起带负号和小数点的数字键盘,适合小数输入
- 组件会根据 `precision` 自动设置 `input-mode` 为 `'numeric'` 或 `'decimal'`
- 键盘类型影响移动端输入体验,建议根据实际需求选择

参考: src/wd/components/wd-input-number/wd-input-number.vue:52-64

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `number \| string` | - |
| min | 最小值 | `number` | `1` |
| max | 最大值 | `number` | `Number.MAX_SAFE_INTEGER` |
| step | 步进值 | `number` | `1` |
| step-strictly | 是否严格按照步进值递增或递减 | `boolean` | `false` |
| precision | 数值精度(小数位数) | `number \| string` | `0` |
| disabled | 是否完全禁用 | `boolean` | `false` |
| disable-input | 是否禁用输入框 | `boolean` | `false` |
| disable-minus | 是否禁用减号按钮 | `boolean` | `false` |
| disable-plus | 是否禁用加号按钮 | `boolean` | `false` |
| without-input | 是否不显示输入框 | `boolean` | `false` |
| input-width | 输入框宽度 | `number \| string` | `120` |
| allow-null | 是否允许输入框为空 | `boolean` | `false` |
| placeholder | 输入框占位符 | `string` | `''` |
| adjust-position | 键盘弹起时是否自动上推页面 | `boolean` | `true` |
| before-change | 输入值变化前的回调函数 | `InputNumberBeforeChange` | - |
| long-press | 是否开启长按加减手势 | `boolean` | `false` |
| immediate-change | 是否立即响应输入变化 | `boolean` | `true` |
| update-on-init | 是否在初始化时更新 v-model 为修正后的值 | `boolean` | `true` |
| input-type | 输入框类型 | `'number' \| 'digit'` | `'digit'` |
| label | 设置左侧标题 | `string` | - |
| label-width | 设置左侧标题宽度 | `number \| string` | - |
| prefix-icon | 前置图标 | `string` | - |
| suffix-icon | 后置图标 | `string` | - |
| center | 当有label属性时,设置标题和输入框垂直居中 | `boolean` | `false` |
| required | 是否必填 | `boolean` | `false` |
| prop | 表单域 model 字段名,用于表单验证 | `string` | - |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| error | 设置输入框错误状态 | `boolean` | `false` |
| no-border | 非 cell 类型下是否隐藏下划线 | `boolean` | `true` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-label-class | 自定义标签样式类 | `string` | `''` |

参考: src/wd/components/wd-input-number/wd-input-number.vue:126-196

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | v-model 值变化时触发 | `value: number \| string` |
| change | 数值变化时触发 | `{ value: number \| string }` |
| focus | 输入框聚焦时触发 | `detail: any` |
| blur | 输入框失焦时触发 | `{ value: number \| string }` |
| clickprefixicon | 点击前置图标时触发 | - |
| clicksuffixicon | 点击后置图标时触发 | - |

参考: src/wd/components/wd-input-number/wd-input-number.vue:199-214

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| label | 自定义标签内容 | - |
| prefix | 自定义前置内容 | - |
| suffix | 自定义后置内容 | - |

参考: src/wd/components/wd-input-number/wd-input-number.vue:218-227

### 类型定义

```typescript
/**
 * 输入框值变化前的回调函数类型定义
 */
export type InputNumberBeforeChange = (value: number | string) => boolean | Promise<boolean>

/**
 * 操作类型
 */
type OperationType = 'add' | 'sub'

/**
 * 计数器组件属性接口
 */
interface WdInputNumberProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 自定义标签样式类 */
  customLabelClass?: string

  /** 绑定值 */
  modelValue: string | number
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步进值 */
  step?: number
  /** 是否严格按照步进值递增或递减 */
  stepStrictly?: boolean
  /** 数值精度 */
  precision?: string | number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否禁用输入框 */
  disableInput?: boolean
  /** 是否禁用减号按钮 */
  disableMinus?: boolean
  /** 是否禁用加号按钮 */
  disablePlus?: boolean
  /** 是否不显示输入框 */
  withoutInput?: boolean
  /** 输入框宽度(rpx) */
  inputWidth?: string | number
  /** 是否允许为空 */
  allowNull?: boolean
  /** 输入框占位符 */
  placeholder?: string
  /** 键盘弹起时,是否自动上推页面 */
  adjustPosition?: boolean
  /** 输入值变化前的回调函数 */
  beforeChange?: InputNumberBeforeChange
  /** 是否开启长按加减手势 */
  longPress?: boolean
  /** 是否立即响应输入变化 */
  immediateChange?: boolean
  /** 是否在初始化时更新 v-model 为修正后的值 */
  updateOnInit?: boolean
  /** 输入框类型 */
  inputType?: 'number' | 'digit'

  // 表单相关属性
  /** 设置左侧标题 */
  label?: string
  /** 设置左侧标题宽度(rpx) */
  labelWidth?: string | number
  /** 前置图标 */
  prefixIcon?: string
  /** 后置图标 */
  suffixIcon?: string
  /** 当有label属性时,设置标题和输入框垂直居中 */
  center?: boolean
  /** 是否必填 */
  required?: boolean
  /** 表单域 model 字段名 */
  prop?: string
  /** 表单验证规则 */
  rules?: FormItemRule[]
  /** 设置输入框错误状态 */
  error?: boolean
  /** 非 cell 类型下是否隐藏下划线 */
  noBorder?: boolean
}

/**
 * 计数器组件事件接口
 */
interface WdInputNumberEmits {
  /** 数值变化事件 */
  change: [value: { value: number | string }]
  /** 输入框聚焦事件 */
  focus: [detail: any]
  /** 输入框失焦事件 */
  blur: [value: { value: string | number }]
  /** v-model 更新事件 */
  'update:modelValue': [value: number | string]
  /** 点击后置图标 */
  clicksuffixicon: []
  /** 点击前置图标 */
  clickprefixicon: []
}

/**
 * 计数器组件插槽接口
 */
interface WdInputNumberSlots extends Slots {
  /** 前置插槽 */
  prefix?: () => any
  /** 后置插槽 */
  suffix?: () => any
  /** 标签插槽 */
  label?: () => any
}
```

参考: src/wd/components/wd-input-number/wd-input-number.vue:113-227

## 主题定制

InputNumber 组件提供了丰富的 CSS 变量用于主题定制,支持浅色和深色两种主题模式。

### CSS 变量

```scss
// 计数器组件变量
$-input-number-height: 56rpx;                    // 组件高度
$-input-number-btn-width: 56rpx;                 // 加减按钮宽度
$-input-number-input-width: 120rpx;              // 输入框宽度
$-input-number-border-color: #dcdfe6;            // 边框颜色
$-input-number-radius: 4rpx;                     // 圆角大小
$-input-number-color: #262626;                   // 文字颜色
$-input-number-fs: 28rpx;                        // 文字大小
$-input-number-icon-color: #262626;              // 图标颜色
$-input-number-icon-size: 36rpx;                 // 图标大小
$-input-number-disabled-color: rgba(0, 0, 0, 0.25); // 禁用状态颜色

// 深色主题变量
$-dark-background2: #1a1a1a;                     // 深色背景
$-dark-color: #ffffff;                            // 深色文字
$-dark-color-gray: #666666;                       // 深色灰色文字
$-dark-border-color: #333333;                     // 深色边框
```

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-input-number
      v-model="value"
      custom-class="custom-input-number"
      :min="0"
      :max="100"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(1)
</script>

<style lang="scss">
.custom-input-number {
  // 自定义颜色
  --wot-input-number-border-color: #ff6b6b;
  --wot-input-number-color: #4a90e2;
  --wot-input-number-icon-color: #ff6b6b;

  // 自定义尺寸
  --wot-input-number-height: 64rpx;
  --wot-input-number-btn-width: 64rpx;
  --wot-input-number-input-width: 160rpx;
  --wot-input-number-fs: 32rpx;
  --wot-input-number-icon-size: 40rpx;

  // 自定义圆角
  --wot-input-number-radius: 8rpx;
}
</style>
```

### 深色模式

组件自动支持深色模式,在 `wot-theme-dark` 类名下应用深色主题样式。

```vue
<template>
  <view :class="['page', { 'wot-theme-dark': isDark }]">
    <wd-input-number v-model="value" />
    <wd-button @click="toggleTheme">切换主题</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(1)
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>
```

参考: src/wd/components/wd-input-number/wd-input-number.vue:763-816

## 最佳实践

### 1. 合理设置范围和步进值

根据业务场景设置合适的 `min`、`max` 和 `step` 值,避免用户输入无效数据。

```vue
<!-- ✅ 推荐:明确的范围和步进 -->
<wd-input-number
  v-model="quantity"
  :min="1"
  :max="999"
  :step="1"
  label="商品数量"
/>

<wd-input-number
  v-model="price"
  :min="0"
  :max="99999.99"
  :step="0.01"
  :precision="2"
  label="商品单价"
/>

<!-- ❌ 不推荐:没有限制 -->
<wd-input-number v-model="value" />
```

**建议:**
- 整数输入场景设置 `precision="0"`,避免小数输入
- 金额输入场景设置 `precision="2"` 和 `step="0.01"`
- 合理设置 `max` 值,防止输入过大数字导致业务异常

参考: src/wd/components/wd-input-number/wd-input-number.vue:136-143

### 2. 精度和步进值保持一致

`precision` 和 `step` 的小数位数应保持一致,避免出现显示和步进不匹配的问题。

```vue
<!-- ✅ 推荐:精度和步进一致 -->
<wd-input-number
  v-model="value1"
  :step="0.1"
  :precision="1"
/>

<wd-input-number
  v-model="value2"
  :step="0.01"
  :precision="2"
/>

<!-- ❌ 不推荐:不一致 -->
<wd-input-number
  v-model="value3"
  :step="0.1"
  :precision="2"
/>
```

**原因:**
- `step="0.1"` 配合 `precision="2"` 会导致每次递增显示为 `0.10`、`0.20`,不够直观
- 保持一致可确保步进值和显示格式协调统一

参考: src/wd/components/wd-input-number/wd-input-number.vue:293-306

### 3. 严格步进模式的使用场景

`step-strictly` 适用于必须按固定步进值输入的场景,如规格选择、档位调节等。

```vue
<!-- ✅ 推荐:规格选择使用严格步进 -->
<wd-input-number
  v-model="specification"
  :min="10"
  :max="100"
  :step="10"
  :step-strictly="true"
  label="规格(10的倍数)"
/>

<!-- ✅ 推荐:档位调节 -->
<wd-input-number
  v-model="level"
  :min="0"
  :max="5"
  :step="1"
  :step-strictly="true"
  label="档位"
/>

<!-- ❌ 不推荐:普通数量输入使用严格步进 -->
<wd-input-number
  v-model="quantity"
  :min="1"
  :max="999"
  :step="1"
  :step-strictly="true"
/>
```

**注意:**
- 严格步进模式会自动修正输入值,可能改变用户输入的原始值
- 建议配合 `update-on-init="false"` 避免初始值被意外修正
- 确保 `min` 值是 `step` 的整数倍,否则可能出现边界问题

参考: src/wd/components/wd-input-number/wd-input-number.vue:310-366

### 4. 长按功能的合理使用

`long-press` 适用于需要大幅度调节数值的场景,配合较大的 `step` 值使用效果更佳。

```vue
<!-- ✅ 推荐:大范围调节使用长按 -->
<wd-input-number
  v-model="stock"
  :min="0"
  :max="10000"
  :step="100"
  long-press
  label="库存数量"
/>

<!-- ✅ 推荐:隐藏输入框 + 长按 -->
<wd-input-number
  v-model="count"
  :min="0"
  :max="999"
  :step="10"
  long-press
  without-input
/>

<!-- ❌ 不推荐:小范围调节使用长按 -->
<wd-input-number
  v-model="level"
  :min="1"
  :max="5"
  long-press
/>
```

**建议:**
- 范围超过 100 的场景建议开启长按功能
- 配合 `step` 值设置合理的递增/递减量
- 小范围调节(如 1-10)不建议开启,避免误触

参考: src/wd/components/wd-input-number/wd-input-number.vue:669-685

### 5. 表单验证的正确配置

在表单中使用时,合理配置验证规则,确保数据有效性。

```vue
<!-- ✅ 推荐:完整的验证配置 -->
<wd-form :model="formData">
  <wd-input-number
    v-model="formData.quantity"
    label="购买数量"
    prop="quantity"
    required
    :min="1"
    :max="999"
    :rules="[
      { required: true, message: '请输入购买数量' },
      {
        validator: (value: number) => value >= 1,
        message: '数量不能少于1'
      }
    ]"
  />

  <wd-input-number
    v-model="formData.price"
    label="商品单价"
    prop="price"
    required
    :min="0"
    :precision="2"
    :rules="[
      { required: true, message: '请输入商品单价' },
      {
        validator: (value: number) => value > 0,
        message: '单价必须大于0'
      }
    ]"
  />
</wd-form>

<!-- ❌ 不推荐:缺少验证 -->
<wd-input-number v-model="quantity" label="数量" />
```

**建议:**
- 使用 `required` 属性显示必填标记
- 配置 `rules` 进行自定义验证
- 结合 `before-change` 实现值变化前的校验
- 使用 `prop` 关联表单字段,启用自动验证

参考: src/wd/components/wd-input-number/wd-input-number.vue:175-196

## 常见问题

### 1. 浮点数精度问题

**问题描述:**
在处理小数时,可能出现精度丢失,如 `0.1 + 0.2 = 0.30000000000000004`。

**问题原因:**
- JavaScript 浮点数采用 IEEE 754 标准,存在精度限制
- 直接使用 `+` 运算符进行小数计算会出现精度误差

**解决方案:**

组件内部已通过 `formatToPrecision` 函数处理精度问题,无需额外配置。

```typescript
// 组件内部实现
const formatToPrecision = (val: number) => {
  const precision = Number(props.precision)
  return Math.round(val * 10 ** precision) / 10 ** precision
}
```

使用示例:

```vue
<template>
  <wd-input-number
    v-model="value"
    :step="0.1"
    :precision="1"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0.0)
</script>
```

参考: src/wd/components/wd-input-number/wd-input-number.vue:293-296

### 2. 严格步进模式下的初始值修正

**问题描述:**
开启 `step-strictly` 后,初始值被自动修正为步进值的整数倍,与预期不符。

**问题原因:**
- `update-on-init` 默认为 `true`,组件初始化时会自动修正值
- 严格步进模式会将值修正为 `min + n * step` 的形式

**解决方案:**

设置 `update-on-init="false"`,保持初始值不变,只在用户交互时修正。

```vue
<template>
  <wd-input-number
    v-model="value"
    :min="0"
    :max="100"
    :step="10"
    :step-strictly="true"
    :update-on-init="false"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 初始值 13 不会被自动修正,失焦时才修正为 10
const value = ref(13)
</script>
```

参考: src/wd/components/wd-input-number/wd-input-number.vue:438-451

### 3. 长按功能在某些平台不生效

**问题描述:**
在部分平台或浏览器中,长按加减按钮不会连续调节数值。

**问题原因:**
- 长按功能依赖 `touchstart` 和 `touchend` 事件
- 部分平台对触摸事件的支持不完整或有差异

**解决方案:**

确保组件运行在支持触摸事件的环境,或使用更大的 `step` 值减少长按需求。

```vue
<template>
  <view class="demo">
    <!-- 方案1:增大步进值,减少长按需求 -->
    <wd-input-number
      v-model="value1"
      :min="0"
      :max="10000"
      :step="100"
      long-press
    />

    <!-- 方案2:不使用长按,配合直接输入 -->
    <wd-input-number
      v-model="value2"
      :min="0"
      :max="10000"
      placeholder="直接输入"
    />
  </view>
</template>
```

参考: src/wd/components/wd-input-number/wd-input-number.vue:669-685

### 4. 输入框宽度不够导致数字显示不全

**问题描述:**
当数值较大或精度较高时,输入框宽度不够,数字显示不完整。

**问题原因:**
- 默认 `input-width` 为 120rpx,对于长数字可能不够
- 高精度小数(如 4 位小数)需要更宽的显示空间

**解决方案:**

根据数值范围和精度,适当增加 `input-width` 值。

```vue
<template>
  <view class="demo">
    <!-- 普通整数:默认宽度 -->
    <wd-input-number
      v-model="value1"
      :min="0"
      :max="999"
    />

    <!-- 4位小数:增加宽度 -->
    <wd-input-number
      v-model="value2"
      :input-width="200"
      :precision="4"
      :min="0"
      :max="9999.9999"
    />

    <!-- 大数值:增加宽度 -->
    <wd-input-number
      v-model="value3"
      :input-width="180"
      :min="0"
      :max="999999"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(1)
const value2 = ref(0.0000)
const value3 = ref(100000)
</script>
```

参考: src/wd/components/wd-input-number/wd-input-number.vue:156-157

### 5. beforeChange 钩子导致值无法更新

**问题描述:**
配置了 `before-change` 钩子后,输入框的值无法正常更新。

**问题原因:**
- `before-change` 返回 `false` 会阻止值的更新
- 异步 `before-change` 返回的 Promise reject 或 resolve `false` 也会阻止更新
- 钩子函数内部可能存在逻辑错误

**解决方案:**

检查 `before-change` 函数的返回值,确保在允许更新时返回 `true`。

```vue
<template>
  <wd-input-number
    v-model="value"
    :before-change="handleBeforeChange"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0)

// ✅ 正确:明确返回 true 或 false
const handleBeforeChange = (newValue: number | string): boolean => {
  const num = Number(newValue)
  if (num > 100) {
    uni.showToast({ title: '不能超过100', icon: 'none' })
    return false  // 阻止更新
  }
  return true  // 允许更新
}

// ❌ 错误:没有返回值(undefined 会被视为 false)
const handleBeforeChangeWrong = (newValue: number | string) => {
  const num = Number(newValue)
  if (num > 100) {
    uni.showToast({ title: '不能超过100', icon: 'none' })
  }
}
</script>
```

对于异步验证:

```typescript
// ✅ 正确:Promise 必须 resolve boolean
const handleAsyncBeforeChange = (value: number | string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const num = Number(value)
      if (num > 50) {
        resolve(false)  // 阻止更新
      } else {
        resolve(true)   // 允许更新
      }
    }, 500)
  })
}

// ❌ 错误:Promise 没有 resolve
const handleAsyncBeforeChangeWrong = (value: number | string): Promise<boolean> => {
  return new Promise(() => {
    // 没有 resolve,导致永远不会更新
    console.log(value)
  })
}
```

参考: src/wd/components/wd-input-number/wd-input-number.vue:553-571

## 注意事项

1. **v-model 类型**: `v-model` 的值类型为 `number | string`,当 `allow-null` 为 `true` 时可能为空字符串,业务代码需做类型判断

2. **最小值默认为 1**: 组件默认 `min="1"`,如果需要从 0 开始或允许负数,必须显式设置 `min` 属性

3. **精度设置**: `precision` 会影响值的显示格式,`precision="2"` 时值为 1 会显示为 `1.00`,不是 `1`

4. **步进值和精度**: 建议 `step` 的小数位数不超过 `precision`,否则可能出现显示和步进不一致的问题

5. **严格步进模式**: `step-strictly` 会自动修正输入值,确保 `min` 值是 `step` 的整数倍,避免出现边界计算错误

6. **长按触发时间**: 长按功能的触发时间为 600ms,连续调节间隔为 250ms,无法自定义

7. **禁用控制优先级**: `disabled` 的优先级高于 `disable-input`、`disable-minus`、`disable-plus`,设置 `disabled` 后其他禁用属性无效

8. **表单验证**: 组件必须设置 `prop` 属性才能被 `wd-form` 正确验证,且需要在 `wd-form` 内部使用

9. **输入类型限制**: `input-type="digit"` 只能输入正整数,如需负数或小数,应使用 `input-type="number"`

10. **宽度单位**: `input-width` 和 `label-width` 默认单位为 rpx,可传入数字或字符串(如 `'160rpx'`)

11. **图标事件**: `clickprefixicon` 和 `clicksuffixicon` 事件只在点击图标时触发,点击输入框或加减按钮不会触发

12. **初始值修正**: `update-on-init` 默认为 `true`,组件初始化时会修正不符合规则的初始值,如不需要可设为 `false`

参考: src/wd/components/wd-input-number/wd-input-number.vue:229-257
