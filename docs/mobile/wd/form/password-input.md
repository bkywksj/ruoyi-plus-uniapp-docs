# PasswordInput 密码输入

WD UI 密码输入组件，专门用于密码输入。

## 基本使用

```vue
<template>
  <wd-password-input v-model="password" placeholder="请输入密码" />
</template>

<script setup>
import { ref } from 'vue'
const password = ref('')
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 密码值 | string | — |
| placeholder | 占位文本 | string | — |
| disabled | 是否禁用 | boolean | false |
| show-toggle | 是否显示切换按钮 | boolean | true |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| change | 值改变时触发 | value |