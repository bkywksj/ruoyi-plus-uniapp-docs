# Textarea 文本域

WD UI 文本域组件，用于多行文本输入。

## 基本使用

```vue
<template>
  <wd-textarea 
    v-model="value" 
    placeholder="请输入内容" 
    :rows="4"
  />
</template>

<script setup>
import { ref } from 'vue'
const value = ref('')
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 输入值 | string | — |
| placeholder | 占位文本 | string | — |
| rows | 显示行数 | number | 2 |
| maxlength | 最大输入长度 | number | — |
| disabled | 是否禁用 | boolean | false |
| readonly | 是否只读 | boolean | false |
| auto-height | 是否自动高度 | boolean | false |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| input | 输入时触发 | value |
| change | 值改变时触发 | value |
| focus | 获得焦点旷触发 | event |
| blur | 失去焦点时触发 | event |