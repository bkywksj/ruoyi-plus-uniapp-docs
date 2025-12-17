---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/radio
---

# RadioGroup 单选框组

## 介绍

RadioGroup 单选框组组件用于在一组选项中进行单选操作。组件支持多种展示形式(对勾、圆点、按钮)、多种布局方式(纵向、横向、自定义宽度)、表单模式集成等,可满足各种单选场景的需求。

**核心特性:**

- **双模式支持** - 支持 options 数组配置模式和 wd-radio 子组件模式,options 模式更简洁,子组件模式更灵活
- **三种形状** - 提供 check(对勾)、dot(圆点)、button(按钮)三种样式,适应不同设计需求
- **三种尺寸** - 支持 small、default、large 三种尺寸,满足不同场景
- **表单模式** - 可作为表单项使用,支持 label、验证规则、必填标识等表单功能
- **灵活布局** - 支持纵向排列、横向排列(inline)、自定义每项宽度(itemWidth)
- **图标位置** - 可设置图标在左侧、右侧或自动判断(auto)
- **禁用控制** - 支持全局禁用或单项禁用,灵活控制可选状态
- **自定义样式** - 支持自定义选中颜色、自定义插槽内容等

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:1-120

## 基本用法

### options 模式

使用 options 数组配置单选项,最简单直接的用法。

```vue
<template>
  <view class="demo">
    <wd-radio-group
      v-model="value"
      :options="options"
      @change="handleChange"
    />

    <view class="result">选中的值: {{ value }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'

const value = ref('1')

const options: RadioOption[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
]

const handleChange = (val: string | number | boolean) => {
  console.log('选中的值:', val)
}
</script>

```

**使用说明:**
- 使用 `v-model` 绑定当前选中的值
- `options` 数组配置选项,每项包含 `label`(显示文字) 和 `value`(值)
- `@change` 事件在选中值变化时触发
- 默认使用 check(对勾)形状

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:188-191, 305-307

### 子组件模式

使用 wd-radio 子组件,提供更灵活的自定义能力。

```vue
<template>
  <view class="demo">
    <wd-radio-group v-model="value">
      <wd-radio :value="1">选项1</wd-radio>
      <wd-radio :value="2">选项2</wd-radio>
      <wd-radio :value="3">选项3</wd-radio>
    </wd-radio-group>

    <view class="result">选中的值: {{ value }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(1)
</script>

```

**技术实现:**
- 子组件模式通过 provide/inject 实现父子通信
- RadioGroup 通过 `useChildren` 管理子组件
- 每个 wd-radio 可以单独设置属性
- 值可以是 string、number 或 boolean 类型

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:59-61, 117-119, 269-270, 348-351

### 圆点形状(dot)

使用圆点样式的单选框。

```vue
<template>
  <view class="demo">
    <wd-radio-group
      v-model="value"
      shape="dot"
      :options="options"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'

const value = ref('1')

const options: RadioOption[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
]
</script>

```

**技术实现:**
- `shape="dot"` 使用圆点样式
- 圆点通过 CSS `::before` 伪元素实现
- 选中时圆点从中心缩放展开,带有动画效果
- 圆点样式: 外圆边框 + 内圆填充

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:193-194, 248, 587-619

### 按钮形状(button)

使用按钮样式的单选框,适合选项较少的场景。

```vue
<template>
  <view class="demo">
    <wd-radio-group
      v-model="value"
      shape="button"
      :options="options"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'

const value = ref('1')

const options: RadioOption[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
  { label: '选项4', value: '4' },
]
</script>

```

**技术实现:**
- `shape="button"` 使用按钮样式
- 按钮样式不显示 radio 图标
- 选中状态通过边框颜色和背景色变化体现
- 按钮之间有 20rpx 的右边距
- 支持自动换行

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:193-194, 621-670

### 横向排列(inline)

单选项横向排列显示。

```vue
<template>
  <view class="demo">
    <wd-radio-group
      v-model="value"
      inline
      :options="options"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'

const value = ref('1')

const options: RadioOption[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
]
</script>

```

**技术实现:**
- `inline` 属性设置为 true 启用横向排列
- 使用 `display: inline-flex` 实现
- 每项之间有右边距
- shape 图标会显示在左侧或右侧
- 支持自动换行

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:201-202, 676-714

### 不同尺寸

