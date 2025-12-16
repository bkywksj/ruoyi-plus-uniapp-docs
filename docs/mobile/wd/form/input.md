# Input 输入框

## 介绍

Input 输入框是表单组件中最基础和最常用的组件,用于接收用户的单行文本输入。它基于 UniApp 的原生 input 组件封装,提供了丰富的功能和良好的用户体验,支持多种输入类型、前后置图标、清空功能、密码显示切换、字数统计、表单验证等高级特性。

**核心特性:**

- **多种输入类型** - 支持 8 种输入类型:text/number/digit/idcard/safe-password/password/nickname/tel,满足各种输入场景
- **前后置扩展** - 支持前置/后置图标和自定义插槽,灵活扩展输入框功能
- **智能清空** - 提供清空按钮,支持两种触发时机(始终显示/聚焦时显示),清空后可自动聚焦
- **密码切换** - 密码类型输入框支持显示/隐藏切换,提供眼睛图标便捷操作
- **字数统计** - 内置字数统计功能,实时显示当前字数和最大字数
- **表单集成** - 完美集成 WdForm 表单组件,支持表单验证、必填标识、错误提示
- **只读禁用** - 支持只读和禁用状态,只读模式通过遮罩层实现,保持良好的视觉效果
- **暗黑模式** - 内置暗黑模式支持,自动适配系统主题,提供一致的用户体验

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:1-979

## 基本用法

### 基础输入框

最简单的输入框使用方式,通过 `v-model` 双向绑定输入值。

```vue
<template>
  <view class="demo">
    <wd-input
      v-model="value"
      placeholder="请输入内容"
    />
    <view class="result">输入的内容: {{ value }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

```

**使用说明:**
- 使用 `v-model` 绑定输入值,支持双向数据绑定
- `placeholder` 设置占位提示文本
- 默认类型为 `text`,支持任意文本输入

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:229-230

### 输入框类型

通过 `type` 属性设置不同的输入类型。

```vue
<template>
  <view class="demo">
    <wd-input
      v-model="text"
      type="text"
      placeholder="文本输入"
    />

    <wd-input
      v-model="number"
      type="number"
      placeholder="数字输入"
      class="mt-16"
    />

    <wd-input
      v-model="digit"
      type="digit"
      placeholder="带小数点的数字"
      class="mt-16"
    />

    <wd-input
      v-model="tel"
      type="tel"
      placeholder="电话号码"
      class="mt-16"
    />

    <wd-input
      v-model="idcard"
      type="idcard"
      placeholder="身份证号码"
      class="mt-16"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const text = ref('')
const number = ref('')
const digit = ref('')
const tel = ref('')
const idcard = ref('')
</script>

```

**类型说明:**
- `text`: 文本输入(默认)
- `number`: 纯数字输入
- `digit`: 带小数点的数字
- `tel`: 电话号码
- `idcard`: 身份证号码
- `password`: 密码输入
- `safe-password`: 安全密码输入
- `nickname`: 昵称输入

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:148-158, 217-218

### 密码输入

通过 `show-password` 属性启用密码显示/隐藏切换功能。

```vue
<template>
  <view class="demo">
    <wd-input
      v-model="password"
      placeholder="请输入密码"
      :show-password="true"
    />

    <view class="tips">点击眼睛图标可切换密码显示/隐藏</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const password = ref('')
</script>

```

**技术实现:**
- `show-password` 启用密码切换功能
- 显示眼睛图标,点击可切换密码的显示/隐藏状态
- 内部使用 `password` 属性控制输入框的密码模式

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:231-232, 49, 84-89, 391, 548-550

### 清空按钮

通过 `clearable` 属性显示清空按钮。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">始终显示清空按钮</view>
      <wd-input
        v-model="value1"
        placeholder="有内容时显示清空按钮"
        :clearable="true"
        clear-trigger="always"
      />
    </view>

    <view class="section">
      <view class="section-title">聚焦时显示清空按钮</view>
      <wd-input
        v-model="value2"
        placeholder="聚焦且有内容时显示"
        :clearable="true"
        clear-trigger="focus"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('这是输入内容')
const value2 = ref('这是输入内容')
</script>

```

**技术实现:**
- `clearable` 启用清空功能
- `clear-trigger` 控制清空按钮显示时机:
  - `always`: 有内容时始终显示(默认)
  - `focus`: 聚焦且有内容时显示
- `focus-when-clear` 控制清空后是否自动聚焦(默认 `true`)

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:233-234, 261-264, 474-486, 555-569

### 字数统计

通过 `show-word-limit` 和 `maxlength` 属性显示字数统计。

```vue
<template>
  <view class="demo">
    <wd-input
      v-model="value"
      placeholder="最多输入 20 个字符"
      :maxlength="20"
      :show-word-limit="true"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

