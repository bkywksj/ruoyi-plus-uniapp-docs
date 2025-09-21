# Checkbox 复选框

WD UI 复选框组件。

```vue
<template>
  <wd-checkbox v-model="checked">复选框</wd-checkbox>
  <wd-checkbox-group v-model="checkedList">
    <wd-checkbox value="1">选项1</wd-checkbox>
    <wd-checkbox value="2">选项2</wd-checkbox>
  </wd-checkbox-group>
</template>

<script setup>
import { ref } from 'vue'
const checked = ref(false)
const checkedList = ref([])
</script>
```

## API

### Checkbox Props
| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 是否选中 | boolean | false |
| value | 复选框值 | any | — |
| disabled | 是否禁用 | boolean | false |

### Events
| 事件名 | 说明 | 参数 |
|--------|------|------|
| change | 状态改变时触发 | value |