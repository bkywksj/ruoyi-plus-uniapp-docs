# InputNumber 计数器

WD UI 计数器组件，用于数字输入。

## 基本使用

```vue
<template>
  <wd-input-number v-model="value" />
</template>

<script setup>
import { ref } from 'vue'
const value = ref(1)
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前值 | number | 0 |
| min | 最小值 | number | -Infinity |
| max | 最大值 | number | Infinity |
| step | 步长 | number | 1 |
| disabled | 是否禁用 | boolean | false |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| change | 值改变时触发 | value |