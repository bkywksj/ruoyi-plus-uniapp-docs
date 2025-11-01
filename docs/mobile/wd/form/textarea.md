# Textarea 文本域

## 介绍

Textarea 文本域是一个功能强大的多行文本输入组件,用于收集用户的长文本内容,如评论、反馈、描述等场景。它基于 UniApp 的原生 textarea 组件封装,提供了丰富的配置选项和良好的用户体验,支持自动高度调整、字数统计、表单验证等高级功能。

**核心特性:**

- **多行输入** - 支持多行文本输入,可设置固定行数或自动高度调整,满足不同文本长度需求
- **字数统计** - 内置字数统计功能,实时显示当前字数和最大字数,支持多码元字符正确计数
- **表单集成** - 完美集成 WdForm 表单组件,支持表单验证、必填标识、错误提示等功能
- **智能清空** - 提供清空按钮,支持两种触发时机(始终显示/聚焦时显示),清空后可自动聚焦
- **高度控制** - 支持三种高度模式:固定行数、自动高度、限制最大行数,灵活适配不同场景
- **前置标签** - 支持左侧标签、前置图标,可自定义标签宽度,提供居中对齐选项
- **只读禁用** - 支持只读和禁用状态,只读模式通过遮罩层实现,保持良好的视觉一致性
- **暗黑模式** - 内置暗黑模式支持,自动适配系统主题,提供一致的用户体验

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:1-925

## 基本用法

### 基础文本域

最简单的文本域使用方式,通过 `v-model` 双向绑定输入值。

```vue
<template>
  <view class="demo">
    <wd-textarea
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

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.result {
  margin-top: 32rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
```

**使用说明:**
- 使用 `v-model` 绑定输入值,支持双向数据绑定
- `placeholder` 设置占位提示文本
- 默认行数为自适应,根据内容自动调整高度

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:151-152

### 固定行数

通过 `rows` 属性设置文本域的固定行数,超出内容可滚动查看。

```vue
<template>
  <view class="demo">
    <wd-textarea
      v-model="value1"
      placeholder="设置 3 行高度"
      :rows="3"
    />

    <wd-textarea
      v-model="value2"
      placeholder="设置 5 行高度"
      :rows="5"
      class="mt-16"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.mt-16 {
  margin-top: 32rpx;
}
</style>
```

**技术实现:**
- `rows` 属性通过计算每行 48rpx 高度来设置文本域的固定高度
- 固定行数模式下,内容超出时显示垂直滚动条
- 通过 `resize: none` 禁用用户调整大小

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:169-507

### 自动高度

启用 `auto-height` 属性后,文本域高度会根据内容自动调整。

