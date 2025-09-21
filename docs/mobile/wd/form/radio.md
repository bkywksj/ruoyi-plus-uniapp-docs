# Radio 单选框

WD UI 单选框组件。

```vue
<template>
  <wd-radio-group v-model="selected">
    <wd-radio value="1">选项1</wd-radio>
    <wd-radio value="2">选项2</wd-radio>
    <wd-radio value="3">选项3</wd-radio>
  </wd-radio-group>
</template>

<script setup>
import { ref } from 'vue'
const selected = ref('1')
</script>
```

## API

### Radio Props
| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 单选框值 | any | — |
| disabled | 是否禁用 | boolean | false |

### RadioGroup Props
| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 选中值 | any | — |
| disabled | 是否禁用 | boolean | false |

### Events
| 事件名 | 说明 | 参数 |
|--------|------|------|
| change | 选中值改变时触发 | value |