提供三种尺寸: small、default、large。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">小尺寸</view>
      <wd-radio-group
        v-model="value1"
        size="small"
        :options="options"
      />
    </view>

    <view class="section">
      <view class="section-title">默认尺寸</view>
      <wd-radio-group
        v-model="value2"
        size="default"
        :options="options"
      />
    </view>

    <view class="section">
      <view class="section-title">大尺寸</view>
      <wd-radio-group
        v-model="value3"
        size="large"
        :options="options"
      />
    </view>

    <view class="section">
      <view class="section-title">按钮模式 - 小尺寸</view>
      <wd-radio-group
        v-model="value4"
        shape="button"
        size="small"
        :options="options"
      />
    </view>

    <view class="section">
      <view class="section-title">按钮模式 - 大尺寸</view>
      <wd-radio-group
        v-model="value5"
        shape="button"
        size="large"
        :options="options"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'

const value1 = ref('1')
const value2 = ref('1')
const value3 = ref('1')
const value4 = ref('1')
const value5 = ref('1')

const options: RadioOption[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
]
</script>

```

**技术实现:**
- `size` 属性支持 small、default、large
- 不同尺寸影响图标大小、文字大小
- 按钮模式下,尺寸影响按钮高度、内边距、字体大小
- CSS 变量定义了各尺寸的具体数值

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:199-200, 250, 652-669, 755-798

### 禁用状态

禁用全部或单个选项。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">全部禁用</view>
      <wd-radio-group
        v-model="value1"
        disabled
        :options="options"
      />
    </view>

    <view class="section">
      <view class="section-title">部分禁用</view>
      <wd-radio-group
        v-model="value2"
        :options="optionsWithDisabled"
      />
    </view>

    <view class="section">
      <view class="section-title">按钮模式 - 禁用</view>
      <wd-radio-group
        v-model="value3"
        shape="button"
        :options="optionsWithDisabled"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'

const value1 = ref('1')
const value2 = ref('1')
const value3 = ref('1')

const options: RadioOption[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
]

const optionsWithDisabled: RadioOption[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2', disabled: true },
  { label: '选项3', value: '3' },
  { label: '选项4', value: '4', disabled: true },
]
</script>

```

**技术实现:**
- `disabled` 属性禁用整个组件
- 单个选项通过 `option.disabled` 禁用
- 禁用项点击无响应
- 禁用样式: 文字变灰、图标变灰、按钮背景变灰

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:197-198, 249, 410-416, 716-752

## 高级用法

### 表单模式

作为表单项使用,支持 label、验证等表单功能。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-radio-group
        v-model="formData.gender"
        label="性别"
        prop="gender"
        :options="genderOptions"
      />

      <wd-radio-group
        v-model="formData.hobby"
        label="爱好"
        prop="hobby"
        required
        :options="hobbyOptions"
      />

      <wd-radio-group
        v-model="formData.level"
        label="等级"
        label-width="120rpx"
        shape="button"
        :options="levelOptions"
      />

      <view class="form-actions">
        <wd-button type="primary" block @click="handleSubmit">
          提交
        </wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'
import type { FormInstance } from '@/wd/components/wd-form/wd-form.vue'

const formRef = ref<FormInstance>()

const formData = ref({
  gender: '',
  hobby: '',
  level: '1',
})

const genderOptions: RadioOption[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

const hobbyOptions: RadioOption[] = [
  { label: '运动', value: 'sports' },
  { label: '阅读', value: 'reading' },
  { label: '音乐', value: 'music' },
]

const levelOptions: RadioOption[] = [
  { label: 'VIP1', value: '1' },
  { label: 'VIP2', value: '2' },
  { label: 'VIP3', value: '3' },
]

const rules = {
  gender: [{ required: true, message: '请选择性别' }],
  hobby: [{ required: true, message: '请选择爱好' }],
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('表单数据:', formData.value)
    uni.showToast({
      title: '提交成功',
      icon: 'success',
    })
  }
}
</script>