```vue
<template>
  <view class="demo">
    <wd-textarea
      v-model="value"
      placeholder="输入内容自动增高"
      :auto-height="true"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- 设置 `auto-height` 为 `true` 启用自动高度
- 文本域高度会随着输入内容的增加而自动增长
- 适用于内容长度不确定的场景

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:167-168

### 限制最大行数

结合 `auto-height` 和 `maxRows` 属性,可以限制自动增高的最大行数。

```vue
<template>
  <view class="demo">
    <wd-textarea
      v-model="value"
      placeholder="最多显示 4 行,超出可滚动"
      :auto-height="true"
      :maxRows="4"
    />
    <view class="tips">提示: 输入超过 4 行后会出现滚动条</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.tips {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
```

**技术实现:**
- `maxRows` 通过设置 `max-height` 来限制最大高度
- 内容超出最大高度时显示滚动条
- 必须配合 `auto-height` 使用,且不能同时设置 `rows`

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:171-523

### 字数统计

通过 `show-word-limit` 和 `maxlength` 属性显示字数统计。

```vue
<template>
  <view class="demo">
    <wd-textarea
      v-model="value"
      placeholder="最多输入 100 个字符"
      :maxlength="100"
      :show-word-limit="true"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**技术实现:**
- `maxlength` 设置最大字符数,-1 表示不限制
- `show-word-limit` 显示字数统计,格式为 "当前字数/最大字数"
- 使用 `Array.from` 处理多码元字符(如 emoji),确保字数统计准确
- 超出最大字数时,当前字数显示为红色

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:161-162, 205-206, 465-471

### 带标签的文本域

通过 `label` 属性设置左侧标签,支持自定义标签宽度。

```vue
<template>
  <view class="demo">
    <wd-textarea
      v-model="value1"
      label="备注"
      placeholder="请输入备注信息"
      :rows="3"
    />

    <wd-textarea
      v-model="value2"
      label="详细说明"
      placeholder="请输入详细说明"
      label-width="150rpx"
      :rows="3"
      class="mt-16"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.mt-16 {
  margin-top: 32rpx;
}
</style>
```

**使用说明:**
- `label` 设置左侧标签文字
- `label-width` 自定义标签宽度,支持 rpx/px 单位
- 标签宽度优先级:组件 `labelWidth` > Form `labelWidth` > 默认值

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:207-210, 334-347

### 清空按钮

通过 `clearable` 属性显示清空按钮。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">始终显示清空按钮</view>
      <wd-textarea
        v-model="value1"
        placeholder="有内容时显示清空按钮"
        :clearable="true"
        clear-trigger="always"
        :rows="3"
      />
    </view>

    <view class="section">
      <view class="section-title">聚焦时显示清空按钮</view>
      <wd-textarea
        v-model="value2"
        placeholder="聚焦且有内容时显示"
        :clearable="true"
        clear-trigger="focus"
        :rows="3"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('这是一段文本内容')
const value2 = ref('这是一段文本内容')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.section {
  margin-bottom: 32rpx;
}
.section-title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
}
</style>
```

**技术实现:**
- `clearable` 启用清空功能
- `clear-trigger` 控制清空按钮显示时机:
  - `always`: 有内容时始终显示
  - `focus`: 聚焦且有内容时显示
- `focus-when-clear` 控制清空后是否自动聚焦(默认 `true`)

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:199-200, 223-226, 398-407, 537-551

## 高级用法

### 前置图标

支持在标签前显示图标,可使用内置图标或自定义插槽。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">内置图标</view>
      <wd-textarea
        v-model="value1"
        label="意见反馈"
        prefix-icon="edit"
        placeholder="请输入您的意见"
        :rows="3"
        @clickprefixicon="handleIconClick"
      />
    </view>

    <view class="section">
      <view class="section-title">自定义前置内容</view>
      <wd-textarea
        v-model="value2"
        label="描述"
        :rows="3"
      >
        <template #prefix>
          <wd-icon name="bell" color="#1989fa" />
        </template>
      </wd-textarea>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')

const handleIconClick = () => {
  console.log('前置图标被点击')
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.section {
  margin-bottom: 32rpx;
}
.section-title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
}
</style>
```

**使用说明:**
- `prefix-icon` 设置内置图标名称
- `prefix` 插槽可自定义前置内容
- `clickprefixicon` 事件监听图标点击

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:203-204, 12-19, 613-615

### 只读和禁用

只读和禁用状态有不同的视觉和交互效果。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">只读状态</view>
      <wd-textarea
        v-model="readonlyValue"
        label="只读内容"
        :readonly="true"
        :rows="3"
      />
      <view class="tips">只读状态下无法编辑,但可以选择复制</view>
    </view>

    <view class="section">
      <view class="section-title">禁用状态</view>
      <wd-textarea
        v-model="disabledValue"
        label="禁用内容"
        :disabled="true"
        :rows="3"
      />
      <view class="tips">禁用状态下完全不可交互</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const readonlyValue = ref('这是只读内容,可以选择但不能编辑')