```

**技术实现:**
- `maxlength` 设置最大字符数,-1 表示不限制
- `show-word-limit` 显示字数统计,格式为 "当前字数/最大字数"
- 超出最大字数时,当前字数显示为红色

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:219-220, 241-242, 90-100, 491-494

### 带标签的输入框

通过 `label` 属性设置左侧标签。

```vue
<template>
  <view class="demo">
    <wd-input
      v-model="value1"
      label="用户名"
      placeholder="请输入用户名"
    />

    <wd-input
      v-model="value2"
      label="手机号"
      placeholder="请输入手机号"
      label-width="150rpx"
      class="mt-16"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>

```

**使用说明:**
- `label` 设置左侧标签文字
- `label-width` 自定义标签宽度,支持 rpx/px 单位
- 标签宽度优先级:组件 `labelWidth` > Form `labelWidth` > 默认值

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:243-245, 407-420

### 前后置图标

支持前置和后置图标,可使用内置图标或自定义插槽。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">前置图标</view>
      <wd-input
        v-model="value1"
        placeholder="请输入内容"
        prefix-icon="search"
        @clickprefixicon="handlePrefixClick"
      />
    </view>

    <view class="section">
      <view class="section-title">后置图标</view>
      <wd-input
        v-model="value2"
        placeholder="请输入内容"
        suffix-icon="setting"
        @clicksuffixicon="handleSuffixClick"
      />
    </view>

    <view class="section">
      <view class="section-title">前后置图标</view>
      <wd-input
        v-model="value3"
        placeholder="请输入内容"
        prefix-icon="user"
        suffix-icon="arrow-right"
      />
    </view>

    <view class="section">
      <view class="section-title">自定义前后置内容</view>
      <wd-input v-model="value4" placeholder="请输入内容">
        <template #prefix>
          <wd-icon name="bell" color="#1989fa" />
        </template>
        <template #suffix>
          <view class="custom-suffix">验证</view>
        </template>
      </wd-input>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')
const value4 = ref('')

const handlePrefixClick = () => {
  console.log('前置图标被点击')
}

const handleSuffixClick = () => {
  console.log('后置图标被点击')
}
</script>

```

**使用说明:**
- `prefix-icon` 设置前置图标名称
- `suffix-icon` 设置后置图标名称
- `prefix` 插槽可自定义前置内容
- `suffix` 插槽可自定义后置内容
- `clickprefixicon` 和 `clicksuffixicon` 事件监听图标点击

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:237-240, 11-18, 30-37, 101-107, 627-629, 620-622

## 高级用法

### 只读和禁用

只读和禁用状态有不同的视觉和交互效果。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">只读状态</view>
      <wd-input
        v-model="readonlyValue"
        label="只读内容"
        :readonly="true"
      />
      <view class="tips">只读状态下无法编辑,但可以选择复制</view>
    </view>

    <view class="section">
      <view class="section-title">禁用状态</view>
      <wd-input
        v-model="disabledValue"
        label="禁用内容"
        :disabled="true"
      />
      <view class="tips">禁用状态下完全不可交互</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const readonlyValue = ref('这是只读内容')
const disabledValue = ref('这是禁用内容')
</script>

```

**技术实现:**
- `readonly` 通过遮罩层实现只读,用户无法编辑
- `disabled` 完全禁用输入框,样式变灰且无法交互
- 只读和禁用状态下都不显示清空按钮

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:221-222, 235-236, 51, 73, 821-833

### 表单验证集成

与 WdForm 组件集成,支持表单验证功能。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-input
        v-model="formData.username"
        label="用户名"
        prop="username"
        placeholder="请输入用户名"
        required
      />

      <wd-input
        v-model="formData.phone"
        label="手机号"
        prop="phone"
        type="tel"
        placeholder="请输入手机号"
        :maxlength="11"
        :show-word-limit="true"
        required
      />

      <wd-input
        v-model="formData.email"
        label="邮箱"
        prop="email"
        placeholder="请输入邮箱(选填)"
      />
    </wd-form>

    <view class="button-group">
      <wd-button type="primary" @click="handleValidate" block>
        验证表单
      </wd-button>
      <wd-button @click="handleReset" block class="mt-16">
        重置表单
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance, FormItemRule } from '@/wd'

const formRef = ref<FormInstance>()

const formData = reactive({
  username: '',
  phone: '',
  email: ''
})

const rules: Record<string, FormItemRule[]> = {
  username: [
    { required: true, message: '请输入用户名' },
    {
      validator: (value: string) => {
        return value.length >= 3
      },
      message: '用户名至少 3 个字符'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    {
      validator: (value: string) => {
        return /^1[3-9]\d{9}$/.test(value)
      },
      message: '请输入正确的手机号'
    }
  ],
  email: [
    {
      validator: (value: string) => {
        if (!value) return true
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      },
      message: '请输入正确的邮箱格式'
    }
  ]
}

const handleValidate = async () => {
  try {
    await formRef.value?.validate()
    uni.showToast({ title: '验证通过', icon: 'success' })
  } catch (error) {
    console.log('验证失败:', error)
  }
}

const handleReset = () => {
  formRef.value?.reset()
}
</script>

```