```

**技术实现:**
- 设置 `label` 属性后自动进入表单模式
- 表单模式下会渲染为 `wd-cell` 包裹
- `prop` 属性关联表单验证字段
- `required` 显示必填星号
- `label-width` 可自定义标签宽度
- 支持完整的表单验证规则

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:3-72, 209-231, 273-334

### 自定义每项宽度

使用 `itemWidth` 自定义每项的宽度,实现多列布局。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">两列布局</view>
      <wd-radio-group
        v-model="value1"
        item-width="50%"
        :options="options"
      />
    </view>

    <view class="section">
      <view class="section-title">三列布局</view>
      <wd-radio-group
        v-model="value2"
        item-width="33.33%"
        :options="moreOptions"
      />
    </view>

    <view class="section">
      <view class="section-title">按钮模式 - 四列</view>
      <wd-radio-group
        v-model="value3"
        shape="button"
        item-width="25%"
        :options="moreOptions"
      />
    </view>

    <view class="section">
      <view class="section-title">固定宽度</view>
      <wd-radio-group
        v-model="value4"
        shape="button"
        item-width="200rpx"
        :options="options"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'

const value1 = ref('1')
const value2 = ref('1')
const value3 = ref('1')
const value4 = ref('1')

const options: RadioOption[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
  { label: '选项4', value: '4' },
]

const moreOptions: RadioOption[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
  { label: '选项4', value: '4' },
  { label: '选项5', value: '5' },
  { label: '选项6', value: '6' },
  { label: '选项7', value: '7' },
  { label: '选项8', value: '8' },
  { label: '选项9', value: '9' },
]
</script>

```

**技术实现:**
- `item-width` 支持百分比(如 50%)和固定值(如 200rpx)
- 通过 CSS 变量 `--item-width` 传递给每个选项
- 使用 `display: inline-flex` 和 `vertical-align: top` 实现换行布局
- 按钮模式会减去 margin 避免宽度溢出

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:205-206, 312-314, 384-404, 532-540

### 自定义选中颜色

自定义选中状态的颜色。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">自定义颜色 - check 模式</view>
      <wd-radio-group
        v-model="value1"
        checked-color="#ff4444"
        :options="options"
      />
    </view>

    <view class="section">
      <view class="section-title">自定义颜色 - dot 模式</view>
      <wd-radio-group
        v-model="value2"
        shape="dot"
        checked-color="#52c41a"
        inline
        :options="options"
      />
    </view>

    <view class="section">
      <view class="section-title">自定义颜色 - button 模式</view>
      <wd-radio-group
        v-model="value3"
        shape="button"
        checked-color="#722ed1"
        :options="options"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'

const value1 = ref('1')
const value2 = ref('1')
const value3 = ref('1')

const options: RadioOption[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
]
</script>

```

**技术实现:**
- `checked-color` 属性设置选中颜色
- check 模式: 图标颜色变化
- dot 模式: 圆点边框和背景颜色变化
- button 模式: 边框和文字颜色变化
- 颜色通过 CSS `color` 属性应用

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:195-196, 33, 48, 52, 91, 106, 110

### 图标位置

设置图标在文字左侧或右侧。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">图标在左侧</view>
      <wd-radio-group
        v-model="value1"
        inline
        icon-placement="left"
        :options="options"
      />
    </view>

    <view class="section">
      <view class="section-title">图标在右侧</view>
      <wd-radio-group
        v-model="value2"
        inline
        icon-placement="right"
        :options="options"
      />
    </view>

    <view class="section">
      <view class="section-title">自动判断(默认)</view>
      <wd-radio-group
        v-model="value3"
        inline
        icon-placement="auto"
        :options="options"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'

const value1 = ref('1')
const value2 = ref('1')
const value3 = ref('1')

const options: RadioOption[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
]
</script>

```

**技术实现:**
- `icon-placement` 支持 left、right、auto
- left: 图标在左,使用 `flex-direction: row-reverse`
- right: 图标在右(默认布局)
- auto: 根据情况自动判断
- 只在 inline 模式下生效

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:203-204, 252, 672-713

### 自定义选项内容

通过插槽自定义选项的显示内容。

```vue
<template>
  <view class="demo">
    <wd-radio-group v-model="value" :options="options">
      <template #option-0="{ option, checked }">
        <view class="custom-option">
          <wd-icon name="star-on" size="32rpx" />
          <text>{{ option.label }}</text>
          <wd-tag v-if="checked" type="success" size="small">已选</wd-tag>
        </view>
      </template>

      <template #option-1="{ option, checked }">
        <view class="custom-option">
          <wd-icon name="heart-on" size="32rpx" />
          <text>{{ option.label }}</text>
          <wd-tag v-if="checked" type="primary" size="small">已选</wd-tag>
        </view>
      </template>

      <template #option-2="{ option, checked }">
        <view class="custom-option">
          <wd-icon name="like-on" size="32rpx" />
          <text>{{ option.label }}</text>
          <wd-tag v-if="checked" type="warning" size="small">已选</wd-tag>
        </view>
      </template>
    </wd-radio-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'

const value = ref('1')

const options: RadioOption[] = [
  { label: '收藏', value: '1', useSlot: true },
  { label: '喜欢', value: '2', useSlot: true },
  { label: '点赞', value: '3', useSlot: true },
]
</script>

```