const disabledValue = ref('这是禁用内容,完全不可交互')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.section {
  margin-bottom: 32rpx;
}
.section-title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
}
.tips {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
```

**技术实现:**
- `readonly` 通过遮罩层实现只读,用户无法编辑但可以查看
- `disabled` 完全禁用文本域,样式变灰且无法交互
- 只读和禁用状态下都不显示清空按钮

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:159-160, 201-202, 70, 838-850

### 表单验证集成

与 WdForm 组件集成,支持表单验证功能。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-textarea
        v-model="formData.description"
        label="商品描述"
        prop="description"
        placeholder="请输入商品描述"
        :maxlength="200"
        :show-word-limit="true"
        :auto-height="true"
        :maxRows="5"
        required
      />

      <wd-textarea
        v-model="formData.remark"
        label="备注"
        prop="remark"
        placeholder="请输入备注信息(选填)"
        :rows="3"
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
  description: '',
  remark: ''
})

const rules: Record<string, FormItemRule[]> = {
  description: [
    { required: true, message: '请输入商品描述' },
    {
      validator: (value: string) => {
        return value.length >= 10
      },
      message: '商品描述至少 10 个字符'
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

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.button-group {
  margin-top: 32rpx;
}
.mt-16 {
  margin-top: 16rpx;
}
</style>
```

**技术实现:**
- `prop` 设置表单字段名,用于表单验证
- `rules` 定义验证规则数组
- `required` 显示必填标识(红色星号)
- 验证失败时自动显示错误提示信息

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:219-222, 328-329, 420-426, 431-446

### 自定义样式

通过自定义类名和样式属性调整文本域外观。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">自定义容器样式</view>
      <wd-textarea
        v-model="value1"
        placeholder="自定义背景色和边框"
        :rows="3"
        custom-class="custom-textarea"
        custom-style="border-radius: 16rpx; border: 2rpx solid #1989fa;"
      />
    </view>

    <view class="section">
      <view class="section-title">自定义输入框样式</view>
      <wd-textarea
        v-model="value2"
        placeholder="自定义字体和颜色"
        :rows="3"
        custom-textarea-class="custom-inner"
      />
    </view>

    <view class="section">
      <view class="section-title">大尺寸文本域</view>
      <wd-textarea
        v-model="value3"
        label="大号文本"
        placeholder="使用 large 尺寸"
        size="large"
        :rows="3"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.section {
  margin-bottom: 32rpx;
}
.section-title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
}

:deep(.custom-textarea) {
  background-color: #f0f9ff;
}

:deep(.custom-inner) {
  font-size: 32rpx;
  color: #1989fa;
  font-weight: 500;
}
</style>
```

**使用说明:**
- `custom-class` 设置根节点自定义类名
- `custom-style` 设置根节点自定义样式
- `custom-textarea-class` 设置 textarea 元素类名
- `custom-textarea-container-class` 设置文本域容器类名
- `custom-label-class` 设置标签类名
- `size` 设置组件尺寸,支持 `large`

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:139-148, 211-212, 899-922

### 键盘控制

控制软键盘的行为和样式。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">确认按钮类型</view>
      <wd-textarea
        v-model="value1"
        placeholder="键盘确认按钮显示为发送"
        confirm-type="send"
        :rows="2"
        @confirm="handleConfirm"
      />
    </view>

    <view class="section">
      <view class="section-title">键盘高度监听</view>
      <wd-textarea
        v-model="value2"
        placeholder="监听键盘高度变化"
        :rows="2"
        @keyboardheightchange="handleKeyboardChange"
      />
      <view class="tips">键盘高度: {{ keyboardHeight }}px</view>
    </view>

    <view class="section">
      <view class="section-title">光标控制</view>
      <wd-textarea
        v-model="value3"
        placeholder="自动聚焦到第 10 个字符"
        :auto-focus="true"
        :cursor="10"
        :rows="2"
      />
    </view>

    <view class="section">
      <view class="section-title">选择文本</view>
      <wd-button @click="selectText" size="small">
        选择第 5-10 个字符
      </wd-button>
      <wd-textarea
        v-model="value4"
        placeholder="点击按钮选择文本"
        :focus="focused"
        :selection-start="selectionStart"
        :selection-end="selectionEnd"
        :rows="2"
        class="mt-16"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('0123456789这里是第10个字符位置')
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
  selectionStart.value = 5
  selectionEnd.value = 10
  focused.value = false
  setTimeout(() => {
    focused.value = true
  }, 100)
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.section {
  margin-bottom: 32rpx;
}
.section-title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
}
.tips {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}
.mt-16 {
  margin-top: 16rpx;
}
</style>
```

