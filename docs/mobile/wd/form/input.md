# Input 输入框

WD UI 输入框组件，支持多种输入类型和样式。

## 基本使用

```vue
<template>
  <view class="demo-block">
    <wd-input v-model="value" placeholder="请输入内容" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
const value = ref('')
</script>
```

### 输入类型

```vue
<template>
  <view class="demo-block">
    <!-- 文本输入 -->
    <wd-input v-model="text" type="text" placeholder="文本输入" />
    
    <!-- 数字输入 -->
    <wd-input v-model="number" type="number" placeholder="数字输入" />
    
    <!-- 密码输入 -->
    <wd-input v-model="password" type="password" placeholder="密码输入" />
    
    <!-- 手机号输入 -->
    <wd-input v-model="phone" type="tel" placeholder="手机号输入" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
const text = ref('')
const number = ref('')
const password = ref('')
const phone = ref('')
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 输入值 | string/number | — |
| type | 输入类型 | string | text |
| placeholder | 占位文本 | string | — |
| disabled | 是否禁用 | boolean | false |
| readonly | 是否只读 | boolean | false |
| clearable | 是否显示清空按钮 | boolean | false |
| show-password | 是否显示密码切换按钮 | boolean | false |
| maxlength | 最大输入长度 | number | — |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| input | 输入时触发 | value |
| change | 值改变时触发 | value |
| focus | 获得焦点时触发 | event |
| blur | 失去焦点时触发 | event |
| clear | 点击清空按钮时触发 | — |