**技术实现:**
- 设置 `option.useSlot = true` 启用插槽
- 默认插槽名为 `option-{index}`
- 可通过 `option.slotName` 自定义插槽名
- 插槽接收 `option`、`index`、`checked` 参数
- 可以在插槽中使用任意组件

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:35-42, 93-100, 167-174

### 配合表单验证

结合表单验证使用,实现复杂的验证逻辑。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-radio-group
        v-model="formData.agreeTerm"
        label="服务条款"
        prop="agreeTerm"
        :options="agreeOptions"
      />

      <wd-radio-group
        v-model="formData.paymentMethod"
        label="支付方式"
        prop="paymentMethod"
        shape="button"
        :options="paymentOptions"
      />

      <wd-radio-group
        v-model="formData.deliveryTime"
        label="配送时间"
        prop="deliveryTime"
        :options="deliveryOptions"
      />

      <view class="form-actions">
        <wd-button type="primary" block @click="handleSubmit">
          提交订单
        </wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'
import type { FormInstance, FormItemRule } from '@/wd/components/wd-form/wd-form.vue'

const formRef = ref<FormInstance>()

const formData = ref({
  agreeTerm: '',
  paymentMethod: '',
  deliveryTime: '',
})

const agreeOptions: RadioOption[] = [
  { label: '我已阅读并同意服务条款', value: 'yes' },
]

const paymentOptions: RadioOption[] = [
  { label: '微信支付', value: 'wechat' },
  { label: '支付宝', value: 'alipay' },
  { label: '货到付款', value: 'cod' },
]

const deliveryOptions: RadioOption[] = [
  { label: '工作日配送', value: 'workday' },
  { label: '周末配送', value: 'weekend' },
  { label: '指定时间', value: 'custom' },
]

// 自定义验证规则
const validateAgreeTerm: FormItemRule['validator'] = (
  value,
  rule,
  callback
) => {
  if (value !== 'yes') {
    callback(new Error('请同意服务条款'))
  } else {
    callback()
  }
}

const rules = {
  agreeTerm: [{ required: true, validator: validateAgreeTerm }],
  paymentMethod: [{ required: true, message: '请选择支付方式' }],
  deliveryTime: [{ required: true, message: '请选择配送时间' }],
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('表单数据:', formData.value)
    uni.showToast({
      title: '提交成功',
      icon: 'success',
    })
  }
}
</script>

```

**技术实现:**
- `rules` 属性设置验证规则
- 支持 required、validator 等规则类型
- 自定义 validator 函数实现复杂验证
- 验证失败时显示错误提示
- 配合 Form 组件的 validate 方法使用

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:223-224, 318-334

### 动态选项

根据条件动态改变选项列表。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">选择省份</view>
      <wd-radio-group
        v-model="province"
        :options="provinceOptions"
        @change="handleProvinceChange"
      />
    </view>

    <view v-if="cityOptions.length > 0" class="section">
      <view class="section-title">选择城市</view>
      <wd-radio-group
        v-model="city"
        :options="cityOptions"
      />
    </view>

    <view class="result">
      <text>已选: {{ selectedText }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { RadioOption } from '@/wd/components/wd-radio-group/wd-radio-group.vue'

const province = ref('')
const city = ref('')

const provinceOptions: RadioOption[] = [
  { label: '广东省', value: 'guangdong' },
  { label: '浙江省', value: 'zhejiang' },
  { label: '江苏省', value: 'jiangsu' },
]

const cityMap: Record<string, RadioOption[]> = {
  guangdong: [
    { label: '广州市', value: 'guangzhou' },
    { label: '深圳市', value: 'shenzhen' },
    { label: '珠海市', value: 'zhuhai' },
  ],
  zhejiang: [
    { label: '杭州市', value: 'hangzhou' },
    { label: '宁波市', value: 'ningbo' },
    { label: '温州市', value: 'wenzhou' },
  ],
  jiangsu: [
    { label: '南京市', value: 'nanjing' },
    { label: '苏州市', value: 'suzhou' },
    { label: '无锡市', value: 'wuxi' },
  ],
}

const cityOptions = ref<RadioOption[]>([])

const handleProvinceChange = (val: string | number | boolean) => {
  // 切换省份时重置城市
  city.value = ''

  // 加载对应的城市列表
  cityOptions.value = cityMap[val as string] || []
}

const selectedText = computed(() => {
  if (!province.value) return '未选择'

  const provinceName = provinceOptions.find(
    p => p.value === province.value
  )?.label

  if (!city.value) return provinceName

  const cityName = cityOptions.value.find(
    c => c.value === city.value
  )?.label

  return `${provinceName} - ${cityName}`
})
</script>

```