**技术实现:**
- `confirm-type` 设置键盘确认按钮文字,可选: send/search/next/go/done
- `confirm-hold` 点击确认按钮是否保持键盘不收起
- `cursor` 设置聚焦时光标位置
- `selection-start` 和 `selection-end` 设置文本选择范围
- `cursor-spacing` 设置光标与键盘的距离
- `adjust-position` 键盘弹起时是否自动上推页面

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:176-189, 592-608

### 占位符样式

自定义占位符的样式和类名。

```vue
<template>
  <view class="demo">
    <wd-textarea
      v-model="value1"
      placeholder="自定义占位符颜色"
      placeholder-style="color: #1989fa; font-size: 32rpx;"
      :rows="3"
    />

    <wd-textarea
      v-model="value2"
      placeholder="使用自定义占位符类名"
      placeholder-class="custom-placeholder"
      :rows="3"
      class="mt-16"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
.mt-16 {
  margin-top: 32rpx;
}

:deep(.custom-placeholder) {
  color: #ff6b6b !important;
  font-style: italic;
}
</style>
```

**使用说明:**
- `placeholder-style` 设置占位符内联样式
- `placeholder-class` 设置占位符 CSS 类名
- 微信小程序端会自动修复占位符对齐问题

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:154-158, 353-364, 475-478

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | `string` \| `number` | `''` |
| placeholder | 占位提示文本 | `string` | `''` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| clearable | 是否显示清空按钮 | `boolean` | `false` |
| maxlength | 最大输入长度,-1 表示不限制 | `number` | `-1` |
| show-word-limit | 是否显示字数统计 | `boolean` | `false` |
| auto-height | 是否自动增高 | `boolean` | `false` |
| rows | 固定显示行数 | `number` | `undefined` |
| maxRows | 自动增高时的最大行数 | `number` | `undefined` |
| label | 左侧标签文字 | `string` | `''` |
| label-width | 标签宽度 | `string` | `undefined` |
| prefix-icon | 前置图标名称 | `string` | `''` |
| size | 组件尺寸 | `string` | `''` |
| error | 是否显示为错误状态 | `boolean` | `false` |
| center | 标签和输入框是否垂直居中 | `boolean` | `false` |
| required | 是否显示必填标识 | `boolean` | `false` |
| prop | 表单域字段名 | `string` | `''` |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| clear-trigger | 清空按钮显示时机 | `'always'` \| `'focus'` | `'always'` |
| focus-when-clear | 清空后是否自动聚焦 | `boolean` | `true` |
| auto-focus | 是否自动聚焦 | `boolean` | `false` |
| focus | 是否获得焦点 | `boolean` | `false` |
| cursor | 聚焦时光标位置 | `number` | `-1` |
| cursor-spacing | 光标与键盘的距离(单位px) | `number` | `0` |
| confirm-type | 键盘确认按钮文字 | `'send'` \| `'search'` \| `'next'` \| `'go'` \| `'done'` | `'done'` |
| confirm-hold | 点击确认按钮是否保持键盘不收起 | `boolean` | `false` |
| show-confirm-bar | 是否显示键盘上方确认栏 | `boolean` | `true` |
| selection-start | 光标起始位置 | `number` | `-1` |
| selection-end | 光标结束位置 | `number` | `-1` |
| adjust-position | 键盘弹起时是否自动上推页面 | `boolean` | `true` |
| hold-keyboard | 聚焦状态下点击页面是否保持键盘 | `boolean` | `false` |
| disable-default-padding | 是否去掉iOS默认内边距 | `boolean` | `false` |
| fixed | textarea是否在fixed区域 | `boolean` | `false` |
| placeholder-style | 占位符样式 | `string` | `''` |
| placeholder-class | 占位符类名 | `string` | `''` |
| inputmode | 输入模式 | `'none'` \| `'text'` \| `'tel'` \| `'url'` \| `'email'` \| `'numeric'` \| `'decimal'` \| `'search'` \| `'password'` | `'text'` |
| ignore-composition-event | 是否忽略组件内文本合成事件 | `boolean` | `true` |
| custom-class | 根节点自定义类名 | `string` | `''` |
| custom-style | 根节点自定义样式 | `string` | `''` |
| custom-textarea-container-class | 文本域容器自定义类名 | `string` | `''` |
| custom-textarea-class | textarea元素自定义类名 | `string` | `''` |
| custom-label-class | 标签自定义类名 | `string` | `''` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:138-231, 268-307

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `value: string` |
| input | 输入时触发 | `detail: any` |
| focus | 获得焦点时触发 | `detail: any` |
| blur | 失去焦点时触发 | `detail: { value: string, cursor: number \| null }` |
| clear | 点击清空按钮时触发 | - |
| confirm | 点击键盘确认按钮时触发 | `detail: any` |
| linechange | 行数变化时触发 | `detail: any` |
| keyboardheightchange | 键盘高度变化时触发 | `detail: any` |
| clickprefixicon | 点击前置图标时触发 | - |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:236-257, 537-615

