# Navbar 导航栏

WD UI 导航栏组件。

```vue
<template>
  <wd-navbar title="页面标题" @click-left="goBack">
    <template #left>
      <wd-icon name="arrow-left" />
    </template>
    <template #right>
      <wd-icon name="more" />
    </template>
  </wd-navbar>
</template>

<script setup>
const goBack = () => {
  uni.navigateBack()
}
</script>
```

## API

### Props
| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标题 | string | — |
| left-text | 左侧文本 | string | — |
| right-text | 右侧文本 | string | — |
| fixed | 是否固定在顶部 | boolean | false |

### Events
| 事件名 | 说明 | 参数 |
|--------|------|------|
| click-left | 点击左侧区域 | — |
| click-right | 点击右侧区域 | — |

### Slots
| 名称 | 说明 |
|------|------|
| left | 左侧内容 |
| right | 右侧内容 |