**技术实现:**
- options 是响应式数据,可以动态修改
- 监听 change 事件,根据选择更新下级选项
- 切换上级选项时,重置下级选择
- 使用 computed 计算最终显示文本

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:190-191, 236-241

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model-value / v-model | 当前选中的值 | `string \| number \| boolean` | - |
| options | 单选项配置列表(options 模式) | `RadioOption[]` | `[]` |
| shape | 单选框形状,可选值: `dot` / `button` / `check` | `RadioShape` | `'check'` |
| checked-color | 选中的颜色 | `string` | `'#4D80F0'` |
| disabled | 是否禁用 | `boolean` | `false` |
| size | 设置大小,可选值: `default` / `small` / `large` | `RadioSize` | `'default'` |
| inline | 同行展示 | `boolean` | `false` |
| icon-placement | 图标位置,可选值: `left` / `right` / `auto` | `RadioIconPlacement` | `'auto'` |
| item-width | 每个单选框的宽度,支持百分比或固定值 | `string` | `undefined` |
| label | 设置左侧标题(表单模式) | `string` | - |
| label-width | 设置左侧标题宽度 | `string \| number` | `undefined` |
| prefix-icon | 前置图标 | `string` | - |
| center | 当有label属性时,设置标题和单选框垂直居中 | `boolean` | `false` |
| vertical | 表单属性,上下结构 | `boolean` | `false` |
| required | 是否必填 | `boolean` | `false` |
| prop | 表单域 model 字段名 | `string` | - |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| no-border | 非 cell 类型下是否隐藏下划线 | `boolean` | `false` |
| custom-label-class | label 使用 slot 时的自定义样式 | `string` | `''` |
| custom-icon-class | 前置图标使用 slot 时的自定义样式 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:182-231, 244-261

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | v-model 更新事件 | `value: string \| number \| boolean` |
| change | 值变化时触发 | `value: string \| number \| boolean` |

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:236-241, 340-343

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| default | 默认插槽,用于放置 wd-radio 子组件 | - |
| label | 自定义左侧标题内容(表单模式) | - |
| prefix | 自定义前置图标(表单模式) | - |
| option-{index} | 自定义选项内容,需配合 `option.useSlot` 使用 | `{ option: RadioOption, index: number, checked: boolean }` |

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:35-42, 59-71, 93-100

### 类型定义

```typescript
/**
 * 单选框形状类型
 */
export type RadioShape = 'dot' | 'button' | 'check'

/**
 * 图标位置类型
 */
export type RadioIconPlacement = 'left' | 'right' | 'auto'

/**
 * 单选框尺寸类型
 */
export type RadioSize = 'default' | 'small' | 'large'

/**
 * 单选项配置接口(用于 options 模式)
 */
export interface RadioOption {
  /** 选项的值 */
  value: string | number | boolean
  /** 选项的标签文字 */
  label?: string
  /** 是否禁用该选项 */
  disabled?: boolean
  /** 是否使用自定义内容插槽 */
  useSlot?: boolean
  /** 自定义内容插槽名称,默认为 option-{index} */
  slotName?: string
  /** 最大宽度 */
  maxWidth?: string
  /** 自定义数据,选择时会传递 */
  [key: string]: any
}
```

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:144-177

## 主题定制

### CSS 变量

组件提供以下 CSS 变量用于主题定制:

```scss
// 单选框组主题变量
$-radio-bg: #fff !default;                           // 背景色
$-radio-margin: 16rpx !default;                      // 间距
$-radio-size: 32rpx !default;                        // 图标大小
$-radio-label-fs: 28rpx !default;                    // 文字大小
$-radio-label-color: #323233 !default;               // 文字颜色
$-radio-checked-color: #4D80F0 !default;             // 选中颜色
$-radio-dot-border-color: #dcdee0 !default;          // 圆点边框颜色
$-radio-dot-size: 16rpx !default;                    // 圆点大小
$-radio-disabled-label-color: #c8c9cc !default;      // 禁用文字颜色
$-radio-disabled-color: #f5f7fa !default;            // 禁用背景色
$-radio-dot-disabled-bg: #f5f7fa !default;           // 圆点禁用背景
$-radio-dot-disabled-border: #c8c9cc !default;       // 圆点禁用边框

// 按钮模式
$-radio-button-height: 60rpx !default;               // 按钮高度
$-radio-button-min-width: 120rpx !default;           // 按钮最小宽度
$-radio-button-max-width: 500rpx !default;           // 按钮最大宽度
$-radio-button-radius: 4rpx !default;                // 按钮圆角
$-radio-button-bg: #fff !default;                    // 按钮背景
$-radio-button-fs: 28rpx !default;                   // 按钮字体大小
$-radio-button-border: #ebedf0 !default;             // 按钮边框颜色
$-radio-button-disabled-border: #c8c9cc !default;    // 按钮禁用边框

// 小尺寸
$-radio-small-size: 28rpx !default;
$-radio-small-label-fs: 26rpx !default;
$-radio-dot-small-size: 14rpx !default;
$-radio-button-small-height: 48rpx !default;
$-radio-button-small-min-width: 100rpx !default;
$-radio-button-small-fs: 26rpx !default;

// 大尺寸
$-radio-large-size: 40rpx !default;
$-radio-large-label-fs: 32rpx !default;
$-radio-dot-large-size: 20rpx !default;
$-radio-button-large-height: 72rpx !default;
$-radio-button-large-min-width: 140rpx !default;
$-radio-button-large-fs: 32rpx !default;
```

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:449-800

### 暗黑模式

组件内置暗黑模式支持,通过 `wot-theme-dark` 类名自动切换:

```scss
.wot-theme-dark {
  .wd-radio-group {
    background-color: $-dark-background2;
  }

  .wd-radio {
    .wd-radio__shape {
      background: transparent;
    }
    .wd-radio__label {
      color: $-dark-color;
    }
    // 更多暗黑模式样式...
  }
}
```

**使用方式:**

```vue
<template>
  <view :class="{ 'wot-theme-dark': isDark }">
    <wd-radio-group v-model="value" :options="options" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)
const value = ref('1')
const options = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
]
</script>
```

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:454-515

## 最佳实践

### 1. 选择合适的模式

根据场景选择 options 模式或子组件模式:

```vue
<!-- ✅ 推荐: 简单场景使用 options 模式 -->
<wd-radio-group
  v-model="value"
  :options="[
    { label: '选项1', value: '1' },
    { label: '选项2', value: '2' },
  ]"
/>

<!-- ✅ 推荐: 需要自定义每个选项时使用子组件模式 -->
<wd-radio-group v-model="value">
  <wd-radio :value="1">
    <view class="custom-content">
      <wd-icon name="star" />
      <text>自定义内容</text>
    </view>
  </wd-radio>
</wd-radio-group>

<!-- ❌ 不推荐: 简单场景使用复杂的子组件模式 -->
<wd-radio-group v-model="value">
  <wd-radio :value="1">选项1</wd-radio>
  <wd-radio :value="2">选项2</wd-radio>
  <!-- 这种情况用 options 更简洁 -->
</wd-radio-group>
```

**说明:**
- 简单列表数据用 options 模式
- 需要复杂自定义时用子组件模式
- options 模式代码更简洁,维护更方便

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:305-307

### 2. 合理使用形状和布局

根据场景选择合适的形状和布局:

```vue
<!-- ✅ 推荐: 短文本选项使用按钮模式 + 横向布局 -->
<wd-radio-group
  v-model="gender"
  shape="button"
  inline
  :options="[
    { label: '男', value: 'male' },
    { label: '女', value: 'female' },
  ]"
/>

<!-- ✅ 推荐: 长文本选项使用默认模式 + 纵向布局 -->
<wd-radio-group
  v-model="agreement"
  :options="[
    { label: '我已阅读并同意用户协议和隐私政策', value: 'yes' },
  ]"
/>

<!-- ✅ 推荐: 多选项使用 itemWidth 控制列数 -->
<wd-radio-group
  v-model="category"
  shape="button"
  item-width="33.33%"
  :options="manyOptions"
/>

<!-- ❌ 不推荐: 长文本使用按钮模式,会被截断 -->
<wd-radio-group
  v-model="value"
  shape="button"
  :options="[
    { label: '这是一段很长很长的文字...', value: '1' },
  ]"
/>
```

**说明:**
- 按钮模式适合短文本,且数量不超过5个
- 长文本使用默认check模式
- 使用 itemWidth 控制每行显示数量

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:193-206

### 3. 正确处理禁用状态

合理使用全局禁用和单项禁用:

```typescript
// ✅ 推荐: 根据业务逻辑动态禁用
const options = computed(() => {
  return [
    { label: 'VIP1', value: '1', disabled: userLevel.value < 1 },
    { label: 'VIP2', value: '2', disabled: userLevel.value < 2 },
    { label: 'VIP3', value: '3', disabled: userLevel.value < 3 },
  ]
})

// ✅ 推荐: 表单提交中禁用整个组件
<wd-radio-group
  v-model="value"
  :disabled="isSubmitting"
  :options="options"
/>

// ❌ 不推荐: 所有选项都设置为禁用
const options = [
  { label: '选项1', value: '1', disabled: true },
  { label: '选项2', value: '2', disabled: true },
  { label: '选项3', value: '3', disabled: true },
]
// 这种情况应该使用全局 disabled 属性
```

**说明:**
- 全局禁用用于整体控制(如表单提交中)
- 单项禁用用于业务逻辑控制(如权限限制)
- 避免所有选项都禁用,应该隐藏组件

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:197-198, 410-416

### 4. 表单验证的使用

在表单中正确使用验证规则:

```typescript
// ✅ 推荐: 使用 required 规则
const rules = {
  gender: [{ required: true, message: '请选择性别' }],
}

// ✅ 推荐: 使用自定义验证
const rules = {
  agreement: [
    {
      required: true,
      validator: (value, rule, callback) => {
        if (value !== 'yes') {
          callback(new Error('请同意用户协议'))
        } else {
          callback()
        }
      },
    },
  ],
}

// ✅ 推荐: 组件上设置 required 属性显示星号
<wd-radio-group
  v-model="formData.gender"
  label="性别"
  prop="gender"
  required
  :options="genderOptions"
/>

// ❌ 不推荐: 忘记设置 prop 属性
<wd-radio-group
  v-model="formData.gender"
  label="性别"
  :options="genderOptions"
/>
// 没有 prop,验证规则无法关联
```

**说明:**
- 必须设置 `prop` 属性关联验证字段
- `required` 属性只影响样式,验证需要在 `rules` 中配置
- 复杂验证使用自定义 validator

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:219-224, 318-334

### 5. itemWidth 的正确使用

合理设置 itemWidth 实现多列布局:

```vue
<!-- ✅ 推荐: 使用百分比,自适应容器宽度 -->
<wd-radio-group
  v-model="value"
  item-width="50%"
  :options="options"
/>

<!-- ✅ 推荐: 按钮模式使用百分比,考虑边距 -->
<wd-radio-group
  v-model="value"
  shape="button"
  item-width="33.33%"
  :options="options"
/>

<!-- ✅ 推荐: 固定宽度适用于特定设计需求 -->
<wd-radio-group
  v-model="value"
  item-width="200rpx"
  :options="options"
/>

<!-- ❌ 不推荐: 百分比加起来超过100% -->
<wd-radio-group
  v-model="value"
  item-width="60%"
  :options="options"
/>
<!-- 会导致溢出或布局错乱 -->
```

**说明:**
- 百分比需要能整除,如 50%、33.33%、25%
- 按钮模式会自动减去margin,无需手动计算
- 考虑不同屏幕宽度,优先使用百分比

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:205-206, 384-404

## 常见问题

### 1. 为什么设置了 itemWidth 但没有生效?

**问题原因:**
- itemWidth 需要配合特定的布局才能生效
- 可能是百分比计算错误

**解决方案:**

```vue
<!-- ✅ 正确: itemWidth 会自动生效 -->
<wd-radio-group
  v-model="value"
  item-width="50%"
  :options="options"
/>

<!-- ✅ 检查: 确保百分比正确 -->
<!-- 两列: 50%, 三列: 33.33%, 四列: 25% -->

<!-- ✅ 检查: 如果是按钮模式,组件会自动处理margin -->
<wd-radio-group
  v-model="value"
  shape="button"
  item-width="25%"
  :options="options"
/>

<!-- ❌ 错误: 没有设置任何宽度相关属性 -->
<wd-radio-group
  v-model="value"
  :options="options"
/>
```

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:312-314, 384-404, 532-540

### 2. options 模式下如何自定义每个选项的样式?

**问题原因:**
- options 模式渲染统一,不方便单独定制
- 不知道可以使用插槽

**解决方案:**