**技术实现:**
- `prop` 设置表单字段名,用于表单验证
- `rules` 定义验证规则数组
- `required` 显示必填标识(红色星号)
- 验证失败时自动显示错误提示信息
- 支持自定义 `errorMessageOffset` 调整错误信息位置

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:255-260, 269-270, 401, 499-504, 509-524

### 右对齐输入

通过 `align-right` 属性使输入内容右对齐。

```vue
<template>
  <view class="demo">
    <wd-input
      v-model="value1"
      label="金额"
      placeholder="0.00"
      type="digit"
      :align-right="true"
      suffix-icon="yuan"
    />

    <wd-input
      v-model="value2"
      label="数量"
      placeholder="0"
      type="number"
      :align-right="true"
      class="mt-16"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>

```

**使用说明:**
- `align-right` 设置输入内容右对齐
- 适用于金额、数量等数字输入场景
- 配合 `type="digit"` 或 `type="number"` 使用效果更佳

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:227-228, 45, 927-929

### 自定义样式

通过自定义类名和样式属性调整输入框外观。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">无边框输入框</view>
      <wd-input
        v-model="value1"
        placeholder="无下边框"
        :no-border="true"
      />
    </view>

    <view class="section">
      <view class="section-title">自定义容器样式</view>
      <wd-input
        v-model="value2"
        placeholder="自定义背景色"
        custom-class="custom-input"
        custom-style="background-color: #f0f9ff; border-radius: 8rpx; padding: 20rpx;"
      />
    </view>

    <view class="section">
      <view class="section-title">自定义输入框样式</view>
      <wd-input
        v-model="value3"
        placeholder="自定义字体样式"
        custom-inner-class="custom-inner"
      />
    </view>

    <view class="section">
      <view class="section-title">大尺寸输入框</view>
      <wd-input
        v-model="value4"
        label="大号输入"
        placeholder="使用 large 尺寸"
        size="large"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')
const value4 = ref('')
</script>

```

**使用说明:**
- `no-border` 隐藏输入框下边框
- `custom-class` 设置根节点自定义类名
- `custom-style` 设置根节点自定义样式
- `custom-input-class` 设置输入框包装器类名
- `custom-input-style` 设置输入框包装器样式
- `custom-inner-class` 设置输入框内部类名
- `custom-label-class` 设置标签类名
- `size` 设置组件尺寸,支持 `large`

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:179-190, 247-248, 253-254, 835-845, 887-910

### 键盘控制

控制软键盘的行为和样式。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">确认按钮类型</view>
      <wd-input
        v-model="value1"
        placeholder="键盘确认按钮显示为搜索"
        confirm-type="search"
        @confirm="handleConfirm"
      />
    </view>

    <view class="section">
      <view class="section-title">键盘高度监听</view>
      <wd-input
        v-model="value2"
        placeholder="监听键盘高度变化"
        @keyboardheightchange="handleKeyboardChange"
      />
      <view class="tips">键盘高度: {{ keyboardHeight }}px</view>
    </view>

    <view class="section">
      <view class="section-title">光标控制</view>
      <wd-input
        v-model="value3"
        placeholder="光标在第 5 个字符"
        :cursor="5"
      />
    </view>

    <view class="section">
      <view class="section-title">选择文本</view>
      <wd-button @click="selectText" size="small">
        选择第 3-8 个字符
      </wd-button>
      <wd-input
        v-model="value4"
        placeholder="点击按钮选择文本"
        :focus="focused"
        :selection-start="selectionStart"
        :selection-end="selectionEnd"
        class="mt-16"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('0123456789ABCDEFGHIJ')
const value4 = ref('0123456789ABCDEFGHIJ')

const keyboardHeight = ref(0)
const focused = ref(false)
const selectionStart = ref(-1)
const selectionEnd = ref(-1)

const handleConfirm = (detail: any) => {
  console.log('确认输入:', detail)
  uni.showToast({ title: '确认输入', icon: 'none' })
}

const handleKeyboardChange = (detail: any) => {
  keyboardHeight.value = detail.height || 0
}

const selectText = () => {
  selectionStart.value = 3
  selectionEnd.value = 8
  focused.value = false
  setTimeout(() => {
    focused.value = true
  }, 100)
}
</script>

```