### Slots

| 插槽名 | 说明 |
|--------|------|
| prefix | 自定义前置图标内容 |
| label | 自定义标签内容 |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:262-265

### 类型定义

```typescript
/**
 * 确认按钮类型
 */
type ConfirmType = 'send' | 'search' | 'next' | 'go' | 'done'

/**
 * 输入模式类型
 */
type InputMode =
  | 'none'
  | 'text'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'search'
  | 'password'

/**
 * 清除触发类型
 */
type InputClearTrigger = 'focus' | 'always'

/**
 * 文本域组件属性接口
 */
interface WdTextareaProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 自定义文本域容器class名称 */
  customTextareaContainerClass?: string
  /** 自定义文本域class名称 */
  customTextareaClass?: string
  /** 自定义标签class名称 */
  customLabelClass?: string
  /** 绑定值 */
  modelValue?: string | number
  /** 占位文本 */
  placeholder?: string
  /** 指定placeholder的样式 */
  placeholderStyle?: string
  /** 指定placeholder的样式类 */
  placeholderClass?: string
  /** 禁用输入框 */
  disabled?: boolean
  /** 最大输入长度 */
  maxlength?: number
  /** 自动聚焦并拉起键盘 */
  autoFocus?: boolean
  /** 获取焦点 */
  focus?: boolean
  /** 是否自动增高输入框高度 */
  autoHeight?: boolean
  /** 文本域显示行数 */
  rows?: number
  /** 自动高度时的最大行数 */
  maxRows?: number
  /** 如果textarea处于position:fixed区域 */
  fixed?: boolean
  /** 指定光标与键盘的距离 */
  cursorSpacing?: number
  /** 指定focus时的光标位置 */
  cursor?: number
  /** 设置键盘右下角按钮的文字 */
  confirmType?: ConfirmType
  /** 点击键盘右下角按钮时是否保持键盘不收起 */
  confirmHold?: boolean
  /** 是否显示键盘上方带有"完成"按钮那一栏 */
  showConfirmBar?: boolean
  /** 光标起始位置 */
  selectionStart?: number
  /** 光标结束位置 */
  selectionEnd?: number
  /** 键盘弹起时是否自动上推页面 */
  adjustPosition?: boolean
  /** 是否去掉iOS下的默认内边距 */
  disableDefaultPadding?: boolean
  /** focus状态下点击页面时是否不收起键盘 */
  holdKeyboard?: boolean
  /** 是否显示清空按钮 */
  clearable?: boolean
  /** 输入框只读状态 */
  readonly?: boolean
  /** 前置图标 */
  prefixIcon?: string
  /** 是否显示字数限制 */
  showWordLimit?: boolean
  /** 设置左侧标题 */
  label?: string
  /** 设置左侧标题宽度 */
  labelWidth?: string
  /** 设置输入框大小 */
  size?: string
  /** 设置输入框错误状态 */
  error?: boolean
  /** 当存在label属性时,设置标题和输入框垂直居中 */
  center?: boolean
  /** cell类型下必填样式 */
  required?: boolean
  /** 表单域model字段名 */
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
}

/**
 * 文本域组件事件接口
 */
interface WdTextareaEmits {
  /** 更新绑定值 */
  'update:modelValue': [value: string]
  /** 清空输入框 */
  clear: []
  /** 失去焦点 */
  blur: [detail: { value: string; cursor: number | null }]
  /** 获得焦点 */
  focus: [detail: any]
  /** 输入时触发 */
  input: [detail: any]
  /** 键盘高度变化 */
  keyboardheightchange: [detail: any]
  /** 点击确认按钮 */
  confirm: [detail: any]
  /** 行数变化 */
  linechange: [detail: any]
  /** 点击前置图标 */
  clickprefixicon: []
}
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:111-257

## 主题定制

### CSS 变量

Textarea 组件提供了以下 CSS 变量用于主题定制:

```scss
// 文本域变量
$-textarea-bg: #fff !default;                           // 背景色
$-textarea-fs: 28rpx !default;                          // 字体大小
$-textarea-fs-large: 32rpx !default;                    // 大号字体大小
$-textarea-color: $-color-text-primary !default;        // 文字颜色
$-textarea-padding: 24rpx !default;                     // 左右内边距
$-textarea-cell-padding: 24rpx !default;                // 单元格模式上下内边距
$-textarea-cell-padding-large: 32rpx !default;          // 单元格模式大号内边距
$-textarea-cell-height: 48rpx !default;                 // 单元格高度
$-textarea-icon-size: 32rpx !default;                   // 图标大小
$-textarea-icon-size-large: 40rpx !default;             // 大号图标大小
$-textarea-icon-margin: 16rpx !default;                 // 图标间距
$-textarea-icon-color: $-color-text-secondary !default; // 图标颜色
$-textarea-clear-color: $-color-text-placeholder !default; // 清空按钮颜色
$-textarea-count-fs: 24rpx !default;                    // 字数统计字体大小
$-textarea-count-fs-large: 28rpx !default;              // 字数统计大号字体
$-textarea-count-color: $-color-text-placeholder !default; // 字数统计颜色
$-textarea-count-current-color: $-color-text-secondary !default; // 当前字数颜色

