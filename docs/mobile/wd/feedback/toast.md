# Toast 轻提示

WD UI 轻提示组件。

```vue
<template>
  <wd-button @click="showToast">显示提示</wd-button>
</template>

<script setup>
const showToast = () => {
  uni.$toast('这是一个提示')
}
</script>
```

## API

### Methods
| 方法名 | 说明 | 参数 |
|--------|------|------|
| $toast | 显示提示 | message, options |
| $toast.success | 成功提示 | message, options |
| $toast.error | 错误提示 | message, options |
| $toast.loading | 加载提示 | message, options |