**技术实现:**
- `confirm-type` 设置键盘确认按钮文字:send/search/next/go/done
- `confirm-hold` 点击确认按钮是否保持键盘不收起
- `cursor` 设置聚焦时光标位置
- `selection-start` 和 `selection-end` 设置文本选择范围
- `cursor-spacing` 设置光标与键盘的距离
- `adjust-position` 键盘弹起时是否自动上推页面
- `hold-keyboard` 聚焦状态下点击页面是否保持键盘

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:199-215, 54-62, 604-615

### 占位符样式

自定义占位符的样式和类名。

```vue
<template>
  <view class="demo">
    <wd-input
      v-model="value1"
      placeholder="自定义占位符颜色"
      placeholder-style="color: #1989fa; font-size: 32rpx; font-weight: 500;"
    />

    <wd-input
      v-model="value2"
      placeholder="使用自定义占位符类名"
      placeholder-class="custom-placeholder"
      class="mt-16"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>

```

**使用说明:**
- `placeholder-style` 设置占位符内联样式
- `placeholder-class` 设置占位符 CSS 类名
- 支持设置颜色、字体大小、字重等样式

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:193-198, 58, 64, 813-819

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | `string` \| `number` | `''` |
| type | 输入框类型 | `'text'` \| `'number'` \| `'digit'` \| `'idcard'` \| `'safe-password'` \| `'password'` \| `'nickname'` \| `'tel'` | `'text'` |
| placeholder | 占位提示文本 | `string` | `''` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| clearable | 是否显示清空按钮 | `boolean` | `false` |
| show-password | 是否显示密码切换按钮 | `boolean` | `false` |
| maxlength | 最大输入长度,-1 表示不限制 | `number` | `-1` |
| show-word-limit | 是否显示字数统计 | `boolean` | `false` |
| label | 左侧标签文字 | `string` | `''` |
| label-width | 标签宽度 | `string` \| `number` | `undefined` |
| prefix-icon | 前置图标名称 | `string` | `''` |
| suffix-icon | 后置图标名称 | `string` | `''` |
| align-right | 输入内容右对齐 | `boolean` | `false` |
| size | 组件尺寸 | `'large'` | - |
| error | 是否显示为错误状态 | `boolean` | `false` |
| center | 标签和输入框是否垂直居中 | `boolean` | `false` |
| no-border | 是否隐藏下边框 | `boolean` | `false` |
| required | 是否显示必填标识 | `boolean` | `false` |
| prop | 表单域字段名 | `string` | `''` |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| clear-trigger | 清空按钮显示时机 | `'always'` \| `'focus'` | `'always'` |
| focus-when-clear | 清空后是否自动聚焦 | `boolean` | `true` |
| focus | 是否获得焦点 | `boolean` | `false` |
| cursor | 聚焦时光标位置 | `number` | `-1` |
| cursor-spacing | 光标与键盘的距离(单位px) | `number` | `0` |
| confirm-type | 键盘确认按钮文字 | `'send'` \| `'search'` \| `'next'` \| `'go'` \| `'done'` | `'done'` |
| confirm-hold | 点击确认按钮是否保持键盘不收起 | `boolean` | `false` |
| selection-start | 光标起始位置 | `number` | `-1` |
| selection-end | 光标结束位置 | `number` | `-1` |
| adjust-position | 键盘弹起时是否自动上推页面 | `boolean` | `true` |
| hold-keyboard | 聚焦状态下点击页面是否保持键盘 | `boolean` | `false` |
| always-embed | 强制input处于同层状态 | `boolean` | `false` |
| placeholder-style | 占位符样式 | `string` | `''` |
| placeholder-class | 占位符类名 | `string` | `''` |
| inputmode | 输入模式 | `'none'` \| `'text'` \| `'decimal'` \| `'numeric'` \| `'tel'` \| `'search'` \| `'email'` \| `'url'` | `'text'` |
| ignore-composition-event | 是否忽略组件内文本合成事件 | `boolean` | `true` |
| error-message-offset | 错误信息的左边距偏移 | `string` \| `number` | `'0'` |
| custom-class | 根节点自定义类名 | `string` | `''` |
| custom-style | 根节点自定义样式 | `string` | `''` |
| custom-input-class | 输入框包装器自定义类名 | `string` | `''` |
| custom-input-style | 输入框包装器自定义样式 | `string` | `''` |
| custom-inner-class | 输入框内部自定义类名 | `string` | `''` |
| custom-label-class | 标签自定义类名 | `string` | `''` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:178-271, 312-350

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `value: string \| number` |
| input | 输入时触发 | `detail: any` |
| focus | 获得焦点时触发 | `detail: any` |
| blur | 失去焦点时触发 | `detail: { value: string \| number }` |
| clear | 点击清空按钮时触发 | - |
| confirm | 点击键盘确认按钮时触发 | `detail: any` |
| keyboardheightchange | 键盘高度变化时触发 | `detail: any` |
| clickprefixicon | 点击前置图标时触发 | - |
| clicksuffixicon | 点击后置图标时触发 | - |
| click | 点击输入框时触发 | `event: MouseEvent` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:276-297, 555-636