// 暗黑模式
$-dark-background2: #1a1a1a !default;                   // 暗黑背景色
$-dark-color: #e5e5e5 !default;                         // 暗黑文字颜色
$-dark-color3: #666 !default;                           // 暗黑占位符颜色
$-dark-color-gray: #999 !default;                       // 暗黑禁用颜色
```

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-textarea
      v-model="value"
      label="自定义主题"
      placeholder="输入内容"
      :rows="3"
      :maxlength="100"
      :show-word-limit="true"
      clearable
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

<style lang="scss" scoped>
.custom-theme {
  padding: 32rpx;

  :deep(.wd-textarea) {
    --textarea-bg: #f0f9ff;
    --textarea-fs: 32rpx;
    --textarea-color: #1890ff;
    --textarea-icon-color: #1890ff;
    --textarea-count-color: #69b1ff;
    --textarea-count-current-color: #1890ff;
    border-radius: 16rpx;
    border: 2rpx solid #91d5ff;
  }
}
</style>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:625-924

## 最佳实践

### 1. 合理设置高度模式

根据使用场景选择合适的高度模式:

```vue
<template>
  <view class="demo">
    <!-- ✅ 短文本输入:使用固定行数 -->
    <wd-textarea
      v-model="shortText"
      label="简短备注"
      placeholder="请输入备注"
      :rows="2"
    />

    <!-- ✅ 中等长度文本:自动高度 + 最大行数 -->
    <wd-textarea
      v-model="mediumText"
      label="详细描述"
      placeholder="请详细描述"
      :auto-height="true"
      :maxRows="5"
    />

    <!-- ✅ 长文本输入:固定较大行数 -->
    <wd-textarea
      v-model="longText"
      label="文章内容"
      placeholder="请输入文章"
      :rows="8"
    />

    <!-- ❌ 避免:不设置任何高度限制 -->
    <wd-textarea
      v-model="badExample"
      placeholder="无限增高,体验差"
      :auto-height="true"
    />
  </view>
