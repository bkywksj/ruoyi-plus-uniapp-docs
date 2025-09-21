# Search 搜索

WD UI 搜索组件。

```vue
<template>
  <wd-search v-model="value" placeholder="请输入搜索关键词" @search="handleSearch" />
</template>

<script setup>
import { ref } from 'vue'
const value = ref('')
const handleSearch = (val) => console.log('搜索:', val)
</script>
```

## API

### Props
| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 搜索值 | string | — |
| placeholder | 占位文本 | string | — |
| disabled | 是否禁用 | boolean | false |

### Events
| 事件名 | 说明 | 参数 |
|--------|------|------|
| search | 搜索时触发 | value |