### Slots

| 插槽名 | 说明 |
|--------|------|
| prefix | 自定义前置图标内容 |
| suffix | 自定义后置图标内容 |
| label | 自定义标签内容 |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:302-309

### 类型定义

```typescript
/**
 * 输入框类型
 */
export type InputType =
  | 'text'
  | 'number'
  | 'digit'
  | 'idcard'
  | 'safe-password'
  | 'password'
  | 'nickname'
  | 'tel'

/**
 * 输入框确认类型
 */
type InputConfirmType = 'send' | 'search' | 'next' | 'go' | 'done'

/**
 * 输入框尺寸
 */
export type InputSize = 'large'

/**
 * 输入框模式
 */
type InputMode = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'

/**
 * 输入框清除触发时机
 */
type InputClearTrigger = 'focus' | 'always'

/**
 * 输入框组件属性接口
 */
interface WdInputProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 自定义输入框包装器样式类 */
  customInputClass?: string
  /** 自定义输入框包装器样式 */
  customInputStyle?: string
  /** 自定义输入框内部样式类 */
  customInnerClass?: string
  /** 自定义标签样式类 */
  customLabelClass?: string
  /** 占位文本 */
  placeholder?: string
  /** 指定 placeholder 的样式 */
  placeholderStyle?: string
  /** 指定 placeholder 的样式类 */
  placeholderClass?: string
  /** 指定光标与键盘的距离 */
  cursorSpacing?: number
  /** 指定focus时的光标位置 */
  cursor?: number
  /** 光标起始位置 */
  selectionStart?: number
  /** 光标结束位置 */
  selectionEnd?: number
  /** 键盘弹起时是否自动上推页面 */
  adjustPosition?: boolean
  /** focus时,点击页面的时候不收起键盘 */
  holdKeyboard?: boolean
  /** 设置键盘右下角按钮的文字 */
  confirmType?: InputConfirmType
  /** 点击键盘右下角按钮时是否保持键盘不收起 */
  confirmHold?: boolean
  /** 获取焦点 */
  focus?: boolean
  /** 输入框类型 */
  type?: InputType
  /** 最大长度 */
  maxlength?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 强制 input 处于同层状态 */
  alwaysEmbed?: boolean
  /** 输入框的值靠右展示 */
  alignRight?: boolean
  /** 绑定值 */
  modelValue?: string | number
  /** 显示为密码框 */
  showPassword?: boolean
  /** 显示清空按钮 */
  clearable?: boolean
  /** 只读 */
  readonly?: boolean
  /** 前置图标 */
  prefixIcon?: string
  /** 后置图标 */
  suffixIcon?: string
  /** 显示字数限制 */
  showWordLimit?: boolean
  /** 设置左侧标题 */
  label?: string
  /** 设置左侧标题宽度 */
  labelWidth?: string | number
  /** 设置输入框大小 */
  size?: InputSize
  /** 设置输入框错误状态 */
  error?: boolean
  /** 当有label属性时,设置标题和输入框垂直居中 */
  center?: boolean
  /** 非 cell 类型下是否隐藏下划线 */
  noBorder?: boolean
  /** 是否必填 */
  required?: boolean
  /** 表单域 model 字段名 */
  prop?: string
  /** 表单验证规则 */
  rules?: FormItemRule[]
  /** 显示清除图标的时机 */
  clearTrigger?: InputClearTrigger
  /** 是否在点击清除按钮时聚焦输入框 */
  focusWhenClear?: boolean
  /** 是否忽略组件内对文本合成系统事件的处理 */
  ignoreCompositionEvent?: boolean
  /** 输入模式 */
  inputmode?: InputMode
  /** 错误信息的左边距偏移 */
  errorMessageOffset?: string | number
}

/**
 * 输入框组件事件接口
 */
interface WdInputEmits {
  /** 更新绑定值 */
  'update:modelValue': [value: string | number]
  /** 清空输入框 */
  clear: []
  /** 失去焦点 */
  blur: [detail: { value: string | number }]
  /** 获得焦点 */
  focus: [detail: any]
  /** 输入内容 */
  input: [detail: any]
  /** 键盘高度变化 */
  keyboardheightchange: [detail: any]
  /** 确认输入 */
  confirm: [detail: any]
  /** 点击后置图标 */
  clicksuffixicon: []
  /** 点击前置图标 */
  clickprefixicon: []
  /** 点击输入框 */
  click: [event: MouseEvent]
}
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:143-297

## 主题定制

### CSS 变量

Input 组件提供了以下 CSS 变量用于主题定制:

```scss
// 输入框变量
$-input-bg: #fff !default;                              // 背景色
$-input-fs: 28rpx !default;                             // 字体大小
$-input-fs-large: 32rpx !default;                       // 大号字体大小
$-input-color: $-color-text-primary !default;           // 文字颜色
$-input-padding: 24rpx !default;                        // 左右内边距
$-input-cell-padding: 24rpx !default;                   // 单元格模式上下内边距
$-input-cell-padding-large: 32rpx !default;             // 单元格模式大号内边距
$-input-cell-bg: #fff !default;                         // 单元格背景色
$-input-cell-height: 48rpx !default;                    // 单元格高度
$-input-cell-label-width: 200rpx !default;              // 单元格标签宽度
$-input-inner-height: 96rpx !default;                   // 输入框高度
$-input-inner-height-no-border: 56rpx !default;         // 无边框时高度
$-input-icon-size: 32rpx !default;                      // 图标大小
$-input-icon-size-large: 40rpx !default;                // 大号图标大小
$-input-icon-margin: 16rpx !default;                    // 图标间距
$-input-icon-color: $-color-text-secondary !default;    // 图标颜色
$-input-clear-color: $-color-text-placeholder !default; // 清空按钮颜色
$-input-count-fs: 24rpx !default;                       // 字数统计字体大小
$-input-count-fs-large: 28rpx !default;                 // 字数统计大号字体
$-input-count-color: $-color-text-placeholder !default; // 字数统计颜色
$-input-count-current-color: $-color-text-secondary !default; // 当前字数颜色
$-input-border-color: $-border-color !default;          // 边框颜色
$-input-not-empty-border-color: $-color-text-primary !default; // 有内容时边框颜色
$-input-cell-border-color: $-border-color !default;     // 单元格边框颜色
$-input-disabled-color: $-disabled-color !default;      // 禁用文字颜色
$-input-error-color: $-color-danger !default;           // 错误状态颜色
$-input-placeholder-color: $-color-text-placeholder !default; // 占位符颜色

