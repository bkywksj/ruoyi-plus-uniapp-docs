# Loading 加载指示器

WD UI 加载指示器组件。

```vue
<template>
  <wd-loading :loading="loading" />
  <wd-button @click="showLoading">显示加载</wd-button>
</template>

<script setup>
import { ref } from 'vue'
const loading = ref(false)

const showLoading = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>
```

## API

### Props
| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| loading | 是否显示加载 | boolean | false |
| text | 加载文本 | string | — |
| type | 加载类型 | string | circular |