</template>
```

**建议:**
- 短文本(1-3 行):使用 `rows` 设置固定行数
- 中等文本(3-10 行):使用 `auto-height + maxRows` 限制最大高度
- 长文本(10+ 行):使用较大的固定 `rows` 值
- 避免无限制的自动高度,影响页面布局

### 2. 字数统计的正确使用

字数统计需要同时设置 `maxlength` 和 `show-word-limit`:

```vue
<template>
  <view class="demo">
    <!-- ✅ 正确:同时设置 maxlength 和 show-word-limit -->
    <wd-textarea
      v-model="value1"
      :maxlength="200"
      :show-word-limit="true"
    />

    <!-- ✅ 限制长度但不显示统计 -->
    <wd-textarea
      v-model="value2"
      :maxlength="200"
      :show-word-limit="false"
    />

    <!-- ❌ 错误:只设置 show-word-limit,不设置 maxlength -->
    <wd-textarea
      v-model="value3"
      :show-word-limit="true"
    />
  </view>
</template>
```

**建议:**
- 显示字数统计时必须设置 `maxlength`
- `maxlength` 默认为 -1(不限制),此时 `show-word-limit` 无效
- 组件使用 `Array.from` 处理多码元字符,emoji 计数准确

### 3. 清空按钮的合理配置

根据交互需求选择合适的清空时机:

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐:聚焦时显示,减少视觉干扰 -->
    <wd-textarea
      v-model="value1"
      :clearable="true"
      clear-trigger="focus"
      :focus-when-clear="true"
    />

    <!-- ✅ 适用于:需要快速清空的场景 -->
    <wd-textarea
      v-model="value2"
      :clearable="true"
      clear-trigger="always"
    />

    <!-- ✅ 清空后不聚焦 -->
    <wd-textarea
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

### 4. 表单集成最佳实践

在表单中使用文本域的推荐方式:

```vue
<template>
  <wd-form :model="formData" :rules="rules">
    <!-- ✅ 正确:设置 prop、label、required -->
    <wd-textarea
      v-model="formData.description"
      label="商品描述"
      prop="description"
      :maxlength="500"
      :show-word-limit="true"
      :auto-height="true"
      :maxRows="6"
      required
    />

    <!-- ✅ 可选字段:不设置 required -->
    <wd-textarea
      v-model="formData.remark"
      label="备注"
      prop="remark"
      placeholder="选填"
    />
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import type { FormItemRule } from '@/wd'

const formData = reactive({
  description: '',
  remark: ''
})

const rules: Record<string, FormItemRule[]> = {
  description: [
    { required: true, message: '请输入商品描述' },
    {
      validator: (value: string) => value.length >= 20,
      message: '描述至少 20 个字符'
    }
  ]
}
</script>
```

**建议:**
- 必填字段设置 `required` 显示红色星号
- 使用 `prop` 关联表单字段,支持验证
- 设置合理的 `maxlength`,防止输入过长
- 为长文本字段启用字数统计

### 5. 性能优化建议

优化文本域组件的性能:

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐:使用 v-model,避免频繁更新 -->
    <wd-textarea
      v-model="value"
      @blur="handleSubmit"
    />

    <!-- ✅ 长列表中:按需渲染 -->
    <view v-for="item in list" :key="item.id">
      <wd-textarea
        v-if="editingId === item.id"
        v-model="item.content"
      />
      <text v-else>{{ item.content }}</text>
    </view>

    <!-- ❌ 避免:在 input 事件中执行耗时操作 -->
    <wd-textarea
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
- 长列表中按需渲染文本域组件
- 合理使用防抖处理频繁输入

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:583-587

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
    <wd-textarea
      v-model="value1"
      :show-word-limit="true"
    />

    <!-- ✅ 正确:同时设置两个属性 -->
    <wd-textarea
      v-model="value2"
      :maxlength="200"
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

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:412-415

### 2. 如何实现自动高度但限制最大高度?

**问题原因:**
- 需要同时使用 `auto-height` 和 `maxRows`
- 不能同时设置 `rows` 属性
- `maxRows` 只在 `auto-height` 为 `true` 且没有 `rows` 时生效

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ✅ 正确:自动高度 + 最大行数 -->
    <wd-textarea
      v-model="value1"
      placeholder="内容自动增高,最多 5 行"
      :auto-height="true"
      :maxRows="5"
    />

    <!-- ❌ 错误:同时设置了 rows -->
    <wd-textarea
      v-model="value2"
      :auto-height="true"
      :rows="3"
      :maxRows="5"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>
```