// 暗黑模式
$-dark-background2: #1a1a1a !default;                   // 暗黑背景色
$-dark-color: #e5e5e5 !default;                         // 暗黑文字颜色
$-dark-color3: #666 !default;                           // 暗黑占位符颜色
$-dark-color-gray: #999 !default;                       // 暗黑禁用颜色
$-dark-border-color: #333 !default;                     // 暗黑边框颜色
```

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-input
      v-model="value"
      label="自定义主题"
      placeholder="输入内容"
      :clearable="true"
      :maxlength="50"
      :show-word-limit="true"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:639-978

## 最佳实践

### 1. 合理选择输入类型

根据输入内容选择合适的 type 类型:

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐:使用对应的输入类型 -->
    <wd-input v-model="phone" type="tel" placeholder="手机号" />
    <wd-input v-model="number" type="number" placeholder="整数" />
    <wd-input v-model="amount" type="digit" placeholder="金额" />
    <wd-input v-model="idcard" type="idcard" placeholder="身份证" />

    <!-- ❌ 避免:全部使用 text 类型 -->
    <wd-input v-model="phone2" type="text" placeholder="手机号" />
  </view>
</template>
```

**建议:**
- 电话号码使用 `type="tel"`
- 纯数字使用 `type="number"`
- 带小数点的数字使用 `type="digit"`
- 身份证使用 `type="idcard"`
- 密码使用 `show-password` 而不是 `type="password"`