```vue
<!-- ✅ 方案1: 使用插槽自定义 -->
<wd-radio-group v-model="value" :options="options">
  <template #option-0="{ option, checked }">
    <view class="custom">{{ option.label }}</view>
  </template>
</wd-radio-group>

<script setup>
const options = [
  { label: '选项1', value: '1', useSlot: true },
  { label: '选项2', value: '2' },
]
</script>

<!-- ✅ 方案2: 使用子组件模式 -->
<wd-radio-group v-model="value">
  <wd-radio :value="1" custom-class="my-radio">
    选项1
  </wd-radio>
  <wd-radio :value="2">
    选项2
  </wd-radio>
</wd-radio-group>

<!-- ✅ 方案3: option 设置 maxWidth -->
<wd-radio-group
  v-model="value"
  :options="[
    { label: '很长的文字...', value: '1', maxWidth: '200rpx' },
  ]"
/>
```

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:35-42, 167-174

### 3. 表单模式下 label 宽度如何控制?

**问题原因:**
- 不知道 labelWidth 的优先级
- 不清楚如何继承 Form 的配置

**解决方案:**

```vue
<!-- ✅ 方案1: 组件自身设置 labelWidth -->
<wd-radio-group
  v-model="value"
  label="性别"
  label-width="120rpx"
  :options="options"
/>

<!-- ✅ 方案2: 使用 Form 的全局配置 -->
<wd-form label-width="150rpx">
  <wd-radio-group
    v-model="value"
    label="性别"
    :options="options"
  />
  <!-- 会继承 Form 的 labelWidth -->
</wd-form>

<!-- ✅ 方案3: 组件配置优先级更高 -->
<wd-form label-width="150rpx">
  <wd-radio-group
    v-model="value"
    label="性别"
    label-width="100rpx"
    :options="options"
  />
  <!-- 使用组件自身的 100rpx -->
</wd-form>
```

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:211-212, 279-292

### 4. 如何实现"全不选"功能?

**问题原因:**
- 单选框组必须选中一个值
- 希望能取消选择

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-radio-group v-model="value" :options="options" />

    <wd-button @click="handleClear">
      清除选择
    </wd-button>

    <view class="result">
      当前值: {{ value || '未选择' }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<string | number | boolean>('')

const options = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
]

// ✅ 通过设置为空字符串或其他值清除
const handleClear = () => {
  value.value = ''
}

// ✅ 或者添加一个"不选"选项
const optionsWithNone = [
  { label: '不选', value: '' },
  ...options,
]
</script>
```

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:188-189, 340-343

### 5. 为什么 change 事件触发了两次?

**问题原因:**
- 组件同时触发 `update:modelValue` 和 `change` 事件
- 可能在两个事件中都执行了相同操作

**解决方案:**

```vue
<template>
  <!-- ✅ 只监听 change 事件 -->
  <wd-radio-group
    v-model="value"
    :options="options"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('1')

// ✅ 在 change 事件中处理业务逻辑
const handleChange = (val: string | number | boolean) => {
  console.log('值变化:', val)
  // 业务逻辑...
}

// ❌ 不要同时监听 v-model 的变化
// watch(value, (newVal) => {
//   console.log('值变化:', newVal)
// })
// 这样会导致逻辑执行两次
</script>
```

**说明:**
- `update:modelValue` 用于 v-model 绑定
- `change` 用于业务逻辑处理
- 通常只需监听 `change` 事件

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:236-241, 340-343

## 注意事项

1. **value 类型** - modelValue 支持 string、number、boolean 三种类型,选项的 value 也要保持一致

2. **options 和子组件模式互斥** - 设置了 options 后,子组件模式会被忽略,不要同时使用

3. **表单模式触发** - 设置了 `label` 属性或使用了 `label` 插槽后自动进入表单模式

4. **itemWidth 计算** - 按钮模式下组件会自动减去 margin,百分比宽度无需手动调整

5. **图标位置** - `icon-placement` 只在 `inline` 模式下生效,纵向布局时无效

6. **禁用优先级** - 全局 `disabled` 和单项 `option.disabled` 都为 true 时,选项被禁用

7. **label 宽度优先级** - 组件 `labelWidth` > Form `labelWidth` > 默认值

8. **shape 验证** - shape 属性会在开发环境验证,非法值会输出控制台错误

9. **插槽命名** - options 模式的插槽默认为 `option-{index}`,可通过 `slotName` 自定义

10. **验证触发** - 需要在 Form 组件内使用,并设置 `prop` 属性才能触发验证

11. **change 事件** - 只在用户操作时触发,程序设置 v-model 不触发

12. **响应式 options** - options 数组是响应式的,可以动态修改,组件会自动更新

参考: src/wd/components/wd-radio-group/wd-radio-group.vue:1-801