**注意:**
- `maxRows` 必须配合 `auto-height` 使用
- 同时设置 `rows` 会导致 `maxRows` 失效
- 每行高度约为 48rpx

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:513-524

### 3. 小程序端占位符对齐问题

**问题原因:**
- 微信小程序端原生 textarea 占位符对齐存在问题
- 需要手动设置 `line-height` 修复

**解决方案:**

组件已自动处理微信小程序端的对齐问题:

```typescript
// 组件内部实现
const computedPlaceholderStyle = computed(() => {
  let style = props.placeholderStyle || ''

  // #ifdef MP-WEIXIN
  // 修复小程序端 placeholder 对齐问题
  if (!style.includes('line-height')) {
    style += ';line-height:1.5;'
  }
  // #endif

  return style
})
```

如果仍有对齐问题,可手动设置:

```vue
<template>
  <wd-textarea
    v-model="value"
    placeholder="自定义占位符样式"
    placeholder-style="line-height: 1.5; vertical-align: middle;"
  />
</template>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:353-364

### 4. 清空按钮点击后文本域没有聚焦

**问题原因:**
- `focus-when-clear` 设置为 `false`
- 或者在某些平台上聚焦延迟导致

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ✅ 确保 focus-when-clear 为 true -->
    <wd-textarea
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

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:537-551

### 5. 表单验证错误信息不显示

**问题原因:**
- 没有设置 `prop` 属性
- 没有在父组件 `wd-form` 中定义验证规则
- 表单字段名与 `prop` 不匹配

**解决方案:**

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="rules">
    <!-- ✅ 正确:设置 prop 并定义规则 -->
    <wd-textarea
      v-model="formData.content"
      label="内容"
      prop="content"
      required
    />
  </wd-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance, FormItemRule } from '@/wd'

const formRef = ref<FormInstance>()

const formData = reactive({
  content: ''  // ✅ 字段名与 prop 一致
})

// ✅ 定义验证规则
const rules: Record<string, FormItemRule[]> = {
  content: [  // ✅ 规则名与 prop 一致
    { required: true, message: '请输入内容' }
  ]
}
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:420-426

## 注意事项

1. **高度模式互斥**: `rows`、`auto-height`、`maxRows` 三个属性有优先级关系,`rows` 优先级最高,设置后会忽略 `maxRows`

2. **字数统计依赖**: `show-word-limit` 必须配合 `maxlength` 使用,且 `maxlength` 不能为 -1

3. **清空按钮显示条件**: 清空按钮只在非禁用、非只读、有内容时显示,受 `clear-trigger` 控制

4. **表单集成要求**: 使用表单验证时必须设置 `prop` 属性,且值要与表单数据字段名一致

5. **标签宽度继承**: 组件 `label-width` 可以继承父组件 `wd-form` 的 `label-width`,优先使用组件自身设置

6. **只读遮罩实现**: `readonly` 状态通过添加透明遮罩层实现,保持视觉一致性

7. **焦点控制**: `focus` 和 `auto-focus` 都可以控制聚焦,`focus` 支持动态控制

8. **光标位置**: `cursor`、`selection-start`、`selection-end` 只在聚焦时有效

9. **多码元字符**: 字数统计使用 `Array.from` 处理,emoji 等多码元字符计数准确

10. **平台差异**: 小程序端占位符对齐已自动修复,其他平台可能需要手动调整

11. **性能优化**: 避免在 `input` 事件中执行耗时操作,建议在 `blur` 或 `confirm` 事件中处理

12. **键盘控制**: `confirm-type` 设置键盘确认按钮样式,`adjust-position` 控制键盘弹起行为

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-textarea/wd-textarea.vue:1-925