### 2. 清空按钮的合理配置

根据交互需求选择合适的清空时机:

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐:聚焦时显示,减少视觉干扰 -->
    <wd-input
      v-model="value1"
      :clearable="true"
      clear-trigger="focus"
      :focus-when-clear="true"
    />

    <!-- ✅ 适用于:需要快速清空的场景 -->
    <wd-input
      v-model="value2"
      :clearable="true"
      clear-trigger="always"
    />

    <!-- ✅ 清空后不聚焦 -->
    <wd-input
      v-model="value3"
      :clearable="true"
      :focus-when-clear="false"
    />
  </view>
</template>
```

**建议:**
- 默认使用 `clear-trigger="focus"`,减少干扰
- 清空后默认自动聚焦,保持操作连贯性
- 只读和禁用状态不显示清空按钮

### 3. 表单集成最佳实践

在表单中使用输入框的推荐方式:

```vue
<template>
  <wd-form :model="formData" :rules="rules">
    <!-- ✅ 正确:设置 prop、label、required -->
    <wd-input
      v-model="formData.username"
      label="用户名"
      prop="username"
      :maxlength="20"
      required
    />

    <!-- ✅ 可选字段:不设置 required -->
    <wd-input
      v-model="formData.remark"
      label="备注"
      prop="remark"
      placeholder="选填"
    />
  </wd-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import type { FormItemRule } from '@/wd'

const formData = reactive({
  username: '',
  remark: ''
})

const rules: Record<string, FormItemRule[]> = {
  username: [
    { required: true, message: '请输入用户名' },
    {
      validator: (value: string) => value.length >= 3,
      message: '用户名至少 3 个字符'
    }
  ]
}
</script>
```

**建议:**
- 必填字段设置 `required` 显示红色星号
- 使用 `prop` 关联表单字段,支持验证
- 设置合理的 `maxlength`,防止输入过长
- 为重要字段启用字数统计

### 4. 前后置图标的正确使用

合理使用前后置图标提升用户体验:

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐:语义化的图标使用 -->
    <wd-input
      v-model="keyword"
      prefix-icon="search"
      placeholder="搜索内容"
    />

    <wd-input
      v-model="username"
      prefix-icon="user"
      placeholder="用户名"
    />

    <!-- ✅ 后置图标用于操作 -->
    <wd-input
      v-model="code"
      suffix-icon="refresh"
      placeholder="验证码"
      @clicksuffixicon="refreshCode"
    />

    <!-- ❌ 避免:不必要的图标 -->
    <wd-input
      v-model="value"
      prefix-icon="home"
      placeholder="请输入内容"
    />
  </view>
</template>
```

**建议:**
- 前置图标用于标识输入内容类型
- 后置图标用于触发相关操作
- 避免使用与内容无关的装饰性图标
- 使用语义化的图标提升可理解性

### 5. 性能优化建议

优化输入框组件的性能:

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐:使用 v-model,避免频繁更新 -->
    <wd-input
      v-model="value"
      @blur="handleSubmit"
    />

    <!-- ✅ 长列表中:按需渲染 -->
    <view v-for="item in list" :key="item.id">
      <wd-input
        v-if="editingId === item.id"
        v-model="item.name"
      />
      <text v-else>{{ item.name }}</text>
    </view>

    <!-- ❌ 避免:在 input 事件中执行耗时操作 -->
    <wd-input
      v-model="value2"
      @input="heavyComputation"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const value2 = ref('')

// ✅ 推荐:在 blur 时处理
const handleSubmit = () => {
  // 提交数据
}

// ❌ 避免:频繁触发的耗时操作
const heavyComputation = () => {
  // 复杂计算
}
</script>
```

**建议:**
- 避免在 `input` 事件中执行耗时操作
- 数据提交使用 `blur` 或 `confirm` 事件
- 长列表中按需渲染输入框组件
- 合理使用防抖处理频繁输入

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:598-601

## 常见问题

### 1. 为什么字数统计不显示?

**问题原因:**
- 只设置了 `show-word-limit`,没有设置 `maxlength`
- `maxlength` 设置为 -1(默认值)
- 组件处于禁用或只读状态

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ❌ 错误:缺少 maxlength -->
    <wd-input
      v-model="value1"
      :show-word-limit="true"
    />

    <!-- ✅ 正确:同时设置两个属性 -->
    <wd-input
      v-model="value2"
      :maxlength="50"
      :show-word-limit="true"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:491-494

### 2. 清空按钮点击后输入框没有聚焦

**问题原因:**
- `focus-when-clear` 设置为 `false`
- 或者在某些平台上聚焦延迟导致

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ✅ 确保 focus-when-clear 为 true -->
    <wd-input
      v-model="value"
      :clearable="true"
      :focus-when-clear="true"
    />
  </view>
</template>
```

组件内部实现了延迟聚焦机制:

```typescript
// 清空后聚焦逻辑
const handleClear = async () => {
  focusing.value = false
  inputValue.value = ''
  if (props.focusWhenClear) {
    clearing.value = true
    focused.value = false
  }
  await pause() // 等待状态更新
  if (props.focusWhenClear) {
    focused.value = true
    focusing.value = true
  }
  emit('update:modelValue', inputValue.value)
  emit('clear')
}
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:555-569

### 3. 表单验证错误信息不显示

**问题原因:**
- 没有设置 `prop` 属性
- 没有在父组件 `wd-form` 中定义验证规则
- 表单字段名与 `prop` 不匹配

**解决方案:**

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="rules">
    <!-- ✅ 正确:设置 prop 并定义规则 -->
    <wd-input
      v-model="formData.username"
      label="用户名"
      prop="username"
      required
    />
  </wd-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance, FormItemRule } from '@/wd'

const formRef = ref<FormInstance>()

const formData = reactive({
  username: ''  // ✅ 字段名与 prop 一致
})

// ✅ 定义验证规则
const rules: Record<string, FormItemRule[]> = {
  username: [  // ✅ 规则名与 prop 一致
    { required: true, message: '请输入用户名' }
  ]
}
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:499-504

### 4. 密码切换图标不显示

**问题原因:**
- 没有设置 `show-password` 属性
- 或者同时设置了 `suffix-icon` 导致冲突

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ✅ 正确:使用 show-password -->
    <wd-input
      v-model="password1"
      :show-password="true"
    />

    <!-- ❌ 错误:同时设置 suffix-icon -->
    <wd-input
      v-model="password2"
      :show-password="true"
      suffix-icon="setting"
    />
  </view>
</template>
```

**注意:**
- `show-password` 会在后置区域显示眼睛图标
- 不要同时设置 `suffix-icon`,会导致图标显示冲突
- 密码切换图标优先级高于自定义后置图标

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:84-89

### 5. 输入框内容不对齐

**问题原因:**
- 标签和输入框高度不一致
- 没有设置 `center` 属性

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ✅ 使用 center 属性垂直居中 -->
    <wd-input
      v-model="value1"
      label="标题"
      :center="true"
    />

    <!-- ✅ 或者调整标签样式 -->
    <wd-input
      v-model="value2"
      label="标题"
      custom-label-class="custom-label"
    />
  </view>
</template>

```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:251-252, 878-880

## 注意事项

1. **输入类型限制**: 不同的 `type` 会调起不同的键盘,选择合适的类型提升输入体验

2. **字数统计依赖**: `show-word-limit` 必须配合 `maxlength` 使用,且 `maxlength` 不能为 -1

3. **清空按钮显示条件**: 清空按钮只在非禁用、非只读、有内容时显示,受 `clear-trigger` 控制

4. **密码显示优先级**: `show-password` 会占用后置图标位置,不要同时设置 `suffix-icon`

5. **表单集成要求**: 使用表单验证时必须设置 `prop` 属性,且值要与表单数据字段名一致

6. **标签宽度继承**: 组件 `label-width` 可以继承父组件 `wd-form` 的 `label-width`,优先使用组件自身设置

7. **只读遮罩实现**: `readonly` 状态通过添加透明遮罩层实现,保持视觉一致性

8. **焦点控制**: `focus` 属性支持动态控制输入框聚焦状态

9. **光标位置**: `cursor`、`selection-start`、`selection-end` 只在聚焦时有效

10. **边框控制**: `no-border` 可隐藏输入框下边框,适用于特殊场景

11. **性能优化**: 避免在 `input` 事件中执行耗时操作,建议在 `blur` 或 `confirm` 事件中处理

12. **键盘控制**: `confirm-type` 设置键盘确认按钮样式,`adjust-position` 控制键盘弹起行为

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-input/wd-input.vue:1-979
